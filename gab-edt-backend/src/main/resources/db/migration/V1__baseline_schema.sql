-- ==============================================================================
-- GAB-EDT — Schéma de référence (PostgreSQL)
-- ==============================================================================
-- Remplace les anciennes migrations V1 à V5, qui ne correspondaient plus aux entités
-- (aucun environnement de production n'a jamais été initialisé avec elles).
-- Généré à partir des entités JPA (Hibernate, dialecte PostgreSQL) puis complété
-- par les index ci-dessous. Toute évolution ultérieure passe par une nouvelle migration V2, V3…
-- Isolation multi-établissement : colonne tenant_id (= institutions.id), filtrée par Hibernate (@TenantId).
-- ==============================================================================

create table academic_events (
    deleted boolean not null,
    is_holiday boolean not null,
    created_at timestamp(6) not null,
    end_date timestamp(6) not null,
    start_date timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    tenant_id uuid not null,
    description TEXT,
    title varchar(255) not null,
    primary key (id)
);

create table academic_periods (
    deleted boolean not null,
    end_date date not null,
    order_index integer,
    start_date date not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    academic_year_id uuid not null,
    id uuid not null,
    name varchar(255) not null,
    period_type varchar(255) not null check (period_type in ('SEMESTER','TRIMESTER','TERM')),
    primary key (id)
);

create table academic_years (
    deleted boolean not null,
    end_date date not null,
    start_date date not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    tenant_id uuid not null,
    name varchar(255) not null,
    status varchar(255) not null check (status in ('ACTIVE','PLANNED','ARCHIVED')),
    primary key (id)
);

create table announcements (
    deleted boolean not null,
    valid_until date,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    author_id uuid,
    id uuid not null,
    institution_id uuid not null,
    tenant_id uuid not null,
    content TEXT not null,
    target_audience varchar(255) not null check (target_audience in ('ALL','STUDENTS','TEACHERS','STAFF')),
    title varchar(255) not null,
    primary key (id)
);

create table attendance (
    delay_minutes integer,
    deleted boolean not null,
    entry_ticket_printed boolean,
    created_at timestamp(6) not null,
    marked_at timestamp(6),
    updated_at timestamp(6),
    id uuid not null,
    marked_by_id uuid,
    schedule_event_id uuid not null,
    student_id uuid not null,
    justification varchar(255),
    status varchar(255) not null check (status in ('PRESENT','ABSENT','LATE','EXCUSED')),
    primary key (id)
);

create table attendance_records (
    delay_minutes integer,
    deleted boolean not null,
    entry_ticket_printed boolean,
    created_at timestamp(6) not null,
    marked_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    marked_by_id uuid not null,
    schedule_event_id uuid not null,
    student_id uuid not null,
    tenant_id uuid not null,
    comments varchar(500),
    status varchar(255) not null check (status in ('PRESENT','ABSENT','LATE','EXCUSED')),
    primary key (id)
);

create table audit_logs (
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    entity_id uuid,
    id uuid not null,
    tenant_id uuid,
    user_id uuid,
    action varchar(255) not null,
    description varchar(255),
    entity_type varchar(255) not null,
    ip_address varchar(255),
    new_values TEXT,
    old_values TEXT,
    primary key (id)
);

create table courses (
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    org_unit_id uuid not null,
    subject_id uuid not null,
    teacher_id uuid not null,
    tenant_id uuid not null,
    primary key (id)
);

create table defenses (
    deleted boolean not null,
    created_at timestamp(6) not null,
    end_at timestamp(6) not null,
    start_at timestamp(6) not null,
    updated_at timestamp(6),
    examiner_id uuid,
    id uuid not null,
    institution_id uuid not null,
    president_id uuid,
    reporter_id uuid,
    room_id uuid,
    student_id uuid not null,
    tenant_id uuid not null,
    topic varchar(255) not null,
    primary key (id)
);

create table disciplinary_records (
    deleted boolean not null,
    created_at timestamp(6) not null,
    incident_date timestamp(6) not null,
    signed_at timestamp(6),
    updated_at timestamp(6),
    id uuid not null,
    reported_by_id uuid not null,
    student_id uuid not null,
    tenant_id uuid not null,
    description varchar(1000) not null,
    parent_signature varchar(255),
    type varchar(255) not null check (type in ('RETARD','ABSENCE_NON_JUSTIFIEE','AVERTISSEMENT','BLAME','EXCLUSION_TEMPORAIRE','CONVOCATION_PARENT')),
    primary key (id)
);

create table exam_sessions (
    deleted boolean not null,
    end_date date not null,
    is_published boolean not null,
    start_date date not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    org_unit_id uuid not null,
    tenant_id uuid not null,
    name varchar(255) not null,
    primary key (id)
);

create table exam_supervisors (
    exam_id uuid not null,
    teacher_id uuid not null,
    primary key (exam_id, teacher_id)
);

create table exams (
    deleted boolean not null,
    created_at timestamp(6) not null,
    end_at timestamp(6) not null,
    start_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    room_id uuid,
    session_id uuid not null,
    subject_id uuid not null,
    tenant_id uuid not null,
    primary key (id)
);

create table grades (
    coefficient float(53) not null,
    deleted boolean not null,
    grade_value float(53) not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    student_id uuid not null,
    subject_id uuid,
    tenant_id uuid not null,
    title varchar(255) not null,
    primary key (id)
);

create table homework (
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    schedule_event_id uuid not null,
    description varchar(255),
    title varchar(255) not null,
    primary key (id)
);

create table homework_status (
    completed boolean not null,
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    homework_id uuid not null,
    id uuid not null,
    student_id uuid not null,
    primary key (id)
);

create table institutions (
    active boolean not null,
    created_at timestamp(6),
    updated_at timestamp(6),
    id uuid not null,
    city varchar(255),
    code varchar(255) unique,
    country varchar(255),
    logo_url varchar(255),
    name varchar(255) not null,
    timezone varchar(255),
    type varchar(255) not null check (type in ('UNIVERSITY','GRANDE_ECOLE','LYCEE','COLLEGE')),
    primary key (id)
);

create table notifications (
    deleted boolean not null,
    is_read boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    user_id uuid not null,
    message varchar(255) not null,
    title varchar(255) not null,
    type varchar(255) not null,
    primary key (id)
);

create table organizational_units (
    active boolean not null,
    created_at timestamp(6),
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    parent_id uuid,
    tenant_id uuid not null,
    description varchar(255),
    name varchar(255) not null,
    type varchar(255) not null check (type in ('CAMPUS','FACULTY','DEPARTMENT','PROGRAM','CYCLE','YEAR','LEVEL','SERIES','CLASS','GROUP','OPTION','SPECIALTY')),
    primary key (id)
);

create table password_reset_tokens (
    used boolean not null,
    expiry_date timestamp(6) not null,
    id uuid not null,
    user_id uuid not null,
    token_hash varchar(64) not null unique,
    primary key (id)
);

create table revoked_tokens (
    rotated boolean not null,
    expires_at timestamp(6) not null,
    revoked_at timestamp(6) not null,
    id uuid not null,
    token_hash varchar(64) not null unique,
    primary key (id)
);

create table room_equipments (
    room_id uuid not null,
    equipment varchar(255)
);

create table rooms (
    active boolean not null,
    capacity integer,
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    org_unit_id uuid,
    tenant_id uuid not null,
    code varchar(255),
    name varchar(255) not null,
    type varchar(255),
    primary key (id),
    constraint uk_rooms_tenant_code unique (tenant_id, code)
);

create table schedule_events (
    delay_minutes integer,
    deleted boolean not null,
    created_at timestamp(6) not null,
    end_at timestamp(6) not null,
    start_at timestamp(6) not null,
    updated_at timestamp(6),
    course_id uuid not null,
    id uuid not null,
    institution_id uuid not null,
    org_unit_id uuid not null,
    room_id uuid,
    teacher_id uuid not null,
    tenant_id uuid not null,
    notes varchar(255),
    publication_status varchar(255) not null check (publication_status in ('DRAFT','PENDING_APPROVAL','PUBLISHED','ARCHIVED')),
    recurrence_rule varchar(255),
    status varchar(255) not null check (status in ('SCHEDULED','CANCELLED','POSTPONED','MOVED','COMPLETED')),
    primary key (id)
);

create table student_org_units (
    org_unit_id uuid not null,
    student_id uuid not null,
    primary key (org_unit_id, student_id)
);

create table students (
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    tenant_id uuid not null,
    user_id uuid not null unique,
    parent_password_hash varchar(255),
    student_number varchar(255),
    primary key (id),
    constraint uk_students_tenant_number unique (tenant_id, student_number)
);

create table subjects (
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    org_unit_id uuid,
    tenant_id uuid not null,
    code varchar(255),
    name varchar(255) not null,
    primary key (id),
    constraint uk_subjects_tenant_code unique (tenant_id, code)
);

create table teacher_org_units (
    org_unit_id uuid not null,
    teacher_id uuid not null,
    primary key (org_unit_id, teacher_id)
);

create table teachers (
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid not null,
    tenant_id uuid not null,
    user_id uuid not null unique,
    employee_number varchar(255),
    primary key (id)
);

create table user_managed_org_units (
    org_unit_id uuid not null,
    user_id uuid not null,
    primary key (org_unit_id, user_id)
);

create table users (
    active boolean not null,
    deleted boolean not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6),
    id uuid not null,
    institution_id uuid,
    email varchar(255) not null unique,
    expo_push_token varchar(255),
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    password_hash varchar(255) not null,
    phone varchar(255),
    role varchar(255) not null check (role in ('SUPER_ADMIN','SCHOOL_ADMIN','PEDAGOGICAL_MANAGER','TEACHER','STUDENT','PARENT')),
    primary key (id)
);

