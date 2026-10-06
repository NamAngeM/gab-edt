"use client";

import React from "react";

export default function LogsPage() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 className="page-title">Journaux système</h1>
        <p className="page-subtitle">Événements applicatifs de la plateforme.</p>
      </header>

      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="material-symbols-outlined">terminal</span>
          </div>
          <p className="empty-state-title">Journaux non disponibles</p>
          <p className="empty-state-desc">
            La console des journaux n&apos;est pas encore reliée au backend. Aucun événement n&apos;est affiché tant que la source n&apos;est pas branchée.
          </p>
        </div>
      </div>
    </div>
  );
}
