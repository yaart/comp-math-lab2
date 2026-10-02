package yaart.s468198.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import yaart.s468198.dto.request.SystemRequest;
import yaart.s468198.dto.response.SystemSolveResponse;
import yaart.s468198.exception.MathException;
import yaart.s468198.math.base.EquationSystem;
import yaart.s468198.math.systems.SystemRegistry;
import yaart.s468198.math.solvers.system.SystemIterationSolver;

@Service
@RequiredArgsConstructor
public class SystemService {

    private final SystemRegistry systemRegistry;
    private final SystemIterationSolver systemSolver;

    public SystemSolveResponse solve(SystemRequest request) {
        EquationSystem system = systemRegistry.getSystem(request.getSystemId());

        try {
            return systemSolver.solve(
                    system,
                    request.getX0(),
                    request.getY0(),
                    request.getEpsilon()
            );
        } catch (MathException e) {
            throw e;
        } catch (Exception e) {
            throw new MathException("Критическая ошибка при решении системы", "SYSTEM_ERROR");
        }
    }
}