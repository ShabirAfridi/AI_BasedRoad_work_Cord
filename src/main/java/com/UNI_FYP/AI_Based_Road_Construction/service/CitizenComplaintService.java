package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.ComplaintRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.ComplaintResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.CitizenComplaint;
import com.UNI_FYP.AI_Based_Road_Construction.entity.RoadSegment;
import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import com.UNI_FYP.AI_Based_Road_Construction.entity.WorkRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ComplaintCategory;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ComplaintStatus;
import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Citizencomplaintrepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Roadsegmentrepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Workrequestrepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenComplaintService {
    private final Citizencomplaintrepository complaintRepository;
    private final Roadsegmentrepository roadSegmentRepository;
    private final Workrequestrepository workRequestRepository;
    private final NotificationService notificationService;


    // Admin email to notify on every new complaint — could be moved to config
    private static final String ADMIN_NOTIFY_EMAIL = "admin@excavation.com";


    // SUBMIT — POST /api/public/complaints
    // Works for both logged-in citizens AND anonymous submissions
    // currentUser is null when submitted anonymously
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public ComplaintResponse submit(ComplaintRequest request, User currentUser) {

        RoadSegment roadSegment = null;
        if (request.getRoadSegmentId() != null) {
            roadSegment = roadSegmentRepository.findById(request.getRoadSegmentId())
                    .orElse(null); // don't hard-fail — road segment is optional
        }

        WorkRequest relatedRequest = null;
        if (request.getRelatedRequestId() != null) {
            relatedRequest = workRequestRepository.findById(request.getRelatedRequestId())
                    .orElse(null);
        }

        CitizenComplaint complaint = CitizenComplaint.builder()
                .roadSegment(roadSegment)
                .reportedBy(currentUser)  // null = anonymous
                .description(request.getDescription())
                .category(request.getCategory() != null
                        ? request.getCategory() : ComplaintCategory.OTHER)
                .status(ComplaintStatus.SUBMITTED)
                .relatedRequest(relatedRequest)
                .photoUrl(request.getPhotoUrl())
                .build();

        CitizenComplaint saved = complaintRepository.save(complaint);

        log.info("New complaint submitted (id={}) by {}",
                saved.getId(),
                currentUser != null ? currentUser.getEmail() : "anonymous");

        // Notify admin immediately
        notificationService.sendComplaintAlert(
                ADMIN_NOTIFY_EMAIL,
                roadSegment != null ? roadSegment.getName() : "Unspecified location",
                saved.getDescription(),
                saved.getCategory().name()
        );

        return toResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // GET ALL — GET /api/admin/complaints
    // Admin only
    // ─────────────────────────────────────────────────────────────
    public List<ComplaintResponse> getAll() {
        return complaintRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    // ─────────────────────────────────────────────────────────────
    // GET BY STATUS — GET /api/admin/complaints?status=SUBMITTED
    // ─────────────────────────────────────────────────────────────
    public List<ComplaintResponse> getByStatus(ComplaintStatus status) {
        return complaintRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    // GET MY COMPLAINTS — GET /api/complaints/mine
    // For logged-in citizens to see their own submission history
    // ─────────────────────────────────────────────────────────────
    public List<ComplaintResponse> getMyComplaints(User currentUser) {
        return complaintRepository.findByReportedById(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }


    // ─────────────────────────────────────────────────────────────
    // RESOLVE — PUT /api/admin/complaints/{id}/resolve
    // Admin only
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public ComplaintResponse resolve(Long id, String adminResponse, boolean dismiss) {
        CitizenComplaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        "Complaint not found", HttpStatus.NOT_FOUND));

        complaint.setStatus(dismiss ? ComplaintStatus.DISMISSED : ComplaintStatus.RESOLVED);
        complaint.setAdminResponse(adminResponse);
        complaint.setResolvedAt(LocalDateTime.now());

        CitizenComplaint saved = complaintRepository.save(complaint);
        log.info("Complaint {} marked as {}", id, saved.getStatus());

        return toResponse(saved);
    }
    // ─────────────────────────────────────────────────────────────
    // MARK UNDER REVIEW — PUT /api/admin/complaints/{id}/review
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public ComplaintResponse markUnderReview(Long id) {
        CitizenComplaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        "Complaint not found", HttpStatus.NOT_FOUND));

        complaint.setStatus(ComplaintStatus.UNDER_REVIEW);
        return toResponse(complaintRepository.save(complaint));
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPER
    // ─────────────────────────────────────────────────────────────
    private ComplaintResponse toResponse(CitizenComplaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .roadSegmentName(c.getRoadSegment() != null
                        ? c.getRoadSegment().getName() : "Unspecified")
                .reportedByName(c.getReportedBy() != null
                        ? c.getReportedBy().getFullName() : "Anonymous")
                .description(c.getDescription())
                .category(c.getCategory())
                .status(c.getStatus())
                .relatedRequestId(c.getRelatedRequest() != null
                        ? c.getRelatedRequest().getId() : null)
                .adminResponse(c.getAdminResponse())
                .photoUrl(c.getPhotoUrl())
                .reportedAt(c.getReportedAt())
                .resolvedAt(c.getResolvedAt())
                .build();
    }

}