package yaart.s468198.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import yaart.s468198.dto.request.OptimizationRequest;
import yaart.s468198.dto.response.OptimizationResponse;
import yaart.s468198.service.OptimizationService;
import yaart.s468198.service.FileSaveService;

@Slf4j
@RestController
@RequestMapping("/api/lab2/optimization")
@RequiredArgsConstructor
public class OptimizationController {

    private final OptimizationService optimizationService;
    private final FileSaveService fileSaveService;

    @PostMapping("/optimize")
    public OptimizationResponse optimize(@RequestBody OptimizationRequest request) {
        log.info("Запрос на оптимизацию: method={}, type={}, startX={}",
                request.getMethod(), request.getType(), request.getStartX());

        OptimizationResponse response = optimizationService.optimize(request);

        if (response.isSuccess()) {
            try {
                String filename = fileSaveService.saveOptimizationResult(
                        response,
                        request.getMethod(),
                        request.getFunctionId(),
                        request.getStartX(),
                        request.getLearningRate(),
                        request.getEpsilon()
                );
                response.setSavedToFile(filename);
                log.info("Результат оптимизации сохранен в файл: {}", filename);
            } catch (Exception e) {
                log.error("Не удалось сохранить результат оптимизации: {}", e.getMessage());
            }
        }

        return response;
    }
}