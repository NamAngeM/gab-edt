"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { extractArray, fetchWithAuth } from '@/lib/api';
import { TimetableModal } from '@/app/components/TimetableModal';

interface CancelledSession {
  id: string;
  subject?: { id: string; name: string };
  teacher?: { id: string; firstName: string; lastName: string };
  group?: { id: string; name: string };
  room?: { id: string; name: string };
  startAt: string;
  endAt: string;
  notes?: string;
}

const durationHours = (s: CancelledSession) => (new Date(s.endAt).getTime() - new Date(s.startAt).getTime()) / 3_600_000;

export default function RattrapagesPage() {
  const [sessions, setSessions] = useState<CancelledSession[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CancelledSession | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSessions(extractArray(await fetchWithAuth('/schedule-events/to-make-up')));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    fetchWithAuth('/org-units').then((u) => setOrgUnits(extractArray(u))).catch(() => setOrgUnits([]));
  }, [load]);

  // Regroupement par enseignant : c'est à lui qu'on demande ses disponibilités
  const byTeacher = useMemo(() => {
    const groups = new Map<string, { name: string; hours: number; items: CancelledSession[] }>();
    for (const s of sessions) {
      const key = s.teacher?.id ?? '—';
      const group = groups.get(key) ?? { name: s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : 'Sans enseignant', hours: 0, items: [] };
      group.items.push(s);
      group.hours += durationHours(s);
      groups.set(key, group);
    }
    return [...groups.values()].sort((a, b) => b.hours - a.hours);
  }, [sessions]);

  const totalHours = sessions.reduce((sum, s) => sum + durationHours(s), 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Rattrapages</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 680 }}>
          Séances annulées (grève, absence, coupure…) qui n&apos;ont pas encore été rattrapées.
          Une fois le rattrapage planifié puis publié, la classe est notifiée et les heures sont créditées à l&apos;enseignant.
        </p>
      </header>

      <div className="card" style={{ padding: 'var(--space-lg)', display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: sessions.length ? 'var(--danger)' : 'var(--success)' }}>
            {Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)} h
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>à rattraper</div>
        </div>
        <div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{sessions.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>séances annulées</div>
        </div>
      </div>

      {!loading && sessions.length === 0 && (
        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
          Aucune séance à rattraper.
        </div>
      )}

      {byTeacher.map((group) => (
        <section key={group.name} className="card">
          <h2 style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border)', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
            <span>{group.name}</span>
            <span style={{ color: 'var(--danger)' }}>{group.hours} h</span>
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {group.items.map((s) => {
              const start = new Date(s.startAt);
              return (
                <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontWeight: 600 }}>{s.subject?.name} — {s.group?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Annulée : {start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
                      {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {durationHours(s)} h
                      {s.notes ? ` · ${s.notes}` : ''}
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => setSelected(s)}>
                    <span className="material-symbols-outlined">event_repeat</span>
                    Planifier le rattrapage
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <TimetableModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onSave={() => {
          setSelected(null);
          toast.success('Rattrapage planifié (en brouillon : pensez à publier la semaine concernée).');
          void load();
        }}
        makeUpOf={selected ?? undefined}
        orgUnits={orgUnits}
      />
    </div>
  );
}
