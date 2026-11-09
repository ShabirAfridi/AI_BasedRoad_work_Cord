package com.UNI_FYP.AI_Based_Road_Construction.dto;

import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ComplaintCategory;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ComplaintResponse {
    private Long id;
    private String roadSegmentName;
    private String reportedByName;
    private String description;
    private ComplaintCategory category;
    private ComplaintStatus status;
    private Long relatedRequestId;
    private String adminResponse;
    private String photoUrl;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private String photoBase64;
}
