package ga.gabedt.system;

import ga.gabedt.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public record MaintenanceRequest(boolean enabled) {}

    @GetMapping("/status")
    public ApiResponse<Map<String, Boolean>> status() {
        return ApiResponse.success(Map.of("maintenance", maintenanceService.isEnabled()));
    }

    @PutMapping("/maintenance")
    public ApiResponse<Map<String, Boolean>> setMaintenance(@RequestBody MaintenanceRequest request) {
        maintenanceService.setEnabled(request.enabled());
        return ApiResponse.success(Map.of("maintenance", request.enabled()));
    }
}
