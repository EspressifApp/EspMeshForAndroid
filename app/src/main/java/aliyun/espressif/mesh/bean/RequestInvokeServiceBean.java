package aliyun.espressif.mesh.bean;

public class RequestInvokeServiceBean {
    private String iotId, identifier;
    private Args args;

    public RequestInvokeServiceBean(String iotId, String identifier, Args args) {
        this.iotId = iotId;
        this.identifier = identifier;
        this.args = args;
    }

    public String getIotId() {
        return iotId;
    }

    public void setIotId(String iotId) {
        this.iotId = iotId;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public Args getArgs() {
        return args;
    }

    public void setArgs(Args args) {
        this.args = args;
    }

    public static class Args {
        private int arg1;

        public Args(int arg1) {
            this.arg1 = arg1;
        }
    }
}
