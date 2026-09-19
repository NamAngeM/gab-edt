# GAB-EDT — Cas d'utilisation par type d'établissement
## Universités • Grandes Écoles • Lycées • Collèges

> Document de référence fonctionnelle pour le Vibe Coding avec Antigravity.

## 1. Principe général

GAB-EDT est une plateforme unique de gestion et de planification des emplois du temps. Elle cible quatre types d'établissements :

- Universités
- Grandes Écoles
- Lycées
- Collèges

Le produit doit partager un socle commun (utilisateurs, planning, salles, cours, conflits, publication, notifications, audit, import/export) tout en adaptant la structure pédagogique, les rôles, les menus, les workflows et les fonctionnalités selon le type d'établissement.

```text
                         GAB-EDT
                            |
             +--------------+---------------+
             |              |               |
         UNIVERSITÉ    GRANDE ÉCOLE     SECONDAIRE
                                            |
                                      +-----+-----+
                                      |           |
                                    LYCÉE      COLLÈGE
```

Le système ne doit pas devenir quatre applications séparées.

---

# 2. Types d'établissement

```text
UNIVERSITY
GRANDE_ECOLE
LYCEE
COLLEGE
```

Prévoir une extension future pour :

```text
CENTRE_FORMATION
INSTITUT
ECOLE_SPECIALISEE
```

---

# 3. Socle commun à tous les établissements

## UC-COMMON-001 — Créer un établissement
**Priorité : P0**

Le super administrateur renseigne le nom, code, type, ville, logo, fuseau horaire et statut.

## UC-COMMON-002 — Créer une année académique
**P0**

Exemple : `2026-2027`.

## UC-COMMON-003 — Configurer les périodes académiques
**P0**

Semestres, trimestres, périodes d'examens, vacances, jours fériés et journées pédagogiques.

## UC-COMMON-004 — Créer / modifier / désactiver un utilisateur
**P0**

## UC-COMMON-005 — Attribuer un rôle et un périmètre d'accès
**P0**

## UC-COMMON-006 — Créer un enseignant
**P0**

## UC-COMMON-007 — Créer un apprenant
**P0**

Le terme technique recommandé est `Learner`, affiché comme **Étudiant** dans le supérieur et **Élève** dans le secondaire.

## UC-COMMON-008 — Créer une matière
**P0**

## UC-COMMON-009 — Créer / gérer une salle
**P0**

Capacité, bâtiment, étage, type et équipements.

## UC-COMMON-010 — Créer un cours
**P0**

## UC-COMMON-011 — Programmer un événement d'emploi du temps
**P0**

## UC-COMMON-012 — Modifier, déplacer ou annuler un cours
**P0**

## UC-COMMON-013 — Détecter les conflits
**P0**

Conflits au minimum : enseignant, salle, groupe/classe, créneau.

## UC-COMMON-014 — Publier l'emploi du temps
**P0**

## UC-COMMON-015 — Notifier les personnes concernées
**P0**

## UC-COMMON-016 — Consulter l'emploi du temps
**P0**

Vue jour, semaine, mois et liste.

## UC-COMMON-017 — Importer Excel/CSV
**P0**

## UC-COMMON-018 — Exporter PDF/Excel et imprimer
**P0**

## UC-COMMON-019 — Consulter l'historique
**P1**

## UC-COMMON-020 — Journaliser une action administrative
**P0**

---

# 4. Universités

## 4.1 Structure cible

```text
Université
└── Campus
    └── Faculté
        └── Département
            └── Formation
                └── Niveau
                    └── Promotion
                        └── Groupe
```

Exemple :

```text
Université X
└── Faculté des Sciences
    └── Département Informatique
        └── Licence Informatique
            └── L2
                ├── Groupe 1
                └── Groupe 2
```

## 4.2 Rôles spécifiques

- Administrateur université
- Doyen / vice-doyen
- Directeur de département
- Responsable de formation
- Responsable pédagogique
- Scolarité
- Enseignant-chercheur
- Étudiant
- Responsable des examens
- Responsable des salles

## 4.3 Cas d'utilisation — Organisation

### UC-UNI-001 — Créer une faculté
**P0**

### UC-UNI-002 — Créer un département
**P0**

### UC-UNI-003 — Créer une formation
**P0**

### UC-UNI-004 — Créer un niveau universitaire
**P0**

Exemples : L1, L2, L3, M1, M2, Doctorat.

