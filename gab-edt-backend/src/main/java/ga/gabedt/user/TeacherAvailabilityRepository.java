package ga.gabedt.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherAvailabilityRepository extends JpaRepository<TeacherAvailability, UUID> {
    List<TeacherAvailability> findByTeacherIdAndDeletedFalse(UUID teacherId);
    void deleteAllByTeacherIdAndDeletedFalse(UUID teacherId);
}
