"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { confirmAction } from "@/lib/confirm";
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { extractArray, fetchWithAuth } from '@/lib/api';

type PeriodType = 'SEMESTER' | 'TRIMESTER' | 'TERM';

interface Period {
  id?: string;
  name: string;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  periods: Period[];
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  holiday: boolean;
}

const fmt = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Découpe l'année en n périodes de durée égale (point de départ, ajustable ensuite). */
function splitYear(start: string, end: string, count: number, type: PeriodType): Period[] {
  const s = new Date(`${start}T00:00:00`).getTime();
  const e = new Date(`${end}T00:00:00`).getTime();
  const days = Math.round((e - s) / 86_400_000) + 1;
  const label = type === 'TRIMESTER' ? 'Trimestre' : 'Semestre';
  return Array.from({ length: count }, (_, i) => {
    const from = addDays(start, Math.floor((days * i) / count));
    const to = i === count - 1 ? end : addDays(start, Math.floor((days * (i + 1)) / count) - 1);
    return { name: `${label} ${i + 1}`, periodType: type, startDate: from, endDate: to };
  });
}

/** Une fermeture couvre des journées entières : fin exclusive côté API, inclusive à l'écran. */
const lastDay = (ev: CalendarEvent) => {
  const end = new Date(ev.endDate);
  if (end.getHours() === 0 && end.getMinutes() === 0) end.setDate(end.getDate() - 1);
  // Date locale (et non toISOString, qui passe en UTC et décalerait d'un jour)
  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
};

