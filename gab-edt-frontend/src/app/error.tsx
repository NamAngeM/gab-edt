"use client";

import { useEffect } from "react";
import { ErrorScreen } from "./ErrorScreen";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="ERREUR"
      title="Une erreur est survenue"
      description="Cette page n'a pas pu s'afficher. Réessayez ; si le problème persiste, contactez l'administrateur de votre établissement."
      icon="error"
      onRetry={reset}
    />
  );
}
