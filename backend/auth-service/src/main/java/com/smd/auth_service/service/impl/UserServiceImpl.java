package com.smd.auth_service.service.impl;

import com.smd.auth_service.dto.*;
import com.smd.auth_service.entity.*;
import com.smd.auth_service.exception.ResourceNotFoundException;
import com.smd.auth_service.exception.BadRequestException;
import com.smd.auth_service.repository.UserRepository;
import com.smd.auth_service.repository.RoleRepository;
import com.smd.auth_service.repository.LoginHistoryRepository;
import com.smd.auth_service.security.JwtTokenProvider;
import com.smd.auth_service.security.UserDetailsImpl;
import com.smd.auth_service.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private LoginHistoryRepository loginHistoryRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }
        
        var role = roleRepository.findByName(ERole.ROLE_STUDENT)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .isActive(true)
                .isLocked(false)
                .failedAttempts(0)
                .roles(Set.of(role))
                .build();
        
        userRepository.save(user);
        
        String token = jwtTokenProvider.generateTokenFromUsername(user.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());
        
        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .collect(Collectors.toSet()))
                .build();
    }
    
    @Override
    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            if (user.getIsLocked()) {
                throw new BadRequestException("User account is locked!");
            }
            
            // Reset failed attempts on successful login
            user.setFailedAttempts(0);
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            
            // Log successful login
            LoginHistory loginHistory = LoginHistory.builder()
                    .user(user)
                    .loginTime(LocalDateTime.now())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .loginStatus("SUCCESS")
                    .build();
            loginHistoryRepository.save(loginHistory);
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String token = jwtTokenProvider.generateJwtToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());
            
            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .roles(user.getRoles().stream()
                            .map(r -> r.getName().name())
                            .collect(Collectors.toSet()))
                    .build();
                    
        } catch (Exception e) {
            User user = userRepository.findByUsername(request.getUsername()).orElse(null);
            if (user != null) {
                user.setFailedAttempts(user.getFailedAttempts() + 1);
                
                // Lock account after 5 failed attempts
                if (user.getFailedAttempts() >= 5) {
                    user.setIsLocked(true);
                }
                userRepository.save(user);
                
                // Log failed login
                LoginHistory loginHistory = LoginHistory.builder()
                        .user(user)
                        .loginTime(LocalDateTime.now())
                        .ipAddress(ipAddress)
                        .userAgent(userAgent)
                        .loginStatus("FAILED")
                        .failureReason(e.getMessage())
                        .build();
                loginHistoryRepository.save(loginHistory);
            }
            
            throw new BadRequestException("Invalid username or password!");
        }
    }
    
    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }
    
    @Override
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }
    
    @Override
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToDTO);
    }
    
    @Override
    public UserDTO createUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }
        
        // Get roles from request, default to ROLE_STUDENT if not provided
        Set<Role> roles = new HashSet<>();
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            for (Long roleId : request.getRoleIds()) {
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                    .orElseThrow(() -> new RuntimeException("Error: Default role is not found."));
            roles.add(defaultRole);
        }
        
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .isActive(true)
                .isLocked(false)
                .failedAttempts(0)
                .roles(roles)
                .build();
        
        userRepository.save(user);
        return mapToDTO(user);
    }
    
    @Override
    public UserDTO updateUser(Long userId, RegisterRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(user);
        return mapToDTO(user);
    }
    
    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }
    
    @Override
    public UserDTO lockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsLocked(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return mapToDTO(user);
    }
    
    @Override
    public UserDTO unlockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsLocked(false);
        user.setFailedAttempts(0);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return mapToDTO(user);
    }
    
    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Old password is incorrect!");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    @Override
    public UserDTO assignRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        ERole eRole = ERole.valueOf(roleName);
        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        
        user.getRoles().add(role);
        userRepository.save(user);
        return mapToDTO(user);
    }
    
    @Override
    public Page<LoginHistoryDTO> getLoginHistory(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return loginHistoryRepository.findByUser(user, pageable)
                .map(this::mapLoginHistoryToDTO);
    }
    
    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .isActive(user.getIsActive())
                .isLocked(user.getIsLocked())
                .build();
    }
    
    private LoginHistoryDTO mapLoginHistoryToDTO(LoginHistory loginHistory) {
        return LoginHistoryDTO.builder()
                .loginHistoryId(loginHistory.getLoginHistoryId())
                .userId(loginHistory.getUser().getUserId())
                .username(loginHistory.getUser().getUsername())
                .loginTime(loginHistory.getLoginTime())
                .logoutTime(loginHistory.getLogoutTime())
                .ipAddress(loginHistory.getIpAddress())
                .userAgent(loginHistory.getUserAgent())
                .loginStatus(loginHistory.getLoginStatus())
                .failureReason(loginHistory.getFailureReason())
                .build();
    }
}