### UC-UNI-005 — Créer une promotion
**P0/P1**

### UC-UNI-006 — Créer des groupes
**P0**

### UC-UNI-007 — Affecter les étudiants aux groupes
**P0**

### UC-UNI-008 — Modifier une inscription
**P1**

## 4.4 Cas d'utilisation — Enseignement

### UC-UNI-009 — Créer un enseignement / UE
**P0**

### UC-UNI-010 — Définir un volume horaire
**P1**

### UC-UNI-011 — Définir les crédits
**P1**

### UC-UNI-012 — Associer l'enseignement à une période
**P0**

### UC-UNI-013 — Définir CM / TD / TP
**P0**

### UC-UNI-014 — Affecter plusieurs groupes
**P1**

### UC-UNI-015 — Affecter plusieurs enseignants
**P1**

### UC-UNI-016 — Programmer un cours magistral
**P0**

### UC-UNI-017 — Programmer un TD
**P0**

### UC-UNI-018 — Programmer un TP / laboratoire
**P0**

## 4.5 Cas d'utilisation — Vues de planning

### UC-UNI-019 — Voir l'EDT d'un étudiant
**P0**

### UC-UNI-020 — Voir l'EDT d'un groupe
**P0**

### UC-UNI-021 — Voir l'EDT d'une promotion
**P0**

### UC-UNI-022 — Voir l'EDT d'un enseignant
**P0**

### UC-UNI-023 — Voir l'EDT d'un département
**P1**

### UC-UNI-024 — Voir l'EDT d'une faculté
**P1**

### UC-UNI-025 — Voir l'EDT global
**P1**

## 4.6 Cas d'utilisation — Examens

### UC-UNI-026 — Créer une session d'examens
**P1**

### UC-UNI-027 — Programmer un examen
**P1**

### UC-UNI-028 — Affecter salles et surveillants
**P1**

### UC-UNI-029 — Détecter les conflits d'examen
**P1**

### UC-UNI-030 — Publier et notifier les étudiants
**P1**

## 4.7 Cas d'utilisation — Soutenances et projets

### UC-UNI-031 — Programmer une soutenance
**P2**

### UC-UNI-032 — Affecter un jury
**P2**

### UC-UNI-033 — Affecter une salle de soutenance
**P2**

### UC-UNI-034 — Programmer une séance de projet
**P2**

### UC-UNI-035 — Affecter un encadrant
**P2**

## 4.8 Cas d'utilisation — Ressources

### UC-UNI-036 — Rechercher une salle libre
**P1**

### UC-UNI-037 — Rechercher un créneau libre
**P1**

### UC-UNI-038 — Rechercher un enseignant disponible
**P2**

---

# 5. Grandes Écoles

## 5.1 Structure cible

```text
Grande École
└── Campus
    └── Programme
        └── Cycle
            └── Année
                └── Promotion
                    └── Groupe
                        └── Spécialisation
```

## 5.2 Rôles spécifiques

- Directeur
- Directeur des études
- Responsable de programme
- Responsable pédagogique
- Coordinateur de promotion
- Responsable stages
- Responsable alternance
- Enseignant
- Intervenant externe
- Étudiant

## 5.3 Cas d'utilisation — Structure

### UC-GE-001 — Créer un programme
**P0**

### UC-GE-002 — Créer un cycle
**P0**

### UC-GE-003 — Créer une année de formation
**P0**

### UC-GE-004 — Créer une promotion
**P0**

### UC-GE-005 — Créer une spécialisation
**P1**

### UC-GE-006 — Créer un groupe
**P0**

### UC-GE-007 — Affecter les étudiants
**P0**

## 5.4 Cas d'utilisation — Pédagogie

### UC-GE-008 — Créer un module
**P0**

### UC-GE-009 — Définir un volume horaire
**P0**

### UC-GE-010 — Définir les crédits
**P1**

### UC-GE-011 — Programmer CM / TD / TP
**P0**

### UC-GE-012 — Programmer un atelier
**P1**

### UC-GE-013 — Programmer un projet
**P1**

### UC-GE-014 — Programmer un séminaire
**P1**

### UC-GE-015 — Programmer une conférence
**P1**

### UC-GE-016 — Inviter un intervenant externe
**P2**

## 5.5 Cas d'utilisation — Alternance

### UC-GE-017 — Définir les périodes école / entreprise
**P1**

### UC-GE-018 — Configurer un rythme d'alternance
**P1**

