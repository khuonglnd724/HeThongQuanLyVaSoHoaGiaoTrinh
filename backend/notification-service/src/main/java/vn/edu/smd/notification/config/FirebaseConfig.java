package vn.edu.smd.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.config.path:firebase-service-account.json}")
    private String firebaseConfigPath;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        try {
            InputStream serviceAccount;
            
            // Try to load from file system first (for Docker)
            try {
                serviceAccount = new FileInputStream(firebaseConfigPath);
                log.info("📁 Loading Firebase config from file system: {}", firebaseConfigPath);
            } catch (Exception fileException) {
                // Fallback to classpath (for local development)
                serviceAccount = new ClassPathResource(firebaseConfigPath).getInputStream();
                log.info("📦 Loading Firebase config from classpath: {}", firebaseConfigPath);
            }
            
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp app = FirebaseApp.initializeApp(options);
            log.info("✅ Firebase initialized successfully");
            return app;
            
        } catch (Exception e) {
            log.error("❌ Failed to initialize Firebase. Config path: {}", firebaseConfigPath, e);
            throw e;
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}
