"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchWithAuth, extractArray, extractPageData } from '@/lib/api';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  phone: string;
  active: boolean;
  orgUnitIds?: string[];
}

interface OrgUnit {
  id: string;
  name: string;
  type: string;
}

type ModalMode = 'CREATE' | 'EDIT';

const initForm = { id: '', firstName: '', lastName: '', email: '', employeeNumber: '', phone: '', active: true, orgUnitId: '' };

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="material-symbols-outlined">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
      </button>
    </div>
  );
}

function SkeletonRows({ size }: { size: number }) {
  return (
    <>
      {Array.from({ length: size }).map((_, i) => (
        <tr key={i}>
          <td style={{ padding: '16px 24px', width: 40 }}><div className="skeleton" style={{ width: 18, height: 18, borderRadius: 4 }} /></td>
          <td style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: 6 }} />
                <div className="skeleton skeleton-text" style={{ width: '40%', height: 12 }} />
              </div>
            </div>
          </td>
          <td><div className="skeleton skeleton-text" style={{ width: '70%' }} /></td>
          <td><div className="skeleton skeleton-text" style={{ width: '50%' }} /></td>
          <td><div className="skeleton skeleton-text" style={{ width: '60%' }} /></td>
          <td><div className="skeleton skeleton-text" style={{ width: '40%' }} /></td>
          <td style={{ textAlign: 'right' }}>
            <div className="skeleton" style={{ width: 80, height: 30, borderRadius: 6, marginLeft: 'auto' }} />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // local state for input
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [orgFilter, setOrgFilter] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('CREATE');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState(initForm);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (search) params.append('search', search);
      if (activeFilter !== 'ALL') params.append('active', activeFilter === 'ACTIVE' ? 'true' : 'false');
      if (orgFilter) params.append('orgUnitId', orgFilter);

      const [resData, orgUnitsRes] = await Promise.all([
        fetchWithAuth(`/teachers?${params.toString()}`),
        fetchWithAuth('/org-units'),
      ]);
      setTeachers(extractArray(resData));
      const pageData = extractPageData(resData);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
      setOrgUnits(extractArray(orgUnitsRes));
      setSelectedIds(new Set());
    } catch {
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, activeFilter, orgFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setFormData(initForm);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setModalMode('EDIT');
    setFormData({ 
      id: t.id, firstName: t.firstName, lastName: t.lastName, email: t.email, 
      employeeNumber: t.employeeNumber, phone: t.phone || '', active: t.active, 
      orgUnitId: t.orgUnitIds?.[0] || '' 
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet enseignant ? Cette action est irréversible.')) return;
    try {
      await fetchWithAuth(`/teachers/${id}`, { method: 'DELETE' });
      setToast({ message: 'Enseignant supprimé avec succès.', type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur lors de la suppression.', type: 'error' }); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Supprimer les ${selectedIds.size} enseignants sélectionnés ?`)) return;
    try {
      await fetchWithAuth(`/teachers/bulk-delete`, { 
        method: 'POST', body: JSON.stringify(Array.from(selectedIds))
      });
      setToast({ message: `${selectedIds.size} enseignants supprimés.`, type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur lors de la suppression groupée.', type: 'error' }); }
  };

  const handleBulkStatus = async (status: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      await fetchWithAuth(`/teachers/bulk-status`, { 
        method: 'POST', body: JSON.stringify({ ids: Array.from(selectedIds), active: status })
      });
      setToast({ message: `Statut mis à jour pour ${selectedIds.size} enseignants.`, type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur lors de la mise à jour groupée.', type: 'error' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);
    try {
      const url = modalMode === 'EDIT' ? `/teachers/${formData.id}` : `/teachers`;
      const method = modalMode === 'EDIT' ? 'PUT' : 'POST';
      await fetchWithAuth(url, {
        method,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          employeeNumber: formData.employeeNumber,
          phone: formData.phone,
          active: formData.active,
          orgUnitIds: formData.orgUnitId ? [formData.orgUnitId] : [],
        }),
      });
      setIsModalOpen(false);
      setToast({ message: modalMode === 'CREATE' ? 'Enseignant créé avec succès.' : 'Enseignant modifié avec succès.', type: 'success' });
      loadData();
    } catch (err: any) {
      setModalError(err.message || `Erreur lors de la ${modalMode === 'CREATE' ? 'création' : 'modification'}.`);
    } finally {
      setModalLoading(false);
    }
  };

  const getOrgUnitName = (id?: string) => {
    if (!id) return null;
    const unit = orgUnits.find(u => u.id === id);
    return unit ? unit.name : null;
  };

  const getInitials = (first: string, last: string) =>
    `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  const toggleSelectAll = () => {
    if (selectedIds.size === teachers.length && teachers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(teachers.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleExportCSV = () => {
    // Basic client-side CSV export logic
    const header = ['ID', 'Nom', 'Prénom', 'Email', 'Matricule', 'Téléphone', 'Statut', 'Unité'];
    const rows = teachers.map(t => [
      t.id, t.lastName, t.firstName, t.email, t.employeeNumber, t.phone, t.active ? 'Actif' : 'Inactif', getOrgUnitName(t.orgUnitIds?.[0]) || 'Non assigné'
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "enseignants.csv");
    link.click();
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setToast(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetchWithAuth('/teachers/import-csv', {
        method: 'POST',
        body: formData,
      });
      setToast({ message: `${res.data} enregistrements importés avec succès.`, type: 'success' });
      loadData();
    } catch (err) {
      setToast({ message: 'Erreur lors de l\'importation du fichier.', type: 'error' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-container">
      <nav className="breadcrumb">
        <span>Administration</span>
        <span className="breadcrumb-sep material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span>Ressources</span>
        <span className="breadcrumb-sep material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span className="breadcrumb-current">Enseignants</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Gestion des Enseignants</h1>
          <p className="page-subtitle">
            Corps enseignant de l'établissement • {totalElements} enseignant{totalElements !== 1 ? 's' : ''} enregistré{totalElements !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="page-header-actions">
          <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImportCSV} />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            <span className="material-symbols-outlined">{isImporting ? 'progress_activity' : 'upload'}</span> 
            {isImporting ? 'Importation...' : 'Importer CSV'}
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <span className="material-symbols-outlined">download</span>
            Exporter CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <span className="material-symbols-outlined">add</span>
            Nouvel Enseignant
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span className="material-symbols-outlined">error</span>
          <div>
            <strong>Erreur de chargement</strong><br />
            {error}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="filters-bar" style={{ display: 'flex', gap: 16, marginBottom: 24, background: '#fff', padding: 16, borderRadius: 12, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} className="search-box" style={{ flex: 1, minWidth: 250 }}>
          <span className="material-symbols-outlined search-box-icon">search</span>
          <input
            type="text"
            placeholder="Rechercher (nom, matricule, email)..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" style={{ display: 'none' }}></button>
        </form>
        
        <select className="form-select" style={{ width: 200, height: 40 }} value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(0); }}>
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actifs uniquement</option>
          <option value="INACTIVE">Inactifs uniquement</option>
        </select>

        <select className="form-select" style={{ width: 250, height: 40 }} value={orgFilter} onChange={e => { setOrgFilter(e.target.value); setPage(0); }}>
          <option value="">Tous les départements</option>
          {orgUnits.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {selectedIds.size > 0 && (
          <div className="bulk-actions-bar" style={{ background: 'var(--primary-light)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 500, color: 'var(--primary-dark)', flex: 1 }}>
              {selectedIds.size} enseignant{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => handleBulkStatus(true)}>Activer</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleBulkStatus(false)}>Désactiver</button>
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>Supprimer</button>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selectedIds.size === teachers.length && teachers.length > 0} onChange={toggleSelectAll} />
                </th>
                <th>Enseignant</th>
                <th>Email / Tél</th>
                <th>Matricule</th>
                <th>Département</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows size={size} />
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <span className="material-symbols-outlined">person_off</span>
                      </div>
                      <p className="empty-state-title">Aucun résultat</p>
                      <p className="empty-state-desc">Modifiez vos filtres ou ajoutez un nouvel enseignant.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map(teacher => {
                  const orgName = getOrgUnitName(teacher.orgUnitIds?.[0]);
                  return (
                    <tr key={teacher.id} className={selectedIds.has(teacher.id) ? 'selected-row' : ''}>
                      <td>
                        <input type="checkbox" checked={selectedIds.has(teacher.id)} onChange={() => toggleSelect(teacher.id)} />
                      </td>
                      <td>
                        <div className="cell-name">
                          <div className="cell-avatar">{getInitials(teacher.firstName, teacher.lastName)}</div>
                          <div><div className="cell-name-primary">{teacher.firstName} {teacher.lastName}</div></div>
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{teacher.email}</div>
                        {teacher.phone && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{teacher.phone}</div>}
                      </td>
                      <td>
                        {teacher.employeeNumber ? <span className="badge badge-gray" style={{ fontFamily: 'monospace' }}>{teacher.employeeNumber}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {orgName ? <span className="badge badge-blue">{orgName}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>Non assigné</span>}
                      </td>
                      <td>
                        {teacher.active ? <span className="badge badge-success">Actif</span> : <span className="badge badge-gray">Inactif</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(teacher)} title="Modifier"><span className="material-symbols-outlined">edit</span></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(teacher.id)} title="Supprimer"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {!loading && totalElements > 0 && (
          <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Affichage de {page * size + 1} à {Math.min((page + 1) * size, totalElements)} sur {totalElements}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Page {page + 1} sur {totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              
              <select className="form-select" style={{ width: 70, height: 32, padding: '0 8px', marginLeft: 16 }} value={size} onChange={e => { setSize(Number(e.target.value)); setPage(0); }}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{modalMode === 'CREATE' ? 'Nouvel Enseignant' : "Modifier l'Enseignant"}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div className="alert alert-error">
                    <span className="material-symbols-outlined">error</span>
                    {modalError}
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Prénom <span className="required">*</span></label>
                    <input type="text" required className="form-input" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom <span className="required">*</span></label>
                    <input type="text" required className="form-input" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Email <span className="required">*</span></label>
                    <input type="email" required disabled={modalMode === 'EDIT'} className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">N° Employé <span className="required">*</span></label>
                    <input type="text" required className="form-input" style={{ fontFamily: 'monospace' }} value={formData.employeeNumber} onChange={e => setFormData({ ...formData, employeeNumber: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select className="form-select" value={formData.active ? 'true' : 'false'} onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}>
                      <option value="true">Actif</option>
                      <option value="false">Inactif</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Unité d'organisation</label>
                  <select className="form-select" value={formData.orgUnitId} onChange={e => setFormData({ ...formData, orgUnitId: e.target.value })}>
                    <option value="">— Aucune assignation —</option>
                    {orgUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name} ({unit.type})</option>)}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'En cours...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /></div>}
    </div>
  );
}
