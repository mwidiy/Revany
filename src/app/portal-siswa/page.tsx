'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { attendanceService } from '@/services/attendanceService';
import { learningService } from '@/services/learningService';
import { AttendanceRecord, LearningMaterial, LearningSchedule, Student } from '@/types';
import {
  KeyRound,
  CheckCircle2,
  Calendar,
  BookOpen,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  FileText,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Search
} from 'lucide-react';

export default function PortalSiswaPage() {
  const router = useRouter();
  const { students, refreshStudents, showToast } = useApp();
  const { currentUser, logout } = useAuth();

  // Active Tab: 'absensi' | 'jadwal' | 'materi'
  const [activeTab, setActiveTab] = useState<'absensi' | 'jadwal' | 'materi'>('absensi');

  // Active Student: Defaults to logged in student or first student in database
  const activeStudent: Student | null = (currentUser?.role === 'siswa' && currentUser?.studentId
    ? students.find(s => s.id === currentUser.studentId) || null
    : null) || students[0] || null;

  // Absensi Form State
  const [inputCode, setInputCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [successResult, setSuccessResult] = useState<{ record: AttendanceRecord; sessionTitle: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student Attendance History
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Materials & Schedules
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [schedules, setSchedules] = useState<LearningSchedule[]>([]);
  const [materialFilter, setMaterialFilter] = useState('all');

  // Load History for Active Student
  const loadStudentHistory = useCallback(async (studentId: string) => {
    setIsLoadingHistory(true);
    try {
      const records = await attendanceService.getStudentAttendanceHistory(studentId);
      setAttendanceHistory(records);
    } catch (err) {
      console.error('Failed loading history', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load Materials & Schedules
  const loadMaterialsAndSchedules = useCallback(async () => {
    try {
      const mats = await learningService.getMaterials();
      setMaterials(mats);
      let scheds: LearningSchedule[] = [];
      if (activeStudent?.id) {
        scheds = await learningService.getSchedulesByStudent(activeStudent.id);
      }
      if (scheds.length === 0) {
        scheds = await learningService.getSchedulesByStudent();
      }
      setSchedules(scheds);
    } catch (err) {
      console.error('Failed loading materials or schedules', err);
    }
  }, [activeStudent?.id]);

  useEffect(() => {
    if (activeStudent) {
      loadStudentHistory(activeStudent.id);
    }
    loadMaterialsAndSchedules();
  }, [activeStudent, loadStudentHistory, loadMaterialsAndSchedules]);

  // Handle Absensi Submit
  const handleAbsensiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      showToast('Data siswa tidak ditemukan', 'danger');
      return;
    }

    const cleaned = inputCode.trim().toUpperCase();
    if (!cleaned) {
      setErrorMessage('Harap masukkan kode absensi yang diberikan oleh Tentor.');
      return;
    }

    setIsSubmittingCode(true);
    setErrorMessage(null);

    try {
      const res = await attendanceService.submitAttendanceWithCode(cleaned, activeStudent.id);
      setSuccessResult({
        record: res.record,
        sessionTitle: res.session.judul_sesi || res.session.mapel
      });
      setInputCode('');
      showToast('Presensi kamu berhasil dicatat! Sisa sesi diperbarui.', 'success');
      // Reload history and student sessions
      await loadStudentHistory(activeStudent.id);
      await refreshStudents();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal melakukan absensi');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  return (
    <div className="student-portal-shell">
      {/* 1. Student Header Navbar */}
      <header className="student-navbar">
        <div className="student-nav-container">
          <Link href="/portal-siswa" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpeg"
              alt="Sahabat Ngajar"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)', lineHeight: 1.2 }}>
                Sahabat Ngajar
              </div>
              <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                Portal Belajar Siswa
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Active Student Badge */}
            {activeStudent && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                  {activeStudent.nama}
                </span>
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                  ({activeStudent.sisa_sesi ?? 0} Sesi)
                </span>
              </div>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="btn btn-sm btn-secondary"
              title="Keluar dari Portal Siswa"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Portal Container */}
      <main className="student-main-content">
        {/* Student Welcome Banner */}
        <div className="student-hero-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: 10
                }}
              >
                <Sparkles size={12} /> Selamat Datang di Bimbel
              </span>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                Halo, {activeStudent?.nama || 'Siswa'}! 👋
              </h1>
              <p style={{ fontSize: 13.5, opacity: 0.9 }}>
                {activeStudent?.jenjang} — {activeStudent?.kelas} • {activeStudent?.sekolah || 'Sahabat Ngajar Edu'}
              </p>
            </div>

            {/* Sisa Kuota Sesi & Pertemuan Berlangsung */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(10px)',
                padding: '14px 22px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                textAlign: 'center',
                minWidth: 190
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.85, textTransform: 'uppercase', fontWeight: 700 }}>
                Pertemuan Berlangsung
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, margin: '2px 0' }}>
                {Math.max(0, (activeStudent?.total_sesi_paket || 8) - (activeStudent?.sisa_sesi ?? 0))}
                <span style={{ fontSize: 14, fontWeight: 500 }}> / {activeStudent?.total_sesi_paket || 8} Sesi</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#6ee7b7', fontWeight: 700 }}>
                Sisa: {activeStudent?.sisa_sesi ?? 0} Sesi Kuota
              </div>
              <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>
                Paket: {activeStudent?.paket || 'Reguler'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Three Main Tabs: Absensi, Jadwal, Materi */}
        <nav className="student-tab-nav">
          <button
            className={`student-tab-btn ${activeTab === 'absensi' ? 'active' : ''}`}
            onClick={() => setActiveTab('absensi')}
          >
            <KeyRound size={17} />
            <span>Absensi Kode Unik</span>
          </button>

          <button
            className={`student-tab-btn ${activeTab === 'jadwal' ? 'active' : ''}`}
            onClick={() => setActiveTab('jadwal')}
          >
            <Calendar size={17} />
            <span>Jadwal Pelajaran</span>
          </button>

          <button
            className={`student-tab-btn ${activeTab === 'materi' ? 'active' : ''}`}
            onClick={() => setActiveTab('materi')}
          >
            <BookOpen size={17} />
            <span>Materi Pelajaran</span>
          </button>
        </nav>

        {/* =========================================================================
            TAB 1: ABSENSI KODE UNIK (CORE REQUEST)
           ========================================================================= */}
        {activeTab === 'absensi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Input Kode Unik Card */}
            <div
              className="card"
              style={{
                padding: 32,
                textAlign: 'center',
                border: '2px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.08)'
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <KeyRound size={28} />
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                Presensi Kehadiran Siswa
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 24px' }}>
                Masukkan <strong>Kode Unik</strong> yang diberikan oleh Tentor pada sesi kelas hari ini untuk mencatat kehadiranmu.
              </p>

              <form onSubmit={handleAbsensiSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="text"
                    className="pin-code-input"
                    placeholder="RN-XXXX"
                    maxLength={10}
                    value={inputCode}
                    onChange={e => {
                      setInputCode(e.target.value.toUpperCase());
                      setErrorMessage(null);
                    }}
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {errorMessage && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      fontSize: 12.5,
                      fontWeight: 600,
                      marginBottom: 16,
                      textAlign: 'left'
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingCode || !inputCode.trim()}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {isSubmittingCode ? (
                    <>
                      <RefreshCw size={18} className="spin-icon" />
                      <span>Memverifikasi Kode...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Kirim Presensi Sekarang</span>
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                🔒 Presensi tercatat secara otomatis dan mengurangi 1 kuota sesi belajar aktif.
              </div>
            </div>

            {/* Success Feedback Modal / Alert */}
            {successResult && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
                  border: '2px solid #10B981',
                  borderRadius: 'var(--radius-xl)',
                  padding: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#10B981',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Check size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>
                    Presensi Berhasil Tercatat! 🎉
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Kamu berhasil absen pada sesi <strong>{successResult.sessionTitle}</strong> dengan kode{' '}
                    <code>{successResult.record.kode_digunakan}</code>. Selamat belajar!
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setSuccessResult(null)}
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Riwayat Absensi Siswa */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Riwayat Kehadiran Kamu</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Daftar absensi sesi belajar yang telah kamu selesaikan
                  </p>
                </div>
                {activeStudent && (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => loadStudentHistory(activeStudent.id)}
                    title="Refresh Riwayat"
                  >
                    <RefreshCw size={14} className={isLoadingHistory ? 'spin-icon' : ''} />
                  </button>
                )}
              </div>

              {attendanceHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {attendanceHistory.map(rec => {
                    const session = (rec as any).session;
                    const dateFormatted = new Date(rec.waktu_absen).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    const timeFormatted = new Date(rec.waktu_absen).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={rec.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                              {session?.mapel || 'Sesi Belajar'} — {session?.judul_sesi || 'Les Privat'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {dateFormatted} • {timeFormatted} WIB • Kode: <strong>{rec.kode_digunakan}</strong>
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10B981',
                            fontSize: 12,
                            fontWeight: 700
                          }}
                        >
                          Hadir
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ fontSize: 13 }}>Belum ada riwayat presensi yang tercatat untuk akun ini.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: JADWAL PELAJARAN SISWA
           ========================================================================= */}
        {activeTab === 'jadwal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>Jadwal Belajar Mingguan</h2>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Agenda sesi bimbingan bersama tentor Sahabat Ngajar
                  </p>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  Aktif Semester Ini
                </span>
              </div>

              {/* Weekly Schedules Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {schedules.length > 0 ? (
                  schedules.map((item, index) => (
                    <div
                      key={item.id || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 14,
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-subtle)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 12,
                            lineHeight: 1.2
                          }}
                        >
                          <span>{item.hari.slice(0, 3)}</span>
                          <Calendar size={14} style={{ marginTop: 2 }} />
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>
                            {item.mapel}
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <Clock size={13} /> {item.jam_mulai} - {item.jam_selesai} WIB • {item.metode}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.tentor?.nama || 'Tentor Pengajar'}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {item.ruangan || 'Ruang Belajar'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Calendar size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p style={{ fontSize: 13.5, fontWeight: 600 }}>Belum ada jadwal les terdaftar untuk siswa ini.</p>
                    <p style={{ fontSize: 12, marginTop: 2 }}>Hubungi admin bimbel untuk penambahan jadwal.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: MATERI PELAJARAN SISWA
           ========================================================================= */}
        {activeTab === 'materi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>Materi & Modul Belajar</h2>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Bahan bacaan, ringkasan rumus, dan lembar latihan soal resmi dari tentor
                  </p>
                </div>

                {/* Filter Mapel */}
                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: 13 }}
                  value={materialFilter}
                  onChange={e => setMaterialFilter(e.target.value)}
                >
                  <option value="all">Semua Mata Pelajaran</option>
                  <option value="Matematika">Matematika</option>
                  <option value="Kimia">Kimia</option>
                  <option value="UTBK / Kedinasan">UTBK / SNBT</option>
                  <option value="Tematik">Tematik SD</option>
                </select>
              </div>

              {/* Material Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {materials
                  .filter(m => materialFilter === 'all' || m.mapel.includes(materialFilter))
                  .map(mat => (
                    <div
                      key={mat.id}
                      style={{
                        padding: 18,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: 'var(--primary-light)',
                              color: 'var(--primary)'
                            }}
                          >
                            {mat.mapel}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                            {mat.jenjang}
                          </span>
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                          {mat.judul}
                        </h3>
                        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 14 }}>
                          {mat.deskripsi || 'Modul dan latihan soal untuk menunjang pemahaman materi belajar.'}
                        </p>
                      </div>

                      <a
                        href={mat.file_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={14} />
                        <span>Unduh / Buka Materi (PDF)</span>
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
