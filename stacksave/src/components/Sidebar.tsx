'use client';

import { LayoutDashboard, Target, Receipt, ShoppingBag, Settings, TrendingUp, X, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'saving-slot', label: 'Cagnotte', icon: Wallet, href: '/cagnotte' },
  { id: 'purchases', label: 'Achats', icon: ShoppingBag, href: '/achats' },
  { id: 'bills', label: 'Factures', icon: Receipt, href: '/factures' },
  { id: 'goals', label: 'Objectifs', icon: Target, href: '/objectifs' },
  { id: 'log', label: 'Journal', icon: Calendar, href: '/journal' },
  { id: 'settings', label: 'Paramètres', icon: Settings, href: '/parametres' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { data } = useApp();
  const userName = data.settings?.name || user?.user_metadata?.full_name || user?.email || 'Utilisateur';
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ 
        boxShadow: '10px 0 30px rgba(15, 23, 42, 0.06)',
        borderRight: 'none'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>

          {/* Logo */}
          <div style={{
            padding: '32px 24px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(99,102,241,0.25)',
              }}>
                <TrendingUp size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>CabinetELATRACH</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#4338ca', background: '#eef2ff', border: '1px solid #e0e7ff', padding: '3px 8px', borderRadius: 999, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Pro
                  </span>
                </div>
              </div>
            </Link>
            <button
              className="btn-ghost sidebar-close-btn"
              onClick={onClose}
              style={{ padding: '6px', borderRadius: 10, border: 'none', background: '#f8fafc' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav style={{ padding: '12px 12px', flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px 12px' }}>
              Menu principal
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    marginBottom: 4,
                    transition: 'all var(--transition-ui)',
                    background: isActive
                      ? 'var(--accent-indigo-pastel)'
                      : 'transparent',
                    color: isActive ? 'var(--accent-indigo-text)' : 'var(--text-secondary)',
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 20, borderRadius: '0 4px 4px 0',
                      background: 'var(--accent-indigo)',
                    }} />
                  )}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom user card */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px',
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              marginBottom: 12
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'white',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userName}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>Plan Premium</div>
              </div>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="btn-ghost"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: '#ef4444',
                background: '#fef2f2',
                border: '1px solid #fee2e2'
              }}
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

    </>
  );
}
