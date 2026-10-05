package ga.gabedt.structure.service;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.BusinessConflictException;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.dto.InstitutionCreateDto;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Institution create(InstitutionCreateDto dto) {
        if (institutionRepository.findByCode(dto.code()).isPresent()) {
            throw new BusinessConflictException("INSTITUTION_EXISTS", "Un établissement utilise déjà ce code");
        }
        if (userRepository.existsByEmailAndDeletedFalse(dto.adminEmail())) {
            throw new BusinessConflictException("USER_EXISTS", "Cet email est déjà utilisé");
        }

        Institution institution = new Institution();
        institution.setName(dto.name());
        institution.setCode(dto.code());
        institution.setType(dto.type());
        institution.setCity(dto.city());
        institution.setCountry("GA");
        institution.setTimezone("Africa/Libreville");
        institution = institutionRepository.save(institution);

        User admin = new User();
        admin.setEmail(dto.adminEmail());
        admin.setFirstName(dto.adminFirstName());
        admin.setLastName(dto.adminLastName());
        admin.setRole(UserRole.SCHOOL_ADMIN);
        admin.setInstitutionId(institution.getId());
        admin.setPasswordHash(passwordEncoder.encode(dto.adminPassword()));
        userRepository.save(admin);

        return institution;
    }

    @Transactional
    public Institution setActive(UUID id, boolean active) {
        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Établissement introuvable"));
        institution.setActive(active);
        return institutionRepository.save(institution);
    }
}
