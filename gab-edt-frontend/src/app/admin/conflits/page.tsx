"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function ConflictsAdminPage() {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConflicts = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/schedule-events/conflicts');
      setConflicts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConflicts();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  const handleResolve = (id: string) => {
    alert("Ouverture de l'outil de résolution des conflits pour l'événement " + id);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Gestion des Conflits
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Identifier et résoudre les superpositions de salles, d'enseignants ou de groupes.
          </p>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 16px', 
          borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)' 
        }} onClick={loadConflicts}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span>
          Analyser
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Analyse en cours...</div>
      ) : conflicts.length === 0 ? (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--success)', marginBottom: '1rem' }}>check_circle</span>
          <h2 style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.2rem' }}>Aucun conflit détecté</h2>
          <p style={{ color: 'var(--success)', opacity: 0.8, marginTop: '8px' }}>L'emploi du temps est parfaitement cohérent.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--danger-bg)', borderRadius: '12px', border: '1px solid var(--danger)' }}>
            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{conflicts.length} conflit(s) critique(s) détecté(s).</span> Une action immédiate est requise.
          </div>
          
          {conflicts.map(conflict => (
            <div key={conflict.id} style={{ 
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Conflit
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{conflict.subject?.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span> {formatDate(conflict.startAt)} - {formatDate(conflict.endAt).split(' ')[3]}</span>
                  <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span> {conflict.teacher ? `${conflict.teacher.firstName} ${conflict.teacher.lastName}` : 'Inconnu'}</span>
                  <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>meeting_room</span> {conflict.room?.name || 'Inconnue'}</span>
                  <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span> {conflict.group?.name || 'Inconnu'}</span>
                </div>
                <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>warning</span>
                  Détail: {conflict.conflictDetails}
                </div>
              </div>
              
              <button style={{ 
                background: 'var(--surface-container-high)', color: 'var(--text-primary)', border: '1px solid var(--border)', 
                padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' 
              }} onClick={() => handleResolve(conflict.id)}>
                Résoudre
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
