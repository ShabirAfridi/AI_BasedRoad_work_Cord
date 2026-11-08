package com.UNI_FYP.AI_Based_Road_Construction.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignInspectorRequest {
    @NotNull(message = "inspectorId is required")
    private Long inspectorId;
}