"use client";

import React, { useState, useEffect } from 'react';
import { fetchWithAuth, extractArray } from '@/lib/api';

export default function AnnoncesPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'ALL',
    validUntil: '',
    authorId: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [annRes, tRes] = await Promise.all([
        fetchWithAuth('/communication/announcements'),
        fetchWithAuth('/teachers')
      ]);
      setAnnouncements(extractArray(annRes));
      setTeachers(extractArray(tRes));
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
      await fetchWithAuth('/communication/announcements', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setShowAddModal(false);
      setFormData({ title: '', content: '', targetAudience: 'ALL', validUntil: '', authorId: '' });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création');
    }
  };

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span>Communication & Événements</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Annonces & Actualités</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Annonces & Actualités</h1>
          <p className="page-subtitle">Communiquez avec les étudiants, professeurs et le personnel.</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined">campaign</span>
            Nouvelle Annonce
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            <p>Chargement des annonces...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">forum</span>
            <h3>Aucune annonce</h3>
            <p>Créez votre première annonce pour informer l'établissement.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Cible</th>
                  <th>Valide Jusqu'au</th>
                  <th>Auteur</th>
                  <th>Date de publication</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.title}</td>
                    <td>
                      <span className={`badge ${a.targetAudience === 'ALL' ? 'badge-primary' : 'badge-warning'}`}>
                        {a.targetAudience}
                      </span>
                    </td>
                    <td>{a.validUntil || 'Illimité'}</td>
                    <td>{a.authorName}</td>
                    <td className="text-mono">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
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
              <h2 className="modal-title">Créer une Annonce</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titre de l'annonce</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contenu</label>
                  <textarea
                    className="form-input"
                    required
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                  ></textarea>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Audience Cible</label>
                    <select
                      className="form-select"
                      value={formData.targetAudience}
                      onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                    >
                      <option value="ALL">Tous</option>
                      <option value="STUDENTS">Étudiants</option>
                      <option value="TEACHERS">Enseignants</option>
                      <option value="STAFF">Personnel / Admin</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Valide jusqu'au</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.validUntil}
                      onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Auteur (Professeur/Admin)</label>
                  <select
                    className="form-select"
                    required
                    value={formData.authorId}
                    onChange={e => setFormData({ ...formData, authorId: e.target.value })}
                  >
                    <option value="">Sélectionnez un auteur...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.user.id}>{t.user.firstName} {t.user.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Publier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
