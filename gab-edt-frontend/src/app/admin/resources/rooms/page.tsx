"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchWithAuth, API_URL } from '@/lib/api';

interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: string;
  active: boolean;
  orgUnitId?: string;
}

interface OrgUnit { id: string; name: string; type: string; }

type ModalMode = 'CREATE' | 'EDIT';
const initForm = { id: '', name: '', code: '', capacity: 30, type: 'CLASSROOM', active: true, orgUnitId: '' };

const ROOM_TYPE_LABELS: Record<string, string> = {
  CLASSROOM: 'Salle de cours',
  AMPHITHEATER: 'Amphithéâtre',
  LABORATORY: 'Laboratoire (TP)',
  COMPUTER_ROOM: 'Salle Informatique',
  MEETING_ROOM: 'Salle de Réunion',
};

const ROOM_TYPE_BADGES: Record<string, string> = {
  CLASSROOM: 'badge-gray',
  AMPHITHEATER: 'badge-blue',
  LABORATORY: 'badge-orange',
  COMPUTER_ROOM: 'badge-purple',
  MEETING_ROOM: 'badge-info',
};

const ROOM_TYPE_ICONS: Record<string, string> = {
  CLASSROOM: 'meeting_room',
  AMPHITHEATER: 'stadium',
  LABORATORY: 'science',
  COMPUTER_ROOM: 'computer',
  MEETING_ROOM: 'groups',
};

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

function SkeletonRows({ size }: { size: number }) {
  return (
    <>{Array.from({ length: size }).map((_, i) => (
      <tr key={i}>
        <td style={{ padding: '16px 24px', width: 40 }}><div className="skeleton" style={{ width: 18, height: 18, borderRadius: 4 }} /></td>
        <td style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: 6 }} />
              <div className="skeleton skeleton-text" style={{ width: '30%', height: 12 }} />
            </div>
          </div>
        </td>
        <td><div className="skeleton skeleton-text" style={{ width: '40%' }} /></td>
        <td><div className="skeleton skeleton-text" style={{ width: '55%' }} /></td>
        <td><div className="skeleton skeleton-text" style={{ width: '40%' }} /></td>
        <td><div className="skeleton skeleton-text" style={{ width: '40%' }} /></td>
        <td style={{ textAlign: 'right' }}>
          <div className="skeleton" style={{ width: 80, height: 30, borderRadius: 6, marginLeft: 'auto' }} />
        </td>
      </tr>
    ))}</>
  );
}

