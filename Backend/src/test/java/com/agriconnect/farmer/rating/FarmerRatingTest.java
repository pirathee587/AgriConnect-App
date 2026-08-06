package com.agriconnect.farmer.rating;

import com.agriconnect.farmer.rating.dto.RatingRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FarmerRatingTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void submitRating_noAuth_401() throws Exception {
        mockMvc.perform(post("/api/farmer/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRating(1L, 5))))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94771111001", roles = "AGENT")
    void submitRating_wrongRole_403() throws Exception {
        mockMvc.perform(post("/api/farmer/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRating(1L, 5))))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void submitRating_bookingNotFound_404() throws Exception {
        mockMvc.perform(post("/api/farmer/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRating(9999L, 5))))
                .andExpect(status().isNotFound());
    }

    @Test @Order(4)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void submitRating_starsTooHigh_400() throws Exception {
        mockMvc.perform(post("/api/farmer/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRating(1L, 6))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.stars").exists());
    }

    @Test @Order(5)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void submitRating_starsZero_400() throws Exception {
        mockMvc.perform(post("/api/farmer/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildRating(1L, 0))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.stars").exists());
    }

    @Test @Order(6)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void submitRating_missingBookingId_400() throws Exception {
        RatingRequest req = new RatingRequest();
        req.setStars(4);
        mockMvc.perform(post("/api/farmer/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.bookingId").exists());
    }

    @Test @Order(7)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void getMyRatings_success_200() throws Exception {
        mockMvc.perform(get("/api/farmer/ratings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    private RatingRequest buildRating(Long bookingId, int stars) {
        RatingRequest r = new RatingRequest();
        r.setBookingId(bookingId);
        r.setStars(stars);
        r.setComment("Good service");
        return r;
    }
}

