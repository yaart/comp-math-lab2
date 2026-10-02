package yaart.s468198.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemRequest {
    private int systemId;
    private double x0;
    private double y0;
    private double epsilon;
}
