"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can fetch from API, but for now let's mock or try real fetch
    const fetchInstitutions = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch('http://localhost:8080/api/v1/institutions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
        } else {
          // If unauthorized or fails, use fallback mock data for the presentation
          throw new Error("Failed to fetch");
        }
      } catch (err) {
        setInstitutions([
          { id: 1, name: 'Université Omar Bongo', code: 'UOB', type: 'UNIVERSITY', city: 'Libreville' },
          { id: 2, name: 'Lycée National Léon Mba', code: 'LNLM', type: 'LYCEE', city: 'Libreville' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstitutions();
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* HEADER */}
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
          Super Administrateur
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gérez vos clients, vos licences et surveillez l'état du réseau GAB-EDT.
        </p>
      </header>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        
        {/* KPI 1 */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: 'var(--space-sm)', borderRadius: 'var(--radius)' }}>
              <span className="material-symbols-outlined">domain</span>
            </div>
            <span style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
              +2 ce mois
            </span>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {institutions.length || 2}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-xs)' }}>
            Établissements actifs
          </p>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
            <div style={{ background: '#F3E8FF', color: '#7E22CE', padding: 'var(--space-sm)', borderRadius: 'var(--radius)' }}>
              <span className="material-symbols-outlined">groups</span>
            </div>
            <span style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
              +15%
            </span>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            4,521
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-xs)' }}>
            Utilisateurs totaux
          </p>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
            <div style={{ background: '#ECFEFF', color: '#0E7490', padding: 'var(--space-sm)', borderRadius: 'var(--radius)' }}>
              <span className="material-symbols-outlined">memory</span>
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            99.9%
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-xs)' }}>
            Uptime (Disponibilité)
          </p>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
            <div style={{ background: '#FEF3C7', color: '#B45309', padding: 'var(--space-sm)', borderRadius: 'var(--radius)' }}>
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <span style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
              1 à renouveler
            </span>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            450 kF
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-xs)' }}>
            MRR Estimé
          </p>
        </div>

      </div>

      {/* INSTITUTIONS LIST */}
      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Établissements Clients
          </h2>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add</span>
            Nouvel Établissement
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Chargement des établissements...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <th style={{ padding: 'var(--space-md) 0', fontWeight: 500 }}>Établissement</th>
                  <th style={{ padding: 'var(--space-md) 0', fontWeight: 500 }}>Type</th>
                  <th style={{ padding: 'var(--space-md) 0', fontWeight: 500 }}>Ville</th>
                  <th style={{ padding: 'var(--space-md) 0', fontWeight: 500 }}>Statut</th>
                  <th style={{ padding: 'var(--space-md) 0', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--space-md) 0' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{inst.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inst.code}</div>
                    </td>
                    <td style={{ padding: 'var(--space-md) 0' }}>
                      <span style={{ 
                        background: inst.type === 'UNIVERSITY' ? '#F3E8FF' : 'var(--primary-light)', 
                        color: inst.type === 'UNIVERSITY' ? '#7E22CE' : 'var(--primary-dark)', 
                        padding: '4px 8px', 
                        borderRadius: 'var(--radius)', 
                        fontSize: '0.75rem', 
                        fontWeight: 500 
                      }}>
                        {inst.type}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-md) 0', color: 'var(--text-secondary)' }}>
                      {inst.city}
                    </td>
                    <td style={{ padding: 'var(--space-md) 0' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.875rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                        Actif
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-md) 0', textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.875rem' }}>
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
                {institutions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Aucun établissement trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
