package ga.gabedt.security;

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
import ga.gabedt.timetable.Course;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.enums.PublicationStatus;
import ga.gabedt.timetable.repository.CourseRepository;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Visibilité de l'emploi du temps : brouillons réservés aux gestionnaires, élèves limités
 * à leurs classes (et niveaux parents), enseignants limités à leurs cours, publication.
 */
@AutoConfigureMockMvc
class TimetableVisibilityIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private InstitutionRepository institutionRepository;
    @Autowired private OrganizationalUnitRepository orgUnitRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private ScheduleEventRepository eventRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private Institution school;
    private OrganizationalUnit level;
    private OrganizationalUnit classA;
    private OrganizationalUnit classB;
    private User admin;
    private User studentUser;
    private User teacherUser;
    private Teacher teacher;
    private Teacher otherTeacher;
    private Subject subject;
    private final LocalDate day = LocalDate.of(2030, 3, 4);

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        school = new Institution();
        school.setName("Lycée " + suffix);
        school.setCode("L-" + suffix);
        school.setType(InstitutionType.LYCEE);
        school = institutionRepository.save(school);

        level = orgUnit("Terminale", OrgUnitType.LEVEL, null);
        classA = orgUnit("Terminale A", OrgUnitType.CLASS, level);
        classB = orgUnit("Terminale B", OrgUnitType.CLASS, level);

        admin = user("admin-" + suffix, UserRole.SCHOOL_ADMIN);
        studentUser = user("eleve-" + suffix, UserRole.STUDENT);
        teacherUser = user("prof-" + suffix, UserRole.TEACHER);
        User otherTeacherUser = user("prof2-" + suffix, UserRole.TEACHER);

        teacher = teacher(teacherUser);
        otherTeacher = teacher(otherTeacherUser);

        Student student = new Student();
        student.setUser(studentUser);
        student.setStudentNumber("M-" + suffix);
        student.setInstitution(school);
        student.setTenantId(school.getId());
        student.setOrgUnits(new HashSet<>(Set.of(classA)));
        studentRepository.save(student);

        subject = new Subject();
        subject.setName("Maths");
        subject.setInstitution(school);
        subject.setTenantId(school.getId());
        subject = subjectRepository.save(subject);
    }

    @Test
    void studentSeesOnlyPublishedEventsOfOwnClassAndParentLevel() throws Exception {
        ScheduleEvent ownClass = event(classA, teacher, 8, PublicationStatus.PUBLISHED);
        ScheduleEvent wholeLevel = event(level, teacher, 10, PublicationStatus.PUBLISHED);
        event(classA, teacher, 14, PublicationStatus.DRAFT);           // brouillon : invisible
        event(classB, otherTeacher, 8, PublicationStatus.PUBLISHED);    // autre classe : invisible

        mvc.perform(get("/api/v1/schedule-events")
                        .param("startDate", day.toString()).param("endDate", day.toString())
                        .header("Authorization", bearer(studentUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].id", containsInAnyOrder(ownClass.getId().toString(), wholeLevel.getId().toString())));
    }

    @Test
    void teacherSeesOnlyOwnPublishedEvents() throws Exception {
        ScheduleEvent own = event(classA, teacher, 8, PublicationStatus.PUBLISHED);
        event(classA, teacher, 10, PublicationStatus.DRAFT);
        event(classB, otherTeacher, 8, PublicationStatus.PUBLISHED);

        mvc.perform(get("/api/v1/schedule-events")
                        .param("startDate", day.toString()).param("endDate", day.toString())
                        .header("Authorization", bearer(teacherUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(own.getId().toString()));
    }

    @Test
    void adminSeesDraftsAndPublishingMakesThemVisible() throws Exception {
        event(classA, teacher, 8, PublicationStatus.DRAFT);

        mvc.perform(get("/api/v1/schedule-events")
                        .param("startDate", day.toString()).param("endDate", day.toString())
                        .header("Authorization", bearer(admin)))
                .andExpect(jsonPath("$.data", hasSize(1)));

        mvc.perform(put("/api/v1/schedule-events/publish")
                        .param("orgUnitId", classA.getId().toString())
                        .param("startDate", day.toString()).param("endDate", day.toString())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(1));

        mvc.perform(get("/api/v1/schedule-events")
                        .param("startDate", day.toString()).param("endDate", day.toString())
                        .header("Authorization", bearer(studentUser)))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void studentCannotPublish() throws Exception {
        mvc.perform(put("/api/v1/schedule-events/publish")
                        .param("orgUnitId", classA.getId().toString())
                        .param("startDate", day.toString()).param("endDate", day.toString())
                        .header("Authorization", bearer(studentUser)))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentAndParentCanLogInWithMatricule() throws Exception {
        Student student = studentRepository.findByUserIdAndDeletedFalse(studentUser.getId()).orElseThrow();
        studentUser.setPasswordHash(passwordEncoder.encode("EleveSecret1"));
        userRepository.save(studentUser);
        student.setParentPasswordHash(passwordEncoder.encode("ParentSecret1"));
        studentRepository.save(student);

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/auth/login")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + student.getStudentNumber() + "\",\"password\":\"EleveSecret1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("STUDENT"));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/auth/login")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + student.getStudentNumber() + "\",\"password\":\"ParentSecret1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("PARENT"));
    }

    // --- Données de test ---

    private String bearer(User user) {
        return "Bearer " + jwtUtils.generateToken(user, user.getRole());
    }

    private OrganizationalUnit orgUnit(String name, OrgUnitType type, OrganizationalUnit parent) {
        OrganizationalUnit unit = new OrganizationalUnit();
        unit.setName(name);
        unit.setType(type);
        unit.setInstitution(school);
        unit.setTenantId(school.getId());
        unit.setParent(parent);
        return orgUnitRepository.save(unit);
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

    private Teacher teacher(User user) {
        Teacher t = new Teacher();
        t.setUser(user);
        t.setInstitution(school);
        t.setTenantId(school.getId());
        return teacherRepository.save(t);
    }

    private ScheduleEvent event(OrganizationalUnit unit, Teacher by, int hour, PublicationStatus publication) {
        Course course = new Course();
        course.setSubject(subject);
        course.setTeacher(by);
        course.setInstitution(school);
        course.setOrgUnit(unit);
        course.setTenantId(school.getId());
        course = courseRepository.save(course);

        ScheduleEvent event = new ScheduleEvent();
        event.setCourse(course);
        event.setTeacher(by);
        event.setInstitution(school);
        event.setOrgUnit(unit);
        event.setTenantId(school.getId());
        event.setStartAt(LocalDateTime.of(day, java.time.LocalTime.of(hour, 0)));
        event.setEndAt(LocalDateTime.of(day, java.time.LocalTime.of(hour + 1, 0)));
        event.setPublicationStatus(publication);
        return eventRepository.save(event);
    }
}
