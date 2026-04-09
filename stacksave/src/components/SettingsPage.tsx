'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, LogOut, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useApp } from '@/lib/AppContext';

const SectionCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="card animate-fade-in-up" style={{ padding: '28px', marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: 'var(--accent-indigo-pastel)', border: '1px solid #c7d2fe',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{title}</div>
    </div>
    {children}
  </div>
);

function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card animate-fade-in-up" style={{ 
        maxWidth: 400, width: '90%', padding: '32px', textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        border: '1px solid #fee2e2'
      }}>
        <div style={{ 
          width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 20px', color: '#ef4444' 
        }}>
          <AlertTriangle size={32} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 32 }}>{message}</p>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, padding: '12px' }}
          >
            Annuler
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="btn-primary"
            style={{ flex: 1, padding: '12px', background: '#ef4444', borderColor: '#ef4444' }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

interface SettingsPageProps {
  onLogout?: () => void;
}

export default function SettingsPage({ onLogout }: SettingsPageProps) {
  const { data, updateSettings, currency, exportData, importData, resetData } = useApp();
  const { signOut, user } = useAuth();
  const [name, setName] = useState(data.settings?.name || '');
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync state with data
  useEffect(() => {
    if (data.settings?.name) setName(data.settings.name);
  }, [data.settings?.name]);

  const handleSave = async () => {
    await updateSettings({ name: name.trim() || 'Utilisateur' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 840, margin: '0 auto' }}>
      
      {/* Profile Section */}
      <SectionCard title="Mon Profil" icon={<User size={18} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white',
              boxShadow: '0 8px 16px rgba(99,102,241,0.25)',
              flexShrink: 0,
            }}>
              {name[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>{name || 'Utilisateur'}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#64748b', marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div>
              <label className="label">Nom complet</label>
              <input 
                className="input" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Votre nom"
                style={{ background: '#f8fafc' }}
              />
            </div>
            <div>
              <label className="label">Devise de l&apos;application</label>
              <select 
                className="input" 
                value={currency} 
                onChange={e => updateSettings({ currency: e.target.value as 'MAD' | 'Riyal' })}
                style={{ background: '#f8fafc' }}
              >
                <option value="MAD">MAD — Dirham Marocain</option>
                <option value="Riyal">Riyal — Riyal de poche</option>
              </select>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Preferences Section */}
      <SectionCard title="Préférences" icon={<Bell size={18} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderRadius: 16,
            background: '#f8fafc', border: '1px solid #e2e8f0',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Notifications par email</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Recevoir des alertes pour vos objectifs et factures</div>
            </div>
            <button
              onClick={() => updateSettings({ notifications: !data.settings?.notifications })}
              style={{
                width: 52, height: 28, borderRadius: 99, cursor: 'pointer', border: 'none',
                background: data.settings?.notifications ? 'var(--accent-indigo)' : '#e2e8f0',
                position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 4, borderRadius: '50%',
                width: 20, height: 20, background: 'white',
                left: data.settings?.notifications ? 28 : 4,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }} />
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Security & Data Section */}
      <SectionCard title="Données & Sécurité" icon={<Shield size={18} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
            Gérez vos données locales et votre synchronisation avec le cloud StackSave.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {/* Export */}
            <button 
              onClick={() => exportData()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0',
                background: '#fff', color: '#0f172a', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <Download size={16} /> Exporter mes données
            </button>

            {/* Import */}
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                accept=".json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const text = await file.text();
                    const res = await importData(text);
                    if (!res.success) alert(res.error);
                  }
                }}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
              <button 
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#0f172a', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', width: '100%', pointerEvents: 'none'
                }}
              >
                <Upload size={16} /> Importer des données
              </button>
            </div>
          </div>

          <div style={{ 
            marginTop: 8, padding: '20px', borderRadius: 16, background: '#fff1f2', border: '1px solid #ffe4e6' 
          }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ color: '#e11d48', marginTop: 2 }}>
                <AlertTriangle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#9f1239' }}>Zone de danger</div>
                <div style={{ fontSize: 13, color: '#be123c', marginTop: 4, lineHeight: 1.5 }}>
                  Réinitialiser vos données supprimera définitivement tous vos objectifs, factures et historiques de votre compte cloud.
                </div>
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  style={{
                    marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: '#e11d48', color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#be123c'}
                  onMouseLeave={e => e.currentTarget.style.background = '#e11d48'}
                >
                  <Trash2 size={14} /> Réinitialiser tout le compte
                </button>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: '#f1f5f9' }} />

          <button 
            onClick={() => onLogout ? onLogout() : signOut()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', width: 'fit-content', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            <LogOut size={16} /> Me déconnecter
          </button>
        </div>
      </SectionCard>

      {/* Save Button */}
      <div style={{ 
        display: 'flex', justifyContent: 'flex-end', 
        marginTop: 16, padding: '24px', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0' 
      }}>
        <button
          className="btn-primary"
          onClick={handleSave}
          style={{
            minWidth: 200,
            background: saved ? '#10b981' : undefined,
            boxShadow: saved ? '0 4px 12px rgba(16,185,129,0.3)' : undefined,
          }}
        >
          {saved ? '✓ Paramètres enregistrés' : 'Enregistrer les modifications'}
        </button>
      </div>

      <ConfirmDialog 
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetData}
        title="Réinitialiser le compte ?"
        message="Êtes-vous absolument sûr ? Cette action supprimera définitivement tous vos objectifs, factures et historiques. C'est irréversible."
      />
    </div>
  );
}
