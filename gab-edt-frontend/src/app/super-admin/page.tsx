"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const MOCK_INSTITUTIONS = [
  { id: 1, name: 'Université Omar Bongo', code: 'UOB', type: 'Université', city: 'Libreville', users: 1840, status: 'active', plan: 'Enterprise', mrr: 180 },
  { id: 2, name: 'Lycée National Léon Mba', code: 'LNLM', type: 'Lycée', city: 'Libreville', users: 1204, status: 'active', plan: 'Pro', mrr: 45 },
  { id: 3, name: 'Institut Supérieur de Technologie', code: 'IST', type: 'École', city: 'Port-Gentil', users: 874, status: 'active', plan: 'Pro', mrr: 45 },
  { id: 4, name: 'École Normale Supérieure', code: 'ENS', type: 'Université', city: 'Libreville', users: 412, status: 'trial', plan: 'Basic', mrr: 15 },
  { id: 5, name: "Lycée d'État de Mouila", code: 'LEM', type: 'Lycée', city: 'Mouila', users: 191, status: 'suspended', plan: 'Basic', mrr: 0 },
];

const ALERT_ITEMS = [
  { level: 'error',   message: 'Échec SMTP – Serveur mail.uob.ga non joignable', time: 'Il y a 5 min', icon: 'error' },
  { level: 'warning', message: 'Licence ENS expire dans 7 jours',                 time: 'Il y a 1h',   icon: 'schedule' },
  { level: 'warning', message: 'Redis cache à 87% de capacité',                   time: 'Il y a 2h',   icon: 'memory' },
  { level: 'info',    message: 'Déploiement v2.5.0 réussi en production',          time: 'Il y a 3h',   icon: 'system_update' },
];

const RECENT_SIGNUPS = [
  { name: 'École de Commerce de Libreville', plan: 'Pro',   date: '22 Sep 2026', admin: 'Y. Boulingui' },
  { name: 'Lycée Victor Hugo',               plan: 'Basic', date: '18 Sep 2026', admin: 'P. Nkoghe' },
];

const GROWTH_DATA = [30, 45, 55, 50, 72, 88, 82, 107, 138, 155, 148, 190];
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const TYPE_COLORS: Record<string, string> = {
  Université: '#7E22CE',
  Lycée:      '#0369A1',
  École:      '#B45309',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Actif',     color: '#16A34A', bg: '#F0FDF4' },
  trial:     { label: 'Essai',     color: '#B45309', bg: '#FFFBEB' },
  suspended: { label: 'Suspendu', color: '#DC2626', bg: '#FEF2F2' },
};

const PLAN_COLORS: Record<string, string> = {
  Enterprise: '#7E22CE',
  Pro:        '#2563EB',
  Basic:      '#64748B',
};

const ALERT_COLORS: Record<string, { bg: string; color: string }> = {
  error:   { bg: '#FEF2F2', color: '#DC2626' },
  warning: { bg: '#FFFBEB', color: '#B45309' },
  info:    { bg: '#EFF6FF', color: '#2563EB' },
};

