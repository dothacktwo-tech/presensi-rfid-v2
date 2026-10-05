import { CardBackgroundTheme, CardPatternType, SchoolSettings, Student } from '../types/attendance';
import QRCode from 'qrcode';

export interface CardThemePreset {
  id: CardBackgroundTheme;
  name: string;
  description: string;
  bgGradientClass: string;
  gradientColors: [string, string, string];
  defaultAccent: string;
  defaultTextColor: 'light' | 'dark';
}

export const CARD_THEME_PRESETS: CardThemePreset[] = [
  {
    id: 'blue_gradient',
    name: 'Midnight Indigo (Default)',
    description: 'Kombinasi biru indigo & navy gelap elegan dengan aksen emas.',
    bgGradientClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
    gradientColors: ['#0f172a', '#1e1b4b', '#0f172a'],
    defaultAccent: '#facc15',
    defaultTextColor: 'light',
  },
  {
    id: 'emerald_teal',
    name: 'Emerald Madrasah (Hijau)',
    description: 'Warna hijau zamrud & teal islami bernuansa segar dan resmi.',
    bgGradientClass: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950',
    gradientColors: ['#022c22', '#134e4a', '#020617'],
    defaultAccent: '#fde047',
    defaultTextColor: 'light',
  },
  {
    id: 'maroon_crimson',
    name: 'Royal Maroon (Merah Marun)',
    description: 'Merah marun resmi khas vokasi/kemendikbud dengan aksen emas.',
    bgGradientClass: 'bg-gradient-to-br from-rose-950 via-red-950 to-slate-950',
    gradientColors: ['#4c0519', '#450a0a', '#020617'],
    defaultAccent: '#fef08a',
    defaultTextColor: 'light',
  },
  {
    id: 'royal_sapphire',
    name: 'Royal Sapphire (Biru Laut)',
    description: 'Gradasi biru safir samudra dinamis dengan aksen cyan glowing.',
    bgGradientClass: 'bg-gradient-to-br from-blue-950 via-sky-900 to-indigo-950',
    gradientColors: ['#172554', '#0c4a6e', '#1e1b4b'],
    defaultAccent: '#38bdf8',
    defaultTextColor: 'light',
  },
  {
    id: 'dark_slate',
    name: 'Onyx Carbon (Hitam Elegan)',
    description: 'Hitam arang monokrom modern dan berkelas dengan aksen perak/emerald.',
    bgGradientClass: 'bg-gradient-to-br from-neutral-950 via-slate-900 to-zinc-950',
    gradientColors: ['#0a0a0a', '#0f172a', '#09090b'],
    defaultAccent: '#34d399',
    defaultTextColor: 'light',
  },
  {
    id: 'gold_amber',
    name: 'Golden Bronze (Emas Prestasi)',
    description: 'Nuansa perunggu & emas mewah untuk kartu pelajar kehormatan.',
    bgGradientClass: 'bg-gradient-to-br from-amber-950 via-yellow-950 to-stone-950',
    gradientColors: ['#451a03', '#422006', '#0c0a09'],
    defaultAccent: '#fbbf24',
    defaultTextColor: 'light',
  },
  {
    id: 'clean_white',
    name: 'Clean White PVC (Putih Terang)',
    description: 'Format putih bersih minimalis standar kartu PVC institusi formal.',
    bgGradientClass: 'bg-gradient-to-br from-slate-100 via-white to-slate-100',
    gradientColors: ['#f1f5f9', '#ffffff', '#f1f5f9'],
    defaultAccent: '#2563eb',
    defaultTextColor: 'dark',
  },
  {
    id: 'custom_color',
    name: 'Kustom Warna Gradasi',
    description: 'Tentukan 2 warna heksadesimal gradasi bebas sesuai selera sekolah.',
    bgGradientClass: 'bg-slate-900',
    gradientColors: ['#0f172a', '#3b82f6', '#0f172a'],
    defaultAccent: '#facc15',
    defaultTextColor: 'light',
  },
  {
    id: 'custom_image',
    name: 'Upload Background Gambar',
    description: 'Gunakan gambar/wallpaper desain khusus dari sekolah sendiri.',
    bgGradientClass: 'bg-slate-900',
    gradientColors: ['#0f172a', '#1e293b', '#0f172a'],
    defaultAccent: '#facc15',
    defaultTextColor: 'light',
  },
];

