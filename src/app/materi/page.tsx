'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { learningService } from '@/services/learningService';
import { LearningMaterial } from '@/types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Video,
  FileCode,
  ExternalLink,
  Copy,
  Trash2,
  RefreshCw,
  X,
  Sparkles,
  GraduationCap,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const JENJANG_OPTIONS = ['Semua', 'SD', 'SMP', 'SMA', 'UTBK / Kedinasan', 'TK / Prasekolah'];
const FORMAT_OPTIONS = [
  { label: 'Semua Format', value: 'all' },
  { label: 'PDF Modul', value: 'pdf' },
  { label: 'Video Belajar', value: 'video' },
  { label: 'Dokumen', value: 'doc' },
  { label: 'Link Drive', value: 'link' }
];

export default function MateriPage() {
  const { tutors, showToast } = useApp();

  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState('Semua');
  const [selectedFormat, setSelectedFormat] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LearningMaterial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    judul: '',
    mapel: 'Matematika',
    jenjang: 'SMP',
    tipe_file: 'pdf' as 'pdf' | 'video' | 'doc' | 'link',
    file_url: '',
    tentor_id: '',
    deskripsi: ''
  });

  // Load materials from Supabase
  const loadMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await learningService.getMaterials();
      setMaterials(data);
    } catch (err: any) {
      showToast('Gagal memuat materi: ' + (err?.message || 'Koneksi error'), 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const matchJenjang = selectedJenjang === 'Semua' || item.jenjang === selectedJenjang;
      const matchFormat = selectedFormat === 'all' || item.tipe_file === selectedFormat;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        item.mapel.toLowerCase().includes(q) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(q)) ||
        (item.tentor?.nama && item.tentor.nama.toLowerCase().includes(q));

      return matchJenjang && matchFormat && matchSearch;
    });
  }, [materials, selectedJenjang, selectedFormat, searchQuery]);

  // Handle Form Submit
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul.trim() || !formData.mapel.trim()) {
      showToast('Judul materi dan mata pelajaran wajib diisi', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newMat = await learningService.createMaterial({
        judul: formData.judul.trim(),
        mapel: formData.mapel.trim(),
        jenjang: formData.jenjang,
        tipe_file: formData.tipe_file,
        file_url: formData.file_url.trim() || 'https://drive.google.com',
        tentor_id: formData.tentor_id || undefined,
        deskripsi: formData.deskripsi.trim() || undefined
      });

      setMaterials(prev => [newMat, ...prev]);
      setIsModalOpen(false);
      setFormData({
        judul: '',
        mapel: 'Matematika',
        jenjang: 'SMP',
        tipe_file: 'pdf',
        file_url: '',
        tentor_id: '',
        deskripsi: ''
      });
      showToast(`Materi "${newMat.judul}" berhasil diunggah! 📚`, 'success');
    } catch (err: any) {
      showToast('Gagal menambahkan materi: ' + (err?.message || 'Error'), 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteMaterial = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await learningService.deleteMaterial(deleteTarget.id);
      setMaterials(prev => prev.filter(m => m.id !== deleteTarget.id));
      showToast(`Materi "${deleteTarget.judul}" berhasil dihapus`, 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('Gagal menghapus materi: ' + (err?.message || 'Error'), 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy Link helper
  const handleCopyLink = (url?: string | null) => {
    if (!url) {
      showToast('Tautan materi tidak tersedia', 'warning');
      return;
    }
    navigator.clipboard.writeText(url);
    showToast('Tautan materi berhasil disalin ke clipboard! 📋', 'success');
  };

  // Helper formatting icon
  const getFormatBadge = (tipe: string) => {
    switch (tipe) {
      case 'pdf':
        return {
          icon: <FileText size={14} />,
          text: 'PDF Modul',
          bg: 'rgba(239, 68, 68, 0.1)',
          color: '#EF4444',
          border: 'rgba(239, 68, 68, 0.25)'
        };
      case 'video':
        return {
          icon: <Video size={14} />,
          text: 'Video',
          bg: 'rgba(139, 92, 246, 0.1)',
          color: '#8B5CF6',
          border: 'rgba(139, 92, 246, 0.25)'
        };
      case 'doc':
        return {
          icon: <FileCode size={14} />,
          text: 'Dokumen',
          bg: 'rgba(59, 130, 246, 0.1)',
          color: '#3B82F6',
          border: 'rgba(59, 130, 246, 0.25)'
        };
      default:
        return {
          icon: <ExternalLink size={14} />,
          text: 'Link Drive',
          bg: 'rgba(16, 185, 129, 0.1)',
          color: '#10B981',
          border: 'rgba(16, 185, 129, 0.25)'
        };
    }
  };

  return (
    <div className="page-container" style={{ padding: '28px 32px' }}>
      {/* 1. Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOpen size={20} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Bank Materi & Modul Belajar
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)' }}>
            Koleksi handout, lembar latihan, ringkasan rumus, dan bahan ajar bimbel les privat Revani.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={loadMaterials}
            disabled={isLoading}
            className="secondary-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600
            }}
            title="Muat ulang data materi"
          >
            <RefreshCw size={15} className={isLoading ? 'spin-anim' : ''} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} />
            <span>+ Unggah Materi Baru</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Mini Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              color: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Total Modul Materi</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {materials.length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Dokumen PDF</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {materials.filter(m => m.tipe_file === 'pdf').length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Jenjang Aktif</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {new Set(materials.map(m => m.jenjang)).size} Jenjang
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Tentor Kontributor</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {tutors.length} Tentor
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Toolbar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Cari materi berdasarkan judul, mapel, atau topik..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-secondary)',
                color: 'var(--text-main)',
                fontSize: 13.5,
                outline: 'none'
              }}
            />
          </div>

          {/* Format Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedFormat}
              onChange={e => setSelectedFormat(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-secondary)',
                color: 'var(--text-main)',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {FORMAT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Jenjang Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>
            Jenjang:
          </span>
          {JENJANG_OPTIONS.map(jenjang => (
            <button
              key={jenjang}
              onClick={() => setSelectedJenjang(jenjang)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: selectedJenjang === jenjang ? '1px solid #6366F1' : '1px solid var(--border-subtle)',
                background: selectedJenjang === jenjang ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                color: selectedJenjang === jenjang ? '#6366F1' : 'var(--text-muted)',
                fontSize: 12.5,
                fontWeight: selectedJenjang === jenjang ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {jenjang}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Materials Card Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin-anim" style={{ margin: '0 auto 12px' }} />
          <div>Memuat bank materi pembelajaran...</div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '20px',
            padding: '60px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <BookOpen size={44} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: 14 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
            Tidak ada materi yang ditemukan
          </h3>
          <p style={{ fontSize: 13.5, maxWidth: 420, margin: '0 auto 18px', lineHeight: 1.5 }}>
            Tidak ada modul pembelajaran yang cocok dengan filter atau pencarian Anda saat ini.
          </p>
          <button
            onClick={() => {
              setSelectedJenjang('Semua');
              setSelectedFormat('all');
              setSearchQuery('');
            }}
            className="secondary-btn"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: 13, fontWeight: 600 }}
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20
          }}
        >
          {filteredMaterials.map(mat => {
            const badge = getFormatBadge(mat.tipe_file);
            return (
              <div
                key={mat.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '18px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontSize: 11.5,
                        fontWeight: 700
                      }}
                    >
                      {badge.icon}
                      <span>{badge.text}</span>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-secondary)',
                        color: 'var(--text-muted)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {mat.jenjang}
                    </span>
                  </div>

                  {/* Subject Tag */}
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#6366F1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 6
                    }}
                  >
                    {mat.mapel}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      lineHeight: 1.35,
                      marginBottom: 10
                    }}
                  >
                    {mat.judul}
                  </h3>

                  {/* Description */}
                  {mat.deskripsi && (
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        marginBottom: 16,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {mat.deskripsi}
                    </p>
                  )}
                </div>

                {/* Bottom Footer & Action Buttons */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, marginTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {mat.tentor?.nama ? mat.tentor.nama.charAt(0) : 'T'}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {mat.tentor?.nama || 'Tentor Revani'}
                      </span>
                    </div>

                    <button
                      onClick={() => setDeleteTarget(mat)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s'
                      }}
                      title="Hapus materi"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <a
                      href={mat.file_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '9px 12px',
                        borderRadius: '9px',
                        background: 'var(--bg-surface-secondary)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 12.5,
                        fontWeight: 700,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>Buka Modul</span>
                      <ExternalLink size={13} />
                    </a>

                    <button
                      onClick={() => handleCopyLink(mat.file_url)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '9px',
                        background: 'var(--bg-surface-secondary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 12.5,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Salin Tautan Materi"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal Tambah Materi Baru */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Unggah Materi / Modul Baru
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                    Bahan ajar akan langsung tersedia di bank materi & portal siswa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateMaterial}>
              {/* Judul Materi */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  Judul Materi / Handout <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ringkasan Rumus Eksponen & Logaritma SMA"
                  value={formData.judul}
                  onChange={e => setFormData({ ...formData, judul: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-secondary)',
                    color: 'var(--text-main)',
                    fontSize: 13.5,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Row Mapel & Jenjang */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Mata Pelajaran <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Matematika, Kimia, dll."
                    value={formData.mapel}
                    onChange={e => setFormData({ ...formData, mapel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Jenjang Sekolah
                  </label>
                  <select
                    value={formData.jenjang}
                    onChange={e => setFormData({ ...formData, jenjang: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="SD">SD (Sekolah Dasar)</option>
                    <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                    <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                    <option value="UTBK / Kedinasan">UTBK / Persiapan Kedinasan</option>
                    <option value="TK / Prasekolah">TK / Prasekolah</option>
                  </select>
                </div>
              </div>

              {/* Row Format & Tentor Pengampu */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Format Media
                  </label>
                  <select
                    value={formData.tipe_file}
                    onChange={e => setFormData({ ...formData, tipe_file: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="pdf">Dokumen PDF (Handout / Modul)</option>
                    <option value="link">Google Drive / Cloud Folder</option>
                    <option value="video">Video Pembelajaran (YouTube/Zoom)</option>
                    <option value="doc">Dokumen Word / Presentation</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                    Tentor Pengunggah
                  </label>
                  <select
                    value={formData.tentor_id}
                    onChange={e => setFormData({ ...formData, tentor_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Pusat Bimbel Revani Edu</option>
                    {tutors.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nama} ({t.mapel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* URL File / Link Dokumen */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  Tautan File / Google Drive / URL Media
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/... atau https://youtube.com/..."
                  value={formData.file_url}
                  onChange={e => setFormData({ ...formData, file_url: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-secondary)',
                    color: 'var(--text-main)',
                    fontSize: 13.5,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Deskripsi / Kisi-kisi */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  Deskripsi Singkat / Pokok Pembahasan
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan poin penting atau topik bab yang dibahas dalam modul ini..."
                  value={formData.deskripsi}
                  onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-secondary)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Hapus Materi Ini?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
              Materi <strong>"{deleteTarget.judul}"</strong> akan dihapus permanen dari bank modul pembelajaran.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteMaterial}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
