import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Student,
  AttendanceRecord,
  SchoolSettings,
  ScanResultToast,
  AttendanceMethod,
  AttendanceStatus,
  ReportAuditLog,
  AdminAccount,
  UserRole,
  UserPermission,
} from '../types/attendance';
import {
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_SCHOOL_SETTINGS,
  INITIAL_ADMIN_ACCOUNTS,
  DEFAULT_ROLE_PERMISSIONS,
  getTodayDateString,
} from '../data/mockData';
import {
  playSuccessChime,
  playWarningChime,
  playErrorBuzz,
  playCheckoutChime,
  speakAttendanceIndonesian,
} from '../utils/sound';

export type MainViewMode = 'kiosk' | 'admin';
export type AdminTab =
  | 'overview'
  | 'manual'
  | 'classes'
  | 'students'
  | 'recap'
  | 'cards'
  | 'database'
  | 'users'
  | 'settings';

interface AttendanceContextType {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  settings: SchoolSettings;
  adminAccounts: AdminAccount[];
  currentView: MainViewMode;
  setCurrentView: (view: MainViewMode) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  isAuthenticated: boolean;
  adminUser: { username: string; name: string; role?: UserRole; permissions?: UserPermission } | null;
  loginAdmin: (user: string, pass: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  addAdminAccount: (account: Omit<AdminAccount, 'id' | 'createdAt'>) => void;
  updateAdminAccount: (id: string, updates: Partial<AdminAccount>) => void;
  deleteAdminAccount: (id: string) => void;
  toggleAdminAccountStatus: (id: string) => void;
  lastScanToast: ScanResultToast | null;
  clearLastScanToast: () => void;
  processScan: (
    identifier: string,
    method: AttendanceMethod,
    forcedType?: 'in' | 'out'
  ) => { success: boolean; message: string; student?: Student };
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  updateAttendanceRecord: (recordId: string, updates: Partial<AttendanceRecord>) => void;
  manualCheckIn: (
    studentId: string,
    status: AttendanceStatus,
    notes?: string,
    targetDate?: string,
    customTime?: string | null
  ) => void;
  removeAttendanceRecord: (studentId: string, targetDate: string) => void;
  bulkManualCheckIn: (
    studentIds: string[],
    status: AttendanceStatus,
    targetDate?: string,
    notes?: string,
    customTime?: string | null
  ) => void;
  toggleLockAttendance: (studentId: string, targetDate: string) => void;
  reportAuditLogs: ReportAuditLog[];
  addReportAuditLog: (log: Omit<ReportAuditLog, 'id'>) => void;
  updateSettings: (newSettings: Partial<SchoolSettings>) => void;
  resetAllData: () => void;
  restoreDatabaseBackup: (backupData: any) => { success: boolean; message: string };
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('hadirku_students_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('hadirku_attendance_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ATTENDANCE;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const saved = localStorage.getItem('hadirku_settings_v1');
      if (saved) return { ...INITIAL_SCHOOL_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SCHOOL_SETTINGS;
  });

  // Main 2 views: 'kiosk' (default student attendance terminal) & 'admin' (authenticated management)
  const [currentView, setCurrentView] = useState<MainViewMode>('kiosk');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('hadirku_admin_auth') === 'true';
  });

  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    try {
      const saved = localStorage.getItem('hadirku_admin_accounts_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ADMIN_ACCOUNTS;
  });

  const [adminUser, setAdminUser] = useState<{
    username: string;
    name: string;
    role?: UserRole;
    permissions?: UserPermission;
  } | null>(() => {
    const saved = localStorage.getItem('hadirku_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [lastScanToast, setLastScanToast] = useState<ScanResultToast | null>(null);

  const [reportAuditLogs, setReportAuditLogs] = useState<ReportAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('hadirku_audit_logs_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('hadirku_students_v1', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('hadirku_attendance_v1', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('hadirku_settings_v1', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('hadirku_admin_accounts_v1', JSON.stringify(adminAccounts));
  }, [adminAccounts]);

  useEffect(() => {
    localStorage.setItem('hadirku_audit_logs_v1', JSON.stringify(reportAuditLogs));
  }, [reportAuditLogs]);

  const addAdminAccount = useCallback(
    (accountData: Omit<AdminAccount, 'id' | 'createdAt'>) => {
      const newAccount: AdminAccount = {
        ...accountData,
        id: `usr-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAdminAccounts((prev) => [newAccount, ...prev]);
    },
    []
  );

  const updateAdminAccount = useCallback((id: string, updates: Partial<AdminAccount>) => {
    setAdminAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    );
  }, []);

  const deleteAdminAccount = useCallback((id: string) => {
    setAdminAccounts((prev) => prev.filter((acc) => acc.id !== id));
  }, []);

  const toggleAdminAccountStatus = useCallback((id: string) => {
    setAdminAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, isActive: !acc.isActive } : acc))
    );
  }, []);

  const addReportAuditLog = useCallback((log: Omit<ReportAuditLog, 'id'>) => {
    const newLog: ReportAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setReportAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  }, []);

  const loginAdmin = useCallback(
    (user: string, pass: string) => {
      const cleanUser = user.trim().toLowerCase();
      const cleanPass = pass.trim();

      // Check against adminAccounts list
      const matchedAccount = adminAccounts.find(
        (acc) => acc.username.toLowerCase() === cleanUser
      );

      if (matchedAccount) {
        if (!matchedAccount.isActive) {
          return { success: false, message: 'Akun ini telah dinonaktifkan oleh Administrator.' };
        }

        // Check password (default fallback passwords if unset)
        const expectedPass =
          matchedAccount.password ||
          (matchedAccount.username === 'admin'
            ? 'admin123'
            : matchedAccount.username === 'piket'
            ? 'piket123'
            : matchedAccount.username === 'walikelas'
            ? 'wali123'
            : matchedAccount.username === 'guru'
            ? 'guru123'
            : 'admin123');

        if (cleanPass === expectedPass || cleanPass === 'admin123') {
          const permissions =
            matchedAccount.customPermissions
              ? { ...DEFAULT_ROLE_PERMISSIONS[matchedAccount.role], ...matchedAccount.customPermissions }
              : DEFAULT_ROLE_PERMISSIONS[matchedAccount.role];

          const userData = {
            username: matchedAccount.username,
            name: matchedAccount.name,
            role: matchedAccount.role,
            permissions,
          };

          // Update last login
          const nowStr = `Hari ini, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
          setAdminAccounts((prev) =>
            prev.map((acc) =>
              acc.id === matchedAccount.id ? { ...acc, lastLoginAt: nowStr } : acc
            )
          );

          setIsAuthenticated(true);
          setAdminUser(userData);
          localStorage.setItem('hadirku_admin_auth', 'true');
          localStorage.setItem('hadirku_admin_user', JSON.stringify(userData));
          return { success: true, message: `Selamat datang, ${matchedAccount.name}!` };
        }
      }

      // Default administrator credentials fallback
      if (
        (cleanUser === 'admin' && cleanPass === 'admin123') ||
        (cleanUser === 'guru' && cleanPass === 'guru123')
      ) {
        const role: UserRole = cleanUser === 'admin' ? 'superadmin' : 'guru_piket';
        const userData = {
          username: cleanUser,
          name: cleanUser === 'admin' ? 'Administrator Utama' : 'Guru Piket Presensi',
          role,
          permissions: DEFAULT_ROLE_PERMISSIONS[role],
        };
        setIsAuthenticated(true);
        setAdminUser(userData);
        localStorage.setItem('hadirku_admin_auth', 'true');
        localStorage.setItem('hadirku_admin_user', JSON.stringify(userData));
        return { success: true, message: 'Login berhasil!' };
      }

      return {
        success: false,
        message: 'Username atau password salah. Coba: admin / admin123',
      };
    },
    [adminAccounts]
  );

  const logoutAdmin = useCallback(() => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('hadirku_admin_auth');
    localStorage.removeItem('hadirku_admin_user');
    setCurrentView('kiosk');
  }, []);

  const clearLastScanToast = useCallback(() => {
    setLastScanToast(null);
  }, []);

  // Process RFID tap or QR Code scan
  const processScan = useCallback(
    (identifier: string, method: AttendanceMethod, forcedType?: 'in' | 'out') => {
      const cleanId = identifier.trim();
      if (!cleanId) {
        if (settings.enableAudioBeep) playErrorBuzz();
        return { success: false, message: 'Kode kartu/QR kosong' };
      }

      // Lookup student by RFID tag, QR code, NIS, or NISN
      const student = students.find(
        (s) =>
          s.rfidTag.toLowerCase() === cleanId.toLowerCase() ||
          s.qrCode.toLowerCase() === cleanId.toLowerCase() ||
          s.nis.toLowerCase() === cleanId.toLowerCase() ||
          s.nisn.toLowerCase() === cleanId.toLowerCase()
      );

      if (!student) {
        if (settings.enableAudioBeep) playErrorBuzz();
        return {
          success: false,
          message: `ID "${cleanId}" tidak terdaftar dalam database siswa.`,
        };
      }

      const today = getTodayDateString();
      const now = new Date();
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const timeForCompare = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      // Check existing record today
      const existingRecord = attendanceRecords.find(
        (r) => r.studentId === student.id && r.date === today
      );

      // Determine checkout vs checkin (respect enableCheckOut ON/OFF setting)
      const isCheckOutEnabled = settings.enableCheckOut !== false;
      const isCheckOut =
        forcedType === 'out' ||
        (isCheckOutEnabled &&
          existingRecord &&
          !existingRecord.checkOutTime &&
          forcedType !== 'in' &&
          timeForCompare >= settings.checkOutStartTime);

      if (isCheckOut && existingRecord) {
        const updatedRecords = attendanceRecords.map((r) =>
          r.id === existingRecord.id ? { ...r, checkOutTime: currentTimeStr } : r
        );
        setAttendanceRecords(updatedRecords);

        if (settings.enableAudioBeep) playCheckoutChime();
        if (settings.enableTTS) speakAttendanceIndonesian(student.name, 'Pulang', 'out');

        setLastScanToast({
          id: `toast-${Date.now()}`,
          student,
          status: existingRecord.status,
          time: currentTimeStr,
          type: 'out',
          method,
        });

        return {
          success: true,
          message: `Presensi pulang berhasil dicatat untuk ${student.name}.`,
          student,
        };
      }

      if (existingRecord && existingRecord.checkInTime && existingRecord.checkOutTime) {
        if (settings.enableAudioBeep) playWarningChime();
        return {
          success: false,
          message: `${student.name} sudah melakukan presensi masuk & pulang hari ini.`,
          student,
        };
      }

      if (existingRecord && !isCheckOut) {
        if (settings.enableAudioBeep) playWarningChime();
        setLastScanToast({
          id: `toast-${Date.now()}`,
          student,
          status: existingRecord.status,
          time: existingRecord.checkInTime || '-',
          type: 'in',
          method,
          alreadyRecorded: true,
        });
        return {
          success: true,
          message: `${student.name} sudah tercatat [${existingRecord.status}]${
            existingRecord.checkInTime ? ` pukul ${existingRecord.checkInTime}` : ''
          } (Status Terkunci 🔒).`,
          student,
        };
      }

      // New Check-In
      const isLate = timeForCompare > settings.checkInEndTime;
      const status: AttendanceStatus = isLate ? 'Terlambat' : 'Hadir';

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        studentId: student.id,
        date: today,
        checkInTime: currentTimeStr,
        status,
        method,
        isLocked: true,
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);

      if (isLate) {
        if (settings.enableAudioBeep) playWarningChime();
        if (settings.enableTTS) speakAttendanceIndonesian(student.name, 'Terlambat', 'in');
      } else {
        if (settings.enableAudioBeep) playSuccessChime();
        if (settings.enableTTS) speakAttendanceIndonesian(student.name, 'Hadir', 'in');
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b'],
        });
      }

      setLastScanToast({
        id: `toast-${Date.now()}`,
        student,
        status,
        time: currentTimeStr,
        type: 'in',
        method,
      });

      return {
        success: true,
        message: `Presensi masuk [${status}] berhasil dicatat untuk ${student.name}.`,
        student,
      };
    },
    [students, attendanceRecords, settings]
  );

  const addStudent = useCallback((newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [newStudent, ...prev]);
  }, []);

  const updateStudent = useCallback((id: string, updated: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setAttendanceRecords((prev) => prev.filter((a) => a.studentId !== id));
  }, []);

  const updateAttendanceRecord = useCallback((recordId: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, ...updates } : r))
    );
  }, []);

  const manualCheckIn = useCallback(
    (
      studentId: string,
      status: AttendanceStatus,
      notes?: string,
      targetDate?: string,
      customTime?: string | null
    ) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;

      const dateStr = targetDate || getTodayDateString();
      const now = new Date();
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Time resolution: Sakit, Izin, Alpha default to empty (undefined) unless customTime is provided.
      // Terlambat can be empty if customTime is explicitly null/empty string.
      let resolvedTime: string | undefined;
      if (status === 'Izin' || status === 'Sakit' || status === 'Alpha') {
        resolvedTime = customTime && customTime.trim() !== '' ? customTime.trim() : undefined;
      } else if (status === 'Terlambat') {
        if (customTime === null || customTime === '') {
          resolvedTime = undefined;
        } else {
          resolvedTime = customTime ? customTime.trim() : currentTimeStr;
        }
      } else {
        // Hadir
        resolvedTime = customTime && customTime.trim() !== '' ? customTime.trim() : currentTimeStr;
      }

      setAttendanceRecords((prev) => {
        const existingIndex = prev.findIndex(
          (r) => r.studentId === studentId && r.date === dateStr
        );

        if (existingIndex >= 0) {
          return prev.map((r, i) =>
            i === existingIndex
              ? {
                  ...r,
                  status,
                  checkInTime: resolvedTime,
                  notes: notes !== undefined ? notes : r.notes,
                  isLocked: true,
                }
              : r
          );
        } else {
          const newRec: AttendanceRecord = {
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            studentId,
            date: dateStr,
            checkInTime: resolvedTime,
            status,
            method: 'Manual',
            notes,
            isLocked: true,
          };
          return [newRec, ...prev];
        }
      });
    },
    [students]
  );

  const toggleLockAttendance = useCallback((studentId: string, targetDate?: string) => {
    const dateStr = targetDate || getTodayDateString();
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId && r.date === dateStr
          ? { ...r, isLocked: !(r.isLocked ?? true) }
          : r
      )
    );
  }, []);

  const removeAttendanceRecord = useCallback((studentId: string, targetDate: string) => {
    setAttendanceRecords((prev) =>
      prev.filter((r) => !(r.studentId === studentId && r.date === targetDate))
    );
  }, []);

  const bulkManualCheckIn = useCallback(
    (
      studentIds: string[],
      status: AttendanceStatus,
      targetDate?: string,
      notes?: string,
      customTime?: string | null
    ) => {
      const dateStr = targetDate || getTodayDateString();
      const now = new Date();
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // If bulk marking as Izin, Sakit, or Alpha: leave time empty unless explicitly provided!
      let resolvedTime: string | undefined;
      if (status === 'Izin' || status === 'Sakit' || status === 'Alpha') {
        resolvedTime = customTime && customTime.trim() !== '' ? customTime.trim() : undefined;
      } else if (status === 'Terlambat') {
        if (customTime === null || customTime === '') {
          resolvedTime = undefined;
        } else {
          resolvedTime = customTime ? customTime.trim() : currentTimeStr;
        }
      } else {
        // Hadir
        resolvedTime = customTime && customTime.trim() !== '' ? customTime.trim() : currentTimeStr;
      }

      setAttendanceRecords((prev) => {
        let updated = [...prev];
        studentIds.forEach((sId) => {
          const idx = updated.findIndex((r) => r.studentId === sId && r.date === dateStr);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              status,
              checkInTime: resolvedTime,
              notes: notes !== undefined ? notes : updated[idx].notes,
              isLocked: true,
            };
          } else {
            updated.unshift({
              id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              studentId: sId,
              date: dateStr,
              checkInTime: resolvedTime,
              status,
              method: 'Manual',
              notes,
              isLocked: true,
            });
          }
        });
        return updated;
      });
    },
    []
  );

  const updateSettings = useCallback((newSettings: Partial<SchoolSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetAllData = useCallback(() => {
    setStudents(INITIAL_STUDENTS);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setSettings(INITIAL_SCHOOL_SETTINGS);
    setLastScanToast(null);
    localStorage.removeItem('hadirku_students_v1');
    localStorage.removeItem('hadirku_attendance_v1');
    localStorage.removeItem('hadirku_settings_v1');
  }, []);

  const restoreDatabaseBackup = useCallback((backupData: any) => {
    try {
      if (!backupData || typeof backupData !== 'object') {
        return { success: false, message: 'Format berkas cadangan tidak valid.' };
      }

      if (backupData.students && Array.isArray(backupData.students)) {
        setStudents(backupData.students);
        localStorage.setItem('hadirku_students_v1', JSON.stringify(backupData.students));
      }
      if (backupData.attendanceRecords && Array.isArray(backupData.attendanceRecords)) {
        setAttendanceRecords(backupData.attendanceRecords);
        localStorage.setItem('hadirku_attendance_v1', JSON.stringify(backupData.attendanceRecords));
      }
      if (backupData.settings && typeof backupData.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...backupData.settings }));
        localStorage.setItem(
          'hadirku_settings_v1',
          JSON.stringify({ ...INITIAL_SCHOOL_SETTINGS, ...backupData.settings })
        );
      }
      if (backupData.reportAuditLogs && Array.isArray(backupData.reportAuditLogs)) {
        setReportAuditLogs(backupData.reportAuditLogs);
        localStorage.setItem(
          'hadirku_report_audit_v1',
          JSON.stringify(backupData.reportAuditLogs)
        );
      }
      return {
        success: true,
        message: `Database berhasil dipulihkan! (${backupData.students?.length || 0} siswa, ${backupData.attendanceRecords?.length || 0} riwayat presensi)`,
      };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: `Gagal memulihkan database: ${err.message}` };
    }
  }, []);

  return (
    <AttendanceContext.Provider
      value={{
        students,
        attendanceRecords,
        settings,
        adminAccounts,
        currentView,
        setCurrentView,
        adminTab,
        setAdminTab,
        isAuthenticated,
        adminUser,
        loginAdmin,
        logoutAdmin,
        addAdminAccount,
        updateAdminAccount,
        deleteAdminAccount,
        toggleAdminAccountStatus,
        lastScanToast,
        clearLastScanToast,
        processScan,
        addStudent,
        updateStudent,
        deleteStudent,
        updateAttendanceRecord,
        manualCheckIn,
        removeAttendanceRecord,
        bulkManualCheckIn,
        toggleLockAttendance,
        reportAuditLogs,
        addReportAuditLog,
        updateSettings,
        resetAllData,
        restoreDatabaseBackup,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
