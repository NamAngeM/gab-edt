package ga.gabedt.academic;

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
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Calendrier de l'établissement : années, périodes, jours fériés, blocage de la planification.
 */
@AutoConfigureMockMvc
class AcademicCalendarIntegrationTest extends AbstractPostgresIntegrationTest {

    private static final String YEAR_2030 = """
            {"name":"2029-2030","startDate":"2029-10-01","endDate":"2030-07-31","periods":[
              {"name":"Semestre 1","periodType":"SEMESTER","startDate":"2029-10-01","endDate":"2030-02-15"},
              {"name":"Semestre 2","periodType":"SEMESTER","startDate":"2030-02-16","endDate":"2030-07-31"}]}""";

    @Autowired private MockMvc mvc;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private InstitutionRepository institutionRepository;
    @Autowired private OrganizationalUnitRepository orgUnitRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SubjectRepository subjectRepository;

    private Institution school;
    private User admin;
    private User teacherUser;
    private OrganizationalUnit classA;
    private Teacher teacher;
    private Subject subject;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        school = new Institution();
        school.setName("Collège " + suffix);
        school.setCode("C-" + suffix);
        school.setType(InstitutionType.COLLEGE);
        school = institutionRepository.save(school);

        classA = new OrganizationalUnit();
        classA.setName("3e A");
        classA.setType(OrgUnitType.CLASS);
        classA.setInstitution(school);
        classA.setTenantId(school.getId());
        classA = orgUnitRepository.save(classA);

        admin = user("admin-" + suffix, UserRole.SCHOOL_ADMIN);
        teacherUser = user("prof-" + suffix, UserRole.TEACHER);
        teacher = new Teacher();
        teacher.setUser(teacherUser);
        teacher.setInstitution(school);
        teacher.setTenantId(school.getId());
        teacher = teacherRepository.save(teacher);

        subject = new Subject();
        subject.setName("Histoire");
        subject.setInstitution(school);
        subject.setTenantId(school.getId());
        subject = subjectRepository.save(subject);
    }

    @Test
    void createsYearWithPeriodsAndRejectsInconsistentOnes() throws Exception {
        postJson("/api/v1/academic-years", YEAR_2030).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.periods", hasSize(2)))
                .andExpect(jsonPath("$.data.institutionId").value(school.getId().toString()));

        // Chevauchement avec l'année existante
        postJson("/api/v1/academic-years", YEAR_2030.replace("2029-2030", "Doublon")).andExpect(status().isConflict());
        // Période hors de l'année
        postJson("/api/v1/academic-years", """
                {"name":"2031","startDate":"2031-01-01","endDate":"2031-06-30","periods":[
                  {"name":"S1","periodType":"SEMESTER","startDate":"2030-12-01","endDate":"2031-03-01"}]}""")
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/v1/academic-years").header("Authorization", bearer(admin)))
                .andExpect(jsonPath("$.data", hasSize(1)));
        // Un enseignant ne peut pas modifier le calendrier
        mvc.perform(post("/api/v1/academic-years").header("Authorization", bearer(teacherUser))
                        .contentType(MediaType.APPLICATION_JSON).content(YEAR_2030))
                .andExpect(status().isForbidden());
    }

    @Test
    void publicHolidaysBlockSchedulingUnlessExplicitlyAllowed() throws Exception {
        postJson("/api/v1/academic-years", YEAR_2030).andExpect(status().isOk());
        mvc.perform(post("/api/v1/academic-years/public-holidays").param("year", "2030")
                        .header("Authorization", bearer(admin)))
                .andExpect(jsonPath("$.data").value(10));
        // Idempotent
        mvc.perform(post("/api/v1/academic-years/public-holidays").param("year", "2030")
                        .header("Authorization", bearer(admin)))
                .andExpect(jsonPath("$.data").value(0));

        // 1er mai 2030 : fermé
        postJson("/api/v1/schedule-events", session("2030-05-01T08:00:00", "2030-05-01T10:00:00", false))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CLOSED_PERIOD"));
        // Dérogation confirmée (ex. rattrapage) : acceptée et non signalée ensuite en conflit
        postJson("/api/v1/schedule-events", session("2030-05-01T08:00:00", "2030-05-01T10:00:00", true))
                .andExpect(status().isOk());
        // Hors de l'année académique
        postJson("/api/v1/schedule-events", session("2030-09-10T08:00:00", "2030-09-10T10:00:00", false))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CLOSED_PERIOD"));
        // Jour ordinaire
        postJson("/api/v1/schedule-events", session("2030-05-02T08:00:00", "2030-05-02T10:00:00", false))
                .andExpect(status().isOk());
    }

    @Test
    void closureAddedAfterSchedulingIsReportedAsConflict() throws Exception {
        java.time.LocalDate day = java.time.LocalDate.now().plusDays(10);
        postJson("/api/v1/schedule-events", session(day + "T08:00:00", day + "T10:00:00", false))
                .andExpect(status().isOk());

        // Fermeture exceptionnelle décidée après coup (ex. grève, examen national)
        postJson("/api/v1/communication/events", """
                {"title":"Fermeture exceptionnelle","startDate":"%sT00:00:00","endDate":"%sT00:00:00","holiday":true}"""
                .formatted(day, day.plusDays(1)))
                .andExpect(status().isOk());

        mvc.perform(get("/api/v1/schedule-events/conflicts").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].conflictDetails", hasItem(org.hamcrest.Matchers.containsString("Fermeture exceptionnelle"))));
    }

    // --- Données de test ---

    private String session(String start, String end, boolean allowDuringClosure) {
        return """
                {"subjectId":"%s","teacherId":"%s","orgUnitId":"%s","startAt":"%s","endAt":"%s","allowDuringClosure":%s}"""
                .formatted(subject.getId(), teacher.getId(), classA.getId(), start, end, allowDuringClosure);
    }

    private ResultActions postJson(String url, String body) throws Exception {
        return mvc.perform(post(url).header("Authorization", bearer(admin))
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
