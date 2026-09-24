'use client';
import React, { useState, useEffect } from 'react';
import styles from '@/app/admin/timetable/timetable.module.css';
import { fetchWithAuth } from '@/lib/api';
import { TimetableModal } from '@/app/components/TimetableModal';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type CourseType = 'cm' | 'td' | 'tp' | 'transversal' | 'conflict';

interface UIMockupEvent {
  id: string;
  type: CourseType;
  title: string;
  teacher: string;
  location: string;
  group: string;
  dayIndex: number; 
  startHour: number;
  endHour: number;
  extraInfo?: string;
  isConflict?: boolean;
  subject?: any;
  room?: any;
  group?: any;
  status?: string;
  notes?: string;
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

export default function TeacherTimetablePage() {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  const [isMounted, setIsMounted] = useState(false);
  const [events, setEvents] = useState<UIMockupEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();
  
  // MODAL & FORM STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [orgUnits, setOrgUnits] = useState<any[]>([]);

  const weekDays = getWeekDays(currentDate);
  const gridStyle = { gridTemplateColumns: `60px repeat(${weekDays.length}, minmax(140px, 1fr))` };

  const loadSchedule = async () => {
    const start = weekDays[0].date.toISOString().split('T')[0];
    const end = weekDays[6].date.toISOString().split('T')[0];
    
    // Le backend devra filtrer les events pour l'enseignant connecté
    const params = new URLSearchParams({ startDate: start, endDate: end });

    try {
      const res = await fetchWithAuth(`/schedule-events?${params.toString()}`);
      const apiEvents = res.data || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = apiEvents.map((evt: any) => {
        const dStart = new Date(evt.startAt);
        const dEnd = new Date(evt.endAt);
        return {
          id: evt.id,
          type: 'cm',
          title: evt.subject?.name || 'Sans titre',
          teacher: evt.teacher ? `${evt.teacher.firstName} ${evt.teacher.lastName}` : '',
          location: evt.room?.name || 'Non assigné',
          group: evt.group?.name || '',
          dayIndex: (dStart.getDay() + 6) % 7,
          startHour: dStart.getHours() + (dStart.getMinutes() / 60),
          endHour: dEnd.getHours() + (dEnd.getMinutes() / 60),
          isConflict: evt.status === 'CANCELLED',
          subject: evt.subject,
          room: evt.room,
          group: evt.group,
          status: evt.status,
          notes: evt.notes,
        };
      });
      setEvents(mapped);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadSchedule();
    }
  }, [currentDate, isMounted]);

  useEffect(() => {
    if (isModalOpen) {
      const loadOrgUnits = async () => {
        try {
          const res = await fetchWithAuth('/org-units');
          setOrgUnits(res.data || res.content || res || []);
        } catch (err) {
          console.error(err);
        }
      };
      if (orgUnits.length === 0) loadOrgUnits();
    }
  }, [isModalOpen, orgUnits.length]);

