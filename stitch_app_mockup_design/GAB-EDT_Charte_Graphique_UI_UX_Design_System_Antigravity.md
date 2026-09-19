# GAB-EDT — Charte graphique, UI/UX et Design System
## Spécification visuelle officielle pour Antigravity / Vibe Coding

**Produit :** GAB-EDT  
**Positionnement :** plateforme de gestion des emplois du temps pour Universités, Grandes Écoles, Lycées et Collèges  
**Web :** Next.js + React + TypeScript  
**Mobile :** Flutter + Dart  
**Principe :** interface moderne, institutionnelle, claire, accessible, rapide et agréable à utiliser

---

# 1. Objectif

Ce document constitue la **source de vérité visuelle et UX** de GAB-EDT.

Antigravity doit s'en servir pour construire une interface cohérente sur :

- le dashboard Web ;
- l'administration ;
- l'interface enseignants ;
- l'application mobile étudiants/élèves ;
- les pages publiques ;
- les formulaires ;
- les tableaux ;
- les calendriers ;
- les boutons ;
- les menus ;
- les modales ;
- les notifications ;
- les messages d'erreur ;
- les états vides ;
- les états de chargement.

Le produit doit donner une impression de :

```text
Professionnel
Moderne
Simple
Fiable
Institutionnel
Rapide
Organisé
Accessible
```

---

# 2. Principe UX fondamental

GAB-EDT ne doit pas ressembler à un ancien logiciel administratif.

Il doit être visuellement plus proche d'un **SaaS moderne** que d'un outil scolaire traditionnel.

Référence de style conceptuelle :

```text
Notion
+
Linear
+
Google Calendar
+
Microsoft 365
+
Dashboard SaaS moderne
```

Mais sans copier leur identité visuelle.

L'objectif est :

> **Complexité fonctionnelle à l'intérieur, simplicité visuelle à l'extérieur.**

---

# 3. Principes de design

## 3.1 Clarté

Chaque écran doit avoir une hiérarchie évidente :

```text
Titre
↓
Contexte
↓
Action principale
↓
Contenu
↓
Actions secondaires
```

## 3.2 Cohérence

Un même comportement doit toujours avoir la même apparence.

Exemple :

```text
Créer
→ bouton principal

Annuler
→ bouton secondaire

Supprimer
→ bouton danger
```

## 3.3 Sobriété

Éviter :

- gradients excessifs ;
- ombres fortes ;
- animations inutiles ;
- couleurs criardes ;
- bordures partout ;
- icônes décoratives sans sens.

## 3.4 Densité maîtrisée

L'application d'administration contient beaucoup de données.

Il faut donc avoir une interface compacte mais respirante.

## 3.5 Mobile first pour l'étudiant

L'administration Web peut être desktop-first.

L'expérience étudiant doit être mobile-first.

---

# 4. Identité visuelle

## 4.1 Nom

```text
GAB-EDT
```

## 4.2 Signature

Possibilité :

```text
GAB-EDT
L'emploi du temps, simplement.
```

ou :

```text
GAB-EDT
Planifiez. Publiez. Informez.
```

La signature peut évoluer.

---

# 5. Palette de couleurs

La palette doit rester institutionnelle et moderne.

## Couleur principale

```text
Primary
#2563EB
```

Bleu moderne utilisé pour :

- CTA ;
- liens ;
- états actifs ;
- éléments sélectionnés ;
- focus.

## Couleur principale sombre

```text
Primary Dark
#1D4ED8
```

## Bleu très clair

```text
Primary Light
#EFF6FF
```

Utilisation :

- backgrounds légers ;
- sélection de ligne ;
- états actifs doux.

---

# 6. Couleurs sémantiques

## Succès

```text
#16A34A
```

Utilisation :

- opération réussie ;
- cours confirmé ;
- statut publié.

## Warning

```text
#D97706
```

Utilisation :

- avertissement ;
- salle presque pleine ;
- conflit non bloquant.

## Danger

```text
#DC2626
```

Utilisation :

- suppression ;
- annulation ;
- conflit bloquant ;
- erreur.

## Information

```text
#0891B2
```

---

# 7. Couleurs neutres

```text
Background      #F8FAFC
Surface         #FFFFFF
Surface muted   #F1F5F9

Text Primary    #0F172A
Text Secondary  #475569
Text Muted      #64748B

Border          #E2E8F0
Border Strong   #CBD5E1
```

Le fond général doit être légèrement gris très clair pour faire ressortir les cartes blanches.

---

# 8. Mode sombre

Prévoir l'architecture pour un Dark Mode.

Le mode sombre ne doit pas être une inversion automatique des couleurs.

Palette future :

```text
Background      #0F172A
Surface         #111827
Surface Raised  #1E293B

Text Primary    #F8FAFC
Text Secondary  #CBD5E1
Border          #334155
```

Le mode sombre peut être activé après le MVP, mais les composants doivent être conçus pour le supporter.

---

# 9. Typographie

Police principale recommandée :

```text
Inter
```

Fallback :

```text
system-ui
-apple-system
BlinkMacSystemFont
"Segoe UI"
sans-serif
```

La typographie doit être très lisible.

## Échelle

```text
Display    32–40px
H1         28–32px
H2         24px
H3         20px
H4         18px
Body       14–16px
Small      12–13px
Caption    11–12px
```

Ne pas utiliser trop de tailles différentes sur un même écran.

---

# 10. Poids de police

```text
400 — Regular
500 — Medium
600 — Semibold
700 — Bold
```

Éviter le 700 partout.

Les titres principaux utilisent généralement :

```text
600
```

---

# 11. Espacement

Utiliser une échelle cohérente basée sur 4 px.

```text
4
8
12
16
20
24
32
40
48
64
```

Règles :

```text
Petit espacement      8px
Éléments liés        12px
Sections             24px
Grandes sections     32–40px
```

---

# 12. Rayon des composants

Utiliser des coins légèrement arrondis.

```text
Inputs       8px
Buttons      8px
Cards        12px
Modal        16px
Large cards  16px
```

Ne pas utiliser des boutons excessivement arrondis type "pill" partout.

---

# 13. Ombres

Utiliser des ombres très légères.

Card standard :

```text
0 1px 2px rgba(...)
```

Modal :

```text
0 10px 30px rgba(...)
```

Ne pas surcharger l'interface d'ombres.

---

# 14. Bordures

Bordure standard :

```text
1px solid #E2E8F0
```

Utiliser les bordures principalement pour :

- cartes ;
- tableaux ;
- inputs ;
- séparateurs ;
- modales.

---

# 15. Icônes

Utiliser une seule famille d'icônes.

Recommandation Web :

```text
Lucide Icons
```

Flutter :

