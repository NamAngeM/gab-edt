-- ==============================================================================
-- GAB-EDT — Migration V4 : Users Profiles & Resources
-- ==============================================================================

-- ── Table : teachers ────────────────────────────────────────────────────────
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    department_id UUID,
    employee_number VARCHAR(100),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_teachers_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_teachers_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT uq_teachers_user UNIQUE (user_id)
);

-- ── Table : students ────────────────────────────────────────────────────────
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    class_id UUID,
    student_number VARCHAR(100),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_students_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id),
    CONSTRAINT uq_students_user UNIQUE (user_id)
);

-- ── Table : subjects ────────────────────────────────────────────────────────
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    department_id UUID,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_subjects_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_subjects_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT uq_subjects_code UNIQUE (code)
);

-- ── Table : rooms ───────────────────────────────────────────────────────────
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    campus_id UUID,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    capacity INT,
    type VARCHAR(100),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rooms_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_rooms_campus FOREIGN KEY (campus_id) REFERENCES campuses(id),
    CONSTRAINT uq_rooms_code UNIQUE (code)
);
