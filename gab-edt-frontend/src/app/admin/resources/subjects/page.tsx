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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";

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

const subjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom de la matière est requis"),
  code: z.string().optional(),
  orgUnitId: z.string().optional(),
});
type SubjectFormValues = z.infer<typeof subjectSchema>;

function SkeletonRows() {
  return (
    <>{[1,2,3,4].map(i => (
      <tr key={i}>
        <td style={{ width: 40, paddingRight: 0 }}>
          <div className="skeleton" style={{ width: 18, height: 18, borderRadius: 4 }} />
        </td>
        <td style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
            <div className="skeleton skeleton-text" style={{ width: '55%' }} />
          </div>
        </td>
        <td><div className="skeleton skeleton-text" style={{ width: '40%' }} /></td>
        <td><div className="skeleton skeleton-text" style={{ width: '30%' }} /></td>
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
  const [modalError, setModalError] = useState('');

  const form = useForm<SubjectFormValues>({
    mode: "onTouched",
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: '', name: '', code: '', orgUnitId: ''
    }
  });

  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const flatOrgUnits = buildFlatList(orgUnits);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });
      if (search) params.append('search', search);

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
  }, [page, pageSize, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenCreate = () => {
    setModalMode('CREATE'); 
    form.reset({ id: '', name: '', code: '', orgUnitId: '' }); 
    setModalError(''); 
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setModalMode('EDIT');
    form.reset({ 
      id: s.id, 
      name: s.name, 
      code: s.code || '', 
      orgUnitId: s.orgUnit?.id || 'none' 
    });
    setModalError(''); 
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    const header = ['ID', 'Nom', 'Code', 'Unité'];
    const rows = subjects.map(s => [
      s.id, s.name, s.code || '', s.orgUnit ? s.orgUnit.name : 'Globale'
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "matieres.csv");
    link.click();
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetchWithAuth('/subjects/import-csv', {
        method: 'POST',
        body: formData,
      });
      toast.success(`${res.data} enregistrements importés avec succès.`);
      loadData();
    } catch (err) {
      toast.error('Erreur lors de l\'importation du fichier.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction('Supprimer cette matière ? Cette action est irréversible.'))) return;
    try {
      await fetchWithAuth(`/subjects/${id}`, { method: 'DELETE' });
      toast.success('Matière supprimée avec succès.');
      loadData();
    } catch { toast.error('Erreur lors de la suppression.'); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!(await confirmAction(`Supprimer les ${selectedIds.size} matières sélectionnées ?`))) return;
    try {
      await fetchWithAuth(`/subjects/bulk-delete`, { 
        method: 'POST', body: JSON.stringify(Array.from(selectedIds))
      });
      toast.success(`${selectedIds.size} matières supprimées.`);
      loadData();
    } catch { toast.error('Erreur lors de la suppression groupée.'); }
  };

  const handleFormSubmit = async (data: SubjectFormValues) => {
    setModalError('');
    try {
      const url = modalMode === 'EDIT' ? `/subjects/${data.id}` : `/subjects`;
      const method = modalMode === 'EDIT' ? 'PUT' : 'POST';
      await fetchWithAuth(url, {
        method,
        body: JSON.stringify({
          name: data.name, 
          code: data.code,
          color: '#3B82F6',
          credits: 3,
          active: true,
          orgUnitId: (data.orgUnitId && data.orgUnitId !== 'none') ? data.orgUnitId : null,
        }),
      });
      setIsModalOpen(false);
      toast.success(modalMode === 'CREATE' ? 'Matière créée avec succès.' : 'Matière modifiée avec succès.');
      loadData();
    } catch (err: any) { setModalError(err.message || 'Erreur lors de la sauvegarde.'); }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === subjects.length && subjects.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subjects.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const filtered = subjects.filter(s =>
    `${s.name} ${s.code || ''} ${s.orgUnit?.name || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
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
            Catalogue pédagogique • {totalElements} matière{totalElements !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" onClick={loadData}>
            <span className="material-symbols-outlined mr-2 text-sm">refresh</span>
            Actualiser
          </Button>
          <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImportCSV} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            <span className="material-symbols-outlined mr-2 text-sm">{isImporting ? 'progress_activity' : 'upload'}</span> 
            {isImporting ? 'Importation...' : 'Importer CSV'}
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <span className="material-symbols-outlined mr-2 text-sm">download</span> Exporter CSV
          </Button>
          <Button onClick={handleOpenCreate} className="bg-brand-600 hover:bg-brand-700">
            <span className="material-symbols-outlined mr-2 text-sm">add</span>
            Nouvelle Matière
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total</span>
            <div className="stat-card-icon"><span className="material-symbols-outlined">menu_book</span></div>
          </div>
          <div className="stat-card-value">{totalElements}</div>
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

        {selectedIds.size > 0 && (
          <div className="bulk-actions-bar" style={{ background: 'var(--primary-light)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 500, color: 'var(--primary-dark)', flex: 1 }}>{selectedIds.size} matière{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}</span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Supprimer</Button>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} /></th>
                <th>Matière</th>
                <th>Code</th>
                <th>Unité organisationnelle</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows /> : filtered.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><span className="material-symbols-outlined">menu_book</span></div>
                    <p className="empty-state-title">{search ? 'Aucun résultat' : 'Aucune matière enregistrée'}</p>
                    <p className="empty-state-desc">{search ? `Aucune matière ne correspond à "${search}".` : 'Commencez par créer votre première matière.'}</p>
                    {!search && <Button onClick={handleOpenCreate} className="mt-4 bg-brand-600 hover:bg-brand-700"><span className="material-symbols-outlined mr-2 text-sm">add</span>Nouvelle Matière</Button>}
                  </div>
                </td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className={selectedIds.has(s.id) ? 'selected-row' : ''}>
                  <td><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} /></td>
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
          <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Affichage de {page * pageSize + 1} à {Math.min((page + 1) * pageSize, totalElements)} sur {totalElements}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}><span className="material-symbols-outlined">chevron_left</span></button>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Page {page + 1} sur {totalPages || 1}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}><span className="material-symbols-outlined">chevron_right</span></button>
              <select className="form-select" style={{ width: 70, height: 32, padding: '0 8px', marginLeft: 16 }} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{modalMode === 'CREATE' ? 'Nouvelle Matière' : 'Modifier la Matière'}</DialogTitle>
          </DialogHeader>

          {modalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la matière *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Programmation Avancée & Algorithmique" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code (optionnel)</FormLabel>
                    <FormControl>
                      <Input className="font-mono" placeholder="Ex: ELC3, INFO-101..." {...field} />
                    </FormControl>
                    <p className="text-[13px] text-muted-foreground mt-1">Identifiant court utilisé dans les emplois du temps et les exports.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orgUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité Organisationnelle (optionnel)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="— Globale à l'établissement —" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">— Globale à l'établissement —</SelectItem>
                        {flatOrgUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[13px] text-muted-foreground mt-1">Laissez vide pour une matière accessible à toute l'institution.</p>
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
    </div>
  );
}
