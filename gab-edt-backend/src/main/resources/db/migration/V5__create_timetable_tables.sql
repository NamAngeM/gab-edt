-- ==============================================================================
-- GAB-EDT — Migration V5 : Timetable Core (Courses & Schedule Events)
-- ==============================================================================

-- ── Table : courses ─────────────────────────────────────────────────────────
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    class_group_id UUID NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_courses_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_courses_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT fk_courses_class_group FOREIGN KEY (class_group_id) REFERENCES classes(id)
);

-- ── Table : schedule_events ─────────────────────────────────────────────────
CREATE TABLE schedule_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    course_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    room_id UUID,
    student_group_id UUID NOT NULL,
    start_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    publication_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    recurrence_rule VARCHAR(255),
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_schedule_events_tenant FOREIGN KEY (tenant_id) REFERENCES schools(id),
    CONSTRAINT fk_schedule_events_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_schedule_events_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT fk_schedule_events_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_schedule_events_student_group FOREIGN KEY (student_group_id) REFERENCES student_groups(id)
);