Exemple : 1 semaine école / 3 semaines entreprise.

### UC-GE-019 — Bloquer les cours durant les périodes entreprise
**P1**

### UC-GE-020 — Générer le planning selon le calendrier d'alternance
**P2**

## 5.6 Cas d'utilisation — Stages

### UC-GE-021 — Enregistrer une période de stage
**P2**

### UC-GE-022 — Empêcher automatiquement les séances incompatibles
**P2**

## 5.7 Cas d'utilisation — Évaluations

### UC-GE-023 — Programmer un examen
**P1**

### UC-GE-024 — Programmer une soutenance
**P1**

### UC-GE-025 — Programmer une présentation de projet
**P1**

### UC-GE-026 — Affecter un jury
**P2**

---

# 6. Lycées

## 6.1 Structure cible

```text
Lycée
└── Niveau
    └── Série / Filière
        └── Classe
            ├── Groupe
            └── Option / Spécialité
```

Exemple :

```text
Lycée X
├── Seconde
├── Première
│   ├── 1A
│   └── 1C
└── Terminale
    ├── TC
    └── TD
```

## 6.2 Rôles spécifiques

- Proviseur
- Proviseur adjoint
- Censeur
- Surveillant général
- Responsable pédagogique
- Professeur principal
- Enseignant
- Élève
- Personnel administratif
- Responsable de salle

## 6.3 Cas d'utilisation — Structure

### UC-LYC-001 — Créer un niveau
**P0**

### UC-LYC-002 — Créer une série
**P0**

### UC-LYC-003 — Créer une classe
**P0**

### UC-LYC-004 — Créer un groupe
**P1**

### UC-LYC-005 — Créer une option / spécialité
**P1**

### UC-LYC-006 — Affecter les élèves à une classe
**P0**

### UC-LYC-007 — Affecter les élèves à une option
**P1**

## 6.4 Cas d'utilisation — Enseignants

### UC-LYC-008 — Affecter un enseignant à une matière
**P0**

### UC-LYC-009 — Affecter un enseignant à plusieurs classes
**P0**

### UC-LYC-010 — Désigner un professeur principal
**P1**

### UC-LYC-011 — Définir les disponibilités
**P1**

## 6.5 Cas d'utilisation — Emploi du temps

### UC-LYC-012 — Créer l'EDT d'une classe
**P0**

### UC-LYC-013 — Modifier l'EDT
**P0**

### UC-LYC-014 — Copier / dupliquer une semaine
**P1**

### UC-LYC-015 — Modifier une seule journée
**P0**

### UC-LYC-016 — Annuler un cours
**P0**

### UC-LYC-017 — Déplacer un cours
**P0**

### UC-LYC-018 — Remplacer un enseignant
**P1**

### UC-LYC-019 — Voir l'EDT professeur
**P0**

### UC-LYC-020 — Voir l'EDT classe
**P0**

### UC-LYC-021 — Voir l'EDT global du lycée
**P1**

## 6.6 Cas d'utilisation — Vie scolaire

### UC-LYC-022 — Signaler une absence enseignant
**P1**

### UC-LYC-023 — Rechercher un remplaçant disponible
**P1**

### UC-LYC-024 — Affecter un remplacement
**P1**

### UC-LYC-025 — Identifier les heures non couvertes
**P1**

### UC-LYC-026 — Afficher les modifications du jour
**P1**

## 6.7 Cas d'utilisation — Évaluations

### UC-LYC-027 — Programmer un devoir surveillé
**P1**

### UC-LYC-028 — Programmer un examen
**P1**

### UC-LYC-029 — Affecter salle et surveillant
**P1**

### UC-LYC-030 — Détecter les conflits d'évaluation
**P1**

## 6.8 Cas d'utilisation — Conseil de classe

### UC-LYC-031 — Programmer un conseil de classe
**P2**

### UC-LYC-032 — Affecter une salle
**P2**

### UC-LYC-033 — Inviter les enseignants concernés
**P2**

---

# 7. Collèges

## 7.1 Structure cible

```text
Collège
└── Niveau
    └── Classe
        ├── Groupe
        └── Option
```

Exemple :

```text
Collège X
├── 6e
├── 5e
├── 4e
└── 3e
    ├── 3e A
    ├── 3e B
    └── 3e C
```

## 7.2 Rôles spécifiques

- Principal
- Principal adjoint
- Responsable vie scolaire
- Responsable pédagogique
- Professeur principal
- Enseignant
- Élève
- Personnel administratif

