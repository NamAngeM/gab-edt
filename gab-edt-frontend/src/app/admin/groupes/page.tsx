"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth, API_URL } from '@/lib/api';

export default function GroupesAdminPage() {
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formData, setFormData] = useState({ id: '', name: '', type: 'CLASS', parentId: '', institutionId: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgRes, instRes] = await Promise.all([
        fetchWithAuth('/org-units'),
        fetchWithAuth('/institutions')
      ]);
      setOrgUnits(orgRes);
      setInstitutions(instRes);
    } catch (err: any) {
      setError("Erreur lors du chargement des groupes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Here we are interested in Levels -> Classes -> Groups
  // But wait, what if the user directly creates Classes under Levels?
  const levels = orgUnits.filter(u => u.type === 'LEVEL');
  const getChildren = (parentId: string, types: string[]) => orgUnits.filter(u => u.parent && u.parent.id === parentId && types.includes(u.type));

  const handleOpenCreate = (parentId: string = '', type: string = 'CLASS') => {
    setModalMode('CREATE');
    setFormData({ 
      id: '', name: '', type, parentId, 
      institutionId: institutions.length > 0 ? institutions[0].id : '' 
    });
    setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce groupe / cette promotion ?')) return;
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const res = await fetch(`${API_URL}/org-units/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      if (!res.ok) throw new Error("Erreur");
      loadData();
    } catch { alert("Erreur de suppression."); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true); setModalError('');
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const url = modalMode === 'EDIT' ? `${API_URL}/org-units/${formData.id}` : `${API_URL}/org-units`;
      const res = await fetch(url, {
        method: modalMode === 'EDIT' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, type: formData.type, parentId: formData.parentId || null, institutionId: formData.institutionId })
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === 'CLASS') return 'Promotion / Classe entière';
    if (type === 'GROUP') return 'Groupe TD / TP';
    return type;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Promotions & Groupes
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Gérez vos classes et sous-divisez-les en groupes pour les TD et TP.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des promotions...</div>
      ) : levels.length === 0 ? (
        <div style={{ background: 'var(--surface-container)', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Veuillez d'abord créer des "Niveaux d'études" dans l'onglet Formations avant de créer des promotions.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {levels.map(level => {
            const classes = getChildren(level.id, ['CLASS']);
            return (
              <div key={level.id} style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', background: 'var(--surface-container-low)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Niveau Académique</div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{level.name}</h2>
                  </div>
                  <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} onClick={() => handleOpenCreate(level.id, 'CLASS')}>
                    + Ajouter une Promotion
                  </button>
                </div>
                
                <div style={{ padding: '1rem', flex: 1 }}>
                  {classes.length === 0 ? (
                     <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>Aucune promotion pour ce niveau.</div>
                  ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {classes.map(cls => (
                           <div key={cls.id} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-container-low)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                   <span className="material-symbols-outlined" style={{ color: 'var(--text-secondary)' }}>school</span>
                                   <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cls.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} onClick={() => handleOpenCreate(cls.id, 'GROUP')}>+ Groupe</button>
                                  <button style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={() => handleDelete(cls.id)}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span></button>
                                </div>
                              </div>
                              
                              <div style={{ padding: '0.5rem 1rem' }}>
                                 {getChildren(cls.id, ['GROUP']).map(grp => (
                                    <div key={grp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                       <span style={{ fontSize: '13px', fontWeight: 500 }}>{grp.name}</span>
                                       <button style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleDelete(grp.id)}>Supprimer</button>
                                    </div>
                                 ))}
                                 {getChildren(cls.id, ['GROUP']).length === 0 && (
                                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>Aucun sous-groupe. (Cours en classe entière)</div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface)', width: '100%', maxWidth: '500px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Ajouter: {getTypeLabel(formData.type)}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              {modalError && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>{modalError}</div>}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Nom du {getTypeLabel(formData.type)} <span style={{color:'var(--danger)'}}>*</span></label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }} placeholder="Ex: Informatique L3, Groupe 1..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>Annuler</button>
                <button type="submit" disabled={modalLoading} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                  {modalLoading ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
