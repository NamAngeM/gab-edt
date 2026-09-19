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

  // User Create/Edit state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    id: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'TEACHER', active: true
  });
  const [userModalLoading, setUserModalLoading] = useState(false);
  const [userModalError, setUserModalError] = useState('');

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

  const handleOpenUserModal = (user?: any) => {
    setUserModalError('');
    if (user) {
      setUserFormData({
        id: user.id, email: user.email, password: '', firstName: user.firstName, lastName: user.lastName,
        phone: user.phone || '', role: user.role, active: user.active
      });
    } else {
      setUserFormData({
        id: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'TEACHER', active: true
      });
    }
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');
    setUserModalLoading(true);
    
    try {
      const isCreate = !userFormData.id;
      const url = isCreate ? '/users' : `/users/${userFormData.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      
      const payload = isCreate ? {
        email: userFormData.email, password: userFormData.password, firstName: userFormData.firstName,
        lastName: userFormData.lastName, phone: userFormData.phone, role: userFormData.role, active: userFormData.active
      } : {
        firstName: userFormData.firstName, lastName: userFormData.lastName, phone: userFormData.phone,
        role: userFormData.role, active: userFormData.active
      };

      await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });
      
      setIsUserModalOpen(false);
      loadData();
    } catch (err) {
      setUserModalError('Erreur lors de la sauvegarde de l\'utilisateur.');
    } finally {
      setUserModalLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Gestion des Accès et Utilisateurs</h1>
          <p className="page-description">
            Créez des comptes, modifiez les rôles et assignez les droits d'administration.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenUserModal()}>
          <span className="material-symbols-outlined">add</span>
          Créer un utilisateur
        </button>
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
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => handleOpenUserModal(user)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                    Modifier
                  </button>
                  {(user.role === 'PEDAGOGICAL_MANAGER' || user.role === 'SCHOOL_ADMIN') && (
                    <button className="btn btn-secondary" onClick={() => handleOpenEdit(user)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                      Gérer ACL
                    </button>
                  )}
                </div>
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

      {/* Modal Créer / Modifier Utilisateur */}
      {isUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {userFormData.id ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
              </h2>
            </div>
            
            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {userModalError && <div className="alert alert-error">{userModalError}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Prénom</label>
                    <input type="text" className="form-input" required value={userFormData.firstName} onChange={e => setUserFormData({...userFormData, firstName: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nom</label>
                    <input type="text" className="form-input" required value={userFormData.lastName} onChange={e => setUserFormData({...userFormData, lastName: e.target.value})} />
                  </div>
                </div>

                {!userFormData.id && (
                  <>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" required value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Mot de passe</label>
                      <input type="password" className="form-input" required value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} />
                    </div>
                  </>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Téléphone</label>
                    <input type="text" className="form-input" value={userFormData.phone} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Rôle</label>
                    <select className="form-input" required value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})}>
                      <option value="STUDENT">Étudiant</option>
                      <option value="TEACHER">Enseignant</option>
                      <option value="PEDAGOGICAL_MANAGER">Responsable Pédagogique</option>
                      <option value="SCHOOL_ADMIN">Administrateur</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0, marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input type="checkbox" checked={userFormData.active} onChange={e => setUserFormData({...userFormData, active: e.target.checked})} style={{ cursor: 'pointer', transform: 'scale(1.2)' }} />
                    Compte actif
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsUserModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={userModalLoading}>
                  {userModalLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
