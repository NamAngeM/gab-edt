package ga.gabedt.homework;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
    List<Homework> findByScheduleEventIdAndDeletedFalse(UUID scheduleEventId);
    Optional<Homework> findByScheduleEventIdAndDeletedFalseOrderByIdDesc(UUID scheduleEventId);
}
