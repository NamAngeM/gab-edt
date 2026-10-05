"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api';

interface Institution {
  id: string;
  name: string;
  code: string;
  type: string;
  city?: string;
  active: boolean;
  createdAt?: string;
}

const TYPE_LABELS: Record<string, string> = {
  UNIVERSITY: 'Université',
  GRANDE_ECOLE: 'Grande école',
  LYCEE: 'Lycée',
  COLLEGE: 'Collège',
};

const EMPTY_FORM = {
  name: '',
  code: '',
  type: 'LYCEE',
  city: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPassword: '',
};

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/institutions');
      setInstitutions(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await fetchWithAuth('/institutions', { method: 'POST', body: JSON.stringify(formData) });
      toast.success(`Établissement créé. L'administrateur peut se connecter avec ${formData.adminEmail}.`);
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
      void load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (inst: Institution) => {
    const action = inst.active ? 'suspendre' : 'réactiver';
    if (!confirm(`Voulez-vous ${action} « ${inst.name} » ? ${inst.active ? 'Ses utilisateurs ne pourront plus se connecter.' : ''}`)) return;
    try {
      await fetchWithAuth(`/institutions/${inst.id}/active?value=${!inst.active}`, { method: 'PUT' });
      toast.success(inst.active ? 'Établissement suspendu.' : 'Établissement réactivé.');
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
    }
  };

  const visible = institutions.filter((i) =>
    (i.name.toLowerCase().includes(searchTerm.toLowerCase()) || (i.code || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || (statusFilter === 'active') === i.active)
  );

  const field = (key: keyof typeof EMPTY_FORM) => ({
    value: formData[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [key]: e.target.value }),
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
            Établissements clients
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Créez un établissement avec son premier administrateur, ou suspendez son accès.
          </p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <span className="material-symbols-outlined">add</span>
          Nouvel établissement
        </button>
      </header>

      <div className="card">
        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <div className="topbar-search" style={{ margin: 0, flex: 1, minWidth: 200, background: 'var(--background)' }}>
            <span className="material-symbols-outlined topbar-search-icon">search</span>
            <input type="text" placeholder="Rechercher par nom ou code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: '170px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-lowest)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Établissement</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Type</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500 }}>Statut</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((inst) => (
                <tr key={inst.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inst.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Code : {inst.code}{inst.city ? ` • ${inst.city}` : ''}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>
                    {TYPE_LABELS[inst.type] ?? inst.type}
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    {inst.active ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span> Actif
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>block</span> Suspendu
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'right' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', color: inst.active ? 'var(--danger)' : 'var(--success)' }}
                      onClick={() => toggleActive(inst)}
                    >
                      {inst.active ? 'Suspendre' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun établissement. Créez le premier avec « Nouvel établissement ».
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="new-institution-title" style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: 0, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="new-institution-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Nouvel établissement</h2>
              <button aria-label="Fermer" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddInstitution} style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {formError && (
                <div role="alert" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: 10, borderRadius: 8, fontSize: '0.875rem' }}>{formError}</div>
              )}
              <div className="form-group">
                <label className="form-label">Nom de l&apos;établissement</label>
                <input type="text" className="form-input" required {...field('name')} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label">Code court</label>
                  <input type="text" className="form-input" required maxLength={20} {...field('code')} />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label">Ville</label>
                  <input type="text" className="form-input" {...field('city')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Type d&apos;établissement</label>
                <select className="form-input" required {...field('type')}>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 'var(--space-sm)' }}>Premier administrateur</h3>
              <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label">Prénom</label>
                  <input type="text" className="form-input" required {...field('adminFirstName')} />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-input" required {...field('adminLastName')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required {...field('adminEmail')} />
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe initial (12 caractères minimum)</label>
                <input type="password" className="form-input" required minLength={12} autoComplete="new-password" {...field('adminPassword')} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Création…' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
