package com.UNI_FYP.AI_Based_Road_Construction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String actorEmail;
    private String actorRole;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private LocalDateTime createdAt;
}