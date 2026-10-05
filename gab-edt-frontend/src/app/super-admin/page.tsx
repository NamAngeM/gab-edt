"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';

interface Institution {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export default function SuperAdminDashboard() {
  const [institutions, setInstitutions] = useState<Institution[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWithAuth('/institutions')
      .then((data) => setInstitutions(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Chargement impossible.'));
  }, []);

  const active = institutions?.filter((i) => i.active).length ?? 0;
  const suspended = (institutions?.length ?? 0) - active;

  const kpis = [
    { icon: 'domain', label: 'Établissements', value: institutions?.length },
    { icon: 'check_circle', label: 'Actifs', value: institutions ? active : undefined },
    { icon: 'block', label: 'Suspendus', value: institutions ? suspended : undefined },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Plateforme GAB-EDT</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Vue d&apos;ensemble des établissements clients.</p>
      </header>

      {error && <div role="alert" className="card" style={{ padding: 'var(--space-lg)', color: 'var(--danger)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)' }}>{kpi.icon}</span>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpi.value ?? '—'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Derniers établissements</h2>
          <Link href="/super-admin/institutions" className="btn btn-outline">Gérer</Link>
        </div>
        {institutions && institutions.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>
            Aucun établissement. <Link href="/super-admin/institutions" style={{ color: 'var(--primary)' }}>Créez le premier client</Link>.
          </p>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {institutions?.slice(0, 8).map((inst) => (
            <li key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span><strong>{inst.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({inst.code})</span></span>
              <span style={{ color: inst.active ? 'var(--success)' : 'var(--danger)' }}>{inst.active ? 'Actif' : 'Suspendu'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
