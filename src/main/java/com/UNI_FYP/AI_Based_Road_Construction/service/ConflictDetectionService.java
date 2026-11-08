package com.UNI_FYP.AI_Based_Road_Construction.service;
import com.UNI_FYP.AI_Based_Road_Construction.entity.Conflict;
import com.UNI_FYP.AI_Based_Road_Construction.entity.WorkRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ConflictResolution;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RequestStatus;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Conflictrepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Workrequestrepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConflictDetectionService {

    private final Workrequestrepository workRequestRepository;
    private final Conflictrepository conflictRepository;
    private final NotificationService   notificationService;

    // ─────────────────────────────────────────────────────────────
    // MAIN METHOD — called by WorkRequestService after every save
    //
    // Flow:
    // 1. Query DB for any overlapping requests on same road segment
    // 2. For each overlapping request found:
    //    a. Check if conflict already exists (avoid duplicates)
    //    b. Save new Conflict row
    //    c. Update both requests status to CONFLICT_FLAGGED
    //    d. Send email to both departments + admin
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public void detect(WorkRequest newRequest) {

        log.info("Running conflict detection for WorkRequest id={} on segment={}",
                newRequest.getId(),
                newRequest.getRoadSegment().getName());

        // Call the overlap query from WorkRequestRepository
        // Finds all active requests on the same road with overlapping dates
        List<WorkRequest> conflicting =  workRequestRepository.findConflicting(
                newRequest.getRoadSegment().getId(),
                newRequest.getStartDate(),
                newRequest.getEndDate(),
                newRequest.getId()
        );

        if (conflicting.isEmpty()) {
            // No conflicts found — request stays PENDING
            log.info("No conflicts found for WorkRequest id={}", newRequest.getId());
            return;
        }

        log.info("Found {} conflict(s) for WorkRequest id={}",
                conflicting.size(), newRequest.getId());

        // Process each conflicting request
        for (WorkRequest existing : conflicting) {

            // ── Step 1: Skip if conflict already recorded ──────────
            // This can happen if the user updates their request —
            // we re-run detection but should not save duplicate rows
            boolean alreadyExists = conflictRepository
                    .findByRequestPair(newRequest.getId(), existing.getId())
                    .isPresent();

            if (alreadyExists) {
                log.info("Conflict between {} and {} already recorded — skipping",
                        newRequest.getId(), existing.getId());
                continue;
            }

            // ── Step 2: Save the Conflict row ──────────────────────
            Conflict conflict = Conflict.builder()
                    .requestA(newRequest)
                    .requestB(existing)
                    .resolutionStatus(ConflictResolution.PENDING)
                    .build();

            conflictRepository.save(conflict);

            log.info("Conflict saved between WorkRequest {} and WorkRequest {}",
                    newRequest.getId(), existing.getId());

            // ── Step 3: Update both requests to CONFLICT_FLAGGED ───
            // So the admin dashboard highlights them for review
            newRequest.setStatus(RequestStatus.CONFLICT_FLAGGED);
            workRequestRepository.save(newRequest);

            existing.setStatus(RequestStatus.CONFLICT_FLAGGED);
            workRequestRepository.save(existing);

            // ── Step 4: Send email notifications ───────────────────
            // Department A — the one who just submitted
            notificationService.sendConflictAlert(
                    newRequest.getDepartment().getContactEmail(),
                    newRequest.getDepartment().getName(),
                    existing.getDepartment().getName(),
                    newRequest.getRoadSegment().getName(),
                    newRequest.getStartDate().toString(),
                    newRequest.getEndDate().toString()
            );

            // Department B — the existing conflicting department
            notificationService.sendConflictAlert(
                    existing.getDepartment().getContactEmail(),
                    existing.getDepartment().getName(),
                    newRequest.getDepartment().getName(),
                    existing.getRoadSegment().getName(),
                    existing.getStartDate().toString(),
                    existing.getEndDate().toString()
            );

            log.info("Conflict notifications sent to {} and {}",
                    newRequest.getDepartment().getName(),
                    existing.getDepartment().getName());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // RESOLVE — called by AdminService when admin resolves a conflict
    //
    // Updates conflict resolution status
    // Updates work request statuses based on admin decision
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public void resolve(
            Long conflictId,
            ConflictResolution resolution,
            String adminRemarks,
            Long rejectRequestId  // which request to reject (null if MERGED)
    ) {
        Conflict conflict = conflictRepository.findById(conflictId)
                .orElseThrow(() -> new RuntimeException(
                        "Conflict not found with id: " + conflictId));

        // Update conflict resolution status
        conflict.setResolutionStatus(resolution);
        conflict.setAdminRemarks(adminRemarks);
        conflictRepository.save(conflict);

        // Update work request statuses based on resolution
        switch (resolution) {

            case MERGED -> {
                // Both departments dig together — both get APPROVED
                conflict.getRequestA().setStatus(RequestStatus.APPROVED);
                conflict.getRequestB().setStatus(RequestStatus.APPROVED);
                workRequestRepository.save(conflict.getRequestA());
                workRequestRepository.save(conflict.getRequestB());
            }

            case ONE_REJECTED -> {
                // Admin chose to reject one — the other gets APPROVED
                if (rejectRequestId == null) {
                    throw new RuntimeException(
                            "rejectRequestId required for ONE_REJECTED resolution");
                }
                WorkRequest toReject = rejectRequestId.equals(conflict.getRequestA().getId())
                        ? conflict.getRequestA() : conflict.getRequestB();
                WorkRequest toApprove = rejectRequestId.equals(conflict.getRequestA().getId())
                        ? conflict.getRequestB() : conflict.getRequestA();

                toReject.setStatus(RequestStatus.REJECTED);
                toReject.setAdminRemarks(adminRemarks);
                toApprove.setStatus(RequestStatus.APPROVED);

                workRequestRepository.save(toReject);
                workRequestRepository.save(toApprove);
            }

            case RESCHEDULED -> {
                // Both go back to PENDING — departments must resubmit with new dates
                conflict.getRequestA().setStatus(RequestStatus.PENDING);
                conflict.getRequestB().setStatus(RequestStatus.PENDING);
                workRequestRepository.save(conflict.getRequestA());
                workRequestRepository.save(conflict.getRequestB());
            }

            default -> {
                // RESOLVED_OTHER — admin handled it manually
                conflict.getRequestA().setStatus(RequestStatus.APPROVED);
                conflict.getRequestB().setStatus(RequestStatus.APPROVED);
                workRequestRepository.save(conflict.getRequestA());
                workRequestRepository.save(conflict.getRequestB());
            }
        }

        log.info("Conflict {} resolved with status {}", conflictId, resolution);
    }
}