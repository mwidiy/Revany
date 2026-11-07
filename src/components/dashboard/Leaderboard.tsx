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
            Memuat data tentor dari Supabase...
          </div>
        ) : (
          topTutors.map((tentor, idx) => {
            const rank = idx + 1;
            const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';

            return (
              <div key={tentor.id} className="tentor-row">
                <div className={`rank-badge ${rankClass}`}>#{rank}</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tentor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={tentor.nama}
                  className="tentor-avatar"
                />
                <div className="tentor-details">
                  <div className="tentor-name">{tentor.nama}</div>
                  <div className="tentor-mapel">
                    {tentor.mapel} • {tentor.total_sesi || 0} Sesi
                  </div>
                </div>
                <div className="tentor-stats">
                  <div className="tentor-hours">{tentor.jam_mengajar || 0} Jam</div>
                  <div className="tentor-rating">★ {tentor.rating || 5.0}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
