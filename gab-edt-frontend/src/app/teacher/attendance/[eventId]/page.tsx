"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';

interface StudentAttendance {
  studentId: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export default function AttendancePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const loadAttendance = async () => {
      try {
        const res = await fetchWithAuth(`/schedule-events/${eventId}/attendance`);
        setStudents(res.data || res.content || res || []);
      } catch (err: any) {
        toast.error("Erreur lors du chargement des élèves.");
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [eventId]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudents(prev => 
      prev.map(s => s.studentId === studentId ? { ...s, status } : s)
    );
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const updates = students.map(s => ({
        studentId: s.studentId,
        status: s.status
      }));

      await fetchWithAuth(`/schedule-events/${eventId}/attendance`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      toast.success("Fiche d'appel enregistrée avec succès !");
      router.push('/teacher/timetable');
    } catch (err: any) {
      toast.error("Erreur lors de l'enregistrement de l'appel.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-amber-600">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fiche de Présence</h1>
          <p className="text-sm text-slate-500 mt-1">Saisissez les présences et absences de vos étudiants.</p>
        </div>
        <button 
          onClick={() => router.push('/teacher/timetable')}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Retour au planning</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 border-b border-slate-100">Élève</th>
              <th className="px-6 py-4 border-b border-slate-100">Matricule</th>
              <th className="px-6 py-4 border-b border-slate-100 text-center">Statut de Présence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  Aucun élève inscrit dans cette classe.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.studentId} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{student.firstName} {student.lastName}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {student.studentNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${student.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 border border-transparent'}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Présent</span>
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.studentId, 'LATE')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${student.status === 'LATE' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-amber-50 border border-transparent'}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span>Retard</span>
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${student.status === 'ABSENT' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-500 hover:bg-red-50 border border-transparent'}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                        <span>Absent</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={submitting}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
          >
            {submitting ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            <span>Enregistrer la Fiche d'Appel</span>
          </button>
        </div>
      )}
    </div>
  );
}
