'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { RotateCw, CheckCircle, FileText, UserPlus, DollarSign, Calendar } from 'lucide-react';

export default function ActivityFeed() {
  const { activities, showToast } = useApp();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle':
        return <CheckCircle size={16} />;
      case 'FileText':
        return <FileText size={16} />;
      case 'UserPlus':
        return <UserPlus size={16} />;
      case 'DollarSign':
        return <DollarSign size={16} />;
      case 'Calendar':
        return <Calendar size={16} />;
      default:
        return <CheckCircle size={16} />;
    }
  };

  const getBadgeClass = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'kpi-icon-emerald';
      case 'amber':
        return 'kpi-icon-amber';
      case 'blue':
        return 'kpi-icon-blue';
      case 'rose':
        return 'kpi-icon-amber';
      default:
        return 'kpi-icon-indigo';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h3>Log Aktivitas Terkini</h3>
          <p>Presensi & laporan belajar masuk</p>
        </div>
        <button
          className="icon-btn"
          style={{ width: 32, height: 32 }}
          onClick={() => showToast('Log aktivitas telah diperbarui', 'success')}
          title="Segarkan Log"
        >
          <RotateCw size={14} />
        </button>
      </div>

      <div className="activity-feed">
        {activities.map(act => (
          <div key={act.id} className="activity-item">
            <div className={`activity-icon-badge ${getBadgeClass(act.color)}`}>
              {getIcon(act.icon)}
            </div>
            <div className="activity-info">
              <h4>{act.judul}</h4>
              <p>{act.deskripsi}</p>
              <div className="activity-time">{act.waktu}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
