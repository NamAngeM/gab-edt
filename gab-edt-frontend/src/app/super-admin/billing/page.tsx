"use client";

import React from 'react';

export default function BillingPage() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
          Abonnements & Licences
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gérez la facturation, les plans SaaS et les revenus.
        </p>
      </header>

      {/* REVENUE KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <div className="card" style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Revenu Récurrent Mensuel (MRR)</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>450 kF</div>
          <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', marginTop: '8px', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>trending_up</span>
            +12.5% ce mois
          </div>
        </div>
        <div className="card" style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Abonnements Actifs</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>24</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
            Dont 3 annuels
          </div>
        </div>
        <div className="card" style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Factures en attente</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)' }}>2</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
            Montant: 45 kF
          </div>
        </div>
      </div>

      {/* PLANS */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
        Forfaits de la plateforme
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <div className="card" style={{ padding: 'var(--space-xl)', borderTop: '4px solid var(--border-strong)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Basic</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '8px 0 16px 0' }}>Jusqu'à 500 utilisateurs</p>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>15 kF<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mois</span></div>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '16px' }}>Modifier le plan</button>
        </div>
        <div className="card" style={{ padding: 'var(--space-xl)', borderTop: '4px solid var(--primary)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '2px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            LE PLUS POPULAIRE
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Pro</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '8px 0 16px 0' }}>Jusqu'à 2000 utilisateurs</p>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>45 kF<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mois</span></div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Modifier le plan</button>
        </div>
        <div className="card" style={{ padding: 'var(--space-xl)', borderTop: '4px solid #0F172A' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Enterprise</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '8px 0 16px 0' }}>Illimité + Support VIP</p>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>Sur devis</div>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '16px' }}>Modifier le plan</button>
        </div>
      </div>

    </div>
  );
}
