package ga.gabedt.resource.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.dto.RoomAdminDto;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final OrganizationalUnitRepository organizationalUnitRepository;
    private final InstitutionRepository institutionRepository;

    @Transactional(readOnly = true)
    public Page<RoomAdminDto> findAll(UUID orgUnitId, String search, Boolean active, Pageable pageable) {
        Specification<Room> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));

            if (orgUnitId != null) {
                Join<Room, OrganizationalUnit> orgUnit = root.join("orgUnit");
                predicates.add(cb.equal(orgUnit.get("id"), orgUnitId));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("code")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return roomRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public RoomAdminDto findById(UUID id) {
        Room room = roomRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return mapToDto(room);
    }

    public RoomAdminDto create(RoomAdminDto dto) {
        Room room = new Room();
        room.setName(dto.getName());
        room.setCode(dto.getCode());
        room.setCapacity(dto.getCapacity());
        room.setType(dto.getType());
        room.setActive(dto.isActive());

        // Minimal institution setup
        Institution inst = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No Institution available"));
        room.setInstitution(inst);
        room.setTenantId(inst.getId());

        if (dto.getOrgUnitId() != null) {
            OrganizationalUnit orgUnit = organizationalUnitRepository.findById(dto.getOrgUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organizational Unit not found"));
            room.setOrgUnit(orgUnit);
        }

        Room saved = roomRepository.save(room);
        return mapToDto(saved);
    }

    public RoomAdminDto update(UUID id, RoomAdminDto dto) {
        Room room = roomRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        room.setName(dto.getName());
        room.setCode(dto.getCode());
        room.setCapacity(dto.getCapacity());
        room.setType(dto.getType());
        room.setActive(dto.isActive());

        if (dto.getOrgUnitId() != null) {
            OrganizationalUnit orgUnit = organizationalUnitRepository.findById(dto.getOrgUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organizational Unit not found"));
            room.setOrgUnit(orgUnit);
        } else {
            room.setOrgUnit(null);
        }

        Room saved = roomRepository.save(room);
        return mapToDto(saved);
    }

    public void delete(UUID id) {
        Room room = roomRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        room.setDeleted(true);
        roomRepository.save(room);
    }

    public void bulkDelete(List<UUID> ids) {
        List<Room> rooms = roomRepository.findAllById(ids);
        for (Room r : rooms) {
            r.setDeleted(true);
        }
        roomRepository.saveAll(rooms);
    }

    public void bulkUpdateStatus(List<UUID> ids, boolean active) {
        List<Room> rooms = roomRepository.findAllById(ids);
        for (Room r : rooms) {
            r.setActive(active);
        }
        roomRepository.saveAll(rooms);
    }

    public int importCsv(MultipartFile file) {
        int count = 0;
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build())) {

            List<Room> roomsToSave = new ArrayList<>();
            
            Institution inst = institutionRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No Institution available"));

            for (CSVRecord record : csvParser) {
                String name = record.isSet("Nom") ? record.get("Nom").trim() : (record.isSet("name") ? record.get("name").trim() : null);
                if (name == null || name.isEmpty()) continue;
                
                Room room = new Room();
                room.setName(name);
                room.setCode(record.isSet("Code") ? record.get("Code") : (record.isSet("code") ? record.get("code") : ""));
                
                String cap = record.isSet("Capacite") ? record.get("Capacite") : (record.isSet("capacity") ? record.get("capacity") : "30");
                try {
                    room.setCapacity(Integer.parseInt(cap));
                } catch (Exception e) {
                    room.setCapacity(30);
                }
                
                room.setType(record.isSet("Type") ? record.get("Type") : (record.isSet("type") ? record.get("type") : "CLASSROOM"));
                
                boolean isActive = record.isSet("Statut") ? "Actif".equalsIgnoreCase(record.get("Statut")) : true;
                room.setActive(isActive);
                
                room.setInstitution(inst);
                room.setTenantId(inst.getId());
                
                roomsToSave.add(room);
                count++;
            }
            
            roomRepository.saveAll(roomsToSave);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'analyse du fichier CSV: " + e.getMessage());
        }
        return count;
    }

    private RoomAdminDto mapToDto(Room room) {
        RoomAdminDto dto = new RoomAdminDto();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setCode(room.getCode());
        dto.setCapacity(room.getCapacity());
        dto.setType(room.getType());
        dto.setActive(room.isActive());
        if (room.getOrgUnit() != null) {
            dto.setOrgUnitId(room.getOrgUnit().getId());
        }
        return dto;
    }
}
