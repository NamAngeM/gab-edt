-- ==============================================================================
-- GAB-EDT — Migration initiale V1
-- ==============================================================================
-- Cette migration crée les extensions nécessaires et le schéma de base.
-- Les tables seront ajoutées progressivement dans les migrations suivantes.
-- ==============================================================================

-- Extension pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour les index trigram (recherche textuelle future)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
