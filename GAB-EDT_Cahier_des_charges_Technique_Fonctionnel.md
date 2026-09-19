# GAB-EDT — Cahier des charges technique et fonctionnel

## 1. Présentation du projet

**GAB-EDT** est une plateforme web et mobile de gestion, publication et consultation des emplois du temps destinée principalement aux établissements scolaires et universitaires du Gabon.

Le projet s'inspire des outils classiques d'emploi du temps sur grille hebdomadaire, tout en modernisant fortement l'expérience utilisateur et l'architecture technique.

La plateforme doit permettre à un établissement de :

- créer et administrer sa structure pédagogique ;
- gérer ses enseignants, étudiants, classes, groupes, matières et salles ;
- construire les emplois du temps ;
- détecter automatiquement les conflits ;
- publier les emplois du temps ;
- informer les utilisateurs des changements ;
- permettre aux étudiants de consulter leur emploi du temps depuis une application mobile ;
- importer des emplois du temps existants depuis Excel ;
- exporter et imprimer les emplois du temps ;
- analyser l'utilisation des salles et des ressources ;
- évoluer ensuite vers une génération automatique optimisée des emplois du temps.

Le produit doit être conçu dès le départ comme une **plateforme multi-établissements (multi-tenant)**.

---

# 2. Vision produit

## 2.1 Problème

Dans de nombreux établissements, les emplois du temps sont encore gérés avec :

- Excel ;
- Word ;
- PDF ;
- tableaux imprimés ;
- fichiers envoyés sur WhatsApp ;
- groupes de discussion ;
- documents dispersés.

Cela entraîne :

- des erreurs ;
- des conflits de salles ;
- des conflits d'enseignants ;
- des versions différentes d'un même emploi du temps ;
- une mauvaise visibilité des changements ;
- une absence de synchronisation en temps réel ;
- une perte de temps pour l'administration.

## 2.2 Solution

GAB-EDT fournit une source unique et centralisée de vérité.

Le principe est :

```text
Administration
      ↓
Modification de l'emploi du temps
      ↓
Validation
      ↓
Publication
      ↓
API centrale
      ↓
┌───────────────┬────────────────┐
│ Application   │ Interface Web  │
│ mobile        │ enseignants    │
│ étudiants     │ administration │
└───────────────┴────────────────┘
```

Lorsqu'un cours est déplacé, les utilisateurs consultent automatiquement la nouvelle version et peuvent recevoir une notification.

---

# 3. Objectifs

## 3.1 Objectifs fonctionnels

1. Centraliser les emplois du temps.
2. Réduire les conflits de programmation.
3. Simplifier le travail administratif.
4. Améliorer l'accès des étudiants à leur emploi du temps.
5. Permettre une mise à jour en temps réel ou quasi temps réel.
6. Fournir des outils de recherche et de filtrage.
7. Permettre l'import initial depuis Excel.
8. Fournir des exports PDF/Excel/impression.
9. Préparer la génération automatique des emplois du temps.
10. Permettre la gestion de plusieurs établissements dans une même plateforme.

## 3.2 Objectifs non fonctionnels

L'application doit être :

- sécurisée ;
- performante ;
- responsive ;
- maintenable ;
- testable ;
- documentée ;
- observable ;
- évolutive ;
- adaptée au mobile ;
- compatible avec une architecture cloud ;
- utilisable avec des connexions Internet de qualité variable.

---

# 4. Utilisateurs et rôles

## 4.1 Rôles principaux

### SUPER_ADMIN

Administrateur global de la plateforme.

Droits :

- gérer les établissements ;
- gérer les administrateurs ;
- consulter les statistiques globales ;
- suspendre un établissement ;
- gérer les paramètres globaux ;
- consulter les journaux d'audit.

### SCHOOL_ADMIN

Administrateur d'un établissement.

Droits :

- gérer l'établissement ;
- gérer les campus ;
- gérer départements/facultés ;
- gérer formations ;
- gérer niveaux/classes/groupes ;
- gérer enseignants ;
- gérer étudiants ;
- gérer matières ;
- gérer salles ;
- créer/importer/modifier les emplois du temps ;
- publier les emplois du temps ;
- gérer les notifications.

### PEDAGOGICAL_MANAGER

Responsable pédagogique.

Droits limités à son périmètre pédagogique :

- consulter les cours ;
- créer/modifier les cours ;
- gérer certains groupes/classes ;
- consulter les conflits ;
- proposer des modifications ;
- publier selon autorisation.

### TEACHER

Enseignant.

Droits :

- consulter son emploi du temps ;
- consulter ses groupes ;
- consulter les salles ;
- recevoir les changements ;
- signaler une anomalie ;
- éventuellement proposer une indisponibilité.

### STUDENT

Étudiant.

Droits :

- consulter son emploi du temps ;
- consulter les détails des cours ;
- recevoir les notifications ;
- consulter les changements ;
- gérer ses préférences.

### STUDENT_REPRESENTATIVE (option future)

Représentant de classe.

Droits supplémentaires possibles :

- consulter les informations de sa classe ;
- signaler une anomalie ;
- consulter les changements collectifs.

---

# 5. Architecture générale

## 5.1 Architecture recommandée pour le MVP

Le projet doit commencer par un **monolithe modulaire**.

Ne pas commencer par une architecture microservices.

```text
                         ┌──────────────────────┐
                         │      WEB APP         │
                         │ Next.js + React      │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │     API BACKEND      │
                         │ Java + Spring Boot   │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼─────────────────┐
                 │                  │                 │
                 ▼                  ▼                 ▼
           PostgreSQL            Redis          Firebase FCM
                 │                                    │
                 │                                    ▼
                 │                             Push notifications
                 │
                 ▼
          Storage fichiers
```

L'application mobile communique avec le même backend :

```text
Flutter Mobile
      │
      │ HTTPS / REST
      ▼
Spring Boot API
      │
      ▼
PostgreSQL
```

---

# 6. Choix technologiques

## 6.1 Backend

### Langage

**Java**

Version cible : **Java 21 LTS**.

### Framework

**Spring Boot**

Composants recommandés :

