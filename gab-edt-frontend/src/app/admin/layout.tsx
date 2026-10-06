"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationProvider } from '@/components/NotificationProvider';
import { fetchWithAuth, getStoredUser, logout } from '@/lib/api';
import { HIGHER_EDUCATION, SECONDARY_EDUCATION, SHOW_PREVIEW_FEATURES, type InstitutionType } from '@/lib/features';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  /** Écran en maquette : masqué sauf si NEXT_PUBLIC_SHOW_PREVIEW_FEATURES=true */
  preview?: boolean;
  /** Types d'établissement concernés (tous si absent) */
  onlyFor?: InstitutionType[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Planning',
    items: [
      { label: 'Tableau de bord', icon: 'space_dashboard', href: '/admin' },
      { label: 'Emploi du temps', icon: 'calendar_month', href: '/admin/timetable' },
      { label: 'Enseignements', icon: 'auto_stories', href: '/admin/enseignements' },
      { label: 'Conflits', icon: 'warning', href: '/admin/conflits' },
      { label: 'Rattrapages', icon: 'event_repeat', href: '/admin/rattrapages' },
      { label: 'Réservations & Salles', icon: 'event_seat', href: '/admin/reservations', preview: true },
    ],
  },
  {
    label: 'Organisation',
    items: [
      { label: 'Calendrier', icon: 'calendar_today', href: '/admin/calendrier' },
      { label: 'Structure pédagogique', icon: 'apartment', href: '/admin/organisation' },
      { label: 'Formations & Niveaux', icon: 'school', href: '/admin/formations' },
      { label: 'Classes & Groupes', icon: 'group_work', href: '/admin/groupes' },
    ],
  },
  {
    label: 'Ressources',
    items: [
      { label: 'Enseignants', icon: 'badge', href: '/admin/resources/teachers' },
      { label: 'Disponibilités', icon: 'event_available', href: '/admin/disponibilites' },
      { label: 'Élèves & Étudiants', icon: 'groups', href: '/admin/resources/students' },
      { label: 'Matières', icon: 'menu_book', href: '/admin/resources/subjects' },
      { label: 'Salles & Équipements', icon: 'meeting_room', href: '/admin/resources/rooms' },
    ],
  },
  {
    label: 'Examens',
    items: [
      { label: "Sessions d'examens", icon: 'edit_calendar', href: '/admin/examens' },
      { label: 'Soutenances', icon: 'co_present', href: '/admin/soutenances', onlyFor: HIGHER_EDUCATION },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Annonces', icon: 'campaign', href: '/admin/annonces' },
    ],
  },
  {
    label: 'Vie scolaire',
    items: [
      { label: 'Carnet de correspondance', icon: 'gavel', href: '/admin/discipline', onlyFor: SECONDARY_EDUCATION },
      { label: "Justificatifs d'absences", icon: 'fact_check', href: '/admin/justificatifs', preview: true },
    ],
  },
  {
    label: 'Données',
    items: [
      { label: 'Import Excel / CSV', icon: 'upload_file', href: '/admin/import' },
      { label: 'Export PDF / Excel', icon: 'download', href: '/admin/export' },
      { label: 'QR codes des salles', icon: 'qr_code_2', href: '/admin/qr' },
    ],
  },
  {
    label: 'Pilotage',
    items: [
      { label: 'Statistiques', icon: 'bar_chart', href: '/admin/stats' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Utilisateurs & Rôles', icon: 'manage_accounts', href: '/admin/users' },
      { label: "Journal d'audit", icon: 'receipt_long', href: '/admin/audit', preview: true },
      { label: 'Paramètres', icon: 'settings', href: '/admin/settings', preview: true },
    ],
  },
];

function visibleSections(institutionType: InstitutionType | null): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        (!item.preview || SHOW_PREVIEW_FEATURES) &&
        (!item.onlyFor || !institutionType || item.onlyFor.includes(institutionType))
      ),
    }))
    .filter((section) => section.items.length > 0);
}

interface InstitutionInfo {
  name: string;
  type: InstitutionType;
}

function Sidebar({ pathname, institutionType, open, onNavigate }: {
  pathname: string;
  institutionType: InstitutionType | null;
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className={`sidebar-backdrop${open ? ' open' : ''}`} onClick={onNavigate} aria-hidden="true" />
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Navigation principale">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">G</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">GAB-EDT</span>
            <span className="sidebar-logo-tagline">Administration</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleSections(institutionType).map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={`sidebar-link${isActive ? ' active' : ''}`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="sidebar-link-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super administrateur',
  SCHOOL_ADMIN: 'Administrateur',
  PEDAGOGICAL_MANAGER: 'Responsable pédagogique',
};

function Topbar({ institution, onMenu }: { institution: InstitutionInfo | null; onMenu: () => void }) {
  // Initialise à vide pour le SSR — le profil local n'est lu que côté client
  const [userName, setUserName] = useState('');
  const [roleLabel, setRoleLabel] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    setUserName(user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '');
    setRoleLabel(ROLE_LABELS[user.role ?? ''] ?? '');
  }, []);

  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-icon-btn topbar-menu-btn" aria-label="Ouvrir le menu" onClick={onMenu}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="topbar-institution">
          <span className="material-symbols-outlined">account_balance</span>
          <div className="topbar-institution-text">
            <span className="topbar-institution-label">Établissement</span>
            <span className="topbar-institution-name">{institution?.name ?? '…'}</span>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-profile" title={userName}>
          <div className="topbar-profile-text">
            <span className="topbar-profile-name">{userName}</span>
            <span className="topbar-profile-role">{roleLabel}</span>
          </div>
          <div className="topbar-avatar">{initials}</div>
        </div>
        <button className="topbar-icon-btn" aria-label="Se déconnecter" title="Se déconnecter" onClick={() => void logout()}>
          <span className="material-symbols-outlined">logout</span>
        </button>
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
  const [institution, setInstitution] = useState<InstitutionInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // L'API ne renvoie que l'établissement de l'utilisateur connecté
    fetchWithAuth('/institutions')
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) setInstitution({ name: list[0].name, type: list[0].type });
      })
      .catch(() => setInstitution(null));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--background)' }}>
      <Sidebar
        pathname={pathname}
        institutionType={institution?.type ?? null}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />

      <div className="main-wrapper">
        <Topbar institution={institution} onMenu={() => setMenuOpen(true)} />
        <main className="page-content">
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </main>
      </div>
    </div>
  );
}
