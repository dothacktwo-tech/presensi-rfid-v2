import React, { useState, useMemo, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types/attendance';
import { getTodayDateString, getDateOffset } from '../data/mockData';
import {
  generateAttendancePDF,
  downloadGeneratedPDF,
  PDFExportFilter,
  PDFExportResult,
} from '../utils/pdfExport';
import {
  FileText,
  Download,
  Eye,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Sparkles,
  ShieldCheck,
  History,
  Printer,
  ChevronRight,
  Maximize2,
  FileCheck,
} from 'lucide-react';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: string;
  initialStudentId?: string;
  initialStatus?: 'ALL' | AttendanceStatus;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({
  isOpen,
  onClose,
  initialClass = 'ALL',
  initialStudentId = 'ALL',
  initialStatus = 'ALL',
}) => {
  const {
    students,
    attendanceRecords,
    settings,
    adminUser,
    addReportAuditLog,
    reportAuditLogs,
  } = useAttendance();

  const todayStr = getTodayDateString();

  // Active tab inside modal: 'generate' (Form & Preview) vs 'audit' (Log Riwayat Unduhan)
  const [modalTab, setModalTab] = useState<'generate' | 'audit'>('generate');

  // Filter States
  const [startDate, setStartDate] = useState<string>(getDateOffset(6)); // Last 7 days by default
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | AttendanceStatus>(initialStatus);

  // PDF Preview & Generation States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pdfResult, setPdfResult] = useState<PDFExportResult | null>(null);
  const [previewActive, setPreviewActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Reset or initialize filters when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialClass) setSelectedClass(initialClass);
      if (initialStudentId) setSelectedStudentId(initialStudentId);
      if (initialStatus) setSelectedStatus(initialStatus);
      setPreviewActive(false);
      setPdfResult(null);
      setStatusMessage(null);
    }
  }, [isOpen, initialClass, initialStudentId, initialStatus]);

  // Clean up blob URL on unmount or new generation
  useEffect(() => {
    return () => {
      if (pdfResult?.blobUrl) {
        URL.revokeObjectURL(pdfResult.blobUrl);
      }
    };
  }, [pdfResult]);

  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class))).sort();
  }, [students]);

  const studentsInSelectedClass = useMemo(() => {
    if (selectedClass === 'ALL') return students;
    return students.filter((s) => s.class === selectedClass);
  }, [students, selectedClass]);

  // Quick Preset Date Ranges
  const handleSetPresetRange = (preset: 'today' | '7days' | 'month' | 'all') => {
    const today = getTodayDateString();
    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === '7days') {
      setStartDate(getDateOffset(6));
      setEndDate(today);
    } else if (preset === 'month') {
      const now = new Date();
      const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      setStartDate(firstDay);
      setEndDate(today);
    } else if (preset === 'all') {
      setStartDate('2025-01-01');
      setEndDate(today);
    }
  };

  // Preview count of matching records based on current filters
  const matchingRecords = useMemo(() => {
    const studentMap = new Map(students.map((s) => [s.id, s]));

    return attendanceRecords.filter((r) => {
      if (r.date < startDate || r.date > endDate) return false;
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;

      const st = studentMap.get(r.studentId);
      if (!st) return false;
      if (selectedClass !== 'ALL' && st.class !== selectedClass) return false;
      if (selectedStudentId !== 'ALL' && r.studentId !== selectedStudentId) return false;

      return true;
    });
  }, [attendanceRecords, students, startDate, endDate, selectedClass, selectedStudentId, selectedStatus]);

  // Generate target filename preview
  const estimatedFileName = useMemo(() => {
    const cleanClass =
      selectedClass === 'ALL' ? 'Semua_Kelas' : selectedClass.replace(/[^a-zA-Z0-9]/g, '_');
    return `Laporan_Absensi_${cleanClass}_${startDate}_sampai_${endDate}.pdf`;
  }, [selectedClass, startDate, endDate]);

  // Handle PDF Generation (for Preview or Direct Download)
  const handleGeneratePDF = async (mode: 'preview' | 'download') => {
    if (matchingRecords.length === 0) {
      alert('Tidak ada data presensi yang sesuai dengan rentang tanggal dan filter yang dipilih.');
      return;
    }

    try {
      setIsGenerating(true);
      setStatusMessage('Membuat laporan PDF...');

      const filter: PDFExportFilter = {
        startDate,
        endDate,
        selectedClass,
        selectedStudentId,
        selectedStatus,
      };

      const printedBy = adminUser ? `${adminUser.name} (${adminUser.username})` : 'Administrator Sekolah';
      const result = await generateAttendancePDF(
        attendanceRecords,
        students,
        settings,
        filter,
        printedBy
      );

      setPdfResult(result);

      // Record Audit Log (Requirement 15)
      addReportAuditLog({
        userId: adminUser?.username || 'admin',
        userName: adminUser?.name || 'Administrator Sekolah',
        downloadTime: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        reportType: 'PDF Rekapitulasi Absensi',
        dateRange: `${startDate} s/d ${endDate}`,
        selectedClass: selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass,
        totalRecords: result.totalRecords,
        fileName: result.fileName,
      });

      if (mode === 'preview') {
        setPreviewActive(true);
        setStatusMessage('Pratinjau PDF siap.');
      } else {
        downloadGeneratedPDF(result.doc, result.fileName);
        setStatusMessage('Laporan PDF berhasil diunduh.');
      }
    } catch (err) {
      console.error('Gagal membuat laporan PDF', err);
      setStatusMessage('Gagal membuat laporan PDF. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Unduh Laporan Rekapitulasi PDF</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  A4 Landscape
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {settings.schoolName || 'SMA Negeri 1 Lumbung'} · Format Cetak Resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Modal Tabs */}
            <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setModalTab('generate')}
                className={`px-3 py-1 rounded transition-colors ${
                  modalTab === 'generate'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Buat Laporan
              </button>
              <button
                onClick={() => setModalTab('audit')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                  modalTab === 'audit'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <History className="w-3 h-3" />
                <span>Log Unduhan ({reportAuditLogs.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {modalTab === 'generate' ? (
            <>
              {/* Filter Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <span>Filter Data Laporan PDF</span>
                  </span>

                  {/* Preset date chips */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400 mr-1 hidden sm:inline">Pilihan Cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleSetPresetRange('today')}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetRange('7days')}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-semibold"
                    >
                      7 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetRange('month')}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                    >
                      Bulan Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetRange('all')}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                    >
                      Semua
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Rentang Tanggal Mulai */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 font-mono bg-white"
                    />
                  </div>

                  {/* Rentang Tanggal Akhir */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 font-mono bg-white"
                    />
                  </div>

                  {/* Filter Kelas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kelas
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedStudentId('ALL'); // Reset student selection
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
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

                  {/* Filter Siswa */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Siswa Spesifik
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                    >
                      <option value="ALL">Semua Siswa Terdaftar</option>
                      {studentsInSelectedClass.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.nis})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Status Kehadiran */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status Kehadiran
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                    >
                      <option value="ALL">Semua Status (Hadir, Terlambat, Izin, Sakit, Alpa)</option>
                      <option value="Hadir">Hadir Tepat Waktu</option>
                      <option value="Terlambat">Terlambat</option>
                      <option value="Izin">Izin</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Alpha">Alpa / Tanpa Keterangan</option>
                    </select>
                  </div>

                  {/* Data Summary Quick Pill */}
                  <div className="flex flex-col justify-end">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-xs text-indigo-900 flex items-center justify-between">
                      <span className="font-medium">Data Terfilter:</span>
                      <span className="font-bold font-mono text-sm text-indigo-700">
                        {matchingRecords.length} Data
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target File Name Preview */}
                <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Nama File PDF:</span>
                  <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded truncate">
                    {estimatedFileName}
                  </span>
                </div>
              </div>

              {/* Status Message Indicator */}
              {statusMessage && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                </div>
              )}

              {/* Interactive PDF Preview Frame */}
              {previewActive && pdfResult && (
                <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-md bg-slate-900">
                  <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold">Pratinjau Dokumen PDF ({pdfResult.fileName})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadGeneratedPDF(pdfResult.doc, pdfResult.fileName)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File Ini</span>
                      </button>
                      <button
                        onClick={() => {
                          const win = window.open(pdfResult.blobUrl, '_blank');
                          win?.focus();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition-colors"
                        title="Buka di Tab Penuh"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Tab Baru</span>
                      </button>
                    </div>
                  </div>

                  {/* Embed Iframe Viewer */}
                  <div className="w-full h-[360px] sm:h-[440px] bg-slate-100">
                    <iframe
                      src={pdfResult.blobUrl}
                      title="PDF Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Audit Log View (Requirement 15) */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Riwayat Unduhan Laporan (Audit Log)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mencatat setiap admin atau pengguna yang mengunduh laporan PDF demi transparansi dan audit
                  </p>
                </div>
              </div>

              {reportAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  Belum ada laporan yang diunduh pada sesi ini.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Waktu Unduh</th>
                        <th className="py-2.5 px-3">Pengguna</th>
                        <th className="py-2.5 px-3">Kelas & Periode</th>
                        <th className="py-2.5 px-3 text-center">Jumlah Data</th>
                        <th className="py-2.5 px-3">Nama Berkas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {log.downloadTime}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {log.userName}
                            <span className="text-[10px] text-slate-400 block font-normal">
                              ID: {log.userId}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            <span className="font-semibold">{log.selectedClass}</span>
                            <span className="text-[10px] text-slate-400 block">{log.dateRange}</span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-indigo-600">
                            {log.totalRecords}
                          </td>
                          <td className="py-2 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[180px]">
                            {log.fileName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kop Resmi: <strong>{settings.schoolName || 'SMA Negeri 1 Lumbung'}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Tutup
            </button>

            {/* PREVIEW BUTTON */}
            <button
              type="button"
              onClick={() => handleGeneratePDF('preview')}
              disabled={isGenerating || matchingRecords.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-2xs transition-colors disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isGenerating ? 'Memproses...' : 'Preview PDF'}</span>
            </button>

            {/* DOWNLOAD BUTTON */}
            <button
              type="button"
              onClick={() => handleGeneratePDF('download')}
              disabled={isGenerating || matchingRecords.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Membuat Laporan...' : 'Unduh PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
