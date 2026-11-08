package com.UNI_FYP.AI_Based_Road_Construction.dto;

import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RestorationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionReportRequest {
    @NotNull(message = "workRequestId is required")
    private Long workRequestId;

    private String beforePhotoUrl;
    private String afterPhotoUrl;
    private Double latitude;
    private Double longitude;

    @NotNull(message = "restorationStatus is required")
    private RestorationStatus restorationStatus;

    private String remarks;
}