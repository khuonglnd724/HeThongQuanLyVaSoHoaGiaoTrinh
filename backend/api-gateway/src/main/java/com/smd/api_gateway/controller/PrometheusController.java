package com.smd.api_gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Prometheus Proxy Controller
 * Forwards Prometheus queries from frontend through API Gateway
 */
@RestController
@RequestMapping("/api/prometheus")
public class PrometheusController {

  @Value("${prometheus.url:http://prometheus:9090}")
  private String prometheusUrl;

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

  public PrometheusController(RestTemplate restTemplate, ObjectMapper objectMapper) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
  }

  /**
   * Query Prometheus instant query endpoint
   */
  @GetMapping("/query")
  public ResponseEntity<?> queryInstant(
      @RequestParam String query,
      @RequestParam(required = false) Long time) {
    try {
      String url = prometheusUrl + "/api/v1/query";
      String fullUrl = url + "?query=" + query;
      
      if (time != null) {
        fullUrl += "&time=" + time;
      }

      String response = restTemplate.getForObject(fullUrl, String.class);
      return ResponseEntity.ok(objectMapper.readTree(response));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(
          "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}"
      );
    }
  }

  /**
   * Query Prometheus range query endpoint
   */
  @GetMapping("/query_range")
  public ResponseEntity<?> queryRange(
      @RequestParam String query,
      @RequestParam Long start,
      @RequestParam Long end,
      @RequestParam(defaultValue = "15s") String step) {
    try {
      String url = prometheusUrl + "/api/v1/query_range";
      String fullUrl = String.format(
          "%s?query=%s&start=%d&end=%d&step=%s",
          url, query, start, end, step
      );

      String response = restTemplate.getForObject(fullUrl, String.class);
      return ResponseEntity.ok(objectMapper.readTree(response));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(
          "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}"
      );
    }
  }

  /**
   * Get Prometheus targets
   */
  @GetMapping("/targets")
  public ResponseEntity<?> getTargets() {
    try {
      String url = prometheusUrl + "/api/v1/targets";
      String response = restTemplate.getForObject(url, String.class);
      return ResponseEntity.ok(objectMapper.readTree(response));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(
          "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}"
      );
    }
  }

  /**
   * Health check
   */
  @GetMapping("/health")
  public ResponseEntity<?> health() {
    try {
      String url = prometheusUrl + "/-/healthy";
      String response = restTemplate.getForObject(url, String.class);
      return ResponseEntity.ok("{\"status\":\"healthy\"}");
    } catch (Exception e) {
      return ResponseEntity.status(503).body(
          "{\"status\":\"unhealthy\",\"message\":\"" + e.getMessage() + "\"}"
      );
    }
  }
}
