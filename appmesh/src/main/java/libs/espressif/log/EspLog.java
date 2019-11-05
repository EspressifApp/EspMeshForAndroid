package libs.espressif.log;

import android.util.Log;

public class EspLog {
    private static Level sLevel = Level.V;

    private static final int SUB_LENGTH = 1500;

    private final String mTag;
    private Level mLevel;

    /**
     * @param cls The tag will use simple name of the cls.
     */
    public EspLog(Class cls) {
        mTag = String.format("[%s]", cls.getSimpleName());
        mLevel = sLevel;
    }

    public static void setDefaultLevel(Level level) {
        if (level == null) {
            sLevel = Level.NIL;
        } else {
            sLevel = level;
        }
    }

    /**
     * Set the print lowest level. It will set {@link Level#NIL} if the level is null.
     *
     * @param level The lowest level can print log.
     */
    public void setLevel(Level level) {
        if (level == null) {
            mLevel = Level.NIL;
        } else {
            mLevel = level;
        }
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

        if (msg.length() <= SUB_LENGTH) {
            __log(msg, level);
            return;
        }

        for (int begin = 0, end = SUB_LENGTH; begin < msg.length(); begin += SUB_LENGTH, end += SUB_LENGTH) {
            if (end > msg.length()) {
                end = msg.length();
            }

            String subString = msg.substring(begin, end);
            __log(subString, level);
        }
    }

    private void __log(String msg, Level level) {
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
