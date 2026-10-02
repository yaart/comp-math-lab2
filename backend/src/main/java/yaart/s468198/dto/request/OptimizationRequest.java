package yaart.s468198.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationRequest {
    private int functionId;
    private String method;
    private String type;
    private double startX;
    private double learningRate;
    private double epsilon;
    private int maxIterations;
}
