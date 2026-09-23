import React from 'react';

export default function TeacherEvaluationsPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">groups</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Classes</h1>
          <p className="text-slate-500">Gérez vos groupes et la liste de vos étudiants.</p>
        </div>
      </div>
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
        <p className="text-slate-600">Le module de gestion des classes et des évaluations sera disponible prochainement.</p>
      </div>
    </div>
  );
}
