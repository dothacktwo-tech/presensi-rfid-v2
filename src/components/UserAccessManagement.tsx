import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AdminAccount, UserRole, UserPermission } from '../types/attendance';
import { DEFAULT_ROLE_PERMISSIONS } from '../data/mockData';
import {
  ShieldCheck,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Plus,
  Search,
  Filter,
  Check,
  Sliders,
  Sparkles,
  Info,
  Crown,
  ClipboardCheck,
  GraduationCap,
  Eye,
  FileText,
  CreditCard,
  Database,
  Settings,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';

export const UserAccessManagement: React.FC = () => {
  const {
    adminAccounts,
    adminUser,
    addAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
    toggleAdminAccountStatus,
    settings,
  } = useAttendance();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State for Add / Edit User
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formUsername, setFormUsername] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('admin');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formAssignedClass, setFormAssignedClass] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formCustomPermissions, setFormCustomPermissions] = useState<UserPermission>(
    DEFAULT_ROLE_PERMISSIONS.admin
  );

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = adminAccounts.length;
    const superAdmins = adminAccounts.filter((a) => a.role === 'superadmin').length;
    const admins = adminAccounts.filter((a) => a.role === 'admin').length;
    const piket = adminAccounts.filter((a) => a.role === 'guru_piket').length;
    const waliKelas = adminAccounts.filter((a) => a.role === 'wali_kelas').length;
    const activeUsers = adminAccounts.filter((a) => a.isActive).length;

    return { total, superAdmins, admins, piket, waliKelas, activeUsers };
  }, [adminAccounts]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return adminAccounts.filter((acc) => {
      if (roleFilter !== 'ALL' && acc.role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        acc.name.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        acc.email?.toLowerCase().includes(q) ||
        acc.assignedClass?.toLowerCase().includes(q)
      );
    });
  }, [adminAccounts, roleFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormUsername('');
    setFormName('');
    setFormPassword('');
    setFormRole('admin');
    setFormEmail('');
    setFormPhone('');
    setFormAssignedClass('');
    setFormIsActive(true);
    setFormCustomPermissions(DEFAULT_ROLE_PERMISSIONS.admin);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account: AdminAccount) => {
    setEditingUserId(account.id);
    setFormUsername(account.username);
    setFormName(account.name);
    setFormPassword('');
    setFormRole(account.role);
    setFormEmail(account.email || '');
    setFormPhone(account.phone || '');
    setFormAssignedClass(account.assignedClass || '');
    setFormIsActive(account.isActive);
    setFormCustomPermissions(
      account.customPermissions
        ? { ...DEFAULT_ROLE_PERMISSIONS[account.role], ...account.customPermissions }
        : DEFAULT_ROLE_PERMISSIONS[account.role]
    );
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormRole(newRole);
    setFormCustomPermissions(DEFAULT_ROLE_PERMISSIONS[newRole]);
  };

  const handleTogglePermission = (key: keyof UserPermission) => {
    setFormCustomPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formUsername.trim() || !formName.trim()) {
      alert('Nama dan username wajib diisi.');
      return;
    }

    if (editingUserId) {
      // Update existing
      const updates: Partial<AdminAccount> = {
        name: formName.trim(),
        role: formRole,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        assignedClass: formRole === 'wali_kelas' ? formAssignedClass.trim() : undefined,
        isActive: formIsActive,
        customPermissions: formCustomPermissions,
      };

      if (formPassword.trim()) {
        updates.password = formPassword.trim();
      }

      updateAdminAccount(editingUserId, updates);
      showToast(`Data pengguna ${formName} berhasil diperbarui.`);
    } else {
      // Check username duplicate
      if (
        adminAccounts.some((a) => a.username.toLowerCase() === formUsername.trim().toLowerCase())
      ) {
        alert('Username sudah digunakan. Silakan gunakan username lain.');
        return;
      }

      addAdminAccount({
        username: formUsername.trim().toLowerCase(),
        name: formName.trim(),
        password: formPassword.trim() || 'admin123',
        role: formRole,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        assignedClass: formRole === 'wali_kelas' ? formAssignedClass.trim() : undefined,
        isActive: formIsActive,
        customPermissions: formCustomPermissions,
      });

      showToast(`Pengguna baru [${formUsername}] berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteUser = (account: AdminAccount) => {
    if (account.username === 'admin') {
      alert('Akun administrator default utama tidak dapat dihapus.');
      return;
    }

    if (confirm(`Yakin ingin menghapus pengguna "${account.name}" (${account.username})?`)) {
      deleteAdminAccount(account.id);
      showToast(`Pengguna ${account.name} telah dihapus.`);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Crown className="w-3 h-3 text-amber-600" />
            <span>Super Admin</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span>Administrator</span>
          </span>
        );
      case 'guru_piket':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <ClipboardCheck className="w-3 h-3 text-emerald-600" />
            <span>Guru Piket</span>
          </span>
        );
      case 'wali_kelas':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <GraduationCap className="w-3 h-3 text-purple-600" />
            <span>Wali Kelas</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. HERO TITLE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold mb-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>MANAJEMEN HAK AKSES &amp; PENGGUNA SISTEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pengaturan Hak Akses Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {settings.schoolName || 'SMA Negeri 1 Lumbung'} &middot; Kelola akun petugas, wewenang akses modul (Super Admin, Operator, Guru Piket, Wali Kelas), proteksi kata sandi, dan status keaktifan user.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Pengguna Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-emerald-200 hover:text-white rounded"
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Total Akun</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{stats.total}</div>
          <span className="text-[10px] text-slate-400">Pengguna terdaftar</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-amber-700 font-semibold block">Super Admin</span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">{stats.superAdmins}</div>
          <span className="text-[10px] text-amber-600/80">Hak akses penuh</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-indigo-700 font-semibold block">Administrator</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-0.5">{stats.admins}</div>
          <span className="text-[10px] text-indigo-600/80">Operator TI</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-emerald-700 font-semibold block">Guru Piket</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">{stats.piket}</div>
          <span className="text-[10px] text-emerald-600/80">Presensi harian</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-purple-700 font-semibold block">Wali Kelas</span>
          <div className="text-2xl font-bold font-mono text-purple-600 mt-0.5">{stats.waliKelas}</div>
          <span className="text-[10px] text-purple-600/80">Rekap kelas</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Akun Aktif</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">{stats.activeUsers}</div>
          <span className="text-[10px] text-emerald-600/80">Status normal</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-indigo-500"
          >
            <option value="ALL">Semua Peran ({stats.total})</option>
            <option value="superadmin">Super Admin ({stats.superAdmins})</option>
            <option value="admin">Administrator ({stats.admins})</option>
            <option value="guru_piket">Guru Piket ({stats.piket})</option>
            <option value="wali_kelas">Wali Kelas ({stats.waliKelas})</option>
          </select>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, username, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Nama &amp; Username</th>
                <th className="py-3 px-3">Peran (Role)</th>
                <th className="py-3 px-3">Kontak &amp; Email</th>
                <th className="py-3 px-3">Kelas Binaan</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Login Terakhir</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  const isCurrentUser = adminUser?.username === account.username;

                  return (
                    <tr key={account.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Username */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {account.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{account.name}</span>
                              {isCurrentUser && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              @{account.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getRoleBadge(account.role)}
                      </td>

                      {/* Contact & Email */}
                      <td className="py-3 px-3 text-slate-600">
                        <div className="space-y-0.5">
                          {account.email && (
                            <div className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{account.email}</span>
                            </div>
                          )}
                          {account.phone && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{account.phone}</span>
                            </div>
                          )}
                          {!account.email && !account.phone && (
                            <span className="text-slate-300 italic">-</span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Class */}
                      <td className="py-3 px-3">
                        {account.assignedClass ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            {account.assignedClass}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">Semua</span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleAdminAccountStatus(account.id)}
                          disabled={account.username === 'admin'}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border transition-colors ${
                            account.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Klik untuk mengubah status aktif/nonaktif"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              account.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{account.isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {account.lastLoginAt || <span className="text-slate-300 italic">Belum login</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(account)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Peran & Hak Akses"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {account.username !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(account)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role & Permissions Matrix Explanation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Matriks Standar Hak Akses Berdasarkan Peran (Role-Based Access Control)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap tingkatan peran memiliki batasan wewenang modul tersendiri untuk menjaga keamanan data.
            </p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                <th className="py-2.5 px-3">Modul &amp; Fitur</th>
                <th className="py-2.5 px-3 text-center">Super Admin 👑</th>
                <th className="py-2.5 px-3 text-center">Administrator 🛡️</th>
                <th className="py-2.5 px-3 text-center">Guru Piket 📋</th>
                <th className="py-2.5 px-3 text-center">Wali Kelas 👨‍🏫</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { module: 'Dashboard & Analitik Kehadiran', sa: true, admin: true, piket: true, wali: true },
                { module: 'Absensi Manual (Input Masuk, Izin, Sakit, Alpa)', sa: true, admin: true, piket: true, wali: false },
                { module: 'Master Data Siswa (Tambah, Edit, Hapus)', sa: true, admin: true, piket: false, wali: false },
                { module: 'Data Rombel & Kelas (Tingkat X, XI, XII)', sa: true, admin: true, piket: false, wali: false },
                { module: 'Cetak & Unduh Laporan Rekap PDF', sa: true, admin: true, piket: true, wali: true },
                { module: 'Cetak Kartu Pelajar & Generator QR/Barcode', sa: true, admin: true, piket: false, wali: false },
                { module: 'Pengaturan Database & Schema Supabase', sa: true, admin: true, piket: false, wali: false },
                { module: 'Pengaturan Sistem & Profil Sekolah', sa: true, admin: true, piket: false, wali: false },
                { module: 'Kelola Akun & Hak Akses Pengguna', sa: true, admin: false, piket: false, wali: false },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-medium text-slate-800">{row.module}</td>
                  <td className="py-2.5 px-3 text-center">
                    {row.sa ? (
                      <span className="inline-flex p-1 bg-emerald-100 text-emerald-700 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">&times;</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.admin ? (
                      <span className="inline-flex p-1 bg-emerald-100 text-emerald-700 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">&times;</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.piket ? (
                      <span className="inline-flex p-1 bg-emerald-100 text-emerald-700 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">&times;</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.wali ? (
                      <span className="inline-flex p-1 bg-emerald-100 text-emerald-700 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">&times;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingUserId ? 'Ubah Hak Akses Pengguna' : 'Tambah Pengguna Sistem Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingUserId
                      ? 'Perbarui peran, kata sandi, dan perizinan akses modul'
                      : 'Buat kredensial login baru untuk petugas piket atau guru'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama Lengkap Petugas:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-indigo-500 bg-white"
                />
              </div>

              {/* Username & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Username Login:
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="misal: gurupiket1"
                    required
                    disabled={editingUserId === 'usr-1' || formUsername === 'admin'}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-indigo-500 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {editingUserId ? 'Password Baru (Opsional):' : 'Password Login:'}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUserId ? 'Biarkan kosong jika tetap' : 'Minimal 6 karakter'}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Peran / Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tingkatan Peran (Role):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'superadmin' as UserRole, label: 'Super Admin', desc: 'Akses penuh seluruh modul', icon: Crown },
                    { role: 'admin' as UserRole, label: 'Administrator', desc: 'Operator & Manajemen data', icon: ShieldCheck },
                    { role: 'guru_piket' as UserRole, label: 'Guru Piket', desc: 'Presensi & Laporan harian', icon: ClipboardCheck },
                    { role: 'wali_kelas' as UserRole, label: 'Wali Kelas', desc: 'Rekap kehadiran kelas', icon: GraduationCap },
                  ].map((item) => {
                    const isSelected = formRole === item.role;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleRoleChange(item.role)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-2xs font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-900">
                          <Icon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{item.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email Resmi:
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nama@sman1lumbung.sch.id"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nomor WhatsApp / HP:
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Assigned Class if Wali Kelas */}
              {formRole === 'wali_kelas' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                  <label className="block text-xs font-bold text-purple-950">
                    Kelas yang Dibina:
                  </label>
                  <input
                    type="text"
                    value={formAssignedClass}
                    onChange={(e) => setFormAssignedClass(e.target.value)}
                    placeholder="Contoh: XI-MIPA-1 atau XII RPL 1"
                    className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-lg bg-white"
                  />
                </div>
              )}

              {/* Status Aktif Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Status Akun Pengguna</span>
                  <span className="text-[10.5px] text-slate-500">
                    {formIsActive ? 'Akun aktif dan dapat login' : 'Akun dinonaktifkan (akses diblokir)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    formIsActive ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Custom Permission Checklist Accordion */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kustomisasi Izin Modul Pengguna Ini:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'canViewDashboard' as keyof UserPermission, label: 'Dashboard & Analitik' },
                    { key: 'canManageAttendance' as keyof UserPermission, label: 'Absensi Manual & Piket' },
                    { key: 'canManageStudents' as keyof UserPermission, label: 'Kelola Master Siswa' },
                    { key: 'canManageClasses' as keyof UserPermission, label: 'Kelola Rombel & Kelas' },
                    { key: 'canExportReports' as keyof UserPermission, label: 'Unduh Rekap & Laporan PDF' },
                    { key: 'canGenerateCards' as keyof UserPermission, label: 'Cetak Kartu Pelajar' },
                    { key: 'canManageDatabase' as keyof UserPermission, label: 'Pengaturan Database' },
                    { key: 'canManageSettings' as keyof UserPermission, label: 'Pengaturan Profil Sekolah' },
                    { key: 'canManageUsers' as keyof UserPermission, label: 'Kelola Hak Akses Pengguna' },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer border border-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={formCustomPermissions[perm.key]}
                        onChange={() => handleTogglePermission(perm.key)}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-[11.5px] font-semibold text-slate-800 truncate">
                        {perm.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-102"
                >
                  {editingUserId ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
