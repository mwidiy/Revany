'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceSession, AttendanceRecord, Student, Tutor } from '@/types';
import {
  History,
  Calendar,
  Clock,
  BookOpen,
  User,
  GraduationCap,
  Search,
  Filter,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2,
  Trash2,
  X,
  Sparkles,
  MapPin,
  Video,
  ArrowRight,
  ClipboardCheck,
  Check
} from 'lucide-react';

export default function RekapPertemuanPage() {
  const { students, tutors, showToast, refreshStudents } = useApp();

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [timePreset, setTimePreset] = useState<'all' | 'kemarin' | 'hari_ini' | 'minggu_ini'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('all');
  const [selectedTentorId, setSelectedTentorId] = useState('all');
  const [selectedMapel, setSelectedMapel] = useState('all');

  // Modal State Tambah Rekap
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    student_id: '',
    tentor_id: '',
    tanggal: getYesterdayDate(),
    jam_mulai: '15:30',
    jam_selesai: '17:00',
    mapel: 'Bahasa Inggris',
    judul_sesi: '', // Materi apa yang diajarkan
    catatan: '', // Kilas balik perkembangan & evaluasi
    tugas_pr: '',
    metode: 'Offline' as 'Offline' | 'Online' | 'Hybrid',
    status_kehadiran: 'hadir' as 'hadir' | 'izin' | 'sakit' | 'alpha',
    potong_sesi: true
  });

  // Pre-fill tentor and student when modal opens
  useEffect(() => {
    if (tutors.length > 0 && !formData.tentor_id) {
      setFormData(prev => ({ ...prev, tentor_id: tutors[0].id }));
    }
    if (students.length > 0 && !formData.student_id) {
      setFormData(prev => ({ ...prev, student_id: students[0].id }));
    }
  }, [tutors, students, formData.tentor_id, formData.student_id]);

  // Load meeting recaps from Supabase
  const loadRecaps = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getMeetingRecaps();
      setSessions(data);
    } catch (err: any) {
      showToast('Gagal memuat rekap pertemuan: ' + (err?.message || 'Error'), 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRecaps();
  }, [loadRecaps]);

  // Helper date parsing & labels
  const getDateLabel = (dateStr?: string | null) => {
    if (!dateStr) return { text: 'Hari Ini', isYesterday: false, isToday: true };
    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    if (dateStr === today) {
      return { text: 'Hari Ini', isYesterday: false, isToday: true, badgeBg: 'rgba(16, 185, 129, 0.12)', badgeColor: '#10B981' };
    }
    if (dateStr === yesterday) {
      return { text: 'Kemarin', isYesterday: true, isToday: false, badgeBg: 'rgba(99, 102, 241, 0.12)', badgeColor: '#6366F1' };
    }

    try {
      const d = new Date(dateStr);
      const formatted = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
      return { text: formatted, isYesterday: false, isToday: false, badgeBg: 'var(--bg-surface-secondary)', badgeColor: 'var(--text-muted)' };
    } catch {
      return { text: dateStr, isYesterday: false, isToday: false, badgeBg: 'var(--bg-surface-secondary)', badgeColor: 'var(--text-muted)' };
    }
  };

  // Helper parsing formatted catatan
  const parseNotes = (rawNotes?: string | null) => {
    if (!rawNotes) return { catatanUtama: 'Belum ada catatan detail.', pr: null, metode: 'Offline', jam: '15:30 - 17:00' };

    let text = rawNotes;
    let metode = 'Offline';
    let jam = '15:30 - 17:00';
    let pr: string | null = null;

    const metodeMatch = text.match(/\[METODE:\s*([^\]]+)\]/i);
    if (metodeMatch) {
      metode = metodeMatch[1].trim();
      text = text.replace(metodeMatch[0], '');
    }

    const jamMatch = text.match(/\[JAM:\s*([^\]]+)\]/i);
    if (jamMatch) {
      jam = jamMatch[1].trim();
      text = text.replace(jamMatch[0], '');
    }

    const prMatch = text.match(/\[PR\s*\/?\s*TUGAS\]:\s*([^\n\r]+)/i);
    if (prMatch) {
      pr = prMatch[1].trim();
      text = text.replace(prMatch[0], '');
    }

    return {
      catatanUtama: text.trim() || 'Pertemuan telah selesai terlaksana.',
      pr,
      metode,
      jam
    };
  };

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    // 7 days ago timestamp
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

    return sessions.filter(session => {
      // Preset Waktu
      if (timePreset === 'kemarin' && session.tanggal !== yesterday) return false;
      if (timePreset === 'hari_ini' && session.tanggal !== today) return false;
      if (timePreset === 'minggu_ini' && session.tanggal && session.tanggal < sevenDaysStr) return false;

      // Filter Siswa
      if (selectedStudentId !== 'all') {
        const hasStudent = session.records?.some(r => r.student_id === selectedStudentId);
        if (!hasStudent) return false;
      }

      // Filter Tentor
      if (selectedTentorId !== 'all' && session.tentor_id !== selectedTentorId) {
        return false;
      }

      // Filter Mapel
      if (selectedMapel !== 'all' && session.mapel !== selectedMapel) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentNames = session.records?.map(r => r.student?.nama?.toLowerCase() || '').join(' ') || '';
        const tentorName = session.tentor?.nama?.toLowerCase() || '';
        const topic = session.judul_sesi?.toLowerCase() || '';
        const notes = session.catatan?.toLowerCase() || '';
        const mapel = session.mapel.toLowerCase();

        const match =
          studentNames.includes(q) ||
          tentorName.includes(q) ||
          topic.includes(q) ||
          notes.includes(q) ||
          mapel.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [sessions, timePreset, selectedStudentId, selectedTentorId, selectedMapel, searchQuery]);

  // Handle Form Submit
  const handleCreateRecap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id) {
      showToast('Pilih siswa yang belajar terlebih dahulu', 'warning');
      return;
    }
    if (!formData.judul_sesi.trim()) {
      showToast('Tuliskan materi/topik yang diajarkan pada pertemuan ini', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await attendanceService.createMeetingRecap({
        student_id: formData.student_id,
        tentor_id: formData.tentor_id || undefined,
        mapel: formData.mapel.trim(),
        judul_sesi: formData.judul_sesi.trim(),
        tanggal: formData.tanggal,
        jam_mulai: formData.jam_mulai,
        jam_selesai: formData.jam_selesai,
        catatan: formData.catatan.trim() || 'Pertemuan berjalan lancar dan interaktif.',
        tugas_pr: formData.tugas_pr.trim() || undefined,
        status_kehadiran: formData.status_kehadiran,
        potong_sesi: formData.potong_sesi,
        metode: formData.metode
      });

      showToast('Rekap pertemuan berhasil dicatat! Kilas balik tersimpan.', 'success');
      setIsModalOpen(false);
      setFormData({
        student_id: students[0]?.id || '',
        tentor_id: tutors[0]?.id || '',
        tanggal: getYesterdayDate(),
        jam_mulai: '15:30',
        jam_selesai: '17:00',
        mapel: 'Bahasa Inggris',
        judul_sesi: '',
        catatan: '',
        tugas_pr: '',
        metode: 'Offline',
        status_kehadiran: 'hadir',
        potong_sesi: true
      });

      await loadRecaps();
      await refreshStudents();
    } catch (err: any) {
      showToast('Gagal mencatat pertemuan: ' + (err?.message || 'Error'), 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Recap
  const handleDeleteRecap = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await attendanceService.deleteSession(deleteTarget.id);
      setSessions(prev => prev.filter(s => s.id !== deleteTarget.id));
      showToast('Rekap pertemuan berhasil dihapus', 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('Gagal menghapus rekap: ' + (err?.message || 'Error'), 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy WhatsApp Summary
  const handleCopyWhatsApp = (session: AttendanceSession) => {
    const parsed = parseNotes(session.catatan);
    const studentName = session.records?.[0]?.student?.nama || 'Siswa';
    const tentorName = session.tentor?.nama || 'Tentor Revani';
    const dateLabel = getDateLabel(session.tanggal).text;

    const message = `*LAPORAN PERTEMUAN LES - SAHABAT NGAJAR EDU* 🎓
📅 *Tanggal:* ${dateLabel} (${parsed.jam} WIB)
👤 *Siswa:* ${studentName}
👨‍🏫 *Tentor:* ${tentorName}
📖 *Mata Pelajaran:* ${session.mapel}

📌 *Materi yang Diajarkan:*
${session.judul_sesi || 'Review materi dan latihan soal'}

📝 *Kilas Balik & Perkembangan Belajar:*
${parsed.catatanUtama}
${parsed.pr ? `\n📌 *PR / Latihan Mandiri:*\n${parsed.pr}` : ''}

Terima kasih atas semangat belajarnya! ✨`;

    navigator.clipboard.writeText(message);
    setCopiedId(session.id);
    showToast('Laporan kilas balik disalin! Siap dikirim ke WhatsApp orang tua 📲', 'success');
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Unique list of subjects
  const allMapels = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => set.add(s.mapel));
    return Array.from(set);
  }, [sessions]);

  return (
    <div className="page-container" style={{ padding: '28px 32px' }}>
      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <History size={20} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Rekap & Jurnal Pertemuan Les
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)' }}>
            Kilas balik pembelajaran: review materi apa yang diajarkan kemarin, evaluasi perkembangan, dan catatan tindak lanjut siswa.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={loadRecaps}
            disabled={isLoading}
            className="secondary-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600
            }}
            title="Segarkan riwayat pertemuan"
          >
            <RefreshCw size={15} className={isLoading ? 'spin-anim' : ''} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} />
            <span>+ Catat Rekap Pertemuan</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Stat Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              color: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ClipboardCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Total Pertemuan Selesai</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {sessions.length} Sesi
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Pertemuan Kemarin</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {sessions.filter(s => s.tanggal === getYesterdayDate()).length} Pertemuan
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <User size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Siswa Aktif Belajar</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {students.length} Siswa
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.1)',
              color: '#EC4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Variasi Mapel</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {allMapels.length || 1} Mapel
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filters & Kilas Balik Toolbar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        {/* Preset Waktu Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>
            Kilas Balik Waktu:
          </span>

          <button
            onClick={() => setTimePreset('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: timePreset === 'all' ? '1px solid #6366F1' : '1px solid var(--border-subtle)',
              background: timePreset === 'all' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              color: timePreset === 'all' ? '#6366F1' : 'var(--text-muted)',
              fontSize: 12.5,
              fontWeight: timePreset === 'all' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Semua Pertemuan ({sessions.length})
          </button>

          <button
            onClick={() => setTimePreset('kemarin')}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: timePreset === 'kemarin' ? '1.5px solid #6366F1' : '1px solid var(--border-subtle)',
              background: timePreset === 'kemarin' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-secondary)',
              color: timePreset === 'kemarin' ? '#6366F1' : 'var(--text-main)',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={13} style={{ color: '#6366F1' }} />
            <span>Kemarin (Kilas Balik)</span>
          </button>

          <button
            onClick={() => setTimePreset('hari_ini')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: timePreset === 'hari_ini' ? '1px solid #10B981' : '1px solid var(--border-subtle)',
              background: timePreset === 'hari_ini' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              color: timePreset === 'hari_ini' ? '#10B981' : 'var(--text-muted)',
              fontSize: 12.5,
              fontWeight: timePreset === 'hari_ini' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Hari Ini
          </button>

          <button
            onClick={() => setTimePreset('minggu_ini')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: timePreset === 'minggu_ini' ? '1px solid #6366F1' : '1px solid var(--border-subtle)',
              background: timePreset === 'minggu_ini' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              color: timePreset === 'minggu_ini' ? '#6366F1' : 'var(--text-muted)',
              fontSize: 12.5,
              fontWeight: timePreset === 'minggu_ini' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            7 Hari Terakhir
          </button>
        </div>

        {/* Search & Dropdown Row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Cari materi yang diajarkan, siswa, atau catatan evaluasi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 40px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-secondary)',
                color: 'var(--text-main)',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>

          {/* Filter Siswa */}
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              color: 'var(--text-main)',
              fontSize: 12.5,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Semua Siswa</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.nama} ({s.kelas})
              </option>
            ))}
          </select>

          {/* Filter Tentor */}
          <select
            value={selectedTentorId}
            onChange={e => setSelectedTentorId(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              color: 'var(--text-main)',
              fontSize: 12.5,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Semua Tentor</option>
            {tutors.map(t => (
              <option key={t.id} value={t.id}>
                {t.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Meeting Recaps List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin-anim" style={{ margin: '0 auto 12px' }} />
          <div>Memuat riwayat rekap pertemuan...</div>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '20px',
            padding: '60px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <History size={44} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: 14 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
            Belum ada rekap pertemuan yang cocok
          </h3>
          <p style={{ fontSize: 13.5, maxWidth: 460, margin: '0 auto 18px', lineHeight: 1.5 }}>
            {timePreset === 'kemarin'
              ? 'Belum ada catatan rekap untuk pertemuan kemarin. Anda bisa klik tombol di bawah untuk mencatat sesi kemarin.'
              : 'Tidak ada data pertemuan les yang sesuai dengan filter atau kata kunci pencarian.'}
          </p>
          <button
            onClick={() => {
              setFormData(prev => ({ ...prev, tanggal: getYesterdayDate() }));
              setIsModalOpen(true);
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#fff',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Catat Pertemuan Kemarin Sekarang
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filteredSessions.map(session => {
            const dateInfo = getDateLabel(session.tanggal);
            const parsed = parseNotes(session.catatan);
            const primaryRecord = session.records?.[0];
            const student = primaryRecord?.student;
            const tentor = session.tentor;

            return (
              <div
                key={session.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'all 0.2s ease',
                  borderLeft: dateInfo.isYesterday
                    ? '4px solid #6366F1'
                    : dateInfo.isToday
                    ? '4px solid #10B981'
                    : '1px solid var(--border-subtle)'
                }}
              >
                {/* Session Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Date Badge */}
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        background: dateInfo.badgeBg,
                        color: dateInfo.badgeColor,
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <Calendar size={13} />
                      <span>{dateInfo.text}</span>
                    </span>

                    {/* Time & Duration */}
                    <span
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontWeight: 600
                      }}
                    >
                      <Clock size={13} />
                      <span>{parsed.jam} WIB</span>
                    </span>

                    {/* Method Tag */}
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-secondary)',
                        color: 'var(--text-muted)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {parsed.metode.toLowerCase().includes('online') ? <Video size={12} /> : <MapPin size={12} />}
                      <span>{parsed.metode}</span>
                    </span>

                    {/* Kehadiran Badge */}
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        fontSize: 11.5,
                        fontWeight: 700,
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Status: {primaryRecord?.status?.toUpperCase() || 'HADIR'}
                    </span>
                  </div>

                  {/* Top Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleCopyWhatsApp(session)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: copiedId === session.id ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-secondary)',
                        color: copiedId === session.id ? '#10B981' : 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Salin rekap pesan laporan ke WhatsApp orang tua"
                    >
                      {copiedId === session.id ? <Check size={13} /> : <Share2 size={13} />}
                      <span>{copiedId === session.id ? 'Tersalin!' : 'Kirim WA Ortu'}</span>
                    </button>

                    <button
                      onClick={() => setDeleteTarget(session)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Hapus rekap pertemuan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Participants Row: Siswa & Tentor */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 14,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {/* Siswa Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {student?.nama ? student.nama.charAt(0) : 'S'}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Siswa Belajar
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                        {student?.nama || 'Siswa'}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {student?.kelas} {student?.jenjang ? `• ${student.jenjang}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Tentor Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {tentor?.nama ? tentor.nama.charAt(0) : 'T'}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Tentor Pengampu
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                        {tentor?.nama || 'Tentor Revani'}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#6366F1', fontWeight: 600 }}>
                        {session.mapel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* HIGHLIGHT: APA YANG DIAJARKAN (Materi & Topik) */}
                <div
                  style={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.18)',
                    borderRadius: '14px',
                    padding: '16px 18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <BookOpen size={16} style={{ color: '#6366F1' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Topik Materi yang Diajarkan:
                    </span>
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.35 }}>
                    {session.judul_sesi || 'Review materi dan pembahasan soal'}
                  </div>
                </div>

                {/* KILAS BALIK: CATATAN PEMBELAJARAN & EVALUASI SISWA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                    <Sparkles size={14} style={{ color: '#F59E0B' }} />
                    <span>Kilas Balik & Catatan Perkembangan Belajar Siswa:</span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      color: 'var(--text-main)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                      background: 'var(--bg-surface-secondary)',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {parsed.catatanUtama}
                  </p>
                </div>

                {/* PR / TUGAS TINDAK LANJUT */}
                {parsed.pr && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  >
                    <CheckCircle2 size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong style={{ color: '#D97706', display: 'block', fontSize: 12, marginBottom: 2 }}>
                        PR / Tugas untuk Pertemuan Berikutnya:
                      </strong>
                      <span>{parsed.pr}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal Catat Rekap Pertemuan Baru */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '620px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <History size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Catat Rekap Pertemuan Les
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                    Simpan kilas balik apa yang diajarkan dan bagaimana perkembangan siswa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateRecap}>
              {/* Quick Date Selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  Tanggal Pertemuan <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tanggal: getYesterdayDate() })}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: formData.tanggal === getYesterdayDate() ? '1.5px solid #6366F1' : '1px solid var(--border-subtle)',
                      background: formData.tanggal === getYesterdayDate() ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-secondary)',
                      color: formData.tanggal === getYesterdayDate() ? '#6366F1' : 'var(--text-main)',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Kemarin ({getYesterdayDate()})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tanggal: getTodayDate() })}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: formData.tanggal === getTodayDate() ? '1.5px solid #10B981' : '1px solid var(--border-subtle)',
                      background: formData.tanggal === getTodayDate() ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-secondary)',
                      color: formData.tanggal === getTodayDate() ? '#10B981' : 'var(--text-main)',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Hari Ini ({getTodayDate()})
                  </button>

                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Row Siswa & Tentor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Siswa yang Belajar <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.student_id}
                    onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>Pilih Siswa</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kelas} • Sisa: {s.sisa_sesi ?? 0} sesi)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Tentor Pengajar
                  </label>
                  <select
                    value={formData.tentor_id}
                    onChange={e => setFormData({ ...formData, tentor_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Tentor Revani Edu</option>
                    {tutors.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nama} ({t.mapel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row Mapel & Metode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Mata Pelajaran <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Bahasa Inggris, Matematika, dll."
                    value={formData.mapel}
                    onChange={e => setFormData({ ...formData, mapel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Metode Les
                  </label>
                  <select
                    value={formData.metode}
                    onChange={e => setFormData({ ...formData, metode: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Offline">Offline (Tatap Muka)</option>
                    <option value="Online">Online (Zoom / Meet)</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Row Jam Mulai & Jam Selesai */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={formData.jam_mulai}
                    onChange={e => setFormData({ ...formData, jam_mulai: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={formData.jam_selesai}
                    onChange={e => setFormData({ ...formData, jam_selesai: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* TOPIK: APA YANG DIAJARKAN (Wajib) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  Materi / Topik yang Diajarkan <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Reading Comprehension Unit 3 & Adjectives Vocabulary"
                  value={formData.judul_sesi}
                  onChange={e => setFormData({ ...formData, judul_sesi: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-secondary)',
                    color: 'var(--text-main)',
                    fontSize: 13.5,
                    outline: 'none'
                  }}
                />
              </div>

              {/* KILAS BALIK: Catatan Pembelajaran & Evaluasi */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  Kilas Balik & Catatan Perkembangan Belajar Siswa <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ceritakan bagaimana proses belajar kemarin: apa yang dipelajari, konsep yang sudah dikuasai, atau kendala yang dihadapi siswa..."
                  value={formData.catatan}
                  onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-secondary)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* PR / Tugas Tindak Lanjut */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  PR / Tugas Mandiri (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Mengerjakan Workbook halaman 24 nomor 1-5"
                  value={formData.tugas_pr}
                  onChange={e => setFormData({ ...formData, tugas_pr: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-secondary)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Checkbox Potong Sesi */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: 22,
                  cursor: 'pointer'
                }}
                onClick={() => setFormData({ ...formData, potong_sesi: !formData.potong_sesi })}
              >
                <input
                  type="checkbox"
                  checked={formData.potong_sesi}
                  onChange={e => setFormData({ ...formData, potong_sesi: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: '#6366F1', cursor: 'pointer' }}
                />
                <div style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>
                  Potong kuota siswa otomatis sebanyak 1 sesi pertemuan
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Rekap Pertemuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Hapus Rekap Pertemuan Ini?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
              Sesi <strong>"{deleteTarget.judul_sesi || deleteTarget.mapel}"</strong> pada tanggal {getDateLabel(deleteTarget.tanggal).text} akan dihapus dari riwayat.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteRecap}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
