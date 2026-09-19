package ga.gabedt.communication.repository;

import ga.gabedt.communication.AcademicEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AcademicEventRepository extends JpaRepository<AcademicEvent, UUID> {
    List<AcademicEvent> findByDeletedFalseOrderByStartDateAsc();
}
