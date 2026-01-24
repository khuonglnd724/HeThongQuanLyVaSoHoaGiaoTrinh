package com.smd.auth_service.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.smd.auth_service.dto.AuthResponse;
import com.smd.auth_service.dto.LoginHistoryDTO;
import com.smd.auth_service.dto.LoginRequest;
import com.smd.auth_service.dto.RegisterRequest;
import com.smd.auth_service.dto.ResetPasswordRequest;
import com.smd.auth_service.dto.UpdateUserRequest;
import com.smd.auth_service.dto.UserDTO;

public interface UserService {
    
    /**
     * Register a new user
     */
    AuthResponse register(RegisterRequest request);
    
    /**
     * Authenticate user and return auth response
     */
    AuthResponse login(LoginRequest request, String ipAddress, String userAgent);
    
    /**
     * Get user by ID
     */
    UserDTO getUserById(Long userId);
    
    /**
     * Get user by username
     */
    UserDTO getUserByUsername(String username);
    
    /**
     * Get all users with pagination
     */
    Page<UserDTO> getAllUsers(Pageable pageable);
    
    /**
     * Create user (for admin)
     */
    UserDTO createUser(RegisterRequest request);
    
    /**
     * Update user
     */
    UserDTO updateUser(Long userId, UpdateUserRequest request);
    
    /**
     * Delete user
     */
    void deleteUser(Long userId);
    
    /**
     * Lock user account
     */
    UserDTO lockUser(Long userId);
    
    /**
     * Unlock user account
     */
    UserDTO unlockUser(Long userId);
    
    /**
     * Reset password
     */
    void resetPassword(ResetPasswordRequest request);
    
    /**
     * Assign role to user
     */
    UserDTO assignRole(Long userId, String roleName);
    
    /**
     * Get login history
     */
    Page<LoginHistoryDTO> getLoginHistory(Long userId, Pageable pageable);
}
