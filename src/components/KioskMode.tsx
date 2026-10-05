import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { QRCameraScanner } from './QRCameraScanner';
import {
  Radio,
  QrCode,
  Clock,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Keyboard,
  UserCheck,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Student } from '../types/attendance';

export const KioskMode: React.FC = () => {
  const {
    students,
    attendanceRecords,
    settings,
    lastScanToast,
    clearLastScanToast,
    processScan,
    setCurrentView,
    updateSettings,
  } = useAttendance();

  const [activeScanTab, setActiveScanTab] = useState<'rfid' | 'qr'>('rfid');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [manualInput, setManualInput] = useState<string>('');
  const [rfidActiveAnimation, setRfidActiveAnimation] = useState<boolean>(false);
  const [selectedStudentForSim, setSelectedStudentForSim] = useState<string>(students[0]?.id || '');

  const rfidBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Live Clock updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hardware USB RFID Reader Wedge listener in Kiosk
  useEffect(() => {
    if (!settings.rfidWedgeMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      const isRfidSpecialInput = target && target.getAttribute('data-rfid-input') === 'true';

      if (isInput && !isRfidSpecialInput) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const buffered = rfidBufferRef.current.trim();
        rfidBufferRef.current = '';

        if (buffered.length >= 4) {
          e.preventDefault();
          setRfidActiveAnimation(true);
          setTimeout(() => setRfidActiveAnimation(false), 1200);
          processScan(buffered, 'RFID');
        }
      } else if (e.key.length === 1) {
        if (timeDiff > 250 && rfidBufferRef.current.length > 0) {
          rfidBufferRef.current = '';
        }
        rfidBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.rfidWedgeMode, processScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processScan(manualInput.trim(), 'RFID');
    setManualInput('');
  };

  const handleSimulateTap = (student: Student) => {
    setRfidActiveAnimation(true);
    setTimeout(() => setRfidActiveAnimation(false), 1200);
    processScan(student.rfidTag, 'RFID');
  };

  const handleQRScan = useCallback(
    (decoded: string) => {
      processScan(decoded, 'QR');
    },
    [processScan]
  );

  // Schedule status
  const hoursStr = String(currentTime.getHours()).padStart(2, '0');
  const minutesStr = String(currentTime.getMinutes()).padStart(2, '0');
  const secondsStr = String(currentTime.getSeconds()).padStart(2, '0');
  const timeStr = `${hoursStr}:${minutesStr}`;

  const isLatePeriod = timeStr > settings.checkInEndTime;
  const isCheckoutPeriod = timeStr >= settings.checkOutStartTime;

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords
    .filter((r) => r.date === todayDateStr)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/50 to-blue-50/40 text-slate-900 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Bar for Kiosk (Light Theme) */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
        {/* School Lockup */}
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/school_emblem_logo_1790745265553.jpg"
            alt="Logo Sekolah"
            className="w-10 h-10 rounded-full border-2 border-indigo-500/30 object-cover shadow-2xs"
          />
          <div>
            <div className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{settings.schoolName || 'SMA Negeri 1 Lumbung'}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                KIOSK ONLINE
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Terminal Presensi Mandiri Siswa (RFID Reader &amp; Kamera QR)
            </div>
          </div>
        </div>

        {/* Right Action: Sound toggle & Admin Login Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => updateSettings({ enableAudioBeep: !settings.enableAudioBeep })}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title={settings.enableAudioBeep ? 'Suara Beep & TTS Aktif' : 'Suara Dimatikan'}
          >
            {settings.enableAudioBeep ? (
              <Volume2 className="w-4 h-4 text-indigo-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-indigo-600 hover:text-white rounded-xl border border-slate-300 transition-all shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Dashboard Admin</span>
          </button>
        </div>
      </header>

      {/* Main Kiosk Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-center">
        {/* DIGITAL TIMER BESAR (Super Prominent Large Digital Clock Display) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs text-center relative overflow-hidden mb-6">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Session Pill Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border shadow-2xs ${
                isCheckoutPeriod
                  ? 'bg-sky-50 text-sky-700 border-sky-300'
                  : isLatePeriod
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                isCheckoutPeriod ? 'bg-sky-500' : isLatePeriod ? 'bg-amber-500' : 'bg-emerald-500 animate-ping'
              }`} />
              <span>
                {isCheckoutPeriod
                  ? 'Sesi Presensi Pulang'
                  : isLatePeriod
                  ? 'Sesi Masuk (Terlambat)'
                  : 'Sesi Masuk Pagi (Tepat Waktu)'}
              </span>
            </div>

            {/* MASSIVE DIGITAL TIMER */}
            <div className="text-6xl sm:text-8xl md:text-9xl font-mono font-black tracking-tight text-slate-900 tabular-nums select-none flex items-baseline justify-center drop-shadow-xs">
              <span>{hoursStr}:{minutesStr}</span>
              <span className="text-indigo-600 text-4xl sm:text-6xl md:text-7xl font-extrabold ml-1 animate-pulse">
                :{secondsStr}
              </span>
            </div>

            {/* Date and Time Info */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>
                  {currentTime.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>
              <span className="text-slate-300">&bull;</span>
              <span>
                Batas Tepat Waktu: <strong className="text-slate-900 font-mono font-bold">{settings.checkInEndTime} WIB</strong>
              </span>
              <span className="text-slate-300">&bull;</span>
              <span>
                Jam Pulang: <strong className="text-slate-900 font-mono font-bold">{settings.checkOutStartTime} WIB</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Central Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left: RFID & QR Scanner Box (Light Theme) */}
          <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            {/* Mode Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5 text-xs font-bold">
              <button
                onClick={() => setActiveScanTab('rfid')}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeScanTab === 'rfid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Kartu RFID</span>
              </button>
              <button
                onClick={() => setActiveScanTab('qr')}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeScanTab === 'qr'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Kamera QR Code</span>
              </button>
            </div>

            {/* Tab 1: RFID Tap Zone */}
            {activeScanTab === 'rfid' ? (
              <div className="space-y-5">
                <div
                  className={`p-8 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center ${
                    rfidActiveAnimation
                      ? 'border-indigo-500 bg-indigo-50 shadow-md scale-102'
                      : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-indigo-400'
                  }`}
                >
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 transition-transform ${
                      rfidActiveAnimation
                        ? 'bg-indigo-600 text-white scale-110 shadow-lg'
                        : 'bg-white border-2 border-indigo-100 text-indigo-600 shadow-xs animate-pulse'
                    }`}
                  >
                    <Radio className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {rfidActiveAnimation ? 'Kartu RFID Terbaca!' : 'Tempelkan Kartu RFID di Sini'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Dekatkan kartu pelajar ke sensor USB reader atau klik nama siswa pada simulasi di bawah.
                  </p>
                </div>

                {/* Quick Tap Simulation Deck */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Uji Coba Cepat (Simulasi Tap):</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Klik untuk tap</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {students.slice(0, 8).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSimulateTap(st)}
                        className="text-left p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-xs shadow-2xs"
                      >
                        <div className="font-bold text-slate-900 truncate">
                          {st.name.split(' ')[0]} {st.name.split(' ')[1] || ''}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {st.class}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Input input */}
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      data-rfid-input="true"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Atau ketik UID Kartu / NIS lalu tekan Enter..."
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-indigo-500 focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    Tap
                  </button>
                </form>
              </div>
            ) : (
              /* Tab 2: Live Camera QR Scanner */
              <div className="flex flex-col items-center space-y-4">
                <QRCameraScanner
                  isActive={activeScanTab === 'qr'}
                  onScanSuccess={handleQRScan}
                />

                {/* Manual QR / Barcode Scanner input box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!manualInput.trim()) return;
                    processScan(manualInput.trim(), 'QR');
                    setManualInput('');
                  }}
                  className="w-full flex gap-2"
                >
                  <div className="relative flex-1">
                    <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Atau scan barcode 2D / ketik kode QR (misal STD-2425001)..."
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-indigo-500 focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    Scan QR
                  </button>
                </form>

                {/* Quick Simulation Deck */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs flex items-center justify-between gap-2">
                  <span className="text-slate-600 font-bold">Uji Coba Cepat QR:</span>
                  <select
                    value={selectedStudentForSim}
                    onChange={(e) => setSelectedStudentForSim(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 flex-1 max-w-[200px] focus:outline-indigo-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.qrCode})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const st = students.find((s) => s.id === selectedStudentForSim);
                      if (st) processScan(st.qrCode, 'QR');
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-2xs"
                  >
                    Simulasi QR
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Result Card & Today's Feed (Light Theme) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            {/* Active Result Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex-1 flex flex-col justify-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Status Pemindaian Real-Time</span>
                {lastScanToast && (
                  <button
                    onClick={clearLastScanToast}
                    className="text-slate-400 hover:text-slate-600 text-[11px] font-medium"
                  >
                    Tutup
                  </button>
                )}
              </div>

              {lastScanToast ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      lastScanToast.type === 'out'
                        ? 'bg-sky-50 border-sky-300 text-sky-900'
                        : lastScanToast.status === 'Terlambat'
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {lastScanToast.status === 'Terlambat' ? (
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-wide">
                          {lastScanToast.type === 'out'
                            ? 'PRESENSI PULANG BERHASIL'
                            : lastScanToast.status === 'Terlambat'
                            ? 'PRESENSI TERLAMBAT'
                            : 'PRESENSI TEPAT WAKTU'}
                        </div>
                        <div className="text-[11px] font-medium opacity-80">
                          Pukul {lastScanToast.time} WIB &middot; via {lastScanToast.method}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full font-mono ${
                        lastScanToast.type === 'out'
                          ? 'bg-sky-200 text-sky-900'
                          : lastScanToast.status === 'Terlambat'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {lastScanToast.status}
                    </span>
                  </div>

                  {/* Student Profile Snapshot */}
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                      {lastScanToast.student.photoUrl ? (
                        <img
                          src={lastScanToast.student.photoUrl}
                          alt={lastScanToast.student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xl">
                          {lastScanToast.student.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-extrabold text-slate-900 truncate">
                        {lastScanToast.student.name}
                      </h4>
                      <p className="text-xs text-indigo-700 font-bold font-mono">
                        {lastScanToast.student.class}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        NIS: {lastScanToast.student.nis} &middot; NISN: {lastScanToast.student.nisn || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Menunggu Pemindaian Siswa</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Silakan tempelkan kartu RFID atau hadapkan kode QR ke kamera untuk mencatat kehadiran.
                  </p>
                </div>
              )}
            </div>

            {/* Today's Feed Mini List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Aktivitas Presensi Terkini</span>
                <span className="text-[11px] text-indigo-600 font-bold">Hari Ini</span>
              </div>

              {todayRecords.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  Belum ada presensi yang tercatat hari ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {todayRecords.map((r) => {
                    const st = students.find((s) => s.id === r.studentId);
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {st ? st.name : 'Siswa'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {st?.class} &middot; {r.checkInTime} WIB
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'Terlambat'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl mx-auto">
          <span>{settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Sistem Absensi Siswa RFID &amp; QR Code</span>
          <span className="font-mono text-[11px] text-slate-400">Versi 2.5 &middot; Siap Operasional</span>
        </div>
      </footer>
    </div>
  );
};
