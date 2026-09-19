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

        // SUPER_ADMIN has global access
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            return true;
        }
        
        // If they are not at least a pedagogical manager or school admin, they can't manage
        if (user.getRole() != UserRole.PEDAGOGICAL_MANAGER && user.getRole() != UserRole.SCHOOL_ADMIN) {
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

    public boolean canManageOrgUnit(UUID orgUnitId) {
        return canManage(orgUnitId);
    }

    private boolean isDescendantOfAny(UUID targetId, Iterable<OrganizationalUnit> managedUnits) {
        if (managedUnits == null) return false;
        
        // Load the target unit to traverse upwards
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
