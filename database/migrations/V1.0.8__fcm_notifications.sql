-- =============================================
-- FCM Notifications Schema for SMD Microservices
-- =============================================

-- Table: fcm_device_tokens
-- Stores FCM tokens for push notifications
CREATE TABLE IF NOT EXISTS fcm_device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    fcm_token TEXT NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL, -- WEB, ANDROID, IOS
    browser TEXT,
    device_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fcm_user_id ON fcm_device_tokens(user_id);
CREATE INDEX idx_fcm_token ON fcm_device_tokens(fcm_token);
CREATE INDEX idx_fcm_active ON fcm_device_tokens(is_active);

-- Table: notifications
-- Stores notification records
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- APPROVAL_REQUEST, NEW_SYLLABUS, COMMENT, DEADLINE, etc.
    
    -- Related entity IDs
    syllabus_id BIGINT,
    workflow_id BIGINT,
    comment_id BIGINT,
    
    -- Notification status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    
    -- FCM specific
    fcm_message_id VARCHAR(255),
    
    -- Metadata
    data JSONB, -- Additional data payload
    priority VARCHAR(20) DEFAULT 'normal', -- high, normal, low
    
    -- Timestamps
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_user_id ON notifications(user_id);
CREATE INDEX idx_notification_type ON notifications(notification_type);
CREATE INDEX idx_notification_read ON notifications(is_read);
CREATE INDEX idx_notification_sent ON notifications(is_sent);
CREATE INDEX idx_notification_syllabus_id ON notifications(syllabus_id);
CREATE INDEX idx_notification_created_at ON notifications(created_at DESC);

-- Table: notification_preferences
-- User preferences for notifications
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    
    -- Notification type preferences (true = enabled)
    enable_approval_requests BOOLEAN DEFAULT TRUE,
    enable_new_syllabus BOOLEAN DEFAULT TRUE,
    enable_comments BOOLEAN DEFAULT TRUE,
    enable_deadlines BOOLEAN DEFAULT TRUE,
    enable_status_updates BOOLEAN DEFAULT TRUE,
    
    -- Channel preferences
    enable_push_notifications BOOLEAN DEFAULT TRUE,
    enable_email_notifications BOOLEAN DEFAULT FALSE,
    
    -- Time preferences
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_pref_user_id ON notification_preferences(user_id);

-- Table: notification_logs
-- Logs for debugging and analytics
CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES notifications(id),
    fcm_token TEXT,
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED, INVALID_TOKEN, etc.
    error_message TEXT,
    fcm_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_log_notification_id ON notification_logs(notification_id);
CREATE INDEX idx_notification_log_status ON notification_logs(status);
CREATE INDEX idx_notification_log_created_at ON notification_logs(created_at DESC);

-- =============================================
-- Helper Functions
-- =============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_fcm_device_tokens_updated_at BEFORE UPDATE ON fcm_device_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Sample Data for Testing
-- =============================================

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- Useful Queries
-- =============================================

-- Get unread notifications count for a user
-- SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE;

-- Get notifications for a user (paginated)
-- SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20 OFFSET 0;

-- Get active FCM tokens for a user
-- SELECT fcm_token FROM fcm_device_tokens WHERE user_id = ? AND is_active = TRUE;

-- Mark notification as read
-- UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ?;

-- Mark all notifications as read for a user
-- UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = FALSE;

-- Clean up old notifications (optional maintenance)
-- DELETE FROM notifications WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE fcm_device_tokens IS 'Stores FCM tokens for each user device';
COMMENT ON TABLE notifications IS 'Stores all notification records';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification types and channels';
COMMENT ON TABLE notification_logs IS 'Logs for notification delivery debugging';
