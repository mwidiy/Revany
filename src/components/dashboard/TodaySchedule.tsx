'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, CalendarX, ArrowRight } from 'lucide-react';

export default function TodaySchedule() {
  const { schedules, scheduleFilter, setScheduleFilter, openPresensiModal } = useApp();

  let filtered = schedules;
  if (scheduleFilter === 'ongoing') {
    filtered = schedules.filter(s => s.status === 'ongoing');
  } else if (scheduleFilter === 'upcoming') {
    filtered = schedules.filter(s => s.status === 'upcoming');
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h3>Sesi Les Hari Ini</h3>
          <p>Jadwal langsung & presensi cepat</p>
        </div>
        <div className="filter-pills">
          <button
            className={`filter-btn ${scheduleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setScheduleFilter('all')}
          >
            Semua
          </button>
          <button
            className={`filter-btn ${scheduleFilter === 'ongoing' ? 'active' : ''}`}
            onClick={() => setScheduleFilter('ongoing')}
          >
            Sedang Jalan
          </button>
          <button
            className={`filter-btn ${scheduleFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setScheduleFilter('upcoming')}
          >
            Mendatang
          </button>
        </div>
      </div>

      <div className="schedule-list">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <CalendarX size={32} style={{ marginBottom: 8, opacity: 0.6 }} />
            <p style={{ fontSize: 13 }}>Tidak ada sesi les untuk kategori ini saat ini.</p>
          </div>
        ) : (
          filtered.map(item => {
            let badgeClass = 'badge-upcoming';
            let statusLabel = 'Mendatang';
            let showPulse = false;

            if (item.status === 'ongoing') {
              badgeClass = 'badge-ongoing';
              statusLabel = 'Sedang Berlangsung';
              showPulse = true;
            } else if (item.status === 'completed') {
              badgeClass = 'badge-completed';
              statusLabel = 'Selesai';
            }

            return (
              <div key={item.id} className={`schedule-card status-${item.status}`}>
                <div className="schedule-top">
                  <div className="schedule-time">
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{item.waktu}</span>
                  </div>
                  <span className={`status-badge ${badgeClass}`}>
                    {showPulse && <span className="pulse-dot" style={{ width: 6, height: 6 }}></span>}
                    {statusLabel}
                  </span>
                </div>

                <div>
                  <div className="schedule-subject">{item.mapel}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.jenjang} •{' '}
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.metode}</span>
                  </div>
                </div>

                <div className="schedule-meta">
                  <div className="participant-pair">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.siswa.avatar}
                      alt={item.siswa.nama}
                      className="mini-avatar"
                      title={`Siswa: ${item.siswa.nama}`}
                    />
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 13 }}>
                      {item.siswa.nama}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      (Tentor: {item.tentor.nama.split(',')[0]})
                    </span>
                  </div>

                  <button
                    className="quick-action-link"
                    onClick={() => openPresensiModal(item.id)}
                  >
                    <span>Presensi</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
