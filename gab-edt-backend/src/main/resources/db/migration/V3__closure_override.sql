-- Séance planifiée volontairement pendant une fermeture (jour férié, vacances) :
-- dérogation confirmée par le planificateur, la séance n'est plus signalée en conflit.
alter table schedule_events add column allowed_during_closure boolean not null default false;
