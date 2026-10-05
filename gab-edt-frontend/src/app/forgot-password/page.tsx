"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/AuthCard';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/backend/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok && res.status !== 400) throw new Error();
      if (res.status === 400) {
        setError('Adresse email invalide.');
        return;
      }
      // Même réponse que le compte existe ou non (pas d'énumération des comptes)
      setSent(true);
    } catch {
      setError('Le service est momentanément indisponible. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Mot de passe oublié">
      {sent ? (
        <div className="space-y-4 text-sm text-slate-600">
          <p role="status">
            Si un compte est associé à <strong>{email}</strong>, un email contenant un lien de réinitialisation
            (valable 1 heure) vient d&apos;être envoyé.
          </p>
          <p className="text-xs text-slate-500">
            Élèves sans adresse email : demandez un nouveau mot de passe à l&apos;administration de votre établissement.
          </p>
          <Link href="/login" className="inline-block text-brand-600 font-medium hover:underline">Retour à la connexion</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">Saisissez l&apos;email de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
          {error && <div role="alert" className="bg-red-50 text-red-700 p-2.5 rounded-lg text-xs border border-red-100">{error}</div>}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white">
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </Button>
          <Link href="/login" className="block text-center text-xs text-brand-600 hover:underline">Retour à la connexion</Link>
        </form>
      )}
    </AuthCard>
  );
}
