"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Download, Printer, Settings2, PlusSquare, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { fetchWithAuth, extractArray } from '@/lib/api';

export default function QrPage() {
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeText, setIncludeText] = useState(true);
  const [targetBuilding, setTargetBuilding] = useState("ALL");
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/rooms')
      .then(res => {
        const arr = extractArray(res);
        setRooms(Array.isArray(arr) ? arr : []);
      })
      .catch(console.error);
  }, []);

  const filteredRooms = targetBuilding === "ALL" 
    ? rooms 
    : rooms.filter(r => (r.type || '').includes(targetBuilding) || (r.name || '').includes(targetBuilding));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Générateur de QR Codes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Générez et imprimez des QR Codes pour l'affichage devant les salles ou pour la validation de présence.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Tout imprimer
          </Button>
          <Button className="shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Télécharger ZIP
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-brand-600" />
                Paramètres
              </CardTitle>
              <CardDescription>Configurez l'apparence des QR Codes générés.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Bâtiment / Filtre</Label>
                <Select value={targetBuilding} onValueChange={setTargetBuilding}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les bâtiments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les bâtiments</SelectItem>
                    <SelectItem value="Central">Campus Central</SelectItem>
                    <SelectItem value="IUT">Bâtiment IUT</SelectItem>
                    <SelectItem value="Sciences">UFR Sciences</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Titre d'en-tête</Label>
                <Input defaultValue="GAB-EDT Planning" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Inclure le logo</Label>
                  <p className="text-xs text-slate-500">Au centre du QR code</p>
                </div>
                <Switch checked={includeLogo} onCheckedChange={setIncludeLogo} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Texte informatif</Label>
                  <p className="text-xs text-slate-500">Nom de salle en bas</p>
                </div>
                <Switch checked={includeText} onCheckedChange={setIncludeText} />
              </div>

              <div className="space-y-3 pt-2">
                <Label>Format d'impression</Label>
                <Select defaultValue="A4_4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4_1">1 par page (A4 complet)</SelectItem>
                    <SelectItem value="A4_4">4 par page (Idéal affichage)</SelectItem>
                    <SelectItem value="A5">Format A5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRooms.map((room, idx) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="overflow-hidden border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors shadow-sm group h-full flex flex-col">
                    <div className="p-6 flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-950 relative">
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-brand-600">
                           <Download className="w-4 h-4" />
                         </Button>
                      </div>
                      
                      {/* Real QR Code using external API */}
                      <div className="relative w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify({ type: 'ROOM', id: room.id, name: room.name }))}`}
                          alt={`QR Code pour ${room.name}`}
                          className="w-full h-full object-contain"
                        />

                        {includeLogo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white p-1 rounded-md shadow-sm">
                              <QrCode className="w-6 h-6 text-brand-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {includeText && (
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800 text-center mt-auto">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{room.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {room.type || 'Salle'} • Capacité : {room.capacity}
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <Card className="border-dashed border-2 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[250px] shadow-sm">
              <PlusSquare className="w-10 h-10 text-slate-400 mb-3" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Générer manuel</p>
              <p className="text-xs text-slate-400 mt-1">Lien personnalisé</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
