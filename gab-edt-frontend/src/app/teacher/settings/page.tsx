import React from 'react';

export default function TeacherSettingsPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">settings</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-slate-500">Gérez votre compte et vos préférences.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Informations Personnelles</h3>
          <p className="text-sm text-slate-500 mb-4">Vos informations sont synchronisées avec le système central de l'université.</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-slate-500 mb-1">Rôle</span>
              <span className="font-semibold text-slate-900">Enseignant</span>
            </div>
            <div>
              <span className="block text-slate-500 mb-1">Statut</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 font-medium text-xs">
                Actif
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Préférences</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 text-sm text-slate-700">
              <input type="checkbox" className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" defaultChecked />
              <span>Recevoir une notification lors de l'ajout d'un nouveau cours</span>
            </label>
            <label className="flex items-center space-x-3 text-sm text-slate-700">
              <input type="checkbox" className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" defaultChecked />
              <span>Recevoir un rappel 1h avant le début d'un cours</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
