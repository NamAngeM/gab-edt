"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface Slot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const DAYS: { value: string; label: string; short: string }[] = [
  { value: 'MONDAY', label: 'Lundi', short: 'Lun' },
  { value: 'TUESDAY', label: 'Mardi', short: 'Mar' },
  { value: 'WEDNESDAY', label: 'Mercredi', short: 'Mer' },
  { value: 'THURSDAY', label: 'Jeudi', short: 'Jeu' },
  { value: 'FRIDAY', label: 'Vendredi', short: 'Ven' },
  { value: 'SATURDAY', label: 'Samedi', short: 'Sam' },
];

const PRESETS = [
  { label: 'Temps plein', slots: [] as Slot[] },
  {
    label: 'Lun-Ven matin',
    slots: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map(d => ({
      dayOfWeek: d, startTime: '07:30', endTime: '12:30',
    })),
  },
  {
    label: 'Lun-Mer-Ven',
    slots: ['MONDAY', 'WEDNESDAY', 'FRIDAY'].map(d => ({
      dayOfWeek: d, startTime: '07:30', endTime: '17:00',
    })),
  },
];

export default function DisponibilitesPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetchWithAuth('/teachers?size=200')
      .then(res => {
        const list = res?.data?.content ?? res?.data ?? [];
        setTeachers(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error('Impossible de charger la liste des enseignants'))
      .finally(() => setLoading(false));
  }, []);

  const loadSlots = useCallback(async (teacherId: string) => {
    if (!teacherId) { setSlots([]); return; }
    try {
      const res = await fetchWithAuth(`/teachers/${teacherId}/availabilities`);
      setSlots(res?.data ?? []);
      setDirty(false);
    } catch {
      toast.error('Erreur au chargement des disponibilités');
    }
  }, []);

  useEffect(() => { loadSlots(selectedId); }, [selectedId, loadSlots]);

  const save = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await fetchWithAuth(`/teachers/${selectedId}/availabilities`, {
        method: 'PUT',
        body: JSON.stringify(slots),
      });
      toast.success('Disponibilités enregistrées');
      setDirty(false);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    setSlots(prev => [...prev, { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' }]);
    setDirty(true);
  };

  const removeSlot = (idx: number) => {
    setSlots(prev => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const updateSlot = (idx: number, field: keyof Slot, value: string) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
    setDirty(true);
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setSlots(preset.slots.map(s => ({ ...s })));
    setDirty(true);
  };

  const selectedTeacher = teachers.find(t => t.id === selectedId);
  const isFullTime = slots.length === 0 && !dirty;

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>
        Disponibilités des enseignants
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Définir les créneaux de présence hebdomadaire pour les vacataires.
        Un enseignant sans créneau est considéré disponible tout le temps (titulaire).
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4, color: 'var(--text-secondary)' }}>
          Enseignant
        </label>
        <select
          style={{ width: '100%', maxWidth: 400, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-container)', fontSize: 14 }}
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          <option value="">-- Sélectionner --</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
          ))}
        </select>
      </div>

      {selectedId && (
        <>
          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, marginBottom: '1.5rem',
            background: isFullTime ? 'var(--success-bg)' : 'var(--warning-bg)',
            color: isFullTime ? 'var(--success)' : 'var(--warning)',
            fontWeight: 600, fontSize: 13,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {isFullTime ? 'check_circle' : 'schedule'}
            </span>
            {isFullTime
              ? `${selectedTeacher?.firstName} est disponible tout le temps (titulaire)`
              : `${slots.length} créneau(x) de présence défini(s)`}
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--surface-container)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
            {slots.map((slot, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <select
                  value={slot.dayOfWeek}
                  onChange={e => updateSlot(idx, 'dayOfWeek', e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-container)', fontWeight: 600, minWidth: 120 }}
                >
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>

                <input
                  type="time" value={slot.startTime}
                  onChange={e => updateSlot(idx, 'startTime', e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-container)' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <input
                  type="time" value={slot.endTime}
                  onChange={e => updateSlot(idx, 'endTime', e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-container)' }}
                />

                <button
                  onClick={() => removeSlot(idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}
                  title="Supprimer ce créneau"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                </button>
              </div>
            ))}
          </div>

          {/* Weekly summary */}
          {slots.length > 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, background: 'var(--surface-container)', marginBottom: '1.5rem',
              fontSize: 13, color: 'var(--text-secondary)',
            }}>
              <strong>Résumé :</strong>{' '}
              {DAYS.filter(d => slots.some(s => s.dayOfWeek === d.value))
                .map(d => {
                  const daySlots = slots.filter(s => s.dayOfWeek === d.value);
                  return `${d.short} ${daySlots.map(s => `${s.startTime}–${s.endTime}`).join(', ')}`;
                })
                .join(' | ')}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={addSlot}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10,
                border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, color: 'var(--primary)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Ajouter un créneau
            </button>

            {dirty && (
              <button
                onClick={save}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10,
                  border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14, boxShadow: '0 4px 12px rgba(13,110,253,0.2)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
