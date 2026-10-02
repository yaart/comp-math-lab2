package yaart.s468198.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSolveResponse {
    private boolean success;
    private String errorMessage;

    private double[] resultVector;
    private double[] errorVector;
    private double[] residuals;
    private int iterations;
    private List<SystemIterationStep> history;
    private String savedToFile;
}