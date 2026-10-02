package yaart.s468198.math.solvers.system;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import yaart.s468198.dto.response.SystemIterationStep;
import yaart.s468198.dto.response.SystemSolveResponse;
import yaart.s468198.exception.MathException;
import yaart.s468198.math.base.EquationSystem;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class SystemIterationSolver {
    private static final int MAX_ITERATIONS = 1000;

    public SystemSolveResponse solve(EquationSystem system, double x0, double y0, double eps) {
        log.info("Начало решения системы: x0={}, y0={}, eps={}", x0, y0, eps);

        boolean converges = checkConvergence(system, x0, y0);
        if (!converges) {
            log.warn("Достаточное условие сходимости не выполнено, но пробуем продолжить");
        }

        List<SystemIterationStep> history = new ArrayList<>();
        double xCurr = x0;
        double yCurr = y0;
        double xPrev, yPrev;
        int iter = 0;
        double maxDiff;

        do {
            iter++;
            xPrev = xCurr;
            yPrev = yCurr;

            try {
                double[] nextValues = system.calculate(new double[]{xPrev, yPrev});
                xCurr = nextValues[0];
                yCurr = nextValues[1];
            } catch (Exception e) {
                throw new MathException(
                        "Ошибка при вычислении на итерации " + iter + ": " + e.getMessage(),
                        "CALCULATION_ERROR"
                );
            }

            if (Double.isNaN(xCurr) || Double.isInfinite(xCurr) ||
                    Double.isNaN(yCurr) || Double.isInfinite(yCurr)) {
                throw new MathException(
                        "Метод расходится (получены бесконечные значения)",
                        "DIVERGENCE"
                );
            }

            double deltaX = Math.abs(xCurr - xPrev);
            double deltaY = Math.abs(yCurr - yPrev);
            maxDiff = Math.max(deltaX, deltaY);

            history.add(SystemIterationStep.builder()
                    .n(iter)
                    .x(xCurr)
                    .y(yCurr)
                    .deltaX(deltaX)
                    .deltaY(deltaY)
                    .build());

            log.debug("Итерация {}: x={}, y={}, deltaX={}, deltaY={}", iter, xCurr, yCurr, deltaX, deltaY);

        } while (maxDiff > eps && iter < MAX_ITERATIONS);

        if (iter >= MAX_ITERATIONS) {
            throw new MathException(
                    "Метод не сошелся за " + MAX_ITERATIONS + " итераций",
                    "LIMIT_EXCEEDED"
            );
        }

        double[][] residuals = system.originalFunctions(new double[]{xCurr, yCurr});
        double residualF = Math.abs(residuals[0][0]);
        double residualG = Math.abs(residuals[1][0]);

        log.info("Решение найдено за {} итераций: x={}, y={}", iter, xCurr, yCurr);
        log.info("Невязки: |f|={}, |g|={}", residualF, residualG);

        return SystemSolveResponse.builder()
                .success(true)
                .resultVector(new double[]{xCurr, yCurr})
                .errorVector(new double[]{
                        history.get(history.size() - 1).getDeltaX(),
                        history.get(history.size() - 1).getDeltaY()
                })
                .residuals(new double[]{residualF, residualG})
                .iterations(iter)
                .history(history)
                .build();
    }

    private boolean checkConvergence(EquationSystem system, double x, double y) {
        try {
            double[][] j = system.jacobian(new double[]{x, y});

            double row1 = Math.abs(j[0][0]) + Math.abs(j[0][1]);
            double row2 = Math.abs(j[1][0]) + Math.abs(j[1][1]);

            boolean converges = row1 < 1 && row2 < 1;
            log.debug("Проверка сходимости: row1={}, row2={}, сходится={}", row1, row2, converges);

            return converges;
        } catch (Exception e) {
            log.warn("Не удалось вычислить матрицу Якоби для проверки сходимости", e);
            return false;
        }
    }
}