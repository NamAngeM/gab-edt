"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function QrPage() {
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <span>Échange de données</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">QR Codes</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Générateur de QR Codes</h1>
          <p className="page-subtitle">Créez des QR codes pour les salles de classe ou la validation de présence.</p>
        </div>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="empty-state">
          <span className="material-symbols-outlined empty-icon" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>qr_code_2</span>
          <h3>Module en cours de développement</h3>
          <p>Le module de création et de téléchargement de QR Codes en masse arrivera bientôt. Il facilitera l'affichage sur les portes de vos amphithéâtres et laboratoires.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled>
            Générer les QR Codes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
