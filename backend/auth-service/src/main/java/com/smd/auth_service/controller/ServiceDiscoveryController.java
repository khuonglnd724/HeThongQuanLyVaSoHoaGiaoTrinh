package com.smd.auth_service.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/services")
@Slf4j
public class ServiceDiscoveryController {
    
    @Value("${eureka.client.service-url.defaultZone:http://localhost:8761/eureka}")
    private String eurekaUrl;
    
    private final RestTemplate restTemplate;
    
    public ServiceDiscoveryController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * GET /api/services/eureka/apps
     * Proxy Eureka apps list (backend calls Eureka, no CORS issue)
     */
    @GetMapping("/eureka/apps")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEurekaApps() {
        try {
            String eurekaAppsUrl = eurekaUrl.replace("/eureka", "") + "/eureka/apps";
            Object response = restTemplate.getForObject(eurekaAppsUrl, Object.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching Eureka apps: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error fetching services");
        }
    }
}
