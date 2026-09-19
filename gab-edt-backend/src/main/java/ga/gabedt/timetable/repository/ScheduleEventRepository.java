package ga.gabedt.timetable.repository;

import ga.gabedt.timetable.ScheduleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, UUID> {
    List<ScheduleEvent> findAllByDeletedFalse();
    
    // Recherche par plage de dates
    List<ScheduleEvent> findByStartAtBetweenAndDeletedFalse(LocalDateTime start, LocalDateTime end);
    
    // Recherche par groupe / classe (orgUnit)
    List<ScheduleEvent> findByOrgUnitIdAndDeletedFalse(UUID orgUnitId);
    
    // Recherche par enseignant
    List<ScheduleEvent> findByTeacherIdAndDeletedFalse(UUID teacherId);
    
    // Recherche par salle
    List<ScheduleEvent> findByRoomIdAndDeletedFalse(UUID roomId);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM ScheduleEvent e " +
           "WHERE e.deleted = false " +
           "AND e.teacher.id = :teacherId " +
           "AND e.startAt < :end " +
           "AND e.endAt > :start " +
           "AND e.id != :excludeId")
    boolean existsOverlappingForTeacherWithExclude(@Param("teacherId") UUID teacherId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeId") UUID excludeId);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM ScheduleEvent e " +
           "WHERE e.deleted = false " +
           "AND e.teacher.id = :teacherId " +
           "AND e.startAt < :end " +
           "AND e.endAt > :start")
    boolean existsOverlappingForTeacher(@Param("teacherId") UUID teacherId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM ScheduleEvent e " +
           "WHERE e.deleted = false " +
           "AND e.room.id = :roomId " +
           "AND e.startAt < :end " +
           "AND e.endAt > :start " +
           "AND e.id != :excludeId")
    boolean existsOverlappingForRoomWithExclude(@Param("roomId") UUID roomId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeId") UUID excludeId);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM ScheduleEvent e " +
           "WHERE e.deleted = false " +
           "AND e.room.id = :roomId " +
           "AND e.startAt < :end " +
           "AND e.endAt > :start")
    boolean existsOverlappingForRoom(@Param("roomId") UUID roomId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM ScheduleEvent e " +
           "WHERE e.deleted = false " +
           "AND e.orgUnit.id = :orgUnitId " +
           "AND e.startAt < :end " +
           "AND e.endAt > :start " +
           "AND e.id != :excludeId")
    boolean existsOverlappingForOrgUnitWithExclude(@Param("orgUnitId") UUID orgUnitId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeId") UUID excludeId);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM ScheduleEvent e " +
           "WHERE e.deleted = false " +
           "AND e.orgUnit.id = :orgUnitId " +
           "AND e.startAt < :end " +
           "AND e.endAt > :start")
    boolean existsOverlappingForOrgUnit(@Param("orgUnitId") UUID orgUnitId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
