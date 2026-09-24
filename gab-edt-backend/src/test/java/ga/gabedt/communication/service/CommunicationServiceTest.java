package ga.gabedt.communication.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.communication.AcademicEvent;
import ga.gabedt.communication.Announcement;
import ga.gabedt.communication.dto.AcademicEventCreateDto;
import ga.gabedt.communication.dto.AcademicEventDto;
import ga.gabedt.communication.dto.AnnouncementCreateDto;
import ga.gabedt.communication.dto.AnnouncementDto;
import ga.gabedt.communication.repository.AcademicEventRepository;
import ga.gabedt.communication.repository.AnnouncementRepository;
import ga.gabedt.notification.NotificationService;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import ga.gabedt.communication.TargetAudience;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommunicationServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;

    @Mock
    private AcademicEventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommunicationService communicationService;

    private Announcement announcement;
    private AcademicEvent event;
    private User author;
    private Institution institution;

    @BeforeEach
    void setUp() {
        institution = new Institution();
        institution.setId(UUID.randomUUID());

        author = new User();
        author.setId(UUID.randomUUID());
        author.setFirstName("Admin");
        author.setLastName("User");

        announcement = new Announcement();
        announcement.setId(UUID.randomUUID());
        announcement.setTitle("Welcome");
        announcement.setContent("Welcome to GAB-EDT");
        announcement.setTargetAudience(TargetAudience.ALL);
        announcement.setValidUntil(LocalDate.now().plusDays(7));
        announcement.setAuthor(author);
        announcement.setInstitution(institution);

        event = new AcademicEvent();
        event.setId(UUID.randomUUID());
        event.setTitle("Spring Break");
        event.setDescription("Holiday week");
        event.setStartDate(LocalDateTime.now());
        event.setEndDate(LocalDateTime.now().plusDays(7));
        event.setHoliday(true);
        event.setInstitution(institution);
    }

    @Test
    void getAllAnnouncements_ShouldReturnList() {
        when(announcementRepository.findByDeletedFalseOrderByCreatedAtDesc()).thenReturn(List.of(announcement));

        List<AnnouncementDto> result = communicationService.getAllAnnouncements();

        assertEquals(1, result.size());
        assertEquals("Welcome", result.get(0).title());
        assertEquals("Admin User", result.get(0).authorName());
    }

    @Test
    void createAnnouncement_ShouldSaveAndReturnDto() {
        AnnouncementCreateDto dto = new AnnouncementCreateDto("Alert", "Test alert", TargetAudience.STUDENTS, LocalDate.now().plusDays(1), author.getId());

        when(userRepository.findById(author.getId())).thenReturn(Optional.of(author));
        when(institutionRepository.findAll()).thenReturn(List.of(institution));
        when(announcementRepository.save(any(Announcement.class))).thenAnswer(i -> i.getArguments()[0]);

        AnnouncementDto result = communicationService.createAnnouncement(dto);

        assertNotNull(result);
        assertEquals("Alert", result.title());
        verify(announcementRepository, times(1)).save(any(Announcement.class));
        verify(notificationService, times(1)).sendAdminAlert(anyString(), eq("Alert"), anyString());
    }

    @Test
    void deleteAnnouncement_ShouldMarkAsDeleted() {
        when(announcementRepository.findById(announcement.getId())).thenReturn(Optional.of(announcement));

        communicationService.deleteAnnouncement(announcement.getId());

        assertTrue(announcement.isDeleted());
        verify(announcementRepository, times(1)).save(announcement);
    }

    @Test
    void getAllEvents_ShouldReturnList() {
        when(eventRepository.findByDeletedFalseOrderByStartDateAsc()).thenReturn(List.of(event));

        List<AcademicEventDto> result = communicationService.getAllEvents();

        assertEquals(1, result.size());
        assertEquals("Spring Break", result.get(0).title());
        assertTrue(result.get(0).holiday());
    }

    @Test
    void createEvent_ShouldSaveAndReturnDto() {
        AcademicEventCreateDto dto = new AcademicEventCreateDto("Exam Week", "Finals", LocalDateTime.now(), LocalDateTime.now().plusDays(5), false);

        when(institutionRepository.findAll()).thenReturn(List.of(institution));
        when(eventRepository.save(any(AcademicEvent.class))).thenAnswer(i -> i.getArguments()[0]);

        AcademicEventDto result = communicationService.createEvent(dto);

        assertNotNull(result);
        assertEquals("Exam Week", result.title());
        assertFalse(result.holiday());
        verify(eventRepository, times(1)).save(any(AcademicEvent.class));
    }

    @Test
    void deleteEvent_ShouldMarkAsDeleted() {
        when(eventRepository.findById(event.getId())).thenReturn(Optional.of(event));

        communicationService.deleteEvent(event.getId());

        assertTrue(event.isDeleted());
        verify(eventRepository, times(1)).save(event);
    }
}
