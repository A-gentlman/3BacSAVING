'use client';

import { Bell, Plus, Menu } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import QuickAddModal from './QuickAddModal';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Tableau de bord', subtitle: 'Votre aperçu financier' },
  '/cagnotte': { title: 'Ma Cagnotte', subtitle: 'Gérez vos économies et transferts' },
  '/objectifs': { title: 'Objectifs d\'épargne', subtitle: 'Suivez vos étapes' },
  '/factures': { title: 'Factures & Paiements', subtitle: 'Gérez vos dépenses' },
  '/achats': { title: 'Achats', subtitle: 'Surveillez vos dépenses' },
  '/journal': { title: 'Journal Mensuel', subtitle: 'Historique de votre régularité' },
  '/parametres': { title: 'Paramètres', subtitle: 'Personnalisez votre expérience' },
};

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { data } = useApp();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const pathname = usePathname();
  
  const { title, subtitle } = pageTitles[pathname] || pageTitles['/dashboard'];

  const unpaidBills = data.bills.filter(b => !b.paid).length;

  return (
    <>
      <header style={{
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid #f1f5f9',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        {/* Left: Menu + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="sidebar-open-btn"
            onClick={onMenuClick}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-ui)',
            }}
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              {title}
            </h1>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginTop: 4 }}>{subtitle}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Quick Add Button */}
          <button
            onClick={() => setShowQuickAdd(true)}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: 14, boxShadow: '0 8px 18px rgba(99,102,241,0.22)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span style={{ fontWeight: 700 }}>Ajout rapide</span>
          </button>

          {/* Notifications */}
          <button
            style={{
              position: 'relative',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 999,
              padding: '10px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-ui)',
            }}
          >
            <Bell size={18} />
            {unpaidBills > 0 && (
              <span style={{
                position: 'absolute',
                top: 7, right: 7,
                width: 9, height: 9,
                background: '#fb7185',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                boxShadow: '0 0 0 3px rgba(251, 113, 133, 0.12)',
              }} />
            )}
          </button>

          <div style={{ width: 1, height: 24, background: '#f1f5f9', margin: '0 4px' }} />

          {/* Avatar */}
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: 'white',
            cursor: 'pointer',
            boxShadow: '0 0 0 3px rgba(238,242,255,0.95), 0 8px 18px rgba(99,102,241,0.2)',
            flexShrink: 0,
            transition: 'transform var(--transition-ui)',
          }}
          >
            A
          </div>
        </div>
      </header>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </>
  );
}
