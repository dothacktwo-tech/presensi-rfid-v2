import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, AttendanceRecord, SchoolSettings, AttendanceStatus } from '../types/attendance';

export interface PDFExportFilter {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  selectedClass: string; // 'ALL' or specific class
  selectedStudentId?: string; // 'ALL' or specific student id
  selectedStatus: 'ALL' | AttendanceStatus;
}

export interface PDFExportResult {
  doc: jsPDF;
  blobUrl: string;
  fileName: string;
  totalRecords: number;
  stats: {
    total: number;
    hadir: number;
    terlambat: number;
    izin: number;
    sakit: number;
    alpa: number;
    persentase: number;
  };
}

/**
 * Generate official PDF report for attendance records
 */
export async function generateAttendancePDF(
  records: AttendanceRecord[],
  students: Student[],
  settings: SchoolSettings,
  filter: PDFExportFilter,
  printedBy = 'Admin Sistem'
): Promise<PDFExportResult> {
  // 1. Filter records according to date range and status
  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  // Determine date bounds
  const startDate = filter.startDate;
  const endDate = filter.endDate;

  let filtered = records.filter((r) => {
    // Date range filter
    if (r.date < startDate || r.date > endDate) return false;

    // Status filter
    if (filter.selectedStatus !== 'ALL' && r.status !== filter.selectedStatus) {
      return false;
    }

    // Student / Class filter
    const student = studentMap.get(r.studentId);
    if (!student) return false;

    if (filter.selectedClass !== 'ALL' && student.class !== filter.selectedClass) {
      return false;
    }

    if (filter.selectedStudentId && filter.selectedStudentId !== 'ALL' && r.studentId !== filter.selectedStudentId) {
      return false;
    }

    return true;
  });

  // Sort chronologically (date ascending, then student class, then student name)
  filtered.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const stA = studentMap.get(a.studentId);
    const stB = studentMap.get(b.studentId);
    if (stA?.class !== stB?.class) return (stA?.class || '').localeCompare(stB?.class || '');
    return (stA?.name || '').localeCompare(stB?.name || '');
  });

  // 2. Calculate summary statistics
  let hadirCount = 0;
  let terlambatCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;

  filtered.forEach((r) => {
    if (r.status === 'Hadir') hadirCount++;
    else if (r.status === 'Terlambat') terlambatCount++;
    else if (r.status === 'Izin') izinCount++;
    else if (r.status === 'Sakit') sakitCount++;
    else if (r.status === 'Alpha') alpaCount++;
  });

  const totalFiltered = filtered.length;
  const presentTotal = hadirCount + terlambatCount;
  const persentase = totalFiltered > 0 ? Math.round((presentTotal / totalFiltered) * 100) : 0;

  const stats = {
    total: totalFiltered,
    hadir: hadirCount,
    terlambat: terlambatCount,
    izin: izinCount,
    sakit: sakitCount,
    alpa: alpaCount,
    persentase,
  };

  // 3. Create Landscape A4 jsPDF Document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // School Emblem Logo handling
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/src/assets/images/school_emblem_logo_1790745265553.jpg';
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve; // If failed, proceed without logo
    });
    if (logoImg.naturalWidth > 0) {
      doc.addImage(logoImg, 'JPEG', marginX, 10, 18, 18);
    }
  } catch (e) {
    console.warn('Could not load emblem logo in PDF', e);
  }

  // School Header Text (Kop Resmi)
  const schoolTitle = (settings.schoolName || 'SMA NEGERI 1 LUMBUNG').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(schoolTitle, pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    `NPSN: ${settings.schoolNPSN || '20108921'}  ·  Alamat: ${settings.schoolAddress || 'Jl. Raya Lumbung No. 45, Lumbung'}`,
    pageWidth / 2,
    19,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('LAPORAN REKAPITULASI ABSENSI SISWA', pageWidth / 2, 25, { align: 'center' });

  // Double divider lines under kop
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.7);
  doc.line(marginX, 28, pageWidth - marginX, 28);
  doc.setLineWidth(0.2);
  doc.line(marginX, 29, pageWidth - marginX, 29);

  // Metadata Information Block & Statistics Block
  const startInfoY = 33;
  doc.setFontSize(8.5);

  // Left metadata column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Periode Laporan', marginX, startInfoY);
  doc.text('Kelas', marginX, startInfoY + 4.5);
  doc.text('Status Filter', marginX, startInfoY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`: ${startDate} s/d ${endDate}`, marginX + 28, startInfoY);
  doc.text(`: ${filter.selectedClass === 'ALL' ? 'Semua Kelas' : filter.selectedClass}`, marginX + 28, startInfoY + 4.5);
  doc.text(`: ${filter.selectedStatus === 'ALL' ? 'Semua Status' : filter.selectedStatus}`, marginX + 28, startInfoY + 9);

  // Middle metadata column
  const midX = marginX + 90;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Data', midX, startInfoY);
  doc.text('Tanggal Cetak', midX, startInfoY + 4.5);
  doc.text('Dicetak Oleh', midX, startInfoY + 9);

  const printTimeStr = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`: ${totalFiltered} Rekaman Presensi`, midX + 24, startInfoY);
  doc.text(`: ${printTimeStr} WIB`, midX + 24, startInfoY + 4.5);
  doc.text(`: ${printedBy}`, midX + 24, startInfoY + 9);

  // Right Statistics Summary Box
  const statBoxX = pageWidth - marginX - 95;
  const statBoxY = startInfoY - 2;
  const statBoxW = 95;
  const statBoxH = 14;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(statBoxX, statBoxY, statBoxW, statBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('RINGKASAN KEHADIRAN:', statBoxX + 3, statBoxY + 4);

  // Stats Pills
  doc.setFontSize(7.5);
  const colW = statBoxW / 6;

  // Hadir
  doc.setTextColor(16, 149, 93); // emerald
  doc.text(`Hadir: ${hadirCount}`, statBoxX + 3, statBoxY + 9);

  // Terlambat
  doc.setTextColor(217, 119, 6); // amber
  doc.text(`Terlambat: ${terlambatCount}`, statBoxX + 24, statBoxY + 9);

  // Izin
  doc.setTextColor(2, 132, 199); // sky
  doc.text(`Izin: ${izinCount}`, statBoxX + 50, statBoxY + 9);

  // Sakit
  doc.setTextColor(147, 51, 234); // purple
  doc.text(`Sakit: ${sakitCount}`, statBoxX + 68, statBoxY + 9);

  // Alpa
  doc.setTextColor(225, 29, 72); // rose
  doc.text(`Alpa: ${alpaCount}`, statBoxX + 82, statBoxY + 9);

  // Attendance rate
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(`Tingkat Kehadiran: ${persentase}%`, statBoxX + 3, statBoxY + 12.5);

  // 4. Build Table Rows
  const tableRows = filtered.map((r, index) => {
    const student = studentMap.get(r.studentId);
    const nisInfo = student ? `${student.nis}${student.nisn ? ` / ${student.nisn}` : ''}` : '-';
    const jamStr = r.checkInTime ? r.checkInTime : '-';
    const pulangStr = r.checkOutTime ? r.checkOutTime : '-';
    const jamDisplay = r.checkOutTime ? `${jamStr} - ${pulangStr}` : jamStr;

    return [
      (index + 1).toString(),
      r.date,
      jamDisplay,
      nisInfo,
      student ? student.name : 'Siswa Tidak Ditemukan',
      student ? student.class : '-',
      r.status,
      r.notes || '-',
    ];
  });

  // 5. Render AutoTable with multi-page handling
  autoTable(doc, {
    startY: startInfoY + 14,
    margin: { left: marginX, right: marginX, bottom: 20 },
    head: [['No', 'Tanggal', 'Jam', 'NIS / NISN', 'Nama Siswa', 'Kelas', 'Status', 'Keterangan']],
    body: tableRows,
    theme: 'striped',
    showHead: 'everyPage',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // No
      1: { cellWidth: 20, halign: 'center' }, // Tanggal
      2: { cellWidth: 24, halign: 'center', font: 'courier' }, // Jam
      3: { cellWidth: 32, font: 'courier', halign: 'center' }, // NIS / NISN
      4: { cellWidth: 'auto', fontStyle: 'bold' }, // Nama Siswa
      5: { cellWidth: 24, halign: 'center' }, // Kelas
      6: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }, // Status
      7: { cellWidth: 42 }, // Keterangan
    },
    didParseCell: (data) => {
      // Color-code Status column
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw as string;
        if (val === 'Hadir') {
          data.cell.styles.textColor = [16, 149, 93]; // emerald
        } else if (val === 'Terlambat') {
          data.cell.styles.textColor = [217, 119, 6]; // amber
        } else if (val === 'Izin' || val === 'Sakit') {
          data.cell.styles.textColor = [2, 132, 199]; // sky
        } else if (val === 'Alpha') {
          data.cell.styles.textColor = [225, 29, 72]; // rose
        }
      }
    },
    didDrawPage: (data) => {
      // Footer: Page Number & Verification
      const totalPages = doc.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400

      // Left footer
      doc.text(
        `Dicetak otomatis oleh Sistem Absensi Siswa - ${settings.schoolName || 'SMA Negeri 1 Lumbung'}`,
        marginX,
        pageHeight - 8
      );

      // Right footer: Halaman X dari Y
      doc.text(`Halaman ${currentPage} dari ${totalPages}`, pageWidth - marginX, pageHeight - 8, {
        align: 'right',
      });
    },
  });

  // 6. Signature Section (Only on the LAST page)
  const lastTableY = (doc as any).lastAutoTable?.finalY || 100;
  let signatureY = lastTableY + 8;

  // If signature doesn't fit on current page (needs ~35mm), add a new page
  if (signatureY + 35 > pageHeight - 15) {
    doc.addPage();
    signatureY = 25;
  }

  const sigX = pageWidth - marginX - 65;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const city = settings.schoolAddress?.split(',')[1]?.trim() || 'Lumbung';
  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.text(`${city}, ${currentDateFormatted}`, sigX, signatureY);
  doc.text(`Mengetahui,`, sigX, signatureY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Kepala ${settings.schoolName || 'SMA Negeri 1 Lumbung'}`, sigX, signatureY + 9);

  // Space for signature & stamp
  doc.setFont('helvetica', 'bold');
  doc.text(`( ${settings.principalName || 'Drs. H. Bambang Hartono, M.Pd.'} )`, sigX, signatureY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. 19750812 200212 1 003`, sigX, signatureY + 32);

  // 7. Generate clean filename
  const cleanClass =
    filter.selectedClass === 'ALL'
      ? 'Semua_Kelas'
      : filter.selectedClass.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Laporan_Absensi_${cleanClass}_${startDate}_sampai_${endDate}.pdf`;

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return {
    doc,
    blobUrl,
    fileName,
    totalRecords: totalFiltered,
    stats,
  };
}

/**
 * Trigger immediate download of generated PDF
 */
export function downloadGeneratedPDF(doc: jsPDF, fileName: string) {
  doc.save(fileName);
}
