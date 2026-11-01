export interface Student {
  id?: string;
  nama: string;
  avatar: string;
  kelas: string;
  jenjang?: string;
  paket?: string;
  telepon?: string;
}

export interface Tutor {
  id: string;
  nama: string;
  mapel: string;
  avatar: string;
  jamMengajar: number;
  rating: number;
  totalSesi: number;
  feeEstimasi: string;
  badge: string;
}

export interface ScheduleItem {
  id: string;
  waktu: string;
  mapel: string;
  jenjang: string;
  siswa: Student;
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
