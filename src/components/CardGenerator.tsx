import React, { useState, useEffect, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Student, CardBackgroundTheme, CardPatternType } from '../types/attendance';
import { generateQRCodeDataUrl, downloadRawQRCode, downloadStudentQRCard } from '../utils/qr';
import {
  getCardStyles,
  downloadFullStudentIdCard,
  CARD_THEME_PRESETS,
  CARD_PATTERN_PRESETS,
} from '../utils/cardThemes';
import {
  CreditCard,
  Printer,
  Download,
  Search,
  Filter,
  Radio,
  QrCode,
  ShieldCheck,
  Eye,
  Check,
  Copy,
  Layers,
  Sparkles,
  X,
  FileImage,
  ArrowRight,
  Palette,
  Sliders,
  Settings as SettingsIcon,
} from 'lucide-react';

export const CardGenerator: React.FC = () => {
  const { students, settings, updateSettings, setAdminTab } = useAttendance();

  // Active view: 'cards' (Kartu Pelajar Fisik/Digital) vs 'qr_catalog' (Katalog QR Code) vs 'qr_stickers' (Lembar Stiker QR)
  const [activeTab, setActiveTab] = useState<'cards' | 'qr_catalog' | 'qr_stickers'>('cards');

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [qrCodesMap, setQrCodesMap] = useState<Record<string, string>>({});
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'both'>('both');
  const [printBatchMode, setPrintBatchMode] = useState<boolean>(false);
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

  // Modal QR Code Preview
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [downloadingBatch, setDownloadingBatch] = useState<boolean>(false);

  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class))).sort();
  }, [students]);

  // Generate QR code data URLs for all students
  useEffect(() => {
    let isMounted = true;
    const loadQRs = async () => {
      const map: Record<string, string> = {};
      for (const st of students) {
        const url = await generateQRCodeDataUrl(st.qrCode, 240);
        map[st.id] = url;
      }
      if (isMounted) {
        setQrCodesMap(map);
      }
    };
    loadQRs();
    return () => {
      isMounted = false;
    };
  }, [students]);

  // Filter students based on Class and Search Query
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesClass = selectedClass === 'ALL' || s.class === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.nisn?.toLowerCase().includes(q) ||
        s.qrCode.toLowerCase().includes(q);
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClass, searchQuery]);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || filteredStudents[0] || students[0];

  const studentsToDisplayInCards = printBatchMode ? filteredStudents : currentStudent ? [currentStudent] : [];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Download all filtered students' QR codes with small delay
  const handleBatchDownloadQRCards = async () => {
    if (filteredStudents.length === 0) return;
    if (
      !confirm(
        `Unduh ${filteredStudents.length} kartu QR Code sekaligus untuk kelas ${selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass}?`
      )
    ) {
      return;
    }

    setDownloadingBatch(true);
    for (let i = 0; i < filteredStudents.length; i++) {
      const st = filteredStudents[i];
      await downloadStudentQRCard(st, settings.schoolName);
      // Small pause between downloads to prevent browser blocking
      await new Promise((r) => setTimeout(r, 250));
    }
    setDownloadingBatch(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Official Print Header */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-900 pb-3 text-center">
        <h2 className="text-xl font-bold uppercase">{settings.schoolName}</h2>
        <p className="text-xs">{settings.schoolAddress} · NPSN: {settings.schoolNPSN}</p>
        <h3 className="text-sm font-bold mt-1 uppercase">
          {activeTab === 'qr_stickers'
            ? 'LEMBAR STIKER QR CODE PRESENSI SISWA'
            : 'KARTU TANDA PELAJAR DIGITAL RESMI'}
        </h3>
        <p className="text-[11px]">
          Kelas: {selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass} · Tahun Ajaran: {settings.academicYear}
        </p>
      </div>

      {/* 1. JUDUL MENU CARD KARTU PELAJAR & QR */}
      <div className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-2.5">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>GENERATOR KARTU &amp; SMART IDENTITAS SISWA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Cetak Kartu Pelajar Digital &amp; QR Code
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Desain kartu tanda pelajar standar ISO/CR-80, siap cetak kartu PVC, stiker barcode presensi, dan ekspor berkas QR resolusi tinggi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            {/* Batch Download QR Button */}
            <button
              onClick={handleBatchDownloadQRCards}
              disabled={downloadingBatch || filteredStudents.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 shadow-md transition-colors disabled:opacity-50"
              title="Unduh seluruh file gambar QR Code siswa yang terfilter"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{downloadingBatch ? 'Mengunduh...' : `Unduh QR (${filteredStudents.length})`}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
            >
              <Printer className="w-4 h-4" />
              <span>
                {activeTab === 'cards'
                  ? `Cetak Kartu (${studentsToDisplayInCards.length})`
                  : `Cetak Lembar (${filteredStudents.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="no-print flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('cards')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'cards'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Kartu Pelajar Digital (ID Card)</span>
        </button>

        <button
          onClick={() => setActiveTab('qr_catalog')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'qr_catalog'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Katalog QR Code Unik Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('qr_stickers')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'qr_stickers'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Lembar Stiker / Label QR (Siap Cetak)</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Filter Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-indigo-500 shadow-2xs"
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

          {/* Student Selector (If in single card mode) */}
          {activeTab === 'cards' && !printBatchMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Pilih Siswa:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-indigo-500 max-w-[220px] truncate"
              >
                {filteredStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.class})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa atau NIS..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 w-48 sm:w-56"
            />
          </div>
        </div>

        {/* View mode toggle and Theme button for Card tab */}
        {activeTab === 'cards' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Theme Selector Button */}
            <button
              onClick={() => setShowThemePicker((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                showThemePicker
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs'
              }`}
              title="Ganti tema warna atau pola background kartu pelajar"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Tema Kartu ({CARD_THEME_PRESETS.find((t) => t.id === settings.cardTheme)?.name.split(' ')[0] || 'Tema'})</span>
            </button>

            <button
              onClick={() => setPrintBatchMode((prev) => !prev)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                printBatchMode
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {printBatchMode ? 'Mode Cetak Massal' : 'Mode Satuan'}
            </button>

            {!printBatchMode && (
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setCardSide('front')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    cardSide === 'front' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Depan
                </button>
                <button
                  onClick={() => setCardSide('back')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    cardSide === 'back' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Belakang
                </button>
                <button
                  onClick={() => setCardSide('both')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    cardSide === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Keduanya
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUICK CARD THEME & BACKGROUND DRAWER */}
      {showThemePicker && activeTab === 'cards' && (
        <div className="no-print bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white">
                Pilih Tema &amp; Desain Background Kartu Pelajar
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdminTab('settings')}
                className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 font-semibold px-2 py-1 rounded hover:bg-slate-800"
              >
                <SettingsIcon className="w-3 h-3" />
                <span>Pengaturan Lengkap &amp; Upload Gambar</span>
              </button>
              <button
                onClick={() => setShowThemePicker(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Theme swatches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {CARD_THEME_PRESETS.map((preset) => {
              const isSelected = (settings.cardTheme || 'blue_gradient') === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() =>
                    updateSettings({
                      cardTheme: preset.id,
                      cardAccentColor: preset.defaultAccent,
                      cardTextColor: preset.defaultTextColor,
                    })
                  }
                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/40'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`h-7 w-full rounded-lg mb-1.5 shadow-2xs border border-white/10 relative flex items-center justify-center ${
                      preset.id === 'custom_image' && settings.cardCustomBgUrl
                        ? ''
                        : preset.bgGradientClass
                    }`}
                    style={
                      preset.id === 'custom_image' && settings.cardCustomBgUrl
                        ? { backgroundImage: `url(${settings.cardCustomBgUrl})`, backgroundSize: 'cover' }
                        : {}
                    }
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-white/50"
                      style={{ backgroundColor: preset.defaultAccent }}
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5">
                        <Check className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                  <div className="text-[10.5px] font-bold text-white truncate w-full">
                    {preset.name.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pattern overlay selector */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Pola Tekstur:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CARD_PATTERN_PRESETS.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => updateSettings({ cardPattern: pat.id })}
                  className={`px-2 py-0.5 text-[10.5px] rounded-lg border transition-all ${
                    (settings.cardPattern || 'geometric') === pat.id
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-bold'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {pat.icon} {pat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: KARTU PELAJAR DIGITAL (ID CARD VIEW)                     */}
      {/* ============================================================== */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="print-card-grid grid grid-cols-1 md:grid-cols-2 gap-6 items-start justify-center">
            {studentsToDisplayInCards.map((student) => {
              const qrDataUrl = qrCodesMap[student.id];
              const cardStyles = getCardStyles(settings);

              return (
                <div key={student.id} className="space-y-3">
                  {/* Action row above each card in screen view */}
                  <div className="no-print flex items-center justify-between text-xs px-1">
                    <span className="font-bold text-slate-800 truncate">
                      {student.name} ({student.class})
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => downloadFullStudentIdCard(student, settings, 'front')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-0.5 rounded shadow-2xs transition-colors"
                        title="Unduh file gambar Kartu Pelajar depan lengkap (PNG HD)"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Unduh Kartu</span>
                      </button>
                      <button
                        onClick={() => downloadStudentQRCard(student, settings.schoolName)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded"
                        title="Unduh Badge QR"
                      >
                        <Download className="w-3 h-3" />
                        <span>QR</span>
                      </button>
                      <button
                        onClick={() => setInspectStudent(student)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Detail</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD FRONT SIDE */}
                  {(cardSide === 'front' || cardSide === 'both' || printBatchMode) && (
                    <div
                      style={cardStyles.bgInlineStyle}
                      className={`w-full max-w-[430px] mx-auto aspect-[1.586/1] ${cardStyles.bgClass} ${cardStyles.textColor} rounded-2xl p-4 shadow-xl border ${cardStyles.cardBorder} relative overflow-hidden flex flex-col justify-between selection:bg-none print:shadow-none print:border-slate-800 transition-all`}
                    >
                      {/* Decorative patterns */}
                      {cardStyles.pattern === 'geometric' && (
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                      )}
                      {cardStyles.pattern === 'grid' && (
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                      )}
                      {cardStyles.pattern === 'waves' && (
                        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />
                      )}
                      {cardStyles.pattern === 'batik' && (
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
                      )}

                      {/* Header */}
                      <div
                        className={`relative z-10 flex items-center gap-2.5 pb-2 border-b ${cardStyles.borderColor}`}
                      >
                        <img
                          src="/src/assets/images/school_emblem_logo_1790745265553.jpg"
                          alt="Logo Sekolah"
                          className="w-10 h-10 rounded-full object-cover border-2 shadow-xs shrink-0"
                          style={{ borderColor: cardStyles.accentColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[11px] font-bold tracking-wider uppercase truncate"
                            style={{ color: cardStyles.accentColor }}
                          >
                            {settings.schoolName}
                          </div>
                          <div className={`text-[8px] ${cardStyles.subtextColor} truncate`}>
                            NPSN: {settings.schoolNPSN} · {settings.schoolAddress}
                          </div>
                          <div
                            className={`text-[9px] font-extrabold tracking-widest uppercase mt-0.5 ${cardStyles.textColor}`}
                          >
                            KARTU TANDA PELAJAR
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center shrink-0">
                          <Radio
                            className="w-4 h-4"
                            style={{ color: cardStyles.accentColor }}
                          />
                          <span
                            className="text-[7px] font-mono"
                            style={{ color: cardStyles.accentColor }}
                          >
                            RFID
                          </span>
                        </div>
                      </div>

                      {/* Middle Body */}
                      <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto py-1">
                        {/* Student Photo */}
                        <div className="col-span-3 flex flex-col items-center">
                          <div
                            className="w-16 h-20 rounded-md overflow-hidden bg-slate-800 border-2 shadow-md relative"
                            style={{ borderColor: cardStyles.accentColor }}
                          >
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
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-[7px] font-mono ${cardStyles.mutedColor} mt-1 uppercase`}
                          >
                            {student.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                          </span>
                        </div>

                        {/* Bio Data */}
                        <div className="col-span-6 text-[10px] space-y-1">
                          <div>
                            <div
                              className="text-[8px] uppercase tracking-wider font-semibold"
                              style={{ color: cardStyles.accentColor }}
                            >
                              NAMA SISWA
                            </div>
                            <div
                              className={`font-bold leading-tight line-clamp-1 ${cardStyles.textColor}`}
                            >
                              {student.name}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                            <div>
                              <span className={`text-[7px] block ${cardStyles.mutedColor}`}>
                                NIS
                              </span>
                              <span className={`font-semibold ${cardStyles.textColor}`}>
                                {student.nis}
                              </span>
                            </div>
                            <div>
                              <span className={`text-[7px] block ${cardStyles.mutedColor}`}>
                                NISN
                              </span>
                              <span className={`font-semibold ${cardStyles.textColor}`}>
                                {student.nisn || '-'}
                              </span>
                            </div>
                          </div>

                          <div className="text-[9px]">
                            <span className={`text-[7px] block ${cardStyles.mutedColor}`}>
                              KELAS & JURUSAN
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: cardStyles.accentColor }}
                            >
                              {student.class}
                            </span>
                          </div>
                        </div>

                        {/* QR Code Presensi */}
                        <div className="col-span-3 flex flex-col items-center justify-center">
                          <div
                            onClick={() => setInspectStudent(student)}
                            className="w-18 h-18 bg-white p-1 rounded-lg border-2 shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                            style={{ borderColor: cardStyles.accentColor }}
                            title="Klik untuk memperbesar QR Code"
                          >
                            {qrDataUrl ? (
                              <img
                                src={qrDataUrl}
                                alt={`QR ${student.name}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <QrCode className="w-10 h-10 text-slate-800" />
                            )}
                          </div>
                          <span
                            className={`text-[7px] font-mono mt-0.5 ${cardStyles.subtextColor}`}
                          >
                            SCAN PRESENSI
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        className={`relative z-10 pt-2 border-t ${cardStyles.borderColor} flex items-center justify-between text-[8px] font-mono`}
                      >
                        <div
                          className="flex items-center gap-1.5 font-bold"
                          style={{ color: cardStyles.accentColor }}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>RFID UID: {student.rfidTag}</span>
                        </div>
                        <div className={cardStyles.mutedColor}>
                          BERLAKU: S.D {settings.academicYear.split('/')[1] || '2026'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CARD BACK SIDE */}
                  {(cardSide === 'back' || cardSide === 'both' || printBatchMode) && (
                    <div className="w-full max-w-[430px] mx-auto aspect-[1.586/1] bg-white text-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 relative overflow-hidden flex flex-col justify-between selection:bg-none print:shadow-none print:border-slate-800">
                      <div className="h-7 -mx-4 -mt-4 bg-slate-900 flex items-center justify-between px-4 text-white text-[8px] font-mono">
                        <span>SMART STUDENT CARD RFID 13.56 MHz</span>
                        <span>TAG: {student.rfidTag}</span>
                      </div>

                      <div className="text-[9px] space-y-1 text-slate-600 mt-2">
                        <div className="font-bold text-slate-900 uppercase text-[9px] border-b border-slate-100 pb-0.5">
                          Ketentuan Penggunaan Kartu:
                        </div>
                        <ol className="list-decimal list-inside space-y-0.5 text-[8.5px]">
                          <li>Kartu ini adalah identitas resmi siswa {settings.schoolName}.</li>
                          <li>Wajib dibawa setiap hari sekolah untuk tap presensi RFID / QR Code di gerbang.</li>
                          <li>Berfungsi sebagai kartu anggota perpustakaan dan akses fasilitas sekolah.</li>
                          <li>Kehilangan kartu harap segera lapor ke bagian Tata Usaha (TU).</li>
                        </ol>
                      </div>

                      <div className="flex items-end justify-between pt-2 border-t border-slate-200 text-[8px]">
                        <div className="space-y-0.5">
                          <div className="text-[7px] text-slate-400 uppercase">Kontak Darurat:</div>
                          <div className="font-semibold text-slate-800">{student.parentName}</div>
                          <div className="font-mono text-slate-600">{student.parentPhone}</div>
                        </div>

                        <div className="text-center relative">
                          <div className="text-[7.5px] text-slate-500">Jakarta, Juli 2025</div>
                          <div className="text-[7.5px] font-semibold text-slate-700">Kepala Sekolah</div>
                          <div className="h-6" />
                          <div className="font-bold underline text-slate-900 text-[8px]">
                            {settings.principalName}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: KATALOG QR CODE UNIK SISWA (GRID & DOWNLOAD)            */}
      {/* ============================================================== */}
      {activeTab === 'qr_catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span>
              Menampilkan <strong>{filteredStudents.length} kode QR unik siswa</strong>. Setiap kode terenkripsi dengan NIS & payload presensi.
            </span>
            <span className="font-semibold text-indigo-600">Klik &apos;Unduh Badge&apos; atau &apos;Unduh Polos&apos;</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStudents.map((student) => {
              const qrDataUrl = qrCodesMap[student.id];

              return (
                <div
                  key={student.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {student.name}
                      </span>
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold shrink-0">
                        {student.class}
                      </span>
                    </div>

                    {/* QR Code Container */}
                    <div
                      onClick={() => setInspectStudent(student)}
                      className="w-40 h-40 mx-auto bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-center cursor-pointer group-hover:border-indigo-400 group-hover:bg-indigo-50/20 transition-all shadow-2xs relative"
                      title="Klik untuk memperbesar QR Code"
                    >
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={`QR Code ${student.name}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <QrCode className="w-16 h-16 text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                        <span className="bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-sm">
                          Perbesar 🔍
                        </span>
                      </div>
                    </div>

                    {/* Student Info Details */}
                    <div className="text-center mt-3 text-xs space-y-0.5">
                      <div className="font-mono text-slate-500 text-[11px]">
                        NIS: <span className="font-bold text-slate-800">{student.nis}</span>
                      </div>
                      <div className="font-mono text-[10px] text-indigo-600 bg-slate-100 py-0.5 px-2 rounded inline-block">
                        Payload: {student.qrCode}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => downloadStudentQRCard(student, settings.schoolName)}
                      className="inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg shadow-2xs transition-colors"
                      title="Unduh Badge Kartu QR beresolusi tinggi"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh Badge</span>
                    </button>
                    <button
                      onClick={() => downloadRawQRCode(student.qrCode, `QR_${student.nis}_${student.name.replace(/\s+/g, '_')}`)}
                      className="inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors"
                      title="Unduh file gambar QR Code polos"
                    >
                      <FileImage className="w-3 h-3" />
                      <span>QR Polos</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LEMBAR STIKER / LABEL QR CODE (PRINTABLE A4)           */}
      {/* ============================================================== */}
      {activeTab === 'qr_stickers' && (
        <div className="space-y-4">
          <div className="no-print p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Tata letak ini dioptimalkan untuk dicetak langsung pada kertas stiker / HVS A4 (12 label per halaman).
                Klik tombol <strong>&apos;Cetak Lembar&apos;</strong> di kanan atas untuk mencetak.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0">
            {filteredStudents.map((student) => {
              const qrDataUrl = qrCodesMap[student.id];

              return (
                <div
                  key={student.id}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center text-center bg-white"
                >
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wide truncate w-full">
                    {settings.schoolName}
                  </div>
                  <div className="text-[8px] font-mono text-slate-500 mb-1">
                    PRESENSI SISWA
                  </div>

                  <div className="w-28 h-28 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center my-1">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt={student.name} className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-12 h-12 text-slate-400" />
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-slate-900 leading-tight truncate w-full mt-1">
                    {student.name}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">
                    NIS: {student.nis} · {student.class}
                  </div>
                  <div className="text-[8px] font-mono text-indigo-600 font-bold mt-0.5">
                    {student.qrCode}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DETAIL & INSPECT QR CODE SISWA                         */}
      {/* ============================================================== */}
      {inspectStudent && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Detail QR Code Siswa
                </h3>
              </div>
              <button
                onClick={() => setInspectStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Large QR Display */}
            <div className="flex flex-col items-center">
              <div className="w-56 h-56 bg-white p-3 rounded-2xl border-2 border-indigo-200 shadow-md flex items-center justify-center mb-3">
                {qrCodesMap[inspectStudent.id] ? (
                  <img
                    src={qrCodesMap[inspectStudent.id]}
                    alt={`QR Code ${inspectStudent.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-24 h-24 text-slate-400" />
                )}
              </div>

              {/* Bio summary */}
              <h4 className="text-lg font-bold text-slate-900 text-center">
                {inspectStudent.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                NIS: {inspectStudent.nis} · Kelas: {inspectStudent.class} · RFID: {inspectStudent.rfidTag}
              </p>

              {/* Payload code with copy button */}
              <div className="mt-3 flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
                <span className="text-slate-500">Payload:</span>
                <span className="font-bold text-indigo-700">{inspectStudent.qrCode}</span>
                <button
                  onClick={() => handleCopyPayload(inspectStudent.qrCode)}
                  className="p-1 hover:text-indigo-600 text-slate-400 transition-colors ml-1"
                  title="Salin Payload"
                >
                  {copiedPayload ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Download Actions inside modal */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => downloadStudentQRCard(inspectStudent, settings.schoolName)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Kartu Badge QR Lengkap (.png)</span>
              </button>

              <button
                onClick={() =>
                  downloadRawQRCode(
                    inspectStudent.qrCode,
                    `QRCode_${inspectStudent.nis}_${inspectStudent.name.replace(/\s+/g, '_')}`
                  )
                }
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <FileImage className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Gambar QR Code Polos (.png)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
