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
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().min(1, "La date de fin est requise"),
  holiday: z.boolean().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EvenementsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '', description: '', startDate: '', endDate: '', holiday: false
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/communication/events');
      setEvents(extractArray(res));
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    form.reset({ title: '', description: '', startDate: '', endDate: '', holiday: false });
    setShowAddModal(true);
  };

  const handleAdd = async (data: EventFormValues) => {
    try {
      await fetchWithAuth('/communication/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setShowAddModal(false);
      toast.success('Événement créé avec succès');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création');
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="breadcrumb">
        <span>Communication & Événements</span>
        <span className="breadcrumb-sep material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="breadcrumb-current">Événements Académiques</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Événements Académiques</h1>
          <p className="page-subtitle">Gérez le calendrier institutionnel (vacances, séminaires, jours fériés).</p>
        </div>
        <div className="page-header-right">
          <Button className="bg-brand-600 hover:bg-brand-700" onClick={handleOpenAdd}>
            <span className="material-symbols-outlined mr-2 text-sm">event</span>
            Nouvel Événement
          </Button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            <p>Chargement des événements...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">calendar_month</span>
            <h3>Aucun événement</h3>
            <p>Ajoutez des événements académiques à votre calendrier.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Dates (Début - Fin)</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td className="font-medium">{ev.title}</td>
                    <td className="text-mono">
                      {formatDateTime(ev.startDate)} - {formatDateTime(ev.endDate)}
                    </td>
                    <td>
                      {ev.holiday ? (
                        <span className="badge badge-error">Congés / Vacances</span>
                      ) : (
                        <span className="badge badge-primary">Institutionnel</span>
                      )}
                    </td>
                    <td className="text-sm text-muted-foreground">{ev.description || '—'}</td>
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
            <DialogTitle>Créer un Événement</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'événement *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Vacances de Noël, Conférence IA..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début *</FormLabel>
                      <FormControl>
                        <DateTimePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin *</FormLabel>
                      <FormControl>
                        <DateTimePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="holiday"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Marquer comme période de congés / vacances
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnelle)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Détails supplémentaires..." 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
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
