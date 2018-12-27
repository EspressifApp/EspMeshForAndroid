package blufi.espressif.mesh;

import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.os.Build;
import android.support.annotation.RequiresApi;

public class MeshUtils {
    /*
    [E][S][P]
    [Version Enable 2 bits | white list Enable | white list security | reserved 4 bits]
    [sta bssid 6 bytes]
    [tid 2 bytes]
    */
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private static byte[] getMeshData(ScanResult scanResult, int manufacturerId) {
        ScanRecord scanRecord = scanResult.getScanRecord();
        if (scanRecord == null) {
            return null;
        }

        return scanRecord.getManufacturerSpecificData(manufacturerId);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public static boolean checkMeshBle(ScanResult scanResult, int manufacturerId) {
        byte[] data = getMeshData(scanResult, manufacturerId);
        return data != null
                && data.length > 3
                && data[0] == 0x4d
                && data[1] == 0x44
                && data[2] == 0x46;
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public static String getMeshStationMac(ScanResult scanResult, int manufacturerId) {
        byte[] data = getMeshData(scanResult, manufacturerId);
        if (data == null) {
            return null;
        }
        if (data.length < 12) {
            return null;
        }
        return String.format("%02X:%02X:%02X:%02X:%02X:%02X",
                data[4], data[5], data[6], data[7], data[8], data[9]);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public static int getMeshVersion(ScanResult scanResult, int manufacturerId) {
        byte[] data = getMeshData(scanResult, manufacturerId);
        if (data == null || data.length < 4) {
            return -1;
        }
        return data[3] & 3;
    }
}