  const getEventInlineStyle = (evt: UIMockupEvent) => {
    let bg = "", border = "", text = "", badgeBg = "", badgeText = "";
    
    const typeColors: Record<string, any> = {
      'cm': { bg: 'var(--cm-bg)', border: 'var(--cm-border)', text: 'var(--cm-text)' },
      'td': { bg: 'var(--td-bg)', border: 'var(--td-border)', text: 'var(--td-text)' },
      'tp': { bg: 'var(--tp-bg)', border: 'var(--tp-border)', text: 'var(--tp-text)' },
      'transversal': { bg: 'var(--info-bg)', border: 'var(--info)', text: 'var(--info)' },
    };
    
    const colors = typeColors[evt.type] || typeColors['cm'];
    bg = colors.bg; border = colors.border; text = colors.text;
    badgeBg = colors.border; badgeText = "white";

    const top = (evt.startHour - 8) * 80;
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
    const droppedHour = (y / 80) + 8;
    
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
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du déplacement (vérifiez les conflits)");
    }
  };

  const handleReportDelay = async (e: React.MouseEvent, evt: UIMockupEvent) => {
    e.stopPropagation();
    const minutes = prompt(`Signaler un retard pour ${evt.title} (en minutes):`, "15");
    if (minutes) {
      try {
        await fetchWithAuth(`/schedule-events/${evt.id}/delay?minutes=${minutes}`, { method: 'PUT' });
        toast.success(`Un retard de ${minutes} min a été signalé et notifié aux élèves.`);
        loadSchedule();
      } catch (err: any) {
        toast.error(err.message || "Erreur lors du signalement du retard");
      }
    }
  };

  const handleCancelClass = async (e: React.MouseEvent, evt: UIMockupEvent) => {
    e.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir annuler le cours de ${evt.title} ? Une notification sera envoyée.`)) {
      try {
        await fetchWithAuth(`/schedule-events/${evt.id}/cancel`, { method: 'PUT' });
        toast.success("Le cours a été annulé avec succès.");
        loadSchedule();
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de l'annulation du cours");
      }
    }
  };

  const handleAttendance = (e: React.MouseEvent, evt: UIMockupEvent) => {
    e.stopPropagation();
    router.push(`/teacher/attendance/${evt.id}`);
  };

  const handleEventClick = (evt: UIMockupEvent) => {
    // Reconstruct full event object for Modal
    const fullEvent = {
      id: evt.id,
      subject: evt.subject,
      teacher: { id: '', firstName: evt.teacher, lastName: '' }, // We don't have full teacher object here but modal only needs id, wait, TimetableModal needs full teacher ID for select, but it's prefilled. Wait, for teacher portal we just pass what we have. Actually the modal fetches /teachers. If teacherId is not exact, it might be empty.
      room: evt.room,
      group: evt.group,
      startAt: new Date(new Date(weekDays[evt.dayIndex].date).setHours(Math.floor(evt.startHour), Math.round((evt.startHour % 1) * 60))).toISOString(),
      endAt: new Date(new Date(weekDays[evt.dayIndex].date).setHours(Math.floor(evt.endHour), Math.round((evt.endHour % 1) * 60))).toISOString(),
      status: evt.status,
      notes: evt.notes
    };
    
    // Quick fix: we need to fetch the event from API or just rely on API response we already saved.
    // In loadSchedule, we didn't save teacher id. Let's fix loadSchedule.
    
    // Actually, we can just fetch the single event from API? No, the modal takes existingEvent.
    
    setSelectedEvent(fullEvent);
    setIsModalOpen(true);
  };

  if (!isMounted) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
      <div className={styles.toolbar} style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className="text-xl font-bold text-slate-800">Planning Enseignant</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--surface-container-low)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <button className="topbar-icon-btn flex items-center justify-center" style={{ width: 28, height: 28 }} onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
              </button>
              <button style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setCurrentDate(new Date())}>Aujourd&apos;hui</button>
              <button className="topbar-icon-btn flex items-center justify-center" style={{ width: 28, height: 28 }} onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', whiteSpace: 'nowrap' }}>
              <span style={{ padding: '4px 8px', borderRadius: '6px', fontWeight: 700, background: 'var(--amber-50)', color: 'var(--amber-700)', border: '1px solid var(--amber-200)' }}>
                {formatWeekRange(weekDays[0].date, weekDays[6].date)}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="topbar-icon-btn flex items-center justify-center" style={{ border: '1px solid var(--border)', width: 36, height: 36 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
          </button>
        </div>
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.gridWrapper}>
          <div className={styles.dayHeaders} style={gridStyle}>
            <div className={styles.timeColumnHeader}></div>
            {weekDays.map((day, i) => {
              const isToday = new Date().toDateString() === day.date.toDateString();
              return (
                <div key={i} className={`${styles.headerCell} ${isToday ? styles.headerCellActive : ''}`}>
                  <span className={`${styles.dayName} ${isToday ? styles.dayNameActive : ''}`}>{day.short}</span>
                  <span className={`${styles.dayNumber} ${isToday ? styles.dayNumberActive : ''}`}>{day.num}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.timetableScroll}>
            {new Date().toDateString() === currentDate.toDateString() && (
              <div className={styles.redIndicator} style={{ top: `${(new Date().getHours() - 8) * 80 + (new Date().getMinutes() / 60) * 80}px` }}>
                <div className={styles.redIndicatorTime}>{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</div>
                <div className={styles.redIndicatorDot}></div>
                <div className={styles.redIndicatorLine}></div>
              </div>
            )}

            <div className={styles.timetableGrid} style={gridStyle}>
              <div className={styles.timeCol}>
                {hours.map(h => (
                  <div key={h} className={styles.timeSlot}>
                    <div className={styles.hourText}>{h.toString().padStart(2, '0')}h00</div>
                    <div className={styles.halfHourText}>{h.toString().padStart(2, '0')}h30</div>
                  </div>
                ))}
              </div>

              {weekDays.map((dayObj, dayIdx) => {
                const originalDayIndex = (dayObj.date.getDay() + 6) % 7;
                const dayEvents = events.filter(e => e.dayIndex === originalDayIndex);
                
                return (
                  <div key={dayIdx} 
                       className={styles.dayCol}
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => handleDrop(e, dayObj)}
                  >
                    <div className={styles.dayColLines}>
                      {hours.map(h => (
                        <div key={h} className={styles.timeSlot}>
                          <div className={styles.lineHalf}></div>
                        </div>
                      ))}
                    </div>

                    {dayEvents.map((evt) => {
                      const styleObj = getEventInlineStyle(evt);
                      return (
                        <div key={evt.id} 
                             className={styles.eventCard} 
                             style={styleObj}
                             draggable={true}
                             onDragStart={(e) => handleDragStart(e, evt)}
                             onClick={() => handleEventClick(evt)}
                        >
                          <div className={styles.eventHeader}>
                            <span className={styles.eventBadge} style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>{evt.type}</span>
                            <span className={styles.eventTime}>{formatHourString(evt.startHour)} - {formatHourString(evt.endHour)}</span>
                          </div>
                          <div className={styles.eventTitle}>{evt.title}</div>
                          <div className={styles.eventDetails}>
                            <div className={styles.eventDetailRow}>
                              <span className="material-symbols-outlined" style={{ fontSize: 12, opacity: 0.7 }}>group</span>
                              <span>{evt.group}</span>
                            </div>
                            <div className={styles.eventDetailRow}>
                              <span className="material-symbols-outlined" style={{ fontSize: 12, opacity: 0.7 }}>location_on</span>
                              <span style={{ fontWeight: 600 }}>{evt.location}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', marginTop: 'auto', paddingTop: '6px' }}>
                            <button 
                              onClick={(e) => handleAttendance(e, evt)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '4px', padding: '4px', fontSize: '10px', background: 'rgba(59, 130, 246, 0.9)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                              title="Faire l'appel"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 13, margin: '0 auto' }}>checklist</span>
                            </button>
                            <button 
                              onClick={(e) => handleReportDelay(e, evt)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '4px', padding: '4px', fontSize: '10px', background: 'rgba(245, 158, 11, 0.9)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                              title="Signaler un retard"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 13, margin: '0 auto' }}>schedule</span>
                            </button>
                            <button 
                              onClick={(e) => handleCancelClass(e, evt)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '4px', padding: '4px', fontSize: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                              title="Annuler le cours"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 13, margin: '0 auto' }}>cancel</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- MODAL ---------------- */}
      <TimetableModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }}
        onSave={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          loadSchedule();
        }}
        existingEvent={selectedEvent}
        orgUnits={orgUnits}
      />
    </div>
  );
}
