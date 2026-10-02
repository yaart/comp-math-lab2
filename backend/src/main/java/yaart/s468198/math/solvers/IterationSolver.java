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
@Component("iteration")
public class IterationSolver implements EquationSolver {
    private static final int MAX_ITERATIONS = 1000;
    private static final int CONVERGENCE_CHECK_POINTS = 100;
    private static final double INFINITY_CHECK = 1e100;
    private static final int MAX_OUT_OF_BOUNDS = 10;

    @Override
    public SolveResponse solve(Function f, double a, double b, double eps) {
        log.debug("Метод простой итерации на [{}, {}]", a, b);

        double faDeriv = f.firstDerivative(a);
        double fbDeriv = f.firstDerivative(b);
        double maxDeriv = Math.max(Math.abs(faDeriv), Math.abs(fbDeriv));

        double lambda = (faDeriv > 0) ? -1.0 / maxDeriv : 1.0 / maxDeriv;

        log.debug("max|f'(x)| = {}, lambda = {}", maxDeriv, lambda);

        if (!checkConvergenceCondition(f, a, b, lambda)) {
            throw new MathException(
                    "Условие сходимости не выполнено на интервале [" + a + ", " + b + "]. " +
                            "Метод простой итерации может расходиться.",
                    "DIVERGENCE_CONDITION"
            );
        }

        List<IterationStep> history = new ArrayList<>();

        double xCurr = selectInitialApproximation(f, a, b);
        double xPrev;
        int iter = 0;
        int outOfBoundsCount = 0;

        do {
            iter++;
            xPrev = xCurr;

            double fVal = f.calculate(xPrev);
            xCurr = xPrev + lambda * fVal;

            if (Double.isInfinite(xCurr) || Double.isNaN(xCurr) || Math.abs(xCurr) > INFINITY_CHECK) {
                throw new MathException(
                        String.format("Метод расходится: значение x = %f на итерации %d", xCurr, iter),
                        "DIVERGENCE_INFINITY"
                );
            }

            if (xCurr < a || xCurr > b) {
                outOfBoundsCount++;
                log.warn("Приближение вышло за границы интервала: {} (раз {})", xCurr, outOfBoundsCount);

                if (outOfBoundsCount > MAX_OUT_OF_BOUNDS) {
                    throw new MathException(
                            String.format("Метод расходится: последовательность выходит за границы интервала [%f, %f] более %d раз. " +
                                    "Последнее значение x = %f", a, b, MAX_OUT_OF_BOUNDS, xCurr),
                            "DIVERGENCE_OUT_OF_BOUNDS"
                    );
                }
            }

            history.add(IterationStep.builder()
                    .n(iter)
                    .x(xCurr)
                    .fX(f.calculate(xCurr))
                    .diff(Math.abs(xCurr - xPrev))
                    .build());

            log.trace("Итерация {}: x={}, diff={}", iter, xCurr, Math.abs(xCurr - xPrev));

            if (iter > 5) {
                double prevDiff = history.get(history.size() - 2).getDiff();
                double currDiff = Math.abs(xCurr - xPrev);

                if (currDiff > prevDiff * 1.5 && currDiff > eps * 10) {
                    log.warn("Разница начала увеличиваться: было {}, стало {}", prevDiff, currDiff);

                    if (currDiff > prevDiff * 3) {
                        throw new MathException(
                                String.format("Метод расходится: разница между итерациями растет (было %f, стало %f)",
                                        prevDiff, currDiff),
                                "DIVERGENCE_INCREASING"
                        );
                    }
                }
            }

        } while (Math.abs(xCurr - xPrev) > eps && iter < MAX_ITERATIONS);

        if (iter >= MAX_ITERATIONS) {
            throw new MathException(
                    "Метод не сошелся за " + MAX_ITERATIONS + " итераций",
                    "LIMIT_EXCEEDED"
            );
        }

        if (xCurr < a || xCurr > b) {
            log.warn("Найденный корень {} находится вне исходного интервала [{}, {}]", xCurr, a, b);
        }

        double finalF = f.calculate(xCurr);
        if (Math.abs(finalF) > eps * 100) {
            log.warn("Значение функции в корне {} слишком велико: {}", xCurr, finalF);
        }

        return SolveResponse.builder()
                .success(true)
                .root(xCurr)
                .functionValue(finalF)
                .iterations(iter)
                .history(history)
                .build();
    }

    private double findMaxDerivative(Function f, double a, double b) {
        double step = (b - a) / CONVERGENCE_CHECK_POINTS;
        double max = Math.abs(f.firstDerivative(a));

        for (int i = 1; i <= CONVERGENCE_CHECK_POINTS; i++) {
            double x = a + i * step;
            double deriv = Math.abs(f.firstDerivative(x));
            if (deriv > max) {
                max = deriv;
            }
        }
        return max;
    }

    private boolean checkConvergenceCondition(Function f, double a, double b, double lambda) {
        double step = (b - a) / CONVERGENCE_CHECK_POINTS;
        double maxPhiDeriv = 0;

        for (int i = 0; i <= CONVERGENCE_CHECK_POINTS; i++) {
            double x = a + i * step;
            double phiDeriv = 1 + lambda * f.firstDerivative(x);
            double absPhiDeriv = Math.abs(phiDeriv);

            if (absPhiDeriv >= 1) {
                log.debug("Условие сходимости нарушено в x={}: |φ'(x)|={}", x, absPhiDeriv);
                return false;
            }

            if (absPhiDeriv > maxPhiDeriv) {
                maxPhiDeriv = absPhiDeriv;
            }
        }

        log.debug("Условие сходимости выполнено. max|φ'(x)| = {} на интервале [{}, {}]",
                maxPhiDeriv, a, b);
        return true;
    }

    private double selectInitialApproximation(Function f, double a, double b) {
        double fa = f.calculate(a);
        double fb = f.calculate(b);

        if (fa * fb > 0) {
            log.warn("Функция имеет одинаковые знаки на концах интервала: f({})={}, f({})={}", a, fa, b, fb);
        }

        if (Math.abs(fa) < Math.abs(fb)) {
            return a;
        } else {
            return b;
        }
    }
}