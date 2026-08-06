package com.agriconnect.shared.service;

import com.agriconnect.shared.entity.Agency;
import com.agriconnect.shared.entity.Driver;
import com.agriconnect.shared.entity.Notification;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.entity.Vehicle;
import com.agriconnect.shared.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Phase 1 STUB implementation of the notification service.
 *
 * All sends are logged to console and persisted to the `notifications` table
 * with status = "STUB". No real Email or SMS provider is called yet.
 *
 * To integrate a real provider (e.g. SendGrid / Twilio), replace the
 * stub send calls in sendSms() and sendEmail() — all template logic
 * and DB persistence remain unchanged.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a");

    // ─────────────────────────────────────────────────────────────
    // EVENT 1 — Driver Account Approved
    // ─────────────────────────────────────────────────────────────

    public void sendDriverApproved(Driver driver, Agency agency) {
        String nicLabel = nicLabel(driver);

        String sms = "Hi " + driver.getFullName() + ",\n\n"
                + "You have been registered as a driver on AgriConnect by " + agency.getUser().getName() + ".\n\n"
                + "Your details:\n"
                + "  Name       : " + driver.getFullName() + "\n"
                + "  Licence No : " + driver.getLicenceNumber() + "\n"
                + "  Agency     : " + agency.getUser().getName() + "\n"
                + "  Contact    : " + agency.getUser().getPhone() + "\n\n"
                + "NIC Status: " + nicLabel + "\n"
                + "Please bring your NIC to the agency office if not yet submitted.\n\n"
                + "— AgriConnect Team";

        String email = "Dear " + driver.getFullName() + ",\n\n"
                + "You have been successfully registered as a driver on the AgriConnect\n"
                + "logistics platform by " + agency.getUser().getName() + ".\n\n"
                + "YOUR ACCOUNT DETAILS\n"
                + "────────────────────────────────\n"
                + "  Full Name      : " + driver.getFullName() + "\n"
                + "  Phone          : " + driver.getPhone() + "\n"
                + "  Licence Number : " + driver.getLicenceNumber() + "\n"
                + "  Licence Class  : " + driver.getLicenceClass() + "\n"
                + "  Agency Name    : " + agency.getUser().getName() + "\n"
                + "  Agency Phone   : " + agency.getUser().getPhone() + "\n"
                + "  Agency Address : " + agency.getAddress() + "\n"
                + "────────────────────────────────\n\n"
                + "NIC STATUS: " + nicLabel + "\n"
                + "If your NIC has not yet been submitted, please bring it to\n"
                + "the " + agency.getUser().getName() + " office at your earliest convenience.\n\n"
                + "Regards,\nAgriConnect Platform Team";

        dispatch("DRIVER_APPROVED", driver, sms,
                "Welcome to AgriConnect — Your Driver Account is Active", email);
    }

    // ─────────────────────────────────────────────────────────────
    // EVENT 2 — Driver Assigned to Package
    // ─────────────────────────────────────────────────────────────

    public void sendDriverAssigned(Driver driver, Vehicle vehicle, Package pkg, Agency agency) {
        String nicReminderSms = driver.getNicStatus().name().equals("NIC_NOT_PROVIDED")
                ? "REMINDER: Please bring your NIC to the agency office before this trip.\n"
                : "";
        String nicReminderEmail = driver.getNicStatus().name().equals("NIC_NOT_PROVIDED")
                ? "\n⚠  NIC REMINDER\n   Your National Identity Card has NOT yet been submitted to\n"
                  + "   " + agency.getUser().getName() + ". Please bring your NIC before this trip.\n"
                : "";

        String travelDate = pkg.getTravelDateTime() != null ? pkg.getTravelDateTime().format(DATE_FMT) : "TBD";
        String departTime = pkg.getTravelDateTime() != null ? pkg.getTravelDateTime().format(TIME_FMT) : "TBD";
        String pickupStart = pkg.getPickupWindowStart() != null ? pkg.getPickupWindowStart().format(TIME_FMT) : "TBD";
        String pickupEnd   = pkg.getPickupWindowEnd()   != null ? pkg.getPickupWindowEnd().format(TIME_FMT)   : "TBD";

        String sms = "Hi " + driver.getFullName() + ", you have been assigned a trip on AgriConnect.\n\n"
                + "TRIP DETAILS\n"
                + "  Vehicle     : " + vehicle.getVehicleType().name() + " \u2014 " + vehicle.getPlateNumber() + "\n"
                + "  Destination : " + pkg.getMarketDestination() + "\n"
                + "  Travel Date : " + travelDate + "\n"
                + "  Depart Time : " + departTime + "\n"
                + "  Pickup From : " + pickupStart + " to " + pickupEnd + "\n\n"
                + nicReminderSms
                + "Agency: " + agency.getUser().getName() + " | " + agency.getUser().getPhone() + "\n"
                + "— AgriConnect";

        String emailBody = "Dear " + driver.getFullName() + ",\n\n"
                + "You have been assigned to the following transport trip by " + agency.getUser().getName() + ".\n\n"
                + "VEHICLE DETAILS\n"
                + "────────────────────────────────\n"
                + "  Vehicle Type    : " + vehicle.getVehicleType().name() + "\n"
                + "  Plate Number    : " + vehicle.getPlateNumber() + "\n"
                + "  Load Capacity   : " + vehicle.getCapacityKg() + " kg\n"
                + "────────────────────────────────\n\n"
                + "TRIP DETAILS\n"
                + "────────────────────────────────\n"
                + "  Market Destination : " + pkg.getMarketDestination() + "\n"
                + "  Travel Date        : " + travelDate + "\n"
                + "  Departure Time     : " + departTime + "\n"
                + "  Pickup Window      : " + pickupStart + " \u2014 " + pickupEnd + "\n"
                + "────────────────────────────────\n\n"
                + "AGENCY CONTACT\n"
                + "────────────────────────────────\n"
                + "  Agency Name    : " + agency.getUser().getName() + "\n"
                + "  Agency Phone   : " + agency.getUser().getPhone() + "\n"
                + "  Agency Address : " + agency.getAddress() + "\n"
                + "────────────────────────────────"
                + nicReminderEmail + "\n\n"
                + "Regards,\nAgriConnect Platform Team";

        String subject = "Trip Assignment \u2014 " + pkg.getMarketDestination() + " on " + travelDate;
        dispatch("TRIP_ASSIGNED", driver, sms, subject, emailBody);
    }

    // ─────────────────────────────────────────────────────────────
    // EVENT 3 — Driver Removed from Package
    // ─────────────────────────────────────────────────────────────

    public void sendDriverRemoved(Driver driver, Vehicle vehicle, Package pkg, Agency agency) {
        String travelDate = pkg.getTravelDateTime() != null ? pkg.getTravelDateTime().format(DATE_FMT) : "TBD";
        String departTime = pkg.getTravelDateTime() != null ? pkg.getTravelDateTime().format(TIME_FMT) : "TBD";

        String sms = "Hi " + driver.getFullName() + ",\n\n"
                + "You have been REMOVED from the following trip on AgriConnect:\n\n"
                + "  Vehicle     : " + vehicle.getVehicleType().name() + " \u2014 " + vehicle.getPlateNumber() + "\n"
                + "  Destination : " + pkg.getMarketDestination() + "\n"
                + "  Travel Date : " + travelDate + "\n"
                + "  Depart Time : " + departTime + "\n\n"
                + "Please contact " + agency.getUser().getName() + " at " + agency.getUser().getPhone() + " for more information.\n"
                + "— AgriConnect";

        String emailBody = "Dear " + driver.getFullName() + ",\n\n"
                + "This is to inform you that your assignment to the following trip\n"
                + "has been cancelled by " + agency.getUser().getName() + ".\n\n"
                + "CANCELLED TRIP DETAILS\n"
                + "────────────────────────────────\n"
                + "  Vehicle Type       : " + vehicle.getVehicleType().name() + "\n"
                + "  Plate Number       : " + vehicle.getPlateNumber() + "\n"
                + "  Market Destination : " + pkg.getMarketDestination() + "\n"
                + "  Travel Date        : " + travelDate + "\n"
                + "  Departure Time     : " + departTime + "\n"
                + "────────────────────────────────\n\n"
                + "Please contact your agency directly for further instructions:\n"
                + "  " + agency.getUser().getName() + " \u2014 " + agency.getUser().getPhone() + "\n\n"
                + "Regards,\nAgriConnect Platform Team";

        String subject = "Trip Assignment Cancelled \u2014 " + pkg.getMarketDestination() + " on " + travelDate;
        dispatch("TRIP_REMOVED", driver, sms, subject, emailBody);
    }

    // ─────────────────────────────────────────────────────────────
    // EVENT 4 — NIC Reminder
    // ─────────────────────────────────────────────────────────────

    public void sendNicReminder(Driver driver, Agency agency) {
        String sms = "Hi " + driver.getFullName() + ",\n\n"
                + "REMINDER: Your National Identity Card (NIC) has not yet been\n"
                + "submitted to " + agency.getUser().getName() + ".\n\n"
                + "Please bring your NIC to the agency office before your next trip.\n"
                + "Contact: " + agency.getUser().getName() + " \u2014 " + agency.getUser().getPhone() + "\n\n"
                + "— AgriConnect";

        String emailBody = "Dear " + driver.getFullName() + ",\n\n"
                + "Our records show that your National Identity Card (NIC) has not\n"
                + "yet been submitted to " + agency.getUser().getName() + ".\n\n"
                + "ACTION REQUIRED\n"
                + "────────────────────────────────\n"
                + "  Please bring your original NIC to the " + agency.getUser().getName() + " office\n"
                + "  at your earliest convenience.\n\n"
                + "  Agency Contact : " + agency.getUser().getName() + "\n"
                + "  Phone          : " + agency.getUser().getPhone() + "\n"
                + "  Address        : " + agency.getAddress() + "\n"
                + "────────────────────────────────\n\n"
                + "If you have already submitted your NIC, please ask " + agency.getUser().getName() + "\n"
                + "to update your status on the platform.\n\n"
                + "Regards,\nAgriConnect Platform Team";

        String subject = "Action Required \u2014 Please Submit Your NIC to " + agency.getUser().getName();
        dispatch("NIC_REMINDER", driver, sms, subject, emailBody);
    }

    // ─────────────────────────────────────────────────────────────
    // Internal dispatch — persists to DB + logs (stub send)
    // ─────────────────────────────────────────────────────────────

    private void dispatch(String eventType, Driver driver,
                          String smsBody, String emailSubject, String emailBody) {
        // SMS — always sent (every driver has a phone)
        sendSms(eventType, driver, smsBody);

        // Email — only sent if driver has an email address on file
        if (driver.getEmail() != null && !driver.getEmail().isBlank()) {
            sendEmail(eventType, driver, emailSubject, emailBody);
        }
    }

    private void sendSms(String eventType, Driver driver, String body) {
        Notification n = Notification.builder()
                .eventType(eventType)
                .channel("SMS")
                .recipientPhone(driver.getPhone())
                .recipientEmail(driver.getEmail())
                .messageBody(body)
                .status("STUB")
                .build();
        notificationRepository.save(n);
        log.info("[NOTIFICATION STUB][SMS][{}] To: {} | Body:\n{}", eventType, driver.getPhone(), body);
    }

    private void sendEmail(String eventType, Driver driver, String subject, String body) {
        Notification n = Notification.builder()
                .eventType(eventType)
                .channel("EMAIL")
                .recipientPhone(driver.getPhone())
                .recipientEmail(driver.getEmail())
                .messageBody("Subject: " + subject + "\n\n" + body)
                .status("STUB")
                .build();
        notificationRepository.save(n);
        log.info("[NOTIFICATION STUB][EMAIL][{}] To: {} | Subject: {} | Body:\n{}",
                eventType, driver.getEmail(), subject, body);
    }

    private String nicLabel(Driver driver) {
        return switch (driver.getNicStatus()) {
            case NIC_PROVIDED     -> "NIC Provided";
            case NIC_NOT_PROVIDED -> "NIC Not Yet Provided";
        };
    }
}
