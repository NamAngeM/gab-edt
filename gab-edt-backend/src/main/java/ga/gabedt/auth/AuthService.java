package ga.gabedt.auth;

import ga.gabedt.auth.dto.AuthRequest;
import ga.gabedt.auth.dto.AuthResponse;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest request) {
        String identifier = request.getEmail();
        String rawPassword = request.getPassword();

        if (identifier != null && !identifier.contains("@")) {
            // Identifier is likely a matricule (Student Number)
            Optional<Student> studentOpt = studentRepository.findByStudentNumberAndDeletedFalse(identifier);
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                User user = student.getUser();
                boolean isStudent = passwordEncoder.matches(rawPassword, user.getPasswordHash());
                boolean isParent = student.getParentPasswordHash() != null && passwordEncoder.matches(rawPassword, student.getParentPasswordHash());

                if (isStudent || isParent) {
                    ga.gabedt.common.enums.UserRole effectiveRole = isParent ? ga.gabedt.common.enums.UserRole.PARENT : ga.gabedt.common.enums.UserRole.STUDENT;
                    // Temporary update the role in memory to generate token correctly
                    ga.gabedt.common.enums.UserRole originalRole = user.getRole();
                    user.setRole(effectiveRole);
                    
                    String jwt = jwtUtils.generateToken(user);
                    
                    user.setRole(originalRole); // Revert
                    
                    return AuthResponse.builder()
                            .token(jwt)
                            .type("Bearer")
                            .email(identifier) // Or user.getEmail()
                            .firstName(user.getFirstName())
                            .lastName(isParent ? (user.getLastName() + " (Parent)") : user.getLastName())
                            .role(effectiveRole.name())
                            .build();
                }
            }
            throw new BadCredentialsException("Matricule ou mot de passe incorrect");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        }

        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", request.getEmail()));

        String jwt = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }
}
