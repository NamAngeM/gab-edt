package ga.gabedt.defense.repository;

import ga.gabedt.defense.Defense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DefenseRepository extends JpaRepository<Defense, UUID> {
    List<Defense> findByDeletedFalse();
}
