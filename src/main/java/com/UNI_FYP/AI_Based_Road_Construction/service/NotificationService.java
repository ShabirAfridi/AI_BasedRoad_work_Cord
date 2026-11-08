package com.UNI_FYP.AI_Based_Road_Construction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final JavaMailSender mailSender;

    // Read from application.properties
    // app.mail.from=yourgmail@gmail.com
    @Value( "${spring.mail.username}")
    private String fromEmail;

    // ─────────────────────────────────────────────────────────────
    // CONFLICT ALERT
    // Sent to both departments when a conflict is detected
    // Called by ConflictDetectionService after saving Conflict row
    // ─────────────────────────────────────────────────────────────
    @Async
    public void sendConflictAlert(
            String toEmail,
            String yourDeptName,
            String conflictingDeptName,
            String roadSegmentName,
            String startDate,
            String endDate
    ) {
        String subject = " Road Work Conflict Detected — " + roadSegmentName;

        String body = """
                Dear %s Team,
                
                A scheduling conflict has been detected for your road work request.
                
                Details:
                ─────────────────────────────────
                Road Segment  : %s
                Your Dates    : %s to %s
                Conflict With : %s
                ─────────────────────────────────
                
                Your request has been flagged as CONFLICT_FLAGGED and is now 
                pending admin review.
                
                The Road Authority administrator will review both requests and 
                will contact you with a resolution — either merging the work 
                into a single session or requesting one party to reschedule.
                
                Please do not begin any excavation work until you receive 
                an APPROVED notification.
                
                Road Work Coordination System
                """.formatted(
                yourDeptName,
                roadSegmentName,
                startDate,
                endDate,
                conflictingDeptName
        );

        sendEmail(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────
    // APPROVAL NOTIFICATION
    // Sent to department when admin approves their request
    // Called by AdminService.approveRequest()
    // ─────────────────────────────────────────────────────────────
    @Async
    public void sendApprovalNotice(
            String toEmail,
            String deptName,
            String roadSegmentName,
            String startDate,
            String endDate
    ) {
        String subject = " Work Request Approved — " + roadSegmentName;

        String body = """
                Dear %s Team,
                
                Your road work request has been APPROVED.
                
                Details:
                ─────────────────────────────────
                Road Segment : %s
                Start Date   : %s
                End Date     : %s
                ─────────────────────────────────
                
                You may proceed with your excavation work as scheduled.
                Please ensure all safety protocols are followed and 
                the road is restored to its original condition upon completion.
                
                Road Work Coordination System
                """.formatted(
                deptName,
                roadSegmentName,
                startDate,
                endDate
        );

        sendEmail(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────
    // REJECTION NOTIFICATION
    // Sent to department when admin rejects their request
    // Called by AdminService.rejectRequest()
    // ─────────────────────────────────────────────────────────────
    @Async
    public void sendRejectionNotice(
            String toEmail,
            String deptName,
            String roadSegmentName,
            String adminRemarks
    ) {
        String subject = " Work Request Rejected — " + roadSegmentName;

        String body = """
                Dear %s Team,
                
                Unfortunately, your road work request for %s 
                has been REJECTED by the Road Authority administrator.
                
                Admin Remarks:
                ─────────────────────────────────
                %s
                ─────────────────────────────────
                
                If you believe this decision is incorrect, please contact 
                the Road Authority for further clarification.
                
                You may submit a new request with updated details if required.
                
                Road Work Coordination System
                """.formatted(
                deptName,
                roadSegmentName,
                adminRemarks != null ? adminRemarks : "No remarks provided"
        );

        sendEmail(toEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────
    // COMPLAINT RECEIVED
    // Sent to admin when a citizen submits a complaint
    // Called by CitizenComplaintService (Sprint 4)
    // ─────────────────────────────────────────────────────────────
    @Async
    public void sendComplaintAlert(
            String adminEmail,
            String roadSegmentName,
            String complaintDescription,
            String category
    ) {
        String subject = "🚨 New Citizen Complaint — " + roadSegmentName;

        String body = """
                A new citizen complaint has been submitted.
                
                Details:
                ─────────────────────────────────
                Road Segment : %s
                Category     : %s
                Description  : %s
                ─────────────────────────────────
                
                Please review this complaint in the admin dashboard
                and take appropriate action.
                
                Road Work Coordination System
                """.formatted(
                roadSegmentName,
                category,
                complaintDescription
        );

        sendEmail(adminEmail, subject, body);
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPER — actual email sending
    // All public methods call this internally
    // @Async means email sending runs on a separate thread
    // so the API response is not delayed waiting for Gmail SMTP
    // ─────────────────────────────────────────────────────────────
    private void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            // Log the error but do NOT throw it
            // Email failure should never crash the main operation
            // e.g. conflict was still saved even if email fails
            log.error("Failed to send email to {} — reason: {}", toEmail, e.getMessage());
        }
    }
    @Async
    public void sendPasswordResetEmail(String email, String fullName, String link) {
        String subject = "Reset Your Password ";
        String body = """
                hi %s,
                We Received a request to rest a password.
                this link is valid for 30 minutes:
                %s
                If you didn't request this, you can safely ignore this email.
                
                Road Work Coordination System
                """.formatted(fullName,link);
        sendEmail(email,subject,body);
    }
}
