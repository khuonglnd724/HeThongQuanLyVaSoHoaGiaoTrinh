package com.smd.common.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ApiErrorResponse error;
    private String correlationId;

    public ApiResponse() {
    }

    public static <T> ApiResponse<T> ok(T data, String correlationId) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setData(data);
        response.setCorrelationId(correlationId);
        return response;
    }

    public static ApiResponse<Void> fail(ApiErrorResponse error, String correlationId) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setError(error);
        response.setCorrelationId(correlationId);
        return response;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public ApiErrorResponse getError() {
        return error;
    }

    public void setError(ApiErrorResponse error) {
        this.error = error;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }
}