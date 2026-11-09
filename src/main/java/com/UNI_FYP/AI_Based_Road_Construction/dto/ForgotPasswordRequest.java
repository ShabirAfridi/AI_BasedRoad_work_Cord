package com.UNI_FYP.AI_Based_Road_Construction.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank @Email String email
 ) {}
