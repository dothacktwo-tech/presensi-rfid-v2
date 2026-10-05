import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types/attendance';
import { getTodayDateString } from '../data/mockData';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserX,
  Search,
  Edit,
  Radio,
  QrCode,
  Users,
  Eye,
  X,
  ArrowUpDown,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { PDFReportModal } from './PDFReportModal';

export const AttendanceLogs: React.FC = () => {
  const { students, attendanceRecords, manualCheckIn, settings } = useAttendance();

  // Active sub-tab: 'cumulative' (Total per Siswa) vs 'daily' (Jurnal Harian)
  const [activeViewMode, setActiveViewMode] = useState<'cumulative' | 'daily'>('cumulative');

  // PDF Report Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfModalInitialClass, setPdfModalInitialClass] = useState<string>('ALL');
  const [pdfModalInitialStudentId, setPdfModalInitialStudentId] = useState<string>('ALL');

  const openPdfModal = (targetClass = 'ALL', targetStudentId = 'ALL') => {
    setPdfModalInitialClass(targetClass);
    setPdfModalInitialStudentId(targetStudentId);
    setIsPdfModalOpen(true);
  };

  // Cumulative Filters
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'last_7_days' | 'last_30_days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>(getTodayDateString());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rate_desc' | 'rate_asc' | 'name_asc' | 'late_desc' | 'alpha_desc'>('rate_desc');

  // Daily Log Filters
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>(getTodayDateString());
  const [selectedDailyStatus, setSelectedDailyStatus] = useState<string>('ALL');

  // Student history detail modal
  const [viewHistoryStudentId, setViewHistoryStudentId] = useState<string | null>(null);

  // Manual status edit dialog (for daily view)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('Izin');
  const [manualNote, setManualNote] = useState<string>('');

  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class))).sort();
  }, [students]);

  // Date filtering logic for cumulative recap
  const filteredRecordsByPeriod = useMemo(() => {
    const today = new Date();

    return attendanceRecords.filter((rec) => {
      const recDate = new Date(rec.date);

      if (periodFilter === 'this_month') {
        return (
          recDate.getMonth() === today.getMonth() &&
          recDate.getFullYear() === today.getFullYear()
        );
      }
      if (periodFilter === 'last_7_days') {
        const diffDays = (today.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (periodFilter === 'last_30_days') {
        const diffDays = (today.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (periodFilter === 'custom') {
        if (customStartDate && rec.date < customStartDate) return false;
        if (customEndDate && rec.date > customEndDate) return false;
        return true;
      }
      return true; // 'all'
    });
  }, [attendanceRecords, periodFilter, customStartDate, customEndDate]);

  // Calculate distinct recorded dates in the filtered dataset
  const distinctDatesCount = useMemo(() => {
    const set = new Set(filteredRecordsByPeriod.map((r) => r.date));
    return Math.max(1, set.size);
  }, [filteredRecordsByPeriod]);

  // Cumulative student stats calculation
  const cumulativeStudentData = useMemo(() => {
    return students
      .filter((st) => selectedClass === 'ALL' || st.class === selectedClass)
      .filter((st) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          st.name.toLowerCase().includes(q) ||
          st.nis.toLowerCase().includes(q) ||
          st.nisn.toLowerCase().includes(q)
        );
      })
      .map((student) => {
        const studentRecords = filteredRecordsByPeriod.filter((r) => r.studentId === student.id);

        const hadirCount = studentRecords.filter((r) => r.status === 'Hadir').length;
        const terlambatCount = studentRecords.filter((r) => r.status === 'Terlambat').length;
        const izinCount = studentRecords.filter((r) => r.status === 'Izin').length;
        const sakitCount = studentRecords.filter((r) => r.status === 'Sakit').length;
        const explicitAlphaCount = studentRecords.filter((r) => r.status === 'Alpha').length;

        // Total recorded sessions or expected school days in this period
        const totalRecorded = studentRecords.length;
        // Total meetings/days in period (either recorded or based on active days)
        const totalMeetings = Math.max(distinctDatesCount, totalRecorded);
        // Any day in the period where student has no record is considered alpha
        const unrecordedDays = Math.max(0, distinctDatesCount - totalRecorded);
        const totalAlpha = explicitAlphaCount + unrecordedDays;

        // Effective attended days (on-time + late)
        const attendedDays = hadirCount + terlambatCount;
        const attendanceRate = totalMeetings > 0 ? Math.round((attendedDays / totalMeetings) * 100) : 0;

        let category: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pembinaan' = 'Perlu Pembinaan';
        if (attendanceRate >= 95) category = 'Sangat Baik';
        else if (attendanceRate >= 85) category = 'Baik';
        else if (attendanceRate >= 75) category = 'Cukup';

        return {
          student,
          hadirCount,
          terlambatCount,
          izinCount,
          sakitCount,
          totalAlpha,
          totalMeetings,
          attendanceRate,
          category,
          studentRecords,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'rate_desc') return b.attendanceRate - a.attendanceRate;
        if (sortBy === 'rate_asc') return a.attendanceRate - b.attendanceRate;
        if (sortBy === 'name_asc') return a.student.name.localeCompare(b.student.name);
        if (sortBy === 'late_desc') return b.terlambatCount - a.terlambatCount;
        if (sortBy === 'alpha_desc') return b.totalAlpha - a.totalAlpha;
        return 0;
      });
  }, [students, filteredRecordsByPeriod, selectedClass, searchQuery, distinctDatesCount, sortBy]);

  // Aggregate KPI summary for cumulative view
  const aggregateSummary = useMemo(() => {
    const totalStudents = cumulativeStudentData.length;
    if (totalStudents === 0) {
      return { totalStudents: 0, avgRate: 0, totalHadir: 0, totalTerlambat: 0, totalIzinSakit: 0, totalAlpha: 0 };
    }
    const sumRate = cumulativeStudentData.reduce((acc, curr) => acc + curr.attendanceRate, 0);
    const totalHadir = cumulativeStudentData.reduce((acc, curr) => acc + curr.hadirCount, 0);
    const totalTerlambat = cumulativeStudentData.reduce((acc, curr) => acc + curr.terlambatCount, 0);
    const totalIzinSakit = cumulativeStudentData.reduce((acc, curr) => acc + curr.izinCount + curr.sakitCount, 0);
    const totalAlpha = cumulativeStudentData.reduce((acc, curr) => acc + curr.totalAlpha, 0);

    return {
      totalStudents,
      avgRate: Math.round(sumRate / totalStudents),
      totalHadir,
      totalTerlambat,
      totalIzinSakit,
      totalAlpha,
    };
  }, [cumulativeStudentData]);

  // Daily log view data mapping
  const dailyAttendanceMap = useMemo(() => {
    return students
      .filter((s) => selectedClass === 'ALL' || s.class === selectedClass)
      .map((student) => {
        const record = attendanceRecords.find(
          (r) => r.studentId === student.id && r.date === selectedDailyDate
        );
        return {
          student,
          record,
          effectiveStatus: record ? record.status : ('Belum Hadir' as const),
        };
      })
      .filter(({ student, record }) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.nis.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          selectedDailyStatus === 'ALL'
            ? true
            : selectedDailyStatus === 'Belum Hadir'
            ? !record
            : record?.status === selectedDailyStatus;
        return matchesSearch && matchesStatus;
      });
  }, [students, attendanceRecords, selectedDailyDate, selectedClass, selectedDailyStatus, searchQuery]);

  // Export Cumulative Recap to CSV
  const handleExportCumulativeCSV = () => {
    const headers = [
      'No',
      'NIS',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Hadir Tepat Waktu (H)',
      'Terlambat (T)',
      'Izin (I)',
      'Sakit (S)',
      'Alpha / Tanpa Ket (A)',
      'Total Hari Pertemuan',
      'Persentase Kehadiran (%)',
      'Predikat Kehadiran',
    ];

    const rows = cumulativeStudentData.map((item, index) => [
      index + 1,
      `="${item.student.nis}"`,
      `="${item.student.nisn || ''}"`,
      `"${item.student.name}"`,
      `"${item.student.class}"`,
      item.hadirCount,
      item.terlambatCount,
      item.izinCount,
      item.sakitCount,
      item.totalAlpha,
      item.totalMeetings,
      `${item.attendanceRate}%`,
      `"${item.category}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Rekap_Total_Kehadiran_Siswa_${selectedClass}_${getTodayDateString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Daily Jurnal to CSV
  const handleExportDailyCSV = () => {
    const headers = ['No', 'Tanggal', 'NIS', 'NISN', 'Nama Siswa', 'Kelas', 'Jam Masuk', 'Jam Pulang', 'Status', 'Metode', 'Catatan'];
    const rows = dailyAttendanceMap.map(({ student, record }, index) => [
      index + 1,
      selectedDailyDate,
      `="${student.nis}"`,
      `="${student.nisn || ''}"`,
      `"${student.name}"`,
      student.class,
      record?.checkInTime || '-',
      record?.checkOutTime || '-',
      record ? record.status : 'Alpha / Belum Hadir',
      record?.method || '-',
      `"${record?.notes || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Jurnal_Presensi_${selectedDailyDate}_${selectedClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveManualStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId) return;
    manualCheckIn(editingStudentId, manualStatus, manualNote);
    setEditingStudentId(null);
    setManualNote('');
  };

  const selectedStudentForHistory = useMemo(() => {
    if (!viewHistoryStudentId) return null;
    return students.find((s) => s.id === viewHistoryStudentId) || null;
  }, [viewHistoryStudentId, students]);

  const studentHistoryList = useMemo(() => {
    if (!viewHistoryStudentId) return [];
    return attendanceRecords
      .filter((r) => r.studentId === viewHistoryStudentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [viewHistoryStudentId, attendanceRecords]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Official Print Header for Physical Reports */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-900 pb-4 text-center">
        <h2 className="text-xl font-bold uppercase">{settings.schoolName}</h2>
        <p className="text-xs">{settings.schoolAddress} · NPSN: {settings.schoolNPSN}</p>
        <h3 className="text-base font-bold mt-2 underline">
          {activeViewMode === 'cumulative'
            ? 'LAPORAN REKAPITULASI TOTAL KEHADIRAN SISWA'
            : 'JURNAL PRESENSI HARIAN SISWA'}
        </h3>
        <p className="text-xs mt-1">
          Kelas: {selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass} · Tahun Ajaran: {settings.academicYear} · Tanggal Cetak: {getTodayDateString()}
        </p>
      </div>

      {/* 1. JUDUL MENU CARD REKAP KEHADIRAN */}
      <div className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-2.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>LAPORAN AKADEMIK &amp; REKAPITULASI PRESENSI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Rekapitulasi Kehadiran Siswa &amp; Jurnal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Laporan total kehadiran kumulatif per siswa, persentase disiplin, jurnal harian, dan ekspor dokumen PDF / Excel.
            </p>
          </div>

          {/* Export & Print Actions */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            <button
              onClick={() => openPdfModal(selectedClass, 'ALL')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
              title="Buka Generator & Unduh Laporan Rekapitulasi PDF Resmi"
            >
              <FileText className="w-4 h-4" />
              <span>Unduh PDF Resmi</span>
            </button>

            <button
              onClick={activeViewMode === 'cumulative' ? handleExportCumulativeCSV : handleExportDailyCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Tabs: Total Kehadiran Per Siswa vs Jurnal Harian */}
      <div className="no-print flex border-b border-slate-200">
        <button
          onClick={() => setActiveViewMode('cumulative')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeViewMode === 'cumulative'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Total Kehadiran Per Siswa (Kumulatif)</span>
        </button>
        <button
          onClick={() => setActiveViewMode('daily')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeViewMode === 'daily'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jurnal Presensi Harian</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: REKAP TOTAL PER SISWA (KUMULATIF)                       */}
      {/* ============================================================== */}
      {activeViewMode === 'cumulative' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">Siswa Terdata</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {aggregateSummary.totalStudents}
              </div>
              <span className="text-[10px] text-slate-400">Dalam filter kelas</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">Rata-rata Kehadiran</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 mt-1 tabular-nums">
                {aggregateSummary.avgRate}%
              </div>
              <span className="text-[10px] text-slate-400">Tingkat disiplin</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">Total Hadir (H)</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
                {aggregateSummary.totalHadir}
              </div>
              <span className="text-[10px] text-slate-400">Tepat waktu</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">Total Terlambat (T)</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
                {aggregateSummary.totalTerlambat}
              </div>
              <span className="text-[10px] text-slate-400">Lewat batas toleransi</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">Total Izin / Sakit</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-sky-600 mt-1 tabular-nums">
                {aggregateSummary.totalIzinSakit}
              </div>
              <span className="text-[10px] text-slate-400">Ada surat keterangan</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">Total Alpha (A)</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
                {aggregateSummary.totalAlpha}
              </div>
              <span className="text-[10px] text-slate-400">Tanpa keterangan</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Filter Per Kelas */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">Filter Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-white border border-slate-300 text-xs font-medium text-slate-800 rounded-lg px-3 py-1.5 focus:outline-indigo-500 shadow-2xs"
                >
                  <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
                  {classesList.map((cls) => {
                    const count = students.filter((s) => s.class === cls).length;
                    return (
                      <option key={cls} value={cls}>
                        {cls} ({count} Siswa)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Filter Periode */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Periode:</span>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value as any)}
                  className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500 shadow-2xs"
                >
                  <option value="all">Semua Data Tersimpan</option>
                  <option value="this_month">Bulan Ini</option>
                  <option value="last_7_days">7 Hari Terakhir</option>
                  <option value="last_30_days">30 Hari Terakhir</option>
                  <option value="custom">Rentang Tanggal Kustom...</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-600">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500"
                >
                  <option value="rate_desc">% Kehadiran Tertinggi</option>
                  <option value="rate_asc">% Kehadiran Terendah</option>
                  <option value="name_asc">Nama Siswa (A - Z)</option>
                  <option value="late_desc">Terlambat Terbanyak</option>
                  <option value="alpha_desc">Alpha Terbanyak</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama siswa, NIS, atau NISN..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Custom Date Range if selected */}
            {periodFilter === 'custom' && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-600">Mulai Tanggal:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
                <span className="font-semibold text-slate-600">Sampai Tanggal:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Cumulative Recap Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-3 text-center w-10">No</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-3">Kelas</th>
                    <th className="py-3 px-3 text-center" title="Hadir Tepat Waktu">Hadir (H)</th>
                    <th className="py-3 px-3 text-center" title="Terlambat">Terlambat (T)</th>
                    <th className="py-3 px-3 text-center" title="Izin">Izin (I)</th>
                    <th className="py-3 px-3 text-center" title="Sakit">Sakit (S)</th>
                    <th className="py-3 px-3 text-center" title="Alpha / Tanpa Keterangan">Alpha (A)</th>
                    <th className="py-3 px-3 text-center">Total Hari</th>
                    <th className="py-3 px-4 text-center">% Kehadiran</th>
                    <th className="py-3 px-3">Predikat</th>
                    <th className="no-print py-3 px-4 text-right">Riwayat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {cumulativeStudentData.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-10 text-center text-slate-400">
                        Tidak ditemukan data siswa dengan kriteria filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    cumulativeStudentData.map((item, index) => (
                      <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">
                          {index + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {item.student.photoUrl ? (
                                <img
                                  src={item.student.photoUrl}
                                  alt={item.student.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">
                                  {item.student.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{item.student.name}</div>
                              <div className="text-[11px] font-mono text-slate-400">
                                NIS: {item.student.nis} {item.student.nisn ? `· NISN: ${item.student.nisn}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                          {item.student.class}
                        </td>

                        {/* Hadir */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 bg-emerald-50/40 tabular-nums">
                          {item.hadirCount}
                        </td>

                        {/* Terlambat */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-600 bg-amber-50/40 tabular-nums">
                          {item.terlambatCount}
                        </td>

                        {/* Izin */}
                        <td className="py-3 px-3 text-center font-mono font-medium text-sky-600 tabular-nums">
                          {item.izinCount}
                        </td>

                        {/* Sakit */}
                        <td className="py-3 px-3 text-center font-mono font-medium text-purple-600 tabular-nums">
                          {item.sakitCount}
                        </td>

                        {/* Alpha */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-rose-600 bg-rose-50/40 tabular-nums">
                          {item.totalAlpha}
                        </td>

                        {/* Total Hari */}
                        <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                          {item.totalMeetings}
                        </td>

                        {/* % Kehadiran Progress */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                              <div
                                className={`h-full rounded-full ${
                                  item.attendanceRate >= 90
                                    ? 'bg-emerald-500'
                                    : item.attendanceRate >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${item.attendanceRate}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-900 tabular-nums min-w-[38px] text-right">
                              {item.attendanceRate}%
                            </span>
                          </div>
                        </td>

                        {/* Predikat */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.category === 'Sangat Baik'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.category === 'Baik'
                                ? 'bg-blue-100 text-blue-800'
                                : item.category === 'Cukup'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>

                        {/* Action: Lihat Detail & PDF */}
                        <td className="no-print py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              onClick={() => openPdfModal(item.student.class, item.student.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors border border-rose-200"
                              title={`Unduh Laporan PDF Siswa ${item.student.name}`}
                            >
                              <FileText className="w-3 h-3 text-rose-600" />
                              <span>PDF</span>
                            </button>
                            <button
                              onClick={() => setViewHistoryStudentId(item.student.id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Riwayat</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: JURNAL PRESENSI HARIAN                                 */}
      {/* ============================================================== */}
      {activeViewMode === 'daily' && (
        <div className="space-y-4">
          {/* Daily Filter Bar */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Tanggal:</span>
              <input
                type="date"
                value={selectedDailyDate}
                onChange={(e) => setSelectedDailyDate(e.target.value)}
                className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500 font-mono shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500"
              >
                <option value="ALL">Semua Kelas</option>
                {classesList.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Status:</span>
              <select
                value={selectedDailyStatus}
                onChange={(e) => setSelectedDailyStatus(e.target.value)}
                className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="Belum Hadir">⚠️ Belum Absen</option>
                <option value="Hadir">Hadir Tepat Waktu</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
              </select>
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa atau NIS..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500"
              />
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">NIS / Kelas</th>
                    <th className="py-3 px-4">Jam Masuk</th>
                    <th className="py-3 px-4">Jam Pulang</th>
                    <th className="py-3 px-4">Metode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Catatan</th>
                    <th className="no-print py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {dailyAttendanceMap.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada catatan presensi pada tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    dailyAttendanceMap.map(({ student, record, effectiveStatus }) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-400">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{student.class}</div>
                          <div className="text-[11px] font-mono text-slate-400">{student.nis}</div>
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums">
                          {record?.checkInTime ? (
                            <span className="text-slate-900 font-medium">{record.checkInTime}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono tabular-nums">
                          {record?.checkOutTime ? (
                            <span className="text-slate-900 font-medium">{record.checkOutTime}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {record ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {record.method === 'RFID' ? (
                                <Radio className="w-3 h-3 text-indigo-600" />
                              ) : record.method === 'QR' ? (
                                <QrCode className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Edit className="w-3 h-3 text-slate-500" />
                              )}
                              <span>{record.method}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {effectiveStatus === 'Belum Hadir' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-full text-[11px] animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Belum Absen</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                effectiveStatus === 'Hadir'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : effectiveStatus === 'Terlambat'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : effectiveStatus === 'Izin' || effectiveStatus === 'Sakit'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {effectiveStatus}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[200px] truncate">
                          {record?.notes || '-'}
                        </td>

                        <td className="no-print py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingStudentId(student.id);
                              setManualStatus(record?.status || 'Izin');
                              setManualNote(record?.notes || '');
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                          >
                            {record ? 'Ubah' : 'Input Status'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Signatures for Printed Reports */}
      <div className="hidden print-only mt-12 grid grid-cols-2 text-center text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-bold">Kepala Sekolah</p>
          <div className="h-20" />
          <p className="font-bold underline">{settings.principalName}</p>
          <p>NIP. 19740512 199903 1 004</p>
        </div>
        <div>
          <p>Jakarta, {getTodayDateString()}</p>
          <p className="font-bold">Wali Kelas / Guru Piket</p>
          <div className="h-20" />
          <p className="font-bold underline">Petugas Rekapitulasi Presensi</p>
          <p>NIP. ........................................</p>
        </div>
      </div>

      {/* Modal: Detail Riwayat Presensi Siswa */}
      {selectedStudentForHistory && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {selectedStudentForHistory.photoUrl ? (
                    <img
                      src={selectedStudentForHistory.photoUrl}
                      alt={selectedStudentForHistory.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                      {selectedStudentForHistory.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedStudentForHistory.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedStudentForHistory.class} · NIS: {selectedStudentForHistory.nis} · RFID: {selectedStudentForHistory.rfidTag}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewHistoryStudentId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Riwayat Presensi Tercatat ({studentHistoryList.length} Hari)
              </div>

              {studentHistoryList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Belum ada rekaman kehadiran untuk siswa ini.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {studentHistoryList.map((rec) => (
                    <div key={rec.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900 font-mono">
                          {rec.date}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Masuk: <span className="font-mono font-medium">{rec.checkInTime}</span>
                          {rec.checkOutTime ? ` · Pulang: ${rec.checkOutTime}` : ''} · via {rec.method}
                        </div>
                        {rec.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            Catatan: {rec.notes}
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          rec.status === 'Hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Terlambat'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.status === 'Izin' || rec.status === 'Sakit'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  if (selectedStudentForHistory) {
                    openPdfModal(selectedStudentForHistory.class, selectedStudentForHistory.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Unduh PDF Siswa Ini</span>
              </button>

              <button
                onClick={() => setViewHistoryStudentId(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Status Edit Modal */}
      {editingStudentId && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Ubah Status Presensi Manual
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Atur status presensi untuk tanggal {selectedDailyDate}
            </p>

            <form onSubmit={handleSaveManualStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Status Kehadiran
                </label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                >
                  <option value="Hadir">Hadir (Tepat Waktu)</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpha">Alpha</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan (Opsional)
                </label>
                <textarea
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="Contoh: Sakit flu disertai surat dokter / Izin kegiatan OSIS"
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudentId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs transition-colors"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PDF Report Export Modal */}
      <PDFReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        initialClass={pdfModalInitialClass}
        initialStudentId={pdfModalInitialStudentId}
      />
    </div>
  );
};
