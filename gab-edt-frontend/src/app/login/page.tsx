"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storeUser } from '@/lib/api';

export const loginSchema = z.object({
  email: z.string().min(1, "Veuillez saisir votre email ou votre matricule."),
  password: z.string().min(1, "Veuillez saisir votre mot de passe."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/** Espace d'accueil de chaque rôle : le rôle vient du compte, jamais d'un choix à la connexion. */
const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: '/super-admin',
  SCHOOL_ADMIN: '/admin',
  PEDAGOGICAL_MANAGER: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/student',
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [serverError, setServerError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim(), password: data.password }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(payload.message || 'Identifiants incorrects. Veuillez réessayer.');
        return;
      }

      // Seul le profil est conservé côté navigateur ; les jetons restent en cookies HttpOnly
      const user = payload.data || {};
      storeUser(user);
      const home = ROLE_HOME[user.role] || '/login';
      const next = searchParams.get('next');
      // On ne suit « next » que s'il pointe vers l'espace du rôle (pas de redirection ouverte)
      router.push(next && next.startsWith(home) ? next : home);
    } catch {
      setServerError('Le service est momentanément indisponible. Réessayez dans quelques instants.');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .mesh-gradient-bg {
          background-color: #0c1c38;
          background-image:
            radial-gradient(at 80% 0%, hsla(217,91%,28%,0.75) 0px, transparent 55%),
            radial-gradient(at 20% 20%, hsla(224,76%,22%,0.9) 0px, transparent 60%),
            radial-gradient(at 50% 100%, hsla(217,95%,45%,0.4) 0px, transparent 65%),
            radial-gradient(at 95% 85%, hsla(220,90%,16%,0.85) 0px, transparent 50%);
        }
        .font-plus-jakarta {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }
      `}} />
      <div className="font-plus-jakarta text-slate-800 antialiased mesh-gradient-bg flex flex-col justify-between min-h-screen selection:bg-brand-500 selection:text-white">
        <main className="flex-grow flex items-center justify-center px-4 py-8 sm:px-6 relative z-10">
          <div className="w-full max-w-[420px]">
            <div className="text-center mb-6 space-y-1">
              <div className="inline-flex items-center justify-center p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M9 15h2v2H9z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">GAB-EDT</h1>
              <p className="text-xs text-blue-200/80">Emplois du temps des établissements</p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100/90" style={{boxShadow: "0 25px 60px -15px rgba(2, 6, 23, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3) inset"}}>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Connexion</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Administration, enseignants, élèves et parents : un seul accès, votre espace s&apos;ouvre selon votre compte.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {serverError && (
                    <div role="alert" className="bg-red-50 text-red-700 p-2.5 rounded-lg text-xs border border-red-100">
                      {serverError}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Email ou matricule</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="username"
                            placeholder="prenom.nom@etablissement.ga ou ETU-0001"
                            className="bg-slate-50/70 border-slate-200 text-sm focus-visible:ring-brand-600 focus-visible:bg-white"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-[10px] text-slate-500">Parents : utilisez le matricule de l&apos;élève et votre mot de passe parent.</p>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-semibold text-slate-700">Mot de passe</FormLabel>
                          <Link className="text-[11px] font-medium text-brand-600 hover:text-brand-700 hover:underline" href="/forgot-password">
                            Mot de passe oublié ?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPwd ? "text" : "password"}
                              autoComplete="current-password"
                              placeholder="••••••••"
                              className="pr-10 bg-slate-50/70 border-slate-200 text-sm focus-visible:ring-brand-600 focus-visible:bg-white"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPwd(!showPwd)}
                              aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                {showPwd ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700"
                  >
                    {isLoading ? 'Connexion…' : 'Se connecter'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </main>

        <footer className="w-full border-t border-white/10 py-3 relative z-10 text-[10px] text-blue-200/70">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
            <span><span className="font-semibold text-slate-300">GAB-EDT</span> © {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </>
  );
}
