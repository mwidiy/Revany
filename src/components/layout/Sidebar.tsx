'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  GraduationCap,
  Users,
  BookOpen,
  BookOpenCheck,
  History,
  Wallet,
  BarChart3,
  FileDown,
  Settings,
  MoreVertical,
  KeyRound,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { tutors, students, schedules, materials, isMobileSidebarOpen, closeMobileSidebar } = useApp();
  const { currentUser, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 95,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <aside className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="brand-wrapper" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpeg"
              alt="Sahabat Ngajar"
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-full)',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
              }}
            />
            <div className="brand-text">
              <h1 style={{ fontSize: 16, fontWeight: 800 }}>Sahabat Ngajar</h1>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bimbel & Pendamping Belajar</span>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-category">Utama</div>
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </Link>

          {/* Fitur Utama: Mode Absensi Hari Ini dengan Kode Unik */}
          <Link
            href="/absensi"
            className={`nav-item ${pathname === '/absensi' ? 'active' : ''}`}
            style={{
              background: pathname === '/absensi' ? 'rgba(16, 185, 129, 0.12)' : undefined,
              borderColor: pathname === '/absensi' ? '#10B981' : undefined
            }}
          >
            <KeyRound size={18} style={{ color: '#10B981' }} />
            <span style={{ fontWeight: 600 }}>Mode Absensi Hari Ini</span>
            <span
              className="nav-badge"
              style={{
                background: '#10B981',
                color: '#fff',
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 4
              }}
            >
              KODE
            </span>
          </Link>

          <Link href="/jadwal" className={`nav-item ${pathname === '/jadwal' ? 'active' : ''}`}>
            <Calendar size={18} />
            <span>Jadwal Les</span>
            <span className="nav-badge">{schedules.length}</span>
          </Link>

          <div className="nav-category">Akademik & Pengguna</div>
          <Link href="/tentor" className={`nav-item ${pathname === '/tentor' ? 'active' : ''}`}>
            <GraduationCap size={18} />
            <span>Data Tentor (Admin)</span>
            <span className="nav-badge">{tutors.length}</span>
          </Link>
          <Link href="/siswa" className={`nav-item ${pathname === '/siswa' ? 'active' : ''}`}>
            <Users size={18} />
            <span>Data Siswa (Admin)</span>
            <span className="nav-badge">{students.length}</span>
          </Link>
          <Link href="/materi" className={`nav-item ${pathname === '/materi' ? 'active' : ''}`}>
            <BookOpen size={18} />
            <span>Materi Pelajaran</span>
            <span className="nav-badge">{materials.length}</span>
          </Link>
          <Link href="/rekap-pertemuan" className={`nav-item ${pathname === '/rekap-pertemuan' ? 'active' : ''}`}>
            <History size={18} />
            <span>Rekap Pertemuan</span>
          </Link>

          <div className="nav-category">Keuangan & Dokumen</div>
          <a href="#fee-tentor" className="nav-item">
            <Wallet size={18} />
            <span>Fee Tentor</span>
          </a>
          <a href="#laporan-bulanan" className="nav-item">
            <BarChart3 size={18} />
            <span>Laporan Bulanan</span>
          </a>
          <a href="#cetak-pdf" className="nav-item">
            <FileDown size={18} />
            <span>Cetak Laporan PDF</span>
          </a>

          <div className="nav-category">Sistem & Autentikasi</div>
          <Link href="/login" className="nav-item">
            <LogOut size={18} />
            <span>Ganti Akun / Login</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-snippet" title="Profil Tentor / Super Admin">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
              }}
            >
              {currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser?.nama || 'Kak Tentor'}</div>
              <div className="user-role" style={{ color: 'var(--primary)', fontWeight: 600 }}>Tentor (Super Admin)</div>
            </div>
            <Link href="/login" title="Keluar / Ganti Akun" style={{ color: 'var(--text-muted)' }}>
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
