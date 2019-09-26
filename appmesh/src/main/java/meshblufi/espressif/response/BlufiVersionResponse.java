package meshblufi.espressif.response;

public class BlufiVersionResponse extends BlufiResponse {
    public static final int RESULT_VALID = 0;
    public static final int RESULT_APP_VERSION_INVALID = -1;
    public static final int RESULT_DEVICE_VERSION_INVALID = -2;
    public static final int RESULT_GET_VERSION_FAILED = -3;

    private int[] mVersionValues = {0, 0};

    public void setVersionValues(int bigVer, int smallVer) {
        mVersionValues[0] = bigVer;
        mVersionValues[1] = smallVer;
    }

    public String getVersionString() {
        return "V" + mVersionValues[0] + "." + mVersionValues[1];
    }

    @Override
    public String generateValidInfo() {
        return "Version: " + getVersionString();
    }
}
