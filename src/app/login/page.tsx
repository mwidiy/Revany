'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import {
  GraduationCap,
  Users,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsTentor, loginAsStudent } = useAuth();
  const { showToast } = useApp();

  const [activeRole, setActiveRole] = useState<'tentor' | 'siswa'>('tentor');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper untuk menghasilkan berbagai varian format nomor telepon (08xx, +62xx, 62xx, serta pembersih spasi/strip)
  const buildSearchConditions = (cleanId: string) => {
    const cleanEmail = cleanId.toLowerCase();
    const digitsOnly = cleanId.replace(/\D/g, '');
    const conditions = [
      `email.ilike.${cleanEmail}`,
      `nama.ilike.%${cleanId}%`
    ];

    const phoneSet = new Set<string>();
    phoneSet.add(cleanId);
    if (digitsOnly.length >= 7) {
      phoneSet.add(digitsOnly);
      if (digitsOnly.startsWith('62')) {
        phoneSet.add('+' + digitsOnly);
        phoneSet.add('0' + digitsOnly.slice(2));
      } else if (digitsOnly.startsWith('0')) {
        phoneSet.add('+62' + digitsOnly.slice(1));
        phoneSet.add('62' + digitsOnly.slice(1));
      }
    }

    for (const p of phoneSet) {
      conditions.push(`telepon.eq.${p}`);
    }

    return conditions.join(',');
  };

  // Handle Form Submit (Real Supabase Auth verification against tentors & students)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanId || !cleanPassword) {
      showToast('Silakan masukkan akun dan kata sandi login', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const orFilter = buildSearchConditions(cleanId);

      // 1. Coba verifikasi peran sesuai tab yang dipilih terlebih dahulu
      if (activeRole === 'tentor') {
        const { data: tentorList, error: tErr } = await supabase
          .from('tentors')
          .select('*')
          .or(orFilter)
          .eq('password', cleanPassword)
          .limit(1);

        if (!tErr && tentorList && tentorList.length > 0) {
          const tentor = tentorList[0];
          loginAsTentor(tentor as any);
          showToast(`Selamat datang kembali, ${tentor.nama}!`, 'success');
          router.push('/');
          return;
        }

        // Fallback cerdas: Jika user lupa ganti tab dan ternyata akun terdaftar di Siswa
        const { data: studentFallback } = await supabase
          .from('students')
          .select('*')
          .or(orFilter)
          .eq('password', cleanPassword)
          .limit(1);

        if (studentFallback && studentFallback.length > 0) {
          const student = studentFallback[0];
          loginAsStudent(student as any);
          showToast(`Selamat datang di Portal Siswa, ${student.nama}!`, 'success');
          router.push('/portal-siswa');
          return;
        }

        showToast('Email/No. HP atau kata sandi tidak cocok. Silakan periksa kembali.', 'danger');
      } else {
        // Tab Siswa dipilih
        const { data: studentList, error: sErr } = await supabase
          .from('students')
          .select('*')
          .or(orFilter)
          .eq('password', cleanPassword)
          .limit(1);

        if (!sErr && studentList && studentList.length > 0) {
          const student = studentList[0];
          loginAsStudent(student as any);
          showToast(`Selamat datang di Portal Siswa, ${student.nama}!`, 'success');
          router.push('/portal-siswa');
          return;
        }

        // Fallback cerdas: Jika user lupa ganti tab dan ternyata akun terdaftar di Tentor
        const { data: tentorFallback } = await supabase
          .from('tentors')
          .select('*')
          .or(orFilter)
          .eq('password', cleanPassword)
          .limit(1);

        if (tentorFallback && tentorFallback.length > 0) {
          const tentor = tentorFallback[0];
          loginAsTentor(tentor as any);
          showToast(`Selamat datang kembali, ${tentor.nama}!`, 'success');
          router.push('/');
          return;
        }

        showToast('Akun (Email / Nama / No. WhatsApp) atau kata sandi tidak cocok.', 'danger');
      }
    } catch (err: any) {
      showToast('Terjadi kendala saat login: ' + (err?.message || 'Koneksi gagal'), 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: '#0F172A',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#F8FAFC'
      }}
    >
      {/* =========================================================================
          LEFT BRANDING PANEL (FEATURE HIGHLIGHTS & VISUAL SHOWCASE)
          ========================================================================= */}
      <div
        className="login-brand-side"
        style={{
          flex: 1.1,
          background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)',
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Ambient Decorative Lighting */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Header */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpeg"
              alt="Sahabat Ngajar"
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                objectFit: 'cover',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)'
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Sahabat Ngajar Edu
              </div>
              <div style={{ fontSize: 12, color: '#A5B4FC', fontWeight: 600 }}>
                Sistem Manajemen Bimbingan Belajar
              </div>
            </div>
          </div>
        </div>

        {/* Hero Copy & Feature Cards */}
        <div style={{ position: 'relative', zIndex: 2, margin: '48px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(165, 180, 252, 0.3)',
              color: '#C7D2FE',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 20
            }}
          >
            <Sparkles size={14} style={{ color: '#818CF8' }} />
            <span>Platform Les Privat & Bimbingan Belajar Modern</span>
          </div>

          <h2
            style={{
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: 16
            }}
          >
            Pantau Kehadiran, Jadwal & Sesi Belajar Lebih Terintegrasi.
          </h2>
          <p style={{ fontSize: 14.5, color: '#CBD5E1', lineHeight: 1.6, maxWidth: 520, marginBottom: 32 }}>
            Satu sistem terpadu untuk Tentor dan Siswa. Absensi kode unik real-time, pengelolaan jadwal fleksibel,
            dan rekapitulasi sesi pertemuan tanpa ribet manual.
          </p>

          {/* 3 Interactive Showcase Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <KeyRound size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Presensi Kode Unik Harian</div>
                <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Siswa absen mandiri dengan kode tentor hari ini</div>
              </div>
              <CheckCircle2 size={16} style={{ color: '#34D399' }} />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#A5B4FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Auto-Sync Sisa Sesi Paket</div>
                <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Setiap siswa hadir, kuota pertemuan otomatis sinkron</div>
              </div>
              <CheckCircle2 size={16} style={{ color: '#818CF8' }} />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ position: 'relative', zIndex: 2, fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} style={{ color: '#34D399' }} />
          <span>Sahabat Ngajar Cloud Edu © 2026 • Dilindungi Enkripsi Database</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT FORM PANEL (AUTHENTICATION BOX)
          ========================================================================= */}
      <div
        style={{
          flex: 1,
          background: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          color: 'var(--text-main)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '36px 32px',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0,0,0,0.03)'
          }}
        >
          {/* Header Title */}
          <div style={{ marginBottom: 26, textAlign: 'left' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, letterSpacing: '-0.02em' }}>
              Selamat Datang Kembali 👋
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Silakan pilih peran dan masukkan kredensial akun Anda:
            </p>
          </div>

          {/* Role Segmented Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-secondary)',
              padding: 4,
              borderRadius: '12px',
              marginBottom: 24,
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveRole('tentor');
                setIdentifier('');
                setPassword('');
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeRole === 'tentor' ? 'var(--bg-surface)' : 'transparent',
                color: activeRole === 'tentor' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeRole === 'tentor' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <GraduationCap size={16} />
              <span>Tentor / Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('siswa');
                setIdentifier('');
                setPassword('');
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeRole === 'siswa' ? 'var(--bg-surface)' : 'transparent',
                color: activeRole === 'siswa' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeRole === 'siswa' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Users size={16} />
              <span>Siswa Bimbel</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {activeRole === 'tentor' ? (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: 6
                    }}
                  >
                    Email Akun atau No. WhatsApp Tentor
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none'
                      }}
                    >
                      <Mail size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="email@sahabatngajar.com atau 0812-XXXX-XXXX"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        fontSize: 13.5,
                        borderRadius: '10px',
                        border: '1.5px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: 6
                    }}
                  >
                    Kata Sandi Tentor
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none'
                      }}
                    >
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan kata sandi..."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 40px',
                        fontSize: 13.5,
                        borderRadius: '10px',
                        border: '1.5px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: 6
                    }}
                  >
                    Email Siswa atau No. WhatsApp
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none'
                      }}
                    >
                      <Phone size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="siswa@gmail.com atau 0812-XXXX-XXXX"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        fontSize: 13.5,
                        borderRadius: '10px',
                        border: '1.5px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: 6
                    }}
                  >
                    Kata Sandi Siswa
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none'
                      }}
                    >
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan kata sandi..."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 40px',
                        fontSize: 13.5,
                        borderRadius: '10px',
                        border: '1.5px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: 14.5,
                fontWeight: 700,
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                transition: 'all 0.2s ease',
                marginBottom: 16
              }}
            >
              <span>
                {isSubmitting
                  ? 'Memverifikasi...'
                  : activeRole === 'tentor'
                  ? 'Masuk ke Dashboard Tentor'
                  : 'Masuk ke Portal Siswa'}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: 11.5,
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              textAlign: 'center'
            }}
          >
            💡 Akun didaftarkan oleh admin. Password default awal:{' '}
            <strong style={{ color: 'var(--text-main)' }}>123456</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
