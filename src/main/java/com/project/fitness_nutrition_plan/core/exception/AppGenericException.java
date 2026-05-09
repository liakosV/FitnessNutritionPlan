package com.project.fitness_nutrition_plan.core.exception;

import lombok.Getter;

@Getter
public class AppGenericException extends RuntimeException{
    private final String code;

    public AppGenericException(String code, String message) {
        super(message);
        this.code = code;
    }
}