```text
Material Icons
```

ou une bibliothèque cohérente équivalente.

Ne pas mélanger plusieurs styles d'icônes.

---

# 16. Règles d'icônes

Les icônes doivent être :

- simples ;
- reconnaissables ;
- cohérentes ;
- peu décoratives.

Taille standard :

```text
16px
20px
24px
```

---

# 17. Layout Web général

Structure :

```text
┌────────────────────────────────────────────────────────┐
│ Top Bar                                                │
├──────────────┬─────────────────────────────────────────┤
│              │                                         │
│ Sidebar      │ Main Content                            │
│              │                                         │
│              │ Breadcrumb                              │
│              │ Title                                   │
│              │ Actions                                 │
│              │                                         │
│              │ Content                                 │
│              │                                         │
└──────────────┴─────────────────────────────────────────┘
```

---

# 18. Sidebar

Largeur :

```text
240–260px
```

Sur écran plus petit :

```text
collapsed = 72px
```

Contenu :

```text
Logo

Dashboard

PLANIFICATION
Emploi du temps
Cours
Conflits

ORGANISATION
Classes
Groupes
Enseignants
Étudiants
Matières
Salles

ÉTABLISSEMENT
Départements
Formations
Campus

ADMINISTRATION
Import
Notifications
Statistiques
Paramètres
```

Les sections doivent être clairement séparées.

---

# 19. Sidebar active

Un élément actif :

```text
Background : Primary Light
Text       : Primary
Icon       : Primary
```

Ne pas utiliser une barre verticale agressive.

---

# 20. Topbar

Contenu :

```text
Breadcrumb
              Recherche
                     Notifications
                         Profil
```

La topbar doit être fixe ou sticky lorsque cela améliore la navigation.

---

# 21. Profil utilisateur

Cliquer sur l'avatar ouvre :

```text
Mon profil
Préférences
Aide
Déconnexion
```

Afficher le rôle :

```text
Administrateur
```

ou :

```text
Enseignant
Étudiant
```

---

# 22. Dashboard

Le dashboard doit commencer par :

```text
Bonjour, [Prénom] 👋
Voici l'activité de votre établissement.
```

Puis statistiques.

---

# 23. Cartes statistiques

Exemple :

```text
┌─────────────────────────────┐
│ COURS                       │
│                             │
│ 126                         │
│ +8 cette semaine            │
└─────────────────────────────┘
```

Maximum 4 à 6 cartes principales par rangée.

Chaque carte doit avoir :

- label ;
- chiffre ;
- variation éventuelle ;
- icône discrète.

---

# 24. Actions principales du Dashboard

Exemples :

```text
+ Créer un cours
Importer un EDT
Voir l'emploi du temps
Gérer les conflits
```

Le CTA principal doit être visuellement dominant.

---

# 25. Boutons

## Primary

```text
[ + Créer un cours ]
```

Usage :

- action principale ;
- validation ;
- création ;
- publication.

## Secondary

```text
[ Annuler ]
```

Usage :

- action secondaire ;
- retour ;
- filtre.

## Outline

Usage :

- actions secondaires importantes.

## Ghost

Usage :

- petites actions ;
- navigation ;
- actions de faible importance.

## Danger

```text
[ Supprimer ]
```

Uniquement pour actions destructives.

---

# 26. Règle des boutons

Éviter deux gros boutons concurrents.

Mauvais :

```text
[Créer] [Publier] [Enregistrer] [Valider] [Exporter]
```

Préférer :

```text
[ Enregistrer ]

Plus d'actions ▼
```

selon le contexte.

---

# 27. Taille des boutons

Desktop :

```text
Height 40–44px
```

Mobile :

```text
Height 44–48px
```

Les zones tactiles doivent être suffisamment grandes.

---

# 28. États des boutons

Chaque bouton doit supporter :

```text
default
hover
focus
active
disabled
loading
success si pertinent
```

Loading :

```text
[ ⟳ Enregistrement... ]
```

Le texte ne doit pas changer brutalement la largeur du bouton.

---

# 29. Formulaires

Les formulaires doivent être :

- courts ;
- structurés ;
- regroupés ;
- faciles à scanner.

Ne pas mettre 25 champs dans une seule colonne sans regroupement.

---

# 30. Structure d'un formulaire

```text
Titre

Informations générales
────────────────────────
Nom *
Code

Organisation
────────────────────────
Formation *
Niveau *
Groupe *

Planning
────────────────────────
Date *
Heure début *
Heure fin *

                     [Annuler] [Enregistrer]
```

---

# 31. Formulaire en deux colonnes

Desktop :

```text
┌──────────────────────┬──────────────────────┐
│ Nom                  │ Code                 │
│ [................]   │ [................]   │
│                      │                      │
│ Matière              │ Enseignant           │
│ [................]   │ [................]   │
└──────────────────────┴──────────────────────┘
```

Mobile :

```text
Nom
[................]

Code
[................]

Matière
[................]
```

Tous les formulaires doivent passer automatiquement en une colonne sur petit écran.

---

# 32. Labels

Chaque champ doit avoir un label visible.

Mauvais :

```text
[ Entrez le nom ]
```

Préférer :

```text
Nom de la matière *
[ Entrez le nom ]
```

---

# 33. Champs obligatoires

Utiliser :

```text
*
```

avec une légende si nécessaire :

```text
* Champ obligatoire
```

---

# 34. Placeholder

Le placeholder doit donner un exemple, pas remplacer le label.

Bon :

```text
Nom de la salle *
[ Ex. B204 ]
```

Mauvais :

```text
[ Nom de la salle ]
```

---

# 35. Inputs

Style :

```text
Height: 44px
Radius: 8px
Border: 1px
Padding: 12px
```

Focus :

```text
Border Primary
+
focus ring léger
```

---

# 36. Select

Les select doivent être reconnaissables comme tels.

```text
Formation *
[ Licence Informatique     ▼ ]
```

Pour beaucoup de valeurs, utiliser une combobox avec recherche.

---

# 37. Combobox

Pour :

- enseignant ;
- étudiant ;
- matière ;
- salle ;
- formation.

Exemple :

```text
Enseignant
[ Rechercher un enseignant... ]
```

Afficher :

```text
Jean MBO
Marie NGOMA
Paul ...

```

---

# 38. Date picker

Le calendrier de sélection doit :

- mettre en évidence aujourd'hui ;
- respecter le locale ;
- être adapté au mobile ;
- permettre la saisie clavier sur Web ;
- afficher clairement la date choisie.

---

# 39. Time picker

Utiliser deux champs :

```text
Heure début    [14:00]
Heure fin      [16:00]
```

et afficher immédiatement la durée :

```text
Durée : 2h
```

---

# 40. Validation de formulaire

