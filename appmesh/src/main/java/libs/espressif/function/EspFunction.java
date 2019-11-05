package libs.espressif.function;

public interface EspFunction<T, R> {
    R apply(T t);
}
