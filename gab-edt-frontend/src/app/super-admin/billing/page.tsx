"use client";

import React, { useState } from "react";
import Link from "next/link";

const SUBSCRIPTIONS = [
  { id: 1, name: "Université Omar Bongo", plan: "Enterprise", price: 180, status: "active", since: "Jan 2025", renewal: "Jan 2027", admin: "doyen@uob.ga" },
  { id: 2, name: "Lycée National Léon Mba", plan: "Pro", price: 45, status: "active", since: "Mar 2025", renewal: "Mar 2026", admin: "proviseur@lnlm.ga" },
  { id: 3, name: "Institut Supérieur de Technologie", plan: "Pro", price: 45, status: "active", since: "Jun 2025", renewal: "Jun 2026", admin: "dir@ist.ga" },
  { id: 4, name: "École Normale Supérieure", plan: "Basic", price: 15, status: "trial",  since: "Sep 2026", renewal: "Oct 2026", admin: "doyen@ens.ga" },
  { id: 5, name: "Lycée d'État de Mouila",  plan: "Basic", price: 0,  status: "suspended", since: "Feb 2025", renewal: "—", admin: "dir@lem.ga" },
];

const PLAN_COLORS: Record<string, string> = { Enterprise: "#7E22CE", Pro: "#2563EB", Basic: "#64748B" };
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Actif",     color: "#16A34A", bg: "#F0FDF4" },
  trial:     { label: "Essai",     color: "#B45309", bg: "#FFFBEB" },
  suspended: { label: "Suspendu", color: "#DC2626", bg: "#FEF2F2" },
};

export default function BillingPage() {
  const [search, setSearch] = useState("");

  const totalMRR = SUBSCRIPTIONS.reduce((s, i) => s + i.price, 0);
  const filtered = SUBSCRIPTIONS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.admin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Abonnements & Licences</h1>
          <p style={{ color: "var(--text-secondary)" }}>Gérez la facturation, les plans SaaS et les revenus de la plateforme.</p>
        </div>
        <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>add</span>
          Nouveau contrat
        </button>
      </header>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-lg)", marginBottom: "var(--space-xl)" }}>
        {[
          { label: "MRR (Revenu Mensuel)", value: `${totalMRR} kF`, sub: `${(totalMRR * 12).toLocaleString("fr-FR")} kF ARR`, color: "#16A34A", icon: "trending_up", trend: "+12.5%" },
          { label: "Abonnements Actifs",  value: SUBSCRIPTIONS.filter(s => s.status === "active").length,    sub: "Dont 2 annuels", color: "var(--primary)", icon: "verified", trend: "+1" },
          { label: "Essais en cours",     value: SUBSCRIPTIONS.filter(s => s.status === "trial").length,     sub: "Conversion à surveiller", color: "#B45309", icon: "schedule", trend: "→" },
          { label: "Contrats suspendus",  value: SUBSCRIPTIONS.filter(s => s.status === "suspended").length, sub: "Action requise", color: "#DC2626", icon: "block", trend: "⚠️" },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: "var(--space-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ background: `${k.color}18`, color: k.color, padding: "8px", borderRadius: "10px" }}>
                <span className="material-symbols-outlined">{k.icon}</span>
              </div>
              <span style={{ background: `${k.color}18`, color: k.color, padding: "2px 8px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700 }}>{k.trend}</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{k.value}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>{k.label}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Plans */}
      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-md)" }}>Forfaits de la Plateforme</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-lg)", marginBottom: "var(--space-xl)" }}>
        {[
          { name: "Basic",      desc: "Jusqu'à 500 utilisateurs",  price: "15 kF/mois",  color: "#64748B", features: ["Emplois du temps", "Gestion absences", "Notifications email"] },
          { name: "Pro",        desc: "Jusqu'à 2 000 utilisateurs", price: "45 kF/mois",  color: "#2563EB", features: ["Tout Basic", "Soutenances PFE", "API REST", "Stats avancées"], popular: true },
          { name: "Enterprise", desc: "Illimité + Support dédié",  price: "Sur devis",    color: "#7E22CE", features: ["Tout Pro", "SLA 99.9%", "SSO LDAP", "Support 24/7", "Audit logs"] },
        ].map((plan, i) => (
          <div key={i} className="card" style={{ padding: "var(--space-xl)", borderTop: `4px solid ${plan.color}`, position: "relative" }}>
            {plan.popular && (
              <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: plan.color, color: "white", padding: "3px 14px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                LE PLUS POPULAIRE
              </div>
            )}
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: plan.color, marginBottom: "4px" }}>{plan.name}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>{plan.desc}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px" }}>{plan.price}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "0.95rem", color: plan.color }}>check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className={plan.popular ? "btn btn-primary" : "btn btn-outline"} style={{ width: "100%" }}>Modifier le plan</button>
          </div>
        ))}
      </div>

      {/* Subscriptions table */}
      <div className="card" style={{ padding: "var(--space-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-lg)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>Tableau des Abonnements</h2>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none" }} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
              {["Établissement", "Plan", "Statut", "Admin Contact", "Depuis", "Renouvellement", "Montant", "Actions"].map((h, i) => (
                <th key={i} style={{ padding: "10px 12px", fontWeight: 600, textAlign: i === 6 ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => {
              const sc = STATUS_CFG[sub.status];
              return (
                <tr key={sub.id} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-container-lowest)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <td style={{ padding: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{sub.name}</td>
                  <td style={{ padding: "12px" }}><span style={{ color: PLAN_COLORS[sub.plan], fontWeight: 700, fontSize: "0.82rem" }}>{sub.plan}</span></td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: sc.bg, color: sc.color, padding: "3px 9px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.color }} />{sc.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-secondary)", fontSize: "0.82rem" }}>{sub.admin}</td>
                  <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "0.82rem" }}>{sub.since}</td>
                  <td style={{ padding: "12px", color: sub.status === "suspended" ? "var(--text-muted)" : "var(--text-secondary)", fontSize: "0.82rem" }}>{sub.renewal}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: sub.price > 0 ? "var(--primary-dark)" : "var(--text-muted)" }}>{sub.price > 0 ? `${sub.price} kF` : "—"}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>Modifier</button>
                      {sub.status === "suspended" && (
                        <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: "0.78rem", background: "#16A34A", border: "none" }}>Réactiver</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
