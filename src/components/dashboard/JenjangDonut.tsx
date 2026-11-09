'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function JenjangDonut() {
  const data = {
    labels: ['SMA / SMK', 'SMP', 'SD', 'TK & Prasekolah', 'UTBK'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: ['#6366F1', '#3B82F6', '#10B981', '#EC4899', '#F59E0B'],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (item: any) => ` ${item.label}: ${item.raw}% Siswa`
        }
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h3>Distribusi Jenjang Siswa</h3>
          <p>Segmentasi siswa aktif Sahabat Ngajar</p>
        </div>
      </div>
      <div className="donut-wrapper">
        <Doughnut data={data} options={options} />
      </div>
      <div className="donut-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#6366F1' }}></span> SMA / SMK (35%)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#3B82F6' }}></span> SMP (25%)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#10B981' }}></span> SD (20%)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#EC4899' }}></span> TK & Prasekolah (12%)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#F59E0B' }}></span> UTBK (8%)
        </div>
      </div>
    </div>
  );
}
