import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PresensiModal from '@/components/modals/PresensiModal';
import JadwalModal from '@/components/modals/JadwalModal';
import SiswaModal from '@/components/modals/SiswaModal';
import CommandPalette from '@/components/modals/CommandPalette';
import ToastContainer from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'Sahabat Ngajar — Manajemen Bimbingan & Pendamping Belajar',
  description: 'Sistem manajemen bimbingan belajar dan les privat modern Sahabat Ngajar, presensi otomatis, jadwal interaktif, dan rekap pertemuan.',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="light">
      <body>
        <ThemeProvider>
          <AppProvider>
            <div className="app-layout">
              <Sidebar />
              <div className="main-wrapper">
                <Topbar />
                {children}
              </div>
            </div>

            {/* Global Interactive Modals */}
            <PresensiModal />
            <JadwalModal />
            <SiswaModal />
            <CommandPalette />
            <ToastContainer />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
