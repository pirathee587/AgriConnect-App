package com.agriconnect.agency.driver.dto;

import com.agriconnect.shared.enums.DriverStatus;
import com.agriconnect.shared.enums.NicStatus;
import lombok.Data;

@Data
public class UpdateDriverRequest {

    /** All fields optional — only non-null fields are applied */
    private String fullName;
    private String phone;
    private String email;
    private String licenceNumber;
    private String licenceClass;
    private NicStatus nicStatus;
    private DriverStatus status;
}