La validation doit être placée près du champ.

Exemple :

```text
Heure de fin *
[ 13:00 ]

⚠ L'heure de fin doit être postérieure
à l'heure de début.
```

Ne pas afficher toutes les erreurs uniquement en haut de page.

---

# 41. Erreurs

Une erreur doit :

- expliquer le problème ;
- indiquer comment le corriger ;
- rester concise.

Mauvais :

```text
Invalid data.
```

Bon :

```text
La salle B204 est déjà occupée
de 14h00 à 16h00.
Choisissez une autre salle ou un autre créneau.
```

---

# 42. Conflit d'emploi du temps

Les conflits sont une fonctionnalité critique.

Afficher :

```text
⚠ Conflit détecté

Salle B204
14h00 – 16h00

est déjà utilisée par :
L3 Informatique

[ Choisir une autre salle ]
```

Pour les conflits bloquants, utiliser une couleur danger mais rester sobre.

---

# 43. Formulaire de création d'un cours

Structure recommandée :

```text
Créer un cours

1. Informations
Matière
Type de cours

2. Participants
Classe / Groupe
Enseignant

3. Lieu
Salle
ou
Cours en ligne

4. Planning
Date
Début
Fin

5. Options
Récurrence
Notes

                    [Annuler] [Créer le cours]
```

Après saisie :

```text
Vérification des conflits...
```

Puis :

```text
✓ Aucun conflit détecté
```

---

# 44. Formulaire complexe

Pour une configuration longue, utiliser un stepper :

```text
① Informations
   ↓
② Participants
   ↓
③ Planning
   ↓
④ Vérification
   ↓
⑤ Publication
```

Ne pas utiliser de stepper pour les petits formulaires.

---

# 45. Modal

Utiliser une modal pour :

- confirmation ;
- petite modification ;
- action rapide.

Ne pas mettre un gros formulaire complexe dans une petite modal.

---

# 46. Modal de confirmation

Exemple :

```text
┌─────────────────────────────────────┐
│ Annuler le cours ?                  │
│                                     │
│ Le cours de Mathématiques du        │
│ 15 septembre à 14h sera annulé.     │
│                                     │
│ [Retour]       [Annuler le cours]   │
└─────────────────────────────────────┘
```

---

# 47. Drawer

Utiliser un panneau latéral pour afficher le détail d'un cours.

```text
┌───────────────────────────┬───────────────┐
│ Calendrier                │ Cours         │
│                           │               │
│                           │ Programmation │
│                           │ 14h - 16h     │
│                           │ Salle B204    │
│                           │ Dr. MBO       │
│                           │               │
│                           │ [Modifier]    │
└───────────────────────────┴───────────────┘
```

C'est préférable à une navigation vers une autre page pour une consultation rapide.

---

# 48. Tables

Les tableaux doivent être :

- lisibles ;
- triables ;
- filtrables ;
- paginés.

Exemple :

```text
Nom               Classe     Professeur      Statut
────────────────────────────────────────────────────
Programmation     L2 G1      Dr. MBO         Publié
Mathématiques     L2 G1      Mme NGOMA       Brouillon
Anglais           L2 G2      M. OWONO         Publié
```

---

# 49. Table actions

Les actions rapides doivent être dans une colonne :

```text
⋮
```

Menu :

```text
Voir
Modifier
Dupliquer
Annuler
Archiver
```

Ne pas mettre cinq icônes visibles dans chaque ligne.

---

# 50. État vide

Exemple :

```text
        📅

Aucun emploi du temps

Commencez par créer votre premier
emploi du temps.

[ Créer un emploi du temps ]
```

Un état vide doit expliquer quoi faire ensuite.

---

# 51. Loading state

Privilégier les skeletons.

Exemple :

```text
████████████
██████
████████████████
```

Éviter de mettre un spinner géant au milieu de toute l'application.

---

# 52. Skeleton

Le skeleton doit reproduire grossièrement la structure finale.

Dashboard :

```text
████████  ████████  ████████

████████████████████████████
██████████████████████
```

---

# 53. Toasts

Utiliser les toasts pour les confirmations brèves :

```text
✓ Cours enregistré
```

```text
✓ Emploi du temps publié
```

```text
⚠ Impossible d'envoyer la notification
```

Ils ne doivent pas contenir une longue explication.

---

# 54. Notifications persistantes

Pour une erreur importante :

```text
┌──────────────────────────────────────┐
│ ⚠ Conflit détecté                    │
│                                      │
│ Trois conflits empêchent la          │
│ publication du planning.             │
│                                      │
│ [ Voir les conflits ]                │
└──────────────────────────────────────┘
```

---

# 55. Emploi du temps — vue principale

C'est le composant le plus important.

```text
┌─────────────────────────────────────────────────────┐
│ Emploi du temps                     [ + Nouveau ]   │
│                                                     │
│ Classe [ L2 INFO ▼ ]  Semaine [15 sept ▼]          │
│                                                     │
│ [Aujourd'hui] [Semaine] [Mois]                     │
│                                                     │
│       Lun   Mar   Mer   Jeu   Ven                   │
│ 08h   │     │███│     │     │                      │
│ 10h   │███  │   │     │███  │                      │
│ 12h   │     │   │     │     │                      │
│ 14h   │     │███│███  │     │                      │
│ 16h   │███  │   │     │███  │                      │
└─────────────────────────────────────────────────────┘
```

---

# 56. Événements calendrier

Chaque bloc doit afficher le minimum nécessaire :

```text
Programmation
14:00–16:00
B204
```

Au survol desktop :

```text
Matière
Enseignant
Groupe
Salle
```

Au clic :

→ Drawer détails.

---

# 57. Couleurs calendrier

La couleur doit représenter :

- matière ;
- type de cours ;
- statut ;

selon configuration.

Ne jamais utiliser 20 couleurs très saturées.

Utiliser une palette douce.

Exemple logique :

```text
Bleu    cours général
Violet  TP
Vert    projet
Orange  examen
Rouge   annulation
Gris    événement archivé
```

Les couleurs exactes peuvent être définies dans le thème.

---

# 58. Accessibilité du calendrier

Un événement ne doit pas être identifiable uniquement par sa couleur.

Toujours afficher :

- matière ;
- heure ;
- état ;
- icône/texte pour annulation ou déplacement.

---

# 59. Filtres

Les filtres doivent rester au-dessus du calendrier.

Desktop :

```text
Classe   Groupe   Enseignant   Salle   Matière
[▼]      [▼]      [▼]          [▼]     [▼]
```

Mobile :

```text
[ 🔎 Filtrer ]
```

→ ouvre un panneau de filtres.

---

# 60. Barre de recherche

Recherche globale :

