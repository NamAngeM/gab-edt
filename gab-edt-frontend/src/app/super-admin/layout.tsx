"use client";

import React from "react";
import { AppShell, type ShellNavSection } from "@/components/AppShell";
import { SHOW_PREVIEW_FEATURES } from "@/lib/features";

const sections: ShellNavSection[] = [
  {
    label: "Plateforme",
    items: [
      { label: "Vue globale", icon: "space_dashboard", href: "/super-admin" },
      { label: "Établissements", icon: "domain", href: "/super-admin/institutions" },
    ],
  },
  // Facturation, statistiques, journaux… : maquettes non branchées, visibles uniquement en démonstration
  ...(SHOW_PREVIEW_FEATURES
    ? [
        {
          label: "Aperçu (maquettes)",
          items: [
            { label: "Utilisateurs globaux", icon: "manage_accounts", href: "/super-admin/users" },
            { label: "Abonnements & licences", icon: "receipt_long", href: "/super-admin/billing" },
            { label: "Statistiques SaaS", icon: "monitoring", href: "/super-admin/stats" },
            { label: "Journaux", icon: "terminal", href: "/super-admin/logs" },
            { label: "Paramètres serveur", icon: "settings_applications", href: "/super-admin/settings" },
          ],
        },
      ]
    : []),
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell home="/super-admin" tagline="Super administration" sections={sections} showInstitution={false}>
      {children}
    </AppShell>
  );
}
