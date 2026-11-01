'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CheckSquare, CalendarPlus, UserPlus } from 'lucide-react';

export default function HeroBanner() {
  const { schedules, openPresensiModal, openJadwalModal, openSiswaModal } = useApp();
  const [greeting, setGreeting] = useState('Selamat Datang');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 11) setGreeting('Selamat Pagi');
    else if (hours >= 11 && hours < 15) setGreeting('Selamat Siang');
    else if (hours >= 15 && hours < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  const totalToday = schedules.length;
  const ongoing = schedules.filter(s => s.status === 'ongoing').length;
  const completed = schedules.filter(s => s.status === 'completed').length;

  return (
    <section className="hero-banner">
      <div className="hero-text">
        <h2>{greeting}, Kak Admin! 👋</h2>
        <p>
          Hari ini ada {totalToday} pertemuan les terjadwal. {ongoing} sesi sedang berjalan dan {completed} sudah selesai.
        </p>
      </div>

      <div className="hero-actions">
        <button className="btn btn-outline-emerald" onClick={() => openPresensiModal()}>
          <CheckSquare size={16} />
          <span>+ Catat Presensi</span>
        </button>
        <button className="btn btn-secondary" onClick={openJadwalModal}>
          <CalendarPlus size={16} />
          <span>+ Buat Jadwal</span>
        </button>
        <button className="btn btn-primary" onClick={openSiswaModal}>
          <UserPlus size={16} />
          <span>+ Siswa Baru</span>
        </button>
      </div>
    </section>
  );
}
