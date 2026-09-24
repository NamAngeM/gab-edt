package ga.gabedt.common.enums;

/**
 * Rôles utilisateur du système GAB-EDT.
 * <p>
 * Cahier des charges section 4 :
 * <ul>
 *   <li>SUPER_ADMIN — administrateur global de la plateforme</li>
 *   <li>SCHOOL_ADMIN — administrateur d'un établissement</li>
 *   <li>PEDAGOGICAL_MANAGER — responsable pédagogique</li>
 *   <li>TEACHER — enseignant</li>
 *   <li>STUDENT — étudiant</li>
 * </ul>
 */
public enum UserRole {
    SUPER_ADMIN,
    SCHOOL_ADMIN,
    PEDAGOGICAL_MANAGER,
    TEACHER,
    STUDENT,
    PARENT
}
