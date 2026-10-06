package ga.gabedt.user;

import ga.gabedt.auth.JwtUtils;
import ga.gabedt.common.enums.UserRole;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.InstitutionType;
import ga.gabedt.structure.OrgUnitType;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.support.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
class TeacherAvailabilityIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private InstitutionRepository institutionRepository;
    @Autowired private OrganizationalUnitRepository orgUnitRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private StudentRepository studentRepository;

    private Institution school;
    private User admin;
    private Teacher teacher;
    private OrganizationalUnit classA;
    private Subject subject;
    private Room smallRoom;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        school = new Institution();
        school.setName("Lycée " + suffix);
        school.setCode("L-" + suffix);
        school.setType(InstitutionType.LYCEE);
        school = institutionRepository.save(school);

        classA = new OrganizationalUnit();
        classA.setName("Terminale A");
        classA.setType(OrgUnitType.CLASS);
        classA.setInstitution(school);
        classA.setTenantId(school.getId());
        classA = orgUnitRepository.save(classA);

        admin = user("admin-" + suffix, UserRole.SCHOOL_ADMIN);

        User teacherUser = user("prof-" + suffix, UserRole.TEACHER);
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

        smallRoom = new Room();
        smallRoom.setName("Salle 101");
        smallRoom.setCapacity(2);
        smallRoom.setInstitution(school);
        smallRoom.setTenantId(school.getId());
        smallRoom = roomRepository.save(smallRoom);
    }

    @Test
    void setAvailabilityAndBlockSchedulingOutsideSlots() throws Exception {
        // Vacataire présent uniquement le lundi matin et le mercredi
        String slots = """
                [
                  {"dayOfWeek":"MONDAY","startTime":"08:00","endTime":"12:00"},
                  {"dayOfWeek":"WEDNESDAY","startTime":"08:00","endTime":"17:00"}
                ]""";

        mvc.perform(put("/api/v1/teachers/{id}/availabilities", teacher.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON).content(slots))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

        // Relecture
        mvc.perform(get("/api/v1/teachers/{id}/availabilities", teacher.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

        // Planifier un cours le lundi matin → OK
        LocalDate nextMonday = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        postSession(nextMonday, "08:00", "10:00", null)
                .andExpect(status().isOk());

        // Planifier un cours le mardi → refusé (indisponible)
        LocalDate nextTuesday = nextMonday.plusDays(1);
        postSession(nextTuesday, "08:00", "10:00", null)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("indisponible")));

        // Planifier un cours le lundi après-midi (hors du créneau 8h-12h) → refusé
        postSession(nextMonday.plusWeeks(1), "14:00", "16:00", null)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("indisponible")));
    }

    @Test
    void teacherWithoutSlotsCanBeScheduledAnytime() throws Exception {
        // Pas de créneau défini = titulaire, disponible tout le temps
        LocalDate nextThursday = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.THURSDAY));
        postSession(nextThursday, "08:00", "10:00", null)
                .andExpect(status().isOk());
    }

    @Test
    void roomCapacityBlocksWhenTooManyStudents() throws Exception {
        // Créer 3 élèves dans la classe (capacité de la salle = 2)
        for (int i = 0; i < 3; i++) {
            User su = user("eleve-" + i + "-" + UUID.randomUUID().toString().substring(0, 4), UserRole.STUDENT);
            Student s = new Student();
            s.setUser(su);
            s.setStudentNumber("ETU-" + UUID.randomUUID().toString().substring(0, 6));
            s.setInstitution(school);
            s.setTenantId(school.getId());
            s.setOrgUnits(java.util.Set.of(classA));
            studentRepository.save(s);
        }

        LocalDate nextFriday = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.FRIDAY));
        postSession(nextFriday, "08:00", "10:00", smallRoom.getId())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Capacité insuffisante")));
    }

    @Test
    void roomCapacityOkWhenEnoughSpace() throws Exception {
        // 1 élève, capacité 2 → OK
        User su = user("eleve-ok-" + UUID.randomUUID().toString().substring(0, 4), UserRole.STUDENT);
        Student s = new Student();
        s.setUser(su);
        s.setStudentNumber("ETU-OK");
        s.setInstitution(school);
        s.setTenantId(school.getId());
        s.setOrgUnits(java.util.Set.of(classA));
        studentRepository.save(s);

        LocalDate nextFriday = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.FRIDAY));
        postSession(nextFriday, "08:00", "10:00", smallRoom.getId())
                .andExpect(status().isOk());
    }

    // --- helpers ---

    private org.springframework.test.web.servlet.ResultActions postSession(
            LocalDate date, String startTime, String endTime, UUID roomId) throws Exception {
        String roomJson = roomId != null ? "\"" + roomId + "\"" : "null";
        String body = """
                {"subjectId":"%s","teacherId":"%s","orgUnitId":"%s","roomId":%s,\
                "startAt":"%sT%s:00","endAt":"%sT%s:00"}"""
                .formatted(subject.getId(), teacher.getId(), classA.getId(), roomJson,
                        date, startTime, date, endTime);
        return mvc.perform(post("/api/v1/schedule-events")
                .header("Authorization", bearer(admin))
                .contentType(MediaType.APPLICATION_JSON).content(body));
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
}
