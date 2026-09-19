"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api';
import Link from 'next/link';

interface TodayEvent {
  id: string;
  title: string;
  description: string;
  roomName: string;
  startAt: string;
  endAt: string;
  conflict: boolean;
}

interface Activity {
  icon: string;
  text: string;
  time: string;
  type: string;
}

interface BuildingOccupation {
  name: string;
  sub: string;
  pct: number;
  occupied: string;
  free: string;
  color: string;
}

interface DashboardStats {
  teacherCount: number;
  studentCount: number;
  subjectCount: number;
  roomCount: number;
  activeConflictsCount: number;
  todayEvents: TodayEvent[];
  recentActivity: Activity[];
  buildingOccupations: BuildingOccupation[];
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  trend?: string;
  trendPositive?: boolean;
  iconBg?: string;
  iconColor?: string;
  href?: string;
}

function StatCard({ label, value, icon, trend, trendPositive, iconBg, iconColor, href }: StatCardProps) {
  const content = (
    <div className="stat-card" style={{ cursor: href ? 'pointer' : 'default', transition: 'all 0.2s ease' }}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon" style={{ background: iconBg || 'var(--primary-light)', color: iconColor || 'var(--primary)' }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {trend && (
        <div className="stat-card-trend" style={{ color: trendPositive ? 'var(--success)' : 'var(--text-muted)' }}>
          {trendPositive && '↑ '}{trend}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>{content}</Link>;
  }
  return content;
}