```text
⌕ Rechercher une classe, un enseignant, une salle...
```

Raccourci futur :

```text
Ctrl + K
```

---

# 61. Breadcrumbs

Pour les pages profondes :

```text
Administration
/
Emploi du temps
/
L2 Informatique
/
Semaine 38
```

Sur mobile, réduire.

---

# 62. Pagination

Afficher :

```text
1–25 sur 126

‹ 1 2 3 4 5 ›
```

Éviter les paginations trop complexes.

---

# 63. Badges

Pour les statuts :

```text
● Publié
● Brouillon
● Annulé
● Modifié
● En attente
```

Utiliser un fond pâle + texte coloré.

---

# 64. Chips

Pour les éléments multiples :

```text
L2 INFO
Groupe 1
TP
```

Les chips doivent rester courts.

---

# 65. Avatars

Pour les enseignants :

```text
[JM] Jean MBO
```

Utiliser la photo seulement lorsqu'elle est disponible.

Ne pas surcharger les tableaux avec des avatars partout.

---

# 66. Profil

Page :

```text
Avatar

Jean MBO
Enseignant

Informations personnelles
Organisation
Préférences
Notifications
Sécurité
```

---

# 67. Page enseignant

Dashboard :

```text
Bonjour Jean 👋

Aujourd'hui
----------------------------
09h00  Mathématiques
11h00  L2 Informatique
14h00  TP Programmation

Cette semaine
----------------------------
12 cours
18h d'enseignement
```

---

# 68. Page étudiant / élève

L'écran mobile doit être extrêmement simple :

```text
Bonjour 👋

Aujourd'hui
Mardi 15 septembre

PROCHAIN COURS
Programmation
14:00 – 16:00
Salle B204
Dans 1h12

────────────────

09:00 Mathématiques
14:00 Programmation
16:00 Anglais
```

---

# 69. Navigation mobile

Bottom navigation :

```text
┌──────────────────────────────────┐
│                                  │
│                                  │
├──────────────────────────────────┤
│ Accueil | EDT | 🔔 | Profil      │
└──────────────────────────────────┘
```

Maximum 4 ou 5 destinations principales.

---

# 70. Mobile — règles

Touch targets :

```text
minimum ≈ 44px
```

Éviter :

- petits textes ;
- menus minuscules ;
- tableaux horizontaux difficiles ;
- formulaires trop denses.

---

# 71. Mobile — emploi du temps

Vue recommandée :

```text
Lun
Mar
Mer
Jeu
Ven
```

L'utilisateur peut glisser horizontalement entre les jours.

Pour la semaine :

```text
15 Sep
16 Sep
17 Sep
...
```

avec une liste verticale plus facile à lire qu'une grille desktop miniature.

---

# 72. Mobile — détail cours

```text
Programmation

14:00 – 16:00

📍 Salle B204
👨‍🏫 Dr. MBO
👥 L2 Informatique — G1

Statut
Publié
```

---

# 73. Mobile — changement de cours

Afficher une alerte claire :

```text
⚠ Cours modifié

Programmation

Avant
B204 — 14h00

Maintenant
C102 — 15h00
```

---

# 74. Login Web

Design minimal :

```text
┌────────────────────────────────────┐
│             GAB-EDT                │
│                                    │
│ Connectez-vous à votre espace      │
│                                    │
│ Email                              │
│ [..............................]   │
│                                    │
│ Mot de passe                       │
│ [..............................]   │
│                                    │
│ [ Se connecter ]                   │
│                                    │
│ Mot de passe oublié ?              │
└────────────────────────────────────┘
```

---

# 75. Login mobile

Encore plus simple :

```text
GAB-EDT

Bienvenue 👋

Email
[................]

Mot de passe
[................]

[ Se connecter ]

Mot de passe oublié ?
```

---

# 76. Onboarding étudiant

Étapes :

```text
Bienvenue
↓
Choisir établissement
↓
Se connecter
↓
Confirmer classe/groupe
↓
Activer notifications
↓
Accueil
```

Ne pas demander des informations inutiles.

---

# 77. Pages d'administration

Toutes les pages administratives doivent utiliser une structure cohérente :

```text
Breadcrumb

Titre                             [Action principale]

Description courte

Filtres / recherche

Contenu principal

Pagination
```

---

# 78. Page de gestion d'une ressource

Exemple :

```text
Enseignants                     [ + Ajouter ]

Rechercher...
Filtres...

┌────────────────────────────────────┐
│ Liste                              │
└────────────────────────────────────┘
```

---

# 79. Page paramètres

Organiser les paramètres par catégories :

```text
Paramètres
├── Établissement
├── Année académique
├── Utilisateurs
├── Notifications
├── Emploi du temps
├── Sécurité
└── Intégrations
```

Ne pas afficher tous les paramètres sur un seul écran.

---

# 80. Page d'import

```text
Importer un emploi du temps

┌─────────────────────────────┐
│                             │
│   Déposer le fichier ici    │
│                             │
│    XLSX / CSV               │
│                             │
│ [ Choisir un fichier ]      │
└─────────────────────────────┘
```

Puis :

```text
Étape 1 — Fichier
Étape 2 — Mapping
Étape 3 — Validation
Étape 4 — Résultat
```

---

# 81. Page conflits

Afficher une liste claire :

```text
3 conflits critiques

┌─────────────────────────────────────┐
│ 🔴 Salle B204                       │
│ Mardi 14h – 16h                     │
│ L2 INFO / L3 INFO                   │
│ [ Résoudre ]                        │
└─────────────────────────────────────┘
```

---

# 82. Résolution de conflit

L'utilisateur doit avoir des suggestions :

```text
Conflit détecté

Solutions :

○ Salle C102 — libre
○ Salle A204 — libre
○ Mardi 16h–18h
○ Jeudi 14h–16h
```

Future évolution :

→ recommandations automatiques.

---

# 83. Notifications Web

Centre de notifications :

```text
🔔 Notifications

Aujourd'hui
──────────────
Salle B204 modifiée
Il y a 5 min

Cours annulé
Il y a 1h
```

Chaque notification doit avoir :

- type ;
- titre ;
- résumé ;
- date ;
- état lu/non lu.

---

# 84. Notification non lue

Ajouter :

```text
●
```

et un fond légèrement différent.

Ne pas utiliser du rouge pour les notifications normales.

---

# 85. Accessibilité

Objectif :

```text
WCAG 2.1 AA
```

Dans la mesure du possible.

Règles :

- contraste suffisant ;
- focus visible ;
- navigation clavier ;
- labels ;
- messages d'erreur accessibles ;
- pas de contenu dépendant uniquement de la couleur.

---

# 86. Responsive breakpoints

Référence :

