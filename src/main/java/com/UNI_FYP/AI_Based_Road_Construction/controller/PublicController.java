package com.UNI_FYP.AI_Based_Road_Construction.controller;

import com.UNI_FYP.AI_Based_Road_Construction.dto.ApiResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.RoadSegmentResponse;
import com.UNI_FYP.AI_Based_Road_Construction.service.RoadSegmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final RoadSegmentService roadSegmentService;

    @GetMapping("/road-segments")
    public ResponseEntity<ApiResponse<List<RoadSegmentResponse>>> getRoadSegment() {
        return ResponseEntity.ok(
                ApiResponse.success("Road segment retrieved", roadSegmentService.getActiveRoadSegments()));
    }
}