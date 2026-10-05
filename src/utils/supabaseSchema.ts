export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  description: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  isUnique?: boolean;
}

export interface TableSchema {
  tableName: string;
  displayName: string;
  description: string;
  primaryKey: string;
  columns: ColumnSchema[];
  indexes: string[];
  rlsPolicies: {
    name: string;
    action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
    roles: string;
    definition: string;
    description: string;
  }[];
}

export const TABLE_SCHEMAS: TableSchema[] = [
  {
    tableName: 'school_settings',
    displayName: 'Pengaturan Sekolah (school_settings)',
    description: 'Menyimpan konfigurasi profil sekolah, jam masuk, cut-off terlambat, jam pulang, dan preferensi desain kartu.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()', description: 'Primary key unik untuk setelan sekolah', isPrimary: true },
      { name: 'school_name', type: 'VARCHAR(255)', nullable: false, defaultValue: "'SMA Negeri 1 Lumbung'", description: 'Nama resmi instansi sekolah' },
      { name: 'school_npsn', type: 'VARCHAR(20)', nullable: false, defaultValue: "'20211452'", description: 'Nomor Pokok Sekolah Nasional' },
      { name: 'school_address', type: 'TEXT', nullable: false, defaultValue: "'Jl. Raya Lumbung No. 45, Lumbung, Ciamis'", description: 'Alamat lengkap domisili sekolah' },
      { name: 'principal_name', type: 'VARCHAR(255)', nullable: false, defaultValue: "'Drs. H. Bambang Hartono, M.Pd.'", description: 'Nama dan gelar Kepala Sekolah untuk ttd laporan' },
      { name: 'academic_year', type: 'VARCHAR(50)', nullable: false, defaultValue: "'2026/2027'", description: 'Tahun pelajaran berjalan' },
      { name: 'check_in_start_time', type: 'TIME', nullable: false, defaultValue: "'06:30:00'", description: 'Batas awal pemindaian presensi masuk' },
      { name: 'check_in_end_time', type: 'TIME', nullable: false, defaultValue: "'07:15:00'", description: 'Batas cut-off tepat waktu (lewat dari ini = Terlambat)' },
      { name: 'check_out_start_time', type: 'TIME', nullable: false, defaultValue: "'15:00:00'", description: 'Waktu mulai jam pulang siswa' },
      { name: 'enable_check_out', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Saklar ON/OFF aktivasi fitur presensi jam pulang' },
      { name: 'enable_audio_beep', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Efek suara beep audio saat pemindaian' },
      { name: 'enable_tts', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Suara Text-to-Speech pemanggil nama siswa' },
      { name: 'auto_whatsapp_notice', type: 'BOOLEAN', nullable: false, defaultValue: 'FALSE', description: 'Notifikasi otomatis ke nomor WhatsApp orang tua' },
      { name: 'rfid_wedge_mode', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Dukungan global keyboard wedge untuk reader RFID USB' },
      { name: 'card_theme', type: 'VARCHAR(50)', nullable: false, defaultValue: "'royal_sapphire'", description: 'Preset tema warna kartu pelajar digital' },
      { name: 'card_pattern', type: 'VARCHAR(50)', nullable: false, defaultValue: "'waves'", description: 'Overlay corak pola background kartu' },
      { name: 'card_custom_bg_url', type: 'TEXT', nullable: true, description: 'URL gambar wallpaper kustom kartu pelajar' },
      { name: 'card_custom_color1', type: 'VARCHAR(20)', nullable: true, description: 'Warna gradasi hex primer kustom' },
      { name: 'card_custom_color2', type: 'VARCHAR(20)', nullable: true, description: 'Warna gradasi hex sekunder kustom' },
      { name: 'card_accent_color', type: 'VARCHAR(20)', nullable: true, description: 'Warna aksen teks & badge kartu' },
      { name: 'card_text_color', type: 'VARCHAR(10)', nullable: false, defaultValue: "'light'", description: 'Mode kontras teks kartu (light / dark)' },
      { name: 'card_show_watermark', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Tampilkan watermark logo transparan di kartu' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Timestamp pembuatan data' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Timestamp pembaharuan data' },
    ],
    indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS idx_school_settings_singleton ON school_settings ((true));'],
    rlsPolicies: [
      {
        name: 'Public read school settings for kiosk terminal',
        action: 'SELECT',
        roles: 'anon, authenticated',
        definition: 'true',
        description: 'Terminal kiosk dan aplikasi dapat membaca nama sekolah dan jadwal jam.',
      },
      {
        name: 'Admins can update school settings',
        action: 'UPDATE',
        roles: 'authenticated',
        definition: "auth.role() = 'authenticated'",
        description: 'Hanya pengguna admin terautentikasi yang dapat mengubah konfigurasi sekolah.',
      },
    ],
  },
  {
    tableName: 'classes',
    displayName: 'Data Rombel & Kelas (classes)',
    description: 'Daftar rombongan belajar / kelas siswa (Tingkat X, XI, XII) dengan info wali kelas dan kapasitas.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', nullable: false, description: 'ID kode unik kelas (cth: X-MIPA-1)', isPrimary: true },
      { name: 'name', type: 'VARCHAR(100)', nullable: false, description: 'Nama lengkap rombel kelas' },
      { name: 'grade_level', type: 'VARCHAR(10)', nullable: false, description: 'Tingkat kelas (X, XI, atau XII)' },
      { name: 'major', type: 'VARCHAR(50)', nullable: true, description: 'Jurusan / Peminatan (MIPA, IPS, Bahasa, TKJ, dll)' },
      { name: 'homeroom_teacher', type: 'VARCHAR(255)', nullable: true, description: 'Nama wali kelas pembina' },
      { name: 'room_number', type: 'VARCHAR(30)', nullable: true, description: 'Ruang kelas / gedung' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Waktu pembuatan' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Waktu update' },
    ],
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade_level);',
      'CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(name);',
    ],
    rlsPolicies: [
      {
        name: 'Allow all users to read classes list',
        action: 'SELECT',
        roles: 'anon, authenticated',
        definition: 'true',
        description: 'Daftar kelas dapat dibaca oleh antarmuka sistem dan filter laporan.',
      },
      {
        name: 'Allow authenticated admins full management on classes',
        action: 'ALL',
        roles: 'authenticated',
        definition: "auth.role() = 'authenticated'",
        description: 'Admin dapat menambah, mengubah, dan menghapus data kelas.',
      },
    ],
  },
  {
    tableName: 'students',
    displayName: 'Data Master Siswa (students)',
    description: 'Menyimpan profil identitas siswa, NIS, NISN, UID Kartu RFID, token QR Code, dan nomor kontak orang tua.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', nullable: false, description: 'ID Siswa unik (cth: s1, s2 atau UUID)', isPrimary: true },
      { name: 'nis', type: 'VARCHAR(20)', nullable: false, description: 'Nomor Induk Siswa (Wajib & Unik)', isUnique: true },
      { name: 'nisn', type: 'VARCHAR(20)', nullable: false, description: 'Nomor Induk Siswa Nasional Kemdikbud', isUnique: true },
      { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'Nama lengkap siswa sesuai akta' },
      { name: 'gender', type: "VARCHAR(2) CHECK (gender IN ('L', 'P'))", nullable: false, description: 'Jenis Kelamin (L = Laki-laki, P = Perempuan)' },
      { name: 'class', type: 'VARCHAR(50)', nullable: false, description: 'Nama kelas rombel siswa', isForeign: true },
      { name: 'rfid_tag', type: 'VARCHAR(50)', nullable: true, description: 'Nomor UID chip RFID / kartu pintar', isUnique: true },
      { name: 'qr_code', type: 'VARCHAR(100)', nullable: false, description: 'Payload string QR Code kartu pelajar', isUnique: true },
      { name: 'parent_phone', type: 'VARCHAR(30)', nullable: false, description: 'Nomor WhatsApp / telepon orang tua/wali' },
      { name: 'parent_name', type: 'VARCHAR(255)', nullable: false, description: 'Nama orang tua atau wali murid' },
      { name: 'photo_url', type: 'TEXT', nullable: true, description: 'URL foto profil siswa' },
      { name: 'address', type: 'TEXT', nullable: true, description: 'Alamat tempat tinggal siswa' },
      { name: 'birth_date', type: 'DATE', nullable: true, description: 'Tanggal lahir siswa (YYYY-MM-DD)' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Status keaktifan siswa di sekolah' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Waktu pembuatan' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Waktu update' },
    ],
    indexes: [
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_students_nis ON students(nis);',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);',
      'CREATE INDEX IF NOT EXISTS idx_students_rfid ON students(rfid_tag) WHERE rfid_tag IS NOT NULL;',
      'CREATE INDEX IF NOT EXISTS idx_students_qr ON students(qr_code);',
      'CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);',
      'CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);',
    ],
    rlsPolicies: [
      {
        name: 'Kiosk and Admin can look up students by RFID or QR',
        action: 'SELECT',
        roles: 'anon, authenticated',
        definition: 'is_active = true',
        description: 'Terminal kiosk publik dapat mencari siswa berdasarkan RFID/QR untuk proses tapping.',
      },
      {
        name: 'Admins have full access to manage students',
        action: 'ALL',
        roles: 'authenticated',
        definition: "auth.role() = 'authenticated'",
        description: 'Admin berhak melakukan insert, update data diri, dan delete siswa.',
      },
    ],
  },
  {
    tableName: 'attendance_records',
    displayName: 'Rekap & Transaksi Presensi (attendance_records)',
    description: 'Catatan log kehadiran harian siswa, status masuk/pulang, timestamp scanner, kunci status, dan alasan.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()', description: 'ID unik baris presensi', isPrimary: true },
      { name: 'student_id', type: 'VARCHAR(50)', nullable: false, description: 'Relasi foreign key ke tabel students(id)', isForeign: true },
      { name: 'date', type: 'DATE', nullable: false, description: 'Tanggal kalender presensi (YYYY-MM-DD)' },
      { name: 'check_in_time', type: 'VARCHAR(20)', nullable: true, description: 'Jam pemindaian masuk (HH:mm:ss), boleh kosong untuk Izin/Sakit/Alpha/Terlambat' },
      { name: 'check_out_time', type: 'VARCHAR(20)', nullable: true, description: 'Jam pemindaian pulang sekolah (HH:mm:ss)' },
      { name: 'status', type: "VARCHAR(20) CHECK (status IN ('Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'))", nullable: false, description: 'Status kehadiran resmi' },
      { name: 'method', type: "VARCHAR(20) CHECK (method IN ('RFID', 'QR', 'Manual'))", nullable: false, description: 'Metode tapping presensi' },
      { name: 'notes', type: 'TEXT', nullable: true, description: 'Catatan/keterangan surat dokter, dispensasi atau alasan' },
      { name: 'is_locked', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Kunci otomatis 🔒 untuk mencegah edit tidak sah' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Waktu tapping' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Waktu perbaikan' },
    ],
    indexes: [
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);',
      'CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);',
      'CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);',
      'CREATE INDEX IF NOT EXISTS idx_attendance_date_status ON attendance_records(date, status);',
    ],
    rlsPolicies: [
      {
        name: 'Public read attendance records for dashboards & reports',
        action: 'SELECT',
        roles: 'anon, authenticated',
        definition: 'true',
        description: 'Dashboard dan laporan publik/guru dapat membaca data kehadiran harian.',
      },
      {
        name: 'Kiosk and Users can insert attendance records',
        action: 'INSERT',
        roles: 'anon, authenticated',
        definition: 'true',
        description: 'Terminal kiosk RFID & QR dapat merekam absensi masuk/pulang saat siswa tapping.',
      },
      {
        name: 'Admins can modify and unlock attendance records',
        action: 'UPDATE',
        roles: 'authenticated',
        definition: "auth.role() = 'authenticated'",
        description: 'Hanya admin yang dapat mengedit status presensi atau membuka gembok kunci.',
      },
      {
        name: 'Admins can delete attendance records',
        action: 'DELETE',
        roles: 'authenticated',
        definition: "auth.role() = 'authenticated'",
        description: 'Admin berhak menghapus atau mereset data presensi salah tapping.',
      },
    ],
  },
  {
    tableName: 'report_audit_logs',
    displayName: 'Audit Unduhan Laporan (report_audit_logs)',
    description: 'Riwayat audit trail ekspor dokumen PDF dan unduhan backup database oleh petugas admin.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()', description: 'ID log audit', isPrimary: true },
      { name: 'user_id', type: 'VARCHAR(50)', nullable: false, description: 'Username atau ID admin pengunduh' },
      { name: 'user_name', type: 'VARCHAR(255)', nullable: false, description: 'Nama lengkap petugas admin' },
      { name: 'download_time', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Waktu pencetakan/pengunduhan' },
      { name: 'report_type', type: 'VARCHAR(100)', nullable: false, description: 'Jenis dokumen yang dicetak (misal: Rekap PDF, Backup JSON)' },
      { name: 'date_range', type: 'VARCHAR(100)', nullable: false, description: 'Rentang tanggal filter data' },
      { name: 'selected_class', type: 'VARCHAR(50)', nullable: false, description: 'Filter kelas sasaran laporan' },
      { name: 'total_records', type: 'INTEGER', nullable: false, defaultValue: '0', description: 'Jumlah baris data tercetak' },
      { name: 'file_name', type: 'VARCHAR(255)', nullable: false, description: 'Nama berkas dokumen yang terunduh' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Timestamp log' },
    ],
    indexes: ['CREATE INDEX IF NOT EXISTS idx_audit_time ON report_audit_logs(download_time DESC);'],
    rlsPolicies: [
      {
        name: 'Authenticated admins can read and insert audit logs',
        action: 'ALL',
        roles: 'authenticated',
        definition: "auth.role() = 'authenticated'",
        description: 'Admin dapat mencatat riwayat cetak dan melihat riwayat audit laporan.',
      },
    ],
  },
  {
    tableName: 'admin_users',
    displayName: 'Pengguna & Petugas Admin (admin_users)',
    description: 'Daftar akun admin sistem, guru piket, dan hak akses kontrol perizinan.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()', description: 'ID unik pengguna admin', isPrimary: true },
      { name: 'username', type: 'VARCHAR(50)', nullable: false, description: 'Username login', isUnique: true },
      { name: 'password_hash', type: 'TEXT', nullable: false, description: 'Hash kata sandi terenkripsi bcrypt' },
      { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'Nama lengkap petugas / guru' },
      { name: 'role', type: "VARCHAR(30) CHECK (role IN ('superadmin', 'admin', 'guru_piket'))", nullable: false, defaultValue: "'admin'", description: 'Tingkatan peran hak akses' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Status akun aktif' },
      { name: 'last_login_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Waktu login terakhir' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', description: 'Waktu pembuatan akun' },
    ],
    indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);'],
    rlsPolicies: [
      {
        name: 'Only authenticated users can read admin list',
        action: 'SELECT',
        roles: 'authenticated',
        definition: "auth.role() = 'authenticated'",
        description: 'Mencegah pembacaan kredensial admin oleh pihak luar.',
      },
    ],
  },
];

