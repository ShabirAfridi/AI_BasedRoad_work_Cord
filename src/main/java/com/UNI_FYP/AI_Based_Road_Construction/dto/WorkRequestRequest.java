package com.UNI_FYP.AI_Based_Road_Construction.dto;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.WorkType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkRequestRequest {
    @NotNull(message = "Road segment ID is required")
    private Long roadSegmentId;

    @NotNull(message = "Work type is required")
    private WorkType workType;

    private String description;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    // 1 = HIGH, 2 = NORMAL, 3 = LOW — defaults to NORMAL
    private Integer priority = 2;
    private String documentUrl;
}