## 7.3 Cas d'utilisation — Structure

### UC-COL-001 — Créer un niveau
**P0**

### UC-COL-002 — Créer une classe
**P0**

### UC-COL-003 — Créer un groupe
**P1**

### UC-COL-004 — Créer une option
**P1**

### UC-COL-005 — Affecter les élèves à une classe
**P0**

## 7.4 Cas d'utilisation — Enseignement

### UC-COL-006 — Créer une matière
**P0**

### UC-COL-007 — Affecter un enseignant
**P0**

### UC-COL-008 — Désigner le professeur principal
**P1**

### UC-COL-009 — Définir le volume horaire
**P1**

## 7.5 Cas d'utilisation — Emploi du temps

### UC-COL-010 — Créer l'EDT d'une classe
**P0**

### UC-COL-011 — Modifier l'EDT
**P0**

### UC-COL-012 — Copier une semaine
**P1**

### UC-COL-013 — Modifier une journée
**P0**

### UC-COL-014 — Annuler un cours
**P0**

### UC-COL-015 — Déplacer un cours
**P0**

### UC-COL-016 — Remplacer un enseignant
**P1**

### UC-COL-017 — Voir l'EDT enseignant
**P0**

### UC-COL-018 — Voir l'EDT classe
**P0**

## 7.6 Cas d'utilisation — Vie scolaire

### UC-COL-019 — Signaler une absence enseignant
**P1**

### UC-COL-020 — Rechercher un remplaçant
**P1**

### UC-COL-021 — Affecter un remplacement
**P1**

### UC-COL-022 — Consulter les cours non couverts
**P1**

### UC-COL-023 — Afficher les modifications du jour
**P1**

## 7.7 Cas d'utilisation — Évaluations

### UC-COL-024 — Programmer une évaluation
**P1**

### UC-COL-025 — Programmer un devoir surveillé
**P1**

### UC-COL-026 — Affecter une salle
**P1**

### UC-COL-027 — Détecter les conflits
**P1**

---

# 8. Application mobile — Étudiants et élèves

La même application Flutter peut être utilisée par les quatre types d'établissements avec un vocabulaire adapté.

## UC-MOBILE-001 — Se connecter
**P0**

## UC-MOBILE-002 — Voir le prochain cours
**P0**

## UC-MOBILE-003 — Voir les cours du jour
**P0**

## UC-MOBILE-004 — Voir l'emploi du temps hebdomadaire
**P0**

## UC-MOBILE-005 — Ouvrir le détail d'un cours
**P0**

## UC-MOBILE-006 — Voir la salle et l'enseignant
**P0**

## UC-MOBILE-007 — Recevoir une notification de changement
**P0**

## UC-MOBILE-008 — Recevoir une notification d'annulation
**P0**

## UC-MOBILE-009 — Recevoir une notification de changement de salle
**P0**

## UC-MOBILE-010 — Recevoir un rappel avant le cours
**P1**

## UC-MOBILE-011 — Consulter le dernier EDT hors ligne
**P1**

## UC-MOBILE-012 — Voir la date de dernière synchronisation
**P1**

---

# 9. Cas d'utilisation spécifiques au mobile par établissement

## Université

- Voir cours et groupes.
- Voir examens.
- Voir soutenances.
- Consulter le planning d'un semestre.
- Ajouter à son calendrier personnel.

## Grande École

- Voir cours et projets.
- Voir examens.
- Voir périodes école/entreprise.
- Voir soutenances.
- Voir événements de promotion.

## Lycée

- Voir l'EDT de la classe.
- Voir les évaluations.
- Voir les changements du jour.
- Recevoir les informations de remplacement.

## Collège

- Voir l'EDT de la classe.
- Voir les évaluations.
- Voir les changements du jour.
- Recevoir les informations de remplacement.

---

# 10. Cas d'utilisation — Remplacements

Fonction particulièrement importante pour lycées et collèges, mais réutilisable dans le supérieur.

## UC-REPLACE-001 — Déclarer une absence enseignant
**P1**

## UC-REPLACE-002 — Chercher les enseignants disponibles
**P1**

## UC-REPLACE-003 — Proposer un remplacement
**P1**

## UC-REPLACE-004 — Affecter un remplacement
**P1**

## UC-REPLACE-005 — Notifier la classe
**P1**

## UC-REPLACE-006 — Notifier l'enseignant remplaçant
**P1**

