package com.project.fitness_nutrition_plan.core.exception;

public class AppObjectAccessDeniedException extends AppGenericException {
    private final static String DEFAULT_CODE = "_ACCESS_DENIED";
    public AppObjectAccessDeniedException(String code, String message) {
        super(code + DEFAULT_CODE, message);
    }
}
