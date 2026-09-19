"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrganisationAdminPage() {
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  
  const [formData, setFormData] = useState({ id: '', name: '', type: 'CAMPUS', parentId: '', institutionId: '' });

  const ORG_TYPES = [
    'CAMPUS', 'FACULTY', 'DEPARTMENT', 'PROGRAM', 'CYCLE', 
    'YEAR', 'LEVEL', 'SERIES', 'CLASS', 'GROUP', 'OPTION', 'SPECIALTY'
  ];

  const loadData = async (initialLoad = false) => {
    if (!initialLoad) setLoading(true);
    try {
      const res = await fetchWithAuth('/resources/tree');
      setTree(res);
    } catch (err: any) {
      setError('Erreur lors du chargement des données. Êtes-vous connecté ?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleOpenCreate = (parentId: string, institutionId: string) => {
    setModalMode('CREATE');
    setFormData({ id: '', name: '', type: 'DEPARTMENT', parentId, institutionId });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (node: any, institutionId: string) => {
    setModalMode('EDIT');
    setFormData({ id: node.id, name: node.name, type: node.type, parentId: '', institutionId });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette unité ? (Les sous-unités pourraient être affectées)')) return;
    
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const response = await fetch(`${API_URL}/org-units/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      loadData();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);
    
    try {
      const token = localStorage.getItem('jwt_token') || '';
      
      let url = `${API_URL}/org-units`;
      let method = 'POST';
      
      if (modalMode === 'EDIT') {
        url = `${API_URL}/org-units/${formData.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          parentId: formData.parentId || null,
          institutionId: formData.institutionId
        })
      });
      
      if (!response.ok) throw new Error('Erreur API');
      
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError(`Erreur lors de la ${modalMode === 'CREATE' ? 'création' : 'modification'}.`);
    } finally {
      setModalLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CAMPUS': return '🏢';
      case 'FACULTY': return '🏛️';
      case 'DEPARTMENT': return '📁';
      case 'PROGRAM': return '🎓';
      case 'CYCLE': return '🔄';
      case 'YEAR': return '📅';
      case 'LEVEL': return '📘';
      case 'SERIES': return '🔠';
      case 'CLASS': return '🏫';
      case 'GROUP': return '👥';
      case 'OPTION': return '⚙️';
      case 'SPECIALTY': return '🔬';
      default: return '📍';
    }
  };

  const EditableTreeNode = ({ node, level, institutionId }: { node: any, level: number, institutionId: string }) => {
    const [expanded, setExpanded] = useState(true);
    
    return (
      <div style={{ marginLeft: `${level > 0 ? 2 : 0}rem`, marginTop: '0.5rem' }}>
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0.75rem',
          backgroundColor: level === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
            {node.children && node.children.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{expanded ? '▼' : '▶'}</span>
            )}
            <span style={{ fontWeight: level === 0 ? 600 : 500 }}>
              {getIcon(node.type)} {node.name}
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
              {node.type}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => handleOpenCreate(node.id, institutionId)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer' }}
            >
              + Sous-Unité
            </button>
            <button 
              onClick={() => handleOpenEdit(node, institutionId)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer' }}
            >
              ✏️
            </button>
            <button 
              onClick={() => handleDelete(node.id)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid red', background: 'transparent', color: 'red', cursor: 'pointer' }}
            >
              🗑️
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && node.children && node.children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {node.children.map((child: any) => (
                <EditableTreeNode key={child.id} node={child} level={level + 1} institutionId={institutionId} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Organisation Pédagogique</h1>
          <p className="page-description">
            Gérez l'arborescence de votre établissement.
          </p>
        </div>
        {tree?.institution?.id && (
          <button className="btn btn-primary" onClick={() => handleOpenCreate('', tree.institution.id)}>
            + Unité Racine
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p>Chargement en cours...</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            {tree?.institution ? (
              <div>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  🎓 {tree.institution.name} 
                  <span className="badge badge-gray">
                    {tree.institution.type}
                  </span>
                </h2>
                
                {tree.institution.rootUnits && tree.institution.rootUnits.length > 0 ? (
                  tree.institution.rootUnits.map((unit: any) => (
                    <EditableTreeNode key={unit.id} node={unit} level={0} institutionId={tree.institution.id} />
                  ))
                ) : (
                  <div className="empty-state" style={{ padding: '2rem' }}>Aucune unité racine trouvée.</div>
                )}
              </div>
            ) : (
              <div className="empty-state">Aucune institution disponible.</div>
            )}
          </div>
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'CREATE' ? 'Créer une Unité' : "Modifier l'Unité"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="modal-body">
                {modalError && <div className="alert alert-error">{modalError}</div>}
                
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input 
                    type="text" 
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Département Mathématiques"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Type d'Unité *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    {ORG_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'En cours...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
