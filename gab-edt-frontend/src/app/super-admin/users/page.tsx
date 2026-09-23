"use client";

import React from 'react';

const mockUsers = [
  { id: 1, name: 'Jean Dupont', email: 'proviseur@leonmba.ga', role: 'SCHOOL_ADMIN', institution: 'Lycée National Léon Mba', lastLogin: 'Il y a 2h' },
  { id: 2, name: 'Alice Martin', email: 'doyen@sciences.uob.ga', role: 'SCHOOL_ADMIN', institution: 'Université Omar Bongo', lastLogin: 'Il y a 10 min' },
  { id: 3, name: 'Marc Bongo', email: 'it@ist.ga', role: 'SCHOOL_ADMIN', institution: 'Institut Supérieur de Technologie', lastLogin: 'Hier' },
  { id: 4, name: 'Super Admin', email: 'founder@gabedt.ga', role: 'SUPER_ADMIN', institution: 'GAB-EDT Network', lastLogin: 'Maintenant' },
];

export default function UsersPage() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
            Utilisateurs Globaux
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gérez les administrateurs et le personnel clé de chaque établissement.
          </p>
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">download</span>
          Exporter CSV
        </button>
      </header>

      <div className="card">
        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 'var(--space-md)' }}>
          <div className="topbar-search" style={{ margin: 0, flex: 1, background: 'var(--background)' }}>
            <span className="material-symbols-outlined topbar-search-icon">search</span>
            <input type="text" placeholder="Rechercher un email ou un nom..." />
          </div>
          <select className="form-input" style={{ width: '250px' }}>
            <option>Tous les établissements</option>
            <option>Université Omar Bongo</option>
            <option>Lycée National Léon Mba</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-lowest)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Utilisateur</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Rôle</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Établissement (Tenant)</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Dernière connexion</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    <span style={{ 
                      background: user.role === 'SUPER_ADMIN' ? '#FEF2F2' : '#EFF6FF', 
                      color: user.role === 'SUPER_ADMIN' ? '#DC2626' : '#2563EB', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600 
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {user.institution}
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {user.lastLogin}
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.875rem' }}>
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
