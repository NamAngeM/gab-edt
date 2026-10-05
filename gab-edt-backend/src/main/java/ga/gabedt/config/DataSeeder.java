package ga.gabedt.config;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.InstitutionType;
import ga.gabedt.structure.OrgUnitType;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Données de démonstration — <b>profil dev uniquement</b>.
 * Jamais chargé en production : les comptes y ont des mots de passe connus.
 */
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstitutionRepository institutionRepository;
    private final OrganizationalUnitRepository orgUnitRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (institutionRepository.count() > 0) {
            return;
        }

        // 1. Université
        Institution univ = new Institution();
        univ.setName("Université Omar Bongo");
        univ.setCode("UOB");
        univ.setType(InstitutionType.UNIVERSITY);
        univ.setCity("Libreville");
        univ = institutionRepository.save(univ);

        OrganizationalUnit facSciences = orgUnit("Faculté des Sciences", OrgUnitType.FACULTY, univ, null);
        OrganizationalUnit deptInfo = orgUnit("Département Informatique", OrgUnitType.DEPARTMENT, univ, facSciences);

        subject("Mathématiques Appliquées", "MATH101", univ);
        subject("Programmation Java", "DEV201", univ);

        // 2. Lycée (second établissement : permet de vérifier l'isolation des données)
        Institution lycee = new Institution();
        lycee.setName("Lycée National Léon Mba");
        lycee.setCode("LNLM");
        lycee.setType(InstitutionType.LYCEE);
        lycee.setCity("Libreville");
        lycee = institutionRepository.save(lycee);

        OrganizationalUnit terminale = orgUnit("Terminale", OrgUnitType.LEVEL, lycee, null);
        orgUnit("Terminale C", OrgUnitType.CLASS, lycee, terminale);

        // 3. Comptes de démonstration, tous rattachés à l'université
        user("superadmin@gab-edt.ga", "Super", "Admin", UserRole.SUPER_ADMIN, null, "superadmin123");
        user("admin@ecole.com", "Marie", "Nzé", UserRole.SCHOOL_ADMIN, univ, "admin123");
        user("admin@lycee.com", "Paul", "Obame", UserRole.SCHOOL_ADMIN, lycee, "admin123");

        User profUser = user("prof@ecole.com", "Jean", "Dupont", UserRole.TEACHER, univ, "prof123");
        Teacher teacher = new Teacher();
        teacher.setUser(profUser);
        teacher.setEmployeeNumber("ENS-0001");
        teacher.setInstitution(univ);
        teacher.setTenantId(univ.getId());
        teacher.setOrgUnits(new java.util.HashSet<>(Set.of(deptInfo)));
        teacherRepository.save(teacher);

        User eleveUser = user("eleve@ecole.com", "Alice", "Martin", UserRole.STUDENT, univ, "eleve123");
        Student student = new Student();
        student.setUser(eleveUser);
        student.setStudentNumber("ETU-0001");
        student.setParentPasswordHash(passwordEncoder.encode("parent123"));
        student.setInstitution(univ);
        student.setTenantId(univ.getId());
        student.setOrgUnits(new java.util.HashSet<>(Set.of(deptInfo)));
        studentRepository.save(student);

        log.info("Données de démonstration chargées (profil dev)");
    }

    private OrganizationalUnit orgUnit(String name, OrgUnitType type, Institution institution, OrganizationalUnit parent) {
        OrganizationalUnit unit = new OrganizationalUnit();
        unit.setName(name);
        unit.setType(type);
        unit.setInstitution(institution);
        unit.setTenantId(institution.getId());
        unit.setParent(parent);
        return orgUnitRepository.save(unit);
    }

    private void subject(String name, String code, Institution institution) {
        Subject subject = new Subject();
        subject.setName(name);
        subject.setCode(code);
        subject.setInstitution(institution);
        subject.setTenantId(institution.getId());
        subjectRepository.save(subject);
    }

    private User user(String email, String firstName, String lastName, UserRole role, Institution institution, String password) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setInstitutionId(institution != null ? institution.getId() : null);
        user.setPasswordHash(passwordEncoder.encode(password));
        return userRepository.save(user);
    }
}
