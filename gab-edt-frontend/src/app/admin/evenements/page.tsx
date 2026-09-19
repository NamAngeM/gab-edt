"use client";

import React, { useState, useEffect } from 'react';
import { fetchWithAuth, extractArray } from '@/lib/api';

export default function EvenementsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    holiday: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/communication/events');
      setEvents(extractArray(res));
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
      await fetchWithAuth('/communication/events', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowAddModal(false);
      setFormData({ title: '', description: '', startDate: '', endDate: '', holiday: false });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création');
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span>Communication & Événements</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Événements Académiques</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Événements Académiques</h1>
          <p className="page-subtitle">Gérez le calendrier institutionnel (vacances, séminaires, jours fériés).</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined">event</span>
            Nouvel Événement
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            <p>Chargement des événements...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">calendar_month</span>
            <h3>Aucun événement</h3>
            <p>Ajoutez des événements académiques à votre calendrier.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Dates (Début - Fin)</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td className="font-medium">{ev.title}</td>
                    <td className="text-mono">
                      {formatDateTime(ev.startDate)} - {formatDateTime(ev.endDate)}
                    </td>
                    <td>
                      {ev.holiday ? (
                        <span className="badge badge-error">Congés / Vacances</span>
                      ) : (
                        <span className="badge badge-primary">Institutionnel</span>
                      )}
                    </td>
                    <td>{ev.description}</td>
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
              <h2 className="modal-title">Créer un Événement</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titre de l'événement</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Début</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Fin</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      required
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isHoliday"
                    checked={formData.holiday}
                    onChange={e => setFormData({ ...formData, holiday: e.target.checked })}
                  />
                  <label htmlFor="isHoliday" style={{ margin: 0, fontWeight: 500 }}>
                    Marquer comme période de congés / vacances
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Description (optionnelle)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
