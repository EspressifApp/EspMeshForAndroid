package blufi.espressif.response;

public abstract class BlufiResponse {
    private int mResultCode;

    /**
     * Get the result code of receive the data
     *
     * @return result code
     */
    public int getResultCode() {
        return mResultCode;
    }

    public void setResultCode(int resultCode) {
        mResultCode = resultCode;
    }

    public abstract String generateValidInfo();
}
