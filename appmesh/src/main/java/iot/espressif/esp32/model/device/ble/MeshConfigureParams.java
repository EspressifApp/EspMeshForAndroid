package iot.espressif.esp32.model.device.ble;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import libs.espressif.utils.TextUtils;

public class MeshConfigureParams {
    private String mAPSsid;
    private String mAPBssid;
    private String mAPPassword;

    private byte[] mMeshID;
    private String mMeshPassword;

    private Set<String> mWhiteList;

    private MeshConfigureParams(String apSsid, String apBssid, String apPassword, byte[] meshId,
                                String meshPassword, Collection<String> whiteList) {
        mAPSsid = apSsid;
        mAPBssid = apBssid;
        mAPPassword = apPassword;
        mMeshID = meshId;
        mMeshPassword = meshPassword;
        mWhiteList = new HashSet<>();
        if (whiteList != null) {
            mWhiteList.addAll(whiteList);
        }
    }

    public String getAPSsid() {
        return mAPSsid;
    }

    public String getAPBssid() {
        return mAPBssid;
    }

    public String getAPPassword() {
        return mAPPassword;
    }

    public byte[] getMeshID() {
        return mMeshID;
    }

    public String getMeshPassword() {
        return mMeshPassword;
    }

    public List<String> getWhiteList() {
        return mWhiteList == null ? Collections.emptyList() : new ArrayList<>(mWhiteList);
    }

    public static class Builder {
        private String mAPSsid;
        private String mAPBssid;
        private String mAPPassword;

        private byte[] mMeshID;
        private String mMeshPassword;

        private Collection<String> mWhiteList;

        /**
         * Set AP's SSID
         */
        public Builder setAPSsid(@NonNull String APSsid) {
            mAPSsid = APSsid;
            return this;
        }

        /**
         * Set AP's BSSID, format like aa:bb:cc:dd:ee:ff
         */
        public Builder setAPBssid(@NonNull String APBssid) {
            mAPBssid = APBssid;
            return this;
        }

        /**
         * Set AP's
         */
        public Builder setAPPassword(@Nullable String APPassword) {
            mAPPassword = APPassword;
            return this;
        }

        /**
         * Set mesh id. The length of mesh id must be 6.
         * Devices with the same mesh id will form one mesh network
         */
        public Builder setMeshID(@NonNull byte[] meshID) {
            mMeshID = meshID;
            return this;
        }

        /**
         * Set the password of the mesh network
         */
        public Builder setMeshPassword(@Nullable String meshPassword) {
            mMeshPassword = meshPassword;
            return this;
        }

        /**
         * Set the mesh devices' station bssid to join the mesh network.
         * The station bssid can be got from {@link MeshBleDevice#getStaBssid()}
         */
        public Builder setWhiteList(@Nullable Collection<String> whiteList) {
            mWhiteList = whiteList;
            return this;
        }

        /**
         * Build {@link MeshConfigureParams}
         */
        public MeshConfigureParams build() {
            if (TextUtils.isEmpty(mAPSsid)) {
                throw new IllegalArgumentException("AP SSID can't be empty");
            }
            if (TextUtils.isEmpty(mAPBssid)) {
                throw new IllegalArgumentException("AP BSSID can't be empty");
            }
            if (mMeshID == null || mMeshID.length != 6) {
                throw new IllegalArgumentException("Mesh ID can't be null and length must be 6");
            }

            return new MeshConfigureParams(mAPSsid, mAPBssid, mAPPassword, mMeshID, mMeshPassword,
                    mWhiteList);
        }
    }
}
