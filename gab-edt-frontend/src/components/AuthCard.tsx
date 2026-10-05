import React from 'react';

/** Carte centrée des écrans publics d'authentification (même fond que la connexion). */
export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.28), transparent 60%), linear-gradient(135deg, #081a44 0%, #030f26 60%, #020817 100%)' }}
    >
      <div className="w-full max-w-[420px]">
        <h1 className="text-center text-2xl font-extrabold text-white tracking-tight mb-6">GAB-EDT</h1>
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
