package ga.gabedt.config;

import ga.gabedt.auth.JwtUtils;
import ga.gabedt.common.enums.UserRole;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Authentifie les connexions STOMP et contrôle les abonnements.
 * <ul>
 *   <li>CONNECT : jeton d'accès dans l'en-tête natif {@code Authorization} (mobile), ou utilisateur
 *   déjà authentifié lors de la poignée de main HTTP via le cookie HttpOnly (web).</li>
 *   <li>SUBSCRIBE : chaque sujet est cloisonné par établissement, classe ou utilisateur.</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private static final Set<UserRole> STAFF = Set.of(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PEDAGOGICAL_MANAGER);

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final OrganizationalUnitRepository orgUnitRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            User user = authenticateFromHeader(accessor);
            if (user == null) {
                user = userFromPrincipal(accessor.getUser());
            }
            if (user == null) {
                throw new MessagingException("Authentification requise");
            }
            accessor.setUser(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            User user = userFromPrincipal(accessor.getUser());
            if (user == null || !canSubscribe(user, accessor.getDestination())) {
                throw new MessagingException("Abonnement refusé");
            }
        } else if (StompCommand.SEND.equals(accessor.getCommand())) {
            // Aucun message entrant n'est attendu des clients
            throw new MessagingException("Envoi non autorisé");
        }
        return message;
    }

    private User authenticateFromHeader(StompHeaderAccessor accessor) {
        List<String> authorization = accessor.getNativeHeader("Authorization");
        if (authorization == null || authorization.isEmpty() || !authorization.get(0).startsWith("Bearer ")) {
            return null;
        }
        String token = authorization.get(0).substring(7);
        try {
            if (!jwtUtils.isAccessToken(token)) {
                return null; // un refresh token ne doit jamais ouvrir de session
            }
            return userRepository.findByEmailAndDeletedFalse(jwtUtils.extractUsername(token))
                    .filter(User::isEnabled)
                    .filter(u -> jwtUtils.isTokenValid(token, u))
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private User userFromPrincipal(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth && auth.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }

    private boolean canSubscribe(User user, String destination) {
        if (destination == null) return false;

        if (destination.startsWith("/topic/user-alerts/")) {
            return destination.equals("/topic/user-alerts/" + user.getId());
        }
        if (destination.startsWith("/topic/admin-alerts/")) {
            UUID tenantId = parseUuid(destination.substring("/topic/admin-alerts/".length()));
            return tenantId != null && STAFF.contains(user.getRole())
                    && (user.getRole() == UserRole.SUPER_ADMIN || tenantId.equals(user.getInstitutionId()));
        }
        if (destination.startsWith("/topic/class-alerts/")) {
            UUID orgUnitId = parseUuid(destination.substring("/topic/class-alerts/".length()));
            if (orgUnitId == null) return false;
            if (user.getRole() == UserRole.SUPER_ADMIN) return true;
            // Hors requête HTTP, aucun tenant n'est actif : on compare explicitement l'établissement
            return orgUnitRepository.findById(orgUnitId)
                    .map(ou -> ou.getTenantId().equals(user.getInstitutionId()))
                    .orElse(false);
        }
        return false;
    }

    private UUID parseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
