'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Menu, Search, Moon, Sun, Bell, HelpCircle } from 'lucide-react';

export default function Topbar() {
  const { schedules, openSearchModal, toggleMobileSidebar, showToast } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [dateTimeString, setDateTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };
      const dateStr = now.toLocaleDateString('id-ID', optionsDate);
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setDateTimeString(`${dateStr} • ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const ongoingCount = schedules.filter(s => s.status === 'ongoing').length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn mobile-menu-btn"
          id="mobile-toggle-btn"
          onClick={toggleMobileSidebar}
          title="Toggle Menu"
          aria-label="Toggle Menu"
        >
          <Menu size={18} />
        </button>

        <div className="live-indicator" title={`${ongoingCount} Sesi Les Sedang Berlangsung`}>
          <span className="pulse-dot"></span>
          <span className="live-text-full">{ongoingCount} Sesi Sedang Berlangsung</span>
          <span className="live-text-short">{ongoingCount} Live</span>
        </div>

        <div className="topbar-datetime">
          {dateTimeString}
        </div>
      </div>

      <div className="topbar-right">
        {/* Search Command Palette Trigger */}
        <button
          className="search-trigger-btn"
          onClick={openSearchModal}
          title="Cari siswa, tentor, jadwal (Ctrl + K)"
          aria-label="Cari"
        >
          <Search size={16} />
          <span className="search-text">Cari siswa, tentor, jadwal...</span>
          <span className="kbd-shortcut">Ctrl K</span>
        </button>

        {/* Theme Switcher Button */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Ganti ke mode ${theme === 'light' ? 'Dark' : 'Light'}`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Button */}
        <button
          className="icon-btn"
          onClick={() => showToast('Semua notifikasi hari ini telah dibaca', 'info')}
          title="Pemberitahuan"
          aria-label="Notifikasi"
        >
          <Bell size={18} />
          <span className="badge-dot"></span>
        </button>

        {/* Support Help Button (hidden on small mobile) */}
        <button
          className="icon-btn topbar-help-btn"
          onClick={() => showToast('Pusat Bantuan Sahabat Ngajar siap membantu!', 'info')}
          title="Pusat Bantuan"
          aria-label="Bantuan"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
