package com.agriconnect.agency.pkg;

import com.agriconnect.agency.pkg.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AgencyPackageTest {

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void createPackage_noAuth_401() throws Exception {
        mockMvc.perform(post("/api/agency/packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildPackage())))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94772000001", roles = "FARMER")
    void createPackage_wrongRole_403() throws Exception {
        mockMvc.perform(post("/api/agency/packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildPackage())))
                .andExpect(status().isForbidden());
    }

    @Test @Order(3)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void createPackage_agencyNotActive_400() throws Exception {
        // Agency is PENDING_APPROVAL by default in test
        mockMvc.perform(post("/api/agency/packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildPackage())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(org.hamcrest.Matchers
                                .containsString("active agencys")));
    }

    @Test @Order(4)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void createPackage_missingVegetables_400() throws Exception {
        CreatePackageRequest req = new CreatePackageRequest();
        req.setMarketDestination("Colombo");
        req.setTravelDateTime(LocalDateTime.now().plusDays(1));
        req.setTotalCapacityKg(1000.0);
        // vegetables missing
        mockMvc.perform(post("/api/agency/packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.vegetables").exists());
    }

    @Test @Order(5)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void createPackage_pastDate_400() throws Exception {
        CreatePackageRequest req = buildPackage();
        req.setTravelDateTime(LocalDateTime.now().minusDays(1));
        mockMvc.perform(post("/api/agency/packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.travelDateTime").exists());
    }

    @Test @Order(6)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getMyPackages_200() throws Exception {
        mockMvc.perform(get("/api/agency/packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(7)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void getPackageById_notFound_404() throws Exception {
        mockMvc.perform(get("/api/agency/packages/9999"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(8)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void updatePrice_notFound_404() throws Exception {
        UpdatePriceRequest req = new UpdatePriceRequest();
        req.setPackageVegetableId(9999L);
        req.setNewPricePerKg(200.0);
        mockMvc.perform(patch("/api/agency/packages/price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test @Order(9)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void cancelPackage_notFound_404() throws Exception {
        mockMvc.perform(delete("/api/agency/packages/9999"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(10)
    @WithMockUser(username = "+94772000001", roles = "AGENT")
    void updateStatus_invalidStatus_400() throws Exception {
        UpdatePackageStatusRequest req = new UpdatePackageStatusRequest();
        req.setStatus("INVALID_STATUS");
        mockMvc.perform(patch("/api/agency/packages/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    private CreatePackageRequest buildPackage() {
        CreatePackageRequest r = new CreatePackageRequest();
        r.setMarketDestination("Dambulla");
        r.setTravelDateTime(LocalDateTime.now().plusDays(2));
        r.setTotalCapacityKg(2000.0);
        r.setVehicleType("Lorry");
        r.setVehicleNumber("WP-1234");
        CreatePackageRequest.VegetableItem v =
                new CreatePackageRequest.VegetableItem();
        v.setVegetableName("Tomato");
        v.setPricePerKg(120.0);
        v.setMaxKg(1000.0);
        r.setVegetables(List.of(v));
        return r;
    }
}