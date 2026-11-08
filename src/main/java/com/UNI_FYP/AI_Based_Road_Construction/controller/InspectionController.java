package com.UNI_FYP.AI_Based_Road_Construction.controller;

import com.UNI_FYP.AI_Based_Road_Construction.dto.*;
import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import com.UNI_FYP.AI_Based_Road_Construction.service.InspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    // ── ADMIN ────────────────────────────────────────────────

    @GetMapping("/api/admin/inspectors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InspectorResponse>>> getInspectors() {
        return ResponseEntity.ok(ApiResponse.success("Inspectors retrieved", inspectionService.getInspectors()));
    }

    @PutMapping("/api/admin/requests/{id}/assign-inspector")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkRequestResponse>> assignInspector(
            @PathVariable Long id,
            @Valid @RequestBody AssignInspectorRequest body) {
        return ResponseEntity.ok(ApiResponse.success("Inspector assigned",
                inspectionService.assignInspector(id, body.getInspectorId())));
    }

    @GetMapping("/api/admin/inspection-reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InspectionReportResponse>>> getAllReports() {
        return ResponseEntity.ok(ApiResponse.success("Reports retrieved", inspectionService.getAllReports()));
    }

    // ── INSPECTOR ────────────────────────────────────────────

    @GetMapping("/api/inspector/assignments")
    @PreAuthorize("hasRole('INSPECTOR')")
    public ResponseEntity<ApiResponse<List<WorkRequestResponse>>> getAssignments(
            @AuthenticationPrincipal User inspector) {
        return ResponseEntity.ok(ApiResponse.success("Assignments retrieved",
                inspectionService.getAssignments(inspector)));
    }

    @PostMapping("/api/inspector/reports")
    @PreAuthorize("hasRole('INSPECTOR')")
    public ResponseEntity<ApiResponse<InspectionReportResponse>> submitReport(
            @Valid @RequestBody InspectionReportRequest request,
            @AuthenticationPrincipal User inspector) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Report submitted", inspectionService.submitReport(request, inspector)));
    }

    @GetMapping("/api/inspector/reports")
    @PreAuthorize("hasRole('INSPECTOR')")
    public ResponseEntity<ApiResponse<List<InspectionReportResponse>>> getMyReports(
            @AuthenticationPrincipal User inspector) {
        return ResponseEntity.ok(ApiResponse.success("Reports retrieved", inspectionService.getMyReports(inspector)));
    }
}