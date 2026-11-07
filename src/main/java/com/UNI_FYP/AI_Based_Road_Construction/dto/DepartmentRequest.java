package com.UNI_FYP.AI_Based_Road_Construction.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequest {
    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "contact email is required")
    @Email(message = "must be a valid email")
    private String contactEmail;

    private String phoneNumber;
}