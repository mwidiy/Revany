'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { KpiData, ScheduleItem, Tutor, ActivityItem, ToastNotification, Student } from '@/types';
import { initialKpi, initialSchedules, initialActivities } from '@/lib/initialData';
import { tentorService } from '@/services/tentorService';
import { studentService } from '@/services/studentService';

interface AppContextType {
  kpi: KpiData;
  schedules: ScheduleItem[];
  tutors: Tutor[];
  students: Student[];
  isLoadingTentors: boolean;
  isLoadingStudents: boolean;
  activities: ActivityItem[];
  toasts: ToastNotification[];
  scheduleFilter: 'all' | 'ongoing' | 'upcoming';
  setScheduleFilter: (filter: 'all' | 'ongoing' | 'upcoming') => void;
  chartPeriod: 'week' | 'month' | 'semester';
  setChartPeriod: (period: 'week' | 'month' | 'semester') => void;
  // Modal states
  isPresensiModalOpen: boolean;
  presensiSelectedScheduleId: string | null;
  openPresensiModal: (scheduleId?: string) => void;
  closePresensiModal: () => void;
  isJadwalModalOpen: boolean;
  openJadwalModal: () => void;
  closeJadwalModal: () => void;
  isSiswaModalOpen: boolean;
  openSiswaModal: () => void;
  closeSiswaModal: () => void;
  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  // Live Database Actions for Tentors
  refreshTentors: () => Promise<void>;
  addNewTentor: (tentorData: Omit<Tutor, 'id' | 'created_at' | 'updated_at'>) => Promise<Tutor>;
  updateTentor: (id: string, updates: Partial<Tutor>) => Promise<Tutor>;
  deleteTentor: (id: string) => Promise<boolean>;
  // Live Database Actions for Students
  refreshStudents: () => Promise<void>;
  addNewStudent: (studentData: {
    nama: string;
    jenjang: 'SD' | 'SMP' | 'SMA' | 'UTBK / Kedinasan';
    kelas: string;
    telepon: string;
    paket: string;
    sekolah?: string;
    alamat?: string;
    catatan?: string;
  }) => Promise<Student>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<Student>;
  deleteStudent: (id: string) => Promise<boolean>;
  adjustStudentSessions: (id: string, delta: number) => Promise<Student>;
  // Other Actions
  recordPresensi: (scheduleId: string, status: string, notes: string) => void;
  addNewSchedule: (scheduleData: { namaSiswa: string; tentor: string; mapel: string; waktu: string; metode: string }) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'danger' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kpi, setKpi] = useState<KpiData>(initialKpi);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingTentors, setIsLoadingTentors] = useState<boolean>(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(true);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'semester'>('week');

  // Modals
  const [isPresensiModalOpen, setIsPresensiModalOpen] = useState(false);
  const [presensiSelectedScheduleId, setPresensiSelectedScheduleId] = useState<string | null>(null);
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastNotification = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Tentors from Supabase
  const refreshTentors = async () => {
    setIsLoadingTentors(true);
    try {
      const data = await tentorService.getAll();
      setTutors(data);
      // Update KPI Tentor Count
      setKpi(prev => ({
        ...prev,
        tentorAktif: {
          ...prev.tentorAktif,
          total: data.length,
          dutyToday: data.filter(t => t.status === 'aktif').length
        }
      }));
    } catch (err: any) {
      showToast('Gagal memuat data tentor: ' + err.message, 'danger');
    } finally {
      setIsLoadingTentors(false);
    }
  };

  // Fetch Students
  const refreshStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
      // Update KPI Siswa Count
      setKpi(prev => ({
        ...prev,
        siswaAktif: {
          ...prev.siswaAktif,
          total: data.length,
          reguler: data.filter(s => s.paket?.includes('Reguler')).length,
          intensif: data.filter(s => s.paket?.includes('Intensif') || s.paket?.includes('Eksklusif')).length
        }
      }));
    } catch (err: any) {
      showToast('Gagal memuat data siswa: ' + err.message, 'danger');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Initial Data Fetch on Mount
  useEffect(() => {
    refreshTentors();
    refreshStudents();
  }, []);

  // Tentor Actions
  const addNewTentor = async (data: Omit<Tutor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await tentorService.create(data);
      setTutors(prev => [created, ...prev]);
      setKpi(prev => ({
        ...prev,
        tentorAktif: {
          ...prev.tentorAktif,
          total: prev.tentorAktif.total + 1
        }
      }));
      setActivities(prev => [
        {
          id: `ACT-${Date.now()}`,
          waktu: 'Baru saja',
          tipe: 'fee',
          judul: 'Tentor Baru Ditambahkan',
          deskripsi: `${created.nama} (${created.mapel}) berhasil didaftarkan ke sistem`,
          icon: 'UserPlus',
          color: 'indigo'
        },
        ...prev
      ]);
      showToast(`Tentor ${created.nama} berhasil ditambahkan ke database! 🎉`, 'success');
      return created;
    } catch (err: any) {
      showToast('Gagal menambahkan tentor: ' + err.message, 'danger');
      throw err;
    }
  };

  const updateTentor = async (id: string, updates: Partial<Tutor>) => {
    try {
      const updated = await tentorService.update(id, updates);
      setTutors(prev => prev.map(t => (t.id === id ? updated : t)));
      showToast(`Data ${updated.nama} berhasil diperbarui! ✅`, 'success');
      return updated;
    } catch (err: any) {
      showToast('Gagal memperbarui tentor: ' + err.message, 'danger');
      throw err;
    }
  };

  const deleteTentor = async (id: string) => {
    try {
      const target = tutors.find(t => t.id === id);
      await tentorService.delete(id);
      setTutors(prev => prev.filter(t => t.id !== id));
      setKpi(prev => ({
        ...prev,
        tentorAktif: {
          ...prev.tentorAktif,
          total: Math.max(0, prev.tentorAktif.total - 1)
        }
      }));
      showToast(`Tentor ${target?.nama || ''} berhasil dihapus dari database!`, 'info');
      return true;
    } catch (err: any) {
      showToast('Gagal menghapus tentor: ' + err.message, 'danger');
      throw err;
    }
  };

  // Student Actions
  const addNewStudent = async (data: {
    nama: string;
    jenjang: 'SD' | 'SMP' | 'SMA' | 'UTBK / Kedinasan';
    kelas: string;
    telepon: string;
    paket: string;
    sekolah?: string;
    alamat?: string;
    catatan?: string;
  }) => {
    try {
      const created = await studentService.create({
        nama: data.nama,
        jenjang: data.jenjang,
        kelas: data.kelas,
        telepon: data.telepon,
        paket: data.paket,
        sekolah: data.sekolah || 'Sekolah Terdaftar',
        alamat: data.alamat || '',
        catatan: data.catatan || '',
        avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
        sisa_sesi: data.paket.includes('16') ? 16 : data.paket.includes('12') ? 12 : 8,
        total_sesi_paket: data.paket.includes('16') ? 16 : data.paket.includes('12') ? 12 : 8,
        status: 'aktif'
      });

      setStudents(prev => [created, ...prev]);
      setKpi(prev => ({
        ...prev,
        siswaAktif: {
          ...prev.siswaAktif,
          total: prev.siswaAktif.total + 1
        }
      }));

      setActivities(prev => [
        {
          id: `ACT-${Date.now()}`,
          waktu: 'Baru saja',
          tipe: 'siswa',
          judul: 'Pendaftaran Siswa Baru',
          deskripsi: `${created.nama} (${created.jenjang}) terdaftar dalam ${created.paket}`,
          icon: 'UserPlus',
          color: 'blue'
        },
        ...prev
      ]);

      closeSiswaModal();
      showToast(`Siswa baru ${created.nama} berhasil ditambahkan! 🎓`, 'success');
      return created;
    } catch (err: any) {
      showToast('Gagal mendaftarkan siswa: ' + err.message, 'danger');
      throw err;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updated = await studentService.update(id, updates);
      setStudents(prev => prev.map(s => (s.id === id ? updated : s)));
      showToast(`Data siswa ${updated.nama} berhasil diperbarui! ✅`, 'success');
      return updated;
    } catch (err: any) {
      showToast('Gagal memperbarui data siswa: ' + err.message, 'danger');
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const target = students.find(s => s.id === id);
      await studentService.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      setKpi(prev => ({
        ...prev,
        siswaAktif: {
          ...prev.siswaAktif,
          total: Math.max(0, prev.siswaAktif.total - 1)
        }
      }));
      showToast(`Siswa ${target?.nama || ''} berhasil dihapus dari database!`, 'info');
      return true;
    } catch (err: any) {
      showToast('Gagal menghapus siswa: ' + err.message, 'danger');
      throw err;
    }
  };

  const adjustStudentSessions = async (id: string, delta: number) => {
    try {
      const updated = await studentService.adjustSessions(id, delta);
      setStudents(prev => prev.map(s => (s.id === id ? updated : s)));
      showToast(`Sisa sesi ${updated.nama}: ${updated.sisa_sesi} pertemuan`, 'success');
      return updated;
    } catch (err: any) {
      showToast('Gagal mengubah sesi siswa: ' + err.message, 'danger');
      throw err;
    }
  };

  // Modals Controller
  const openPresensiModal = (scheduleId?: string) => {
    setPresensiSelectedScheduleId(scheduleId || null);
    setIsPresensiModalOpen(true);
  };

  const closePresensiModal = () => {
    setIsPresensiModalOpen(false);
    setPresensiSelectedScheduleId(null);
  };

  const openJadwalModal = () => setIsJadwalModalOpen(true);
  const closeJadwalModal = () => setIsJadwalModalOpen(false);

  const openSiswaModal = () => setIsSiswaModalOpen(true);
  const closeSiswaModal = () => setIsSiswaModalOpen(false);

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  const recordPresensi = (scheduleId: string, status: string, notes: string) => {
    const target = schedules.find(s => s.id === scheduleId);
    const studentName = target ? target.siswa.nama : 'Siswa';

    setSchedules(prev =>
      prev.map(item => {
        if (item.id === scheduleId) {
          return {
            ...item,
            presensiStatus: status,
            status: 'completed' as const
          };
        }
        return item;
      })
    );

    setActivities(prev => [
      {
        id: `ACT-${Date.now()}`,
        waktu: 'Baru saja',
        tipe: 'presensi',
        judul: `Presensi Terverifikasi (${status})`,
        deskripsi: `Admin mencatat presensi untuk ${studentName} (${target?.mapel || 'Sesi Les'})`,
        icon: 'CheckCircle',
        color: status === 'Hadir' ? 'emerald' : status === 'Alpha' ? 'rose' : 'amber'
      },
      ...prev
    ]);

    closePresensiModal();
    showToast(`Presensi berhasil dicatat untuk ${studentName} (${status})! 🎉`, 'success');
  };

  const addNewSchedule = (data: { namaSiswa: string; tentor: string; mapel: string; waktu: string; metode: string }) => {
    const newId = `SCH-${String(schedules.length + 1).padStart(3, '0')}`;
    const newSchedule: ScheduleItem = {
      id: newId,
      waktu: data.waktu,
      mapel: data.mapel,
      jenjang: 'Siswa Terdaftar',
      siswa: {
        nama: data.namaSiswa,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        kelas: 'Kelas Reguler'
      },
      tentor: {
        nama: data.tentor,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      metode: data.metode,
      status: 'upcoming',
      presensiStatus: 'Belum Dimulai',
      ruangan: data.metode.includes('Online') ? 'Online Room' : 'Rumah Siswa'
    };

    setSchedules(prev => [newSchedule, ...prev]);

    setActivities(prev => [
      {
        id: `ACT-${Date.now()}`,
        waktu: 'Baru saja',
        tipe: 'jadwal',
        judul: 'Jadwal Baru Ditambahkan',
        deskripsi: `Sesi ${data.mapel} dijadwalkan untuk ${data.namaSiswa} bersama ${data.tentor.split(',')[0]}`,
        icon: 'Calendar',
        color: 'indigo'
      },
      ...prev
    ]);

    closeJadwalModal();
    showToast(`Jadwal les baru untuk ${data.namaSiswa} berhasil dibuat! 📅`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        kpi,
        schedules,
        tutors,
        students,
        isLoadingTentors,
        isLoadingStudents,
        activities,
        toasts,
        scheduleFilter,
        setScheduleFilter,
        chartPeriod,
        setChartPeriod,
        isPresensiModalOpen,
        presensiSelectedScheduleId,
        openPresensiModal,
        closePresensiModal,
        isJadwalModalOpen,
        openJadwalModal,
        closeJadwalModal,
        isSiswaModalOpen,
        openSiswaModal,
        closeSiswaModal,
        isSearchModalOpen,
        openSearchModal,
        closeSearchModal,
        isMobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        refreshTentors,
        addNewTentor,
        updateTentor,
        deleteTentor,
        refreshStudents,
        addNewStudent,
        updateStudent,
        deleteStudent,
        adjustStudentSessions,
        recordPresensi,
        addNewSchedule,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
