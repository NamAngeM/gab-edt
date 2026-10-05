package ga.gabedt.user.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import ga.gabedt.user.dto.UserCreateDto;
import ga.gabedt.user.dto.UserUpdateDto;
import ga.gabedt.user.dto.UserAdminDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationalUnitRepository orgUnitRepository;
    private final PasswordEncoder passwordEncoder;
    private final ga.gabedt.tenant.CurrentTenant currentTenant;

    @Transactional(readOnly = true)
    public List<UserAdminDto> findAll() {
        java.util.UUID tenantId = ga.gabedt.tenant.TenantContext.getTenantId();
        List<User> users = tenantId != null
                ? userRepository.findAllByInstitutionIdAndDeletedFalse(tenantId)
                : userRepository.findAllByDeletedFalse(); // SUPER_ADMIN sans établissement ciblé
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserAdminDto assignManagedUnits(UUID userId, Set<UUID> orgUnitIds) {
        User user = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        checkUserManagementAccess(user, user.getRole());

        if (orgUnitIds == null || orgUnitIds.isEmpty()) {
            user.getManagedOrgUnits().clear();
        } else {
            List<OrganizationalUnit> units = orgUnitRepository.findAllById(orgUnitIds);
            if (units.size() != orgUnitIds.size()) {
                throw new ResourceNotFoundException("Unité organisationnelle introuvable");
            }
            user.setManagedOrgUnits(units.stream().collect(Collectors.toSet()));
        }

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Transactional
    public UserAdminDto createUser(UserCreateDto dto) {
        checkUserManagementAccess(null, dto.getRole());
        if (userRepository.findByEmailAndDeletedFalse(dto.getEmail()).isPresent()) {
            throw new ga.gabedt.common.exception.BusinessConflictException("USER_EXISTS", "Email already exists");
        }
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setActive(dto.isActive());
        if (dto.getRole() != ga.gabedt.common.enums.UserRole.SUPER_ADMIN) {
            user.setInstitutionId(currentTenant.requireTenantId());
        }

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Transactional
    public UserAdminDto updateUser(UUID id, UserUpdateDto dto) {
        User user = userRepository.findById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        checkUserManagementAccess(user, dto.getRole() != null ? dto.getRole() : user.getRole());

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getActive() != null) user.setActive(dto.getActive());

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    /**
     * Réinitialisation par un administrateur : génère un mot de passe provisoire,
     * renvoyé une seule fois (comptes sans e-mail, ex. élèves connectés par matricule).
     */
    @Transactional
    public String resetPassword(UUID userId) {
        User user = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        checkUserManagementAccess(user, user.getRole());

        String temporaryPassword = ga.gabedt.common.security.PasswordGenerator.generate();
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        userRepository.save(user);
        return temporaryPassword;
    }

    @Transactional
    public void updatePushToken(String token) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new UnauthorizedAccessException("Not authenticated");
        
        User user = userRepository.findByEmailAndDeletedFalse(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setExpoPushToken(token);
        userRepository.save(user);
    }

    private UserAdminDto mapToDto(User user) {
        UserAdminDto dto = new UserAdminDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        
        if (user.getManagedOrgUnits() != null) {
            dto.setManagedOrgUnitIds(user.getManagedOrgUnits().stream()
                    .map(OrganizationalUnit::getId)
                    .collect(Collectors.toSet()));
        }
        return dto;
    }

    private void checkUserManagementAccess(User targetUser, ga.gabedt.common.enums.UserRole newRole) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new UnauthorizedAccessException("Not authenticated");
        
        User currentUser = userRepository.findByEmailAndDeletedFalse(auth.getName())
                .orElseThrow(() -> new UnauthorizedAccessException("User not found"));

        if (currentUser.getRole() == ga.gabedt.common.enums.UserRole.SUPER_ADMIN) return;

        if (currentUser.getRole() == ga.gabedt.common.enums.UserRole.SCHOOL_ADMIN) {
            if (targetUser != null && !java.util.Objects.equals(targetUser.getInstitutionId(), currentUser.getInstitutionId())) {
                throw new UnauthorizedAccessException("Utilisateur d'un autre établissement");
            }
            if (targetUser != null && targetUser.getRole() == ga.gabedt.common.enums.UserRole.SUPER_ADMIN) {
                throw new UnauthorizedAccessException("A SCHOOL_ADMIN cannot modify a SUPER_ADMIN");
            }
            if (newRole == ga.gabedt.common.enums.UserRole.SUPER_ADMIN) {
                throw new UnauthorizedAccessException("A SCHOOL_ADMIN cannot grant SUPER_ADMIN role");
            }
        } else {
            throw new UnauthorizedAccessException("Only admins can manage users");
        }
    }
}
