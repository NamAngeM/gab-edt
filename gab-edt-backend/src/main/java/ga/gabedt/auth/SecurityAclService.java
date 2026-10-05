package ga.gabedt.auth;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecurityAclService {

    private final UserRepository userRepository;
    private final OrganizationalUnitRepository orgUnitRepository;
    private final RoomRepository roomRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final ga.gabedt.student.disciplinary.DisciplinaryRecordRepository disciplinaryRecordRepository;

    public boolean canManage(UUID targetOrgUnitId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return false;
        }

        String email = auth.getName();
        User user = userRepository.findByEmailAndDeletedFalse(email).orElse(null);
        if (user == null) {
            return false;
        }

        if (user.getRole() == UserRole.SUPER_ADMIN) {
            return true;
        }

        // SCHOOL_ADMIN : tout son établissement. L'unité ciblée doit en faire partie
        // (existsById passe par le filtre @TenantId, une unité d'un autre établissement est invisible).
        if (user.getRole() == UserRole.SCHOOL_ADMIN) {
            return targetOrgUnitId == null || orgUnitRepository.existsById(targetOrgUnitId);
        }

        if (user.getRole() != UserRole.PEDAGOGICAL_MANAGER) {
            return false;
        }
        
        if (targetOrgUnitId == null) {
            // trying to manage a global resource without global admin rights
            return false; 
        }

        // Check if targetOrgUnitId is a descendant (or self) of any managed unit
        return isDescendantOfAny(targetOrgUnitId, user.getManagedOrgUnits());
    }

    public boolean canManageAny(java.util.List<UUID> targetOrgUnitIds) {
        if (canManage(null)) return true;
        if (targetOrgUnitIds == null || targetOrgUnitIds.isEmpty()) return false;
        for (UUID orgUnitId : targetOrgUnitIds) {
            if (canManage(orgUnitId)) {
                return true; // if they can manage at least one of the specified units
            }
        }
        return false;
    }

    public boolean canManageRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room == null || room.getOrgUnit() == null) return false;
        return canManage(room.getOrgUnit().getId());
    }

    public boolean canManageTeacher(UUID teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId).orElse(null);
        if (teacher == null || teacher.getOrgUnits() == null || teacher.getOrgUnits().isEmpty()) return false;
        return teacher.getOrgUnits().stream().anyMatch(ou -> canManage(ou.getId()));
    }

    public boolean canManageStudent(UUID studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null || student.getOrgUnits() == null || student.getOrgUnits().isEmpty()) return false;
        return student.getOrgUnits().stream().anyMatch(ou -> canManage(ou.getId()));
    }

    public boolean canManageEvent(UUID eventId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return false;
        }

        ga.gabedt.timetable.ScheduleEvent event = scheduleEventRepository.findById(eventId).orElse(null);
        if (event == null) return false;

        String email = auth.getName();
        User user = userRepository.findByEmailAndDeletedFalse(email).orElse(null);
        if (user != null && user.getRole() == UserRole.TEACHER) {
            // Un enseignant peut gérer l'événement s'il lui est assigné
            if (event.getTeacher() != null && event.getTeacher().getUser() != null && 
                event.getTeacher().getUser().getId().equals(user.getId())) {
                return true;
            }
        }

        if (event.getOrgUnit() == null) return false;
        return canManage(event.getOrgUnit().getId());
    }

    /**
     * Lecture des données personnelles d'un élève (dossier disciplinaire, notes…) :
     * l'élève lui-même, son parent, l'équipe pédagogique de l'établissement.
     */
    public boolean canViewStudent(UUID studentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User principal)) {
            return false;
        }
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) return false;

        boolean isOwnRecord = student.getUser() != null && student.getUser().getId().equals(principal.getId());
        if (hasAuthority(auth, UserRole.STUDENT) || hasAuthority(auth, UserRole.PARENT)) {
            return isOwnRecord;
        }
        if (hasAuthority(auth, UserRole.SUPER_ADMIN) || hasAuthority(auth, UserRole.SCHOOL_ADMIN)
                || hasAuthority(auth, UserRole.TEACHER)) {
            return true; // student a déjà été chargé dans le périmètre de l'établissement courant
        }
        return hasAuthority(auth, UserRole.PEDAGOGICAL_MANAGER) && canManageStudent(studentId);
    }

    /** Signature d'un dossier disciplinaire : uniquement le parent de l'élève concerné. */
    public boolean canSignDisciplinaryRecord(UUID recordId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User principal) || !hasAuthority(auth, UserRole.PARENT)) {
            return false;
        }
        return disciplinaryRecordRepository.findById(recordId)
                .map(r -> r.getStudent().getUser().getId().equals(principal.getId()))
                .orElse(false);
    }

    private static boolean hasAuthority(Authentication auth, UserRole role) {
        String expected = "ROLE_" + role.name();
        return auth.getAuthorities().stream().anyMatch(a -> expected.equals(a.getAuthority()));
    }

    public boolean canManageOrgUnit(UUID orgUnitId) {
        return canManage(orgUnitId);
    }

    private boolean isDescendantOfAny(UUID targetId, Iterable<OrganizationalUnit> managedUnits) {
        if (managedUnits == null) return false;
        
        // Load the target unit to traverse upwards
        if (!orgUnitRepository.existsById(targetId)) return false;
        OrganizationalUnit target = orgUnitRepository.findById(targetId).orElse(null);
        if (target == null) return false;
        
        for (OrganizationalUnit managedUnit : managedUnits) {
            if (isDescendant(target, managedUnit)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean isDescendant(OrganizationalUnit child, OrganizationalUnit potentialParent) {
        OrganizationalUnit current = child;
        while (current != null) {
            if (current.getId().equals(potentialParent.getId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }
}