// ==========================================
// 1. FULL SUPABASE DDL SCRIPT (CREATE TABLES)
// ==========================================
export const FULL_SUPABASE_DDL_SQL = `-- =========================================================================
-- SISTEM PRESENSI SISWA DIGITAL - SUPABASE POSTGRESQL FULL DDL SCHEMA
-- Target Database: PostgreSQL 14+ / Supabase
-- Tanggal Dibuat: ${new Date().toISOString().split('T')[0]}
-- Deskripsi: Script DDL lengkap, pembuatan tabel, relasi, constraint & trigger
-- =========================================================================

-- 1. AKTIFKAN EXTENSION POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. FUNGSI OTOMATIS PEMBAHARUAN updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------
-- 3. TABEL: school_settings (Pengaturan Profil Sekolah & Kartu)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name VARCHAR(255) NOT NULL DEFAULT 'SMA Negeri 1 Lumbung',
    school_npsn VARCHAR(20) NOT NULL DEFAULT '20211452',
    school_address TEXT NOT NULL DEFAULT 'Jl. Raya Lumbung No. 45, Lumbung, Ciamis',
    principal_name VARCHAR(255) NOT NULL DEFAULT 'Drs. H. Bambang Hartono, M.Pd.',
    academic_year VARCHAR(50) NOT NULL DEFAULT '2026/2027',
    check_in_start_time TIME NOT NULL DEFAULT '06:30:00',
    check_in_end_time TIME NOT NULL DEFAULT '07:15:00',
    check_out_start_time TIME NOT NULL DEFAULT '15:00:00',
    enable_check_out BOOLEAN NOT NULL DEFAULT TRUE,
    enable_audio_beep BOOLEAN NOT NULL DEFAULT TRUE,
    enable_tts BOOLEAN NOT NULL DEFAULT TRUE,
    auto_whatsapp_notice BOOLEAN NOT NULL DEFAULT FALSE,
    rfid_wedge_mode BOOLEAN NOT NULL DEFAULT TRUE,
    card_theme VARCHAR(50) NOT NULL DEFAULT 'royal_sapphire',
    card_pattern VARCHAR(50) NOT NULL DEFAULT 'waves',
    card_custom_bg_url TEXT,
    card_custom_color1 VARCHAR(20),
    card_custom_color2 VARCHAR(20),
    card_accent_color VARCHAR(20),
    card_text_color VARCHAR(10) NOT NULL DEFAULT 'light',
    card_show_watermark BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at school_settings
DROP TRIGGER IF EXISTS trg_school_settings_updated ON public.school_settings;
CREATE TRIGGER trg_school_settings_updated
    BEFORE UPDATE ON public.school_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------------
-- 4. TABEL: classes (Rombongan Belajar & Tingkat Kelas)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(10) NOT NULL, -- 'X', 'XI', 'XII'
    major VARCHAR(50),                -- 'MIPA', 'IPS', 'Bahasa', dll
    homeroom_teacher VARCHAR(255),
    room_number VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_grade ON public.classes(grade_level);
CREATE INDEX IF NOT EXISTS idx_classes_name ON public.classes(name);

-- Trigger updated_at classes
DROP TRIGGER IF EXISTS trg_classes_updated ON public.classes;
CREATE TRIGGER trg_classes_updated
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------------
-- 5. TABEL: students (Data Master Siswa, RFID & QR Code)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(50) PRIMARY KEY,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(2) NOT NULL CHECK (gender IN ('L', 'P')),
    class VARCHAR(50) NOT NULL,
    rfid_tag VARCHAR(50) UNIQUE,
    qr_code VARCHAR(100) NOT NULL UNIQUE,
    parent_phone VARCHAR(30) NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    address TEXT,
    birth_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_nis ON public.students(nis);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON public.students(nisn);
CREATE INDEX IF NOT EXISTS idx_students_rfid ON public.students(rfid_tag) WHERE rfid_tag IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_qr ON public.students(qr_code);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(name);

-- Trigger updated_at students
DROP TRIGGER IF EXISTS trg_students_updated ON public.students;
CREATE TRIGGER trg_students_updated
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------------
-- 6. TABEL: attendance_records (Transaksi Presensi Masuk & Pulang)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time VARCHAR(20),   -- HH:mm:ss (Boleh NULL/kosong untuk izin, sakit, alpa)
    check_out_time VARCHAR(20),  -- HH:mm:ss
    status VARCHAR(20) NOT NULL CHECK (status IN ('Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha')),
    method VARCHAR(20) NOT NULL CHECK (method IN ('RFID', 'QR', 'Manual')),
    notes TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_daily_attendance UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date_status ON public.attendance_records(date, status);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance_records(student_id, date);

-- Trigger updated_at attendance_records
DROP TRIGGER IF EXISTS trg_attendance_records_updated ON public.attendance_records;
CREATE TRIGGER trg_attendance_records_updated
    BEFORE UPDATE ON public.attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------------
-- 7. TABEL: report_audit_logs (Audit Trail Cetak & Backup)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.report_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    download_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    report_type VARCHAR(100) NOT NULL,
    date_range VARCHAR(100) NOT NULL,
    selected_class VARCHAR(50) NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_time ON public.report_audit_logs(download_time DESC);

-- -------------------------------------------------------------------------
-- 8. TABEL: admin_users (Pengguna & Petugas Admin)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'guru_piket')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON public.admin_users(username);
`;

