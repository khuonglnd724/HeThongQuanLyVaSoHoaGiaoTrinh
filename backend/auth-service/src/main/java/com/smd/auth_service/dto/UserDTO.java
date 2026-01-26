package com.smd.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String major;
    private String password;
    private Boolean isActive;
    private Boolean isLocked;
    private java.util.Set<String> roles;
}
