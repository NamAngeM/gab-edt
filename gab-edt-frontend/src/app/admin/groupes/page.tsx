"use client";

import { confirmAction } from "@/lib/confirm";
import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
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

const groupeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  type: z.string(),
  parentId: z.string().optional(),
  institutionId: z.string().min(1, "Institution ID est requis"),
});

type GroupeFormValues = z.infer<typeof groupeSchema>;

export default function GroupesAdminPage() {
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [modalError, setModalError] = useState('');

  const form = useForm<GroupeFormValues>({
    mode: "onTouched",
    resolver: zodResolver(groupeSchema),
    defaultValues: {
      id: '', name: '', type: 'CLASS', parentId: '', institutionId: ''
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
      setError("Erreur lors du chargement des groupes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Here we are interested in Levels -> Classes -> Groups
  const levels = orgUnits.filter(u => u.type === 'LEVEL');
  const getChildren = (parentId: string, types: string[]) => orgUnits.filter(u => u.parent && u.parent.id === parentId && types.includes(u.type));

  const handleOpenCreate = (parentId: string = '', type: string = 'CLASS') => {
    setModalMode('CREATE');
    form.reset({ 
      id: '', name: '', type, parentId, 
      institutionId: institutions.length > 0 ? institutions[0].id : '' 
    });
    setModalError(''); 
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction('Supprimer ce groupe / cette promotion ?'))) return;
    try {
      await fetchWithAuth(`/org-units/${id}`, { method: 'DELETE' });
      toast.success("Supprimé avec succès.");
      loadData();
    } catch { toast.error("Erreur de suppression."); }
  };

  const handleFormSubmit = async (data: GroupeFormValues) => {
    setModalError('');
    try {
      const url = modalMode === 'EDIT' ? `/org-units/${data.id}` : `/org-units`;
      await fetchWithAuth(url, {
        method: modalMode === 'EDIT' ? 'PUT' : 'POST',
        body: JSON.stringify({ 
          name: data.name, 
          type: data.type, 
          parentId: data.parentId || null, 
          institutionId: data.institutionId 
        })
      });
      setIsModalOpen(false);
      toast.success(modalMode === 'CREATE' ? 'Créé avec succès.' : 'Modifié avec succès.');
      loadData();
    } catch (err: any) {
      setModalError(err.message);
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
                  <Button variant="outline" size="sm" onClick={() => handleOpenCreate(level.id, 'CLASS')}>
                    + Promotion
                  </Button>
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
                                   <span className="material-symbols-outlined text-muted-foreground">school</span>
                                   <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cls.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <Button variant="ghost" size="sm" className="text-brand-600 hover:text-brand-700 h-8 px-2 text-xs" onClick={() => handleOpenCreate(cls.id, 'GROUP')}>+ Groupe</Button>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => handleDelete(cls.id)}>
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </Button>
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
                    <FormLabel>Nom du {getTypeLabel(form.getValues().type)} *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Informatique L3, Groupe 1..." {...field} />
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