export default function RoomsAdminPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
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
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (search) params.append('search', search);
      if (activeFilter !== 'ALL') params.append('active', activeFilter === 'ACTIVE' ? 'true' : 'false');
      if (orgFilter) params.append('orgUnitId', orgFilter);

      const [resData, orgUnitsRes] = await Promise.all([
        fetchWithAuth(`/rooms?${params.toString()}`),
        fetchWithAuth('/org-units'),
      ]);
      setRooms(resData.data?.content || []);
      setTotalElements(resData.data?.totalElements || 0);
      setTotalPages(resData.data?.totalPages || 1);
      setOrgUnits(orgUnitsRes || []);
      setSelectedIds(new Set());
    } catch { setError('Impossible de charger les données.'); }
    finally { setLoading(false); }
  }, [page, size, search, activeFilter, orgFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(0); setSearch(searchInput); };

  const handleOpenCreate = () => {
    setModalMode('CREATE'); setFormData(initForm); setModalError(''); setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setModalMode('EDIT');
    setFormData({ id: r.id, name: r.name, code: r.code, capacity: r.capacity, type: r.type || 'CLASSROOM', active: r.active !== undefined ? r.active : true, orgUnitId: r.orgUnitId || '' });
    setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette salle ? Cette action est irréversible.')) return;
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const res = await fetch(`${API_URL}/rooms/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setToast({ message: 'Salle supprimée avec succès.', type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur lors de la suppression.', type: 'error' }); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Supprimer les ${selectedIds.size} salles sélectionnées ?`)) return;
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const res = await fetch(`${API_URL}/rooms/bulk-delete`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(Array.from(selectedIds))
      });
      if (!res.ok) throw new Error();
      setToast({ message: `${selectedIds.size} salles supprimées.`, type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur lors de la suppression groupée.', type: 'error' }); }
  };

  const handleBulkStatus = async (status: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const res = await fetch(`${API_URL}/rooms/bulk-status`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ids: Array.from(selectedIds), active: status })
      });
      if (!res.ok) throw new Error();
      setToast({ message: `Statut mis à jour pour ${selectedIds.size} salles.`, type: 'success' });
      loadData();
    } catch { setToast({ message: 'Erreur.', type: 'error' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setModalError(''); setModalLoading(true);
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const url = modalMode === 'EDIT' ? `${API_URL}/rooms/${formData.id}` : `${API_URL}/rooms`;
      const method = modalMode === 'EDIT' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          capacity: Number(formData.capacity),
          type: formData.type,
          active: formData.active,
          orgUnitId: formData.orgUnitId || null,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Erreur API'); }
      setIsModalOpen(false);
      setToast({ message: modalMode === 'CREATE' ? 'Salle créée avec succès.' : 'Salle modifiée avec succès.', type: 'success' });
      loadData();
    } catch (err: any) { setModalError(err.message || 'Erreur lors de la sauvegarde.'); }
    finally { setModalLoading(false); }
  };

  const getOrgUnitName = (id?: string) => orgUnits.find(u => u.id === id)?.name || null;

  const toggleSelectAll = () => {
    if (selectedIds.size === rooms.length && rooms.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(rooms.map(r => r.id)));
  };
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleExportCSV = () => {
    const header = ['ID', 'Nom', 'Code', 'Capacité', 'Type', 'Statut', 'Assignation'];
    const rows = rooms.map(r => [
      r.id, r.name, r.code, r.capacity, ROOM_TYPE_LABELS[r.type] || r.type, r.active ? 'Actif' : 'Inactif', getOrgUnitName(r.orgUnitId) || 'Non assigné'
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "salles.csv";
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
      const res = await fetchWithAuth('/rooms/import-csv', {
        method: 'POST',
        body: formData,
      });
      setToast({ message: `${res.data} salles importées avec succès.`, type: 'success' });
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
        <span>Administration</span><span className="breadcrumb-sep material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span>Ressources</span><span className="breadcrumb-sep material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span className="breadcrumb-current">Salles & Équipements</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Salles & Équipements</h1>
          <p className="page-subtitle">Parc immobilier pédagogique • {totalElements} espace{totalElements !== 1 ? 's' : ''} répertorié{totalElements !== 1 ? 's' : ''}</p>
        </div>
        <div className="page-header-actions">
          <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImportCSV} />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            <span className="material-symbols-outlined">{isImporting ? 'progress_activity' : 'upload'}</span> 
            {isImporting ? 'Importation...' : 'Importer CSV'}
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}><span className="material-symbols-outlined">download</span> Exporter CSV</button>
          <button className="btn btn-primary" onClick={handleOpenCreate}><span className="material-symbols-outlined">add</span> Ajouter une salle</button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}><span className="material-symbols-outlined">error</span><div><strong>Erreur</strong><br />{error}</div></div>}

      <div className="filters-bar" style={{ display: 'flex', gap: 16, marginBottom: 24, background: '#fff', padding: 16, borderRadius: 12, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} className="search-box" style={{ flex: 1, minWidth: 250 }}>
          <span className="material-symbols-outlined search-box-icon">search</span>
          <input type="text" placeholder="Rechercher (nom, code)..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          <button type="submit" style={{ display: 'none' }}></button>
        </form>
        <select className="form-select" style={{ width: 200, height: 40 }} value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(0); }}>
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actives uniquement</option>
          <option value="INACTIVE">Inactives uniquement</option>
        </select>
        <select className="form-select" style={{ width: 250, height: 40 }} value={orgFilter} onChange={e => { setOrgFilter(e.target.value); setPage(0); }}>
          <option value="">Tous les départements</option>
          {orgUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {selectedIds.size > 0 && (
          <div className="bulk-actions-bar" style={{ background: 'var(--primary-light)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 500, color: 'var(--primary-dark)', flex: 1 }}>{selectedIds.size} salle{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => handleBulkStatus(true)}>Activer</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleBulkStatus(false)}>Désactiver</button>
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>Supprimer</button>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === rooms.length && rooms.length > 0} onChange={toggleSelectAll} /></th>
                <th>Salle & Code</th>
                <th>Typologie</th>
                <th>Capacité</th>
                <th>Assignation</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows size={size} /> : rooms.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><span className="material-symbols-outlined">meeting_room</span></div>
                    <p className="empty-state-title">Aucun résultat</p>
                    <p className="empty-state-desc">Modifiez vos filtres ou ajoutez une nouvelle salle.</p>
                  </div>
                </td></tr>
              ) : rooms.map(room => (
                <tr key={room.id} className={selectedIds.has(room.id) ? 'selected-row' : ''}>
                  <td><input type="checkbox" checked={selectedIds.has(room.id)} onChange={() => toggleSelect(room.id)} /></td>
                  <td>
                    <div className="cell-name">
                      <div className="cell-avatar-icon"><span className="material-symbols-outlined">{ROOM_TYPE_ICONS[room.type] || 'meeting_room'}</span></div>
                      <div>
                        <div className="cell-name-primary">{room.name}</div>
                        <div className="cell-name-secondary" style={{ fontFamily: 'monospace' }}>{room.code}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${ROOM_TYPE_BADGES[room.type] || 'badge-gray'}`}>{ROOM_TYPE_LABELS[room.type] || room.type}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-muted)' }}>people</span>
                      <span style={{ fontWeight: 600 }}>{room.capacity}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>places</span>
                    </div>
                  </td>
                  <td>{getOrgUnitName(room.orgUnitId) ? <span className="badge badge-gray">{getOrgUnitName(room.orgUnitId)}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>Non assignée</span>}</td>
                  <td>{room.active !== false ? <span className="badge badge-success">Active</span> : <span className="badge badge-gray">Inactive</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(room)} title="Modifier"><span className="material-symbols-outlined">edit</span></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(room.id)} title="Supprimer"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && totalElements > 0 && (
          <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Affichage de {page * size + 1} à {Math.min((page + 1) * size, totalElements)} sur {totalElements}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}><span className="material-symbols-outlined">chevron_left</span></button>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Page {page + 1} sur {totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}><span className="material-symbols-outlined">chevron_right</span></button>
              <select className="form-select" style={{ width: 70, height: 32, padding: '0 8px', marginLeft: 16 }} value={size} onChange={e => { setSize(Number(e.target.value)); setPage(0); }}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{modalMode === 'CREATE' ? 'Nouvelle Salle' : 'Modifier la Salle'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {modalError && <div className="alert alert-error"><span className="material-symbols-outlined">error</span>{modalError}</div>}
                <div className="form-group">
                  <label className="form-label">Nom de la salle <span className="required">*</span></label>
                  <input type="text" required className="form-input" placeholder="Ex: Amphi Vion, Salle B204..." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Code <span className="required">*</span></label>
                    <input type="text" required className="form-input" placeholder="Ex: AMPH-01..." style={{ fontFamily: 'monospace' }} value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacité (places)</label>
                    <input type="number" required min="1" className="form-input" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Type de salle</label>
                    <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                      {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select className="form-select" value={formData.active ? 'true' : 'false'} onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assignation (Unité d'organisation)</label>
                  <select className="form-select" value={formData.orgUnitId} onChange={e => setFormData({ ...formData, orgUnitId: e.target.value })}>
                    <option value="">— Aucune assignation —</option>
                    {orgUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name} ({unit.type})</option>)}
                  </select>
                  <p className="form-hint">Département ou bâtiment auquel est rattachée la salle.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>{modalLoading ? 'En cours...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /></div>}
    </div>
  );
}