```text
Mobile       < 640px
Tablet       640–1024px
Desktop      1024–1440px
Large        > 1440px
```

Les valeurs peuvent être ajustées à la bibliothèque CSS.

---

# 87. Grille Web

Utiliser une grille :

```text
12 colonnes desktop
```

Exemple :

```text
Carte 1 → 3 colonnes
Carte 2 → 3 colonnes
Carte 3 → 3 colonnes
Carte 4 → 3 colonnes
```

Sur tablette :

```text
6 + 6
```

Sur mobile :

```text
12
```

---

# 88. Largeur maximale du contenu

Éviter que le contenu s'étende indéfiniment.

Référence :

```text
max-width : 1440px
```

Le calendrier peut utiliser davantage d'espace lorsqu'il en a besoin.

---

# 89. Z-index

Définir une hiérarchie :

```text
Base
Sticky
Dropdown
Popover
Modal
Toast
```

Éviter les z-index arbitraires partout.

---

# 90. Animation

Les animations doivent être discrètes.

Utiliser :

```text
150–250ms
```

pour :

- hover ;
- dropdown ;
- modal ;
- drawer ;
- transitions.

Éviter les animations longues.

---

# 91. Motion accessibility

Respecter :

```text
prefers-reduced-motion
```

Si activé :

→ réduire/supprimer les animations non essentielles.

---

# 92. Skeleton et transitions

Lors du chargement :

```text
skeleton
→ contenu
```

Éviter les changements brusques de layout.

---

# 93. Messages système

Utiliser un vocabulaire simple.

Préférer :

```text
Cours enregistré.
```

à :

```text
Operation successfully completed.
```

L'application principale est en français.

---

# 94. Vocabulaire par type d'établissement

L'UI doit adapter certains termes.

## Université

```text
Étudiant
Formation
Promotion
Faculté
Département
Semestre
```

## Grande École

```text
Étudiant
Programme
Cycle
Promotion
Spécialisation
```

## Lycée

```text
Élève
Série
Classe
Trimestre
Option
```

## Collège

```text
Élève
Niveau
Classe
Option
```

Le design system reste identique.

---

# 95. Design tokens

Créer les tokens dans un fichier central.

Exemple :

```typescript
const tokens = {
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#EFF6FF',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0891B2',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#475569',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  }
}
```

Antigravity doit centraliser ces valeurs plutôt que les répéter dans tous les composants.

---

# 96. Composants UI obligatoires

Créer un design system de base comprenant au minimum :

```text
Button
IconButton
Input
Textarea
Select
Combobox
Checkbox
Radio
Switch
DatePicker
TimePicker
FormField
FormSection
Card
Badge
Chip
Avatar
Tooltip
Popover
Dropdown
Modal
Drawer
Toast
Alert
Table
Pagination
Tabs
Breadcrumb
Sidebar
Topbar
Calendar
CalendarEvent
EmptyState
Skeleton
Spinner
```

---

# 97. Architecture des composants

Web :

```text
components/
├── ui/
├── layout/
├── forms/
├── tables/
├── calendar/
├── feedback/
└── navigation/
```

Ne pas créer des composants identiques à plusieurs endroits.

---

# 98. Variante des composants

Button :

```text
variant:
primary
secondary
outline
ghost
danger
link
```

size :

```text
sm
md
lg
```

Ne pas créer 30 variantes inutiles.

---

# 99. Dark Mode

Tous les composants doivent utiliser les design tokens.

Éviter :

```text
background: #ffffff
```

directement dans chaque composant.

Préférer les variables :

```text
--color-surface
```

---

# 100. Formulaires — règles UX générales

1. Le premier champ doit être évident.
2. Les champs liés doivent être regroupés.
3. Les erreurs apparaissent immédiatement ou à la soumission.
4. Ne pas effacer les données lors d'une erreur.
5. Le bouton principal reste visible.
6. Les formulaires longs utilisent un stepper ou des sections.
7. Sur mobile, tout passe en une colonne.

---

# 101. Formulaire avec sauvegarde

Si la sauvegarde prend plus d'une seconde :

```text
[ ⟳ Enregistrement... ]
```

Désactiver le bouton pendant l'opération.

---

# 102. Formulaire avec succès

Après succès :

```text
✓ Cours créé avec succès.
```

Puis :

- fermer modal ;
- ouvrir détail ;
- ou actualiser calendrier.

Selon le contexte.

---

# 103. Confirmation des actions destructives

Pour :

- supprimer ;
- annuler ;
- dépublier ;
- archiver.

Demander confirmation lorsque l'action est irréversible ou importante.

---

# 104. Actions irréversibles

Le bouton danger doit être explicite :

```text
[ Annuler définitivement le cours ]
```

plutôt que :

```text
[ OK ]
```

---

# 105. Dashboard — responsive

Desktop :

```text
4 cartes
```

Tablet :

```text
2 cartes
```

Mobile :

```text
1 carte
```

---

# 106. Dashboard — hiérarchie

Ordre :

```text
1. Informations importantes
2. Actions rapides
3. Statistiques
4. Calendrier
5. Activité récente
```

---

# 107. Activité récente

Exemple :

```text
Activité récente

14:32
Jean MBO a déplacé un cours

13:54
Le planning L2 a été publié

12:30
Salle C102 a été ajoutée
```

---

# 108. Page calendrier — responsive

Desktop :

```text
grille semaine
```

Mobile :

```text
liste par jour
```

Ne pas simplement réduire la grille desktop sur mobile.

---

# 109. Sidebar mobile

Sur mobile Web :

```text
menu hamburger
```

Le panneau apparaît en drawer.

---

# 110. Search mobile

La recherche peut être accessible depuis :

```text
⌕
```

et s'ouvrir en plein écran.

---

# 111. Application Flutter — design system

Flutter doit reprendre exactement :

- palette ;
- typographie ;
- spacing ;
- radii ;
- statuts ;
- langage visuel.

Créer :

```text
ThemeData
ColorScheme
TextTheme
InputDecorationTheme
ButtonTheme
CardTheme
```

---

# 112. Flutter — composants

Créer des widgets réutilisables :

```text
AppButton
AppTextField
AppDropdown
AppCard
AppBadge
AppBottomSheet
AppEmptyState
AppErrorState
AppSkeleton
ScheduleCard
ScheduleEventTile
```

---

# 113. Flutter — cartes de cours

```text
┌────────────────────────────┐
│ 14:00                      │
│ Programmation              │
│ Salle B204                 │
│ Dr. MBO                    │
└────────────────────────────┘
```

La matière est prioritaire visuellement.

---

# 114. Flutter — état annulé

```text
┌────────────────────────────┐
│ ❌ ANNULÉ                  │
│ Programmation              │
│ 14:00                      │
└────────────────────────────┘
```

