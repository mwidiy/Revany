'use client';

import React, { createContext, useContext, useState } from 'react';
import { KpiData, ScheduleItem, Tutor, ActivityItem, ToastNotification, Student } from '@/types';
import { initialKpi, initialSchedules, initialTutors, initialActivities } from '@/lib/initialData';

interface AppContextType {
  kpi: KpiData;
  schedules: ScheduleItem[];
  tutors: Tutor[];
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
  // Actions
  recordPresensi: (scheduleId: string, status: string, notes: string) => void;
  addNewSchedule: (scheduleData: { namaSiswa: string; tentor: string; mapel: string; waktu: string; metode: string }) => void;
  addNewStudent: (studentData: { nama: string; jenjang: string; kelas: string; telepon: string; paket: string }) => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'danger' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kpi, setKpi] = useState<KpiData>(initialKpi);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [tutors] = useState<Tutor[]>(initialTutors);
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

    setSchedules(prev => prev.map(item => {
      if (item.id === scheduleId) {
        return {
          ...item,
          presensiStatus: status,
          status: 'completed' as const
        };
      }
      return item;
    }));

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

  const addNewStudent = (data: { nama: string; jenjang: string; kelas: string; telepon: string; paket: string }) => {
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
        deskripsi: `${data.nama} (${data.jenjang}) terdaftar dalam ${data.paket}`,
        icon: 'UserPlus',
        color: 'blue'
      },
      ...prev
    ]);

    closeSiswaModal();
    showToast(`Siswa baru ${data.nama} berhasil didaftarkan! 🎓`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        kpi,
        schedules,
        tutors,
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
        recordPresensi,
        addNewSchedule,
        addNewStudent,
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