export default function SuperAdminDashboard() {
  const [institutions, setInstitutions] = useState(MOCK_INSTITUTIONS);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredBar, setHoveredBar]     = useState<number | null>(null);
  const [pulse, setPulse]               = useState(false);

  const maxBar     = Math.max(...GROWTH_DATA);
  const totalMRR   = institutions.reduce((s, i) => s + i.mrr,   0);
  const totalUsers = institutions.reduce((s, i) => s + i.users, 0);
  const activeCount = institutions.filter(i => i.status === 'active').length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch('http://localhost:8080/api/v1/institutions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length) setInstitutions(data);
        }
      } catch {}
    };
    fetchData();
    const iv = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(iv);
  }, []);

  const filtered = institutions.filter(inst =>
    (inst.name.toLowerCase().includes(search.toLowerCase()) || inst.code.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === 'all' || inst.status === filterStatus)
  );

  const kpis = [
    { icon:'domain',         iconBg:'var(--primary-light)', iconColor:'var(--primary)',  accent:'var(--primary)', badge:'+2 ce mois',    bBg:'#F0FDF4', bColor:'#16A34A', value: String(institutions.length), label:'Établissements',       sub:`${activeCount} actifs · ${institutions.length-activeCount} inactifs` },
    { icon:'group',          iconBg:'#F3E8FF',               iconColor:'#7E22CE',         accent:'#7E22CE',        badge:'+234 ce mois',  bBg:'#F0FDF4', bColor:'#16A34A', value: totalUsers.toLocaleString('fr-FR'), label:'Utilisateurs totaux', sub:'Admins, profs, étudiants' },
    { icon:'receipt_long',   iconBg:'#F0FDF4',               iconColor:'#16A34A',         accent:'#16A34A',        badge:'+12.5%',        bBg:'#F0FDF4', bColor:'#16A34A', value:`${totalMRR} kF`,            label:'MRR (Rev. mensuel)',   sub:`${(totalMRR*12).toLocaleString('fr-FR')} kF / an projeté` },
    { icon:'memory',         iconBg:'#ECFEFF',               iconColor:'#0E7490',         accent:'#0E7490',        badge:'Nominal',       bBg:'#F0FDF4', bColor:'#16A34A', value:'99.9%',                     label:'Uptime (30 jours)',    sub:'Ping API: 18ms' },
  ];

  const quickActions = [
    { label:'Créer un établissement', icon:'domain_add',           href:'/super-admin/institutions', color:'var(--primary)', bg:'var(--primary-light)' },
    { label:'Voir la facturation',    icon:'receipt_long',          href:'/super-admin/billing',      color:'#16A34A',        bg:'#F0FDF4' },
    { label:'Consulter les logs',     icon:'terminal',              href:'/super-admin/logs',         color:'#0E7490',        bg:'#ECFEFF' },
    { label:'Gérer les licences',     icon:'verified',              href:'/super-admin/billing',      color:'#7E22CE',        bg:'#F3E8FF' },
    { label:'Statistiques SaaS',      icon:'monitoring',            href:'/super-admin/stats',        color:'#B45309',        bg:'#FFFBEB' },
    { label:'Paramètres serveur',     icon:'settings_applications', href:'/super-admin/settings',     color:'#475569',        bg:'var(--surface-container)' },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>

      {/* HEADER */}
      <header style={{ marginBottom:'var(--space-xl)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <h1 style={{ fontSize:'1.625rem', fontWeight:800, color:'var(--text-primary)' }}>
              Vue Globale — Réseau GAB-EDT
            </h1>
            <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'#F0FDF4', color:'#16A34A', padding:'2px 10px', borderRadius:'99px', fontSize:'0.72rem', fontWeight:700 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#16A34A', opacity: pulse ? 1 : 0.3, transition:'opacity 0.5s' }} />
              LIVE
            </span>
          </div>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.925rem' }}>
            Supervision temps réel de tous les établissements clients.
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <Link href="/super-admin/institutions">
            <button className="btn btn-outline" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'1.1rem' }}>domain_add</span>
              Ajouter un client
            </button>
          </Link>
          <Link href="/super-admin/billing">
            <button className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'1.1rem' }}>receipt_long</span>
              Facturation
            </button>
          </Link>
        </div>
      </header>

      {/* KPI CARDS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'var(--space-lg)', marginBottom:'var(--space-xl)' }}>
        {kpis.map((k, i) => (
          <div key={i} className="card" style={{ padding:'var(--space-lg)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:k.accent }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ background:k.iconBg, color:k.iconColor, padding:'8px', borderRadius:'10px' }}>
                <span className="material-symbols-outlined">{k.icon}</span>
              </div>
              <span style={{ background:k.bBg, color:k.bColor, padding:'2px 8px', borderRadius:'99px', fontSize:'0.7rem', fontWeight:700 }}>{k.badge}</span>
            </div>
            <div style={{ fontSize:'2.1rem', fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>{k.value}</div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.875rem', marginTop:'4px' }}>{k.label}</div>
            <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginTop:'4px' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* CHART + ALERTS */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'var(--space-lg)', marginBottom:'var(--space-lg)' }}>

        <div className="card" style={{ padding:'var(--space-lg)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--space-lg)' }}>
            <h2 style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text-primary)' }}>Croissance des Utilisateurs (2026)</h2>
            <span style={{ background:'var(--surface-container)', color:'var(--text-secondary)', padding:'4px 12px', borderRadius:'8px', fontSize:'0.8rem' }}>+63% sur l&apos;année</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:'180px', marginBottom:'8px' }}>
            {GROWTH_DATA.map((val, i) => {
              const isH = hoveredBar === i;
              const isC = i === new Date().getMonth();
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer' }}
                  onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                  {isH && <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--primary)', whiteSpace:'nowrap' }}>{(val*24).toLocaleString()}</span>}
                  <div style={{ width:'100%', height:`${(val/maxBar)*160}px`, background: isC ? 'linear-gradient(to top, var(--primary-dark), var(--primary))' : isH ? 'linear-gradient(to top, var(--primary), var(--primary-light))' : 'var(--surface-container-high)', borderRadius:'5px 5px 0 0', transition:'all 0.2s ease', border: isC ? '2px solid var(--primary)' : 'none' }} />
                </div>
              );
            })}
          </div>
          <div style={{ display:'flex', borderTop:'1px solid var(--border)', paddingTop:'8px' }}>
            {MONTHS.map((m, i) => (
              <span key={i} style={{ flex:1, textAlign:'center', fontSize:'0.65rem', color: i===new Date().getMonth() ? 'var(--primary)' : 'var(--text-muted)', fontWeight: i===new Date().getMonth() ? 700 : 400 }}>{m}</span>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:'var(--space-lg)', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--space-md)' }}>
            <h2 style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text-primary)' }}>Alertes Système</h2>
            <Link href="/super-admin/logs" style={{ fontSize:'0.8rem', color:'var(--primary)', fontWeight:600 }}>Voir les logs →</Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', flex:1 }}>
            {ALERT_ITEMS.map((a, i) => {
              const { bg, color } = ALERT_COLORS[a.level];
              return (
                <div key={i} style={{ display:'flex', gap:'10px', padding:'10px 12px', borderRadius:'10px', background:bg }}>
                  <span className="material-symbols-outlined" style={{ color, fontSize:'1.1rem', flexShrink:0, marginTop:'1px' }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize:'0.82rem', fontWeight:600, color, lineHeight:1.3 }}>{a.message}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94A3B8', marginTop:'2px' }}>{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* INSTITUTIONS TABLE */}
      <div className="card" style={{ padding:'var(--space-lg)', marginBottom:'var(--space-lg)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--space-lg)' }}>
          <h2 style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text-primary)' }}>Établissements Clients</h2>
          <div style={{ display:'flex', gap:'10px' }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              style={{ padding:'6px 12px', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--background)', color:'var(--text-primary)', fontSize:'0.85rem', outline:'none' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding:'6px 12px', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--background)', color:'var(--text-primary)', fontSize:'0.85rem' }}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="trial">Essai</option>
              <option value="suspended">Suspendus</option>
            </select>
            <Link href="/super-admin/institutions">
              <button className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px', fontSize:'0.85rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize:'1rem' }}>add</span>Nouveau client
              </button>
            </Link>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left', fontSize:'0.875rem' }}>
            <thead>
              <tr style={{ borderBottom:'2px solid var(--border)', color:'var(--text-muted)' }}>
                {['Établissement','Type','Ville','Utilisateurs','Plan','Statut','MRR','Actions'].map((h,i) => (
                  <th key={i} style={{ padding:'10px 12px', fontWeight:600, textAlign: i===3||i===6 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inst => {
                const sc = STATUS_CONFIG[inst.status];
                return (
                  <tr key={inst.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-lowest)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <td style={{ padding:'12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:36, height:36, borderRadius:'8px', flexShrink:0, background:`${TYPE_COLORS[inst.type] || 'var(--primary)'}22`, color:TYPE_COLORS[inst.type]||'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.75rem' }}>
                          {inst.code.substring(0,3)}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{inst.name}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{inst.code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ background:`${TYPE_COLORS[inst.type]||'#64748B'}20`, color:TYPE_COLORS[inst.type]||'#64748B', padding:'3px 8px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:600 }}>{inst.type}</span>
                    </td>
                    <td style={{ padding:'12px', color:'var(--text-secondary)' }}>{inst.city}</td>
                    <td style={{ padding:'12px', textAlign:'right', fontWeight:600 }}>{inst.users.toLocaleString('fr-FR')}</td>
                    <td style={{ padding:'12px' }}><span style={{ color:PLAN_COLORS[inst.plan]||'#64748B', fontWeight:700, fontSize:'0.82rem' }}>{inst.plan}</span></td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:sc.bg, color:sc.color, padding:'3px 9px', borderRadius:'99px', fontSize:'0.75rem', fontWeight:600 }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:sc.color }} />{sc.label}
                      </span>
                    </td>
                    <td style={{ padding:'12px', textAlign:'right', fontWeight:700, color: inst.mrr > 0 ? 'var(--primary-dark)' : 'var(--text-muted)' }}>{inst.mrr > 0 ? `${inst.mrr} kF` : '—'}</td>
                    <td style={{ padding:'12px', textAlign:'right' }}>
                      <Link href="/super-admin/institutions"><button className="btn btn-outline" style={{ padding:'4px 12px', fontSize:'0.8rem' }}>Gérer</button></Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding:'var(--space-xl)', textAlign:'center', color:'var(--text-muted)' }}>Aucun résultat.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-lg)' }}>

        <div className="card" style={{ padding:'var(--space-lg)' }}>
          <h2 style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'var(--space-md)' }}>🆕 Nouveaux Clients</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {RECENT_SIGNUPS.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px', borderRadius:'10px', background:'var(--surface-container-lowest)', border:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.9rem' }}>{s.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginTop:'2px' }}>Admin: {s.admin} · {s.date}</div>
                </div>
                <span style={{ background:`${PLAN_COLORS[s.plan]}20`, color:PLAN_COLORS[s.plan], padding:'3px 10px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:700 }}>{s.plan}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:'var(--space-lg)' }}>
          <h2 style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'var(--space-md)' }}>⚡ Actions Rapides</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {quickActions.map((a, i) => (
              <Link key={i} href={a.href} style={{ textDecoration:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px', borderRadius:'10px', border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.15s ease', background:'var(--background)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background=a.bg; el.style.borderColor=a.color; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='var(--background)'; el.style.borderColor='var(--border)'; }}>
                  <div style={{ width:34, height:34, borderRadius:'8px', background:a.bg, color:a.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:'1.1rem' }}>{a.icon}</span>
                  </div>
                  <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)', lineHeight:1.3 }}>{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
