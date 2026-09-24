"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth, extractArray } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const [userName, setUserName] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      setUserName(user.firstName || 'Enseignant');
    } catch {
      setUserName('Enseignant');
    }

    const loadTodayEvents = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetchWithAuth(`/schedule-events?startDate=${today}&endDate=${today}`);
        const allEvents = extractArray(res);
        
        allEvents.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        setEvents(allEvents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadTodayEvents();
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-amber-50 to-white">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bonjour, {userName} ! 👋</h1>
        <p className="text-slate-600">Bienvenue sur votre espace enseignant. Voici un aperçu de vos activités de la journée.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Mon Planning</h3>
            <p className="text-sm text-slate-500 mb-4">Consultez votre emploi du temps et les salles de vos prochains cours.</p>
          </div>
          <Link href="/teacher/timetable" className="text-brand-600 font-semibold text-sm hover:text-brand-700 flex items-center">
            Voir le planning <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Mes Classes</h3>
            <p className="text-sm text-slate-500 mb-4">Retrouvez la liste des groupes et classes dans lesquels vous intervenez.</p>
          </div>
          <Link href="/teacher/evaluations" className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 flex items-center">
            Gérer les classes <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">settings</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Paramètres</h3>
            <p className="text-sm text-slate-500 mb-4">Gérez votre profil, vos informations de contact et votre mot de passe.</p>
          </div>
          <Link href="/teacher/settings" className="text-slate-600 font-semibold text-sm hover:text-slate-700 flex items-center">
            Modifier le profil <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <span className="material-symbols-outlined mr-2 text-amber-600">schedule</span>
            Vos cours aujourd'hui
          </h3>
          <Link href="/teacher/timetable" className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline">
            Gérer le planning
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
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
          <div className="text-center py-8 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
              <span className="material-symbols-outlined text-2xl">free_cancellation</span>
            </div>
            <h3 className="text-base font-bold text-slate-700">Aucun cours aujourd'hui</h3>
            <p className="text-slate-500 text-sm mt-1">Vous n'avez pas de cours programmés pour cette journée.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt, idx) => {
              const isPassed = new Date(evt.endAt) < new Date();
              const isCurrent = new Date(evt.startAt) <= new Date() && new Date(evt.endAt) >= new Date();
              
              return (
                <div key={evt.id || idx} className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border ${isCurrent ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-slate-200'} ${isPassed ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col justify-center items-center bg-slate-50 rounded-lg px-4 py-2 border border-slate-100 min-w-[100px]">
                    <span className={`text-sm font-bold ${isCurrent ? 'text-amber-600' : 'text-slate-700'}`}>
                      {formatTime(evt.startAt)}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">{formatTime(evt.endAt)}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-base ${isCurrent ? 'text-amber-900' : 'text-slate-900'}`}>
                        {evt.subject?.name || evt.title || 'Cours'}
                      </h4>
                      {isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                          En cours
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">meeting_room</span>
                        <span className="font-medium">{evt.room?.name || 'Salle à définir'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">group</span>
                        <span className="font-medium">{evt.group?.name || 'Groupe non spécifié'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end border-t border-slate-100 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0 mt-3 sm:mt-0">
                    <button 
                      onClick={() => router.push(`/teacher/attendance/${evt.id}`)}
                      className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] mr-2">checklist</span>
                      Faire l'appel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
