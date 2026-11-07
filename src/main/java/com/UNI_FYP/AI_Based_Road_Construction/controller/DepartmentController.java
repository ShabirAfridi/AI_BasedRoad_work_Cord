package com.UNI_FYP.AI_Based_Road_Construction.controller;

import com.UNI_FYP.AI_Based_Road_Construction.dto.ApiResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.DepartmentRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.DepartmentResponse;
import com.UNI_FYP.AI_Based_Road_Construction.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping("/api/admin/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created", departmentService.createDepartment(request)));
    }

    @GetMapping("/api/admin/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAllDepartments() {
        return ResponseEntity.ok(
                ApiResponse.success("Departments retrieved", departmentService.getAllDepartments()));
    }

    // Public: used by the Register page dropdown
    @GetMapping("/api/public/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getActiveDepartments() {
        return ResponseEntity.ok(
                ApiResponse.success("Departments retrieved", departmentService.getActiveDepartments()));
    }
}