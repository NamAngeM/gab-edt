# GAB-EDT — Prompt maître pour Google Stitch
## Génération des maquettes Web + Mobile complètes

**Produit :** GAB-EDT  
**Cible :** Universités, Grandes Écoles, Lycées, Collèges  
**Web :** Next.js + React + TypeScript  
**Mobile :** Flutter + Dart  
**Objectif :** produire une suite de maquettes cohérentes, réalistes, modernes et directement exploitables pour le développement.

## 1. Mission de Stitch

Tu es un **Product Designer senior + UX Designer + UI Designer spécialisé dans les logiciels de planification scolaire et universitaire**.

Conçois GAB-EDT comme une plateforme complète de gestion des emplois du temps, et non comme un simple calendrier.

La plateforme doit couvrir :

- administration d'établissement ;
- organisation pédagogique ;
- enseignants ;
- étudiants/élèves ;
- matières ;
- salles ;
- cours ;
- emplois du temps ;
- conflits ;
- publication ;
- notifications ;
- import/export ;
- examens ;
- soutenances ;
- stages ;
- alternance ;
- remplacements ;
- statistiques ;
- audit ;
- application mobile ;
- consultation publique ;
- QR codes ;
- affichage TV.

## 2. Référence visuelle fournie

La capture d'écran fournie dans la conversation est la **référence fonctionnelle principale pour le calendrier**.

Conserver :

- grille par jours ;
- colonne horaire ;
- événements positionnés sur les créneaux ;
- navigation par semaine ;
- date courante ;
- recherche ;
- ressources ;
- couleurs différenciant les cours ;
- consultation par période.

Mais **ne pas reproduire le style ancien**.

Moderniser complètement avec une esthétique SaaS contemporaine :

- sidebar moderne ;
- topbar ;
- cartes ;
- filtres ;
- boutons modernes ;
- formulaires structurés ;
- tableaux propres ;
- drawer ;
- notifications ;
- responsive design ;
- mobile adapté.

La grille calendrier doit rester le **cœur visuel du produit**.

## 3. Positionnement visuel

Le produit doit transmettre :

**Professionnel • Moderne • Institutionnel • Clair • Fiable • Rapide • Ergonomique • Accessible**

Principe :

> Complexité fonctionnelle à l'intérieur, simplicité visuelle à l'extérieur.

## 4. Design system

### Couleurs

- Primary : `#2563EB`
- Primary Dark : `#1D4ED8`
- Primary Light : `#EFF6FF`
- Success : `#16A34A`
- Warning : `#D97706`
- Danger : `#DC2626`
- Info : `#0891B2`
- Background : `#F8FAFC`
- Surface : `#FFFFFF`
- Text Primary : `#0F172A`
- Text Secondary : `#475569`
- Text Muted : `#64748B`
- Border : `#E2E8F0`

### Typographie

Utiliser **Inter**, avec fallback system-ui.

Tailles :

- H1 : 28–32 px
- H2 : 24 px
- H3 : 20 px
- H4 : 18 px
- Body : 14–16 px
- Small : 12–13 px

Poids : 400, 500, 600, 700 lorsque nécessaire.

### Espacement

Utiliser une échelle basée sur 4 px :

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`

### Rayons

- Inputs : 8 px
- Buttons : 8 px
- Cards : 12–16 px
- Modals : 16 px

### Ombres

Très discrètes. Pas d'interface surchargée.

### Icônes

Utiliser une famille cohérente, de préférence **Lucide** sur Web et une famille Material/Lucide cohérente sur Flutter.

## 5. Composants à concevoir

Créer une librairie cohérente comprenant :

`Button, IconButton, Input, SearchInput, Select, Combobox, DatePicker, TimePicker, Checkbox, Radio, Switch, FormField, FormSection, Card, Badge, Chip, Avatar, Tooltip, Dropdown, Popover, Modal, Drawer, Toast, Alert, Tabs, Breadcrumb, Table, Pagination, Sidebar, Topbar, Calendar, CalendarToolbar, CalendarGrid, CalendarEvent, CalendarEventDetails, EmptyState, ErrorState, Skeleton, Stepper, FileUploader, FilterBar, StatsCard, ActivityItem, Timeline.`

Toujours réutiliser les composants existants.

## 6. Layout Web global

```text
┌───────────────────────────────────────────────────────────────┐
│ Topbar                                                        │
├────────────────┬──────────────────────────────────────────────┤
│ Sidebar        │ Main content                                 │
│                │ Breadcrumb                                   │
│ Navigation     │ Titre + actions                              │
│                │ Filtres                                      │
│                │ Contenu                                      │
└────────────────┴──────────────────────────────────────────────┘
```

Sidebar desktop : 240–260 px.  
Sidebar réduite : environ 72 px.

## 7. Sidebar par type d'établissement

### Université

```text
Dashboard
Emploi du temps
Cours
Conflits

