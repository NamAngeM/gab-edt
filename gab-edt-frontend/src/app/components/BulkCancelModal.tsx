import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';

interface BulkCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: Date;
}

export function BulkCancelModal({ isOpen, onClose, onSuccess, defaultDate }: BulkCancelModalProps) {
  const [date, setDate] = useState(defaultDate ? defaultDate.toISOString().split('T')[0] : '');
  const [reason, setReason] = useState('Intempéries');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Veuillez sélectionner une date');
      return;
    }

    setIsLoading(true);
    try {
      await fetchWithAuth('/schedule-events/bulk-cancel', {
        method: 'PUT',
        body: JSON.stringify({
          date: date,
          reason: reason,
          // orgUnitId is optional, if null it cancels for the whole school
          orgUnitId: null 
        })
      });
      toast.success('Cours annulés avec succès');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'annulation massive');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annulation Force Majeure</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Date concernée</Label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Motif de l'annulation</Label>
            <Textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Intempéries (Pluie diluvienne), Grève..."
              required
            />
          </div>
          <div className="bg-red-50 text-red-800 text-sm p-3 rounded border border-red-200">
            <strong>Attention :</strong> Cette action va annuler <b>TOUS</b> les cours prévus à cette date pour tout l'établissement et notifiera les enseignants et élèves concernés.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Annuler</Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? 'En cours...' : 'Confirmer l\'annulation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
