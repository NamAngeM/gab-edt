import React, { useState, useEffect } from 'react';
import { fetchWithAuth, extractArray } from '@/lib/api';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  existingEvent?: any;
  defaultTime?: { start: Date, end: Date };
  orgUnits: any[];
}

const scheduleSchema = z.object({
  subjectId: z.string().min(1, "La matière est requise"),
  teacherId: z.string().min(1, "L'enseignant est requis"),
  orgUnitId: z.string().min(1, "La classe est requise"),
  roomId: z.string().optional(),
  startAt: z.string().min(1, "L'heure de début est requise"),
  endAt: z.string().min(1, "L'heure de fin est requise"),
  status: z.string().optional(),
  notes: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export const TimetableModal: React.FC<TimetableModalProps> = ({ 
  isOpen, onClose, onSave, existingEvent, defaultTime, orgUnits 
}) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [serverError, setServerError] = useState('');

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      subjectId: "",
      teacherId: "",
      roomId: "",
      orgUnitId: "",
      startAt: "",
      endAt: "",
      status: "SCHEDULED",
      notes: ""
    }
  });

  const isLoading = form.formState.isSubmitting;

  async function loadResources() {
    try {
      const [subjRes, teachRes, roomRes] = await Promise.all([
        fetchWithAuth('/subjects').catch(() => ({ data: [] })),
        fetchWithAuth('/teachers').catch(() => ({ data: [] })),
        fetchWithAuth('/rooms').catch(() => ({ data: [] }))
      ]);
      setSubjects(extractArray(subjRes));
      setTeachers(extractArray(teachRes));
      setRooms(extractArray(roomRes));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadResources();
      setServerError('');
      
      if (existingEvent) {
        form.reset({
          subjectId: existingEvent.subject?.id || '',
          teacherId: existingEvent.teacher?.id || '',
          roomId: existingEvent.room?.id || 'none',
          orgUnitId: existingEvent.group?.id || '',
          startAt: existingEvent.startAt.slice(0, 16),
          endAt: existingEvent.endAt.slice(0, 16),
          status: existingEvent.status || 'SCHEDULED',
          notes: existingEvent.notes || ''
        });
      } else if (defaultTime) {
        const toLocalISOString = (d: Date) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        form.reset({
          subjectId: '',
          teacherId: '',
          roomId: 'none',
          orgUnitId: '',
          startAt: toLocalISOString(defaultTime.start),
          endAt: toLocalISOString(defaultTime.end),
          status: 'SCHEDULED',
          notes: ''
        });
      }
    } else {
      form.reset();
      setServerError('');
    }
  }, [isOpen, existingEvent, defaultTime, form]);

  const onSubmit = async (data: ScheduleFormValues) => {
    setServerError('');
    
    try {
      const url = existingEvent ? `/schedule-events/${existingEvent.id}` : `/schedule-events`;
      const method = existingEvent ? 'PUT' : 'POST';

      const payload = {
        ...data,
        startAt: data.startAt,
        endAt: data.endAt,
        roomId: (data.roomId === 'none' || !data.roomId) ? null : data.roomId
      };

      // Les conflits (salle, enseignant, classe) et les refus de droits remontent avec un message explicite
      await fetchWithAuth(url, { method, body: JSON.stringify(payload) });

      onSave();
    } catch (err: any) {
      setServerError(err.message || "Une erreur est survenue");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] font-plus-jakarta">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {existingEvent ? 'Modifier le cours' : 'Planifier un cours'}
          </DialogTitle>
        </DialogHeader>

        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matière *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Sélectionner une matière --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enseignant *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Sélectionner un enseignant --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orgUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Groupe / Classe ciblée *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Sélectionner une classe --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orgUnits.map(ou => (
                        <SelectItem key={ou.id} value={ou.id}>{ou.name} ({ou.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- À définir plus tard --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">-- À définir plus tard --</SelectItem>
                      {rooms.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name} (Cap. {r.capacity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Début *</FormLabel>
                    <FormControl>
                      <DateTimePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fin *</FormLabel>
                    <FormControl>
                      <DateTimePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-brand-600 hover:bg-brand-700">
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
