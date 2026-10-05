"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, MapPin, Wifi, Clock, User, DoorOpen, Bell, Megaphone, QrCode, BookOpen, ShieldAlert } from 'lucide-react';
import Head from 'next/head';

export default function TvDisplayPage() {
  return (
    <React.Suspense>
      <TvDisplay />
    </React.Suspense>
  );
}

function TvDisplay() {
  const searchParams = useSearchParams();
  const theme = searchParams?.get('t') || 'DARK';
  const building = searchParams?.get('b') || 'CAMPUS CENTRAL';

  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = isMounted 
    ? currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : '--:--:--';
    
  const dateString = isMounted 
    ? currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'Chargement...';

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#050914] text-slate-100 select-none p-5 lg:p-7 2xl:p-9 overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.92); }
        }
        .animate-live-dot {
          animation: pulse-live 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes subtle-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          display: inline-flex;
          animation: subtle-marquee 45s linear infinite;
        }
      `}} />

      {/* BEGIN: TopHeader */}
      <header className="w-full pb-4 border-b border-blue-900/40 flex items-center justify-between shrink-0">
        {/* Left: Branding & Campus Location */}
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/30 ring-1 ring-white/20">
            <CalendarDays className="text-white w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center">
                GAB-EDT <span className="ml-2 text-sky-400 font-black text-2xl lg:text-3xl tracking-widest bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-sky-400/30">TV</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-dot"></span>
                En Direct
              </span>
            </div>
            <p className="text-slate-400 text-sm lg:text-base font-semibold tracking-wider flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span className="uppercase">{building.replace('_', ' ')} • HALL PRINCIPAL</span>
            </p>
          </div>
        </div>

        {/* Center: Academic Notification */}
        <div className="hidden xl:flex items-center gap-3 bg-[#0b1326]/90 border border-blue-900/60 px-5 py-2.5 rounded-2xl shadow-inner backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
          <span className="text-sm font-medium text-slate-300">
            Semaine 38 • <strong className="text-white font-semibold">Contrôles Continus en cours</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-sky-400 font-mono bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50 flex items-center gap-1">
            <Wifi className="w-3 h-3" /> Wi-Fi Campus OK
          </span>
        </div>

        {/* Right: Clock & Date */}
        <div className="text-right flex flex-col items-end">
          <div className="font-mono text-4xl lg:text-5xl 2xl:text-6xl font-black text-sky-400 tracking-tight drop-shadow-[0_0_18px_rgba(56,189,248,0.35)] leading-none">
            {timeString}
          </div>
          <div className="text-slate-300 font-medium text-base lg:text-lg tracking-wide capitalize mt-1.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400/80" />
            <span>{dateString}</span>
          </div>
        </div>
      </header>

      {/* BEGIN: MainContentGrid */}
      <main className="w-full flex-1 grid grid-cols-12 gap-6 lg:gap-8 my-5 min-h-0 items-stretch">
        {/* LEFT COLUMN: Cours En Cours */}
        <section className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col min-h-0 bg-[#0b1326]/60 rounded-3xl p-5 lg:p-6 border border-blue-900/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-blue-900/40 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-live-dot shadow-lg shadow-rose-500/50"></span>
              <h2 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                Cours En Cours
              </h2>
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold bg-[#101c38] px-3 py-1 rounded-full border border-blue-900/40">
              4 Séances Actives
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3.5 min-h-0 overflow-hidden">
            {/* Card 1 */}
            <article className="flex items-stretch bg-[#101c38]/90 rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg transition-all duration-200">
              <div className="w-32 lg:w-40 bg-gradient-to-br from-blue-600 to-blue-700 flex flex-col items-center justify-center p-3 text-center shrink-0 border-r border-blue-400/30 relative">
                <span className="text-white text-xl lg:text-2xl font-black tracking-tight leading-none drop-shadow-sm">Amphi A</span>
                <span className="mt-2 text-[11px] font-extrabold uppercase px-2.5 py-0.5 bg-blue-950/70 text-blue-200 rounded-md border border-blue-300/30 tracking-wider">
                  CM Magistral
                </span>
              </div>
              <div className="flex-1 p-3.5 lg:p-4.5 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white tracking-normal leading-tight">Algorithmie Avancée</h3>
                    <p className="text-slate-400 text-sm lg:text-base font-medium mt-0.5 flex items-center gap-2">
                      <User className="w-3 h-3 text-sky-400" /> Dr. Dupont • <span className="text-slate-400 text-xs">Master 1 Informatique</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-2xl lg:text-3xl font-extrabold text-white tracking-tight">08:00 - 10:00</span>
                    <div className="text-emerald-400 text-xs font-bold tracking-wide flex items-center justify-end gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Fin dans 20 min
                    </div>
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-700/50 p-0.5">
                    <div className="bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 2 */}
            <article className="flex items-stretch bg-[#101c38]/90 rounded-2xl border border-blue-900/60 overflow-hidden shadow-lg transition-all duration-200">
              <div className="w-32 lg:w-40 bg-gradient-to-br from-blue-700 to-indigo-800 flex flex-col items-center justify-center p-3 text-center shrink-0 border-r border-indigo-400/30">
                <span className="text-white text-xl lg:text-2xl font-black tracking-tight leading-none">Salle 102</span>
                <span className="mt-2 text-[11px] font-extrabold uppercase px-2.5 py-0.5 bg-indigo-950/70 text-indigo-200 rounded-md border border-indigo-300/30 tracking-wider">
                  TD Dirigé
                </span>
              </div>
              <div className="flex-1 p-3.5 lg:p-4.5 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white tracking-normal leading-tight">Bases de Données &amp; SQL</h3>
                    <p className="text-slate-400 text-sm lg:text-base font-medium mt-0.5 flex items-center gap-2">
                      <User className="w-3 h-3 text-sky-400" /> Mme. Martin • <span className="text-slate-400 text-xs">Licence 2 Informatique</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-2xl lg:text-3xl font-extrabold text-white tracking-tight">08:30 - 10:30</span>
                    <div className="text-emerald-400 text-xs font-bold tracking-wide flex items-center justify-end gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Fin dans 45 min
                    </div>
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-700/50 p-0.5">
                    <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-1000" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 3 */}
            <article className="flex items-stretch bg-[#101c38]/90 rounded-2xl border border-blue-900/60 overflow-hidden shadow-lg transition-all duration-200">
              <div className="w-32 lg:w-40 bg-gradient-to-br from-indigo-700 to-sky-700 flex flex-col items-center justify-center p-3 text-center shrink-0 border-r border-sky-400/30">
                <span className="text-white text-xl lg:text-2xl font-black tracking-tight leading-none">Labo Cisco</span>
                <span className="mt-2 text-[11px] font-extrabold uppercase px-2.5 py-0.5 bg-slate-950/70 text-sky-200 rounded-md border border-sky-300/30 tracking-wider">
                  TP Pratique
                </span>
              </div>
              <div className="flex-1 p-3.5 lg:p-4.5 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white tracking-normal leading-tight">Réseaux &amp; Télécoms</h3>
                    <p className="text-slate-400 text-sm lg:text-base font-medium mt-0.5 flex items-center gap-2">
                      <User className="w-3 h-3 text-sky-400" /> M. Bernard • <span className="text-slate-400 text-xs">Licence Pro RT</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-2xl lg:text-3xl font-extrabold text-white tracking-tight">09:00 - 12:00</span>
                    <div className="text-sky-400 text-xs font-bold tracking-wide flex items-center justify-end gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Fin dans 1h30
                    </div>
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-700/50 p-0.5">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-1000" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </article>
            
            {/* Card 4 */}
            <article className="flex items-stretch bg-[#101c38]/90 rounded-2xl border border-blue-900/60 overflow-hidden shadow-lg transition-all duration-200">
              <div className="w-32 lg:w-40 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center p-3 text-center shrink-0 border-r border-slate-500/30">
                <span className="text-white text-xl lg:text-2xl font-black tracking-tight leading-none">Amphi C</span>
                <span className="mt-2 text-[11px] font-extrabold uppercase px-2.5 py-0.5 bg-slate-950/70 text-slate-300 rounded-md border border-slate-400/30 tracking-wider">
                  Conférence
                </span>
              </div>
              <div className="flex-1 p-3.5 lg:p-4.5 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white tracking-normal leading-tight">Droit du Numérique</h3>
                    <p className="text-slate-400 text-sm lg:text-base font-medium mt-0.5 flex items-center gap-2">
                      <User className="w-3 h-3 text-sky-400" /> Pr. Ndong • <span className="text-slate-400 text-xs">Tronc Commun L3</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-2xl lg:text-3xl font-extrabold text-white tracking-tight">08:00 - 10:00</span>
                    <div className="text-amber-400 text-xs font-bold tracking-wide flex items-center justify-end gap-1 mt-0.5">
                      <Bell className="w-3 h-3" /> Termine bientôt
                    </div>
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-700/50 p-0.5">
                    <div className="bg-gradient-to-r from-amber-500 to-rose-400 h-full rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </article>

          </div>
        </section>

        {/* RIGHT COLUMN: À Venir */}
        <section className="col-span-12 lg:col-span-5 xl:col-span-5 flex flex-col min-h-0 bg-[#0b1326]/60 rounded-3xl p-5 lg:p-6 border border-blue-900/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-blue-900/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-white">
                À Venir
              </h2>
            </div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
              Prochainement
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3 min-h-0 overflow-hidden">
            {/* Upcoming 1 */}
            <article className="p-3.5 lg:p-4 rounded-2xl bg-[#101c38]/80 border-l-4 border-l-emerald-400 border border-blue-900/40 shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg lg:text-xl font-extrabold text-white">Amphi B</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-500/30">
                    Dans 15 min
                  </span>
                </div>
                <span className="font-mono text-xl lg:text-2xl font-bold text-emerald-400">10:15</span>
              </div>
              <h4 className="text-lg lg:text-xl font-bold text-slate-100 mt-1">Mathématiques Discrètes</h4>
              <div className="flex items-center justify-between mt-1 text-slate-400 text-xs lg:text-sm">
                <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-emerald-400/80" /> Dr. Simon</span>
                <span className="text-emerald-400 font-medium text-xs flex items-center gap-1"><DoorOpen className="w-3 h-3" /> Salle prête</span>
              </div>
            </article>

            {/* Upcoming 2 */}
            <article className="p-3.5 lg:p-4 rounded-2xl bg-[#101c38]/80 border-l-4 border-l-sky-400 border border-blue-900/40 shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg lg:text-xl font-extrabold text-white">Salle 204</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-600/30">
                    TP Dev
                  </span>
                </div>
                <span className="font-mono text-xl lg:text-2xl font-bold text-sky-400">10:45</span>
              </div>
              <h4 className="text-lg lg:text-xl font-bold text-slate-100 mt-1">Développement Web &amp; Mobile</h4>
              <div className="flex items-center justify-between mt-1 text-slate-400 text-xs lg:text-sm">
                <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-sky-400/80" /> Mme. Petit</span>
                <span className="text-slate-400 font-medium text-xs">Accès dès 10:35</span>
              </div>
            </article>

            {/* Upcoming 3 */}
            <article className="p-3.5 lg:p-4 rounded-2xl bg-[#101c38]/80 border-l-4 border-l-indigo-400 border border-blue-900/40 shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg lg:text-xl font-extrabold text-white">Amphi A</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                    CM IA
                  </span>
                </div>
                <span className="font-mono text-xl lg:text-2xl font-bold text-indigo-400">13:30</span>
              </div>
              <h4 className="text-lg lg:text-xl font-bold text-slate-100 mt-1">Intelligence Artificielle</h4>
              <div className="flex items-center justify-between mt-1 text-slate-400 text-xs lg:text-sm">
                <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-indigo-400/80" /> Dr. Ondo</span>
                <span className="text-slate-400 font-medium text-xs">Après-midi</span>
              </div>
            </article>
            
            {/* Upcoming 4 */}
            <article className="p-3.5 lg:p-4 rounded-2xl bg-[#101c38]/80 border-l-4 border-l-purple-400 border border-blue-900/40 shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg lg:text-xl font-extrabold text-white">Salle 108</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                    TD Projet
                  </span>
                </div>
                <span className="font-mono text-xl lg:text-2xl font-bold text-purple-400">14:00</span>
              </div>
              <h4 className="text-lg lg:text-xl font-bold text-slate-100 mt-1">Génie Logiciel</h4>
              <div className="flex items-center justify-between mt-1 text-slate-400 text-xs lg:text-sm">
                <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-purple-400/80" /> M. Koumba</span>
                <span className="text-slate-400 font-medium text-xs">Équipe B</span>
              </div>
            </article>

          </div>
        </section>
      </main>

      {/* BEGIN: CampusMarqueeBar */}
      <footer className="w-full shrink-0 bg-[#0b1326]/90 border border-blue-900/50 rounded-2xl p-3 flex items-center gap-4 overflow-hidden backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest shrink-0 shadow-md">
          <Megaphone className="w-4 h-4" />
          <span>Infos Campus</span>
        </div>
        
        <div className="relative overflow-hidden w-full whitespace-nowrap flex-1 text-sm font-medium text-slate-300">
          <div className="animate-marquee-slow flex items-center gap-12">
            <span className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">• Taux d'occupation des salles : 85%</span>
              <span className="text-slate-400">(Salles disponibles : Amphi D, Salle 105, Labo Électronique 2)</span>
            </span>
            <span className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-sky-400" />
              <span className="text-white font-semibold">Émargement numérique :</span>
              <span>Scannez le QR Code à l'entrée de la salle</span>
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Bibliothèque ouverte jusqu'à 22h00 pour révisions</span>
            </span>
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Badge étudiant obligatoire visible dans le campus</span>
            </span>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#101c38] rounded-lg border border-blue-900/40 shrink-0 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono">Sync: OK</span>
        </div>
      </footer>
    </div>
  );
}
