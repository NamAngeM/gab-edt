package ga.gabedt.homework;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomeworkService {

    private final HomeworkRepository homeworkRepository;
    private final HomeworkStatusRepository homeworkStatusRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public HomeworkDto addHomework(UUID eventId, HomeworkDto dto) {
        ScheduleEvent event = scheduleEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));

        Homework homework = new Homework();
        homework.setScheduleEvent(event);
        homework.setTitle(dto.getTitle());
        homework.setDescription(dto.getDescription());
        homeworkRepository.save(homework);

        return new HomeworkDto(homework.getId(), homework.getTitle(), homework.getDescription(), false);
    }

    @Transactional
    public void toggleStatus(UUID homeworkId, boolean completed) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new UnauthorizedAccessException("Not authenticated");

        User user = userRepository.findByEmailAndDeletedFalse(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUserIdAndDeletedFalse(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));

        HomeworkStatus status = homeworkStatusRepository.findByHomeworkIdAndStudentIdAndDeletedFalse(homeworkId, student.getId())
                .orElse(null);

        if (status == null) {
            status = new HomeworkStatus();
            status.setHomework(homework);
            status.setStudent(student);
        }
        status.setCompleted(completed);
        homeworkStatusRepository.save(status);
    }
}
