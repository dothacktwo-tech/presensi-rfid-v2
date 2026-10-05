import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types/attendance';
import { getTodayDateString, getDateOffset } from '../data/mockData';
import {
  ClipboardCheck,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserX,
  Users,
  Check,
  RotateCcw,
  Sparkles,
  MessageSquare,
  X,
  FileCheck,
  CheckCheck,
  Lock,
  Unlock,
  AlertCircle,
  FileText,
  Zap,
  CheckSquare,
  Square,
  UserCheck,
  Sliders,
  ListChecks,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { PDFReportModal } from './PDFReportModal';

export const ManualAttendance: React.FC = () => {
  const {
    students,
    attendanceRecords,
    manualCheckIn,
    removeAttendanceRecord,
    bulkManualCheckIn,
    toggleLockAttendance,
    settings,
  } = useAttendance();

  // PDF Report Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Target Date for attendance (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-selection state for bulk actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Bulk Attendance Modal Dialog state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<AttendanceStatus>('Hadir');
  const [bulkNotes, setBulkNotes] = useState<string>('');
  const [bulkTimeMode, setBulkTimeMode] = useState<'current' | 'empty' | 'custom'>('current');
  const [bulkCustomTime, setBulkCustomTime] = useState<string>('07:00');
  const [bulkSuccessToast, setBulkSuccessToast] = useState<string | null>(null);

  // Unlocked student IDs for explicit override editing
  const [unlockedStudentMap, setUnlockedStudentMap] = useState<Record<string, boolean>>({});

  // Terlambat Quick Prompt Dialog (to choose empty time or current time)
  const [latePromptStudentId, setLatePromptStudentId] = useState<string | null>(null);
  const [lateCustomTime, setLateCustomTime] = useState<string>('');
  const [lateEmptyTime, setLateEmptyTime] = useState<boolean>(true);

  // Full Edit / Note dialog
  const [editDialogStudentId, setEditDialogStudentId] = useState<string | null>(null);
  const [dialogStatus, setDialogStatus] = useState<AttendanceStatus>('Izin');
  const [dialogNote, setDialogNote] = useState<string>('');
  const [dialogTime, setDialogTime] = useState<string>('');
  const [dialogEmptyTime, setDialogEmptyTime] = useState<boolean>(true);

  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class))).sort();
  }, [students]);

  // Combine students with attendance records on the selectedDate
  const studentRows = useMemo(() => {
    return students
      .filter((s) => selectedClass === 'ALL' || s.class === selectedClass)
      .map((student) => {
        const record = attendanceRecords.find(
          (r) => r.studentId === student.id && r.date === selectedDate
        );
        const isNotCheckedIn = !record;
        const currentStatus = record ? record.status : ('Belum Absen' as const);
        const isLocked = record ? (record.isLocked ?? true) : false;
        const isTemporarilyUnlocked = unlockedStudentMap[student.id] || false;
        const effectiveLocked = isLocked && !isTemporarilyUnlocked;

        return {
          student,
          record,
          isNotCheckedIn,
          currentStatus,
          isLocked,
          effectiveLocked,
        };
      })
      .filter(({ student, isNotCheckedIn, currentStatus }) => {
        // Status Filter
        if (selectedStatusFilter === 'BELUM_ABSEN') {
          if (!isNotCheckedIn) return false;
        } else if (selectedStatusFilter !== 'ALL') {
          if (currentStatus !== selectedStatusFilter) return false;
        }

        // Search Query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(q) ||
          student.nis.toLowerCase().includes(q) ||
          student.nisn?.toLowerCase().includes(q)
        );
      });
  }, [students, attendanceRecords, selectedDate, selectedClass, selectedStatusFilter, searchQuery, unlockedStudentMap]);

  // Counters for selected class on selectedDate
  const summaryCounts = useMemo(() => {
    const classStudents = students.filter((s) => selectedClass === 'ALL' || s.class === selectedClass);
    const total = classStudents.length;

    let belumAbsen = 0;
    let hadir = 0;
    let terlambat = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;

    classStudents.forEach((student) => {
      const rec = attendanceRecords.find((r) => r.studentId === student.id && r.date === selectedDate);
      if (!rec) {
        belumAbsen++;
      } else {
        if (rec.status === 'Hadir') hadir++;
        else if (rec.status === 'Terlambat') terlambat++;
        else if (rec.status === 'Izin') izin++;
        else if (rec.status === 'Sakit') sakit++;
        else if (rec.status === 'Alpha') alpha++;
      }
    });

    return { total, belumAbsen, hadir, terlambat, izin, sakit, alpha };
  }, [students, attendanceRecords, selectedClass, selectedDate]);

  // List of all un-attended student IDs in current filtered view
  const unrecordedStudentIdsInView = useMemo(() => {
    return studentRows.filter((r) => r.isNotCheckedIn).map((r) => r.student.id);
  }, [studentRows]);

  // Checkbox helpers
  const isAllUnattendedSelected = useMemo(() => {
    if (unrecordedStudentIdsInView.length === 0) return false;
    return unrecordedStudentIdsInView.every((id) => selectedStudentIds.includes(id));
  }, [unrecordedStudentIdsInView, selectedStudentIds]);

  const handleToggleSelectAllUnattended = () => {
    if (isAllUnattendedSelected) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !unrecordedStudentIdsInView.includes(id))
      );
    } else {
      setSelectedStudentIds((prev) =>
        Array.from(new Set([...prev, ...unrecordedStudentIdsInView]))
      );
    }
  };

  const handleToggleSelectStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Toggle temporary unlock for a student row
  const handleToggleUnlock = (studentId: string) => {
    setUnlockedStudentMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Quick 1-click status setter for un-attended or unlocked students
  const handleQuickStatus = (
    studentId: string,
    status: AttendanceStatus,
    existingNotes?: string
  ) => {
    if (status === 'Terlambat') {
      setLatePromptStudentId(studentId);
      setLateEmptyTime(true);
      setLateCustomTime('');
      return;
    }

    if (status === 'Izin' || status === 'Sakit' || status === 'Alpha') {
      manualCheckIn(studentId, status, existingNotes, selectedDate, null);
    } else {
      manualCheckIn(studentId, 'Hadir', existingNotes, selectedDate);
    }

    setUnlockedStudentMap((prev) => ({ ...prev, [studentId]: false }));
  };

  // Confirm Terlambat with or without time
  const handleConfirmLate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!latePromptStudentId) return;

    const resolvedTime = lateEmptyTime ? null : lateCustomTime.trim() || undefined;
    manualCheckIn(latePromptStudentId, 'Terlambat', undefined, selectedDate, resolvedTime);

    setUnlockedStudentMap((prev) => ({ ...prev, [latePromptStudentId]: false }));
    setLatePromptStudentId(null);
    setLateCustomTime('');
  };

  // Open full edit dialog
  const handleOpenEditDialog = (studentId: string) => {
    const rec = attendanceRecords.find(
      (r) => r.studentId === studentId && r.date === selectedDate
    );

    setEditDialogStudentId(studentId);
    setDialogStatus(rec ? rec.status : 'Izin');
    setDialogNote(rec?.notes || '');
    if (rec?.checkInTime) {
      setDialogTime(rec.checkInTime);
      setDialogEmptyTime(false);
    } else {
      setDialogTime('');
      setDialogEmptyTime(true);
    }
  };

  const handleSaveEditDialog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialogStudentId) return;

    const resolvedTime = dialogEmptyTime ? null : dialogTime.trim() || undefined;
    manualCheckIn(
      editDialogStudentId,
      dialogStatus,
      dialogNote.trim() || undefined,
      selectedDate,
      resolvedTime
    );

    setUnlockedStudentMap((prev) => ({ ...prev, [editDialogStudentId]: false }));
    setEditDialogStudentId(null);
  };

  // Open Bulk Modal for specific status
  const handleOpenBulkModal = (status: AttendanceStatus, preselectedIds?: string[]) => {
    if (preselectedIds && preselectedIds.length > 0) {
      setSelectedStudentIds(preselectedIds);
    } else if (selectedStudentIds.length === 0) {
      // Default select all unattended in current view
      setSelectedStudentIds(unrecordedStudentIdsInView);
    }
    setBulkTargetStatus(status);
    if (status === 'Hadir') {
      setBulkTimeMode('current');
    } else {
      setBulkTimeMode('empty');
    }
    setBulkNotes('');
    setIsBulkModalOpen(true);
  };

  // Execute Bulk Attendance
  const handleExecuteBulkAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const targetIds = selectedStudentIds.length > 0
      ? selectedStudentIds
      : unrecordedStudentIdsInView;

    if (targetIds.length === 0) {
      alert('Tidak ada siswa yang dipilih.');
      return;
    }

    let resolvedTime: string | null = null;
    if (bulkTimeMode === 'current') {
      const now = new Date();
      resolvedTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    } else if (bulkTimeMode === 'custom') {
      resolvedTime = bulkCustomTime.trim() || null;
    } else {
      resolvedTime = null; // empty time (-)
    }

    bulkManualCheckIn(
      targetIds,
      bulkTargetStatus,
      selectedDate,
      bulkNotes.trim() || undefined,
      resolvedTime
    );

    setIsBulkModalOpen(false);
    setSelectedStudentIds([]);
    setBulkSuccessToast(`Presensi massal [${bulkTargetStatus}] berhasil dicatat untuk ${targetIds.length} siswa.`);
    setTimeout(() => setBulkSuccessToast(null), 3500);
  };

  // Quick 1-click bulk mark as Hadir with confirm
  const handleQuickBulkMarkHadir = () => {
    const targetIds = selectedStudentIds.length > 0 ? selectedStudentIds : unrecordedStudentIdsInView;
    if (targetIds.length === 0) {
      alert('Tidak ada siswa yang belum absen.');
      return;
    }
    if (confirm(`Tandai ${targetIds.length} siswa yang belum absen sebagai HADIR sekarang? Status akan otomatis terkunci.`)) {
      bulkManualCheckIn(targetIds, 'Hadir', selectedDate);
      setSelectedStudentIds([]);
      setBulkSuccessToast(`Berhasil mencatat ${targetIds.length} siswa sebagai HADIR.`);
      setTimeout(() => setBulkSuccessToast(null), 3500);
    }
  };

  const lateStudentObj = students.find((s) => s.id === latePromptStudentId);
  const editStudentObj = students.find((s) => s.id === editDialogStudentId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. JUDUL MENU CARD ABSENSI MANUAL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-2.5">
              <ClipboardCheck className="w-4 h-4 text-indigo-400" />
              <span>MODUL PRESENSI MANUAL &amp; GURU PIKET</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Absensi Manual &amp; Dispensasi Siswa
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Catat presensi masuk, izin, sakit, atau alpa. Siswa yang sudah absen otomatis terkunci 🔒 dan dapat dibuka kembali bila diperlukan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            {/* Target Date Picker Controls */}
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 p-2 rounded-2xl shadow-inner text-xs">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-300">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayDateString())}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  selectedDate === getTodayDateString()
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(getDateOffset(1))}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  selectedDate === getDateOffset(1)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Kemarin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Siswa</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
            {summaryCounts.total}
          </div>
          <span className="text-[10px] text-slate-400">Kelas terpilih</span>
        </div>

        {/* BELUM ABSEN (Highlighted with Alert Badge) */}
        <div
          onClick={() => setSelectedStatusFilter('BELUM_ABSEN')}
          className={`cursor-pointer rounded-xl p-3 border transition-all ${
            summaryCounts.belumAbsen > 0
              ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs hover:bg-amber-100/80'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Belum Absen
            </span>
            {summaryCounts.belumAbsen > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-0.5 tabular-nums">
            {summaryCounts.belumAbsen}
          </div>
          <span className="text-[10px] text-amber-700/80 font-medium">
            {summaryCounts.belumAbsen > 0 ? 'Bisa diabsen manual →' : 'Semua sudah diabsen'}
          </span>
        </div>

        {/* Hadir */}
        <div
          onClick={() => setSelectedStatusFilter('Hadir')}
          className="cursor-pointer bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Hadir</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5 tabular-nums">
            {summaryCounts.hadir}
          </div>
          <span className="text-[10px] text-slate-400">Terkunci</span>
        </div>

        {/* Terlambat */}
        <div
          onClick={() => setSelectedStatusFilter('Terlambat')}
          className="cursor-pointer bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Terlambat</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-0.5 tabular-nums">
            {summaryCounts.terlambat}
          </div>
          <span className="text-[10px] text-slate-400">Waktu fleksibel</span>
        </div>

        {/* Izin */}
        <div
          onClick={() => setSelectedStatusFilter('Izin')}
          className="cursor-pointer bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Izin</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-600 mt-0.5 tabular-nums">
            {summaryCounts.izin}
          </div>
          <span className="text-[10px] text-slate-400">Waktu kosong</span>
        </div>

        {/* Sakit */}
        <div
          onClick={() => setSelectedStatusFilter('Sakit')}
          className="cursor-pointer bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-purple-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Sakit</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-600 mt-0.5 tabular-nums">
            {summaryCounts.sakit}
          </div>
          <span className="text-[10px] text-slate-400">Waktu kosong</span>
        </div>

        {/* Alpha */}
        <div
          onClick={() => setSelectedStatusFilter('Alpha')}
          className="cursor-pointer bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Alpha</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-0.5 tabular-nums">
            {summaryCounts.alpha}
          </div>
          <span className="text-[10px] text-slate-400">Waktu kosong</span>
        </div>
      </div>

      {/* Success Toast Banner */}
      {bulkSuccessToast && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{bulkSuccessToast}</span>
          </div>
          <button
            onClick={() => setBulkSuccessToast(null)}
            className="p-1 text-emerald-200 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Bulk Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 1. Filter Per Kelas */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Filter Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-indigo-500 shadow-2xs"
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

          {/* 2. Filter Berdasarkan Kehadiran */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter Kehadiran:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className={`border text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-indigo-500 shadow-2xs ${
                selectedStatusFilter === 'BELUM_ABSEN'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="ALL">Semua Status ({summaryCounts.total})</option>
              <option value="BELUM_ABSEN">⚠️ Belum Absen ({summaryCounts.belumAbsen})</option>
              <option value="Hadir">🔒 Hadir Tepat Waktu ({summaryCounts.hadir})</option>
              <option value="Terlambat">🔒 Terlambat ({summaryCounts.terlambat})</option>
              <option value="Izin">🔒 Izin ({summaryCounts.izin})</option>
              <option value="Sakit">🔒 Sakit ({summaryCounts.sakit})</option>
              <option value="Alpha">🔒 Alpha ({summaryCounts.alpha})</option>
            </select>
          </div>

          {/* 3. Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa atau NIS..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* MODUL FITUR ABSENSI MASSAL (BULK SISWA BELUM ABSEN) */}
        {summaryCounts.belumAbsen > 0 && (
          <div className="p-4 bg-gradient-to-r from-amber-50 via-indigo-50/40 to-emerald-50/40 border-2 border-amber-300/90 rounded-xl space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-2">
                    <span>Aksi Absensi Massal (Bulk Siswa Belum Absen)</span>
                    <span className="bg-amber-200/90 text-amber-900 text-[11px] px-2 py-0.5 rounded-full font-mono font-bold border border-amber-300">
                      {selectedStudentIds.length > 0
                        ? `${selectedStudentIds.length} Siswa Tercentang`
                        : `${summaryCounts.belumAbsen} Belum Absen`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Lakukan absen sekaligus bagi <strong>{summaryCounts.belumAbsen} siswa yang belum absen</strong> pada tanggal {selectedDate} ({selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`}).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleToggleSelectAllUnattended}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-2xs transition-colors ${
                    isAllUnattendedSelected
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>
                    {isAllUnattendedSelected
                      ? 'Batal Centang Semua'
                      : `Centang Semua Belum Absen (${unrecordedStudentIdsInView.length})`}
                  </span>
                </button>

                {selectedStudentIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                  >
                    Hapus Pilihan ({selectedStudentIds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Quick Bulk Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-amber-200/80">
              <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                <span>Pilih Status:</span>
              </span>

              {/* Hadir Massal */}
              <button
                type="button"
                onClick={() => handleOpenBulkModal('Hadir')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-102"
                title="Tandai massal Hadir Tepat Waktu"
              >
                <Check className="w-3.5 h-3.5" />
                <span>+ Hadirkan Massal</span>
              </button>

              {/* Terlambat Massal */}
              <button
                type="button"
                onClick={() => handleOpenBulkModal('Terlambat')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-102"
                title="Tandai massal Terlambat"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>+ Terlambat Massal</span>
              </button>

              {/* Izin Massal */}
              <button
                type="button"
                onClick={() => handleOpenBulkModal('Izin')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-102"
                title="Tandai massal Izin (Dispensasi)"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>+ Izin Massal</span>
              </button>

              {/* Sakit Massal */}
              <button
                type="button"
                onClick={() => handleOpenBulkModal('Sakit')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-102"
                title="Tandai massal Sakit (Surat Dokter)"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>+ Sakit Massal</span>
              </button>

              {/* Alpha Massal */}
              <button
                type="button"
                onClick={() => handleOpenBulkModal('Alpha')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-102"
                title="Tandai massal Alpha / Tanpa Keterangan"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>+ Alpha Massal</span>
              </button>
            </div>
          </div>
        )}

        {/* Guidance Notice */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Ketentuan Kunci Presensi:</strong> Siswa yang sudah absen otomatis berstatus <strong>Terkunci 🔒</strong> untuk mencegah perubahan tidak disengaja. Untuk pilihan <strong>Izin, Sakit, Alpha, dan Terlambat</strong>, jam masuk boleh dikosongkan (ditampilkan strip &apos;-&apos;).
            </span>
          </div>
        </div>
      </div>

      {/* STICKY BULK FLOATING BAR (Saat ada baris dicentang) */}
      {selectedStudentIds.length > 0 && (
        <div className="sticky top-4 z-30 p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-indigo-500/40 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <CheckSquare className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-white">
                {selectedStudentIds.length} Siswa Terpilih untuk Absen Massal
              </div>
              <div className="text-[10.5px] text-slate-300">
                Pilih status di samping untuk mengeksekusi presensi serentak
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenBulkModal('Hadir')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Hadir ({selectedStudentIds.length})
            </button>
            <button
              type="button"
              onClick={() => handleOpenBulkModal('Terlambat')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Terlambat
            </button>
            <button
              type="button"
              onClick={() => handleOpenBulkModal('Izin')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Izin
            </button>
            <button
              type="button"
              onClick={() => handleOpenBulkModal('Sakit')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Sakit
            </button>
            <button
              type="button"
              onClick={() => handleOpenBulkModal('Alpha')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Alpha
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Manual Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {/* Checkbox Column */}
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllUnattendedSelected}
                    onChange={handleToggleSelectAllUnattended}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    title="Centang semua siswa yang belum absen"
                  />
                </th>
                <th className="py-3 px-2 text-center w-10">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
                <th className="py-3 px-3">Jam Masuk</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Aksi & Pilihan Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {studentRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Tidak ada siswa yang sesuai dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                studentRows.map(
                  ({ student, record, isNotCheckedIn, currentStatus, effectiveLocked }, index) => {
                    const isSelected = selectedStudentIds.includes(student.id);

                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/60 ring-1 ring-indigo-200'
                            : isNotCheckedIn
                            ? 'bg-amber-50/20 hover:bg-amber-50/40'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(student.id)}
                            className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-2 text-center text-slate-400 font-mono">
                          {index + 1}
                        </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{student.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              NIS: {student.nis} {student.nisn ? `· NISN: ${student.nisn}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {student.class}
                      </td>

                      {/* STATUS SAAT INI (BADGE PROMINEN & STATUS KUNCI) */}
                      <td className="py-3 px-4 text-center">
                        {isNotCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-full text-[11px] shadow-2xs animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>BELUM ABSEN</span>
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${
                                currentStatus === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : currentStatus === 'Terlambat'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : currentStatus === 'Izin'
                                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                                  : currentStatus === 'Sakit'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>{currentStatus}</span>
                            </span>

                            {/* LOCK BADGE */}
                            <span
                              className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                effectiveLocked
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                              title={effectiveLocked ? 'Presensi Terkunci' : 'Kunci Terbuka (Mode Edit)'}
                            >
                              {effectiveLocked ? (
                                <>
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Terkunci</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-2.5 h-2.5 text-amber-700" />
                                  <span>Terbuka</span>
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Jam Masuk (Boleh kosong '-') */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                        {record?.checkInTime ? (
                          <span className="tabular-nums font-semibold text-slate-900">
                            {record.checkInTime}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold italic">- (Kosong)</span>
                        )}
                      </td>

                      {/* Catatan / Keterangan */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 max-w-[170px]">
                          <span className="text-[11px] text-slate-600 truncate">
                            {record?.notes || (
                              <span className="text-slate-300 italic">Tanpa catatan</span>
                            )}
                          </span>
                          <button
                            onClick={() => handleOpenEditDialog(student.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors shrink-0"
                            title="Ubah Catatan & Jam Presensi"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* TOMBOL AKSI & PILIHAN STATUS */}
                      <td className="py-3 px-4 text-right">
                        {isNotCheckedIn || !effectiveLocked ? (
                          /* Jika BELUM ABSEN atau KUNCI TELAH DIBUKA: Tampilkan tombol pilihan status aktif */
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                            {/* HADIR (Jam sekarang) */}
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(student.id, 'Hadir', record?.notes)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                                currentStatus === 'Hadir'
                                  ? 'bg-emerald-600 text-white shadow-2xs scale-105'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title="Hadir (Jam saat ini)"
                            >
                              Hadir
                            </button>

                            {/* TERLAMBAT (Opsi kosongkan waktu atau isi jam) */}
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(student.id, 'Terlambat', record?.notes)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                                currentStatus === 'Terlambat'
                                  ? 'bg-amber-600 text-white shadow-2xs scale-105'
                                  : 'text-amber-700 hover:bg-amber-50'
                              }`}
                              title="Terlambat (Waktu boleh dikosongkan)"
                            >
                              Terlambat
                            </button>

                            {/* IZIN (Waktu kosong) */}
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(student.id, 'Izin', record?.notes)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                                currentStatus === 'Izin'
                                  ? 'bg-sky-600 text-white shadow-2xs scale-105'
                                  : 'text-sky-700 hover:bg-sky-50'
                              }`}
                              title="Izin (Waktu kosong otomatis)"
                            >
                              Izin
                            </button>

                            {/* SAKIT (Waktu kosong) */}
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(student.id, 'Sakit', record?.notes)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                                currentStatus === 'Sakit'
                                  ? 'bg-purple-600 text-white shadow-2xs scale-105'
                                  : 'text-purple-700 hover:bg-purple-50'
                              }`}
                              title="Sakit (Waktu kosong otomatis)"
                            >
                              Sakit
                            </button>

                            {/* ALPHA / ALPA (Waktu kosong) */}
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(student.id, 'Alpha', record?.notes)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                                currentStatus === 'Alpha'
                                  ? 'bg-rose-600 text-white shadow-2xs scale-105'
                                  : 'text-rose-700 hover:bg-rose-50'
                              }`}
                              title="Alpha (Waktu kosong otomatis)"
                            >
                              Alpa
                            </button>

                            {/* Tombol Kunci kembali */}
                            {!isNotCheckedIn && (
                              <button
                                type="button"
                                onClick={() => handleToggleUnlock(student.id)}
                                className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded ml-1"
                                title="Kunci Kembali Status"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          /* Jika SUDAH ABSEN & TERKUNCI: Tombol dinonaktifkan dengan proteksi gembok */
                          <div className="inline-flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>Presensi Terkunci</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleUnlock(student.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-400 text-indigo-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                              title="Buka Kunci untuk Mengubah Status atau Waktu"
                            >
                              <Unlock className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Buka Kunci</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Reset dan kembalikan presensi ${student.name} ke Belum Absen?`)) {
                                  removeAttendanceRecord(student.id, selectedDate);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Reset status kembali ke Belum Absen"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK PROMPT MODAL FOR TERLAMBAT (Opsi Waktu Kosong atau Custom) */}
      {latePromptStudentId && lateStudentObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Input Status Terlambat
                </h3>
              </div>
              <button
                onClick={() => setLatePromptStudentId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmLate} className="space-y-4">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                Siswa: <strong>{lateStudentObj.name}</strong> ({lateStudentObj.class})
              </div>

              {/* Pilihan Waktu */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Pilihan Waktu Masuk:
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="lateTimeOption"
                    checked={lateEmptyTime}
                    onChange={() => setLateEmptyTime(true)}
                    className="text-indigo-600"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">Kosongkan Waktu Masuk (-)</span>
                    <span className="block text-[10px] text-slate-400">
                      Waktu tidak dicatat spesifik (boleh kosong)
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="lateTimeOption"
                    checked={!lateEmptyTime}
                    onChange={() => setLateEmptyTime(false)}
                    className="text-indigo-600"
                  />
                  <div className="text-xs flex-1">
                    <span className="font-semibold text-slate-800">Isi Jam Terlambat</span>
                    {!lateEmptyTime && (
                      <input
                        type="time"
                        value={lateCustomTime}
                        onChange={(e) => setLateCustomTime(e.target.value)}
                        className="mt-1 block w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                        placeholder="Contoh: 07:35"
                      />
                    )}
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLatePromptStudentId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs"
                >
                  Simpan Terlambat & Kunci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EDIT & DETAIL MODAL (Status, Waktu Kosong / Jam, Catatan) */}
      {editDialogStudentId && editStudentObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Ubah Presensi & Jam Siswa
              </h3>
              <button
                onClick={() => setEditDialogStudentId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDialog} className="space-y-3">
              <div className="p-2 bg-slate-50 rounded-lg text-xs text-slate-700">
                Siswa: <strong>{editStudentObj.name}</strong> ({editStudentObj.class})
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Kehadiran
                </label>
                <select
                  value={dialogStatus}
                  onChange={(e) => {
                    const st = e.target.value as AttendanceStatus;
                    setDialogStatus(st);
                    // Automatically empty time for Izin, Sakit, Alpha
                    if (st === 'Izin' || st === 'Sakit' || st === 'Alpha') {
                      setDialogEmptyTime(true);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                >
                  <option value="Hadir">Hadir Tepat Waktu</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpha">Alpa / Tanpa Keterangan</option>
                </select>
              </div>

              {/* Waktu Presensi: Checkbox Kosongkan Waktu */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={dialogEmptyTime}
                    onChange={(e) => setDialogEmptyTime(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Kosongkan Waktu Masuk (-)
                  </span>
                </label>
                <span className="block text-[10px] text-slate-400 pl-5">
                  Centang untuk mengosongkan jam (pilihan terlambat, sakit, izin, alpa boleh kosong)
                </span>

                {!dialogEmptyTime && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Waktu Jam Masuk:
                    </label>
                    <input
                      type="time"
                      value={dialogTime}
                      onChange={(e) => setDialogTime(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Catatan / Keterangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan
                </label>
                <textarea
                  value={dialogNote}
                  onChange={(e) => setDialogNote(e.target.value)}
                  placeholder="Misal: Surat dokter dari Puskesmas / Izin seleksi lomba / Terjebak macet"
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditDialogStudentId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs"
                >
                  Simpan & Kunci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI ABSENSI MASSAL (BULK ATTENDANCE) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Konfirmasi Absensi Massal
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tanggal: <span className="font-mono font-bold text-indigo-700">{selectedDate}</span> · Kelas: <span className="font-bold text-slate-800">{selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteBulkAttendance} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
              {/* Target Students Summary */}
              {(() => {
                const targetIds = selectedStudentIds.length > 0 ? selectedStudentIds : unrecordedStudentIdsInView;
                const targetStudents = students.filter((s) => targetIds.includes(s.id));

                return (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-600" />
                        <span>Siswa Penerima Presensi Massal:</span>
                      </span>
                      <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-mono text-[11px]">
                        {targetStudents.length} Siswa
                      </span>
                    </div>

                    {/* Mini avatar badge list */}
                    <div className="max-h-24 overflow-y-auto flex flex-wrap gap-1.5 pt-1">
                      {targetStudents.map((st) => (
                        <span
                          key={st.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-amber-200 rounded-md text-[10.5px] font-semibold text-slate-800 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{st.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">({st.class})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Status Kehadiran Pilihan */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Pilih Status Kehadiran Massal:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { status: 'Hadir' as AttendanceStatus, label: 'Hadir Tepat Waktu', color: 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-emerald-500' },
                    { status: 'Terlambat' as AttendanceStatus, label: 'Terlambat', color: 'bg-amber-50 border-amber-300 text-amber-900 ring-amber-500' },
                    { status: 'Izin' as AttendanceStatus, label: 'Izin / Dispensasi', color: 'bg-sky-50 border-sky-300 text-sky-900 ring-sky-500' },
                    { status: 'Sakit' as AttendanceStatus, label: 'Sakit (Surat Dokter)', color: 'bg-purple-50 border-purple-300 text-purple-900 ring-purple-500' },
                    { status: 'Alpha' as AttendanceStatus, label: 'Alpa (Tanpa Ket.)', color: 'bg-rose-50 border-rose-300 text-rose-900 ring-rose-500' },
                  ].map((item) => {
                    const isSelected = bulkTargetStatus === item.status;
                    return (
                      <button
                        key={item.status}
                        type="button"
                        onClick={() => {
                          setBulkTargetStatus(item.status);
                          if (item.status === 'Hadir') {
                            setBulkTimeMode('current');
                          } else {
                            setBulkTimeMode('empty');
                          }
                        }}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? `${item.color} shadow-xs ring-2 font-bold`
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="text-xs">{item.status}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5 truncate">
                          {item.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opsi Jam Masuk */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  Pengaturan Jam Masuk Presensi:
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300">
                    <input
                      type="radio"
                      name="bulkTimeOption"
                      checked={bulkTimeMode === 'empty'}
                      onChange={() => setBulkTimeMode('empty')}
                      className="text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">Kosongkan Jam Masuk (-)</span>
                      <span className="block text-[10px] text-slate-500">
                        Standar untuk status Izin, Sakit, Alpha, dan Dispensasi
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300">
                    <input
                      type="radio"
                      name="bulkTimeOption"
                      checked={bulkTimeMode === 'current'}
                      onChange={() => setBulkTimeMode('current')}
                      className="text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">Gunakan Jam Sekarang (Waktu Nyata)</span>
                      <span className="block text-[10px] text-slate-500">
                        Otomatis mencatat timestamp saat tombol dikonfirmasi
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300">
                    <input
                      type="radio"
                      name="bulkTimeOption"
                      checked={bulkTimeMode === 'custom'}
                      onChange={() => setBulkTimeMode('custom')}
                      className="text-indigo-600"
                    />
                    <div className="text-xs flex-1">
                      <span className="font-bold text-slate-800">Tentukan Jam Khusus</span>
                      {bulkTimeMode === 'custom' && (
                        <input
                          type="time"
                          value={bulkCustomTime}
                          onChange={(e) => setBulkCustomTime(e.target.value)}
                          className="mt-1 block w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-mono bg-white"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Catatan Massal Opsional */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan / Keterangan Massal (Opsional):
                </label>
                <textarea
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  placeholder="Misal: Surat dispensasi kegiatan sekolah / Izin acara keluarga / Tanpa keterangan"
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-indigo-500 bg-white"
                />
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-102"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  <span>
                    Simpan Presensi Massal &amp; Kunci 🔒
                  </span>
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
        initialClass={selectedClass}
      />
    </div>
  );
};
