package com.agriconnect.farmer.rating.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class RatingResponse {
    private Long   ratingId;
    private Long   bookingId;
    private String agentName;
    private String marketDestination;
    private Integer stars;
    private String comment;
    private LocalDateTime createdAt;
}