Ajouter le texte, pas seulement une couleur.

---

# 115. Flutter — prochain cours

Le prochain cours doit être la carte visuellement dominante de l'accueil.

```text
┌───────────────────────────────┐
│ PROCHAIN COURS                │
│                               │
│ Programmation                 │
│ 14:00 – 16:00                │
│ Salle B204                   │
│                               │
│ Dans 1h12                    │
└───────────────────────────────┘
```

---

# 116. Empty states mobile

Exemple :

```text
Aucun cours aujourd'hui

Profitez de votre journée !
```

---

# 117. Offline mobile

Afficher :

```text
Mode hors connexion

Dernière synchronisation :
15 sept. à 08:42
```

Ne pas afficher une erreur réseau agressive si le cache est disponible.

---

# 118. Erreurs réseau mobile

Si aucune donnée :

```text
Impossible de charger l'emploi du temps.

[ Réessayer ]
```

Si cache disponible :

```text
Vous consultez les dernières données
disponibles hors ligne.
```

---

# 119. Notifications push

Lorsqu'un utilisateur ouvre une notification, le deep link doit l'amener directement à l'information concernée.

Exemple :

```text
notification
↓
cours déplacé
↓
écran détail du cours
```

---

# 120. Pages publiques

Une page publique peut utiliser une structure plus légère :

```text
Logo

Emploi du temps
Classe : L2 Informatique

[ Aujourd'hui ] [ Semaine ]

Calendrier

Footer
```

Pas de sidebar administrative.

---

# 121. Landing page future

La page marketing pourra contenir :

```text
Hero
↓
Problème
↓
Solution
↓
Fonctionnalités
↓
Pour Universités
↓
Pour Grandes Écoles
↓
Pour Lycées
↓
Pour Collèges
↓
Mobile
↓
Sécurité
↓
Contact
```

---

# 122. Illustration et iconographie

Privilégier :

- illustrations simples ;
- captures du produit ;
- pictogrammes sobres.

Éviter les illustrations génériques sur tous les écrans.

---

# 123. Design du logo

Concept possible :

```text
G
+
grille calendrier
```

Le logo doit être lisible :

```text
favicon
app icon
mobile
Web
impression
```

---

# 124. Favicon et app icon

Créer une version carrée très simple.

Exemple conceptuel :

```text
┌───────┐
│  G    │
│ █ █   │
│ █ █   │
└───────┘
```

---

# 125. Design institutionnel

Le produit doit pouvoir être personnalisé par établissement :

```text
Logo de l'établissement
Nom
Couleur secondaire
```

mais sans casser la charte GAB-EDT.

Structure :

```text
GAB-EDT Brand
      +
Institution Branding
```

---

# 126. White-label futur

Prévoir des tokens :

```text
institutionPrimaryColor
institutionLogo
institutionName
```

L'établissement peut personnaliser certains éléments.

---

# 127. Responsive des tables

Sur mobile, ne pas afficher 10 colonnes minuscules.

Transformer en cartes :

```text
Programmation
L2 INFO
Dr. MBO
Salle B204
Publié
```

---

# 128. Responsive des formulaires

Desktop :

```text
2 colonnes
```

Mobile :

```text
1 colonne
```

---

# 129. Responsive des filtres

Desktop :

```text
filtres visibles
```

Mobile :

```text
[ Filtrer ]
```

→ bottom sheet ou drawer.

---

# 130. Focus states

Tous les éléments interactifs doivent avoir un état focus visible.

Particulièrement :

- boutons ;
- inputs ;
- selects ;
- liens ;
- calendrier ;
- navigation.

---

# 131. Disabled states

Un élément désactivé doit être :

- visuellement différent ;
- non cliquable ;
- compréhensible.

Ne pas simplement réduire l'opacité à 20%.

---

# 132. Hover states

Desktop uniquement lorsque pertinent.

Exemple :

```text
Card
→ légère variation du background
```

Pas d'effet spectaculaire.

---

# 133. Click feedback

Les boutons doivent avoir un retour visuel rapide.

---

# 134. Contraste

Toujours vérifier le contraste des textes.

Éviter le gris trop clair pour du texte important.

---

# 135. Textes longs

Prévoir :

- ellipsis ;
- tooltip ;
- wrap ;
- hauteur flexible.

Ne jamais couper silencieusement une information importante.

---

# 136. Formulaires pour les quatre établissements

Le composant formulaire doit être configurable.

Exemple :

```text
CourseForm({
  institutionType,
  availableFields
})
```

Université :

```text
Formation
Niveau
Promotion
Groupe
```

Lycée :

```text
Série
Classe
Option
```

Ne pas dupliquer tout le formulaire en quatre versions.

---

# 137. Menus adaptatifs

Le design system doit permettre :

```text
UNIVERSITY
GRANDE_ECOLE
LYCEE
COLLEGE
```

Le menu est généré à partir de la configuration.

---

# 138. Couleurs de statut

Statuts principaux :

```text
Draft       → Neutral
Published   → Success
Modified    → Info
Moved       → Warning
Cancelled   → Danger
Archived    → Neutral
```

---

# 139. Couleur et accessibilité

Toujours compléter les couleurs par :

- texte ;
- icône ;
- forme ;
- pattern lorsque pertinent.

---

# 140. Design du calendrier — grille horaire

La grille doit avoir :

```text
colonne heure
colonnes jours
```

Les lignes horaires doivent être régulières.

Afficher les demi-heures uniquement lorsque nécessaire.

---

# 141. Événement calendrier — responsive

Desktop :

```text
Programmation
14h–16h
B204
```

Mobile :

```text
14:00
Programmation
Salle B204
```

---

# 142. Drag & drop

Le calendrier Web pourra permettre le déplacement par drag & drop.

UX :

```text
drag
↓
nouvelle position
↓
prévisualisation
↓
validation
```

En cas de conflit :

```text
⚠ Conflit
```

Ne jamais appliquer silencieusement un déplacement invalide.

---

# 143. Undo

Pour certaines actions :

```text
Cours déplacé.
[ Annuler ]
```

Utile pour les actions rapides.

---

# 144. Actions bulk

Pour les administrations :

```text
☑ cours 1
☑ cours 2
☑ cours 3

3 sélectionnés

[ Déplacer ]
[ Annuler ]
[ Exporter ]
```

Les actions bulk doivent demander confirmation pour les changements importants.

---

# 145. Import — expérience UX

Étape 1 :

```text
Upload
```

Étape 2 :

```text
Mapping
```

Étape 3 :

```text
Validation

✓ 120 lignes valides
⚠ 3 conflits
✕ 2 erreurs
```

Étape 4 :

```text
Importer
```

---

