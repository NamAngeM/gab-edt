"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, MapPin, User, CalendarDays, AlertTriangle, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Types
type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ReservationRequest {
  id: string;
  title: string;
  requesterName: string;
  requesterRole: string; // 'Professeur', 'BDE', 'Club'
  roomName: string;
  startAt: Date;
  endAt: Date;
  status: ReservationStatus;
  purpose: string;
  hasConflict: boolean;
  conflictDetails?: string;
  submittedAt: Date;
}

// Mock Data
const MOCK_RESERVATIONS: ReservationRequest[] = [
  {
    id: "REQ-001",
    title: "Soutenance de Projet Fin d'Études",
    requesterName: "Dr. Dupont",
    requesterRole: "Professeur",
    roomName: "Amphi B",
    startAt: new Date(new Date().setHours(14, 0, 0, 0)),
    endAt: new Date(new Date().setHours(18, 0, 0, 0)),
    status: "PENDING",
    purpose: "Besoin de l'Amphi B pour les soutenances de Master 2 avec vidéoprojecteur.",
    hasConflict: false,
    submittedAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    id: "REQ-002",
    title: "Réunion BDE - Préparation Gala",
    requesterName: "Alexandre Martin",
    requesterRole: "BDE",
    roomName: "Salle 102",
    startAt: new Date(new Date().setHours(12, 30, 0, 0)),
    endAt: new Date(new Date().setHours(14, 0, 0, 0)),
    status: "PENDING",
    purpose: "Réunion hebdomadaire du bureau des étudiants. 15 personnes attendues.",
    hasConflict: true,
    conflictDetails: "Conflit avec 'Anglais Renforcé' de 13h00 à 15h00.",
    submittedAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    id: "REQ-003",
    title: "Rattrapage Réseaux Cisco",
    requesterName: "M. Bernard",
    requesterRole: "Professeur",
    roomName: "Labo Réseaux",
    startAt: new Date(new Date().setDate(new Date().getDate() + 1)),
    endAt: new Date(new Date().setDate(new Date().getDate() + 1)),
    status: "APPROVED",
    purpose: "Rattrapage du cours annulé le 12/09.",
    hasConflict: false,
    submittedAt: new Date(Date.now() - 3600000 * 48)
  }
];

export default function ReservationsPage() {
  const [requests, setRequests] = useState<ReservationRequest[]>(MOCK_RESERVATIONS);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
  };

  const filteredRequests = requests.filter(req => {
    if (filter !== 'ALL' && req.status !== filter) return false;
    if (search && !req.title.toLowerCase().includes(search.toLowerCase()) && !req.requesterName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400">En attente</Badge>;
      case 'APPROVED': return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400">Approuvée</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400">Refusée</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Portail de Réservations</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gérez les demandes de réservation de salles (Professeurs, BDE, Associations).
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f === 'ALL' ? 'Toutes' : f === 'PENDING' ? 'En attente' : f === 'APPROVED' ? 'Approuvées' : 'Refusées'}
              </Button>
            ))}
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Rechercher (Titre, Demandeur)..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRequests.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed">
              <p className="text-slate-500 font-medium">Aucune demande trouvée.</p>
            </motion.div>
          ) : (
            filteredRequests.map(req => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`overflow-hidden transition-all ${req.status === 'PENDING' ? 'border-brand-200 dark:border-brand-900/50 shadow-md' : 'opacity-70'}`}>
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Info */}
                    <div className="flex-1 p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{req.title}</h3>
                            {getStatusBadge(req.status)}
                          </div>
                          <p className="text-sm text-slate-500 font-mono">ID: {req.id} • Soumis il y a 2h</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Demandeur</p>
                          <p className="font-semibold text-sm">{req.requesterName}</p>
                          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{req.requesterRole}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Salle</p>
                          <p className="font-semibold text-sm">{req.roomName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Date</p>
                          <p className="font-semibold text-sm">{req.startAt.toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Horaire</p>
                          <p className="font-semibold text-sm">{req.startAt.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} - {req.endAt.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">Motif :</span> {req.purpose}
                        </p>
                      </div>

                      {req.hasConflict && req.status === 'PENDING' && (
                        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 p-3 rounded-lg border border-rose-200 dark:border-rose-900/50">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm">Conflit détecté dans l'emploi du temps</p>
                            <p className="text-xs mt-0.5">{req.conflictDetails}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {req.status === 'PENDING' && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 md:w-64 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-center gap-3 shrink-0">
                        <Button 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                          onClick={() => handleAction(req.id, 'APPROVED')}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                          onClick={() => handleAction(req.id, 'REJECTED')}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 mt-2">
                          L'approbation ajoutera automatiquement l'événement au planning.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
