package com.agriconnect.shared.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload.dir}")
    private String uploadDir;

    public String store(MultipartFile file, String subFolder) throws IOException {
        String ext  = getExt(file.getOriginalFilename());
        String name = UUID.randomUUID() + "." + ext;
        Path dir    = Paths.get(uploadDir, subFolder);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(name),
                StandardCopyOption.REPLACE_EXISTING);
        return subFolder + "/" + name;
    }

    private String getExt(String filename) {
        if (filename == null) return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}
