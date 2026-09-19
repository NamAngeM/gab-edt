"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth, API_URL } from '@/lib/api';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, orgUnitsRes] = await Promise.all([
        fetchWithAuth('/users'),
        fetchWithAuth('/org-units')
      ]);
      setUsers(usersRes.data || []);
      setOrgUnits(orgUnitsRes || []);
    } catch (err: any) {
      setError('Erreur lors du chargement des données. Vous devez être administrateur global.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setSelectedUnits(user.managedOrgUnitIds || []);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleToggleUnit = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setModalError('');
    setModalLoading(true);
    
    try {
      const token = localStorage.getItem('jwt_token') || '';
      
      const response = await fetch(`${API_URL}/users/${selectedUser.id}/managed-units`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedUnits)
      });
      
      if (!response.ok) throw new Error('Erreur API');
      
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError('Erreur lors de la modification des droits.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Accès et Utilisateurs</h1>
          <p className="page-description">
            Assignez les droits d'administration sur les unités organisationnelles.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p>Chargement en cours...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <span className={`badge ${user.role === 'SUPER_ADMIN' ? 'badge-blue' : 'badge-gray'}`}>
                    {user.role}
                  </span>
                </div>
                
                <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: '0.4rem 0' }}>✉️ {user.email}</p>
                  {user.role !== 'SUPER_ADMIN' && user.role !== 'STUDENT' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Unités gérées : </strong>
                      {user.managedOrgUnitIds && user.managedOrgUnitIds.length > 0 ? (
                        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                          {user.managedOrgUnitIds.map((id: string) => {
                            const u = orgUnits.find(ou => ou.id === id);
                            return <li key={id}>{u ? u.name : id}</li>;
                          })}
                        </ul>
                      ) : (
                        <span>Aucune</span>
                      )}
                    </div>
                  )}
                </div>
                
                {(user.role === 'PEDAGOGICAL_MANAGER' || user.role === 'SCHOOL_ADMIN') && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => handleOpenEdit(user)}>
                      Gérer les droits (ACL)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal ACL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                Droits de {selectedUser?.firstName}
              </h2>
              <p className="page-description" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Sélectionnez les unités organisationnelles que cet utilisateur peut administrer. Les droits s'appliquent en cascade aux sous-unités.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="modal-body">
                {modalError && <div className="alert alert-error">{modalError}</div>}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '40vh', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  {orgUnits.map((unit) => (
                    <label key={unit.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', backgroundColor: selectedUnits.includes(unit.id) ? 'var(--bg-tertiary)' : 'transparent', borderRadius: '4px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedUnits.includes(unit.id)}
                        onChange={() => handleToggleUnit(unit.id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{unit.name} <small style={{ color: 'var(--text-secondary)' }}>({unit.type})</small></span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
