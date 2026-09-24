"use client";

import React, { useState } from "react";

const MOCK_USERS = [
  { id: 1, name: "Jean Dupont",   email: "proviseur@leonmba.ga", role: "SCHOOL_ADMIN",  institution: "Lycée National Léon Mba",          lastLogin: "Il y a 2h",   status: "active",   plan: "Pro" },
  { id: 2, name: "Alice Martin",  email: "doyen@uob.ga",         role: "SCHOOL_ADMIN",  institution: "Université Omar Bongo",             lastLogin: "Il y a 10 min",status: "active",  plan: "Enterprise" },
  { id: 3, name: "Marc Bongo",    email: "it@ist.ga",            role: "SCHOOL_ADMIN",  institution: "Institut Supérieur de Technologie", lastLogin: "Hier",         status: "active",   plan: "Pro" },
  { id: 4, name: "Sophie Nkoghe", email: "dir@ens.ga",           role: "SCHOOL_ADMIN",  institution: "École Normale Supérieure",          lastLogin: "Il y a 3j",    status: "trial",    plan: "Basic" },
  { id: 5, name: "Paul Ondo",     email: "dir@lem.ga",           role: "SCHOOL_ADMIN",  institution: "Lycée d'État de Mouila",            lastLogin: "Il y a 2 mois",status: "suspended",plan: "Basic" },
  { id: 6, name: "Fondateur GAB", email: "founder@gabedt.ga",    role: "SUPER_ADMIN",   institution: "GAB-EDT Network",                  lastLogin: "Maintenant",   status: "active",   plan: "—" },
];

const ROLE_CFG: Record<string, { color: string; bg: string }> = {
  SUPER_ADMIN:  { color: "#DC2626", bg: "#FEF2F2" },
  SCHOOL_ADMIN: { color: "#2563EB", bg: "#EFF6FF" },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Actif",     color: "#16A34A", bg: "#F0FDF4" },
  trial:     { label: "Essai",     color: "#B45309", bg: "#FFFBEB" },
  suspended: { label: "Suspendu", color: "#DC2626", bg: "#FEF2F2" },
};

export default function UsersPage() {
  const [search, setSearch]       = useState("");
  const [filterRole, setFilterRole]     = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterInst, setFilterInst]     = useState("ALL");

  const institutions = [...new Set(MOCK_USERS.map(u => u.institution))];

  const filtered = MOCK_USERS.filter(u =>
    (filterRole   === "ALL" || u.role === filterRole) &&
    (filterStatus === "ALL" || u.status === filterStatus) &&
    (filterInst   === "ALL" || u.institution === filterInst) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Utilisateurs Globaux</h1>
          <p style={{ color: "var(--text-secondary)" }}>Gérez les administrateurs et comptes clés de tous les établissements.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>download</span>
            Exporter CSV
          </button>
          <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>person_add</span>
            Nouvel utilisateur
          </button>
        </div>
      </header>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-lg)", marginBottom: "var(--space-xl)" }}>
        {[
          { label: "Total Comptes", value: MOCK_USERS.length, color: "var(--primary)", icon: "group" },
          { label: "Actifs",        value: MOCK_USERS.filter(u=>u.status==="active").length,    color: "#16A34A", icon: "check_circle" },
          { label: "En essai",      value: MOCK_USERS.filter(u=>u.status==="trial").length,     color: "#B45309", icon: "schedule" },
          { label: "Suspendus",     value: MOCK_USERS.filter(u=>u.status==="suspended").length, color: "#DC2626", icon: "block" },
        ].map((k,i) => (
          <div key={i} className="card" style={{ padding: "var(--space-lg)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: 48, height: 48, borderRadius: "12px", background: `${k.color}18`, color: k.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "var(--space-md)", marginBottom: "var(--space-md)" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un nom ou email..."
            style={{ flex: "1 1 200px", padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none" }} />
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.85rem" }}>
            <option value="ALL">Tous les rôles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="SCHOOL_ADMIN">Admin Établissement</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.85rem" }}>
            <option value="ALL">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="trial">Essai</option>
            <option value="suspended">Suspendus</option>
          </select>
          <select value={filterInst} onChange={e => setFilterInst(e.target.value)}
            style={{ flex: "1 1 200px", padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.85rem" }}>
            <option value="ALL">Tous les établissements</option>
            {institutions.map(inst => <option key={inst}>{inst}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)", background: "var(--surface-container-lowest)" }}>
                {["Utilisateur", "Rôle", "Établissement (Tenant)", "Plan", "Statut", "Dernière connexion", "Actions"].map((h, i) => (
                  <th key={i} style={{ padding: "10px 16px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const rc = ROLE_CFG[user.role] || ROLE_CFG.SCHOOL_ADMIN;
                const sc = STATUS_CFG[user.status];
                return (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-container-lowest)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: rc.bg, color: rc.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                          {user.name.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: rc.bg, color: rc.color, padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{user.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 500 }}>{user.institution}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>{user.plan}</span></td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: sc.bg, color: sc.color, padding: "3px 9px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.color }} />{sc.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "0.82rem" }}>{user.lastLogin}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>Détails</button>
                        {user.status === "active" && user.role !== "SUPER_ADMIN" && (
                          <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: "0.78rem", color: "#DC2626", borderColor: "#DC2626" }}>Suspendre</button>
                        )}
                        {user.status === "suspended" && (
                          <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: "0.78rem", color: "#16A34A", borderColor: "#16A34A" }}>Réactiver</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--text-muted)" }}>Aucun utilisateur trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
