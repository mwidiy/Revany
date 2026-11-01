'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrendChart() {
  const { chartPeriod, setChartPeriod, showToast } = useApp();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? '#1E293B' : '#F1F5F9';
  const tooltipBg = isDark ? '#161F36' : '#0F172A';

  const getData = () => {
    if (chartPeriod === 'week') {
      return {
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        sesi: [14, 18, 16, 21, 25, 28, 20],
        target: [12, 15, 15, 18, 20, 22, 18]
      };
    } else if (chartPeriod === 'month') {
      return {
        labels: ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4'],
        sesi: [84, 98, 112, 128],
        target: [80, 90, 100, 110]
      };
    } else {
      return {
        labels: ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        sesi: [280, 310, 350, 420, 460, 490],
        target: [250, 300, 320, 380, 400, 450]
      };
    }
  };

  const chartData = getData();

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Sesi Selesai',
        data: chartData.sesi,
        borderColor: '#6366F1',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const bg = ctx.createLinearGradient(0, 0, 0, 300);
          bg.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
          bg.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          return bg;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7
      },
      {
        label: 'Target Sesi',
        data: chartData.target,
        borderColor: '#10B981',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 0
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: textColor,
          usePointStyle: true,
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 700 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 11 }
        }
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 11 }
        }
      }
    }
  };

  const handlePeriodChange = (period: 'week' | 'month' | 'semester') => {
    setChartPeriod(period);
    showToast(`Data grafik diperbarui untuk periode: ${period.toUpperCase()}`, 'success');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h3>Tren Pertemuan & Kehadiran Sesi</h3>
          <p>Visualisasi jumlah sesi belajar terlaksana per hari</p>
        </div>
        <div className="filter-pills">
          <button
            className={`filter-btn ${chartPeriod === 'week' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('week')}
          >
            7 Hari
          </button>
          <button
            className={`filter-btn ${chartPeriod === 'month' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('month')}
          >
            Bulan Ini
          </button>
          <button
            className={`filter-btn ${chartPeriod === 'semester' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('semester')}
          >
            Semester
          </button>
        </div>
      </div>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
