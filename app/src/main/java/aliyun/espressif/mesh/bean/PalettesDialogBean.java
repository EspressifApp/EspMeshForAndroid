package aliyun.espressif.mesh.bean;

public class PalettesDialogBean {
    private String title;
    private String color;
    private float hsv[];

    public PalettesDialogBean(String title, String color) {
        this.title = title;
        this.color = color;
    }

    public float[] getHsv() {
        return hsv;
    }

    public void setHsv(float[] hsv) {
        this.hsv = hsv;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
