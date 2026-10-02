package yaart.s468198.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IterationStep {
    private int n;
    private double a;
    private double b;
    private double x;
    private double fA;
    private double fB;
    private double fX;
    private double diff;
}
