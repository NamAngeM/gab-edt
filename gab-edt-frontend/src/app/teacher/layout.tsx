"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from "sonner";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      setUserName(user.firstName || 'Enseignant');
    } catch {
      setUserName('Enseignant');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  if (!isClient) return null;

  const navItems = [
    { label: 'Tableau de Bord', href: '/teacher', icon: 'dashboard' },
    { label: 'Mon Planning', href: '/teacher/timetable', icon: 'calendar_month' },
    { label: 'Mes Classes', href: '/teacher/evaluations', icon: 'groups' },
    { label: 'Paramètres', href: '/teacher/settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta text-slate-800">
      <Toaster position="top-center" richColors />
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand / Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                <span className="material-symbols-outlined font-bold">cast_for_education</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">GAB-EDT</span>
                <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Espace Enseignant</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 border border-slate-100 bg-slate-50/50 p-1 rounded-xl">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out ${
                      isActive 
                        ? 'bg-white text-amber-700 shadow-sm ring-1 ring-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Profile Dropdown */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 text-right">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-tight">{userName}</span>
                  <span className="text-[11px] text-slate-500 font-medium">Professeur</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm border-2 border-white ring-2 ring-amber-50">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Se déconnecter"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
