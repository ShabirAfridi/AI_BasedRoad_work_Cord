package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.DepartmentRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.DepartmentResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.Department;
import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import com.UNI_FYP.AI_Based_Road_Construction.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new AppException("A department with this name already exists", HttpStatus.CONFLICT);
        }

        Department department = Department.builder()
                .name(request.getName())
                .contactEmail(request.getContactEmail())
                .phoneNumber(request.getPhoneNumber())
                .isActive(true)
                .build();

        return toResponse(departmentRepository.save(department));
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<DepartmentResponse> getActiveDepartments() {
        return departmentRepository.findAll().stream()
                .filter(Department::getIsActive)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private DepartmentResponse toResponse(Department d) {
        return DepartmentResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .contactEmail(d.getContactEmail())
                .phoneNumber(d.getPhoneNumber())
                .isActive(d.getIsActive())
                .build();
    }
}