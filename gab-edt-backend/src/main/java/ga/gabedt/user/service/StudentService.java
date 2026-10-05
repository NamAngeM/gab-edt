package ga.gabedt.user.service;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import ga.gabedt.user.dto.StudentAdminDto;
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
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final OrganizationalUnitRepository organizationalUnitRepository;
    private final ga.gabedt.tenant.CurrentTenant currentTenant;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<StudentAdminDto> findAll(UUID orgUnitId, String search, Boolean active, Pageable pageable) {
        Specification<Student> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));

            if (orgUnitId != null) {
                Join<Student, OrganizationalUnit> orgUnits = root.join("orgUnits");
                predicates.add(cb.equal(orgUnits.get("id"), orgUnitId));
            }
            if (active != null) {
                Join<Student, User> user = root.join("user");
                predicates.add(cb.equal(user.get("active"), active));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Join<Student, User> user = root.join("user");
                predicates.add(cb.or(
                        cb.like(cb.lower(user.get("firstName")), pattern),
                        cb.like(cb.lower(user.get("lastName")), pattern),
                        cb.like(cb.lower(user.get("email")), pattern),
                        cb.like(cb.lower(root.get("studentNumber")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return studentRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public StudentAdminDto findById(UUID id) {
        Student student = studentRepository.findById(id)
                .filter(s -> !s.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToDto(student);
    }

    public StudentAdminDto create(StudentAdminDto dto) {
        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setActive(dto.isActive());
        user.setRole(UserRole.STUDENT);
        user.setInstitutionId(currentTenant.requireTenantId());
        String initialPassword = ga.gabedt.common.security.PasswordGenerator.generate();
        user.setPasswordHash(passwordEncoder.encode(initialPassword));
        User savedUser = userRepository.save(user);

        Student student = new Student();
        student.setUser(savedUser);
        student.setStudentNumber(dto.getStudentNumber());

        Institution inst = currentTenant.requireInstitution();
        student.setInstitution(inst);
        student.setTenantId(inst.getId());

        if (dto.getOrgUnitIds() != null && !dto.getOrgUnitIds().isEmpty()) {
            java.util.Set<OrganizationalUnit> orgUnits = new java.util.HashSet<>(
                organizationalUnitRepository.findAllById(dto.getOrgUnitIds())
            );
            student.setOrgUnits(orgUnits);
        }

        Student savedStudent = studentRepository.save(student);
        StudentAdminDto result = mapToDto(savedStudent);
        result.setInitialPassword(initialPassword);
        return result;
    }

    public StudentAdminDto update(UUID id, StudentAdminDto dto) {
        Student student = studentRepository.findById(id)
                .filter(s -> !s.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        User user = student.getUser();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setActive(dto.isActive());
        userRepository.save(user);

        student.setStudentNumber(dto.getStudentNumber());

        if (dto.getOrgUnitIds() != null && !dto.getOrgUnitIds().isEmpty()) {
            java.util.Set<OrganizationalUnit> orgUnits = new java.util.HashSet<>(
                organizationalUnitRepository.findAllById(dto.getOrgUnitIds())
            );
            student.setOrgUnits(orgUnits);
        } else {
            student.getOrgUnits().clear();
        }

        Student savedStudent = studentRepository.save(student);
        return mapToDto(savedStudent);
    }

    public void delete(UUID id) {
        Student student = studentRepository.findById(id)
                .filter(s -> !s.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        
        student.setDeleted(true);
        studentRepository.save(student);
        
        User user = student.getUser();
        user.setDeleted(true);
        userRepository.save(user);
    }

    public void bulkDelete(List<UUID> ids) {
        List<Student> students = studentRepository.findAllById(ids);
        for (Student s : students) {
            s.setDeleted(true);
            s.getUser().setDeleted(true);
        }
        studentRepository.saveAll(students);
    }

    public void bulkUpdateStatus(List<UUID> ids, boolean active) {
        List<Student> students = studentRepository.findAllById(ids);
        for (Student s : students) {
            s.getUser().setActive(active);
        }
        studentRepository.saveAll(students);
    }

    public int importCsv(MultipartFile file) {
        int count = 0;
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build())) {

            List<Student> studentsToSave = new ArrayList<>();
            List<User> usersToSave = new ArrayList<>();
            
            Institution inst = currentTenant.requireInstitution();

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
                user.setRole(UserRole.STUDENT);
                user.setInstitutionId(currentTenant.requireTenantId());
                user.setPasswordHash(passwordEncoder.encode(ga.gabedt.common.security.PasswordGenerator.generate()));
                
                Student student = new Student();
                student.setUser(user);
                student.setStudentNumber(record.isSet("Matricule") ? record.get("Matricule") : (record.isSet("studentNumber") ? record.get("studentNumber") : ""));
                student.setInstitution(inst);
                student.setTenantId(inst.getId());
                
                usersToSave.add(user);
                studentsToSave.add(student);
                count++;
            }
            
            userRepository.saveAll(usersToSave);
            studentRepository.saveAll(studentsToSave);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'analyse du fichier CSV: " + e.getMessage());
        }
        return count;
    }

    private StudentAdminDto mapToDto(Student student) {
        StudentAdminDto dto = new StudentAdminDto();
        dto.setId(student.getId());
        dto.setFirstName(student.getUser().getFirstName());
        dto.setLastName(student.getUser().getLastName());
        dto.setEmail(student.getUser().getEmail());
        dto.setPhone(student.getUser().getPhone());
        dto.setActive(student.getUser().isActive());
        dto.setStudentNumber(student.getStudentNumber());
        if (student.getOrgUnits() != null && !student.getOrgUnits().isEmpty()) {
            dto.setOrgUnitIds(student.getOrgUnits().stream()
                    .map(OrganizationalUnit::getId)
                    .collect(Collectors.toList()));
        } else {
            dto.setOrgUnitIds(new java.util.ArrayList<>());
        }
        return dto;
    }
}
