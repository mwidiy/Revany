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
  BookOpenCheck,
  History,
  Wallet,
  BarChart3,
  FileDown,
  Settings,
  MoreVertical
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { tutors, students, schedules, isMobileSidebarOpen, closeMobileSidebar } = useApp();

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
          <a href="#jadwal" className="nav-item">
            <Calendar size={18} />
            <span>Jadwal Les</span>
            <span className="nav-badge">{schedules.length}</span>
          </a>
          <a href="#presensi" className="nav-item">
            <UserCheck size={18} />
            <span>Presensi Siswa</span>
          </a>

          <div className="nav-category">Akademik & Pengguna</div>
          <Link href="/tentor" className={`nav-item ${pathname === '/tentor' ? 'active' : ''}`}>
            <GraduationCap size={18} />
            <span>Data Tentor</span>
            <span className="nav-badge">{tutors.length}</span>
          </Link>
          <Link href="/siswa" className={`nav-item ${pathname === '/siswa' ? 'active' : ''}`}>
            <Users size={18} />
            <span>Data Siswa</span>
            <span className="nav-badge">{students.length}</span>
          </Link>
          <a href="#laporan-belajar" className="nav-item">
            <BookOpenCheck size={18} />
            <span>Laporan Belajar</span>
          </a>
          <a href="#rekap-pertemuan" className="nav-item">
            <History size={18} />
            <span>Rekap Pertemuan</span>
          </a>

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

          <div className="nav-category">Sistem</div>
          <a href="#pengaturan" className="nav-item">
            <Settings size={18} />
            <span>Pengaturan Sistem</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-snippet" title="Profil Super Admin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Admin"
              className="user-avatar"
            />
            <div className="user-info">
              <div className="user-name">Kak Admin</div>
              <div className="user-role">Super Admin</div>
            </div>
            <MoreVertical size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </aside>
    </>
  );
}
