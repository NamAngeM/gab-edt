"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type Role = 'direction' | 'enseignant' | 'etudiant' | 'parent';

const roleConfigs = {
  direction: {
    label: "Adresse email institutionnelle",
    placeholder: "admin@etablissement.ga",
    helper: "Compte officiel délivré par la DSI académique",
    subheading: "Accédez à votre espace administrateur & gouvernance"
  },
  enseignant: {
    label: "Identifiant enseignant ou email",
    placeholder: "prenom.nom@univ-edu.ga",
    helper: "Utilisez votre identifiant de service professoral",
    subheading: "Consultez et ajustez vos plannings de cours et TD"
  },
  etudiant: {
    label: "Email de l'étudiant",
    placeholder: "prenom.nom@etudiant.ga",
    helper: "Utilisez l'adresse email associée à votre compte",
    subheading: "Consultez vos salles, horaires et changements d'EDT"
  },
  parent: {
    label: "Matricule ou email de l'étudiant",
    placeholder: "prenom.nom@etudiant.ga",
    helper: "Connectez-vous pour suivre l'emploi du temps de votre enfant",
    subheading: "Consultez les plannings et les notes de vos enfants"
  }
};

export const loginSchema = z.object({
  email: z.string().min(1, "Veuillez saisir votre identifiant."),
  password: z.string().min(1, "Veuillez saisir votre mot de passe."),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [role, setRole] = useState<Role>('direction');
  const [serverError, setServerError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, on le redirige directement vers son espace
    const token = localStorage.getItem('jwt_token');
    const userDataStr = localStorage.getItem('user_data');
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const roles = userData.roles || [];
        const userRole = userData.role || '';
        if (roles.includes('STUDENT') || roles.includes('ROLE_STUDENT') || userRole === 'STUDENT' || userRole === 'ROLE_STUDENT' || roles.includes('PARENT') || roles.includes('ROLE_PARENT') || userRole === 'PARENT' || userRole === 'ROLE_PARENT') {
          router.push('/student');
        } else if (roles.includes('TEACHER') || roles.includes('ROLE_TEACHER') || userRole === 'TEACHER' || userRole === 'ROLE_TEACHER') {
          router.push('/teacher');
        } else {
          router.push('/admin');
        }
      } catch (e) {
        // Ignorer l'erreur, laisser sur la page de login
      }
    }
  }, [router]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }), 
      });

      if (res.ok) {
        const payload = await res.json();
        // Le token est maintenant géré par cookie HttpOnly via la route API
        
        // Le backend renvoie les informations utilisateur directement dans payload.data
        const userData = payload.data;
        const token = payload.data?.token || payload.token;
        if (userData) {
          localStorage.setItem('user_data', JSON.stringify(userData));
          if (token) {
            localStorage.setItem('jwt_token', token);
          }
          const roles = userData.roles || [];
          const userRole = userData.role || '';
          if (roles.includes('STUDENT') || roles.includes('ROLE_STUDENT') || userRole === 'STUDENT' || userRole === 'ROLE_STUDENT' || roles.includes('PARENT') || roles.includes('ROLE_PARENT') || userRole === 'PARENT' || userRole === 'ROLE_PARENT') {
            router.push('/student');
          } else if (roles.includes('TEACHER') || roles.includes('ROLE_TEACHER') || userRole === 'TEACHER' || userRole === 'ROLE_TEACHER') {
            router.push('/teacher');
          } else {
            router.push('/admin');
          }
        } else {
          router.push('/admin');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setServerError(errData.message || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch {
      setServerError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    }
  };

  const config = roleConfigs[role];

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
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
        }
        .font-plus-jakarta {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }
      `}} />
      <div 
        className="h-full font-plus-jakarta text-slate-800 antialiased mesh-gradient-bg flex flex-col justify-between min-h-screen selection:bg-brand-500 selection:text-white" 
        style={{background: "radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.28), transparent 60%), linear-gradient(135deg, rgba(8, 26, 68, 0.88) 0%, rgba(3, 15, 38, 0.94) 60%, rgba(2, 8, 23, 0.98) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnypwFvtfm-htBcR266DPaEth1g5x_-9HlnjXN7UqPmF03gN5VrF996RZxEC1Ub8_VqhnvX3nOVP1eyTu57Pxu3YPzLoUgcNSbPSsqgCHSPeE9YOHPg9hq-7uwZ1h7HXATSyfWKm1rVGr4VDLxx8aE6ujMfbnK9yIFYk5knofXT1Alm0NKFHw5s8QxXwDb6PgQy13OuXVpFFxPMi-2sjW85oH1sp-VF1cp8qDw95x313SXNq0T42G6') center center / cover no-repeat fixed"}}
      >
        {/* BEGIN: InstitutionalTopBar */}
        <header className="w-full border-b border-white/10 bg-slate-950/40 backdrop-blur-md z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="flex flex-col w-5 h-5 rounded overflow-hidden shadow-sm ring-1 ring-white/20">
                <div className="h-1/3 bg-gabon-green"></div>
                <div className="h-1/3 bg-gabon-yellow"></div>
                <div className="h-1/3 bg-gabon-blue"></div>
              </div>
              <div className="border-l border-white/20 pl-3.5 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-100">République Gabonaise</span>
                <span className="text-[10px] text-blue-200/75 hidden sm:inline">Ministère de l'Enseignement Supérieur</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-medium text-emerald-300">Systèmes opérationnels</span>
              </div>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-[10px] text-slate-300 font-medium">
                <button aria-label="Langue Française" className="px-2 py-1 rounded-md bg-white/20 text-white font-semibold transition">FR</button>
                <button aria-label="English Language" className="px-1.5 py-1 rounded-md hover:text-white transition text-slate-400">EN</button>
              </div>
            </div>
          </div>
        </header>
        {/* END: InstitutionalTopBar */}

        {/* BEGIN: MainContent */}
        <main className="flex-grow flex items-center justify-center px-4 py-4 sm:px-6 relative z-10 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-[460px]">
            <div className="text-center mb-5 space-y-1">
              <div className="inline-flex items-center justify-center p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M9 15h2v2H9z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">GAB-EDT</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-card p-5 sm:p-6 border border-slate-100/90 relative overflow-hidden backdrop-blur-xl" style={{boxShadow: "0 25px 60px -15px rgba(2, 6, 23, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3) inset"}}>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Connexion</h2>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-blue-50 text-brand-700 border border-blue-100">
                    V 3.4.2
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{config.subheading}</p>
              </div>

              <div className="mb-4">
                <div aria-label="Sélection du rôle" className="grid grid-cols-4 gap-1 bg-slate-100/80 p-1 rounded-xl text-[11px] font-semibold text-slate-600" role="tablist">
                  <button 
                    onClick={() => { setRole('direction'); form.resetField('email'); form.clearErrors(); }}
                    aria-selected={role === 'direction'} 
                    className={`py-1.5 px-1 rounded-lg text-center transition ${role === 'direction' ? 'shadow-sm bg-white text-brand-700 font-bold' : 'hover:text-slate-900 text-slate-600'}`} 
                    role="tab" type="button"
                  >
                    Admin
                  </button>
                  <button 
                    onClick={() => { setRole('enseignant'); form.resetField('email'); form.clearErrors(); }}
                    aria-selected={role === 'enseignant'} 
                    className={`py-1.5 px-1 rounded-lg text-center transition ${role === 'enseignant' ? 'shadow-sm bg-white text-brand-700 font-bold' : 'hover:text-slate-900 text-slate-600'}`} 
                    role="tab" type="button"
                  >
                    Enseignant
                  </button>
                  <button 
                    onClick={() => { setRole('etudiant'); form.resetField('email'); form.clearErrors(); }}
                    aria-selected={role === 'etudiant'} 
                    className={`py-1.5 px-1 rounded-lg text-center transition ${role === 'etudiant' ? 'shadow-sm bg-white text-brand-700 font-bold' : 'hover:text-slate-900 text-slate-600'}`} 
                    role="tab" type="button"
                  >
                    Étudiant
                  </button>
                  <button 
                    onClick={() => { setRole('parent'); form.resetField('email'); form.clearErrors(); }}
                    aria-selected={role === 'parent'} 
                    className={`py-1.5 px-1 rounded-lg text-center transition ${role === 'parent' ? 'shadow-sm bg-white text-brand-700 font-bold' : 'hover:text-slate-900 text-slate-600'}`} 
                    role="tab" type="button"
                  >
                    Parent
                  </button>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {serverError && (
                    <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs border border-red-100">
                      {serverError}
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">{config.label}</FormLabel>
                        <FormControl>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                              </svg>
                            </div>
                            <Input 
                              placeholder={config.placeholder} 
                              className="pl-9 bg-slate-50/70 border-slate-200 text-sm focus-visible:ring-brand-600 focus-visible:border-brand-600 focus-visible:bg-white"
                              {...field} 
                            />
                          </div>
                        </FormControl>
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
                          <a className="text-[10px] font-medium text-brand-600 hover:text-brand-700 transition hover:underline" href="#forgot">Oublié ?</a>
                        </div>
                        <FormControl>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                              </svg>
                            </div>
                            <Input 
                              type={showPwd ? "text" : "password"}
                              placeholder="••••••••" 
                              className="pl-9 pr-9 bg-slate-50/70 border-slate-200 text-sm focus-visible:ring-brand-600 focus-visible:border-brand-600 focus-visible:bg-white"
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPwd(!showPwd)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showPwd ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                ) : (
                                  <>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </>
                                )}
                              </svg>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between pt-1">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-1.5 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="h-3.5 w-3.5 border-slate-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                            />
                          </FormControl>
                          <FormLabel className="text-[11px] font-normal text-slate-600 cursor-pointer">
                            Mémoriser
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center text-slate-400 space-x-1" title="Connexion sécurisée TLS 1.3">
                      <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
                      </svg>
                      <span className="text-[9px] font-medium text-slate-500">Chiffré SSL</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 py-5 shadow-lg shadow-brand-600/30 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700"
                    >
                      {isLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                          <span>Connexion...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 transform rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                          </svg>
                          <span>Se connecter</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <button className="w-full mt-2 flex items-center justify-center space-x-2 py-2 px-4 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition" type="button">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-100 text-brand-700 flex items-center justify-center font-bold text-[8px] border border-blue-200">
                      G
                    </div>
                    <span>Connexion ENT Université (Gabon SSO)</span>
                  </button>
                </form>
              </Form>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-start space-x-2 bg-slate-50/60 -mx-5 -mb-5 p-3 sm:-mx-6 sm:-mb-6 sm:p-4">
                <div className="flex-shrink-0 text-brand-600 mt-0.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                  </svg>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  <p className="font-semibold text-slate-700">Assistance technique</p>
                  <p className="mt-0.5">Contactez le guichet DSI ou <a className="text-brand-600 font-medium hover:underline" href="mailto:support@mesrs.ga">support@mesrs.ga</a></p>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* END: MainContent */}

        {/* BEGIN: MainFooter */}
        <footer className="w-full border-t border-white/10 py-3 bg-slate-950/40 backdrop-blur-md relative z-10 text-[10px] text-blue-200/70">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-1.5 text-center md:text-left">
            <div>
              <span className="font-semibold text-slate-300">GAB-EDT</span> • Planning Supérieur
            </div>
            <div className="flex items-center space-x-4">
              <a className="hover:text-white transition hidden sm:block" href="#charte">Charte</a>
              <a className="hover:text-white transition hidden sm:block" href="#rgpd">Confidentialité</a>
              <span className="text-slate-500 font-mono">© 2026 Gabon</span>
            </div>
          </div>
        </footer>
        {/* END: MainFooter */}
      </div>
    </>
  );
}
