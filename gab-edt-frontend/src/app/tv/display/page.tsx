"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, MapPin, CalendarDays, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Types
interface ClassSession {
  id: string;
  course: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  status: 'ONGOING' | 'UPCOMING' | 'FINISHED';
  type: string;
}

export default function TvDisplayPage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('t') || 'DARK';
  const building = searchParams.get('b') || 'CAMPUS CENTRAL';

  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    setIsMounted(true);
    // Force dark mode if required
    if (theme === 'DARK') {
      document.documentElement.classList.add('dark');
    }
    
    // Live clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [theme]);

  // Mock data for TV
  const sessions: ClassSession[] = [
    { id: '1', course: 'Algorithmie Avancée', teacher: 'Dr. Dupont', room: 'Amphi A', startTime: '08:00', endTime: '10:00', status: 'ONGOING', type: 'CM' },
    { id: '2', course: 'Bases de Données', teacher: 'Mme. Martin', room: 'Salle 102', startTime: '08:30', endTime: '10:30', status: 'ONGOING', type: 'TD' },
    { id: '3', course: 'Réseaux', teacher: 'M. Bernard', room: 'Labo Cisco', startTime: '09:00', endTime: '12:00', status: 'ONGOING', type: 'TP' },
    { id: '4', course: 'Mathématiques Discrètes', teacher: 'Dr. Simon', room: 'Amphi B', startTime: '10:15', endTime: '12:15', status: 'UPCOMING', type: 'CM' },
    { id: '5', course: 'Développement Web', teacher: 'Mme. Petit', room: 'Salle 204', startTime: '10:45', endTime: '12:45', status: 'UPCOMING', type: 'TD' },
    { id: '6', course: 'Intelligence Artificielle', teacher: 'Dr. Moreau', room: 'Amphi A', startTime: '13:30', endTime: '15:30', status: 'UPCOMING', type: 'CM' },
  ];

  const ongoing = sessions.filter(s => s.status === 'ONGOING');
  const upcoming = sessions.filter(s => s.status === 'UPCOMING');

  const timeString = isMounted ? currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';
  const dateString = isMounted ? currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Chargement...';

  return (
    <div className={`min-h-screen ${theme === 'DARK' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-hidden flex flex-col font-sans`}>
      
      {/* HEADER */}
      <header className={`flex items-center justify-between p-6 ${theme === 'DARK' ? 'bg-slate-900/80 border-b border-slate-800' : 'bg-white shadow-sm'} shrink-0 z-10`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <CalendarDays className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">GAB-EDT <span className="text-brand-500 text-2xl font-semibold opacity-80">TV</span></h1>
            <div className="flex items-center gap-2 mt-1 opacity-70">
              <MapPin className="w-4 h-4" />
              <span className="text-lg font-medium tracking-wide uppercase">{building.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-5xl font-black tabular-nums tracking-tight text-brand-500 drop-shadow-md">
            {timeString}
          </div>
          <div className="text-xl font-medium mt-1 capitalize opacity-80">
            {dateString}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden">
        
        {/* COURS EN COURS */}
        <div className="col-span-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-2xl font-bold tracking-tight uppercase">Cours en cours</h2>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {ongoing.map((session, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={session.id} 
                className={`flex items-stretch ${theme === 'DARK' ? 'bg-slate-900/50 border border-slate-800' : 'bg-white shadow-md border border-slate-100'} rounded-2xl overflow-hidden`}
              >
                <div className="w-32 bg-brand-600 flex flex-col items-center justify-center text-white shrink-0">
                  <span className="text-2xl font-black">{session.room}</span>
                  <span className="text-sm font-semibold opacity-80 bg-black/20 px-3 py-1 rounded-full mt-2">{session.type}</span>
                </div>
                <div className="p-6 flex-1 flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold">{session.course}</h3>
                    <p className={`text-xl mt-2 ${theme === 'DARK' ? 'text-slate-400' : 'text-slate-600'}`}>{session.teacher}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold tracking-tighter tabular-nums">{session.startTime} - {session.endTime}</div>
                    <div className="text-brand-500 font-semibold mt-1">En cours</div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {ongoing.length === 0 && (
              <div className={`flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${theme === 'DARK' ? 'border-slate-800' : 'border-slate-200'}`}>
                <AlertCircle className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
                <p className="text-xl font-medium text-slate-500">Aucun cours en ce moment</p>
              </div>
            )}
          </div>
        </div>

        {/* PROCHAINS COURS */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold tracking-tight uppercase">À venir</h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {upcoming.map((session, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={session.id} 
                className={`flex flex-col p-5 rounded-2xl border-l-4 border-l-emerald-500 ${theme === 'DARK' ? 'bg-slate-900/50' : 'bg-white shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-lg font-black">{session.room}</span>
                  <span className="text-lg font-bold tabular-nums text-emerald-500">{session.startTime}</span>
                </div>
                <h3 className="text-xl font-bold line-clamp-1">{session.course}</h3>
                <p className={`text-md mt-1 ${theme === 'DARK' ? 'text-slate-400' : 'text-slate-500'}`}>{session.teacher}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER INFO TICKER */}
      <div className={`py-3 px-6 text-sm font-medium tracking-widest uppercase flex justify-between ${theme === 'DARK' ? 'bg-brand-950 text-brand-400' : 'bg-brand-50 text-brand-700'}`}>
        <span>Actualisation Automatique</span>
        <span>GAB-EDT • Gestion des emplois du temps</span>
      </div>
    </div>
  );
}
