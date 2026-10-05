package ga.gabedt.timetable;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ga.gabedt.auth.JwtUtils;
import ga.gabedt.common.enums.UserRole;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.InstitutionType;
import ga.gabedt.structure.OrgUnitType;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.support.AbstractPostgresIntegrationTest;
import ga.gabedt.timetable.enums.EventStatus;
import ga.gabedt.timetable.enums.PublicationStatus;
import ga.gabedt.timetable.repository.CourseRepository;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Répartition des enseignements, suivi du volume horaire et rattrapages, de bout en bout.
 */
@AutoConfigureMockMvc
class TeachingPlanIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper json;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private InstitutionRepository institutionRepository;
    @Autowired private OrganizationalUnitRepository orgUnitRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private ScheduleEventRepository eventRepository;

    private Institution school;
    private OrganizationalUnit classA;
    private User admin;
    private User teacherUser;
    private User studentUser;
    private Teacher teacher;
    private Subject subject;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        school = new Institution();
        school.setName("Lycée " + suffix);
        school.setCode("T-" + suffix);
        school.setType(InstitutionType.LYCEE);
        school = institutionRepository.save(school);

        classA = new OrganizationalUnit();
        classA.setName("Terminale A");
        classA.setType(OrgUnitType.CLASS);
        classA.setInstitution(school);
        classA.setTenantId(school.getId());
        classA = orgUnitRepository.save(classA);

        admin = user("admin-" + suffix, UserRole.SCHOOL_ADMIN);
        teacherUser = user("prof-" + suffix, UserRole.TEACHER);
        studentUser = user("eleve-" + suffix, UserRole.STUDENT);

        teacher = new Teacher();
        teacher.setUser(teacherUser);
        teacher.setInstitution(school);
        teacher.setTenantId(school.getId());
        teacher = teacherRepository.save(teacher);

        subject = new Subject();
        subject.setName("Philosophie");
        subject.setInstitution(school);
        subject.setTenantId(school.getId());
        subject = subjectRepository.save(subject);
    }

    @Test
    void plannedDoneCancelledAndMakeUpHoursAreTracked() throws Exception {
        // 1. L'admin répartit l'enseignement : 10 h prévues
        String created = mvc.perform(post("/api/v1/courses")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"subjectId\":\"%s\",\"teacherId\":\"%s\",\"orgUnitId\":\"%s\",\"plannedHours\":10}"
                                .formatted(subject.getId(), teacher.getId(), classA.getId())))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        UUID courseId = UUID.fromString(json.readTree(created).at("/data/id").asText());
        Course course = courseRepository.findById(courseId).orElseThrow();

        // Doublon refusé
        mvc.perform(post("/api/v1/courses")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"subjectId\":\"%s\",\"teacherId\":\"%s\",\"orgUnitId\":\"%s\"}"
                                .formatted(subject.getId(), teacher.getId(), classA.getId())))
                .andExpect(status().isConflict());

        // 2. Séances : 2 h réalisées, 2 h à venir, 2 h annulées (grève)
        LocalDateTime past = LocalDateTime.now().minusDays(7).withHour(8).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime future = LocalDateTime.now().plusDays(7).withHour(8).withMinute(0).withSecond(0).withNano(0);
        event(course, past, EventStatus.SCHEDULED);
        event(course, future, EventStatus.SCHEDULED);
        ScheduleEvent cancelled = event(course, future.plusDays(1), EventStatus.CANCELLED);

        JsonNode summary = summary();
        assertThat(summary.get("plannedHours").asDouble()).isEqualTo(10.0);
        assertThat(summary.get("scheduledHours").asDouble()).isEqualTo(4.0);
        assertThat(summary.get("doneHours").asDouble()).isEqualTo(2.0);
        assertThat(summary.get("cancelledHours").asDouble()).isEqualTo(2.0);
        assertThat(summary.get("toMakeUpHours").asDouble()).isEqualTo(2.0);
        assertThat(summary.get("remainingHours").asDouble()).isEqualTo(6.0);

        mvc.perform(get("/api/v1/schedule-events/to-make-up").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(cancelled.getId().toString()));

        // 3. Rattrapage posé sur le créneau même de la séance annulée (qui ne bloque plus le créneau)
        String makeUp = """
                {"subjectId":"%s","teacherId":"%s","orgUnitId":"%s","startAt":"%s","endAt":"%s","makeUpOfId":"%s"}"""
                .formatted(subject.getId(), teacher.getId(), classA.getId(),
                        cancelled.getStartAt(), cancelled.getEndAt(), cancelled.getId());
        mvc.perform(post("/api/v1/schedule-events")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(makeUp))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.makeUpOfId").value(cancelled.getId().toString()));

        mvc.perform(get("/api/v1/schedule-events/to-make-up").header("Authorization", bearer(admin)))
                .andExpect(jsonPath("$.data", hasSize(0)));
        summary = summary();
        assertThat(summary.get("madeUpHours").asDouble()).isEqualTo(2.0);
        assertThat(summary.get("toMakeUpHours").asDouble()).isEqualTo(0.0);

        // Un second rattrapage de la même séance est refusé
        mvc.perform(post("/api/v1/schedule-events")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(makeUp.replace(cancelled.getStartAt().toString(), cancelled.getStartAt().plusDays(1).toString())
                                .replace(cancelled.getEndAt().toString(), cancelled.getEndAt().plusDays(1).toString())))
                .andExpect(status().isConflict());

        // 4. L'enseignant consulte son volume horaire ; un élève n'a pas accès à la répartition
        mvc.perform(get("/api/v1/courses/mine").header("Authorization", bearer(teacherUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].plannedHours").value(10.0));
        mvc.perform(get("/api/v1/courses").header("Authorization", bearer(studentUser)))
                .andExpect(status().isForbidden());
    }

    @Test
    void onlyCancelledSessionsCanBeMadeUp() throws Exception {
        Course course = new Course();
        course.setSubject(subject);
        course.setTeacher(teacher);
        course.setInstitution(school);
        course.setOrgUnit(classA);
        course.setTenantId(school.getId());
        course = courseRepository.save(course);
        LocalDateTime slot = LocalDateTime.now().plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0);
        ScheduleEvent active = event(course, slot, EventStatus.SCHEDULED);

        mvc.perform(post("/api/v1/schedule-events")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"subjectId":"%s","teacherId":"%s","orgUnitId":"%s","startAt":"%s","endAt":"%s","makeUpOfId":"%s"}"""
                                .formatted(subject.getId(), teacher.getId(), classA.getId(),
                                        slot.plusDays(1), slot.plusDays(1).plusHours(2), active.getId())))
                .andExpect(status().isConflict());
    }

    // --- Données de test ---

    private JsonNode summary() throws Exception {
        String body = mvc.perform(get("/api/v1/courses")
                        .param("orgUnitId", classA.getId().toString())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode data = json.readTree(body).get("data");
        assertThat(data).hasSize(1);
        return data.get(0);
    }

    private String bearer(User user) {
        return "Bearer " + jwtUtils.generateToken(user, user.getRole());
    }

    private User user(String prefix, UserRole role) {
        User user = new User();
        user.setEmail(prefix + "@test.ga");
        user.setFirstName("Test");
        user.setLastName(role.name());
        user.setRole(role);
        user.setInstitutionId(school.getId());
        user.setPasswordHash("x");
        return userRepository.save(user);
    }

    private ScheduleEvent event(Course course, LocalDateTime start, EventStatus status) {
        ScheduleEvent event = new ScheduleEvent();
        event.setCourse(course);
        event.setTeacher(teacher);
        event.setInstitution(school);
        event.setOrgUnit(classA);
        event.setTenantId(school.getId());
        event.setStartAt(start);
        event.setEndAt(start.plusHours(2));
        event.setStatus(status);
        event.setPublicationStatus(PublicationStatus.PUBLISHED);
        return eventRepository.save(event);
    }
}
