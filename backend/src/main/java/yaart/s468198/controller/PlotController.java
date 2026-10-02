package yaart.s468198.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import yaart.s468198.dto.response.Point;
import yaart.s468198.math.base.Function;
import yaart.s468198.math.functions.FunctionRegistry;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/lab2/plot")
@RequiredArgsConstructor
public class PlotController {

    private final FunctionRegistry functionRegistry;

    @GetMapping("/function/{id}")
    public List<Point> getFunctionPlot(
            @PathVariable int id,
            @RequestParam double from,
            @RequestParam double to,
            @RequestParam(defaultValue = "200") int points) {

        Function function = functionRegistry.getFunction(id);
        List<Point> plotData = new ArrayList<>();

        double step = (to - from) / points;
        for (int i = 0; i <= points; i++) {
            double x = from + i * step;
            double y = function.calculate(x);
            plotData.add(new Point(x, y));
        }

        return plotData;
    }
}