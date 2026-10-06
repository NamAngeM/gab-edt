"use client";

import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { setConfirmHandler } from "@/lib/confirm";

type Pending = { message: string; isPrompt: boolean; destructive: boolean; value: string; resolve: (value: string | null) => void };

export function ConfirmProvider() {
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    setConfirmHandler(({ message, defaultValue, destructive = true }) =>
      new Promise<string | null>(resolve =>
        setPending({
          message,
          isPrompt: defaultValue !== undefined,
          destructive,
          value: defaultValue ?? "",
          resolve,
        })
      )
    );
    return () => setConfirmHandler(null);
  }, []);

  const close = (result: string | null) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <AlertDialog open={pending !== null} onOpenChange={open => { if (!open) close(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{pending?.isPrompt ? "Saisir une valeur" : "Confirmer l'action"}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">{pending?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        {pending?.isPrompt && (
          <Input
            autoFocus
            value={pending.value}
            onChange={e => setPending({ ...pending, value: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter") close(pending.value); }}
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(null)}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => close(pending?.isPrompt ? pending.value : "")}
            className={pending?.isPrompt || !pending?.destructive ? "" : "bg-red-600 hover:bg-red-700 text-white"}
          >
            {pending?.isPrompt ? "Valider" : "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
