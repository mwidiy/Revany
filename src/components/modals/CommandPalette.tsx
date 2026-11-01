'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, User, GraduationCap } from 'lucide-react';

export default function CommandPalette() {
  const {
    isSearchModalOpen,
    openSearchModal,
    closeSearchModal,
    schedules,
    tutors,
    openPresensiModal,
    showToast
  } = useApp();
  const [query, setQuery] = useState('');

  // Global Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isSearchModalOpen) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
      } else if (e.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, openSearchModal, closeSearchModal]);

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase();
  const results: Array<{
    type: string;
    title: string;
    subtitle: string;
    isTutor: boolean;
    action: () => void;
  }> = [];

  schedules.forEach(s => {
    if (!q || s.siswa.nama.toLowerCase().includes(q) || s.mapel.toLowerCase().includes(q)) {
      results.push({
        type: 'Siswa / Sesi Les',
        title: s.siswa.nama,
        subtitle: `${s.mapel} • ${s.waktu}`,
        isTutor: false,
        action: () => {
          closeSearchModal();
          openPresensiModal(s.id);
        }
      });
    }
  });

  tutors.forEach(t => {
    if (!q || t.nama.toLowerCase().includes(q) || t.mapel.toLowerCase().includes(q)) {
      results.push({
        type: 'Tentor',
        title: t.nama,
        subtitle: `${t.mapel} (Rating: ${t.rating}★)`,
        isTutor: true,
        action: () => {
          closeSearchModal();
          showToast(`Profil Tentor: ${t.nama}`, 'info');
        }
      });
    }
  });

  return (
    <div className="modal-backdrop" onClick={closeSearchModal}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 580, padding: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 14
          }}
        >
          <Search size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ketik nama siswa, tentor, atau mapel..."
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: 15,
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <span className="kbd-shortcut">ESC</span>
        </div>

        <div
          style={{
            marginTop: 14,
            maxHeight: 300,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Tidak ditemukan data yang cocok dengan &quot;{query}&quot;
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    className="kpi-icon-wrap kpi-icon-indigo"
                    style={{ width: 32, height: 32 }}
                  >
                    {item.isTutor ? <GraduationCap size={16} /> : <User size={16} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.subtitle}</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    background: 'var(--bg-surface-secondary)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    color: 'var(--text-muted)',
                    fontWeight: 600
                  }}
                >
                  {item.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
