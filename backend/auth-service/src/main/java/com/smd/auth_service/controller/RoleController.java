package com.smd.auth_service.controller;

import com.smd.auth_service.dto.*;
import com.smd.auth_service.entity.Permission;
import com.smd.auth_service.entity.Role;
import com.smd.auth_service.entity.ERole;
import com.smd.auth_service.repository.PermissionRepository;
import com.smd.auth_service.repository.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@Slf4j
public class RoleController {
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    /**
     * GET /api/roles
     * Get all roles with their permissions
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllRoles() {
        try {
            List<Role> roles = roleRepository.findAll();
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Role role : roles) {
                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("id", role.getRoleId());
                roleMap.put("name", role.getName().toString());
                roleMap.put("description", role.getDescription());
                
                List<String> permissions = role.getPermissions()
                    .stream()
                    .map(Permission::getName)
                    .collect(Collectors.toList());
                roleMap.put("permissions", permissions);
                
                result.add(roleMap);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching roles: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching roles: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/roles/permissions/all
     * Get all permissions grouped by category
     */
    @GetMapping("/permissions/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPermissions() {
        try {
            List<Permission> permissions = permissionRepository.findAll();
            
            // Group by category (first part before underscore)
            Map<String, List<String>> grouped = new HashMap<>();
            for (Permission perm : permissions) {
                String name = perm.getName();
                String category = name.contains("_") ? name.split("_")[0] : "OTHER";
                grouped.computeIfAbsent(category, k -> new ArrayList<>()).add(name);
            }
            
            return ResponseEntity.ok(grouped);
        } catch (Exception e) {
            log.error("Error fetching permissions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching permissions: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/roles/{roleId}
     * Get a specific role
     */
    @GetMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRoleById(@PathVariable Long roleId) {
        try {
            Optional<Role> role = roleRepository.findById(roleId);
            if (role.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Role not found");
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", role.get().getRoleId());
            result.put("name", role.get().getName().toString());
            result.put("description", role.get().getDescription());
            List<String> permissions = role.get().getPermissions()
                .stream()
                .map(Permission::getName)
                .collect(Collectors.toList());
            result.put("permissions", permissions);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching role: " + e.getMessage());
        }
    }
}

