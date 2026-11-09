package com.UNI_FYP.AI_Based_Road_Construction.repository;

import com.UNI_FYP.AI_Based_Road_Construction.entity.WorkRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RequestStatus;
import org.reactivestreams.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
@Repository
public interface Workrequestrepository extends JpaRepository<WorkRequest,Long> {

    // ─────────────────────────────────────────────────────────────
    // THE MOST IMPORTANT QUERY IN THE ENTIRE PROJECT
    // This is the conflict detection query
    //
    // It finds all work requests that:
    // 1. Are on the SAME road segment
    // 2. Have OVERLAPPING dates with the new request
    // 3. Are NOT in a terminal status (rejected/cancelled/completed)
    // 4. Are NOT the current request itself (excludeId)
    //
    // Date overlap logic:
    // Two date ranges [A_start, A_end] and [B_start, B_end] overlap when:
    // A_start <= B_end AND A_end >= B_start
    //
    // Example:
    // Existing request: June 1 → June 20
    // New request:      June 15 → July 5
    // June 1 <= July 5 ✅ AND June 20 >= June 15 ✅ → CONFLICT
    // ─────────────────────────────────────────────────────────────
    @Query("""
            SELECT w FROM WorkRequest w
            WHERE w.roadSegment.id = :segmentId
            AND w.startDate <= :endDate
            AND w.endDate >= :startDate
            AND w.status NOT IN ('REJECTED', 'CANCELLED', 'COMPLETED')
            AND w.id != :excludeId
            """)
    List<WorkRequest> findConflicting(
            @Param("segmentId") Long segmentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate,
            @Param("excludeId") Long excludeId
    );

    // ─────────────────────────────────────────────────────────────
    // STANDARD QUERIES — used by controllers and services
    // ─────────────────────────────────────────────────────────────

    // Get all requests submitted by a specific department
    // Used in: DepartmentUser dashboard — "show my department's requests"
    List<WorkRequest> findByDepartmentId(Long departmentId);

    // Get all requests with a specific status
    // Used in: Admin dashboard — "show all PENDING requests"
    List<WorkRequest> findByStatus(RequestStatus status);


    List<WorkRequest> findByAssignedInspectorId(Long inspectorId);

    // Get all requests on a specific road segment
    // Used in: Map view — "show all work on Murree Road"
    List<WorkRequest> findByRoadSegmentId(Long roadSegmentId);

    // Get all requests by department AND status
    // Used in: Department dashboard with filter
    List<WorkRequest> findByDepartmentIdAndStatus(Long departmentId, RequestStatus status);

    // Get all active requests (for map display)
    // APPROVED + IN_PROGRESS = currently active on the road
    @Query("""
            SELECT w FROM WorkRequest w
            WHERE w.status IN ('APPROVED', 'IN_PROGRESS')
            ORDER BY w.startDate ASC
            """)
    List<WorkRequest> findAllActive();

    // Get all requests for a road segment that are active or pending
    // Used in: conflict check when admin views a road segment
    @Query("""
            SELECT w FROM WorkRequest w
            WHERE w.roadSegment.id = :segmentId
            AND w.status NOT IN ('REJECTED', 'CANCELLED', 'COMPLETED')
            ORDER BY w.startDate ASC
            """)
    List<WorkRequest> findActiveBySegment(@Param("segmentId") Long segmentId);

    @Query("""
        SELECT w FROM WorkRequest w
        JOIN FETCH w.department
        JOIN FETCH w.submittedBy
        JOIN FETCH w.roadSegment
        WHERE w.id = :id
        """)
    Optional<WorkRequest> findByIdWithDetails(@Param("id") Long id);

    @Query("""
        SELECT w FROM WorkRequest w
        JOIN FETCH w.department
        JOIN FETCH w.submittedBy
        JOIN FETCH w.roadSegment
        ORDER BY w.createdAt DESC
        """)
    List<WorkRequest> findAllWithDetails();

    @Query("""
        SELECT w FROM WorkRequest w
        JOIN FETCH w.department
        JOIN FETCH w.submittedBy
        JOIN FETCH w.roadSegment
        WHERE w.status IN ('APPROVED', 'IN_PROGRESS')
        ORDER BY w.startDate ASC
        """)
    List<WorkRequest> findAllActiveWithDetails();
}
