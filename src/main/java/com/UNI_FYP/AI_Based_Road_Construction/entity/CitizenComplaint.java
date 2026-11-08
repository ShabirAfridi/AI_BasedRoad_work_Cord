package com.UNI_FYP.AI_Based_Road_Construction.entity;

import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ComplaintCategory;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "citizen_complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenComplaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "photo_base64",columnDefinition = "TEXT")
    private String photoBase64;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "road_segment_id")
    private RoadSegment roadSegment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComplaintCategory category = ComplaintCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    // Optional link to a specific work request being complained about
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_request")
    private WorkRequest relatedRequest;

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @CreationTimestamp
    @Column(name = "reported_at", updatable = false)
    private LocalDateTime reportedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}