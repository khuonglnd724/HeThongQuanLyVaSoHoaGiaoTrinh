package com.smd.academic_service.exception;

/**
 * Exception thrown when validation rules are violated
 */
public class ValidationException extends RuntimeException {
    
    private String fieldName;
    private Object rejectedValue;
    
    public ValidationException(String message) {
        super(message);
    }
    
    public ValidationException(String fieldName, Object rejectedValue, String message) {
        super(String.format("Validation failed for field '%s': %s", fieldName, message));
        this.fieldName = fieldName;
        this.rejectedValue = rejectedValue;
    }
    
    public String getFieldName() {
        return fieldName;
    }
    
    public Object getRejectedValue() {
        return rejectedValue;
    }
}
