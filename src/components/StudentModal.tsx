import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types/attendance';
import { generateQRCodeDataUrl } from '../utils/qr';
import { X, Radio, QrCode, Sparkles, UserCheck, AlertCircle } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id'>) => void;
  initialData?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [studentClass, setStudentClass] = useState('XII RPL 1');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [rfidTag, setRfidTag] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>('');
  const [isListeningRfid, setIsListeningRfid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const rfidBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setNis(initialData.nis);
      setNisn(initialData.nisn);
      setStudentClass(initialData.class);
      setGender(initialData.gender);
      setRfidTag(initialData.rfidTag);
      setQrCode(initialData.qrCode);
      setParentName(initialData.parentName);
      setParentPhone(initialData.parentPhone);
      setAddress(initialData.address || '');
      setPhotoUrl(initialData.photoUrl || '');
    } else {
      // Default new student
      const randNis = `2425${Math.floor(100 + Math.random() * 900)}`;
      const randNisn = `008${Math.floor(1000000 + Math.random() * 9000000)}`;
      const randRfid = `000${Math.floor(1000000 + Math.random() * 9000000)}`;
      setName('');
      setNis(randNis);
      setNisn(randNisn);
      setStudentClass('XII RPL 1');
      setGender('L');
      setRfidTag(randRfid);
      setQrCode(`STD-${randNis}`);
      setParentName('');
      setParentPhone('0812');
      setAddress('');
      setPhotoUrl('/src/assets/images/student_portrait_male_1790745280073.jpg');
    }
  }, [initialData, isOpen]);

  // Generate QR preview on qrCode value change
  useEffect(() => {
    if (qrCode) {
      generateQRCodeDataUrl(qrCode, 120).then(setQrPreviewUrl);
    }
  }, [qrCode]);

  // Sync NIS to QR default if empty
  const handleNisChange = (val: string) => {
    setNis(val);
    if (!initialData) {
      setQrCode(`STD-${val}`);
    }
  };

  // Listen for RFID tap when listening mode is active
  useEffect(() => {
    if (!isListeningRfid) return;

    const handleKey = (e: KeyboardEvent) => {
      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const buffered = rfidBufferRef.current.trim();
        rfidBufferRef.current = '';
        if (buffered.length >= 4) {
          setRfidTag(buffered);
          setIsListeningRfid(false);
        }
      } else if (e.key.length === 1) {
        if (diff > 200 && rfidBufferRef.current.length > 0) {
          rfidBufferRef.current = '';
        }
        rfidBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isListeningRfid]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama siswa wajib diisi');
      return;
    }
    if (!nis.trim()) {
      setErrorMessage('NIS wajib diisi');
      return;
    }
    if (!rfidTag.trim()) {
      setErrorMessage('UID RFID wajib diisi');
      return;
    }

    onSave({
      name: name.trim(),
      nis: nis.trim(),
      nisn: nisn.trim(),
      class: studentClass,
      gender,
      rfidTag: rfidTag.trim(),
      qrCode: qrCode.trim() || `STD-${nis.trim()}`,
      parentName: parentName.trim() || 'Orang Tua Siswa',
      parentPhone: parentPhone.trim() || '081200000000',
      address: address.trim(),
      photoUrl: photoUrl.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Daftarkan kartu RFID dan kode QR unik untuk presensi otomatis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Section 1: Data Identitas Siswa */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Identitas Pokok Siswa
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Dimas Pratama"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIS (Nomor Induk Siswa) *
                </label>
                <input
                  type="text"
                  required
                  value={nis}
                  onChange={(e) => handleNisChange(e.target.value)}
                  placeholder="Contoh: 2425001"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NISN (10 Digit Nasional)
                </label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Contoh: 0078945120"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas *
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                >
                  <option value="X RPL 1">X RPL 1</option>
                  <option value="X TKJ 1">X TKJ 1</option>
                  <option value="X DKV 1">X DKV 1</option>
                  <option value="XI RPL 1">XI RPL 1</option>
                  <option value="XI TKJ 2">XI TKJ 2</option>
                  <option value="XII RPL 1">XII RPL 1</option>
                  <option value="XII TKJ 1">XII TKJ 1</option>
                  <option value="XII MIPA 1">XII MIPA 1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'L'}
                      onChange={() => {
                        setGender('L');
                        if (!photoUrl || photoUrl.includes('portrait_female')) {
                          setPhotoUrl('/src/assets/images/student_portrait_male_1790745280073.jpg');
                        }
                      }}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Laki-laki (L)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'P'}
                      onChange={() => {
                        setGender('P');
                        if (!photoUrl || photoUrl.includes('portrait_male')) {
                          setPhotoUrl('/src/assets/images/student_portrait_female_1790745292137.jpg');
                        }
                      }}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Perempuan (P)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Integrasi RFID & QR Code */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Kartu RFID & Kode QR Presensi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* RFID Tag Input with Tap Listener */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-600" />
                    <span>UID Tag RFID *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsListeningRfid(true);
                      rfidBufferRef.current = '';
                    }}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                      isListeningRfid
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                    }`}
                  >
                    {isListeningRfid ? 'Mendengarkan Tap...' : 'Tap Reader Sekarang'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={rfidTag}
                  onChange={(e) => setRfidTag(e.target.value)}
                  placeholder="Contoh: 0009482711"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {isListeningRfid
                    ? '👉 Silakan tempelkan kartu RFID ke alat pembaca (reader USB) sekarang!'
                    : 'Ketik manual UID 10 digit atau klik tombol di atas lalu tempelkan kartu.'}
                </p>
              </div>

              {/* QR Code Payload & Preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Payload QR Code Siswa</span>
                  </label>
                  <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Contoh: STD-2425001"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Payload otomatis dicetak pada Kartu Pelajar.
                  </p>
                </div>
                {qrPreviewUrl && (
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shrink-0 shadow-2xs">
                    <img src={qrPreviewUrl} alt="QR Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Kontak Orang Tua & Foto Siswa */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Orang Tua & Foto Profil
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Contoh: Bpk. Hendra Pratama"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Orang Tua
                </label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Contoh: 081298765432"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Foto Siswa (Opsional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://... atau gunakan preset di bawah"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoUrl(
                        gender === 'L'
                          ? '/src/assets/images/student_portrait_male_1790745280073.jpg'
                          : '/src/assets/images/student_portrait_female_1790745292137.jpg'
                      )
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                  >
                    Gunakan Foto Seragam
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {initialData ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
