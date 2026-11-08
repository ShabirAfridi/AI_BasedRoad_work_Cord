package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.InspectionReportRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.InspectionReportResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.InspectorResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.WorkRequestResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.InspectionReport;
import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import com.UNI_FYP.AI_Based_Road_Construction.entity.WorkRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RequestStatus;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.UserRole;
import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import com.UNI_FYP.AI_Based_Road_Construction.repository.InspectionReportRepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.UserRepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Workrequestrepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class InspectionService {

    private final InspectionReportRepository reportRepository;
    private final Workrequestrepository      workRequestRepository;
    private final UserRepository             userRepository;
    private final WorkRequestService         workRequestService;

    // Admin: dropdown of available inspectors
    public List<InspectorResponse> getInspectors() {
        return userRepository.findByRole(UserRole.INSPECTOR).stream()
                .map(u -> InspectorResponse.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .build())
                .collect(Collectors.toList());
    }

    // Admin: assign an inspector to a request
    @Transactional
    public WorkRequestResponse assignInspector(Long requestId, Long inspectorId) {
        WorkRequest request = workRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException("Work request not found", HttpStatus.NOT_FOUND));

        User inspector = userRepository.findById(inspectorId)
                .orElseThrow(() -> new AppException("Inspector not found", HttpStatus.NOT_FOUND));

        if (inspector.getRole() != UserRole.INSPECTOR) {
            throw new AppException("Selected user is not an inspector", HttpStatus.BAD_REQUEST);
        }

        RequestStatus status = request.getStatus();
        if (status != RequestStatus.APPROVED
                && status != RequestStatus.IN_PROGRESS
                && status != RequestStatus.COMPLETED) {
            throw new AppException(
                    "Inspector can only be assigned to approved, in-progress or completed requests",
                    HttpStatus.BAD_REQUEST);
        }

        request.setAssignedInspector(inspector);
        return workRequestService.toResponse(workRequestRepository.save(request));
    }

    // Inspector: requests assigned to me
    @Transactional(readOnly = true)
    public List<WorkRequestResponse> getAssignments(User inspector) {
        return workRequestRepository.findByAssignedInspectorId(inspector.getId()).stream()
                .map(workRequestService::toResponse)
                .collect(Collectors.toList());
    }

    // Inspector: submit a report for one of my assigned requests
    @Transactional
    public InspectionReportResponse submitReport(InspectionReportRequest req, User inspector) {
        WorkRequest request = workRequestRepository.findById(req.getWorkRequestId())
                .orElseThrow(() -> new AppException("Work request not found", HttpStatus.NOT_FOUND));

        if (request.getAssignedInspector() == null
                || !request.getAssignedInspector().getId().equals(inspector.getId())) {
            throw new AppException("This request is not assigned to you", HttpStatus.FORBIDDEN);
        }

        if (isBlank(req.getBeforePhotoUrl()) || isBlank(req.getAfterPhotoUrl())) {
            throw new AppException("Both before and after photos are required", HttpStatus.BAD_REQUEST);
        }

        InspectionReport report = InspectionReport.builder()
                .workRequest(request)
                .inspector(inspector)
                .beforePhotoUrl(req.getBeforePhotoUrl())
                .afterPhotoUrl(req.getAfterPhotoUrl())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .restorationStatus(req.getRestorationStatus())
                .remarks(req.getRemarks())
                .build();

        return toResponse(reportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<InspectionReportResponse> getMyReports(User inspector) {
        return reportRepository.findByInspectorIdOrderByCreatedAtDesc(inspector.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InspectionReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private InspectionReportResponse toResponse(InspectionReport r) {
        return InspectionReportResponse.builder()
                .id(r.getId())
                .workRequestId(r.getWorkRequest().getId())
                .roadSegmentName(r.getWorkRequest().getRoadSegment().getName())
                .departmentName(r.getWorkRequest().getDepartment().getName())
                .inspectorName(r.getInspector().getFullName())
                .beforePhotoUrl(r.getBeforePhotoUrl())
                .afterPhotoUrl(r.getAfterPhotoUrl())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .restorationStatus(r.getRestorationStatus())
                .remarks(r.getRemarks())
                .createdAt(r.getCreatedAt())
                .build();
    }
}