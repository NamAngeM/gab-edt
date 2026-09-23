"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Bell, Shield, Paintbrush, Globe, Building2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('GENERAL');

  const tabs = [
    { id: 'GENERAL', label: 'Général', icon: Globe },
    { id: 'APPEARANCE', label: 'Apparence', icon: Paintbrush },
    { id: 'ACADEMIC', label: 'Année Universitaire', icon: Building2 },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    { id: 'SECURITY', label: 'Sécurité', icon: Shield },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Paramètres Globaux</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Configurez l'application GAB-EDT, l'année universitaire et les règles de sécurité.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'GENERAL' && (
              <motion.div
                key="GENERAL"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Identité de l'Établissement</CardTitle>
                    <CardDescription>Nom de l'école et informations de contact affichées sur les exports.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label>Nom de l'établissement</Label>
                        <Input defaultValue="Université GAB-EDT" />
                      </div>
                      <div className="space-y-3">
                        <Label>Site web officiel</Label>
                        <Input defaultValue="https://univ-gabedt.fr" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Adresse postale</Label>
                      <Input defaultValue="123 Avenue des Sciences, 75000 Paris" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6 bg-slate-50/50 dark:bg-slate-900/20">
                    <Button className="bg-brand-600 hover:bg-brand-700 shadow-sm">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer les modifications
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {activeTab === 'APPEARANCE' && (
              <motion.div
                key="APPEARANCE"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Thème et Couleurs</CardTitle>
                    <CardDescription>Personnalisez l'apparence visuelle du portail étudiant et enseignant.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>Thème par défaut</Label>
                      <Select defaultValue="system">
                        <SelectTrigger className="w-[250px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">Système (Automatique)</SelectItem>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label>Couleur primaire de l'école</Label>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-200 cursor-pointer hover:scale-110 transition-transform ring-2 ring-offset-2 ring-blue-600"></div>
                        <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-slate-200 cursor-pointer hover:scale-110 transition-transform"></div>
                        <div className="w-10 h-10 rounded-full bg-violet-600 border-2 border-slate-200 cursor-pointer hover:scale-110 transition-transform"></div>
                        <div className="w-10 h-10 rounded-full bg-rose-600 border-2 border-slate-200 cursor-pointer hover:scale-110 transition-transform"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'ACADEMIC' && (
              <motion.div
                key="ACADEMIC"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Année Universitaire</CardTitle>
                    <CardDescription>Définissez les dates clés et les périodes de vacances.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label>Année académique active</Label>
                        <Select defaultValue="2024-2025">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2023-2024">2023 - 2024</SelectItem>
                            <SelectItem value="2024-2025">2024 - 2025</SelectItem>
                            <SelectItem value="2025-2026">2025 - 2026</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Génération automatique des semaines</h4>
                        <p className="text-sm text-slate-500">Créer automatiquement les semaines paires/impaires dans le calendrier.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6 bg-slate-50/50 dark:bg-slate-900/20">
                    <Button className="bg-brand-600 hover:bg-brand-700 shadow-sm">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {(activeTab === 'NOTIFICATIONS' || activeTab === 'SECURITY') && (
              <motion.div
                key="OTHER"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <Card className="shadow-sm border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                      <Settings className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Bientôt disponible</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">Cette section de paramétrage est en cours d'intégration et sera livrée dans la prochaine mise à jour.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
