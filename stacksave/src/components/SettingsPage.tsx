'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { User, Bell, Shield, Trash2, Download } from 'lucide-react';

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

export default function SettingsPage({ onLogout }: { onLogout?: () => void }) {
  const { data, resetData, importData, updateSettings, currency } = useApp();
  const [name, setName] = useState(data.settings?.name || 'Utilisateur');
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Sync name if data changes (e.g. after reset)
  useEffect(() => {
    setName(data.settings?.name || 'Utilisateur');
  }, [data.settings?.name]);

  const handleSave = () => {
    updateSettings({ name: name.trim() || 'Utilisateur' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cabinetelatrach-export.json';
    a.click();
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        
        // Basic validation: check for necessary keys
        if (!imported.goals || !imported.bills || !imported.purchases) {
          throw new Error('Format de fichier invalide');
        }

        importData(imported);
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err) {
        setImportError('Erreur lors de l’importation du fichier. Vérifiez le format.');
        setTimeout(() => setImportError(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
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
              {name[0] || 'A'}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>{name}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#64748b', marginTop: 2 }}>Membre Premium · CabinetELATRACH Pro</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div>
              <label className="label">Nom complet</label>
              <input 
                className="input" 
                value={name} 
                onChange={e => setName(e.target.value)}
                style={{ background: '#f8fafc' }}
              />
            </div>
            <div>
              <label className="label">Devise de l&apos;application</label>
              <select 
                className="input" 
                value={currency} 
                onChange={e => updateSettings({ currency: e.target.value as 'MAD' | 'Riyal' })}
                style={{ background: '#f8fafc', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,...")' }}
              >
                <option value="MAD">MAD — Dirham Marocain</option>
                <option value="Riyal">Riyal — Riyal de poche</option>
              </select>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Notifications Section */}
      <SectionCard title="Préférences" icon={<Bell size={18} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderRadius: 16,
            background: '#f8fafc', border: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Rappels de factures</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Recevoir des alertes avant les échéances</div>
            </div>
            <button
              onClick={() => updateSettings({ notifications: !(data.settings?.notifications ?? true) })}
              style={{
                width: 52, height: 28, borderRadius: 99, cursor: 'pointer', border: 'none',
                background: (data.settings?.notifications ?? true) ? 'var(--accent-indigo)' : '#e2e8f0',
                position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0,
                outline: 'none',
              }}
            >
              <div style={{
                position: 'absolute', top: 4, borderRadius: '50%',
                width: 20, height: 20, background: 'white',
                left: (data.settings?.notifications ?? true) ? 28 : 4,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }} />
            </button>
          </div>

          <div>
            <label className="label">Anticipation des rappels</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[1, 2, 3, 5, 7].map(d => {
                const isActive = (data.settings?.reminderDays ?? 3) === d;
                return (
                  <button
                    key={d}
                    onClick={() => updateSettings({ reminderDays: d })}
                    style={{
                      padding: '10px 20px', borderRadius: 12, border: '1px solid',
                      borderColor: isActive ? 'var(--accent-indigo)' : 'var(--border)',
                      cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                      fontWeight: isActive ? 700 : 500,
                      background: isActive ? 'var(--accent-indigo-pastel)' : '#fff',
                      color: isActive ? 'var(--accent-indigo-text)' : '#64748b',
                      transition: 'all 0.2s',
                    }}
                  >
                    {d} jours avant
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Advanced Section */}
      <SectionCard title="Données & Sécurité" icon={<Shield size={18} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            padding: '20px', borderRadius: 16,
            background: 'var(--accent-indigo-pastel)', border: '1px solid #c7d2fe',
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-indigo)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Download size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-indigo-text)' }}>Sauvegarde locale</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#6366f1', marginTop: 2 }}>Exportez vos données pour les conserver en sécurité.</div>
            </div>
            <button
              className="btn-primary"
              onClick={handleExport}
              style={{ padding: '10px 16px', fontSize: 13 }}
            >
              Exporter JSON
            </button>
          </div>

          <div style={{
            padding: '20px', borderRadius: 16,
            background: 'var(--accent-indigo-pastel)', border: '1px solid #c7d2fe',
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-indigo)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Download size={22} style={{ transform: 'rotate(180deg)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-indigo-text)' }}>Restauration de données</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#6366f1', marginTop: 2 }}>Restaurez votre progression depuis un fichier JSON.</div>
            </div>
            
            <input 
              type="file" 
              id="import-json" 
              accept=".json" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {importError && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>{importError}</span>
              )}
              {importSuccess && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Importé !</span>
              )}
              
              <button
                className="btn-primary"
                onClick={() => document.getElementById('import-json')?.click()}
                style={{ padding: '10px 16px', fontSize: 13 }}
              >
                Importer JSON
              </button>
            </div>
          </div>

          <div style={{
            padding: '20px', borderRadius: 16, border: '2px dashed #fecaca',
            background: '#fff5f5', display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trash2 size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Zone de danger</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#ef4444', marginTop: 2 }}>Effacez définitivement toutes vos données locales.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {showResetConfirm ? (
                <>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="btn-secondary"
                    style={{ padding: '10px 16px', fontSize: 13 }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '10px 16px', borderRadius: 10, border: 'none',
                      background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
                    }}
                  >
                    Confirmer la suppression
                  </button>
                </>
              ) : resetSuccess ? (
                <div style={{ 
                  padding: '10px 16px', borderRadius: 10, 
                  background: '#f0fdf4', color: '#16a34a', 
                  fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  Données réinitialisées !
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  style={{
                    padding: '10px 16px', borderRadius: 10, border: 'none',
                    background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Action Bar */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginTop: 16, padding: '24px', background: '#fff', borderRadius: 20, border: '1px solid var(--border)' 
      }}>
        {onLogout ? (
          <button
            onClick={onLogout}
            style={{ 
              background: 'none', border: 'none', color: '#64748b', 
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: '4px'
            }}
          >
            Se déconnecter
          </button>
        ) : <div />}
        
        <button
          className="btn-primary"
          onClick={handleSave}
          style={{
            minWidth: 160,
            background: saved ? '#10b981' : undefined,
            boxShadow: saved ? '0 4px 12px rgba(16,185,129,0.3)' : undefined,
          }}
        >
          {saved ? '✓ Paramètres enregistrés' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
