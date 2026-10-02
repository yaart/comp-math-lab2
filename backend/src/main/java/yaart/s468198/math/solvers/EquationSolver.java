package yaart.s468198.math.solvers;

import yaart.s468198.dto.response.SolveResponse;
import yaart.s468198.math.base.Function;

public interface EquationSolver {
    SolveResponse solve(Function function, double a, double b, double epsilon);
}