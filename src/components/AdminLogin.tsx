import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Lock, User, ArrowLeft, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, setCurrentView } = useAttendance();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginAdmin(username, password);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleFillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      {/* Back to Kiosk button */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentView('kiosk')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Mode Kiosk</span>
        </button>

        <span className="text-xs text-slate-400 font-medium">HadirKu Admin Portal</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Masuk Dashboard Admin</h2>
          <p className="text-xs text-slate-500 mt-1">
            Silakan masukkan username dan password untuk mengelola data siswa, kartu RFID, dan rekap absensi.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username admin"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            Masuk ke Dashboard
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1 font-semibold text-slate-700 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Akun Uji Coba (Tersedia):</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800">Admin:</span>{' '}
                <span className="font-mono text-slate-600">admin</span> /{' '}
                <span className="font-mono text-slate-600">admin123</span>
              </div>
              <button
                type="button"
                onClick={() => handleFillCredentials('admin', 'admin123')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Gunakan Ini
              </button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800">Guru Piket:</span>{' '}
                <span className="font-mono text-slate-600">guru</span> /{' '}
                <span className="font-mono text-slate-600">guru123</span>
              </div>
              <button
                type="button"
                onClick={() => handleFillCredentials('guru', 'guru123')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Gunakan Ini
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
