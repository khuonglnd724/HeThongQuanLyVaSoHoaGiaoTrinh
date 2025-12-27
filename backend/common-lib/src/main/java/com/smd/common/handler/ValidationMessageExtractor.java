package com.smd.common.handler;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

/**
 * Extract human-friendly validation messages from Spring binding errors.
 */
public final class ValidationMessageExtractor {
    private ValidationMessageExtractor() {
    }

    public static List<String> fromBindingErrors(Exception ex) {
        if (ex instanceof MethodArgumentNotValidException manve) {
            return manve.getBindingResult().getFieldErrors().stream()
                    .map(ValidationMessageExtractor::format)
                    .toList();
        }
        if (ex instanceof BindException be) {
            return be.getBindingResult().getFieldErrors().stream()
                    .map(ValidationMessageExtractor::format)
                    .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    private static String format(FieldError error) {
        String field = error.getField();
        String msg = error.getDefaultMessage();
        Object rejected = error.getRejectedValue();
        if (Objects.isNull(rejected)) {
            return field + ": " + msg;
        }
        return field + "=" + rejected + " : " + msg;
    }
}