Organisation
  Facultés
  Départements
  Formations
  Niveaux
  Promotions
  Groupes

Ressources
  Enseignants
  Étudiants
  Matières
  Salles

Évaluations
  Examens
  Soutenances

Données
  Import
  Export

Communication
  Notifications
  Annonces

Analyse
  Statistiques

Administration
  Utilisateurs
  Rôles
  Audit
  Paramètres
```

### Grande École

```text
Dashboard
Emploi du temps
Cours
Conflits

Organisation
  Programmes
  Cycles
  Années
  Promotions
  Spécialisations
  Groupes

Ressources
  Enseignants
  Intervenants
  Étudiants
  Modules
  Salles

Pédagogie
  Projets
  Examens
  Soutenances
  Stages
  Alternance

Données
  Import
  Export

Communication
  Notifications
  Annonces

Analyse
  Statistiques

Administration
  Utilisateurs
  Audit
  Paramètres
```

### Lycée

```text
Dashboard
Emploi du temps
Cours
Conflits

Organisation
  Niveaux
  Séries
  Classes
  Groupes
  Options
  Spécialités

Ressources
  Enseignants
  Élèves
  Matières
  Salles

Vie scolaire
  Absences
  Remplacements
  Évaluations
  Conseils de classe

Données
  Import
  Export

Communication
  Notifications
  Annonces

Analyse
  Statistiques

Administration
  Utilisateurs
  Audit
  Paramètres
```

### Collège

```text
Dashboard
Emploi du temps
Cours
Conflits

Organisation
  Niveaux
  Classes
  Groupes
  Options

Ressources
  Enseignants
  Élèves
  Matières
  Salles

Vie scolaire
  Absences
  Remplacements
  Évaluations
  Conseils de classe

Données
  Import
  Export

Communication
  Notifications
  Annonces

Analyse
  Statistiques

Administration
  Utilisateurs
  Audit
  Paramètres
