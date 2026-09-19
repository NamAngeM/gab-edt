# GAB-EDT — Catalogue complet des cas d'utilisation

## 0. Objet du document

Ce document recense les cas d'utilisation actuels, futurs, avancés et potentiels de **GAB-EDT**, plateforme web et mobile de gestion des emplois du temps pour les lycées, collèges, établissements d'enseignement supérieur et centres de formation.

L'objectif est de fournir à l'équipe de développement et à Antigravity/Vibe Coding une **référence fonctionnelle exhaustive** des comportements attendus du produit.

Priorités :

- **P0** : indispensable au MVP ;
- **P1** : important après le MVP ;
- **P2** : évolution avancée ;
- **P3** : idée stratégique / fonctionnalité future.

---

# 1. Périmètre général

GAB-EDT doit couvrir :

```text
Établissement
├── Organisation pédagogique
├── Utilisateurs
├── Enseignants
├── Étudiants
├── Classes
├── Groupes
├── Matières
├── Salles
├── Cours
├── Emplois du temps
├── Disponibilités
├── Contraintes
├── Examens
├── Événements
├── Notifications
├── Imports / Exports
├── Statistiques
├── Audit
└── Optimisation
```

---

# 2. Acteurs du système

## A1 — Super administrateur plateforme

Administre l'ensemble de GAB-EDT.

## A2 — Administrateur établissement

Administre un établissement.

## A3 — Responsable pédagogique

Administre un périmètre pédagogique.

## A4 — Secrétariat / scolarité

Gère les données administratives nécessaires à la programmation.

## A5 — Directeur / proviseur / doyen

Consulte, valide et supervise.

## A6 — Enseignant

Consulte son emploi du temps et ses contraintes.

## A7 — Étudiant

Consulte son emploi du temps et reçoit les changements.

## A8 — Parent / tuteur

Acteur optionnel pour une version future.

## A9 — Représentant de classe

Acteur optionnel.

## A10 — Surveillant / vie scolaire

Acteur utile notamment dans les lycées.

## A11 — Responsable de salle / patrimoine

Gère les ressources physiques.

## A12 — Administrateur technique

Gère l'infrastructure et les paramètres techniques.

## A13 — Système de notification

Firebase, email, SMS ou autre moteur de notification.

## A14 — Moteur d'import

Traite les fichiers Excel/CSV.

## A15 — Moteur d'optimisation

Génère éventuellement automatiquement un emploi du temps.

## A16 — Système externe

ENT, LMS, SSO, Google Calendar, Outlook ou autre système intégré.

---

# 3. Authentification et comptes

## UC-AUTH-001 — Se connecter

**Priorité : P0**

L'utilisateur saisit son identifiant et son mot de passe. Le système vérifie le compte, son statut, le tenant et les permissions, puis ouvre la session.

## UC-AUTH-002 — Se déconnecter

**P0**

Fermer proprement la session.

## UC-AUTH-003 — Mot de passe oublié

**P0**

Envoyer un mécanisme de récupération sécurisé.

## UC-AUTH-004 — Réinitialiser le mot de passe

**P0**

Définir un nouveau mot de passe via un lien à durée limitée.

## UC-AUTH-005 — Modifier son mot de passe

**P0**

## UC-AUTH-006 — Première connexion

**P1**

Activation de compte, mot de passe et préférences.

## UC-AUTH-007 — Double authentification

**P2**

Ajouter MFA/2FA.

## UC-AUTH-008 — Connexion SSO

**P3**

OAuth2/OIDC, SAML ou LDAP selon l'établissement.

## UC-AUTH-009 — Protection contre le brute force

**P1**

Limiter les tentatives et protéger les comptes.

## UC-AUTH-010 — Gestion des sessions

**P1**

Voir et révoquer les sessions actives.

---

# 4. Gestion des établissements

## UC-SCHOOL-001 — Créer un établissement

**P0**

Informations : nom, code, type, ville, logo, fuseau horaire, pays et paramètres.

## UC-SCHOOL-002 — Modifier un établissement

**P0**

## UC-SCHOOL-003 — Désactiver un établissement

**P1**

Désactiver sans supprimer les historiques.

## UC-SCHOOL-004 — Archiver un établissement

**P2**

## UC-SCHOOL-005 — Ajouter un campus

**P0**

## UC-SCHOOL-006 — Gérer les bâtiments

**P1**

## UC-SCHOOL-007 — Consulter la vue globale de l'établissement

**P0**

Dashboard des cours, classes, salles, enseignants, publications et conflits.

## UC-SCHOOL-008 — Configurer le fonctionnement de l'établissement

**P1**

Paramètres tels que horaires d'ouverture, jours de cours, vacances et types de périodes.

---

# 5. Organisation pédagogique

## UC-ORG-001 — Créer une faculté

**P0**

## UC-ORG-002 — Créer un département

**P0**

## UC-ORG-003 — Créer une filière / formation

**P0**

## UC-ORG-004 — Créer un niveau

**P0**

Exemples : L1, L2, L3, M1, M2, 2nde, 1ère, Terminale.

## UC-ORG-005 — Créer une classe

**P0**

## UC-ORG-006 — Créer un groupe

**P0**

Exemple : L2 Informatique → Groupe 1 / Groupe 2.

## UC-ORG-007 — Dupliquer une structure académique

**P1**

Reprendre la structure de l'année précédente.

## UC-ORG-008 — Archiver une formation

**P1**

## UC-ORG-009 — Modifier une classe en cours d'année

**P1**

## UC-ORG-010 — Gérer plusieurs structures pédagogiques

**P1**

Prendre en charge université, lycée et centre de formation sans casser le modèle.

---

# 6. Année académique et calendrier institutionnel

## UC-ACADEMIC-001 — Créer une année académique

**P0**

## UC-ACADEMIC-002 — Créer un semestre

**P0**

## UC-ACADEMIC-003 — Créer des trimestres

