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

const TIMETABLE_BLOCKS = [
  { col: 0, row: 1, span: 2, tone: "blue" },
  { col: 1, row: 3, span: 2, tone: "green" },
  { col: 2, row: 0, span: 3, tone: "yellow" },
  { col: 3, row: 4, span: 2, tone: "blue" },
  { col: 4, row: 2, span: 2, tone: "green" },
  { col: 0, row: 5, span: 1, tone: "yellow" },
  { col: 5, row: 1, span: 3, tone: "blue" },
] as const;

const TONE_CLASS: Record<string, string> = {
  blue: "bg-sky-400/10 border-sky-300/25",
  green: "bg-emerald-400/10 border-emerald-300/25",
  yellow: "bg-amber-300/10 border-amber-200/25",
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes login-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes login-glow { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
        .login-rise { animation: login-rise .7s cubic-bezier(.16,1,.3,1) both; }
        .login-block { animation: login-glow 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .login-rise, .login-block { animation: none; } }
      `}} />

      <div className="relative min-h-screen overflow-hidden bg-[#07152b] text-slate-100 antialiased">
        {/* Grille d'emploi du temps en fond */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,.08) 1px, transparent 1px)",
            backgroundSize: "calc(100% / 7) 56px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        >
          <div className="absolute inset-0 grid grid-cols-7 grid-rows-[repeat(8,56px)]">
            {TIMETABLE_BLOCKS.map((b, i) => (
              <div
                key={i}
                className={`login-block absolute rounded-md border ${TONE_CLASS[b.tone]}`}
                style={{
                  left: `calc(${b.col} * (100% / 7) + 6px)`,
                  width: `calc(${b.span} * (100% / 7) - 12px)`,
                  top: `${b.row * 56 + 6}px`,
                  height: "44px",
                  animationDelay: `${i * 0.7}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Halo lumineux */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-yellow-300/10 blur-3xl" />

        <main className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          {/* Volet marque */}
          <section className="login-rise hidden lg:block">
            <div className="mb-8 flex h-1.5 w-40 overflow-hidden rounded-full">
              <span className="flex-1 bg-emerald-500" />
              <span className="flex-1 bg-yellow-400" />
              <span className="flex-1 bg-sky-500" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-300/90">GAB-EDT</p>
            <h1 className="mt-4 text-5xl font-black leading-[1.05] tracking-tight text-white">
              Toute votre semaine,<br />
              <span className="text-yellow-300">en un seul regard.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300">
              Emplois du temps, salles, examens et annonces des établissements, pour l&apos;administration, les enseignants, les élèves et les parents.
            </p>
            <ul className="mt-10 grid max-w-md grid-cols-2 gap-3 text-sm text-slate-300">
              {["Planning en temps réel", "Conflits détectés", "Présences & justificatifs", "Accès selon votre compte"].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Volet formulaire */}
          <section className="login-rise w-full max-w-md justify-self-center" style={{ animationDelay: ".12s" }}>
            <div className="mb-6 text-center lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-300/90">GAB-EDT</p>
              <h1 className="mt-2 text-3xl font-black text-white">Emplois du temps</h1>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-[#0c1f3d]/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-white">Connexion</h2>
                <p className="mt-1.5 text-sm text-slate-400">Un seul accès : votre espace s&apos;ouvre selon votre compte.</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {serverError && (
                    <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                      {serverError}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-300">Email ou matricule</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="username"
                            placeholder="prenom.nom@etablissement.ga ou ETU-0001"
                            className="h-12 rounded-xl border-slate-300/40 bg-white/15 text-base text-white placeholder:text-slate-300/70 focus-visible:border-emerald-300 focus-visible:bg-white/20 focus-visible:ring-emerald-300/40"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-slate-500">Parents : matricule de l&apos;élève et votre mot de passe parent.</p>
                        <FormMessage className="text-xs text-rose-300" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-300">Mot de passe</FormLabel>
                          <Link className="text-xs font-medium text-yellow-300 hover:text-yellow-200 hover:underline" href="/forgot-password">
                            Mot de passe oublié ?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPwd ? "text" : "password"}
                              autoComplete="current-password"
                              placeholder="••••••••"
                              className="h-12 rounded-xl border-slate-300/40 bg-white/15 pr-12 text-base text-white placeholder:text-slate-300/70 focus-visible:border-emerald-300 focus-visible:bg-white/20 focus-visible:ring-emerald-300/40"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPwd(!showPwd)}
                              aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 transition-colors hover:text-white"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                                {showPwd ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-rose-300" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#009E60] to-[#007A4B] text-base font-bold text-white shadow-lg shadow-emerald-900/40 transition-all hover:from-[#00AE6C] hover:to-[#009E60] hover:shadow-emerald-700/50 disabled:opacity-60"
                  >
                    {isLoading ? 'Connexion…' : 'Se connecter à mon espace'}
                  </Button>
                </form>
              </Form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              GAB-EDT © {new Date().getFullYear()} · République gabonaise
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
