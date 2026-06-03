package com.project.fitness_nutrition_plan.core.exception;

public class AppObjectAlreadyExistsException extends AppGenericException {
    private final static String DEFAULT_CODE = "_ALREADY_EXISTS";
    public AppObjectAlreadyExistsException(String code, String message) {
        super(code + DEFAULT_CODE, message);
    }
}
