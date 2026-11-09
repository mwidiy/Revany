'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserPlus, X, Check } from 'lucide-react';

export default function SiswaModal() {
  const { isSiswaModalOpen, closeSiswaModal, addNewStudent } = useApp();
  const [nama, setNama] = useState('');
  const [jenjang, setJenjang] = useState<'TK' | 'Prasekolah' | 'SD' | 'SMP' | 'SMA' | 'UTBK / Kedinasan'>('SD');
  const [kelas, setKelas] = useState('');
  const [telepon, setTelepon] = useState('');
  const [paket, setPaket] = useState('');
  const [biaya, setBiaya] = useState<number>(750000);

  if (!isSiswaModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !kelas || !telepon) return;
    await addNewStudent({
      nama,
      jenjang,
      kelas,
      telepon,
      paket: paket || 'Reguler',
      biaya: Number(biaya || 0)
    });
    setNama('');
    setKelas('');
    setTelepon('');
    setPaket('');
    setBiaya(750000);
  };

  return (
    <div className="modal-backdrop" onClick={closeSiswaModal}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon-wrap kpi-icon-blue" style={{ width: 36, height: 36 }}>
              <UserPlus size={18} />
            </div>
            <h3>Tambah Siswa Baru</h3>
          </div>
          <button className="modal-close-btn" onClick={closeSiswaModal}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap Siswa *</label>
            <input
              type="text"
              className="form-input"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap siswa"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Jenjang Pendidikan *</label>
              <select
                className="form-select"
                value={jenjang}
                onChange={e => setJenjang(e.target.value as any)}
                required
              >
                <option value="TK">TK</option>
                <option value="Prasekolah">Prasekolah</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="UTBK / Kedinasan">UTBK / Kedinasan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Kelas *</label>
              <input
                type="text"
                className="form-input"
                value={kelas}
                onChange={e => setKelas(e.target.value)}
                placeholder="Contoh: TK-B / SD 2 / XII MIPA"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">No. WhatsApp Orang Tua / Siswa *</label>
            <input
              type="tel"
              className="form-input"
              value={telepon}
              onChange={e => setTelepon(e.target.value)}
              placeholder="0812-XXXX-XXXX"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Paket Les (Input Manual) *</label>
              <input
                type="text"
                className="form-input"
                value={paket}
                onChange={e => setPaket(e.target.value)}
                placeholder="Contoh: Calistung 8 Sesi / Reguler"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Biaya / Fee Siswa (Rp) *</label>
              <input
                type="number"
                className="form-input"
                value={biaya}
                onChange={e => setBiaya(Number(e.target.value))}
                placeholder="750000"
                step="10000"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={closeSiswaModal}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Daftarkan Siswa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
