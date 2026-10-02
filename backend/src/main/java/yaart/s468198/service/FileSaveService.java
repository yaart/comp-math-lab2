package yaart.s468198.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import yaart.s468198.dto.response.OptimizationResponse;
import yaart.s468198.dto.response.SolveResponse;
import yaart.s468198.dto.response.SystemSolveResponse;
import yaart.s468198.exception.MathException;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class FileSaveService {

    private static final String RESULTS_DIR = "results";

    public FileSaveService() {
        try {
            Path path = Paths.get(RESULTS_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.info("Создана директория для результатов: {}", path.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Не удалось создать директорию для результатов: {}", e.getMessage());
        }
    }

    public String saveEquationSolution(SolveResponse response, String method, int functionId,
                                       double a, double b, double epsilon) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("equation_%s_id%d_%s.txt", method, functionId, timestamp);
        String fullPath = Paths.get(RESULTS_DIR, filename).toString();

        try (PrintWriter writer = new PrintWriter(new FileWriter(fullPath))) {
            writer.println("Дата и время: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")));
            writer.println();
            writer.printf("Метод решения: %s%n", method);
            writer.printf("Функция: %d%n", functionId);
            writer.printf("Интервал изоляции: [%.10f, %.10f]%n", a, b);
            writer.printf("Точность (ε): %.10f%n", epsilon);
            writer.println();
            writer.printf("Найденный корень: %.15f%n", response.getRoot());
            writer.printf("Значение функции в корне: %.15e%n", response.getFunctionValue());
            writer.printf("Количество итераций: %d%n", response.getIterations());

            log.info("Решение уравнения сохранено в файл: {}", fullPath);
            return filename;

        } catch (IOException e) {
            log.error("Ошибка при сохранении решения уравнения: {}", e.getMessage());
            throw new MathException("Не удалось сохранить результат в файл: " + e.getMessage(),
                    "FILE_SAVE_ERROR");
        }
    }

    public String saveSystemSolution(SystemSolveResponse response, int systemId,
                                     double x0, double y0, double epsilon) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("system_%d_%s.txt", systemId, timestamp);
        String fullPath = Paths.get(RESULTS_DIR, filename).toString();

        try (PrintWriter writer = new PrintWriter(new FileWriter(fullPath))) {

            writer.println("Дата и время: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")));
            writer.println();
            writer.printf("Система: %d%n", systemId);
            writer.printf("Начальное приближение: x0 = %.10f, y0 = %.10f%n", x0, y0);
            writer.printf("Точность (ε): %.10f%n", epsilon);
            writer.println();

            double[] result = response.getResultVector();
            writer.printf("Найденное решение: x = %.15f, y = %.15f%n", result[0], result[1]);
            writer.printf("Невязки: |f| = %.15e, |g| = %.15e%n",
                    response.getResiduals()[0], response.getResiduals()[1]);
            writer.printf("Количество итераций: %d%n", response.getIterations());

            log.info("Решение системы сохранено в файл: {}", fullPath);
            return filename;

        } catch (IOException e) {
            log.error("Ошибка при сохранении решения системы: {}", e.getMessage());
            throw new MathException("Не удалось сохранить результат в файл: " + e.getMessage(),
                    "FILE_SAVE_ERROR");
        }
    }

    public String saveOptimizationResult(OptimizationResponse response, String method,
                                         int functionId, double startX, double learningRate,
                                         double epsilon) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("optimization_%s_%s_id%d_%s.txt",
                method, response.getType(), functionId, timestamp);
        String fullPath = Paths.get(RESULTS_DIR, filename).toString();

        try (PrintWriter writer = new PrintWriter(new FileWriter(fullPath))) {
            writer.println("Дата и время: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")));
            writer.println();
            writer.printf("Метод: %s%n", method.equals("gradient") ? "Градиентный спуск" : "Adam");
            writer.printf("Функция: %d%n", functionId);
            writer.printf("Тип: %s%n", response.getType().equals("min") ? "Поиск минимума" : "Поиск максимума");
            writer.printf("Начальная точка: %.10f%n", startX);
            writer.printf("Learning rate: %.10f%n", learningRate);
            writer.printf("Точность (ε): %.10f%n", epsilon);
            writer.println();
            writer.printf("Найденная точка: %.15f%n", response.getExtremum());
            writer.printf("Значение функции: %.15e%n", response.getValue());
            writer.printf("Количество итераций: %d%n", response.getIterations());
            writer.printf("Финальный градиент: %.15e%n", response.getFinalGradient());
            writer.println();

            log.info("Результат оптимизации сохранен в файл: {}", fullPath);
            return filename;

        } catch (IOException e) {
            log.error("Ошибка при сохранении результата оптимизации: {}", e.getMessage());
            throw new MathException("Не удалось сохранить результат в файл: " + e.getMessage(),
                    "FILE_SAVE_ERROR");
        }
    }

    public Path getFilePath(String filename) {
        return Paths.get(RESULTS_DIR, filename);
    }
}