**P0**

## UC-ACADEMIC-004 — Définir les vacances

**P1**

## UC-ACADEMIC-005 — Définir les jours fériés

**P1**

## UC-ACADEMIC-006 — Définir les journées pédagogiques

**P1**

## UC-ACADEMIC-007 — Définir les périodes d'examens

**P1**

## UC-ACADEMIC-008 — Basculer vers une nouvelle année

**P1**

## UC-ACADEMIC-009 — Définir les jours ouvrés

**P1**

## UC-ACADEMIC-010 — Définir les créneaux horaires standards

**P1**

---

# 7. Gestion des utilisateurs

## UC-USER-001 — Créer un utilisateur

**P0**

## UC-USER-002 — Modifier un utilisateur

**P0**

## UC-USER-003 — Désactiver un utilisateur

**P0**

## UC-USER-004 — Réactiver un utilisateur

**P1**

## UC-USER-005 — Attribuer un rôle

**P0**

## UC-USER-006 — Attribuer plusieurs rôles

**P1**

## UC-USER-007 — Limiter le périmètre d'accès

**P0**

## UC-USER-008 — Importer des utilisateurs en masse

**P1**

## UC-USER-009 — Rechercher un utilisateur

**P0**

## UC-USER-010 — Archiver un utilisateur

**P1**

---

# 8. Enseignants

## UC-TEACHER-001 — Créer un enseignant

**P0**

## UC-TEACHER-002 — Affecter un enseignant à un département

**P0**

## UC-TEACHER-003 — Affecter un enseignant à une ou plusieurs matières

**P0**

## UC-TEACHER-004 — Définir les disponibilités

**P1**

## UC-TEACHER-005 — Définir les indisponibilités

**P1**

## UC-TEACHER-006 — Consulter son EDT

**P0**

## UC-TEACHER-007 — Consulter le planning quotidien

**P0**

## UC-TEACHER-008 — Consulter le planning hebdomadaire

**P0**

## UC-TEACHER-009 — Signaler une erreur

**P1**

## UC-TEACHER-010 — Déclarer une indisponibilité exceptionnelle

**P1**

## UC-TEACHER-011 — Demander un changement de cours

**P1**

## UC-TEACHER-012 — Accepter/refuser une demande de remplacement

**P2**

## UC-TEACHER-013 — Consulter ses heures

**P1**

## UC-TEACHER-014 — Consulter son volume horaire

**P1**

## UC-TEACHER-015 — Consulter ses salles

**P1**

## UC-TEACHER-016 — Ajouter un événement professionnel

**P2**

---

# 9. Étudiants

## UC-STUDENT-001 — Créer un étudiant

**P0**

## UC-STUDENT-002 — Inscrire l'étudiant dans une classe

**P0**

## UC-STUDENT-003 — Inscrire l'étudiant dans un groupe

**P0**

## UC-STUDENT-004 — Changer un étudiant de groupe

**P1**

## UC-STUDENT-005 — Consulter l'EDT du jour

**P0**

## UC-STUDENT-006 — Consulter l'EDT de la semaine

**P0**

## UC-STUDENT-007 — Consulter le calendrier mensuel

**P1**

## UC-STUDENT-008 — Voir le prochain cours

**P0**

## UC-STUDENT-009 — Voir le temps restant avant le prochain cours

**P1**

## UC-STUDENT-010 — Voir les détails d'un cours

**P0**

## UC-STUDENT-011 — Rechercher une salle

**P1**

## UC-STUDENT-012 — Rechercher un enseignant

**P1**

## UC-STUDENT-013 — Recevoir une notification

**P0**

## UC-STUDENT-014 — Signaler une anomalie

**P1**

## UC-STUDENT-015 — Voir l'historique des changements

**P2**

## UC-STUDENT-016 — Ajouter une séance à son calendrier personnel

**P2**

## UC-STUDENT-017 — Exporter son calendrier

**P2**

---

# 10. Parents et tuteurs

## UC-PARENT-001 — Associer un étudiant à un parent

**P3**

## UC-PARENT-002 — Consulter l'EDT de l'enfant

**P3**

## UC-PARENT-003 — Recevoir les changements importants

**P3**

---

# 11. Matières

## UC-SUBJECT-001 — Créer une matière

**P0**

## UC-SUBJECT-002 — Modifier une matière

**P0**

## UC-SUBJECT-003 — Archiver une matière

**P1**

## UC-SUBJECT-004 — Définir une couleur

**P1**

## UC-SUBJECT-005 — Définir le type de cours

**P0**

## UC-SUBJECT-006 — Définir le volume horaire prévu

**P1**

## UC-SUBJECT-007 — Définir les crédits

**P1**

## UC-SUBJECT-008 — Affecter une matière à plusieurs formations

**P1**

---

# 12. Salles et ressources

## UC-ROOM-001 — Créer une salle

**P0**

## UC-ROOM-002 — Modifier une salle

**P0**

## UC-ROOM-003 — Désactiver une salle

**P1**

## UC-ROOM-004 — Définir la capacité

**P0**

## UC-ROOM-005 — Définir le type de salle

**P0**

## UC-ROOM-006 — Définir les équipements

**P1**

## UC-ROOM-007 — Consulter l'occupation

**P0**

## UC-ROOM-008 — Rechercher une salle libre

**P1**

## UC-ROOM-009 — Réserver une salle

**P1**

## UC-ROOM-010 — Bloquer une salle pour maintenance

**P1**

## UC-ROOM-011 — Affecter une salle à un bâtiment

**P1**

## UC-ROOM-012 — Rechercher une salle par capacité/équipement

**P1**

---

# 13. Cours

## UC-COURSE-001 — Créer un cours

**P0**

## UC-COURSE-002 — Affecter un enseignant

**P0**

## UC-COURSE-003 — Affecter un groupe

**P0**

## UC-COURSE-004 — Affecter plusieurs groupes

**P1**

