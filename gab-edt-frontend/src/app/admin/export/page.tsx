"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, FileText, MonitorPlay, Copy, Download, ExternalLink, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

export default function ExportPage() {
  const [activeTab, setActiveTab] = useState<'TV' | 'PDF'>('TV');

  const kioskUrl = `/tv/display?b=CAMPUS_CENTRAL&f=ALL&t=DARK`;

  const handlePreview = () => {
    window.open(kioskUrl, '_blank');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Export & Affichage TV</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Générez des liens pour l'affichage dynamique sur écrans ou exportez vos plannings aux formats PDF et Excel.
        </p>
      </div>

      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('TV')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'TV' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
        >
          <Tv className="w-4 h-4" />
          Affichage Dynamique (TV)
        </button>
        <button
          onClick={() => setActiveTab('PDF')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'PDF' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
        >
          <FileText className="w-4 h-4" />
          Export PDF / Excel
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'TV' && (
          <motion.div
            key="TV"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Configuration de l'écran</CardTitle>
                <CardDescription>Paramétrez l'affichage dynamique pour vos halls et couloirs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Établissement / Bâtiment</Label>
                  <Select defaultValue="CAMPUS_CENTRAL">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un bâtiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAMPUS_CENTRAL">Campus Central</SelectItem>
                      <SelectItem value="IUT">Bâtiment IUT</SelectItem>
                      <SelectItem value="SCIENCES">UFR Sciences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Filtre des salles</Label>
                  <Select defaultValue="ALL">
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les salles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toutes les salles</SelectItem>
                      <SelectItem value="AMPHI">Amphithéâtres uniquement</SelectItem>
                      <SelectItem value="TD">Salles de TD uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label>Vitesse de défilement</Label>
                    <Select defaultValue="15s">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5s">Rapide (5s)</SelectItem>
                        <SelectItem value="15s">Normal (15s)</SelectItem>
                        <SelectItem value="30s">Lent (30s)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Thème</Label>
                    <Select defaultValue="DARK">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DARK">Sombre (Recommandé)</SelectItem>
                        <SelectItem value="LIGHT">Clair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4 border-t pt-6 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="w-full space-y-2">
                  <Label>Lien généré (Kiosk URL)</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={`http://localhost:3000${kioskUrl}`} className="bg-white dark:bg-slate-950 font-mono text-xs text-slate-500" />
                    <Button variant="secondary" size="icon" title="Copier le lien" onClick={() => navigator.clipboard.writeText(`http://localhost:3000${kioskUrl}`)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button className="w-full mt-2" variant="default" onClick={handlePreview}>
                  <MonitorPlay className="w-4 h-4 mr-2" />
                  Lancer l'aperçu Plein Écran
                </Button>
              </CardFooter>
            </Card>

            <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/50">
               <div className="text-center space-y-4">
                 <div className="relative mx-auto w-72 h-40 border-[6px] border-slate-800 dark:border-slate-700 rounded-lg bg-black overflow-hidden shadow-2xl">
                   <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-brand-900/80 to-transparent"></div>
                   <div className="absolute top-2 left-2 flex gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                     <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                     <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                   </div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                     <Tv className="w-10 h-10 mb-2 opacity-30" />
                     <span className="text-xs font-mono tracking-widest uppercase">Aperçu TV Mode</span>
                   </div>
                 </div>
                 <p className="text-sm text-slate-500 max-w-[250px] mx-auto">L'affichage dynamique est optimisé pour les écrans 1080p et 4K installés dans les couloirs.</p>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'PDF' && (
          <motion.div
            key="PDF"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <Card className="shadow-sm border-t-4 border-t-brand-500">
              <CardHeader>
                <CardTitle>Exporter un Planning</CardTitle>
                <CardDescription>Téléchargez les emplois du temps au format PDF pour impression ou Excel pour analyse.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Type d'export</Label>
                  <Select defaultValue="GROUPE">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GROUPE">Emploi du temps par Groupe (Classe)</SelectItem>
                      <SelectItem value="ENSEIGNANT">Emploi du temps par Enseignant</SelectItem>
                      <SelectItem value="SALLE">Occupation des Salles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Cible (Groupe, Professeur...)</Label>
                  <Select defaultValue="INFO1">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO1">L1 Informatique (Groupe A)</SelectItem>
                      <SelectItem value="INFO2">L2 Informatique (Groupe B)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label>Date de début</Label>
                    <DatePicker value="2024-09-02" onChange={() => {}} />
                  </div>
                  <div className="space-y-3">
                    <Label>Date de fin</Label>
                    <DatePicker value="2024-09-08" onChange={() => {}} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 border-t pt-6 bg-slate-50/50 dark:bg-slate-900/20">
                <Button className="flex-1 shadow-sm" variant="default">
                  <FileText className="w-4 h-4 mr-2" />
                  Générer PDF
                </Button>
                <Button className="flex-1 shadow-sm" variant="outline">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                  Export Excel
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
