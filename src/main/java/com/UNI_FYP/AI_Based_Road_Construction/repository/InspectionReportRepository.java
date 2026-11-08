package com.UNI_FYP.AI_Based_Road_Construction.repository;

import com.UNI_FYP.AI_Based_Road_Construction.entity.InspectionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionReportRepository extends JpaRepository<InspectionReport, Long> {
    List<InspectionReport> findByInspectorIdOrderByCreatedAtDesc(Long inspectorId);
    List<InspectionReport> findAllByOrderByCreatedAtDesc();
}