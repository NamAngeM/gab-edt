"use client";

import React from "react";
import { AppShell, type ShellNavSection } from "@/components/AppShell";
import { SHOW_PREVIEW_FEATURES } from "@/lib/features";

const sections: ShellNavSection[] = [
  {
    label: "Navigation",
    items: [
      { label: "Tableau de bord", icon: "space_dashboard", href: "/student" },
      { label: "Mon planning", icon: "calendar_month", href: "/student/timetable" },
      // Écrans encore en maquette : visibles uniquement en démonstration
      ...(SHOW_PREVIEW_FEATURES
        ? [
            { label: "Mes évaluations", icon: "school", href: "/student/evaluations" },
            { label: "Mon profil", icon: "person", href: "/student/settings" },
          ]
        : []),
    ],
  },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell home="/student" tagline="Espace élève" sections={sections}>
      {children}
    </AppShell>
  );
}