export default function CalendrierPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [yearForm, setYearForm] = useState<{ id?: string; name: string; startDate: string; endDate: string; periods: Period[] } | null>(null);
  const [eventForm, setEventForm] = useState<{ title: string; startDate: string; endDate: string; holiday: boolean } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [y, e] = await Promise.all([fetchWithAuth('/academic-years'), fetchWithAuth('/communication/events')]);
      setYears(extractArray(y));
      setEvents(extractArray(e));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chargement impossible.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const newYear = () => {
    const now = new Date();
    const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const start = `${startYear}-10-01`;
    const end = `${startYear + 1}-07-31`;
    setError('');
    setYearForm({ name: `${startYear}-${startYear + 1}`, startDate: start, endDate: end, periods: splitYear(start, end, 2, 'SEMESTER') });
  };

  const saveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearForm) return;
    setError('');
    try {
      const { id, ...body } = yearForm;
      await fetchWithAuth(id ? `/academic-years/${id}` : '/academic-years', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
      toast.success('Année académique enregistrée.');
      setYearForm(null);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    }
  };

  const deleteYear = async (year: AcademicYear) => {
    if (!(await confirmAction(`Supprimer l'année ${year.name} ?`))) return;
    try {
      await fetchWithAuth(`/academic-years/${year.id}`, { method: 'DELETE' });
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  const addHolidays = async (civilYear: number) => {
    try {
      const res = await fetchWithAuth(`/academic-years/public-holidays?year=${civilYear}`, { method: 'POST' });
      toast.success(`${res?.data ?? 0} jour(s) férié(s) ${civilYear} ajouté(s). Ajoutez l'Aïd el-Fitr et la Tabaski dès leurs dates connues.`);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ajout impossible.');
    }
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm) return;
    setError('');
    if (eventForm.endDate < eventForm.startDate) {
      setError('La date de fin précède la date de début.');
      return;
    }
    try {
      await fetchWithAuth('/communication/events', {
        method: 'POST',
        body: JSON.stringify({
          title: eventForm.title,
          startDate: `${eventForm.startDate}T00:00:00`,
          endDate: `${addDays(eventForm.endDate, 1)}T00:00:00`,
          holiday: eventForm.holiday,
        }),
      });
      toast.success(eventForm.holiday ? 'Fermeture ajoutée : aucun cours ne pourra y être planifié.' : 'Événement ajouté.');
      setEventForm(null);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    }
  };

  const deleteEvent = async (ev: CalendarEvent) => {
    if (!(await confirmAction(`Supprimer « ${ev.title} » ?`))) return;
    try {
      await fetchWithAuth(`/communication/events/${ev.id}`, { method: 'DELETE' });
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  const civilYears = Array.from(new Set(years.flatMap((y) => [Number(y.startDate.slice(0, 4)), Number(y.endDate.slice(0, 4))]))).sort();


  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Calendrier de l&apos;établissement</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 680 }}>
          Année académique, semestres ou trimestres, vacances et jours fériés. Aucun cours ne peut être planifié
          pendant une fermeture ou hors de l&apos;année, sauf confirmation explicite (par exemple pour un rattrapage).
        </p>
      </header>

      {/* ── Années académiques ── */}
      <section className="card" style={{ padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Années académiques</h2>
          <button className="btn btn-primary" onClick={newYear}>
            <span className="material-symbols-outlined">add</span>Nouvelle année
          </button>
        </div>
        {years.length === 0 && (
          <p style={{ color: 'var(--warning)' }}>
            Aucune année définie : commencez par là. Tant qu&apos;aucune année n&apos;existe, les dates de cours ne sont pas contrôlées.
          </p>
        )}
        {years.map((y) => (
          <div key={y.id} style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-md) 0', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 600 }}>{y.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{fmt(y.startDate)} → {fmt(y.endDate)}</div>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {y.periods.map((p) => <li key={p.id ?? p.name}>{p.name} : {fmt(p.startDate)} → {fmt(p.endDate)}</li>)}
              </ul>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-outline" onClick={() => { setError(''); setYearForm({ id: y.id, name: y.name, startDate: y.startDate, endDate: y.endDate, periods: y.periods }); }}>Modifier</button>
              <button className="btn btn-outline" aria-label={`Supprimer l'année ${y.name}`} onClick={() => deleteYear(y)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ── Fermetures et événements ── */}
      <section className="card" style={{ padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Vacances, jours fériés et événements</h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {civilYears.map((cy) => (
              <button key={cy} className="btn btn-outline" onClick={() => addHolidays(cy)}>Jours fériés du Gabon {cy}</button>
            ))}
            <button className="btn btn-primary" onClick={() => { setError(''); const d = new Date().toISOString().slice(0, 10); setEventForm({ title: '', startDate: d, endDate: d, holiday: true }); }}>
              <span className="material-symbols-outlined">add</span>Ajouter
            </button>
          </div>
        </div>
        {civilYears.length > 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
            Le pré-remplissage couvre les dates fixes et les fêtes liées à Pâques. L&apos;Aïd el-Fitr et la Tabaski
            (calendrier lunaire) et les jours décrétés sont à ajouter manuellement.
          </p>
        )}
        {events.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucune fermeture ni événement.</p>}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {events.map((ev) => (
            <li key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                background: ev.holiday ? 'var(--danger-bg)' : 'var(--primary-light)', color: ev.holiday ? 'var(--danger)' : 'var(--primary)',
              }}>
                {ev.holiday ? 'FERMÉ' : 'ÉVÉNEMENT'}
              </span>
              <span style={{ flex: 1 }}>
                <strong>{ev.title}</strong>{' '}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {fmt(ev.startDate)}{fmt(ev.startDate) !== fmt(lastDay(ev)) ? ` → ${fmt(lastDay(ev))}` : ''}
                </span>
              </span>
              <button className="btn btn-outline" style={{ padding: '4px 8px' }} aria-label={`Supprimer ${ev.title}`} onClick={() => deleteEvent(ev)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {yearForm && (
      <Dialog open onOpenChange={open => { if (!open) setYearForm(null); }}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{yearForm?.id ? 'Modifier' : 'Nouvelle'} année académique</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveYear} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {error && <div role="alert" style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="year-name">Nom</label>
              <input id="year-name" className="form-input" required value={yearForm.name} onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
                <label className="form-label" htmlFor="year-start">Rentrée</label>
                <input id="year-start" type="date" className="form-input" required value={yearForm.startDate} onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
                <label className="form-label" htmlFor="year-end">Fin d&apos;année</label>
                <input id="year-end" type="date" className="form-input" required value={yearForm.endDate} onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="form-label" style={{ margin: 0 }}>Découpage :</span>
              <button type="button" className="btn btn-outline" onClick={() => setYearForm({ ...yearForm, periods: splitYear(yearForm.startDate, yearForm.endDate, 2, 'SEMESTER') })}>2 semestres</button>
              <button type="button" className="btn btn-outline" onClick={() => setYearForm({ ...yearForm, periods: splitYear(yearForm.startDate, yearForm.endDate, 3, 'TRIMESTER') })}>3 trimestres</button>
            </div>
            {yearForm.periods.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <input aria-label={`Nom de la période ${i + 1}`} className="form-input" style={{ flex: 1, minWidth: 120 }} value={p.name}
                       onChange={(e) => setYearForm({ ...yearForm, periods: yearForm.periods.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} />
                <input aria-label={`Début de ${p.name}`} type="date" className="form-input" value={p.startDate}
                       onChange={(e) => setYearForm({ ...yearForm, periods: yearForm.periods.map((x, j) => j === i ? { ...x, startDate: e.target.value } : x) })} />
                <input aria-label={`Fin de ${p.name}`} type="date" className="form-input" value={p.endDate}
                       onChange={(e) => setYearForm({ ...yearForm, periods: yearForm.periods.map((x, j) => j === i ? { ...x, endDate: e.target.value } : x) })} />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setYearForm(null)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      )}

      {eventForm && (
      <Dialog open onOpenChange={open => { if (!open) setEventForm(null); }}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Vacances, jour férié ou événement</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEvent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {error && <div role="alert" style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="ev-title">Intitulé</label>
              <input id="ev-title" className="form-input" required placeholder="ex. Vacances de Noël, Tabaski…" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
                <label className="form-label" htmlFor="ev-start">Du</label>
                <input id="ev-start" type="date" className="form-input" required value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
                <label className="form-label" htmlFor="ev-end">Au (inclus)</label>
                <input id="ev-end" type="date" className="form-input" required value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} />
              </div>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={eventForm.holiday} onChange={(e) => setEventForm({ ...eventForm, holiday: e.target.checked })} />
              Établissement fermé (aucun cours planifiable)
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEventForm(null)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Ajouter</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
