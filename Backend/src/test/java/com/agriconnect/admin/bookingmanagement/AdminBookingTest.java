package com.agriconnect.admin.bookingmanagement;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminBookingTest {

    @Autowired MockMvc mockMvc;

    @Test @Order(1)
    void getAllBookings_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/admin/bookings"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(roles = "AGENT")
    void getAllBookings_wrongRole_403() throws Exception {
        mockMvc.perform(get("/api/admin/bookings"))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(roles = "ADMIN")
    void getAllBookings_200() throws Exception {
        mockMvc.perform(get("/api/admin/bookings"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalBookings").exists())
                .andExpect(jsonPath("$.completedBookings").exists())
                .andExpect(jsonPath("$.totalValueAllBookings").exists())
                .andExpect(jsonPath("$.bookings").isArray());
    }

    @Test @Order(4)
    @WithMockUser(roles = "ADMIN")
    void getBookingsByStatus_completed_200() throws Exception {
        mockMvc.perform(get("/api/admin/bookings/status/COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(5)
    @WithMockUser(roles = "ADMIN")
    void getBookingsByStatus_invalid_400() throws Exception {
        mockMvc.perform(get("/api/admin/bookings/status/INVALID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(containsString("Invalid status")));
    }

    @Test @Order(6)
    @WithMockUser(roles = "ADMIN")
    void getBookingsByFarmer_200() throws Exception {
        mockMvc.perform(get("/api/admin/bookings/farmer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(7)
    @WithMockUser(roles = "ADMIN")
    void getBookingsByPackage_200() throws Exception {
        mockMvc.perform(get("/api/admin/bookings/package/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(8)
    @WithMockUser(roles = "ADMIN")
    void getBookingsByAgency_200() throws Exception {
        mockMvc.perform(get("/api/admin/bookings/agency/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(9)
    @WithMockUser(roles = "ADMIN")
    void getBookingById_notFound_404() throws Exception {
        mockMvc.perform(get("/api/admin/bookings/9999"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(10)
    @WithMockUser(roles = "ADMIN")
    void getAllBookings_containsAllStats_200() throws Exception {
        mockMvc.perform(get("/api/admin/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cancelledBookings").exists())
                .andExpect(jsonPath("$.pickedUpBookings").exists())
                .andExpect(jsonPath("$.deliveredBookings").exists())
                .andExpect(jsonPath("$.bookingsByMarket").exists())
                .andExpect(jsonPath("$.totalValueCompleted").exists());
    }
}
