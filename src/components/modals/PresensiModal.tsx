'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle, X, Save } from 'lucide-react';

export default function PresensiModal() {
  const { isPresensiModalOpen, presensiSelectedScheduleId, closePresensiModal, schedules, recordPresensi } = useApp();
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('Hadir');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (presensiSelectedScheduleId) {
      setSelectedId(presensiSelectedScheduleId);
    } else if (schedules.length > 0) {
      setSelectedId(schedules[0].id);
    }
  }, [presensiSelectedScheduleId, schedules]);

  if (!isPresensiModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    recordPresensi(selectedId, status, notes);
    setNotes('');
  };

  return (
    <div className="modal-backdrop" onClick={closePresensiModal}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon-wrap kpi-icon-emerald" style={{ width: 36, height: 36 }}>
              <CheckCircle size={18} />
            </div>
            <h3>Catat Presensi Siswa</h3>
          </div>
          <button className="modal-close-btn" onClick={closePresensiModal}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Pilih Sesi Les / Siswa</label>
            <select
              className="form-select"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              required
            >
              <option value="">-- Pilih Sesi Pertemuan Hari Ini --</option>
              {schedules.map(s => (
                <option key={s.id} value={s.id}>
                  {s.siswa.nama} — {s.mapel} ({s.waktu})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status Kehadiran</label>
            <div className="status-radio-group">
              {[
                { val: 'Hadir', color: 'var(--success)' },
                { val: 'Izin', color: 'var(--warning)' },
                { val: 'Sakit', color: 'var(--info)' },
                { val: 'Alpha', color: 'var(--danger)' }
              ].map(opt => (
                <label
                  key={opt.val}
                  className={`status-radio-label ${status === opt.val ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.val}
                    checked={status === opt.val}
                    onChange={() => setStatus(opt.val)}
                  />
                  <span style={{ color: opt.color }}>{opt.val}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Materi / Catatan Belajar</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Menyelesaikan latihan soal Bab 4, siswa sangat antusias dan memahami materi dengan baik."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={closePresensiModal}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Simpan Presensi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
