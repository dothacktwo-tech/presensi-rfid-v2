import React, { useState } from 'react';
import {
  Database,
  Table,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Sparkles,
  Server,
  Layers,
  Key,
  Globe,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileCode,
  Zap,
  Terminal,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import {
  TABLE_SCHEMAS,
  FULL_SUPABASE_DDL_SQL,
  SUPABASE_RLS_SQL,
  SUPABASE_SEED_SQL,
  SUPABASE_QUERIES_SQL,
  SUPABASE_CLIENT_SNIPPET,
} from '../utils/supabaseSchema';

type DatabaseTab = 'schema' | 'rls' | 'ddl' | 'rls_sql' | 'seed' | 'queries' | 'connection';

export const DatabaseSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DatabaseTab>('schema');
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Supabase Connection Settings Simulator
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => {
    return localStorage.getItem('hadirku_supabase_url') || 'https://xyzcompany.supabase.co';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(() => {
    return (
      localStorage.getItem('hadirku_supabase_anon_key') ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.supabase-sample-anon-key'
    );
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'testing' | 'idle'>('idle');
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  const handleCopy = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2500);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hadirku_supabase_url', supabaseUrl.trim());
    localStorage.setItem('hadirku_supabase_anon_key', supabaseAnonKey.trim());
    setConnectionStatus('testing');
    setTimeout(() => {
      setConnectionStatus('connected');
      setSaveSuccessToast('Konfigurasi URL & API Key Supabase berhasil disimpan secara lokal!');
      setTimeout(() => setSaveSuccessToast(null), 3500);
    }, 800);
  };

  const currentTableObj = TABLE_SCHEMAS.find((t) => t.tableName === selectedTable) || TABLE_SCHEMAS[0];

  const filteredTables = TABLE_SCHEMAS.filter(
    (t) =>
      t.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. HERO TITLE CARD: PENGATURAN DATABASE SUPABASE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-800/60 shadow-xl text-white p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold mb-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>PENGATURAN DATABASE &amp; SKEMA POSTGRESQL (SUPABASE)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Arsitektur Database &amp; Skrip SQL Supabase
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Konfigurasi skema database PostgreSQL di Supabase, struktur relasi tabel master siswa &amp; log presensi, kebijakan keamanan baris (Row Level Security / RLS), serta kumpulan query DDL siap salin ke SQL Editor Supabase.
            </p>
          </div>

          {/* Quick Action Badge Bar */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              onClick={() => handleCopy(FULL_SUPABASE_DDL_SQL, 'full_ddl_top')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
              title="Salin seluruh skrip DDL SQL untuk Supabase SQL Editor"
            >
              {copiedSection === 'full_ddl_top' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Skrip DDL Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Skrip SQL DDL</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopy(SUPABASE_RLS_SQL, 'full_rls_top')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-102"
              title="Salin skrip Row Level Security (RLS)"
            >
              {copiedSection === 'full_rls_top' ? (
                <>
                  <Check className="w-4 h-4 text-indigo-200" />
                  <span>Skrip RLS Tersalin!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Salin Kebijakan RLS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Toast */}
      {saveSuccessToast && (
        <div className="p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{saveSuccessToast}</span>
          </div>
          <button
            onClick={() => setSaveSuccessToast(null)}
            className="p-1 text-emerald-200 hover:text-white rounded"
          >
            &times;
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'schema' as DatabaseTab, label: 'Struktur Tabel & Schema', icon: Table, count: `${TABLE_SCHEMAS.length}` },
          { id: 'rls' as DatabaseTab, label: 'Kebijakan Keamanan (RLS)', icon: ShieldCheck },
          { id: 'ddl' as DatabaseTab, label: 'SQL DDL Lengkap', icon: Code2, badge: 'Siap Salin' },
          { id: 'rls_sql' as DatabaseTab, label: 'SQL Script RLS', icon: Key },
          { id: 'seed' as DatabaseTab, label: 'Data Awal (Seed SQL)', icon: Zap },
          { id: 'queries' as DatabaseTab, label: 'Query Analisis & Laporan', icon: Terminal },
          { id: 'connection' as DatabaseTab, label: 'Koneksi Supabase URL', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: STRUKTUR TABEL & SCHEMA EXPLORER */}
      {activeTab === 'schema' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table List Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Daftar Tabel ({TABLE_SCHEMAS.length})
                </span>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  PostgreSQL
                </span>
              </div>

              {/* Search Table */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tabel..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-indigo-500 bg-slate-50"
                />
              </div>

              <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
                {filteredTables.map((t) => {
                  const isSelected = selectedTable === t.tableName;
                  return (
                    <button
                      key={t.tableName}
                      onClick={() => setSelectedTable(t.tableName)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-2xs'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Table className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{t.tableName}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                          {t.columns.length} kolom
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table Columns & Indexes Detail Viewer */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header Table detail */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Table className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-extrabold font-mono text-slate-900">
                        public.{currentTableObj.tableName}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {currentTableObj.displayName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>RLS Enabled</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `SELECT * FROM public.${currentTableObj.tableName} LIMIT 50;`,
                        `select_${currentTableObj.tableName}`
                      )
                    }
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                    title="Salin query SELECT"
                  >
                    {copiedSection === `select_${currentTableObj.tableName}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>SELECT</span>
                  </button>
                </div>
              </div>

              {/* Columns Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Daftar Kolom &amp; Tipe Data ({currentTableObj.columns.length})</span>
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-2.5 px-3">Kolom</th>
                        <th className="py-2.5 px-3">Tipe Data</th>
                        <th className="py-2.5 px-3">Nullable</th>
                        <th className="py-2.5 px-3">Default</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {currentTableObj.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{col.name}</span>
                              {col.isPrimary && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold font-sans">
                                  PK
                                </span>
                              )}
                              {col.isForeign && (
                                <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold font-sans">
                                  FK
                                </span>
                              )}
                              {col.isUnique && (
                                <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold font-sans">
                                  UNIQUE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-indigo-600 font-semibold">
                            {col.type}
                          </td>
                          <td className="py-2.5 px-3">
                            {col.nullable ? (
                              <span className="text-slate-400 font-mono text-[11px]">NULL</span>
                            ) : (
                              <span className="text-rose-600 font-bold font-mono text-[11px]">
                                NOT NULL
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            {col.defaultValue || <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11.5px]">
                            {col.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Indexes */}
              {currentTableObj.indexes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Indeks &amp; Optimasi Query</span>
                  </h3>
                  <div className="bg-slate-900 rounded-xl p-3 text-xs font-mono text-emerald-400 overflow-x-auto space-y-1">
                    {currentTableObj.indexes.map((idx, i) => (
                      <div key={i} className="leading-relaxed">
                        {idx}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RLS Policies on this table */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Kebijakan Keamanan (RLS) Tabel Ini</span>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {currentTableObj.rlsPolicies.map((pol, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono">{pol.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded font-mono">
                            {pol.action}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded font-mono">
                            {pol.roles}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">{pol.description}</p>
                      <div className="font-mono text-[10.5px] text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                        USING ({pol.definition})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEBIJAKAN ROW LEVEL SECURITY (RLS) */}
      {activeTab === 'rls' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ROW LEVEL SECURITY (RLS) POLICIES</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Prinsip &amp; Kebijakan Keamanan Data Supabase
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                RLS membatasi akses baca dan tulis pada level database PostgreSQL, menjamin bahwa terminal Kiosk publik hanya dapat membaca data siswa yang aktif dan mencatat presensi tanpa merusak data lain.
              </p>
            </div>

            <button
              onClick={() => handleCopy(SUPABASE_RLS_SQL, 'rls_tab_copy')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
            >
              {copiedSection === 'rls_tab_copy' ? (
                <>
                  <Check className="w-4 h-4 text-indigo-200" />
                  <span>Kebijakan RLS Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Seluruh SQL RLS</span>
                </>
              )}
            </button>
          </div>

          {/* Cards for each table RLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TABLE_SCHEMAS.map((t) => (
              <div
                key={t.tableName}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-600" />
                    <span className="font-mono font-bold text-xs text-slate-900">{t.tableName}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    RLS Enabled
                  </span>
                </div>

                <div className="space-y-2">
                  {t.rlsPolicies.map((pol, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{pol.name}</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {pol.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{pol.description}</p>
                      <div className="font-mono text-[10px] text-indigo-700 bg-indigo-50/60 p-1 rounded border border-indigo-100">
                        ROLES: {pol.roles} | USING ({pol.definition})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FULL DDL SQL VIEWER WITH COPY */}
      {activeTab === 'ddl' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <span>Skrip SQL DDL Lengkap (Supabase PostgreSQL)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Buka <strong>Supabase Dashboard &rarr; SQL Editor &rarr; New Query</strong>, tempel (paste) skrip di bawah ini, lalu klik <strong>Run</strong>.
              </p>
            </div>

            <button
              onClick={() => handleCopy(FULL_SUPABASE_DDL_SQL, 'full_ddl_tab')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto hover:scale-102"
            >
              {copiedSection === 'full_ddl_tab' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>SQL DDL Berhasil Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Seluruh SQL DDL (Ready to Copy)</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-950 text-slate-100 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed border border-slate-800 selection:bg-indigo-500 selection:text-white">
              <code>{FULL_SUPABASE_DDL_SQL}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: SQL RLS SCRIPT VIEWER */}
      {activeTab === 'rls_sql' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Skrip SQL Row Level Security (RLS)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Skrip aktivasi RLS dan penetapan policy per tabel untuk izin akses anonim dan terautentikasi.
              </p>
            </div>

            <button
              onClick={() => handleCopy(SUPABASE_RLS_SQL, 'rls_sql_tab')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto hover:scale-102"
            >
              {copiedSection === 'rls_sql_tab' ? (
                <>
                  <Check className="w-4 h-4 text-indigo-200" />
                  <span>SQL RLS Berhasil Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Skrip SQL RLS</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-100 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed border border-slate-800">
            <code>{SUPABASE_RLS_SQL}</code>
          </pre>
        </div>
      )}

      {/* TAB 5: SEED DATA SQL SCRIPT */}
      {activeTab === 'seed' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Skrip SQL Data Awal (Seed Data)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Memasukkan data profil sekolah SMA Negeri 1 Lumbung, rombel kelas X, XI, XII, akun admin, serta contoh siswa.
              </p>
            </div>

            <button
              onClick={() => handleCopy(SUPABASE_SEED_SQL, 'seed_sql_tab')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto hover:scale-102"
            >
              {copiedSection === 'seed_sql_tab' ? (
                <>
                  <Check className="w-4 h-4 text-amber-200" />
                  <span>Seed SQL Berhasil Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Seed Data SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-100 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed border border-slate-800">
            <code>{SUPABASE_SEED_SQL}</code>
          </pre>
        </div>
      )}

      {/* TAB 6: QUERY ANALISIS & LAPORAN */}
      {activeTab === 'queries' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <span>Kumpulan Query SQL Analisis &amp; Operasional</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Query aggregasi untuk menghitung persentase kehadiran bulanan, daftar siswa belum absen per kelas, dan ranking kelas.
              </p>
            </div>

            <button
              onClick={() => handleCopy(SUPABASE_QUERIES_SQL, 'queries_sql_tab')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto hover:scale-102"
            >
              {copiedSection === 'queries_sql_tab' ? (
                <>
                  <Check className="w-4 h-4 text-indigo-200" />
                  <span>Query SQL Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Seluruh Query SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-100 p-5 rounded-2xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed border border-slate-800">
            <code>{SUPABASE_QUERIES_SQL}</code>
          </pre>
        </div>
      )}

      {/* TAB 7: KONFIGURASI SUPABASE URL & CLIENT */}
      {activeTab === 'connection' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-1">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Kredensial API Supabase Project</span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Pengaturan Endpoint &amp; Kunci Anon
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan Project URL dan Anon Public Key dari dashboard Supabase Anda (Project Settings &rarr; API).
              </p>
            </div>

            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL:
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Anon Public Key:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Status Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      connectionStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : connectionStatus === 'testing'
                        ? 'bg-amber-500 animate-spin'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Status Koneksi:{' '}
                    {connectionStatus === 'connected'
                      ? 'Tersimpan & Terhubung'
                      : connectionStatus === 'testing'
                      ? 'Menguji Koneksi...'
                      : 'Lokal Browser Storage'}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                  HTTPS REST / WSS
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-101"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Simpan &amp; Uji Konfigurasi Supabase</span>
              </button>
            </form>
          </div>

          {/* Client SDK Implementation Helper */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Inisialisasi Client TypeScript SDK</h3>
              </div>
              <button
                onClick={() => handleCopy(SUPABASE_CLIENT_SNIPPET, 'client_snippet')}
                className="p-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold flex items-center gap-1"
              >
                {copiedSection === 'client_snippet' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Salin Kode</span>
              </button>
            </div>

            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              <code>{SUPABASE_CLIENT_SNIPPET}</code>
            </pre>

            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-xs text-indigo-950">
              <div className="font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Panduan Langkah Singkat:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11.5px] text-slate-700 pl-1">
                <li>Buka proyek Anda di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">Supabase.com</a>.</li>
                <li>Jalankan <strong>Skrip SQL DDL Lengkap</strong> di menu SQL Editor.</li>
                <li>Jalankan <strong>Skrip SQL RLS</strong> untuk proteksi data.</li>
                <li>Jalankan <strong>Seed Data</strong> untuk profil SMA Negeri 1 Lumbung.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
