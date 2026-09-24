package ga.gabedt.auth;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityAclServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationalUnitRepository orgUnitRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ScheduleEventRepository scheduleEventRepository;

    @InjectMocks
    private SecurityAclService securityAclService;

    private User adminUser;
    private User pedagoUser;
    private OrganizationalUnit managedUnit;
    private OrganizationalUnit childUnit;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(UUID.randomUUID());
        adminUser.setEmail("admin@gab.ga");
        adminUser.setRole(UserRole.SCHOOL_ADMIN);

        managedUnit = new OrganizationalUnit();
        managedUnit.setId(UUID.randomUUID());
        
        childUnit = new OrganizationalUnit();
        childUnit.setId(UUID.randomUUID());
        childUnit.setParent(managedUnit);

        pedagoUser = new User();
        pedagoUser.setId(UUID.randomUUID());
        pedagoUser.setEmail("pedago@gab.ga");
        pedagoUser.setRole(UserRole.PEDAGOGICAL_MANAGER);
        pedagoUser.setManagedOrgUnits(Set.of(managedUnit));
    }

    private void mockAuthentication(User user) {
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(user.getEmail());
        SecurityContextHolder.setContext(securityContext);
        when(userRepository.findByEmailAndDeletedFalse(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    void canManage_ShouldReturnTrue_WhenSuperAdmin() {
        mockAuthentication(adminUser);

        boolean result = securityAclService.canManage(UUID.randomUUID());

        assertTrue(result);
    }

    @Test
    void canManage_ShouldReturnTrue_WhenPedagogicalManagerOfUnit() {
        mockAuthentication(pedagoUser);
        when(orgUnitRepository.findById(managedUnit.getId())).thenReturn(Optional.of(managedUnit));

        boolean result = securityAclService.canManage(managedUnit.getId());

        assertTrue(result);
    }

    @Test
    void canManage_ShouldReturnTrue_WhenPedagogicalManagerOfChildUnit() {
        mockAuthentication(pedagoUser);
        when(orgUnitRepository.findById(childUnit.getId())).thenReturn(Optional.of(childUnit));

        boolean result = securityAclService.canManage(childUnit.getId());

        assertTrue(result);
    }

    @Test
    void canManage_ShouldReturnFalse_WhenNotManagerOfUnit() {
        mockAuthentication(pedagoUser);
        
        OrganizationalUnit otherUnit = new OrganizationalUnit();
        otherUnit.setId(UUID.randomUUID());
        when(orgUnitRepository.findById(otherUnit.getId())).thenReturn(Optional.of(otherUnit));

        boolean result = securityAclService.canManage(otherUnit.getId());

        assertFalse(result);
    }

    @Test
    void canManageRoom_ShouldReturnTrue_WhenManagerOfRoomOrgUnit() {
        mockAuthentication(pedagoUser);
        
        Room room = new Room();
        room.setId(UUID.randomUUID());
        room.setOrgUnit(managedUnit);
        
        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));
        when(orgUnitRepository.findById(managedUnit.getId())).thenReturn(Optional.of(managedUnit));

        boolean result = securityAclService.canManageRoom(room.getId());

        assertTrue(result);
    }

    @Test
    void canManageEvent_ShouldReturnTrue_WhenTeacherOfEvent() {
        User teacherUser = new User();
        teacherUser.setId(UUID.randomUUID());
        teacherUser.setEmail("teacher@gab.ga");
        teacherUser.setRole(UserRole.TEACHER);

        mockAuthentication(teacherUser);

        Teacher teacher = new Teacher();
        teacher.setId(UUID.randomUUID());
        teacher.setUser(teacherUser);

        ScheduleEvent event = new ScheduleEvent();
        event.setId(UUID.randomUUID());
        event.setTeacher(teacher);

        when(scheduleEventRepository.findById(event.getId())).thenReturn(Optional.of(event));

        boolean result = securityAclService.canManageEvent(event.getId());

        assertTrue(result);
    }
}
