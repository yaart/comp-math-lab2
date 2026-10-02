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
public class SolveResponse {
    private boolean success;
    private String errorMessage;

    private Double root;
    private Double functionValue;
    private Integer iterations;
    private List<IterationStep> history;
    private String savedToFile;
}