"use client";

import React from "react";

export default function StatsPage() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 className="page-title">Statistiques SaaS</h1>
        <p className="page-subtitle">Croissance et utilisation globale de la plateforme GAB-EDT.</p>
      </header>

      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="material-symbols-outlined">bar_chart</span>
          </div>
          <p className="empty-state-title">Statistiques non disponibles</p>
          <p className="empty-state-desc">
            Les indicateurs ne sont pas encore reliés au backend. Aucune valeur n&apos;est affichée tant que la source n&apos;est pas branchée.
          </p>
        </div>
      </div>
    </div>
  );
}
