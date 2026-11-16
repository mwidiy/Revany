'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tutor, Student } from '@/types';

export interface AuthUser {
  id: string;
  nama: string;
  role: 'tentor' | 'siswa';
  email?: string;
  avatar?: string;
  telepon?: string;
  tentorId?: string;
  mapel?: string;
  studentId?: string;
  kelas?: string;
  jenjang?: string;
  sisa_sesi?: number;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  role: 'tentor' | 'siswa';
  isLoggedIn: boolean;
  loginAsTentor: (tentor: Partial<Tutor>) => void;
  loginAsStudent: (student: Partial<Student>) => void;
  quickSwitchRole: (targetRole: 'tentor' | 'siswa') => void;
  logout: () => void;
}

const defaultTentorUser: AuthUser = {
  id: 'tentor-admin-1',
  tentorId: 'tentor-admin-1',
  nama: 'Kak Dimas Arya, S.Si',
  role: 'tentor',
  email: 'dimas.arya@revani.edu',
  mapel: 'Matematika & Fisika',
  telepon: '0812-3456-7890'
};

const defaultStudentUser: AuthUser = {
  id: 'student-demo-1',
  studentId: 'student-demo-1',
  nama: 'Farhan Pratama',
  role: 'siswa',
  kelas: 'XII MIPA 1',
  jenjang: 'SMA',
  telepon: '0812-9876-5432',
  sisa_sesi: 9
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(defaultTentorUser);
  const [role, setRole] = useState<'tentor' | 'siswa'>('tentor');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Restore session from localStorage if exists
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('revani_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as AuthUser;
        setCurrentUser(parsed);
        setRole(parsed.role);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('Failed reading saved auth user', e);
    }
  }, []);

  const saveUserSession = (user: AuthUser | null) => {
    setCurrentUser(user);
    if (user) {
      setRole(user.role);
      setIsLoggedIn(true);
      try {
        localStorage.setItem('revani_auth_user', JSON.stringify(user));
      } catch (e) {
        console.error('Failed saving auth to localStorage', e);
      }
    } else {
      setIsLoggedIn(false);
      try {
        localStorage.removeItem('revani_auth_user');
      } catch (e) {
        console.error('Failed clearing localStorage', e);
      }
    }
  };

  const loginAsTentor = (tentor: Partial<Tutor>) => {
    const user: AuthUser = {
      id: tentor.id || 'tentor-default',
      tentorId: tentor.id,
      nama: tentor.nama || 'Kak Tentor',
      role: 'tentor',
      email: tentor.email || 'tentor@revani.edu',
      mapel: tentor.mapel || 'Semua Mapel',
      telepon: tentor.telepon || '',
      avatar: tentor.avatar || undefined
    };
    saveUserSession(user);
  };

  const loginAsStudent = (student: Partial<Student>) => {
    const user: AuthUser = {
      id: student.id || 'student-default',
      studentId: student.id,
      nama: student.nama || 'Siswa',
      role: 'siswa',
      kelas: student.kelas || 'Siswa Bimbel',
      jenjang: student.jenjang || 'SMA',
      telepon: student.telepon || '',
      sisa_sesi: student.sisa_sesi ?? 8,
      avatar: student.avatar || undefined
    };
    saveUserSession(user);
  };

  const quickSwitchRole = (targetRole: 'tentor' | 'siswa') => {
    if (targetRole === 'tentor') {
      saveUserSession(defaultTentorUser);
    } else {
      saveUserSession(defaultStudentUser);
    }
  };

  const logout = () => {
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isLoggedIn,
        loginAsTentor,
        loginAsStudent,
        quickSwitchRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
