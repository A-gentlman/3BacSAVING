'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Ambient background blobs */}
      <div
        className="bg-blob"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          top: -200, left: 0,
        }}
      />
      <div
        className="bg-blob"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
          bottom: -100, right: 200,
        }}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
