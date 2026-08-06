package com.agriconnect.agency.profile.dto;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class NicUploadResponse {
    private String message;
    private String nicFrontUrl;
    private String nicBackUrl;
}