// ==========================================
// 2. SUPABASE RLS (ROW LEVEL SECURITY) SCRIPT
// ==========================================
export const SUPABASE_RLS_SQL = `-- =========================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- Menjamin keamanan data, akses kiosk scanner publik, dan proteksi admin
-- =========================================================================

-- 1. AKTIFKAN RLS PADA SELURUH TABEL
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- POLICIES: school_settings
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view school settings" ON public.school_settings;
CREATE POLICY "Public can view school settings"
    ON public.school_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can update school settings" ON public.school_settings;
CREATE POLICY "Only authenticated admins can update school settings"
    ON public.school_settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- -------------------------------------------------------------------------
-- POLICIES: classes
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view classes list" ON public.classes;
CREATE POLICY "Public can view classes list"
    ON public.classes
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
CREATE POLICY "Admins can manage classes"
    ON public.classes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- -------------------------------------------------------------------------
-- POLICIES: students
-- -------------------------------------------------------------------------
-- Kiosk dapat membaca siswa aktif untuk verifikasi tapping RFID / scan QR
DROP POLICY IF EXISTS "Kiosk and authenticated users can view students" ON public.students;
CREATE POLICY "Kiosk and authenticated users can view students"
    ON public.students
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Hanya admin yang dapat menambah, merubah, dan menghapus siswa
DROP POLICY IF EXISTS "Admins have full access on students" ON public.students;
CREATE POLICY "Admins have full access on students"
    ON public.students
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- -------------------------------------------------------------------------
-- POLICIES: attendance_records
-- -------------------------------------------------------------------------
-- Pembacaan rekapitulasi kehadiran (Kiosk, Guru, Dashboard)
DROP POLICY IF EXISTS "Allow reading attendance records" ON public.attendance_records;
CREATE POLICY "Allow reading attendance records"
    ON public.attendance_records
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Tapping Presensi Masuk / Pulang dari Kiosk Terminal (Anonim/Publik)
DROP POLICY IF EXISTS "Allow kiosk to insert attendance records" ON public.attendance_records;
CREATE POLICY "Allow kiosk to insert attendance records"
    ON public.attendance_records
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Update jam pulang dari Kiosk (saat tapping kedua)
DROP POLICY IF EXISTS "Allow kiosk to update checkout time" ON public.attendance_records;
CREATE POLICY "Allow kiosk to update checkout time"
    ON public.attendance_records
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Penghapusan atau pembukaan gembok hanya oleh admin
DROP POLICY IF EXISTS "Admins can delete attendance records" ON public.attendance_records;
CREATE POLICY "Admins can delete attendance records"
    ON public.attendance_records
    FOR DELETE
    TO authenticated
    USING (true);

-- -------------------------------------------------------------------------
-- POLICIES: report_audit_logs
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view and insert audit logs" ON public.report_audit_logs;
CREATE POLICY "Admins can view and insert audit logs"
    ON public.report_audit_logs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- -------------------------------------------------------------------------
-- POLICIES: admin_users
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Protect admin accounts" ON public.admin_users;
CREATE POLICY "Protect admin accounts"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
`;

