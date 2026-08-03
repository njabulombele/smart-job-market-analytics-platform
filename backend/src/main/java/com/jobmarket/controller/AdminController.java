package com.jobmarket.controller;

import com.jobmarket.dto.admin.UserAdminDto;
import com.jobmarket.dto.admin.UpdateRoleRequest;
import com.jobmarket.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Admin-only management endpoints")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "List all users (paginated)")
    public ResponseEntity<Page<UserAdminDto>> listUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.listUsers(pageable));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Update a user's role")
    public ResponseEntity<UserAdminDto> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(adminService.updateRole(id, request));
    }

    @PutMapping("/users/{id}/active")
    @Operation(summary = "Enable or disable a user account")
    public ResponseEntity<Void> setUserActive(
            @PathVariable Long id,
            @RequestParam boolean active) {
        adminService.setUserActive(id, active);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pipeline/status")
    @Operation(summary = "Get data pipeline run status")
    public ResponseEntity<Map<String, Object>> getPipelineStatus() {
        return ResponseEntity.ok(adminService.getPipelineStatus());
    }

    @PostMapping("/pipeline/trigger")
    @Operation(summary = "Manually trigger a pipeline run")
    public ResponseEntity<Map<String, String>> triggerPipeline() {
        return ResponseEntity.ok(adminService.triggerPipeline());
    }

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }
}
