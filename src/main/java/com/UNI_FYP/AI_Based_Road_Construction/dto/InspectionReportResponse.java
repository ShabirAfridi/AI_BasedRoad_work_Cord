package com.UNI_FYP.AI_Based_Road_Construction.dto;

import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RestorationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionReportResponse {
    private Long id;
    private Long workRequestId;
    private String roadSegmentName;
    private String departmentName;
    private String inspectorName;
    private String beforePhotoUrl;
    private String afterPhotoUrl;
    private Double latitude;
    private Double longitude;
    private RestorationStatus restorationStatus;
    private String remarks;
    private LocalDateTime createdAt;
}