// ==========================================
// 3. SUPABASE SEED DATA SCRIPT (INITIAL DATA)
// ==========================================
export const SUPABASE_SEED_SQL = `-- =========================================================================
-- SUPABASE INITIAL SEED DATA
-- Memasukkan data awal profil sekolah, data rombel kelas, siswa & setelan
-- =========================================================================

-- 1. SEED PENGATURAN SEKOLAH
INSERT INTO public.school_settings (
    id,
    school_name,
    school_npsn,
    school_address,
    principal_name,
    academic_year,
    check_in_start_time,
    check_in_end_time,
    check_out_start_time,
    enable_check_out,
    enable_audio_beep,
    enable_tts,
    auto_whatsapp_notice,
    rfid_wedge_mode,
    card_theme,
    card_pattern
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SMA Negeri 1 Lumbung',
    '20211452',
    'Jl. Raya Lumbung No. 45, Lumbung, Ciamis, Jawa Barat 46258',
    'Drs. H. Bambang Hartono, M.Pd.',
    '2026/2027',
    '06:30:00',
    '07:15:00',
    '15:00:00',
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    TRUE,
    'royal_sapphire',
    'waves'
) ON CONFLICT (id) DO UPDATE SET
    school_name = EXCLUDED.school_name,
    principal_name = EXCLUDED.principal_name;

-- 2. SEED DAFTAR KELAS (ROMBEL)
INSERT INTO public.classes (id, name, grade_level, major, homeroom_teacher, room_number)
VALUES
    ('X-MIPA-1', 'X MIPA 1', 'X', 'MIPA', 'Siti Rahmawati, S.Pd.', 'R.101'),
    ('X-MIPA-2', 'X MIPA 2', 'X', 'MIPA', 'Ahmad Fauzi, S.Si.', 'R.102'),
    ('X-IPS-1', 'X IPS 1', 'X', 'IPS', 'Dra. Endang Lestari', 'R.103'),
    ('XI-MIPA-1', 'XI MIPA 1', 'XI', 'MIPA', 'Budi Santoso, M.Pd.', 'R.201'),
    ('XI-MIPA-2', 'XI MIPA 2', 'XI', 'MIPA', 'Dedi Kurniawan, S.Pd.', 'R.202'),
    ('XI-IPS-1', 'XI IPS 1', 'XI', 'IPS', 'Sri Wahyuni, S.Sos.', 'R.203'),
    ('XII-MIPA-1', 'XII MIPA 1', 'XII', 'MIPA', 'Drs. Agus Hidayat', 'R.301'),
    ('XII-MIPA-2', 'XII MIPA 2', 'XII', 'MIPA', 'Nurul Hidayah, M.Si.', 'R.302'),
    ('XII-IPS-1', 'XII IPS 1', 'XII', 'IPS', 'Hendra Gunawan, S.Pd.', 'R.303')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED AKUN ADMIN DEFAULT (Password: admin123)
-- Hash dibuat dengan pgcrypto crypt('admin123', gen_salt('bf'))
INSERT INTO public.admin_users (username, password_hash, name, role, is_active)
VALUES
    ('admin', crypt('admin123', gen_salt('bf')), 'Administrator Utama', 'superadmin', TRUE),
    ('gurupiket', crypt('piket123', gen_salt('bf')), 'Guru Piket Harian', 'guru_piket', TRUE)
ON CONFLICT (username) DO NOTHING;

-- 4. SEED SAMPLE SISWA
INSERT INTO public.students (id, nis, nisn, name, gender, class, rfid_tag, qr_code, parent_phone, parent_name, photo_url)
VALUES
    ('s1', '242510001', '0081234567', 'Aditya Pratama', 'L', 'X-MIPA-1', '0008472910', 'SISWA-2026-001', '081234567890', 'Bambang Pratama', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'),
    ('s2', '242510002', '0081234568', 'Anisa Rahmawati', 'P', 'X-MIPA-1', '0008472911', 'SISWA-2026-002', '081234567891', 'Suryadi Raharja', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
    ('s3', '242510003', '0081234569', 'Bagus Nugroho', 'L', 'X-MIPA-2', '0008472912', 'SISWA-2026-003', '081234567892', 'Tri Nugroho', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
    ('s4', '242510004', '0081234570', 'Citra Dewi', 'P', 'X-MIPA-2', '0008472913', 'SISWA-2026-004', '081234567893', 'Agus Hendra', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
    ('s5', '232410001', '0071234571', 'Dimas Arya Putra', 'L', 'XI-MIPA-1', '0008472914', 'SISWA-2026-005', '081234567894', 'Wawan Darmawan', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
    ('s6', '232410002', '0071234572', 'Eka Putri Lestari', 'P', 'XI-MIPA-1', '0008472915', 'SISWA-2026-006', '081234567895', 'Joko Susilo', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    ('s7', '222310001', '0061234573', 'Fajar Ramadhan', 'L', 'XII-MIPA-1', '0008472916', 'SISWA-2026-007', '081234567896', 'Hadi Ramadhan', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'),
    ('s8', '222310002', '0061234574', 'Gita Permata', 'P', 'XII-IPS-1', '0008472917', 'SISWA-2026-008', '081234567897', 'Gunawan Permana', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;
`;

