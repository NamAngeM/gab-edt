"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function ExportPage() {
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span>Échange de données</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Export & Affichage TV</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Export & Affichage TV</h1>
          <p className="page-subtitle">Diffusez les emplois du temps sur écrans ou téléchargez-les au format PDF.</p>
        </div>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="empty-state">
          <span className="material-symbols-outlined empty-icon" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>tv</span>
          <h3>Module en cours de développement</h3>
          <p>La génération de liens d'affichage dynamique (TV) et les exports PDF personnalisés seront très prochainement disponibles.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled>
            Générer un lien TV
          </button>
        </div>
      </motion.div>
    </div>
  );
}
