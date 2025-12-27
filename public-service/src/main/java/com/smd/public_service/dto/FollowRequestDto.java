package com.smd.public_service.dto;

public class FollowRequestDto {

    private Long syllabusId;
    private String userEmail;
    private String notificationType; // EMAIL, IN_APP, BOTH

    public FollowRequestDto() {
    }

    public Long getSyllabusId() {
        return syllabusId;
    }

    public void setSyllabusId(Long syllabusId) {
        this.syllabusId = syllabusId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }
}
