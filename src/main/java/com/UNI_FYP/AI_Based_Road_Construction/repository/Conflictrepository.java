package com.UNI_FYP.AI_Based_Road_Construction.repository;
import com.UNI_FYP.AI_Based_Road_Construction.entity.Conflict;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ConflictResolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface Conflictrepository extends JpaRepository<Conflict,Long>{
    // Get all unresolved conflicts
    // Used in: Admin dashboard — "show all conflicts needing attention"
    List<Conflict> findByResolutionStatus(ConflictResolution resolutionStatus);

    // Check if a conflict already exists between two specific requests
    // Used in: ConflictDetectionService to avoid saving duplicate conflicts
    // We check both directions: (A,B) and (B,A)
    @Query("""
            SELECT c FROM Conflict c
            WHERE (c.requestA.id = :requestAId AND c.requestB.id = :requestBId)
            OR    (c.requestA.id = :requestBId AND c.requestB.id = :requestAId)
            """)
          Optional<Conflict> findByRequestPair(
            @Param("requestAId") Long requestAId,
            @Param("requestBId") Long requestBId
    );

    // Get all conflicts involving a specific work request (either side)
    // Used in: WorkRequest detail view — "show conflicts for this request"
    @Query("""
            SELECT c FROM Conflict c
            WHERE c.requestA.id = :requestId
            OR    c.requestB.id = :requestId
            """)
    List<Conflict> findByRequestId(@Param("requestId") Long requestId);

    // Get all conflicts for a specific department
    // A department is involved if either request A or B belongs to them
    @Query("""
            SELECT c FROM Conflict c
            WHERE c.requestA.department.id = :departmentId
            OR    c.requestB.department.id = :departmentId
            """)
    List<Conflict> findByDepartmentId(@Param("departmentId") Long departmentId);

    // Count all pending conflicts — used in admin dashboard stats
    long countByResolutionStatus(ConflictResolution resolutionStatus);
}
