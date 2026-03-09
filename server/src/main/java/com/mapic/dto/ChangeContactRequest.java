package com.mapic.dto;

import lombok.Data;

@Data
public class ChangeContactRequest {
    private String newContact;
    private ContactType type;
}
