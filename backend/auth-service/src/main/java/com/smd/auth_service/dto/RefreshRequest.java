package com.smd.auth_service.dto;

public class RefreshRequest {
    private String userId;
    private String refreshToken;

    public RefreshRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
