'use client';

import { useState, useEffect, ReactNode } from 'react';
import { UserPlus, UserCircle2 } from 'lucide-react';
import { AppProvider } from '@/lib/AppContext';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [newProfile, setNewProfile] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedActive = localStorage.getItem('elatrachcabinet_active_user');
    if (storedActive) setActiveUser(storedActive);
    
    const storedProfiles = localStorage.getItem('elatrachcabinet_profiles');
    if (storedProfiles) setProfiles(JSON.parse(storedProfiles));
  }, []);

  const handleLogin = (name: string) => {
    setActiveUser(name);
    localStorage.setItem('elatrachcabinet_active_user', name);
    
    if (!profiles.includes(name)) {
      const updatedProfiles = [...profiles, name];
      setProfiles(updatedProfiles);
      localStorage.setItem('elatrachcabinet_profiles', JSON.stringify(updatedProfiles));
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem('elatrachcabinet_active_user');
  };

  if (!isClient) return null;

  if (!activeUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: 20 }}>
        <div style={{
          width: 400, maxWidth: '100%', padding: '40px', background: 'white',
          borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          border: '1px solid rgba(15,23,42,0.05)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 16px' }}>
              <UserCircle2 size={32} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>Bienvenue</h1>
            <p style={{ fontSize: 14, color: '#475569' }}>Choisissez un profil ou créez-en un nouveau pour commencer.</p>
          </div>

          {profiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ouverture de session</label>
              {profiles.map(p => (
                <button
                  key={p}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '14px', justifyContent: 'flex-start', fontSize: 15 }}
                  onClick={() => handleLogin(p)}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, marginRight: 12 }}>
                    {p.charAt(0).toUpperCase()}
                  </div>
                  {p}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nouveau Profil</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="Votre nom"
                value={newProfile}
                onChange={e => setNewProfile(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newProfile.trim()) handleLogin(newProfile.trim()) }}
                style={{ flex: 1 }}
              />
              <button
                className="btn-primary"
                onClick={() => { if (newProfile.trim()) handleLogin(newProfile.trim()) }}
                style={{ padding: '0 20px' }}
                disabled={!newProfile.trim()}
              >
                <UserPlus size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppProvider key={activeUser} currentUser={activeUser}>
      {children}
    </AppProvider>
  );
}
