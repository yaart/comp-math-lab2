package yaart.s468198.math.optimizers;

import yaart.s468198.dto.request.OptimizationRequest;
import yaart.s468198.dto.response.OptimizationResponse;
import yaart.s468198.math.base.Function;

public interface Optimizer {
    OptimizationResponse optimize(Function function, OptimizationRequest request);
}