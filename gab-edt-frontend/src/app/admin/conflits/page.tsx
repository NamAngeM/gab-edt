"use client";

import React, { useEffect, useState } from 'react';
import { fetchWithAuth, extractArray } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ConflictsAdminPage() {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [resolvingConflict, setResolvingConflict] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [editData, setEditData] = useState({ roomId: '', teacherId: '', startAt: '', endAt: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resConflicts, resTeachers, resRooms] = await Promise.all([
        fetchWithAuth('/schedule-events/conflicts'),
        fetchWithAuth('/teachers').catch(() => ({ data: [] })),
        fetchWithAuth('/rooms').catch(() => ({ data: [] }))
      ]);
      setConflicts(resConflicts.data || []);
      setTeachers(extractArray(resTeachers));
      setRooms(extractArray(resRooms));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  const handleResolveClick = (conflict: any) => {
    setResolvingConflict(conflict);
    setEditData({
      roomId: conflict.room?.id || '',
      teacherId: conflict.teacher?.id || '',
      startAt: conflict.startAt.slice(0, 16), // datetime-local format
      endAt: conflict.endAt.slice(0, 16)
    });
  };

  const handleSaveResolution = async () => {
    if (!resolvingConflict) return;
    setSaving(true);
    try {
      // Rebuild the full DTO since PUT replaces everything
      const dto = {
        subjectId: resolvingConflict.subject?.id,
        orgUnitId: resolvingConflict.orgUnitId, // Make sure orgUnitId is present if possible, backend might require it
        teacherId: editData.teacherId || null,
        roomId: editData.roomId || null,
        startAt: editData.startAt + ':00',
        endAt: editData.endAt + ':00',
        status: resolvingConflict.status,
        notes: resolvingConflict.notes
      };
      
      await fetchWithAuth(`/schedule-events/${resolvingConflict.id}`, {
        method: 'PUT',
        body: JSON.stringify(dto)
      });
      
      setResolvingConflict(null);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la résolution du conflit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Gestion des Conflits
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Superpositions, indisponibilités des enseignants, capacité des salles et fermetures.
          </p>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 16px', 
          borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)' 
        }} onClick={loadData}>
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
              }} onClick={() => handleResolveClick(conflict)}>
                Résoudre
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!resolvingConflict} onOpenChange={open => { if (!open) setResolvingConflict(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Résolution du conflit</DialogTitle>
          </DialogHeader>
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>
              {resolvingConflict?.conflictDetails}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Enseignant</label>
                <select 
                  className="form-input"
                  value={editData.teacherId} 
                  onChange={e => setEditData({...editData, teacherId: e.target.value})}
                >
                  <option value="">-- Non assigné --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Salle</label>
                <select 
                  className="form-input"
                  value={editData.roomId} 
                  onChange={e => setEditData({...editData, roomId: e.target.value})}
                >
                  <option value="">-- Non assignée --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} places)</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Début</label>
                  <input 
                    type="datetime-local" 
                    className="form-input"
                    value={editData.startAt} 
                    onChange={e => setEditData({...editData, startAt: e.target.value})}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Fin</label>
                  <input 
                    type="datetime-local" 
                    className="form-input"
                    value={editData.endAt} 
                    onChange={e => setEditData({...editData, endAt: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}
                onClick={() => setResolvingConflict(null)}
              >
                Annuler
              </button>
              <button 
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                onClick={handleSaveResolution}
                disabled={saving}
              >
                {saving ? 'Sauvegarde...' : 'Appliquer les modifications'}
              </button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
