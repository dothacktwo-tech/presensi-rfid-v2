import QRCode from 'qrcode';

/**
 * Generate a QR code as a Data URL (base64 PNG)
 */
export async function generateQRCodeDataUrl(text: string, width = 240): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}"><rect width="100%" height="100%" fill="white"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#000" font-size="12">QR Error</text></svg>`;
  }
}

/**
 * Download raw QR Code PNG
 */
export async function downloadRawQRCode(text: string, filename: string, width = 600) {
  try {
    const dataUrl = await generateQRCodeDataUrl(text, width);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Gagal mengunduh QR Code', err);
  }
}

/**
 * Download a high-resolution, print-ready branded QR Code badge card with student name & school header
 */
export async function downloadStudentQRCard(
  student: { name: string; nis: string; class: string; qrCode: string },
  schoolName: string
) {
  try {
    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 760;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Top Header Banner
    ctx.fillStyle = '#1e1b4b'; // indigo-950
    ctx.fillRect(0, 0, width, 70);

    // School Name Text
    ctx.fillStyle = '#facc15'; // yellow-400
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(schoolName.toUpperCase(), width / 2, 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('KARTU QR CODE PRESENSI SISWA', width / 2, 54);

    // Generate High-Res QR Code Image
    const qrDataUrl = await QRCode.toDataURL(student.qrCode, {
      width: 440,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });

    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
    });

    // Draw QR Code centered
    ctx.drawImage(qrImg, (width - 440) / 2, 95, 440, 440);

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 560);
    ctx.lineTo(width - 40, 560);
    ctx.stroke();

    // Student Info
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(student.name, width / 2, 600);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`NIS: ${student.nis}   |   KELAS: ${student.class}`, width / 2, 635);

    // Badge / Payload code
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect((width - 320) / 2, 660, 320, 36, 8);
    ctx.fill();

    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`KODE QR: ${student.qrCode}`, width / 2, 683);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Arahkan kode QR ini ke kamera gate untuk presensi otomatis', width / 2, 730);

    // Trigger Download
    const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
    const link = document.createElement('a');
    link.download = `QR_Code_${student.nis}_${cleanName}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Gagal mencetak QR Code Badge', err);
  }
}
