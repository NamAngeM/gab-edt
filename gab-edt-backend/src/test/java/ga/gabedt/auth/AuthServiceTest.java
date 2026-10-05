package ga.gabedt.auth;

import ga.gabedt.auth.dto.AuthRequest;
import ga.gabedt.auth.dto.AuthResponse;
import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.TooManyRequestsException;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.common.security.TokenHasher;
import ga.gabedt.mail.MailService;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private RevokedTokenRepository revokedTokenRepository;
    @Mock private MailService mailService;
    @Mock private JwtUtils jwtUtils;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private InstitutionRepository institutionRepository;

    private final LoginAttemptService loginAttemptService = new LoginAttemptService();
    private AuthService authService;

    private User mockUser;
    private Institution institution;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, studentRepository, passwordResetTokenRepository,
                revokedTokenRepository, loginAttemptService, mailService, jwtUtils, authenticationManager,
                passwordEncoder, institutionRepository);

        institution = new Institution();
        institution.setId(UUID.randomUUID());
        institution.setActive(true);

        mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        mockUser.setEmail("test@ecole.com");
        mockUser.setPasswordHash("hashedpassword");
        mockUser.setFirstName("John");
        mockUser.setLastName("Doe");
        mockUser.setRole(UserRole.TEACHER);
        mockUser.setActive(true);
        mockUser.setInstitutionId(institution.getId());

        authRequest = new AuthRequest();
        authRequest.setEmail("test@ecole.com");
        authRequest.setPassword("password123");
    }

    private void givenValidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(Authentication.class));
        when(userRepository.findByEmailAndDeletedFalse("test@ecole.com")).thenReturn(Optional.of(mockUser));
    }

    @Test
    void login_Success() {
        givenValidCredentials();
        when(institutionRepository.findById(institution.getId())).thenReturn(Optional.of(institution));
        when(jwtUtils.generateToken(mockUser, UserRole.TEACHER)).thenReturn("mocked.jwt.token");
        when(jwtUtils.generateRefreshToken(mockUser, UserRole.TEACHER)).thenReturn("mocked.refresh.token");

        AuthResponse response = authService.login(authRequest);

        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("mocked.refresh.token", response.getRefreshToken());
        assertEquals("Bearer", response.getType());
        assertEquals("TEACHER", response.getRole());
        assertEquals(institution.getId(), response.getInstitutionId());
    }

    @Test
    void login_Failure_BadCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Email ou mot de passe incorrect"));

        assertThrows(BadCredentialsException.class, () -> authService.login(authRequest));
        verify(jwtUtils, never()).generateToken(any(), any());
    }

    @Test
    void login_IsBlocked_AfterRepeatedFailures() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad"));

        for (int i = 0; i < 5; i++) {
            assertThrows(BadCredentialsException.class, () -> authService.login(authRequest));
        }

        assertThrows(TooManyRequestsException.class, () -> authService.login(authRequest));
        verify(authenticationManager, times(5)).authenticate(any());
    }

    @Test
    void login_Failure_UserWithoutInstitution() {
        mockUser.setInstitutionId(null);
        givenValidCredentials();

        assertThrows(UnauthorizedAccessException.class, () -> authService.login(authRequest));
        verify(jwtUtils, never()).generateToken(any(), any());
    }

    @Test
    void login_Failure_SuspendedInstitution() {
        institution.setActive(false);
        givenValidCredentials();
        when(institutionRepository.findById(institution.getId())).thenReturn(Optional.of(institution));

        assertThrows(UnauthorizedAccessException.class, () -> authService.login(authRequest));
    }

    @Test
    void forgotPassword_StoresOnlyTokenHash_AndEmailsLink() {
        when(userRepository.findByEmailAndDeletedFalse("test@ecole.com")).thenReturn(Optional.of(mockUser));

        authService.forgotPassword("test@ecole.com");

        ArgumentCaptor<PasswordResetToken> saved = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(saved.capture());
        ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
        verify(mailService).send(eq("test@ecole.com"), anyString(), body.capture());

        String token = body.getValue().replaceAll("(?s).*token=([A-Za-z0-9_-]+).*", "$1");
        assertNotEquals(token, saved.getValue().getTokenHash());
        assertEquals(TokenHasher.sha256(token), saved.getValue().getTokenHash());
    }

    @Test
    void forgotPassword_UnknownEmail_DoesNothing() {
        when(userRepository.findByEmailAndDeletedFalse("x@y.z")).thenReturn(Optional.empty());

        authService.forgotPassword("x@y.z");

        verifyNoInteractions(passwordResetTokenRepository, mailService);
    }

    @Test
    void refresh_RejectsTokenRevokedByLogout() {
        RevokedToken revoked = new RevokedToken();
        revoked.setRotated(false);
        revoked.setRevokedAt(java.time.LocalDateTime.now());
        when(revokedTokenRepository.findByTokenHash(TokenHasher.sha256("old.refresh"))).thenReturn(Optional.of(revoked));

        assertThrows(UnauthorizedAccessException.class, () -> authService.refresh("old.refresh"));
    }

    @Test
    void refresh_RejectsTokenRotatedLongAgo() {
        RevokedToken revoked = new RevokedToken();
        revoked.setRotated(true);
        revoked.setRevokedAt(java.time.LocalDateTime.now().minusMinutes(5));
        when(revokedTokenRepository.findByTokenHash(TokenHasher.sha256("old.refresh"))).thenReturn(Optional.of(revoked));

        assertThrows(UnauthorizedAccessException.class, () -> authService.refresh("old.refresh"));
    }

    @Test
    void refresh_AcceptsTokenJustRotatedByParallelRequest() {
        RevokedToken revoked = new RevokedToken();
        revoked.setRotated(true);
        revoked.setRevokedAt(java.time.LocalDateTime.now().minusSeconds(2));
        when(revokedTokenRepository.findByTokenHash(TokenHasher.sha256("refresh"))).thenReturn(Optional.of(revoked));
        when(jwtUtils.isRefreshToken("refresh")).thenReturn(true);
        when(jwtUtils.extractUsername("refresh")).thenReturn("test@ecole.com");
        when(userRepository.findByEmailAndDeletedFalse("test@ecole.com")).thenReturn(Optional.of(mockUser));
        when(jwtUtils.isTokenValid("refresh", mockUser)).thenReturn(true);
        when(institutionRepository.findById(institution.getId())).thenReturn(Optional.of(institution));
        when(jwtUtils.generateToken(mockUser, UserRole.TEACHER)).thenReturn("new.access");
        when(jwtUtils.generateRefreshToken(mockUser, UserRole.TEACHER)).thenReturn("new.refresh");

        AuthResponse response = authService.refresh("refresh");

        assertEquals("new.access", response.getToken());
        verify(revokedTokenRepository, never()).save(any());
    }

    @Test
    void logout_PersistsRevocation() {
        when(jwtUtils.extractExpiration("refresh")).thenReturn(new Date(System.currentTimeMillis() + 60_000));

        authService.logout("refresh");

        ArgumentCaptor<RevokedToken> revoked = ArgumentCaptor.forClass(RevokedToken.class);
        verify(revokedTokenRepository).save(revoked.capture());
        assertEquals(TokenHasher.sha256("refresh"), revoked.getValue().getTokenHash());
    }
}