alter table if exists academic_events 
   add constraint FKmsnae7klr8e3ria66ssq5j9xa 
   foreign key (institution_id) 
   references institutions;

alter table if exists academic_periods 
   add constraint FKp37falxwjth0lwycgt7c657xf 
   foreign key (academic_year_id) 
   references academic_years;

alter table if exists academic_years 
   add constraint FKmka7ktr2c45d8wsxnvq5m70oh 
   foreign key (institution_id) 
   references institutions;

alter table if exists announcements 
   add constraint FK1pgl63iwbqvmngumhvr3xopg3 
   foreign key (author_id) 
   references users;

alter table if exists announcements 
   add constraint FKeg8v2b2skld544m12233g51uc 
   foreign key (institution_id) 
   references institutions;

alter table if exists attendance 
   add constraint FK8exr7j0ci204jpyt6tkjtnlsb 
   foreign key (marked_by_id) 
   references users;

alter table if exists attendance 
   add constraint FKvcb81ndax2aprhhcnjjhjopl 
   foreign key (schedule_event_id) 
   references schedule_events;

alter table if exists attendance 
   add constraint FK7121lveuhtmu9wa6m90ayd5yg 
   foreign key (student_id) 
   references students;

alter table if exists attendance_records 
   add constraint FKf0murgd8q96iigmstxx37mo7w 
   foreign key (marked_by_id) 
   references users;

