package ga.gabedt.structure.controller;

import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/institutions")
@RequiredArgsConstructor
public class InstitutionController {
    private final InstitutionRepository institutionRepository;

    @GetMapping
    public List<Institution> getAll() {
        return institutionRepository.findAll();
    }
}
