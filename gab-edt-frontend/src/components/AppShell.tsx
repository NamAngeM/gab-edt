"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fetchWithAuth, getStoredUser, logout } from '@/lib/api';

export interface ShellNavItem {
  label: string;
  icon: string;
  href: string;
}

export interface ShellNavSection {
  label: string;
  items: ShellNavItem[];
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super administrateur',
  SCHOOL_ADMIN: 'Administrateur',
  PEDAGOGICAL_MANAGER: 'Responsable pédagogique',
  TEACHER: 'Enseignant',
  STUDENT: 'Élève / Étudiant',
  PARENT: 'Parent',
};

interface AppShellProps {
  /** Racine de l'espace (lien « accueil » actif uniquement sur cette URL exacte) */
  home: string;
  tagline: string;
  sections: ShellNavSection[];
  /** Affiche le nom de l'établissement de l'utilisateur dans la barre du haut */
  showInstitution?: boolean;
  children: React.ReactNode;
}

/**
 * Mise en page commune des espaces connectés : navigation latérale (repliable sur
 * tablette et mobile), établissement et profil réels, déconnexion explicite.
 */
export function AppShell({ home, tagline, sections, showInstitution = true, children }: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [roleLabel, setRoleLabel] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    setUserName(user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '');
    setRoleLabel(ROLE_LABELS[user.role ?? ''] ?? '');
  }, []);

  useEffect(() => {
    if (!showInstitution) return;
    // L'API ne renvoie que l'établissement de l'utilisateur connecté
    fetchWithAuth('/institutions')
      .then((list) => setInstitutionName(Array.isArray(list) && list[0] ? list[0].name : null))
      .catch(() => setInstitutionName(null));
  }, [showInstitution]);

  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  const closeMenu = () => setMenuOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--background)' }}>
      <div className={`sidebar-backdrop${menuOpen ? ' open' : ''}`} onClick={closeMenu} aria-hidden="true" />
      <aside className={`sidebar${menuOpen ? ' open' : ''}`} aria-label="Navigation principale">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">G</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">GAB-EDT</span>
            <span className="sidebar-logo-tagline">{tagline}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== home && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
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

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-icon-btn topbar-menu-btn" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            {showInstitution && (
              <div className="topbar-institution">
                <span className="material-symbols-outlined">account_balance</span>
                <div className="topbar-institution-text">
                  <span className="topbar-institution-label">Établissement</span>
                  <span className="topbar-institution-name">{institutionName ?? '…'}</span>
                </div>
              </div>
            )}
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
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
