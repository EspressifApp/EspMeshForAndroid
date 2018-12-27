package iot.espressif.esp32.model.other;

import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;

public class EspRxObserver<T> implements Observer<T> {
    @Override
    public void onSubscribe(Disposable d) {
    }

    @Override
    public void onNext(T t) {
    }

    @Override
    public void onError(Throwable e) {
    }

    @Override
    public void onComplete() {
    }
}
