package aliyun.espressif.mesh.bean;

public class StatusBean {

    /**
     * code : 200
     * data : {"time":1528963452000,"status":1}
     * id : 3cd2bfce-5bc0-41fe-a980-ee8ff36f9952
     */

    private int code;
    private DataBean data;
    private String id;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public DataBean getData() {
        return data;
    }

    public void setData(DataBean data) {
        this.data = data;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public static class DataBean {
        /**
         * time : 1528963452000
         * status : 1
         */

        private long time;
        private int status;

        public long getTime() {
            return time;
        }

        public void setTime(long time) {
            this.time = time;
        }

        public int getStatus() {
            return status;
        }

        public void setStatus(int status) {
            this.status = status;
        }
    }
}
