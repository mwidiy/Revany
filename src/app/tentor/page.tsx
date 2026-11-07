'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Tutor } from '@/types';
import {
  GraduationCap,
  Plus,
  Search,
  Clock,
  Phone,
  Mail,
  Edit2,
  Trash2,
  RefreshCw,
  CreditCard,
  X,
  Save,
  AlertCircle,
  User,
  UserCheck
} from 'lucide-react';

// ==============================================================================
// GENDER AVATAR PLACEHOLDER (COWOK / CEWEK)
// ==============================================================================
function TutorGenderAvatar({
  gender,
  size = 52
}: {
  gender?: 'L' | 'P' | string | null;
  size?: number;
}) {
  const isFemale = gender === 'P' || gender === 'Perempuan';

  if (isFemale) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
          border: '2px solid #f472b6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#db2777',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(219, 39, 119, 0.15)'
        }}
        title="Tentor Putri (Perempuan)"
      >
        <svg
          width={size * 0.58}
          height={size * 0.58}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Female Silhouette / Hijab / Soft Hair Contour */}
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
          <path d="M8 8c0 2 1.5 3.5 4 3.5s4-1.5 4-3.5" />
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
        border: '2px solid #60a5fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#2563eb',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
      }}
      title="Tentor Putra (Laki-laki)"
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Male Silhouette with Collar */}
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
        <path d="M9 13.5l3 3.5 3-3.5" />
      </svg>
    </div>
  );
}

