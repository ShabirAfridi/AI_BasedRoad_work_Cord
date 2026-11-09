package com.UNI_FYP.AI_Based_Road_Construction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentPerformanceResponse {
    private Long departmentId;
    private String departmentName;
    private long totalRequests;
    private long pending;      // pending + conflict flagged
    private long active;       // approved + in progress
    private long completed;
    private long rejected;
    private Double completionRate;   // completed / total (%)
    private Double approvalRate;     // approved-or-beyond / (approved-or-beyond + rejected) (%)
    private Double avgPlannedDays;   // average planned duration of the department's work
    private long inspections;        // inspection reports on this department's work
    private Double restorationRate;  // reports marked RESTORED / all reports (%)
}