## UC-REPLACE-007 — Annuler un remplacement
**P2**

---

# 11. Cas d'utilisation — Salles et ressources

## UC-ROOM-001 — Voir l'occupation d'une salle
**P0**

## UC-ROOM-002 — Rechercher une salle libre
**P1**

## UC-ROOM-003 — Bloquer une salle pour maintenance
**P1**

## UC-ROOM-004 — Réserver une salle
**P1**

## UC-ROOM-005 — Vérifier la capacité
**P1**

## UC-ROOM-006 — Vérifier les équipements requis
**P1**

---

# 12. Cas d'utilisation — Récurrence

## UC-REC-001 — Créer une séance récurrente
**P1**

Exemples : tous les lundis, mardi et jeudi, tous les 15 jours.

## UC-REC-002 — Modifier une occurrence
**P1**

## UC-REC-003 — Modifier toute la série
**P1**

## UC-REC-004 — Modifier à partir d'une date
**P2**

## UC-REC-005 — Annuler une occurrence
**P1**

## UC-REC-006 — Annuler toute la série
**P1**

---

# 13. Cas d'utilisation — Examens et évaluations

Commun à tous les établissements, avec des niveaux de complexité différents.

## UC-ASSESS-001 — Créer une période d'évaluation
**P1**

## UC-ASSESS-002 — Programmer une évaluation
**P1**

## UC-ASSESS-003 — Affecter une salle
**P1**

## UC-ASSESS-004 — Affecter un surveillant
**P1**

## UC-ASSESS-005 — Vérifier les conflits d'élèves
**P1**

## UC-ASSESS-006 — Vérifier les conflits d'enseignants
**P1**

## UC-ASSESS-007 — Publier le calendrier
**P1**

## UC-ASSESS-008 — Notifier les apprenants
**P1**

---

# 14. Cas d'utilisation — QR Code et partage public

## UC-QR-001 — Générer le QR d'une classe/groupe
**P1**

## UC-QR-002 — Scanner le QR
**P1**

## UC-QR-003 — Consulter l'EDT via lien public
**P1**

## UC-QR-004 — Révoquer un lien/QR
**P2**

Le mode public doit masquer les données personnelles inutiles.

---

# 15. Cas d'utilisation — Affichage sur écran

Pour halls, couloirs, secrétariats et salles d'accueil.

## UC-DISPLAY-001 — Afficher les cours du jour
**P2**

## UC-DISPLAY-002 — Afficher les salles
**P2**

## UC-DISPLAY-003 — Afficher les changements en temps réel
**P2**

## UC-DISPLAY-004 — Mode plein écran
**P2**

---

# 16. Cas d'utilisation — Import / Export

## Import

### UC-IMPORT-001 — Importer l'organisation
**P1**

### UC-IMPORT-002 — Importer les utilisateurs
**P1**

### UC-IMPORT-003 — Importer enseignants/élèves/étudiants
**P0/P1**

### UC-IMPORT-004 — Importer matières et salles
**P0**

### UC-IMPORT-005 — Importer un EDT
**P0**

### UC-IMPORT-006 — Mapper les colonnes
**P0**

### UC-IMPORT-007 — Prévisualiser
**P0**

### UC-IMPORT-008 — Détecter les erreurs et conflits
**P0**

### UC-IMPORT-009 — Produire un rapport d'import
**P1**

## Export

### UC-EXPORT-001 — PDF classe/groupe
**P0**

### UC-EXPORT-002 — PDF enseignant
**P1**

### UC-EXPORT-003 — PDF salle
**P1**

### UC-EXPORT-004 — Excel
**P0**

### UC-EXPORT-005 — CSV
**P1**

### UC-EXPORT-006 — Impression
**P0**

---

# 17. Cas d'utilisation — Notifications

## UC-NOTIF-001 — Notifier une publication
**P0**

## UC-NOTIF-002 — Notifier une annulation
**P0**

## UC-NOTIF-003 — Notifier un déplacement
**P0**

## UC-NOTIF-004 — Notifier un changement de salle
**P0**

## UC-NOTIF-005 — Notifier un changement d'enseignant
**P1**

## UC-NOTIF-006 — Envoyer un rappel de cours
**P1**

## UC-NOTIF-007 — Envoyer une annonce générale
**P1**

## UC-NOTIF-008 — Envoyer un email
**P1**

## UC-NOTIF-009 — Envoyer un SMS
**P2**

Le SMS peut servir de canal complémentaire pour une modification urgente.

