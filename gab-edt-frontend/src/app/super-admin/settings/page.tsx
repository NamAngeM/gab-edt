"use client";

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
            Paramètres Serveur
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configuration de l'infrastructure et intégrations tierces.
          </p>
        </div>
        <button className="btn btn-primary">Sauvegarder</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        
        {/* DATABASE SETTINGS */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>database</span>
            Base de données (PostgreSQL)
          </h2>
          
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">URL de connexion</label>
            <input type="text" className="form-input" value="jdbc:postgresql://postgres:5432/gabedt" disabled />
          </div>
          
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Utilisateur DB</label>
            <input type="text" className="form-input" value="gabedt" disabled />
          </div>

          <button className="btn btn-outline" style={{ width: '100%' }}>Lancer un Backup Manuel</button>
        </div>

        {/* EXTERNAL APIS */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--warning)' }}>key</span>
            Clés API & Intégrations
          </h2>
          
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Stripe Secret Key (Paiements)</label>
            <input type="password" className="form-input" defaultValue="sk_test_123456789" />
          </div>
          
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">SendGrid API Key (Emails SMTP)</label>
            <input type="password" className="form-input" defaultValue="SG.xxxxxxxxxxxx" />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Firebase Server Key (Push Mobile)</label>
            <input type="password" className="form-input" defaultValue="AAAAxxxxxxx:APA91b..." />
          </div>
        </div>
        
        {/* CACHE & PERFORMANCE */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--danger)' }}>speed</span>
            Cache & Performances (Redis)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
            Purgez le cache manuellement si les emplois du temps ne se synchronisent pas correctement sur le réseau.
          </p>
          <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            Purger le cache global Redis
          </button>
        </div>

      </div>
    </div>
  );
}
