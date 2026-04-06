'use client';

import SettingsPage from '@/components/SettingsPage';

export default function Page() {
  const handleLogout = () => {
    localStorage.removeItem('elatrachcabinet_active_user');
    window.location.href = '/';
  };

  return <SettingsPage onLogout={handleLogout} />;
}
