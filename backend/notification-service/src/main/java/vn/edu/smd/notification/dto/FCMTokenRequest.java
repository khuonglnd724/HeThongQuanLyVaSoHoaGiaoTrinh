package vn.edu.smd.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import vn.edu.smd.notification.entity.FCMDeviceToken;

@Data
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FCMTokenRequest {
    private Long userId;
    private String fcmToken;
    private FCMDeviceToken.DeviceType deviceType;
    private String browser;
    private String deviceName;
}
