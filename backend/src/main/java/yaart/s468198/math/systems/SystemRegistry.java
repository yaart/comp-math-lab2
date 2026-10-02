package yaart.s468198.math.systems;

import org.springframework.stereotype.Component;
import yaart.s468198.math.base.EquationSystem;
import yaart.s468198.exception.MathException;

import java.util.HashMap;
import java.util.Map;

@Component
public class SystemRegistry {
    private final Map<Integer, EquationSystem> systems = new HashMap<>();

    public SystemRegistry() {
        systems.put(1, new EquationSystem() {
            @Override
            public double[] calculate(double[] v) {
                double x = v[0];
                double y = v[1];

                if (Math.abs(x) > 1) {
                    throw new MathException(
                            "|x| > 1, невозможно вычислить y (x² + y² = 1)",
                            "DOMAIN_ERROR"
                    );
                }

                double nextX = (Math.sin(x + y) - 0.1) / 1.1;

                double sign = y >= 0 ? 1.0 : -1.0;
                double nextY = sign * Math.sqrt(Math.abs(1 - x * x));

                return new double[]{nextX, nextY};
            }

            @Override
            public double[][] jacobian(double[] v) {
                double x = v[0];
                double y = v[1];

                double cosVal = Math.cos(x + y);

                double d1x = cosVal / 1.1;
                double d1y = cosVal / 1.1;

                double sign = y >= 0 ? 1.0 : -1.0;
                double denominator = Math.sqrt(1 - x * x);
                double d2x = -x / denominator * sign;
                double d2y = 0;

                return new double[][]{{d1x, d1y}, {d2x, d2y}};
            }

            @Override
            public double[][] originalFunctions(double[] v) {
                double x = v[0];
                double y = v[1];

                double f = Math.sin(x + y) - 1.1 * x - 0.1;
                double g = x * x + y * y - 1;

                return new double[][]{{f}, {g}};
            }

            @Override
            public String getFormula() {
                return "sin(x + y) - 1.1x = 0.1; x² + y² = 1";
            }
        });

        systems.put(2, new EquationSystem() {
            @Override
            public double[] calculate(double[] v) {
                double x = v[0];
                double y = v[1];

                double nextX = 1.5 - Math.cos(y);

                double nextY = (1 + Math.sin(x - 0.5)) / 2;

                return new double[]{nextX, nextY};
            }

            @Override
            public double[][] jacobian(double[] v) {
                double x = v[0];
                double y = v[1];

                double d1x = 0;
                double d1y = Math.sin(y);

                double d2x = Math.cos(x - 0.5) / 2;
                double d2y = 0;

                return new double[][]{{d1x, d1y}, {d2x, d2y}};
            }

            @Override
            public double[][] originalFunctions(double[] v) {
                double x = v[0];
                double y = v[1];

                double f = Math.cos(y) + x - 1.5;
                double g = 2 * y - Math.sin(x - 0.5) - 1;

                return new double[][]{{f}, {g}};
            }

            @Override
            public String getFormula() {
                return "cos y + x = 1.5; 2y - sin(x - 0.5) = 1";
            }
        });
    }

    public EquationSystem getSystem(int id) {
        EquationSystem system = systems.get(id);
        if (system == null) {
            throw new MathException("Система с ID " + id + " не найдена", "SYSTEM_NOT_FOUND");
        }
        return system;
    }
}