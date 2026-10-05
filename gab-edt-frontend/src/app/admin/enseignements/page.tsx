"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { extractArray, fetchWithAuth } from '@/lib/api';

interface Ref {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  code?: string;
  type?: string;
}

interface CourseSummary {
  id: string;
  subject: Ref;
  teacher: Ref;
  group: Ref;
  plannedHours: number | null;
  scheduledHours: number;
  doneHours: number;
  cancelledHours: number;
  madeUpHours: number;
  toMakeUpHours: number;
  remainingHours: number | null;
}

interface PeriodOption {
  key: string;
  label: string;
  from?: string;
  to?: string;
}

const EMPTY_FORM = { orgUnitId: '', subjectId: '', teacherId: '', plannedHours: '' };

const hours = (h: number | null | undefined) => (h == null ? '—' : `${Number.isInteger(h) ? h : h.toFixed(1)} h`);
const teacherName = (t: Ref) => `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim();

export default function EnseignementsPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [classes, setClasses] = useState<Ref[]>([]);
  const [subjects, setSubjects] = useState<Ref[]>([]);
  const [teachers, setTeachers] = useState<Ref[]>([]);
  const [filterClass, setFilterClass] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [periods, setPeriods] = useState<PeriodOption[]>([{ key: 'all', label: 'Depuis le début' }]);
  const [periodKey, setPeriodKey] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterClass) params.set('orgUnitId', filterClass);
    if (filterTeacher) params.set('teacherId', filterTeacher);
    const period = periods.find((p) => p.key === periodKey);
    if (period?.from) params.set('from', period.from);
    if (period?.to) params.set('to', period.to);
    try {
      setCourses(extractArray(await fetchWithAuth(`/courses?${params.toString()}`)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [filterClass, filterTeacher, periodKey, periods]);

  useEffect(() => {
    Promise.all([
      fetchWithAuth('/org-units').catch(() => []),
      fetchWithAuth('/subjects').catch(() => []),
      fetchWithAuth('/teachers?size=500').catch(() => []),
    ]).then(([units, subj, teach]) => {
      // Toute unité pédagogique peut recevoir un enseignement, sauf les campus (sites physiques)
      setClasses(extractArray(units).filter((u: Ref) => u.type !== 'CAMPUS'));
      setSubjects(extractArray(subj));
      setTeachers(extractArray(teach));
    });
  }, []);

  // Période de suivi : l'année en cours et ses semestres / trimestres
  useEffect(() => {
    fetchWithAuth('/academic-years/current')
      .then((res) => {
        const year = res?.data;
        if (!year) return;
        setPeriods([
          { key: 'all', label: 'Depuis le début' },
          { key: year.id, label: `Année ${year.name}`, from: year.startDate, to: year.endDate },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...year.periods.map((p: any) => ({ key: p.id, label: p.name, from: p.startDate, to: p.endDate })),
        ]);
        setPeriodKey(year.id);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => courses.reduce((acc, c) => ({
    planned: acc.planned + (c.plannedHours ?? 0),
    done: acc.done + c.doneHours,
    toMakeUp: acc.toMakeUp + c.toMakeUpHours,
    remaining: acc.remaining + (c.remainingHours ?? 0),
  }), { planned: 0, done: 0, toMakeUp: 0, remaining: 0 }), [courses]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await fetchWithAuth('/courses', {
        method: 'POST',
        body: JSON.stringify({
          orgUnitId: form.orgUnitId,
          subjectId: form.subjectId,
          teacherId: form.teacherId,
          plannedHours: form.plannedHours === '' ? null : Number(form.plannedHours),
        }),
      });
      toast.success('Enseignement ajouté.');
      setIsModalOpen(false);
      setForm(EMPTY_FORM);
      void load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Création impossible.');
    }
  };

  const savePlannedHours = async () => {
    if (!editing) return;
    try {
      await fetchWithAuth(`/courses/${editing.id}/planned-hours`, {
        method: 'PUT',
        body: JSON.stringify({ plannedHours: editing.value === '' ? null : Number(editing.value) }),
      });
      setEditing(null);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Modification impossible.');
    }
  };

  const remove = async (course: CourseSummary) => {
    if (!confirm(`Supprimer l'enseignement « ${course.subject.name} — ${course.group.name} » ?`)) return;
    try {
      await fetchWithAuth(`/courses/${course.id}`, { method: 'DELETE' });
      toast.success('Enseignement supprimé.');
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enseignements</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 640 }}>
            Qui enseigne quoi, à quelle classe et combien d&apos;heures. Le suivi compare le volume prévu
            aux séances planifiées, réalisées et annulées.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ ...EMPTY_FORM, orgUnitId: filterClass }); setIsModalOpen(true); }}>
          <span className="material-symbols-outlined">add</span>
          Ajouter un enseignement
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--space-md)' }}>
        {[
          { label: 'Volume prévu', value: hours(totals.planned) },
          { label: 'Réalisé', value: hours(totals.done) },
          { label: 'Reste à planifier', value: hours(totals.remaining) },
          { label: 'À rattraper', value: hours(totals.toMakeUp), alert: totals.toMakeUp > 0 },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: kpi.alert ? 'var(--danger)' : 'var(--text-primary)' }}>{kpi.value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <select aria-label="Période" className="form-input" style={{ minWidth: 180 }} value={periodKey} onChange={(e) => setPeriodKey(e.target.value)}>
            {periods.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select aria-label="Filtrer par classe" className="form-input" style={{ minWidth: 200 }} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select aria-label="Filtrer par enseignant" className="form-input" style={{ minWidth: 200 }} value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
            <option value="">Tous les enseignants</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{teacherName(t)}</option>)}
          </select>
          {totals.toMakeUp > 0 && (
            <Link href="/admin/rattrapages" className="btn btn-outline" style={{ marginLeft: 'auto', color: 'var(--danger)' }}>
              {hours(totals.toMakeUp)} à rattraper →
            </Link>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {['Classe', 'Matière', 'Enseignant', 'Prévu', 'Avancement (réalisé / prévu)', 'Planifié', 'À rattraper', ''].map((h) => (
                  <th key={h} style={{ padding: 'var(--space-md)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const progress = c.plannedHours ? Math.min(100, (c.doneHours / c.plannedHours) * 100) : 0;
                return (
                  <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--space-md)', fontWeight: 600 }}>{c.group.name}</td>
                    <td style={{ padding: 'var(--space-md)' }}>{c.subject.name}</td>
                    <td style={{ padding: 'var(--space-md)' }}>{teacherName(c.teacher)}</td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      {editing?.id === c.id ? (
                        <span style={{ display: 'inline-flex', gap: 4 }}>
                          <input
                            aria-label="Volume prévu en heures"
                            type="number" min={0} step={0.5} className="form-input" style={{ width: 80 }}
                            value={editing.value}
                            onChange={(e) => setEditing({ id: c.id, value: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') void savePlannedHours(); if (e.key === 'Escape') setEditing(null); }}
                            autoFocus
                          />
                          <button className="btn btn-primary" style={{ padding: '4px 8px' }} onClick={savePlannedHours}>OK</button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setEditing({ id: c.id, value: c.plannedHours?.toString() ?? '' })}
                          title="Modifier le volume prévu"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.plannedHours == null ? 'var(--warning)' : 'inherit', padding: 0 }}
                        >
                          {c.plannedHours == null ? 'À définir' : hours(c.plannedHours)}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-md)', minWidth: 180 }}>
                      {c.plannedHours ? (
                        <div>
                          <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>{hours(c.doneHours)} / {hours(c.plannedHours)}</div>
                          <div role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}
                               style={{ height: 6, background: 'var(--surface-container-high)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)' }} />
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>{hours(c.doneHours)} réalisées</span>}
                    </td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      {hours(c.scheduledHours)}
                      {c.remainingHours != null && c.remainingHours > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>reste {hours(c.remainingHours)} à poser</div>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-md)', color: c.toMakeUpHours > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: c.toMakeUpHours > 0 ? 600 : 400 }}>
                      {hours(c.toMakeUpHours)}
                    </td>
                    <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px' }} aria-label="Supprimer l'enseignement" onClick={() => remove(c)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && courses.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun enseignement. Commencez par répartir les matières de chaque classe entre les enseignants.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="new-course-title" style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
        }}>
          <form onSubmit={create} className="card" style={{ width: '100%', maxWidth: 460, padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 id="new-course-title" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Nouvel enseignement</h2>
            {formError && <div role="alert" style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{formError}</div>}
            {([
              ['orgUnitId', 'Classe', classes.map((c) => ({ id: c.id, label: c.name ?? '' }))],
              ['subjectId', 'Matière', subjects.map((s) => ({ id: s.id, label: `${s.name}${s.code ? ` (${s.code})` : ''}` }))],
              ['teacherId', 'Enseignant', teachers.map((t) => ({ id: t.id, label: teacherName(t) }))],
            ] as const).map(([key, label, options]) => (
              <div key={key} className="form-group">
                <label className="form-label" htmlFor={key}>{label}</label>
                <select id={key} className="form-input" required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                  <option value="">— Choisir —</option>
                  {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
            ))}
            <div className="form-group">
              <label className="form-label" htmlFor="plannedHours">Volume prévu (heures)</label>
              <input id="plannedHours" type="number" min={0} step={0.5} className="form-input" placeholder="ex. 60"
                     value={form.plannedHours} onChange={(e) => setForm({ ...form, plannedHours: e.target.value })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Ajouter</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
