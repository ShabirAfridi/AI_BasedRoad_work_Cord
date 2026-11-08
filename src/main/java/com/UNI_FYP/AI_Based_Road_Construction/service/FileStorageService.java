package com.UNI_FYP.AI_Based_Road_Construction.service;

import com.UNI_FYP.AI_Based_Road_Construction.exception.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    // The camera component always sends JPEG, so only JPEG is accepted
    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new AppException("File is empty", HttpStatus.BAD_REQUEST);
        }

        try {
            byte[] bytes = file.getBytes();

            // Check the real file signature (FF D8 FF), not just the declared type
            boolean isJpeg = bytes.length > 3
                    && (bytes[0] & 0xFF) == 0xFF
                    && (bytes[1] & 0xFF) == 0xD8
                    && (bytes[2] & 0xFF) == 0xFF;
            if (!isJpeg) {
                throw new AppException("Only camera photos (JPEG) are allowed", HttpStatus.BAD_REQUEST);
            }

            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);

            String storedName = UUID.randomUUID() + ".jpg";
            Files.write(dir.resolve(storedName), bytes);

            return "/uploads/" + storedName;

        } catch (IOException e) {
            throw new AppException("Failed to store file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}