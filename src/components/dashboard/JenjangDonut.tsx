'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function JenjangDonut() {
  const data = {
    labels: ['SMA / SMK', 'SMP', 'SD', 'UTBK / Kedinasan'],
    datasets: [
      {
        data: [42, 28, 18, 12],
        backgroundColor: ['#6366F1', '#3B82F6', '#10B981', '#F59E0B'],
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
          <p>Segmentasi siswa aktif Revani</p>
        </div>
      </div>
      <div className="donut-wrapper">
        <Doughnut data={data} options={options} />
      </div>
      <div className="donut-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#6366F1' }}></span> SMA / SMK (42%)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#3B82F6' }}></span> SMP (28%)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#10B981' }}></span> SD (18%)
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#F59E0B' }}></span> UTBK/Kedinasan (12%)
        </div>
      </div>
    </div>
  );
}
