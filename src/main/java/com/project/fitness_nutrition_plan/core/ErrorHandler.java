package com.project.fitness_nutrition_plan.core;

import com.project.fitness_nutrition_plan.core.exception.*;
import com.project.fitness_nutrition_plan.dto.response.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class ErrorHandler {

    @ExceptionHandler(AppObjectNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFoundException(
            AppObjectNotFoundException ex) {

        ErrorResponseDto dto = new ErrorResponseDto(
                ex.getCode(),
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                LocalDateTime.now()
        );

        return new ResponseEntity<>(dto, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AppObjectAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDto> handleAlreadyExistsException(
            AppObjectAlreadyExistsException ex) {

        ErrorResponseDto dto = new ErrorResponseDto(
                ex.getCode(),
                ex.getMessage(),
                HttpStatus.CONFLICT.value(),
                LocalDateTime.now()
        );

        return new ResponseEntity<>(dto, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(AppObjectInvalidArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidArgumentException(
            AppObjectInvalidArgumentException ex) {

        ErrorResponseDto dto = new ErrorResponseDto(
                ex.getCode(),
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                LocalDateTime.now()
        );

        return new ResponseEntity<>(dto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AppObjectIllegalStateException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalStateException(
            AppObjectIllegalStateException ex) {

        ErrorResponseDto dto = new ErrorResponseDto(
                ex.getCode(),
                ex.getMessage(),
                HttpStatus.CONFLICT.value(),
                LocalDateTime.now()
        );

        return new ResponseEntity<>(dto, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(AppObjectUnauthorizedException.class)
    public ResponseEntity<ErrorResponseDto> handleUnauthorizedException(
            AppObjectUnauthorizedException ex) {

        ErrorResponseDto dto = new ErrorResponseDto(
                ex.getCode(),
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED.value(),
                LocalDateTime.now()
        );

        return new ResponseEntity<>(dto, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AppObjectAccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleAccessDeniedException(
            AppObjectAccessDeniedException ex) {

        ErrorResponseDto dto = new ErrorResponseDto(
                ex.getCode(),
                ex.getMessage(),
                HttpStatus.FORBIDDEN.value(),
                LocalDateTime.now()
        );

        return new ResponseEntity<>(dto, HttpStatus.FORBIDDEN);
    }

    public ResponseEntity<ErrorResponseDto> handleException(Exception ex) {

        ErrorResponseDto dto = new ErrorResponseDto(
                "INTERNAL_SERVER_ERROR",
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                LocalDateTime.now()
        );

        return new ResponseEntity<>(dto, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
