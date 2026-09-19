import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAB-EDT | Planning Supérieur",
  description: "Plateforme institutionnelle de gestion d'emploi du temps pour l'enseignement supérieur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning translate="no">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

