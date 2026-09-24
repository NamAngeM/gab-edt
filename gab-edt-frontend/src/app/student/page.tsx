"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth, extractArray , formatDateLocal} from '@/lib/api';

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      setUserName(user.firstName || 'Étudiant');
    } catch {
      setUserName('Étudiant');
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const today = formatDateLocal(new Date());
        const [eventsRes, annRes] = await Promise.all([
          fetchWithAuth(`/schedule-events?startDate=${today}&endDate=${today}`),
          fetchWithAuth('/communication/announcements').catch(() => ({ data: [] }))
        ]);
        
        const allEvents = extractArray(eventsRes);
        allEvents.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        setEvents(allEvents.slice(0, 4));

        const annData = extractArray(annRes);
        setAnnouncements(annData.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-brand-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bonjour, {userName} 👋</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg">
            Bienvenue sur votre espace étudiant. Voici un aperçu de votre journée et de vos prochaines échéances.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Vos cours du jour</h2>
              </div>
              <Link href="/student/timetable" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                Voir tout le planning
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 animate-pulse">
                    <div className="w-16 h-12 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-400">
                  <span className="material-symbols-outlined text-3xl">free_cancellation</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">Aucun cours aujourd'hui</h3>
                <p className="text-slate-500 mt-1">Profitez de votre journée pour réviser ou vous reposer.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-100"></div>
                <div className="space-y-6 relative">
                  {events.map((evt, idx) => {
                    const isPassed = new Date(evt.endAt) < new Date();
                    const isCurrent = new Date(evt.startAt) <= new Date() && new Date(evt.endAt) >= new Date();
                    
                    return (
                      <div key={evt.id || idx} className={`flex gap-6 ${isPassed ? 'opacity-60' : ''}`}>
                        <div className="flex flex-col items-center z-10 w-16 flex-shrink-0">
                          <span className={`text-sm font-bold ${isCurrent ? 'text-brand-600' : 'text-slate-700'}`}>
                            {formatTime(evt.startAt)}
                          </span>
                          <span className="text-xs text-slate-400">{formatTime(evt.endAt)}</span>
                        </div>
                        <div className={`flex-1 p-5 rounded-xl border ${
                          isCurrent 
                            ? 'bg-brand-50 border-brand-200 shadow-sm shadow-brand-100' 
                            : 'bg-white border-slate-200 hover:border-slate-300 transition-colors'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-bold text-lg ${isCurrent ? 'text-brand-900' : 'text-slate-900'}`}>
                              {evt.title}
                            </h3>
                            {isCurrent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-100 text-brand-700">
                                En cours
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">meeting_room</span>
                              <span>{evt.room?.name || evt.roomName || 'Salle à définir'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                              <span>{evt.teacher?.user?.lastName || evt.teacherName || 'Enseignant inconnu'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Announcements & Quick Links */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Annonces</h2>
            </div>
            
            <div className="space-y-4">
              {announcements.length > 0 ? announcements.map((ann, idx) => (
                <div key={ann.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-slate-800 text-sm">{ann.title}</h4>
                    {ann.targetAudience && (
                      <span className="text-[10px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                        {ann.targetAudience}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )) : (
                <div className="text-center py-6 text-sm text-slate-500">
                  Aucune annonce récente.
                </div>
              )}
            </div>
            
            <button className="w-full mt-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              Voir toutes les annonces
            </button>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>school</span>
            </div>
            <h2 className="text-lg font-bold mb-2 relative z-10">Soutenances PFE</h2>
            <p className="text-brand-100 text-sm mb-6 relative z-10">
              Votre soutenance de fin d'études approche. Consultez votre planning et votre jury assigné.
            </p>
            <Link 
              href="/student/evaluations"
              className="inline-flex items-center justify-center w-full bg-white text-brand-700 hover:bg-brand-50 font-bold py-2.5 px-4 rounded-xl transition-colors relative z-10"
            >
              Consulter ma soutenance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
