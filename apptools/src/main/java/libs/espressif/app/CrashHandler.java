package libs.espressif.app;

public class CrashHandler implements Thread.UncaughtExceptionHandler {
    private Thread.UncaughtExceptionHandler mDefaultHandler;

    private OnCaughtExceptionListener mOnCaughtExceptionListener;

    public CrashHandler() {
        mDefaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler(this);
    }

    @Override
    public void uncaughtException(Thread t, Throwable e) {
        if (mOnCaughtExceptionListener == null
                || !mOnCaughtExceptionListener.onCaughtException(t, e)) {
            mDefaultHandler.uncaughtException(t, e);
        }
    }

    public void setOnCaughtExceptionListener(OnCaughtExceptionListener listener) {
        mOnCaughtExceptionListener = listener;
    }

    public interface OnCaughtExceptionListener {
        boolean onCaughtException(Thread t, Throwable e);
    }
}
