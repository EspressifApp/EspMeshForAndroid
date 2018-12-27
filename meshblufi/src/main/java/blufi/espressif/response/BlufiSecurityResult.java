package blufi.espressif.response;

public enum BlufiSecurityResult {
    SUCCESS,
    POST_PGK_FAILED,
    RECV_PV_FAILED,
    GENERATE_SECRET_FAILED,
    POST_SET_MODE_FAILED,
    CHECK_FAILED;
}
