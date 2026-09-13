package com.example.backend.common.exception;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.backend.roadmap.RoadmapConfirmRequiredException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(
            IllegalArgumentException.class
    )
    public ResponseEntity<?> handleIllegalArgument(
            IllegalArgumentException exception
    ) {

        return ResponseEntity
                .badRequest()
                .body(
                        Map.of(
                                "message",
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException exception
    ) {

        Map<String, String> errors =
                new HashMap<>();

        exception
                .getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        Map.of(
                                "message",
                                "Validation failed",
                                "errors",
                                errors
                        )
                );
    }

    @ExceptionHandler(RoadmapConfirmRequiredException.class)
    public ResponseEntity<?> handleRoadmapConfirm(RoadmapConfirmRequiredException exception) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "needsConfirmation", true,
                        "reason", exception.getReason(),
                        "message", exception.getMessage(),
                        "willReplaceCareerId", exception.getWillReplaceCareerId() == null
                                ? ""
                                : exception.getWillReplaceCareerId(),
                        "willReplaceCareerName", exception.getWillReplaceCareerName() == null
                                ? ""
                                : exception.getWillReplaceCareerName(),
                        "existing", exception.getExisting()
                ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleStatus(ResponseStatusException exception) {
        return ResponseEntity
                .status(exception.getStatusCode())
                .body(Map.of("message", exception.getReason() == null
                        ? exception.getMessage()
                        : exception.getReason()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(
            Exception exception
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .body(
                        Map.of(
                                "message",
                                "Something went wrong"
                        )
                );
    }
}
