"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth , formatDateLocal} from '@/lib/api';
import { DatePicker } from "@/components/ui/date-picker";

export default function CoursListAdminPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await fetchWithAuth(`/schedule-events?${params.toString()}`);
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(formatDateLocal(firstDay));
    setEndDate(formatDateLocal(lastDay));
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;
    try {
      await fetchWithAuth(`/schedule-events/${id}`, { method: 'DELETE' });
      alert("Séance supprimée");
      loadData();
    } catch (err) {
      alert("Erreur lors de la suppression");
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNED': return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: 'var(--info-bg)', color: 'var(--info)' }}>Planifié</span>;
      case 'CANCELLED': return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: 'var(--danger-bg)', color: 'var(--danger)' }}>Annulé</span>;
      case 'COMPLETED': return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: 'var(--success-bg)', color: 'var(--success)' }}>Terminé</span>;
      default: return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: 'var(--surface-container-high)', color: 'var(--text-secondary)' }}>{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Cours & Séances
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Gestion de toutes les séances planifiées (liste détaillée).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-container)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
             <div style={{ width: '150px' }}><DatePicker value={startDate} onChange={setStartDate} /></div>
             <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>-</span>
             <div style={{ width: '150px' }}><DatePicker value={endDate} onChange={setEndDate} /></div>
          </div>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 16px', 
            borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)' 
          }} onClick={loadData}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span>
            Rafraîchir
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', 
        overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Matière</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Horaire</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Enseignant</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Classe/Groupe</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Salle</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Statut</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement en cours...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune séance trouvée pour cette période.</td></tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{evt.subject?.name || 'Inconnu'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{formatDate(evt.startAt)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>à {formatDate(evt.endAt).split(' ')[3]}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{evt.teacher ? `${evt.teacher.firstName} ${evt.teacher.lastName}` : '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{evt.group?.name || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{evt.room?.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(evt.status)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button style={{ 
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', 
                          background: 'var(--surface-container)', color: 'var(--text-primary)', 
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                        }} title="Détails / Éditer">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        </button>
                        <button style={{ 
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--danger)', 
                          background: 'var(--danger-bg)', color: 'var(--danger)', 
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                        }} title="Supprimer" onClick={() => handleDelete(evt.id)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
