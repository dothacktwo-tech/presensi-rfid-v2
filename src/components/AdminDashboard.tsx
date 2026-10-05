import React, { useState } from 'react';
import { useAttendance, AdminTab } from '../context/AttendanceContext';
import { StudentList } from './StudentList';
import { ManualAttendance } from './ManualAttendance';
import { ClassManagement } from './ClassManagement';
import { AttendanceLogs } from './AttendanceLogs';
import { CardGenerator } from './CardGenerator';
import { SettingsModal } from './SettingsModal';
import { PDFReportModal } from './PDFReportModal';
import { DatabaseBackupModal } from './DatabaseBackupModal';
import { DashboardCharts } from './DashboardCharts';
import { DatabaseSettings } from './DatabaseSettings';
import { UserAccessManagement } from './UserAccessManagement';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Radio,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Menu,
  X,
  Sparkles,
  Layers,
  BarChart3,
  Calendar,
  Download,
  ChevronRight,
  Database,
  MoreHorizontal,
  ChevronUp,
  UserCog,
  Table,
} from 'lucide-react';
import { getTodayDateString } from '../data/mockData';

export const AdminDashboard: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    setCurrentView,
    logoutAdmin,
    adminUser,
    students,
    attendanceRecords,
    settings,
  } = useAttendance();

  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState<boolean>(false);

  const todayStr = getTodayDateString();
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);

  const totalStudents = students.length;
  const onTimeCount = todayRecords.filter((r) => r.status === 'Hadir').length;
  const lateCount = todayRecords.filter((r) => r.status === 'Terlambat').length;
  const permissionCount = todayRecords.filter(
    (r) => r.status === 'Izin' || r.status === 'Sakit'
  ).length;
  const notPresentCount = Math.max(0, totalStudents - (onTimeCount + lateCount + permissionCount));
  const rate = totalStudents > 0 ? Math.round(((onTimeCount + lateCount) / totalStudents) * 100) : 0;

  // Class & Rombel statistics
  const classNames = Array.from(new Set(students.map((s) => s.class || 'Tanpa Kelas')));
  const totalRombel = classNames.length;
  let rombelX = 0;
  let rombelXI = 0;
  let rombelXII = 0;
  let totalMaleStudents = 0;
  let totalFemaleStudents = 0;

  students.forEach((s) => {
    if (s.gender === 'L') totalMaleStudents++;
    else totalFemaleStudents++;
  });

  classNames.forEach((cls) => {
    const upper = cls.trim().toUpperCase();
    if (upper.startsWith('XII') || upper.startsWith('12')) rombelXII++;
    else if (upper.startsWith('XI') || upper.startsWith('11')) rombelXI++;
    else if (upper.startsWith('X') || upper.startsWith('10')) rombelX++;
  });

  const navCategories = [
    {
      categoryName: 'OPERASIONAL & PRESENSI',
      items: [
        { id: 'overview' as const, label: 'Dashboard & Ringkasan', icon: LayoutDashboard, badge: undefined },
        { id: 'manual' as const, label: 'Absensi Manual & Piket', icon: ClipboardCheck, badge: undefined },
        { id: 'recap' as const, label: 'Rekap Kehadiran', icon: FileText, badge: undefined },
      ],
    },
    {
      categoryName: 'DATA AKADEMIK & SISWA',
      items: [
        { id: 'students' as const, label: 'Data Master Siswa', icon: Users, badge: `${totalStudents}` },
        { id: 'classes' as const, label: 'Data Kelas (Rombel)', icon: GraduationCap, badge: `${totalRombel}` },
        { id: 'cards' as const, label: 'Kartu Pelajar & QR', icon: CreditCard, badge: undefined },
      ],
    },
    {
      categoryName: 'PENGATURAN & SISTEM',
      items: [
        { id: 'database' as const, label: 'Pengaturan Database', icon: Database, badge: 'Supabase' },
        { id: 'users' as const, label: 'Hak Akses Pengguna', icon: UserCog, badge: undefined },
        { id: 'settings' as const, label: 'Pengaturan Sekolah', icon: Settings, badge: undefined },
      ],
    },
  ];

  const handleNavClick = (tabId: AdminTab) => {
    setAdminTab(tabId);
    setIsMobileSidebarOpen(false);
    setIsMobileMoreOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Top Navbar with Hamburger Toggle */}
      <header className="lg:hidden border-b border-slate-200 bg-white px-4 py-3 sticky top-0 z-40 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/src/assets/images/school_emblem_logo_1790745265553.jpg"
              alt="Logo Sekolah"
              className="w-7 h-7 rounded-full border border-indigo-200 object-cover"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {settings.schoolName || 'SMA Negeri 1 Lumbung'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Panel Administrator</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Backup & Arsip Database"
          >
            <Database className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Unduh Laporan PDF"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentView('kiosk')}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Buka Mode Kiosk"
          >
            <Radio className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col justify-between shadow-2xl border-r border-slate-200 z-10 animate-in slide-in-from-left">
            {/* Sidebar Brand Top */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/src/assets/images/school_emblem_logo_1790745265553.jpg"
                  alt="Logo Sekolah"
                  className="w-9 h-9 rounded-full border border-indigo-300 object-cover shadow-2xs"
                />
                <div>
                  <h2 className="text-xs font-bold text-slate-900 leading-tight">
                    {settings.schoolName || 'SMA Negeri 1 Lumbung'}
                  </h2>
                  <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">
                    Panel Admin
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Mobile Sidebar */}
            <div className="p-3 border-b border-slate-100 space-y-1.5">
              <button
                onClick={() => {
                  setIsBackupModalOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Backup Database</span>
                </div>
                <Download className="w-3 h-3 text-emerald-500" />
              </button>
            </div>

            {/* Nav Menu Categorized */}
            <nav className="p-3 space-y-4 overflow-y-auto flex-1">
              {navCategories.map((category, catIdx) => (
                <div key={catIdx} className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{category.categoryName}</span>
                  </div>
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = adminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-indigo-700 text-indigo-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Sidebar Bottom Profile */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-2">
              <button
                onClick={() => {
                  setCurrentView('kiosk');
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-300" />
                <span>Buka Mode Kiosk</span>
              </button>

              <button
                onClick={logoutAdmin}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100/50 rounded-xl transition-colors border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200 min-h-screen flex-col justify-between sticky top-0 h-screen z-30 shadow-xs">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-200/80 flex items-center gap-3">
            <img
              src="/src/assets/images/school_emblem_logo_1790745265553.jpg"
              alt="Logo Sekolah"
              className="w-10 h-10 rounded-full border border-indigo-300 object-cover shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-xs font-extrabold text-slate-900 leading-tight truncate" title={settings.schoolName}>
                {settings.schoolName || 'SMA Negeri 1 Lumbung'}
              </h2>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block mt-0.5">
                Dashboard Admin
              </span>
            </div>
          </div>

          {/* Quick Actions in Sidebar */}
          <div className="p-3 border-b border-slate-100 space-y-1.5">
            <button
              onClick={() => setCurrentView('kiosk')}
              className="w-full flex items-center justify-between px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-101"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-indigo-300" />
                <span>Buka Terminal Kiosk</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Unduh Laporan PDF</span>
              </div>
              <Download className="w-3 h-3 text-rose-400" />
            </button>

            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backup Database</span>
              </div>
              <Download className="w-3 h-3 text-emerald-500" />
            </button>
          </div>

          {/* Navigation Menu Links Categorized */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navCategories.map((category, catIdx) => (
              <div key={catIdx} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>{category.categoryName}</span>
                </div>
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = adminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold border-l-4 border-indigo-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Box */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {(adminUser?.name || 'Admin').charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {adminUser?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  @{adminUser?.username || 'admin'}
                </div>
              </div>
            </div>

            <button
              onClick={logoutAdmin}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="Keluar dari akun admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area on the right of the Sidebar */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-24 lg:pb-8">
        {adminTab === 'overview' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* 1. JUDUL MENU CARD OVERVIEW (HERO CARD WITH KEY METRICS) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>OVERVIEW &amp; KONTROL PRESENSI SEKOLAH</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Selamat Datang, {adminUser?.name || 'Administrator'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Pantauan kehadiran siswa harian, status scan kartu RFID &amp; kamera QR Code, serta rekapitulasi data kehadiran real-time.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
                  <button
                    onClick={() => setIsBackupModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
                    title="Unduh Cadangan Database Lengkap (JSON & CSV)"
                  >
                    <Database className="w-4 h-4" />
                    <span>Backup Database</span>
                  </button>

                  <button
                    onClick={() => setIsPdfModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
                    title="Unduh Laporan Rekapitulasi PDF"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Unduh Laporan PDF</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('kiosk')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
                  >
                    <Radio className="w-4 h-4 text-indigo-300" />
                    <span>Terminal Kiosk</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Metric Counters in Hero Card */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-indigo-800/40">
                {/* Total Siswa */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
                  <span className="text-[11px] text-indigo-200 font-medium">Total Siswa</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                    {totalStudents} <span className="text-xs font-normal text-slate-300">Siswa</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Database terdaftar</span>
                </div>

                {/* Hadir Tepat Waktu */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
                  <span className="text-[11px] text-emerald-300 font-medium">Hadir Tepat Waktu</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                    {onTimeCount}
                  </div>
                  <span className="text-[10px] text-slate-400">Sebelum {settings.checkInEndTime}</span>
                </div>

                {/* Terlambat */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
                  <span className="text-[11px] text-amber-300 font-medium">Terlambat</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                    {lateCount}
                  </div>
                  <span className="text-[10px] text-slate-400">Setelah batas jam masuk</span>
                </div>

                {/* Izin / Sakit */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
                  <span className="text-[11px] text-sky-300 font-medium">Izin / Sakit</span>
                  <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
                    {permissionCount}
                  </div>
                  <span className="text-[10px] text-slate-400">Dispensasi resmi</span>
                </div>

                {/* Tingkat Kehadiran */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-indigo-200 font-medium">% Kehadiran</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                    {rate}%
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {onTimeCount + lateCount} dari {totalStudents} hadir
                  </span>
                </div>
              </div>
            </div>

            {/* 2. DATA VISUALIZATION SECTION USING RECHARTS */}
            <DashboardCharts
              students={students}
              attendanceRecords={attendanceRecords}
              settings={settings}
            />

            {/* 3. QUICK ACTION NAVIGATION CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Card 1: Absensi Manual */}
              <button
                onClick={() => setAdminTab('manual')}
                className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Absensi Manual
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Catat presensi langsung, filter yang belum absen, serta input terlambat/izin/sakit/alpa.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  <span>Buka Presensi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 2: Data Kelas & Rombel */}
              <button
                onClick={() => setAdminTab('classes')}
                className="text-left bg-white border-2 border-indigo-200/80 hover:border-indigo-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between bg-gradient-to-b from-indigo-50/30 to-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {totalRombel} Rombel
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Data Kelas &amp; Rombel
                  </h3>

                  <div className="mt-2 space-y-1 text-xs">
                    <div className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                      <span className="text-slate-400">Tingkat:</span>
                      <span className="font-bold text-slate-800 font-mono">X ({rombelX}) &middot; XI ({rombelXI}) &middot; XII ({rombelXII})</span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                      <span className="text-slate-400">Total:</span>
                      <span className="font-bold text-indigo-700 font-mono">{totalStudents} Siswa</span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-0.5">
                      <span className="text-sky-600 font-mono font-semibold">♂ {totalMaleStudents} L</span>
                      <span>&bull;</span>
                      <span className="text-pink-600 font-mono font-semibold">♀ {totalFemaleStudents} P</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <span>Lihat Rombel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 3: Data Siswa */}
              <button
                onClick={() => setAdminTab('students')}
                className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Kelola Data Siswa
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tambah siswa, pasangkan nomor UID kartu RFID fisik, atau nomor WA orang tua.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <span>Buka Data Siswa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 4: Rekap Kehadiran */}
              <button
                onClick={() => setAdminTab('recap')}
                className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Rekap Kehadiran
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Lihat total kehadiran kumulatif per siswa, persentase disiplin, dan cetak PDF.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span>Buka Rekap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 5: Kartu Pelajar Digital */}
              <button
                onClick={() => setAdminTab('cards')}
                className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Kartu Pelajar &amp; QR
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cetak dan unduh kartu pelajar resmi dengan foto, QR Code, dan barcode sekolah.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-amber-600 flex items-center gap-1">
                  <span>Buka Kartu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 6: Pengaturan Database Supabase */}
              <button
                onClick={() => setAdminTab('database')}
                className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Pengaturan Database (Supabase)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Skema tabel, relasi, kebijakan keamanan RLS, dan skrip SQL DDL siap salin.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span>Buka Database</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 7: Hak Akses Pengguna */}
              <button
                onClick={() => setAdminTab('users')}
                className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-500 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Hak Akses Pengguna
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Kelola akun petugas, wewenang modul guru piket, wali kelas, dan super admin.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  <span>Kelola User</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {adminTab === 'manual' && <ManualAttendance />}
        {adminTab === 'classes' && <ClassManagement />}
        {adminTab === 'students' && <StudentList />}
        {adminTab === 'recap' && <AttendanceLogs />}
        {adminTab === 'cards' && <CardGenerator />}
        {adminTab === 'database' && <DatabaseSettings />}
        {adminTab === 'users' && <UserAccessManagement />}
        {adminTab === 'settings' && <SettingsModal />}
      </main>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] lg:hidden transition-all pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] pt-1.5"
      >
        <div className="grid grid-cols-5 items-center justify-around px-1 max-w-lg mx-auto">
          {/* 1. Beranda / Overview */}
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none ${
              adminTab === 'overview'
                ? 'text-indigo-600 font-bold scale-102'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                adminTab === 'overview'
                  ? 'bg-indigo-100 text-indigo-700 shadow-2xs'
                  : 'bg-transparent text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10.5px] tracking-tight mt-0.5 font-medium">Beranda</span>
          </button>

          {/* 2. Absensi Manual (Attendance Module) */}
          <button
            type="button"
            onClick={() => handleNavClick('manual')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none ${
              adminTab === 'manual'
                ? 'text-indigo-600 font-bold scale-102'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  adminTab === 'manual'
                    ? 'bg-indigo-100 text-indigo-700 shadow-2xs'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                <ClipboardCheck className="w-5 h-5" />
              </div>
              {notPresentCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold font-mono flex items-center justify-center shadow-xs ring-2 ring-white animate-pulse">
                  {notPresentCount}
                </span>
              )}
            </div>
            <span className="text-[10.5px] tracking-tight mt-0.5 font-medium">Absensi</span>
          </button>

          {/* 3. Data Siswa (Students Module) */}
          <button
            type="button"
            onClick={() => handleNavClick('students')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none ${
              adminTab === 'students'
                ? 'text-indigo-600 font-bold scale-102'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  adminTab === 'students'
                    ? 'bg-indigo-100 text-indigo-700 shadow-2xs'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              {totalStudents > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-3.5 px-0.5 rounded-full bg-slate-200 text-slate-700 text-[8.5px] font-bold font-mono flex items-center justify-center">
                  {totalStudents}
                </span>
              )}
            </div>
            <span className="text-[10.5px] tracking-tight mt-0.5 font-medium">Siswa</span>
          </button>

          {/* 4. Rekap Laporan Kehadiran (Reports Module) */}
          <button
            type="button"
            onClick={() => handleNavClick('recap')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none ${
              adminTab === 'recap'
                ? 'text-indigo-600 font-bold scale-102'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                adminTab === 'recap'
                  ? 'bg-indigo-100 text-indigo-700 shadow-2xs'
                  : 'bg-transparent text-slate-500'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10.5px] tracking-tight mt-0.5 font-medium">Laporan</span>
          </button>

          {/* 5. Menu Lainnya (More Modules Drawer Sheet) */}
          <button
            type="button"
            onClick={() => setIsMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none ${
              ['classes', 'cards', 'settings'].includes(adminTab)
                ? 'text-indigo-600 font-bold scale-102'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  ['classes', 'cards', 'settings'].includes(adminTab)
                    ? 'bg-indigo-100 text-indigo-700 shadow-2xs'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </div>
              {['classes', 'cards', 'settings'].includes(adminTab) && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              )}
            </div>
            <span className="text-[10.5px] tracking-tight mt-0.5 font-medium">Lainnya</span>
          </button>
        </div>
      </nav>

      {/* Mobile "Menu Lainnya" Bottom Sheet Drawer */}
      {isMobileMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMoreOpen(false)}
          />

          <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 z-10 flex flex-col animate-in slide-in-from-bottom duration-200 overflow-hidden">
            {/* Sheet Handle and Header */}
            <div className="p-4 pb-2 border-b border-slate-100 text-center relative shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between px-2">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-900">Menu &amp; Modul Lainnya</h3>
                  <p className="text-[11px] text-slate-500">Pilih modul administrasi atau alat cepat</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMoreOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sheet Body Links Grid */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Secondary Modules Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Data Kelas */}
                <button
                  type="button"
                  onClick={() => handleNavClick('classes')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    adminTab === 'classes'
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Data Kelas</span>
                      <span className="text-[10px] font-mono bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">
                        {totalRombel} Rombel
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Tingkat X, XI, XII &amp; rasio L/P</p>
                  </div>
                </button>

                {/* 2. Kartu Pelajar Digital */}
                <button
                  type="button"
                  onClick={() => handleNavClick('cards')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    adminTab === 'cards'
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Kartu Pelajar &amp; QR</div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Desain background, barcode &amp; cetak</p>
                  </div>
                </button>

                {/* 3. Pengaturan Database Supabase */}
                <button
                  type="button"
                  onClick={() => handleNavClick('database')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    adminTab === 'database'
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Database Supabase</div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Skema SQL, RLS &amp; salin DDL</p>
                  </div>
                </button>

                {/* 4. Hak Akses Pengguna */}
                <button
                  type="button"
                  onClick={() => handleNavClick('users')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    adminTab === 'users'
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                    <UserCog className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hak Akses User</div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Akun petugas, piket &amp; role</p>
                  </div>
                </button>

                {/* 5. Pengaturan Sistem Sekolah */}
                <button
                  type="button"
                  onClick={() => handleNavClick('settings')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    adminTab === 'settings'
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-2">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Pengaturan Sekolah</div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Jam sekolah, audio, ON/OFF checkout</p>
                  </div>
                </button>

                {/* 6. Unduh Laporan PDF */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPdfModalOpen(true);
                    setIsMobileMoreOpen(false);
                  }}
                  className="p-3 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-left flex flex-col justify-between transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-900">Cetak Laporan PDF</div>
                    <p className="text-[10.5px] text-rose-600/80 mt-0.5">Format A4 resmi &amp; TTD Kepsek</p>
                  </div>
                </button>
              </div>

              {/* Utility Actions Bar */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupModalOpen(true);
                    setIsMobileMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl border border-emerald-200/90 text-xs font-bold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-2xs">
                      <Database className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div>Backup &amp; Arsip Database</div>
                      <div className="text-[10.5px] font-normal text-emerald-700">Unduh JSON &amp; CSV siswa &amp; absensi</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('kiosk');
                    setIsMobileMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/20 text-white rounded-xl">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div>Buka Terminal Kiosk Pemindaian</div>
                      <div className="text-[10.5px] font-normal text-indigo-200">Mode layar penuh pemindaian siswa</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-200" />
                </button>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMoreOpen(false);
                  logoutAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Export Modal */}
      <PDFReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Database Backup & Restore Modal */}
      <DatabaseBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};
