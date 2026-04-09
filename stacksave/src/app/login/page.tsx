'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setIsLoading(false);
  };

  return (
    <div className="auth-bg">
      {/* Animated floating blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-card animate-fade-in-up">
        
        {/* Icon Badge */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            margin: '0 auto 24px',
            boxShadow: '0 12px 24px rgba(99,102,241,0.25), 0 0 0 6px rgba(99,102,241,0.08)',
          }}>
            <LogIn size={28} />
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: '#0f172a',
            letterSpacing: '-0.03em', marginBottom: 8
          }}>
            Bon retour
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>
            Connectez-vous pour accéder à vos finances.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 12,
            color: '#ef4444', fontSize: 13, marginBottom: 20
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, color: '#64748b',
              marginBottom: 6, display: 'block', letterSpacing: '0.02em'
            }}>
              Adresse Email
            </label>
            <div className="auth-input-container">
              <input
                className="auth-input"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Mail className="auth-icon" size={18} />
            </div>
          </div>

          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, color: '#64748b',
              marginBottom: 6, display: 'block', letterSpacing: '0.02em'
            }}>
              Mot de passe
            </label>
            <div className="auth-input-container">
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Lock className="auth-icon" size={18} />
            </div>
          </div>

          <button
            className="auth-button auth-button-login"
            type="submit"
            disabled={loading}
            style={{ fontFamily: 'inherit' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          margin: '28px 0'
        }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #e2e8f0)' }} />
          <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #e2e8f0)' }} />
        </div>

        {/* Google */}
        <button
          onClick={() => signInWithGoogle()}
          className="auth-google-button"
          style={{ fontFamily: 'inherit' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuer avec Google
        </button>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: 32,
          fontSize: 14, color: '#94a3b8', fontWeight: 500
        }}>
          Pas encore de compte ?{' '}
          <Link href="/signup" className="auth-footer-link">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