export interface CardPatternPreset {
  id: CardPatternType;
  name: string;
  description: string;
  icon: string;
}

export const CARD_PATTERN_PRESETS: CardPatternPreset[] = [
  {
    id: 'geometric',
    name: 'Grid Titik & Halus',
    description: 'Pola dot matrix berjarak presisi khas kartu smart chip.',
    icon: '⠶',
  },
  {
    id: 'waves',
    name: 'Gelombang Dinamis',
    description: 'Garis lengkung kontur halus bernuansa modern masa kini.',
    icon: '〰',
  },
  {
    id: 'grid',
    name: 'Kotak Digital Cyber',
    description: 'Jalinan kisi kotak mikro ala sirkuit identitas digital.',
    icon: '▦',
  },
  {
    id: 'batik',
    name: 'Motif Etnik Batik',
    description: 'Ornamen megamendung / kawung nusantara elegan.',
    icon: '❖',
  },
  {
    id: 'watermark',
    name: 'Watermark Logo Sekolah',
    description: 'Logo lambang sekolah berbayang transparan di tengah kartu.',
    icon: '★',
  },
  {
    id: 'none',
    name: 'Polos / Bersih',
    description: 'Latar belakang gradasi murni tanpa tekstur overlay.',
    icon: '○',
  },
];

// Pre-built sample background wallpapers for quick 1-click apply
export const SAMPLE_BACKGROUND_WALLPAPERS = [
  {
    name: 'Futuristic Dark Wave',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    theme: 'dark' as const,
  },
  {
    name: 'Abstract Blue Cyber',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    theme: 'dark' as const,
  },
  {
    name: 'Green Emerald Geometric',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    theme: 'dark' as const,
  },
  {
    name: 'Modern Purple Mesh',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    theme: 'dark' as const,
  },
  {
    name: 'Minimalist Clean White Silk',
    url: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?auto=format&fit=crop&w=800&q=80',
    theme: 'light' as const,
  },
];

/**
 * Helper to compute styles for rendering Card
 */
