package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.AdminDecisionRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.ConflictResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.WorkRequestResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.Conflict;
import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import com.UNI_FYP.AI_Based_Road_Construction.entity.WorkRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ConflictResolution;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RequestStatus;
import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Conflictrepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Workrequestrepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class AdminService {

    private final Workrequestrepository workRequestRepository;
    private final Conflictrepository conflictRepository;
    private final ConflictDetectionService conflictDetectionService;
    private final NotificationService      notificationService;
    private final WorkRequestService       workRequestService;
    private final AuditLogService          auditLogService;

    // ─────────────────────────────────────────────────────────────
    // GET ALL WORK REQUESTS — admin sees everything
    // ─────────────────────────────────────────────────────────────
    public List<WorkRequestResponse> getAllRequests() {
        return workRequestRepository.findAll()
                .stream()
                .map(workRequestService::toResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // GET ALL CONFLICTS
    // Admin dashboard — shows all unresolved conflicts
    // ─────────────────────────────────────────────────────────────
    public List<ConflictResponse> getAllConflicts() {
        return conflictRepository.findAll()
                .stream()
                .map(this::toConflictResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // GET PENDING CONFLICTS ONLY
    // Filtered view — only shows conflicts needing attention
    // ─────────────────────────────────────────────────────────────
    public List<ConflictResponse> getPendingConflicts() {
        return conflictRepository
                .findByResolutionStatus(ConflictResolution.PENDING)
                .stream()
                .map(this::toConflictResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // APPROVE REQUEST
    // PUT /api/admin/requests/{id}/approve
    // Only works on PENDING or CONFLICT_FLAGGED requests
    // Sends approval email to the department
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public WorkRequestResponse approveRequest(
            Long requestId,
            AdminDecisionRequest decision,
            User adminUser
    ) {
        WorkRequest workRequest = findRequest(requestId);

        // Can only approve PENDING or CONFLICT_FLAGGED requests
        if (workRequest.getStatus() == RequestStatus.APPROVED
                || workRequest.getStatus() == RequestStatus.COMPLETED
                || workRequest.getStatus() == RequestStatus.CANCELLED) {
            throw new AppException(
                    "Cannot approve a request with status: " + workRequest.getStatus(),
                    HttpStatus.BAD_REQUEST);
        }

        // Update status and record who approved it
        workRequest.setStatus(RequestStatus.APPROVED);
        workRequest.setAdminRemarks(decision.getAdminRemarks());
        workRequest.setReviewedBy(adminUser);
        workRequest.setReviewedAt(LocalDateTime.now());

        WorkRequest saved = workRequestRepository.save(workRequest);

        log.info("Request {} approved by admin {}", requestId, adminUser.getEmail());
        auditLogService.log(adminUser, "APPROVE_REQUEST", "WorkRequest", requestId, decision.getAdminRemarks());

        // Send approval email to the department
        notificationService.sendApprovalNotice(
                saved.getDepartment().getContactEmail(),
                saved.getDepartment().getName(),
                saved.getRoadSegment().getName(),
                saved.getStartDate().toString(),
                saved.getEndDate().toString()
        );

        return workRequestService.toResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // REJECT REQUEST
    // PUT /api/admin/requests/{id}/reject
    // adminRemarks is required — admin must give a reason
    // Sends rejection email to the department
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public WorkRequestResponse rejectRequest(
            Long requestId,
            AdminDecisionRequest decision,
            User adminUser
    ) {
        WorkRequest workRequest = findRequest(requestId);

        if (workRequest.getStatus() == RequestStatus.COMPLETED
                || workRequest.getStatus() == RequestStatus.CANCELLED) {
            throw new AppException(
                    "Cannot reject a request with status: " + workRequest.getStatus(),
                    HttpStatus.BAD_REQUEST);
        }

        // adminRemarks required for rejection — department needs to know why
        if (decision.getAdminRemarks() == null
                || decision.getAdminRemarks().isBlank()) {
            throw new AppException(
                    "Admin remarks are required when rejecting a request",
                    HttpStatus.BAD_REQUEST);
        }

        workRequest.setStatus(RequestStatus.REJECTED);
        workRequest.setAdminRemarks(decision.getAdminRemarks());
        workRequest.setReviewedBy(adminUser);
        workRequest.setReviewedAt(LocalDateTime.now());

        WorkRequest saved = workRequestRepository.save(workRequest);

        log.info("Request {} rejected by admin {}", requestId, adminUser.getEmail());
        auditLogService.log(adminUser, "REJECT_REQUEST", "WorkRequest", requestId, decision.getAdminRemarks());

        // Send rejection email with the admin's remarks
        notificationService.sendRejectionNotice(
                saved.getDepartment().getContactEmail(),
                saved.getDepartment().getName(),
                saved.getRoadSegment().getName(),
                decision.getAdminRemarks()
        );

        return workRequestService.toResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // RESOLVE CONFLICT
    // PUT /api/admin/conflicts/{id}/resolve
    // Admin decides how to handle a flagged conflict:
    // MERGED        → both requests approved, dig together
    // ONE_REJECTED  → one rejected, other approved
    // RESCHEDULED   → both back to PENDING, must pick new dates
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public ConflictResponse resolveConflict(
            Long conflictId,
            AdminDecisionRequest decision,
            User adminUser
    ) {
        if (decision.getResolution() == null) {
            throw new AppException(
                    "Resolution type is required", HttpStatus.BAD_REQUEST);
        }

        // Load the conflict
        Conflict conflict = conflictRepository.findById(conflictId)
                .orElseThrow(() -> new AppException(
                        "Conflict not found with id: " + conflictId,
                        HttpStatus.NOT_FOUND));

        if (conflict.getResolutionStatus() != ConflictResolution.PENDING) {
            throw new AppException(
                    "Conflict is already resolved", HttpStatus.BAD_REQUEST);
        }

        // Delegate the actual resolution logic to ConflictDetectionService
        conflictDetectionService.resolve(
                conflictId,
                decision.getResolution(),
                decision.getAdminRemarks(),
                decision.getRejectRequestId()
        );

        // Record who resolved it and when
        conflict.setResolvedBy(adminUser);
        conflict.setResolvedAt(LocalDateTime.now());
        conflictRepository.save(conflict);

        log.info("Conflict {} resolved by admin {} with resolution {}",
                conflictId, adminUser.getEmail(), decision.getResolution());
        auditLogService.log(adminUser, "RESOLVE_CONFLICT", "Conflict", conflictId, "Resolution: " + decision.getResolution());

        // Return updated conflict
        Conflict updated = conflictRepository.findById(conflictId).orElseThrow();
        return toConflictResponse(updated);
    }

    // ─────────────────────────────────────────────────────────────
    // MARK IN PROGRESS
    // PUT /api/admin/requests/{id}/start
    // Admin confirms department has started work on the road
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public WorkRequestResponse markInProgress(Long requestId, User adminUser) {
        WorkRequest workRequest = findRequest(requestId);

        if (workRequest.getStatus() != RequestStatus.APPROVED) {
            throw new AppException(
                    "Only APPROVED requests can be marked IN_PROGRESS",
                    HttpStatus.BAD_REQUEST);
        }

        workRequest.setStatus(RequestStatus.IN_PROGRESS);
        workRequest.setReviewedBy(adminUser);
        workRequest.setReviewedAt(LocalDateTime.now());

        WorkRequest saved = workRequestRepository.save(workRequest);
        auditLogService.log(adminUser, "MARK_IN_PROGRESS", "WorkRequest", requestId, null);
        return workRequestService.toResponse(saved);    }

    // ─────────────────────────────────────────────────────────────
    // MARK COMPLETED
    // PUT /api/admin/requests/{id}/complete
    // Admin confirms road has been restored after excavation
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public WorkRequestResponse markCompleted(Long requestId, User adminUser) {
        WorkRequest workRequest = findRequest(requestId);

        if (workRequest.getStatus() != RequestStatus.IN_PROGRESS) {
            throw new AppException(
                    "Only IN_PROGRESS requests can be marked COMPLETED",
                    HttpStatus.BAD_REQUEST);
        }

        workRequest.setStatus(RequestStatus.COMPLETED);
        workRequest.setReviewedBy(adminUser);
        workRequest.setReviewedAt(LocalDateTime.now());

        WorkRequest saved = workRequestRepository.save(workRequest);
        auditLogService.log(adminUser, "MARK_COMPLETED", "WorkRequest", requestId, null);
        return workRequestService.toResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────
    private WorkRequest findRequest(Long id) {
        return workRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        "Work request not found with id: " + id,
                        HttpStatus.NOT_FOUND));
    }

    // Convert Conflict entity → ConflictResponse DTO
    // Flattens both work requests into the response
    // so admin sees full details of both sides in one object
    private ConflictResponse toConflictResponse(Conflict c) {
        return ConflictResponse.builder()
                .id(c.getId())
                .resolutionStatus(c.getResolutionStatus())
                .adminRemarks(c.getAdminRemarks())
                .detectedAt(c.getDetectedAt())
                .resolvedAt(c.getResolvedAt())
                // Request A
                .requestAId(c.getRequestA().getId())
                .requestADepartment(c.getRequestA().getDepartment().getName())
                .requestARoadSegment(c.getRequestA().getRoadSegment().getName())
                .requestAStartDate(c.getRequestA().getStartDate().toString())
                .requestAEndDate(c.getRequestA().getEndDate().toString())
                // Request B
                .requestBId(c.getRequestB().getId())
                .requestBDepartment(c.getRequestB().getDepartment().getName())
                .requestBRoadSegment(c.getRequestB().getRoadSegment().getName())
                .requestBStartDate(c.getRequestB().getStartDate().toString())
                .requestBEndDate(c.getRequestB().getEndDate().toString())
                .build();
    }
}
