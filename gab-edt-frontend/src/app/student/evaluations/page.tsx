"use client";

import React, { useState } from 'react';

export default function StudentEvaluationsPage() {
  const [activeTab, setActiveTab] = useState<'soutenances' | 'examens'>('soutenances');

  // Mocks pour la vue étudiant
  const myDefenses = [
    {
      id: 1,
      type: "Soutenance PFE",
      title: "Optimisation des algorithmes de NLP pour la détection de fraude",
      date: "2026-10-15T14:30:00",
      room: "Salle des Actes",
      jury: ["Dr. Alain Nguema (Président)", "Pr. Sophie Dubois (Rapporteur)", "M. Jean Ondo (Examinateur)"],
      status: "Planifiée"
    }
  ];

  const upcomingExams = [
    { id: 101, subject: "Architecture des Microservices", date: "2026-11-02T08:00:00", duration: "2h00", room: "Amphi A", coef: 3 },
    { id: 102, subject: "Machine Learning Avancé", date: "2026-11-05T10:00:00", duration: "1h30", room: "Salle B4", coef: 4 },
  ];

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Évaluations</h1>
          <p className="text-slate-500 mt-1">Consultez vos prochaines échéances d'examens et de soutenances.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('soutenances')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'soutenances' 
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            <span>Soutenance de Fin d'Études</span>
          </button>
          <button 
            onClick={() => setActiveTab('examens')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'examens' 
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            <span>Examens & Partiels</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'soutenances' && (
            <div className="space-y-6">
              {myDefenses.length > 0 ? (
                myDefenses.map(defense => (
                  <div key={defense.id} className="border border-brand-100 bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                      <span className="material-symbols-outlined" style={{ fontSize: 120 }}>school</span>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full">
                          {defense.status}
                        </span>
                        <span className="text-sm font-bold text-brand-700">{defense.type}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-6">{defense.title}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                            <span className="material-symbols-outlined">event</span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date & Heure</p>
                            <p className="font-medium text-slate-900">{formatDate(defense.date)}</p>
                            <p className="text-brand-600 font-bold">{formatTime(defense.date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                            <span className="material-symbols-outlined">location_on</span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Lieu</p>
                            <p className="font-medium text-slate-900">{defense.room}</p>
                            <a href="#" className="text-xs text-brand-600 hover:underline">Voir sur le plan</a>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-brand-100 pt-6">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Membres du Jury</p>
                        <div className="flex flex-wrap gap-2">
                          {defense.jury.map((member, idx) => (
                            <div key={idx} className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                              <span className="text-sm font-medium text-slate-700">{member}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">Aucune soutenance prévue pour le moment.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'examens' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Matière</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Heure</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durée</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Salle</th>
                      <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Coef</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {upcomingExams.map(exam => (
                      <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800">{exam.subject}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-900">{formatDate(exam.date)}</div>
                          <div className="text-xs font-bold text-brand-600">{formatTime(exam.date)}</div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">{exam.duration}</td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-700">{exam.room}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-bold text-xs">
                            {exam.coef}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
