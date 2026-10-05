import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Printer } from 'lucide-react';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
}

export function AttendanceModal({ isOpen, onClose, eventId }: AttendanceModalProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/schedule-events/${eventId}/attendance`);
      setStudents(res.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement de la liste d\'appel');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, eventId]);

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, status: newStatus } : s
    ));
  };

  const handleDelayChange = (studentId: string, delayStr: string) => {
    const delay = parseInt(delayStr, 10);
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, delayMinutes: isNaN(delay) ? null : delay } : s
    ));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const updates = students.map(s => ({
        studentId: s.studentId,
        status: s.status,
        delayMinutes: s.delayMinutes
      }));

      await fetchWithAuth(`/schedule-events/${eventId}/attendance`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      toast.success('Appel enregistré avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const printTicket = async (studentId: string) => {
    try {
      await fetchWithAuth(`/schedule-events/${eventId}/attendance/students/${studentId}/print-ticket`, {
        method: 'POST'
      });
      toast.success("Billet d'entrée validé/imprimé !");
      loadAttendance(); // reload to show the updated ticket status
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la validation du billet");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Feuille d'Appel</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin h-8 w-8 text-brand-500" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Aucun élève trouvé pour ce cours (vérifiez l'affectation de la classe).
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-3 rounded-tl-md">Élève</th>
                  <th className="px-4 py-3">Matricule</th>
                  <th className="px-4 py-3">Présence</th>
                  <th className="px-4 py-3">Retard (min)</th>
                  <th className="px-4 py-3 rounded-tr-md">Billet d'entrée</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">
                      {student.studentFirstName} {student.studentLastName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{student.studentNumber}</td>
                    <td className="px-4 py-3">
                      <Select 
                        value={student.status} 
                        onValueChange={(val) => handleStatusChange(student.studentId, val)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">Présent</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                          <SelectItem value="LATE">En Retard</SelectItem>
                          <SelectItem value="EXCUSED">Excusé</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      {student.status === 'LATE' && (
                        <input
                          type="number"
                          className="w-16 h-8 border rounded px-2 text-xs"
                          placeholder="Min"
                          value={student.delayMinutes || ''}
                          onChange={(e) => handleDelayChange(student.studentId, e.target.value)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(student.status === 'LATE' || student.status === 'ABSENT') && (
                        student.entryTicketPrinted ? (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Validé
                          </span>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                            onClick={() => printTicket(student.studentId)}
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            Imprimer Billet
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button className="bg-brand-600 hover:bg-brand-700" onClick={saveAttendance} disabled={saving || loading}>
            {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Enregistrer l'appel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
