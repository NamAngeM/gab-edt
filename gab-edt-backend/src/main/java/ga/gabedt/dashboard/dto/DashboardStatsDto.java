package ga.gabedt.dashboard.dto;

import lombok.Data;
import java.util.List;

@Data
public class DashboardStatsDto {
    private long teacherCount;
    private long studentCount;
    private long subjectCount;
    private long roomCount;
    
    private long activeConflictsCount;
    private long rescheduledCount;
    
    private List<TodayEventDto> todayEvents;
    private List<ActivityDto> recentActivity;
    private List<BuildingOccupationDto> buildingOccupations;
}
