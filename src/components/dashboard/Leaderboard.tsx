'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Leaderboard() {
  const { tutors } = useApp();

  // Show top 4 tutors sorted by rating/jam
  const topTutors = [...tutors]
    .sort((a, b) => (b.jam_mengajar || 0) - (a.jam_mengajar || 0))
    .slice(0, 4);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h3>Top Tentor Bulan Ini</h3>
          <p>Berdasarkan jam ajar & kepuasan siswa</p>
        </div>
        <Link
          href="/tentor"
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
        >
          Lihat Semua
        </Link>
      </div>

      <div className="leaderboard-list">
        {topTutors.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Memuat data tenaga pengajar...
          </div>
        ) : (
          topTutors.map((tentor, idx) => {
            const rank = idx + 1;
            const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
            const isFemale = tentor.jenis_kelamin === 'P';

            return (
              <div key={tentor.id} className="tentor-row">
                <div className={`rank-badge ${rankClass}`}>#{rank}</div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-full)',
                    background: isFemale ? 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                    border: isFemale ? '2px solid #f472b6' : '2px solid #60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isFemale ? '#db2777' : '#2563eb',
                    flexShrink: 0
                  }}
                  title={isFemale ? 'Tentor Putri' : 'Tentor Putra'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4" />
                    <path d={isFemale ? "M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" : "M6 21v-2a6 6 0 0 1 12 0v2"} />
                  </svg>
                </div>
                <div className="tentor-details">
                  <div className="tentor-name">{tentor.nama}</div>
                  <div className="tentor-mapel">
                    {tentor.mapel} • {tentor.total_sesi || 0} Sesi
                  </div>
                </div>
                <div className="tentor-stats">
                  <div className="tentor-hours">{tentor.jam_mengajar || 0} Jam</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
