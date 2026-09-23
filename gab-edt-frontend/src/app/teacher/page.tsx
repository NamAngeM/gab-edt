"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      setUserName(user.firstName || 'Enseignant');
    } catch {
      setUserName('Enseignant');
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-amber-50 to-white">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bonjour, {userName} ! 👋</h1>
        <p className="text-slate-600">Bienvenue sur votre espace enseignant. Voici un aperçu de vos activités.</p>
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
      
      {/* Prochain cours widget (Placeholder) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <span className="material-symbols-outlined mr-2 text-amber-600">schedule</span>
          Prochain Cours
        </h3>
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900 text-lg">Veuillez consulter le planning pour vos prochains cours.</p>
            <p className="text-sm text-slate-500">Les cours sont gérés par l'administration.</p>
          </div>
          <Link href="/teacher/timetable" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
            Ouvrir le planning
          </Link>
        </div>
      </div>
    </div>
  );
}
