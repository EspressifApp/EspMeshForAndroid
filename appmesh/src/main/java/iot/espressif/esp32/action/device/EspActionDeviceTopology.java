package iot.espressif.esp32.action.device;

import java.net.HttpURLConnection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import iot.espressif.esp32.model.net.MeshNode;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;

public class EspActionDeviceTopology implements IEspActionDeviceTopology {
    private String getMeshInfoUrl(String protocol, String host, int port) {
        return DeviceUtil.getLocalUrl(protocol, host, "/mesh_info", port);
    }

    @Override
    public List<MeshNode> doActionGetMeshNodeLocal(String protocol, String host, int port) {
        String url = getMeshInfoUrl(protocol, host, port);
        EspHttpParams params = new EspHttpParams();
        params.setTrustAllCerts(true);
        params.setTryCount(3);

        List<MeshNode> result = new LinkedList<>();
        Map<String, String> headers = new HashMap<>();
        while (true) {
            EspHttpResponse response = EspHttpUtils.Get(url, params, headers);
            if (response == null) {
                break;
            }
            if (response.getCode() != HttpURLConnection.HTTP_OK) {
                break;
            }

            String meshId;
            int nodeCount;
            String[] nodeMacs;
            try {
                meshId = response.findHeaderValue(HEADER_MESH_ID);
                nodeCount = Integer.parseInt(response.findHeader(HEADER_NODE_COUNT).getValue());
                nodeMacs = response.findHeader(HEADER_NODE_MAC).getValue().split(",");
            } catch (Exception e) {
                e.printStackTrace();
                break;
            }

            for (String mac : nodeMacs) {
                MeshNode node = new MeshNode();
                node.setMac(mac);
                node.setHost(host);
                node.setMeshId(meshId);
                node.setProtocolPort(port);
                node.setProtocolName(protocol);

                result.add(node);
            }

            if (nodeCount == nodeMacs.length) {
                break;
            }
        }

        return result;
    }
}
