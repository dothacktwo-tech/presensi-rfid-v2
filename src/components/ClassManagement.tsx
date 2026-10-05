import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types/attendance';
import {
  GraduationCap,
  Users,
  Search,
  Eye,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  X,
  Phone,
  Download,
  CheckCircle,
} from 'lucide-react';
import { exportClassRostersToCSV } from '../utils/backupExport';

export function getGradeLevel(className: string): 'X' | 'XI' | 'XII' | 'Lainnya' {
  const clean = className.trim().toUpperCase();
  if (clean.startsWith('XII') || clean.startsWith('12')) return 'XII';
  if (clean.startsWith('XI') || clean.startsWith('11')) return 'XI';
  if (clean.startsWith('X') || clean.startsWith('10')) return 'X';
  return 'Lainnya';
}

const DEFAULT_HOMEROOM_TEACHERS: Record<string, string> = {
  'X-1': 'Dra. Hj. Siti Aminah, M.Pd.',
  'X DKV 1': 'Ahmad Fauzi, S.Sn., M.Ds.',
  'XI-1': 'Drs. Supriyanto, M.Si.',
  'XI TKJ 2': 'Budi Hartono, S.Kom.',
  'XII-1': 'Hj. Ratna Wulandari, S.Pd.',
  'XII RPL 1': 'Muhammad Irfan, M.Kom.',
};

