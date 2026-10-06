-- Créneaux de disponibilité hebdomadaire des enseignants (vacataires).
-- Un enseignant SANS créneau est considéré disponible tout le temps (titulaire).
-- Un enseignant AVEC des créneaux ne peut être planifié qu'à l'intérieur de ceux-ci.
create table teacher_availabilities (
    id              uuid         primary key,
    teacher_id      uuid         not null,
    day_of_week     varchar(10)  not null,
    start_time      time         not null,
    end_time        time         not null,
    tenant_id       uuid         not null,
    created_at      timestamp    not null default now(),
    updated_at      timestamp    not null default now(),
    deleted         boolean      not null default false,
    constraint fk_tavail_teacher foreign key (teacher_id) references teachers(id)
);
create index idx_teacher_availabilities_teacher on teacher_availabilities(teacher_id);
create index idx_teacher_availabilities_tenant  on teacher_availabilities(tenant_id);
