-- ==============================================================================
-- GAB-EDT — Migration V2 : Core Tables (users, schools)
-- ==============================================================================

-- ── Table : users ────────────────────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour la recherche par email et éviter les conflits (hors supprimés)
CREATE UNIQUE INDEX idx_users_email_active ON users (email) WHERE deleted = FALSE;

-- ── Table : schools (Tenants) ────────────────────────────────────────────────
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    logo_url VARCHAR(1024),
    timezone VARCHAR(50) NOT NULL DEFAULT 'Africa/Libreville',
    country_code VARCHAR(10) NOT NULL DEFAULT 'GA',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour le code de l'établissement
CREATE UNIQUE INDEX idx_schools_code_active ON schools (code) WHERE deleted = FALSE;
