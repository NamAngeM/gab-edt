"use client";

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { fetchWithAuth, extractArray } from '@/lib/api';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SoutenancesPage() {
  const [defenses, setDefenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    studentId: '', topic: '', roomId: '', startAt: '', endAt: '', presidentId: '', examinerId: '', reporterId: '' 
  });
  
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/defenses');
      setDefenses(extractArray(res));

      const [stRes, tRes, rRes] = await Promise.all([
        fetchWithAuth('/students'),
        fetchWithAuth('/teachers'),
        fetchWithAuth('/rooms')
      ]);
      setStudents(extractArray(stRes));
      setTeachers(extractArray(tRes));
      setRooms(extractArray(rRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { ...formData } as Record<string, any>;
      Object.keys(body).forEach(key => {
        if (body[key] === '') body[key] = null;
      });
      await fetchWithAuth('/defenses', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setShowAddModal(false);
      setFormData({ studentId: '', topic: '', roomId: '', startAt: '', endAt: '', presidentId: '', examinerId: '', reporterId: '' });
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création');
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="breadcrumb">
        <span>Évaluations & Examens</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Soutenances PFE</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Soutenances PFE</h1>
          <p className="page-subtitle">Programmez les jurys et soutenance des étudiants.</p>
        </div>
        <div className="page-header-right">
          <Button onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined mr-2">add</span>
            Nouvelle Soutenance
          </Button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <div className="skeleton skeleton-row" />
            <p>Chargement des soutenances...</p>
          </div>
        ) : defenses.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">co_present</span>
            <h3>Aucune soutenance planifiée</h3>
            <p>Programmez une nouvelle soutenance.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Heure</th>
                  <th>Étudiant</th>
                  <th>Thème / Sujet</th>
                  <th>Salle</th>
                  <th>Jury (Président / Rapporteur)</th>
                </tr>
              </thead>
              <tbody>
                {defenses.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="text-mono text-primary-color">
                        {formatDateTime(d.startAt)}
                      </div>
                    </td>
                    <td className="font-medium">{d.studentName}</td>
                    <td>{d.topic}</td>
                    <td>{d.roomName}</td>
                    <td>
                      {d.president && <div className="badge badge-primary">P: {d.president.firstName} {d.president.lastName}</div>}
                      {d.reporter && <div className="badge badge-orange" style={{marginLeft: 4}}>R: {d.reporter.firstName} {d.reporter.lastName}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Programmer une Soutenance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Étudiant</Label>
                <Select
                  required
                  value={formData.studentId}
                  onValueChange={v => setFormData({ ...formData, studentId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Thème / Sujet PFE</Label>
                <Input
                  required
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>
              
              <div className="divider"></div>
              <h3 className="text-sm font-semibold">Planification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Date/Heure de début</Label>
                  <DateTimePicker
                    value={formData.startAt}
                    onChange={v => setFormData({ ...formData, startAt: v })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Date/Heure de fin</Label>
                  <DateTimePicker
                    value={formData.endAt}
                    onChange={v => setFormData({ ...formData, endAt: v })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Salle</Label>
                <Select
                  required
                  value={formData.roomId}
                  onValueChange={v => setFormData({ ...formData, roomId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name} (Capacité: {r.capacity})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="divider"></div>
              <h3 className="text-sm font-semibold">Jury</h3>
              <div className="grid gap-2">
                <Label>Président du Jury</Label>
                <Select
                  required
                  value={formData.presidentId}
                  onValueChange={v => setFormData({ ...formData, presidentId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Examinateur</Label>
                  <Select
                    value={formData.examinerId}
                    onValueChange={v => setFormData({ ...formData, examinerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Rapporteur</Label>
                  <Select
                    value={formData.reporterId}
                    onValueChange={v => setFormData({ ...formData, reporterId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Annuler</Button>
              <Button type="submit">Programmer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
