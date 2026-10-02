package yaart.s468198.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import yaart.s468198.dto.request.OptimizationRequest;
import yaart.s468198.dto.response.OptimizationResponse;
import yaart.s468198.exception.MathException;
import yaart.s468198.math.base.Function;
import yaart.s468198.math.functions.FunctionRegistry;
import yaart.s468198.math.optimizers.Optimizer;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OptimizationService {

    private final FunctionRegistry functionRegistry;
    private final Map<String, Optimizer> optimizers;

    public OptimizationResponse optimize(OptimizationRequest request) {
        log.info("Оптимизация: functionId={}, method={}, type={}, startX={}, lr={}, eps={}",
                request.getFunctionId(), request.getMethod(), request.getType(),
                request.getStartX(), request.getLearningRate(), request.getEpsilon());

        if (request.getStartX() < -1000 || request.getStartX() > 1000) {
            throw new MathException(
                    "Начальное приближение должно быть в диапазоне [-100, 100]",
                    "INVALID_START_X"
            );
        }

        if (request.getEpsilon() <= 0 || request.getEpsilon() > 1) {
            throw new MathException(
                    "Погрешность должна быть в интервале (0, 1]",
                    "INVALID_EPSILON"
            );
        }

        Function function = functionRegistry.getFunction(request.getFunctionId());

        Optimizer optimizer = optimizers.get(request.getMethod());
        if (optimizer == null) {
            throw new MathException(
                    "Метод оптимизации '" + request.getMethod() + "' не найден. " +
                            "Доступны: gradient, adam",
                    "METHOD_NOT_FOUND"
            );
        }

        try {
            OptimizationResponse response = optimizer.optimize(function, request);
            log.info("Оптимизация завершена: {}={}, f({})={}, iterations={}",
                    request.getType().equals("min") ? "минимум" : "максимум",
                    response.getExtremum(), response.getExtremum(),
                    response.getValue(), response.getIterations());
            return response;
        } catch (MathException e) {
            throw e;
        } catch (Exception e) {
            log.error("Ошибка при оптимизации", e);
            throw new MathException(
                    "Ошибка при оптимизации: " + e.getMessage(),
                    "OPTIMIZATION_ERROR"
            );
        }
    }
}