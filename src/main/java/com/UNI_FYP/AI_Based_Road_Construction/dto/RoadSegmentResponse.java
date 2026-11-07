package com.UNI_FYP.AI_Based_Road_Construction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadSegmentResponse {
    private Long id;
    private String name;
    private String area;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isActive;
}