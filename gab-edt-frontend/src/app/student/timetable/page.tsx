'use client';
import React, { useState, useEffect } from 'react';
import styles from '@/app/admin/timetable/timetable.module.css';
import { fetchWithAuth , formatDateLocal} from '@/lib/api';
import { COURSE_PALETTE, colorIndexFor } from '@/lib/courseColors';

const HOUR_PX = 80;
const GRID_START_HOUR = 6;
const EVENT_GAP_PX = 3;

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
  isCancelled?: boolean;
  delayMinutes?: number;
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

export default function StudentTimetablePage() {
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 à 21

  const [isMounted, setIsMounted] = useState(false);
  const [events, setEvents] = useState<UIMockupEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekDays = getWeekDays(currentDate);
  const gridStyle = { gridTemplateColumns: `60px repeat(${weekDays.length}, minmax(140px, 1fr))` };

  const loadSchedule = async () => {
    const start = formatDateLocal(weekDays[0].date);
    const end = formatDateLocal(weekDays[6].date);
    
    // Pour l'étudiant, on récupère le planning de sa semaine
    // Le backend devrait filtrer en fonction du JWT si on ne passe pas de filtres (ou si on lui passe un endpoint spécifique).
    // Ici, on requête le même endpoint en considérant qu'il renverra les events de l'étudiant ou qu'on passera un paramètre si nécessaire plus tard.
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
          location: evt.room?.name || '',
          group: evt.group?.name || '',
          dayIndex: (dStart.getDay() + 6) % 7,
          startHour: dStart.getHours() + (dStart.getMinutes() / 60),
          endHour: dEnd.getHours() + (dEnd.getMinutes() / 60),
          isConflict: evt.status === 'CONFLICT',
          isCancelled: evt.status === 'CANCELLED',
          delayMinutes: evt.delayMinutes || 0,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, isMounted]);

  const getEventInlineStyle = (evt: UIMockupEvent) => {
    let bg = "", border = "", text = "", badgeBg = "", badgeText = "";
    
    const colors = COURSE_PALETTE[colorIndexFor(evt.title)];
    bg = colors.bg; border = colors.border; text = colors.text;
    badgeBg = colors.border; badgeText = "white";

    const top = (evt.startHour - GRID_START_HOUR) * HOUR_PX + EVENT_GAP_PX;
    const height = (evt.endHour - evt.startHour) * HOUR_PX - EVENT_GAP_PX * 2;

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: evt.isCancelled ? '#f1f5f9' : bg,
      borderLeftColor: evt.isCancelled ? '#94a3b8' : border,
      color: evt.isCancelled ? '#64748b' : text,
      opacity: evt.isCancelled ? 0.7 : 1,
      '--badge-bg': evt.isCancelled ? '#94a3b8' : badgeBg,
      '--badge-text': badgeText,
    } as React.CSSProperties;
  };

  const formatHourString = (decimalHour: number) => {
    const h = Math.floor(decimalHour);
    const m = Math.round((decimalHour - h) * 60);
    return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`;
  };

  if (!isMounted) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
      {/* TOOLBAR */}
      <div className={styles.toolbar} style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className="text-xl font-bold text-slate-800">Mon Planning</h1>
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
              <span style={{ padding: '4px 8px', borderRadius: '6px', fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary-dark)', border: '1px solid #dbeafe' }}>
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

      {/* GRID */}
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
              <div className={styles.redIndicator} style={{ top: `${(new Date().getHours() - GRID_START_HOUR) * HOUR_PX + (new Date().getMinutes() / 60) * HOUR_PX}px` }}>
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
                  <div key={dayIdx} className={styles.dayCol}>
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
                        <div key={evt.id} className={`${styles.eventCard} ${evt.endHour - evt.startHour < 1.5 ? styles.eventCardCompact : ""}`} style={styleObj}>
                          <div className={styles.eventHeader}>
                            <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                              <span className={styles.eventBadge} style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>{evt.type}</span>
                              {evt.isCancelled && <span className={styles.eventBadge} style={{ background: '#ef4444', color: 'white' }}>ANNULÉ</span>}
                              {!!evt.delayMinutes && <span className={styles.eventBadge} style={{ background: '#f59e0b', color: 'white' }}>+{evt.delayMinutes} MIN</span>}
                            </div>
                            <span className={styles.eventTime} style={{ textDecoration: evt.isCancelled ? 'line-through' : 'none' }}>
                              {formatHourString(evt.startHour)} - {formatHourString(evt.endHour)}
                            </span>
                          </div>
                          <div className={styles.eventTitle} style={{ textDecoration: evt.isCancelled ? 'line-through' : 'none' }}>{evt.title}</div>
                          <div className={styles.eventDetails}>
                            <div className={styles.eventDetailRow}>
                              <span className="material-symbols-outlined" style={{ fontSize: 12, opacity: 0.7 }}>person</span>
                              <span>{evt.teacher}</span>
                            </div>
                            <div className={styles.eventDetailRow}>
                              <span className="material-symbols-outlined" style={{ fontSize: 12, opacity: 0.7 }}>location_on</span>
                              <span style={{ fontWeight: 600 }}>{evt.location}</span>
                            </div>
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
    </div>
  );
}