## UC-COURSE-005 — Affecter une salle

**P0**

## UC-COURSE-006 — Définir la durée

**P0**

## UC-COURSE-007 — Définir une récurrence

**P1**

## UC-COURSE-008 — Créer une séance exceptionnelle

**P1**

## UC-COURSE-009 — Annuler une séance

**P0**

## UC-COURSE-010 — Déplacer une séance

**P0**

## UC-COURSE-011 — Changer de salle

**P0**

## UC-COURSE-012 — Changer d'enseignant

**P1**

## UC-COURSE-013 — Ajouter une note

**P1**

## UC-COURSE-014 — Ajouter une pièce jointe

**P2**

## UC-COURSE-015 — Créer un cours à distance

**P2**

## UC-COURSE-016 — Ajouter un lien de visioconférence

**P2**

---

# 14. Emploi du temps

## UC-TT-001 — Voir le jour

**P0**

## UC-TT-002 — Voir la semaine

**P0**

La vue principale reprend le principe de grille horaire du modèle de référence, avec une interface moderne.

## UC-TT-003 — Voir le mois

**P1**

## UC-TT-004 — Voir une liste chronologique

**P1**

## UC-TT-005 — Changer de semaine

**P0**

## UC-TT-006 — Revenir à aujourd'hui

**P0**

## UC-TT-007 — Naviguer entre les semaines

**P0**

## UC-TT-008 — Filtrer par classe

**P0**

## UC-TT-009 — Filtrer par groupe

**P0**

## UC-TT-010 — Filtrer par enseignant

**P0**

## UC-TT-011 — Filtrer par salle

**P0**

## UC-TT-012 — Filtrer par matière

**P1**

## UC-TT-013 — Filtrer par département

**P1**

## UC-TT-014 — Filtrer par formation

**P1**

## UC-TT-015 — Rechercher un cours

**P0**

## UC-TT-016 — Ouvrir le détail d'un événement

**P0**

## UC-TT-017 — Afficher les couleurs de matières

**P1**

## UC-TT-018 — Afficher les annulations

**P0**

## UC-TT-019 — Afficher les changements

**P0**

## UC-TT-020 — Afficher les cours simultanés dans des colonnes distinctes

**P1**

## UC-TT-021 — Ajuster la granularité horaire

**P1**

## UC-TT-022 — Masquer les week-ends

**P1**

## UC-TT-023 — Basculer entre 12h/24h

**P2**

---

# 15. Détection des conflits

## UC-CONFLICT-001 — Conflit enseignant

**P0**

## UC-CONFLICT-002 — Conflit salle

**P0**

## UC-CONFLICT-003 — Conflit groupe

**P0**

## UC-CONFLICT-004 — Capacité de salle insuffisante

**P1**

## UC-CONFLICT-005 — Enseignant indisponible

**P1**

## UC-CONFLICT-006 — Salle indisponible

**P1**

## UC-CONFLICT-007 — Créneau académique invalide

**P1**

## UC-CONFLICT-008 — Jour non ouvré

**P1**

## UC-CONFLICT-009 — Lister les conflits

**P0**

## UC-CONFLICT-010 — Bloquer une publication avec conflit critique

**P0**

## UC-CONFLICT-011 — Autoriser exceptionnellement un conflit avec justification

**P2**

## UC-CONFLICT-012 — Détecter les conflits lors d'un import

**P0**

## UC-CONFLICT-013 — Détecter les conflits après changement en masse

**P1**

---

# 16. Changements et historique

## UC-CHANGE-001 — Modifier une heure

**P0**

## UC-CHANGE-002 — Déplacer un cours

**P0**

## UC-CHANGE-003 — Changer une salle

**P0**

## UC-CHANGE-004 — Changer un enseignant

**P1**

## UC-CHANGE-005 — Annuler un cours

**P0**

## UC-CHANGE-006 — Reporter un cours

**P1**

## UC-CHANGE-007 — Restaurer une ancienne version

**P2**

## UC-CHANGE-008 — Visualiser l'historique

**P1**

## UC-CHANGE-009 — Informer automatiquement les personnes concernées

**P0**

## UC-CHANGE-010 — Comparer avant/après

**P2**

---

# 17. Publication et validation

## UC-PUBLISH-001 — Enregistrer un brouillon

**P0**

## UC-PUBLISH-002 — Soumettre pour validation

**P1**

## UC-PUBLISH-003 — Valider

**P1**

## UC-PUBLISH-004 — Publier

**P0**

## UC-PUBLISH-005 — Dépublier

**P1**

## UC-PUBLISH-006 — Archiver

**P1**

## UC-PUBLISH-007 — Programmer une publication future

**P2**

## UC-PUBLISH-008 — Publier uniquement une classe

**P1**

## UC-PUBLISH-009 — Publier un département

**P1**

## UC-PUBLISH-010 — Publier l'établissement complet

**P1**

---

# 18. Notifications

## UC-NOTIF-001 — Notification push

**P0**

## UC-NOTIF-002 — Notification d'annulation

**P0**

## UC-NOTIF-003 — Notification de changement de salle

**P0**

## UC-NOTIF-004 — Notification de changement d'heure

**P0**

## UC-NOTIF-005 — Notification de changement d'enseignant

**P1**

## UC-NOTIF-006 — Notification de publication

**P0**

## UC-NOTIF-007 — Annonce générale

**P1**

## UC-NOTIF-008 — Préférences de notifications

**P1**

## UC-NOTIF-009 — Notification email

**P1**

## UC-NOTIF-010 — Notification SMS

**P2**

## UC-NOTIF-011 — Notification planifiée

**P2**

## UC-NOTIF-012 — Rappel avant le cours

**P1**

## UC-NOTIF-013 — Notification groupée anti-spam

**P2**

---

# 19. Import Excel / CSV

## UC-IMPORT-001 — Importer un Excel

**P0**

## UC-IMPORT-002 — Importer un CSV

