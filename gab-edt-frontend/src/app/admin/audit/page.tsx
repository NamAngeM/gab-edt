"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AuditPage() {
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span>Administration</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Journal d'audit</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Journal d'audit</h1>
          <p className="page-subtitle">Consultez l'historique des actions effectuées par les utilisateurs.</p>
        </div>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="empty-state">
          <span className="material-symbols-outlined empty-icon" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>receipt_long</span>
          <h3>Module en cours de développement</h3>
          <p>Le journal de traçabilité complet (création de cours, modification de notes, suppressions) sera bientôt consultable ici avec filtres avancés.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled>
            Exporter le journal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
