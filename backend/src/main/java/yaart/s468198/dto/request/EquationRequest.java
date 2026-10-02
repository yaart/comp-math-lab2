package yaart.s468198.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquationRequest {
    private int functionId;
    private String method;
    private double a;
    private double b;
    private double epsilon;
    private String inputSource;
}
