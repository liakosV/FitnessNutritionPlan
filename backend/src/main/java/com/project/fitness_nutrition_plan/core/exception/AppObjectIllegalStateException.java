package com.project.fitness_nutrition_plan.core.exception;

public class AppObjectIllegalStateException extends AppGenericException{
    private final static String DEFAULT_CODE = "_ILLEGAL_STATE";
    public AppObjectIllegalStateException(String code, String message) {
        super(code + DEFAULT_CODE, message);
    }
}
