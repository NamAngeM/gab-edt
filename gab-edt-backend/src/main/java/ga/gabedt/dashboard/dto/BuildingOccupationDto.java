package ga.gabedt.dashboard.dto;

import lombok.Data;

@Data
public class BuildingOccupationDto {
    private String name;
    private String sub;
    private int pct;
    private String occupied;
    private String free;
    private String color;
}
