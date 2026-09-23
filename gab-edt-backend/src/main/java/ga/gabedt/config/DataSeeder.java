package ga.gabedt.config;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.InstitutionType;
import ga.gabedt.structure.OrgUnitType;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstitutionRepository institutionRepository;
    private final OrganizationalUnitRepository orgUnitRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public void run(String... args) throws Exception {
        if (institutionRepository.count() == 0) {
            
            // 1. Université
            Institution univ = new Institution();
            univ.setName("Université Omar Bongo");
            univ.setCode("UOB");
            univ.setType(InstitutionType.UNIVERSITY);
            univ.setCity("Libreville");
            univ = institutionRepository.save(univ);

            OrganizationalUnit facSciences = new OrganizationalUnit();
            facSciences.setName("Faculté des Sciences");
            facSciences.setType(OrgUnitType.FACULTY);
            facSciences.setInstitution(univ);
            facSciences = orgUnitRepository.save(facSciences);

            OrganizationalUnit deptInfo = new OrganizationalUnit();
            deptInfo.setName("Département Informatique");
            deptInfo.setType(OrgUnitType.DEPARTMENT);
            deptInfo.setParent(facSciences);
            deptInfo.setInstitution(univ);
            orgUnitRepository.save(deptInfo);
            
            Subject s1 = new Subject();
            s1.setName("Mathématiques Appliquées");
            s1.setCode("MATH101");
            s1.setInstitution(univ);
            s1.setTenantId(univ.getId());
            subjectRepository.save(s1);

            Subject s2 = new Subject();
            s2.setName("Programmation Java");
            s2.setCode("DEV201");
            s2.setInstitution(univ);
            s2.setTenantId(univ.getId());
            subjectRepository.save(s2);

            // 2. Lycée
            Institution lycee = new Institution();
            lycee.setName("Lycée National Léon Mba");
            lycee.setCode("LNLM");
            lycee.setType(InstitutionType.LYCEE);
            lycee.setCity("Libreville");
            lycee = institutionRepository.save(lycee);

            OrganizationalUnit terminale = new OrganizationalUnit();
            terminale.setName("Terminale");
            terminale.setType(OrgUnitType.LEVEL);
            terminale.setInstitution(lycee);
            terminale = orgUnitRepository.save(terminale);

            OrganizationalUnit tC = new OrganizationalUnit();
            tC.setName("Terminale C");
            tC.setType(OrgUnitType.CLASS);
            tC.setParent(terminale);
            tC.setInstitution(lycee);
            orgUnitRepository.save(tC);
            
            // 3. Admin User
            if (userRepository.findByEmailAndDeletedFalse("admin@ecole.com").isEmpty()) {
                User admin = new User();
                admin.setFirstName("Super");
                admin.setLastName("Admin");
                admin.setEmail("admin@ecole.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole(UserRole.SCHOOL_ADMIN);
                userRepository.save(admin);
            }

            // 4. Teacher User
            if (userRepository.findByEmailAndDeletedFalse("prof@ecole.com").isEmpty()) {
                User prof = new User();
                prof.setFirstName("Jean");
                prof.setLastName("Dupont");
                prof.setEmail("prof@ecole.com");
                prof.setPasswordHash(passwordEncoder.encode("prof123"));
                prof.setRole(UserRole.TEACHER);
                userRepository.save(prof);
                
                // Idéalement on créerait aussi l'entité Teacher associée ici
            }

            // 5. Student User
            if (userRepository.findByEmailAndDeletedFalse("eleve@ecole.com").isEmpty()) {
                User student = new User();
                student.setFirstName("Alice");
                student.setLastName("Martin");
                student.setEmail("eleve@ecole.com");
                student.setPasswordHash(passwordEncoder.encode("eleve123"));
                student.setRole(UserRole.STUDENT);
                userRepository.save(student);
            }
        }
    }
}
