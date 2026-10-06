"use client";

import { confirmAction } from "@/lib/confirm";
import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
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

const ORG_TYPES = [
  'CAMPUS', 'FACULTY', 'DEPARTMENT', 'PROGRAM', 'CYCLE', 
  'YEAR', 'LEVEL', 'SERIES', 'CLASS', 'GROUP', 'OPTION', 'SPECIALTY'
];

const orgUnitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  parentId: z.string().optional(),
  institutionId: z.string().min(1, "Institution ID est requis"),
});
type OrgUnitFormValues = z.infer<typeof orgUnitSchema>;

export default function OrganisationAdminPage() {
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [modalError, setModalError] = useState('');
  
  const form = useForm<OrgUnitFormValues>({
    mode: "onTouched",
    resolver: zodResolver(orgUnitSchema),
    defaultValues: { id: '', name: '', type: 'CAMPUS', parentId: '', institutionId: '' }
  });

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
    form.reset({ id: '', name: '', type: 'DEPARTMENT', parentId, institutionId });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (node: any, institutionId: string) => {
    setModalMode('EDIT');
    form.reset({ id: node.id, name: node.name, type: node.type, parentId: '', institutionId });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction('Êtes-vous sûr de vouloir supprimer cette unité ? (Les sous-unités pourraient être affectées)'))) return;
    
    try {
      await fetchWithAuth(`/org-units/${id}`, { method: 'DELETE' });
      toast.success('Unité supprimée avec succès.');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  const handleFormSubmit = async (data: OrgUnitFormValues) => {
    setModalError('');
    
    try {
      let url = `/org-units`;
      let method = 'POST';

      if (modalMode === 'EDIT') {
        url = `/org-units/${data.id}`;
        method = 'PUT';
      }

      await fetchWithAuth(url, {
        method,
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          parentId: data.parentId || null,
          institutionId: data.institutionId
        })
      });

      setIsModalOpen(false);
      toast.success(modalMode === 'CREATE' ? 'Unité créée avec succès.' : 'Unité modifiée avec succès.');
      loadData();
    } catch (err) {
      setModalError(`Erreur lors de la ${modalMode === 'CREATE' ? 'création' : 'modification'}.`);
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Organisation Pédagogique</h1>
          <p className="page-description">
            Gérez l'arborescence de votre établissement.
          </p>
        </div>
        {tree?.institution?.id && (
          <Button className="bg-brand-600 hover:bg-brand-700" onClick={() => handleOpenCreate('', tree.institution.id)}>
            <span className="material-symbols-outlined mr-2 text-sm">add</span> Unité Racine
          </Button>
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
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modalMode === 'CREATE' ? 'Créer une Unité' : "Modifier l'Unité"}</DialogTitle>
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
                      <Input placeholder="Ex: Département Mathématiques" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'Unité *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORG_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
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
