import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Student, AttendanceRecord, SchoolSettings } from '../types/attendance';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react';
import { getDateOffset, getTodayDateString } from '../data/mockData';

interface DashboardChartsProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  settings: SchoolSettings;
}

const COLORS = {
  hadir: '#10b981', // emerald-500
  terlambat: '#f59e0b', // amber-500
  izinSakit: '#38bdf8', // sky-400
  alpha: '#f43f5e', // rose-500
  belumAbsen: '#cbd5e1', // slate-300
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  students,
  attendanceRecords,
  settings,
}) => {
  const [chartViewDate, setChartViewDate] = useState<string>(getTodayDateString());
  const [activeChartTab, setActiveChartTab] = useState<'class' | 'trend'>('class');

  // Filter attendance for the selected date
  const recordsOnDate = useMemo(() => {
    return attendanceRecords.filter((r) => r.date === chartViewDate);
  }, [attendanceRecords, chartViewDate]);

  // Unique classes
  const classesList = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.class || 'Tanpa Kelas'))).sort();
    return list;
  }, [students]);

  // 1. Data for Bar Chart: Status vs Class
  const classStatusData = useMemo(() => {
    const studentMap = new Map<string, Student>();
    students.forEach((s) => studentMap.set(s.id, s));

    return classesList.map((cls) => {
      const studentsInClass = students.filter((s) => s.class === cls);
      const totalInClass = studentsInClass.length;

      let hadir = 0;
      let terlambat = 0;
      let izin = 0;
      let sakit = 0;
      let alpha = 0;

      studentsInClass.forEach((st) => {
        const record = recordsOnDate.find((r) => r.studentId === st.id);
        if (record) {
          if (record.status === 'Hadir') hadir++;
          else if (record.status === 'Terlambat') terlambat++;
          else if (record.status === 'Izin') izin++;
          else if (record.status === 'Sakit') sakit++;
          else if (record.status === 'Alpha') alpha++;
        }
      });

      const totalRecorded = hadir + terlambat + izin + sakit + alpha;
      const belumAbsen = Math.max(0, totalInClass - totalRecorded);

      return {
        class: cls,
        Hadir: hadir,
        Terlambat: terlambat,
        'Izin & Sakit': izin + sakit,
        Alpha: alpha,
        'Belum Absen': belumAbsen,
        total: totalInClass,
        kehadiranRate: totalInClass > 0 ? Math.round(((hadir + terlambat) / totalInClass) * 100) : 0,
      };
    });
  }, [classesList, students, recordsOnDate]);

  // 2. Data for Donut / Pie Chart: Overall Status Ratio
  const pieData = useMemo(() => {
    let hadir = 0;
    let terlambat = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;

    recordsOnDate.forEach((r) => {
      if (r.status === 'Hadir') hadir++;
      else if (r.status === 'Terlambat') terlambat++;
      else if (r.status === 'Izin') izin++;
      else if (r.status === 'Sakit') sakit++;
      else if (r.status === 'Alpha') alpha++;
    });

    const recorded = hadir + terlambat + izin + sakit + alpha;
    const belumAbsen = Math.max(0, students.length - recorded);

    return [
      { name: 'Hadir Tepat Waktu', value: hadir, color: COLORS.hadir },
      { name: 'Terlambat', value: terlambat, color: COLORS.terlambat },
      { name: 'Izin & Sakit', value: izin + sakit, color: COLORS.izinSakit },
      { name: 'Alpha', value: alpha, color: COLORS.alpha },
      { name: 'Belum Presensi', value: belumAbsen, color: COLORS.belumAbsen },
    ].filter((item) => item.value > 0 || students.length === 0);
  }, [recordsOnDate, students]);

  // 3. Data for 7-Day Trend
  const trendData = useMemo(() => {
    const days = [6, 5, 4, 3, 2, 1, 0];
    return days.map((offset) => {
      const dateStr = getDateOffset(offset);
      const dayRecords = attendanceRecords.filter((r) => r.date === dateStr);

      const hadir = dayRecords.filter((r) => r.status === 'Hadir').length;
      const terlambat = dayRecords.filter((r) => r.status === 'Terlambat').length;
      const izinSakit = dayRecords.filter((r) => r.status === 'Izin' || r.status === 'Sakit').length;
      const alpha = dayRecords.filter((r) => r.status === 'Alpha').length;

      const dateObj = new Date(dateStr);
      const label = offset === 0 ? 'Hari Ini' : dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });

      return {
        date: dateStr,
        label,
        Hadir: hadir,
        Terlambat: terlambat,
        'Izin/Sakit': izinSakit,
        Alpha: alpha,
        Total: hadir + terlambat + izinSakit + alpha,
      };
    });
  }, [attendanceRecords]);

  // Total percentages
  const totalStudents = students.length;
  const totalPresentToday = recordsOnDate.filter((r) => r.status === 'Hadir' || r.status === 'Terlambat').length;
  const overallRate = totalStudents > 0 ? Math.round((totalPresentToday / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card for Visualizations */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Analisis Visualisasi Data Presensi (Recharts)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Grafik Status Kehadiran Real-Time Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi perbandingan kehadiran per kelas (Rombel), proporsi status harian, dan tren 7 hari terakhir.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Date Switcher for Charts */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-600">Tanggal:</span>
              <input
                type="date"
                value={chartViewDate}
                onChange={(e) => setChartViewDate(e.target.value)}
                className="bg-transparent border-none text-xs font-mono font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveChartTab('class')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  activeChartTab === 'class'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Per Kelas</span>
              </button>
              <button
                onClick={() => setActiveChartTab('trend')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  activeChartTab === 'trend'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tren 7 Hari</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Bar Chart + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Bar Chart or Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {activeChartTab === 'class' ? <BarChart3 className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {activeChartTab === 'class'
                    ? 'Sebaran Status Kehadiran Per Rombel'
                    : 'Tren Tingkat Kehadiran 7 Hari Terakhir'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {activeChartTab === 'class'
                    ? `Perbandingan status per kelas untuk tanggal ${chartViewDate}`
                    : 'Dinamika siswa hadir tepat waktu vs terlambat'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Rata-rata Kehadiran</span>
              <div className="text-base font-bold font-mono text-emerald-600">
                {overallRate}%
              </div>
            </div>
          </div>

          {/* Recharts Render Canvas */}
          <div className="w-full h-72 sm:h-80">
            {activeChartTab === 'class' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classStatusData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="class"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="Hadir" fill={COLORS.hadir} radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="Terlambat" fill={COLORS.terlambat} radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="Izin & Sakit" fill={COLORS.izinSakit} radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="Alpha" fill={COLORS.alpha} radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="Belum Absen" fill={COLORS.belumAbsen} radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.hadir} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={COLORS.hadir} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.terlambat} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={COLORS.terlambat} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Hadir"
                    stroke={COLORS.hadir}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHadir)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Terlambat"
                    stroke={COLORS.terlambat}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Pie / Donut Chart Status Share (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Proporsi Kehadiran</h4>
                  <p className="text-[11px] text-slate-400">Total {totalStudents} Siswa Terdaftar</p>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="w-full h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center percentage label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold font-mono text-slate-900 leading-none">
                  {overallRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                  Kehadiran
                </span>
              </div>
            </div>

            {/* Status Legend Breakdown List */}
            <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 text-[11px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-slate-900 text-[11px]">{item.value}</span>
                    <span className="text-slate-400 text-[10px] w-8 text-right">
                      {totalStudents > 0 ? Math.round((item.value / totalStudents) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Batas Masuk: <strong>{settings.checkInEndTime}</strong></span>
            </span>
            <span>Jam Pulang: <strong>{settings.checkOutStartTime}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
