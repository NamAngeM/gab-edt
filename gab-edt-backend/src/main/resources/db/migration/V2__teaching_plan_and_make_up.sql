-- Répartition des enseignements et rattrapages
-- courses.planned_hours : volume horaire prévu de l'enseignement (matière x enseignant x classe)
-- schedule_events.make_up_of_id : séance annulée que la séance rattrape

alter table courses add column planned_hours float(53);

alter table schedule_events add column make_up_of_id uuid;
alter table schedule_events
    add constraint fk_schedule_events_make_up_of foreign key (make_up_of_id) references schedule_events;

create index idx_events_make_up_of on schedule_events (make_up_of_id);
create index idx_courses_org_unit on courses (org_unit_id);
create index idx_courses_teacher on courses (teacher_id);
