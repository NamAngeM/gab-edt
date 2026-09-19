package ga.gabedt.user.service;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import ga.gabedt.user.dto.TeacherAdminDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final OrganizationalUnitRepository organizationalUnitRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<TeacherAdminDto> findAll(UUID orgUnitId, String search, Boolean active, Pageable pageable) {
        Specification<Teacher> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));

            if (orgUnitId != null) {
                Join<Teacher, OrganizationalUnit> orgUnits = root.join("orgUnits");
                predicates.add(cb.equal(orgUnits.get("id"), orgUnitId));
            }
            if (active != null) {
                Join<Teacher, User> user = root.join("user");
                predicates.add(cb.equal(user.get("active"), active));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Join<Teacher, User> user = root.join("user");
                predicates.add(cb.or(
                        cb.like(cb.lower(user.get("firstName")), pattern),
                        cb.like(cb.lower(user.get("lastName")), pattern),
                        cb.like(cb.lower(user.get("email")), pattern),
                        cb.like(cb.lower(root.get("employeeNumber")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return teacherRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public TeacherAdminDto findById(UUID id) {
        Teacher teacher = teacherRepository.findById(id)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        return mapToDto(teacher);
    }

    public TeacherAdminDto create(TeacherAdminDto dto) {
        // 1. Create User
        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setActive(dto.isActive());
        user.setRole(UserRole.TEACHER);
        // Default password for auto-created accounts
        user.setPasswordHash(passwordEncoder.encode("Teacher123!"));
        User savedUser = userRepository.save(user);

        // 2. Create Teacher
        Teacher teacher = new Teacher();
        teacher.setUser(savedUser);
        teacher.setEmployeeNumber(dto.getEmployeeNumber());

        // Minimal institution for now
        Institution inst = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No Institution available"));
        teacher.setInstitution(inst);
        teacher.setTenantId(inst.getId());

        if (dto.getOrgUnitIds() != null && !dto.getOrgUnitIds().isEmpty()) {
            java.util.Set<OrganizationalUnit> orgUnits = new java.util.HashSet<>(
                organizationalUnitRepository.findAllById(dto.getOrgUnitIds())
            );
            teacher.setOrgUnits(orgUnits);
        }

        Teacher savedTeacher = teacherRepository.save(teacher);
        return mapToDto(savedTeacher);
    }

    public TeacherAdminDto update(UUID id, TeacherAdminDto dto) {
        Teacher teacher = teacherRepository.findById(id)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));

        User user = teacher.getUser();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setActive(dto.isActive());
        userRepository.save(user);

        teacher.setEmployeeNumber(dto.getEmployeeNumber());

        if (dto.getOrgUnitIds() != null && !dto.getOrgUnitIds().isEmpty()) {
            java.util.Set<OrganizationalUnit> orgUnits = new java.util.HashSet<>(
                organizationalUnitRepository.findAllById(dto.getOrgUnitIds())
            );
            teacher.setOrgUnits(orgUnits);
        } else {
            teacher.getOrgUnits().clear();
        }

        Teacher savedTeacher = teacherRepository.save(teacher);
        return mapToDto(savedTeacher);
    }

    public void delete(UUID id) {
        Teacher teacher = teacherRepository.findById(id)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        
        teacher.setDeleted(true);
        teacherRepository.save(teacher);
        
        User user = teacher.getUser();
        user.setDeleted(true);
        userRepository.save(user);
    }

    public void bulkDelete(List<UUID> ids) {
        List<Teacher> teachers = teacherRepository.findAllById(ids);
        for (Teacher t : teachers) {
            t.setDeleted(true);
            t.getUser().setDeleted(true);
        }
        teacherRepository.saveAll(teachers);
    }

    public void bulkUpdateStatus(List<UUID> ids, boolean active) {
        List<Teacher> teachers = teacherRepository.findAllById(ids);
        for (Teacher t : teachers) {
            t.getUser().setActive(active);
        }
        teacherRepository.saveAll(teachers);
    }

    public int importCsv(MultipartFile file) {
        int count = 0;
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build())) {

            List<Teacher> teachersToSave = new ArrayList<>();
            List<User> usersToSave = new ArrayList<>();
            
            Institution inst = institutionRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No Institution available"));

            for (CSVRecord record : csvParser) {
                String email = record.isSet("Email") ? record.get("Email").trim() : (record.isSet("email") ? record.get("email").trim() : null);
                if (email == null || email.isEmpty()) continue;
                
                if (userRepository.findByEmailAndDeletedFalse(email).isPresent()) continue;

                User user = new User();
                user.setFirstName(record.isSet("Prenom") ? record.get("Prenom") : (record.isSet("firstName") ? record.get("firstName") : ""));
                user.setLastName(record.isSet("Nom") ? record.get("Nom") : (record.isSet("lastName") ? record.get("lastName") : ""));
                user.setEmail(email);
                user.setPhone(record.isSet("Telephone") ? record.get("Telephone") : (record.isSet("phone") ? record.get("phone") : null));
                
                boolean isActive = record.isSet("Statut") ? "Actif".equalsIgnoreCase(record.get("Statut")) : true;
                user.setActive(isActive);
                user.setRole(UserRole.TEACHER);
                user.setPasswordHash(passwordEncoder.encode("Teacher123!"));
                
                Teacher teacher = new Teacher();
                teacher.setUser(user);
                teacher.setEmployeeNumber(record.isSet("Matricule") ? record.get("Matricule") : (record.isSet("employeeNumber") ? record.get("employeeNumber") : ""));
                teacher.setInstitution(inst);
                teacher.setTenantId(inst.getId());
                
                usersToSave.add(user);
                teachersToSave.add(teacher);
                count++;
            }
            
            userRepository.saveAll(usersToSave);
            teacherRepository.saveAll(teachersToSave);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'analyse du fichier CSV: " + e.getMessage());
        }
        return count;
    }

    private TeacherAdminDto mapToDto(Teacher teacher) {
        TeacherAdminDto dto = new TeacherAdminDto();
        dto.setId(teacher.getId());
        dto.setFirstName(teacher.getUser().getFirstName());
        dto.setLastName(teacher.getUser().getLastName());
        dto.setEmail(teacher.getUser().getEmail());
        dto.setPhone(teacher.getUser().getPhone());
        dto.setActive(teacher.getUser().isActive());
        dto.setEmployeeNumber(teacher.getEmployeeNumber());
        if (teacher.getOrgUnits() != null && !teacher.getOrgUnits().isEmpty()) {
            dto.setOrgUnitIds(teacher.getOrgUnits().stream()
                    .map(OrganizationalUnit::getId)
                    .collect(Collectors.toList()));
        } else {
            dto.setOrgUnitIds(new java.util.ArrayList<>());
        }
        return dto;
    }
}
