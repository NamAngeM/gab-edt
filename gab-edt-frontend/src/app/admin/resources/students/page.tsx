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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentNumber: string;
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

const studentSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("L'email est invalide").or(z.literal('')),
  studentNumber: z.string().min(1, "Le matricule est requis"),
  phone: z.string().optional(),
  active: z.boolean().optional(),
  orgUnitId: z.string().optional(),
});
type StudentFormValues = z.infer<typeof studentSchema>;

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
          <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ width: 80, height: 30, borderRadius: 6, marginLeft: 'auto' }} /></td>
        </tr>
      ))}
    </>
  );
}

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
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

  const form = useForm<StudentFormValues>({
    mode: "onTouched",
    resolver: zodResolver(studentSchema),
    defaultValues: {
      id: '', firstName: '', lastName: '', email: '', studentNumber: '', phone: '', active: true, orgUnitId: ''
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
        fetchWithAuth(`/students?${params.toString()}`),
        fetchWithAuth('/org-units'),
      ]);
      setStudents(extractArray(resData));
      const pageData = extractPageData(resData);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
      setOrgUnits(extractArray(orgUnitsRes));
      setSelectedIds(new Set());
    } catch {
      setError('Impossible de charger les données.');
    } finally { setLoading(false); }
  }, [page, size, search, activeFilter, orgFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(0); setSearch(searchInput); };

  const handleOpenCreate = () => { 
    setModalMode('CREATE'); 
    form.reset({
      id: '', firstName: '', lastName: '', email: '', studentNumber: '', phone: '', active: true, orgUnitId: ''
    }); 
    setModalError(''); 
    setIsModalOpen(true); 
  };

  const handleOpenEdit = (s: Student) => {
    setModalMode('EDIT');
    form.reset({ 
      id: s.id, 
      firstName: s.firstName, 
      lastName: s.lastName, 
      email: s.email, 
      studentNumber: s.studentNumber, 
      phone: s.phone || '', 
      active: s.active, 
      orgUnitId: s.orgUnitIds?.[0] || 'none' 
    });
    setModalError(''); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction('Supprimer cet étudiant ? Cette action est irréversible.'))) return;
    try {
      await fetchWithAuth(`/students/${id}`, { method: 'DELETE' });
      toast.success('Étudiant supprimé avec succès.');
      loadData();
    } catch { toast.error('Erreur lors de la suppression.'); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!(await confirmAction(`Supprimer les ${selectedIds.size} étudiants sélectionnés ?`))) return;
    try {
      await fetchWithAuth(`/students/bulk-delete`, { 
        method: 'POST', body: JSON.stringify(Array.from(selectedIds))
      });
      toast.success(`${selectedIds.size} étudiants supprimés.`);
      loadData();
    } catch { toast.error('Erreur lors de la suppression groupée.'); }
  };

  const handleBulkStatus = async (status: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      await fetchWithAuth(`/students/bulk-status`, { 
        method: 'POST', body: JSON.stringify({ ids: Array.from(selectedIds), active: status })
      });
      toast.success(`Statut mis à jour pour ${selectedIds.size} étudiants.`);
      loadData();
    } catch { toast.error('Erreur lors de la mise à jour groupée.'); }
  };

  const handleFormSubmit = async (data: StudentFormValues) => {
    setModalError('');
    try {
      const url = modalMode === 'EDIT' ? `/students/${data.id}` : `/students`;
      const method = modalMode === 'EDIT' ? 'PUT' : 'POST';
      await fetchWithAuth(url, {
        method,
        body: JSON.stringify({
          firstName: data.firstName, 
          lastName: data.lastName, 
          email: data.email,
          studentNumber: data.studentNumber, 
          phone: data.phone, 
          active: data.active,
          orgUnitIds: (data.orgUnitId && data.orgUnitId !== 'none') ? [data.orgUnitId] : [],
        }),
      });
      setIsModalOpen(false);
      toast.success(modalMode === 'CREATE' ? 'Étudiant créé.' : 'Étudiant modifié.');
      loadData();
    } catch (err: any) { setModalError(err.message || 'Erreur.'); }
  };

  const getOrgUnitName = (id?: string) => orgUnits.find(u => u.id === id)?.name || null;
  const getInitials = (first: string, last: string) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  const toggleSelectAll = () => {
    if (selectedIds.size === students.length && students.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(students.map(s => s.id)));
  };
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleExportCSV = () => {
    const header = ['ID', 'Nom', 'Prénom', 'Email', 'Matricule', 'Téléphone', 'Statut', 'Classe'];
    const rows = students.map(s => [s.id, s.lastName, s.firstName, s.email, s.studentNumber, s.phone, s.active ? 'Actif' : 'Inactif', getOrgUnitName(s.orgUnitIds?.[0]) || 'Non affecté']);
    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "etudiants.csv";
    link.click();
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetchWithAuth('/students/import-csv', {
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <nav className="breadcrumb">
        <span>Administration</span><span className="breadcrumb-sep material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span>Ressources</span><span className="breadcrumb-sep material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span className="breadcrumb-current">Étudiants</span>
      </nav>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Gestion des Étudiants</h1>
          <p className="page-subtitle">Apprenants inscrits • {totalElements} étudiant{totalElements !== 1 ? 's' : ''} enregistré{totalElements !== 1 ? 's' : ''}</p>
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
          <Button onClick={handleOpenCreate} className="bg-brand-600 hover:bg-brand-700">
            <span className="material-symbols-outlined mr-2 text-sm">add</span> Inscrire un étudiant
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
          <input type="text" placeholder="Rechercher (nom, matricule)..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          <button type="submit" style={{ display: 'none' }}></button>
        </form>
        <select className="form-select" style={{ width: 200, height: 40 }} value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(0); }}>
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actifs uniquement</option>
          <option value="INACTIVE">Inactifs uniquement</option>
        </select>
        <select className="form-select" style={{ width: 250, height: 40 }} value={orgFilter} onChange={e => { setOrgFilter(e.target.value); setPage(0); }}>
          <option value="">Toutes les classes</option>
          {orgUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {selectedIds.size > 0 && (
          <div className="bulk-actions-bar" style={{ background: 'var(--primary-light)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 500, color: 'var(--primary-dark)', flex: 1 }}>{selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}</span>
            <Button variant="outline" size="sm" onClick={() => handleBulkStatus(true)}>Activer</Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkStatus(false)}>Désactiver</Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Supprimer</Button>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === students.length && students.length > 0} onChange={toggleSelectAll} /></th>
                <th>Étudiant</th>
                <th>Email / Tél</th>
                <th>Matricule</th>
                <th>Classe</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows size={size} /> : students.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><span className="material-symbols-outlined">groups</span></div>
                    <p className="empty-state-title">Aucun résultat</p>
                    <p className="empty-state-desc">Modifiez vos filtres ou ajoutez un nouvel étudiant.</p>
                  </div>
                </td></tr>
              ) : students.map(student => (
                <tr key={student.id} className={selectedIds.has(student.id) ? 'selected-row' : ''}>
                  <td><input type="checkbox" checked={selectedIds.has(student.id)} onChange={() => toggleSelect(student.id)} /></td>
                  <td>
                    <div className="cell-name">
                      <div className="cell-avatar">{getInitials(student.firstName, student.lastName)}</div>
                      <div><div className="cell-name-primary">{student.firstName} {student.lastName}</div></div>
                    </div>
                  </td>
                  <td>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{student.email}</div>
                    {student.phone && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{student.phone}</div>}
                  </td>
                  <td>{student.studentNumber ? <span className="badge badge-gray" style={{ fontFamily: 'monospace' }}>{student.studentNumber}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{getOrgUnitName(student.orgUnitIds?.[0]) ? <span className="badge badge-purple">{getOrgUnitName(student.orgUnitIds?.[0])}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>Non affecté</span>}</td>
                  <td>{student.active ? <span className="badge badge-green">Actif</span> : <span className="badge badge-gray">Inactif</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(student)} title="Modifier"><span className="material-symbols-outlined">edit</span></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(student.id)} title="Supprimer"><span className="material-symbols-outlined">delete</span></button>
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
            <DialogTitle>{modalMode === 'CREATE' ? 'Nouvel Étudiant' : "Modifier l'Étudiant"}</DialogTitle>
          </DialogHeader>

          {modalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" disabled={modalMode === 'EDIT'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matricule *</FormLabel>
                      <FormControl>
                        <Input className="font-mono" {...field} />
                      </FormControl>
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
                          <SelectItem value="true">Actif</SelectItem>
                          <SelectItem value="false">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="orgUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe / Groupe</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="— Aucune affectation —" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">— Aucune affectation —</SelectItem>
                        {orgUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
