package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.DepartmentPerformanceResponse;
import com.UNI_FYP.AI_Based_Road_Construction.dto.MonthlyTrendResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.Department;
import com.UNI_FYP.AI_Based_Road_Construction.entity.InspectionReport;
import com.UNI_FYP.AI_Based_Road_Construction.entity.WorkRequest;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RequestStatus;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.RestorationStatus;
import com.UNI_FYP.AI_Based_Road_Construction.repository.DepartmentRepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.InspectionReportRepository;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Workrequestrepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class PerformanceService {

    private final Workrequestrepository       workRequestRepository;
    private final InspectionReportRepository  inspectionReportRepository;
    private final DepartmentRepository        departmentRepository;

    @Transactional(readOnly = true)
    public List<DepartmentPerformanceResponse> getDepartmentPerformance() {
        Map<Long, List<WorkRequest>> requestsByDept = workRequestRepository.findAll().stream()
                .collect(Collectors.groupingBy(w -> w.getDepartment().getId()));

        Map<Long, List<InspectionReport>> reportsByDept = inspectionReportRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getWorkRequest().getDepartment().getId()));

        return departmentRepository.findAll().stream()
                .map(d -> build(d,
                        requestsByDept.getOrDefault(d.getId(), List.of()),
                        reportsByDept.getOrDefault(d.getId(), List.of())))
                .sorted(Comparator.comparingLong(DepartmentPerformanceResponse::getTotalRequests).reversed())
                .collect(Collectors.toList());
    }

    // Requests submitted / completed per month, last 6 months
    @Transactional(readOnly = true)
    public List<MonthlyTrendResponse> getMonthlyTrend() {
        List<WorkRequest> all = workRequestRepository.findAll();
        YearMonth now = YearMonth.now();
        List<MonthlyTrendResponse> result = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth month = now.minusMonths(i);
            List<WorkRequest> inMonth = all.stream()
                    .filter(w -> w.getCreatedAt() != null && YearMonth.from(w.getCreatedAt()).equals(month))
                    .collect(Collectors.toList());

            result.add(MonthlyTrendResponse.builder()
                    .month(month.toString())
                    .submitted(inMonth.size())
                    .completed(inMonth.stream().filter(w -> w.getStatus() == RequestStatus.COMPLETED).count())
                    .build());
        }
        return result;
    }

    private DepartmentPerformanceResponse build(Department d, List<WorkRequest> requests,
                                                List<InspectionReport> reports) {
        long total      = requests.size();
        long pending    = count(requests, RequestStatus.PENDING) + count(requests, RequestStatus.CONFLICT_FLAGGED);
        long approved   = count(requests, RequestStatus.APPROVED);
        long inProgress = count(requests, RequestStatus.IN_PROGRESS);
        long completed  = count(requests, RequestStatus.COMPLETED);
        long rejected   = count(requests, RequestStatus.REJECTED);

        long approvedOrBeyond = approved + inProgress + completed;

        Double avgDays = requests.stream()
                .filter(w -> w.getStartDate() != null && w.getEndDate() != null)
                .mapToLong(w -> ChronoUnit.DAYS.between(w.getStartDate(), w.getEndDate()) + 1)
                .average()
                .stream().boxed()
                .map(v -> Math.round(v * 10) / 10.0)
                .findFirst().orElse(null);

        long restored = reports.stream()
                .filter(r -> r.getRestorationStatus() == RestorationStatus.RESTORED)
                .count();

        return DepartmentPerformanceResponse.builder()
                .departmentId(d.getId())
                .departmentName(d.getName())
                .totalRequests(total)
                .pending(pending)
                .active(approved + inProgress)
                .completed(completed)
                .rejected(rejected)
                .completionRate(pct(completed, total))
                .approvalRate(pct(approvedOrBeyond, approvedOrBeyond + rejected))
                .avgPlannedDays(avgDays)
                .inspections(reports.size())
                .restorationRate(pct(restored, reports.size()))
                .build();
    }

    private long count(List<WorkRequest> list, RequestStatus status) {
        return list.stream().filter(w -> w.getStatus() == status).count();
    }

    // null when there is nothing to divide by, so the UI shows "—" instead of 0%
    private Double pct(long part, long whole) {
        return whole == 0 ? null : Math.round(part * 1000.0 / whole) / 10.0;
    }
}