"use client";

import React, { useEffect, useState } from 'react';
import { extractArray, fetchWithAuth } from '@/lib/api';

interface CourseSummary {
  id: string;
  subject: { name: string };
  group: { name: string };
  plannedHours: number | null;
  doneHours: number;
  scheduledHours: number;
  toMakeUpHours: number;
}

const h = (value: number) => `${Number.isInteger(value) ? value : value.toFixed(1)} h`;

/** Volume horaire de l'enseignant connecté : réalisé / prévu par enseignement, heures à rattraper. */
export function TeachingHours() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWithAuth('/courses/mine')
      .then((res) => setCourses(extractArray(res)))
      .catch((e) => setError(e instanceof Error ? e.message : 'Chargement impossible.'));
  }, []);

  const done = courses?.reduce((sum, c) => sum + c.doneHours, 0) ?? 0;
  const toMakeUp = courses?.reduce((sum, c) => sum + c.toMakeUpHours, 0) ?? 0;

  return (
    <section className="card" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-md)' }} aria-labelledby="teaching-hours-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
        <h3 id="teaching-hours-title" style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>monitoring</span>
          Mon volume horaire
        </h3>
        {courses && courses.length > 0 && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {h(done)} réalisées{toMakeUp > 0 && <strong style={{ color: 'var(--danger)' }}> · {h(toMakeUp)} à rattraper</strong>}
          </span>
        )}
      </div>

      {error && <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>}
      {courses && courses.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucun enseignement ne vous est encore attribué.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {courses?.map((c) => {
          const progress = c.plannedHours ? Math.min(100, (c.doneHours / c.plannedHours) * 100) : 0;
          return (
            <div key={c.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 500 }}>{c.subject.name} — {c.group.name}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {h(c.doneHours)}{c.plannedHours ? ` / ${h(c.plannedHours)}` : ''}
                </span>
              </div>
              {c.plannedHours ? (
                <div role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}
                     style={{ height: 8, background: 'var(--surface-container-high)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)' }} />
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volume prévu non renseigné par l&apos;établissement</div>
              )}
              {c.toMakeUpHours > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>{h(c.toMakeUpHours)} à rattraper</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
