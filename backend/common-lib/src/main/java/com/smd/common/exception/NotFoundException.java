package com.smd.common.exception;

/**
 * Convenience exception for missing resources.
 */
public class NotFoundException extends BusinessException {
    public NotFoundException(String message) {
        super("NOT_FOUND", message);
    }
}