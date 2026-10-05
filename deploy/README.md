# Mise en production de GAB-EDT

Ce guide décrit le déploiement sur un serveur Linux unique (VPS) avec Docker.
Le domaine sert à la fois l'application web, l'API mobile et les notifications temps réel, en HTTPS.

## Prérequis

- Un serveur Linux avec Docker et Docker Compose v2.
- Un nom de domaine dont l'enregistrement DNS `A` pointe vers le serveur (par exemple `edt.mon-ecole.ga`).
- Les ports 80 et 443 ouverts. Caddy obtient et renouvelle automatiquement le certificat HTTPS.
- Un compte SMTP pour les e-mails de réinitialisation de mot de passe.

## Premier déploiement

```bash
cd deploy
cp .env.example .env
# Remplir .env :
#   DOMAIN, DB_PASSWORD, JWT_SECRET (openssl rand -base64 48), SMTP,
#   BOOTSTRAP_SUPER_ADMIN_EMAIL / BOOTSTRAP_SUPER_ADMIN_PASSWORD (12 caractères minimum)
docker compose -f docker-compose.prod.yml up -d --build
```

Au premier démarrage :

1. Flyway crée le schéma de la base (`V1__baseline_schema.sql`).
2. Le compte SUPER_ADMIN est créé. **Retirez ensuite `BOOTSTRAP_SUPER_ADMIN_PASSWORD` de `.env`.**
3. Connectez-vous sur `https://DOMAIN/login` avec ce compte, puis ouvrez **Établissements → Nouvel établissement**.
   Cette action crée l'établissement client et son premier administrateur.

## Architecture

```
Internet ──HTTPS──> Caddy
                      ├── /ws/*       -> API Spring (notifications WebSocket)
                      ├── /api/v1/*   -> API Spring (application mobile, jeton Bearer)
                      └── le reste    -> Next.js (web) ──réseau interne──> API Spring
```

- **Web** : les jetons restent dans des cookies HttpOnly posés par Next.js. Le navigateur n'y a jamais accès.
- **Établissement (tenant)** : il est déduit de l'utilisateur connecté, jamais d'un en-tête envoyé par le client. Hibernate filtre chaque requête sur la colonne `tenant_id`.
- **Points non exposés** : PostgreSQL et Actuator ne sont pas accessibles depuis Internet.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DOMAIN` | Domaine public : HTTPS, liens envoyés par e-mail, CORS |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Secret de signature des jetons, partagé par l'API et Next.js. L'API refuse de démarrer s'il fait moins de 32 octets |
| `MAIL_*` | Serveur SMTP. Sans lui, les e-mails de réinitialisation ne partent pas |
| `BOOTSTRAP_SUPER_ADMIN_*` | Premier compte plateforme, utilisé une seule fois |

Variables supplémentaires côté frontend :
- `NEXT_PUBLIC_SHOW_PREVIEW_FEATURES=true` affiche les écrans encore en maquette. Réservé aux démonstrations.

Côté application mobile :
- `EXPO_PUBLIC_API_URL=https://DOMAIN` indique l'URL de l'API.

## Exploitation

- **Sauvegardes** : planifiez chaque nuit un `pg_dump`, copiez-le hors du serveur et testez régulièrement la restauration.
  ```bash
  docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U gabedt gabedt | gzip > gabedt-$(date +%F).sql.gz
  ```
- **Mises à jour** : lancez `git pull`, puis `docker compose -f docker-compose.prod.yml up -d --build`. Flyway applique automatiquement les nouvelles migrations.
- **Évolutions du schéma** : chaque changement d'entité JPA s'accompagne d'une nouvelle migration `V2__…`, `V3__…`. Ne modifiez jamais une migration déjà déployée. Le test `GabEdtApplicationTests` échoue si une migration manque.
- **Logs** : `docker compose -f docker-compose.prod.yml logs -f backend frontend`.
- **Supervision** : surveillez `https://DOMAIN/login` depuis l'extérieur. La sonde `/actuator/health` n'est accessible que depuis le réseau Docker.

## Limites connues

- La limitation des tentatives de connexion est gardée en mémoire. Elle convient à une seule instance de l'API ; pour en faire tourner plusieurs, il faut la déplacer dans Redis.
- Les écrans encore en maquette (réservations, justificatifs, facturation, etc.) sont masqués et bloqués tant que `NEXT_PUBLIC_SHOW_PREVIEW_FEATURES` vaut `false`.
