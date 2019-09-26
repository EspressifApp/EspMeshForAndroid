package libs.espressif.net;

import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class EspHttpHeader {
    private String mName;

    private List<String> mValueList;

    public EspHttpHeader(String name, String value) {
        if (name == null) {
            throw new NullPointerException("Header name is null");
        }
        mName = name;

        if (value == null) {
            throw new NullPointerException("Header value is null");
        }
        mValueList = Collections.singletonList(value);
    }

    public EspHttpHeader(String name, List<String> values) {
        if (name == null) {
            throw new NullPointerException("Header name is null");
        }
        mName = name;

        if (values == null || values.isEmpty()) {
            throw new NullPointerException("Header value is null or empty");
        }
        mValueList = new ArrayList<>(values);
    }

    /**
     * @return the http header name
     */
    public String getName() {
        return mName;
    }

    /**
     * @return the http header value
     */
    public String getValue() {
        return mValueList.get(0);
    }

    public List<String> getValueList() {
        return new ArrayList<>(mValueList);
    }

    @NonNull
    @Override
    public String toString() {
        String value = mValueList.size() == 1 ? getValue() : mValueList.toString();
        return String.format("%s: %s", mName, value);
    }

}
