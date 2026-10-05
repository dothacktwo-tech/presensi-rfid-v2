import React from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { KioskMode } from './components/KioskMode';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

function AppRouter() {
  const { currentView, isAuthenticated } = useAttendance();

  // Mode 1: KIOSK Mode (Default student attendance terminal)
  if (currentView === 'kiosk') {
    return <KioskMode />;
  }

  // Mode 2: Dashboard Admin (Requires login first)
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}

export default function App() {
  return (
    <AttendanceProvider>
      <AppRouter />
    </AttendanceProvider>
  );
}
