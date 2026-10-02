package yaart.s468198.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import yaart.s468198.dto.request.SystemRequest;
import yaart.s468198.dto.response.SystemSolveResponse;
import yaart.s468198.service.SystemService;
import yaart.s468198.service.FileSaveService;

@Slf4j
@RestController
@RequestMapping("/api/lab2/system")
@RequiredArgsConstructor
public class SystemController {

    private final SystemService systemService;
    private final FileSaveService fileSaveService;

    @PostMapping("/solve")
    public SystemSolveResponse solve(@RequestBody SystemRequest request) {
        SystemSolveResponse response = systemService.solve(request);

        if (response.isSuccess()) {
            try {
                String filename = fileSaveService.saveSystemSolution(
                        response,
                        request.getSystemId(),
                        request.getX0(),
                        request.getY0(),
                        request.getEpsilon()
                );
                response.setSavedToFile(filename);
                log.info("Решение системы сохранено в файл: {}", filename);
            } catch (Exception e) {
                log.error("Не удалось сохранить решение в файл: {}", e.getMessage());
                response.setSavedToFile(null);
            }
        }

        return response;
    }
}