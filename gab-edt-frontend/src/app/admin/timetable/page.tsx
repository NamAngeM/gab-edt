'use client';
import React, { useState, useEffect } from 'react';
import styles from './timetable.module.css';
import { fetchWithAuth } from '@/lib/api';
import { TimetableModal } from '@/app/components/TimetableModal';
import { BulkCancelModal } from '@/app/components/BulkCancelModal';
import { toast } from 'sonner';
// Types pour l'UI
type CourseType = 'cm' | 'td' | 'tp' | 'transversal' | 'conflict';

interface UIMockupEvent {
  id: string;
  type: CourseType;
  title: string;
  teacher: string;
  location: string;
  group: string;
  dayIndex: number; // 0 = Lundi, 1 = Mardi, ..., 6 = Dimanche
  startHour: number; // ex: 8.5 pour 08h30
  endHour: number;   // ex: 10.5 pour 10h30
  extraInfo?: string;
  isConflict?: boolean;
  isDraft?: boolean;
  conflictDetails?: string;
}

const getWeekDays = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  
  const days = [];
  const shortNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  for (let i = 0; i < 7; i++) {
    const curr = new Date(monday);
    curr.setDate(monday.getDate() + i);
    days.push({ short: shortNames[i], num: curr.getDate(), date: curr });
  }
  return days;
};

