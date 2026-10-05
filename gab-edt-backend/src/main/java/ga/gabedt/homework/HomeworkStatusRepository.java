package ga.gabedt.homework;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeworkStatusRepository extends JpaRepository<HomeworkStatus, UUID> {
    Optional<HomeworkStatus> findByHomeworkIdAndStudentIdAndDeletedFalse(UUID homeworkId, UUID studentId);

    java.util.List<HomeworkStatus> findByStudentIdAndHomeworkIdInAndDeletedFalse(UUID studentId, java.util.Collection<UUID> homeworkIds);
}
