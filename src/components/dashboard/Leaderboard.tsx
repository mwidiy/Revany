'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function Leaderboard() {
  const { tutors } = useApp();

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h3>Top Tentor Bulan Ini</h3>
          <p>Berdasarkan jam ajar & kepuasan siswa</p>
        </div>
        <a
          href="#fee-tentor"
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
        >
          Lihat Semua
        </a>
      </div>

      <div className="leaderboard-list">
        {tutors.map((tentor, idx) => {
          const rank = idx + 1;
          const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';

          return (
            <div key={tentor.id} className="tentor-row">
              <div className={`rank-badge ${rankClass}`}>#{rank}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tentor.avatar} alt={tentor.nama} className="tentor-avatar" />
              <div className="tentor-details">
                <div className="tentor-name">{tentor.nama}</div>
                <div className="tentor-mapel">
                  {tentor.mapel} • {tentor.totalSesi} Sesi
                </div>
              </div>
              <div className="tentor-stats">
                <div className="tentor-hours">{tentor.jamMengajar} Jam</div>
                <div className="tentor-rating">★ {tentor.rating}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
