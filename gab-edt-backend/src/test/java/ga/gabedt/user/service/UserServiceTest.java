package ga.gabedt.user.service;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.BusinessConflictException;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import ga.gabedt.user.dto.UserAdminDto;
import ga.gabedt.user.dto.UserCreateDto;
import ga.gabedt.user.dto.UserUpdateDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationalUnitRepository orgUnitRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserService userService;

    private User superAdmin;
    private User schoolAdmin;
    private User targetUser;
    private UUID targetUserId;

    @BeforeEach
    void setUp() {
        superAdmin = new User();
        superAdmin.setId(UUID.randomUUID());
        superAdmin.setEmail("super@admin.com");
        superAdmin.setRole(UserRole.SUPER_ADMIN);

        schoolAdmin = new User();
        schoolAdmin.setId(UUID.randomUUID());
        schoolAdmin.setEmail("school@admin.com");
        schoolAdmin.setRole(UserRole.SCHOOL_ADMIN);

        targetUserId = UUID.randomUUID();
        targetUser = new User();
        targetUser.setId(targetUserId);
        targetUser.setEmail("target@user.com");
        targetUser.setRole(UserRole.STUDENT);
        targetUser.setManagedOrgUnits(new HashSet<>());
    }

    private void mockSecurityContext(User user) {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(user.getEmail());
        when(userRepository.findByEmailAndDeletedFalse(user.getEmail())).thenReturn(Optional.of(user));
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void findAll_ShouldReturnMappedUsers() {
        when(userRepository.findAllByDeletedFalse()).thenReturn(List.of(targetUser, schoolAdmin));

        List<UserAdminDto> result = userService.findAll();

        assertEquals(2, result.size());
        verify(userRepository, times(1)).findAllByDeletedFalse();
    }

    @Test
    void assignManagedUnits_ShouldUpdateUnits_WhenSuperAdmin() {
        mockSecurityContext(superAdmin);
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(targetUser));
        
        UUID orgUnitId = UUID.randomUUID();
        OrganizationalUnit unit = new OrganizationalUnit();
        unit.setId(orgUnitId);
        when(orgUnitRepository.findAllById(Set.of(orgUnitId))).thenReturn(List.of(unit));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        UserAdminDto result = userService.assignManagedUnits(targetUserId, Set.of(orgUnitId));

        assertNotNull(result);
        assertEquals(1, result.getManagedOrgUnitIds().size());
        assertTrue(result.getManagedOrgUnitIds().contains(orgUnitId));
    }

    @Test
    void createUser_ShouldSaveUser_WhenSuperAdmin() {
        mockSecurityContext(superAdmin);
        UserCreateDto dto = new UserCreateDto();
        dto.setEmail("new@user.com");
        dto.setPassword("pwd");
        dto.setRole(UserRole.TEACHER);

        when(userRepository.findByEmailAndDeletedFalse(dto.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pwd")).thenReturn("encoded_pwd");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        UserAdminDto result = userService.createUser(dto);

        assertNotNull(result);
        assertEquals("new@user.com", result.getEmail());
        assertEquals(UserRole.TEACHER, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void createUser_ShouldThrowException_WhenSchoolAdminCreatesSuperAdmin() {
        mockSecurityContext(schoolAdmin);
        UserCreateDto dto = new UserCreateDto();
        dto.setEmail("new@user.com");
        dto.setRole(UserRole.SUPER_ADMIN);

        assertThrows(UnauthorizedAccessException.class, () -> userService.createUser(dto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUser_ShouldUpdateUserFields() {
        mockSecurityContext(superAdmin);
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        UserUpdateDto dto = new UserUpdateDto();
        dto.setFirstName("NewFirst");
        dto.setRole(UserRole.TEACHER);

        UserAdminDto result = userService.updateUser(targetUserId, dto);

        assertEquals("NewFirst", result.getFirstName());
        assertEquals(UserRole.TEACHER, result.getRole());
    }

    @Test
    void updatePushToken_ShouldUpdateTokenForCurrentUser() {
        mockSecurityContext(targetUser);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        userService.updatePushToken("ExpoToken123");

        assertEquals("ExpoToken123", targetUser.getExpoPushToken());
        verify(userRepository, times(1)).save(targetUser);
    }
}
