package com.UNI_FYP.AI_Based_Road_Construction.dto;

import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RequestStatus;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.WorkType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkRequestResponse {
    private Long id;
    private String departmentName;
    private String submittedByName;
    private String roadSegmentName;
    private String city;
    private WorkType workType;
    private String   description;
    private LocalDate startDate;
    private LocalDate endDate;
    private RequestStatus status;
    private Integer   priority;
    private String    adminRemarks;
    private String documentUrl;
    private String inspectorName;
    private LocalDateTime createdAt;

    // Latitude and longitude so Leaflet.js can place the map marker
    private Double latitude;
    private Double longitude;

}
