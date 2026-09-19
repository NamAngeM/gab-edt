package ga.gabedt.resource.controller;

import ga.gabedt.resource.dto.ResourceTreeDto;
import ga.gabedt.resource.service.ResourceTreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/resources/tree")
@RequiredArgsConstructor
public class ResourceTreeController {

    private final ResourceTreeService resourceTreeService;

    @GetMapping
    public ResponseEntity<ResourceTreeDto> getResourceTree() {
        return ResponseEntity.ok(resourceTreeService.getResourceTree());
    }
}
