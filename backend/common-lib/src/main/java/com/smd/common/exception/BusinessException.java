package com.smd.common.exception;

/**
 * Generic business-level exception to signal domain errors.
 */
public class BusinessException extends RuntimeException {
    private final String code;

    public BusinessException(String message) {
        this(null, message, null);
    }

    public BusinessException(String code, String message) {
        this(code, message, null);
    }

    public BusinessException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}