alter table if exists attendance_records 
   add constraint FK1nh8v5q60rkgkwcbrfvs1vajf 
   foreign key (schedule_event_id) 
   references schedule_events;

alter table if exists attendance_records 
   add constraint FKb5ijilkgrgx66qn66iajdkyb9 
   foreign key (student_id) 
   references students;

alter table if exists audit_logs 
   add constraint FKjs4iimve3y0xssbtve5ysyef0 
   foreign key (user_id) 
   references users;

alter table if exists courses 
   add constraint FK9j9pt3rv7axxvf4l2svqpwus3 
   foreign key (institution_id) 
   references institutions;

alter table if exists courses 
   add constraint FKob2sbmraysxuewfmy6gpsklqa 
   foreign key (org_unit_id) 
   references organizational_units;

alter table if exists courses 
   add constraint FK5tckdihu5akp5nkxiacx1gfhi 
   foreign key (subject_id) 
   references subjects;

alter table if exists courses 
   add constraint FK468oyt88pgk2a0cxrvxygadqg 
   foreign key (teacher_id) 
   references teachers;

alter table if exists defenses 
   add constraint FKamjr4rfptn10aat5xbhhghti0 
   foreign key (examiner_id) 
   references teachers;

alter table if exists defenses 
   add constraint FKcbsi44rueat70usu4c6ng997v 
   foreign key (institution_id) 
   references institutions;

