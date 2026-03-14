package it.espressamente.api.admin.controller;

import it.espressamente.api.common.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import it.espressamente.api.admin.service.AuditService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin/upload")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','STORE_MANAGER')")
@Slf4j
public class AdminUploadController {

    private final AuditService auditService;

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    @Value("${app.storage.local-path:./uploads}")
    private String uploadDir;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> upload(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File vuoto"));
        }
        if (file.getSize() > MAX_SIZE) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File troppo grande (max 10 MB)"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Tipo file non supportato (usa JPG, PNG, WebP)"));
        }

        String original  = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String extension = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String filename  = UUID.randomUUID() + extension;

        Path dir  = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        log.info("Upload: {} ({} bytes)", filename, file.getSize());
        auditService.log("UPLOAD", "File", null, "Upload immagine: " + filename + " (" + file.getSize() + " bytes)");
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", "/api/uploads/" + filename)));
    }
}
