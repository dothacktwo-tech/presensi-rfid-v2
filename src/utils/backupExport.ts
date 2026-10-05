import { Student, AttendanceRecord, SchoolSettings, ReportAuditLog } from '../types/attendance';
import { getTodayDateString } from '../data/mockData';

export interface DatabaseBackupPayload {
  version: string;
  exportTimestamp: string;
  appName: string;
  metadata: {
    schoolName: string;
    schoolNPSN: string;
    academicYear: string;
    operator: string;
    totalStudents: number;
    totalAttendanceRecords: number;
    totalClasses: number;
  };
  settings: SchoolSettings;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  reportAuditLogs?: ReportAuditLog[];
}

/**
 * Triggers a browser download of a given blob or text content.
 */
export function triggerFileDownload(content: string, filename: string, mimeType = 'application/json') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete JSON database backup
 */
export function exportFullDatabaseJSON(
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  settings: SchoolSettings,
  auditLogs: ReportAuditLog[] = [],
  operatorName = 'Administrator'
) {
  const classesList = Array.from(new Set(students.map((s) => s.class || 'Tanpa Kelas')));
  const now = new Date();
  const timestampStr = now.toISOString().replace(/[:.]/g, '-');
  const dateStr = getTodayDateString();

  const backupData: DatabaseBackupPayload = {
    version: '2.5.0',
    exportTimestamp: now.toISOString(),
    appName: 'HadirKu Smart Attendance System',
    metadata: {
      schoolName: settings.schoolName,
      schoolNPSN: settings.schoolNPSN,
      academicYear: settings.academicYear,
      operator: operatorName,
      totalStudents: students.length,
      totalAttendanceRecords: attendanceRecords.length,
      totalClasses: classesList.length,
    },
    settings,
    students,
    attendanceRecords,
    reportAuditLogs: auditLogs,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const safeSchoolName = (settings.schoolName || 'Sekolah').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `backup_db_hadirku_${safeSchoolName}_${dateStr}_${timestampStr.slice(11, 19)}.json`;

  triggerFileDownload(jsonString, filename, 'application/json');
  return filename;
}

/**
 * Exports Student Profiles to CSV format
 */
export function exportStudentsToCSV(students: Student[], schoolName = 'Sekolah') {
  const headers = [
    'ID',
    'NIS',
    'NISN',
    'Nama Siswa',
    'Jenis Kelamin',
    'Kelas',
    'UID Kartu RFID',
    'Kode QR Presensi',
    'Nama Orang Tua / Wali',
    'No Telepon Ortu',
    'Tanggal Lahir',
    'Alamat Lengkap',
  ];

  const rows = students.map((s) => [
    `"${s.id}"`,
    `"${s.nis}"`,
    `"${s.nisn || ''}"`,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.gender}"`,
    `"${s.class}"`,
    `"${s.rfidTag}"`,
    `"${s.qrCode}"`,
    `"${(s.parentName || '').replace(/"/g, '""')}"`,
    `"${s.parentPhone || ''}"`,
    `"${s.birthDate || ''}"`,
    `"${(s.address || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const safeSchoolName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `backup_data_siswa_${safeSchoolName}_${getTodayDateString()}.csv`;

  triggerFileDownload(csvContent, filename, 'text/csv');
  return filename;
}

/**
 * Exports Attendance Records to CSV format
 */
export function exportAttendanceRecordsToCSV(
  records: AttendanceRecord[],
  students: Student[],
  schoolName = 'Sekolah'
) {
  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const headers = [
    'ID Log',
    'Tanggal (YYYY-MM-DD)',
    'Jam Masuk (WIB)',
    'Jam Pulang (WIB)',
    'Status Kehadiran',
    'Metode Scan',
    'NIS Siswa',
    'NISN',
    'Nama Siswa',
    'Kelas',
    'Catatan / Keterangan',
  ];

  const rows = records.map((r) => {
    const st = studentMap.get(r.studentId);
    return [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${r.checkInTime || '-'}"`,
      `"${r.checkOutTime || '-'}"`,
      `"${r.status}"`,
      `"${r.method}"`,
      `"${st ? st.nis : ''}"`,
      `"${st?.nisn || ''}"`,
      `"${st ? st.name.replace(/"/g, '""') : 'Siswa Tidak Ditemukan'}"`,
      `"${st ? st.class : ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const safeSchoolName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `backup_rekaman_presensi_${safeSchoolName}_${getTodayDateString()}.csv`;

  triggerFileDownload(csvContent, filename, 'text/csv');
  return filename;
}

/**
 * Exports Class / Rombel Roster Summary to CSV format
 */
export function exportClassRostersToCSV(students: Student[], schoolName = 'Sekolah') {
  const classMap = new Map<
    string,
    {
      className: string;
      maleCount: number;
      femaleCount: number;
      totalCount: number;
    }
  >();

  students.forEach((s) => {
    const cls = s.class || 'Tanpa Kelas';
    if (!classMap.has(cls)) {
      classMap.set(cls, {
        className: cls,
        maleCount: 0,
        femaleCount: 0,
        totalCount: 0,
      });
    }
    const cur = classMap.get(cls)!;
    cur.totalCount++;
    if (s.gender === 'L') cur.maleCount++;
    else cur.femaleCount++;
  });

  const headers = [
    'Nama Kelas (Rombel)',
    'Jumlah Laki-laki (L)',
    'Jumlah Perempuan (P)',
    'Total Siswa',
    'Rasio Gender L/P',
  ];

  const rows = Array.from(classMap.values()).map((c) => {
    const malePercent = c.totalCount > 0 ? Math.round((c.maleCount / c.totalCount) * 100) : 0;
    const femalePercent = c.totalCount > 0 ? Math.round((c.femaleCount / c.totalCount) * 100) : 0;
    return [
      `"${c.className}"`,
      `"${c.maleCount}"`,
      `"${c.femaleCount}"`,
      `"${c.totalCount}"`,
      `"${malePercent}% L / ${femalePercent}% P"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const safeSchoolName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `backup_data_kelas_rombel_${safeSchoolName}_${getTodayDateString()}.csv`;

  triggerFileDownload(csvContent, filename, 'text/csv');
  return filename;
}
