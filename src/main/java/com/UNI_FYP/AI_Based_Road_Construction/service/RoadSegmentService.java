package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.dto.RoadSegmentRequest;
import com.UNI_FYP.AI_Based_Road_Construction.dto.RoadSegmentResponse;
import com.UNI_FYP.AI_Based_Road_Construction.entity.RoadSegment;
import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import com.UNI_FYP.AI_Based_Road_Construction.repository.Roadsegmentrepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RoadSegmentService {

    private final Roadsegmentrepository roadSegmentRepository;

    @Transactional
    public RoadSegmentResponse createRoadSegment(RoadSegmentRequest request) {
        if (roadSegmentRepository.existsByName(request.getName())) {
            throw new AppException("A road segment with this name already exists", HttpStatus.CONFLICT);
        }

        RoadSegment segment = RoadSegment.builder()
                .name(request.getName())
                .area(request.getArea())
                .city(request.getCity() != null && !request.getCity().isBlank()
                        ? request.getCity() : "Islamabad")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isActive(true)
                .build();

        return toResponse(roadSegmentRepository.save(segment));
    }

    public List<RoadSegmentResponse> getAllRoadSegments() {
        return roadSegmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RoadSegmentResponse> getActiveRoadSegments() {
        return roadSegmentRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RoadSegmentResponse toResponse(RoadSegment s) {
        return RoadSegmentResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .area(s.getArea())
                .city(s.getCity())
                .latitude(s.getLatitude())
                .longitude(s.getLongitude())
                .isActive(s.getIsActive())
                .build();
    }
}