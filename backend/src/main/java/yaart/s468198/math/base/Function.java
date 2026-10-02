package yaart.s468198.math.base;

public interface Function {
    double calculate(double x);
    double firstDerivative(double x);
    double secondDerivative(double x);
    String getFormula();
}
