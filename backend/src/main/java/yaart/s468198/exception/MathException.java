package yaart.s468198.exception;

import lombok.Getter;
import java.util.HashMap;
import java.util.Map;

@Getter
public class MathException extends RuntimeException {
    private final String errorCode;
    private final Map<String, Object> details;

    public MathException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    public MathException(String message, String errorCode, Map<String, Object> details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }
}
