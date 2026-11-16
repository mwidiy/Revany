'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudentPortal = pathname.startsWith('/portal-siswa');
  const isLoginPage = pathname === '/login';

  // Halaman Login menggunakan shell khusus
  if (isLoginPage) {
    return <main style={{ minHeight: '100vh', width: '100%' }}>{children}</main>;
  }

  // Portal Siswa menggunakan layout khusus mobile-friendly tanpa sidebar admin yang berat
  if (isStudentPortal) {
    return (
      <div className="student-portal-shell" style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
        {children}
      </div>
    );
  }

  // Dashboard Tentor / Super Admin dengan Sidebar dan Topbar lengkap
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
