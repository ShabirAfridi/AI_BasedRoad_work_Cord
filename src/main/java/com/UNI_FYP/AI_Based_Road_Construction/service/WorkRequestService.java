package com.UNI_FYP.AI_Based_Road_Construction.service;
import com.UNI_FYP.AI_Based_Road_Construction.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.UNI_FYP.AI_Based_Road_Construction.dto.WorkRequestRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.WorkRequestResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.RoadSegment;
import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import com.UNI_FYP.AI_Based_Road_Construction.entity.WorkRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RequestStatus;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Roadsegmentrepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Workrequestrepository;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkRequestService {

    private final Workrequestrepository  workRequestRepository;
    private final Roadsegmentrepository  roadSegmentRepository;
    private final ConflictDetectionService conflictDetectionService;
    private final NotificationService    notificationService;
    private final UserRepository userRepository;

    // ─────────────────────────────────────────────────────────────
    // SUBMIT — POST /api/work-requests
    // Only DEPARTMENT_USER can call this
    // After saving → conflict detection runs automatically
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public WorkRequestResponse submit(WorkRequestRequest request, User currentUser) {

        // 1. Validate end date is after start date
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new AppException(
                    "End date must be after start date", HttpStatus.BAD_REQUEST);
        }
        // Reload current user fresh from DB so department proxy is initialized
        User freshUser = userRepository
                .findById(currentUser.getId())
                .orElseThrow(()-> new AppException(
                        "user not found ",HttpStatus.BAD_REQUEST));

        // 2. Load road segment — must exist and be active
        RoadSegment roadSegment = roadSegmentRepository
                .findById(request.getRoadSegmentId())
                .orElseThrow(() -> new AppException(
                        "Road segment not found", HttpStatus.NOT_FOUND));

        if (!roadSegment.getIsActive()) {
            throw new AppException(
                    "Road segment is not active", HttpStatus.BAD_REQUEST);
        }

        // 3. Build and save the WorkRequest entity
        WorkRequest workRequest = WorkRequest.builder()
                .department(freshUser.getDepartment())
                .submittedBy(freshUser)
                .roadSegment(roadSegment)
                .workType(request.getWorkType())
                .description(request.getDescription())
                .documentUrl(request.getDocumentUrl())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .priority(request.getPriority() != null ? request.getPriority() : 2)
                .status(RequestStatus.PENDING)
                .build();

        WorkRequest saved = workRequestRepository.save(workRequest);

        // 4. Run conflict detection automatically after saving
        // If conflicts found → status updated to CONFLICT_FLAGGED
        // and emails sent to both departments + admin
        conflictDetectionService.detect(saved);

        // 5. Reload to get updated status after conflict detection
        WorkRequest updated = workRequestRepository
                .findByIdWithDetails(saved.getId())
                .orElseThrow();
        return toResponse(updated);
    }
    //──────────────────────────────────────────────────────────
    // GET ALL — GET /api/work-requests
    // ADMIN sees all requests
    // DEPARTMENT_USER sees only their own department's requests
    // ─────────────────────────────────────────────────────────────
    public List<WorkRequestResponse> getAll(User currentUser) {
        List<WorkRequest> requests;

        if (currentUser.getRole() == UserRole.ADMIN) {
            // Admin sees everything
            requests = workRequestRepository.findAllWithDetails();
        } else {
            // Department user sees only their department's requests
            requests = workRequestRepository
                    .findByDepartmentId(currentUser.getDepartment().getId());
        }

        return requests.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // GET BY ID — GET /api/work-requests/{id}
    // ─────────────────────────────────────────────────────────────
    public WorkRequestResponse getById(Long id, User currentUser) {
        WorkRequest workRequest = findAndVerifyAccess(id, currentUser);
        return toResponse(workRequest);
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE — PUT /api/work-requests/{id}
    // Only allowed if status is PENDING or CONFLICT_FLAGGED
    // Cannot update APPROVED, IN_PROGRESS, COMPLETED requests
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public WorkRequestResponse update(
            Long id, WorkRequestRequest request, User currentUser) {

        WorkRequest workRequest = findAndVerifyAccess(id, currentUser);

        // Can only update if still in an editable status
        if (workRequest.getStatus() == RequestStatus.APPROVED
                || workRequest.getStatus() == RequestStatus.IN_PROGRESS
                || workRequest.getStatus() == RequestStatus.COMPLETED) {
            throw new AppException(
                    "Cannot update a request that is " + workRequest.getStatus(),
                    HttpStatus.BAD_REQUEST);
        }

        // Validate dates
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new AppException(
                    "End date must be after start date", HttpStatus.BAD_REQUEST);
        }

        // Load new road segment if changed
        RoadSegment roadSegment = roadSegmentRepository
                .findById(request.getRoadSegmentId())
                .orElseThrow(() -> new AppException(
                        "Road segment not found", HttpStatus.NOT_FOUND));

        // Update fields
        workRequest.setRoadSegment(roadSegment);
        workRequest.setWorkType(request.getWorkType());
        workRequest.setDescription(request.getDescription());
        workRequest.setStartDate(request.getStartDate());
        workRequest.setEndDate(request.getEndDate());
        workRequest.setPriority(request.getPriority());
        workRequest.setStatus(RequestStatus.PENDING); // reset to PENDING after update

        WorkRequest updated = workRequestRepository.save(workRequest);

        // Re-run conflict detection with the new dates
        conflictDetectionService.detect(updated);

        return toResponse(workRequestRepository.findById(updated.getId()).orElseThrow());
    }

    // ─────────────────────────────────────────────────────────────
    // CANCEL — DELETE /api/work-requests/{id}
    // Does not delete from DB — sets status to CANCELLED
    // Keeps audit trail intact
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public void cancel(Long id, User currentUser) {
        WorkRequest workRequest = findAndVerifyAccess(id, currentUser);

        if (workRequest.getStatus() == RequestStatus.IN_PROGRESS
                || workRequest.getStatus() == RequestStatus.COMPLETED) {
            throw new AppException(
                    "Cannot cancel a request that is already "
                            + workRequest.getStatus(),
                    HttpStatus.BAD_REQUEST);
        }

        workRequest.setStatus(RequestStatus.CANCELLED);
        workRequestRepository.save(workRequest);
    }

    // ─────────────────────────────────────────────────────────────
    // GET ACTIVE — GET /api/work-requests/active
    // Returns APPROVED + IN_PROGRESS requests
    // Used by Leaflet.js map to show active work
    // ─────────────────────────────────────────────────────────────
    public List<WorkRequestResponse> getActive() {
        return workRequestRepository.findAllActiveWithDetails()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────

    // Find request and verify the current user has access to it
    // ADMIN can access any request
    // DEPARTMENT_USER can only access their own department's requests
    private WorkRequest findAndVerifyAccess(Long id, User currentUser) {
        WorkRequest workRequest = workRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        "Work request not found", HttpStatus.NOT_FOUND));

        if (currentUser.getRole() != UserRole.ADMIN
                && !workRequest.getDepartment().getId()
                .equals(currentUser.getDepartment().getId())) {
            throw new AppException(
                    "You do not have access to this request", HttpStatus.FORBIDDEN);
        }

        return workRequest;
    }

    // Convert WorkRequest entity → WorkRequestResponse DTO
    // Never return entity directly to frontend — always use DTO
    // Reason: entity has lazy-loaded relations and circular references
    // that will cause infinite recursion when serialized to JSON
    @Transactional(readOnly = true)
    public WorkRequestResponse toResponse(WorkRequest w) {
        return WorkRequestResponse.builder()
                .id(w.getId())
                .departmentName(w.getDepartment().getName())
                .submittedByName(w.getSubmittedBy().getFullName())
                .roadSegmentName(w.getRoadSegment().getName())
                .city(w.getRoadSegment().getCity())
                .workType(w.getWorkType())
                .description(w.getDescription())
                .documentUrl(w.getDocumentUrl())
                .inspectorName(w.getAssignedInspector() != null
                        ? w.getAssignedInspector().getFullName() : null)
                .startDate(w.getStartDate())
                .endDate(w.getEndDate())
                .status(w.getStatus())
                .priority(w.getPriority())
                .adminRemarks(w.getAdminRemarks())
                .createdAt(w.getCreatedAt())
                .latitude(w.getRoadSegment().getLatitude() != null
                        ? w.getRoadSegment().getLatitude().doubleValue() : null)
                .longitude(w.getRoadSegment().getLongitude() != null
                        ? w.getRoadSegment().getLongitude().doubleValue() : null)
                .build();
    }
}
