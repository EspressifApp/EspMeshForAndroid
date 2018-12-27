package iot.espressif.esp32.utils;

import java.util.Locale;

public class VoiceUtil {
    public static boolean isCommandTest(String command) {
        switch (command.toLowerCase(Locale.ENGLISH)) {
            // 测试
            case "ceshi":
            case "cesi":
            case "cheshi":
            case "chesi":
                return true;
            default:
                return false;
        }
    }

    public static boolean isCommandOpen(String command) {
        switch (command.toLowerCase(Locale.ENGLISH)) {
            // 开灯
            case "dakai":
            case "kaideng":
            case "kaiden":
                return true;
            default:
                return false;
        }
    }

    public static boolean isCommandClose(String command) {
        switch (command.toLowerCase(Locale.ENGLISH)) {
            // 关灯
            case "guanbi":
            case "guandeng":
            case "guanden":
                return true;
            default:
                return false;
        }
    }

    public static boolean isCommandRed(String command) {
        switch (command.toLowerCase(Locale.ENGLISH)) {
            // 红色
            case "hongse":
            case "hongshe":
                return true;
            default:
                return false;
        }
    }

    public static boolean isCommandGreen(String command) {
        switch (command.toLowerCase(Locale.ENGLISH)) {
            // 绿色
            case "lvse":
            case "lvshe":
            case "luse":
            case "lushe":
                return true;
            default:
                return false;
        }
    }

    public static boolean isCommandBlue(String command) {
        switch (command.toLowerCase(Locale.ENGLISH)) {
            // 蓝色
            case "lanse":
            case "lanshe":
                return true;
            default:
                return false;
        }
    }
}
