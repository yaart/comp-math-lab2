package yaart.s468198.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SystemIterationStep {
    private int n;
    private double x;
    private double y;
    private double deltaX;
    private double deltaY;
}