---

# 18. Cas d'utilisation — Dashboard et statistiques

## Tous établissements

Afficher selon le profil :

- nombre de classes/groupes ;
- nombre d'enseignants ;
- nombre d'apprenants ;
- nombre de salles ;
- nombre de cours ;
- conflits ;
- cours annulés ;
- cours modifiés ;
- taux d'occupation des salles.

## Université

Ajouter :

- facultés ;
- départements ;
- formations ;
- promotions ;
- examens.

## Grande École

Ajouter :

- programmes ;
- promotions ;
- projets ;
- stages ;
- alternance.

## Lycée / Collège

Ajouter :

- classes ;
- cours du jour ;
- absences ;
- remplacements ;
- évaluations.

---

# 19. Cas d'utilisation — Direction

## UC-MGMT-001 — Consulter le planning global
**P1**

## UC-MGMT-002 — Voir les conflits critiques
**P1**

## UC-MGMT-003 — Voir les changements récents
**P1**

## UC-MGMT-004 — Voir les cours annulés
**P1**

## UC-MGMT-005 — Approuver une publication
**P1**

## UC-MGMT-006 — Consulter les statistiques
**P1**

---

# 20. Cas d'utilisation — Contraintes et disponibilité

## UC-CONSTRAINT-001 — Définir les heures d'ouverture
**P1**

## UC-CONSTRAINT-002 — Définir les créneaux autorisés
**P1**

## UC-CONSTRAINT-003 — Définir les disponibilités enseignant
**P1**

## UC-CONSTRAINT-004 — Définir les indisponibilités enseignant
**P1**

## UC-CONSTRAINT-005 — Définir les disponibilités salle
**P1**

## UC-CONSTRAINT-006 — Bloquer une période pour une classe
**P1**

## UC-CONSTRAINT-007 — Définir une contrainte forte
**P2**

## UC-CONSTRAINT-008 — Définir une contrainte souple
**P2**

---

# 21. Cas d'utilisation — Génération automatique future

Applicable aux quatre types d'établissement.

## UC-AUTO-001 — Générer automatiquement un planning
**P2**

## UC-AUTO-002 — Générer pour une classe/groupe
**P2**

## UC-AUTO-003 — Générer pour un département/programme
**P2**

## UC-AUTO-004 — Générer pour l'établissement entier
**P2**

## UC-AUTO-005 — Optimiser un EDT existant
**P2**

## UC-AUTO-006 — Minimiser les conflits
**P2**

## UC-AUTO-007 — Minimiser les trous
**P2**

## UC-AUTO-008 — Optimiser les salles
**P2**

## UC-AUTO-009 — Respecter les disponibilités
**P2**

## UC-AUTO-010 — Produire plusieurs propositions
**P3**

---

# 22. Cas d'utilisation — Moteur Rust futur

Le backend principal reste Java/Spring Boot. Rust peut devenir un composant spécialisé.

## UC-RUST-001 — Recevoir les contraintes de planning
**P3**

## UC-RUST-002 — Résoudre le problème de planification
**P3**

## UC-RUST-003 — Retourner une ou plusieurs solutions
**P3**

## UC-RUST-004 — Calculer un score d'optimisation
**P3**

---

# 23. Cas d'utilisation — Assistant intelligent futur

## UC-AI-001 — Répondre aux questions sur l'EDT
**P3**

Exemple : « Quels sont les cours de la Terminale C demain matin ? »

## UC-AI-002 — Trouver une salle libre
**P3**

## UC-AI-003 — Expliquer un conflit
**P3**

## UC-AI-004 — Proposer un remplacement
**P3**

## UC-AI-005 — Proposer des créneaux
**P3**

---

# 24. Cas limites communs

Le backend doit gérer au minimum :

1. Deux cours exactement simultanés pour le même enseignant.
2. Deux cours partiellement chevauchants.
3. Deux cours consécutifs sans chevauchement.
4. Salle trop petite pour le groupe.
5. Salle indisponible ou en maintenance.
6. Enseignant indisponible.
7. Classe/groupe archivé.
8. Cours publié modifié.
9. Annulation d'une seule occurrence d'une série récurrente.
10. Annulation de toute une série.
11. Double création accidentelle.
12. Deux administrateurs modifiant le même événement.
13. Import Excel contenant des doublons.
14. Import contenant des lignes invalides.
15. Import contenant des conflits.
16. Élève/étudiant changé de classe ou groupe.
17. Enseignant affecté à plusieurs groupes.
18. Cours sans salle si l'établissement l'autorise.
19. Cours en ligne.
20. Perte momentanée de connexion mobile.
21. Cours dans une période non autorisée.
22. Modification d'un cours passé.

