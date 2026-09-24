# GAB-EDT Backend

**Plateforme de gestion des emplois du temps** pour les établissements scolaires et universitaires du Gabon.

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Langage | Java 21 LTS |
| Framework | Spring Boot 3.3 |
| Base de données | PostgreSQL 16 |
| Cache | Redis 7 |
| Migrations | Flyway |
| Documentation API | OpenAPI / Swagger |
| Conteneurisation | Docker |
| Tests | JUnit 5 + Testcontainers |

## Prérequis

- **Java 21+** (ou Java 25)
- **Docker** & **Docker Compose** (pour PostgreSQL et Redis)
- Maven Wrapper inclus (`./mvnw`) — pas besoin d'installer Maven

## Démarrage rapide

### 1. Services locaux (PostgreSQL + Redis)

```bash
docker compose up -d postgres redis
```

### 2. Configuration

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 3. Lancer l'application

```bash
# Windows
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev

# Linux / macOS
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 4. Accéder à la documentation API

- Swagger UI : [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- OpenAPI JSON : [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- Actuator : [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

## Structure du projet

Le projet est organisé autour de **domaines fonctionnels majeurs** (consolidation récente) :

```
src/main/java/ga/gabedt/
├── GabEdtApplication.java    # Point d'entrée
├── config/                   # Configurations (Security, CORS, OpenAPI, WebSocket)
├── common/                   # Code partagé (entités de base, exceptions, DTOs)
├── auth/                     # Authentification JWT et rôles
├── tenant/                   # Multi-tenant (Isolation des données)
├── user/                     # Utilisateurs (Admin, Professeurs, Élèves)
├── structure/                # Structures (Institution, Départements, Classes)
├── resource/                 # Ressources physiques (Salles, Matières)
├── timetable/                # Moteur d'emploi du temps et détection de conflits
├── exam/                     # Gestion des sessions d'examens
├── defense/                  # Gestion des soutenances
├── dashboard/                # Statistiques et métriques
├── notification/             # Alertes temps-réel via WebSockets
└── communication/            # Annonces globales
```

## Tests

```bash
# Tous les tests
./mvnw test

# Tests d'intégration (nécessite Docker)
./mvnw verify
```

## Docker

### Build complet avec Docker Compose

```bash
docker compose up --build
```

Cela démarre PostgreSQL, Redis et le backend sur le port 8080.

## Conventions

- **Branches** : `main`, `develop`, `feature/*`, `fix/*`, `hotfix/*`
- **Commits** : `feat:`, `fix:`, `test:`, `docs:`, `refactor:`
- **API** : versionné `/api/v1/...`
- **Données** : jamais d'exposition directe des entités JPA, utiliser des DTOs

## Licence

Propriétaire — GAB-EDT Team