**P1**

## UC-IMPORT-003 — Détecter automatiquement les colonnes

**P1**

## UC-IMPORT-004 — Mapper les colonnes

**P0**

## UC-IMPORT-005 — Prévisualiser avant import

**P0**

## UC-IMPORT-006 — Détecter les lignes invalides

**P0**

## UC-IMPORT-007 — Détecter les doublons

**P0**

## UC-IMPORT-008 — Détecter les conflits

**P0**

## UC-IMPORT-009 — Importer uniquement les lignes valides

**P1**

## UC-IMPORT-010 — Télécharger le rapport d'import

**P1**

## UC-IMPORT-011 — Annuler un import

**P2**

## UC-IMPORT-012 — Historiser les imports

**P1**

## UC-IMPORT-013 — Importer étudiants/enseignants/classes depuis Excel

**P1**

---

# 20. Export et impression

## UC-EXPORT-001 — Export PDF

**P0**

## UC-EXPORT-002 — Export Excel

**P0**

## UC-EXPORT-003 — Export CSV

**P1**

## UC-EXPORT-004 — Impression

**P0**

## UC-EXPORT-005 — Export d'une classe

**P0**

## UC-EXPORT-006 — Export d'un groupe

**P0**

## UC-EXPORT-007 — Export d'un enseignant

**P1**

## UC-EXPORT-008 — Export d'une salle

**P1**

## UC-EXPORT-009 — Export d'un département

**P1**

## UC-EXPORT-010 — Export d'une période

**P1**

---

# 21. QR Codes et partage

## UC-QR-001 — Générer un QR de classe

**P1**

## UC-QR-002 — Générer un QR de groupe

**P1**

## UC-QR-003 — Scanner un QR

**P1**

## UC-QR-004 — Voir un EDT public via QR

**P1**

## UC-QR-005 — Révoquer un QR

**P2**

## UC-QR-006 — Partager un lien d'EDT

**P1**

## UC-QR-007 — Générer une affiche avec QR

**P2**

---

# 22. Calendrier personnel et synchronisation

## UC-CAL-001 — Exporter en ICS

**P2**

## UC-CAL-002 — Ajouter à Google Calendar

**P2**

## UC-CAL-003 — Ajouter à Outlook

**P2**

## UC-CAL-004 — Synchronisation automatique

**P3**

---

# 23. Examens

## UC-EXAM-001 — Créer une session

**P1**

## UC-EXAM-002 — Programmer un examen

**P1**

## UC-EXAM-003 — Affecter une salle

**P1**

## UC-EXAM-004 — Affecter des surveillants

**P1**

## UC-EXAM-005 — Vérifier les conflits

**P1**

## UC-EXAM-006 — Publier le calendrier d'examens

**P1**

## UC-EXAM-007 — Notifier les étudiants

**P1**

## UC-EXAM-008 — Générer le plan de salle

**P2**

## UC-EXAM-009 — Répartir les étudiants dans plusieurs salles

**P2**

---

# 24. Vie scolaire et remplacement

## UC-LIFE-001 — Signaler une absence d'enseignant

**P2**

## UC-LIFE-002 — Créer un remplacement

**P2**

## UC-LIFE-003 — Consulter les cours non couverts

**P2**

## UC-LIFE-004 — Réorganiser une journée

**P2**

## UC-LIFE-005 — Gérer un événement scolaire

**P1**

## UC-LIFE-006 — Gérer une réunion

**P1**

## UC-LIFE-007 — Gérer une conférence

**P1**

---

# 25. Disponibilités et contraintes

## UC-CONSTRAINT-001 — Définir les heures d'ouverture

**P1**

## UC-CONSTRAINT-002 — Définir les créneaux autorisés

**P1**

## UC-CONSTRAINT-003 — Définir les disponibilités d'un enseignant

**P1**

## UC-CONSTRAINT-004 — Définir les disponibilités d'une salle

**P1**

## UC-CONSTRAINT-005 — Bloquer un créneau d'une classe

**P1**

## UC-CONSTRAINT-006 — Créer une contrainte forte

**P2**

## UC-CONSTRAINT-007 — Créer une contrainte souple

**P2**

## UC-CONSTRAINT-008 — Définir les contraintes d'un groupe

**P2**

## UC-CONSTRAINT-009 — Définir les contraintes de matériel

**P2**

---

# 26. Génération automatique et optimisation

## UC-AUTO-001 — Générer un EDT automatiquement

**P2**

## UC-AUTO-002 — Générer pour un département

**P2**

## UC-AUTO-003 — Générer pour tout l'établissement

**P2**

## UC-AUTO-004 — Régénérer un planning

**P2**

## UC-AUTO-005 — Optimiser un planning existant

**P2**

## UC-AUTO-006 — Minimiser les conflits

**P2**

## UC-AUTO-007 — Minimiser les trous étudiants

**P2**

## UC-AUTO-008 — Minimiser les trous enseignants

**P2**

## UC-AUTO-009 — Optimiser les salles

**P2**

## UC-AUTO-010 — Comparer plusieurs solutions

**P3**

## UC-AUTO-011 — Noter la qualité d'un planning

**P3**

Exemple : score global, nombre de conflits, trous, occupation des salles.

---

# 27. Moteur Rust futur

## UC-RUST-001 — Recevoir les contraintes

**P3**

## UC-RUST-002 — Résoudre le problème d'emploi du temps

**P3**

## UC-RUST-003 — Retourner plusieurs solutions

**P3**

## UC-RUST-004 — Calculer un score d'optimisation

**P3**

## UC-RUST-005 — Optimiser sous contraintes fortes/faibles

**P3**

---

# 28. Recherche

## UC-SEARCH-001 — Recherche globale

**P0**

## UC-SEARCH-002 — Rechercher une classe

**P0**

## UC-SEARCH-003 — Rechercher un enseignant

**P0**

## UC-SEARCH-004 — Rechercher une matière