export function getCardStyles(settings: SchoolSettings) {
  const theme = settings.cardTheme || 'blue_gradient';
  const isCustomImage = theme === 'custom_image' && Boolean(settings.cardCustomBgUrl);
  const isCustomColor = theme === 'custom_color';
  const isCleanWhite = theme === 'clean_white';

  const isDark = isCleanWhite ? false : settings.cardTextColor === 'dark' ? false : true;

  let bgInlineStyle: React.CSSProperties = {};
  let bgClass = '';

  if (isCustomImage) {
    bgInlineStyle = {
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('${settings.cardCustomBgUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else if (isCustomColor) {
    const c1 = settings.cardCustomColor1 || '#0f172a';
    const c2 = settings.cardCustomColor2 || '#1e1b4b';
    bgInlineStyle = {
      background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
    };
  } else {
    const found = CARD_THEME_PRESETS.find((p) => p.id === theme);
    bgClass = found ? found.bgGradientClass : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900';
  }

  const accentColor =
    settings.cardAccentColor ||
    (isCleanWhite
      ? '#2563eb'
      : theme === 'emerald_teal'
      ? '#fde047'
      : theme === 'maroon_crimson'
      ? '#fef08a'
      : theme === 'royal_sapphire'
      ? '#38bdf8'
      : theme === 'dark_slate'
      ? '#34d399'
      : theme === 'gold_amber'
      ? '#fbbf24'
      : '#facc15');

  return {
    isDark,
    bgClass,
    bgInlineStyle,
    accentColor,
    pattern: settings.cardPattern || 'geometric',
    textColor: isDark ? 'text-white' : 'text-slate-900',
    subtextColor: isDark ? 'text-slate-300' : 'text-slate-600',
    mutedColor: isDark ? 'text-slate-400' : 'text-slate-500',
    borderColor: isDark ? 'border-white/15' : 'border-slate-300/80',
    cardBorder: isDark ? 'border-indigo-500/30' : 'border-slate-300',
    photoBorder: isDark ? 'border-amber-400/80' : 'border-indigo-600',
    qrBg: isDark ? 'bg-white' : 'bg-white',
    headerSchoolColor: isDark ? 'text-amber-300' : 'text-indigo-950',
    labelHeaderColor: isDark ? 'text-indigo-300' : 'text-indigo-600',
  };
}

/**
 * Render a complete, pixel-perfect printable Student Card (Front) to Canvas and trigger PNG download
 */
export async function downloadFullStudentIdCard(
  student: Student,
  settings: SchoolSettings,
  side: 'front' | 'back' = 'front'
) {
  try {
    const canvas = document.createElement('canvas');
    // High-res CR-80 card standard (aspect 1.586, e.g. 1012 x 638 px @ 300dpi)
    const width = 1012;
    const height = 638;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getCardStyles(settings);

    if (side === 'front') {
      // 1. Draw Background
      if (settings.cardTheme === 'custom_image' && settings.cardCustomBgUrl) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          bgImg.src = settings.cardCustomBgUrl;
          await new Promise((res, rej) => {
            bgImg.onload = res;
            bgImg.onerror = rej;
          });
          ctx.drawImage(bgImg, 0, 0, width, height);
          // Dark gradient overlay
          ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
          ctx.fillRect(0, 0, width, height);
        } catch (e) {
          // Fallback gradient
          drawGradient(ctx, width, height, ['#0f172a', '#1e1b4b']);
        }
      } else if (settings.cardTheme === 'custom_color') {
        drawGradient(ctx, width, height, [
          settings.cardCustomColor1 || '#0f172a',
          settings.cardCustomColor2 || '#1e1b4b',
        ]);
      } else {
        const found = CARD_THEME_PRESETS.find((p) => p.id === settings.cardTheme);
        const colors = found ? found.gradientColors : ['#0f172a', '#1e1b4b', '#0f172a'];
        drawGradient(ctx, width, height, colors);
      }

      // 2. Pattern overlay
      drawPattern(ctx, width, height, styles.pattern, styles.isDark);

      // 3. Card Outer Border
      ctx.lineWidth = 3;
      ctx.strokeStyle = styles.isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1';
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // 4. Header Bar
      const headerHeight = 110;
      ctx.fillStyle = styles.isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(0, 0, width, headerHeight);

      ctx.strokeStyle = styles.isDark ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, headerHeight);
      ctx.lineTo(width, headerHeight);
      ctx.stroke();

      // School Logo
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '/src/assets/images/school_emblem_logo_1790745265553.jpg';
        await new Promise((res, rej) => {
          logoImg.onload = res;
          logoImg.onerror = rej;
        });
        ctx.save();
        ctx.beginPath();
        ctx.arc(65, 55, 38, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logoImg, 27, 17, 76, 76);
        ctx.restore();

        // Gold Ring around logo
        ctx.beginPath();
        ctx.arc(65, 55, 39, 0, Math.PI * 2);
        ctx.strokeStyle = styles.accentColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      } catch (e) {
        // ignore
      }

      // School Info Header Text
      ctx.fillStyle = styles.accentColor;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(settings.schoolName.toUpperCase(), 120, 42);

      ctx.fillStyle = styles.isDark ? '#cbd5e1' : '#475569';
      ctx.font = '14px sans-serif';
      ctx.fillText(`NPSN: ${settings.schoolNPSN} · ${settings.schoolAddress}`, 120, 68);

      ctx.fillStyle = styles.isDark ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText('KARTU TANDA PELAJAR DIGITAL', 120, 95);

      // RFID Chip Badge on top right
      ctx.fillStyle = styles.accentColor;
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('RFID 13.56 MHz', width - 35, 45);
      ctx.font = '12px monospace';
      ctx.fillStyle = styles.isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('SMART CARD', width - 35, 68);

      // 5. Middle Student Photo (Left)
      const photoX = 40;
      const photoY = 145;
      const photoW = 190;
      const photoH = 245;

      // Photo Frame
      ctx.fillStyle = styles.isDark ? '#1e293b' : '#f1f5f9';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.strokeStyle = styles.accentColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(photoX, photoY, photoW, photoH);

      if (student.photoUrl) {
        try {
          const stPhoto = new Image();
          stPhoto.crossOrigin = 'anonymous';
          stPhoto.src = student.photoUrl;
          await new Promise((res, rej) => {
            stPhoto.onload = res;
            stPhoto.onerror = rej;
          });
          ctx.drawImage(stPhoto, photoX, photoY, photoW, photoH);
        } catch (e) {
          // Placeholder
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 64px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(student.name.charAt(0), photoX + photoW / 2, photoY + photoH / 2 + 22);
        }
      }

      // Gender label
      ctx.fillStyle = styles.isDark ? '#94a3b8' : '#64748b';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        student.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN',
        photoX + photoW / 2,
        photoY + photoH + 25
      );

      // 6. Middle Student Bio Info (Center)
      const bioX = 260;
      let curY = 175;

      ctx.textAlign = 'left';

      // Nama
      ctx.fillStyle = styles.isDark ? '#93c5fd' : '#4f46e5';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('NAMA LENGKAP SISWA', bioX, curY);

      curY += 28;
      ctx.fillStyle = styles.isDark ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(student.name, bioX, curY);

      curY += 40;
      // NIS & NISN
      ctx.fillStyle = styles.isDark ? '#94a3b8' : '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('NOMOR INDUK SISWA (NIS)', bioX, curY);
      ctx.fillText('NISN', bioX + 220, curY);

      curY += 24;
      ctx.fillStyle = styles.isDark ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 19px monospace';
      ctx.fillText(student.nis, bioX, curY);
      ctx.fillText(student.nisn || '-', bioX + 220, curY);

      curY += 40;
      // Kelas & Jurusan
      ctx.fillStyle = styles.isDark ? '#94a3b8' : '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('KELAS / ROMBONGAN BELAJAR', bioX, curY);

      curY += 25;
      ctx.fillStyle = styles.accentColor;
      ctx.font = 'bold 21px sans-serif';
      ctx.fillText(student.class, bioX, curY);

      curY += 38;
      // RFID UID
      ctx.fillStyle = styles.isDark ? '#94a3b8' : '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText(`RFID TAG: ${student.rfidTag}`, bioX, curY);

      // 7. QR Code (Right)
      const qrW = 210;
      const qrX = width - qrW - 40;
      const qrY = 150;

      // QR Code Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX, qrY, qrW, qrW);
      ctx.strokeStyle = styles.accentColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX, qrY, qrW, qrW);

      const qrDataUrl = await QRCode.toDataURL(student.qrCode, {
        width: 195,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((res, rej) => {
        qrImg.onload = res;
        qrImg.onerror = rej;
      });
      ctx.drawImage(qrImg, qrX + 7, qrY + 7, 196, 196);

      ctx.fillStyle = styles.isDark ? '#e2e8f0' : '#334155';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN PRESENSI', qrX + qrW / 2, qrY + qrW + 25);
      ctx.font = '11px monospace';
      ctx.fillStyle = styles.isDark ? '#94a3b8' : '#64748b';
      ctx.fillText(student.qrCode, qrX + qrW / 2, qrY + qrW + 42);

      // 8. Footer Bar
      const footerY = height - 55;
      ctx.strokeStyle = styles.isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(30, footerY);
      ctx.lineTo(width - 30, footerY);
      ctx.stroke();

      ctx.fillStyle = styles.accentColor;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`ID SISWA: ${student.id.toUpperCase()}`, 40, height - 22);

      ctx.fillStyle = styles.isDark ? '#cbd5e1' : '#64748b';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`BERLAKU S.D TAHUN AJARAN ${settings.academicYear}`, width - 40, height - 22);
    } else {
      // CARD BACK SIDE
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Top Magnetic / RFID Bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, 70);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SMART STUDENT CARD RFID 13.56 MHz', 40, 42);

      ctx.textAlign = 'right';
      ctx.fillText(`TAG UID: ${student.rfidTag}`, width - 40, 42);

      // Card Terms
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('KETENTUAN PENGGUNAAN KARTU TANDA PELAJAR:', 40, 120);

      ctx.fillStyle = '#334155';
      ctx.font = '15px sans-serif';
      const terms = [
        `1. Kartu ini adalah identitas resmi siswa ${settings.schoolName}.`,
        '2. Wajib dibawa setiap hari dan di-tap pada terminal RFID / QR Code di gerbang masuk.',
        '3. Berfungsi sebagai akses perpustakaan digital, lab komputer, dan fasilitas sekolah.',
        '4. Dilarang meminjamkan, merusak, atau menggandakan kartu kepada pihak lain.',
        '5. Apabila kartu hilang, segera laporkan ke bagian Tata Usaha (TU) sekolah.',
      ];
      let tY = 160;
      for (const t of terms) {
        ctx.fillText(t, 40, tY);
        tY += 32;
      }

      // Footer: Parent Contact & Principal Signature Box
      const lineY = height - 160;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, lineY);
      ctx.lineTo(width - 40, lineY);
      ctx.stroke();

      // Left: Emergency Contact
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.fillText('KONTAK DARURAT / ORANG TUA:', 40, lineY + 35);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(student.parentName || 'Orang Tua / Wali', 40, lineY + 65);

      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(student.parentPhone || '-', 40, lineY + 95);

      // Right: School Stamp & Principal Name
      ctx.textAlign = 'center';
      const sigX = width - 180;
      ctx.fillStyle = '#475569';
      ctx.font = '14px sans-serif';
      ctx.fillText(`${settings.schoolAddress.split(',')[1]?.trim() || 'Ciamis'}, Juli 2025`, sigX, lineY + 30);
      ctx.fillText('Kepala Sekolah,', sigX, lineY + 52);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(settings.principalName, sigX, lineY + 125);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sigX - 110, lineY + 132);
      ctx.lineTo(sigX + 110, lineY + 132);
      ctx.stroke();
    }

    // Trigger Download
    const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Kartu_Pelajar_${student.nis}_${cleanName}_${side.toUpperCase()}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Gagal membuat gambar kartu pelajar', err);
  }
}

function drawGradient(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[]) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  if (colors.length === 2) {
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
  } else if (colors.length >= 3) {
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, colors[2]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pattern: CardPatternType,
  isDark: boolean
) {
  if (pattern === 'none') return;

  ctx.save();
  if (pattern === 'geometric') {
    // Dot Matrix
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    for (let x = 15; x < w; x += 22) {
      for (let y = 15; y < h; y += 22) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'waves') {
    // Wave lines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 2;
    for (let y = -50; y < h + 100; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.33, y + 60, w * 0.66, y - 60, w, y);
      ctx.stroke();
    }
  } else if (pattern === 'grid') {
    // Tech Grid
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  } else if (pattern === 'batik') {
    // Diamond Batik
    ctx.strokeStyle = isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(30, 27, 75, 0.06)';
    ctx.lineWidth = 1.5;
    const size = 50;
    for (let x = 0; x < w + size; x += size) {
      for (let y = 0; y < h + size; y += size) {
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y);
        ctx.lineTo(x, y + size / 2);
        ctx.lineTo(x - size / 2, y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}
