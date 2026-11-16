'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { learningService } from '@/services/learningService';
import { LearningSchedule, Student, Tutor } from '@/types';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  User,
  GraduationCap,
  MapPin,
  Video,
  KeyRound,
  Trash2,
  RefreshCw,
  X,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const DAYS_OF_WEEK = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function JadwalPage() {
  const { students, tutors, showToast } = useApp();

  const [schedules, setSchedules] = useState<LearningSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedDay, setSelectedDay] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [metodeFilter, setMetodeFilter] = useState('all');

  // Modal State Tambah Jadwal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    tentor_id: '',
    hari: 'Senin',
    jam_mulai: '15:30',
    jam_selesai: '17:00',
    mapel: 'Matematika & Fisika',
    metode: 'Offline' as 'Offline' | 'Online' | 'Hybrid',
    ruangan: 'Ruang Belajar B-02'
  });

  // Load Schedules from Supabase
  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await learningService.getSchedulesByStudent();
      setSchedules(data);
    } catch (err: any) {
      showToast('Gagal memuat jadwal les: ' + err.message, 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // Filtered Schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(item => {
      const matchDay = selectedDay === 'Semua' || item.hari === selectedDay;
      const matchMetode = metodeFilter === 'all' || item.metode === metodeFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchSearch =
        (item.student?.nama && item.student.nama.toLowerCase().includes(searchLower)) ||
        (item.tentor?.nama && item.tentor.nama.toLowerCase().includes(searchLower)) ||
        item.mapel.toLowerCase().includes(searchLower) ||
        (item.ruangan && item.ruangan.toLowerCase().includes(searchLower));

      return matchDay && matchMetode && matchSearch;
    });
  }, [schedules, selectedDay, metodeFilter, searchQuery]);

  // Submit Tambah Jadwal
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id) {
      showToast('Pilih siswa terlebih dahulu', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newSched = await learningService.createSchedule({
        student_id: formData.student_id,
        tentor_id: formData.tentor_id || undefined,
        hari: formData.hari,
        jam_mulai: formData.jam_mulai,
        jam_selesai: formData.jam_selesai,
        mapel: formData.mapel,
        metode: formData.metode,
        ruangan: formData.ruangan
      });

      showToast(`Jadwal hari ${newSched.hari} berhasil ditambahkan! 📅`, 'success');
      setIsModalOpen(false);
      setFormData({
        student_id: '',
        tentor_id: '',
        hari: 'Senin',
        jam_mulai: '15:30',
        jam_selesai: '17:00',
        mapel: 'Matematika & Fisika',
        metode: 'Offline',
        ruangan: 'Ruang Belajar B-02'
      });
      await loadSchedules();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan jadwal', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (id: string, mapel: string) => {
    if (!confirm(`Hapus jadwal les ${mapel}?`)) return;
    try {
      await learningService.deleteSchedule(id);
      showToast('Jadwal berhasil dihapus', 'info');
      await loadSchedules();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus jadwal', 'danger');
    }
  };

  return (
    <main className="content-area">
      {/* 1. Header Banner */}
      <section className="hero-banner" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div className="hero-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div className="kpi-icon-wrap kpi-icon-indigo" style={{ width: 38, height: 38 }}>
              <Calendar size={20} />
            </div>
            <h2>Manajemen Jadwal Les</h2>
          </div>
          <p>Atur jadwal sesi mingguan, mapping siswa dengan tentor, metode les, dan sinkronkan dengan mode absensi.</p>
        </div>

        <div className="hero-actions">
          <button
            className="btn btn-secondary"
            onClick={loadSchedules}
            title="Segarkan Data"
          >
            <RefreshCw size={15} className={isLoading ? 'spin-icon' : ''} />
            <span>Segarkan</span>
          </button>

          <Link
            href="/absensi"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#10B981' }}
          >
            <KeyRound size={15} />
            <span>Mode Absensi Hari Ini</span>
          </Link>

          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>+ Buat Jadwal Baru</span>
          </button>
        </div>
      </section>

      {/* 2. Days of Week Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 12,
          marginBottom: 16
        }}
      >
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: selectedDay === day ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
              background: selectedDay === day ? 'var(--primary)' : 'var(--bg-surface)',
              color: selectedDay === day ? '#fff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-fast)'
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 3. Search and Quick Filters Bar */}
      <section
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Cari siswa, tentor, mapel, atau ruangan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: 13 }}
            value={metodeFilter}
            onChange={e => setMetodeFilter(e.target.value)}
          >
            <option value="all">Semua Metode</option>
            <option value="Offline">Offline (Tatap Muka)</option>
            <option value="Online">Online (Zoom / Meet)</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </section>

      {/* 4. Schedules Cards Grid */}
      {filteredSchedules.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
          {filteredSchedules.map(item => {
            const student = item.student;
            const tentor = item.tentor;
            const isOnline = item.metode === 'Online';

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <div>
                  {/* Top: Day, Time & Method Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)'
                        }}
                      >
                        {item.hari}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                        {item.jam_mulai} - {item.jam_selesai}
                      </span>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: isOnline ? 'rgba(14, 165, 233, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: isOnline ? '#0284c7' : '#10B981'
                      }}
                    >
                      {isOnline ? <Video size={12} /> : <MapPin size={12} />}
                      {item.metode}
                    </span>
                  </div>

                  {/* Middle: Mapel & Subject */}
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
                    {item.mapel}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                    Ruangan: <strong style={{ color: 'var(--text-main)' }}>{item.ruangan || 'Ruang Belajar'}</strong>
                  </div>

                  {/* Participant Meta (Clean Timetable Layout) */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                        <User size={13} />
                        <span>Siswa:</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)' }}>
                          {student?.nama || 'Siswa'}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginLeft: 6 }}>
                          ({student?.jenjang || '-'} {student?.kelas || ''})
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTop: '1px dashed var(--border-subtle)', paddingTop: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                        <GraduationCap size={14} style={{ color: 'var(--primary)' }} />
                        <span>Tentor:</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>
                          {tentor?.nama || 'Tentor Belum Ditugaskan'}
                        </span>
                        {tentor?.mapel && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>
                            • {tentor.mapel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                  <Link
                    href="/absensi"
                    className="btn btn-sm btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, textDecoration: 'none', color: '#10B981' }}
                    title="Buka sesi absensi untuk kelas ini"
                  >
                    <KeyRound size={13} />
                    <span>Mulai Absensi</span>
                  </Link>

                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleDeleteSchedule(item.id, item.mapel)}
                    title="Hapus Jadwal"
                    style={{ color: 'var(--danger)', padding: '5px 10px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Tidak Ada Jadwal Ditemukan</h3>
          <p style={{ fontSize: 13, maxWidth: 400, margin: '0 auto 16px' }}>
            Belum ada jadwal les untuk filter yang dipilih. Silakan tambah jadwal baru atau ubah filter hari.
          </p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Buat Jadwal Les Baru
          </button>
        </div>
      )}

      {/* Modal Tambah Jadwal Baru */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="kpi-icon-wrap kpi-icon-indigo" style={{ width: 36, height: 36 }}>
                  <Calendar size={18} />
                </div>
                <h3>Buat Jadwal Les Baru</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule}>
              <div className="form-group">
                <label className="form-label">Pilih Siswa *</label>
                <select
                  className="form-select"
                  value={formData.student_id}
                  onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Siswa Les --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.jenjang} - {s.kelas}) • Sisa {s.sisa_sesi ?? 0} Sesi
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pilih Tentor Pengajar</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Hari *</label>
                  <select
                    className="form-select"
                    value={formData.hari}
                    onChange={e => setFormData({ ...formData, hari: e.target.value })}
                    required
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Metode Les *</label>
                  <select
                    className="form-select"
                    value={formData.metode}
                    onChange={e => setFormData({ ...formData, metode: e.target.value as any })}
                    required
                  >
                    <option value="Offline">Offline (Tatap Muka)</option>
                    <option value="Online">Online (Zoom/Meet)</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Jam Mulai</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.jam_mulai}
                    onChange={e => setFormData({ ...formData, jam_mulai: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Selesai</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.jam_selesai}
                    onChange={e => setFormData({ ...formData, jam_selesai: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mata Pelajaran</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Matematika & Fisika SMA"
                  value={formData.mapel}
                  onChange={e => setFormData({ ...formData, mapel: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ruangan / Tempat</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Ruang Belajar B-02 atau Rumah Siswa"
                  value={formData.ruangan}
                  onChange={e => setFormData({ ...formData, ruangan: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
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
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
