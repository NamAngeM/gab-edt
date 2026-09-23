package ga.gabedt.resource.repository;

import ga.gabedt.resource.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID>, JpaSpecificationExecutor<Room> {
    List<Room> findAllByDeletedFalse();
    long countByDeletedFalse();
    List<Room> findByOrgUnitIdAndDeletedFalse(UUID orgUnitId);
    Optional<Room> findByCodeAndDeletedFalse(String code);

    @Query("SELECT r FROM Room r WHERE r.deleted = false AND r.active = true AND r.id NOT IN (" +
           "SELECT e.room.id FROM ScheduleEvent e WHERE e.deleted = false AND e.room IS NOT NULL " +
           "AND e.startAt < :end AND e.endAt > :start)")
    List<Room> findAvailableRooms(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
