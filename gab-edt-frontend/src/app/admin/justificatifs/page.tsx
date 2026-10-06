"use client";

import React, { useState } from 'react';

type Justificatif = { id: string; date: string; student: string; classe: string; motif: string; status: string; file: boolean };

export default function JustificatifsPage() {
  const [data, setData] = useState<Justificatif[]>([]);

  const handleValidate = (id: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: 'Validé' } : item));
  };

  const handleReject = (id: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: 'Refusé' } : item));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Justificatifs d'absences</h1>
          <p className="page-subtitle">Validez ou rejetez les mots d'excuses envoyés par les parents.</p>
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Élève</th>
              <th>Classe</th>
              <th>Motif</th>
              <th>Pièce jointe</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Aucun justificatif à afficher : la liste n&apos;est pas encore reliée au backend.
                </td>
              </tr>
            )}
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td className="font-medium">{item.student}</td>
                <td>{item.classe}</td>
                <td>{item.motif}</td>
                <td>
                  {item.file ? (
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '4px' }}>visibility</span>
                      Voir le certificat
                    </button>
                  ) : '-'}
                </td>
                <td>
                  <span className={`badge ${
                    item.status === 'Validé' ? 'badge-green' :
                    item.status === 'En attente' ? 'badge-orange' : 'badge-red'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="text-right">
                  {item.status === 'En attente' && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={() => handleValidate(item.id)}>Valider</button>
                      <button className="btn btn-outline" style={{ color: 'var(--error)' }} onClick={() => handleReject(item.id)}>Rejeter</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-8">Aucun justificatif en attente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