function QuickLink({ icon, label, href, description }: { icon: string; label: string; href: string; description: string }) {
  return (
    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        padding: '14px 16px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: 'var(--surface)',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
          (e.currentTarget as HTMLDivElement).style.background = 'var(--primary-light)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)';
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</div>
        </div>
        <span className="material-symbols-outlined" style={{ marginLeft: 'auto', fontSize: 18, color: 'var(--text-muted)' }}>arrow_forward_ios</span>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Empty string as SSR-safe default; set client-side in useEffect
  const [userName, setUserName] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/dashboard/stats');
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      setUserName(user.firstName || 'Administrateur');
    } catch {
      setUserName('Administrateur');
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const activeEvents = stats?.todayEvents || [];
  const conflicts = activeEvents.filter(e => e.conflict);

  return (
    <div className="page-container">
      {/* Welcome header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 32, fontWeight: 700 }}>
              Bonjour, {userName} 👋
            </h1>
            <p className="page-subtitle">
              Voici l'aperçu de l'activité académique et l'état de planification opérationnelle en temps réel.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary">
              <span className="material-symbols-outlined">download</span>
              Rapport hebdomadaire
            </button>
            <Link href="/admin/timetable" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <span className="material-symbols-outlined">add_circle</span>
              Planifier un cours
            </Link>
          </div>
        </div>
      </div>

      {/* Main KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Enseignants"
          value={loading ? '—' : (stats?.teacherCount ?? 0)}
          icon="badge"
          trend="corps enseignant"
          iconBg="var(--primary-light)"
          iconColor="var(--primary)"
          href="/admin/resources/teachers"
        />
        <StatCard
          label="Étudiants"
          value={loading ? '—' : (stats?.studentCount ?? 0)}
          icon="groups"
          trend="apprenants actifs"
          iconBg="#F0FDF4"
          iconColor="var(--success)"
          href="/admin/resources/students"
        />
        <StatCard
          label="Matières"
          value={loading ? '—' : (stats?.subjectCount ?? 0)}
          icon="menu_book"
          trend="catalogue pédagogique"
          iconBg="#EDE9FE"
          iconColor="#7C3AED"
          href="/admin/resources/subjects"
        />
        <StatCard
          label="Salles"
          value={loading ? '—' : (stats?.roomCount ?? 0)}
          icon="meeting_room"
          trend="espaces disponibles"
          iconBg="var(--warning-bg)"
          iconColor="var(--warning)"
          href="/admin/resources/rooms"
        />
        <StatCard
          label="Conflits"
          value={loading ? '—' : (stats?.activeConflictsCount ?? 0)}
          icon="warning"
          trend="nécessitent arbitrage"
          trendPositive={false}
          iconBg="var(--danger-bg)"
          iconColor="var(--danger)"
        />
        <StatCard
          label="Réaménagements"
          value={14}
          icon="autorenew"
          trend="en 24h"
          iconBg="#FFFBEB"
          iconColor="var(--warning)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Conflits & Alertes */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--danger)' }}>warning</span>
                </div>
                <h2 className="card-title" style={{ margin: 0 }}>Conflits & Alertes Critiques</h2>
              </div>
              <span className="badge badge-red">
                {stats?.activeConflictsCount || conflicts.length} ALERTE{((stats?.activeConflictsCount || conflicts.length) > 1) ? 'S' : ''} ACTIVE{((stats?.activeConflictsCount || conflicts.length) > 1) ? 'S' : ''}
              </span>
            </div>
            <div style={{ padding: '0 0 4px 0' }}>
              {conflicts.length > 0 ? (
                conflicts.map((conflict, i) => (
                  <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--danger)' }}>error</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{conflict.roomName} — {conflict.title}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          CONFLIT
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{conflict.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                        {new Date(conflict.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(conflict.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  Aucun conflit actif pour le moment.
                </div>
              )}
            </div>
          </div>

          {/* Aperçu planning */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>calendar_month</span>
                </div>
                <h2 className="card-title" style={{ margin: 0 }}>Aperçu du planning du jour</h2>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['Tous', 'Amphis', 'Labos Info', 'TD Sciences'].map((tab, i) => (
                  <button key={tab} style={{
                    padding: '4px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    fontSize: 12,
                    background: i === 0 ? 'var(--primary)' : 'var(--surface)',
                    color: i === 0 ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '0' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-container-low)' }}>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salle</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>08h–10h</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>10h–12h</th>
                      <th style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--primary-light)', borderTop: '2px solid var(--primary)', textAlign: 'center' }}>14h–16h (Actuel)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeEvents.length > 0 ? activeEvents.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 12, color: row.conflict ? 'var(--danger)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {row.roomName}
                          {row.conflict && <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>⚠ Conflit</div>}
                        </td>
                        <td style={{
                            padding: '8px 16px',
                            background: row.conflict ? 'rgba(220,38,38,0.07)' : 'transparent',
                            fontSize: 12,
                            color: row.conflict ? 'var(--danger)' : 'var(--text-secondary)',
                            fontWeight: row.conflict ? 600 : 400,
                            whiteSpace: 'pre-line',
                          }} colSpan={3}>
                            {row.title} - {row.description}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {new Date(row.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(row.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                          Aucun événement prévu aujourd'hui.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick access (moved from right column to balance) */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-secondary)' }}>apps</span>
                </div>
                <h2 className="card-title" style={{ margin: 0 }}>Accès rapide</h2>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <QuickLink icon="badge" label="Enseignants" href="/admin/resources/teachers" description="Gérer le corps enseignant" />
              <QuickLink icon="groups" label="Étudiants" href="/admin/resources/students" description="Gérer les apprenants" />
              <QuickLink icon="menu_book" label="Matières & Modules" href="/admin/resources/subjects" description="Catalogue pédagogique" />
              <QuickLink icon="meeting_room" label="Salles & Équipements" href="/admin/resources/rooms" description="Parc immobilier" />
              <QuickLink icon="manage_accounts" label="Utilisateurs & Rôles" href="/admin/users" description="Gestion des accès" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>


          {/* Flux d'activité */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--success)' }}>history</span>
                </div>
                <h2 className="card-title" style={{ margin: 0 }}>Flux d'activité récente</h2>
              </div>
              <button className="btn btn-ghost btn-sm">Voir tout</button>
            </div>
            <div style={{ padding: '4px 0 0 0' }}>
              {(stats?.recentActivity || []).length > 0 ? (stats?.recentActivity || []).map((item, i) => (
                <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--info)' }}>{item.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 3 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(item.time).toLocaleString()}</div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  Aucune activité récente.
                </div>
              )}
            </div>
          </div>

          {/* Taux occupation */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--warning)' }}>domain</span>
                </div>
                <h2 className="card-title" style={{ margin: 0 }}>Taux d'occupation par bâtiment</h2>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Capacité globale: 2 400 places</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stats?.buildingOccupations && stats.buildingOccupations.length > 0 ? (
                stats.buildingOccupations.map((bld, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{bld.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{bld.sub}</div>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 700, color: bld.color }}>{bld.pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${bld.pct}%`, background: bld.color }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{bld.occupied}</span>
                      <span style={{ color: 'var(--success)' }}>{bld.free}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  Aucun bâtiment enregistré ou données indisponibles.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