**P0**

## UC-SEARCH-005 — Rechercher une salle

**P0**

## UC-SEARCH-006 — Recherche multicritère

**P1**

## UC-SEARCH-007 — Sauvegarder une recherche

**P2**

## UC-SEARCH-008 — Rechercher les salles libres sur une période

**P1**

---

# 29. Statistiques

## UC-STATS-001 — Nombre de cours

**P0**

## UC-STATS-002 — Nombre de classes

**P0**

## UC-STATS-003 — Nombre d'enseignants

**P0**

## UC-STATS-004 — Nombre de salles

**P0**

## UC-STATS-005 — Nombre de conflits

**P0**

## UC-STATS-006 — Nombre de cours annulés

**P1**

## UC-STATS-007 — Nombre de cours déplacés

**P1**

## UC-STATS-008 — Taux d'occupation des salles

**P1**

## UC-STATS-009 — Volume horaire par enseignant

**P1**

## UC-STATS-010 — Volume horaire par classe

**P1**

## UC-STATS-011 — Analyse des trous

**P2**

## UC-STATS-012 — Analyse des modifications

**P2**

## UC-STATS-013 — Taux de publication

**P1**

## UC-STATS-014 — Analyse des créneaux les plus chargés

**P2**

---

# 30. Audit et traçabilité

## UC-AUDIT-001 — Enregistrer une modification

**P0**

## UC-AUDIT-002 — Consulter l'historique d'un cours

**P1**

## UC-AUDIT-003 — Consulter l'historique d'un utilisateur

**P2**

## UC-AUDIT-004 — Exporter les journaux

**P2**

## UC-AUDIT-005 — Identifier l'auteur d'un changement

**P0**

## UC-AUDIT-006 — Tracer un import

**P1**

## UC-AUDIT-007 — Tracer une publication

**P1**

---

# 31. Gouvernance et workflow d'approbation

## UC-GOV-001 — Soumettre un planning

**P1**

## UC-GOV-002 — Examiner un planning

**P1**

## UC-GOV-003 — Refuser une publication

**P1**

## UC-GOV-004 — Demander une correction

**P1**

## UC-GOV-005 — Approuver

**P1**

## UC-GOV-006 — Autoriser une modification exceptionnelle

**P2**

---

# 32. Gestion des demandes de changement

## UC-REQUEST-001 — Signaler un conflit par un utilisateur

**P1**

## UC-REQUEST-002 — Créer une demande de changement

**P1**

## UC-REQUEST-003 — Affecter une demande à un responsable

**P2**

## UC-REQUEST-004 — Ajouter un commentaire

**P2**

## UC-REQUEST-005 — Accepter une proposition

**P2**

## UC-REQUEST-006 — Refuser une proposition

**P2**

## UC-REQUEST-007 — Fermer une demande

**P2**

---

# 33. Annonces

## UC-ANNOUNCE-001 — Créer une annonce

**P1**

## UC-ANNOUNCE-002 — Cibler une classe

**P1**

## UC-ANNOUNCE-003 — Cibler un département

**P1**

## UC-ANNOUNCE-004 — Cibler tout l'établissement

**P1**

## UC-ANNOUNCE-005 — Programmer une annonce

**P2**

## UC-ANNOUNCE-006 — Retirer une annonce

**P2**

---

# 34. Mobile

## UC-MOBILE-001 — Installer l'application

**P0**

## UC-MOBILE-002 — Se connecter

**P0**

## UC-MOBILE-003 — Rester connecté

**P0**

## UC-MOBILE-004 — Consulter l'EDT hors ligne

**P1**

## UC-MOBILE-005 — Synchroniser l'EDT

**P1**

## UC-MOBILE-006 — Afficher la date de dernière synchronisation

**P1**

## UC-MOBILE-007 — Recevoir une notification push

**P0**

## UC-MOBILE-008 — Ouvrir le cours depuis une notification

**P1**

## UC-MOBILE-009 — Scanner un QR

**P1**

## UC-MOBILE-010 — Changer de compte

**P1**

## UC-MOBILE-011 — Utiliser le mode sombre

**P1**

## UC-MOBILE-012 — Choisir ses préférences d'affichage

**P2**

---

# 35. Connectivité et performance

## UC-NET-001 — Utiliser l'application avec une connexion lente

**P0**

## UC-NET-002 — Mettre en cache l'EDT

**P1**

## UC-NET-003 — Reprendre une synchronisation interrompue

**P2**

## UC-NET-004 — Détecter l'absence de connexion

**P1**

## UC-NET-005 — Afficher les données mises en cache

**P1**

## UC-NET-006 — Rafraîchir uniquement les données modifiées

**P2**

---

# 36. Mode public

## UC-PUBLIC-001 — Consulter un EDT public

**P1**

## UC-PUBLIC-002 — Consulter l'EDT d'une classe sans compte

**P1**

## UC-PUBLIC-003 — Accéder par QR

**P1**

## UC-PUBLIC-004 — Masquer les données privées

**P0**

## UC-PUBLIC-005 — Définir une durée de validité du lien public

**P2**

---

# 37. Tableau d'affichage et écran institutionnel

## UC-DISPLAY-001 — Afficher l'EDT d'une journée

**P2**

## UC-DISPLAY-002 — Afficher les cours en cours

**P2**

## UC-DISPLAY-003 — Afficher les changements

**P2**

## UC-DISPLAY-004 — Défilement automatique

**P2**

## UC-DISPLAY-005 — Mode plein écran

**P2**

## UC-DISPLAY-006 — Configurer un écran par bâtiment

**P3**

---

# 38. Réservation de ressources

## UC-BOOK-001 — Réserver une salle

**P1**

## UC-BOOK-002 — Réserver du matériel

**P2**

## UC-BOOK-003 — Voir les réservations

**P1**

## UC-BOOK-004 — Approuver une réservation

**P2**

