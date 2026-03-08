function HidEventWrapper() {
}

let hidEvent = new HidEventWrapper();

/**
 * [网络模式]设置HID主控地址
 * 适配版本 EC 安卓 9.15.0+
 * @param hidCenterUrl HID主控程序运行的网址
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.setHidCenter = function (hidCenterUrl) {
    let result = hidEventWrapper.setHidCenter(hidCenterUrl)
    return result;
};

/**
 * [网络模式]初始化HID设备
 * 适配版本 EC 安卓 9.15.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.initUsbDevice = function () {
    let result = hidEventWrapper.initUsbDevice(false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};

/**
 * [USB模式]初始化HID设备
 * 适配版本 EC 安卓 10.6.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.initUsbDeviceByUsb = function () {
    let result = hidEventWrapper.initUsbDevice(true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * @deprecated
 * 函数已废弃
 * [网络模式]矫正HID坐标
 * 调用 initUsbDevice 再调用这个函数
 * 适配版本 EC 安卓 9.15.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.checkFirstPoint = function () {
    let result = hidEventWrapper.checkFirstPoint()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [网络模式]关闭HID设备
 * 适配版本 EC 安卓 9.15.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.closeUsbDevice = function () {
    let x = hidEventWrapper.closeUsbDevice(false)
    if (x == null || x == undefined || x == "") {
        return null;
    }
    return x;
};


/**
 * [USB模式]关闭HID设备
 * 适配版本 EC 安卓 10.6.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.closeUsbDeviceByUsb = function () {
    let x = hidEventWrapper.closeUsbDevice(true)
    if (x == null || x == undefined || x == "") {
        return null;
    }
    return x;
};


/**
 * [网络模式]点击坐标
 * 适配版本 EC 安卓 9.15.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.clickPoint = function (x, y) {
    let result = hidEventWrapper.click(x, y, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
/**
 * [USB模式]点击坐标
 * 适配版本 EC 安卓 10.6.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.clickPointByUsb = function (x, y) {
    let result = hidEventWrapper.click(x, y, true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
/**
 * [网络模式]双击坐标
 * 适配版本 EC 安卓 9.15.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.doubleClickPoint = function (x, y) {
    let result = hidEventWrapper.doubleClick(x, y, 150, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};

/**
 * [USB模式]双击坐标
 * 适配版本 EC 安卓 10.6.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.doubleClickPointByUsb = function (x, y) {
    let result = hidEventWrapper.doubleClick(x, y, 150, true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
/**
 * [网络模式]长按坐标
 * 适配版本 EC 安卓 9.15.0+
 * @param x x坐标
 * @param y y坐标
 * @param delay 按住时间，单位是毫秒
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.press = function (x, y, delay) {
    let result = hidEventWrapper.press(x, y, delay, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
/**
 * [USB模式]长按坐标
 * 适配版本 EC 安卓 10.6.0+
 * @param x x坐标
 * @param y y坐标
 * @param delay 按住时间，单位是毫秒
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.pressByUsb = function (x, y, delay) {
    let result = hidEventWrapper.press(x, y, delay, true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};

/**
 * [网络模式]滑动
 * 适配版本 EC 安卓 9.36.0+
 * @param x 起点x坐标
 * @param y 起点y坐标
 * @param ex 终点x坐标
 * @param ey 终点y坐标
 * @param delay 按住时间，单位是毫秒
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.swipe = function (x, y, ex, ey, delay) {
    let result = hidEventWrapper.swipe(x, y, ex, ey, delay, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};

/**
 * [USB模式]滑动
 * 适配版本 EC 安卓 10.6.0+
 * @param x 起点x坐标
 * @param y 起点y坐标
 * @param ex 终点x坐标
 * @param ey 终点y坐标
 * @param delay 按住时间，单位是毫秒
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.swipeByUsb = function (x, y, ex, ey, delay) {
    let result = hidEventWrapper.swipe(x, y, ex, ey, delay, true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
/**
 * [网络模式]多点触摸
 * 适配版本 EC 安卓 9.15.0+
 * 触摸参数: action :一般情况下 按下为0，弹起为1，移动为2
 * x: X坐标
 * y: Y坐标
 * pointer：设置第几个手指触摸点，分别是 1，2，3 等，代表第n个手指
 * delay: 该动作延迟多少毫秒执行, 大于40ms，否则可能出现坐标漂移的现象
 * @param touch1 第1个手指的触摸点数组,例如：[{"action":0,"x":1,"y":1,"pointer":1,"delay":30},{"action":2,"x":1,"y":1,"pointer":1,"delay":30}]
 * @param timeout 多点触摸执行的超时时间，单位是毫秒
 * @return {boolean}
 */
HidEventWrapper.prototype.multiTouch = function (touch1, timeout) {
    var data = JSON.stringify(touch1);
    return hidEventWrapper.multiTouch(data, timeout, false);
};
/**
 * [USB模式]多点触摸
 * 适配版本 EC 安卓 10.6.0+
 * 触摸参数: action :一般情况下 按下为0，弹起为1，移动为2
 * x: X坐标
 * y: Y坐标
 * pointer：设置第几个手指触摸点，分别是 1，2，3 等，代表第n个手指
 * delay: 该动作延迟多少毫秒执行, 大于40ms，否则可能出现坐标漂移的现象
 * @param touch1 第1个手指的触摸点数组,例如：[{"action":0,"x":1,"y":1,"pointer":1,"delay":30},{"action":2,"x":1,"y":1,"pointer":1,"delay":30}]
 * @param timeout 多点触摸执行的超时时间，单位是毫秒
 * @return {boolean}
 */