alter table if exists defenses 
   add constraint FKdtuuvet4edgrgq68aqopu7tno 
   foreign key (president_id) 
   references teachers;

alter table if exists defenses 
   add constraint FKl29m3qnugjlpqr6cpi86dnpj4 
   foreign key (reporter_id) 
   references teachers;

alter table if exists defenses 
   add constraint FKt5n5pwfox5pjhaliqj4l4jjf4 
   foreign key (room_id) 
   references rooms;

alter table if exists defenses 
   add constraint FKpvkvcr2lojg52mptyc1k8wt8d 
   foreign key (student_id) 
   references students;

alter table if exists disciplinary_records 
   add constraint FK4kls9tj8ds6loeouymjxq8l46 
   foreign key (reported_by_id) 
   references users;

alter table if exists disciplinary_records 
   add constraint FKfp0dewpq4fwq59041bamaokxc 
   foreign key (student_id) 
   references students;

alter table if exists exam_sessions 
   add constraint FKfykbcgrl11osv9k1m9i7xqa9x 
   foreign key (institution_id) 
   references institutions;

alter table if exists exam_sessions 
   add constraint FKex1vju4y1aib5u4re9ylcdoti 
   foreign key (org_unit_id) 
   references organizational_units;

alter table if exists exam_supervisors 
   add constraint FKrwfjenli0xq409lvgae2bmvv9 
   foreign key (teacher_id) 
   references teachers;

alter table if exists exam_supervisors 
   add constraint FK8i68qwqtfs9fj38bn184nksnq 
   foreign key (exam_id) 
   references exams;

alter table if exists exams 
   add constraint FKph01mly9w7t9499ud2lm8vew8 
   foreign key (institution_id) 
   references institutions;

alter table if exists exams 
   add constraint FKodo3y28tx3gdxuxyh2i9np28r 
   foreign key (room_id) 
   references rooms;

alter table if exists exams 
   add constraint FK8lb00sesqdldigc0dee4d1jlj 
   foreign key (session_id) 
   references exam_sessions;

alter table if exists exams 
   add constraint FKopre4n7j7fpxqbtbwpv8ywn1y 
   foreign key (subject_id) 
   references subjects;

alter table if exists grades 
   add constraint FK13a16545m7vvrcspc999r15s9 
   foreign key (student_id) 
   references students;

alter table if exists grades 
   add constraint FKrc0s5tgvm9r4ccxitaqtu88k5 
   foreign key (subject_id) 
   references subjects;

alter table if exists homework 
   add constraint FKlirrrn3deunp75rlrgdinj296 
   foreign key (schedule_event_id) 
   references schedule_events;

alter table if exists homework_status 
   add constraint FKcl8r6t8g6w618t9o2cg252y6p 
   foreign key (homework_id) 
   references homework;

alter table if exists homework_status 
   add constraint FKlun3apubv6tre6mwm1vdifmgx 
   foreign key (student_id) 
   references students;

alter table if exists notifications 
   add constraint FK9y21adhxn0ayjhfocscqox7bh 
   foreign key (user_id) 
   references users;

alter table if exists organizational_units 
   add constraint FKihl1oybtfw4j2ekrtfw9bgvho 
   foreign key (institution_id) 
   references institutions;

alter table if exists organizational_units 
   add constraint FK2cm7evuvvhuxepsnn0xneabbc 
   foreign key (parent_id) 
   references organizational_units;

alter table if exists password_reset_tokens 
   add constraint FKk3ndxg5xp6v7wd4gjyusp15gq 
   foreign key (user_id) 
   references users;

alter table if exists room_equipments 
   add constraint FKm7w0t53ls9uw5b60ueqlbkrdf 
   foreign key (room_id) 
   references rooms;

alter table if exists rooms 
   add constraint FKtl143mdr2dne0pve9xtjbquij 
   foreign key (institution_id) 
   references institutions;

alter table if exists rooms 
   add constraint FKaasvut1h5p7786dy806q4fv3i 
   foreign key (org_unit_id) 
   references organizational_units;

alter table if exists schedule_events 
   add constraint FKprf6hvx8kq8gg1y4eyudaf4c0 
   foreign key (course_id) 
   references courses;

alter table if exists schedule_events 
   add constraint FKdctev2kd6aymn7hqegawy5fs3 
   foreign key (institution_id) 
   references institutions;

