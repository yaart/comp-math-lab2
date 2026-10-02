package yaart.s468198.math.solvers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import yaart.s468198.dto.response.IterationStep;
import yaart.s468198.dto.response.SolveResponse;
import yaart.s468198.exception.MathException;
import yaart.s468198.math.base.Function;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component("secant")
public class SecantSolver implements EquationSolver {
    private static final int MAX_ITERATIONS = 1000;
    private static final double EPSILON_COMPARISON = 1e-12;

    @Override
    public SolveResponse solve(Function f, double a, double b, double eps) {
        log.debug("Метод секущих на [{}, {}]", a, b);

        List<IterationStep> history = new ArrayList<>();

        double xPrev = a;
        double xCurr = b;
        int iter = 0;

        do {
            iter++;

            double fCurr = f.calculate(xCurr);
            double fPrev = f.calculate(xPrev);

            if (Math.abs(fCurr - fPrev) < EPSILON_COMPARISON) {
                throw new MathException(
                        "Деление на ноль в методе секущих: f(xₖ) - f(xₖ₋₁) ≈ 0",
                        "DIVISION_BY_ZERO"
                );
            }

            double xNext = xCurr - fCurr * (xCurr - xPrev) / (fCurr - fPrev);

            xPrev = xCurr;
            xCurr = xNext;

            history.add(IterationStep.builder()
                    .n(iter)
                    .x(xCurr)
                    .fX(f.calculate(xCurr))
                    .diff(Math.abs(xCurr - xPrev))
                    .build());

            log.trace("Итерация {}: x={}, diff={}", iter, xCurr, Math.abs(xCurr - xPrev));

        } while (Math.abs(xCurr - xPrev) > eps && iter < MAX_ITERATIONS);

        if (iter >= MAX_ITERATIONS) {
            throw new MathException(
                    "Метод не сошелся за " + MAX_ITERATIONS + " итераций",
                    "LIMIT_EXCEEDED"
            );
        }

        return SolveResponse.builder()
                .success(true)
                .root(xCurr)
                .functionValue(f.calculate(xCurr))
                .iterations(iter)
                .history(history)
                .build();
    }
}