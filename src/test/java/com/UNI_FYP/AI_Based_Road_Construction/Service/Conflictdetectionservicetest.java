package com.UNI_FYP.AI_Based_Road_Construction.Service;

import com.UNI_FYP.AI_Based_Road_Construction.entity.Conflict;
import com.UNI_FYP.AI_Based_Road_Construction.entity.Department;
import com.UNI_FYP.AI_Based_Road_Construction.entity.RoadSegment;
import com.UNI_FYP.AI_Based_Road_Construction.entity.WorkRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ConflictResolution;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RequestStatus;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.WorkType;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Conflictrepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Workrequestrepository;
import com.UNI_FYP.AI_Based_Road_Construction.service.ConflictDetectionService;
import com.UNI_FYP.AI_Based_Road_Construction.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ConflictDetectionService — the core engine of the project.
 *
 * We use Mockito to fake the repositories and NotificationService so
 * these tests run in milliseconds with no real database or email calls.
 * This is a TRUE unit test — it tests ConflictDetectionService's logic
 * in complete isolation from everything else.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ConflictDetectionService")
class ConflictDetectionServiceTest {

    @Mock
    private Workrequestrepository workRequestRepository;

    @Mock
    private Conflictrepository conflictRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ConflictDetectionService conflictDetectionService;

    private Department wapda;
    private Department ptcl;
    private RoadSegment murreeRoad;

    @BeforeEach
    void setUp() {
        wapda = Department.builder()
                .id(1L)
                .name("WAPDA")
                .contactEmail("ops@wapda.gov.pk")
                .build();

        ptcl = Department.builder()
                .id(2L)
                .name("PTCL")
                .contactEmail("ops@ptcl.net.pk")
                .build();

        murreeRoad = RoadSegment.builder()
                .id(1L)
                .name("Murree Road G-9")
                .city("Islamabad")
                .build();
    }

    // Helper to quickly build a WorkRequest for tests
    private WorkRequest buildRequest(
            Long id, Department dept, LocalDate start, LocalDate end, RequestStatus status
    ) {
        return WorkRequest.builder()
                .id(id)
                .department(dept)
                .roadSegment(murreeRoad)
                .workType(WorkType.WATER_PIPE)
                .startDate(start)
                .endDate(end)
                .status(status)
                .priority(2)
                .build();
    }

    @Nested
    @DisplayName("detect() — overlap scenarios")
    class DetectOverlapScenarios {

        @Test
        @DisplayName("No overlap — request is left completely alone, no conflict saved")
        void noOverlap_doesNotCreateConflict() {
            // Existing WAPDA request: June 1 - June 10 (already in DB)
            // New PTCL request:       June 20 - June 30 (no overlap at all)
            WorkRequest newRequest = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 20), LocalDate.of(2026, 6, 30),
                    RequestStatus.PENDING
            );

            // findConflicting returns empty — repository found nothing overlapping
            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(Collections.emptyList());

            conflictDetectionService.detect(newRequest);

            // No conflict should ever be saved
            verify(conflictRepository, never()).save(any(Conflict.class));
            // No notification should ever be sent
            verify(notificationService, never()).sendConflictAlert(
                    anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Full overlap — same exact dates on same road → conflict created")
        void fullOverlap_createsConflict() {
            WorkRequest existing = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.PENDING
            );
            WorkRequest newRequest = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.PENDING
            );

            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(List.of(existing));

            when(conflictRepository.findByRequestPair(2L, 1L))
                    .thenReturn(Optional.empty());

            conflictDetectionService.detect(newRequest);

