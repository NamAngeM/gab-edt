"use client";

import React, { useState, useEffect } from 'react';
import { fetchWithAuth, extractArray } from '@/lib/api';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const announcementSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  targetAudience: z.string(),
  validUntil: z.string().optional(),
  authorId: z.string().min(1, "L'auteur est requis"),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AnnoncesPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const form = useForm<AnnouncementFormValues>({
    mode: "onTouched",
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '', content: '', targetAudience: 'ALL', validUntil: '', authorId: ''
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [annRes, tRes] = await Promise.all([
        fetchWithAuth('/communication/announcements'),
        fetchWithAuth('/teachers')
      ]);
      setAnnouncements(extractArray(annRes));
      setTeachers(extractArray(tRes));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    form.reset({ title: '', content: '', targetAudience: 'ALL', validUntil: '', authorId: '' });
    setShowAddModal(true);
  };

  const handleAdd = async (data: AnnouncementFormValues) => {
    try {
      const body = { ...data } as Record<string, any>;
      Object.keys(body).forEach(key => {
        if (body[key] === '') body[key] = null;
      });
      await fetchWithAuth('/communication/announcements', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setShowAddModal(false);
      toast.success('Annonce publiée avec succès');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="breadcrumb">
        <span>Communication & Événements</span>
        <span className="breadcrumb-sep material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="breadcrumb-current">Annonces & Actualités</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Annonces & Actualités</h1>
          <p className="page-subtitle">Communiquez avec les étudiants, professeurs et le personnel.</p>
        </div>
        <div className="page-header-right">
          <Button className="bg-brand-600 hover:bg-brand-700" onClick={handleOpenAdd}>
            <span className="material-symbols-outlined mr-2 text-sm">campaign</span>
            Nouvelle Annonce
          </Button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="skeleton skeleton-row" />
            <p>Chargement des annonces...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">forum</span>
            <h3>Aucune annonce</h3>
            <p>Créez votre première annonce pour informer l'établissement.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Cible</th>
                  <th>Valide Jusqu'au</th>
                  <th>Auteur</th>
                  <th>Date de publication</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.title}</td>
                    <td>
                      <span className={`badge ${a.targetAudience === 'ALL' ? 'badge-primary' : 'badge-orange'}`}>
                        {a.targetAudience}
                      </span>
                    </td>
                    <td>{a.validUntil || 'Illimité'}</td>
                    <td>{a.authorName}</td>
                    <td className="text-mono">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={(open) => !open && setShowAddModal(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer une Annonce</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'annonce *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fermeture exceptionnelle..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu *</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4} 
                        placeholder="Le contenu de votre annonce..." 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audience Cible</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ALL">Tous</SelectItem>
                          <SelectItem value="STUDENTS">Étudiants</SelectItem>
                          <SelectItem value="TEACHERS">Enseignants</SelectItem>
                          <SelectItem value="STAFF">Personnel / Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valide jusqu'au</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="authorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auteur (Professeur/Admin) *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un auteur..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers.map(t => (
                          <SelectItem key={t.id} value={t.user.id}>
                            {t.user.firstName} {t.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-brand-600 hover:bg-brand-700">
                  {form.formState.isSubmitting ? 'Publication...' : 'Publier'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
