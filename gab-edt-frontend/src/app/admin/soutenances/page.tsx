"use client";

import React, { useState, useEffect } from 'react';
import { fetchWithAuth, extractArray } from '@/lib/api';

export default function SoutenancesPage() {
  const [defenses, setDefenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    studentId: '', topic: '', roomId: '', startAt: '', endAt: '', presidentId: '', examinerId: '', reporterId: '' 
  });
  
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/defenses');
      setDefenses(extractArray(res));

      const [stRes, tRes, rRes] = await Promise.all([
        fetchWithAuth('/students'),
        fetchWithAuth('/teachers'),
        fetchWithAuth('/rooms')
      ]);
      setStudents(extractArray(stRes));
      setTeachers(extractArray(tRes));
      setRooms(extractArray(rRes));
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
      await fetchWithAuth('/defenses', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setShowAddModal(false);
      setFormData({ studentId: '', topic: '', roomId: '', startAt: '', endAt: '', presidentId: '', examinerId: '', reporterId: '' });
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
        <span>Évaluations & Examens</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Soutenances PFE</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Soutenances PFE</h1>
          <p className="page-subtitle">Programmez les jurys et soutenance des étudiants.</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Nouvelle Soutenance
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            <p>Chargement des soutenances...</p>
          </div>
        ) : defenses.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">co_present</span>
            <h3>Aucune soutenance planifiée</h3>
            <p>Programmez une nouvelle soutenance.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Heure</th>
                  <th>Étudiant</th>
                  <th>Thème / Sujet</th>
                  <th>Salle</th>
                  <th>Jury (Président / Rapporteur)</th>
                </tr>
              </thead>
              <tbody>
                {defenses.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="text-mono text-primary-color">
                        {formatDateTime(d.startAt)}
                      </div>
                    </td>
                    <td className="font-medium">{d.studentName}</td>
                    <td>{d.topic}</td>
                    <td>{d.roomName}</td>
                    <td>
                      {d.president && <div className="badge badge-primary">P: {d.president.firstName} {d.president.lastName}</div>}
                      {d.reporter && <div className="badge badge-warning" style={{marginLeft: 4}}>R: {d.reporter.firstName} {d.reporter.lastName}</div>}
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
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Programmer une Soutenance</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Étudiant</label>
                  <select
                    className="form-select"
                    required
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  >
                    <option value="">Sélectionnez...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Thème / Sujet PFE</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.topic}
                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  />
                </div>
                
                <div className="divider"></div>
                <h3 style={{fontSize: 14, marginBottom: 12}}>Planification</h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Date/Heure de début</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      required
                      value={formData.startAt}
                      onChange={e => setFormData({ ...formData, startAt: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Date/Heure de fin</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      required
                      value={formData.endAt}
                      onChange={e => setFormData({ ...formData, endAt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Salle</label>
                  <select
                    className="form-select"
                    required
                    value={formData.roomId}
                    onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                  >
                    <option value="">Sélectionnez...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (Capacité: {r.capacity})</option>
                    ))}
                  </select>
                </div>

                <div className="divider"></div>
                <h3 style={{fontSize: 14, marginBottom: 12}}>Jury</h3>
                <div className="form-group">
                  <label className="form-label">Président du Jury</label>
                  <select
                    className="form-select"
                    required
                    value={formData.presidentId}
                    onChange={e => setFormData({ ...formData, presidentId: e.target.value })}
                  >
                    <option value="">Sélectionnez...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Examinateur</label>
                    <select
                      className="form-select"
                      value={formData.examinerId}
                      onChange={e => setFormData({ ...formData, examinerId: e.target.value })}
                    >
                      <option value="">Sélectionnez...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Rapporteur</label>
                    <select
                      className="form-select"
                      value={formData.reporterId}
                      onChange={e => setFormData({ ...formData, reporterId: e.target.value })}
                    >
                      <option value="">Sélectionnez...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Programmer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
