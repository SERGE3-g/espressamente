package it.espressamente.api.service;

import it.espressamente.api.model.entity.ContactRequest;
import it.espressamente.api.model.entity.ServiceRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.contact.notification-email}")
    private String notificationEmail;

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
}
