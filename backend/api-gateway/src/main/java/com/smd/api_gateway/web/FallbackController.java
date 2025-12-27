package com.smd.api_gateway.web;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smd.common.model.ApiErrorResponse;
import com.smd.common.model.ApiResponse;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class FallbackController {

    @PostMapping("/fallback")
    public Mono<ApiResponse<Void>> fallback(
            @RequestHeader(value = "X-Correlation-Id", required = false) String correlationId,
            @RequestBody(required = false) String payload) {

        ApiErrorResponse error = new ApiErrorResponse();
        error.setStatus(503);
        error.setError("Service Unavailable");
        error.setCode("GATEWAY_FALLBACK");
        error.setMessage("Downstream service temporarily unavailable. Please retry.");
        error.setCorrelationId(correlationId);

        return Mono.just(ApiResponse.fail(error, correlationId));
    }
}