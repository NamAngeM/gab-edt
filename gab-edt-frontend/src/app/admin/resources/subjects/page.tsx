"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchWithAuth, extractArray, extractPageData } from '@/lib/api';

interface Subject {
  id: string;
  name: string;
  code?: string;
  color?: string;
  credits?: number;
  active?: boolean;
  orgUnit?: { id: string; name: string; type: string };
}

interface OrgUnit {
  id: string;
  name: string;
  type: string;
  children?: OrgUnit[];
}

type ModalMode = 'CREATE' | 'EDIT';
const initForm = { id: '', name: '', code: '', color: '#3B82F6', credits: 3, active: true, orgUnitId: '' };

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      <span className="material-symbols-outlined">{type === 'success' ? 'check_circle' : 'error'}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
      </button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>{[1,2,3,4].map(i => (
      <tr key={i}>
        <td style={{ width: 40, paddingRight: 0 }}></td>
        <td style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
            <div className="skeleton skeleton-text" style={{ width: '55%' }} />
          </div>
        </td>
        <td><div className="skeleton skeleton-text" style={{ width: '40%' }} /></td>
        <td><div className="skeleton skeleton-text" style={{ width: '30%' }} /></td>
        <td><div className="skeleton skeleton-text" style={{ width: '40%' }} /></td>
        <td><div className="skeleton skeleton-text" style={{ width: '60%' }} /></td>
        <td style={{ textAlign: 'right' }}>
          <div className="skeleton" style={{ width: 80, height: 30, borderRadius: 6, marginLeft: 'auto' }} />
        </td>
      </tr>
    ))}</>
  );
}

const buildFlatList = (units: OrgUnit[], prefix = ''): { id: string; label: string }[] => {
  const result: { id: string; label: string }[] = [];
  for (const u of units) {
    result.push({ id: u.id, label: prefix + u.name });
    if (u.children?.length) result.push(...buildFlatList(u.children, prefix + '  '));
  }
  return result;
};

