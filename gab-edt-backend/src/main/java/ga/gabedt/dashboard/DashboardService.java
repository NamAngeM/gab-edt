package ga.gabedt.dashboard;

import ga.gabedt.dashboard.dto.ActivityDto;
import ga.gabedt.dashboard.dto.DashboardStatsDto;
import ga.gabedt.dashboard.dto.TodayEventDto;
import ga.gabedt.dashboard.dto.BuildingOccupationDto;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import ga.gabedt.timetable.enums.EventStatus;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final SubjectRepository subjectRepository;
    private final ScheduleEventRepository scheduleEventRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        // 1. Statistiques Globales
        stats.setTeacherCount(teacherRepository.countByDeletedFalse());
        stats.setStudentCount(studentRepository.countByDeletedFalse());
        stats.setRoomCount(roomRepository.countByDeletedFalse());
        stats.setSubjectCount(subjectRepository.countByDeletedFalse());
        stats.setRescheduledCount(scheduleEventRepository.countByStatusInAndDeletedFalse(Arrays.asList(EventStatus.POSTPONED, EventStatus.MOVED)));

        // 2. Événements du jour
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        List<ScheduleEvent> todayEvents = scheduleEventRepository.findByStartAtBetweenAndDeletedFalse(startOfDay, endOfDay);
        
        long conflictsCount = 0;
        List<TodayEventDto> eventDtos = new ArrayList<>();

        for (ScheduleEvent event : todayEvents) {
            boolean isRoomConflict = event.getRoom() != null && 
                scheduleEventRepository.existsOverlappingForRoomWithExclude(event.getRoom().getId(), event.getStartAt(), event.getEndAt(), event.getId());
            
            boolean isTeacherConflict = event.getTeacher() != null && 
                scheduleEventRepository.existsOverlappingForTeacherWithExclude(event.getTeacher().getId(), event.getStartAt(), event.getEndAt(), event.getId());
            
            boolean isOrgUnitConflict = event.getOrgUnit() != null && 
                scheduleEventRepository.existsOverlappingForOrgUnitWithExclude(event.getOrgUnit().getId(), event.getStartAt(), event.getEndAt(), event.getId());

            boolean hasConflict = isRoomConflict || isTeacherConflict || isOrgUnitConflict;
            if (hasConflict) {
                conflictsCount++;
            }

            TodayEventDto dto = new TodayEventDto();
            dto.setId(event.getId());
            dto.setTitle(event.getCourse() != null && event.getCourse().getSubject() != null ? event.getCourse().getSubject().getName() : "Cours");
            
            String desc = "";
            if (event.getTeacher() != null && event.getTeacher().getUser() != null) desc += event.getTeacher().getUser().getLastName();
            if (event.getOrgUnit() != null) desc += (desc.isEmpty() ? "" : " - ") + event.getOrgUnit().getName();
            dto.setDescription(desc);
            
            dto.setRoomName(event.getRoom() != null ? event.getRoom().getName() : "Non assigné");
            dto.setStartAt(event.getStartAt());
            dto.setEndAt(event.getEndAt());
            dto.setConflict(hasConflict);
            
            eventDtos.add(dto);
        }

        stats.setActiveConflictsCount(conflictsCount);
        // Trier les événements par heure de début
        eventDtos.sort((e1, e2) -> e1.getStartAt().compareTo(e2.getStartAt()));
        stats.setTodayEvents(eventDtos);

        // 2b. Occupation par bâtiment (en temps réel)
        LocalDateTime now = LocalDateTime.now();
        Set<String> occupiedRoomIds = todayEvents.stream()
            .filter(e -> !now.isBefore(e.getStartAt()) && now.isBefore(e.getEndAt()))
            .filter(e -> e.getRoom() != null)
            .map(e -> e.getRoom().getId())
            .map(java.util.UUID::toString) // Convert UUID to String if ID is UUID
            .collect(Collectors.toSet());

        List<Room> allRooms = roomRepository.findAllByDeletedFalse();
        Map<OrganizationalUnit, List<Room>> roomsByOrg = allRooms.stream()
            .filter(r -> r.getOrgUnit() != null)
            .collect(Collectors.groupingBy(Room::getOrgUnit));

        List<BuildingOccupationDto> bOccupations = new ArrayList<>();
        for (Map.Entry<OrganizationalUnit, List<Room>> entry : roomsByOrg.entrySet()) {
            OrganizationalUnit org = entry.getKey();
            List<Room> orgRooms = entry.getValue();
            
            long total = orgRooms.size();
            long occupied = orgRooms.stream().filter(r -> occupiedRoomIds.contains(r.getId().toString())).count();
            long free = total - occupied;
            int pct = total == 0 ? 0 : (int) ((occupied * 100) / total);
            
            BuildingOccupationDto dto = new BuildingOccupationDto();
            dto.setName(org.getName());
            dto.setSub(total + " Salles");
            dto.setPct(pct);
            dto.setOccupied(occupied + " occupées");
            dto.setFree(free + " libres");
            
            if (pct > 80) dto.setColor("var(--danger)");
            else if (pct > 50) dto.setColor("var(--warning)");
            else dto.setColor("var(--success)");
            
            bOccupations.add(dto);
        }
        bOccupations.sort((b1, b2) -> Integer.compare(b2.getPct(), b1.getPct()));
        stats.setBuildingOccupations(bOccupations.size() > 4 ? bOccupations.subList(0, 4) : bOccupations);

        // 3. Activités récentes (basé sur les 5 dernières modifications d'emploi du temps)
        List<ActivityDto> activities = new ArrayList<>();
        List<ScheduleEvent> recentEvents = scheduleEventRepository.findTop5ByDeletedFalseOrderByUpdatedAtDesc();
        
        for (ScheduleEvent event : recentEvents) {
            ActivityDto act = new ActivityDto();
            act.setIcon("event_available");
            act.setType("UPDATE");
            act.setTime(event.getUpdatedAt() != null ? event.getUpdatedAt() : event.getCreatedAt());
            String subjectName = (event.getCourse() != null && event.getCourse().getSubject() != null) ? event.getCourse().getSubject().getName() : "Un cours";
            act.setText("Mise à jour de " + subjectName);
            activities.add(act);
        }
        
        if (activities.isEmpty()) {
            ActivityDto act1 = new ActivityDto();
            act1.setIcon("check_circle");
            act1.setText("Système prêt.");
            act1.setTime(LocalDateTime.now());
            act1.setType("SUCCESS");
            activities.add(act1);
        }
        
        stats.setRecentActivity(activities);

        return stats;
    }
}