            verify(conflictRepository, times(1)).save(any(Conflict.class));
            verify(workRequestRepository, times(2)).save(any(WorkRequest.class));
        }

        @Test
        @DisplayName("Partial overlap — new request starts mid-way through existing → conflict created")
        void partialOverlap_createsConflict() {
            // Existing: June 1 - June 20
            // New:              June 15 - July 5   (overlaps June 15-20)
            WorkRequest existing = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.PENDING
            );
            WorkRequest newRequest = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 15), LocalDate.of(2026, 7, 5),
                    RequestStatus.PENDING
            );

            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(List.of(existing));

            when(conflictRepository.findByRequestPair(2L, 1L))
                    .thenReturn(Optional.empty());

            conflictDetectionService.detect(newRequest);

            verify(conflictRepository, times(1)).save(any(Conflict.class));
        }

        @Test
        @DisplayName("Same department, overlapping dates — still flags a conflict")
        void sameDepartmentOverlap_stillCreatesConflict() {
            // Business rule: the engine doesn't care WHO submitted it —
            // if two requests overlap on the same road, it's a conflict,
            // even from the same department (they may have just made
            // a scheduling mistake with two different teams).
            WorkRequest existing = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.PENDING
            );
            WorkRequest newRequest = buildRequest(
                    2L, wapda, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 25),
                    RequestStatus.PENDING
            );

            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(List.of(existing));

            when(conflictRepository.findByRequestPair(2L, 1L))
                    .thenReturn(Optional.empty());

            conflictDetectionService.detect(newRequest);

            verify(conflictRepository, times(1)).save(any(Conflict.class));
        }

        @Test
        @DisplayName("REJECTED existing request — never conflicts (excluded at query level)")
        void rejectedStatusExcluded_noConflict() {
            // This is technically enforced by the repository query itself
            // (status NOT IN ('REJECTED', 'CANCELLED', 'COMPLETED')), but
            // we verify the service correctly does nothing when the
            // repository (correctly) returns no results for this case.
            WorkRequest newRequest = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.PENDING
            );

            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(Collections.emptyList());

            conflictDetectionService.detect(newRequest);

            verify(conflictRepository, never()).save(any(Conflict.class));
        }

        @Test
        @DisplayName("Duplicate conflict already recorded — skips re-saving, no duplicate rows")
        void duplicateConflictAlreadyExists_skipsCreatingAgain() {
            WorkRequest existing = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.CONFLICT_FLAGGED
            );
            WorkRequest newRequest = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 25),
                    RequestStatus.CONFLICT_FLAGGED
            );

            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(List.of(existing));

            // Simulate: this exact pair was already recorded (e.g. from
            // a previous update() call that re-ran detection)
            Conflict alreadyExisting = Conflict.builder()
                    .id(99L)
                    .requestA(newRequest)
                    .requestB(existing)
                    .resolutionStatus(ConflictResolution.PENDING)
                    .build();

            when(conflictRepository.findByRequestPair(2L, 1L))
                    .thenReturn(Optional.of(alreadyExisting));

            conflictDetectionService.detect(newRequest);

            // Must NOT save a second conflict row for the same pair
            verify(conflictRepository, never()).save(any(Conflict.class));
            // Must NOT re-send the email again
            verify(notificationService, never()).sendConflictAlert(
                    anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Conflict detected — both requests flagged CONFLICT_FLAGGED")
        void conflictDetected_bothRequestsFlagged() {
            WorkRequest existing = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.PENDING
            );
            WorkRequest newRequest = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 25),
                    RequestStatus.PENDING
            );

            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(List.of(existing));

            when(conflictRepository.findByRequestPair(2L, 1L))
                    .thenReturn(Optional.empty());

            conflictDetectionService.detect(newRequest);

            assertThat(newRequest.getStatus()).isEqualTo(RequestStatus.CONFLICT_FLAGGED);
            assertThat(existing.getStatus()).isEqualTo(RequestStatus.CONFLICT_FLAGGED);
        }

        @Test
        @DisplayName("Conflict detected — notification sent to BOTH departments")
        void conflictDetected_notifiesBothDepartments() {
            WorkRequest existing = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.PENDING
            );
            WorkRequest newRequest = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 25),
                    RequestStatus.PENDING
            );

            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(List.of(existing));

            when(conflictRepository.findByRequestPair(2L, 1L))
                    .thenReturn(Optional.empty());

            conflictDetectionService.detect(newRequest);

            // One email to PTCL (new request's dept), one to WAPDA (existing's dept)
            verify(notificationService, times(2)).sendConflictAlert(
                    anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("Multiple existing conflicts on same road — creates a conflict row for each")
        void multipleOverlappingRequests_createsMultipleConflicts() {
            // Two separate existing requests both overlap with the new one
            WorkRequest existing1 = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 15),
                    RequestStatus.PENDING
            );
            WorkRequest existing2 = buildRequest(
                    3L, ptcl, LocalDate.of(2026, 6, 18), LocalDate.of(2026, 6, 30),
                    RequestStatus.PENDING
            );
            WorkRequest newRequest = buildRequest(
                    2L, wapda, LocalDate.of(2026, 6, 5), LocalDate.of(2026, 6, 25),
                    RequestStatus.PENDING
            );

            when(workRequestRepository.findConflicting(
                    eq(1L), any(), any(), eq(2L)
            )).thenReturn(List.of(existing1, existing2));

            when(conflictRepository.findByRequestPair(anyLong(), anyLong()))
                    .thenReturn(Optional.empty());

            conflictDetectionService.detect(newRequest);

            // One Conflict row per overlapping existing request
            verify(conflictRepository, times(2)).save(any(Conflict.class));
        }
    }

    @Nested
    @DisplayName("resolve() — conflict resolution outcomes")
    class ResolveScenarios {

        @Test
        @DisplayName("MERGED resolution — both requests become APPROVED")
        void mergedResolution_bothApproved() {
            WorkRequest reqA = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.CONFLICT_FLAGGED
            );
            WorkRequest reqB = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 25),
                    RequestStatus.CONFLICT_FLAGGED
            );
            Conflict conflict = Conflict.builder()
                    .id(1L).requestA(reqA).requestB(reqB)
                    .resolutionStatus(ConflictResolution.PENDING)
                    .build();

            when(conflictRepository.findById(1L)).thenReturn(Optional.of(conflict));

            conflictDetectionService.resolve(
                    1L, ConflictResolution.MERGED, "Both dig together", null);

            assertThat(reqA.getStatus()).isEqualTo(RequestStatus.APPROVED);
            assertThat(reqB.getStatus()).isEqualTo(RequestStatus.APPROVED);
            assertThat(conflict.getResolutionStatus()).isEqualTo(ConflictResolution.MERGED);
        }

        @Test
        @DisplayName("ONE_REJECTED resolution — rejected request marked REJECTED, other APPROVED")
        void oneRejectedResolution_correctRequestRejected() {
            WorkRequest reqA = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.CONFLICT_FLAGGED
            );
            WorkRequest reqB = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 25),
                    RequestStatus.CONFLICT_FLAGGED
            );
            Conflict conflict = Conflict.builder()
                    .id(1L).requestA(reqA).requestB(reqB)
                    .resolutionStatus(ConflictResolution.PENDING)
                    .build();

            when(conflictRepository.findById(1L)).thenReturn(Optional.of(conflict));

            // Admin chooses to reject request B (PTCL, id=2)
            conflictDetectionService.resolve(
                    1L, ConflictResolution.ONE_REJECTED, "PTCL must wait", 2L);

            assertThat(reqB.getStatus()).isEqualTo(RequestStatus.REJECTED);
            assertThat(reqA.getStatus()).isEqualTo(RequestStatus.APPROVED);
        }

        @Test
        @DisplayName("ONE_REJECTED with no rejectRequestId — throws exception")
        void oneRejectedWithoutTargetId_throwsException() {
            WorkRequest reqA = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.CONFLICT_FLAGGED
            );
            WorkRequest reqB = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 25),
                    RequestStatus.CONFLICT_FLAGGED
            );
            Conflict conflict = Conflict.builder()
                    .id(1L).requestA(reqA).requestB(reqB)
                    .resolutionStatus(ConflictResolution.PENDING)
                    .build();

            when(conflictRepository.findById(1L)).thenReturn(Optional.of(conflict));

            // No rejectRequestId provided — must fail, not silently pick one
            org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () ->
                    conflictDetectionService.resolve(
                            1L, ConflictResolution.ONE_REJECTED, "remarks", null)
            );
        }

        @Test
        @DisplayName("RESCHEDULED resolution — both requests reset to PENDING")
        void rescheduledResolution_bothBackToPending() {
            WorkRequest reqA = buildRequest(
                    1L, wapda, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20),
                    RequestStatus.CONFLICT_FLAGGED
            );
            WorkRequest reqB = buildRequest(
                    2L, ptcl, LocalDate.of(2026, 6, 10), LocalDate.of(2026, 6, 25),
                    RequestStatus.CONFLICT_FLAGGED
            );
            Conflict conflict = Conflict.builder()
                    .id(1L).requestA(reqA).requestB(reqB)
                    .resolutionStatus(ConflictResolution.PENDING)
                    .build();

            when(conflictRepository.findById(1L)).thenReturn(Optional.of(conflict));

            conflictDetectionService.resolve(
                    1L, ConflictResolution.RESCHEDULED, "Please resubmit new dates", null);

            assertThat(reqA.getStatus()).isEqualTo(RequestStatus.PENDING);
            assertThat(reqB.getStatus()).isEqualTo(RequestStatus.PENDING);
        }

        @Test
        @DisplayName("Non-existent conflict ID — throws exception")
        void resolveNonExistentConflict_throwsException() {
            when(conflictRepository.findById(999L)).thenReturn(Optional.empty());

            org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () ->
                    conflictDetectionService.resolve(
                            999L, ConflictResolution.MERGED, "remarks", null)
            );
        }
    }
}