export default function SubjectsAdminPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('CREATE');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState(initForm);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const flatOrgUnits = buildFlatList(orgUnits);

  const params = new URLSearchParams({
    page: page.toString(),
    size: pageSize.toString(),
  });
  if (search) params.append('search', search);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [resData, orgUnitsRes] = await Promise.all([
        fetchWithAuth(`/subjects?${params.toString()}`),
        fetchWithAuth('/org-units'),
      ]);
      setSubjects(extractArray(resData));
      const pageData = extractPageData(resData);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
      setOrgUnits(extractArray(orgUnitsRes));
      setSelectedIds(new Set());
    } catch { setError('Impossible de charger les données.'); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenCreate = () => {
    setModalMode('CREATE'); setFormData(initForm); setModalError(''); setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setModalMode('EDIT');
    setFormData({
      id: s.id,
      name: s.name,
      code: s.code || '',
      color: s.color || '#3B82F6',
      credits: s.credits ?? 3,
      active: s.active ?? true,
      orgUnitId: s.orgUnit?.id || ''
    });
    setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette matière ? Cette action est irréversible.')) return;
    try {
      await fetchWithAuth(`/subjects/${id}`, { method: 'DELETE' });
      setToast({ message: 'Matière supprimée avec succès.', type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur lors de la suppression.', type: 'error' }); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Supprimer les ${selectedIds.size} matières sélectionnées ?`)) return;
    try {
      await fetchWithAuth(`/subjects/bulk-delete`, { 
        method: 'POST', body: JSON.stringify(Array.from(selectedIds))
      });
      setToast({ message: `${selectedIds.size} matières supprimées.`, type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur lors de la suppression groupée.', type: 'error' }); }
  };

  const handleBulkStatus = async (status: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      await fetchWithAuth(`/subjects/bulk-status`, { 
        method: 'POST', body: JSON.stringify({ ids: Array.from(selectedIds), active: status })
      });
      setToast({ message: `Statut mis à jour pour ${selectedIds.size} matières.`, type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur.', type: 'error' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setModalError(''); setModalLoading(true);
    try {
      const url = modalMode === 'EDIT' ? `/subjects/${formData.id}` : `/subjects`;
      const method = modalMode === 'EDIT' ? 'PUT' : 'POST';
      await fetchWithAuth(url, {
        method,
        body: JSON.stringify({
          name: formData.name, code: formData.code, color: formData.color,
          credits: Number(formData.credits), active: formData.active,
          orgUnitId: formData.orgUnitId || null,
        }),
      });
      setIsModalOpen(false);
      setToast({ message: modalMode === 'CREATE' ? 'Matière créée avec succès.' : 'Matière modifiée avec succès.', type: 'success' });
      loadData();
    } catch (err: any) { setModalError(err.message || 'Erreur lors de la sauvegarde.'); }
    finally { setModalLoading(false); }
  };

  const filtered = subjects.filter(s =>
    `${s.name} ${s.code || ''} ${s.orgUnit?.name || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <nav className="breadcrumb">
        <span>Administration</span>
        <span className="breadcrumb-sep material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span>Ressources</span>
        <span className="breadcrumb-sep material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span className="breadcrumb-current">Matières & Modules</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Matières & Modules</h1>
          <p className="page-subtitle">
            Catalogue pédagogique • {subjects.length} matière{subjects.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={loadData}>
            <span className="material-symbols-outlined">refresh</span>
            Actualiser
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <span className="material-symbols-outlined">add</span>
            Nouvelle Matière
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total</span>
            <div className="stat-card-icon"><span className="material-symbols-outlined">menu_book</span></div>
          </div>
          <div className="stat-card-value">{subjects.length}</div>
          <div className="stat-card-trend">matières</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Globales</span>
            <div className="stat-card-icon" style={{ background: '#F0FDF4', color: 'var(--success)' }}>
              <span className="material-symbols-outlined">public</span>
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>
            {subjects.filter(s => !s.orgUnit).length}
          </div>
          <div className="stat-card-trend">à l'institution</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Avec code</span>
            <div className="stat-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined">tag</span>
            </div>
          </div>
          <div className="stat-card-value">{subjects.filter(s => s.code).length}</div>
          <div className="stat-card-trend">référencées</div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <div><strong>Erreur</strong><br />{error}</div>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Catalogue des matières</h2>
            {!loading && <span className="badge badge-gray">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>}
          </div>
          <div className="search-box">
            <span className="material-symbols-outlined search-box-icon">search</span>
            <input type="text" placeholder="Rechercher une matière..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th>Code</th>
                <th>Unité organisationnelle</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows /> : filtered.length === 0 ? (
                <tr><td colSpan={4}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><span className="material-symbols-outlined">menu_book</span></div>
                    <p className="empty-state-title">{search ? 'Aucun résultat' : 'Aucune matière enregistrée'}</p>
                    <p className="empty-state-desc">{search ? `Aucune matière ne correspond à "${search}".` : 'Commencez par créer votre première matière.'}</p>
                    {!search && <button className="btn btn-primary" onClick={handleOpenCreate} style={{ marginTop: 16 }}><span className="material-symbols-outlined">add</span>Nouvelle Matière</button>}
                  </div>
                </td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="cell-name">
                      <div className="cell-avatar-icon">
                        <span className="material-symbols-outlined">menu_book</span>
                      </div>
                      <div className="cell-name-primary">{s.name}</div>
                    </div>
                  </td>
                  <td>
                    {s.code
                      ? <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{s.code}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    {s.orgUnit
                      ? <span className="badge badge-gray">{s.orgUnit.name}</span>
                      : <span className="badge badge-green">Globale</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(s)}>
                        <span className="material-symbols-outlined">edit</span>
                        Modifier
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="table-footer">
            <span>{filtered.length} matière{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}</span>
            <span style={{ color: 'var(--primary)', fontSize: 12 }}>Page 1 sur 1</span>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{modalMode === 'CREATE' ? 'Nouvelle Matière' : 'Modifier la Matière'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="modal-body">
              {modalError && <div className="alert alert-error"><span className="material-symbols-outlined">error</span>{modalError}</div>}
              <div className="form-group">
                <label className="form-label">Nom de la matière <span className="required">*</span></label>
                <input type="text" className="form-input" placeholder="Ex: Programmation Avancée & Algorithmique" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Code (optionnel)</label>
                <input type="text" className="form-input" placeholder="Ex: ELC3, INFO-101..." style={{ fontFamily: 'monospace' }} value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                <p className="form-hint">Identifiant court utilisé dans les emplois du temps et les exports.</p>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Unité Organisationnelle (optionnel)</label>
                <select className="form-select" value={formData.orgUnitId} onChange={e => setFormData({ ...formData, orgUnitId: e.target.value })}>
                  <option value="">— Globale à l'établissement —</option>
                  {flatOrgUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
                <p className="form-hint">Laissez vide pour une matière accessible à toute l'institution.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={modalLoading}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={modalLoading}>
                {modalLoading ? <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>progress_activity</span>En cours...</> : <><span className="material-symbols-outlined">save</span>{modalMode === 'CREATE' ? 'Créer la matière' : 'Enregistrer'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
