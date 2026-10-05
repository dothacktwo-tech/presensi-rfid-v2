export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpha';

export type AttendanceMethod = 'RFID' | 'QR' | 'Manual';

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  class: string;
  rfidTag: string; // e.g., '0008472910'
  qrCode: string; // e.g., 'SISWA-2026-001'
  parentPhone: string;
  parentName: string;
  photoUrl?: string;
  address?: string;
  birthDate?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss (Boleh kosong untuk Terlambat, Sakit, Izin, Alpha)
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  method: AttendanceMethod;
  notes?: string;
  isLocked?: boolean;
}

export type CardBackgroundTheme =
  | 'blue_gradient'
  | 'emerald_teal'
  | 'maroon_crimson'
  | 'royal_sapphire'
  | 'dark_slate'
  | 'gold_amber'
  | 'clean_white'
  | 'custom_image'
  | 'custom_color';

export type CardPatternType = 'geometric' | 'waves' | 'grid' | 'batik' | 'watermark' | 'none';

export interface SchoolSettings {
  schoolName: string;
  schoolNPSN: string;
  schoolAddress: string;
  principalName: string;
  academicYear: string;
  checkInStartTime: string; // e.g., "06:30"
  checkInEndTime: string; // Cutoff for on-time e.g., "07:15"
  checkOutStartTime: string; // e.g., "15:00"
  enableCheckOut: boolean; // Enable or disable checkout attendance with ON/OFF switch
  enableAudioBeep: boolean;
  enableTTS: boolean;
  autoWhatsAppNotice: boolean;
  rfidWedgeMode: boolean; // Global keyboard wedge capture for USB RFID readers
  // Card Design & Background Customization
  cardTheme: CardBackgroundTheme;
  cardPattern: CardPatternType;
  cardCustomBgUrl?: string;
  cardCustomColor1?: string;
  cardCustomColor2?: string;
  cardAccentColor?: string;
  cardTextColor?: 'light' | 'dark';
  cardShowWatermark?: boolean;
}

export interface ScanResultToast {
  id: string;
  student: Student;
  status: AttendanceStatus;
  time: string;
  type: 'in' | 'out';
  method: AttendanceMethod;
  alreadyRecorded?: boolean;
}

export interface ReportAuditLog {
  id: string;
  userId: string;
  userName: string;
  downloadTime: string; // ISO / Formatted Date Time
  reportType: string; // e.g. "PDF Rekapitulasi Absensi"
  dateRange: string;
  selectedClass: string;
  totalRecords: number;
  fileName: string;
}

export type UserRole = 'superadmin' | 'admin' | 'guru_piket' | 'wali_kelas';

export interface UserPermission {
  canViewDashboard: boolean;
  canManageAttendance: boolean;
  canManageStudents: boolean;
  canManageClasses: boolean;
  canExportReports: boolean;
  canGenerateCards: boolean;
  canManageDatabase: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
}

export interface AdminAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  assignedClass?: string; // For wali_kelas
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  customPermissions?: Partial<UserPermission>;
}

