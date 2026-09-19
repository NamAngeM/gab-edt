"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function ImportPage() {
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span>Échange de données</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Import Excel / CSV</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Import Excel / CSV</h1>
          <p className="page-subtitle">Importez massivement vos données depuis des fichiers tableurs.</p>
        </div>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="empty-state">
          <span className="material-symbols-outlined empty-icon" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>upload_file</span>
          <h3>Module en cours de développement</h3>
          <p>L'interface complète d'importation de fichiers CSV et Excel sera bientôt disponible. Elle vous permettra d'importer facilement des listes d'étudiants, d'enseignants et de salles.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled>
            Parcourir les fichiers...
          </button>
        </div>
      </motion.div>
    </div>
  );
}
