"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, Clock, CalendarDays, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function TeacherRequestsPage() {
  const [showForm, setShowForm] = useState(false);
  
  // Mock requests for demo
  const [requests, setRequests] = useState([
    {
      id: "REQ-001",
      title: "Rattrapage Mathématiques",
      type: "Rattrapage",
      date: "Demain, 14:00 - 16:00",
      status: "PENDING",
      submittedAt: "Il y a 2 heures",
    },
    {
      id: "REQ-002",
      title: "Changement de salle (Besoin de vidéoprojecteur)",
      type: "Changement",
      date: "Vendredi 28, 10:00 - 12:00",
      status: "APPROVED",
      submittedAt: "Il y a 3 jours",
    }
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Demandes de Salle</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Soumettez et suivez vos demandes de rattrapage, de déplacement ou de réservation exceptionnelle.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Demande
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-brand-200 shadow-md">
              <CardHeader className="bg-brand-50/50 dark:bg-brand-950/20 border-b border-brand-100 dark:border-brand-900">
                <CardTitle className="text-brand-900 dark:text-brand-100">Formulaire de demande</CardTitle>
                <CardDescription>Votre demande sera envoyée à l'administration pour validation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Type de demande</Label>
                    <Select defaultValue="rattrapage">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rattrapage">Rattrapage d'un cours annulé</SelectItem>
                        <SelectItem value="changement">Demande de changement de salle</SelectItem>
                        <SelectItem value="exceptionnel">Réservation exceptionnelle (Réunion, Soutenance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Titre de la demande</Label>
                    <Input placeholder="Ex: Rattrapage Algo & Prog..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label>Date souhaitée</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-3">
                    <Label>Heure de début</Label>
                    <Input type="time" defaultValue="14:00" />
                  </div>
                  <div className="space-y-3">
                    <Label>Heure de fin</Label>
                    <Input type="time" defaultValue="16:00" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Préférences de salle (Optionnel)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Peu importe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Peu importe</SelectItem>
                      <SelectItem value="info">Labo Informatique</SelectItem>
                      <SelectItem value="amphi">Amphithéâtre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Motif / Justification</Label>
                  <Textarea placeholder="Expliquez brièvement la raison de votre demande..." className="resize-none" rows={3} />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t flex justify-end gap-3 pt-6">
                <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={() => {
                  setRequests([{
                    id: "REQ-" + Math.floor(Math.random() * 1000),
                    title: "Nouvelle Demande",
                    type: "Rattrapage",
                    date: "À définir",
                    status: "PENDING",
                    submittedAt: "À l'instant"
                  }, ...requests]);
                  setShowForm(false);
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Soumettre la demande
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historique */}
      <h2 className="text-xl font-bold mt-12 mb-4">Mes demandes récentes</h2>
      <div className="grid grid-cols-1 gap-4">
        {requests.map(req => (
          <Card key={req.id} className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row items-center p-6 gap-6">
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{req.title}</h3>
                  {req.status === 'PENDING' ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">En attente</Badge>
                  ) : req.status === 'APPROVED' ? (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800">Approuvée</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-rose-100 text-rose-800">Refusée</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {req.type}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {req.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Soumis {req.submittedAt}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 w-full md:w-auto">
                Voir les détails
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