---

# 25. Règles métier communes

## RF-001 — Isolation institutionnelle

Un utilisateur ne doit jamais accéder aux données d'un autre établissement sans autorisation.

## RF-002 — Autorité backend

Les permissions et règles métier sont contrôlées côté backend.

## RF-003 — Conflit enseignant

Un enseignant ne peut pas avoir deux événements qui se chevauchent.

## RF-004 — Conflit salle

Une salle ne peut pas être occupée simultanément par deux événements.

## RF-005 — Conflit classe/groupe

Une classe/groupe ne peut pas avoir deux cours simultanés.

## RF-006 — Publication

Un brouillon n'est pas visible aux élèves/étudiants.

## RF-007 — Historique

Toute modification importante d'un événement publié doit être historisée.

## RF-008 — Notifications

Les changements significatifs doivent pouvoir déclencher une notification.

## RF-009 — Suppression

Privilégier l'archivage / soft delete des données critiques.

## RF-010 — Fuseau horaire

Utiliser le fuseau horaire configuré par établissement ; pour le Gabon, prévoir `Africa/Libreville`.

---

# 26. Modèle fonctionnel adaptatif

Le système doit centraliser la configuration du type d'établissement.

Exemple :

```json
{
  "institutionType": "LYCEE",
  "structure": {
    "campus": false,
    "faculties": false,
    "departments": false,
    "programs": false,
    "levels": true,
    "series": true,
    "classes": true,
    "groups": true,
    "options": true
  },
  "academicPeriods": {
    "semesters": false,
    "trimesters": true
  },
  "features": {
    "exams": true,
    "replacements": true,
    "soutenances": false,
    "alternance": false
  }
}
```

La configuration doit être centralisée, et non dispersée dans des `if` partout dans le code.

---

# 27. Menus adaptés

## Université

```text
Dashboard
Facultés
Départements
Formations
Niveaux
Promotions
Groupes
Enseignants
Étudiants
Matières / UE
Salles
Cours
Emploi du temps
Examens
Soutenances
Conflits
Notifications
Statistiques
Paramètres
```

## Grande École

```text
Dashboard
Programmes
Cycles
Promotions
Spécialisations
Groupes
Enseignants
Intervenants
Étudiants
Modules
Salles
Cours
Emploi du temps
Examens
Projets
Stages
Alternance
Conflits
Notifications
Statistiques
Paramètres
```

## Lycée

```text
Dashboard
Niveaux
Séries
Classes
Groupes
Options
Élèves
Enseignants
Matières
Salles
Emploi du temps
Remplacements
Évaluations
Conflits
Notifications
Statistiques
Paramètres
```

## Collège

```text
Dashboard
Niveaux
Classes
Groupes
Options
Élèves
Enseignants
Matières
Salles
Emploi du temps
Remplacements
Évaluations
Conflits
Notifications
Statistiques
Paramètres
```

---

# 28. Matrice de couverture

| Fonction | Université | Grande École | Lycée | Collège |
|---|---:|---:|---:|---:|
| Authentification | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Classes | ✓ | ✓ | ✓ | ✓ |
| Groupes | ✓ | ✓ | option | option |
| Enseignants | ✓ | ✓ | ✓ | ✓ |
| Apprenants | ✓ | ✓ | ✓ | ✓ |
| Matières | ✓ | ✓ | ✓ | ✓ |
| Salles | ✓ | ✓ | ✓ | ✓ |
| Cours | ✓ | ✓ | ✓ | ✓ |
| Emploi du temps | ✓ | ✓ | ✓ | ✓ |
| Conflits | ✓ | ✓ | ✓ | ✓ |
| Publication | ✓ | ✓ | ✓ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ |
| Import Excel | ✓ | ✓ | ✓ | ✓ |
| Export | ✓ | ✓ | ✓ | ✓ |
| QR Code | ✓ | ✓ | ✓ | ✓ |
| Examens | ✓ | ✓ | ✓ | ✓ |
| Facultés | ✓ | — | — | — |
| Départements | ✓ | ✓ | option | option |
| Formations | ✓ | ✓ | — | — |
| Promotions | ✓ | ✓ | — | — |
| Séries | — | — | ✓ | — |
| Options / spécialités | ✓ | ✓ | ✓ | ✓ |
| Soutenances | ✓ | ✓ | — | — |
| Projets | ✓ | ✓ | — | — |
| Alternance | — | ✓ | — | — |
| Stages | ✓ | ✓ | — | — |
| Remplacements | option | option | ✓ | ✓ |
| Conseil de classe | — | — | ✓ | ✓ |
| Vie scolaire | — | — | ✓ | ✓ |
| Portail parent | futur | futur | futur | futur |
| Optimisation automatique | futur | futur | futur | futur |
| Assistant IA | futur | futur | futur | futur |
| Moteur Rust | futur | futur | futur | futur |

