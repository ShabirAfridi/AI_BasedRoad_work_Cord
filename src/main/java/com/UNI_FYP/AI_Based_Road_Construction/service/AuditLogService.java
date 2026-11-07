package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.AuditLogResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.AuditLog;
import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import com.UNI_FYP.AI_Based_Road_Construction.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    // Other services call this right after an important action succeeds
    @Transactional
    public void log(User actor, String action, String entityType, Long entityId, String details) {
        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .actorEmail(actor.getEmail())
                .actorRole(actor.getRole().name())
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build());
    }

    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(l -> AuditLogResponse.builder()
                        .id(l.getId())
                        .actorEmail(l.getActorEmail())
                        .actorRole(l.getActorRole())
                        .action(l.getAction())
                        .entityType(l.getEntityType())
                        .entityId(l.getEntityId())
                        .details(l.getDetails())
                        .createdAt(l.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}