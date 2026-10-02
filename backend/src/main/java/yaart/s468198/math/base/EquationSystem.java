package yaart.s468198.math.base;

public interface EquationSystem {
    double[] calculate(double[] x);

    double[][] jacobian(double[] x);

    double[][] originalFunctions(double[] x);

    String getFormula();
}
