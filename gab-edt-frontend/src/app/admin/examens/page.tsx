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
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const sessionSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  orgUnitId: z.string().min(1, "La promotion est requise"),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().min(1, "La date de fin est requise"),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export default function ExamensPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [orgUnits, setOrgUnits] = useState<any[]>([]);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: '', startDate: '', endDate: '', orgUnitId: ''
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/exams/sessions');
      setSessions(extractArray(res));
      
      const ouRes = await fetchWithAuth('/org-units');
      setOrgUnits(extractArray(ouRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    form.reset({ name: '', startDate: '', endDate: '', orgUnitId: '' });
    setShowAddModal(true);
  };

  const handleAdd = async (data: SessionFormValues) => {
    try {
      await fetchWithAuth('/exams/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setShowAddModal(false);
      toast.success('Session créée avec succès');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="breadcrumb">
        <span>Évaluations & Examens</span>
        <span className="breadcrumb-sep material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="breadcrumb-current">Sessions d'examens</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Sessions d'examens</h1>
          <p className="page-subtitle">Planifiez et gérez les périodes d'évaluation.</p>
        </div>
        <div className="page-header-right">
          <Button className="bg-brand-600 hover:bg-brand-700" onClick={handleOpenAdd}>
            <span className="material-symbols-outlined mr-2 text-sm">add</span>
            Nouvelle Session
          </Button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            <p>Chargement des sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">event_busy</span>
            <h3>Aucune session d'examen</h3>
            <p>Commencez par créer une nouvelle session.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Promotion / Groupe ciblée</th>
                  <th>Statut</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.name}</td>
                    <td>{s.startDate}</td>
                    <td>{s.endDate}</td>
                    <td>{s.orgUnitName}</td>
                    <td>
                      {s.published ? (
                        <span className="badge badge-success">Publiée</span>
                      ) : (
                        <span className="badge badge-warning">Brouillon</span>
                      )}
                    </td>
                    <td className="table-actions">
                      <button className="icon-btn text-primary-color" title="Gérer les examens">
                        <span className="material-symbols-outlined">list_alt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={(open) => !open && setShowAddModal(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nouvelle Session d'Examen</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la session *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Partiels Semestre 1" {...field} />
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
                    <FormLabel>Promotion concernée *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orgUnits.map(ou => (
                          <SelectItem key={ou.id} value={ou.id}>{ou.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <DatePicker value={field.value} onChange={field.onChange} />
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
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-brand-600 hover:bg-brand-700">
                  {form.formState.isSubmitting ? 'En cours...' : 'Créer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
