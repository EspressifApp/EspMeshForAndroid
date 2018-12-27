# V1.3.0

## 扫描 Station 设备
1. 获取路由器下根节点  
可以使用 mDNS 和 UDP 两种方式
    - [1] 监听 mDNS
        ```    
        Type:
            _mesh-http._tcp.local.
            _mesh-https._tcp.local.

        Property:
            key 为 "mac" 获取设备 mac 地址
        ```
    - [2] 发送 UDP 广播包
        ```
        发送的内容: "Are You Espressif IOT Smart Device?"
        发送的端口号: 1025
        
        设备回复的内容 "ESP32 Mesh <mac> <protocol> <port>"
        <mac> 的格式例: aabbccddeeff
        <protocol> 的格式例: http
        <port> 的格式例: 80
        ```

2. 询问根节点获得TOPO结构
    - 请求的 HTTP 格式:
        ```
        GET /mesh_info HTTP/1.1\r\n
        Content-Length: 0\r\n
        \r\n
        ```

    - 回复的 HTTP 格式:
        ```
        HTTP/1.1 200 OK\r\n
        Content-Length: ??\r\n
        Mesh-Node-Num: 3
        Mesh-Node-Mac: aabbccddeeff,112233445566,18fe34a1090c\r\n
        \r\n
        ```
        - Mesh-Node-Num 表示节点的个数
        - Mesh-Node-Mac 表示节点的 Station Mac 地址，以逗号分隔，下同

## APP 与 设备的本地通信

APP 与 Device 的 TCP 通信使用 HTTP 协议  
- APP请求格式为：
    ```
    POST /device_request HTTP/1.1\r\n
    Content-Length: ??\r\n
    Content-Type: application/json\r\n
    Mesh-Node-Num: 2
    Mesh-Node-Mac: aabbccddeeff,112233445566\r\n
    \r\n
    content_json
    ``` 
    - Content-Type 对应 content 内容格式，现使用 application/json 
    - 下述的 Request 都是指代 content_json  

- 设备回复格式为：
    ```
    HTTP/1.1 200 OK\r\n
    Content-Length: ??\r\n
    Content-Type: application/json\r\n
    Mesh-Layer: 1
    Mesh-Parent-Mac: aabbccddeeff\r\n
    \r\n
    content_json
    ```
    - HTTP 头里的 code 表示 mesh 状态
    - Mesh-Layer 表示设备的 mesh 层级，根节点层级为 1
    - Mesh-Parent-Bssid 表示父节点的 Station Bssid
    - 每个回复的 content_json 都需要包含关键字 "status_code"，表示APP请求的状态回复
    - "status_code" 0 表示正常，非 0 表示具体状态
    - 下述的 Response 都是指代 content_json


### 设备的控制命令
- 进入配网模式
    - Request:
        ```
        {"request":"config_network"}
        ```
    - Response:
        ```
        {"status_code":0}
        ```

- 恢复出厂设置
    - Request: 
        ```
        {"request":"reset","delay":50}
        ```
        - "delay"字段非必需，若不设，使用设备端默认延时     
    - Response:
        ```
        {"status_code":0}
        ```

- 重启设备
    - Request:
        ```
        {"request":"reboot","delay":50}
        ```
        - "delay"字段非必需，若不设，使用设备端默认延时
    - Response:
        ```
        {"status_code":0}
        ```

- 获取设备信息
    - Request:
        ```
        {"request":"get_device_info"}
        ```
    - Response:  
        ```
        {
            "status_code":0,        
            "tid":"13",
            "name":"Light",
            "version":"v1.0.0",
            "characteristics":[
                {"cid":0,"name":"cw","format":"int","perms":3,"min":0,"max":255,"step":1,"value":0},
                {"cid":1,"name":"ww","format":"int","perms":3,"min":0,"max":255,"step":1,"value":255},
                {"cid":2,"name":"brightness","format":"int","perms":3,"min":0,"max":255,"step":1,"value":0}
            ]
        } 
        ```
        - "characteristics" 中的 "format" 只支持 "int", "double", "string", "json" 四种格式
            - "int" 和 "double", "min" 和 "max" 表示支持的最大值和最小值, 有关键字 "step"
            - "string" 和 "json", "min" 和 "max" 表示支持的字符串的最小和最大长度, 没有关键字 "step"
        - "perms" 表示权限，以二进制整数解析，第一位表示读权限，第二位表示写权限，0 表示禁止，1 表示允许
            - 若没有读权限，则无法获得其value值
            - 若没有写权限，则无法修改其value值
          

- 获取设备状态
    - Request:
        ```
        {"request":"get_status", "cids":[0,1,2]}
        ```
    - Response:
        ```
        {
            "status_code":0, 
            "characteristics":[
                {"cid":0,"value":0},
                {"cid":1,"value":100},
                {"cid":2,"value":255}
            ]
        }
        ```
        - 若 status_code 为 -1, 表示请求中有非法参数, 即"cids"中包含没有读权限的值

- 修改设备状态
    - Request:
        ```
        {
            "request":"set_status",
            "characteristics":[
                {"cid":0,"value":0},
                {"cid":1,"value":100},
                {"cid":2,"value":255}
            ]
        } 
        ```  
    - Response:
        ```
        {"status_code":0}
        ```
        - 若 status_code 为 -1, 表示请求中有非法参数, 即"characteristics" 中包含没有写权限的值


- 获取事件
    - Request:
        ```
        {"request":"get_event"}
        ```
    - Response:
        ```
        {
            "status_code":0,
            "events":[
                {
                    "name":"Set red",
                    "trigger_cid":0,
                    "trigger_compare":{">":1,"<":0,"==":8,"!=":10,"~":4,"/":1,"\\":1},
                    "execute_mac":"aabbccddeeff",
                    "execute_content":{"request":"set_status","characteristics":[{"cid":0,"value":0}]}
                }
            ]
        }
        ```   
        - "name" 表示 event 的自定义名称
        - "trigger_cid" 表示触发 event 的设备的属性
        - "trigger_compare" 表示触发的条件，"~" 表示变化量，"/" 表示增加量，"\\" 表示减小量
        -  "execute_mac" 表示执行 event 内容的设备的 mac
        - "execute_content" 表示需要执行的 event 内容

- 设置事件
    - Request:
        ```
        {
            "request":"set_event",
            "events":[
                {
                    "name":"Set red",
                    "trigger_cid":0,
                    "trigger_compare":{">":1,"<":0,"==":8,"!=":10,"~":4,"/":1,"\\":1},
                    "execute_mac":"aabbccddeeff",
                    "execute_content":{"request":"set_status","characteristics":[{"cid":0,"value":0}]}
                }
            ]
        } 
        ``` 
    - Response:
        ```
        {"status_code":0}
        ```

- 删除事件
    - Request:
        ```
        {
            "request":"remove_event",
            "events":[
                {
                    "name":"Set red",
                }
            ]
        }
        ```
    - Response:
        ```
        {"status_code":0}
        ```