# 146. Résultat d'import

Toujours afficher :

```text
Total
Créés
Mis à jour
Ignorés
Erreurs
Conflits
```

---

# 147. Page de statistiques

Utiliser :

- cartes ;
- graphiques simples ;
- tableaux ;
- filtres.

Éviter les dashboards surchargés de graphiques.

---

# 148. Graphiques

Utiliser des graphiques simples :

```text
bar chart
line chart
donut
```

Maximum quelques visualisations importantes par écran.

---

# 149. Couleurs graphiques

Utiliser la palette GAB-EDT.

Ne pas créer une nouvelle couleur arbitraire pour chaque graphique.

---

# 150. Page mobile statistiques

Les étudiants n'ont normalement pas besoin des statistiques administratives.

Ne pas les afficher dans l'expérience étudiante.

---

# 151. Personnalisation institutionnelle

Une université peut avoir :

```text
logo
nom
couleur secondaire
```

La couleur primaire GAB-EDT reste dominante pour les interactions critiques si le white-label complet n'est pas activé.

---

# 152. Architecture CSS

Utiliser :

```text
design tokens
+
component variants
+
utility classes
```

Éviter des styles inline dispersés.

---

# 153. Tailwind

Si Tailwind est utilisé :

```text
globals.css
tailwind config / theme
design tokens
```

Les couleurs, espacements et rayons doivent être centralisés.

---

# 154. Shadcn/ui

Si shadcn/ui est retenu :

- personnaliser les tokens ;
- conserver l'accessibilité ;
- ne pas laisser les composants avec les valeurs par défaut ;
- créer la véritable identité GAB-EDT.

---

# 155. Composants calendrier

Centraliser :

```text
Calendar
CalendarHeader
CalendarToolbar
CalendarGrid
CalendarEvent
CalendarEventPopover
CalendarFilters
```

---

# 156. Composants formulaires

Centraliser :

```text
Form
FormField
FormLabel
FormDescription
FormMessage
FormSection
```

Tous les formulaires doivent suivre les mêmes règles.

---

# 157. États d'application

Prévoir explicitement :

```text
Loading
Success
Empty
Error
Offline
Unauthorized
Forbidden
```

Chaque page importante doit avoir une représentation de ces états lorsque pertinent.

---

# 158. États de permission

Si un utilisateur n'a pas accès :

```text
403

Accès refusé

Vous n'avez pas les droits nécessaires
pour consulter cette page.
```

Ne pas simplement afficher une page vide.

---

# 159. Page 404

```text
404

Cette page n'existe pas.

[ Retour au tableau de bord ]
```

---

# 160. Page 500

```text
Une erreur est survenue.

Nous n'avons pas pu afficher cette page.

[ Réessayer ]
```

---

# 161. Microcopy

Le ton doit être :

```text
professionnel
humain
direct
rassurant
```

Exemple :

```text
✓ Emploi du temps publié.
Les étudiants concernés ont été informés.
```

---

# 162. Éviter les textes techniques

Ne jamais afficher :

```text
NullPointerException
HTTP 500
SQL error
```

à l'utilisateur final.

Les détails techniques vont dans les logs.

---

# 163. Confirmation après création

Après :

```text
Créer un cours
```

montrer :

```text
✓ Cours créé avec succès.
```

Puis proposer éventuellement :

```text
[ Voir le cours ]
```

---

# 164. Optimisation UX

L'utilisateur doit pouvoir réaliser les tâches principales avec peu d'étapes.

Créer un cours idéal :

```text
< 1 minute
```

pour un utilisateur expérimenté.

---

# 165. Raccourcis clavier futurs

Web :

```text
N → nouveau cours
T → aujourd'hui
← → → navigation semaine
Ctrl + K → recherche
```

À ajouter uniquement après stabilisation du MVP.

---

# 166. Performance visuelle

Le design doit éviter :

- grandes images inutiles ;
- animations lourdes ;
- composants excessivement complexes ;
- tableaux qui re-renderent tout le temps.

---

# 167. Virtualisation

Pour de grandes listes :

- étudiants ;
- enseignants ;
- salles ;
- événements.

Utiliser la virtualisation lorsqu'elle est nécessaire.

---

# 168. Calendrier avec beaucoup d'événements

Le calendrier doit rester fluide avec un grand nombre d'événements.

Prévoir :

- filtrage ;
- virtualisation si nécessaire ;
- memoization ;
- calculs côté backend lorsque pertinent.

---

# 169. Mobile performance

L'écran d'accueil étudiant doit s'afficher rapidement.

Priorité :

```text
prochain cours
cours du jour
notifications
```

---

# 170. Règle d'or du design

Avant de créer un composant, Antigravity doit vérifier :

```text
Existe-t-il déjà un composant similaire ?
```

Si oui :

→ réutiliser.

Si non :

→ créer un composant générique.

---

# 171. Règle anti-duplication

Ne pas créer :

```text
BlueButton
PrimaryButton
MainButton
CreateButton
SubmitButton
```

Créer :

```text
Button variant="primary"
```

---

# 172. Règle de cohérence

Une même action doit être visuellement identique partout :

```text
Créer
Modifier
Supprimer
Publier
Annuler
Exporter
```

---

# 173. Règle des couleurs

Ne jamais mettre directement une nouvelle couleur dans un composant sans raison.

Utiliser :

```text
design token
semantic token
```

---

# 174. Règle du calendrier

Le calendrier est le composant métier principal.

Toute modification de son style doit être vérifiée sur :

```text
Université
Grande École
Lycée
Collège
```

et :

```text
Desktop
Tablet
Mobile
```

---

# 175. Règle des formulaires

Tous les formulaires doivent avoir :

```text
label
helper/error
required state
focus state
loading state
success/error handling
```

---

# 176. Règle mobile

Ne jamais simplement "réduire" l'interface desktop.

Il faut concevoir un comportement mobile spécifique.

---

# 177. Règle d'établissement

L'identité institutionnelle peut modifier :

```text
logo
nom
couleur secondaire
```

mais ne doit pas casser :

```text
accessibilité
contraste
hiérarchie
composants
```

---

# 178. Definition of Done — Design

Une page est terminée lorsque :

```text
✓ responsive
✓ accessible
✓ cohérente avec les tokens
✓ états loading/error/empty
✓ permissions
✓ mobile
✓ desktop
✓ composants réutilisés
✓ aucun style arbitraire inutile
```

---

# 179. Prompt global à donner à Antigravity

