package ga.gabedt.exam.repository;

import ga.gabedt.exam.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExamRepository extends JpaRepository<Exam, UUID> {
    List<Exam> findBySessionIdAndDeletedFalse(UUID sessionId);
    List<Exam> findByDeletedFalse();

    @Query("SELECT e FROM Exam e WHERE e.deleted = false AND e.startAt < :end AND e.endAt > :start")
    List<Exam> findOverlapping(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Exam e " +
           "WHERE e.deleted = false AND e.room.id = :roomId AND e.startAt < :end AND e.endAt > :start")
    boolean existsOverlappingForRoom(@Param("roomId") UUID roomId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Exam e " +
           "WHERE e.deleted = false AND e.room.id = :roomId AND e.startAt < :end AND e.endAt > :start AND e.id != :excludeId")
    boolean existsOverlappingForRoomExclude(@Param("roomId") UUID roomId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeId") UUID excludeId);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Exam e " +
           "JOIN e.supervisors s WHERE e.deleted = false AND s.id = :teacherId AND e.startAt < :end AND e.endAt > :start")
    boolean existsOverlappingForSupervisor(@Param("teacherId") UUID teacherId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Exam e " +
           "JOIN e.supervisors s WHERE e.deleted = false AND s.id = :teacherId AND e.startAt < :end AND e.endAt > :start AND e.id != :excludeId")
    boolean existsOverlappingForSupervisorExclude(@Param("teacherId") UUID teacherId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeId") UUID excludeId);
}
