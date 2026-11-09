package com.UNI_FYP.AI_Based_Road_Construction.controller;

import com.UNI_FYP.AI_Based_Road_Construction.dto.ApiResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.DepartmentPerformanceResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.MonthlyTrendResponse;
import com.UNI_FYP.AI_Based_Road_Construction.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/performance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PerformanceController {

    private final PerformanceService performanceService;

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentPerformanceResponse>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Performance retrieved",
                performanceService.getDepartmentPerformance()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<MonthlyTrendResponse>>> getMonthly() {
        return ResponseEntity.ok(ApiResponse.success("Trend retrieved",
                performanceService.getMonthlyTrend()));
    }
}