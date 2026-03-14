package it.espressamente.api.notification.service;

import it.espressamente.api.contact.entity.ContactRequest;
import it.espressamente.api.contact.entity.ComodatoRequest;
import it.espressamente.api.invoice.entity.Invoice;
import it.espressamente.api.contact.entity.ServiceRequest;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.contact.notification-email}")
    private String notificationEmail;

    @Value("${app.company.name:Espressamente Coffee}")
    private String companyName;

    @Value("${app.company.address:}")
    private String companyAddress;

    @Value("${app.company.vat-number:}")
    private String companyVat;

    @Value("${app.company.phone:}")
    private String companyPhone;

    @Value("${app.company.email:}")
    private String companyEmail;

    @Value("${app.company.website:}")
    private String companyWebsite;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendContactNotification(ContactRequest request) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(notificationEmail);
            mail.setSubject("[Espressamente] Nuova richiesta: " + request.getContactType());
            mail.setText(String.format(
                    "Nuova richiesta di contatto:\n\n" +
                    "Nome: %s\nEmail: %s\nTelefono: %s\n" +
                    "Tipo: %s\nOggetto: %s\n\nMessaggio:\n%s",
                    request.getFullName(), request.getEmail(), request.getPhone(),
                    request.getContactType(), request.getSubject(), request.getMessage()
            ));
            mailSender.send(mail);
            log.info("Email notifica contatto inviata per: {}", request.getEmail());
        } catch (Exception e) {
            log.error("Errore invio email notifica contatto: {}", e.getMessage());
        }
    }

    @Async
    public void sendServiceNotification(ServiceRequest request) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(notificationEmail);
            mail.setSubject("[Espressamente] Richiesta Assistenza: " + request.getMachineBrand());
            mail.setText(String.format(
                    "Nuova richiesta di assistenza:\n\n" +
                    "Nome: %s\nEmail: %s\nTelefono: %s\n" +
                    "Macchina: %s %s %s\nData preferita: %s\n\nProblema:\n%s",
                    request.getFullName(), request.getEmail(), request.getPhone(),
                    request.getMachineBrand(), request.getMachineModel(), request.getMachineType(),
                    request.getPreferredDate(), request.getIssueDescription()
            ));
            mailSender.send(mail);
            log.info("Email notifica assistenza inviata per: {}", request.getEmail());
        } catch (Exception e) {
            log.error("Errore invio email notifica assistenza: {}", e.getMessage());
        }
    }

    @Async
    public void sendComodatoNotification(ComodatoRequest request) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(notificationEmail);
            mail.setSubject("[Espressamente] Nuova richiesta comodato — " + request.getCity());
            mail.setText(String.format(
                    "Nuova richiesta comodato d'uso:\n\n" +
                    "Nome: %s\nEmail: %s\nTelefono: %s\n" +
                    "Azienda: %s\nCittà: %s (%s)\nIndirizzo: %s\n\n" +
                    "Macchina richiesta: %s\nModalità: %s\n\nNote:\n%s",
                    request.getFullName(), request.getEmail(), request.getPhone(),
                    request.getCompanyName() != null ? request.getCompanyName() : "—",
                    request.getCity(),
                    request.getProvince() != null ? request.getProvince() : "—",
                    request.getAddress() != null ? request.getAddress() : "—",
                    request.getMachineName() != null ? request.getMachineName() : "Non specificata",
                    request.getDeliveryType(),
                    request.getNotes() != null ? request.getNotes() : "—"
            ));
            mailSender.send(mail);
            log.info("Email notifica comodato inviata per: {}", request.getEmail());
        } catch (Exception e) {
            log.error("Errore invio email notifica comodato: {}", e.getMessage());
        }
    }

    @Async
    public void sendSecurityAlert(String description, String ip, int attemptCount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(notificationEmail);
            helper.setSubject("[Espressamente] ⚠ Allerta Sicurezza — Accesso bloccato");

            String time = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

            String html = """
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: #B71C1C; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">⚠ Allerta Sicurezza</h1>
                        <p style="color: #FFCDD2; margin: 4px 0 0; font-size: 12px;">%s</p>
                    </div>
                    <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                        <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                            È stato rilevato un tentativo di accesso sospetto alla dashboard admin.
                        </p>
                        <table style="width: 100%%; border-collapse: collapse; margin: 0 0 24px;">
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; font-size: 13px; color: #888; width: 140px;">Evento</td>
                                <td style="padding: 10px 0; font-size: 13px; color: #333; font-weight: 600;">%s</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; font-size: 13px; color: #888;">Indirizzo IP</td>
                                <td style="padding: 10px 0; font-size: 13px; color: #333; font-family: monospace;">%s</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; font-size: 13px; color: #888;">Tentativi falliti</td>
                                <td style="padding: 10px 0; font-size: 13px; color: #B71C1C; font-weight: 600;">%d</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-size: 13px; color: #888;">Data e ora</td>
                                <td style="padding: 10px 0; font-size: 13px; color: #333;">%s</td>
                            </tr>
                        </table>
                        <p style="color: #555; font-size: 13px; line-height: 1.6; margin: 0;">
                            L'accesso da questo utente/IP è stato temporaneamente bloccato per 15 minuti.
                            Se non riconosci questa attività, controlla i log di audit nella dashboard.
                        </p>
                    </div>
                    <div style="background: #FFF3E0; padding: 16px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
                        <p style="color: #E65100; font-size: 11px; margin: 0; font-weight: 600;">
                            Questa è un'email automatica di sicurezza — %s
                        </p>
                    </div>
                </div>
                """.formatted(companyName, description, ip, attemptCount, time, companyName);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email allerta sicurezza inviata: {}", description);
        } catch (Exception e) {
            log.error("Errore invio email allerta sicurezza: {}", e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetToken, String adminBaseUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("[Espressamente] Reset Password");

            String resetLink = adminBaseUrl + "/reset-password?token=" + resetToken;
            String name = fullName != null ? fullName : "Utente";

            String html = """
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: #5D4037; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">%s</h1>
                        <p style="color: #D7CCC8; margin: 4px 0 0; font-size: 12px;">Reset Password</p>
                    </div>
                    <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                        <p style="color: #333; font-size: 15px; margin: 0 0 20px;">Ciao <strong>%s</strong>,</p>
                        <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                            Hai richiesto il reset della password del tuo account admin.<br>
                            Clicca il pulsante qui sotto per impostare una nuova password:
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s" style="background: #5D4037; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
                                Reimposta Password
                            </a>
                        </div>
                        <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 24px 0 0;">
                            Il link scade tra 30 minuti.<br>
                            Se non hai richiesto il reset, ignora questa email.
                        </p>
                    </div>
                    <div style="background: #F5F5F5; padding: 16px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="color: #999; font-size: 11px; margin: 0;">%s</p>
                    </div>
                </div>
                """.formatted(companyName, name, resetLink, companyName);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email reset password inviata a {}", toEmail);
        } catch (Exception e) {
            log.error("Errore invio email reset password: {}", e.getMessage());
        }
    }

    /**
     * Invia fattura al cliente via email con PDF allegato.
     * Sincrono (no @Async) per propagare errori al controller.
     */
    public void sendInvoiceEmail(Invoice invoice, byte[] pdfBytes) {
        try {
            String customerEmail = invoice.getCustomer().getEmail();
            String customerName = invoice.getCustomer().getFullName();

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customerEmail);
            helper.setSubject("[Espressamente] Fattura " + invoice.getInvoiceNumber());
            helper.setText(buildInvoiceHtmlBody(invoice, customerName), true);

            String filename = invoice.getInvoiceNumber() + ".pdf";
            helper.addAttachment(filename, new ByteArrayResource(pdfBytes), "application/pdf");

            mailSender.send(message);
            log.info("Email fattura {} inviata a {}", invoice.getInvoiceNumber(), customerEmail);
        } catch (Exception e) {
            log.error("Errore invio email fattura {}: {}", invoice.getInvoiceNumber(), e.getMessage());
            throw new RuntimeException("Errore nell'invio dell'email: " + e.getMessage());
        }
    }

    private String buildInvoiceHtmlBody(Invoice invoice, String customerName) {
        NumberFormat fmt = NumberFormat.getCurrencyInstance(Locale.ITALY);
        String name = customerName != null ? customerName : "Cliente";
        String total = fmt.format(invoice.getTotal());
        String issueDate = invoice.getIssueDate().toString();
        String dueDate = invoice.getDueDate() != null ? invoice.getDueDate().toString() : "—";

        // Company footer details
        StringBuilder footerParts = new StringBuilder();
        if (!companyAddress.isBlank()) footerParts.append(companyAddress);
        if (!companyPhone.isBlank()) {
            if (footerParts.length() > 0) footerParts.append(" | ");
            footerParts.append("Tel: ").append(companyPhone);
        }
        if (!companyVat.isBlank()) {
            if (footerParts.length() > 0) footerParts.append(" | ");
            footerParts.append("P.IVA: ").append(companyVat);
        }
        String footerInfo = footerParts.toString();
        String websiteLink = !companyWebsite.isBlank() ? companyWebsite : "";

        return """
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                <!-- Header -->
                <div style="background: #5D4037; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">%s</h1>
                    <p style="color: #D7CCC8; margin: 4px 0 0; font-size: 12px;">%s</p>
                </div>

                <!-- Body -->
                <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                    <p style="color: #333; font-size: 15px; margin: 0 0 20px;">Gentile <strong>%s</strong>,</p>
                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                        In allegato trova la fattura <strong style="color: #5D4037;">%s</strong>.<br>
                        Di seguito un riepilogo:
                    </p>

                    <!-- Invoice summary table -->
                    <table style="width: 100%%; border-collapse: collapse; margin: 0 0 24px; border: 1px solid #e0e0e0; border-radius: 6px;">
                        <tr style="background: #EFEBE9;">
                            <td style="padding: 12px 16px; font-size: 13px; color: #5D4037; font-weight: 600;">Numero fattura</td>
                            <td style="padding: 12px 16px; font-size: 13px; text-align: right; color: #333;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; font-size: 13px; color: #888; border-bottom: 1px solid #f0f0f0;">Data emissione</td>
                            <td style="padding: 12px 16px; font-size: 13px; text-align: right; color: #333; border-bottom: 1px solid #f0f0f0;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; font-size: 13px; color: #888; border-bottom: 1px solid #f0f0f0;">Scadenza</td>
                            <td style="padding: 12px 16px; font-size: 13px; text-align: right; color: #333; border-bottom: 1px solid #f0f0f0;">%s</td>
                        </tr>
                        <tr style="background: #5D4037;">
                            <td style="padding: 14px 16px; font-size: 15px; color: #fff; font-weight: 700;">Totale</td>
                            <td style="padding: 14px 16px; font-size: 15px; text-align: right; color: #fff; font-weight: 700;">%s</td>
                        </tr>
                    </table>

                    <p style="color: #555; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
                        Per qualsiasi informazione non esiti a contattarci.
                    </p>
                    <p style="color: #333; font-size: 14px; margin: 24px 0 0;">
                        Cordiali saluti,<br>
                        <strong style="color: #5D4037;">%s</strong>
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #F5F5F5; padding: 16px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="color: #999; font-size: 11px; margin: 0;">%s</p>
                    <p style="color: #999; font-size: 11px; margin: 4px 0 0;">%s</p>
                </div>
            </div>
            """.formatted(
                companyName, companyEmail,
                name,
                invoice.getInvoiceNumber(),
                invoice.getInvoiceNumber(),
                issueDate,
                dueDate,
                total,
                companyName,
                footerInfo,
                websiteLink
        );
    }
}
