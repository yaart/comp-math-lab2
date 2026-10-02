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
@Component("adam")
public class AdamOptimizer implements Optimizer {

    private static final int DEFAULT_MAX_ITERATIONS = 5000;
    private static final double DEFAULT_LEARNING_RATE = 0.001;
    private static final double BETA1 = 0.9;
    private static final double BETA2 = 0.999;
    private static final double EPSILON = 1e-8;
    private static final double MIN_LEARNING_RATE = 1e-8;
    private static final double MAX_LEARNING_RATE = 0.1;
    private static final double GRADIENT_TOLERANCE = 1e-8;

    @Override
    public OptimizationResponse optimize(Function function, OptimizationRequest request) {
        log.info("Запуск Adam оптимизатора: функция={}, тип={}, startX={}, lr={}, eps={}",
                request.getFunctionId(), request.getType(), request.getStartX(),
                request.getLearningRate(), request.getEpsilon());

        try {
            validateRequest(request);

            double learningRate = request.getLearningRate() > 0 ?
                    Math.min(request.getLearningRate(), MAX_LEARNING_RATE) : DEFAULT_LEARNING_RATE;
            int maxIterations = request.getMaxIterations() > 0 ?
                    request.getMaxIterations() : DEFAULT_MAX_ITERATIONS;

            double sign = request.getType().equals("max") ? -1.0 : 1.0;

            return performAdamOptimization(function, request.getStartX(), learningRate,
                    request.getEpsilon(), maxIterations, sign, request.getType());

        } catch (MathException e) {
            throw e;
        } catch (Exception e) {
            log.error("Ошибка в Adam оптимизаторе", e);
            throw new MathException("Ошибка при оптимизации Adam: " + e.getMessage(),
                    "ADAM_ERROR");
        }
    }

    private OptimizationResponse performAdamOptimization(Function f, double startX,
                                                         double learningRate, double eps,
                                                         int maxIterations, double sign,
                                                         String type) {
        List<OptimizationStep> history = new ArrayList<>();
        double xCurr = startX;
        double m = 0.0;
        double v = 0.0;
        int iter = 0;
        double gradient;

        log.debug("Adam параметры: lr={}, β1={}, β2={}, ε={}",
                learningRate, BETA1, BETA2, EPSILON);

        do {
            iter++;

            try {
                gradient = f.firstDerivative(xCurr) * sign;

                if (Double.isNaN(gradient) || Double.isInfinite(gradient)) {
                    throw new MathException(
                            "Недопустимое значение градиента: " + gradient,
                            "INVALID_GRADIENT"
                    );
                }

                m = BETA1 * m + (1 - BETA1) * gradient;
                v = BETA2 * v + (1 - BETA2) * gradient * gradient;

                double mHat = m / (1 - Math.pow(BETA1, iter));
                double vHat = v / (1 - Math.pow(BETA2, iter));

                double step = learningRate * mHat / (Math.sqrt(vHat) + EPSILON);
                xCurr = xCurr - step;

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

                history.add(OptimizationStep.builder()
                        .n(iter)
                        .x(xCurr)
                        .fx(fx)
                        .gradient(gradient)
                        .learningRate(learningRate)
                        .m(m)
                        .v(v)
                        .build());

                log.trace("Итерация {}: x={}, f(x)={}, grad={}, m={}, v={}",
                        iter, xCurr, fx, gradient, m, v);

                if (Math.abs(gradient) < GRADIENT_TOLERANCE && iter > 10) {
                    log.debug("Достигнута tolerance градиента на итерации {}", iter);
                    break;
                }

            } catch (MathException e) {
                throw e;
            } catch (Exception e) {
                throw new MathException(
                        "Ошибка на итерации " + iter + ": " + e.getMessage(),
                        "ITERATION_ERROR"
                );
            }

        } while (Math.abs(history.get(iter - 1).getGradient()) > eps &&
                iter < maxIterations);

        if (iter >= maxIterations) {
            log.warn("Достигнуто максимальное число итераций: {}", maxIterations);
        }

        double finalValue = f.calculate(xCurr);
        double finalGradient = f.firstDerivative(xCurr) * sign;

        log.info("Adam оптимизация завершена за {} итераций: x={}, f(x)={}, grad={}",
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
                    "Для Adam learning rate должен быть в диапазоне [0, " + MAX_LEARNING_RATE + "]",
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