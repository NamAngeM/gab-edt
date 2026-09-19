"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const payload = await res.json();
        localStorage.setItem('jwt_token', payload.data.token);
        if (payload.data.user) {
          localStorage.setItem('user_data', JSON.stringify(payload.data.user));
        }
        router.push('/admin');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch {
      setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 40%, #004ac6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>
        {/* Logo/Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
            borderRadius: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: -1 }}>G</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 6px 0', letterSpacing: -0.5 }}>
            GAB-EDT
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            Planning Supérieur • Système Institutionnel
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.96)',
          borderRadius: 20,
          padding: 36,
          boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
              Connexion
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Accédez à votre espace administrateur
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{
                padding: '12px 14px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: 14,
                color: '#991B1B',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>error</span>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 18, color: '#94A3B8', pointerEvents: 'none',
                }}>
                  email
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="admin@etablissement.ga"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px 0 40px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    color: '#0F172A',
                    background: '#F8FAFC',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.background = '#F8FAFC';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                  Mot de passe
                </label>
                <button type="button" style={{ fontSize: 12, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Mot de passe oublié ?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 18, color: '#94A3B8', pointerEvents: 'none',
                }}>
                  lock
                </span>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 44px 0 40px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    color: '#0F172A',
                    background: '#F8FAFC',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.background = '#F8FAFC';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {showPwd ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-login"
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: loading ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>
                    progress_activity
                  </span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                  Se connecter
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          GAB-EDT • Plateforme de gestion d'emploi du temps universitaire
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
