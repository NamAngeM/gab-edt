package ga.gabedt.communication.repository;

import ga.gabedt.communication.AcademicEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AcademicEventRepository extends JpaRepository<AcademicEvent, UUID> {
    List<AcademicEvent> findByDeletedFalseOrderByStartDateAsc();

    /** Fermetures (jours fériés, vacances) qui chevauchent la plage donnée. */
    @org.springframework.data.jpa.repository.Query("SELECT e FROM AcademicEvent e WHERE e.deleted = false AND e.holiday = true " +
           "AND e.startDate < :end AND e.endDate > :start ORDER BY e.startDate")
    List<AcademicEvent> findClosuresOverlapping(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
                                                @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}
