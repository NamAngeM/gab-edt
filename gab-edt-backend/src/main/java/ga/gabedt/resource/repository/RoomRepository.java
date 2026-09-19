package ga.gabedt.resource.repository;

import ga.gabedt.resource.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID>, JpaSpecificationExecutor<Room> {
    List<Room> findAllByDeletedFalse();
    long countByDeletedFalse();
    List<Room> findByOrgUnitIdAndDeletedFalse(UUID orgUnitId);
    Optional<Room> findByCodeAndDeletedFalse(String code);
}
