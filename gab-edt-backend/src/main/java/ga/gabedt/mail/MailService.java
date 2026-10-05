package ga.gabedt.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Envoi des e-mails transactionnels.
 * <p>
 * Le serveur SMTP est configuré par {@code spring.mail.*} (variables MAIL_*).
 * Sans SMTP, l'e-mail n'est pas envoyé ; son contenu n'est écrit dans les logs
 * que si {@code app.mail.log-content=true} (profil dev uniquement), car il peut contenir des secrets.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSender;

    @Value("${app.mail.from:no-reply@gab-edt.ga}")
    private String from;

    @Value("${app.mail.log-content:false}")
    private boolean logContent;

    public void send(String to, String subject, String body) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            if (logContent) {
                log.info("[DEV] E-mail non envoyé (SMTP non configuré) à {} — {}\n{}", to, subject, body);
            } else {
                log.warn("SMTP non configuré : e-mail « {} » non envoyé", subject);
            }
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
        } catch (Exception e) {
            log.error("Échec d'envoi de l'e-mail « {} » : {}", subject, e.getMessage());
        }
    }
}
