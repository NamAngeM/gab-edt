package ga.gabedt.security;

import ga.gabedt.auth.JwtUtils;
import ga.gabedt.common.enums.UserRole;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.InstitutionType;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.support.AbstractPostgresIntegrationTest;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Vérifie de bout en bout (HTTP → sécurité → Hibernate → PostgreSQL) qu'un établissement
 * ne peut ni lire ni modifier les données d'un autre, et que les rôles sont appliqués.
 */
@AutoConfigureMockMvc
class TenantIsolationIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private InstitutionRepository institutionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    private Institution schoolA;
    private Institution schoolB;
    private User adminA;
    private User studentA;
    private Room roomA;
    private Room roomB;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        schoolA = institution("A-" + suffix);
        schoolB = institution("B-" + suffix);
        adminA = user("admin-a-" + suffix + "@test.ga", UserRole.SCHOOL_ADMIN, schoolA);
        studentA = user("eleve-a-" + suffix + "@test.ga", UserRole.STUDENT, schoolA);
        roomA = room("Salle A " + suffix, schoolA);
        roomB = room("Salle B " + suffix, schoolB);
    }

    @Test
    void adminSeesOnlyOwnInstitutionRooms() throws Exception {
        mvc.perform(get("/api/v1/rooms").header("Authorization", bearer(adminA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].id").value(roomA.getId().toString()));
    }

    @Test
    void adminCannotReadOtherInstitutionRoomById() throws Exception {
        mvc.perform(get("/api/v1/rooms/" + roomB.getId()).header("Authorization", bearer(adminA)))
                .andExpect(status().isNotFound());
    }

    @Test
    void tenantHeaderIsIgnoredForNonSuperAdmin() throws Exception {
        mvc.perform(get("/api/v1/rooms")
                        .header("Authorization", bearer(adminA))
                        .header("X-Tenant-ID", schoolB.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].id").value(roomA.getId().toString()));
    }

    @Test
    void adminCannotDeleteOtherInstitutionRoom() throws Exception {
        mvc.perform(delete("/api/v1/rooms/" + roomB.getId()).header("Authorization", bearer(adminA)))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(403, 404));
        assertThat(roomRepository.findById(roomB.getId())).get().extracting(Room::isDeleted).isEqualTo(false);
    }

    @Test
    void createdRoomBelongsToCallerInstitution() throws Exception {
        mvc.perform(post("/api/v1/rooms")
                        .header("Authorization", bearer(adminA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nouvelle salle\",\"capacity\":30,\"active\":true}"))
                .andExpect(status().isOk());

        assertThat(roomRepository.findAll())
                .filteredOn(r -> "Nouvelle salle".equals(r.getName()))
                .singleElement()
                .extracting(Room::getTenantId)
                .isEqualTo(schoolA.getId());
    }

    @Test
    void institutionListIsLimitedToOwnInstitution() throws Exception {
        mvc.perform(get("/api/v1/institutions").header("Authorization", bearer(adminA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(schoolA.getId().toString()));
    }

    @Test
    void studentCannotUseStaffEndpoints() throws Exception {
        mvc.perform(post("/api/v1/communication/announcements")
                        .header("Authorization", bearer(studentA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"x\",\"content\":\"y\",\"targetAudience\":\"ALL\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/disciplinary-records/all").header("Authorization", bearer(studentA)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/students").header("Authorization", bearer(studentA)))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/exams/sessions")
                        .header("Authorization", bearer(studentA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"S1\",\"startDate\":\"2026-01-10\",\"endDate\":\"2026-01-20\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void anonymousRequestsAreRejectedWith401() throws Exception {
        mvc.perform(get("/api/v1/rooms")).andExpect(status().isUnauthorized());
        mvc.perform(get("/actuator/metrics")).andExpect(status().isUnauthorized());
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void refreshTokenCannotBeUsedAsAccessToken() throws Exception {
        mvc.perform(get("/api/v1/rooms").header("Authorization", "Bearer " + jwtUtils.generateRefreshToken(adminA)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginReturnsTokensForValidCredentials() throws Exception {
        mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + adminA.getEmail() + "\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("SCHOOL_ADMIN"))
                .andExpect(jsonPath("$.data.institutionId").value(schoolA.getId().toString()));
    }

    // --- Données de test (créées hors contexte d'établissement, tenant « racine ») ---

    private String bearer(User user) {
        return "Bearer " + jwtUtils.generateToken(user, user.getRole());
    }

    private Institution institution(String code) {
        Institution institution = new Institution();
        institution.setName("Établissement " + code);
        institution.setCode(code);
        institution.setType(InstitutionType.LYCEE);
        return institutionRepository.save(institution);
    }

    private User user(String email, UserRole role, Institution institution) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName("Test");
        user.setLastName(role.name());
        user.setRole(role);
        user.setInstitutionId(institution.getId());
        user.setPasswordHash(passwordEncoder.encode("Password123!"));
        return userRepository.save(user);
    }

    private Room room(String name, Institution institution) {
        Room room = new Room();
        room.setName(name);
        room.setCapacity(20);
        room.setInstitution(institution);
        room.setTenantId(institution.getId());
        return roomRepository.save(room);
    }
}
