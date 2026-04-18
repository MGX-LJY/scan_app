function OtgEventWrapper() {
}

let otgEvent = new OtgEventWrapper();

/**
 * 初始化 OTG 串口
 * 适配版本 EC 安卓 11.40.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
OtgEventWrapper.prototype.init = function () {
    try {
        otgSerialWrapper.init();
        return null;
    } catch (e) {
        return e + "";
    }
};

/**
 * 连接第一个 串口设备
 * 适配版本 EC 安卓 11.40.0+
 * 注意：如果没有授权，会弹权限框，此时会返回错误信息，授权后再调用一次即可
 * @return {null|string} null 代表成功，其他代表错误消息
 */
OtgEventWrapper.prototype.connectFirst = function () {
    let r = otgSerialWrapper.connectFirst(115200);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};

/**
 * 连接状态
 * 适配版本 EC 安卓 11.40.0+
 * @return {boolean} true 代表链接成功
 */
OtgEventWrapper.prototype.isConnected = function () {
    return otgSerialWrapper.isConnected();
};

/**
 * 设置超时（全局生效）
 * 适配版本 EC 安卓 11.40.0+
 * @param writeTimeoutMs 写入超时（ms），默认 1000
 * @param replyTimeoutMs 等待回复超时（ms），默认 2000
 * @param durationExtraTimeoutMs 对 press/swipe 等带 duration 的动作额外等待（ms），默认 3000
 * @return {null|string} null和空代表成功，其他代表错误信息
 */
OtgEventWrapper.prototype.setTimeouts = function (writeTimeoutMs, replyTimeoutMs, durationExtraTimeoutMs) {
    let r = otgSerialWrapper.setTimeouts(writeTimeoutMs || 1000, replyTimeoutMs || 2000, durationExtraTimeoutMs || 3000);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};

/**
 * 点击
 * 适配版本 EC 安卓 11.40.0+
 * @param x x坐标
 * @param y y 坐标
 * @return {null|string} null和空代表成功，其他代表错误信息
 */
OtgEventWrapper.prototype.clickPoint = function (x, y) {
    let r = otgSerialWrapper.click(x, y);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};

/**
 * 双击
 * 适配版本 EC 安卓 11.40.0+
 * @param x x坐标
 * @param y y 坐标
 * @return {null|string} null和空代表成功，其他代表错误信息
 */
OtgEventWrapper.prototype.doubleClickPoint = function (x, y) {
    let bbv = utilsWrapper.getRangeInt(50, 120)
    let r = otgSerialWrapper.doubleClick(x, y, bbv);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};

/**
 * 长按
 * 适配版本 EC 安卓 11.40.0+
 * @param x x坐标
 * @param y y 坐标
 * @param holdMs 按住时间（毫秒）
 * @return {null|string} null和空代表成功，其他代表错误信息
 */
OtgEventWrapper.prototype.press = function (x, y, holdMs) {
    let r = otgSerialWrapper.press(x, y, holdMs || 1000);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};

/**
 * 滑动
 * 适配版本 EC 安卓 11.40.0+
 * @param x0 开始的x坐标
 * @param y0 开始的y坐标
 * @param x1 结束的x坐标
 * @param y1 结束的y坐标
 * @param durationMs 总耗时（毫秒）
 * @return {null|string} null和空代表成功，其他代表错误信息
 */
OtgEventWrapper.prototype.swipe = function (x0, y0, x1, y1, durationMs) {
    let r = otgSerialWrapper.swipe(x0, y0, x1, y1, durationMs || 300);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};

/**
 * 按下
 * 适配版本 EC 安卓 11.40.0+
 * @param x x坐标
 * @param y y 坐标
 * @return {null|string} null和空代表成功，其他代表错误信息
 */
OtgEventWrapper.prototype.touchDown = function (x, y) {
    let r = otgSerialWrapper.touchDown(x, y);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};
/**
 * 移动
 * 适配版本 EC 安卓 11.40.0+
 * @param x x坐标
 * @param y y 坐标
 * @return {null|string} null和空代表成功，其他代表错误信息
 */
OtgEventWrapper.prototype.touchMove = function (x, y) {
    let r = otgSerialWrapper.touchMove(x, y, true);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};
/**
 * 抬起
 * 适配版本 EC 安卓 11.40.0+
 * @param x x坐标
 * @param y y 坐标
 * @return {null|string} null和空代表成功，其他代表错误信息
 */
OtgEventWrapper.prototype.touchUp = function (x, y) {
    let r = otgSerialWrapper.touchUp(x, y);
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};

/**
 * 系统按键
 * 适配版本 EC 安卓 11.40.0+
 * @param key 值有=home back recents
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
OtgEventWrapper.prototype.systemKey = function (key) {
    let result = otgSerialWrapper.systemKey(key)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 任务列表
 * 适配版本 EC 安卓 11.40.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
OtgEventWrapper.prototype.recents = function () {
    let result = otgSerialWrapper.recents()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 返回
 * 适配版本 EC 安卓 11.40.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
OtgEventWrapper.prototype.back = function () {
    let result = otgSerialWrapper.back()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 主页
 * 适配版本 EC 安卓 11.40.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
OtgEventWrapper.prototype.home = function () {
    let result = otgSerialWrapper.home()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 键盘按键
 * 适配版本 EC 安卓 11.40.0+
 * @param prefix 值分别有，不写或者null默认就是普通的按键， alt=按住alt键,ctrl=按住ctrl键,gui=按住win键,r_ctrl=按住右侧的ctrl键,r_shift=按住右侧的shift键,shift=按住shift键
 * @param code   ascii码，直接百度即可
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
OtgEventWrapper.prototype.keyPress = function (prefix, code) {
    let result = otgSerialWrapper.keyPress(prefix, code)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 键盘按键字符
 * 适配版本 EC 安卓 11.40.0+
 * @param prefix 值分别有，不写或者null默认就是普通的按键， alt=按住alt键,ctrl=按住ctrl键,gui=按住win键,r_ctrl=按住右侧的ctrl键,r_shift=按住右侧的shift键,shift=按住shift键
 * @param c 单个字符，例如a
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
OtgEventWrapper.prototype.keyPressChar = function (prefix, c) {
    let result = otgSerialWrapper.keyPressChar(prefix, c)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 多点触摸
 * 适配版本 EC 安卓 11.40.0+
 * @param touch1 触摸点数组，例如：[{"action":0,"x":1,"y":1,"pointer":1,"delay":30},{"action":2,"x":2,"y":2,"pointer":1,"delay":30},{"action":1,"x":2,"y":2,"pointer":1,"delay":30}]
 * @param timeout 超时时间（ms）
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
OtgEventWrapper.prototype.multiTouch = function (touch1, timeout) {
    let data = JSON.stringify(touch1);
    let result = otgSerialWrapper.multiTouch(data, timeout);
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 读取对端固件 MAC 地址
 * 适配版本 EC 安卓 11.41.0+
 * @returns {string|null} 成功为 aa:bb:cc:dd:ee:ff 形式；失败为 null
 */
OtgEventWrapper.prototype.getMacAddress = function () {
    let r = otgSerialWrapper.getMacAddress();
    if (r == null || r === undefined) {
        return null;
    }
    return r + "";
};

/**
 * 关闭连接
 * 适配版本 EC 安卓 11.40.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
OtgEventWrapper.prototype.close = function () {
    let r = otgSerialWrapper.close();
    if (r == null || r == undefined || r == "") return null;
    return r + "";
};

