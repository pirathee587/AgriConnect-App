package com.agriconnect.agency.driver.dto;

import com.agriconnect.shared.enums.DriverStatus;
import com.agriconnect.shared.enums.NicStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DriverResponse {

    private Long driverId;
    private Long agencyId;
    private String agencyName;

    private String fullName;
    private String phone;
    private String email;
    private String licenceNumber;
    private String licenceClass;

    private NicStatus nicStatus;
    private String nicStatusLabel;   // "NIC Provided" / "NIC Not Yet Provided" — display-ready

    private DriverStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