---

# 29. Workflows complets

## 29.1 Université

```text
Créer faculté
→ département
→ formation
→ niveau
→ promotion
→ groupe
→ enseignants
→ étudiants
→ matières / UE
→ salles
→ cours
→ événements
→ contrôle des conflits
→ validation
→ publication
→ notification
```

## 29.2 Grande École

```text
Créer programme
→ cycle
→ année
→ promotion
→ spécialisation
→ groupes
→ modules
→ intervenants
→ périodes école/entreprise
→ salles
→ cours
→ projets / évaluations
→ contrôle des conflits
→ publication
→ notification
```

## 29.3 Lycée

```text
Créer niveaux
→ séries
→ classes
→ groupes/options
→ enseignants
→ élèves
→ matières
→ salles
→ cours
→ EDT
→ conflits
→ publication
→ suivi des absences
→ remplacement éventuel
→ notification
```

## 29.4 Collège

```text
Créer niveaux
→ classes
→ groupes/options
→ professeurs
→ élèves
→ matières
→ salles
→ cours
→ EDT
→ conflits
→ publication
→ remplacement éventuel
→ notification
```

---

# 30. Priorisation

## P0 — MVP commun

```text
Authentification
Rôles
Établissements
Structure pédagogique minimale
Enseignants
Apprenants
Matières
Salles
Cours
Événements
Calendrier jour/semaine
Détection de conflits
Publication
Notifications de base
Import Excel
Export PDF/Excel
Application mobile EDT
```

## P1 — Consolidation

```text
Disponibilités
Remplacements
Examens
Options
Récurrence avancée
QR Codes
Statistiques
Réservation de salles
Mode hors ligne
Workflow de validation
```

## P2 — Avancé

```text
Optimisation
Soutenances
Projets
Stages
Alternance
Affichage écran
Versioning
Réservations avancées
```

## P3 — Vision stratégique

```text
Moteur Rust
Assistant IA
ENT / LMS
SSO
Google Calendar
Outlook
Portail parents
SMS avancé
SaaS avancé
```

---

# 31. Instructions de développement avec Antigravity

Avant chaque fonctionnalité, Antigravity doit identifier :

```text
1. Type d'établissement concerné
2. Rôle de l'utilisateur
3. Cas d'utilisation
4. Permissions
5. Données nécessaires
6. Règles métier
7. API
8. Base de données
9. Interface Web
10. Interface Mobile
11. Notifications
12. Audit
13. Tests
14. Cas limites
```

Chaque cas d'utilisation doit idéalement suivre :

```text
Définition
→ Préconditions
→ Déclencheur
→ Entrées
→ Parcours nominal
→ Cas alternatifs
→ Règles métier
→ Persistance
→ Audit
→ Notifications
→ API
→ UI
→ Tests
```

Ne pas dupliquer le moteur de planning pour chaque type d'établissement. Les différences doivent être portées par la configuration et par des modules métier spécialisés.

---

# 32. Vision finale

GAB-EDT doit être une **plateforme multi-établissements de planification pédagogique** capable de s'adapter à la réalité d'une université, d'une grande école, d'un lycée ou d'un collège.

```text
                         GAB-EDT
                            │
                    MOTEUR COMMUN
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    IDENTITÉ           PLANIFICATION       NOTIFICATIONS
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    CONFIGURATION TYPE
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
   UNIVERSITÉ         GRANDE ÉCOLE          SECONDAIRE
                                                │
                                           ┌────┴────┐
                                           │         │
                                         LYCÉE   COLLÈGE
```

Le bon principe d'architecture est donc : **un produit, un backend, une base, une API et un moteur de planning communs ; plusieurs modèles d'organisation et expériences utilisateur configurables par type d'établissement.**
