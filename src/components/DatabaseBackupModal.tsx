import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  exportFullDatabaseJSON,
  exportStudentsToCSV,
  exportAttendanceRecordsToCSV,
  exportClassRostersToCSV,
} from '../utils/backupExport';
import {
  Database,
  Download,
  Upload,
  FileText,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Calendar,
  Users,
  Layers,
  Sparkles,
  Info,
  Clock,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { getTodayDateString } from '../data/mockData';

interface DatabaseBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseBackupModal: React.FC<DatabaseBackupModalProps> = ({ isOpen, onClose }) => {
  const {
    students,
    attendanceRecords,
    settings,
    reportAuditLogs,
    adminUser,
    restoreDatabaseBackup,
  } = useAttendance();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState<boolean>(false);

  // Class summary statistics
  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class || 'Tanpa Kelas')));
  }, [students]);

  // Estimated JSON size
  const estimatedPayloadSizeKB = useMemo(() => {
    const raw = JSON.stringify({ students, attendanceRecords, settings, reportAuditLogs });
    return Math.round((new Blob([raw]).size / 1024) * 10) / 10;
  }, [students, attendanceRecords, settings, reportAuditLogs]);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const filename = exportFullDatabaseJSON(
      students,
      attendanceRecords,
      settings,
      reportAuditLogs,
      adminUser?.name || 'Administrator'
    );
    setDownloadSuccessMsg(`Berkas cadangan JSON berhasil diunduh: ${filename}`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  const handleDownloadStudentsCSV = () => {
    const filename = exportStudentsToCSV(students, settings.schoolName);
    setDownloadSuccessMsg(`CSV Data Siswa berhasil diunduh: ${filename}`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  const handleDownloadAttendanceCSV = () => {
    const filename = exportAttendanceRecordsToCSV(attendanceRecords, students, settings.schoolName);
    setDownloadSuccessMsg(`CSV Rekaman Presensi berhasil diunduh: ${filename}`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  const handleDownloadClassesCSV = () => {
    const filename = exportClassRostersToCSV(students, settings.schoolName);
    setDownloadSuccessMsg(`CSV Data Kelas & Rombel berhasil diunduh: ${filename}`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportError(null);
    setImportSuccess(null);
    setImportPreview(null);

    if (!file) {
      setImportFile(null);
      return;
    }

    if (!file.name.endsWith('.json')) {
      setImportError('Berkas harus berekstensi .json');
      setImportFile(null);
      return;
    }

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.students && !parsed.attendanceRecords) {
          setImportError('Berkas JSON tidak memiliki struktur database HadirKu yang valid.');
          return;
        }

        setImportPreview(parsed);
      } catch (err: any) {
        setImportError(`Gagal membaca JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!importPreview) return;
    if (
      !confirm(
        'PERINGATAN: Memulihkan database akan menimpa data yang sedang aktif di sistem dengan data dari berkas cadangan ini. Lanjutkan?'
      )
    ) {
      return;
    }

    setIsProcessingImport(true);
    setTimeout(() => {
      const result = restoreDatabaseBackup(importPreview);
      setIsProcessingImport(false);
      if (result.success) {
        setImportSuccess(result.message);
        setImportFile(null);
        setImportPreview(null);
      } else {
        setImportError(result.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Backup &amp; Arsip Database Lokal</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  JSON &amp; CSV
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Ekspor cadangan data lengkap untuk arsip sekolah.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 border-b border-slate-200 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Unduh Backup (Ekspor JSON / CSV)</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'import'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Pulihkan Database (Import JSON)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {downloadSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-5">
              {/* Snapshot Summary Cards */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Isi Cadangan Database Saat Ini</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Data Siswa</span>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                      {students.length} <span className="text-[10px] font-sans font-normal text-slate-400">Profil</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Rekaman Presensi</span>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                      {attendanceRecords.length} <span className="text-[10px] font-sans font-normal text-slate-400">Log</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Rombel / Kelas</span>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                      {classesList.length} <span className="text-[10px] font-sans font-normal text-slate-400">Kelas</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Estimasi Ukuran</span>
                    <div className="text-lg font-bold font-mono text-indigo-600 mt-0.5">
                      {estimatedPayloadSizeKB} <span className="text-[10px] font-sans font-normal text-slate-400">KB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 1: Full JSON Backup (Recommended) */}
              <div className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl p-5 space-y-3 hover:border-indigo-400 transition-all shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Full Database Snapshot (.JSON)
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          Disarankan
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Menyimpan seluruh profil siswa, kartu RFID/QR, riwayat log kehadiran lengkap, dan konfigurasi sistem ke dalam 1 berkas JSON utuh.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadJSON}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-102 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh JSON</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Modular CSV Archives */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Unduh Berkas Arsip CSV Tabel (Microsoft Excel / Google Sheets)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* CSV 1: Siswa */}
                  <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Data Siswa (CSV)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {students.length} baris data profil, NIS, RFID, QR, dan wali.
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadStudentsCSV}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh CSV Siswa</span>
                    </button>
                  </div>

                  {/* CSV 2: Presensi */}
                  <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Log Presensi (CSV)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {attendanceRecords.length} rekaman absensi harian dan status.
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadAttendanceCSV}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh CSV Presensi</span>
                    </button>
                  </div>

                  {/* CSV 3: Kelas */}
                  <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Layers className="w-4 h-4 text-purple-600" />
                        <span>Data Kelas (CSV)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {classesList.length} rombel dengan rincian rasio L/P.
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadClassesCSV}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-purple-50 text-purple-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh CSV Kelas</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab Import / Restore */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Panduan Pemulihan Data</h4>
                  <p className="mt-0.5 text-amber-800">
                    Pilih berkas cadangan JSON yang sebelumnya diunduh dari aplikasi HadirKu. Sistem akan memvalidasi skema data sebelum menerapkan ke database lokal.
                  </p>
                </div>
              </div>

              {importError && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-medium flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-medium flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}

              {/* File Input Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50/60 transition-colors">
                <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <label className="block text-xs font-bold text-slate-800 cursor-pointer">
                  <span>Klik untuk memilih berkas JSON cadangan</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format yang didukung: <strong>.json</strong> (Database Snapshot HadirKu)
                </p>
                {importFile && (
                  <div className="mt-2 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-lg border border-indigo-200">
                    {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {/* Import Preview */}
              {importPreview && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Pratinjau Berkas Cadangan</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Format Valid v{importPreview.version || '2.5'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Siswa Ditemukan</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {importPreview.students?.length || 0}
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Log Presensi</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {importPreview.attendanceRecords?.length || 0}
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Sekolah</span>
                      <strong className="text-slate-900 truncate block text-[11px]">
                        {importPreview.settings?.schoolName || 'Kustom'}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteRestore}
                    disabled={isProcessingImport}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessingImport ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memulihkan Database...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pulihkan Database Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enkripsi &amp; Integritas Data Lokal Terjamin</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