## UC-BOOK-005 — Refuser une réservation

**P2**

## UC-BOOK-006 — Annuler une réservation

**P1**

---

# 39. Carte et localisation future

## UC-MAP-001 — Localiser un bâtiment

**P3**

## UC-MAP-002 — Indiquer le chemin vers une salle

**P3**

## UC-MAP-003 — Afficher le plan du campus

**P3**

## UC-MAP-004 — Afficher un QR pour une salle

**P3**

---

# 40. Gestion des cours à distance

## UC-ONLINE-001 — Créer un cours en ligne

**P2**

## UC-ONLINE-002 — Ajouter une plateforme

**P2**

## UC-ONLINE-003 — Ajouter un lien privé

**P2**

## UC-ONLINE-004 — Notifier les participants

**P2**

## UC-ONLINE-005 — Masquer les informations d'accès aux utilisateurs non autorisés

**P2**

---

# 41. Récurrence avancée

## UC-REC-001 — Créer une série récurrente

**P1**

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

## UC-REC-007 — Gérer les jours fériés dans une série

**P2**

## UC-REC-008 — Gérer les interruptions de vacances

**P2**

---

# 42. Versioning des emplois du temps

## UC-VERSION-001 — Créer une version

**P2**

## UC-VERSION-002 — Comparer deux versions

**P2**

## UC-VERSION-003 — Restaurer une version

**P2**

## UC-VERSION-004 — Visualiser les différences

**P2**

---

# 43. Qualité des données

## UC-DATA-001 — Trouver les étudiants sans groupe

**P1**

## UC-DATA-002 — Trouver les enseignants sans affectation

**P1**

## UC-DATA-003 — Trouver les salles sans capacité

**P1**

## UC-DATA-004 — Trouver les classes sans EDT

**P1**

## UC-DATA-005 — Afficher les anomalies de données

**P1**

## UC-DATA-006 — Détecter les doublons d'utilisateurs

**P1**

## UC-DATA-007 — Détecter les références orphelines

**P2**

---

# 44. Direction et pilotage

## UC-DIR-001 — Consulter l'état global

**P1**

## UC-DIR-002 — Voir les conflits critiques

**P1**

## UC-DIR-003 — Voir les cours annulés

**P1**

## UC-DIR-004 — Voir l'utilisation des salles

**P1**

## UC-DIR-005 — Voir les tendances

**P2**

## UC-DIR-006 — Recevoir un rapport hebdomadaire

**P2**

---

# 45. API et intégrations

## UC-API-001 — API publique sécurisée

**P2**

## UC-API-002 — API établissement

**P1**

## UC-API-003 — Générer une clé API

**P2**

## UC-API-004 — Révoquer une clé API

**P2**

## UC-API-005 — Intégrer un ENT

**P3**

## UC-API-006 — Intégrer un LMS

**P3**

## UC-API-007 — Intégrer un système étudiant

**P3**

## UC-API-008 — Intégrer SSO

**P3**

---

# 46. SaaS et commercialisation future

## UC-SAAS-001 — Créer une offre

**P3**

## UC-SAAS-002 — Associer un établissement à une offre

**P3**

## UC-SAAS-003 — Limiter utilisateurs/classes

**P3**

## UC-SAAS-004 — Activer/désactiver des modules

**P3**

## UC-SAAS-005 — Consulter la consommation

**P3**

---

# 47. Support

## UC-SUPPORT-001 — Signaler un problème

**P1**

## UC-SUPPORT-002 — Créer un ticket

**P2**

## UC-SUPPORT-003 — Suivre un ticket

**P2**

## UC-SUPPORT-004 — Répondre à un ticket

**P2**

---

# 48. Sécurité

## UC-SEC-001 — Vérifier une permission

**P0**

## UC-SEC-002 — Empêcher l'accès cross-tenant

**P0**

## UC-SEC-003 — Journaliser une action sensible

**P0**

## UC-SEC-004 — Révoquer une session

**P1**

## UC-SEC-005 — Limiter les requêtes abusives

**P1**

## UC-SEC-006 — Détecter une activité suspecte

**P3**

## UC-SEC-007 — Gérer les secrets

**P0**

## UC-SEC-008 — Masquer les informations sensibles dans les logs

**P0**

---

# 49. Scénarios métiers complets

## SC-001 — Création d'un établissement

```text
Super Admin
   ↓
Créer établissement
   ↓
Créer campus
   ↓
Créer départements
   ↓
Créer formations
   ↓
Créer niveaux
   ↓
Créer classes
   ↓
Créer groupes
   ↓
Créer enseignants
   ↓
Créer salles
   ↓
Créer matières
```

## SC-002 — Création manuelle d'un EDT

```text
Responsable pédagogique
   ↓
Sélection classe
   ↓
Sélection matière
   ↓
Sélection enseignant
   ↓
Sélection salle
   ↓
Date / heure
   ↓
Validation backend
   ↓
ConflictService
   ↓
Enregistrement
   ↓
Publication
```

## SC-003 — Conflit de salle

```text
Admin crée un cours
        ↓
Salle B204
14h00–16h00
        ↓
ConflictService
        ↓
Salle déjà occupée
        ↓
HTTP 409
        ↓
Message explicite
        ↓
Admin choisit une autre salle
```

## SC-004 — Changement de salle

```text
Admin
 ↓
Ouvre cours
 ↓
B204 → C102
 ↓
Vérification conflit
 ↓
Update
 ↓
Audit
 ↓
Notification
 ↓
Étudiants informés
```

## SC-005 — Annulation

```text
Admin
 ↓
Annule cours
 ↓
Motif obligatoire
 ↓
Status = CANCELLED
 ↓
Audit
 ↓
Notification
```

## SC-006 — Import Excel

```text
Admin
 ↓
Upload XLSX
 ↓
Analyse
 ↓
Mapping
 ↓
Prévisualisation
 ↓
Validation
 ↓
Détection conflits
 ↓
Import
 ↓
Rapport
```

