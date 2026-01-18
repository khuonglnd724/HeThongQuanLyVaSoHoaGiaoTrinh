package com.smd.syllabus.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 400 - Bad request (validation / business rule)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        return buildError(
                HttpStatus.BAD_REQUEST,
                "BAD_REQUEST",
                ex.getMessage());
    }

    /**
     * 404 - Not found (JPA EntityNotFoundException)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "NOT_FOUND",
                ex.getMessage());
    }

    /**
     * 500 - Fallback (unexpected error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                "Unexpected server error");
    }

    private ResponseEntity<Map<String, Object>> buildError(
            HttpStatus status,
            String code,
            String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", code);
        body.put("message", message);

        return ResponseEntity.status(status).body(body);
    }
}
