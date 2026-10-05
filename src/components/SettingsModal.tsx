import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { DatabaseBackupModal } from './DatabaseBackupModal';
import {
  CardBackgroundTheme,
  CardPatternType,
} from '../types/attendance';
import {
  CARD_THEME_PRESETS,
  CARD_PATTERN_PRESETS,
  SAMPLE_BACKGROUND_WALLPAPERS,
  getCardStyles,
} from '../utils/cardThemes';
import {
  Settings as SettingsIcon,
  Clock,
  Volume2,
  Send,
  Building,
  RotateCcw,
  CheckCircle,
  Radio,
  FileSpreadsheet,
  Database,
  Download,
  Upload,
  ShieldCheck,
  Palette,
  CreditCard,
  Sparkles,
  Image as ImageIcon,
  Check,
  Eye,
  Trash2,
  Layers,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useAttendance();

  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [schoolNPSN, setSchoolNPSN] = useState(settings.schoolNPSN);
  const [schoolAddress, setSchoolAddress] = useState(settings.schoolAddress);
  const [principalName, setPrincipalName] = useState(settings.principalName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);

  const [checkInStartTime, setCheckInStartTime] = useState(settings.checkInStartTime);
  const [checkInEndTime, setCheckInEndTime] = useState(settings.checkInEndTime);
  const [checkOutStartTime, setCheckOutStartTime] = useState(settings.checkOutStartTime);
  const [enableCheckOut, setEnableCheckOut] = useState<boolean>(settings.enableCheckOut ?? true);

  const [enableAudioBeep, setEnableAudioBeep] = useState(settings.enableAudioBeep);
  const [enableTTS, setEnableTTS] = useState(settings.enableTTS);
  const [autoWhatsAppNotice, setAutoWhatsAppNotice] = useState(settings.autoWhatsAppNotice);
  const [rfidWedgeMode, setRfidWedgeMode] = useState(settings.rfidWedgeMode);

  // Card Design & Background Customization State
  const [cardTheme, setCardTheme] = useState<CardBackgroundTheme>(settings.cardTheme || 'blue_gradient');
  const [cardPattern, setCardPattern] = useState<CardPatternType>(settings.cardPattern || 'geometric');
  const [cardCustomBgUrl, setCardCustomBgUrl] = useState<string>(settings.cardCustomBgUrl || '');
  const [cardCustomColor1, setCardCustomColor1] = useState<string>(settings.cardCustomColor1 || '#0f172a');
  const [cardCustomColor2, setCardCustomColor2] = useState<string>(settings.cardCustomColor2 || '#1e1b4b');
  const [cardAccentColor, setCardAccentColor] = useState<string>(settings.cardAccentColor || '#facc15');
  const [cardTextColor, setCardTextColor] = useState<'light' | 'dark'>(settings.cardTextColor || 'light');
  const [cardShowWatermark, setCardShowWatermark] = useState<boolean>(settings.cardShowWatermark ?? true);

  const [previewCardSide, setPreviewCardSide] = useState<'front' | 'back'>('front');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar background maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCardCustomBgUrl(reader.result);
        setCardTheme('custom_image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolName,
      schoolNPSN,
      schoolAddress,
      principalName,
      academicYear,
      checkInStartTime,
      checkInEndTime,
      checkOutStartTime,
      enableCheckOut,
      enableAudioBeep,
      enableTTS,
      autoWhatsAppNotice,
      rfidWedgeMode,
      cardTheme,
      cardPattern,
      cardCustomBgUrl,
      cardCustomColor1,
      cardCustomColor2,
      cardAccentColor,
      cardTextColor,
      cardShowWatermark,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang semua data siswa dan absensi ke kondisi awal?')) {
      resetAllData();
      alert('Data berhasil diatur ulang.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. JUDUL MENU CARD PENGATURAN */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-2.5">
              <SettingsIcon className="w-4 h-4 text-indigo-400" />
              <span>KONFIGURASI SERVER &amp; PARAMETER TERMINAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pengaturan Sistem &amp; Presensi Sekolah
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Atur jadwal operasional terminal presensi, cut-off toleransi keterlambatan, sintesis suara TTS penyebutan nama, dan profil sekolah.
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold rounded-xl shadow-md">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Perubahan Disimpan!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Sekolah */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">1. Identitas & Kop Sekolah</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekolah Resmi
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NPSN (Nomor Pokok Sekolah Nasional)
              </label>
              <input
                type="text"
                value={schoolNPSN}
                onChange={(e) => setSchoolNPSN(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Sekolah Lengkap
              </label>
              <input
                type="text"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran Aktif
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Jadwal & Toleransi Keterlambatan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">2. Jadwal Jam Masuk & Pulang</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Buka Gerbang Masuk
              </label>
              <input
                type="time"
                value={checkInStartTime}
                onChange={(e) => setCheckInStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Mulai menerima tap masuk
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batas Toleransi Tepat Waktu *
              </label>
              <input
                type="time"
                value={checkInEndTime}
                onChange={(e) => setCheckInEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-amber-700 border border-amber-300 rounded-lg focus:outline-indigo-500 bg-amber-50/30"
              />
              <span className="text-[11px] text-amber-700 mt-1 block font-medium">
                Tap setelah jam ini dicatat &apos;Terlambat&apos;
              </span>
            </div>

            {/* Jam Pulang Standar dengan Tombol ON / OFF */}
            <div className={`p-3 rounded-xl border transition-all ${
              enableCheckOut
                ? 'bg-white border-slate-300'
                : 'bg-slate-50 border-slate-200 opacity-90'
            }`}>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Presensi Pulang (Jam Pulang)
                </label>

                {/* ON / OFF Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setEnableCheckOut((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
                    enableCheckOut
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30'
                      : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                  }`}
                  title={enableCheckOut ? 'Klik untuk mematikan presensi pulang' : 'Klik untuk mengaktifkan presensi pulang'}
                >
                  <span className={`w-2 h-2 rounded-full ${enableCheckOut ? 'bg-emerald-200 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{enableCheckOut ? 'ON (Aktif)' : 'OFF (Nonaktif)'}</span>
                </button>
              </div>

              <input
                type="time"
                value={checkOutStartTime}
                disabled={!enableCheckOut}
                onChange={(e) => setCheckOutStartTime(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-indigo-500 ${
                  enableCheckOut
                    ? 'border-slate-300 bg-white font-medium text-slate-800'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              />

              <span className={`text-[11px] mt-1 block leading-tight ${
                enableCheckOut ? 'text-slate-400' : 'text-amber-700 font-medium'
              }`}>
                {enableCheckOut
                  ? 'Mulai jam ini peralihan ke presensi pulang otomatis'
                  : 'Presensi pulang nonaktif (Semua tap dicatat sebagai Masuk)'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Hardware RFID & Audio Feedback */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Radio className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">3. Perangkat RFID & Respon Suara</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Global USB RFID Keyboard Wedge Listener
                </div>
                <div className="text-[11px] text-slate-500">
                  Otomatis menangkap ketikan cepat dari alat reader RFID USB (10 digit + Enter) di seluruh layar
                </div>
              </div>
              <input
                type="checkbox"
                checked={rfidWedgeMode}
                onChange={(e) => setRfidWedgeMode(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Efek Suara Beep Melodis (Web Audio API)
                </div>
                <div className="text-[11px] text-slate-500">
                  Nada sukses dua-tingkat untuk tepat waktu, nada peringatan untuk terlambat, bel untuk pulang
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableAudioBeep}
                onChange={(e) => setEnableAudioBeep(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Suara Pengumuman Otomatis (Text-to-Speech Indonesia)
                </div>
                <div className="text-[11px] text-slate-500">
                  Menyapa siswa dengan suara: &quot;Selamat pagi, [Nama Siswa]. Kehadiran tepat waktu berhasil dicatat&quot;
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableTTS}
                onChange={(e) => setEnableTTS(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Tombol Pintas WhatsApp Orang Tua
                </div>
                <div className="text-[11px] text-slate-500">
                  Menampilkan tautan langsung kirim pesan konfirmasi kehadiran ke WA orang tua saat kartu di-tap
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoWhatsAppNotice}
                onChange={(e) => setAutoWhatsAppNotice(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Desain & Background Kartu Pelajar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                4. Pengaturan Desain &amp; Background Kartu Pelajar
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Standar ISO/CR-80 · Resolusi HD Siap Cetak
            </span>
          </div>

          {/* Sub 4.1: Preset Tema Warna */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Tema Latar Belakang Kartu:</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {CARD_THEME_PRESETS.find((t) => t.id === cardTheme)?.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {CARD_THEME_PRESETS.map((preset) => {
                const isSelected = cardTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCardTheme(preset.id);
                      setCardAccentColor(preset.defaultAccent);
                      setCardTextColor(preset.defaultTextColor);
                    }}
                    className={`text-left p-3 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      {/* Mini preview gradient swatch */}
                      <div
                        className={`h-12 w-full rounded-lg mb-2 shadow-2xs border border-black/10 flex items-center justify-center relative overflow-hidden ${
                          preset.id === 'custom_image' && cardCustomBgUrl
                            ? ''
                            : preset.id === 'custom_color'
                            ? ''
                            : preset.bgGradientClass
                        }`}
                        style={
                          preset.id === 'custom_image' && cardCustomBgUrl
                            ? {
                                backgroundImage: `url(${cardCustomBgUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }
                            : preset.id === 'custom_color'
                            ? {
                                background: `linear-gradient(135deg, ${cardCustomColor1}, ${cardCustomColor2})`,
                              }
                            : {}
                        }
                      >
                        {/* Mini accent dot */}
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                          style={{ backgroundColor: preset.defaultAccent }}
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="font-bold text-xs text-slate-900 leading-tight">
                        {preset.name}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub 4.2: Jika Memilih Upload Custom Background Gambar */}
          {cardTheme === 'custom_image' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Upload Berkas Gambar Latar Sendiri / Gunakan Galeri:</span>
                </div>
                {cardCustomBgUrl && (
                  <button
                    type="button"
                    onClick={() => setCardCustomBgUrl('')}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus Gambar</span>
                  </button>
                )}
              </div>

              {/* Upload Input */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl cursor-pointer text-xs font-semibold text-indigo-700 hover:bg-indigo-50/50 transition-colors shadow-2xs">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Pilih Gambar dari Komputer (PNG / JPG max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar..."
                    value={cardCustomBgUrl}
                    onChange={(e) => setCardCustomBgUrl(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-300 rounded-lg w-full sm:w-56 focus:outline-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Quick Preset Wallpapers */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                  Pilihan Wallpaper Siap Pakai:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SAMPLE_BACKGROUND_WALLPAPERS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCardCustomBgUrl(sample.url);
                        setCardTextColor(sample.theme);
                      }}
                      className="group relative h-14 rounded-lg overflow-hidden border border-slate-300 hover:border-indigo-600 shadow-2xs transition-all"
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 flex items-end p-1 transition-colors">
                        <span className="text-[9px] font-bold text-white truncate w-full">
                          {sample.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub 4.3: Jika Memilih Kustom Warna Hex */}
          {cardTheme === 'custom_color' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-800">
                Pilih Warna Gradasi Kustom:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Warna Utama (Sudut Kiri Atas)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardCustomColor1}
                      onChange={(e) => setCardCustomColor1(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={cardCustomColor1}
                      onChange={(e) => setCardCustomColor1(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Warna Kedua (Sudut Kanan Bawah)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardCustomColor2}
                      onChange={(e) => setCardCustomColor2(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={cardCustomColor2}
                      onChange={(e) => setCardCustomColor2(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Warna Aksen / Garis Emas
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardAccentColor}
                      onChange={(e) => setCardAccentColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={cardAccentColor}
                      onChange={(e) => setCardAccentColor(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub 4.4: Pola Tekstur Overlay */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pola Tekstur Overlay Kartu:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {CARD_PATTERN_PRESETS.map((pat) => {
                const isSelected = cardPattern === pat.id;
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setCardPattern(pat.id)}
                    className={`p-2.5 text-left rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-base font-mono mb-0.5">{pat.icon}</div>
                    <div className="text-xs">{pat.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub 4.5: Detail Keterbacaan & Kontras */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Warna Teks */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Kontras Warna Teks Kartu
              </label>
              <select
                value={cardTextColor}
                onChange={(e) => setCardTextColor(e.target.value as 'light' | 'dark')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-indigo-500 font-medium"
              >
                <option value="light">Teks Terang / Putih (Cocok untuk kartu gelap)</option>
                <option value="dark">Teks Gelap / Hitam (Cocok untuk kartu putih/terang)</option>
              </select>
            </div>

            {/* Warna Aksen Cepat */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Warna Aksen Highlight
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { name: 'Emas/Kuning', hex: '#facc15' },
                  { name: 'Cyan/Biru', hex: '#38bdf8' },
                  { name: 'Hijau Lime', hex: '#4ade80' },
                  { name: 'Merah/Rose', hex: '#fb7185' },
                  { name: 'Putih/Perak', hex: '#e2e8f0' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setCardAccentColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      cardAccentColor === color.hex
                        ? 'border-indigo-950 scale-110 shadow-sm'
                        : 'border-white hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Watermark Lambang */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardShowWatermark}
                  onChange={(e) => setCardShowWatermark(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Tampilkan Bayangan Lambang Sekolah
                </span>
              </label>
            </div>
          </div>

          {/* Sub 4.6: LIVE CARD PREVIEW */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Pratinjau Langsung Desain Kartu Pelajar (Live Preview):</span>
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPreviewCardSide('front')}
                  className={`px-3 py-1 rounded transition-colors ${
                    previewCardSide === 'front' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Tampak Depan
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCardSide('back')}
                  className={`px-3 py-1 rounded transition-colors ${
                    previewCardSide === 'back' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Tampak Belakang
                </button>
              </div>
            </div>

            {/* Render Card Preview */}
            <div className="flex justify-center p-4 bg-slate-900/5 rounded-2xl border border-slate-200">
              {(() => {
                const previewStyles = getCardStyles({
                  ...settings,
                  schoolName,
                  schoolNPSN,
                  schoolAddress,
                  academicYear,
                  cardTheme,
                  cardPattern,
                  cardCustomBgUrl,
                  cardCustomColor1,
                  cardCustomColor2,
                  cardAccentColor,
                  cardTextColor,
                  cardShowWatermark,
                });

                if (previewCardSide === 'front') {
                  return (
                    <div
                      style={previewStyles.bgInlineStyle}
                      className={`w-full max-w-[420px] aspect-[1.586/1] ${previewStyles.bgClass} ${previewStyles.textColor} rounded-2xl p-4 shadow-xl border ${previewStyles.cardBorder} relative overflow-hidden flex flex-col justify-between transition-all select-none`}
                    >
                      {/* Pattern overlay simulation */}
                      {cardPattern === 'geometric' && (
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                      )}
                      {cardPattern === 'grid' && (
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                      )}
                      {cardPattern === 'waves' && (
                        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />
                      )}

                      {/* Header */}
                      <div
                        className={`relative z-10 flex items-center gap-2 pb-2 border-b ${previewStyles.borderColor}`}
                      >
                        <img
                          src="/src/assets/images/school_emblem_logo_1790745265553.jpg"
                          alt="Logo Sekolah"
                          className="w-9 h-9 rounded-full object-cover border-2 shadow-xs shrink-0"
                          style={{ borderColor: previewStyles.accentColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[10.5px] font-bold tracking-wider uppercase truncate"
                            style={{ color: previewStyles.accentColor }}
                          >
                            {schoolName || 'SMA NEGERI 1 LUMBUNG'}
                          </div>
                          <div className={`text-[7.5px] ${previewStyles.subtextColor} truncate`}>
                            NPSN: {schoolNPSN} · {schoolAddress}
                          </div>
                          <div
                            className={`text-[8.5px] font-extrabold tracking-widest uppercase mt-0.5 ${previewStyles.textColor}`}
                          >
                            KARTU TANDA PELAJAR
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center shrink-0">
                          <Radio
                            className="w-3.5 h-3.5"
                            style={{ color: previewStyles.accentColor }}
                          />
                          <span
                            className="text-[6.5px] font-mono"
                            style={{ color: previewStyles.accentColor }}
                          >
                            RFID
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="relative z-10 grid grid-cols-12 gap-2.5 items-center my-auto py-1">
                        {/* Photo */}
                        <div className="col-span-3 flex flex-col items-center">
                          <div
                            className="w-14 h-18 rounded-md overflow-hidden bg-slate-800 border-2 shadow-md relative"
                            style={{ borderColor: previewStyles.accentColor }}
                          >
                            <img
                              src="/src/assets/images/student_portrait_male_1790745280073.jpg"
                              alt="Foto Siswa"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span
                            className={`text-[6.5px] font-mono ${previewStyles.mutedColor} mt-0.5 uppercase`}
                          >
                            LAKI-LAKI
                          </span>
                        </div>

                        {/* Bio */}
                        <div className="col-span-6 text-[9.5px] space-y-0.5">
                          <div>
                            <div
                              className="text-[7.5px] uppercase font-semibold tracking-wider"
                              style={{ color: previewStyles.accentColor }}
                            >
                              NAMA SISWA
                            </div>
                            <div
                              className={`font-bold leading-tight truncate ${previewStyles.textColor}`}
                            >
                              Muhammad Dimas Pratama
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[8.5px] font-mono">
                            <div>
                              <span className={`text-[6.5px] block ${previewStyles.mutedColor}`}>
                                NIS
                              </span>
                              <span className={`font-semibold ${previewStyles.textColor}`}>
                                2425001
                              </span>
                            </div>
                            <div>
                              <span className={`text-[6.5px] block ${previewStyles.mutedColor}`}>
                                NISN
                              </span>
                              <span className={`font-semibold ${previewStyles.textColor}`}>
                                0078945120
                              </span>
                            </div>
                          </div>

                          <div className="text-[8.5px]">
                            <span className={`text-[6.5px] block ${previewStyles.mutedColor}`}>
                              KELAS
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: previewStyles.accentColor }}
                            >
                              XII RPL 1
                            </span>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="col-span-3 flex flex-col items-center justify-center">
                          <div
                            className="w-16 h-16 bg-white p-1 rounded-lg border-2 shadow-md flex items-center justify-center"
                            style={{ borderColor: previewStyles.accentColor }}
                          >
                            <img
                              src="/src/assets/images/school_emblem_logo_1790745265553.jpg"
                              alt="QR Code"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span
                            className={`text-[6.5px] font-mono mt-0.5 ${previewStyles.subtextColor}`}
                          >
                            SCAN PRESENSI
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        className={`relative z-10 pt-1.5 border-t ${previewStyles.borderColor} flex items-center justify-between text-[7.5px] font-mono`}
                      >
                        <div
                          className="flex items-center gap-1 font-bold"
                          style={{ color: previewStyles.accentColor }}
                        >
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>RFID: 0009482711</span>
                        </div>
                        <div className={previewStyles.mutedColor}>
                          BERLAKU: S.D {academicYear}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="w-full max-w-[420px] aspect-[1.586/1] bg-white text-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 relative overflow-hidden flex flex-col justify-between selection:bg-none">
                      <div className="h-6 -mx-4 -mt-4 bg-slate-900 flex items-center justify-between px-4 text-white text-[7.5px] font-mono">
                        <span>SMART STUDENT CARD RFID 13.56 MHz</span>
                        <span>TAG: 0009482711</span>
                      </div>

                      <div className="text-[8.5px] space-y-0.5 text-slate-600 mt-1">
                        <div className="font-bold text-slate-900 uppercase text-[8.5px] border-b border-slate-100 pb-0.5">
                          Ketentuan Penggunaan Kartu:
                        </div>
                        <ol className="list-decimal list-inside space-y-0.5 text-[8px]">
                          <li>Kartu ini adalah identitas resmi siswa {schoolName}.</li>
                          <li>Wajib dibawa setiap hari sekolah untuk tap presensi gate.</li>
                          <li>Berfungsi sebagai kartu anggota perpustakaan digital.</li>
                          <li>Kehilangan kartu harap segera lapor ke bagian TU.</li>
                        </ol>
                      </div>

                      <div className="flex items-end justify-between pt-1.5 border-t border-slate-200 text-[7.5px]">
                        <div className="space-y-0.5">
                          <div className="text-[6.5px] text-slate-400 uppercase">Kontak Darurat:</div>
                          <div className="font-semibold text-slate-800">Bpk. Hendra Pratama</div>
                          <div className="font-mono text-slate-600">081298765432</div>
                        </div>

                        <div className="text-center relative">
                          <div className="text-[7px] text-slate-500">Ciamis, Juli 2025</div>
                          <div className="text-[7px] font-semibold text-slate-700">Kepala Sekolah</div>
                          <div className="h-4" />
                          <div className="font-bold underline text-slate-900 text-[7.5px]">
                            {principalName}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>

        {/* Section 5: Backup & Pemulihan Database */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">5. Cadangan &amp; Pemulihan Database Lokal</h3>
            </div>

            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Buka Menu Backup</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Unduh salinan berkas database utuh dalam format JSON atau format tabel CSV (Data Siswa, Log Presensi, dan Data Kelas) untuk pengarsipan mandiri sekolah.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data ke Contoh Asli</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            Simpan Perubahan Pengaturan
          </button>
        </div>
      </form>

      {/* Database Backup & Restore Modal */}
      <DatabaseBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};
