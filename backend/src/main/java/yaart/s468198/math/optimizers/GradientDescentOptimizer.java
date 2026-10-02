package yaart.s468198.math.optimizers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import yaart.s468198.dto.request.OptimizationRequest;
import yaart.s468198.dto.response.OptimizationResponse;
import yaart.s468198.dto.response.OptimizationStep;
import yaart.s468198.exception.MathException;
import yaart.s468198.math.base.Function;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component("gradient")
public class GradientDescentOptimizer implements Optimizer {

    private static final int DEFAULT_MAX_ITERATIONS = 5000;
    private static final double DEFAULT_LEARNING_RATE = 0.01;
    private static final double MIN_LEARNING_RATE = 1e-8;
    private static final double MAX_LEARNING_RATE = 1.0;
    private static final double GRADIENT_TOLERANCE = 1e-10;

    @Override
    public OptimizationResponse optimize(Function function, OptimizationRequest request) {
        log.info("Запуск градиентного спуска: функция={}, тип={}, startX={}, lr={}, eps={}",
                request.getFunctionId(), request.getType(), request.getStartX(),
                request.getLearningRate(), request.getEpsilon());

        try {
            validateRequest(request);

            double learningRate = request.getLearningRate() > 0 ?
                    request.getLearningRate() : DEFAULT_LEARNING_RATE;
            int maxIterations = request.getMaxIterations() > 0 ?
                    request.getMaxIterations() : DEFAULT_MAX_ITERATIONS;

            double sign = request.getType().equals("max") ? 1.0 : -1.0;

            return performOptimization(function, request.getStartX(), learningRate,
                    request.getEpsilon(), maxIterations, sign, request.getType());

        } catch (MathException e) {
            throw e;
        } catch (Exception e) {
            log.error("Ошибка в градиентном спуске", e);
            throw new MathException("Ошибка при оптимизации: " + e.getMessage(),
                    "OPTIMIZATION_ERROR");
        }
    }

    private OptimizationResponse performOptimization(Function f, double startX,
                                                     double learningRate, double eps,
                                                     int maxIterations, double sign,
                                                     String type) {
        List<OptimizationStep> history = new ArrayList<>();
        double xCurr = startX;
        double xPrev;
        int iter = 0;
        double gradient;

        double currentLR = learningRate;
        int stagnationCount = 0;
        double prevValue = Double.MAX_VALUE;

        do {
            iter++;
            xPrev = xCurr;

            try {
                gradient = f.firstDerivative(xPrev);

                double direction = sign * gradient;

                xCurr = xPrev - currentLR * direction;

                if (Math.abs(xCurr) > 1e6) {
                    throw new MathException(
                            "Значение x вышло за допустимые пределы: " + xCurr,
                            "VALUE_OUT_OF_BOUNDS"
                    );
                }

                if (Double.isNaN(xCurr) || Double.isInfinite(xCurr)) {
                    throw new MathException(
                            "Получено недопустимое значение: " + xCurr,
                            "INVALID_VALUE"
                    );
                }

                double fx = f.calculate(xCurr);

                if (Math.abs(fx - prevValue) < eps * 10) {
                    stagnationCount++;
                    if (stagnationCount > 5) {
                        currentLR *= 0.5;
                        log.debug("Уменьшаем learning rate до {} из-за стагнации", currentLR);
                        stagnationCount = 0;
                    }
                } else {
                    stagnationCount = 0;
                }

                prevValue = fx;

                history.add(OptimizationStep.builder()
                        .n(iter)
                        .x(xCurr)
                        .fx(fx)
                        .gradient(gradient)
                        .learningRate(currentLR)
                        .build());

                log.trace("Итерация {}: x={}, f(x)={}, grad={}, lr={}",
                        iter, xCurr, fx, gradient, currentLR);

            } catch (MathException e) {
                throw e;
            } catch (Exception e) {
                throw new MathException(
                        "Ошибка на итерации " + iter + ": " + e.getMessage(),
                        "ITERATION_ERROR"
                );
            }

        } while (Math.abs(xCurr - xPrev) > eps &&
                Math.abs(gradient) > GRADIENT_TOLERANCE &&
                iter < maxIterations);

        if (iter >= maxIterations) {
            log.warn("Достигнуто максимальное число итераций: {}", maxIterations);
        }

        double finalValue = f.calculate(xCurr);
        double finalGradient = f.firstDerivative(xCurr);

        log.info("Оптимизация завершена за {} итераций: x={}, f(x)={}, grad={}",
                iter, xCurr, finalValue, finalGradient);

        return OptimizationResponse.builder()
                .success(true)
                .extremum(xCurr)
                .value(finalValue)
                .type(type)
                .iterations(iter)
                .finalGradient(finalGradient)
                .history(history)
                .build();
    }

    private void validateRequest(OptimizationRequest request) {
        if (request.getLearningRate() > MAX_LEARNING_RATE ||
                request.getLearningRate() < 0 && request.getLearningRate() != 0) {
            throw new MathException(
                    "Learning rate должен быть в диапазоне [0, " + MAX_LEARNING_RATE + "]",
                    "INVALID_LEARNING_RATE"
            );
        }

        if (request.getEpsilon() <= 0 || request.getEpsilon() > 1) {
            throw new MathException(
                    "Точность должна быть в интервале (0, 1]",
                    "INVALID_EPSILON"
            );
        }

        if (!request.getType().equals("min") && !request.getType().equals("max")) {
            throw new MathException(
                    "Тип оптимизации должен быть 'min' или 'max'",
                    "INVALID_TYPE"
            );
        }
    }
}