- Spring Web ;
- Spring Security ;
- Spring Data JPA ;
- Bean Validation ;
- Actuator ;
- Spring Cache ;
- Springdoc OpenAPI.

### Pourquoi Java ?

Java est privilégié pour :

- sa maturité ;
- la richesse de l'écosystème ;
- la facilité de production d'API REST ;
- la gestion de règles métier complexes ;
- la sécurité ;
- PostgreSQL/JPA ;
- le test ;
- la maintenabilité ;
- la facilité de génération et de correction par Vibe Coding.

---

# 7. Utilisation éventuelle de Rust

Rust n'est pas le langage principal du MVP.

Il pourra être introduit plus tard pour des composants spécialisés, notamment :

- moteur d'optimisation des emplois du temps ;
- calcul complexe ;
- solveur de contraintes ;
- traitement haute performance ;
- génération automatique des calendriers.

Architecture future :

```text
Spring Boot
     │
     ├── API
     ├── Auth
     ├── Gestion métier
     └── Timetable Service
               │
               ▼
        Rust Optimizer
               │
               ▼
        Planning optimisé
```

Ne pas introduire Rust dans la première version sans besoin réel.

---

# 8. Frontend Web

## Technologies

- Next.js ;
- React ;
- TypeScript ;
- Tailwind CSS ;
- éventuellement shadcn/ui ;
- TanStack Query ;
- React Hook Form ;
- Zod ;
- FullCalendar ou composant calendrier custom si nécessaire.

## Objectifs

Le frontend web est principalement destiné :

- aux administrateurs ;
- aux responsables pédagogiques ;
- aux enseignants.

Il doit être responsive mais peut être optimisé pour desktop/tablette.

---

# 9. Application mobile

## Technologie

**Flutter + Dart**

Pourquoi :

- une base de code pour Android et iOS ;
- excellente capacité pour les interfaces de calendrier ;
- bonne intégration API ;
- notifications push ;
- développement rapide avec Vibe Coding.

## Cible initiale

1. Android en priorité.
2. iOS ensuite.

Le produit doit cependant être conçu pour ne pas bloquer une future version iOS.

---

# 10. Base de données

## SGBD

**PostgreSQL**

## Principes

- PostgreSQL comme source principale de vérité ;
- clés UUID ;
- contraintes d'intégrité ;
- index adaptés ;
- migrations versionnées avec Flyway ;
- timestamps UTC en base ;
- audit des modifications sensibles.

---

# 11. Modèle de données

## 11.1 Entités principales

```text
Tenant
School
Campus
Department
Program
AcademicYear
Semester
Level
ClassGroup
StudentGroup
User
Student
Teacher
Subject
Room
Course
ScheduleEvent
Notification
Announcement
AuditLog
ImportJob
```

---

# 12. Hiérarchie pédagogique

## Université

```text
School
 └── Campus
      └── Faculty / Department
           └── Program
                └── Level
                     └── Class
                          └── Group
```

Exemple :

```text
Université X
 └── Campus Libreville
      └── Département Informatique
           └── Licence Informatique
                └── L2
                     ├── Groupe 1
                     └── Groupe 2
```

## Lycée

```text
School
 └── Campus
      └── Level
           └── Class
```

Exemple :

```text
Lycée X
 └── Terminale
      ├── Tle A
      ├── Tle C
      └── Tle D
```

---

# 13. Schéma simplifié de la base

## users

