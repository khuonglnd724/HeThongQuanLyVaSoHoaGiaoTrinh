package com.smd.common.exception;

import java.util.Collections;
import java.util.List;

/**
 * Validation exception holding a list of violations for consistent responses.
 */
public class ValidationException extends RuntimeException {
    private final List<String> violations;

    public ValidationException(String message) {
        this(message, List.of());
    }

    public ValidationException(String message, List<String> violations) {
        super(message);
        this.violations = violations == null ? List.of() : List.copyOf(violations);
    }

    public List<String> getViolations() {
        return Collections.unmodifiableList(violations);
    }
}