export const ClassManagement: React.FC = () => {
  const { students, settings, setCurrentView, setAdminTab } = useAttendance();

  // Selected Grade Tab Filter: 'ALL' | 'X' | 'XI' | 'XII'
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | 'X' | 'XI' | 'XII'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Selected class for student roster detail modal
  const [rosterClassModal, setRosterClassModal] = useState<string | null>(null);

  // Compute Class Summaries
  const classSummaries = useMemo(() => {
    const classMap = new Map<
      string,
      {
        className: string;
        gradeLevel: 'X' | 'XI' | 'XII' | 'Lainnya';
        students: Student[];
        maleCount: number;
        femaleCount: number;
        totalCount: number;
        homeroomTeacher: string;
      }
    >();

    students.forEach((student) => {
      const cls = student.class || 'Tanpa Kelas';
      if (!classMap.has(cls)) {
        classMap.set(cls, {
          className: cls,
          gradeLevel: getGradeLevel(cls),
          students: [],
          maleCount: 0,
          femaleCount: 0,
          totalCount: 0,
          homeroomTeacher:
            DEFAULT_HOMEROOM_TEACHERS[cls] || 'Guru Wali Kelas Ditunjuk',
        });
      }

      const item = classMap.get(cls)!;
      item.students.push(student);
      item.totalCount++;
      if (student.gender === 'L') {
        item.maleCount++;
      } else {
        item.femaleCount++;
      }
    });

    // Convert map to sorted array (Group by grade level X -> XI -> XII, then class name)
    const gradeOrder: Record<string, number> = { X: 1, XI: 2, XII: 3, Lainnya: 4 };

    return Array.from(classMap.values()).sort((a, b) => {
      const orderA = gradeOrder[a.gradeLevel] || 99;
      const orderB = gradeOrder[b.gradeLevel] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.className.localeCompare(b.className);
    });
  }, [students]);

  // Overall Statistics for the Header Card
  const overallStats = useMemo(() => {
    const totalRombel = classSummaries.length;
    let rombelX = 0;
    let rombelXI = 0;
    let rombelXII = 0;
    let rombelOther = 0;

    let totalSiswa = 0;
    let totalMale = 0;
    let totalFemale = 0;

    classSummaries.forEach((c) => {
      if (c.gradeLevel === 'X') rombelX++;
      else if (c.gradeLevel === 'XI') rombelXI++;
      else if (c.gradeLevel === 'XII') rombelXII++;
      else rombelOther++;

      totalSiswa += c.totalCount;
      totalMale += c.maleCount;
      totalFemale += c.femaleCount;
    });

    return {
      totalRombel,
      rombelX,
      rombelXI,
      rombelXII,
      rombelOther,
      totalSiswa,
      totalMale,
      totalFemale,
    };
  }, [classSummaries]);

  // Filtered Class Summaries based on search and grade filter
  const filteredClasses = useMemo(() => {
    return classSummaries.filter((c) => {
      if (selectedGradeFilter !== 'ALL' && c.gradeLevel !== selectedGradeFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.className.toLowerCase().includes(q) ||
        c.homeroomTeacher.toLowerCase().includes(q) ||
        c.students.some((s) => s.name.toLowerCase().includes(q))
      );
    });
  }, [classSummaries, selectedGradeFilter, searchQuery]);

  // Active roster data when modal is open
  const activeRosterClass = useMemo(() => {
    if (!rosterClassModal) return null;
    return classSummaries.find((c) => c.className === rosterClassModal) || null;
  }, [rosterClassModal, classSummaries]);

  const handleDownloadClassesCSV = () => {
    const filename = exportClassRostersToCSV(students, settings.schoolName);
    setDownloadFeedback(`Data kelas & rombel berhasil diunduh: ${filename}`);
    setTimeout(() => setDownloadFeedback(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. JUDUL CARD DARI MENU DENGAN KETERANGAN LENGKAP:
             - Jumlah Rombel
             - Tingkat Kelas (X, XI, XII)
             - Total Siswa (L & P)
      */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-2.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>MANAJEMEN ROMBONGAN BELAJAR (ROMBEL)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Data Kelas &amp; Rombongan Belajar
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Tahun Ajaran {settings.academicYear || '2025/2026'}. Rekapitulasi sebaran rombel, perincian jumlah siswa laki-laki dan perempuan per kelas.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            {/* Tombol Unduh Data Rombel Khusus Menu Ini */}
            <button
              onClick={handleDownloadClassesCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 shadow-md transition-all hover:scale-102"
              title="Unduh Berkas CSV Data Rombel & Komposisi Gender"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Unduh Data Kelas</span>
            </button>
          </div>
        </div>

        {downloadFeedback && (
          <div className="relative z-10 mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-medium rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadFeedback}</span>
          </div>
        )}

        {/* METRIK KETERANGAN KELAS (ROMBEL, TINGKAT X, XI, XII, TOTAL SISWA) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-indigo-800/40">
          {/* Card 1: Jumlah Rombel */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20 shadow-inner">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Jumlah Rombel</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1.5 tabular-nums">
              {overallStats.totalRombel} <span className="text-sm font-sans font-medium text-slate-300">Rombel</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Rombongan belajar terdaftar
            </div>
          </div>

          {/* Card 2: Tingkat Kelas (X, XI, XII) */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20 shadow-inner">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Tingkat Kelas (X, XI, XII)</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold font-mono">
                X: {overallStats.rombelX}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold font-mono">
                XI: {overallStats.rombelXI}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold font-mono">
                XII: {overallStats.rombelXII}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Sebaran jenjang kelas SMA
            </div>
          </div>

          {/* Card 3: Total Siswa */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20 shadow-inner">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Total Siswa</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1.5 tabular-nums">
              {overallStats.totalSiswa} <span className="text-sm font-sans font-medium text-slate-300">Siswa</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Rata-rata {overallStats.totalRombel > 0 ? Math.round(overallStats.totalSiswa / overallStats.totalRombel) : 0} siswa/rombel
            </div>
          </div>

          {/* Card 4: Komposisi Gender (L & P) */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20 shadow-inner">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Komposisi Gender</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sky-300 font-bold font-mono text-sm flex items-center gap-1">
                <span className="text-xs">♂</span> {overallStats.totalMale} L
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-pink-300 font-bold font-mono text-sm flex items-center gap-1">
                <span className="text-xs">♀</span> {overallStats.totalFemale} P
              </span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex mt-2">
              <div
                style={{
                  width: `${overallStats.totalSiswa > 0 ? (overallStats.totalMale / overallStats.totalSiswa) * 100 : 50}%`,
                }}
                className="bg-sky-400 h-full"
                title={`Laki-laki: ${overallStats.totalMale}`}
              />
              <div
                style={{
                  width: `${overallStats.totalSiswa > 0 ? (overallStats.totalFemale / overallStats.totalSiswa) * 100 : 50}%`,
                }}
                className="bg-pink-400 h-full"
                title={`Perempuan: ${overallStats.totalFemale}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER & PENCARIAN TINGKAT KELAS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Grade tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setSelectedGradeFilter('ALL')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-colors ${
              selectedGradeFilter === 'ALL'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Tingkat ({overallStats.totalRombel})
          </button>
          <button
            onClick={() => setSelectedGradeFilter('X')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-colors ${
              selectedGradeFilter === 'X'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tingkat X ({overallStats.rombelX})
          </button>
          <button
            onClick={() => setSelectedGradeFilter('XI')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-colors ${
              selectedGradeFilter === 'XI'
                ? 'bg-white text-sky-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tingkat XI ({overallStats.rombelXI})
          </button>
          <button
            onClick={() => setSelectedGradeFilter('XII')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-colors ${
              selectedGradeFilter === 'XII'
                ? 'bg-white text-purple-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tingkat XII ({overallStats.rombelXII})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kelas, wali kelas, atau nama siswa..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* 3. GRID DAFTAR KELAS (CARD PER ROMBEL DENGAN RINCIAN L, P, TOTAL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
            Tidak ditemukan data kelas yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filteredClasses.map((item) => {
            const malePercent =
              item.totalCount > 0 ? Math.round((item.maleCount / item.totalCount) * 100) : 0;
            const femalePercent =
              item.totalCount > 0 ? Math.round((item.femaleCount / item.totalCount) * 100) : 0;

            const gradeBadgeColor =
              item.gradeLevel === 'X'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : item.gradeLevel === 'XI'
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'bg-purple-50 text-purple-700 border-purple-300';

            return (
              <div
                key={item.className}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar Card */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${gradeBadgeColor}`}
                    >
                      Tingkat {item.gradeLevel}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      Rombel Resmi
                    </span>
                  </div>

                  {/* Class Name */}
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.className}
                    </h2>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                        {item.totalCount}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">Siswa</span>
                    </div>
                  </div>

                  {/* Homeroom teacher */}
                  <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 truncate">
                    <span className="text-[11px] font-medium text-slate-400">Wali Kelas:</span>
                    <span className="font-semibold text-slate-700 truncate">{item.homeroomTeacher}</span>
                  </div>

                  {/* Gender Composition Breakdown */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        <span className="text-slate-600 font-medium">Laki-laki:</span>
                        <span className="font-bold font-mono text-slate-900">{item.maleCount}</span>
                        <span className="text-[10px] text-slate-400">({malePercent}%)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        <span className="text-slate-600 font-medium">Perempuan:</span>
                        <span className="font-bold font-mono text-slate-900">{item.femaleCount}</span>
                        <span className="text-[10px] text-slate-400">({femalePercent}%)</span>
                      </div>
                    </div>

                    {/* Ratio Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${malePercent}%` }}
                        className="bg-sky-500 h-full transition-all"
                      />
                      <div
                        style={{ width: `${femalePercent}%` }}
                        className="bg-pink-500 h-full transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setRosterClassModal(item.className)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Daftar Siswa</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('manual')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors"
                    title={`Buka Presensi Manual untuk Kelas ${item.className}`}
                  >
                    <span>Presensi Manual</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL DETAIL DAFTAR SISWA PER KELAS */}
      {rosterClassModal && activeRosterClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">
                    Kelas {activeRosterClass.className}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                    Tingkat {activeRosterClass.gradeLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Wali Kelas: {activeRosterClass.homeroomTeacher} &middot; Total {activeRosterClass.totalCount} Siswa ({activeRosterClass.maleCount} L, {activeRosterClass.femaleCount} P)
                </p>
              </div>

              <button
                onClick={() => setRosterClassModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-center w-10">No</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3 text-center">L/P</th>
                    <th className="py-2.5 px-3">NIS / NISN</th>
                    <th className="py-2.5 px-3">Kontak Wali</th>
                    <th className="py-2.5 px-3 text-center">Kredensial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeRosterClass.students.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {student.address || 'Alamat belum diisi'}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                            student.gender === 'L'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {student.nis}
                        {student.nisn ? (
                          <span className="block text-[10px] text-slate-400">
                            {student.nisn}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2.5 px-3 text-slate-600">
                        <div className="font-medium text-[11px]">{student.parentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{student.parentPhone}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            RFID: {student.rfidTag}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setRosterClassModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
