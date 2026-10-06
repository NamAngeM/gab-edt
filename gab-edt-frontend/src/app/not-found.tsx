import { ErrorScreen } from "./ErrorScreen";

export default function NotFound() {
  return (
    <ErrorScreen
      code="ERREUR 404"
      title="Page introuvable"
      description="Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à l'accueil."
      icon="search_off"
    />
  );
}
