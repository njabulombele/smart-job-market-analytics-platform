package com.jobmarket.dto.admin;

import java.time.OffsetDateTime;

public record UserAdminDto(
    Long id,
    String email,
    String fullName,
    String role,
    boolean isActive,
    OffsetDateTime createdAt
) {}
