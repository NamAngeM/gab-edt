package ga.gabedt.timetable.repository;

import ga.gabedt.timetable.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findAllByDeletedFalse();
    List<Course> findByTeacherIdAndDeletedFalse(UUID teacherId);
    List<Course> findByOrgUnitIdAndDeletedFalse(UUID orgUnitId);
    
    Optional<Course> findBySubjectIdAndTeacherIdAndOrgUnitIdAndDeletedFalse(UUID subjectId, UUID teacherId, UUID orgUnitId);
}
