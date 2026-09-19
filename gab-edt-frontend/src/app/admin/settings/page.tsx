"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span>Administration</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Paramètres & Rôles</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Paramètres & Rôles</h1>
          <p className="page-subtitle">Gérez les configurations générales et les droits d'accès de l'application.</p>
        </div>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="empty-state">
          <span className="material-symbols-outlined empty-icon" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>settings</span>
          <h3>Module en cours de développement</h3>
          <p>L'interface de configuration avancée (périodes académiques, rôles sur mesure, intégrations) sera bientôt disponible pour les administrateurs globaux.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled>
            Ouvrir les réglages
          </button>
        </div>
      </motion.div>
    </div>
  );
}
