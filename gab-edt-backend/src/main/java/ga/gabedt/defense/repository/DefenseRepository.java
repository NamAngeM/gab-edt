package ga.gabedt.defense.repository;

import ga.gabedt.defense.Defense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DefenseRepository extends JpaRepository<Defense, UUID> {
    List<Defense> findByDeletedFalse();

    @Query("SELECT d FROM Defense d WHERE d.deleted = false AND d.startAt < :end AND d.endAt > :start")
    List<Defense> findOverlapping(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Defense d " +
           "WHERE d.deleted = false AND d.room.id = :roomId AND d.startAt < :end AND d.endAt > :start")
    boolean existsOverlappingForRoom(@Param("roomId") UUID roomId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Defense d " +
           "WHERE d.deleted = false AND d.room.id = :roomId AND d.startAt < :end AND d.endAt > :start AND d.id != :excludeId")
    boolean existsOverlappingForRoomExclude(@Param("roomId") UUID roomId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeId") UUID excludeId);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Defense d " +
           "WHERE d.deleted = false AND d.startAt < :end AND d.endAt > :start " +
           "AND (d.president.id = :teacherId OR d.examiner.id = :teacherId OR d.reporter.id = :teacherId)")
    boolean existsOverlappingForJury(@Param("teacherId") UUID teacherId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Defense d " +
           "WHERE d.deleted = false AND d.startAt < :end AND d.endAt > :start " +
           "AND (d.president.id = :teacherId OR d.examiner.id = :teacherId OR d.reporter.id = :teacherId) " +
           "AND d.id != :excludeId")
    boolean existsOverlappingForJuryExclude(@Param("teacherId") UUID teacherId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeId") UUID excludeId);
}