```

## 8. Topbar

Afficher :

- breadcrumb ;
- recherche globale ;
- sélecteur établissement/campus si nécessaire ;
- notifications ;
- avatar ;
- menu profil.

## 9. Dashboard administrateur

Créer un dashboard complet avec :

### En-tête

```text
Bonjour, Jean 👋
Voici l'activité de votre établissement.
```

Actions principales :

`+ Créer un cours` et `Importer un emploi du temps`.

### KPI

Montrer 4 à 6 cartes :

- Cours ;
- Classes ;
- Enseignants ;
- Salles ;
- Conflits ;
- Cours modifiés.

### Contenu

- aperçu de l'EDT du jour/semaine ;
- alertes critiques ;
- activité récente ;
- statistiques rapides.

## 10. Dashboard spécifique

### Université

Mettre en avant :

- facultés ;
- départements ;
- formations ;
- promotions ;
- groupes ;
- cours ;
- examens ;
- salles.

### Grande École

Mettre en avant :

- programmes ;
- promotions ;
- projets ;
- alternance ;
- stages ;
- examens ;
- salles.

### Lycée

Mettre en avant :

- niveaux ;
- séries ;
- classes ;
- absences ;
- remplacements ;
- cours du jour ;
- conflits.

### Collège

Mettre en avant :

- niveaux ;
- classes ;
- absences ;
- remplacements ;
- cours du jour ;
- conflits.

# 11. PAGE CENTRALE — EMPLOI DU TEMPS

Créer la maquette la plus travaillée du produit.

Structure :

```text
┌───────────────────────────────────────────────────────────────┐
│ Emploi du temps                          [ + Nouveau cours ]  │
│                                                               │
│ [Classe ▼] [Groupe ▼] [Prof ▼] [Salle ▼] [Matière ▼]         │
│                                                               │
│ ← précédent        14 – 20 septembre 2026        suivant →   │
│                                                               │
│ [Aujourd'hui] [Jour] [Semaine] [Mois]                        │
├────────┬──────────────────────────────────────────────────────┤
│ Heure  │ Lun │ Mar │ Mer │ Jeu │ Ven │ Sam │ Dim             │
├────────┼──────────────────────────────────────────────────────┤
│ 08:00  │     │███  │     │     │     │     │                 │
│ 09:00  │███  │███  │     │███  │     │     │                 │
│ 10:00  │███  │     │███  │███  │███  │     │                 │
│ 12:00  │     │     │     │     │     │     │                 │
│ 14:00  │     │███  │███  │     │███  │     │                 │
│ 16:00  │███  │     │     │███  │     │     │                 │
└────────┴──────────────────────────────────────────────────────┘
```

### Toolbar

- Aujourd'hui ;
- précédent ;
- suivant ;
- date ;
- Jour/Semaine/Mois ;
- filtres.

### Filtres

Université :

`Campus / Faculté / Département / Formation / Niveau / Promotion / Groupe / Enseignant / Salle / Matière`

Grande École :

`Campus / Programme / Cycle / Année / Promotion / Spécialisation / Groupe / Enseignant / Salle`

Lycée :

`Niveau / Série / Classe / Option / Enseignant / Salle / Matière`

Collège :

`Niveau / Classe / Groupe / Enseignant / Salle / Matière`

## 12. Événement calendrier

Dans chaque bloc, afficher prioritairement :

```text
Programmation
14:00–16:00
Salle B204
```

Hover desktop :

- enseignant ;
- groupe/classe ;
- type ;
- statut.

Clic : ouvrir un **drawer**.

## 13. Drawer détail cours

```text
Programmation

14:00 – 16:00
📍 Salle B204
👨‍🏫 Dr. MBO
👥 L2 Informatique — G1

Type
TP

Statut
Publié

[ Modifier ] [ Déplacer ] [ Annuler ] [ Dupliquer ]
```

Ajouter l'historique de dernière modification.

## 14. Création d'un cours

Créer un wizard :

```text
① Informations
② Participants
③ Lieu
④ Planning
⑤ Vérification
⑥ Publication
```

### Informations

- matière ;
- type de cours.

### Participants

- classe/groupe ;
- enseignant(s).

### Lieu

- salle ;
- présentiel ;
- online ;
- hybride.

### Planning

- date ;
- heure début ;
- heure fin ;
- récurrence.

### Vérification

Afficher :

```text
✓ Aucun conflit détecté
```

ou :

```text
⚠ 2 conflits détectés
```

Actions :

`Enregistrer brouillon / Enregistrer / Enregistrer et publier`

## 15. Gestion des conflits

Créer une page dédiée avec niveaux :

- conflit critique ;
- avertissement.

Exemple :

```text
🔴 Salle B204
Mardi 14h–16h
L2 INFO / L3 INFO
[ Résoudre ]
```

## 16. Résolution de conflit

Afficher les alternatives :

```text
Salle C102 — libre
Salle A204 — libre
Mardi 16h–18h
Jeudi 14h–16h
```

## 17. Gestion des cours

Tableau :

```text
Matière | Classe/Groupe | Enseignant | Salle | Horaire | Statut | Actions
```

Actions :

- voir ;
- modifier ;
- dupliquer ;
- déplacer ;
- annuler ;
- archiver.

Prévoir sélection multiple.

## 18. Classes

Page liste + recherche + filtres.

Afficher :

- classe ;
- niveau ;
- effectif ;
- groupes ;
- statut.

Détail classe :

- informations ;
- groupes ;
- apprenants ;
- EDT ;
- statistiques.

## 19. Groupes

Créer, modifier, archiver et déplacer des apprenants entre groupes.

## 20. Enseignants

Page liste :

- nom ;
- département ;
- matières ;
- volume horaire ;
- statut.

Détail :

- profil ;
- matières ;
- classes ;
- disponibilités ;
- EDT ;
- volume horaire.

## 21. Disponibilités

Créer une grille :

```text
          Lun Mar Mer Jeu Ven
08–10      ✓   ✓   ✕   ✓   ✓
10–12      ✓   ✓   ✓   ✓   ✕
14–16      ✓   ✕   ✓   ✓   ✓
16–18      ✓   ✓   ✓   ✕   ✓
```

## 22. Étudiants / Élèves

Université/Grande École : `Étudiants`.  
Lycée/Collège : `Élèves`.

Tableau :

`Nom / Classe / Groupe / Matricule / Statut`

## 23. Matières

Tableau avec :

- nom ;
- code ;
- type ;
- volume horaire ;
- formation ;
- statut.

## 24. Salles

Tableau avec :

- salle ;
- bâtiment ;
- capacité ;
- type ;
- occupation ;
- statut.

## 25. Détail salle

Afficher :

- capacité ;
- équipements ;
- occupation ;
- réservations ;
- blocages.

## 26. Recherche de salle libre

Filtres :

- date ;
- heure début ;
- heure fin ;
- capacité minimale ;
- équipement ;
- campus ;
- type.

## 27. Réservation de salle

Workflow :

`Demandée → En attente → Approuvée / Refusée`

## 28. Import Excel/CSV

Créer un wizard en 4 étapes :

```text
1. Fichier
2. Mapping
3. Validation
4. Résultat
```

Validation :

```text
120 lignes analysées
113 valides
4 conflits
2 erreurs
1 doublon
```

## 29. Export

Formats :

- PDF ;
- Excel ;
- CSV ;
- ICS.

## 30. Notifications

Centre de notifications avec :

- toutes ;
- non lues ;
- cours ;
- salles ;
- annonces.

Exemples :

```text
⚠ Cours déplacé
❌ Cours annulé
📍 Salle changée
📅 Nouveau planning publié
```

## 31. Annonces

Formulaire :

- titre ;
- message ;
- audience ;
- date de publication ;
- expiration.

Audiences :

- établissement ;
- département ;
- formation ;
- classe ;
- groupe ;
- enseignants ;
- étudiants/élèves.

## 32. Statistiques

Créer :

- KPI ;
- occupation salles ;
- heures enseignants ;
- conflits ;
- cours annulés ;
- cours déplacés.

## 33. Audit

Tableau :

`Utilisateur / Action / Date / Ressource / Ancienne valeur / Nouvelle valeur`

## 34. Paramètres

Sections :

```text
Établissement
Année académique
Horaires
Calendrier
Notifications
Sécurité
Utilisateurs
Rôles
Intégrations
```

# 35. SPÉCIFICITÉS UNIVERSITÉ

Créer les maquettes pour :

- Facultés ;
- Départements ;
- Formations ;
- Niveaux ;
- Promotions ;
- Groupes ;
- CM ;
- TD ;
- TP ;
- Examens ;
- Soutenances ;
- Jurys ;
- Projets.

Examen : afficher matière, promotion, date, horaire, salle, surveillants.

Soutenance : afficher étudiant, sujet, encadrant, jury, salle, date et heure.

# 36. SPÉCIFICITÉS GRANDE ÉCOLE

Créer les maquettes pour :

- Programmes ;
- Cycles ;
- Années ;
- Promotions ;
- Spécialisations ;
- Intervenants ;
- Projets ;
- Stages ;
- Alternance ;
- Jurys.

### Alternance

Créer un calendrier où les périodes sont clairement distinguées :

```text
ÉCOLE
ENTREPRISE
STAGE
VACANCES
```

### Projets

Afficher :

- projet ;
- groupe ;
- encadrant ;
- salle ;
- date ;
- horaire.

# 37. SPÉCIFICITÉS LYCÉE

Créer les maquettes pour :

- Niveaux ;
- Séries ;
- Classes ;
- Groupes ;
- Options ;
- Spécialités ;
- Professeurs principaux ;
- Absences ;
- Remplacements ;
- Évaluations ;
- Conseils de classe ;
- Vie scolaire.

### Remplacement

```text
Professeur absent
↓
Cours concerné
↓
Enseignants disponibles
↓
Proposition
↓
Affectation
↓
Notification
```

# 38. SPÉCIFICITÉS COLLÈGE

Créer les maquettes pour :

- Niveaux ;
- Classes ;
- Groupes ;
- Options ;
- Professeurs principaux ;
- Absences ;
- Remplacements ;
- Évaluations ;
- Conseils de classe ;
- Vie scolaire.

# 39. APPLICATION MOBILE

L'application mobile est prioritairement destinée aux élèves et étudiants.

Bottom navigation :

```text
🏠 Accueil | 📅 EDT | 🔔 Notifications | 👤 Profil
```

Maximum 4–5 destinations.

## Accueil étudiant

```text
Bonjour Ange 👋

Aujourd'hui

PROCHAIN COURS
Programmation
14:00 – 16:00
Salle B204
Dr. MBO
Dans 1h15

Aujourd'hui
09:00 Mathématiques
14:00 Programmation
16:00 Anglais
```

## EDT mobile

Utiliser une liste chronologique et le swipe entre les jours.

Ne pas miniaturiser la grille desktop.

## Détail cours

```text
Programmation
14:00 – 16:00
📍 Salle B204
👨‍🏫 Dr. MBO
👥 L2 Informatique — G1
Statut : Publié
```

## Notification mobile

```text
⚠ Cours déplacé

Programmation
Avant : B204 — 14h00
Maintenant : C102 — 15h00
```

## Offline

```text
Hors connexion
Dernière synchronisation : Aujourd'hui 08:42
```

Si le cache existe, continuer à afficher les données disponibles.

# 40. APPLICATION MOBILE ENSEIGNANT

Prévoir éventuellement :

```text
Accueil
Mon planning
Mes classes
Notifications
Profil
```

# 41. MODE PUBLIC

Créer une page sans authentification pour consulter un EDT publié.

Aucune donnée privée.

# 42. QR CODE

Créer :

- génération QR ;
- téléchargement/impression ;
- consultation via scan.

# 43. AFFICHAGE TV

Créer un mode plein écran :

```text
LUNDI 15 SEPTEMBRE

08:00 Mathématiques — B204
10:00 Programmation — C102
14:00 Anglais — A105

CHANGEMENTS
⚠ TP Informatique déplacé
```

# 44. RÉCURRENCE

Créer :

```text
Aucune
Tous les jours
Chaque semaine
Toutes les 2 semaines
Personnalisée
```

Jours :

`Lun / Mar / Mer / Jeu / Ven / Sam / Dim`

# 45. MODIFICATION RÉCURRENTE

Après modification :

```text
○ Cette occurrence
○ Toute la série
○ Cette occurrence et les suivantes
```

# 46. ANNULATION

```text
Annuler le cours ?
Motif *
○ Cette occurrence
○ Toute la série
[Retour] [Annuler]
```

# 47. DRAG & DROP

Le calendrier Web doit prévoir une UX de déplacement :

```text
Drag
↓
Prévisualisation
↓
Vérification
↓
Confirmation
```

Afficher le conflit avant application.

# 48. ACTIONS BULK

```text
☑ cours 1
☑ cours 2
☑ cours 3

3 sélectionnés
[ Déplacer ] [ Annuler ] [ Exporter ]
```

# 49. RECHERCHE GLOBALE

Recherche :

- classe ;
- groupe ;
- enseignant ;
- salle ;
- matière ;
- cours.

Résultats groupés par catégorie.

# 50. FILTRES ET CHIPS

Desktop : filtres visibles.  
Mobile : bouton `[ Filtrer ]` ouvrant une bottom sheet/drawer.

Afficher les filtres actifs :

```text
Classe: L2 INFO ×
Salle: B204 ×
```

# 51. ÉTATS D'INTERFACE

Chaque page importante doit prévoir :

### Loading

Skeleton qui reproduit la structure.

### Empty

```text
Aucune donnée
[ Créer ]
```

### Error

```text
Une erreur est survenue.
[ Réessayer ]
```

### Forbidden

```text
Accès refusé.
```

# 52. BOUTONS

Variantes :

```text
Primary
Secondary
Outline
Ghost
Danger
Link
```

États :

```text
Default
Hover
Focus
Pressed
Disabled
Loading
```

Taille mobile : 44–48 px de hauteur.

Ne pas mettre plusieurs gros CTA concurrents.

# 53. FORMULAIRES

Chaque champ doit avoir :

- label visible ;
- required state ;
- helper ;
- validation ;
- erreur ;
- focus ;
- loading ;
- succès.

Desktop : 2 colonnes lorsque logique.  
Mobile : 1 colonne.

# 54. TABLES

Chaque table importante :

- recherche ;
- filtres ;
- tri ;
- pagination ;
- sélection ;
- actions ;
- loading ;
- empty state.

Sur mobile, transformer les lignes en cartes plutôt que de réduire 10 colonnes.

# 55. ACCESSIBILITÉ

Cible : bonnes pratiques WCAG 2.1 AA.

Toujours avoir :

- contraste suffisant ;
- focus visible ;
- labels ;
- navigation clavier ;
- zones tactiles adaptées ;
- information non dépendante uniquement de la couleur.

# 56. RESPONSIVE

Référence :

```text
Mobile < 640
Tablet 640–1024
Desktop 1024–1440
Large > 1440
```

Desktop : administration complète.  
Mobile : expérience simplifiée et priorisée.

# 57. RESPONSIVE DU CALENDRIER

Desktop : grille hebdomadaire.  
Tablet : grille réduite.  
Mobile : timeline/listing quotidien.

# 58. DESIGN INSTITUTIONNEL

Chaque établissement peut ajouter :

- logo ;
- nom ;
- couleur secondaire.

Mais le design system GAB-EDT doit rester reconnaissable.

# 59. ONBOARDING ADMIN

Créer :

```text
Bienvenue sur GAB-EDT
↓
Informations établissement
↓
Type
↓
Structure
↓
Administrateur
↓
Première configuration
```

Checklist :

```text
✓ Établissement
✓ Année académique
□ Classes
□ Enseignants
□ Matières
□ Salles
□ Premier EDT
```

# 60. SÉLECTEUR TYPE D'ÉTABLISSEMENT

Créer quatre cartes :

```text
Université
Grande École
Lycée
Collège
```

Chaque carte doit expliquer brièvement sa structure.

Après sélection, l'interface adapte les menus et champs.

# 61. PAGES À MAQUETTER

Créer au minimum les écrans suivants :

## Auth

1. Login
2. Mot de passe oublié
3. Reset password
4. Première connexion

## Dashboard

5. Dashboard université
6. Dashboard grande école
7. Dashboard lycée
8. Dashboard collège

## Planning

9. EDT semaine desktop
10. EDT jour desktop
11. EDT mois desktop
12. Drawer cours
13. Créer cours
14. Modifier cours
15. Déplacer cours
16. Annuler cours
17. Conflits
18. Résolution conflit
19. Filtres
20. EDT mobile

## Référentiels

21. Classes
22. Détail classe
23. Groupes
24. Enseignants
25. Détail enseignant
26. Disponibilités
27. Étudiants/Élèves
28. Détail apprenant
29. Matières
30. Salles
31. Détail salle
32. Salle libre
33. Réservation salle

## Université

34. Facultés
35. Départements
36. Formations
37. Niveaux
38. Promotions
39. Examens
40. Soutenances
41. Jury
42. Projets

## Grande École

43. Programmes
44. Cycles
45. Années
46. Promotions
47. Spécialisations
48. Intervenants
49. Projets
50. Alternance
51. Stages
52. Jurys

## Lycée

53. Niveaux
54. Séries
55. Classes
56. Options
57. Spécialités
58. Professeurs principaux
59. Absences
60. Remplacements
61. Évaluations
62. Conseil de classe

## Collège

63. Niveaux
64. Classes
65. Groupes
66. Options
67. Professeurs principaux
68. Absences
69. Remplacements
70. Évaluations
71. Conseil de classe

## Données

72. Import
73. Mapping
74. Validation import
75. Résultat import
76. Export
77. QR Code

## Communication

78. Notifications
79. Notification détaillée
80. Annonces
81. Création annonce

## Analyse

82. Statistiques
83. Occupation salles
84. Heures enseignants
85. Conflits
86. Modifications

## Administration

87. Utilisateurs
88. Rôles
89. Permissions
90. Paramètres établissement
91. Année académique
92. Calendrier académique
93. Audit

## Mobile

94. Splash
95. Onboarding
96. Login
97. Accueil étudiant
98. EDT mobile
99. Détail cours
100. Notifications
101. Profil
102. Offline
103. Accueil enseignant
104. Planning enseignant

## Public

105. Consultation publique
106. Consultation QR
107. Affichage TV

# 62. PREMIÈRE PASSE STITCH

Pour la première génération, privilégier 15 écrans fortement détaillés :

1. Login
2. Dashboard
3. EDT semaine
4. Drawer cours
5. Création cours
6. Conflits
7. Classes
8. Enseignants
9. Salles
10. Import Excel
11. Notifications
12. Mobile accueil
13. Mobile EDT
14. Mobile détail cours
15. Mobile notifications

Ces écrans doivent établir le design system qui sera ensuite reproduit partout.

# 63. DONNÉES DE DÉMONSTRATION

Utiliser de vraies données fictives cohérentes, pas de lorem ipsum.

Exemples université :

```text
Université Omar Bongo
Faculté des Sciences
Département Informatique
L2 Informatique
Groupe 1
Salle B204
Dr. Jean MBO
Programmation
```

Exemples lycée :

```text
Lycée National
Terminale C
2nde A
Mathématiques
Salle 12
M. OWONO
```

Exemples collège :

```text
Collège National
4e A
Français
Salle 5
Mme NGO
```

# 64. ERGONOMIE

Pour chaque écran, l'utilisateur doit comprendre immédiatement :

```text
Où suis-je ?
Que regarde-je ?
Que puis-je faire ?
Qu'est-ce qui a changé ?
Quelle est la prochaine action ?
```

# 65. MICROCOPY

Ton :

- professionnel ;
- humain ;
- clair ;
- direct ;
- rassurant.

Exemples :

`Cours enregistré.`  
`Emploi du temps publié.`  
`3 conflits empêchent la publication.`

Ne jamais afficher de détails techniques tels que SQL errors ou stack traces à l'utilisateur.

# 66. RÈGLE CALENDRIER

Le calendrier doit permettre de comprendre rapidement :

```text
QUOI ?
QUAND ?
OÙ ?
AVEC QUI ?
POUR QUI ?
QUEL STATUT ?
```

# 67. RÈGLE FORMULAIRE

Un formulaire ne doit pas ressembler à une page administrative brute.

Il doit être :

- segmenté ;
- aéré ;
- progressif ;
- validé en temps utile ;
- clair sur les erreurs.

# 68. RÈGLE MOBILE

L'application mobile n'est pas une version miniature du Web.

Elle doit être pensée pour une consultation rapide dans un couloir, une salle de cours ou un déplacement.

Priorités :

```text
Prochain cours
Cours du jour
Semaine
Changements
Notifications
```

# 69. RÈGLE DE RÉUTILISATION

Avant de créer un nouveau composant, vérifier s'il existe déjà.

Préférer :

```text
<Button variant="primary" />
```

plutôt que créer plusieurs boutons spécialisés.

# 70. RÈGLE D'ARCHITECTURE VISUELLE

Ne pas créer quatre produits graphiquement différents.

Créer :

```text
GAB-EDT Design System
        ↓
Configuration établissement
        ↓
Université / Grande École / Lycée / Collège
```

# 71. AUDIT VISUEL

Pour chaque génération, vérifier :

- cohérence des couleurs ;
- hiérarchie typographique ;
- spacing ;
- alignements ;
- densité ;
- lisibilité ;
- responsive ;
- accessibilité ;
- cohérence entre Web et Mobile ;
- réutilisation des composants.

# 72. PROMPT D'AUDIT À RÉUTILISER

```text
Audite cet écran par rapport au Design System GAB-EDT.

Vérifie :
- hiérarchie visuelle ;
- typographie ;
- couleurs ;
- spacing ;
- boutons ;
- formulaires ;
- tableaux ;
- calendrier ;
- états loading/empty/error ;
- responsive ;
- accessibilité ;
- cohérence avec les autres écrans.

Corrige les incohérences sans modifier le besoin métier.
Réutilise les composants existants.
```

# 73. PROMPT DE GÉNÉRATION D'UNE PAGE

```text
Crée une nouvelle page GAB-EDT.

Avant de la générer :
1. Identifie le type d'établissement.
2. Identifie le rôle utilisateur.
3. Identifie l'objectif principal.
4. Réutilise le layout global.
5. Réutilise les composants du Design System.
6. Prévois loading, empty, error et success.
7. Prévois desktop et mobile.
8. Respecte les couleurs et tokens.
9. Garde une hiérarchie visuelle claire.
10. Ne crée pas de composants ou styles qui existent déjà.
```

# 74. PROMPT CALENDRIER

```text
Crée le calendrier GAB-EDT selon le Design System.

Le calendrier doit :
- afficher clairement les heures ;
- afficher les jours ;
- afficher les événements ;
- distinguer les statuts ;
- permettre les filtres ;
- permettre le changement de semaine ;
- ouvrir les détails dans un drawer ;
- être responsive ;
- être lisible avec beaucoup d'événements.

La grille doit rappeler le fonctionnement de la capture fournie,
mais avec une interface SaaS moderne.
```

# 75. PROMPT FORMULAIRE

```text
Crée le formulaire avec :
- labels visibles ;
- required states ;
- helper text ;
- validation ;
- messages d'erreur ;
- focus ;
- loading ;
- succès ;
- responsive.

Desktop : deux colonnes lorsque pertinent.
Mobile : une colonne.

Réutilise les composants existants.
```

# 76. PROMPT MOBILE

```text
Conçois cet écran pour l'application mobile GAB-EDT.

Priorise :
- information immédiate ;
- zones tactiles ;
- lecture rapide ;
- navigation simple ;
- prochain cours ;
- horaires ;
- salles ;
- notifications.

Ne réduis pas simplement l'écran desktop.
Redessine l'expérience pour mobile.
```

# 77. DIRECTIVE FINALE

**Ne produis pas seulement des écrans esthétiques. Produis une maquette complète d'un logiciel réel.**

La capture fournie doit servir de référence pour la **logique du calendrier**, mais l'interface finale doit être radicalement plus moderne, plus lisible et plus ergonomique.

Le résultat doit donner l'impression d'un produit professionnel prêt à être proposé à :

- une université ;
- une grande école ;
- un lycée ;
- un collège.

Le même Design System doit rester cohérent sur Web et Mobile.

Le calendrier est le cœur du produit.

L'administration doit pouvoir :

```text
Configurer
→ Planifier
→ Vérifier
→ Corriger
→ Publier
→ Informer
```

L'étudiant ou l'élève doit pouvoir :

```text
Ouvrir
→ Voir son prochain cours
→ Voir sa semaine
→ Recevoir les changements
```

La conception doit donc optimiser simultanément **beauté visuelle, ergonomie, lisibilité, productivité et cohérence**.