const formatWeekRange = (monday: Date, sunday: Date) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${monday.getDate()}–${sunday.getDate()} ${months[monday.getMonth()]}`;
};

export default function TimetablePage() {
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 à 21

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // MODAL & FORM STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultModalTime, setDefaultModalTime] = useState<{start: Date, end: Date} | undefined>(undefined);
  const [orgUnits, setOrgUnits] = useState<any[]>([]);

  // DYNAMIC TIMETABLE STATE
  const [events, setEvents] = useState<UIMockupEvent[]>([]);
  const [resourceTree, setResourceTree] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({ groupId: '', teacherId: '', roomId: '' });
  const [editingEvent, setEditingEvent] = useState<any>(undefined);
  
  // NEW INTERACTIVE STATES
  const [viewMode, setViewMode] = useState<'day'|'week'|'month'>('week');
  const [miniCalMonth, setMiniCalMonth] = useState(new Date());
  const [quickFilter, setQuickFilter] = useState<'all'|'mine'|'free'>('all');
  const [isBulkCancelModalOpen, setIsBulkCancelModalOpen] = useState(false);

  const getMiniCalendarDays = (monthDate: Date) => {
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const days = [];
    
    const startDay = start.getDay();
    const diff = startDay === 0 ? 6 : startDay - 1; 
    const prevMonthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0).getDate();
    for (let i = diff - 1; i >= 0; i--) {
      days.push({ num: prevMonthEnd - i, current: false, date: new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, prevMonthEnd - i) });
    }
    for (let i = 1; i <= end.getDate(); i++) {
      days.push({ num: i, current: true, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), i) });
    }
    let nextMonthDay = 1;
    while (days.length % 7 !== 0) {
      days.push({ num: nextMonthDay++, current: false, date: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, nextMonthDay - 1) });
    }
    return days;
  };
  
  const weekDays = getWeekDays(currentDate);

  let displayedDays = weekDays;
  if (viewMode === 'day') {
    const shortNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    displayedDays = [{ short: shortNames[currentDate.getDay()], num: currentDate.getDate(), date: currentDate }];
  }

  const gridStyle = { gridTemplateColumns: `60px repeat(${displayedDays.length}, minmax(140px, 1fr))` };

  const formatDateLocal = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const loadSchedule = async () => {
    const start = formatDateLocal(weekDays[0].date);
    const end = formatDateLocal(weekDays[6].date);
    const params = new URLSearchParams({ startDate: start, endDate: end });
    if (filters.groupId) params.append('groupId', filters.groupId);
    if (filters.teacherId) params.append('teacherId', filters.teacherId);
    if (filters.roomId) params.append('roomId', filters.roomId);

    try {
      const res = await fetchWithAuth(`/schedule-events?${params.toString()}`);
      const apiEvents = res.data || [];
      const mapped = apiEvents.map((evt: any) => {
        const dStart = new Date(evt.startAt);
        const dEnd = new Date(evt.endAt);
        return {
          id: evt.id,
          type: 'cm',
          title: evt.subject?.name || 'Sans titre',
          teacher: evt.teacher ? `${evt.teacher.firstName} ${evt.teacher.lastName}` : '',
          location: evt.room?.name || '',
          group: evt.group?.name || '',
          dayIndex: (dStart.getDay() + 6) % 7,
          startHour: dStart.getHours() + (dStart.getMinutes() / 60),
          endHour: dEnd.getHours() + (dEnd.getMinutes() / 60),
          isConflict: evt.status === 'CANCELLED',
          conflictDetails: evt.status === 'CANCELLED' ? 'Annulé' : '',
          isDraft: evt.publicationStatus !== 'PUBLISHED',
          rawEvent: evt // Keep the original API event for editing
        };
      });
      setEvents(mapped);
    } catch (e) { console.error(e); }
  };

  const draftCount = events.filter((e: any) => e.isDraft).length;

  // Publication : les brouillons de la classe sélectionnée deviennent visibles pour élèves,
  // parents et enseignants (qui sont notifiés)
  const publishWeek = async () => {
    if (!filters.groupId) return;
    const start = formatDateLocal(weekDays[0].date);
    const end = formatDateLocal(weekDays[6].date);
    if (!confirm(`Publier ${draftCount} cours de cette semaine ? Les élèves, parents et enseignants seront notifiés.`)) return;
    try {
      const res = await fetchWithAuth(`/schedule-events/publish?orgUnitId=${filters.groupId}&startDate=${start}&endDate=${end}`, { method: 'PUT' });
      toast.success(`${res?.data ?? 0} cours publiés.`);
      loadSchedule();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Publication impossible.');
    }
  };

  useEffect(() => {
    fetchWithAuth('/resources/tree').then(res => setResourceTree(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [currentDate, filters]);

  useEffect(() => {
    if (isModalOpen) {
      const extractArray = (res: any) => {
        if (res?.data?.content) return res.data.content;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      };

      fetchWithAuth('/org-units').then(res => setOrgUnits(extractArray(res))).catch(console.error);
    }
  }, [isModalOpen]);

  const renderTree = (node: any, level = 0) => {
    if (!node) return null;
    return (
      <div key={node.id} style={{ marginLeft: level > 0 ? '20px' : '0', paddingLeft: level > 0 ? '8px' : '0', borderLeft: level > 0 ? '1px solid var(--border)' : 'none', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontWeight: level === 0 ? 600 : 500, cursor: 'pointer' }}
             onClick={() => setFilters({ groupId: node.id, teacherId: '', roomId: '' })}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{level === 0 ? 'account_balance' : 'folder'}</span>
          <span style={{ color: filters.groupId === node.id ? 'var(--primary-dark)' : 'inherit' }}>{node.name}</span>
        </div>
        
        {node.children && node.children.map((child: any) => renderTree(child, level + 1))}
        
        {node.resources && node.resources.map((r: any) => (
           <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0', marginLeft: '20px', color: (filters.teacherId === r.id || filters.roomId === r.id) ? 'var(--primary-dark)' : 'inherit' }}>
             <input type="radio" name="resourceFilter" 
                    checked={filters.teacherId === r.id || filters.roomId === r.id} 
                    onChange={() => {
                      if (r.resourceType === 'TEACHER') setFilters({ groupId: '', teacherId: r.id, roomId: '' });
                      if (r.resourceType === 'ROOM') setFilters({ groupId: '', teacherId: '', roomId: r.id });
                    }} /> 
             {r.name} <small style={{opacity: 0.6}}>({r.resourceType})</small>
           </label>
        ))}
      </div>
    );
  };

  const getEventInlineStyle = (evt: UIMockupEvent) => {
    // Colors
    let bg = "", border = "", text = "", badgeBg = "", badgeText = "";
    if (evt.isConflict) {
      bg = "var(--danger-bg)";
      border = "var(--danger)";
      text = "var(--danger)";
      badgeBg = "var(--danger)";
      badgeText = "white";
    } else {
      const typeColors: Record<string, any> = {
        'cm': { bg: 'var(--cm-bg)', border: 'var(--cm-border)', text: 'var(--cm-text)' },
        'td': { bg: 'var(--td-bg)', border: 'var(--td-border)', text: 'var(--td-text)' },
        'tp': { bg: 'var(--tp-bg)', border: 'var(--tp-border)', text: 'var(--tp-text)' },
        'transversal': { bg: 'var(--info-bg)', border: 'var(--info)', text: 'var(--info)' },
      };
      const colors = typeColors[evt.type] || typeColors['cm'];
      bg = colors.bg; border = colors.border; text = colors.text;
      badgeBg = colors.border; badgeText = "white"; // For better contrast
    }

    // Geometry
    // 1 hour = 80px, starting at 8h
    const top = (evt.startHour - 6) * 80;
    const height = (evt.endHour - evt.startHour) * 80;

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: bg,
      borderLeftColor: border,
      color: text,
      '--badge-bg': badgeBg,
      '--badge-text': badgeText,
    } as React.CSSProperties;
  };

  const formatHourString = (decimalHour: number) => {
    const h = Math.floor(decimalHour);
    const m = Math.round((decimalHour - h) * 60);
    return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent, event: UIMockupEvent) => {
    e.dataTransfer.setData("eventId", event.id);
    const duration = event.endHour - event.startHour;
    e.dataTransfer.setData("duration", duration.toString());
  };

  const handleDrop = async (e: React.DragEvent, dayObj: any) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("eventId");
    const duration = parseFloat(e.dataTransfer.getData("duration"));
    if (!eventId || isNaN(duration)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const droppedHour = (y / 80) + 6;
    
    // Snap to 15 mins (0.25)
    const snappedHour = Math.round(droppedHour * 4) / 4;
    
    const startH = Math.floor(snappedHour);
    const startM = Math.round((snappedHour - startH) * 60);
    
    const startD = new Date(dayObj.date);
    startD.setHours(startH, startM, 0, 0);
    
    const endD = new Date(dayObj.date);
    const endSnapped = snappedHour + duration;
    const endH = Math.floor(endSnapped);
    const endM = Math.round((endSnapped - endH) * 60);
    endD.setHours(endH, endM, 0, 0);
    
    try {
      const toIsoStr = (d: Date) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      await fetchWithAuth(`/schedule-events/${eventId}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify({ startAt: toIsoStr(startD), endAt: toIsoStr(endD) })
      });
      toast.success("Cours déplacé avec succès");
      loadSchedule();
    } catch (err) {
      toast.error("Erreur lors du déplacement (vérifiez les conflits)");
    }
  };

  const handleDayColClick = (e: React.MouseEvent<HTMLDivElement>, dayObj: any) => {
    if ((e.target as HTMLElement).closest(`.${styles.eventCard}`)) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const clickedHour = (y / 80) + 6;
    const startHour = Math.floor(clickedHour);
    const startMinute = (clickedHour - startHour) >= 0.5 ? 30 : 0;
    
    const startD = new Date(dayObj.date);
    startD.setHours(startHour, startMinute, 0, 0);
    
    const endD = new Date(startD);
    endD.setMinutes(startD.getMinutes() + 90); // 1.5h par défaut
    
    setEditingEvent(undefined);
    setDefaultModalTime({ start: startD, end: endD });
    setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, evt: any) => {
    e.stopPropagation(); // Prevent triggering grid click
    setEditingEvent(evt.rawEvent);
    setDefaultModalTime(undefined);
    setIsModalOpen(true);
  };

  if (!isMounted) return null;

  return (
    <div className={styles.container}>
      {/* ---------------- PANNEAU GAUCHE ---------------- */}
      <aside className={styles.sidebar}>
        {/* MINI CALENDRIER */}
        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              {miniCalMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="topbar-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() - 1, 1))}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
              </button>
              <button className="topbar-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 1))}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '12px', gap: '4px 0' }}>
            {(() => {
              const days = getMiniCalendarDays(miniCalMonth);
              const weeks = [];
              for (let i = 0; i < days.length; i += 7) {
                weeks.push(days.slice(i, i + 7));
              }
              
              return weeks.map((week, wIdx) => {
                const isCurrentWeek = week.some(d => d.date.toDateString() === currentDate.toDateString());
                
                if (isCurrentWeek) {
                  return (
                    <div key={wIdx} style={{ gridColumn: 'span 7', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--primary-light)', borderRadius: '8px', padding: '2px 0' }}>
                      {week.map((d, i) => {
                        const isSelected = d.date.toDateString() === currentDate.toDateString();
                        const color = isSelected ? 'white' : (d.date.getDay() === 0 || d.date.getDay() === 6 ? 'var(--primary)' : 'var(--primary-dark)');
                        const bg = isSelected ? 'var(--primary)' : 'transparent';
                        const weight = isSelected ? 700 : (d.date.getDay() === 0 || d.date.getDay() === 6 ? 500 : 600);
                        return (
                          <span key={i} onClick={() => { setCurrentDate(d.date); setMiniCalMonth(new Date(d.date.getFullYear(), d.date.getMonth(), 1)); }}
                                style={{ background: bg, color, borderRadius: '4px', fontWeight: weight, padding: '2px 0', cursor: 'pointer' }}>
                            {d.num}
                          </span>
                        );
                      })}
                    </div>
                  );
                }
                
                return week.map((d, i) => {
                  const color = d.current ? (d.date.getDay() === 0 || d.date.getDay() === 6 ? 'var(--text-muted)' : 'var(--text-primary)') : 'var(--outline-variant)';
                  return (
                    <span key={i} onClick={() => { setCurrentDate(d.date); setMiniCalMonth(new Date(d.date.getFullYear(), d.date.getMonth(), 1)); }}
                          style={{ color, padding: '2px 0', cursor: 'pointer' }}>
                      {d.num}
                    </span>
                  );
                });
              });
            })()}
          </div>
        </div>

        {/* FILTRES RAPIDES */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Filtres Rapides</span>
            <span style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => { setQuickFilter('all'); setFilters({ groupId: '', teacherId: '', roomId: '' }); }}>Réinitialiser</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span onClick={() => setQuickFilter('all')} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, background: quickFilter === 'all' ? 'var(--primary-light)' : 'var(--surface-container-high)', color: quickFilter === 'all' ? 'var(--primary-dark)' : 'var(--text-secondary)', cursor: 'pointer' }}>Tout afficher</span>
            <span onClick={() => setQuickFilter('mine')} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, background: quickFilter === 'mine' ? 'var(--primary-light)' : 'var(--surface-container-high)', color: quickFilter === 'mine' ? 'var(--primary-dark)' : 'var(--text-secondary)', cursor: 'pointer' }}>Mes cours</span>
            <span onClick={() => setQuickFilter('free')} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, background: quickFilter === 'free' ? 'var(--primary-light)' : 'var(--surface-container-high)', color: quickFilter === 'free' ? 'var(--primary-dark)' : 'var(--text-secondary)', cursor: 'pointer' }}>Salles libres</span>
          </div>
        </div>

        {/* ARBRE DES RESSOURCES */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-muted)' }}>filter_alt</span>
              <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ressources à afficher</h3>
            </div>
          </div>
          
          <div style={{ fontSize: '12px' }}>
            {resourceTree?.institution && (
               <div style={{ fontSize: '12px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontWeight: 600 }}>
                   <span>🏛️ {resourceTree.institution.name}</span>
                 </div>
                 {resourceTree.institution.rootUnits?.map((u: any) => renderTree(u, 1))}
               </div>
            )}
          </div>
        </div>
      </aside>

      {/* ---------------- ESPACE PRINCIPAL ---------------- */}
      <main className={styles.mainArea}>
        {/* TOP TOOLBAR */}
        <div className={styles.toolbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--surface-container-low)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <button className="topbar-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span></button>
              <button style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setCurrentDate(new Date())}>Aujourd'hui</button>
              <button className="topbar-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', whiteSpace: 'nowrap' }}>
              <span style={{ padding: '4px 8px', borderRadius: '6px', fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary-dark)', border: '1px solid #dbeafe' }}>
                {formatWeekRange(weekDays[0].date, weekDays[6].date)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', background: 'var(--surface-container-low)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 500 }}>
              <button onClick={() => setViewMode('day')} style={{ padding: '4px 10px', border: 'none', background: viewMode === 'day' ? 'var(--surface)' : 'transparent', color: viewMode === 'day' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: viewMode === 'day' ? 600 : 500, borderRadius: '6px', boxShadow: viewMode === 'day' ? 'var(--shadow-xs)' : 'none', cursor: 'pointer' }}>Jour</button>
              <button onClick={() => setViewMode('week')} style={{ padding: '4px 10px', border: 'none', background: viewMode === 'week' ? 'var(--surface)' : 'transparent', color: viewMode === 'week' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: viewMode === 'week' ? 600 : 500, borderRadius: '6px', boxShadow: viewMode === 'week' ? 'var(--shadow-xs)' : 'none', cursor: 'pointer' }}>Semaine</button>
              <button onClick={() => setViewMode('month')} style={{ padding: '4px 10px', border: 'none', background: viewMode === 'month' ? 'var(--surface)' : 'transparent', color: viewMode === 'month' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: viewMode === 'month' ? 600 : 500, borderRadius: '6px', boxShadow: viewMode === 'month' ? 'var(--shadow-xs)' : 'none', cursor: 'pointer' }}>Mois</button>
            </div>
            <button onClick={() => setIsBulkCancelModalOpen(true)} className="topbar-icon-btn" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', width: 'auto', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
              Force Majeure
            </button>
            <a href="/admin/export" className="topbar-icon-btn" style={{ border: '1px solid var(--border)' }} title="Exporter / imprimer" aria-label="Exporter ou imprimer">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
            </a>
            <button
              className="btn btn-outline"
              style={{ flexShrink: 0 }}
              disabled={!filters.groupId || draftCount === 0}
              title={!filters.groupId ? 'Sélectionnez une classe pour publier son emploi du temps' : draftCount === 0 ? 'Aucun brouillon cette semaine' : ''}
              onClick={publishWeek}
            >
              <span className="material-symbols-outlined">publish</span>
              Publier{draftCount > 0 ? ` (${draftCount})` : ''}
            </button>
            <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={() => { setEditingEvent(undefined); setDefaultModalTime(undefined); setIsModalOpen(true); }}>
              <span className="material-symbols-outlined">add</span>
              Planifier un cours
            </button>
          </div>
        </div>

        {/* TIMETABLE SCROLL AREA */}
        <div className={styles.scrollArea}>
          {viewMode === 'month' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', flexShrink: 0 }}>
                <span>LUN</span><span>MAR</span><span>MER</span><span>JEU</span><span>VEN</span><span>SAM</span><span>DIM</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', gridAutoRows: 'minmax(60px, 1fr)' }}>
                {getMiniCalendarDays(currentDate).map((d, i) => {
                  const isSelected = d.date.toDateString() === currentDate.toDateString();
                  return (
                    <div key={i} onClick={() => { setCurrentDate(d.date); setViewMode('day'); }} style={{ background: isSelected ? 'var(--primary-light)' : (d.current ? 'var(--surface)' : 'var(--surface-container-low)'), border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '8px', padding: '8px', minHeight: '60px', opacity: d.current ? 1 : 0.5, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--primary-dark)' : 'var(--text-primary)', fontSize: '14px' }}>{d.num}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
          <div className={styles.gridWrapper}>
            
            {/* Day Headers */}
            <div className={styles.dayHeaders} style={gridStyle}>
              <div className={styles.timeColumnHeader}></div>
              {displayedDays.map((day, i) => {
                const isToday = new Date().toDateString() === day.date.toDateString();
                return (
                  <div key={i} className={`${styles.headerCell} ${isToday ? styles.headerCellActive : ''}`}>
                    <span className={`${styles.dayName} ${isToday ? styles.dayNameActive : ''}`}>{day.short}</span>
                    <span className={`${styles.dayNumber} ${isToday ? styles.dayNumberActive : ''}`}>{day.num}</span>
                  </div>
                );
              })}
            </div>

            {/* Grid Scroll Area */}
            <div className={styles.timetableScroll}>
              
              {/* Red Time Indicator Line (example 10:45) */}
              {new Date().toDateString() === currentDate.toDateString() && (
                <div className={styles.redIndicator} style={{ top: `${(new Date().getHours() - 6) * 80 + (new Date().getMinutes() / 60) * 80}px` }}>
                  <div className={styles.redIndicatorTime}>{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</div>
                  <div className={styles.redIndicatorDot}></div>
                  <div className={styles.redIndicatorLine}></div>
                </div>
              )}

              <div className={styles.timetableGrid} style={gridStyle}>
                {/* TIME LABELS COL */}
                <div className={styles.timeCol}>
                  {hours.map(h => (
                    <div key={h} className={styles.timeSlot}>
                      <div className={styles.hourText}>{h.toString().padStart(2, '0')}h00</div>
                      <div className={styles.halfHourText}>{h.toString().padStart(2, '0')}h30</div>
                    </div>
                  ))}
                </div>

                {/* COLUMNS */}
                {displayedDays.map((dayObj, dayIdx) => {
                  const originalDayIndex = (dayObj.date.getDay() + 6) % 7;
                  const dayEvents = events.filter(e => e.dayIndex === originalDayIndex);
                  return (
                    <div key={dayIdx} 
                         className={styles.dayCol}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={(e) => handleDrop(e, dayObj)}
                         onClick={(e) => handleDayColClick(e, dayObj)}
                         style={{ cursor: 'crosshair' }}
                    >
                      {/* Background Guidelines */}
                      <div className={styles.dayColLines}>
                        {hours.map(h => (
                          <div key={h} className={styles.timeSlot}>
                            <div className={styles.lineHalf}></div>
                          </div>
                        ))}
                      </div>

                      {/* Events */}
                      {dayEvents.map((evt) => {
                        const styleObj = getEventInlineStyle(evt);
                        return (
                          <div key={evt.id} 
                               className={styles.eventCard} 
                               style={styleObj}
                               draggable={true}
                               onDragStart={(e) => handleDragStart(e, evt)}
                               onClick={(e) => handleEventClick(e, evt)} // Open edit modal
                          >
                            <div className={styles.eventHeader}>
                              {evt.isConflict ? (
                                <span className={styles.eventBadge} style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                                  ANNULÉ
                                </span>
                              ) : evt.isDraft ? (
                                <span className={styles.eventBadge} style={{ background: 'var(--warning-bg, #FFFBEB)', color: 'var(--warning, #B45309)' }} title="Non publié : invisible pour les élèves et les enseignants">
                                  BROUILLON
                                </span>
                              ) : (
                                <span className={styles.eventBadge} style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                                  {evt.type}
                                </span>
                              )}
                              <span className={styles.eventTime}>
                                {formatHourString(evt.startHour)} - {formatHourString(evt.endHour)}
                              </span>
                            </div>
                            
                            <div className={styles.eventTitle}>{evt.title}</div>

                            {evt.isConflict ? (
                              <>
                                <div style={{ fontSize: '11px', marginTop: '4px' }}>{evt.conflictDetails}</div>
                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '10px', fontWeight: 600, textDecoration: 'underline' }}>Résoudre</span>
                                </div>
                              </>
                            ) : (
                              <div className={styles.eventDetails}>
                                <div className={styles.eventDetailRow}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 12, opacity: 0.7 }}>person</span>
                                  <span>{evt.teacher}</span>
                                </div>
                                <div className={styles.eventDetailRow}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 12, opacity: 0.7 }}>location_on</span>
                                  <span style={{ fontWeight: 600 }}>{evt.location}</span>
                                </div>
                                <div className={styles.eventDetailRow}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 12, opacity: 0.7 }}>group</span>
                                  <span style={{ color: 'var(--badge-bg)', fontWeight: 600 }}>{evt.group}</span>
                                </div>
                                {evt.extraInfo && (
                                  <div style={{ paddingTop: '8px', marginTop: '8px', borderTop: '1px solid currentColor', opacity: 0.8 }}>
                                    {evt.extraInfo}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          )}
        </div>
      </main>

      {/* ---------------- MODAL ---------------- */}
      <TimetableModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setDefaultModalTime(undefined); setEditingEvent(undefined); }}
        onSave={() => {
          setIsModalOpen(false);
          setDefaultModalTime(undefined);
          setEditingEvent(undefined);
          loadSchedule();
        }}
        defaultTime={defaultModalTime}
        existingEvent={editingEvent}
        orgUnits={orgUnits}
      />
      <BulkCancelModal 
        isOpen={isBulkCancelModalOpen}
        onClose={() => setIsBulkCancelModalOpen(false)}
        onSuccess={() => loadSchedule()}
        defaultDate={currentDate}
      />
    </div>
  );
}
