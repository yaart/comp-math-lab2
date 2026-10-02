package yaart.s468198.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import yaart.s468198.dto.request.EquationRequest;
import yaart.s468198.dto.response.SolveResponse;
import yaart.s468198.exception.MathException;
import yaart.s468198.math.base.Function;
import yaart.s468198.math.functions.FunctionRegistry;
import yaart.s468198.math.solvers.EquationSolver;
import yaart.s468198.dto.response.Point;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquationService {

    private final FunctionRegistry functionRegistry;
    private final Map<String, EquationSolver> solvers;

    public SolveResponse solve(EquationRequest request) {
        log.info("Решение уравнения: functionId={}, method={}, a={}, b={}, eps={}",
                request.getFunctionId(), request.getMethod(),
                request.getA(), request.getB(), request.getEpsilon());

        if (request.getA() >= request.getB()) {
            throw new MathException(
                    "Левая граница должна быть меньше правой (a < b)",
                    "INVALID_INTERVAL"
            );
        }

        if (request.getEpsilon() <= 0 || request.getEpsilon() > 1) {
            throw new MathException(
                    "Погрешность должна быть в интервале (0, 1]",
                    "INVALID_EPSILON"
            );
        }

        Function function = functionRegistry.getFunction(request.getFunctionId());

        double a = request.getA();
        double b = request.getB();

        double fa = function.calculate(a);
        double fb = function.calculate(b);
        boolean isMonotonic = checkMonotonicity(function, a, b);


        if (fa * fb > 0) {
            if (isMonotonic) {
                throw new MathException(
                        "На выбранном интервале нет корней (функция монотонна и f(a)*f(b) > 0)",
                        "NO_ROOTS"
                );
            } else {
                throw new MathException(
                        "На интервале возможно несколько корней (функция немонотонна и f(a)*f(b) > 0). " +
                                "Для метода " + request.getMethod() + " требуется интервал с одним корнем. " +
                                "Рекомендуется уменьшить интервал.",
                        "MULTIPLE_ROOTS"
                );
            }
        }

        if (!isMonotonic) {
            log.warn("Предупреждение: на интервале [{}, {}] функция немонотонна. " +
                    "Возможно наличие нескольких корней.", a, b);
        }

        EquationSolver solver = solvers.get(request.getMethod());
        if (solver == null) {
            throw new MathException(
                    "Метод решения '" + request.getMethod() + "' не найден. " +
                            "Доступны: chord, secant, iteration",
                    "METHOD_NOT_FOUND"
            );
        }

        try {
            SolveResponse response = solver.solve(function, a, b, request.getEpsilon());
            log.info("Решение найдено: root={}, iterations={}",
                    response.getRoot(), response.getIterations());
            return response;
        } catch (MathException e) {
            throw e;
        } catch (Exception e) {
            log.error("Ошибка при расчете", e);
            throw new MathException(
                    "Ошибка при расчете: " + e.getMessage(),
                    "CALCULATION_ERROR"
            );
        }
    }

    private boolean checkMonotonicity(Function f, double a, double b) {
        int points = 100;
        double step = (b - a) / points;
        double prevDeriv = f.firstDerivative(a);

        for (int i = 1; i <= points; i++) {
            double x = a + i * step;
            double deriv = f.firstDerivative(x);

            if (prevDeriv * deriv < 0) {
                return false;
            }
            prevDeriv = deriv;
        }
        return true;
    }
}