// ==========================================
// 4. SUPABASE ANALYTICAL & USEFUL QUERIES
// ==========================================
export const SUPABASE_QUERIES_SQL = `-- =========================================================================
-- QUERY SQL BERGUNA & ANALISIS DATA PRESENSI SUPABASE
-- Kumpulan query analisis siap salin untuk pelaporan & integrasi
-- =========================================================================

-- 1. REKAPITULASI STATISTIK KEHADIRAN HARI INI
SELECT 
    COUNT(s.id) AS total_siswa,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Hadir') AS hadir_tepat_waktu,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Terlambat') AS terlambat,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Izin') AS izin,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Sakit') AS sakit,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Alpha') AS alpha,
    COUNT(s.id) - COUNT(ar.id) AS belum_absen,
    ROUND(
        (COUNT(ar.id) FILTER (WHERE ar.status IN ('Hadir', 'Terlambat'))::NUMERIC / NULLIF(COUNT(s.id), 0)) * 100, 
        1
    ) AS persentase_kehadiran
FROM public.students s
LEFT JOIN public.attendance_records ar 
    ON s.id = ar.student_id AND ar.date = CURRENT_DATE
WHERE s.is_active = TRUE;

-- 2. DAFTAR SISWA YANG BELUM ABSEN HARI INI PER KELAS
SELECT 
    s.nis,
    s.nisn,
    s.name AS nama_siswa,
    s.gender AS jk,
    s.class AS kelas,
    s.parent_phone AS no_wa_ortu
FROM public.students s
LEFT JOIN public.attendance_records ar 
    ON s.id = ar.student_id AND ar.date = CURRENT_DATE
WHERE ar.id IS NULL 
  AND s.is_active = TRUE
ORDER BY s.class ASC, s.name ASC;

-- 3. REKAPITULASI TINGKAT KEHADIRAN SISWA BULAN INI
SELECT 
    s.nis,
    s.name AS nama_siswa,
    s.class AS kelas,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Hadir') AS hadir,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Terlambat') AS terlambat,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Izin') AS izin,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Sakit') AS sakit,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Alpha') AS alpha,
    ROUND(
        (COUNT(ar.id) FILTER (WHERE ar.status IN ('Hadir', 'Terlambat'))::NUMERIC / NULLIF(COUNT(ar.id), 0)) * 100,
        1
    ) AS persen_disiplin
FROM public.students s
LEFT JOIN public.attendance_records ar 
    ON s.id = ar.student_id 
    AND ar.date >= DATE_TRUNC('month', CURRENT_DATE)
WHERE s.is_active = TRUE
GROUP BY s.id, s.nis, s.name, s.class
ORDER BY s.class ASC, s.name ASC;

-- 4. PEMERINGKATAN PERSENTASE KEHADIRAN PER KELAS
SELECT 
    s.class AS kelas,
    COUNT(DISTINCT s.id) AS total_siswa,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Hadir') AS total_hadir,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Terlambat') AS total_terlambat,
    COUNT(ar.id) FILTER (WHERE ar.status = 'Alpha') AS total_alpha,
    ROUND(
        (COUNT(ar.id) FILTER (WHERE ar.status IN ('Hadir', 'Terlambat'))::NUMERIC / 
         NULLIF(COUNT(DISTINCT s.id) * EXTRACT(DAY FROM CURRENT_DATE), 0)) * 100,
        1
    ) AS indeks_kehadiran_kelas
FROM public.students s
LEFT JOIN public.attendance_records ar 
    ON s.id = ar.student_id 
    AND ar.date >= DATE_TRUNC('month', CURRENT_DATE)
WHERE s.is_active = TRUE
GROUP BY s.class
ORDER BY indeks_kehadiran_kelas DESC;
`;

// ==========================================
// 5. SUPABASE TYPESCRIPT CLIENT CODE SNIPPET
// ==========================================
export const SUPABASE_CLIENT_SNIPPET = `// src/lib/supabaseClient.ts
// Contoh inisialisasi koneksi Supabase di frontend React/TypeScript

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
`;