```text
Tu es le UI/UX designer et frontend engineer de GAB-EDT.

Utilise la documentation GAB-EDT Design System comme source de vérité.

OBJECTIF
Construire une application :
- moderne ;
- institutionnelle ;
- très lisible ;
- ergonomique ;
- responsive ;
- accessible ;
- mobile-first pour les étudiants ;
- desktop-first pour l'administration.

STACK
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui si présent

RÈGLES
1. Réutilise les composants existants.
2. N'invente pas de nouvelles couleurs sans raison.
3. Utilise les design tokens.
4. Utilise Inter/system-ui.
5. Respecte les espacements.
6. Respecte les états loading/error/empty.
7. Tous les formulaires doivent avoir des labels et des messages d'erreur.
8. Les actions destructives utilisent le style danger.
9. Le calendrier est la fonctionnalité visuelle principale.
10. Le mobile ne doit pas être une simple réduction du desktop.
11. Respecte les types d'établissement :
   UNIVERSITY
   GRANDE_ECOLE
   LYCEE
   COLLEGE
12. Adapte le vocabulaire et les menus selon l'établissement.
13. Vérifie l'accessibilité.
14. Vérifie les états hover/focus/disabled/loading.
15. Ne duplique pas les composants.
16. Ne mélange pas plusieurs familles d'icônes.
17. Ne mets pas de logique métier dans les composants UI.
18. Avant toute modification, inspecte les composants déjà existants.
```

---

# 180. Prompt pour créer une nouvelle page

```text
Avant de créer la page :

1. Identifie son rôle.
2. Identifie son type d'utilisateur.
3. Identifie son type d'établissement.
4. Réutilise le layout GAB-EDT.
5. Réutilise les composants UI existants.
6. Définis :
   - loading ;
   - empty ;
   - error ;
   - success ;
   - unauthorized si pertinent.
7. Conçois d'abord desktop puis responsive mobile,
   ou mobile-first lorsque la page est principalement mobile.
8. Utilise les design tokens.
9. Vérifie les espacements, la hiérarchie et l'accessibilité.
10. Ne crée pas de styles arbitraires.
```

---

# 181. Prompt pour créer un formulaire

```text
Construis ce formulaire selon le Design System GAB-EDT.

Obligatoire :
- labels visibles ;
- champs requis ;
- helper text si nécessaire ;
- validation ;
- erreurs près des champs ;
- loading state ;
- success state ;
- responsive ;
- clavier accessible ;
- focus visible ;
- bouton principal clairement identifiable.

Desktop :
2 colonnes lorsque logique.

Mobile :
1 colonne.

Utilise les composants FormField, Input, Select, Combobox,
DatePicker et TimePicker existants avant d'en créer de nouveaux.
```

---

# 182. Prompt pour calendrier

```text
Construis ou modifie le calendrier GAB-EDT.

Le calendrier doit :
- être extrêmement lisible ;
- supporter jour/semaine/mois ;
- afficher clairement les heures ;
- afficher les événements ;
- gérer les statuts ;
- utiliser des couleurs sémantiques ;
- ne pas dépendre uniquement de la couleur ;
- permettre les filtres ;
- ouvrir le détail dans un drawer/popover ;
- être responsive ;
- rester utilisable avec beaucoup d'événements.

Toute logique de conflit vient du backend.
Le frontend ne doit pas inventer de règle métier.
```

---

# 183. Prompt pour audit visuel

```text
Audite cette page par rapport au Design System GAB-EDT.

Vérifie :
- hiérarchie visuelle ;
- spacing ;
- couleurs ;
- typographie ;
- boutons ;
- formulaires ;
- responsive ;
- accessibilité ;
- loading ;
- empty state ;
- error state ;
- cohérence des composants ;
- duplication ;
- densité ;
- calendrier ;
- mobile.

Corrige uniquement ce qui est nécessaire.
Réutilise les composants existants.
```

---

# 184. Prompt pour audit complet UX

```text
Effectue un audit UX complet de l'écran.

Analyse :
1. compréhension immédiate ;
2. navigation ;
3. hiérarchie ;
4. nombre d'actions ;
5. charge cognitive ;
6. erreurs potentielles ;
7. feedback utilisateur ;
8. responsive ;
9. accessibilité ;
10. cohérence avec GAB-EDT.

Propose puis implémente les corrections nécessaires
sans modifier les règles métier backend.
```

---

# 185. Prompt pour audit mobile

```text
Audite cet écran mobile GAB-EDT.

Vérifie :
- ergonomie tactile ;
- largeur des boutons ;
- taille des textes ;
- densité ;
- navigation ;
- scroll ;
- clavier ;
- bottom navigation ;
- états offline ;
- notifications ;
- prochain cours ;
- contraste ;
- accessibilité.

L'utilisateur doit pouvoir comprendre l'écran
en quelques secondes.
```

---

# 186. Checklist finale Antigravity

Avant de considérer une interface terminée :

```text
[ ] Design tokens utilisés
[ ] Inter/system-ui
[ ] Couleurs cohérentes
[ ] Spacing cohérent
[ ] Boutons cohérents
[ ] Inputs cohérents
[ ] Labels visibles
[ ] États loading
[ ] États empty
[ ] États error
[ ] États success
[ ] Focus
[ ] Disabled
[ ] Responsive
[ ] Mobile
[ ] Accessibilité
[ ] Permissions UI
[ ] Type d'établissement
[ ] Vocabulaire adapté
[ ] Composants réutilisés
[ ] Aucun composant doublon
[ ] Aucune couleur arbitraire
```

---

# 187. Architecture finale du Design System

```text
GAB-EDT DESIGN SYSTEM
│
├── Foundations
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Radius
│   ├── Shadows
│   ├── Breakpoints
│   └── Motion
│
├── Components
│   ├── Buttons
│   ├── Forms
│   ├── Feedback
│   ├── Navigation
│   ├── Tables
│   ├── Calendar
│   └── Data Display
│
├── Patterns
│   ├── CRUD
│   ├── Forms
│   ├── Dashboard
│   ├── Import
│   ├── Conflict Resolution
│   └── Publication
│
└── Screens
    ├── Admin
    ├── Teacher
    ├── Student
    ├── Public
    └── Mobile
```

---

# 188. Conclusion

GAB-EDT doit avoir une identité visuelle immédiatement reconnaissable :

```text
                 GAB-EDT

       Moderne + Institutionnel
                 +
        Calendrier très lisible
                 +
          Dashboard clair
                 +
        Mobile extrêmement simple
                 +
          Design accessible
                 +
       Composants réutilisables
```

Le système de design doit rester suffisamment neutre pour être utilisé par :

```text
Université
Grande École
Lycée
Collège
```

tout en permettant à chaque établissement d'ajouter son identité.

Le résultat attendu n'est pas simplement une interface "jolie". Il doit être :

> **visuellement professionnel, ergonomique, prévisible, accessible et extrêmement efficace pour la gestion quotidienne des emplois du temps.**
