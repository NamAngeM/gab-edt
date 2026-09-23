"use client";

import React, { useEffect, useState } from 'react';

export default function StudentSettingsPage() {
  const [user, setUser] = useState<any>({});
  
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user_data') || '{}');
      setUser(stored);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mon Profil & Paramètres</h1>
        <p className="text-slate-500 mt-1">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-3xl shadow-inner border-4 border-white ring-4 ring-brand-50">
              {user.firstName?.charAt(0) || 'E'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {user.firstName || 'Étudiant'} {user.lastName || ''}
              </h2>
              <p className="text-brand-600 font-semibold">{user.email || 'etudiant@mesrs.ga'}</p>
              <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Matricule: {user.matricule || 'ETU-2026-0492'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Informations Académiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Établissement</label>
                <div className="font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  Université Omar Bongo (UOB)
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Département / Filière</label>
                <div className="font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  Informatique de Gestion (L3)
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Préférences de Notification</h3>
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" defaultChecked />
                <div>
                  <span className="block text-sm font-bold text-slate-800">Changements d'emploi du temps</span>
                  <span className="block text-xs text-slate-500">Être notifié en cas d'annulation ou déplacement de cours.</span>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" defaultChecked />
                <div>
                  <span className="block text-sm font-bold text-slate-800">Rappels d'examens</span>
                  <span className="block text-xs text-slate-500">Recevoir un rappel 48h avant chaque évaluation.</span>
                </div>
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Sécurité</h3>
            <button className="text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-lg transition-colors">
              Modifier mon mot de passe
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
