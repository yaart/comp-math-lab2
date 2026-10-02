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
@Component("chord")
public class ChordSolver implements EquationSolver {
    private static final int MAX_ITERATIONS = 1000;
    private static final double EPSILON_COMPARISON = 1e-12;

    @Override
    public SolveResponse solve(Function f, double a, double b, double eps) {
        log.debug("Метод хорд на [{}, {}]", a, b);

        boolean fixLeft = f.calculate(a) * f.secondDerivative(a) > 0;
        double staticPoint = fixLeft ? a : b;
        double xCurr = fixLeft ? b : a;

        log.debug("Неподвижная точка: {}, начальное приближение: {}", staticPoint, xCurr);

        return performSolve(f, staticPoint, xCurr, eps, fixLeft);
    }

    private SolveResponse performSolve(Function f, double stat, double x0, double eps, boolean isLeftFixed) {
        List<IterationStep> history = new ArrayList<>();
        double xCurr = x0;
        double xPrev;
        int iter = 0;

        double intervalStart = Math.min(stat, x0);
        double intervalEnd = Math.max(stat, x0);

        do {
            iter++;
            xPrev = xCurr;

            double fPrev = f.calculate(xPrev);
            double fStat = f.calculate(stat);

            if (Math.abs(fPrev - fStat) < EPSILON_COMPARISON) {
                throw new MathException(
                        "Деление на ноль в методе хорд: f(x) - f(stat) ≈ 0",
                        "DIVISION_BY_ZERO"
                );
            }

            xCurr = xPrev - fPrev * (xPrev - stat) / (fPrev - fStat);

            if (xCurr < intervalStart || xCurr > intervalEnd) {
                throw new MathException(
                        String.format("Метод хорд: приближение вышло за границы интервала [%f, %f] (x = %f). " +
                                        "Возможно, на интервале несколько корней или функция не удовлетворяет условиям метода.",
                                intervalStart, intervalEnd, xCurr),
                        "OUT_OF_BOUNDS"
                );
            }

            double aVal = isLeftFixed ? stat : Math.min(xCurr, xPrev);
            double bVal = isLeftFixed ? Math.max(xCurr, xPrev) : stat;

            history.add(IterationStep.builder()
                    .n(iter)
                    .a(aVal)
                    .b(bVal)
                    .x(xCurr)
                    .fA(f.calculate(aVal))
                    .fB(f.calculate(bVal))
                    .fX(f.calculate(xCurr))
                    .diff(Math.abs(xCurr - xPrev))
                    .build());

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