"use client";

import React from "react";
import { AppShell, type ShellNavSection } from "@/components/AppShell";
import { SHOW_PREVIEW_FEATURES } from "@/lib/features";

const sections: ShellNavSection[] = [
  {
    label: "Navigation",
    items: [
      { label: "Tableau de bord", icon: "space_dashboard", href: "/teacher" },
      { label: "Mon planning", icon: "calendar_month", href: "/teacher/timetable" },
      { label: "Appels & présences", icon: "checklist", href: "/teacher/attendance" },
      // Écrans encore en maquette : visibles uniquement en démonstration
      ...(SHOW_PREVIEW_FEATURES
        ? [
            { label: "Mes classes", icon: "groups", href: "/teacher/evaluations" },
            { label: "Demandes de salle", icon: "forum", href: "/teacher/requests" },
            { label: "Paramètres", icon: "settings", href: "/teacher/settings" },
          ]
        : []),
    ],
  },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell home="/teacher" tagline="Espace enseignant" sections={sections}>
      {children}
    </AppShell>
  );
}
