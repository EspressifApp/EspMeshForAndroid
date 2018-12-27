# Esp32App Interface

## 模型
包: iot.espressif.esp32.model

### EspUser
- 获得单例实例
    - EspUser.INSTANCE
- 用户登录
    - EspLoginResult login(String email, String password, boolean savePwd)
- 用户注册
    - EspRegisterResult register(String username, String email, String password)
- 退出登录
    - void logout() 
- 扫描Station
    - void scanStations()
- 获取当前用户所有设备
    - List<IEspDevice> getAllDeviceList()
- 获取指定MAC地址设备
    - IEspDevice getDeviceForMac(String mac)
- 同步单个设备，若用户已有此设备，则同步状态，若无此设备，则添加设备
    - void syncDevice(IEspDevice device)
- 同步多个设备
    - void syncDevices(Collection<IEspDevice> devices)
- 更新用户设备列表，删除旧设备，添加参数设备
    - void updateDevices(Collection<IEspDevice> devices)
- 删除指定MAC设备
    - IEspDevice removeDevice(String mac)

### EspDevice
- 获得MAC地址，格式:aabbccddeeff
    - String getMac()
- 获得设备名
    - String getName()
- 获得设备类型id
    - int getDeviceTypeId()
- 获得设备IP地址
    - InetAddress getInetAddress()
- 判断设备是否含有参数状态
    - boolean isState(EspDeviceState.State state)
- 获得父节点MAC地址
    - String getParentDeviceMac()
- 获得根节点MAC地址
    - String getRootDeviceMac()
- 获得Mesh层级，根节点为1
    - int getMeshLayerLevel()
- 获得与设备通信使用的协议
    - EspDeviceProtocol getProtocol()
- 获得参数cid的设备属性
    - EspDeviceCharacteristic getCharacteristic(int cid)
- 获得设备的所有属性
    - List<EspDeviceCharacteristic> getCharacteristics()

### EspDeviceCharacteristic
- 获得属性id
    - int getCid()
- 获得属性名称
    - String getName()
- 获得当前属性值，不同format的值的类型不同
    - Object getValue()
- 获得属性值的类型，支持int，double，string，json四种格式
    - String getFormat()
- 获得属性权限值，以二进制表示，第一位表示读权限，第二位表示写权限，第三位表示是否支持事件
    - int getPerms() 
- 判断属性是否可读
    - boolean isReadable()
- 判断属性是否可写
    - boolean isWritable()
- 判断属性是否支持事件
    - boolean isEventAvailable()
- 获得属性值支持的最小值，若类型是string和json则表示支持的字符串的最小长度
    - Number getMin()
- 获得属性值支持的最大值，若类型是string和json则表示支持的字符串的最大长度 
    - Number getMax()

## 操作逻辑
包: iot.espressif.esp32.action

### EspActionUserLogin
- 用户登录
    - EspLoginResult doActionLogin(String email, String password, boolean savePwd)

### EspActionUserRegister
- 用户注册
    - EspRegisterResult doActionRegister(String username, String email, String password)

### EspActionUserLoadLastLogged
- 载入上次登录信息
    - void doActionLoadLastLogged()

### EspActionUserLogout
- 退出登录
    - void doActionLogout() 

### EspActionDeviceStation
- 扫描当前路由器下的Station设备
    - List<IEspDevice> doActionScanStationsLocal(DeviceScanCallback callback)

### EspActionDeviceTopology
- 询问指定地址下所有的Mesh节点 
    - List<MeshNode> doActionGetMeshNodeLocal(String protocol, String host, int port)

### EspActionDeviceInfo
- 询问本地设备的完整信息
    - boolean doActionGetDeviceInfoLocal(IEspDevice device)
- 询问多个本地设备的完整信息
    - void doActionGetDevicesInfoLocal(Collection<IEspDevice> devices) 
- 修改本地设备的属性值，传入的EspDeviceCharacteristic只需设置cid和对应的value即可
    - boolean doActionSetStatusLocal(IEspDevice device, Collection<EspDeviceCharacteristic> characteristics)
- 修改多个本地设备的属性值
    - void doActionSetStatusLocal(Collection<IEspDevice> devices, Collection<EspDeviceCharacteristic> characteristics)
- 询问本地设备的属性值
    - boolean doActionGetStatusLocal(IEspDevice device, int... cids)
- 询问多个本地设备的属性值
    - void doActionGetStatusLocal(Collection<IEspDevice> devices, int... cids)

### EspActionDeviceSniffer
- 载入数据库已存的所有Sniffer
    - List<Sniffer> doActionLoadSnifferDB()
- 询问设备Sniffer信息
    - List<Sniffer> doActionGetSniffersLocal(Collection<IEspDevice> devices)

### EspActionDeviceOTA
- 查询手机存储中的升级bin文件，查询目录: 手机存储/Espressif/Esp32/upgrade/ 下的所有.bin文件
    - File[] doActionFindUpgradeFiles()

### EspOTAClient
- 开始升级
    - void start();
- 停止升级/释放资源
    - void close();

### EspActionDeviceReset
- 将设备恢复出厂设置
    - boolean doActionResetLocal(IEspDevice device)
- 将多个设备恢复出厂设置
    - void doActionResetLocal(Collection<IEspDevice> devices)

### EspActionDeviceReboot
- 重启设备
    - boolean doActionRebootLocal(IEspDevice device)
- 重启多个设备
    - void doActionRebootLocal(Collection<IEspDevice> devices)  