alter table if exists schedule_events 
   add constraint FKel6hb13lhn3qq6obsbtbusfah 
   foreign key (org_unit_id) 
   references organizational_units;

alter table if exists schedule_events 
   add constraint FKbs7ullfe7ugak1c4cukxh26rd 
   foreign key (room_id) 
   references rooms;

alter table if exists schedule_events 
   add constraint FKjybuayb0sof1lf4na852b6mps 
   foreign key (teacher_id) 
   references teachers;

alter table if exists student_org_units 
   add constraint FK81ajjwt3ngqpdpsre9qdr2dqc 
   foreign key (org_unit_id) 
   references organizational_units;

alter table if exists student_org_units 
   add constraint FKmr9uq0ohowlhnm8irt2mcnpve 
   foreign key (student_id) 
   references students;

alter table if exists students 
   add constraint FKhu5lxwgdn4ab5bf49h5s10iu5 
   foreign key (institution_id) 
   references institutions;

alter table if exists students 
   add constraint FKdt1cjx5ve5bdabmuuf3ibrwaq 
   foreign key (user_id) 
   references users;

alter table if exists subjects 
   add constraint FK6wgfsjnqkja6xpygt50r2bsvq 
   foreign key (institution_id) 
   references institutions;

alter table if exists subjects 
   add constraint FKj1eyi5khufuxdcujsl57wkums 
   foreign key (org_unit_id) 
   references organizational_units;

alter table if exists teacher_org_units 
   add constraint FKsranhv0rby4mgua2t8wjjymth 
   foreign key (org_unit_id) 
   references organizational_units;

alter table if exists teacher_org_units 
   add constraint FKfcu7dd4no1to6p4kxtmxvcb1m 
   foreign key (teacher_id) 
   references teachers;

alter table if exists teachers 
   add constraint FK42h0l944ew0d3bmr7690b919i 
   foreign key (institution_id) 
   references institutions;

alter table if exists teachers 
   add constraint FKb8dct7w2j1vl1r2bpstw5isc0 
   foreign key (user_id) 
   references users;

alter table if exists user_managed_org_units 
   add constraint FKa4q87tu2aje8qag22hmdrjwf 
   foreign key (org_unit_id) 
   references organizational_units;

alter table if exists user_managed_org_units 
   add constraint FKiymfpk6dpu7cai3dqu0wmxfny 
   foreign key (user_id) 
   references users;

-- ── Index ─────────────────────────────────────────────────────────────────────
-- Filtrage par établissement (toutes les requêtes métier)
create index idx_users_institution on users (institution_id);
create index idx_org_units_tenant on organizational_units (tenant_id);
create index idx_org_units_parent on organizational_units (parent_id);
create index idx_students_tenant on students (tenant_id);
create index idx_teachers_tenant on teachers (tenant_id);
create index idx_rooms_tenant on rooms (tenant_id);
create index idx_subjects_tenant on subjects (tenant_id);
create index idx_courses_tenant on courses (tenant_id);
create index idx_announcements_tenant on announcements (tenant_id);
create index idx_academic_events_tenant on academic_events (tenant_id);
create index idx_exam_sessions_tenant on exam_sessions (tenant_id);
create index idx_exams_session on exams (session_id);
create index idx_defenses_tenant on defenses (tenant_id);
create index idx_grades_student on grades (student_id);
create index idx_disciplinary_student on disciplinary_records (student_id);
create index idx_audit_logs_tenant_created on audit_logs (tenant_id, created_at desc);

-- Planning : recherche par période, classe, enseignant et salle (détection de conflits)
create index idx_events_tenant_start on schedule_events (tenant_id, start_at);
create index idx_events_org_unit_start on schedule_events (org_unit_id, start_at);
create index idx_events_teacher_start on schedule_events (teacher_id, start_at);
create index idx_events_room_start on schedule_events (room_id, start_at);
create index idx_attendance_event on attendance (schedule_event_id);
create index idx_homework_event on homework (schedule_event_id);

-- Comptes et jetons
create index idx_notifications_user on notifications (user_id, is_read);
create index idx_reset_tokens_user on password_reset_tokens (user_id);
create index idx_revoked_tokens_expiry on revoked_tokens (expires_at);
