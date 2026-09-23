"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ImportPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [entityType, setEntityType] = useState("STUDENTS");
  const [importMode, setImportMode] = useState("ADD");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    // Simulate upload and parsing
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Import de données</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Importez massivement vos listes d'étudiants, d'enseignants ou de salles depuis des fichiers Excel (.xlsx) ou CSV.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-dashed border-2 shadow-sm relative overflow-hidden transition-all duration-300">
            <CardContent className="p-0">
              <form 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center min-h-[450px] p-8 text-center transition-colors ${dragActive ? 'bg-brand-50/50 border-brand-500' : 'hover:bg-slate-50/50'}`}
              >
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                  disabled={isUploading || uploadSuccess}
                />
                
                <AnimatePresence mode="wait">
                  {!file && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center pointer-events-none"
                    >
                      <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-6 text-brand-600 dark:text-brand-400 shadow-inner">
                        <UploadCloud className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                        Cliquez ou glissez-déposez un fichier
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                        Formats supportés : .CSV, .XLS, .XLSX (Taille max : 10 Mo)
                      </p>
                    </motion.div>
                  )}

                  {file && !uploadSuccess && (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center pointer-events-none z-20"
                    >
                      <FileSpreadsheet className="w-16 h-16 text-emerald-500 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Fichier prêt à être importé
                      </h3>
                      <p className="text-slate-500 font-mono mt-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                        {file.name}
                      </p>
                      <p className="text-sm text-slate-400 mt-2">
                        {(file.size / 1024 / 1024).toFixed(2)} Mo
                      </p>
                    </motion.div>
                  )}

                  {uploadSuccess && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center z-20 pointer-events-none"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      >
                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Import réussi !</h3>
                      <p className="text-slate-500 mt-2 mb-6">
                        Les données ont été traitées et intégrées au système avec succès.
                      </p>
                      <Button variant="outline" className="pointer-events-auto" onClick={handleRemoveFile}>
                        Importer un autre fichier
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {file && !isUploading && !uploadSuccess && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 z-30 text-slate-400 hover:text-red-500 bg-white/50 hover:bg-white"
                    onClick={(e) => { e.preventDefault(); handleRemoveFile(); }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Paramétrez la façon dont les données seront traitées.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Type de données à importer</Label>
                <Select value={entityType} onValueChange={setEntityType} disabled={isUploading || uploadSuccess}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENTS">Étudiants</SelectItem>
                    <SelectItem value="TEACHERS">Enseignants</SelectItem>
                    <SelectItem value="ROOMS">Salles de classe</SelectItem>
                    <SelectItem value="COURSES">Cours / Matières</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Mode d'importation</Label>
                <RadioGroup value={importMode} onValueChange={setImportMode} disabled={isUploading || uploadSuccess}>
                  <div className="flex items-start space-x-3 space-y-0 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <RadioGroupItem value="ADD" id="add" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="add" className="font-medium cursor-pointer">Ajouter et ignorer</Label>
                      <p className="text-xs text-slate-500 leading-snug">Ajoute les nouvelles entrées et ignore celles qui existent déjà.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <RadioGroupItem value="UPDATE" id="update" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="update" className="font-medium cursor-pointer">Mettre à jour</Label>
                      <p className="text-xs text-slate-500 leading-snug">Ajoute les nouvelles entrées et met à jour les existantes.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                    <RadioGroupItem value="REPLACE" id="replace" className="mt-1 [&_span]:text-red-600 border-red-300" />
                    <div className="space-y-1">
                      <Label htmlFor="replace" className="font-medium text-red-700 dark:text-red-400 cursor-pointer">Remplacer tout</Label>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-snug">Supprime toutes les données existantes avant l'import.</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-md shadow-md" 
                disabled={!file || isUploading || uploadSuccess}
                onClick={handleUpload}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    Démarrer l'importation
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex gap-3 text-amber-800 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Important</p>
              <p className="opacity-90 leading-relaxed text-xs">Assurez-vous que votre fichier respecte le modèle standard. Vous pouvez télécharger un exemple de fichier ci-dessous.</p>
              <a href="#" className="font-medium underline mt-2 inline-block text-xs">Télécharger le modèle {entityType.toLowerCase()}.csv</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
