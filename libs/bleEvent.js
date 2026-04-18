function BleEventWrapper() {
}

let bleEvent = new BleEventWrapper();

/**
 * 连接蓝牙设备
 * 适配版本 EC 安卓 11.37.0+
 * @param bleDeviceName 蓝牙设备名称，不写就从app系统设置中读取
 * @param save 是否保存设置的 蓝牙设备名称
 * @param timeout 链接超时时间 单位是毫秒
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.startConnect = function (bleDeviceName, save, timeout) {
    let result = bleEventWrapper.startConnect(bleDeviceName, save, timeout)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 设置WIFI
 * 适配版本 EC 安卓 11.39.0+
 * 设置完成后需要重启开发板才能联网
 * @param name WiFi 名称
 * @param pwd Wifi 密码
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.setWifi = function (name, pwd) {
    let result = bleEventWrapper.setWifi(name, pwd)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 重启开发板
 * 适配版本 EC 安卓 11.39.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.reset = function () {
    let result = bleEventWrapper.reset()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 断开连接
 * 适配版本 EC 安卓 11.37.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.stopConnect = function () {
    let result = bleEventWrapper.stopConnect()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

///**
// * 显示或者隐藏名称
// * 适配版本 EC 安卓 11.37.0+
// * @param r true 代表显示， false 代表隐藏
// * @returns {string|null} null或者空代表正常  其他代表错误信息
// */
//BleEventWrapper.prototype.showDeviceName = function (r) {
//    let result = bleEventWrapper.showDeviceName(r)
//    if (result == null || result == undefined || result == "") {
//        return null;
//    }
//    return result + "";
//};

/**
 * 设置心跳超时时间
 * 与设备心跳时间超过了设定的，代表链接断开了，默认是30s
 * @param tt 超时时间，单位是毫秒
 * 适配版本 EC 安卓 11.37.0+
 */
BleEventWrapper.prototype.setHeartbeatTimeout = function (tt) {
  bleEventWrapper.setHeartbeatTimeout(tt)
};


/**
 * 链接状态
 * 适配版本 EC 安卓 11.37.0+
 * @returns {boolean} true 代表已经链接 false代表未链接
 */
BleEventWrapper.prototype.isConnected = function () {
    return  bleEventWrapper.isConnected()
};



