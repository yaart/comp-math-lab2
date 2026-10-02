package yaart.s468198.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OptimizationStep {
    private int n;
    private double x;
    private double fx;
    private double gradient;
    private double learningRate;
    private Double m;
    private Double v;
}