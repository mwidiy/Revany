export interface Student {
  id: string;
  nama: string;
  jenjang: 'SD' | 'SMP' | 'SMA' | 'UTBK / Kedinasan';
  kelas: string;
  sekolah?: string | null;
  telepon: string;
  alamat?: string | null;
  avatar?: string | null;
  paket?: string | null;
  sisa_sesi?: number | null;
  total_sesi_paket?: number | null;
  status?: 'aktif' | 'lulus' | 'nonaktif' | string | null;
  catatan?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Tutor {
  id: string;
  nama: string;
  email?: string | null;
  telepon?: string | null;
  mapel: string;
  avatar?: string | null;
  jam_mengajar?: number | null;
  rating?: number | null;
  total_sesi?: number | null;
  fee_per_jam?: number | null;
  status?: 'aktif' | 'cuti' | 'nonaktif' | string | null;
  badge?: string | null;
  rekening_bank?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ScheduleItem {
  id: string;
  waktu: string;
  mapel: string;
  jenjang: string;
  siswa: {
    nama: string;
    avatar: string;
    kelas: string;
  };
  tentor: {
    nama: string;
    avatar: string;
  };
  metode: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  presensiStatus: string;
  ruangan: string;
}

export interface ActivityItem {
  id: string;
  waktu: string;
  tipe: 'presensi' | 'laporan' | 'siswa' | 'fee' | 'jadwal';
  judul: string;
  deskripsi: string;
  icon: string;
  color: 'emerald' | 'indigo' | 'amber' | 'blue' | 'rose';
}

export interface KpiData {
  siswaAktif: {
    total: number;
    trend: string;
    isPositive: boolean;
    period: string;
    reguler: number;
    intensif: number;
  };
  tentorAktif: {
    total: number;
    dutyToday: number;
    trend: string;
    isPositive: boolean;
    period: string;
    rating: number;
  };
  sesiHariIni: {
    total: number;
    selesai: number;
    berlangsung: number;
    mendatang: number;
    kehadiranPersen: number;
  };
  keuangan: {
    estimasiOmzet: number;
    estimasiFeeTentor: number;
    marginPersen: number;
    trend: string;
    isPositive: boolean;
  };
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}
