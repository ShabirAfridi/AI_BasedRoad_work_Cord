package com.UNI_FYP.AI_Based_Road_Construction.controller;

import com.UNI_FYP.AI_Based_Road_Construction.dto.*;
import com.UNI_FYP.AI_Based_Road_Construction.entity.RoadSegment;
import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Roadsegmentrepository;
import com.UNI_FYP.AI_Based_Road_Construction.service.AiAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiAnalyticsService aiAnalyticsService;
    private final Roadsegmentrepository roadsegmentrepository;

    @PostMapping("/predict-delay")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_USER')")
    public ResponseEntity<ApiResponse<DelayPredictionResponse>> predictDelay(
            @RequestBody DelayPredictionRequest request
    ){
        DelayPredictionResponse result = aiAnalyticsService.predictDelay(
                request.workType(),request.plannedDurationDays(),request.priority());
        return ResponseEntity.ok(ApiResponse.success("Delay prediction generated",result));
    }
    @GetMapping("/recommend-schedule")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_USER')")
    public ResponseEntity<ApiResponse<String>> recommendationSchedule(
            @RequestParam Long roadSegmentId,
            @RequestParam LocalDate earliestStart
            ){
        RoadSegment segment = roadsegmentrepository.findById(roadSegmentId)
                .orElseThrow(()->new AppException(
                        "Road Segment not found", HttpStatus.NOT_FOUND
                ));
                String recommendation = aiAnalyticsService.recommendSchedule(segment,earliestStart);
                return ResponseEntity.ok(ApiResponse.success("schedule recommendation generated",recommendation));
    }
    @PostMapping("/categorize-complaint")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintCategorizationResponse>> categorizeComplaint(
            @RequestBody CategorizeRequest request
            ){
        ComplaintCategorizationResponse result = aiAnalyticsService.categorizeComplaint(request.description());
        return ResponseEntity.ok(ApiResponse.success("Complaint categorized ",result));
    }
}