/**
 * 设置坐标系的宽度等于高度
 * 一般不用设置，如果发现坐标点点击不对可以设置，例如iqoo系列需要设置
 * 适配版本 EC 安卓 11.37.0+
 * @param r true代表是
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.setWidthEqualsHeight = function (r) {
    let result = bleEventWrapper.setWidthEqualsHeight(r)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 点击
 * 适配版本 EC 安卓 11.37.0+
 * @param x x坐标
 * @param y y坐标
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.clickPoint = function (x, y) {
    let result = bleEventWrapper.click(x, y)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 长按
 * 注意，这个由于和脚本是异步的，调用后请sleep(delay)这么长时间 防止事件冲突
 * 适配版本 EC 安卓 11.37.0+
 * @param x x坐标
 * @param y y坐标
 * @param delay 延迟时间 单位毫秒
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.press = function (x, y, delay) {
    let result = bleEventWrapper.press(x, y, delay)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 双击
 * 适配版本 EC 安卓 11.37.0+
 * @param x x坐标
 * @param y y坐标
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.doubleClick = function (x, y) {
    let result = bleEventWrapper.doubleClick(x, y)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 按下
 * 适配版本 EC 安卓 11.37.0+
 * @param x x坐标
 * @param y y坐标
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.touchDown = function (x, y) {
    let result = bleEventWrapper.touchDown(x, y)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 移动
 * 适配版本 EC 安卓 11.37.0+
 * @param x x坐标
 * @param y y坐标
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.touchMove = function (x, y) {
    let result = bleEventWrapper.touchMove(x, y)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 抬起
 * 适配版本 EC 安卓 11.37.0+
 * @param x x坐标
 * @param y y坐标
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.touchUp = function (x, y) {
    let result = bleEventWrapper.touchUp(x, y)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 滑动
 * 注意，这个由于和脚本是异步的，调用后请sleep(delay)这么长时间 防止事件冲突
 * 适配版本 EC 安卓 11.37.0+
 * @param x x坐标
 * @param y y坐标
 * @param ex 终点x坐标
 * @param ey 终点y坐标
 * @param delay 总计滑动时间单位是毫秒
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.swipe = function (x, y, ex, ey, delay) {
    let result = bleEventWrapper.swipe(x, y, ex, ey, delay)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 多点触摸
 * 注意，这个由于和脚本是异步的，调用后请sleep滑动总时间 防止事件冲突
 * 适配版本 EC 安卓 11.37.0+
 * 触摸参数: action :一般情况下 按下为0，弹起为1，移动为2
 * x: X坐标
 * y: Y坐标
 * pointer：设置第几个手指触摸点，分别是 1，2，3 等，代表第n个手指
 * delay: 该动作延迟多少毫秒执行, 大于40ms，否则可能出现坐标漂移的现象
 * @param touch1 第1个手指的触摸点数组,例如：[{"action":0,"x":1,"y":1,"pointer":1,"delay":30},{"action":2,"x":1,"y":1,"pointer":1,"delay":30}]
 * @param timeout 多点触摸执行的超时时间，单位是毫秒
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.multiTouch = function (touch1, timeout) {
    let data = JSON.stringify(touch1);
    return bleEventWrapper.multiTouch(data, timeout);
};

/**
 * 隐藏蓝牙的名称
 * 防止被搜索到
 * 适配版本 EC 安卓 11.38.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.hideBleName = function () {
    let result = bleEventWrapper.hideBleName()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 显示蓝牙的名称
 * 如果蓝牙通信不成功，可能导致不能显示，那就手动重启一下开发板
 * 适配版本 EC 安卓 11.38.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.showBleName = function () {
    let result = bleEventWrapper.showBleName()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};



/**
 * 系统按键
 * 适配版本 EC 安卓 11.37.0+
 * @param key 值有=home back recents
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.systemKey = function (key) {
    let result = bleEventWrapper.systemKey(key)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 任务列表
 * 可能在有的手机不生效，因为不是标准按键
 * 适配版本 EC 安卓 11.37.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.recents = function () {
    let result = bleEventWrapper.systemKey("recents")
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 返回
 * 适配版本 EC 安卓 11.37.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.back = function () {
    let result = bleEventWrapper.systemKey("back")
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 主页
 * 适配版本 EC 安卓 11.37.0+
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.home = function () {
    let result = bleEventWrapper.systemKey("home")
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};



/**
 * 键盘按键
 * 适配版本 EC 安卓 11.37.0+
 * @param prefix 值分别有，不写或者null默认就是普通的按键， alt=按住alt键,ctrl=按住ctrl键,gui=按住win键,r_ctrl=按住右侧的ctrl键,r_shift=按住右侧的shift键,shift=按住shift键
 * @param code   ascii码，直接百度即可
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.keyPress = function (prefix,code) {
    let result = bleEventWrapper.keyPress(prefix,code)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};


/**
 * 键盘按键字符
 * 适配版本 EC 安卓 11.37.0+
 * @param prefix 值分别有，不写或者null默认就是普通的按键， alt=按住alt键,ctrl=按住ctrl键,gui=按住win键,r_ctrl=按住右侧的ctrl键,r_shift=按住右侧的shift键,shift=按住shift键
 * @param c 单个字符，例如a，系统内部自动转换为 ascii码，参开地址 https://tool.oschina.net/commons?type=4
 * @returns {string|null} null或者空代表正常  其他代表错误信息
 */
BleEventWrapper.prototype.keyPressChar = function (prefix,c) {
    let result = bleEventWrapper.keyPressChar(prefix,c)
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};

/**
 * 获取app配置的蓝牙名称
 * 适配版本 EC 安卓 11.38.0+
 * @returns {string|null} 名称字符串
 */
BleEventWrapper.prototype.getConfigBleName = function () {
    let result = bleEventWrapper.getConfigBleName()
    if (result == null || result == undefined || result == "") {
        return null;
    }
    return result + "";
};