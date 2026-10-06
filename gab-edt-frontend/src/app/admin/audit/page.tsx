"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Search, Download, Filter, RefreshCw, FileText, CheckCircle2, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const auditLogs: { id: string; date: string; user: string; action: string; resource: string; status: string; ip: string }[] = [];

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.status === filterAction;
    return matchesSearch && matchesAction;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SUCCESS': return <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900"><CheckCircle2 className="w-3.5 h-3.5" /> Succès</span>;
      case 'ERROR': return <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/50 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900"><AlertTriangle className="w-3.5 h-3.5" /> Échec</span>;
      case 'WARNING': return <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900"><Info className="w-3.5 h-3.5" /> Avert.</span>;
      default: return <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    }).format(d);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Journal d'Audit
            <ShieldCheck className="w-8 h-8 text-brand-600" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Consultez et exportez l'historique de sécurité et de traçabilité des événements système.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm bg-white dark:bg-slate-950">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden border-t-4 border-t-brand-500">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Rechercher un utilisateur, une action..." 
                className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="SUCCESS">Succès uniquement</SelectItem>
                  <SelectItem value="ERROR">Échecs uniquement</SelectItem>
                  <SelectItem value="WARNING">Avertissements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Date & Heure</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Action</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Ressource Ciblée</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Adresse IP</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredLogs.map((log, idx) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                      {formatDate(log.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-200">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end">
                        {getStatusBadge(log.status)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredLogs.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 text-lg font-medium">{auditLogs.length === 0 ? "Journal non disponible" : "Aucun journal trouvé"}</p>
                <p className="text-slate-400 text-sm mt-1">Essayez de modifier vos filtres de recherche.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
