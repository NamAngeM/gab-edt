"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NotificationProvider } from '@/components/NotificationProvider';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: string | number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { label: 'Tableau de bord', icon: 'space_dashboard', href: '/admin' },
      { label: 'Emploi du temps', icon: 'calendar_month', href: '/admin/timetable' },
      { label: 'Réservations & Salles', icon: 'event_seat', href: '/admin/reservations', badge: 3 },
      { label: 'Cours & Séances', icon: 'auto_stories', href: '/admin/cours' },
      { label: 'Conflits', icon: 'warning', href: '/admin/conflits', badge: 1 },
    ],
  },
  {
    label: 'Organisation académique',
    items: [
      { label: 'Organisation Pédagogique', icon: 'apartment', href: '/admin/organisation' },
      { label: 'Formations & Niveaux', icon: 'school', href: '/admin/formations' },
      { label: 'Promotions & Groupes', icon: 'group_work', href: '/admin/groupes' },
    ],
  },
  {
    label: 'Ressources',
    items: [
      { label: 'Enseignants', icon: 'badge', href: '/admin/resources/teachers' },
      { label: 'Étudiants', icon: 'groups', href: '/admin/resources/students' },
      { label: 'Matières & Modules', icon: 'menu_book', href: '/admin/resources/subjects' },
      { label: 'Salles & Équipements', icon: 'meeting_room', href: '/admin/resources/rooms' },
    ],
  },
  {
    label: 'Évaluations & Examens',
    items: [
      { label: "Sessions d'examens", icon: 'edit_calendar', href: '/admin/examens' },
      { label: 'Soutenances PFE', icon: 'co_present', href: '/admin/soutenances' },
    ],
  },
  {
    label: 'Communication & Événements',
    items: [
      { label: 'Annonces & Actualités', icon: 'campaign', href: '/admin/annonces' },
      { label: 'Événements Académiques', icon: 'event', href: '/admin/evenements' },
    ],
  },
  {
    label: 'Vie Scolaire',
    items: [
      { label: "Justificatifs d'absences", icon: 'fact_check', href: '/admin/justificatifs', badge: 2 },
    ],
  },
  {
    label: 'Échange de données',
    items: [
      { label: 'Import Excel / CSV', icon: 'upload_file', href: '/admin/import' },
      { label: 'Export & Affichage TV', icon: 'tv', href: '/admin/export' },
      { label: 'QR Codes', icon: 'qr_code_2', href: '/admin/qr' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Utilisateurs & Rôles', icon: 'manage_accounts', href: '/admin/users' },
      { label: 'Paramètres & Rôles', icon: 'settings', href: '/admin/settings' },
      { label: "Journal d'audit", icon: 'receipt_long', href: '/admin/audit' },
      { label: 'Statistiques', icon: 'bar_chart', href: '/admin/stats' },
      { label: 'Cartographie', icon: 'hub', href: '/admin/map' },
    ],
  },
];

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">G</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">GAB-EDT</span>
          <span className="sidebar-logo-tagline">Planning Supérieur</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link${isActive ? ' active' : ''}`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="sidebar-link-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status footer */}
      <div className="sidebar-status">
        <div className="sidebar-status-row">
          <span className="sidebar-status-online">
            <span className="sidebar-status-dot" />
            En ligne
          </span>
          <span className="sidebar-status-pill">S38 Publié</span>
        </div>
        <div className="sidebar-status-sync">Synchronisé à l'instant</div>
      </div>
    </aside>
  );
}

function Topbar() {
  const router = useRouter();
  // Initialise à vide pour le SSR — localStorage n'est disponible que côté client
  const [userName, setUserName] = useState('');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      const name = user.firstName ? `${user.firstName} ${user.lastName}` : 'Administrateur';
      setUserName(name);
      setInitials(name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
    } catch {
      setUserName('Administrateur');
      setInitials('AD');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Institution switcher */}
        <div className="topbar-institution">
          <span className="material-symbols-outlined">account_balance</span>
          <div className="topbar-institution-text">
            <span className="topbar-institution-label">Établissement actif</span>
            <span className="topbar-institution-name">Univ. Omar Bongo — Sciences</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-muted)' }}>unfold_more</span>
        </div>

        {/* Semester pill */}
        <div className="topbar-semester">
          <span className="material-symbols-outlined">event</span>
          <span>2026–2027 • Semestre 1</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div className="topbar-search">
          <span className="material-symbols-outlined topbar-search-icon">search</span>
          <input
            type="text"
            placeholder="Rechercher matière, enseignant, salle..."
          />
          <span className="topbar-search-shortcut">⌘K</span>
        </div>

        {/* Icon buttons */}
        <button className="topbar-icon-btn" aria-label="Aide" title="Aide">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <button className="topbar-icon-btn" aria-label="Notifications" title="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="notif-dot" />
        </button>

        {/* Profile */}
        <div className="topbar-profile" title="Mon profil" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <div className="topbar-profile-text">
            <span className="topbar-profile-name">{userName}</span>
            <span className="topbar-profile-role">Administrateur</span>
          </div>
          <div className="topbar-avatar">{initials}</div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--background)' }}>
      <Sidebar pathname={pathname} />

      {/* Main wrapper with sidebar offset */}
      <div className="main-wrapper">
        <Topbar />
        <main className="page-content">
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </main>
      </div>
    </div>
  );
}
