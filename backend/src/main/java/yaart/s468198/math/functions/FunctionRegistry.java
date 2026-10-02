package yaart.s468198.math.functions;

import org.springframework.stereotype.Component;
import yaart.s468198.math.base.Function;
import java.util.HashMap;
import java.util.Map;

@Component
public class FunctionRegistry {
    private final Map<Integer, Function> functions = new HashMap<>();

    public FunctionRegistry() {
        functions.put(1, new Function() {
            @Override
            public double calculate(double x) {
                return -2.8 * Math.pow(x, 3) - 3.48 * Math.pow(x, 2) + 10.23 * x + 9.35;
            }
            @Override
            public double firstDerivative(double x) {
                return -8.4 * Math.pow(x, 2) - 6.96 * x + 10.23;
            }
            @Override
            public double secondDerivative(double x) {
                return -16.8 * x - 6.96;
            }
            @Override
            public String getFormula() { return "-2,8x³ - 3,48x² + 10,23x + 9,35"; }
        });

        functions.put(2, new Function() {
            @Override
            public double calculate(double x) { return Math.sin(x) + 0.1; }
            @Override
            public double firstDerivative(double x) { return Math.cos(x); }
            @Override
            public double secondDerivative(double x) { return -Math.sin(x); }
            @Override
            public String getFormula() { return "sin(x) + 0,1"; }
        });

        functions.put(3, new Function() {
            @Override
            public double calculate(double x) {
                return Math.pow(x, 2) - Math.exp(x) + 2;
            }
            @Override
            public double firstDerivative(double x) {
                return 2 * x - Math.exp(x);
            }
            @Override
            public double secondDerivative(double x) {
                return 2 - Math.exp(x);
            }
            @Override
            public String getFormula() {
                return "x^2 - e^x + 2";
            }
        });
    }

    public Function getFunction(int id) {
        return functions.getOrDefault(id, functions.get(1));
    }
}