"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { downloadFile, extractArray, fetchWithAuth, formatDateLocal } from '@/lib/api';

type ExportKind = 'GROUP' | 'TEACHER' | 'ROOM';

interface Target {
  id: string;
  label: string;
}

const KIND_CONFIG: Record<ExportKind, { label: string; endpoint: string; param: string }> = {
  GROUP: { label: 'Emploi du temps par classe / groupe', endpoint: '/org-units', param: 'groupId' },
  TEACHER: { label: 'Emploi du temps par enseignant', endpoint: '/teachers?size=500', param: 'teacherId' },
  ROOM: { label: 'Occupation des salles', endpoint: '/rooms?size=500', param: 'roomId' },
};

function currentWeek(): { start: string; end: string } {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDateLocal(monday), end: formatDateLocal(sunday) };
}

function toTarget(kind: ExportKind, item: { id: string; name?: string; firstName?: string; lastName?: string }): Target {
  if (kind === 'TEACHER') return { id: item.id, label: `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() };
  return { id: item.id, label: item.name ?? '' };
}

export default function ExportPage() {
  const week = useMemo(() => currentWeek(), []);
  const [kind, setKind] = useState<ExportKind>('GROUP');
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetId, setTargetId] = useState<string>('');
  const [startDate, setStartDate] = useState(week.start);
  const [endDate, setEndDate] = useState(week.end);
  const [downloading, setDownloading] = useState<'pdf' | 'excel' | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTargetId('');
    fetchWithAuth(KIND_CONFIG[kind].endpoint)
      .then((res) => {
        if (!cancelled) setTargets(extractArray(res).map((item) => toTarget(kind, item)));
      })
      .catch(() => {
        if (!cancelled) {
          setTargets([]);
          toast.error('Impossible de charger la liste.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (startDate > endDate) {
      toast.error('La date de début doit précéder la date de fin.');
      return;
    }
    const params = new URLSearchParams({ startDate, endDate });
    if (targetId) params.set(KIND_CONFIG[kind].param, targetId);
    setDownloading(format);
    try {
      await downloadFile(
        `/schedule-events/export/${format}?${params.toString()}`,
        `emploi_du_temps_${startDate}_${endDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'export.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Export des plannings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Téléchargez un emploi du temps en PDF (impression, affichage) ou en Excel (analyse).
        </p>
      </div>

      <Card className="shadow-sm border-t-4 border-t-brand-500">
        <CardHeader>
          <CardTitle>Exporter un planning</CardTitle>
          <CardDescription>Seuls les cours de votre établissement sont exportés.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Type d&apos;export</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as ExportKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(KIND_CONFIG) as ExportKind[]).map((k) => (
                  <SelectItem key={k} value={k}>{KIND_CONFIG[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Cible</Label>
            <Select value={targetId || 'ALL'} onValueChange={(v) => setTargetId(v === 'ALL' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Tout l'établissement" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tout l&apos;établissement</SelectItem>
                {targets.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Date de début</Label>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            <div className="space-y-3">
              <Label>Date de fin</Label>
              <DatePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6 bg-slate-50/50 dark:bg-slate-900/20">
          <Button className="w-full sm:flex-1" disabled={downloading !== null} onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-2" />
            {downloading === 'pdf' ? 'Génération…' : 'Générer le PDF'}
          </Button>
          <Button className="w-full sm:flex-1" variant="outline" disabled={downloading !== null} onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
            {downloading === 'excel' ? 'Génération…' : 'Exporter en Excel'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
