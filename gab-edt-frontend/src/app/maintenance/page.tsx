import { ErrorScreen } from "../ErrorScreen";

export default function MaintenancePage() {
  return (
    <ErrorScreen
      code="MAINTENANCE"
      title="Nous revenons très vite"
      description="GAB-EDT est en cours de maintenance. Vos données sont en sécurité. Réessayez dans quelques minutes."
      icon="construction"
    />
  );
}
