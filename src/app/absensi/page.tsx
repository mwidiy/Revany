'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceSession, AttendanceRecord } from '@/types';
import {
  KeyRound,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Share2,
  Lock,
  Unlock,
  Users,
  Clock,
  BookOpen,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Trash2,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function AbsensiTentorPage() {
  const { tutors, showToast } = useApp();
  const { currentUser } = useAuth();

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal State Buka Sesi Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tentor_id: '',
    mapel: 'Matematika & Fisika',
    judul_sesi: '',
    catatan: '',
    customCode: ''
  });

  // Load Sessions
  const loadSessions = useCallback(async (autoSelectLatest = false) => {
    try {
      const data = await attendanceService.getAllSessions(20);
      setSessions(data);

      if (data.length > 0) {
        if (autoSelectLatest || !selectedSessionId) {
          // Pilih sesi yang aktif terlebih dahulu, atau sesi teratas
          const activeSess = data.find(s => s.status === 'aktif');
          setSelectedSessionId(activeSess ? activeSess.id : data[0].id);
        }
      } else {
        setSelectedSessionId(null);
      }
    } catch (err) {
      console.error('Failed loading sessions:', err);
      showToast('Gagal memuat sesi absensi', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSessionId, showToast]);

  useEffect(() => {
    loadSessions(true);
    // Polling auto-refresh setiap 5 detik agar tentor melihat siswa masuk realtime
    const interval = setInterval(() => {
      loadSessions(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0] || null;

  // Copy Kode to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast(`Kode "${code}" berhasil disalin!`, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Share to WhatsApp
  const handleShareWhatsApp = (session: AttendanceSession) => {
    const message = `Halo teman-teman siswa Sahabat Ngajar!\n\nSesi kelas *${session.mapel}* (${session.judul_sesi || 'Hari Ini'}) sudah dibuka.\n\n🔑 *Kode Absensi:* \`${session.kode_unik}\`\n\nSilakan segera buka Portal Siswa dan masukkan kode di atas untuk presensi kehadiran ya!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Tutup Sesi
  const handleCloseSession = async (sessionId: string) => {
    if (!confirm('Yakin ingin menutup sesi absensi ini? Siswa tidak akan bisa memasukkan kode lagi.')) return;
    try {
      await attendanceService.closeSession(sessionId);
      showToast('Sesi absensi berhasil ditutup', 'warning');
      await loadSessions(false);
    } catch (err: any) {
      showToast(err.message || 'Gagal menutup sesi', 'danger');
    }
  };

  // Buka Kembali Sesi
  const handleReopenSession = async (sessionId: string) => {
    try {
      await attendanceService.reopenSession(sessionId);
      showToast('Sesi absensi dibuka kembali', 'success');
      await loadSessions(false);
    } catch (err: any) {
      showToast(err.message || 'Gagal membuka sesi', 'danger');
    }
  };

  // Hapus Sesi
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Hapus sesi absensi ini beserta rekapan kehadirannya?')) return;
    try {
      await attendanceService.deleteSession(sessionId);
      showToast('Sesi absensi berhasil dihapus', 'info');
      await loadSessions(true);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus sesi', 'danger');
    }
  };

  // Submit Buat Sesi Baru
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newSession = await attendanceService.createSession({
        tentor_id: formData.tentor_id || (currentUser?.tentorId || undefined),
        mapel: formData.mapel,
        judul_sesi: formData.judul_sesi || `Kelas ${formData.mapel}`,
        catatan: formData.catatan,
        customCode: formData.customCode || undefined
      });

      showToast(`Sesi baru berhasil dibuat! Kode: ${newSession.kode_unik}`, 'success');
      setIsModalOpen(false);
      setFormData({
        tentor_id: '',
        mapel: 'Matematika & Fisika',
        judul_sesi: '',
        catatan: '',
        customCode: ''
      });
      await loadSessions(true);
      setSelectedSessionId(newSession.id);
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat sesi baru', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const records: AttendanceRecord[] = (activeSession?.records as AttendanceRecord[]) || [];

  return (
    <main className="content-area">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div className="kpi-icon-wrap kpi-icon-emerald" style={{ width: 40, height: 40 }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)' }}>
                Mode Absensi Hari Ini
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Generator Kode Unik untuk siswa & monitor kehadiran kelas secara live.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => loadSessions(false)}
            title="Refresh Kehadiran"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={15} className={isLoading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>


          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Buka Sesi Absensi Baru</span>
          </button>
        </div>
      </div>

      {/* Sesi Showcase / Hero Section */}
      {activeSession ? (
        <section className="attendance-hero-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {activeSession.status === 'aktif' ? (
                  <span className="pulse-badge-live">
                    <span className="pulse-dot-green"></span>
                    Sesi Aktif & Menerima Absen
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#EF4444',
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    <Lock size={13} /> Sesi Ditutup
                  </span>
                )}
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Tanggal: <strong>{activeSession.tanggal || 'Hari Ini'}</strong>
                </span>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
                {activeSession.judul_sesi || activeSession.mapel}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Mapel: <strong style={{ color: 'var(--text-main)' }}>{activeSession.mapel}</strong></span>
                {activeSession.tentor && (
                  <span>Tentor: <strong style={{ color: 'var(--text-main)' }}>{activeSession.tentor.nama}</strong></span>
                )}
              </div>
            </div>

            {/* Quick Actions for this Session */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => handleShareWhatsApp(activeSession)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Share2 size={14} style={{ color: '#25D366' }} />
                <span>Bagikan ke WA</span>
              </button>

              {activeSession.status === 'aktif' ? (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleCloseSession(activeSession.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Lock size={14} />
                  <span>Kunci / Tutup Sesi</span>
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleReopenSession(activeSession.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10B981' }}
                >
                  <Unlock size={14} />
                  <span>Buka Kembali</span>
                </button>
              )}

              <button
                className="btn btn-sm btn-secondary"
                onClick={() => handleDeleteSession(activeSession.id)}
                title="Hapus Sesi"
                style={{ padding: '6px 10px', color: 'var(--danger)' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* KODE UNIK DISPLAY (PROMINENT / PROJECTOR FRIENDLY) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '28px 16px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 6px 20px -2px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>
              Kode Unik Absensi Kelas Ini
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="code-display-huge" title="Klik untuk salin">
                <span>{activeSession.kode_unik}</span>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleCopyCode(activeSession.kode_unik)}
                style={{
                  height: 58,
                  padding: '0 20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 12 }}>
              💡 Tampilkan kode ini di layar / berikan ke siswa. Siswa cukup buka <strong>Portal Siswa</strong> dan ketik kode di atas.
            </p>
          </div>
        </section>
      ) : (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--border-subtle)',
            marginBottom: 24
          }}
        >
          <KeyRound size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 14px', opacity: 0.6 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Belum Ada Sesi Absensi</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 18px' }}>
            Buka sesi absensi baru untuk kelas hari ini agar sistem men-generate kode unik bagi siswa les.
          </p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Buka Sesi Absensi Sekarang
          </button>
        </div>
      )}

      {/* Main Grid: Live Attendee List & Session Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Left Col: Live Attendee List */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserCheck size={18} style={{ color: '#10B981' }} />
                  <span>Daftar Siswa Yang Sudah Hadir</span>
                </h3>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Total kehadiran pada sesi terpilih: <strong>{records.length} Siswa</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span className="pulse-dot" style={{ width: 7, height: 7 }}></span>
                <span>Live Update</span>
              </div>
            </div>

            {records.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Siswa</th>
                      <th>Jenjang / Kelas</th>
                      <th>Waktu Absen</th>
                      <th>Status</th>
                      <th>Sisa Sesi Paket</th>
                      <th>Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, idx) => {
                      const student = rec.student;
                      const timeStr = new Date(rec.waktu_absen).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });

                      return (
                        <tr key={rec.id || idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                                  color: '#4338ca',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: 12,
                                  flexShrink: 0
                                }}
                              >
                                {student?.nama ? student.nama.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{student?.nama || 'Siswa'}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Kode: {rec.kode_digunakan}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>
                              {student?.jenjang} • {student?.kelas}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                              <Clock size={13} /> {timeStr} WIB
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                borderRadius: varRadiusSm,
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#10B981',
                                fontSize: 12,
                                fontWeight: 700
                              }}
                            >
                              <Check size={13} /> Hadir
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: varRadiusSm,
                                background: 'var(--bg-surface-secondary)',
                                fontSize: 12,
                                fontWeight: 700,
                                color: (student?.sisa_sesi || 0) <= 2 ? 'var(--danger)' : 'var(--primary)'
                              }}
                            >
                              {student?.sisa_sesi ?? '-'} Sesi
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {rec.catatan || 'Hadir mandiri'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Users size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ fontSize: 13.5, fontWeight: 500 }}>Belum ada siswa yang memasukkan kode absensi ini.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Bagikan kode di atas ke siswa agar mereka dapat melakukan presensi.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Sessions Switcher & History */}
        <div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
              Daftar Sesi Absensi ({sessions.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
              {sessions.map(s => {
                const isSelected = s.id === selectedSessionId;
                const recordCount = s.records?.length || 0;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    style={{
                      padding: 14,
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface-secondary)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: 13,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                          color: isSelected ? '#fff' : 'var(--text-main)'
                        }}
                      >
                        {s.kode_unik}
                      </span>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: s.status === 'aktif' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                          color: s.status === 'aktif' ? '#10B981' : '#EF4444'
                        }}
                      >
                        {s.status === 'aktif' ? 'Aktif' : 'Tutup'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-main)', marginBottom: 2 }}>
                      {s.mapel}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                      {s.judul_sesi || 'Sesi Belajar'} • {s.tanggal}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        👥 {recordCount} Siswa Masuk
                      </span>
                      {s.tentor && (
                        <span style={{ fontSize: 11.5, color: 'var(--primary)', fontWeight: 600 }}>
                          {s.tentor.nama.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Buka Sesi Absensi Baru */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="kpi-icon-wrap kpi-icon-emerald" style={{ width: 36, height: 36 }}>
                  <KeyRound size={18} />
                </div>
                <h3>Buka Sesi Absensi Baru</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSession}>
              <div className="form-group">
                <label className="form-label">Mata Pelajaran *</label>
                <select
                  className="form-select"
                  value={formData.mapel}
                  onChange={e => setFormData({ ...formData, mapel: e.target.value })}
                  required
                >
                  <option value="Matematika & Fisika">Matematika & Fisika</option>
                  <option value="Kimia & Biologi">Kimia & Biologi</option>
                  <option value="Bahasa Inggris & TOEFL">Bahasa Inggris & TOEFL</option>
                  <option value="IPA & Matematika SMP">IPA & Matematika SMP</option>
                  <option value="Calistung & Tematik SD">Calistung & Tematik SD</option>
                  <option value="Informatika & Logika Koding">Informatika & Logika Koding</option>
                  <option value="Persiapan UTBK / SNBT">Persiapan UTBK / SNBT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Judul / Topik Sesi Belajar</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Latihan Soal Kalkulus Bab 4"
                  value={formData.judul_sesi}
                  onChange={e => setFormData({ ...formData, judul_sesi: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tentor Pengajar</label>
                <select
                  className="form-select"
                  value={formData.tentor_id}
                  onChange={e => setFormData({ ...formData, tentor_id: e.target.value })}
                >
                  <option value="">-- Pilih Tentor (Opsional) --</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nama} ({t.mapel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Custom Kode Unik (Opsional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Biarkan kosong untuk auto-generate (misal: RN-8492)"
                  maxLength={10}
                  value={formData.customCode}
                  onChange={e => setFormData({ ...formData, customCode: e.target.value.toUpperCase() })}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                  Jika dikosongkan, sistem akan mengenerate 6 karakter acak yang mudah dibaca siswa.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Tambahan</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Catatan untuk sesi ini..."
                  value={formData.catatan}
                  onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={16} />
                  <span>{isSubmitting ? 'Membuat Sesi...' : 'Terbitkan Sesi & Kode'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

const varRadiusSm = 'var(--radius-sm)';
