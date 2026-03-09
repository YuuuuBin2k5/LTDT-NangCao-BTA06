package com.mapic.exception;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
public class InvalidFilterException extends RuntimeException {
    
    private List<String> suggestions = new ArrayList<>();
    
    public InvalidFilterException(String message) {
        super(message);
    }
    
    public InvalidFilterException(String message, List<String> suggestions) {
        super(message);
        this.suggestions = suggestions;
    }
}
