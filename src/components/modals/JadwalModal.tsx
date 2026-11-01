'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CalendarPlus, X, Check } from 'lucide-react';

export default function JadwalModal() {
  const { isJadwalModalOpen, closeJadwalModal, addNewSchedule } = useApp();
  const [namaSiswa, setNamaSiswa] = useState('');
  const [tentor, setTentor] = useState('Kak Dimas Arya, S.Si');
  const [mapel, setMapel] = useState('');
  const [waktu, setWaktu] = useState('');
  const [metode, setMetode] = useState('Offline (Rumah Siswa)');

  if (!isJadwalModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswa || !mapel || !waktu) return;
    addNewSchedule({ namaSiswa, tentor, mapel, waktu, metode });
    setNamaSiswa('');
    setMapel('');
    setWaktu('');
  };

  return (
    <div className="modal-backdrop" onClick={closeJadwalModal}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon-wrap kpi-icon-indigo" style={{ width: 36, height: 36 }}>
              <CalendarPlus size={18} />
            </div>
            <h3>Buat Jadwal Les Baru</h3>
          </div>
          <button className="modal-close-btn" onClick={closeJadwalModal}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Siswa</label>
            <input
              type="text"
              className="form-input"
              value={namaSiswa}
              onChange={e => setNamaSiswa(e.target.value)}
              placeholder="Contoh: Farhan Pratama"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tentor Pengajar</label>
            <select
              className="form-select"
              value={tentor}
              onChange={e => setTentor(e.target.value)}
              required
            >
              <option value="Kak Dimas Arya, S.Si">Kak Dimas Arya, S.Si (Matematika & Fisika)</option>
              <option value="Kak Sarah Nurul, M.Pd">Kak Sarah Nurul, M.Pd (Kimia & Biologi)</option>
              <option value="Mr. Kevin Sanjaya, B.Ed">Mr. Kevin Sanjaya, B.Ed (Bahasa Inggris)</option>
              <option value="Kak Reza Pahlevi, S.Pd">Kak Reza Pahlevi, S.Pd (IPA SMP)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Mata Pelajaran</label>
              <input
                type="text"
                className="form-input"
                value={mapel}
                onChange={e => setMapel(e.target.value)}
                placeholder="Matematika SMA"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Waktu Sesi</label>
              <input
                type="text"
                className="form-input"
                value={waktu}
                onChange={e => setWaktu(e.target.value)}
                placeholder="16:00 - 17:30"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Metode Les</label>
            <select
              className="form-select"
              value={metode}
              onChange={e => setMetode(e.target.value)}
            >
              <option value="Offline (Rumah Siswa)">Offline (Rumah Siswa)</option>
              <option value="Offline (Revani Hub)">Offline (Revani Hub)</option>
              <option value="Online (Zoom Revani)">Online (Zoom Revani)</option>
              <option value="Online (Google Meet)">Online (Google Meet)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={closeJadwalModal}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Jadwalkan Sesi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
