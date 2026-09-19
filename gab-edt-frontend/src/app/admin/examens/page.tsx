"use client";

import React, { useState, useEffect } from 'react';
import { fetchWithAuth, extractArray } from '@/lib/api';

export default function ExamensPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', orgUnitId: '' });
  const [orgUnits, setOrgUnits] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/exams/sessions');
      setSessions(extractArray(res));
      
      const ouRes = await fetchWithAuth('/org-units');
      setOrgUnits(extractArray(ouRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { ...formData } as Record<string, any>;
      Object.keys(body).forEach(key => {
        if (body[key] === '') body[key] = null;
      });
      await fetchWithAuth('/exams/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setShowAddModal(false);
      setFormData({ name: '', startDate: '', endDate: '', orgUnitId: '' });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création');
    }
  };

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span>Évaluations & Examens</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Sessions d'examens</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Sessions d'examens</h1>
          <p className="page-subtitle">Planifiez et gérez les périodes d'évaluation.</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Nouvelle Session
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            <p>Chargement des sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">event_busy</span>
            <h3>Aucune session d'examen</h3>
            <p>Commencez par créer une nouvelle session.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Promotion / Groupe ciblée</th>
                  <th>Statut</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.name}</td>
                    <td>{s.startDate}</td>
                    <td>{s.endDate}</td>
                    <td>{s.orgUnitName}</td>
                    <td>
                      {s.published ? (
                        <span className="badge badge-success">Publiée</span>
                      ) : (
                        <span className="badge badge-warning">Brouillon</span>
                      )}
                    </td>
                    <td className="table-actions">
                      <button className="icon-btn text-primary-color" title="Gérer les examens">
                        <span className="material-symbols-outlined">list_alt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Nouvelle Session d'Examen</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom de la session</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ex: Partiels Semestre 1"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Promotion concernée</label>
                  <select
                    className="form-select"
                    required
                    value={formData.orgUnitId}
                    onChange={e => setFormData({ ...formData, orgUnitId: e.target.value })}
                  >
                    <option value="">Sélectionnez...</option>
                    {orgUnits.map(ou => (
                      <option key={ou.id} value={ou.id}>{ou.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Date de début</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Date de fin</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