## SC-007 — Matin étudiant

```text
Étudiant ouvre l'app
        ↓
Synchronisation
        ↓
Accueil
        ↓
Prochain cours
        ↓
Salle / enseignant
        ↓
Compte à rebours
```

## SC-008 — Cours déplacé

```text
Admin déplace le cours
        ↓
Validation
        ↓
Mise à jour
        ↓
Notification push
        ↓
Étudiant ouvre notification
        ↓
Détail de la nouvelle programmation
```

---

# 50. Cas limites obligatoires

## EDGE-001 — Deux cours exactement à la même heure

Le système détecte le conflit si une ressource incompatible est partagée.

## EDGE-002 — Deux cours partiellement chevauchants

Exemple : 14h00–15h30 et 15h00–16h00.

## EDGE-003 — Deux cours strictement consécutifs

14h00–15h00 et 15h00–16h00 doivent être autorisés.

## EDGE-004 — Pause entre deux cours

Doit être autorisée.

## EDGE-005 — Salle sans capacité

Avertissement ou erreur selon configuration.

## EDGE-006 — Enseignant inactif

Interdire les nouvelles affectations.

## EDGE-007 — Salle inactive

Interdire les nouvelles affectations.

## EDGE-008 — Classe archivée

Interdire les nouveaux cours.

## EDGE-009 — Cours passé

Modification soumise à une permission spéciale selon politique.

## EDGE-010 — Cours publié modifié

Conserver l'historique et déclencher les notifications nécessaires.

## EDGE-011 — Annulation d'un événement récurrent

Permettre occurrence seule, série complète ou à partir d'une date.

## EDGE-012 — Modification massive

Transaction et validation globale nécessaires.

## EDGE-013 — Import de plusieurs milliers de lignes

Traitement asynchrone possible avec suivi de progression.

## EDGE-014 — Double soumission

Empêcher les doublons via idempotence ou contrôle métier.

## EDGE-015 — Deux administrateurs modifient le même événement

Utiliser une stratégie de concurrence optimiste.

## EDGE-016 — Changement de groupe d'un étudiant

Le nouvel EDT doit être reflété au prochain rafraîchissement/sync.

## EDGE-017 — Enseignant sur plusieurs groupes

Autoriser explicitement plusieurs affectations lorsque compatible.

## EDGE-018 — Cours à plusieurs enseignants

Modèle extensible vers plusieurs enseignants.

## EDGE-019 — Cours sans salle

Possible si la politique de l'établissement l'autorise.

## EDGE-020 — Cours à distance

Prévoir un mode `ONLINE`.

## EDGE-021 — Changement de fuseau horaire

Les événements doivent rester cohérents avec le timezone du tenant.

## EDGE-022 — Changement d'heure légal / système

Les calculs doivent utiliser les bibliothèques de date/heure officielles et non du parsing manuel.

## EDGE-023 — Utilisateur supprimé après historique

Les traces historiques doivent rester cohérentes et auditables.

## EDGE-024 — Matière supprimée après publication

Préférer l'archivage/logical delete.

## EDGE-025 — Salle supprimée après planification

Préférer l'archivage et empêcher les nouveaux usages.

---

# 51. Règles fonctionnelles fondamentales

## RF-001

Un utilisateur doit toujours appartenir à un périmètre d'accès déterminé.

## RF-002

Un utilisateur ne doit jamais accéder aux données d'un autre tenant sans permission explicite.

## RF-003

Un enseignant ne peut pas être simultanément affecté à deux cours incompatibles.

## RF-004

Une salle ne peut pas être simultanément affectée à deux événements incompatibles.

## RF-005

Un groupe ne peut pas être simultanément programmé sur deux cours incompatibles.

## RF-006

Une salle doit respecter la capacité minimale requise lorsqu'une capacité est définie.

## RF-007

Une modification d'un événement publié doit être historisée.

## RF-008

Une annulation doit pouvoir comporter un motif.

## RF-009

Les changements significatifs doivent pouvoir déclencher une notification.

## RF-010

Un brouillon ne doit pas être visible par les étudiants.

## RF-011

Le mobile étudiant ne doit accéder qu'aux données autorisées.

## RF-012

Les actions administratives sensibles doivent être auditables.

## RF-013

Les données métier critiques doivent de préférence être archivées plutôt que supprimées physiquement.

## RF-014

Les dates et heures doivent être gérées avec un timezone explicite.

## RF-015

Le backend est l'autorité pour les permissions et règles métier.

## RF-016

Le frontend ne doit jamais être la seule couche à empêcher une opération interdite.

## RF-017

Toute opération de modification importante doit être atomique ou transactionnelle.

## RF-018

Les imports doivent être validés avant persistance.

## RF-019

Les notifications ne doivent pas créer de doublons inutiles.

## RF-020

Le système doit rester compatible avec les structures lycée et université.

---

# 52. Modèle générique lycée / université

Le modèle fonctionnel doit supporter :

```text
Université
    Faculté
       Département
          Formation
             Niveau
                Classe
                   Groupe

Lycée
    Série
       Niveau
          Classe
             Groupe éventuel

Centre de formation
    Formation
       Promotion
          Groupe
```

Ne pas coder les noms de niveaux ou structures comme des constantes rigides.

---

# 53. Cas spécifiques utiles au contexte gabonais

## UC-GA-001 — Consulter l'EDT depuis Android

**P0**

## UC-GA-002 — Recevoir les changements par push

**P0**

## UC-GA-003 — Fonctionner avec une connexion limitée

**P1**

## UC-GA-004 — Partager un EDT par lien

**P1**

## UC-GA-005 — Partager par QR Code

**P1**

## UC-GA-006 — Importer un EDT Excel existant

**P0**

## UC-GA-007 — Imprimer un EDT pour affichage physique

**P0**

## UC-GA-008 — Afficher l'EDT sur un écran institutionnel

