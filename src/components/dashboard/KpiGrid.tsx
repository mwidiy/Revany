'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Check,
  ArrowUpRight
} from 'lucide-react';

export default function KpiGrid() {
  const { kpi, schedules } = useApp();
  const [siswaCount, setSiswaCount] = useState(0);
  const [tentorCount, setTentorCount] = useState(0);

  // Counter animation on load
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 800;
    const targetSiswa = kpi.siswaAktif.total;
    const targetTentor = kpi.tentorAktif.total;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setSiswaCount(Math.floor(progress * targetSiswa));
      setTentorCount(Math.floor(progress * targetTentor));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setSiswaCount(targetSiswa);
        setTentorCount(targetTentor);
      }
    };

    requestAnimationFrame(step);
  }, [kpi.siswaAktif.total, kpi.tentorAktif.total]);

  const completedCount = schedules.filter(s => s.status === 'completed').length;
  const ongoingCount = schedules.filter(s => s.status === 'ongoing').length;
  const upcomingCount = schedules.filter(s => s.status === 'upcoming').length;
  const omzetJuta = (kpi.keuangan.estimasiOmzet / 1000000).toFixed(1);

  return (
    <section className="kpi-grid">
      {/* Card 1: Siswa Aktif */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Total Siswa Aktif</span>
          <div className="kpi-icon-wrap kpi-icon-indigo">
            <Users size={18} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{siswaCount}</span>
          <span className="kpi-trend trend-up">
            <TrendingUp size={14} />
            <span>{kpi.siswaAktif.trend}</span>
          </span>
        </div>
        <p className="kpi-subtext">Pertumbuhan siswa aktif bulan ini</p>
        <div className="kpi-footer">
          <span>{kpi.siswaAktif.reguler} Siswa Reguler</span>
          <span>{kpi.siswaAktif.intensif} Siswa Intensif</span>
        </div>
      </div>

      {/* Card 2: Tentor Aktif */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Tentor Siaga</span>
          <div className="kpi-icon-wrap kpi-icon-emerald">
            <GraduationCap size={18} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{tentorCount}</span>
          <span className="kpi-trend trend-up">
            <ShieldCheck size={14} />
            <span>{kpi.tentorAktif.dutyToday} Mengajar</span>
          </span>
        </div>
        <p className="kpi-subtext">{kpi.tentorAktif.dutyToday} tentor aktif bertugas hari ini</p>
        <div className="kpi-footer">
          <span>{kpi.tentorAktif.total - kpi.tentorAktif.dutyToday} Tentor Standby</span>
          <span>Kepuasan {kpi.tentorAktif.rating} / 5.0</span>
        </div>
      </div>

      {/* Card 3: Presensi Hari Ini */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Presensi Hari Ini</span>
          <div className="kpi-icon-wrap kpi-icon-amber">
            <CalendarCheck size={18} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{kpi.sesiHariIni.kehadiranPersen}%</span>
          <span className="kpi-trend trend-up">
            <Check size={14} />
            <span>Tertib</span>
          </span>
        </div>
        <p className="kpi-subtext">{schedules.length} Pertemuan terjadwal hari ini</p>
        <div className="kpi-footer">
          <span>{completedCount} Selesai</span>
          <span>{ongoingCount} Sedang Jalan</span>
          <span>{upcomingCount} Nanti</span>
        </div>
      </div>

      {/* Card 4: Estimasi Finansial */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Estimasi Finansial</span>
          <div className="kpi-icon-wrap kpi-icon-blue">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">Rp {omzetJuta}Jt</span>
          <span className="kpi-trend trend-up">
            <ArrowUpRight size={14} />
            <span>{kpi.keuangan.trend}</span>
          </span>
        </div>
        <p className="kpi-subtext">Estimasi akumulasi omzet bulan berjalan</p>
        <div className="kpi-footer">
          <span>Fee: Rp {(kpi.keuangan.estimasiFeeTentor / 1000000).toFixed(1)}Jt</span>
          <span style={{ color: 'var(--success)', fontWeight: 700 }}>
            Margin {kpi.keuangan.marginPersen}%
          </span>
        </div>
      </div>
    </section>
  );
}
