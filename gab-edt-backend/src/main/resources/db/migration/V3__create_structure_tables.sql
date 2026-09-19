-- ==============================================================================
-- GAB-EDT — Migration V3 : Structure Pédagogique
-- ==============================================================================

-- ── Table : campuses ────────────────────────────────────────────────────────
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_campuses_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id)
);

-- ── Table : departments ─────────────────────────────────────────────────────
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    campus_id UUID,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_departments_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_departments_campus FOREIGN KEY (campus_id) REFERENCES campuses(id),
    CONSTRAINT uq_departments_code UNIQUE (code)
);

-- ── Table : programs ────────────────────────────────────────────────────────
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    department_id UUID,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_programs_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_programs_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT uq_programs_code UNIQUE (code)
);

-- ── Table : levels ──────────────────────────────────────────────────────────
CREATE TABLE levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    program_id UUID,
    name VARCHAR(100) NOT NULL,
    order_index INT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_levels_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_levels_program FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- ── Table : classes ─────────────────────────────────────────────────────────
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    level_id UUID,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    capacity INT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_classes_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_classes_level FOREIGN KEY (level_id) REFERENCES levels(id),
    CONSTRAINT uq_classes_code UNIQUE (code)
);

-- ── Table : student_groups ──────────────────────────────────────────────────
CREATE TABLE student_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    class_id UUID,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    capacity INT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_student_groups_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_student_groups_class FOREIGN KEY (class_id) REFERENCES classes(id),
    CONSTRAINT uq_student_groups_code UNIQUE (code)
);
