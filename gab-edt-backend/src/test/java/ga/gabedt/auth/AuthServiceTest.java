package ga.gabedt.auth;

import ga.gabedt.auth.dto.AuthRequest;
import ga.gabedt.auth.dto.AuthResponse;
import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User mockUser;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        mockUser.setEmail("test@ecole.com");
        mockUser.setPasswordHash("hashedpassword");
        mockUser.setFirstName("John");
        mockUser.setLastName("Doe");
        mockUser.setRole(UserRole.TEACHER);
        mockUser.setActive(true);

        authRequest = new AuthRequest();
        authRequest.setEmail("test@ecole.com");
        authRequest.setPassword("password123");
    }

    @Test
    void login_Success() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(Authentication.class));
        when(userRepository.findByEmailAndDeletedFalse("test@ecole.com"))
                .thenReturn(Optional.of(mockUser));
        when(jwtUtils.generateToken(mockUser)).thenReturn("mocked.jwt.token");

        // Act
        AuthResponse response = authService.login(authRequest);

        // Assert
        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals("test@ecole.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("TEACHER", response.getRole());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmailAndDeletedFalse("test@ecole.com");
        verify(jwtUtils).generateToken(mockUser);
    }

    @Test
    void login_Failure_BadCredentials() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Email ou mot de passe incorrect"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> authService.login(authRequest));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, never()).findByEmailAndDeletedFalse(anyString());
        verify(jwtUtils, never()).generateToken(any());
    }

    @Test
    void login_Failure_UserNotFoundAfterAuth() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(Authentication.class));
        when(userRepository.findByEmailAndDeletedFalse("test@ecole.com"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> authService.login(authRequest));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmailAndDeletedFalse("test@ecole.com");
        verify(jwtUtils, never()).generateToken(any());
    }
}
