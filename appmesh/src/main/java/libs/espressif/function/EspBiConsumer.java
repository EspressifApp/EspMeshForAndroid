package libs.espressif.function;

public interface EspBiConsumer<T, U> {
    void accept(T t, U u);
}
