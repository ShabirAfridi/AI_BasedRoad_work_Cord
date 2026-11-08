package com.UNI_FYP.AI_Based_Road_Construction.dto;

import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.ComplaintCategory;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ComplaintRequest {
    private Long roadSegmentId;
    @NotBlank(message = "description is required")
    private String description;

    private ComplaintCategory category;
    //optional - compliant is about specific work Request
     private Long relatedRequestId;

     private String photoBase64;


}
