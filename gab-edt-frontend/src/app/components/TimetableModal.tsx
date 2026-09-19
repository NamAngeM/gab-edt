import React, { useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '@/lib/api';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  existingEvent?: any;
  defaultTime?: { start: Date, end: Date };
  orgUnits: any[];
}

export const TimetableModal: React.FC<TimetableModalProps> = ({ 
  isOpen, onClose, onSave, existingEvent, defaultTime, orgUnits 
}) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherId: '',
    roomId: '',
    orgUnitId: '',
    startAt: '',
    endAt: '',
    status: 'SCHEDULED',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadResources();
      
      if (existingEvent) {
        setFormData({
          subjectId: existingEvent.subject?.id || '',
          teacherId: existingEvent.teacher?.id || '',
          roomId: existingEvent.room?.id || '',
          orgUnitId: existingEvent.group?.id || '',
          startAt: existingEvent.startAt.slice(0, 16),
          endAt: existingEvent.endAt.slice(0, 16),
          status: existingEvent.status || 'SCHEDULED',
          notes: existingEvent.notes || ''
        });
      } else if (defaultTime) {
        const toLocalISOString = (d: Date) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setFormData(prev => ({
          ...prev,
          startAt: toLocalISOString(defaultTime.start),
          endAt: toLocalISOString(defaultTime.end)
        }));
      }
    }
  }, [isOpen, existingEvent, defaultTime]);

  const loadResources = async () => {
    try {
      const [subjRes, teachRes, roomRes] = await Promise.all([
        fetchWithAuth('/subjects').catch(() => ({ data: [] })),
        fetchWithAuth('/teachers').catch(() => ({ data: [] })),
        fetchWithAuth('/rooms').catch(() => ({ data: [] }))
      ]);
      setSubjects(subjRes.data || []);
      setTeachers(teachRes.data || []);
      setRooms(roomRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('jwt_token') || '';
      const url = existingEvent ? `${API_URL}/schedule-events/${existingEvent.id}` : `${API_URL}/schedule-events`;
      const method = existingEvent ? 'PUT' : 'POST';
      
      // Conversion des dates pour l'API
      const startIso = new Date(formData.startAt).toISOString();
      const endIso = new Date(formData.endAt).toISOString();
      
      const payload = {
        ...formData,
        startAt: startIso,
        endAt: endIso,
        roomId: formData.roomId || null
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Accès refusé. Vous n'avez pas les droits de planification pour cette classe.");
        }
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError: any) {
          // Si on ne peut pas parser le JSON, ou si c'est déjà une erreur qu'on vient de throw
          if (parseError.message && parseError.message !== "Unexpected end of JSON input" && parseError.message !== "Unexpected token < in JSON at position 0") {
             throw parseError;
          }
        }
        throw new Error("Erreur de sauvegarde");
      }
      
      onSave();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px',
        width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        color: 'var(--text-primary)'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{existingEvent ? 'Modifier le cours' : 'Planifier un cours'}</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffebee', borderRadius: '4px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Matière *</label>
            <select required value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}>
              <option value="">-- Sélectionner une matière --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Enseignant *</label>
            <select required value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}>
              <option value="">-- Sélectionner un enseignant --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Groupe / Classe ciblée *</label>
            <select required value={formData.orgUnitId} onChange={e => setFormData({...formData, orgUnitId: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}>
              <option value="">-- Sélectionner une classe --</option>
              {orgUnits.map(ou => <option key={ou.id} value={ou.id}>{ou.name} ({ou.type})</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Salle</label>
            <select value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}>
              <option value="">-- À définir plus tard --</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Cap. {r.capacity})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Début *</label>
              <input type="datetime-local" required value={formData.startAt} onChange={e => setFormData({...formData, startAt: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Fin *</label>
              <input type="datetime-local" required value={formData.endAt} onChange={e => setFormData({...formData, endAt: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer'
            }}>Annuler</button>
            <button type="submit" disabled={loading} style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: 'var(--accent-primary)', color: 'white', cursor: 'pointer'
            }}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
