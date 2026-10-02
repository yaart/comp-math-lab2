package yaart.s468198.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import yaart.s468198.dto.request.EquationRequest;
import yaart.s468198.dto.response.SolveResponse;
import yaart.s468198.service.EquationService;
import yaart.s468198.service.FileSaveService;

@Slf4j
@RestController
@RequestMapping("/api/lab2")
@RequiredArgsConstructor
public class EquationController {

    private final EquationService equationService;
    private final FileSaveService fileSaveService;

    @PostMapping("/solve-equation")
    public SolveResponse solve(@RequestBody EquationRequest request) {
        SolveResponse response = equationService.solve(request);

        if (response.isSuccess()) {
            try {
                String filename = fileSaveService.saveEquationSolution(
                        response,
                        request.getMethod(),
                        request.getFunctionId(),
                        request.getA(),
                        request.getB(),
                        request.getEpsilon()
                );
                response.setSavedToFile(filename);
                log.info("Решение сохранено в файл: {}", filename);
            } catch (Exception e) {
                log.error("Не удалось сохранить решение в файл: {}", e.getMessage());
                response.setSavedToFile(null);
            }
        }

        return response;
    }
}