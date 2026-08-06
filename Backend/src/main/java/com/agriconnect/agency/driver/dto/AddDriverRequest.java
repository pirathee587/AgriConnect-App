package com.agriconnect.agency.driver.dto;

import com.agriconnect.shared.enums.NicStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddDriverRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    /** Optional — if not provided, only SMS notifications will be sent */
    private String email;

    @NotBlank(message = "Licence number is required")
    private String licenceNumber;

    @NotBlank(message = "Licence class is required (e.g. B1, C1, CE)")
    private String licenceClass;

    @NotNull(message = "NIC status is required")
    private NicStatus nicStatus;
}
