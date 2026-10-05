import React, { useState, useEffect, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types/attendance';
import { StudentModal } from './StudentModal';
import { generateQRCodeDataUrl } from '../utils/qr';
import {
  Users,
  Search,
  Plus,
  Radio,
  QrCode,
  Edit2,
  Trash2,
  CreditCard,
  X,
  Phone,
  CheckCircle,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { exportStudentsToCSV } from '../utils/backupExport';

export const StudentList: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, processScan, setCurrentView, setAdminTab, settings } =
    useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Pagination State (Default 10 per page as requested)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // QR Preview Modal
  const [qrModalStudent, setQrModalStudent] = useState<Student | null>(null);
  const [qrModalImage, setQrModalImage] = useState<string>('');

  // Extract unique classes
  const classesList = Array.from(new Set(students.map((s) => s.class))).sort();

  const maleCount = students.filter((s) => s.gender === 'L').length;
  const femaleCount = students.filter((s) => s.gender === 'P').length;

  // Filter students based on search and class selection
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rfidTag.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClass === 'ALL' || s.class === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, selectedClass]);

  // Reset page to 1 when filters or page limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass, itemsPerPage]);

  // Calculate pagination boundaries
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredStudents, startIdx, itemsPerPage]);

  const handleOpenQRModal = async (student: Student) => {
    setQrModalStudent(student);
    const dataUrl = await generateQRCodeDataUrl(student.qrCode, 240);
    setQrModalImage(dataUrl);
  };

  const handleQuickTap = (student: Student) => {
    processScan(student.rfidTag, 'RFID');
    setCurrentView('kiosk');
  };

  const handleDownloadStudents = () => {
    const target = selectedClass === 'ALL' ? students : filteredStudents;
    const filename = exportStudentsToCSV(target, settings.schoolName);
    setDownloadFeedback(`Data siswa (${target.length} orang) berhasil diunduh: ${filename}`);
    setTimeout(() => setDownloadFeedback(null), 3500);
  };

  const handleSaveStudent = (data: Omit<Student, 'id'>) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, data);
    } else {
      addStudent(data);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. JUDUL MENU CARD DATA SISWA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-2.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>DATABASE &amp; REGISTRASI KARTU PESERTA DIDIK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Manajemen Data Siswa &amp; Kredensial RFID / QR
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Kelola profil siswa, NIS/NISN, pemetaan nomor UID kartu fisik RFID reader, serta kode QR presensi otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            {/* Tombol Unduh Data Siswa Khusus Menu Ini */}
            <button
              onClick={handleDownloadStudents}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 shadow-md transition-all hover:scale-102"
              title="Unduh Berkas CSV Data Siswa Lengkap"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Unduh Data Siswa</span>
            </button>

            <button
              onClick={() => {
                setEditingStudent(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>
        </div>

        {downloadFeedback && (
          <div className="relative z-10 mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-medium rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadFeedback}</span>
          </div>
        )}

        {/* Quick KPI stats in Hero Card */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-indigo-800/40">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
            <span className="text-[11px] text-indigo-200 font-medium">Total Siswa Terdaftar</span>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {students.length} <span className="text-xs font-normal text-slate-300">Siswa</span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
            <span className="text-[11px] text-indigo-200 font-medium">Jumlah Rombel</span>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {classesList.length} <span className="text-xs font-normal text-slate-300">Kelas</span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
            <span className="text-[11px] text-sky-300 font-medium">Laki-laki (L)</span>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
              {maleCount} <span className="text-xs font-normal text-slate-300">Siswa</span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
            <span className="text-[11px] text-pink-300 font-medium">Perempuan (P)</span>
            <div className="text-2xl font-bold font-mono text-pink-400 mt-1 tabular-nums">
              {femaleCount} <span className="text-xs font-normal text-slate-300">Siswa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIS, NISN, atau RFID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Filter Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500"
          >
            <option value="ALL">Semua Kelas ({students.length})</option>
            {classesList.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">RFID UID</th>
                <th className="py-3 px-4">QR Code</th>
                <th className="py-3 px-4">Kontak Ortu</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data siswa yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Auto Increment Number Column */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-500 text-xs">
                      {startIdx + idx + 1}
                    </td>

                    {/* Student Info without photo thumbnail */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${student.gender === 'L' ? 'bg-sky-500' : 'bg-pink-500'}`} />
                        <span>{student.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span>
                      </div>
                    </td>

                    {/* NIS / NISN */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="text-slate-900 font-medium">{student.nis}</div>
                      <div className="text-slate-400">{student.nisn || '-'}</div>
                    </td>

                    {/* Kelas */}
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {student.class}
                    </td>

                    {/* RFID Tag */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100">
                        <Radio className="w-3 h-3 text-indigo-500" />
                        <span>{student.rfidTag}</span>
                      </div>
                    </td>

                    {/* QR Code Button */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenQRModal(student)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Lihat QR</span>
                      </button>
                    </td>

                    {/* Parent Contact */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 text-[11px]">{student.parentName}</div>
                      <a
                        href={`https://wa.me/${student.parentPhone.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 font-mono"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>{student.parentPhone}</span>
                      </a>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleQuickTap(student)}
                          title="Simulasikan Tap RFID Siswa Ini"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Radio className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setModalOpen(true);
                          }}
                          title="Ubah Data Siswa"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus siswa ${student.name}?`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          title="Hapus Siswa"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan{' '}
              <strong className="font-mono text-slate-900">
                {totalItems === 0 ? 0 : startIdx + 1}
              </strong>{' '}
              -{' '}
              <strong className="font-mono text-slate-900">
                {Math.min(startIdx + itemsPerPage, totalItems)}
              </strong>{' '}
              dari <strong className="font-mono text-slate-900">{totalItems}</strong> siswa
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Limit Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Tampilkan:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg text-xs font-semibold px-2 py-1 text-slate-700 focus:outline-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, and pages around current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, arr) => {
                    const prev = arr[index - 1];
                    const showEllipsis = prev && page - prev > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="text-slate-400 px-1">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white shadow-2xs font-mono'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Edit/Add Modal */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStudent}
        initialData={editingStudent}
      />

      {/* Quick QR Viewer Modal */}
      {qrModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                QR Code Presensi
              </span>
              <button
                onClick={() => setQrModalStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-48 h-48 mx-auto p-2 bg-white border border-slate-200 rounded-xl shadow-xs mb-3 flex items-center justify-center">
              {qrModalImage && (
                <img
                  src={qrModalImage}
                  alt={`QR Code ${qrModalStudent.name}`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <h4 className="text-base font-bold text-slate-900">{qrModalStudent.name}</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {qrModalStudent.class} · NIS: {qrModalStudent.nis}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Payload: <span className="text-slate-700 font-semibold">{qrModalStudent.qrCode}</span>
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  processScan(qrModalStudent.qrCode, 'QR');
                  setQrModalStudent(null);
                  setCurrentView('kiosk');
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Simulasikan Scan QR Ini
              </button>
              <button
                onClick={() => setQrModalStudent(null)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
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
