// Data Mocking Realistis untuk Revani Tutoring Management System

const revaniData = {
  admin: {
    name: "Kak Admin",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    notificationsCount: 3
  },
  
  kpi: {
    siswaAktif: {
      total: 148,
      trend: "+12.5%",
      isPositive: true,
      period: "vs bulan lalu",
      sparkline: [20, 25, 22, 30, 28, 35, 42, 45, 50]
    },
    tentorAktif: {
      total: 24,
      dutyToday: 18,
      trend: "+2 Tentor Baru",
      isPositive: true,
      period: "bulan ini",
      sparkline: [12, 14, 15, 17, 18, 20, 22, 23, 24]
    },
    sesiHariIni: {
      total: 16,
      selesai: 10,
      berlangsung: 4,
      mendatang: 2,
      kehadiranPersen: 94.2
    },
    keuangan: {
      estimasiOmzet: 24850000,
      estimasiFeeTentor: 14200000,
      marginPersen: 42.8,
      trend: "+8.4%",
      isPositive: true
    }
  },

  jadwalHariIni: [
    {
      id: "SCH-001",
      waktu: "15:30 - 17:00",
      mapel: "Matematika Peminatan (Kalkulus)",
      jenjang: "SMA Kelas 12",
      siswa: {
        nama: "Farhan Pratama",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
        kelas: "XII MIPA 1"
      },
      tentor: {
        nama: "Kak Dimas Arya, S.Si",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
      },
      metode: "Offline (Rumah Siswa)",
      status: "ongoing", // ongoing | upcoming | completed
      presensiStatus: "Hadir",
      ruangan: "Jl. Melati No. 14, Jagakarsa"
    },
    {
      id: "SCH-002",
      waktu: "15:45 - 17:15",
      mapel: "Fisika Modern & Kuantum",
      jenjang: "SMA Kelas 12",
      siswa: {
        nama: "Alya Putri Ramadhani",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        kelas: "XII MIPA 3"
      },
      tentor: {
        nama: "Kak Sarah Nurul, M.Pd",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
      },
      metode: "Online (Zoom Revani #2)",
      status: "ongoing",
      presensiStatus: "Hadir",
      ruangan: "Zoom Room A"
    },
    {
      id: "SCH-003",
      waktu: "16:00 - 17:30",
      mapel: "Bahasa Inggris (TOEFL Prep)",
      jenjang: "Alumni / Kedinasan",
      siswa: {
        nama: "Bintang Kusuma",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        kelas: "Persiapan Akpol"
      },
      tentor: {
        nama: "Mr. Kevin Sanjaya, B.Ed",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80"
      },
      metode: "Offline (Ruang Diskusi Revani)",
      status: "ongoing",
      presensiStatus: "Hadir",
      ruangan: "Revani Hub Lt. 2"
    },
    {
      id: "SCH-004",
      waktu: "16:15 - 17:45",
      mapel: "IPA Terpadu (Sistem Pernapasan)",
      jenjang: "SMP Kelas 8",
      siswa: {
        nama: "Nayla Zahra Putri",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
        kelas: "VIII-B"
      },
      tentor: {
        nama: "Kak Reza Pahlevi, S.Pd",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80"
      },
      metode: "Offline (Rumah Siswa)",
      status: "ongoing",
      presensiStatus: "Menunggu",
      ruangan: "Perum Puri Indah Blok C2"
    },
    {
      id: "SCH-005",
      waktu: "18:30 - 20:00",
      mapel: "Kimia Organik (Senyawa Karbon)",
      jenjang: "SMA Kelas 11",
      siswa: {
        nama: "Syifa Azzahra",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
        kelas: "XI MIPA 2"
      },
      tentor: {
        nama: "Kak Sarah Nurul, M.Pd",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
      },
      metode: "Online (Google Meet)",
      status: "upcoming",
      presensiStatus: "Belum Dimulai",
      ruangan: "meet.google.com/rvn-chem"
    },
    {
      id: "SCH-006",
      waktu: "19:00 - 20:30",
      mapel: "TPS Penalaran Kuantitatif SNBT",
      jenjang: "Intensif UTBK 2026",
      siswa: {
        nama: "Rizky Dwi Ananda",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
        kelas: "Alumni SMA 28"
      },
      tentor: {
        nama: "Kak Dimas Arya, S.Si",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
      },
      metode: "Offline (Revani Classroom A)",
      status: "upcoming",
      presensiStatus: "Belum Dimulai",
      ruangan: "Revani Hub Lt. 1"
    },
    {
      id: "SCH-007",
      waktu: "13:30 - 15:00",
      mapel: "Calistung & Logika Dasar",
      jenjang: "SD Kelas 3",
      siswa: {
        nama: "Alvaro Kenzo",
        avatar: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=100&auto=format&fit=crop&q=80",
        kelas: "III-A"
      },
      tentor: {
        nama: "Kak Nadia Safitri, S.Psi",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
      },
      metode: "Offline (Rumah Siswa)",
      status: "completed",
      presensiStatus: "Hadir",
      ruangan: "Komplek Taman Sari"
    }
  ],

  topTentor: [
    {
      id: "TNT-01",
      nama: "Kak Dimas Arya, S.Si",
      mapel: "Matematika & Fisika",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      jamMengajar: 48,
      rating: 4.98,
      totalSesi: 32,
      feeEstimasi: "Rp 3.840.000",
      badge: "Top Performer"
    },
    {
      id: "TNT-02",
      nama: "Kak Sarah Nurul, M.Pd",
      mapel: "Kimia & Biologi",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      jamMengajar: 42,
      rating: 4.95,
      totalSesi: 28,
      feeEstimasi: "Rp 3.360.000",
      badge: "Favorite Tutor"
    },
    {
      id: "TNT-03",
      nama: "Mr. Kevin Sanjaya, B.Ed",
      mapel: "English & TOEFL",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
      jamMengajar: 36,
      rating: 4.92,
      totalSesi: 24,
      feeEstimasi: "Rp 3.120.000",
      badge: "Consistent"
    },
    {
      id: "TNT-04",
      nama: "Kak Reza Pahlevi, S.Pd",
      mapel: "IPA & Matematika SMP",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
      jamMengajar: 30,
      rating: 4.88,
      totalSesi: 20,
      feeEstimasi: "Rp 2.400.000",
      badge: "Rising Star"
    }
  ],

  aktivitasTerbaru: [
    {
      id: "ACT-01",
      waktu: "5 menit lalu",
      tipe: "presensi",
      judul: "Presensi Terverifikasi",
      deskripsi: "Kak Dimas Arya mencatat kehadiran Farhan Pratama (Hadir tepat waktu)",
      icon: "check-circle",
      color: "emerald"
    },
    {
      id: "ACT-02",
      waktu: "24 menit lalu",
      tipe: "laporan",
      judul: "Laporan Belajar Diunggah",
      deskripsi: "Kak Nadia mengirim laporan belajar untuk Alvaro Kenzo (Materi: Perkalian & Pembagian)",
      icon: "file-text",
      color: "indigo"
    },
    {
      id: "ACT-03",
      waktu: "1 jam lalu",
      tipe: "siswa",
      judul: "Siswa Baru Terdaftar",
      deskripsi: "M. Rizky Pratama (Kelas 10 SMA) terdaftar paket Les Privat 12 Pertemuan",
      icon: "user-plus",
      color: "blue"
    },
    {
      id: "ACT-04",
      waktu: "2 jam lalu",
      tipe: "fee",
      judul: "Rekap Pertemuan Divalidasi",
      deskripsi: "Admin memvalidasi 8 sesi les Kak Sarah Nurul periode minggu ke-4",
      icon: "dollar-sign",
      color: "amber"
    }
  ],

  chartData: {
    trenPertemuan: {
      labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
      datasets: [
        {
          label: "Sesi Selesai",
          data: [14, 18, 16, 21, 25, 28, 20],
          borderColor: "#6366F1",
          backgroundColor: "rgba(99, 102, 241, 0.15)"
        },
        {
          label: "Target Minimum",
          data: [12, 15, 15, 18, 20, 22, 18],
          borderColor: "#10B981",
          borderDash: [5, 5],
          backgroundColor: "transparent"
        }
      ]
    },
    distribusiJenjang: {
      labels: ["SMA / SMK", "SMP", "SD", "UTBK / Kedinasan"],
      data: [42, 28, 18, 12],
      colors: ["#6366F1", "#3B82F6", "#10B981", "#F59E0B"]
    }
  }
};
