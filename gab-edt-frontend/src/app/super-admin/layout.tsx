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
    label: 'Plateforme',
    items: [
      { label: 'Vue globale', icon: 'space_dashboard', href: '/super-admin' },
      { label: 'Établissements', icon: 'domain', href: '/super-admin/institutions' },
      { label: 'Utilisateurs globaux', icon: 'manage_accounts', href: '/super-admin/users' },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'Abonnements & Licences', icon: 'receipt_long', href: '/super-admin/billing' },
      { label: 'Statistiques SaaS', icon: 'monitoring', href: '/super-admin/stats' },
    ],
  },
  {
    label: 'Système',
    items: [
      { label: 'Journaux (Logs)', icon: 'terminal', href: '/super-admin/logs' },
      { label: 'Paramètres Serveur', icon: 'settings_applications', href: '/super-admin/settings' },
    ],
  },
];

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'var(--primary-dark)', color: 'white' }}>SA</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">GAB-EDT</span>
          <span className="sidebar-logo-tagline" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Super Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/super-admin' && pathname.startsWith(item.href));
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
            Serveurs OK
          </span>
          <span className="sidebar-status-pill" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Opérationnel</span>
        </div>
        <div className="sidebar-status-sync">Ping: 12ms</div>
      </div>
    </aside>
  );
}

function Topbar() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      const name = user.firstName ? `${user.firstName} ${user.lastName}` : 'Fondateur';
      setUserName(name);
      setInitials(name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
    } catch {
      setUserName('Fondateur');
      setInitials('SA');
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
        {/* Global overview pill instead of institution switcher */}
        <div className="topbar-institution" style={{ cursor: 'default' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>public</span>
          <div className="topbar-institution-text">
            <span className="topbar-institution-label">Réseau GAB-EDT</span>
            <span className="topbar-institution-name">Toutes les régions</span>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div className="topbar-search">
          <span className="material-symbols-outlined topbar-search-icon">search</span>
          <input
            type="text"
            placeholder="Rechercher un établissement, un admin..."
          />
          <span className="topbar-search-shortcut">⌘K</span>
        </div>

        {/* Icon buttons */}
        <button className="topbar-icon-btn" aria-label="Notifications" title="Alertes Système">
          <span className="material-symbols-outlined">warning</span>
        </button>

        {/* Profile */}
        <div className="topbar-profile" title="Se déconnecter" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <div className="topbar-profile-text">
            <span className="topbar-profile-name">{userName}</span>
            <span className="topbar-profile-role">Super Admin</span>
          </div>
          <div className="topbar-avatar" style={{ background: 'var(--primary-dark)' }}>{initials}</div>
        </div>
      </div>
    </header>
  );
}

export default function SuperAdminLayout({
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
