"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth, API_URL } from '@/lib/api';

export default function FormationsAdminPage() {
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formData, setFormData] = useState({ id: '', name: '', type: 'PROGRAM', parentId: '', institutionId: '' });
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
      setError("Erreur lors du chargement des formations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const formations = orgUnits.filter(u => ['PROGRAM', 'CYCLE', 'LEVEL'].includes(u.type));
  // Group logic: Program -> Cycle -> Level
  const programs = formations.filter(u => u.type === 'PROGRAM');

  const getChildren = (parentId: string) => formations.filter(u => u.parent && u.parent.id === parentId);

  const handleOpenCreate = (parentId: string = '', type: string = 'PROGRAM') => {
    setModalMode('CREATE');
    setFormData({ 
      id: '', name: '', type, parentId, 
      institutionId: institutions.length > 0 ? institutions[0].id : '' 
    });
    setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
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
    if (type === 'PROGRAM') return 'Filière / Programme';
    if (type === 'CYCLE') return 'Cycle';
    if (type === 'LEVEL') return 'Niveau (Ex: L1)';
    return type;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Formations & Niveaux
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Structurez vos programmes académiques (Filières &gt; Cycles &gt; Niveaux d'études).
          </p>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 16px', 
          borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)' 
        }} onClick={() => handleOpenCreate('', 'PROGRAM')}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Ajouter une Filière
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des formations...</div>
      ) : programs.length === 0 ? (
        <div style={{ background: 'var(--surface-container)', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Aucune filière n'a encore été créée.</p>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleOpenCreate('', 'PROGRAM')}>Créer la première Filière</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {programs.map(prog => (
            <div key={prog.id} style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', background: 'var(--surface-container-low)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Filière / Programme</div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{prog.name}</h2>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }} onClick={() => handleOpenCreate(prog.id, 'CYCLE')}>+ Sous-cycle</button>
                  <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }} onClick={() => handleOpenCreate(prog.id, 'LEVEL')}>+ Niveau direct</button>
                  <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'var(--danger-bg)', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(prog.id)}>
                     <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                {getChildren(prog.id).map(child => (
                  <div key={child.id} style={{ marginLeft: '1rem', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border)', position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'absolute', left: '-2px', top: '24px', width: '16px', height: '2px', background: 'var(--border)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-container)', padding: '1rem', borderRadius: '12px' }}>
                       <div>
                         <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', background: 'var(--surface-container-high)', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{getTypeLabel(child.type)}</span>
                         <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{child.name}</span>
                       </div>
                       <div style={{ display: 'flex', gap: '8px' }}>
                         {child.type === 'CYCLE' && <button style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleOpenCreate(child.id, 'LEVEL')}>+ Niveau</button>}
                         <button style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={() => handleDelete(child.id)}>Supprimer</button>
                       </div>
                    </div>
                    
                    {/* Levels inside Cycle */}
                    {getChildren(child.id).length > 0 && (
                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                         {getChildren(child.id).map(grandchild => (
                           <div key={grandchild.id} style={{ marginLeft: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                              <div>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: '8px' }}>{getTypeLabel(grandchild.type)}</span>
                                <span style={{ fontWeight: 500 }}>{grandchild.name}</span>
                              </div>
                              <button style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleDelete(grandchild.id)}>Supprimer</button>
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                ))}
                {getChildren(prog.id).length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>Aucun niveau ou cycle défini pour cette filière.</div>}
              </div>
            </div>
          ))}
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Nom <span style={{color:'var(--danger)'}}>*</span></label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }} placeholder="Ex: Informatique, Cycle Ingénieur, Licence 1..." />
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
