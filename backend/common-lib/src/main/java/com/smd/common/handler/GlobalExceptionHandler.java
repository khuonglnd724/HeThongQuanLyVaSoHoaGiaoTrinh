package com.smd.common.handler;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.smd.common.exception.BusinessException;
import com.smd.common.exception.NotFoundException;
import com.smd.common.exception.ValidationException;
import com.smd.common.model.ApiErrorResponse;
import com.smd.common.model.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getCode(), ex.getMessage(), null, null);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(ValidationException ex) {
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", ex.getMessage(), ex.getViolations(), null);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ResponseEntity<ApiResponse<Void>> handleBeanValidation(Exception ex) {
        List<String> errors = ValidationMessageExtractor.fromBindingErrors(ex);
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Request validation failed", errors, null);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getCode(), ex.getMessage(), null, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", ex.getMessage(), null, null);
    }

    private ResponseEntity<ApiResponse<Void>> build(HttpStatus status, String code, String message, List<String> details, String correlationId) {
        ApiErrorResponse err = new ApiErrorResponse();
        err.setStatus(status.value());
        err.setError(status.getReasonPhrase());
        err.setCode(code);
        err.setMessage(message);
        err.setDetails(details);
        err.setCorrelationId(correlationId);

        ApiResponse<Void> body = ApiResponse.fail(err, correlationId);
        return ResponseEntity.status(status).body(body);
    }
}