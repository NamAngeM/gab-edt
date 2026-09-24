"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";

const navItems = [
  { label: "Tableau de bord",  icon: "space_dashboard", href: "/teacher" },
  { label: "Mon Planning",     icon: "calendar_month",  href: "/teacher/timetable" },
  { label: "Mes Classes",      icon: "groups",           href: "/teacher/evaluations" },
  { label: "Appels & Présences", icon: "checklist",     href: "/teacher/attendance" },
  { label: "Paramètres",       icon: "settings",         href: "/teacher/settings" },
];

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">G</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">GAB-EDT</span>
          <span className="sidebar-logo-tagline">Espace Enseignant</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/teacher" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-status">
        <div className="sidebar-status-row">
          <span className="sidebar-status-online">
            <span className="sidebar-status-dot" />
            En ligne
          </span>
          <span className="sidebar-status-pill">S38 Publié</span>
        </div>
        <div className="sidebar-status-sync">Synchronisé à l&apos;instant</div>
      </div>
    </aside>
  );
}

function Topbar() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      const name = user.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Enseignant";
      setUserName(name);
      setInitials(
        name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      );
    } catch {
      setUserName("Enseignant");
      setInitials("EN");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
    router.push("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-institution">
          <span className="material-symbols-outlined">school</span>
          <div className="topbar-institution-text">
            <span className="topbar-institution-label">Établissement</span>
            <span className="topbar-institution-name">Univ. Omar Bongo</span>
          </div>
        </div>
        <div className="topbar-semester">
          <span className="material-symbols-outlined">event</span>
          <span>2026–2027 • Semestre 1</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <span className="material-symbols-outlined topbar-search-icon">search</span>
          <input type="text" placeholder="Rechercher un cours, une salle..." />
          <span className="topbar-search-shortcut">⌘K</span>
        </div>

        <button className="topbar-icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="notif-dot" />
        </button>

        <div
          className="topbar-profile"
          title="Se déconnecter"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          <div className="topbar-profile-text">
            <span className="topbar-profile-name">{userName}</span>
            <span className="topbar-profile-role">Enseignant</span>
          </div>
          <div className="topbar-avatar">{initials}</div>
        </div>
      </div>
    </header>
  );
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--background)" }}>
      <Toaster position="top-center" richColors />
      <Sidebar pathname={pathname} />
      <div className="main-wrapper">
        <Topbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
