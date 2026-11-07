package com.UNI_FYP.AI_Based_Road_Construction.controller;

import com.UNI_FYP.AI_Based_Road_Construction.dto.ApiResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.RoadSegmentRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.RoadSegmentResponse;
import com.UNI_FYP.AI_Based_Road_Construction.service.RoadSegmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RoadSegmentController {

    private final RoadSegmentService roadSegmentService;

    @PostMapping("/api/admin/road-segments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoadSegmentResponse>> createRoadSegment(
            @Valid @RequestBody RoadSegmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Road segment created", roadSegmentService.createRoadSegment(request)));
    }

    @GetMapping("/api/admin/road-segments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoadSegmentResponse>>> getAllRoadSegments() {
        return ResponseEntity.ok(
                ApiResponse.success("Road segments retrieved", roadSegmentService.getAllRoadSegments()));
    }
}