export default function TentorPage() {
  const { tutors, isLoadingTentors, refreshTentors, addNewTentor, updateTentor, deleteTentor } = useApp();

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'cuti' | 'nonaktif'>('all');
  const [sortBy, setSortBy] = useState<'nama' | 'jam' | 'fee'>('nama');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedTentor, setSelectedTentor] = useState<Tutor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    mapel: '',
    fee_per_jam: 80000,
    status: 'aktif',
    jenis_kelamin: 'L' as 'L' | 'P',
    rekening_bank: ''
  });

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<Tutor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered and Sorted Tutors
  const filteredTutors = useMemo(() => {
    return tutors
      .filter(t => {
        const matchesSearch =
          t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.telepon && t.telepon.includes(searchQuery));
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'jam') return (b.jam_mengajar || 0) - (a.jam_mengajar || 0);
        if (sortBy === 'fee') return (b.fee_per_jam || 0) - (a.fee_per_jam || 0);
        return a.nama.localeCompare(b.nama);
      });
  }, [tutors, searchQuery, statusFilter, sortBy]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedTentor(null);
    setFormData({
      nama: '',
      email: '',
      telepon: '',
      mapel: '',
      fee_per_jam: 80000,
      status: 'aktif',
      jenis_kelamin: 'L',
      rekening_bank: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tentor: Tutor) => {
    setModalMode('edit');
    setSelectedTentor(tentor);
    setFormData({
      nama: tentor.nama,
      email: tentor.email || '',
      telepon: tentor.telepon || '',
      mapel: tentor.mapel,
      fee_per_jam: tentor.fee_per_jam || 80000,
      status: tentor.status || 'aktif',
      jenis_kelamin: (tentor.jenis_kelamin === 'P' ? 'P' : 'L') as 'L' | 'P',
      rekening_bank: tentor.rekening_bank || ''
    });
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.mapel) return;

    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        await addNewTentor({
          nama: formData.nama,
          email: formData.email,
          telepon: formData.telepon,
          mapel: formData.mapel,
          fee_per_jam: Number(formData.fee_per_jam),
          status: formData.status,
          jenis_kelamin: formData.jenis_kelamin,
          rekening_bank: formData.rekening_bank,
          avatar: null,
          jam_mengajar: 0,
          total_sesi: 0
        });
      } else if (selectedTentor) {
        await updateTentor(selectedTentor.id, {
          nama: formData.nama,
          email: formData.email,
          telepon: formData.telepon,
          mapel: formData.mapel,
          fee_per_jam: Number(formData.fee_per_jam),
          status: formData.status,
          jenis_kelamin: formData.jenis_kelamin,
          rekening_bank: formData.rekening_bank
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      // Handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTentor(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="content-area">
      {/* 1. Header Page */}
      <section className="hero-banner" style={{ padding: '24px 28px' }}>
        <div className="hero-text">
          <h2>Manajemen Data Tentor</h2>
          <p>Kelola data profil tenaga pengajar, penugasan mata pelajaran, jadwal, dan tarif honor per jam.</p>
        </div>

        <div className="hero-actions">
          <button
            className="btn btn-secondary"
            onClick={() => refreshTentors()}
            title="Perbarui Data Pengajar"
          >
            <RefreshCw size={15} className={isLoadingTentors ? 'animate-spin' : ''} />
            <span>Perbarui Data</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>+ Tambah Tentor</span>
          </button>
        </div>
      </section>

      {/* 2. Action Bar: Search, Filters, Sorting */}
      <section
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama tentor, mapel, atau nomor WA..."
              style={{ paddingLeft: 36, height: 40 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div className="filter-pills">
            {(['all', 'aktif', 'cuti', 'nonaktif'] as const).map(st => (
              <button
                key={st}
                className={`filter-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'all' ? 'Semua' : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Urutkan:</span>
            <select
              className="form-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{ width: 'auto', padding: '6px 12px', height: 36, fontSize: 12 }}
            >
              <option value="nama">Nama (A-Z)</option>
              <option value="jam">Jam Mengajar Terbanyak</option>
              <option value="fee">Tarif Fee Tertinggi</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Tutors Grid Cards */}
      <section>
        {isLoadingTentors ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
            <p style={{ fontWeight: 600 }}>Memuat data pengajar...</p>
          </div>
        ) : filteredTutors.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}
          >
            <GraduationCap size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: 16, color: 'var(--text-main)', marginBottom: 4 }}>
              Tidak ada data tentor yang cocok
            </h3>
            <p style={{ fontSize: 13, marginBottom: 16 }}>
              Coba sesuaikan kata kunci pencarian atau ubah filter status di atas.
            </p>
            <button className="btn btn-primary" onClick={handleOpenAdd} style={{ margin: '0 auto' }}>
              <Plus size={15} />
              <span>Tambah Tentor Sekarang</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 20
            }}
          >
            {filteredTutors.map(tentor => {
              const isAktif = tentor.status === 'aktif';
              const isCuti = tentor.status === 'cuti';
              const isFemale = tentor.jenis_kelamin === 'P';

              return (
                <div
                  key={tentor.id}
                  className="card"
                  style={{
                    padding: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 16,
                    position: 'relative',
                    transition: 'all 0.2s',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {/* Card Header */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ position: 'relative' }}>
                          <TutorGenderAvatar gender={tentor.jenis_kelamin} size={52} />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 1,
                              right: 1,
                              width: 12,
                              height: 12,
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: isAktif ? 'var(--success)' : isCuti ? 'var(--warning)' : 'var(--danger)',
                              border: '2px solid var(--bg-surface)'
                            }}
                            title={`Status: ${tentor.status}`}
                          />
                        </div>

                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                            {tentor.nama}
                          </h4>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: 11,
                              fontWeight: 600,
                              color: isFemale ? '#db2777' : 'var(--primary)',
                              marginTop: 2
                            }}
                          >
                            {isFemale ? 'Tentor Putri' : 'Tentor Putra'}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator pill */}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isAktif ? 'var(--success-light)' : isCuti ? 'var(--warning-light)' : 'var(--danger-light)',
                          color: isAktif ? 'var(--success)' : isCuti ? 'var(--warning)' : 'var(--danger)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {tentor.status || 'aktif'}
                      </span>
                    </div>

                    {/* Mata Pelajaran Tag */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                        MATA PELAJARAN:
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          background: 'var(--bg-surface-secondary)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          display: 'inline-block'
                        }}
                      >
                        {tentor.mapel}
                      </div>
                    </div>
                  </div>

                  {/* Body Metrics: Jam, Sesi, Tarif */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8,
                      background: 'var(--bg-surface-secondary)',
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Jam Ajar
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {tentor.jam_mengajar || 0} Jam
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Total Sesi
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {tentor.total_sesi || 0} Sesi
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Fee / Jam
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                        Rp {((tentor.fee_per_jam || 80000) / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>

                  {/* Contact & Bank Details */}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {tentor.telepon && (
                      <a
                        href={`https://wa.me/${tentor.telepon.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: 'var(--success)',
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        <Phone size={13} />
                        <span>{tentor.telepon} (WhatsApp)</span>
                      </a>
                    )}
                    {tentor.rekening_bank && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CreditCard size={13} style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tentor.rekening_bank}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 12,
                      marginTop: 4,
                      gap: 8
                    }}
                  >
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => handleOpenEdit(tentor)}
                      title="Edit Data Tentor"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="icon-btn"
                      style={{ width: 32, height: 32, color: 'var(--danger)' }}
                      onClick={() => setDeleteTarget(tentor)}
                      title="Hapus Tentor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==============================================================================
          MODAL: TAMBAH / EDIT TENTOR
          ============================================================================== */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="kpi-icon-wrap kpi-icon-indigo" style={{ width: 36, height: 36 }}>
                  <GraduationCap size={18} />
                </div>
                <h3>{modalMode === 'add' ? 'Tambah Data Tentor' : 'Edit Data Tentor'}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Dimas Arya, S.Si"
                  required
                />
              </div>

              {/* Jenis Kelamin Selector */}
              <div className="form-group">
                <label className="form-label">Jenis Kelamin *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, jenis_kelamin: 'L' })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: formData.jenis_kelamin === 'L' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: formData.jenis_kelamin === 'L' ? 'var(--primary-light)' : 'var(--bg-surface-secondary)',
                      color: formData.jenis_kelamin === 'L' ? 'var(--primary)' : 'var(--text-muted)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <User size={16} />
                    <span>Laki-laki (Putra)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, jenis_kelamin: 'P' })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: formData.jenis_kelamin === 'P' ? '2px solid #ec4899' : '1px solid var(--border-subtle)',
                      backgroundColor: formData.jenis_kelamin === 'P' ? 'rgba(236, 72, 153, 0.12)' : 'var(--bg-surface-secondary)',
                      color: formData.jenis_kelamin === 'P' ? '#db2777' : 'var(--text-muted)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <UserCheck size={16} />
                    <span>Perempuan (Putri)</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Mata Pelajaran Diampu *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.mapel}
                    onChange={e => setFormData({ ...formData, mapel: e.target.value })}
                    placeholder="Matematika & Fisika SMA"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tarif Fee per Jam (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.fee_per_jam}
                    onChange={e => setFormData({ ...formData, fee_per_jam: Number(e.target.value) })}
                    placeholder="85000"
                    step="5000"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">No. WhatsApp</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.telepon}
                    onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="0812-3456-7890"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@revani.edu"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Status Mengajar</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="aktif">Aktif Mengajar</option>
                    <option value="cuti">Cuti Sementara</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">No. Rekening Bank</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.rekening_bank}
                    onChange={e => setFormData({ ...formData, rekening_bank: e.target.value })}
                    placeholder="BCA 8271928172 a.n Dimas Arya"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <Save size={16} />
                  <span>{isSubmitting ? 'Menyimpan...' : modalMode === 'add' ? 'Simpan Data' : 'Perbarui Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          MODAL: KONFIRMASI HAPUS TENTOR
          ============================================================================== */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                className="kpi-icon-wrap"
                style={{
                  width: 52,
                  height: 52,
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  margin: '0 auto 16px'
                }}
              >
                <AlertCircle size={26} />
              </div>
              <h3 style={{ fontSize: 18, color: 'var(--text-main)', marginBottom: 8 }}>
                Hapus Data Tentor?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus <strong>{deleteTarget.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: 'var(--danger)', color: '#fff' }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
