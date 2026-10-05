package ga.gabedt.communication.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.communication.AcademicEvent;
import ga.gabedt.communication.Announcement;
import ga.gabedt.communication.dto.*;
import ga.gabedt.communication.repository.AcademicEventRepository;
import ga.gabedt.communication.repository.AnnouncementRepository;
import ga.gabedt.notification.NotificationService;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunicationService {

    private final AnnouncementRepository announcementRepository;
    private final AcademicEventRepository eventRepository;
    private final UserRepository userRepository;
    private final ga.gabedt.tenant.CurrentTenant currentTenant;
    private final NotificationService notificationService;

    public List<AnnouncementDto> getAllAnnouncements() {
        return announcementRepository.findByDeletedFalseOrderByCreatedAtDesc().stream()
                .map(a -> {
                    String authorName = "Système";
                    if (a.getAuthor() != null) {
                        authorName = a.getAuthor().getFirstName() + " " + a.getAuthor().getLastName();
                    }
                    return new AnnouncementDto(
                            a.getId(), a.getTitle(), a.getContent(), a.getTargetAudience(),
                            a.getValidUntil(), authorName,
                            a.getCreatedAt()
                    );
                }).collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementCreateDto dto) {
        // L'auteur est toujours l'utilisateur authentifié, jamais une valeur fournie par le client
        User author = userRepository.findById(currentTenant.requireUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Auteur introuvable"));
        
        Institution institution = currentTenant.requireInstitution();

        Announcement ann = new Announcement();
        ann.setTitle(dto.title());
        ann.setContent(dto.content());
        ann.setTargetAudience(dto.targetAudience());
        ann.setValidUntil(dto.validUntil());
        ann.setAuthor(author);
        ann.setInstitution(institution);
        ann.setTenantId(institution.getId());

        ann = announcementRepository.save(ann);

        // Notify via WebSocket
        notificationService.sendAdminAlert("Annonce publiée : " + dto.targetAudience(), dto.title(), "info");

        return new AnnouncementDto(
                ann.getId(), ann.getTitle(), ann.getContent(), ann.getTargetAudience(),
                ann.getValidUntil(), ann.getAuthor().getFirstName() + " " + ann.getAuthor().getLastName(),
                ann.getCreatedAt()
        );
    }

    @Transactional
    public void deleteAnnouncement(UUID id) {
        Announcement ann = announcementRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        ann.setDeleted(true);
        announcementRepository.save(ann);
    }

    public List<AcademicEventDto> getAllEvents() {
        return eventRepository.findByDeletedFalseOrderByStartDateAsc().stream()
                .map(e -> new AcademicEventDto(
                        e.getId(), e.getTitle(), e.getDescription(), e.getStartDate(), e.getEndDate(), e.isHoliday()
                )).collect(Collectors.toList());
    }

    @Transactional
    public AcademicEventDto createEvent(AcademicEventCreateDto dto) {
        Institution institution = currentTenant.requireInstitution();

        AcademicEvent event = new AcademicEvent();
        event.setTitle(dto.title());
        event.setDescription(dto.description());
        event.setStartDate(dto.startDate());
        event.setEndDate(dto.endDate());
        event.setHoliday(dto.holiday());
        event.setInstitution(institution);
        event.setTenantId(institution.getId());

        event = eventRepository.save(event);
        return new AcademicEventDto(
                event.getId(), event.getTitle(), event.getDescription(), event.getStartDate(), event.getEndDate(), event.isHoliday()
        );
    }

    @Transactional
    public void deleteEvent(UUID id) {
        AcademicEvent event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        event.setDeleted(true);
        eventRepository.save(event);
    }
}
