package ga.gabedt.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findByScheduleEventIdAndDeletedFalse(UUID scheduleEventId);
    List<Attendance> findByStudentIdAndDeletedFalse(UUID studentId);
}
