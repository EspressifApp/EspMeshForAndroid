package libs.espressif.log;

import android.util.Log;

public class EspLog {

    private static final int LINE_LENGTH_DEFAULT = 1500;

    private static Level sLevel = Level.V;

    private static int sLineLength = LINE_LENGTH_DEFAULT;

    private final String mTag;
    private Level mLevel;
    private int mLineLength;


    /**
     * @param cls The tag will use simple name of the cls.
     */
    public EspLog(Class cls) {
        mTag = String.format("[%s]", cls.getSimpleName());
        mLevel = sLevel;
        mLineLength = sLineLength;
    }

    public static void setDefaultLevel(Level level) {
        sLevel = level != null ? level : Level.NIL;
    }

    /**
     * Set the print lowest level. It will set {@link Level#NIL} if the level is null.
     *
     * @param level The lowest level can print log.
     */
    public void setLevel(Level level) {
        mLevel = level != null ? level : Level.NIL;
    }

    public static void setDefaultLineLength(int length) {
        sLineLength = length > 0 ? length : LINE_LENGTH_DEFAULT;
    }

    public void setLineLength(int length) {
        mLineLength = length > 0 ? length : LINE_LENGTH_DEFAULT;
    }

    /**
     * Send a {@link Level#V} log message.
     *
     * @param msg The message you would like logged.
     */
    public void v(String msg) {
        log(msg, Level.V);
    }

    /**
     * Send a {@link Level#V} log message.
     *
     * @param msg The message you would like logged.
     */
    public void d(String msg) {
        log(msg, Level.D);
    }

    /**
     * Send a {@link Level#I} log message.
     *
     * @param msg The message you would like logged.
     */
    public void i(String msg) {
        log(msg, Level.I);
    }

    /**
     * Send a {@link Level#W} log message.
     *
     * @param msg The message you would like logged.
     */
    public void w(String msg) {
        log(msg, Level.W);
    }

    /**
     * Send a {@link Level#E} log message.
     *
     * @param msg The message you would like logged.
     */
    public void e(String msg) {
        log(msg, Level.E);
    }

    private void log(String msg, Level level) {
        if (mLevel.ordinal() > level.ordinal()) {
            return;
        }

        final int lineLength = mLineLength > 0 ? mLineLength : sLineLength;

        if (msg.length() <= lineLength) {
            androidLog(msg, level);
            return;
        }

        for (int begin = 0, end = lineLength; begin < msg.length(); begin += lineLength, end += lineLength) {
            if (end > msg.length()) {
                end = msg.length();
            }

            String subString = msg.substring(begin, end);
            androidLog(subString, level);
        }
    }

    private void androidLog(String msg, Level level) {
        switch (level) {
            case V:
                Log.v(mTag, msg);
                return;
            case D:
                Log.d(mTag, msg);
                return;
            case I:
                Log.i(mTag, msg);
                return;
            case W:
                Log.w(mTag, msg);
                return;
            case E:
                Log.e(mTag, msg);
                return;
            case NIL:
                break;
        }
    }

    /**
     * The level allow logged
     */
    public enum Level {
        V, D, I, W, E, NIL
    }
}
