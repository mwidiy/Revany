'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Student } from '@/types';
import {
  Users,
  Plus,
  Search,
  Filter,
  GraduationCap,
  School,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  X,
  Save,
  BookOpen
} from 'lucide-react';

export default function SiswaPage() {
  const {
    students,
    isLoadingStudents,
    refreshStudents,
    addNewStudent,
    updateStudent,
    deleteStudent,
    adjustStudentSessions
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nama' | 'sisa_asc' | 'sisa_desc'>('nama');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    jenjang: 'SD' as 'TK' | 'Prasekolah' | 'SD' | 'SMP' | 'SMA' | 'UTBK / Kedinasan',
    kelas: '',
    sekolah: '',
    telepon: '',
    alamat: '',
    paket: '',
    biaya: 750000,
    sisa_sesi: 8,
    total_sesi_paket: 8,
    status: 'aktif',
    catatan: '',
    avatar: ''
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch =
          s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.sekolah && s.sekolah.toLowerCase().includes(searchQuery.toLowerCase())) ||
          s.telepon.includes(searchQuery);
        const matchesJenjang = jenjangFilter === 'all' || s.jenjang === jenjangFilter;
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesJenjang && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'sisa_desc') return (b.sisa_sesi || 0) - (a.sisa_sesi || 0);
        if (sortBy === 'sisa_asc') return (a.sisa_sesi || 0) - (b.sisa_sesi || 0);
        return a.nama.localeCompare(b.nama);
      });
  }, [students, searchQuery, jenjangFilter, statusFilter, sortBy]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedStudent(null);
    setFormData({
      nama: '',
      jenjang: 'SD',
      kelas: '',
      sekolah: '',
      telepon: '',
      alamat: '',
      paket: '',
      biaya: 750000,
      sisa_sesi: 8,
      total_sesi_paket: 8,
      status: 'aktif',
      catatan: '',
      avatar: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student: Student) => {
    setModalMode('edit');
    setSelectedStudent(student);
    setFormData({
      nama: student.nama,
      jenjang: student.jenjang,
      kelas: student.kelas,
      sekolah: student.sekolah || '',
      telepon: student.telepon,
      alamat: student.alamat || '',
      paket: student.paket || '',
      biaya: student.biaya ?? 750000,
      sisa_sesi: student.sisa_sesi || 8,
      total_sesi_paket: student.total_sesi_paket || 8,
      status: student.status || 'aktif',
      catatan: student.catatan || '',
      avatar: student.avatar || ''
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.kelas || !formData.telepon) return;

    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        await addNewStudent({
          nama: formData.nama,
          jenjang: formData.jenjang,
          kelas: formData.kelas,
          telepon: formData.telepon,
          paket: formData.paket || 'Reguler',
          biaya: Number(formData.biaya || 0),
          sisa_sesi: Number(formData.sisa_sesi || 8),
          total_sesi_paket: Number(formData.total_sesi_paket || 8),
          sekolah: formData.sekolah,
          alamat: formData.alamat,
          catatan: formData.catatan
        });
      } else if (selectedStudent) {
        await updateStudent(selectedStudent.id, {
          nama: formData.nama,
          jenjang: formData.jenjang,
          kelas: formData.kelas,
          sekolah: formData.sekolah,
          telepon: formData.telepon,
          alamat: formData.alamat,
          paket: formData.paket,
          biaya: Number(formData.biaya || 0),
          sisa_sesi: Number(formData.sisa_sesi),
          total_sesi_paket: Number(formData.total_sesi_paket),
          status: formData.status,
          catatan: formData.catatan,
          avatar: formData.avatar
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getJenjangBadgeColor = (jenjang: string) => {
    switch (jenjang) {
      case 'TK':
        return { bg: 'rgba(236, 72, 153, 0.12)', color: '#db2777' };
      case 'Prasekolah':
        return { bg: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' };
      case 'SD':
        return { bg: 'var(--success-light)', color: 'var(--success)' };
      case 'SMP':
        return { bg: 'var(--info-light)', color: 'var(--info)' };
      case 'SMA':
        return { bg: 'var(--primary-light)', color: 'var(--primary)' };
      case 'UTBK / Kedinasan':
        return { bg: 'var(--warning-light)', color: 'var(--warning)' };
      default:
        return { bg: 'var(--bg-surface-secondary)', color: 'var(--text-main)' };
    }
  };

  return (
    <main className="content-area">
      {/* 1. Hero Header */}
      <section className="hero-banner" style={{ padding: '24px 28px' }}>
        <div className="hero-text">
          <h2>Manajemen Data Siswa</h2>
          <p>Pantau seluruh data siswa les aktif, jenjang sekolah, sisa sesi pertemuan, dan paket belajar.</p>
        </div>

        <div className="hero-actions">
          <button
            className="btn btn-secondary"
            onClick={() => refreshStudents()}
            title="Perbarui Data Siswa"
          >
            <RefreshCw size={15} className={isLoadingStudents ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>+ Tambah Siswa</span>
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
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, sekolah, kelas, atau nomor WA..."
              style={{ paddingLeft: 36, height: 40 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Jenjang Filter */}
          <div className="filter-pills">
            {['all', 'TK', 'Prasekolah', 'SD', 'SMP', 'SMA', 'UTBK / Kedinasan'].map(j => (
              <button
                key={j}
                className={`filter-btn ${jenjangFilter === j ? 'active' : ''}`}
                onClick={() => setJenjangFilter(j)}
              >
                {j === 'all' ? 'Semua Jenjang' : j}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', height: 36, fontSize: 12 }}
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="lulus">Lulus</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          {/* Sort Selector */}
          <select
            className="form-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{ width: 'auto', padding: '6px 12px', height: 36, fontSize: 12 }}
          >
            <option value="nama">Nama (A-Z)</option>
            <option value="sisa_asc">Sisa Sesi Tersedikit</option>
            <option value="sisa_desc">Sisa Sesi Terbanyak</option>
          </select>
        </div>
      </section>

      {/* 4. Students Table / Grid */}
      <section>
        {isLoadingStudents ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
            <p style={{ fontWeight: 600 }}>Memuat data siswa...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: 16, color: 'var(--text-main)', marginBottom: 4 }}>
              Tidak ada data siswa yang cocok
            </h3>
            <p style={{ fontSize: 13, marginBottom: 16 }}>
              Coba sesuaikan kata kunci pencarian atau ubah filter jenjang di atas.
            </p>
            <button className="btn btn-primary" onClick={handleOpenAdd} style={{ margin: '0 auto' }}>
              <Plus size={15} />
              <span>Daftarkan Siswa Sekarang</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredStudents.map(student => {
              const badgeStyle = getJenjangBadgeColor(student.jenjang);
              const sisa = student.sisa_sesi ?? 0;
              const total = student.total_sesi_paket ?? 8;
              const percent = Math.min(100, Math.round((sisa / total) * 100));
              const isLowSessions = sisa <= 2;

              return (
                <div
                  key={student.id}
                  className="card"
                  style={{
                    padding: '18px 22px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 18,
                    flexWrap: 'wrap',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Left: Student Identity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260, flex: 1.2 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                        border: '2px solid #818cf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4338ca',
                        fontWeight: 800,
                        fontSize: 16,
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(99, 102, 241, 0.15)'
                      }}
                      title={student.nama}
                    >
                      {student.nama ? student.nama.trim().charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                          {student.nama}
                        </h4>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: badgeStyle.bg,
                            color: badgeStyle.color
                          }}
                        >
                          {student.jenjang}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{student.kelas}</span>
                        {student.sekolah && <span>• {student.sekolah}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Mid 1: Package & Session Progress */}
                  <div style={{ minWidth: 200, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
                        {student.paket}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: isLowSessions ? 'var(--danger)' : 'var(--primary)'
                        }}
                      >
                        {sisa} / {total} Sesi
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        height: 6,
                        background: 'var(--bg-surface-secondary)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: isLowSessions
                            ? 'var(--danger)'
                            : 'var(--primary-gradient)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.3s'
                        }}
                      />
                    </div>

                    {/* Session Quick Adjust Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Sesi:</span>
                      <button
                        className="quick-action-link"
                        style={{ color: 'var(--danger)', fontSize: 11 }}
                        onClick={() => adjustStudentSessions(student.id, -1)}
                        title="Kurangi 1 Sesi (Selesai Les)"
                      >
                        <MinusCircle size={14} />
                        <span>-1</span>
                      </button>
                      <button
                        className="quick-action-link"
                        style={{ color: 'var(--success)', fontSize: 11 }}
                        onClick={() => adjustStudentSessions(student.id, 1)}
                        title="Tambah 1 Sesi"
                      >
                        <PlusCircle size={14} />
                        <span>+1</span>
                      </button>
                      {isLowSessions && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: 'var(--danger)',
                            background: 'var(--danger-light)',
                            padding: '1px 6px',
                            borderRadius: 4,
                            marginLeft: 4
                          }}
                        >
                          ⚠️ Sisa Kritis
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mid 2: Biaya / Fee Siswa */}
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Biaya Les
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                      Rp {Number(student.biaya || 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div style={{ minWidth: 200, flex: 1, fontSize: 12 }}>
                    <a
                      href={`https://wa.me/${student.telepon.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--success)',
                        fontWeight: 700,
                        textDecoration: 'none',
                        marginBottom: 4
                      }}
                    >
                      <Phone size={13} />
                      <span>{student.telepon}</span>
                    </a>

                    <div style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: student.catatan ? 'normal' : 'italic' }}>
                      {student.catatan || 'Belum ada catatan target khusus.'}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '7px 12px', fontSize: 12 }}
                      onClick={() => handleOpenEdit(student)}
                      title="Edit Data Siswa"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="icon-btn"
                      style={{ width: 34, height: 34, color: 'var(--danger)' }}
                      onClick={() => setDeleteTarget(student)}
                      title="Hapus Siswa"
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
          MODAL: TAMBAH / EDIT SISWA (SUPABASE LIVE)
          ============================================================================== */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="kpi-icon-wrap kpi-icon-blue" style={{ width: 36, height: 36 }}>
                  <Users size={18} />
                </div>
                <h3>{modalMode === 'add' ? 'Pendaftaran Siswa Baru' : 'Edit Data Siswa'}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap siswa"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Jenjang Pendidikan *</label>
                  <select
                    className="form-select"
                    value={formData.jenjang}
                    onChange={e => setFormData({ ...formData, jenjang: e.target.value as any })}
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
                    value={formData.kelas}
                    onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder="Contoh: TK-B / SD 3 / XII MIPA"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Asal Sekolah</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sekolah}
                    onChange={e => setFormData({ ...formData, sekolah: e.target.value })}
                    placeholder="Contoh: TK Al-Azhar / SMAN 28"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">No. WhatsApp Orang Tua / Siswa *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.telepon}
                    onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="0812-XXXX-XXXX"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Paket Les (Input Bebas / Manual) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.paket}
                  onChange={e => setFormData({ ...formData, paket: e.target.value })}
                  placeholder="Contoh: Paket Calistung 8 Sesi, Reguler 12 Sesi, Privat Khusus UN"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Biaya / Fee Siswa (Rp) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.biaya}
                    onChange={e => setFormData({ ...formData, biaya: Number(e.target.value) })}
                    placeholder="Contoh: 750000"
                    step="10000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sisa Sesi Pertemuan</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.sisa_sesi}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setFormData({
                        ...formData,
                        sisa_sesi: val,
                        total_sesi_paket: Math.max(val, formData.total_sesi_paket)
                      });
                    }}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Rumah Siswa</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.alamat}
                  onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jl. Melati No. 14, Jagakarsa..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Target / Kebutuhan Khusus</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.catatan}
                  onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Contoh: Target lolos SNBT Kedokteran UI, perlu penguatan di kalkulus dan fisika dasar."
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
                  <span>
                    {isSubmitting
                      ? 'Menyimpan...'
                      : modalMode === 'add'
                      ? 'Daftarkan Siswa'
                      : 'Perbarui Siswa'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          MODAL: KONFIRMASI HAPUS SISWA
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
                Hapus Data Siswa?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus data <strong>{deleteTarget.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
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
