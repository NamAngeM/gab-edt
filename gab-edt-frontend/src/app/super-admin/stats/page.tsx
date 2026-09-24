"use client";

import React, { useState } from "react";

const GROWTH_DATA  = [30, 45, 55, 50, 72, 88, 82, 107, 138, 155, 148, 190];
const MRR_DATA     = [135, 150, 150, 165, 195, 240, 240, 240, 255, 270, 270, 285];
const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const maxG = Math.max(...GROWTH_DATA);
const maxM = Math.max(...MRR_DATA);

export default function StatsPage() {
  const [hovG, setHovG] = useState<number|null>(null);
  const [hovM, setHovM] = useState<number|null>(null);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Statistiques SaaS</h1>
        <p style={{ color: "var(--text-secondary)" }}>Visualisez la croissance et l&apos;utilisation globale de la plateforme GAB-EDT.</p>
      </header>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-lg)", marginBottom: "var(--space-xl)" }}>
        {[
          { label: "Utilisateurs actifs",  value: "4 521",  trend: "+15%",  color: "var(--primary)", icon: "group" },
          { label: "Séances / jour moy.", value: "1 243",   trend: "+8%",   color: "#16A34A",        icon: "bar_chart" },
          { label: "Taux de rétention",   value: "91.4%",   trend: "Stable",color: "#0E7490",        icon: "loyalty" },
          { label: "NPS Score",           value: "74",      trend: "Excellent", color: "#B45309",    icon: "thumb_up" },
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
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)", marginBottom: "var(--space-lg)" }}>

        {/* Users bar chart */}
        <div className="card" style={{ padding: "var(--space-lg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-lg)" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>Utilisateurs Actifs Mensuels</h2>
            <span style={{ background: "#EFF6FF", color: "#2563EB", padding: "3px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600 }}>2026</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px", marginBottom: "8px" }}>
            {GROWTH_DATA.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "pointer" }}
                onMouseEnter={() => setHovG(i)} onMouseLeave={() => setHovG(null)}>
                {hovG === i && <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>{(v*24).toLocaleString()}</span>}
                <div style={{ width: "100%", height: `${(v/maxG)*140}px`, background: i===new Date().getMonth() ? "var(--primary)" : hovG===i ? "var(--primary-light)" : "var(--surface-container-high)", borderRadius: "4px 4px 0 0", transition: "all 0.2s" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", borderTop: "1px solid var(--border)", paddingTop: "6px" }}>
            {MONTHS.map((m, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.6rem", color: i===new Date().getMonth()?"var(--primary)":"var(--text-muted)", fontWeight: i===new Date().getMonth()?700:400 }}>{m}</span>)}
          </div>
        </div>

        {/* MRR line-ish chart */}
        <div className="card" style={{ padding: "var(--space-lg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-lg)" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>Revenu Mensuel (MRR)</h2>
            <span style={{ background: "#F0FDF4", color: "#16A34A", padding: "3px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600 }}>kF FCFA</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px", marginBottom: "8px" }}>
            {MRR_DATA.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "pointer" }}
                onMouseEnter={() => setHovM(i)} onMouseLeave={() => setHovM(null)}>
                {hovM === i && <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#16A34A", whiteSpace: "nowrap" }}>{v} kF</span>}
                <div style={{ width: "100%", height: `${(v/maxM)*140}px`, background: i===new Date().getMonth() ? "#16A34A" : hovM===i ? "#86EFAC" : "#D1FAE5", borderRadius: "4px 4px 0 0", transition: "all 0.2s" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", borderTop: "1px solid var(--border)", paddingTop: "6px" }}>
            {MONTHS.map((m, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.6rem", color: i===new Date().getMonth()?"#16A34A":"var(--text-muted)", fontWeight: i===new Date().getMonth()?700:400 }}>{m}</span>)}
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
        <div className="card" style={{ padding: "var(--space-lg)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-lg)" }}>Répartition par Type d&apos;Établissement</h2>
          {[
            { label: "Universités",    pct: 55, color: "#7E22CE", users: 2252 },
            { label: "Lycées",         pct: 30, color: "#0369A1", users: 1395 },
            { label: "Grandes Écoles", pct: 10, color: "#B45309", users: 465  },
            { label: "Collèges",       pct: 5,  color: "#16A34A", users: 232  },
          ].map((row, i) => (
            <div key={i} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "4px" }}>
                <span style={{ fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontWeight: 700 }}>{row.pct}% <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({row.users.toLocaleString("fr-FR")} users)</span></span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "var(--surface-container-high)", borderRadius: "4px" }}>
                <div style={{ width: `${row.pct}%`, height: "100%", background: row.color, borderRadius: "4px", transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "var(--space-lg)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-lg)" }}>Répartition par Plan</h2>
          {[
            { label: "Enterprise", count: 1, pct: 33, color: "#7E22CE", mrr: 180 },
            { label: "Pro",        count: 2, pct: 53, color: "#2563EB", mrr: 90  },
            { label: "Basic",      count: 2, pct: 14, color: "#64748B", mrr: 15  },
          ].map((row, i) => (
            <div key={i} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "4px" }}>
                <span style={{ fontWeight: 700, color: row.color }}>{row.label}</span>
                <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{row.count} établissement{row.count>1?"s":""} · {row.mrr} kF MRR</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "var(--surface-container-high)", borderRadius: "4px" }}>
                <div style={{ width: `${row.pct}%`, height: "100%", background: row.color, borderRadius: "4px" }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: "24px", padding: "16px", borderRadius: "10px", background: "var(--surface-container-lowest)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "4px" }}>MRR Total</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary-dark)" }}>285 kF</div>
            <div style={{ fontSize: "0.78rem", color: "#16A34A", fontWeight: 600 }}>→ ARR Projeté : 3 420 kF</div>
          </div>
        </div>
      </div>
    </div>
  );
}
