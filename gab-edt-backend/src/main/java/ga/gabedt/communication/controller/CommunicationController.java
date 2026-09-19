package ga.gabedt.communication.controller;

import ga.gabedt.communication.dto.*;
import ga.gabedt.communication.service.CommunicationService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<List<AnnouncementDto>> getAllAnnouncements() {
        return ResponseEntity.ok(communicationService.getAllAnnouncements());
    }

    @PostMapping("/announcements")
    public ResponseEntity<AnnouncementDto> createAnnouncement(@RequestBody AnnouncementCreateDto dto) {
        return ResponseEntity.ok(communicationService.createAnnouncement(dto));
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable UUID id) {
        communicationService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events")
    public ResponseEntity<List<AcademicEventDto>> getAllEvents() {
        return ResponseEntity.ok(communicationService.getAllEvents());
    }

    @PostMapping("/events")
    public ResponseEntity<AcademicEventDto> createEvent(@RequestBody AcademicEventCreateDto dto) {
        return ResponseEntity.ok(communicationService.createEvent(dto));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        communicationService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
