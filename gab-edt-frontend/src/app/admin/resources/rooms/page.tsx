"use client";

import { confirmAction } from "@/lib/confirm";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchWithAuth, extractArray, extractPageData } from '@/lib/api';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: string;
  active: boolean;
  orgUnitId?: string;
  equipments?: string[];
}

interface OrgUnit { id: string; name: string; type: string; }

type ModalMode = 'CREATE' | 'EDIT';

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

const roomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom de la salle est requis"),
  code: z.string().min(1, "Le code est requis"),
  capacity: z.coerce.number().min(1, "La capacité doit être > 0"),
  type: z.string().min(1, "Le type est requis"),
  active: z.boolean().optional(),
  orgUnitId: z.string().optional(),
  equipments: z.string().optional(), // String temporaire pour l'input séparé par virgules
});

type RoomFormValues = z.infer<typeof roomSchema>;

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
  const [modalError, setModalError] = useState('');

  // Search Available Rooms
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [searchStartHour, setSearchStartHour] = useState('08:00');
  const [searchEndHour, setSearchEndHour] = useState('10:00');
  const [availableRooms, setAvailableRooms] = useState<Room[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const form = useForm<RoomFormValues>({
    mode: "onTouched",
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      id: '', name: '', code: '', capacity: 30, type: 'CLASSROOM', active: true, orgUnitId: '', equipments: ''
    }
  });

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
      setRooms(extractArray(resData));
      const pageData = extractPageData(resData);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
      setOrgUnits(extractArray(orgUnitsRes));
      setSelectedIds(new Set());
    } catch { setError('Impossible de charger les données.'); }
    finally { setLoading(false); }
  }, [page, size, search, activeFilter, orgFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(0); setSearch(searchInput); };

  const handleOpenCreate = () => {
    setModalMode('CREATE'); 
    form.reset({
      id: '', name: '', code: '', capacity: 30, type: 'CLASSROOM', active: true, orgUnitId: '', equipments: ''
    }); 
    setModalError(''); 
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setModalMode('EDIT');
    form.reset({ 
      id: r.id, 
      name: r.name, 
      code: r.code, 
      capacity: r.capacity, 
      type: r.type || 'CLASSROOM', 
      active: r.active !== undefined ? r.active : true, 
      orgUnitId: r.orgUnitId || 'none',
      equipments: (r.equipments || []).join(', ')
    });
    setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction('Supprimer cette salle ? Cette action est irréversible.'))) return;
    try {
      await fetchWithAuth(`/rooms/${id}`, { method: 'DELETE' });
      toast.success('Salle supprimée avec succès.');
      loadData();
    } catch { toast.error('Erreur lors de la suppression.'); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!(await confirmAction(`Supprimer les ${selectedIds.size} salles sélectionnées ?`))) return;
    try {
      await fetchWithAuth(`/rooms/bulk-delete`, { 
        method: 'POST', body: JSON.stringify(Array.from(selectedIds))
      });
      toast.success(`${selectedIds.size} salles supprimées.`);
      loadData();
    } catch { toast.error('Erreur lors de la suppression groupée.'); }
  };

  const handleBulkStatus = async (status: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      await fetchWithAuth(`/rooms/bulk-status`, { 
        method: 'POST', body: JSON.stringify({ ids: Array.from(selectedIds), active: status })
      });
      toast.success(`Statut mis à jour pour ${selectedIds.size} salles.`);
      loadData();
    } catch { toast.error('Erreur.'); }
  };

  const handleFormSubmit = async (data: RoomFormValues) => {
    setModalError('');
    try {
      const url = modalMode === 'EDIT' ? `/rooms/${data.id}` : `/rooms`;
      const method = modalMode === 'EDIT' ? 'PUT' : 'POST';
      await fetchWithAuth(url, {
        method,
        body: JSON.stringify({
          name: data.name,
          code: data.code,
          capacity: Number(data.capacity),
          type: data.type,
          active: data.active,
          orgUnitId: (data.orgUnitId && data.orgUnitId !== 'none') ? data.orgUnitId : null,
          equipments: data.equipments ? data.equipments.split(',').map(s => s.trim()).filter(s => s) : []
        }),
      });
      setIsModalOpen(false);
      toast.success(modalMode === 'CREATE' ? 'Salle créée avec succès.' : 'Salle modifiée avec succès.');
      loadData();
    } catch (err: any) { setModalError(err.message || 'Erreur lors de la sauvegarde.'); }
  };

  const handleSearchAvailableRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDate || !searchStartHour || !searchEndHour) return;
    setSearchLoading(true);
    try {
      const start = `${searchDate}T${searchStartHour}:00`;
      const end = `${searchDate}T${searchEndHour}:00`;
      const res = await fetchWithAuth(`/rooms/available?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      setAvailableRooms(extractArray(res));
    } catch {
      toast.error('Erreur lors de la recherche.');
    } finally {
      setSearchLoading(false);
    }
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
    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(","))
      .join("\n");
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetchWithAuth('/rooms/import-csv', {
        method: 'POST',
        body: formData,
      });
      toast.success(`${res.data} salles importées avec succès.`);
      loadData();
    } catch (err) {
      toast.error('Erreur lors de l\'importation du fichier.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
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
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            <span className="material-symbols-outlined mr-2 text-sm">{isImporting ? 'progress_activity' : 'upload'}</span> 
            {isImporting ? 'Importation...' : 'Importer CSV'}
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <span className="material-symbols-outlined mr-2 text-sm">download</span> Exporter CSV
          </Button>
          <Button variant="secondary" onClick={() => { setIsSearchModalOpen(true); setAvailableRooms(null); }} className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-200">
            <span className="material-symbols-outlined mr-2 text-sm">search</span> Salles Libres
          </Button>
          <Button onClick={handleOpenCreate} className="bg-brand-600 hover:bg-brand-700">
            <span className="material-symbols-outlined mr-2 text-sm">add</span> Ajouter une salle
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span className="material-symbols-outlined">error</span>
          <div><strong>Erreur</strong><br />{error}</div>
        </div>
      )}

      <div className="filters-bar" style={{ display: 'flex', gap: 16, marginBottom: 24, background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
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
            <Button variant="outline" size="sm" onClick={() => handleBulkStatus(true)}>Activer</Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkStatus(false)}>Désactiver</Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Supprimer</Button>
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
                <th>Équipements</th>
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
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {room.equipments && room.equipments.length > 0 ? (
                        room.equipments.map((eq, i) => <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>{eq}</span>)
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </div>
                  </td>
                  <td>{getOrgUnitName(room.orgUnitId) ? <span className="badge badge-gray">{getOrgUnitName(room.orgUnitId)}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>Non assignée</span>}</td>
                  <td>{room.active !== false ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>}</td>
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

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{modalMode === 'CREATE' ? 'Nouvelle Salle' : 'Modifier la Salle'}</DialogTitle>
          </DialogHeader>

          {modalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Form {...form}>
            {form.formState.submitCount > 0 && Object.keys(form.formState.errors).length > 0 && (
              <div role="alert" className="alert alert-error">
                <div>
                  <strong>Corrigez les points suivants :</strong>
                  <ul className="mt-1 list-disc pl-4">
                    {Object.values(form.formState.errors).map((e, i) => (e?.message ? <li key={i}>{String(e.message)}</li> : null))}
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la salle *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Amphi Vion, Salle B204..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code *</FormLabel>
                      <FormControl>
                        <Input className="font-mono" placeholder="Ex: AMPH-01..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité (places)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de salle</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select 
                        onValueChange={(v) => field.onChange(v === 'true')} 
                        value={field.value ? 'true' : 'false'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="equipments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipements (séparés par des virgules)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Vidéoprojecteur, PC, Tableau blanc..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orgUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignation (Unité d'organisation)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="— Aucune assignation —" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">— Aucune assignation —</SelectItem>
                        {orgUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[13px] text-muted-foreground mt-1">Département ou bâtiment auquel est rattachée la salle.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-brand-600 hover:bg-brand-700">
                  {form.formState.isSubmitting ? 'En cours...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal: Rechercher une salle libre */}
      <Dialog open={isSearchModalOpen} onOpenChange={(open) => !open && setIsSearchModalOpen(false)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Rechercher une salle libre</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSearchAvailableRooms} className="flex gap-4 items-end mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex-1">
              <FormLabel className="mb-1 block text-sm">Date</FormLabel>
              <Input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} required />
            </div>
            <div>
              <FormLabel className="mb-1 block text-sm">Heure de début</FormLabel>
              <Input type="time" value={searchStartHour} onChange={e => setSearchStartHour(e.target.value)} required />
            </div>
            <div>
              <FormLabel className="mb-1 block text-sm">Heure de fin</FormLabel>
              <Input type="time" value={searchEndHour} onChange={e => setSearchEndHour(e.target.value)} required />
            </div>
            <Button type="submit" disabled={searchLoading} className="bg-brand-600 hover:bg-brand-700">
              {searchLoading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </form>

          {availableRooms && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">Résultats ({availableRooms.length} salle{availableRooms.length > 1 ? 's' : ''})</h3>
              </div>
              <div className="max-h-[350px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {availableRooms.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">event_busy</span>
                    <p className="text-gray-600 font-medium">Aucune salle disponible pour ce créneau.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availableRooms.map(room => (
                      <div key={room.id} className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col hover:border-brand-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-gray-900">{room.name}</div>
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{room.code}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                          <span className="material-symbols-outlined text-[16px]">people</span>
                          <span>{room.capacity} places</span>
                          <span className="mx-1">•</span>
                          <span className={`badge ${ROOM_TYPE_BADGES[room.type] || 'badge-gray'} !text-[10px] !py-0`}>{ROOM_TYPE_LABELS[room.type] || room.type}</span>
                        </div>
                        
                        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="flex flex-wrap gap-1">
                            {room.equipments && room.equipments.length > 0 ? (
                              room.equipments.map((eq, i) => <span key={i} className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{eq}</span>)
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">Aucun équipement</span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-slate-900 hover:bg-slate-800 h-7 text-xs px-3 shadow-none ml-2 shrink-0"
                            onClick={() => {
                              window.location.href = `/admin/timetable?action=new&roomId=${room.id}&date=${searchDate}&start=${searchStartHour}&end=${searchEndHour}`;
                            }}
                          >
                            Réserver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
