package com.UNI_FYP.AI_Based_Road_Construction.dto;

public record DelayPredictionResponse(
        int estimatedDays,
        String riskLevel,
        String reasoning

        ) {}
