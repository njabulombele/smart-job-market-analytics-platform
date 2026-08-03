package com.jobmarket.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateRoleRequest(
    @NotBlank
    @Pattern(regexp = "USER|ANALYST|ADMIN", message = "Role must be USER, ANALYST, or ADMIN")
    String role
) {}
