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
public class OptimizationResponse {
    private boolean success;
    private String errorMessage;
    private String errorCode;

    private Double extremum;
    private Double value;
    private String type;
    private Integer iterations;
    private Double finalGradient;
    private List<OptimizationStep> history;
    private String savedToFile;
}