package yaart.s468198.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import yaart.s468198.exception.MathException;
import yaart.s468198.service.FileSaveService;

import java.nio.file.Path;

@Slf4j
@RestController
@RequestMapping("/api/lab2/download")
@RequiredArgsConstructor
public class FileDownloadController {

    private final FileSaveService fileSaveService;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            log.info("Запрос на скачивание файла: {}", filename);

            Path filePath = fileSaveService.getFilePath(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("Файл не найден или недоступен: {}", filePath.toAbsolutePath());
                throw new MathException("Файл не найден: " + filename, "FILE_NOT_FOUND");
            }

            log.info("Файл найден, отправляем: {}", filePath.toAbsolutePath());

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Ошибка при скачивании файла {}: {}", filename, e.getMessage());
            throw new MathException("Не удалось скачать файл: " + e.getMessage(), "DOWNLOAD_ERROR");
        }
    }
}