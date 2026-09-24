# GAB-EDT Frontend (Next.js)

Application web du projet GAB-EDT, offrant trois portails distincts :
- **Espace Administrateur** (`/admin`) : Gestion complète (emplois du temps, utilisateurs, ressources).
- **Espace Enseignant** (`/teacher`) : Consultation du planning et des classes.
- **Espace Étudiant** (`/student`) : Consultation des cours de la journée.

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + Variables CSS (`globals.css`)
- **Composants UI** : Radix UI (shadcn/ui-like)
- **Formulaires** : React Hook Form + Zod (Validation)
- **Icônes** : Material Symbols Rounded
- **Sécurité** : JWT stocké via Cookie `HttpOnly` protégé par Middleware (bibliothèque `jose`)

## Démarrage rapide

1. **Installer les dépendances**
```bash
npm install
```

2. **Lancer le serveur de développement**
```bash
npm run dev
```

3. **Accéder à l'application**
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Architecture des dossiers

```
src/
├── app/                  # App Router Next.js
│   ├── admin/            # Pages réservées aux administrateurs
│   ├── teacher/          # Pages réservées aux enseignants
│   ├── student/          # Pages réservées aux étudiants
│   ├── login/            # Page de connexion
│   ├── api/auth/         # Route Handler Backend-For-Frontend (BFF)
│   ├── layout.tsx        # Layout global
│   └── globals.css       # Design System & Tailwind
├── components/           # Composants UI réutilisables (Boutons, Modals, Inputs)
├── lib/                  # Utilitaires globaux
│   ├── api.ts            # Client API (fetchWithAuth)
│   └── utils.ts          # Helpers divers (formatage de dates, fusions de classes)
└── middleware.ts         # Protection des routes et validation cryptographique du JWT
```

## Intégration API

Toutes les requêtes vers le backend (Spring Boot) doivent passer par la fonction `fetchWithAuth(endpoint, options)` située dans `src/lib/api.ts`.
Cette fonction configure automatiquement :
- L'inclusion des credentials (cookies HttpOnly) pour l'authentification.
- La gestion des erreurs globales (redirection vers `/login` sur 401/403).

**URL du Backend** : Définie par la variable d'environnement `NEXT_PUBLIC_API_URL` (par défaut `http://localhost:8080/api/v1`).
