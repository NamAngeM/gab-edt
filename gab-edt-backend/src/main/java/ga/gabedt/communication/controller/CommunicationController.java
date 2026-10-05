package ga.gabedt.communication.controller;

import ga.gabedt.communication.dto.*;
import ga.gabedt.communication.service.CommunicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communication")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    @GetMapping("/announcements")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnnouncementDto>> getAllAnnouncements() {
        return ResponseEntity.ok(communicationService.getAllAnnouncements());
    }

    @PostMapping("/announcements")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER', 'TEACHER')")
    public ResponseEntity<AnnouncementDto> createAnnouncement(@Valid @RequestBody AnnouncementCreateDto dto) {
        return ResponseEntity.ok(communicationService.createAnnouncement(dto));
    }

    @DeleteMapping("/announcements/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable UUID id) {
        communicationService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AcademicEventDto>> getAllEvents() {
        return ResponseEntity.ok(communicationService.getAllEvents());
    }

    @PostMapping("/events")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<AcademicEventDto> createEvent(@Valid @RequestBody AcademicEventCreateDto dto) {
        return ResponseEntity.ok(communicationService.createEvent(dto));
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        communicationService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
