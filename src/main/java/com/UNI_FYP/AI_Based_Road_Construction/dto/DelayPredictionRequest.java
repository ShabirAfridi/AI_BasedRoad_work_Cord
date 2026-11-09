package com.UNI_FYP.AI_Based_Road_Construction.dto;

import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.WorkType;

public record DelayPredictionRequest(
        WorkType workType,
        int plannedDurationDays,
        int priority
) {}