HidEventWrapper.prototype.multiTouchByUsb = function (touch1, timeout) {
    var data = JSON.stringify(touch1);
    return hidEventWrapper.multiTouch(data, timeout, true);
};

/**
 * @deprecated
 * 函数已废弃
 * 移动鼠标到坐标点
 * 适配版本 EC 安卓 9.15.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.mouseMove = function (x, y) {
    let result = hidEventWrapper.mouseMove(x, y, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [网络模式]按下
 * 适配版本 EC 安卓 9.19.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.touchDown = function (x, y) {
    let result = hidEventWrapper.touchDown(x, y, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [USB模式]按下
 * 适配版本 EC 安卓 10.6.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.touchDownByUsb = function (x, y) {
    let result = hidEventWrapper.touchDown(x, y, true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [网络模式]移动
 * 适配版本 EC 安卓 9.19.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.touchMove = function (x, y) {
    let result = hidEventWrapper.touchMove(x, y, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
/**
 * [USB模式]移动
 * 适配版本 EC 安卓 10.6.0+
 * @param x x坐标
 * @param y y坐标
 * @return {string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.touchMoveByUsb = function (x, y) {
    let result = hidEventWrapper.touchMove(x, y, true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
/**
 * [网络模式]弹起
 * 适配版本 EC 安卓 9.19.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.touchUp = function (x, y) {
    let result = hidEventWrapper.touchUp(x, y, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
/**
 * [USB模式]弹起
 * 适配版本 EC 安卓 10.6.0+
 * @param x x坐标
 * @param y y坐标
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.touchUpByUsb = function (x, y) {
    let result = hidEventWrapper.touchUp(x, y, true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};

/**
 * @deprecated
 * 函数已废弃
 * 鼠标参数设置
 * 适配版本 EC 安卓 9.19.0+
 * @param mouseStep 鼠标移动的每次距离，默认是50，不超过127
 * @param mouseSleep 移动间隔单位是毫秒。默认是50
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.setting = function (mouseStep, mouseSleep) {
    let result = hidEventWrapper.setting(mouseStep, mouseSleep, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [USB模式]重置USB数据流
 * 如果长时间写不进去数据或者失败，尝试重新重置数据流
 * 适配版本 EC 安卓 10.6.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.resetIOByUsb = function () {
    let result = hidEventWrapper.resetIOByUsb()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [网络模式]home键
 * 适配版本 EC 安卓 10.21.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.home = function () {
    let result = hidEventWrapper.home(false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [网络模式] 返回 键
 * 适配版本 EC 安卓 10.21.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.back = function () {
    let result = hidEventWrapper.back(false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};

/**
 * [网络模式] 打开通知栏 键
 * 适配版本 EC 安卓 10.21.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.openNotification = function () {
    let result = hidEventWrapper.openNotification(false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};

/**
 * [网络模式] 最近历史任务 键
 * 适配版本 EC 安卓 10.21.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.recentApps = function () {
    let result = hidEventWrapper.recentApps(false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [网络模式] hid键盘输入
 * 适配版本 EC 安卓 10.21.0+
 * @param modifiers int 辅助键 306:Left Ctrl,304:Left Shift,308:Left Alt,305:Right Ctrl,303:Right Shift,307:Right Alt,309:left Windows key,310:Right Windows key
 * @param code int 实际键， 详细请参考 https://max.book118.com/html/2018/0108/147954370.shtm 或者 https://wenku.csdn.net/answer/f525e3adc4034414899a2d53fe143c3e
 * 或者百度搜索 搜索 关键字 hid键盘键码值
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.sendKey = function (modifiers, code) {
    let result = hidEventWrapper.sendKey(modifiers, code, false)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [USB模式]home键
 * 适配版本 EC 安卓 10.21.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.homeByUsb = function () {
    let result = hidEventWrapper.home(true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [USB模式] 返回 键
 * 适配版本 EC 安卓 10.21.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.backByUsb = function () {
    let result = hidEventWrapper.back(true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [USB模式] 打开通知栏 键
 * 适配版本 EC 安卓 10.21.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.openNotificationByUsb = function () {
    let result = hidEventWrapper.openNotification(true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};

/**
 * [USB模式] 最近历史任务 键
 * 适配版本 EC 安卓 10.21.0+
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.recentAppsByUsb = function () {
    let result = hidEventWrapper.recentApps(true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};


/**
 * [USB模式] hid键盘输入
 * 适配版本 EC 安卓 10.21.0+
 * @param modifiers int 辅助键 306:Left Ctrl,304:Left Shift,308:Left Alt,305:Right Ctrl,303:Right Shift,307:Right Alt,309:left Windows key,310:Right Windows key
 * @param code int 实际键， 详细请参考 https://max.book118.com/html/2018/0108/147954370.shtm 或者 https://wenku.csdn.net/answer/f525e3adc4034414899a2d53fe143c3e
 * 或者百度搜索 搜索 关键字 hid键盘键码值
 * @return {null|string} null 代表成功，其他代表错误消息
 */
HidEventWrapper.prototype.sendKeyByUsb = function (modifiers, code) {
    let result = hidEventWrapper.sendKey(modifiers, code, true)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result;
};
