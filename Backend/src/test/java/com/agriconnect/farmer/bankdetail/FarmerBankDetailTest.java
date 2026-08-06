package com.agriconnect.farmer.bankdetail;

import com.agriconnect.farmer.bankdetail.dto.BankDetailRequest;
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
class FarmerBankDetailTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;

    @Test @Order(1)
    void getBankDetail_noAuth_401() throws Exception {
        mockMvc.perform(get("/api/farmer/bank-details"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(2)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void getBankDetail_notAdded_404() throws Exception {
        mockMvc.perform(get("/api/farmer/bank-details"))
                .andExpect(status().isNotFound());
    }

    @Test @Order(3)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void saveBankDetail_success_200() throws Exception {
        mockMvc.perform(post("/api/farmer/bank-details")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(buildBankReq())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bankName").value("Sampath Bank"))
                .andExpect(jsonPath("$.maskedAccountNumber").value(
                        org.hamcrest.Matchers.containsString("****")));
    }

    @Test @Order(4)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void getBankDetail_afterSave_200() throws Exception {
        mockMvc.perform(get("/api/farmer/bank-details"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bankName").value("Sampath Bank"));
    }

    @Test @Order(5)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void saveBankDetail_missingFields_400() throws Exception {
        BankDetailRequest req = new BankDetailRequest();
        // all empty
        mockMvc.perform(post("/api/farmer/bank-details")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isMap());
    }

    @Test @Order(6)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void deleteBankDetail_success_200() throws Exception {
        mockMvc.perform(delete("/api/farmer/bank-details"))
                .andExpect(status().isOk())
                .andExpect(content().string(
                        org.hamcrest.Matchers.containsString("removed")));
    }

    @Test @Order(7)
    @WithMockUser(username = "+94771111001", roles = "FARMER")
    void deleteBankDetail_alreadyDeleted_404() throws Exception {
        mockMvc.perform(delete("/api/farmer/bank-details"))
                .andExpect(status().isNotFound());
    }

    private BankDetailRequest buildBankReq() {
        BankDetailRequest r = new BankDetailRequest();
        r.setBankName("Sampath Bank");
        r.setAccountNumber("00198765432");
        r.setAccountHolderName("Kamal Farmer");
        return r;
    }
}
