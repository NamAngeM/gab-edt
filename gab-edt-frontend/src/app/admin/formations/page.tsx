"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth, API_URL } from '@/lib/api';
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const formationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  type: z.string(),
  parentId: z.string().optional(),
  institutionId: z.string().min(1, "Institution ID est requis"),
});

type FormationFormValues = z.infer<typeof formationSchema>;

export default function FormationsAdminPage() {
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [modalError, setModalError] = useState('');

  const form = useForm<FormationFormValues>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      id: '', name: '', type: 'PROGRAM', parentId: '', institutionId: ''
    }
  });

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
  const programs = formations.filter(u => u.type === 'PROGRAM');
  const getChildren = (parentId: string) => formations.filter(u => u.parent && u.parent.id === parentId);

  const handleOpenCreate = (parentId: string = '', type: string = 'PROGRAM') => {
    setModalMode('CREATE');
    form.reset({ 
      id: '', name: '', type, parentId, 
      institutionId: institutions.length > 0 ? institutions[0].id : '' 
    });
    setModalError(''); 
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const res = await fetch(`${API_URL}/org-units/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      if (!res.ok) throw new Error("Erreur");
      toast.success("Supprimé avec succès.");
      loadData();
    } catch { toast.error("Erreur de suppression."); }
  };

  const handleFormSubmit = async (data: FormationFormValues) => {
    setModalError('');
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const url = modalMode === 'EDIT' ? `${API_URL}/org-units/${data.id}` : `${API_URL}/org-units`;
      const res = await fetch(url, {
        method: modalMode === 'EDIT' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          name: data.name, 
          type: data.type, 
          parentId: data.parentId || null, 
          institutionId: data.institutionId 
        })
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      setIsModalOpen(false);
      toast.success(modalMode === 'CREATE' ? 'Créé avec succès.' : 'Modifié avec succès.');
      loadData();
    } catch (err: any) {
      setModalError(err.message);
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
        <Button className="bg-brand-600 hover:bg-brand-700" onClick={() => handleOpenCreate('', 'PROGRAM')}>
          <span className="material-symbols-outlined mr-2 text-sm">add</span> Ajouter une Filière
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des formations...</div>
      ) : programs.length === 0 ? (
        <div style={{ background: 'var(--surface-container)', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Aucune filière n'a encore été créée.</p>
          <Button variant="outline" className="text-brand-600 border-brand-600 hover:bg-brand-50" onClick={() => handleOpenCreate('', 'PROGRAM')}>Créer la première Filière</Button>
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
                  <Button variant="outline" size="sm" onClick={() => handleOpenCreate(prog.id, 'CYCLE')}>+ Sous-cycle</Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenCreate(prog.id, 'LEVEL')}>+ Niveau direct</Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(prog.id)}>
                     <span className="material-symbols-outlined text-[18px]">delete</span>
                  </Button>
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
                         {child.type === 'CYCLE' && <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleOpenCreate(child.id, 'LEVEL')}>+ Niveau</Button>}
                         <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive px-2" onClick={() => handleDelete(child.id)}>Supprimer</Button>
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
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive px-2" onClick={() => handleDelete(grandchild.id)}>Supprimer</Button>
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
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'CREATE' ? 'Ajouter: ' : 'Modifier: '}
              {getTypeLabel(form.getValues().type)}
            </DialogTitle>
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
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Informatique, Cycle Ingénieur, Licence 1..." {...field} />
                    </FormControl>
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
