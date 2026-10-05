"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/AuthCard';

const MIN_LENGTH = 8;

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`);
      return;
    }
    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/backend/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        setError(res.status >= 500
          ? 'Le service est momentanément indisponible. Réessayez plus tard.'
          : 'Ce lien est invalide, expiré ou déjà utilisé. Faites une nouvelle demande.');
        return;
      }
      setDone(true);
    } catch {
      setError('Le service est momentanément indisponible. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Lien incomplet">
        <p className="text-sm text-slate-600">Ce lien de réinitialisation est incomplet.</p>
        <Link href="/forgot-password" className="inline-block mt-4 text-brand-600 font-medium hover:underline">Faire une nouvelle demande</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nouveau mot de passe">
      {done ? (
        <div className="space-y-4 text-sm text-slate-600">
          <p role="status">Votre mot de passe a été modifié.</p>
          <Link href="/login" className="inline-block text-brand-600 font-medium hover:underline">Se connecter</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div role="alert" className="bg-red-50 text-red-700 p-2.5 rounded-lg text-xs border border-red-100">{error}</div>}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-700">Nouveau mot de passe ({MIN_LENGTH} caractères minimum)</label>
            <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmation" className="text-xs font-semibold text-slate-700">Confirmation</label>
            <Input id="confirmation" type="password" autoComplete="new-password" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white">
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
