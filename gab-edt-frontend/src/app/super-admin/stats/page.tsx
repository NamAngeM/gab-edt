"use client";

import React from 'react';

export default function StatsPage() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
          Statistiques SaaS
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Visualisez la croissance et l'utilisation globale de la plateforme GAB-EDT.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        
        {/* CHART MOCKUP - CSS ONLY */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Croissance des Utilisateurs Actifs</h2>
          <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            {[30, 45, 60, 50, 75, 90, 85, 110, 140, 160, 150, 190].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${h}px`, 
                  background: 'linear-gradient(to top, var(--primary-dark), var(--primary-light))',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease'
                }} className="hover:opacity-80 cursor-pointer" title={`Mois ${i+1}: ${h * 10} utilisateurs`} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <span>Janv</span>
            <span>Fév</span>
            <span>Mar</span>
            <span>Avr</span>
            <span>Mai</span>
            <span>Juin</span>
            <span>Juil</span>
            <span>Août</span>
            <span>Sept</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Déc</span>
          </div>
        </div>

        {/* PIE CHART / DISTRIBUTION MOCKUP */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Répartition par Établissement</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                <span>Universités</span>
                <span style={{ fontWeight: 600 }}>55%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px' }}>
                <div style={{ width: '55%', height: '100%', background: '#7E22CE', borderRadius: '4px' }} />
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                <span>Lycées</span>
                <span style={{ fontWeight: 600 }}>30%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px' }}>
                <div style={{ width: '30%', height: '100%', background: '#0369A1', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                <span>Grandes Écoles</span>
                <span style={{ fontWeight: 600 }}>10%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px' }}>
                <div style={{ width: '10%', height: '100%', background: '#B45309', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                <span>Collèges</span>
                <span style={{ fontWeight: 600 }}>5%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--surface-container-high)', borderRadius: '4px' }}>
                <div style={{ width: '5%', height: '100%', background: '#16A34A', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
