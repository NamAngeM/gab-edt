package ga.gabedt.user.controller;

import ga.gabedt.common.response.ApiResponse;
import ga.gabedt.user.dto.UserAdminDto;
import ga.gabedt.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserAdminDto>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.findAll()));
    }

    @PutMapping("/{id}/managed-units")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<ApiResponse<UserAdminDto>> assignManagedUnits(@PathVariable UUID id, @RequestBody Set<UUID> orgUnitIds) {
        return ResponseEntity.ok(ApiResponse.success(userService.assignManagedUnits(id, orgUnitIds)));
    }
}
