function AdbClientWrapper() {

}

let adbClient = new AdbClientWrapper();

/**
 * 链接历史记录
 * 适配EC 安卓 11.33.0+
 * @param timeout 超时单位是毫秒
 * @returns {*|boolean} true代表链接成功 false代表失败
 */
AdbClientWrapper.prototype.connectHistory = function (timeout) {
    if (adbClientApiWrapper == null) {
        return false;
    }
    return adbClientApiWrapper.connectHistory(timeout);
};

/**
 * 开始扫描
 * 高于安卓11的，端口参数不写，走的是配对模式，开始扫描后会提示打开网络调试界面找到配对码，通知栏会弹出提示，输入配对码即可配对
 * 低于安卓11的，填写开始端口和结束端口，会自动扫描，一般网络调试端口是5555，扫描后会提示授权允许对话框，允许即可
 * 如果失败，可以多次尝试，不过建议先去app的系统设置中完成adb网络调试的配对，这样就无需调用这个函数了
 * 适配EC 安卓 11.33.0+
 * @param startPort 网络调试开始端口
 * @param endPort 网络调试结束端口
 * @param timeout 超时时间 单位毫秒
 * @returns {string} JSON字符串，code=0代表成功，data 代表返回的数据，msg代表消息
 */
AdbClientWrapper.prototype.startScan = function (startPort, endPort, timeout) {
    if (adbClientApiWrapper == null) {
        return "";
    }
    return adbClientApiWrapper.startScan(startPort, endPort, timeout);
};
/**
 * 停止扫描
 * 适配EC 安卓 11.33.0+
 * @returns {*|boolean} true代表成功 false代表失败
 */
AdbClientWrapper.prototype.stopScan = function () {
    if (adbClientApiWrapper == null) {
        return false;
    }
    return adbClientApiWrapper.stopScan();
};
/**
 * 关闭adb连接
 * 适配EC 安卓 11.33.0+
 * @returns {*|boolean} true代表成功 false代表失败
 */
AdbClientWrapper.prototype.closeAdbConnect = function () {
    if (adbClientApiWrapper == null) {
        return false;
    }
    return adbClientApiWrapper.closeAdbConnect();
};
/**
 * adb是否链接上来了
 * 适配EC 安卓 11.33.0+
 * @returns {*|boolean} true代表成功 false代表失败
 */
AdbClientWrapper.prototype.isAdbConnected = function () {
    if (adbClientApiWrapper == null) {
        return false;
    }
    return adbClientApiWrapper.isAdbConnected();
};

/**
 * 运行shell命令
 * 适配EC 安卓 11.33.0+
 * @param command 命令,例如 ls /sdcard/或者pm install /sdcard/xxx.apk 安装命令
 * @param timeout 超时时间 单位是毫秒
 * @returns {string} JSON字符串，code=0代表成功，data 代表返回的数据，msg代表消息
 */
AdbClientWrapper.prototype.runShell = function (command, timeout) {
    if (adbClientApiWrapper == null) {
        return "";
    }
    return adbClientApiWrapper.runShell(command, timeout);
};


/**
 * 激活自己
 * 适配EC 安卓 11.33.0+
 * @param type 值分别是1和2 ，激活方式不同
 * @param timeout 超时时间 单位是毫秒
 * @returns {string} JSON字符串，code=0代表成功，data 代表返回的数据，msg代表消息
 */
AdbClientWrapper.prototype.activeSelf = function (type, timeout) {
    if (adbClientApiWrapper == null) {
        return "";
    }
    return adbClientApiWrapper.activeSelf(type, timeout);
};


/**
 * 打开无线调试界面
 * 适配EC 安卓 11.33.0+
 * @returns {*|boolean} true 成功 false失败
 */
AdbClientWrapper.prototype.openAdbWifiDebugPage = function () {
    if (adbClientApiWrapper == null) {
        return false;
    }
    return adbClientApiWrapper.openAdbWifiDebugPage();
};


/**
 * 打开通知栏权限界面
 * 适配EC 安卓 11.33.0+
 * @returns {*|boolean} true 成功 false失败
 */
AdbClientWrapper.prototype.openNotificationPermissionPage = function () {
    if (adbClientApiWrapper == null) {
        return false;
    }
    return adbClientApiWrapper.openNotificationPermissionPage();
};