```sql
users (
    id UUID PK,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    phone VARCHAR,
    role VARCHAR NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## schools

```sql
schools (
    id UUID PK,
    name VARCHAR NOT NULL,
    code VARCHAR UNIQUE NOT NULL,
    type VARCHAR NOT NULL,
    logo_url VARCHAR,
    timezone VARCHAR NOT NULL,
    country_code VARCHAR NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## campuses

```sql
campuses (
    id UUID PK,
    school_id UUID FK NOT NULL,
    name VARCHAR NOT NULL,
    address VARCHAR,
    city VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## departments

```sql
departments (
    id UUID PK,
    school_id UUID FK NOT NULL,
    campus_id UUID FK,
    name VARCHAR NOT NULL,
    code VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## programs

```sql
programs (
    id UUID PK,
    department_id UUID FK,
    name VARCHAR NOT NULL,
    code VARCHAR,
    type VARCHAR NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## levels

```sql
levels (
    id UUID PK,
    program_id UUID FK,
    name VARCHAR NOT NULL,
    order_index INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## classes

```sql
classes (
    id UUID PK,
    level_id UUID FK,
    name VARCHAR NOT NULL,
    code VARCHAR,
    capacity INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## groups

```sql
groups (
    id UUID PK,
    class_id UUID FK,
    name VARCHAR NOT NULL,
    code VARCHAR,
    capacity INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## teachers

```sql
teachers (
    id UUID PK,
    user_id UUID FK,
    school_id UUID FK,
    employee_number VARCHAR,
    department_id UUID FK,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## students

```sql
students (
    id UUID PK,
    user_id UUID FK,
    school_id UUID FK,
    student_number VARCHAR,
    group_id UUID FK,
    enrollment_year INT,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## subjects

```sql
subjects (
    id UUID PK,
    school_id UUID FK,
    name VARCHAR NOT NULL,
    code VARCHAR,
    description TEXT,
    credits NUMERIC,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## rooms

```sql
rooms (
    id UUID PK,
    school_id UUID FK,
    campus_id UUID FK,
    name VARCHAR NOT NULL,
    building VARCHAR,
    floor VARCHAR,
    capacity INT,
    room_type VARCHAR,
    equipment JSONB,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

---

# 14. Différence entre Course et ScheduleEvent

Cette séparation est obligatoire.

## Course

Décrit l'objet pédagogique :

```text
Programmation
L2 Informatique
Enseignant X
Groupe 1
```

## ScheduleEvent

Décrit une occurrence dans le temps :

```text
15/09/2026
14:00 → 16:00
Salle B204
```

Un même course peut donc posséder plusieurs événements.

```text
Course
 ├── Event 1
 ├── Event 2
 ├── Event 3
 └── Event 4
```

---

# 15. schedule_events

Structure recommandée :

```sql
schedule_events (
    id UUID PK,
    tenant_id UUID FK NOT NULL,
    course_id UUID FK NOT NULL,
    teacher_id UUID FK NOT NULL,
    room_id UUID FK,
    group_id UUID FK NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    status VARCHAR NOT NULL,
    publication_status VARCHAR NOT NULL,
    recurrence_rule VARCHAR,
    notes TEXT,
    created_by UUID FK NOT NULL,
    updated_by UUID FK,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

Statuts possibles :

```text
SCHEDULED
CANCELLED
POSTPONED
MOVED
COMPLETED
```

Publication :

```text
DRAFT
PENDING_APPROVAL
PUBLISHED
ARCHIVED
```

---

# 16. Multi-tenant

Le système doit être conçu pour plusieurs établissements.

Chaque donnée métier importante doit être rattachable au tenant/établissement.

Principe :

```text
Tenant
  ├── Users
  ├── Schools
  ├── Courses
  ├── Rooms
  ├── Classes
  └── ScheduleEvents
```

L'accès aux données doit toujours être filtré par le tenant.

Un utilisateur d'un établissement ne doit jamais pouvoir consulter ou modifier les données d'un autre établissement.

---

# 17. API REST

La version doit être incluse dans l'URL.

Format :

```text
/api/v1/...
```

## Auth

```http
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/forgot-password
```

## Users

```http
GET    /api/v1/users
GET    /api/v1/users/{id}
POST   /api/v1/users
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
```

## Schools

```http
GET    /api/v1/schools
GET    /api/v1/schools/{id}
POST   /api/v1/schools
PUT    /api/v1/schools/{id}
```

## Teachers

```http
GET    /api/v1/teachers
GET    /api/v1/teachers/{id}
POST   /api/v1/teachers
PUT    /api/v1/teachers/{id}
```

## Students

```http
GET    /api/v1/students
GET    /api/v1/students/{id}
POST   /api/v1/students
PUT    /api/v1/students/{id}
```

## Subjects

```http
GET    /api/v1/subjects
POST   /api/v1/subjects
PUT    /api/v1/subjects/{id}
DELETE /api/v1/subjects/{id}
```

## Rooms

```http
GET    /api/v1/rooms
POST   /api/v1/rooms
PUT    /api/v1/rooms/{id}
DELETE /api/v1/rooms/{id}
```

## Schedule events

```http
GET    /api/v1/schedule-events
GET    /api/v1/schedule-events/{id}
POST   /api/v1/schedule-events
PUT    /api/v1/schedule-events/{id}
DELETE /api/v1/schedule-events/{id}
POST   /api/v1/schedule-events/{id}/publish
POST   /api/v1/schedule-events/{id}/cancel
POST   /api/v1/schedule-events/{id}/move
```

---

# 18. API de recherche d'emploi du temps

Exemple :

```http
GET /api/v1/schedule-events?groupId=UUID&startDate=2026-09-14&endDate=2026-09-20
```

Filtres possibles :

- schoolId ;
- campusId ;
- departmentId ;
- programId ;
- levelId ;
- classId ;
- groupId ;
- teacherId ;
- roomId ;
- startDate ;
- endDate ;
- status.

---

# 19. Format JSON d'un cours planifié

```json
{
  "id": "uuid",
  "subject": {
    "id": "uuid",
    "name": "Programmation",
    "code": "INFO204"
  },
  "teacher": {
    "id": "uuid",
    "firstName": "Jean",
    "lastName": "MBO"
  },
  "group": {
    "id": "uuid",
    "name": "L2 INFO - Groupe 1"
  },
  "room": {
    "id": "uuid",
    "name": "B204"
  },
  "startAt": "2026-09-15T14:00:00+01:00",
  "endAt": "2026-09-15T16:00:00+01:00",
  "status": "SCHEDULED",
  "publicationStatus": "PUBLISHED"
}
```

---

# 20. Gestion des conflits

La détection des conflits doit être effectuée dans le backend.

## 20.1 Conflit enseignant

Un enseignant ne peut pas avoir deux cours qui se chevauchent.

Condition :

```text
newStart < existingEnd
AND
newEnd > existingStart
```

## 20.2 Conflit salle

Même règle pour une salle.

## 20.3 Conflit groupe

Un groupe ne peut pas être planifié sur deux cours simultanément.

## 20.4 Capacité salle

La capacité de la salle doit être comparée à la taille du groupe.

## 20.5 Disponibilité enseignant

Une fonctionnalité future peut permettre d'enregistrer :

- disponibilité ;
- indisponibilité ;
- jours ;
- plages horaires.

---

# 21. Service de conflit

Créer un module dédié :

```text
conflict/
├── ConflictController.java
├── ConflictService.java
├── ConflictType.java
├── ConflictDto.java
└── ConflictException.java
```

Exemple :

```java
public interface ConflictService {
    List<ConflictDto> detectConflicts(ScheduleEvent event);
    void validateNoBlockingConflict(ScheduleEvent event);
}
```

Le service doit être utilisé :

- à la création ;
- à la modification ;
- au déplacement ;
- à l'import Excel ;
- à la génération automatique.

---

# 22. Interface Web — Dashboard

Le dashboard doit présenter :

- nombre de classes ;
- nombre d'enseignants ;
- nombre de salles ;
- nombre de cours ;
- cours publiés ;
- cours en brouillon ;
- conflits ;
- changements récents ;
- taux d'occupation des salles ;
- calendrier de la semaine.

Exemple de structure :

```text
Sidebar
 ├── Dashboard
 ├── Emploi du temps
 ├── Cours
 ├── Classes
 ├── Groupes
 ├── Enseignants
 ├── Étudiants
 ├── Matières
 ├── Salles
 ├── Import
 ├── Conflits
 ├── Notifications
 ├── Statistiques
 └── Paramètres
```

---

# 23. Calendrier Web

Le calendrier est la fonctionnalité centrale.

Modes :

- jour ;
- semaine ;
- mois ;
- liste.

Filtres :

```text
Établissement
Campus
Département
Formation
Niveau
Classe
Groupe
Enseignant
Salle
```

Les couleurs peuvent différencier les matières ou catégories de cours.

Cliquer sur un événement ouvre un panneau :

```text
Matière
Enseignant
Groupe
Salle
Date
Heure
Statut
Notes
Historique
```

---

# 24. Création d'un événement

Formulaire :

```text
Matière *
Enseignant *
Classe/Groupe *
Salle
Date *
Heure début *
Heure fin *
Type de cours
Statut
Description
```

Avant validation :

```text
Vérification des conflits...
```

Puis :

```text
✓ Aucun conflit
```

ou :

```text
⚠ Conflit détecté
```

---

# 25. Import Excel

L'import Excel est une fonctionnalité stratégique.

L'administrateur charge :

```text
emploi_du_temps.xlsx
```

Le système :

1. analyse le fichier ;
2. reconnaît les colonnes ;
3. propose un mapping ;
4. vérifie les données ;
5. détecte les doublons ;
6. détecte les conflits ;
7. affiche un aperçu ;
8. permet la validation ;
9. importe les données.

Exemple :

```text
Colonne Excel          Champ GAB-EDT
-------------------------------------
Date                   startAt
Heure début            startAt
Heure fin              endAt
Matière                subject
Enseignant             teacher
Salle                  room
Classe                 class/group
```

Ne jamais importer directement sans validation.

---

# 26. Export

Le système doit permettre :

- export PDF ;
- export Excel ;
- impression navigateur ;
- export par classe ;
- export par enseignant ;
- export par salle ;
- export par semaine ;
- export par mois.

---

# 27. QR Codes

Chaque classe/groupe peut posséder un QR Code.

Exemple :

```text
https://app.gab-edt.ga/public/timetable/{publicToken}
```

Le QR code ne doit pas exposer d'identifiant sensible.

Prévoir un token public aléatoire et révocable.

---

# 28. Application mobile étudiant

## Navigation

```text
Accueil
Emploi du temps
Notifications
Profil
```

## Accueil

Afficher :

- prochain cours ;
- cours du jour ;
- heure ;
- salle ;
- enseignant ;
- statut ;
- compte à rebours avant le prochain cours.

## Emploi du temps

Modes :

- aujourd'hui ;
- semaine ;
- mois.

## Détails cours

```text
Programmation
INFO204

14h00 – 16h00
Salle B204

Dr. X
L2 Informatique
Groupe 1
```

---

# 29. Notifications

Utiliser Firebase Cloud Messaging.

Types :

```text
COURSE_MOVED
COURSE_CANCELLED
ROOM_CHANGED
TEACHER_CHANGED
SCHEDULE_PUBLISHED
GENERAL_ANNOUNCEMENT
```

Exemple :

```text
🔔 Cours déplacé

Le cours de Programmation prévu
à 14h00 en salle B204 se déroulera
désormais en salle C102.
```

Les préférences utilisateur doivent être configurables.

---

# 30. Temps réel

Le MVP peut fonctionner avec :

- API REST ;
- rafraîchissement ciblé ;
- cache ;
- notifications push.

Une évolution peut utiliser :

- WebSocket ;
- Server-Sent Events.

Ne pas ajouter WebSocket tant qu'il n'est pas nécessaire.

---

# 31. Sécurité

## Authentification

Utiliser :

- Spring Security ;
- JWT access token ;
- refresh token ;
- hash de mot de passe avec Argon2 ou BCrypt.

## Autorisation

RBAC :

```text
SUPER_ADMIN
SCHOOL_ADMIN
PEDAGOGICAL_MANAGER
TEACHER
STUDENT
```

Toutes les routes protégées doivent vérifier :

1. authentification ;
2. rôle ;
3. tenant ;
4. périmètre de données.

---

# 32. Principes de sécurité

Ne jamais :

- stocker un mot de passe en clair ;
- exposer les secrets dans Git ;
- exposer la base PostgreSQL publiquement ;
- faire confiance à l'ID fourni par le frontend ;
- valider les permissions uniquement dans le frontend.

Toujours :

- valider les entrées ;
- limiter les tailles de fichiers ;
- journaliser les actions sensibles ;
- protéger les endpoints ;
- utiliser HTTPS ;
- utiliser des variables d'environnement/secrets ;
- mettre à jour les dépendances.

---

# 33. Audit Log

Les actions importantes doivent être journalisées.

Table :

```sql
audit_logs (
    id UUID PK,
    tenant_id UUID,
    user_id UUID,
    action VARCHAR NOT NULL,
    entity_type VARCHAR NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR,
    created_at TIMESTAMP NOT NULL
)
```

Exemple :

```text
Utilisateur : admin@universite.ga
Action : UPDATE
Entité : ScheduleEvent
Date : 15/09/2026
Ancienne salle : B204
Nouvelle salle : C102
```

---

# 34. Structure du backend

Arborescence recommandée :

```text
gab-edt-backend/
├── pom.xml
├── README.md
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── ga/
│   │   │       └── gabedt/
│   │   │           │
│   │   │           ├── GabEdtApplication.java
│   │   │           │
│   │   │           ├── auth/
│   │   │           ├── user/
│   │   │           ├── tenant/
│   │   │           ├── school/
│   │   │           ├── campus/
│   │   │           ├── department/
│   │   │           ├── program/
│   │   │           ├── academic/
│   │   │           ├── level/
│   │   │           ├── classgroup/
│   │   │           ├── student/
│   │   │           ├── teacher/
│   │   │           ├── subject/
│   │   │           ├── room/
│   │   │           ├── course/
│   │   │           ├── timetable/
│   │   │           ├── schedule/
│   │   │           ├── conflict/
│   │   │           ├── notification/
│   │   │           ├── importexcel/
│   │   │           ├── export/
│   │   │           ├── audit/
│   │   │           │
│   │   │           ├── common/
│   │   │           │   ├── exception/
│   │   │           │   ├── pagination/
│   │   │           │   ├── security/
│   │   │           │   └── response/
│   │   │           │
│   │   │           └── config/
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-test.yml
│   │       └── db/
│   │           └── migration/
│   │
│   └── test/
│       └── java/
│
└── docs/
```

---

# 35. Structure d'un module

Chaque module métier doit suivre autant que possible :

```text
module/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── mapper/
├── exception/
└── specification/
```

Exemple :

```text
schedule/
├── controller/
│   └── ScheduleEventController.java
├── service/
│   ├── ScheduleEventService.java
│   └── ScheduleEventServiceImpl.java
├── repository/
│   └── ScheduleEventRepository.java
├── entity/
│   └── ScheduleEvent.java
├── dto/
│   ├── CreateScheduleEventRequest.java
│   └── ScheduleEventResponse.java
├── mapper/
└── exception/
```

---

# 36. Architecture frontend

```text
gab-edt-web/
├── package.json
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── timetable/
│   │   ├── teachers/
│   │   ├── students/
│   │   ├── classes/
│   │   ├── rooms/
│   │   ├── subjects/
│   │   ├── conflicts/
│   │   └── notifications/
│   ├── lib/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── styles/
└── public/
```

---

# 37. Architecture Flutter

```text
gab-edt-mobile/
├── pubspec.yaml
├── lib/
│   ├── main.dart
│   ├── app/
│   ├── core/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── theme/
│   │   ├── routing/
│   │   └── storage/
│   ├── features/
│   │   ├── authentication/
│   │   ├── home/
│   │   ├── timetable/
│   │   ├── notifications/
│   │   └── profile/
│   ├── models/
│   ├── repositories/
│   └── widgets/
└── test/
```

---

# 38. Design System

L'interface doit être moderne, claire et adaptée à un usage institutionnel.

## Principes

- beaucoup d'espace blanc ;
- cartes lisibles ;
- navigation simple ;
- grille horaire claire ;
- responsive ;
- couleurs cohérentes ;
- contraste accessible.

## Calendrier

Chaque événement peut utiliser une couleur associée à sa matière ou type.

Mais la couleur ne doit jamais être la seule information permettant de distinguer deux cours.

---

# 39. Responsive design

La version web doit fonctionner sur :

- ordinateur ;
- tablette ;
- mobile.

Les écrans administratifs doivent être optimisés pour desktop.

L'application étudiant doit être prioritairement mobile.

---

# 40. Gestion du calendrier

Le calendrier doit utiliser un fuseau horaire configuré au niveau de l'établissement.

Le Gabon utilise :

```text
Africa/Libreville
UTC+01:00
```

La base doit stocker les timestamps de manière cohérente et le frontend doit convertir selon le timezone du tenant.

---

# 41. Année académique

Modèle :

```text
2026-2027
```

Elle possède :

- date de début ;
- date de fin ;
- semestre 1 ;
- semestre 2 ;
- éventuellement trimestres pour les lycées.

Structure :

```text
AcademicYear
 ├── Semester
 ├── Semester
 └── ...
```

---

# 42. Gestion des périodes

Prévoir dès le départ :

```text
SEMESTER
TRIMESTER
TERM
```

Le système doit pouvoir supporter les différences entre universités et lycées.

---

# 43. Types de cours

Enumération possible :

```text
LECTURE
TUTORIAL
PRACTICAL
LAB
EXAM
MEETING
OTHER
```

Pour le français UI :

```text
Cours magistral
Travaux dirigés
Travaux pratiques
Laboratoire
Examen
Réunion
Autre
```

---

# 44. Publication

Un emploi du temps peut être :

```text
DRAFT
PENDING_APPROVAL
PUBLISHED
ARCHIVED
```

Un brouillon n'est pas visible par les étudiants.

Lors de la publication :

```text
Admin
 ↓
Validation
 ↓
Publication
 ↓
Notifications
 ↓
Étudiants
```

---

# 45. Annulation et modification

Une modification doit conserver un historique.

Exemple :

```text
Cours
Avant :
14h00 - 16h00
Salle B204

Après :
15h00 - 17h00
Salle C102
```

L'application doit afficher clairement :

```text
⚠ MODIFIÉ

Horaire : 15h00 - 17h00
Salle : C102
```

---

# 46. Dashboard étudiant

Le mobile doit privilégier l'information utile immédiatement.

```text
Bonjour 👋

MARDI 15 SEPTEMBRE

Prochain cours
-------------------------
Programmation
14h00 - 16h00
Salle B204
Dr. X

Aujourd'hui
-------------------------
09h00 Mathématiques
14h00 Programmation
16h00 Anglais
```

---

# 47. Recherche

Recherche globale possible sur :

- cours ;
- enseignant ;
- classe ;
- étudiant ;
- salle ;
- matière.

Exemple :

```text
Rechercher "B204"
```

Retour :

```text
Salle B204
 ├── L2 Informatique — 09h
 ├── L3 Informatique — 11h
 └── L2 Gestion — 14h
```

---

# 48. Statistiques

## Dashboard établissement

Indicateurs :

- nombre de cours ;
- nombre de classes ;
- nombre d'enseignants ;
- nombre de salles ;
- taux d'occupation ;
- conflits ;
- cours annulés ;
- cours modifiés.

Évolutions futures :

- taux d'assiduité ;
- statistiques d'utilisation des salles ;
- analyse des horaires ;
- taux de remplissage ;
- heures par enseignant.

---

# 49. Génération automatique future

Fonctionnalité premium potentielle :

```text
Générer l'emploi du temps
```

Entrées :

```text
Classes
Cours
Enseignants
Salles
Disponibilités
Contraintes
Volumes horaires
```

Contraintes :

- aucun conflit ;
- capacité de salle ;
- disponibilité enseignant ;
- disponibilité salle ;
- disponibilité groupe ;
- volumes horaires ;
- contraintes spécifiques ;
- limitation des trous ;
- optimisation des salles.

Sortie :

```text
Planning proposé
```

L'administrateur doit pouvoir :

- prévisualiser ;
- accepter ;
- modifier ;
- régénérer ;
- publier.

---

# 50. Approche algorithmique future

Le moteur d'optimisation pourra utiliser une approche de programmation par contraintes.

Exemple :

```text
Variables :
course -> timeslot
course -> room

Contraintes fortes :
teacher conflict = false
room conflict = false
group conflict = false

Contraintes faibles :
minimize empty slots
minimize room changes
maximize room utilization
```

Une implémentation Rust pourra être envisagée plus tard.

---

# 51. Docker

Le développement doit être reproductible.

Services locaux :

```yaml
services:
  postgres:
    image: postgres

  redis:
    image: redis

  backend:
    build: ./backend

  web:
    build: ./web
```

Le mobile communique avec le backend exposé localement selon l'environnement.

---

# 52. Environnements

Prévoir :

```text
development
test
staging
production
```

Fichiers :

```text
application-dev.yml
application-test.yml
application-prod.yml
```

Les secrets ne doivent jamais être commités.

---

# 53. Variables d'environnement

Exemple :

```text
DB_URL=
DB_USERNAME=
DB_PASSWORD=

JWT_SECRET=
JWT_ACCESS_TOKEN_EXPIRATION=
JWT_REFRESH_TOKEN_EXPIRATION=

REDIS_URL=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
```

Créer un fichier :

```text
.env.example
```

sans secrets réels.

---

# 54. Tests

## Backend

Utiliser :

- JUnit ;
- Mockito ;
- Spring Boot Test ;
- Testcontainers.

Tester obligatoirement :

- authentification ;
- autorisations ;
- création de cours ;
- modification ;
- conflits ;
- import Excel ;
- publication ;
- notifications ;
- isolation tenant.

## Frontend

Tester :

- composants critiques ;
- formulaires ;
- calendrier ;
- permissions d'affichage.

## Mobile

Tester :

- authentification ;
- affichage EDT ;
- notifications ;
- navigation ;
- gestion hors ligne légère.

---

# 55. Validation et qualité

Chaque endpoint doit avoir :

- validation DTO ;
- gestion d'erreurs ;
- code HTTP cohérent ;
- réponse JSON normalisée.

Format d'erreur recommandé :

```json
{
  "timestamp": "2026-09-15T10:30:00Z",
  "status": 409,
  "code": "SCHEDULE_CONFLICT",
  "message": "La salle est déjà occupée sur cette période.",
  "details": []
}
```

---

# 56. Documentation API

Utiliser OpenAPI/Swagger.

Endpoint :

```text
/swagger-ui
```

La documentation doit permettre à l'équipe frontend de comprendre :

- endpoints ;
- paramètres ;
- schémas JSON ;
- erreurs ;
- permissions ;
- exemples.

---

# 57. Pagination

Les listes volumineuses doivent être paginées.

Exemple :

```http
GET /api/v1/students?page=0&size=25&sort=lastName,asc
```

Ne jamais retourner des milliers d'enregistrements sans pagination.

---

# 58. Recherche et filtrage backend

Utiliser des spécifications/requêtes filtrables plutôt que de charger toutes les données en mémoire.

Prévoir des index PostgreSQL sur les colonnes fréquemment filtrées :

- tenant_id ;
- school_id ;
- group_id ;
- teacher_id ;
- room_id ;
- start_at ;
- end_at ;
- status.

---

# 59. Cache

Redis pourra être utilisé pour :

- données publiques fréquemment consultées ;
- paramètres ;
- sessions si nécessaire ;
- statistiques ;
- cache de calendrier.

Le cache ne doit jamais être considéré comme la source de vérité.

PostgreSQL reste la source principale.

---

# 60. Disponibilité de la plateforme

Le système doit être capable de fonctionner même lors de périodes de forte charge, notamment :

- rentrée scolaire ;
- début de semestre ;
- publication d'un nouvel emploi du temps ;
- examens.

Prévoir :

- pagination ;
- cache ;
- index ;
- requêtes efficaces ;
- limitation des API ;
- monitoring.

---

# 61. Rate limiting

Les endpoints sensibles doivent être protégés contre les abus.

Particulièrement :

```text
/login
/forgot-password
/public timetable
```

---

# 62. Journalisation

Utiliser des logs structurés.

Ne jamais journaliser :

- mots de passe ;
- tokens ;
- secrets ;
- données sensibles inutiles.

Les logs doivent permettre de diagnostiquer :

- erreurs backend ;
- erreurs API ;
- imports ;
- notifications ;
- conflits.

---

# 63. Monitoring

Actuator Spring Boot.

Métriques :

- disponibilité ;
- latence ;
- erreurs ;
- utilisation mémoire ;
- connexions DB.

Évolution :

- Prometheus ;
- Grafana ;
- Sentry.

---

# 64. Stockage de fichiers

Les fichiers importés ou générés peuvent être stockés dans un stockage objet.

Exemples :

- S3 compatible ;
- MinIO en développement ;
- stockage cloud en production.

Les URLs de téléchargement doivent être sécurisées lorsque le contenu n'est pas public.

---

# 65. Import Excel — sécurité

Limiter :

- taille du fichier ;
- extension ;
- nombre de lignes ;
- types de données.

Ne jamais faire confiance à l'extension seule.

Tous les champs doivent être validés avant insertion en base.

---

# 66. Accessibilité

Objectif :

- contrastes lisibles ;
- navigation clavier sur Web ;
- labels explicites ;
- textes alternatifs ;
- états focus ;
- tailles de zone tactile correctes sur mobile.

---

# 67. Internationalisation

Le MVP peut commencer en français.

Mais l'architecture doit permettre :

```text
fr
en
```

Les textes UI ne doivent pas être codés en dur partout.

Prévoir une stratégie i18n.

---

# 68. Données sensibles

Le produit manipule des données personnelles.

Il faut appliquer :

- minimisation des données ;
- contrôle d'accès ;
- chiffrement en transit ;
- protection des comptes ;
- journalisation des accès sensibles ;
- politique de conservation.

Les spécificités juridiques locales devront être validées avec les responsables de l'établissement avant mise en production.

---

# 69. Offline mobile

Une capacité offline légère est recommandée.

Le mobile peut conserver localement :

- prochain cours ;
- emploi du temps récent ;
- profil ;
- préférences.

Lorsqu'Internet revient :

```text
Synchronisation
```

L'application doit clairement indiquer la date de dernière synchronisation.

---

# 70. Gestion des connexions lentes

Pour un usage au Gabon, privilégier :

- JSON compact ;
- pagination ;
- cache ;
- images compressées ;
- requêtes limitées ;
- éviter les gros téléchargements automatiques ;
- synchronisation ciblée.

L'application mobile doit rester utilisable avec une connexion intermittente.

---

# 71. Workflow principal — administration

```text
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
Créer classes/groupes
        ↓
Créer enseignants
        ↓
Créer matières
        ↓
Créer salles
        ↓
Créer année académique
        ↓
Créer cours
        ↓
Créer événements calendrier
        ↓
Détection conflits
        ↓
Validation
        ↓
Publication
        ↓
Notifications
```

---

# 72. Workflow principal — étudiant

```text
Installation application
        ↓
Connexion
        ↓
Association établissement
        ↓
Association classe/groupe
        ↓
Récupération EDT
        ↓
Accueil
        ↓
Prochain cours
        ↓
Consultation semaine
        ↓
Notifications en cas de changement
```

---

# 73. MVP — périmètre exact

## Inclus

### Backend

- Authentification ;
- JWT ;
- RBAC ;
- multi-tenant ;
- établissements ;
- classes ;
- groupes ;
- enseignants ;
- étudiants ;
- matières ;
- salles ;
- cours ;
- événements calendrier ;
- détection de conflits ;
- publication ;
- notifications de base ;
- audit log ;
- import Excel simple.

### Web

- connexion ;
- dashboard ;
- CRUD de base ;
- calendrier semaine ;
- filtres ;
- création de cours ;
- édition ;
- conflits ;
- publication ;
- import.

### Mobile

- connexion ;
- accueil ;
- emploi du temps du jour ;
- semaine ;
- détail cours ;
- notifications ;
- profil.

---

# 74. Hors MVP

À développer après validation :

- génération automatique optimisée ;
- moteur Rust ;
- présence/assiduité ;
- gestion des examens avancée ;
- réservation de salles ;
- statistiques avancées ;
- portail parents ;
- paiement ;
- messagerie ;
- intégration ENT ;
- synchronisation Google Calendar ;
- synchronisation Outlook ;
- SSO établissement.

---

# 75. Roadmap

## Phase 0 — Architecture

- dépôt Git ;
- conventions ;
- modèle de données ;
- Docker ;
- Spring Boot ;
- PostgreSQL ;
- migrations ;
- CI.

## Phase 1 — Authentification

- utilisateurs ;
- rôles ;
- JWT ;
- permissions ;
- tenant.

## Phase 2 — Référentiels

- établissements ;
- campus ;
- départements ;
- formations ;
- classes ;
- groupes ;
- enseignants ;
- étudiants ;
- matières ;
- salles.

## Phase 3 — Emploi du temps

- courses ;
- schedule events ;
- calendrier ;
- CRUD ;
- filtres.

## Phase 4 — Conflits

- enseignant ;
- salle ;
- groupe ;
- capacité ;
- validations.

## Phase 5 — Publication

- workflow ;
- historique ;
- notifications.

## Phase 6 — Application mobile

- Flutter ;
- authentification ;
- EDT ;
- notifications.

## Phase 7 — Import/Export

- Excel ;
- PDF ;
- impression ;
- QR Code.

## Phase 8 — Optimisation

- statistiques ;
- cache ;
- performance.

## Phase 9 — Génération automatique

- moteur de contraintes ;
- optimisation ;
- éventuellement Rust.

---

# 76. Stratégie Vibe Coding avec Antigravity

Le projet ne doit PAS être généré en une seule énorme demande.

Procéder par étapes contrôlées.

## Règle principale

Chaque tâche de génération doit :

1. avoir un périmètre précis ;
2. produire du code compilable ;
3. respecter l'architecture existante ;
4. inclure les tests correspondants ;
5. documenter les changements ;
6. ne pas casser les modules existants.

---

# 77. Ordre recommandé des prompts Antigravity

### Prompt 1

Créer le projet Spring Boot Java 21 avec :

- Maven ;
- Spring Web ;
- Spring Security ;
- Spring Data JPA ;
- PostgreSQL ;
- Flyway ;
- validation ;
- Swagger ;
- Actuator ;
- Docker.

### Prompt 2

Créer :

- structure multi-tenant ;
- User ;
- Role ;
- authentication ;
- JWT.

### Prompt 3

Créer les entités pédagogiques :

- School ;
- Campus ;
- Department ;
- Program ;
- Level ;
- Class ;
- Group.

### Prompt 4

Créer :

- Teacher ;
- Student ;
- Subject ;
- Room.

### Prompt 5

Créer :

- Course ;
- ScheduleEvent ;
- calendrier API.

### Prompt 6

Créer le ConflictService.

### Prompt 7

Créer publication + audit.

### Prompt 8

Créer notifications.

### Prompt 9

Créer import Excel.

### Prompt 10

Construire le frontend Next.js.

### Prompt 11

Construire le calendrier Web.

### Prompt 12

Construire Flutter mobile.

---

# 78. Règles de développement pour Antigravity

Toujours demander à Antigravity de :

- lire l'architecture avant de modifier ;
- réutiliser les composants existants ;
- éviter les duplications ;
- créer des DTO ;
- ne pas exposer directement les entités JPA ;
- utiliser des services pour la logique métier ;
- respecter le RBAC ;
- ajouter les validations ;
- ajouter les tests ;
- ne pas placer de secrets dans le code ;
- ne pas modifier arbitrairement la stack ;
- ne pas introduire un nouveau framework sans justification.

---

# 79. Règle DTO

Ne jamais exposer directement les entités JPA dans les controllers.

Mauvais :

```java
@GetMapping
public List<Student> getStudents() {
    return repository.findAll();
}
```

Préférer :

```java
@GetMapping
public Page<StudentResponse> getStudents(...) {
    return service.findStudents(...);
}
```

---

# 80. Règle métier

Les controllers ne doivent pas contenir la logique métier complexe.

Mauvais :

```text
Controller
 ├── vérification conflit
 ├── création event
 ├── notification
 └── audit
```

Préférer :

```text
Controller
      ↓
Service
      ↓
ConflictService
      ↓
Repository
      ↓
NotificationService
      ↓
AuditService
```

---

# 81. Règle de transaction

Les opérations critiques doivent être transactionnelles.

Exemple :

```text
Créer ScheduleEvent
      ↓
Vérifier conflits
      ↓
Enregistrer
      ↓
Audit
```

Si une étape critique échoue, la transaction doit pouvoir être annulée.

---

# 82. API idempotente lorsque nécessaire

Les opérations de synchronisation et de notifications doivent éviter les doublons.

Prévoir des identifiants/idempotency keys lorsque pertinent.

---

# 83. Git

Branches :

```text
main
develop
feature/*
fix/*
hotfix/*
```

Commits :

```text
feat: add schedule event API
fix: prevent room conflicts
test: add conflict service tests
docs: update architecture
```

Ne jamais commit :

```text
.env
credentials
private keys
JWT secrets
Firebase secrets
```

---

# 84. CI/CD

Pipeline minimal :

```text
Git Push
   ↓
Build
   ↓
Unit Tests
   ↓
Integration Tests
   ↓
Static Analysis
   ↓
Docker Build
   ↓
Deploy staging
```

Puis production après validation.

---

# 85. Definition of Done

Une fonctionnalité est considérée terminée uniquement lorsqu'elle :

- fonctionne ;
- est sécurisée ;
- est testée ;
- est documentée ;
- respecte l'architecture ;
- gère les erreurs ;
- respecte les permissions ;
- est compatible avec PostgreSQL ;
- ne casse pas l'existant.

---

# 86. Critères d'acceptation du MVP

Un administrateur peut :

1. créer un établissement ;
2. créer une classe ;
3. créer un groupe ;
4. créer un enseignant ;
5. créer une matière ;
6. créer une salle ;
7. créer un cours ;
8. planifier un événement ;
9. détecter les conflits ;
10. publier l'emploi du temps.

Un étudiant peut :

1. se connecter ;
2. voir son emploi du temps du jour ;
3. voir sa semaine ;
4. ouvrir le détail d'un cours ;
5. recevoir une notification lors d'un changement.

---

# 87. Exemple de scénario complet

Un administrateur programme :

```text
Matière : Programmation
Classe : L2 Informatique
Groupe : G1
Enseignant : Dr. MBO
Salle : B204
Date : 15/09/2026
Heure : 14:00 → 16:00
```

Le backend :

```text
POST /api/v1/schedule-events
        ↓
Validation
        ↓
RBAC
        ↓
Tenant check
        ↓
ConflictService
        ↓
No conflict
        ↓
INSERT PostgreSQL
        ↓
AuditLog
```

L'événement est ensuite :

```text
DRAFT
   ↓
PUBLISHED
```

Le mobile de l'étudiant récupère :

```text
Programmation
15 septembre
14h00 - 16h00
Salle B204
```

---

# 88. Exemple de changement

L'administrateur déplace :

```text
B204 → C102
```

Backend :

```text
PUT /api/v1/schedule-events/{id}
        ↓
Validation
        ↓
ConflictService
        ↓
Update
        ↓
Audit
        ↓
NotificationService
        ↓
FCM
```

L'étudiant reçoit :

```text
⚠️ Salle modifiée

Programmation
15 septembre
14h00 - 16h00

Ancienne salle : B204
Nouvelle salle : C102
```

---

# 89. Nom de projet et identité

Nom technique :

```text
gab-edt
```

Packages Java :

```text
ga.gabedt
```

Repos Git recommandés :

```text
gab-edt-backend
gab-edt-web
gab-edt-mobile
gab-edt-docs
```

---

# 90. Principe architectural final

Le système doit respecter :

```text
                 FRONTENDS
                     │
                     ▼
                REST API
                     │
                     ▼
             APPLICATION LAYER
                     │
          ┌──────────┼───────────┐
          ▼          ▼           ▼
       DOMAIN     SECURITY     NOTIFICATION
          │
          ▼
      PERSISTENCE
          │
          ▼
       PostgreSQL
```

La logique métier doit rester côté backend.

Le frontend ne doit jamais être considéré comme une autorité de sécurité.

---

# 91. Architecture future possible

Lorsque le produit aura grandi :

```text
                  API Gateway
                       │
          ┌────────────┼────────────┐
          │            │            │
     Auth Service  Schedule API  Notification
          │            │            │
          │            │            │
          │       PostgreSQL        │
          │                         │
          └───────────┬─────────────┘
                      │
                Rust Optimizer
```

Mais cette évolution ne doit être réalisée que lorsque le volume, les performances ou les besoins métier le justifient.

---

# 92. Conclusion

GAB-EDT doit être conçu comme une **plateforme de gestion des emplois du temps**, et non comme un simple calendrier.

Le MVP recommandé repose sur :

```text
Web
Next.js + React + TypeScript

Mobile
Flutter + Dart

Backend
Java 21 + Spring Boot

Database
PostgreSQL

Cache
Redis

Notifications
Firebase Cloud Messaging

Migrations
Flyway

Tests
JUnit + Testcontainers

Documentation
OpenAPI

Conteneurisation
Docker
```

Le backend Java constitue le cœur de la plateforme.

Rust est réservé à une éventuelle génération/optimisation avancée des emplois du temps.

La priorité absolue doit être :

```text
Simplicité
+
Sécurité
+
Règles métier solides
+
API propre
+
Architecture modulaire
+
Tests
+
Vibe Coding contrôlé
```

---

# 93. Instruction générale à donner à Antigravity

Utiliser ce document comme **source de vérité du projet GAB-EDT**.

Avant toute génération ou modification de code :

1. lire le présent document ;
2. identifier le module concerné ;
3. respecter la stack définie ;
4. respecter l'arborescence ;
5. ne pas changer de langage ou framework sans demande explicite ;
6. ne pas créer de microservices prématurément ;
7. appliquer la sécurité côté backend ;
8. utiliser PostgreSQL comme source de vérité ;
9. écrire des DTO et services ;
10. ajouter les tests pour chaque fonctionnalité métier importante ;
11. ne pas exposer d'informations sensibles ;
12. préserver la compatibilité avec les applications Web et Mobile ;
13. signaler explicitement toute ambiguïté avant d'introduire une décision architecturale importante ;
14. produire un code propre, typé, documenté et maintenable ;
15. après chaque étape, vérifier que le projet compile et que les tests passent.

**Objectif final : produire une plateforme professionnelle, multi-établissements, adaptée aux universités et lycées du Gabon, avec une interface Web moderne pour l'administration et une application mobile simple et rapide pour les étudiants.**