**P2**

## UC-GA-009 — Envoyer un SMS pour un changement urgent

**P2**

---

# 54. Cas d'utilisation à fort potentiel produit

## 54.1 Assistant de recherche

Comprendre des demandes telles que :

> Quels sont les cours de L2 Informatique demain matin ?

## 54.2 Recherche de salle libre

Comprendre :

> Trouve une salle libre de 14h à 16h pour 80 étudiants avec vidéoprojecteur.

## 54.3 Assistant administratif

Répondre à :

> Pourquoi la salle B204 n'est-elle pas disponible mardi à 14h ?

## 54.4 Optimisation

Proposer plusieurs EDT et expliquer les compromis.

## 54.5 Analyse prédictive future

Utiliser les historiques pour identifier les périodes de surcharge et anticiper les besoins en salles.

---

# 55. Template détaillé d'un cas d'utilisation pour Antigravity

Toute nouvelle fonctionnalité doit pouvoir être décrite ainsi :

```markdown
## UC-XXX — Nom

### Priorité
P0 / P1 / P2 / P3

### Acteurs
...

### Préconditions
...

### Déclencheur
...

### Données d'entrée
...

### Parcours nominal
1.
2.
3.
4.

### Règles métier
1.
2.
3.

### Cas alternatifs
...

### Cas d'erreur
...

### Cas limites
...

### Effets sur la base
...

### Audit
...

### Notifications
...

### API
...

### Interface Web
...

### Mobile
...

### Tests
...
```

---

# 56. Matrice de couverture fonctionnelle MVP

| Domaine | P0 | P1 | P2 | P3 |
|---|:---:|:---:|:---:|:---:|
| Authentification | ✓ | ✓ | ✓ | ✓ |
| Établissements | ✓ | ✓ | ✓ | |
| Organisation pédagogique | ✓ | ✓ | ✓ | |
| Année académique | ✓ | ✓ | | |
| Utilisateurs | ✓ | ✓ | ✓ | |
| Enseignants | ✓ | ✓ | ✓ | |
| Étudiants | ✓ | ✓ | ✓ | |
| Matières | ✓ | ✓ | ✓ | |
| Salles | ✓ | ✓ | ✓ | |
| Cours | ✓ | ✓ | ✓ | |
| Emploi du temps | ✓ | ✓ | ✓ | |
| Conflits | ✓ | ✓ | ✓ | |
| Publication | ✓ | ✓ | ✓ | |
| Notifications | ✓ | ✓ | ✓ | |
| Import Excel | ✓ | ✓ | ✓ | |
| Export | ✓ | ✓ | | |
| QR | | ✓ | ✓ | |
| Examens | | ✓ | ✓ | |
| Récurrence avancée | | ✓ | ✓ | |
| Optimisation | | | ✓ | ✓ |
| Rust Optimizer | | | | ✓ |
| Parents | | | | ✓ |
| SaaS | | | ✓ | ✓ |
| Intégrations | | | | ✓ |

---

# 57. Ordre recommandé de réalisation avec Antigravity

## Étape 1 — Fondations

- projet backend Java/Spring Boot ;
- base PostgreSQL ;
- migrations ;
- Docker ;
- sécurité ;
- multi-tenant.

## Étape 2 — Référentiels

- établissements ;
- campus ;
- départements ;
- formations ;
- niveaux ;
- classes ;
- groupes ;
- enseignants ;
- étudiants ;
- matières ;
- salles.

## Étape 3 — Planning

- courses ;
- schedule events ;
- calendrier ;
- récurrence ;
- filtres.

## Étape 4 — Conflits

- enseignant ;
- salle ;
- groupe ;
- capacité ;
- disponibilité.

## Étape 5 — Publication

- brouillon ;
- validation ;
- publication ;
- historique ;
- notifications.

## Étape 6 — Import/Export

- Excel ;
- CSV ;
- PDF ;
- impression ;
- QR.

## Étape 7 — Web

- dashboard ;
- CRUD ;
- calendrier ;
- conflits ;
- administration.

## Étape 8 — Mobile

- authentification ;
- accueil ;
- EDT ;
- notifications ;
- cache.

## Étape 9 — Fonctions avancées

- examens ;
- réservations ;
- annonces ;
- statistiques avancées.

## Étape 10 — Intelligence de planification

- contraintes ;
- génération automatique ;
- optimisation ;
- moteur Rust éventuel.

---

# 58. Règle de Vibe Coding

Antigravity doit traiter ce document comme une **source fonctionnelle**, en complément du cahier des charges technique.

Avant toute génération :

1. identifier le cas d'utilisation concerné ;
2. identifier les acteurs ;
3. vérifier les permissions ;
4. vérifier les règles métier ;
5. vérifier l'impact base de données ;
6. définir l'API ;
7. définir le comportement Web ;
8. définir le comportement Mobile ;
9. prévoir les erreurs ;
10. écrire les tests ;
11. vérifier la non-régression ;
12. documenter la décision.

Ne pas développer plusieurs domaines complexes dans une seule génération sans étape de validation.

---

# 59. Principe final

GAB-EDT n'est pas seulement un calendrier.

C'est un **système de planification pédagogique multi-établissements** :

```text
Organisation
     +
Utilisateurs
     +
Cours
     +
Classes / Groupes
     +
Enseignants
     +
Salles
     +
Calendrier académique
     +
Contraintes
     ↓
MOTEUR DE PLANIFICATION
     ↓
EMPLOI DU TEMPS
     ↓
VALIDATION
     ↓
PUBLICATION
     ↓
WEB + MOBILE
     ↓
NOTIFICATIONS
```

Le produit doit donc être pensé autour du **domaine métier de la planification et de la gestion des ressources pédagogiques**, avec le calendrier comme représentation centrale.

La règle directrice est :

> **Toute fonctionnalité doit être utile, sécurisée, traçable, testable et cohérente avec les autres domaines du système.**

