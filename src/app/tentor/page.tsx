'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Tutor } from '@/types';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  BookOpen,
  DollarSign,
  Phone,
  Mail,
  Edit2,
  Trash2,
  RefreshCw,
  CreditCard,
  X,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function TentorPage() {
  const { tutors, isLoadingTentors, refreshTentors, addNewTentor, updateTentor, deleteTentor } = useApp();

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'cuti' | 'nonaktif'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'jam' | 'nama'>('rating');

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
    badge: 'Tutor',
    rekening_bank: '',
    avatar: ''
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
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'jam') return (b.jam_mengajar || 0) - (a.jam_mengajar || 0);
        return a.nama.localeCompare(b.nama);
      });
  }, [tutors, searchQuery, statusFilter, sortBy]);

  // Stats calculation
  const totalTentors = tutors.length;
  const activeTentors = tutors.filter(t => t.status === 'aktif').length;
  const avgRating = totalTentors > 0
    ? (tutors.reduce((acc, t) => acc + (t.rating || 5), 0) / totalTentors).toFixed(2)
    : '5.00';
  const totalTeachingHours = tutors.reduce((acc, t) => acc + (t.jam_mengajar || 0), 0);

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
      badge: 'Tutor',
      rekening_bank: '',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`
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
      badge: tentor.badge || 'Tutor',
      rekening_bank: tentor.rekening_bank || '',
      avatar: tentor.avatar || ''
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
          badge: formData.badge,
          rekening_bank: formData.rekening_bank,
          avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          jam_mengajar: 0,
          total_sesi: 0,
          rating: 5.0
        });
      } else if (selectedTentor) {
        await updateTentor(selectedTentor.id, {
          nama: formData.nama,
          email: formData.email,
          telepon: formData.telepon,
          mapel: formData.mapel,
          fee_per_jam: Number(formData.fee_per_jam),
          status: formData.status,
          badge: formData.badge,
          rekening_bank: formData.rekening_bank,
          avatar: formData.avatar
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error handled in context toast
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <GraduationCap size={14} />
              Database Supabase Live
            </span>
          </div>
          <h2>Manajemen Data Tentor</h2>
          <p>Kelola data profil tenaga pengajar, mata pelajaran yang diampu, jam terbang, dan honor per jam.</p>
        </div>

        <div className="hero-actions">
          <button
            className="btn btn-secondary"
            onClick={() => refreshTentors()}
            title="Refresh Data dari Supabase"
          >
            <RefreshCw size={15} className={isLoadingTentors ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>+ Tambah Tentor</span>
          </button>
        </div>
      </section>

      {/* 2. Top Stats Overview Grid */}
      <section className="kpi-grid">
        <div className="kpi-card" style={{ padding: '18px 20px' }}>
          <div className="kpi-header" style={{ marginBottom: 8 }}>
            <span className="kpi-title">Total Tentor</span>
            <div className="kpi-icon-wrap kpi-icon-indigo" style={{ width: 36, height: 36 }}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ fontSize: 26 }}>{totalTentors}</span>
            <span className="kpi-trend trend-up">Terdaftar</span>
          </div>
          <p className="kpi-subtext">Data tersimpan di PostgreSQL Supabase</p>
        </div>

        <div className="kpi-card" style={{ padding: '18px 20px' }}>
          <div className="kpi-header" style={{ marginBottom: 8 }}>
            <span className="kpi-title">Tentor Aktif</span>
            <div className="kpi-icon-wrap kpi-icon-emerald" style={{ width: 36, height: 36 }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ fontSize: 26 }}>{activeTentors}</span>
            <span className="kpi-trend trend-up">Siaga Mengajar</span>
          </div>
          <p className="kpi-subtext">{totalTentors - activeTentors} Cuti / Nonaktif</p>
        </div>

        <div className="kpi-card" style={{ padding: '18px 20px' }}>
          <div className="kpi-header" style={{ marginBottom: 8 }}>
            <span className="kpi-title">Rata-rata Rating</span>
            <div className="kpi-icon-wrap kpi-icon-amber" style={{ width: 36, height: 36 }}>
              <Star size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ fontSize: 26 }}>★ {avgRating}</span>
            <span className="kpi-trend trend-up">Sangat Baik</span>
          </div>
          <p className="kpi-subtext">Evaluasi kepuasan siswa & wali</p>
        </div>

        <div className="kpi-card" style={{ padding: '18px 20px' }}>
          <div className="kpi-header" style={{ marginBottom: 8 }}>
            <span className="kpi-title">Total Jam Terbang</span>
            <div className="kpi-icon-wrap kpi-icon-blue" style={{ width: 36, height: 36 }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ fontSize: 26 }}>{totalTeachingHours} Jam</span>
            <span className="kpi-trend trend-up">Akumulasi</span>
          </div>
          <p className="kpi-subtext">Total jam mengajar seluruh tentor</p>
        </div>
      </section>

      {/* 3. Action Bar: Search, Filters, Sorting */}
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
              <option value="rating">Rating Tertinggi</option>
              <option value="jam">Jam Mengajar Terbanyak</option>
              <option value="nama">Nama (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. Tutors Grid Cards */}
      <section>
        {isLoadingTentors ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
            <p style={{ fontWeight: 600 }}>Memuat data tentor dari Supabase...</p>
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tentor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={tentor.nama}
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 'var(--radius-full)',
                              objectFit: 'cover',
                              border: '2px solid var(--border-subtle)'
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
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
                              fontWeight: 700,
                              color: 'var(--primary)',
                              background: 'var(--primary-light)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              marginTop: 4
                            }}
                          >
                            {tentor.badge || 'Tutor Revani'}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--warning)',
                            fontWeight: 700,
                            fontSize: 13
                          }}
                        >
                          <Star size={14} fill="currentColor" />
                          <span>{tentor.rating || 5.0}</span>
                        </div>
                      </div>
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
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 12,
                      marginTop: 4
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isAktif ? 'var(--success-light)' : isCuti ? 'var(--warning-light)' : 'var(--danger-light)',
                        color: isAktif ? 'var(--success)' : isCuti ? 'var(--warning)' : 'var(--danger)'
                      }}
                    >
                      Status: {tentor.status || 'aktif'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: 12 }}
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==============================================================================
          MODAL: TAMBAH / EDIT TENTOR (SUPABASE LIVE)
          ============================================================================== */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="kpi-icon-wrap kpi-icon-indigo" style={{ width: 36, height: 36 }}>
                  <GraduationCap size={18} />
                </div>
                <h3>{modalMode === 'add' ? 'Tambah Tentor Baru' : 'Edit Profil Tentor'}</h3>
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
                  placeholder="Contoh: Kak Dimas Arya, S.Si"
                  required
                />
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
                  <label className="form-label">Badge Prestasi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Top Performer / Favorite Tutor"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">No. Rekening Bank (Untuk Pembayaran Fee)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.rekening_bank}
                  onChange={e => setFormData({ ...formData, rekening_bank: e.target.value })}
                  placeholder="BCA 8271928172 a.n Dimas Arya"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Foto Profil Avatar</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.avatar}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                />
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
                  <span>{isSubmitting ? 'Menyimpan ke Supabase...' : modalMode === 'add' ? 'Simpan Tentor' : 'Perbarui Tentor'}</span>
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
                Apakah Anda yakin ingin menghapus <strong>{deleteTarget.nama}</strong> dari database Supabase? Tindakan ini tidak dapat dibatalkan.
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
