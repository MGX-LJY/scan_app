importClass(java.io.File)
importClass(java.io.FileOutputStream)
importClass(java.io.BufferedOutputStream)
importClass(java.io.FileInputStream)
// importClass(java.nio.ByteBuffer)
// importClass(java.nio.channels.FileChannel)
importClass(java.net.InetAddress)
importClass(java.net.NetworkInterface)
importClass(java.net.Inet6Address)

importClass(android.graphics.Color)
importClass(android.util.Base64)
importClass(android.content.Intent)
importClass(android.content.Context)
importClass(android.content.ComponentName)
importClass(android.content.pm.PackageManager)
importClass(android.content.pm.ApplicationInfo)
importClass(android.net.Uri)
importClass(android.os.Debug)

importClass(org.jsoup.Jsoup)
importClass(org.jsoup.Connection)
if (!Object.entries) {
    Object.entries = function (obj) {
        let ownProps = Object.keys(obj),
            i = ownProps.length,
            resArray = new Array(i) // preallocate the Array
        while (i--) {
            resArray[i] = [ownProps[i], obj[ownProps[i]]]
        }
        return resArray
    }
}
if (!Object.values) {
    Object.values = function (obj) {
        return Object.keys(obj).map(function (key) {
            return obj[key]
        })
    }
}
/**
 * @author 老冷编程学院:http://bbs.laoleng.vip
 * @date 2024.10.12
 * @description 插件更新及下载地址http://bbs.laoleng.vip/thread-6-1-1.html
 */
const laoleng = {
    app: {},
    arr: {},
    String: {},
    RndStr: {},
    /**
     *@description 键盘功能
     */
    Key: {},
    ecVersion: acEvent.version().split(".").map(Number),
    isInitImage: false,
    isInitOcr: false,
    ocrBaseObject: null,
    ocrConfig: {
        timeOut: 10 * 1000,
        extra: {"maxSideLen": 1024},
        needBinary: true,
        mode: 1,
        threshold: 100,
    },
}


laoleng.getVersion = function () {
    return "1.6.6"
}
// logw("js插件ver:{},加载成功,EC教学咨询,老冷编程学院:http://bbs.laoleng.vip", laoleng.getVersion())

/**
 * @description 全局node返回值
 * @type {NodeInfo}
 */
let g_ret = null
/**
 * @description 全局异常处理node返回值
 * @type {NodeInfo}
 */
let g_ret2 = null
/**
 * @description 全局nodeall返回值
 * @type {NodeInfo[]|NodeInfo}
 */
let gNodeAll = null
/**
 * @description 全局父节点node返回值
 * @type {NodeInfo}
 */
let g_parent = null
/**
 * @description 全局子节点node返回值
 * @type {NodeInfo}
 */
let g_child = null

const gg = {
    tag: null,
    is_locked: false,
    count: 0,
    failCount: 0
}
/**
 * @description 多点比色key返回值
 * @type {null}
 */
let gCmpKey = null
/**
 * @description 全局坐标返回值
 * @type {{x:int,y:int,top:int,left:int,bottom:int,right:int}}
 */
let gPoint = {x: -1, y: -1, top: -1, left: -1, bottom: -1, right: -1}
/**
 * @description 全局坐标返回值数组
 * @type {{top: number, left: number, bottom: number, x: number, y: number, right: number}[]}
 */
let gPointAll = null

/**
 * @description 全局屏幕数据
 * @type {AutoImage}
 */
let gScreen = null

/**
 * @author Mr_老冷 QQ:1920712147
 * @description laoleng类
 */


/**
 * @description格式化textmatch正则串 由 1|2|3格式化为 ^1$|^2$|^3$
 * @param str
 * @return {string}
 */
function transParms(str) {
    str = str.split("|")
    for (let i = 0; i < str.length; i++) {
        str[i] = "^" + str[i] + "$"
    }
    return str.join("|")
}

/**
 * @author Mr_老冷 QQ:1920712147
 * @description 查找节点并点击
 * @param {S} selector 选择器
 * @param {Boolean?} isClick 是否点击
 * @param {Boolean?} pointer 是否指针点击
 * @return {Boolean} true/false;全局jsonObj  g_ret;
 * @example
 * findNode(text("aaa").id("bbb"),true)
 */
function findNode(selector, isClick, pointer) {
    if (typeOf(selector) !== "S") {
        logw("防SB提示,findNode,传参类型不对:" + selector)
        return false
    }
    sleep(1)
    g_ret = selector.getOneNodeInfo(0)
    if (g_ret) {
        if (isClick) {
            if (pointer) {
                g_ret.click()
                sleep(random(500, 1000))
            } else {
                findClickEx(g_ret)
            }
        }
        let tmp_slt = JSON.stringify(selector.attr)
        if (gg.tag === tmp_slt) {
            gg.count++
            if (gg.count >= 10) {
                logw("疑似界面长期未动_强刷")
                //判断是否进行了锁节点,没锁就调用普通的强刷
                if (gg.is_locked) {
                    keepNode(true)
                } else {
                    removeNodeFlag(0)
                }
                gg.count = 0
            }
        } else {
            gg.count = 0
        }
        gg.tag = tmp_slt
        gg.failCount = 0
        return true
    }
    gg.failCount++
    if (gg.failCount >= 100) {
        // logw("查找节点100次失败_强刷")
        //判断是否进行了锁节点,没锁就调用普通的强刷
        if (gg.is_locked) {
            keepNode(true)
        } else {
            removeNodeFlag(0)
        }
        gg.failCount = 0
    }
    return false
}


/**
 * @author Mr_老冷 QQ:1920712147
 * @description 查找节点S,异常处理使用
 * @param {S} selector 选择器
 * @param {Boolean?} isClick 是否点击
 * @param {Boolean?} pointer 是否指针点击
 * @return {Boolean} true/false;全局jsonObj  g_ret2;
 * @example
 * findNodeS(text("aaa").id("bbb"),true)
 */
function findNodeS(selector, isClick, pointer) {
    if (typeOf(selector) !== "S") {
        logw("防SB提示,findNodeS,传参类型不对:" + selector)
        return false
    }
    sleep(1)
    g_ret2 = selector.getOneNodeInfo(0)
    if (g_ret2) {
        if (isClick) {
            if (pointer) {
                g_ret2.click()
                sleep(random(500, 1000))
            } else {
                findClickEx(g_ret2)
            }
        }
        return true
    }
    return false
}

/**
 * @description 查找所有节点并点击一个,如果取所有就不点击直接返回
 * @param selector{S} 选择器
 * @param sindex {Number?} 节点下标,从0开始,99表示随机,负数代表从后向前取节点,-1开始
 * @param isClick {Boolean?}  是否点击
 * @param pointer {Boolean?} 是否指针点击
 * @return {boolean} {Boolean} true/false;全局jsonObj  gNodeAll
 */
function findNodeAll(selector, sindex, isClick, pointer) {
    if (typeOf(selector) !== "S") {
        logw("防SB提示,findNodeAll,传参类型不对:" + selector)
        return false
    }
    sleep(1)
    gNodeAll = selector.getNodeInfo(0)
    if (gNodeAll) {
        if (sindex === undefined) {
            return true
        }
        let lens = gNodeAll.length - 1
        if (sindex !== 99 && sindex > lens) {
            logw("findNodeAll,下标越界", sindex, lens)
            return false
        }
        if (sindex + lens < -1) {
            logw("findNodeAll,反向下标越界", sindex, lens + 1)
            return false
        }
        if (sindex === 99) {
            gNodeAll = gNodeAll[random(0, lens)]
        } else if (sindex < 0) {
            gNodeAll = gNodeAll[lens + sindex + 1]
        } else {
            gNodeAll = gNodeAll[sindex]
        }
        if (isClick) {
            if (pointer) {
                gNodeAll.click()
                sleep(random(500, 1000))
            } else {
                findClickEx(gNodeAll)
            }
        }
        return true
    }
    return false
}


/**
 * @author Mr_老冷 QQ:1920712147
 * @description 查找可用父点击节点并无指针点击
 * @param {NodeInfo?} node 全局node返回值
 * @param {Boolean?} isNoClick 是否不点击
 * @return {Boolean} true/false;
 * @example
 * findClickEx(g_ret)
 * 由于查找父节点会重新截图一次节点,所以配合keepNode()比较好
 */
function findClickEx(node, isNoClick) {
    let tmp_ret = false
    node = node || g_ret
    if (typeOf(node) !== "NodeInfo") {
        logw("防SB提示,findClickEx,传参类型不对:" + node)
        return false
    }
    //6次找不到就算了
    try {
        for (let i = 0; i <= 5; i++) {
            if (!node) return false
            if (node.clickable) {
                g_parent = node
                tmp_ret = !isNoClick ? node.clickEx() : node
                !isNoClick && sleep(random(500, 1000))
                return tmp_ret
            }
            node = node.parent()
        }
    } catch (e) {
        loge(e)
    }
    return false
}

/**
 * @author Mr_老冷 QQ:1920712147
 * @description 查找可用父点击节点并无指针长点击
 * @param {NodeInfo?} node 全局node返回值
 * @param {Boolean?} isNoClick 是否不点击
 * @return {Boolean} true/false;
 * @example
 * findClickEx(g_ret)
 * 由于查找父节点会重新截图一次节点,所以配合keepNode()比较好
 */
function findLongClickEx(node, isNoClick) {
    let tmp_ret = false
    node = node || g_ret
    if (typeOf(node) !== "NodeInfo") {
        logw("防SB提示,findClickEx,传参类型不对:" + node)
        return false
    }
    //5次找不到就算了
    try {
        for (let i = 0; i <= 5; i++) {
            if (node) {
                if (!!node.clickable) {
                    g_parent = node
                    tmp_ret = !isNoClick ? node.longClickEx() : node
                    !isNoClick && sleep(random(200, 500))
                    return tmp_ret
                }
                node = node.parent()
            }
        }
    } catch (e) {
        loge(e + g_parent)
    }
    return false
}

/**
 * @author Mr_老冷 QQ:1920712147
 * @description 查找可用子点击节点并无指针点击
 * @param {NodeInfo?} node 全局node返回值
 * @param {Boolean?} isNoClick 是否不点击
 * @return {Boolean} true/false;
 * @example
 * findClickEx(g_ret)
 * 由于查找子节点会重新截图一次节点,所以配合keepNode()比较好
 */
function findClickExC(node, isNoClick) {
    let tmp_ret = false
    node = node || g_ret
    if (typeOf(node) !== "NodeInfo") {
        logw("防SB提示,findClickEx,传参类型不对:" + node)
        return false
    }
    //5次找不到就算了
    try {
        for (let i = 0; i <= 5; i++) {
            node = node.child(0)
            if (!node) {
                return false
            }
            if (!!node.clickable) {
                g_child = node
                tmp_ret = !isNoClick ? node.clickEx() : node
                !isNoClick && sleep(random(500, 1000))
                return tmp_ret
            }
        }
    } catch (e) {
        loge(e)
    }
    return false
}


/**
 * @description 查找可用父滚动节点并滚动
 * @param {NodeInfo?} node 全局node返回值
 * @param {Boolean?} isNoScroll 是否不滚动
 * @return {Boolean} true/false;
 * @example
 * 由于查找父节点会重新截图一次节点,所以配合keepNode()比较好
 */
function findScrollableP(node, isNoScroll) {
    let tmp_ret = false
    node = node || g_ret
    if (typeOf(node) !== "NodeInfo") {
        logw("防SB提示,findClickEx,传参类型不对:" + node)
        return false
    }
    //11次找不到就算了
    try {
        for (let i = 0; i <= 10; i++) {
            if (!node) return false
            if (node.scrollable) {
                g_parent = node
                tmp_ret = !isNoScroll ? node.scrollForward() : node
                !isNoScroll && sleep(random(500, 1000))
                return tmp_ret
            }
            node = node.parent()
        }
    } catch (e) {
        loge(e)
    }
    return false
}

/**
 * @description 获取节点x中心点
 * @param node {NodeInfo?} 节点对象
 * @returns {number}
 */
function centerX(node) {
    node = node || g_ret
    return (node.bounds.left + node.bounds.right) / 2
}

/**
 * @description 获取节点y中心点
 * @param node {NodeInfo?}节点对象
 * @returns {number}
 */
function centerY(node) {
    node = node || g_ret
    return (node.bounds.top + node.bounds.bottom) / 2
}

/**
 * @description 在节点一半的范围内随机按压
 * @param node {NodeInfo?} 节点对象
 * @param timeMin {number?} 最小时长,默认1s
 * @param timeMax {number?} 最大时长,默认同最小
 */
function pressHalf(node, timeMin, timeMax) {
    node = node || g_ret
    timeMin = timeMin * 1000 || 1000
    timeMax = timeMax * 1000 || timeMin
    let x1 = ~~((node.bounds.right - node.bounds.left) / 4 + node.bounds.left)
    let y1 = ~~((node.bounds.bottom - node.bounds.top) / 4 + node.bounds.top)
    let x2 = ~~((node.bounds.right - node.bounds.left) / 4 * 3 + node.bounds.left)
    let y2 = ~~((node.bounds.bottom - node.bounds.top) / 4 * 3 + node.bounds.top)
    return press(random(x1, x2), random(y1, y2), random(timeMin, timeMax))
}

/**
 * @description 判断数据类型
 * @param arg{any}
 * @return {string|null|undefined}
 * @example String|Number|Object|Boolean|Function|null|undefined
 */
function typeOf(arg) {
    if (arg === null) return null
    if (arg === undefined) return undefined
    return arg.constructor.name
}

/**
 * @description 判断数组是否不为空
 * @param arr {Array} 数组
 * @return {boolean}
 */
function isNotEmptyArray(arr) {
    if (!arr) return false
    return arr.length !== 0
}

/**
 * @description 判断是否为json
 * @param data {any} 数据
 * @return true/false{boolean} 是否
 */
function isJSON(data) {
    if (!data) return false
    if (typeOf(data) !== "String") return false
    try {
        let obj = JSON.parse(data)
        return !!(obj && typeof (obj) === 'object')
    } catch (e) {
        return false
    }
}

/**
 * @description getRunningPkg替代
 * @return {null|*|string}
 */
function getRunningPkgEx() {
    let node = bounds(100, 200, device.getScreenWidth(), device.getScreenHeight() - 100).getOneNodeInfo(0)
    return node ? node.pkg : ""
}

/**
 * @author Mr_老冷 QQ:1920712147
 * @description 锁定节点
 * @param mode {boolean?} 是否强制刷新节点
 */
function keepNode(mode) {
    //解锁
    releaseNode()
    if (mode) {
        //强制刷新节点
        removeNodeFlag(0)
        sleep(1)
    }
    //加锁
    lockNode()
    gg.is_locked = true
}

/**
 * @description 返回并等待
 * @param times {number?} 返回次数,默认1次
 * @param delay {number?} 延迟毫秒数,默认1000
 */
function backs(times, delay) {
    times = times || 1
    delay = delay || 1000
    for (let i = 0; i < times; i++) {
        back()
        sleep(delay)
    }
}

/**
 * @description 返回桌面并等待
 * @param times{number?} 等待秒数
 */
function homes(times) {
    times = times * 1000 || 1000
    home()
    sleep(times)
}

/**
 * @description 随机点击节点
 * @param nodeInfo {NodeInfo?}节点信息,默认g_ret
 * @param noDelay {boolean?}不加延迟,默认false,加延迟
 */
function clickPointBounds(nodeInfo, noDelay) {
    nodeInfo = nodeInfo || g_ret
    clickPoint(random(nodeInfo.bounds.left + 2, nodeInfo.bounds.right - 2), random(nodeInfo.bounds.top + 2, nodeInfo.bounds.bottom - 2))
    if (!noDelay) {
        sleep(random(500, 1000))
    }
}

/**
 * @description 随机点击范围
 * @param x1 {number}
 * @param y1{number}
 * @param x2{number}
 * @param y2{number}
 * @param noDelay {boolean?}不加延迟,默认false,加延迟
 */
function clickPointRnd(x1, y1, x2, y2, noDelay) {
    clickPoint(random(x1, x2), random(y1, y2))
    if (!noDelay) {
        sleep(random(500, 1000))
    }
}

/**
 * @description 随机点击数组
 * @param arr1 {Array} bounds左上坐标 [12,2224]
 * @param arr2{Array} bounds右下坐标 [195,2340]
 * @param noDelay {boolean?}不加延迟,默认false,加延迟
 */
function clickPointArr(arr1, arr2, noDelay) {
    clickPoint(random(arr1[0], arr2[0]), random(arr1[1], arr2[1]))
    if (!noDelay) {
        sleep(random(500, 1000))
    }
}

/**
 * @description 点击gPoint的x,y坐标,并随机延迟
 * @param startDelay {number?} 开始延迟
 * @param endDelay {number?} 结束延迟
 */
function clickXY(startDelay, endDelay) {
    startDelay = startDelay || 500
    endDelay = endDelay || startDelay
    clickPoint(gPoint.x, gPoint.y)
    sleep(random(startDelay, endDelay))
}


/**
 * @description multitouch方法进行点击
 * @param node {NodeInfo?} 节点信息,默认g_ret
 */
function tapExR(node) {
    node = node || g_ret
    let x = random(node.bounds.left, node.bounds.right)
    let y = random(node.bounds.top, node.bounds.bottom)
    let touch1 = MultiPoint
        .get()
        .action(0).x(x).y(y).pointer(1).delay(1)
        .next()
        .action(2).x(x).y(y).pointer(1).delay(1)
        .next()
        .action(1).x(x).y(y).pointer(1).delay(1)

    multiTouch(touch1, null, null, 300)
}

/**
 * @description 保持屏幕数据,优化速度
 * @return {boolean} 是否截图成功
 */
function keepScreen() {
    if (laoleng.EC.checkECVersion(10, 20)) {
        image.recycleAllImage()
    } else {
        if (gScreen) image.recycle(gScreen)
    }
    gScreen = null
    gScreen = image.captureFullScreen()
    return !!gScreen
}

/**
 * @description getObjectValues
 * @param value
 * @return {*[]}
 */
function getObjectValues(value) {
    return Object.keys(value).map(x => value[x])
}


/**
 * @description 多点比色封装,需要手动截图和释放
 * @param color{String} 颜色点阵
 * @param threshold{Number?} 相似度
 * @return {boolean} true/false
 */
function cmpColor(color, threshold) {
    threshold = threshold || 0.9
    sleep(1)
    return image.cmpColor(gScreen, color, threshold, 0, 0, 0, 0)
}

/**
 * @description 多点比色Ex封装,不需要手动截图和释放
 * @param color{String} 色点
 * @param threshold{Number?} 相似度
 * @return {boolean} true/false
 */
function cmpColorEx(color, threshold) {
    threshold = threshold || 0.9
    sleep(1)
    return image.cmpColorEx(color, threshold, 0, 0, 0, 0)
}

/**
 * @description 多组比色封装,需要手动截图和释放
 * @param colorObj{Object} 颜色对象,支持预处理或未处理的颜色对象方式
 * @param threshold{Number?} 相似度,默认0.9
 * @return {String} 找到页面的key值
 */
function cmpMultiColor(colorObj, threshold) {
    if (!colorObj.hasOwnProperty("keys")) {
        colorObj = cmpPreParse(colorObj)
    }
    threshold = threshold || 0.9
    sleep(1)
    let ret = image.cmpMultiColor(gScreen, colorObj.values, threshold, 0, 0, 0, 0)
    if (ret > -1) {
        gCmpKey = colorObj.keys[ret]
        return gCmpKey
    }
    return null
}

/**
 * @description 多组比色Ex封装,不需要手动截图和释放
 * @param colorObj{Object} 颜色对象,支持预处理或未处理的颜色对象方式
 * @param threshold{Number?} 相似度,默认0.9
 * @return {String} 找到页面的key值
 */
function cmpMultiColorEx(colorObj, threshold) {
    if (!colorObj.hasOwnProperty("keys")) {
        colorObj = cmpPreParse(colorObj)
    }
    threshold = threshold || 0.9
    sleep(1)
    let ret = image.cmpMultiColorEx(colorObj.values, threshold, 0, 0, 0, 0)
    if (ret > -1) {
        gCmpKey = colorObj.keys[ret]
        return gCmpKey
    }
    return null
}

/**
 * @description 多点比色预处理
 * @param colors{Object} 未处理的颜色对象
 * @return {{keys: *[], values: *[]}} 处理好的颜色对象
 */
function cmpPreParse(colors) {
    return {
        "keys": Object.keys(colors),
        "values": getObjectValues(colors)
    }
}


/**
 * @description 单点找色封装,需截图
 * @param color {String} 颜色字符串
 * @param startX {Number?} 范围起点x坐标,默认0,全屏
 * @param startY {Number?} 范围起点y坐标,默认0,全屏
 * @param endX {Number?} 范围终点x坐标,默认0,全屏
 * @param endY {Number?} 范围终点y坐标,默认0,全屏
 * @param threshold {Number?} 相似度,默认0.9
 * @param orz {Number?} 查找方向,默认1
 * @return {Object} 坐标点x,y对象或null
 */
function findColor(color, startX, startY, endX, endY, threshold, orz) {
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0
    if (endX < startX) {
        loge("findColor,endX < startX,请检查")
        return null
    }
    if (endY < startY) {
        loge("findColor,endY < startY,请检查")
        return null
    }
    threshold = threshold || 0.9
    orz = orz || 1
    sleep(1)
    let points = image.findColor(gScreen, color, threshold, startX, startY, endX, endY, 1, orz)
    if (points && points.length > 0) {
        gPoint.x = points[0].x
        gPoint.y = points[0].y
        return gPoint
    }
    gPoint = {x: -1, y: -1}
    return null
}

/**
 * @description 单点找色Ex封装,无需截图
 * @param color {String} 颜色字符串
 * @param startX {Number?} 范围起点x坐标,默认0,全屏
 * @param startY {Number?} 范围起点y坐标,默认0,全屏
 * @param endX {Number?} 范围终点x坐标,默认0,全屏
 * @param endY {Number?} 范围终点y坐标,默认0,全屏
 * @param threshold {Number?} 相似度,默认0.9
 * @param orz {Number?} 查找方向,默认1
 * @return {Object} 坐标点x,y对象或null
 */
function findColorEx(color, startX, startY, endX, endY, threshold, orz) {
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0
    if (endX < startX) {
        loge("findColorEx,endX < startX,请检查")
        return null
    }
    if (endY < startY) {
        loge("findColorEx,endY < startY,请检查")
        return null
    }
    threshold = threshold || 0.9
    orz = orz || 1
    sleep(1)
    let points = image.findColorEx(color, threshold, startX, startY, endX, endY, 1, orz)
    if (points && points.length > 0) {
        gPoint.x = points[0].x
        gPoint.y = points[0].y
        return gPoint
    }
    gPoint = {x: -1, y: -1}
    return null
}


/**
 * @description 多点找色封装,需要截图及释放
 * @param colorArr {Array} 颜色数组
 * @param thresholdOrArray {Number|[]?} 相似度,默认0.9,或者数组[起始x,起始y,结束x,结束y,相似度,查找方向]
 * @param orz {Number?} 查找方向
 * @return {Object} 坐标点x,y对象或null
 */
function findMultiColor(colorArr, thresholdOrArray, orz) {
    if (!colorArr || colorArr.length < 2) {
        loge("findMultiColorEx传值有问题:" + colorArr)
        return null
    }
    let startX = colorArr[2] || 0,
        startY = colorArr[3] || 0,
        endX = colorArr[4] || 0,
        endY = colorArr[5] || 0
    if (typeOf(thresholdOrArray) === "Array") {
        startX = thresholdOrArray[0]
        startY = thresholdOrArray[1]
        endX = thresholdOrArray[2]
        endY = thresholdOrArray[3]
        orz = thresholdOrArray[5]
        thresholdOrArray = thresholdOrArray[4]
    } else {
        thresholdOrArray = thresholdOrArray || colorArr[6] || 0.9
        orz = orz || colorArr[7] || 1
    }
    sleep(1)
    let points = image.findMultiColor(gScreen, colorArr[0], colorArr[1], thresholdOrArray, startX, startY, endX, endY, 1, orz)
    if (points && points.length > 0) {
        gPoint.x = points[0].x
        gPoint.y = points[0].y
        return gPoint
    }
    gPoint = {x: -1, y: -1}
    return null
}

/**
 * @description 多点找色Ex封装,不需要截图及释放
 * @param colorArr {Array} 相似度,默认0.9,或者数组[起始x,起始y,结束x,结束y,相似度,查找方向]
 * @param thresholdOrArray {Number?} 相似度
 * @param orz {Number?} 查找方向
 * @return {Object} 坐标点x,y对象或null
 */
function findMultiColorEx(colorArr, thresholdOrArray, orz) {
    if (!colorArr || colorArr.length < 2) {
        loge("findMultiColorEx传值有问题:" + colorArr)
        return null
    }
    let startX = colorArr[2] || 0,
        startY = colorArr[3] || 0,
        endX = colorArr[4] || 0,
        endY = colorArr[5] || 0
    if (typeOf(thresholdOrArray) === "Array") {
        startX = thresholdOrArray[0]
        startY = thresholdOrArray[1]
        endX = thresholdOrArray[2]
        endY = thresholdOrArray[3]
        orz = thresholdOrArray[5]
        thresholdOrArray = thresholdOrArray[4]
    } else {
        thresholdOrArray = thresholdOrArray || colorArr[6] || 0.9
        orz = orz || colorArr[7] || 1
    }
    sleep(1)
    let points = image.findMultiColorEx(colorArr[0], colorArr[1], thresholdOrArray, startX, startY, endX, endY, 1, orz)
    if (points && points.length > 0) {
        gPoint.x = points[0].x
        gPoint.y = points[0].y
        return gPoint
    }
    gPoint = {x: -1, y: -1}
    return null
}

/**
 * @description 透明找图封装,不需初始化openCV
 * @param imgName {String} res文件夹中png文件名,支持多图,|竖线隔开
 * @param startX {Number?} 范围起始X坐标
 * @param startY {Number?} 范围起始Y坐标
 * @param endX {Number?} 范围结束X坐标
 * @param endY {Number?} 范围结束XY坐标
 * @param threshold {Number?} 相似度,0.4-0.6才能找得到,应该是有bug
 * @return {Object} 找到坐标x,y对象,存储在gPoint中
 */

function findImageByColor(imgName, startX, startY, endX, endY, threshold) {
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0
    threshold = threshold || 0.9
    if (!imgName) {
        loge("未检测到小图图片名,请检查参数后再使用findImageByColor")
        return false
    }
    imgName = imgName.split("|")
    if (!gScreen) {
        loge("未检测到截图,请截图后再使用findImageByColor", imgName)
        return false
    }
    for (let i = 0; i < imgName.length; i++) {
        if (!imgName[i].endsWith("png")) {
            imgName[i] += ".png"
        }
        let sms = readResAutoImage(imgName[i])
        if (!sms) continue
        sleep(1)
        let points = image.findImageByColor(gScreen, sms, startX, startY, endX, endY, threshold, 1)
        image.recycle(sms)
        if (points && points.length > 0) {
            gPoint.x = points[0].x
            gPoint.y = points[0].y
            if (gPoint.x > -1 && gPoint.y > -1) {
                return gPoint
            }
        }
    }
    gPoint = {x: -1, y: -1}
    return false;
}

/**
 * @description 透明找图封装,返回多个坐标,不需初始化openCV
 * @param imgName {String} res文件夹中png文件名,支持多图,|竖线隔开
 * @param startX {Number?} 范围起始X坐标
 * @param startY {Number?} 范围起始Y坐标
 * @param endX {Number?} 范围结束X坐标
 * @param endY {Number?} 范围结束XY坐标
 * @param threshold {Number?} 相似度,默认0.9
 * @param limit {Number?} 找图返回个数,默认1
 * @return {Object} 找到坐标x,y对象,存储在gPoint中
 */

function findImageByColorAll(imgName, startX, startY, endX, endY, threshold, limit) {
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0
    threshold = threshold || 0.9
    limit = limit || 1
    if (!imgName) {
        loge("未检测到小图图片名,请检查参数后再使用 findImageByColorAll")
        return false
    }
    imgName = imgName.split("|")
    if (!gScreen) {
        loge("未检测到截图,请截图后再使用findImageByColor", imgName)
        return false
    }
    gPointAll = []
    for (let i = 0; i < imgName.length; i++) {
        if (!imgName[i].endsWith("png")) {
            imgName[i] += ".png"
        }
        let sms = readResAutoImage(imgName[i])
        if (!sms) continue
        sleep(1)
        let points = image.findImageByColor(gScreen, sms, startX, startY, endX, endY, threshold, limit)
        image.recycle(sms)
        if (points && points.length > 0) {
            for (let j = 0; j < points.length; j++) {
                gPointAll.push({
                    x: points[j].x,
                    y: points[j].y
                })
            }

            return gPointAll
        }
    }
    gPointAll = null
    return null
}

/**
 * @description openCV找图封装,需要截图,需要初始化openCV
 * @param imgName {String} 小图名称,支持多图,|竖线隔开
 * @param startX {Number?} 范围起点X坐标,默认0,全屏
 * @param startY {Number?} 范围起点Y坐标,默认0,全屏
 * @param endX {Number?} 范围终点X坐标,默认0,全屏
 * @param endY {Number?} 范围终点Y坐标,默认0,全屏
 * @param threshold {Number?} 相似度,默认0.9
 * @param weakThreshold {Number?} 最低相似度,默认threshold-0.2
 * @return {Object} 找到的图中心点x,y及top,bottom,left,right坐标对象
 */
function findImage(imgName, startX, startY, endX, endY, threshold, weakThreshold) {
    if (!laoleng.isInitImage) {
        loge("脚本终止,未初始化openCV,需要在脚本开头调用laoleng.EC.initImage()一次才行")
        exit()
    }
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0
    threshold = threshold || 0.9
    weakThreshold = weakThreshold || (threshold - 0.2)
    if (!imgName) {
        loge("未检测到小图图片名,请检查参数后再使用 findImage")
        return false
    }
    imgName = imgName.split("|")
    if (!gScreen) {
        loge("未检测到截图,请截图后再使用findImage", imgName)
        return false
    }
    for (let i = 0; i < imgName.length; i++) {
        if (!imgName[i].endsWith("png")) {
            imgName[i] += ".png"
        }
        let sms = readResAutoImage(imgName[i])
        if (!sms) continue
        sleep(1)
        let points = image.findImage(gScreen, sms, startX, startY, endX, endY, weakThreshold, threshold, 1, 5)
        image.recycle(sms)
        if (points && points.length > 0) {
            gPoint.x = ~~((points[0].left + points[0].right) / 2)
            gPoint.y = ~~((points[0].top + points[0].bottom) / 2)
            gPoint.top = points[0].top
            gPoint.left = points[0].left
            gPoint.bottom = points[0].bottom
            gPoint.right = points[0].right
            return gPoint
        }
    }
    gPoint = {x: -1, y: -1, top: -1, left: -1, bottom: -1, right: -1}
    return null
}

/**
 * @description openCV找图Ex封装,不需要截图,需要初始化openCV
 * @param imgName {String} 小图名称
 * @param startX {Number?} 范围起点X坐标,默认0,全屏
 * @param startY {Number?} 范围起点Y坐标,默认0,全屏
 * @param endX {Number?} 范围终点X坐标,默认0,全屏
 * @param endY {Number?} 范围终点Y坐标,默认0,全屏
 * @param threshold {Number?} 相似度,默认0.9
 * @param weakThreshold {Number?} 最低相似度,默认threshold-0.2
 * @return {Object} 找到的图中心点x,y及top,bottom,left,right坐标对象
 */
function findImageEx(imgName, startX, startY, endX, endY, threshold, weakThreshold) {
    if (!laoleng.isInitImage) {
        loge("脚本终止,未初始化openCV,需要在脚本开头调用laoleng.EC.initImage()一次才行")
        exit()
    }
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0
    threshold = threshold || 0.9
    weakThreshold = weakThreshold || (threshold - 0.2)
    if (!imgName) {
        loge("未检测到小图图片名,请检查参数后再使用 findImageEx")
        return false
    }
    imgName = imgName.split("|")
    for (let i = 0; i < imgName.length; i++) {
        if (!imgName[i].endsWith("png")) {
            imgName[i] += ".png"
        }
        let sms = readResAutoImage(imgName[i])
        if (!sms) continue
        sleep(1)
        let points = image.findImageEx(sms, startX, startY, endX, endY, weakThreshold, threshold, 1, 5)
        image.recycle(sms)
        if (points && points.length > 0) {
            gPoint.x = ~~((points[0].left + points[0].right) / 2)
            gPoint.y = ~~((points[0].top + points[0].bottom) / 2)
            gPoint.top = points[0].top
            gPoint.left = points[0].left
            gPoint.bottom = points[0].bottom
            gPoint.right = points[0].right
            return gPoint
        }
    }
    gPoint = {x: -1, y: -1, top: -1, left: -1, bottom: -1, right: -1}
    return null
}


/**
 * @description 切换ocr的配置
 * @param extra {Object} {"numThread": 1, "padding": 10,"maxSideLen": 1024}等,查阅ocrLite的git介绍
 * @param timeOut {number?} 超时时间,可空,默认10*1000ms
 * @param mode {number} 二值化模式,默认1
 * @param threshold {number} 二值化阈值 默认100
 */
laoleng.ocrConfig.setConfig = function (extra, timeOut, mode, threshold) {
    if (extra) {
        this.extra = extra
    }
    if (timeOut) {
        this.timeOut = timeOut
    }
    if (mode) {
        this.mode = mode
    }
    if (threshold) {
        this.threshold = threshold
    }
}

/**
 * @description OCR查找字符串,模糊匹配
 * @param str {String} 要查找的字符串
 * @param startX {Number?} 范围起始X坐标,默认0全屏
 * @param startY {Number?} 范围起始Y坐标,默认0全屏
 * @param endX {Number?} 范围结束X坐标,默认0全屏
 * @param endY {Number?} 范围结束Y坐标,默认0全屏
 * @return {null|*|{top: number, left: number, bottom: number, x: number, y: number, right: number, label: String}}
 */
function ocrFindStr(str, startX, startY, endX, endY) {
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0
    if (!str) {
        loge("未传入待找字符串,请检查参数后再使用 ocrFindStr")
        return false
    }
    if (!gScreen) {
        loge("未检测到截图,请截图后再使用ocrFindStr", str)
        gPoint = {x: -1, y: -1, top: -1, left: -1, bottom: -1, right: -1}
        return null
    }
    let tmpScreen, tmpBinaryScreen, result, isClip = false
    if (endX !== 0 && endY !== 0) {
        tmpScreen = image.clip(gScreen, startX, startY, endX, endY)
        isClip = true
    } else {
        tmpScreen = gScreen
    }
    sleep(1)
    if (laoleng.ocrConfig.needBinary) {
        tmpBinaryScreen = image.binaryzation(tmpScreen, laoleng.ocrConfig.mode, laoleng.ocrConfig.threshold)
        if (isClip) {
            image.recycle(tmpScreen)
        }
        result = ocr.ocrImage(tmpBinaryScreen, laoleng.ocrConfig.timeOut, laoleng.ocrConfig.extra)
        image.recycle(tmpBinaryScreen)
    } else {
        result = ocr.ocrImage(tmpScreen, laoleng.ocrConfig.timeOut, laoleng.ocrConfig.extra)
        if (isClip) {
            image.recycle(tmpScreen)
        }
    }
    if (result) {
        for (let i = 0; i < result.length; i++) {
            if (!result[i].label) {
                continue
            }
            if (result[i].label.indexOf(str) > -1) {
                gPoint.left = result[i].x
                gPoint.top = result[i].y
                gPoint.right = result[i].x + result[i].width
                gPoint.bottom = result[i].y + result[i].height
                gPoint.x = ~~((result[i].x * 2 + result[i].width) / 2)
                gPoint.y = ~~((result[i].y * 2 + result[i].height) / 2)
                gPoint.label = result[i].label
                if (endX !== 0 && endY !== 0) {
                    gPoint.left += startX
                    gPoint.top += startY
                    gPoint.right += startX
                    gPoint.bottom += startY
                    gPoint.x += startX
                    gPoint.y += startY
                }
                return gPoint
            }
        }
    }
    gPoint = {x: -1, y: -1, top: -1, left: -1, bottom: -1, right: -1}
    return null
}

/**
 * @description 识别范围内文本内容
 * @param startX {Number?} 范围起始X坐标,默认0全屏
 * @param startY {Number?} 范围起始Y坐标,默认0全屏
 * @param endX {Number?} 范围结束X坐标,默认0全屏
 * @param endY {Number?} 范围结束Y坐标,默认0全屏
 * @return {Array} 返回识别到的文本数组
 */
function ocrText(startX, startY, endX, endY) {
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0

    if (!gScreen) {
        loge("未检测到截图,请截图后再使用ocrText")
        return null
    }
    let tmpScreen, tmpBinaryScreen, result, isClip = false
    if (endX !== 0 && endY !== 0) {
        tmpScreen = image.clip(gScreen, startX, startY, endX, endY)
        isClip = true
    } else {
        tmpScreen = gScreen
    }
    sleep(1)
    if (laoleng.ocrConfig.needBinary) {
        tmpBinaryScreen = image.binaryzation(tmpScreen, laoleng.ocrConfig.mode, laoleng.ocrConfig.threshold)
        if (isClip) {
            image.recycle(tmpScreen)
        }
        result = ocr.ocrImage(tmpBinaryScreen, laoleng.ocrConfig.timeOut, laoleng.ocrConfig.extra)
        image.recycle(tmpBinaryScreen)
    } else {

        result = ocr.ocrImage(tmpScreen, laoleng.ocrConfig.timeOut, laoleng.ocrConfig.extra)
        if (isClip) {
            image.recycle(tmpScreen)
        }
    }
    if (result) {
        let textArr = []
        for (let i = 0; i < result.length; i++) {
            if (!result[i].label) {
                continue
            }
            textArr.push(result[i].label)
        }
        return textArr
    }

    return null
}

/**
 * @description OCR普通识别,支持范围识别
 * @param startX {Number?} 范围起始X坐标,默认0全屏
 * @param startY {Number?} 范围起始Y坐标,默认0全屏
 * @param endX {Number?} 范围结束X坐标,默认0全屏
 * @param endY {Number?} 范围结束Y坐标,默认0全屏
 * @return {Array} 跟官方OCR一致
 */
function ocrNormal(startX, startY, endX, endY) {
    startX = startX || 0
    startY = startY || 0
    endX = endX || 0
    endY = endY || 0
    if (!gScreen) {
        loge("未检测到截图,请截图后再使用ocrNormal")
        return null
    }
    let tmpScreen, tmpBinaryScreen, result, isClip = false
    if (endX !== 0 && endY !== 0) {
        tmpScreen = image.clip(gScreen, startX, startY, endX, endY)
        isClip = true
    } else {
        tmpScreen = gScreen
    }
    sleep(1)
    if (laoleng.ocrConfig.needBinary) {
        tmpBinaryScreen = image.binaryzation(tmpScreen, laoleng.ocrConfig.mode, laoleng.ocrConfig.threshold)
        if (isClip) {
            image.recycle(tmpScreen)
        }
        result = ocr.ocrImage(tmpBinaryScreen, laoleng.ocrConfig.timeOut, laoleng.ocrConfig.extra)
        image.recycle(tmpBinaryScreen)
    } else {
        result = ocr.ocrImage(tmpScreen, laoleng.ocrConfig.timeOut, laoleng.ocrConfig.extra)
        if (isClip) {
            image.recycle(tmpScreen)
        }
    }
    if (result) {
        if (endX !== 0 && endY !== 0) {
            for (let i = 0; i < result.length; i++) {
                if (!result[i].label) {
                    continue
                }
                //坐标修正
                result[i].x += startX
                result[i].y += startY
            }
        }
        return result
    }
    return null
}

/**
 * @description 坐标是否在范围内
 * @param startX {number} 范围起始X
 * @param startY {number} 范围起始Y
 * @param endX {number} 范围结束X
 * @param endY {number} 范围结束Y
 * @param pointX {number} 坐标X
 * @param pointY {number} 坐标Y
 * @return {boolean} 是/否
 */
function isInArea(startX, startY, endX, endY, pointX, pointY) {
    return pointX > startX && pointX < endX && pointY > startY && pointY < endY
}

laoleng.app = {}
/**
 * @description 打开app设置页
 * @param {String} pkgName 包名
 * @return {Boolean} true/false
 */
laoleng.app.openAppSetting = function (pkgName) {
    return utils.openActivity({
        "action": "android.settings.APPLICATION_DETAILS_SETTINGS",
        "uri": "package:" + pkgName
    })
}
/**
 * @description shell强制关闭app
 * @param {String} pkgName 包名
 * @return {Boolean} true/false
 */
laoleng.app.forceKillApp = function (pkgName) {
    return !!shell.execCommand("am force-stop " + pkgName)
}
/**
 * @description shell清理app数据
 * @param {String} pkgName 包名
 */
laoleng.app.cleanApp = function (pkgName) {
    shell.execCommand("pm clear  " + pkgName)
}
/**
 * @description 包名是否在前台
 * @param pkgName{string} 包名
 * @return {boolean} true/false
 */
laoleng.app.isRunningPkg = function (pkgName) {
    return !!pkg(pkgName).getOneNodeInfo(0)
}

/**
 * @description 无障碍关闭app数据[华为/小米]
 * @param {String} pkgName 包名
 * @return {Boolean} true/false
 */
laoleng.app.accKillApp = function (pkgName) {
    logi(">>accKillApp")
    homes()
    this.openAppSetting(pkgName)
    sleep(1000)
    let timeOut = 0
    while (true) {
        keepNode()
        if (findNode(textMatch("^强行停止$|^强行结束$|^结束运行$"))) {
            logd("强行停止")
            if (g_ret.enabled) {
                findClickEx()
                timeOut++
                if (timeOut >= 5) {
                    backs()
                    releaseNode()
                    return false
                }
            } else {
                backs()
                releaseNode()
                return true
            }
        } else if (findNode(text("确定"), true)) {
            logd("确定")
        } else if (findNode(desc("打开设置。").pkg("com.android.systemui"))) {
            logd("打开了设置框")
            backs()
        }
    }
}
/**
 * @description 获取apk图标bitmap
 * @param pkgName {string} apk包名
 * @return {ImageBitmap}  图标bitmap
 */
laoleng.app.getBitmap = function (pkgName) {
    let packageManager, applicationInfo
    try {
        packageManager = context.getApplicationContext().getPackageManager()
        applicationInfo = packageManager.getApplicationInfo(pkgName, 0)
    } catch (e) {
        return null
    }
    return packageManager.getApplicationIcon(applicationInfo).getBitmap()
}
/**
 * @description 通过应用名获取包名
 * @param appName{string?} 应用名
 * @return {string|null}
 */
laoleng.app.getPackageName = function (appName) {
    if (!appName) return context.getPackageName()
    let packageManager = context.getPackageManager()
    let installedApplications = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
    for (let i = 0; i < installedApplications.length; i++) {
        if (packageManager.getApplicationLabel(installedApplications[i]) + "" === appName) {
            return installedApplications[i].packageName + ""
        }
    }
    return null
}

/**
 * @description 通过包名获取应用名
 * @param packageName{string?}包名,可空,默认返回当前脚本名
 * @returns {null|string}
 */
laoleng.app.getAppName = function (packageName) {
    packageName = packageName || context.getPackageName() + ""
    let packageManager = context.getPackageManager()
    try {
        let applicationInfo = packageManager.getApplicationInfo(packageName, 0)
        let appName = packageManager.getApplicationLabel(applicationInfo)
        return appName == null ? null : appName.toString()
    } catch (e) {
        return null
    }
}

/**
 * @description 获取已安装的三方应用包名
 * @returns {[string]}
 */
laoleng.app.getInstalledPkgName = function () {
    let packageManager = context.getPackageManager()
    let installedApplications = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
    let listAppName = []
    for (let i = 0; i < installedApplications.length; i++) {
        if ((installedApplications[i].flags & ApplicationInfo.FLAG_SYSTEM) <= 0) {
            listAppName.push(installedApplications[i].packageName + "")
        }
    }
    return listAppName
}
/**
 * @description 获取已安装的三方应用名
 * @returns {[string]}
 */
laoleng.app.getInstalledAppName = function () {
    let packageManager = context.getPackageManager()
    let installedApplications = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
    let listAppName = []

    for (let i = 0; i < installedApplications.length; i++) {
        if ((installedApplications[i].flags & ApplicationInfo.FLAG_SYSTEM) <= 0) {
            listAppName.push(packageManager.getApplicationLabel(installedApplications[i]).toString() + "")
        }
    }
    return listAppName
}

/**
 * @description 获取脚本自身内存占用
 * @return {number} MB
 */

laoleng.app.getSelfMemory = function () {
    let memoryInfo = new Debug.MemoryInfo()
    Debug.getMemoryInfo(memoryInfo)
    // return memoryInfo.getTotalPrivateDirty()
    return (memoryInfo.getTotalPss() / 1024).toFixed(2)
}
/**
 * @description 获取app的安装路径
 * @param packageName{string?} 包名,可空
 * @returns {*}
 */
laoleng.app.getInstallPath = function (packageName) {
    packageName = packageName || context.getPackageName()
    return context.getPackageManager().getApplicationInfo(
        packageName, PackageManager.GET_UNINSTALLED_PACKAGES).dataDir
}


/**
 * @description 数组方法
 * @type {{}}
 */
laoleng.arr = {}
/**
 * @description 数组去重,函数方法
 * @param arr {any[]} 待去重数组
 * @return {any[]} 去重后数组
 */
laoleng.arr.unique = function (arr) {
    return Array.from(new Set(arr))
}

/**
 * @description 数组去重,原型方法
 */
Array.prototype.unique = function () {
    let tmpS = new Set(this), i = 0
    for (let tmp of tmpS) {
        this[i] = tmp
        i++
    }
    this.length = i
}

/**
 * @description 初始化一个数字数组
 * @param start {number} 开始值
 * @param end {number} 结束值
 * @returns {null|number[]}
 */
laoleng.arr.initNumArr = function (start, end) {
    if (start > end) {
        return null
    }
    let tmpArr = []
    for (let i = start; i <= end; i++) {
        tmpArr.push(i)
    }
    return tmpArr
}
laoleng.Alert = {}
/**
 * @description 暂停脚本并弹窗提示
 * @param title {string} 标题
 * @param msg {string?}  内容 可空,默认标题
 * @return {boolean} 选择了是/否
 */
laoleng.Alert.dialog = function (title, msg) {
    msg = msg || title
    let p = {
        "title": title,
        "msg": msg,
        "cancelable": false,
        "cancelText": "否",
        "okText": "是"
    }
    let a = 0
    ui.alert(p,
        function (dialog) {
            //让对话消失掉
            dialog.doDismiss()
            a = 1
            return true
        },
        function (dialog) {
            //让对话消失掉
            dialog.doDismiss()
            a = 2
            return true
        },
        function () {
            return true
        })
    while (a === 0) {
        sleep(200)
    }
    return a === 1
}
/**
 *@description 暂停脚本并弹窗等待输入
 * @param title{string}  标题
 * @param msg {string}?  内容 可空,默认标题
 * @return {string} 输入的内容
 */
laoleng.Alert.input = function (title, msg) {
    msg = msg || title
    let p = {
        "title": title,
        "msg": msg,
        "cancelable": false,
        "cancelText": "否",
        "okText": "是"
    }
    let text_ret = ""
    let a = 0
    ui.inputDialog(p,
        function (dialog, v, text) {
            //让对话消失掉
            dialog.doDismiss()
            a = 1
            text_ret = text
            return true
        },
        function (dialog) {
            //让对话消失掉
            dialog.doDismiss()
            a = 2
            return true
        },
        function () {
            a = 2
            return true
        })
    while (a === 0) {
        sleep(200)
    }
    return text_ret + ""
}

laoleng.Bytes = {}
/**
 * @description base64解密,返回bytes
 * @param {String} str "YWJj"
 * @return {bytes[]} bytes
 */
laoleng.Bytes.base64Decode = function (str) {
    return Base64.decode(str, Base64.DEFAULT)
}
/**
 * @description 对bytes进行base64加密,返回base64结果
 * @param {bytes[]} bytes [B@8a3bd58 待加密的字节集
 * @return {String} base64编码文字 "YWJj"
 */
laoleng.Bytes.base64Encode = function (bytes) {
    return Base64.encodeToString(bytes, Base64.DEFAULT)
}
/**
 * @description 创建空的bytes字节数组
 * @param {number} length 数组长度,默认10
 * @return {bytes[]} 空的bytes字节数组
 */
laoleng.Bytes.createBytes = function (length) {
    length = length || 10
    if (length > 127) length = 127
    let bytes = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, length)
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = i
    }
    return bytes
}


/**
 * @description Date 时间类
 * Format 时间格式化
 * getTimeStamp 获取时间戳
 */
laoleng.Date = {}

/**
 * @description Format 为Date时间类加入格式化功能
 * @param {string?} fmt 时间格式 默认 yyyy/MM/dd hh:mm:ss
 * @return {string} 格式化后的时间
 */
Date.prototype.Format = function (fmt) {
    fmt = fmt || "yyyy/MM/dd hh:mm:ss"
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    }
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
    return fmt
}

/**
 * @description getTimeStamp 获取时间戳
 * @param {String?} time 时间/可为空 2020-06-20 16:16:34或 2020/06/20 16:16:34
 * @return {number} 10位时间戳
 */
laoleng.Date.getTimeStamp = function (time) {
    if (time) {
        return ~~(String((new Date(time.replace(/-/g, '/')))
            .getTime()).slice(0, -3))
    } else {
        return ~~(String((new Date()).getTime()).slice(0, -3))
    }

}
/**
 * @description getTimeStamp 获取13位时间戳
 * @param {String?} time 时间/可为空 2020-06-20 16:16:34或 2020/06/20 16:16:34
 * @return {number} 13位时间戳
 */
laoleng.Date.getTimeStamp13 = function (time) {
    if (time) {
        return new Date(time.replace(/-/g, '/')).getTime()
    } else {

        return new Date().getTime()
    }
}
/**
 * @description 时间戳转时间
 * @param timestamp {number} 时间戳
 * @return {string} 时间
 */
laoleng.Date.timestampToTime = function (timestamp) {
    if ((timestamp + "").length === 10) {
        timestamp = timestamp * 1000
    }
    let date = new Date(timestamp)//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    //Y + M + D + h + m + s
    return date.getFullYear() + '-'
        + (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
        + date.getDate() + ' '
        + date.getHours() + ':'
        + date.getMinutes() + ':'
        + date.getSeconds()
}

/**
 * @description laoleng设备类
 */
laoleng.Device = {}
/**
 * @description 获取设备横竖屏方向
 * @return {Boolean} true 竖屏 false 横屏
 */
laoleng.Device.isRotate = function () {
    return !(context.getResources().getConfiguration().orientation === android.content.res.Configuration.ORIENTATION_PORTRAIT)
}
/**
 * @description 获取屏幕旋转角度
 * @return {number} 屏幕旋转角度0/90/180/270
 */
laoleng.Device.getRotationAngle = function () {
    return context.getSystemService(Context.WINDOW_SERVICE).defaultDisplay.rotation * 90
}

laoleng.Device.lockDevice = function () {
    let devicePolicyManager = context.getSystemService("device_policy")
    //若未注册设备管理器，跳转到配置界面
    if (!devicePolicyManager.isAdminActive(ComponentName(context, "com.gibb.cloud.admin.AdminReceiver"))) {
        utils.openActivity({
            pkg: "com.android.settings",
            className: "com.android.settings.DeviceAdminSettings"
        })
        return false
    } else {
        devicePolicyManager.lockNow()
    }
    return true
}
/**
 * @description 设备是否是模拟器
 * @return {Boolean} true 模拟器 false 非模拟器
 */
laoleng.Device.isSimulator = function () {
    return android.os.Build.CPU_ABI + "" === "x86"
}

/**
 * @作者 Mr_老鬼 QQ:1156346325
 * @函数用途   展开通知栏
 * @创建时间 14:30 2022/9/11
 **/
laoleng.Device.expandNotificationBar = function () {
    let currentApiVersion = android.os.Build.VERSION.SDK_INT
    try {
        let service = context.getSystemService("statusbar")
        let statusbarManager = java.lang.Class.forName("android.app.StatusBarManager")
        let expand = null
        if (service != null) {
            if (currentApiVersion <= 16) {
                expand = statusbarManager.getMethod("expand")
            } else {
                expand = statusbarManager
                    .getMethod("expandNotificationsPanel")
            }
            expand.setAccessible(true)
            expand.invoke(service)
        }

    } catch (e) {
        e.printStackTrace()
    }
}
/**
 * @description 获取设备网络类型
 * @return {String|null} WIFI/MOBILE/null
 */
laoleng.Device.getNetworkType = function () {
    let connectivityManager = context.getApplicationContext()
        .getSystemService(context.CONNECTIVITY_SERVICE)
    if (!connectivityManager) return false
    let info = connectivityManager.getActiveNetworkInfo()
    if (!info) return null
    let type = info.getType()
    if (type === 1) {
        return "WIFI"
    } else if (type === 0) {
        return "MOBILE"
    }
    return type
}
/**
 * @description 获取手机底部导航栏高度,必须打开过脚本才能获取
 * @return {number}
 */
laoleng.Device.getNavigationBarHeight = function () {
    let realPoint = new android.graphics.Point()
    ui.getActivity().getWindowManager().getDefaultDisplay().getRealSize(realPoint)
    let height = ui.getActivity().getWindowManager().getDefaultDisplay().getHeight()
    return realPoint.y - height
}
/**
 * @description 获取手机状态栏高度
 * @return {number}
 */
laoleng.Device.getStatusBarHeight = function () {
    let resources = context.getResources()
    return resources.getDimensionPixelSize(resources.getIdentifier("status_bar_height", "dimen", "android"))
}
/**
 * @description 获取内网/局域网IP地址
 * @return {String} 内网/局域网IP地址
 */
laoleng.Device.getIntranetIP = function () {
    let networkInterfaces = NetworkInterface.getNetworkInterfaces()
    while (networkInterfaces.hasMoreElements()) {
        let networkInterface = networkInterfaces.nextElement()
        let inetAddresses = networkInterface.getInetAddresses()
        while (inetAddresses.hasMoreElements()) {
            let inetAddress = inetAddresses.nextElement()
            if (inetAddress instanceof Inet6Address) {
                continue
            }
            if ("127.0.0.1" !== inetAddress.getHostAddress() + "") {
                return inetAddress.getHostAddress() + ""
            }
        }
    }
}

laoleng.EC = {}
/**
 * @description 初始化EC节点服务
 * @param isClose {boolean?} 是否先关闭自动化,避免存储增加,默认否
 */
laoleng.EC.init = function (isClose) {
    for (let i = 0; i < 3; i++) {
        if (isClose) closeEnv(false)
        let start = startEnv()
        logi("第" + (i + 1) + "次启动服务结果: " + start)
        if (isServiceOk()) {
            if (laoleng.EC.checkECVersion(6, 7)) {
                daemonEnv(true)
            }

            return true
        }
    }
    toast("自动化服务启动失败，无法执行脚本")
    loge("自动化服务启动失败，无法执行脚本")
    exit()
}
/**
 * @description 初始化EC图色服务
 * @param initOpenCV {boolean?} 默认开启
 * @param {number?} timeout 找图超时,默认1s
 */
laoleng.EC.initImage = function (initOpenCV, timeout) {
    timeout = timeout * 1000 || 1000
    if (initOpenCV === undefined) initOpenCV = true
    image.setInitParam({"action_timeout": timeout})
    if (initOpenCV) {
        if (laoleng.EC.checkECVersion(7, 13)) {
            if (!image.initOpenCV()) {
                loge("初始化opencv失败,结束脚本")
                exit()
            }
            laoleng.isInitImage = true
        } else {
            laoleng.isInitImage = true
        }
    }
    image.releaseScreenCapture()
    sleep(10)
    let request = image.requestScreenCapture(10000, 1)
    if (!request) {
        request = image.requestScreenCapture(10000, 1)
    }
    logi("申请截图权限结果... " + request)
    if (!request) {
        toast("申请截图权限失败,结束脚本")
        loge("申请截图权限失败,结束脚本")
        exit()
    }
    if (laoleng.EC.checkECVersion(10, 18)) {
        image.useOpencvMat(1)
    }
    sleep(1000)
}

/**
 * @description 检查各个截图功能是否正常
 * @param isSave{boolean} 是否保存到本地
 */
laoleng.EC.checkCaptureAvailable = function (isSave) {
    let cap = image.captureScreen(3, 0, 0, 0, 0)
    cap = image.imageToBitmap(cap)
    if (laoleng.images.isEmptyWhiteOrBlack(cap)) {
        loge("image.captureScreen", "截图异常")
    } else {
        logw("image.captureScreen", "截图正常,对应序号:1")
        if (isSave) {
            image.saveBitmap(cap, "png", 100, "/sdcard/1_captureScreen.png")
        }
    }
    image.recycle(cap)

    cap = image.captureFullScreen()
    cap = image.imageToBitmap(cap)
    if (laoleng.images.isEmptyWhiteOrBlack(cap)) {
        loge("image.captureFullScreen", "截图异常")
    } else {
        logw("image.captureFullScreen", "截图正常,对应序号:2")
        if (isSave) {
            image.saveBitmap(cap, "png", 100, "/sdcard/2_captureFullScreen.png")
        }
    }
    image.recycle(cap)

    cap = image.captureFullScreenEx()
    cap = image.imageToBitmap(cap)
    if (laoleng.images.isEmptyWhiteOrBlack(cap)) {
        loge("image.captureFullScreenEx", "截图异常")
    } else {
        logw("image.captureFullScreenEx", "截图正常,对应序号:3")
        if (isSave) {
            image.saveBitmap(cap, "png", 100, "/sdcard/3_captureFullScreenEx.png")
        }
    }
    image.recycle(cap)

    cap = image.captureScreenBitmap("png", 0, 0, 0, 0, 100)
    if (laoleng.images.isEmptyWhiteOrBlack(cap)) {
        loge("image.captureScreenBitmap", "截图异常")
    } else {
        logw("image.captureScreenBitmap", "截图正常,对应序号:4")
        if (isSave) {
            image.saveBitmap(cap, "png", 100, "/sdcard/4_captureScreenBitmap.png")
        }
    }
    image.recycle(cap)

    if (isAgentMode()) {
        logw("代理模式")
        cap = image.captureScreenBitmapEx()
        if (laoleng.images.isEmptyWhiteOrBlack(cap)) {
            loge("image.captureScreenBitmapEx", "截图异常")
        } else {
            logw("image.captureScreenBitmapEx", "截图正常,对应序号:5")
            if (isSave) {
                image.saveBitmap(cap, "png", 100, "/sdcard/5_captureScreenBitmapEx.png")
            }
        }
        image.recycle(cap)
        cap = image.screencapImage(false)
        cap = image.imageToBitmap(cap)
        if (laoleng.images.isEmptyWhiteOrBlack(cap)) {
            loge("image.screencapImage", "截图异常")
        } else {
            logw("image.screencapImage", "截图正常,对应序号:6")
            if (isSave) {
                image.saveBitmap(cap, "png", 100, "/sdcard/6_screencapImage.png")
            }
        }
        image.recycle(cap)

        cap = image.screencapBitmap(false)
        if (laoleng.images.isEmptyWhiteOrBlack(cap)) {
            loge("image.screencapBitmap", "截图异常")
        } else {
            logw("image.screencapBitmap", "截图正常,对应序号:7")
            if (isSave) {
                image.saveBitmap(cap, "png", 100, "/sdcard/7_screencapBitmap.png")
            }
        }
        image.recycle(cap)
    }
}
/**
 * @description 初始化开发分辨率
 * @param initX {number} 开发设备的宽值
 * @param initY {number} 开发设备的高值
 */
laoleng.EC.initScale = function (initX, initY) {
    if (!initX || !initY) {
        loge("未传入开发分辨率,停止脚本")
        exit()
    }
    this.ratioX = device.getScreenWidth() / initX
    this.ratioY = device.getScreenHeight() / initY
}
/**
 * @ 获取计算后的分辨率
 * @param x {number}x坐标
 * @param y{number} y坐标
 * @return {null|{x: number, y: number}}
 */
laoleng.EC.scale = function (x, y) {
    if (!this.ratioX) {
        loge("未初始化开发分辨率,停止脚本")
        exit()
    }
    if (!x || !y) return null
    return {
        x: ~~(x * this.ratioX),
        y: ~~(y * this.ratioY)
    }
}
/**
 * @description 初始化日志和h5 ui配置
 * @param noLog {boolean} 不需要本地日志
 */
laoleng.EC.initLogAndConfig = function (noLog) {
    if (!noLog) {
        clearLog(-1)//清除日志
        file.deleteAllFile("/sdcard/eclog/")
        let s = setSaveLog(true, "/sdcard/eclog/", 1024 * 1024)
        logd("save dir is:" + s)
    }
    let jsStr = readConfigString("jsonCfg")
    if (!jsStr) {
        laoleng.Alert.dialog("请设置并点击保存界面参数后再运行脚本")
        exit()
    }
    jsonCfg = JSON.parse(jsStr)
}
/**
 * @description 初始化Ocr
 * @param numThread {number?} 线程数,默认1,可以根据手机cpu核心数调整
 * @param padding {number?} 图片边缘拓展,小图加大此项
 * @param needBinary{boolean?} 是否使用二值化,默认true
 */
laoleng.EC.initOcr = function (numThread, padding, needBinary) {
    if (!laoleng.isInitImage) {
        loge("未初始化opencv,无法使用ocr功能")
        exit()
    }
    if (!laoleng.EC.checkECVersion(8, 2)) {
        loge("ocr功能只支持EC8.2.0之后的版本", "当前版本" + acEvent.version())
        exit()
    }
    if (laoleng.EC.checkECVersion(9, 16)) {
        if (!laoleng.ocrBaseObject) {
            laoleng.ocrBaseObject = ocr
        }
        ocr = laoleng.ocrBaseObject.newOcr()
    }
    numThread = numThread || 1
    padding = padding || 10
    logw("开始初始化Ocr服务")
    let initOcr = ocr.initOcr({"type": "ocrLite", "numThread": numThread, "padding": padding, "maxSideLen": 0})
    if (!initOcr) {
        loge("脚本终止,初始化Ocr失败: " + ocr.getErrorMsg())
        exit()
    }
    laoleng.isInitOcr = true
    if (needBinary === false) {
        laoleng.ocrConfig.needBinary = false
    }
    logw("Ocr初始化成功")
    // setStopCallback(function () {
    //     ocr.releaseAll()
    // })
}
/**
 * 初始化Mlkit OCR
 * @param rotate {number?} 旋转角度,默认0
 */
laoleng.EC.initOcrMlkit = function (rotate) {
    if (!laoleng.EC.checkECVersion(9, 11)) {
        loge("Mlkit ocr功能只支持EC9.11.0之后的版本", "当前版本" + acEvent.version())
        exit()
    }
    if (laoleng.EC.checkECVersion(9, 16)) {
        if (!laoleng.ocrBaseObject) {
            laoleng.ocrBaseObject = ocr
        }
        ocr = laoleng.ocrBaseObject.newOcr()
    }
    let initOcr = ocr.initOcr({"type": "mlkit"})
    if (!initOcr) {
        loge("脚本终止,初始化MlkitOcr失败: " + ocr.getErrorMsg())
        exit()
    }
    rotate = rotate || 0
    laoleng.isInitOcr = true
    laoleng.ocrConfig.extra = {"orz": rotate}
    laoleng.ocrConfig.ocrConfig = false
    laoleng.ocrConfig.needBinary = false
    logw("Ocr初始化成功")
}
/**
 * 初始化PaddleOcrOnline OCR参数
 * @param serverUrl {string} OCR服务器IP
 * @param extraParam {Object?} 其他参数
 */
laoleng.EC.initOcrPaddleOcrOnline = function (serverUrl, extraParam) {
    if (!laoleng.EC.checkECVersion(9, 36)) {
        loge("Mlkit ocr功能只支持EC9.36.0之后的版本", "当前版本" + acEvent.version())
        exit()
    }
    if (!laoleng.ocrBaseObject) {
        laoleng.ocrBaseObject = ocr
    }
    extraParam = extraParam || {
        "type": "paddleOcrOnline",
        "ocrType": "ONNX_PPOCR_V3",
        "padding": 50,
        "maxSideLen": 0,
        "boxScoreThresh": 0.5,
        "boxThresh": 0.3,
        "unClipRatio": 1.6,
        "doAngleFlag": 0,
        "mostAngleFlag": 0,
    }
    Object.assign(extraParam, {serverUrl: serverUrl})
    logd(JSON.stringify(extraParam))
    ocr = laoleng.ocrBaseObject.newOcr()
    let initOcr = ocr.initOcr(extraParam)
    if (!initOcr) {
        loge("脚本终止,初始化PaddleOcrOnline失败: " + ocr.getErrorMsg())
        exit()
    }
    laoleng.isInitOcr = true
    laoleng.ocrConfig.extra = {}
    laoleng.ocrConfig.ocrConfig = false
    laoleng.ocrConfig.needBinary = false
    logw("Ocr初始化成功")
}
/**
 * @description 清空ec的崩溃日志,防止过大
 */
laoleng.EC.deleteCrashLogs = function () {
    file.deleteAllFile(laoleng.app.getInstallPath() + "/files/crashlogs/")
}
laoleng.EC.checkECVersion = function (mainVersion, debugVersion) {
    return laoleng.ecVersion[0] > mainVersion || (laoleng.ecVersion[0] === mainVersion && laoleng.ecVersion[1] >= debugVersion)

}
laoleng.encode = {}

/**
 * @description 十六进制字符串转bytes数组
 * @param str {string} 十六进制字符串
 * @return bytes数组{bytes[]}bytes数组
 */
laoleng.encode.HexStrToBytes = function (str) {
    let data = java.lang.String(str).toLowerCase()
    let len = data.length()
    let byteObj = java.io.ByteArrayOutputStream()
    let pos = 0
    for (let i = 0; i < len; i++) {
        if (pos > len - 1) {
            return byteObj.toByteArray()
        }
        byteObj.write((java.lang.Character.digit(data.charAt(pos), 16) & 0xFF) << 4 | (java.lang.Character.digit(data.charAt(pos + 1), 16) & 0xFF))
        pos = pos + 2
    }
    return byteObj.toByteArray()
}
/**
 * @description bytes数组转十六进制字符串
 * @param byteArray{bytes[]} bytes数组
 * @return {string|null} 十六进制字符串
 */
laoleng.encode.bytesToHexStr = function (byteArray) {
    let HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    if (byteArray === null) {
        return null
    }
    let hexChars = ""
    let v = null
    for (let j = 0; j < byteArray.length; j++) {
        v = byteArray[j] & 0xFF
        hexChars += HEX_CHARS[v >>> 4] + HEX_CHARS[v & 0x0F]
    }
    return (hexChars)
}
/**
 * @description 字符串转bytes
 * @param {String} str 源字符串 "abc"
 * @return {bytes[]} bytes [B@8a3bd58
 */
laoleng.encode.stringToBytes = function (str) {
    return new java.lang.String(str).getBytes()
}
/**
 * @description bytes转字符串
 * @param {bytes[]} bytes [B@8a3bd58
 * @return {String} string  "abc"
 */
laoleng.encode.byteToString = function (bytes) {
    return (new java.lang.String(bytes)) + ""
}

/**
 * @description base64加密
 * @param {String} str "abc"
 * @return {String} string "YWJj"
 */
laoleng.encode.base64Encode = function (str) {
    return Base64.encodeToString(this.stringToBytes(str), Base64.NO_WRAP) + ""
}
/**
 * @description base64解密,返回字符串
 * @param {String} str "YWJj"
 * @return {String} string "abc"
 */
laoleng.encode.base64Decode = function (str) {
    return this.byteToString(Base64.decode(str, Base64.NO_WRAP))
}
/**
 * 解码 URL Safe base64 -> base64
 * @description: URL Safe base64
 * '-' -> '+'
 * '_' -> '/'
 * 字符串长度%4,补'='
 * @param {string} base64Str
 * @return: Base64 string;
 */
laoleng.encode.urlSafeBase64Decode = function (base64Str) {
    if (!base64Str) return false
    let safeStr = base64Str.replace(/-/g, '+').replace(/_/g, '/')
    let num = safeStr.length % 4
    return safeStr + '===='.substring(0, num)
}


laoleng.face = {}
/**
 * @description 随机抖音表情
 * @param num{number?} 个数,默认一个
 * @return {string}  随机抖音表情
 */
laoleng.face.dy = function (num) {
    num = num || 1
    let str = ["[一起加油]", "[戴口罩]", "[勤洗手]", "[iloveyou]", "[巧克力]", "[戒指]", "[微笑]", "[色]", "[酷拽]", "[抠鼻]", "[流泪]",
        "[呲牙]", "[睡]", "[害羞]", "[调皮]", "[晕]", "[衰]", "[闭嘴]", "[机智]", "[赞]", "[鼓掌]", "[感谢]", "[哈欠]", "[大笑]", "[打脸]",
        "[耶]", "[灵机一动]", "[来看我]", "[送心]", "[困]", "[疑问]", "[泣不成声]", "[小鼓掌]", "[大金牙]", "[偷笑]", "[思考]", "[吐血]",
        "[可怜]", "[嘘]", "[撇嘴]", "[坏笑]", "[憨笑]", "[得意]", "[奸笑]", "[笑哭]", "[尴尬]", "[抓狂]", "[泪奔]", "[钱]", "[亲亲]",
        "[恐惧]", "[愉快]", "[快哭了]", "[翻白眼]", "[我想静静]", "[委屈]", "[舔屏]", "[鄙视]", "[不失礼貌的微笑]", "[绝望的凝视]", "[拥抱]",
        "[紫薇别走]", "[再见]", "[飞吻]", "[吐舌]", "[绿帽子]", "[吃瓜群众]", "[不看]",
        "[皱眉]", "[红脸]", "[尬笑]", "[擦汗]", "[强]", "[如花]", "[大哭]", "[加好友]", "[嘿哈]", "[惊恐]", "[囧]", "[难过]", "[斜眼]", "[比心]", "[悠闲]",
        "[阴险]", "[OK]", "[勾引]", "[拳头]", "[胜利]", "[嘴唇]", "[给力]", "[爱心]", "[心碎]", "[玫瑰]", "[18禁]", "[玫瑰]", "[蛋糕]"]
    let tmp = ""
    for (let i = 0; i < num; i++) {
        tmp += str[random(0, 95)]
    }
    return tmp
}
/**
 * @description emoji随机表情
 * @param num {number?} 个数,默认一个
 * @return {string} emoji随机表情
 */
laoleng.face.emoji = function (num) {
    num = num || 1
    let str = ["💟", "💯", "💢", "💫", "💥", "💦", "💨", "💣", "💤", "🏻", "🏼",
        "🏽", "⚓", "♠", "♥", "♦", "♣", "🀄", "💹", "💱", "💲", "🔗", "🏧", "🚮", "🚰",
        "🛅", "🛄", "🛂", "🛃", "🚾", "🚼", "🚻", "🚺", "🚹", "♿", "🛐", "🕉", "⚛",
        "✡", "☸", "☯", "✝", "☦", "☪", "☮", "🕎", "🔯", "♈", "⛎", "♓", "♒",
        "♑", "♐", "♏", "♎", "♍", "♌", "♋", "♊", "♉", "🔴", "🔵", "⚫", "⚪",
        "⬛", "⬜", "◼", "◻", "◾", "◽", "▪", "▫", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠",
        "🔘", "👾", "💭", "💅", "👂", "🧠", "👀", "👁", "🛀", "🛌", "👣", "🥄", "🔪", "🏺", "🗺",
        "🗾", "🎠", "☔", "☂", "🌂", "🌡", "🕰", "⏰", "⏰", "⌚", "⏳", "⌛", "🛸", "🛎", "🚀",
        "🛰", "🎪", "💈", "💈", "🎢", "🎡", "⛱", "⚡", "🎃", "🎄", "🎆", "🎇", "🎈", "🎉", "🎉",
        "🎏", "🎐", "🎑", "🎁", "🎀", "🎗", "🎟", "🎫", "🧦", "🧤", "🧥", "🧣", "👖", "👕", "👔",
        "👓", "🎨", "🎨", "🖼", "🎭", "🎴", "🎴", "🎰", "🕹", "🎮", "🔮", "👗", "👘", "👙", "👚",
        "👛", "👜", "👝", "👞", "👟", "👠", "👢", "👡", "👑", "👒", "🎩", "🎓", "🧢", "🎙", "🎶",
        "🎵", "🎼", "🔕", "🔔", "📯", "📣", "📢", "🔊", "🔉", "🔈", "🔇", "💎", "💍", "💄", "📿", "🎚",
        "🎛", "🎤", "🎧", "📻", "🎷", "🎸", "🎹", "🎹", "🎻", "🥁", "📱", "📲", "☎", "📞", "📟", "📠",
        "💟", "💯", "💢", "💫", "💥", "💦", "💨", "💣", "💤", "🏻", "🏼", "🏽", "⚓", "♠", "♥", "♦", "♣",
        "🀄", "💹", "💱", "💲", "🔗", "🏧", "🚮", "🚰", "🛅", "🛄", "🛂", "🛃", "🚾", "🚼", "🚻", "🚺", "🚹",
        "♿", "🛐", "🕉", "⚛", "✡", "☸", "☯", "✝", "☦", "☪", "☮", "🕎", "🔯", "♈", "⛎", "♓", "♒",
        "♑", "♐", "♏", "♎", "♍", "♌", "♋", "♊", "♉", "🔴", "🔵", "⚫", "⚪", "⬛", "◼",
        "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠", "🔘",
        "😁", "😂", "😃", "😄", "👿", "😉", "😊", "😌", "😍", "😏", "😒", "😓", "😔", "😖", "😘", "😚", "😜",
        "😝", "😞", "😠", "😡", "😢", "😣", "😥", "😨", "😪", "😭", "😰", "😲", "😳", "😷", "🙃", "😋", "💆",
        "👫", "💑", "👆", "👇", "👈", "👉", "👌", "✌", "👊", "✊",
        "😗", "😛", "🤑", "🤓", "😎", "🤗", "🙄", "🤔", "😩", "😤", "🤐", "🤒", "😴", "👶", "👦", "👨", "👫",
        "👲", "👳", "👴", "👵", "👷", "💂", "👻", "💩", "💀", "👽", "👾", "💁", "🙅", "🙆", "💏", "🙌", "👏",
        "👂", "👀", "👃", "👄", "💅", "👋", "👍", "👎", "💪", "👐",
        "😁", "😂", "😃", "😄", "👿", "😉", "😊", "😌", "😍", "😏", "😒", "😓", "😔", "😖", "😘", "😚", "😜",
        "😝", "😞", "😠", "😡", "😢", "😣", "😥", "😨", "😪", "😭", "😰", "😲", "😳", "😷", "🙃", "😋", "👫",
        "💑", "👆", "👇", "👈", "👉", "👌", "✌", "👊", "✊", "😗", "😛", "🤑", "🤓", "😎", "🙄", "🤔", "😩", "😤",
        "🤐", "🤒", "😴", "👶", "👦", "👨", "👫", "👻", "💩", "💀", "👽", "👾", "💁", "🙅", "🙆", "💏", "🙌", "👏",
        "👂", "👀", "👃", "👄", "💅", "👋", "👍", "👎", "💪", "👐",
        "😁", "😂", "😃", "😄", "👿", "😉", "😊", "😌", "😍", "😏", "😒", "😓", "😔", "😖", "😘"]
    let tmp = "", len = str.length - 1
    for (let i = 0; i < num; i++) {
        tmp += str[random(0, len)]
    }
    return tmp
}
/**
 * @description 连信随机表情
 * @param num {number?} 个数,默认1
 * @return {string} 连信随机表情
 */
laoleng.face.lx = function (num) {
    num = num || 1
    let str = ["[微笑]", "[笑cry]", "[龇牙]", "[色]", "[尴尬]", "[握手]", "[玫瑰]", "[大哭]", "[思考]", "[害羞]",
        "[偷笑]", "[囧]", "[愉快]", "[发呆]", "[得意]", "[疑问]", "[拥抱]", "[憨笑]", "[委屈]", "[惊讶]", "[咖啡]",
        "[傲慢]", "[抓狂]", "[睡]", "[强]", "[捂脸]", "[白眼]", "[敲打]", "[嘴唇]", "[怒]", "[坏笑]", "[爱心]",
        "[勾引]", "[比心]", "[闭嘴]", "[不看]", "[嘘]", "[奋斗]", "[想吃]", "[爱你]", "[流汗]", "[拜拜]",
        "[不听]", "[吐]", "[惊恐]", "[摊手]", "[阴险]", "[抠鼻]", "[左哼哼]", "[合十]", "[鄙视]", "[悠闲]",
        "[呃]", "[喜]", "[加油]", "[狗]", "[药丸]", "[鞭炮]", "[礼物]", "[喝彩]", "[NO]", "[弱]", "[兔子]",
        "[差劲]", "[拳头]", "[话筒]", "[下雨]", "[草泥马]", "[肥皂]", "[熊猫]", "[浮云]", "[打脸]", "[胜利]",
        "[爱钱]", "[抱拳]", "[擦汗]", "[猫]", "[气球]", "[晕]", "[快哭了]", "[摸头]", "[干杯]", "[心碎]", "[哈欠]",
        "[右哼哼]", "[凋谢]", "[撇嘴]", "[菜刀]", "[衰]", "[炸弹]", "[酷]", "[月亮]", "[棒棒糖]", "[猪头]", "[骷髅]",
        "[太阳]", "[啤酒]", "[红包]", "[券红包]", "[蛋糕]", "[感冒]", "[便便]"]

    let tmp = "", len = str.length - 1
    for (let i = 0; i < num; i++) {
        tmp += str[random(0, len)]
    }
    return tmp
}

laoleng.files = {}

/**
 * @description 写入文本到文件
 * @param {String} fileName 文件名
 * @param {String} data 写入内容
 * @param {String?} encoding 编码
 * @return {boolean}
 */
laoleng.files.writeFile = function (fileName, data, encoding) {

    try {
        let op = new FileOutputStream(new File(fileName))
        op.write(new java.lang.String(data).getBytes(encoding ? encoding : "utf-8"))
        op.close()
        return true
    } catch (e) {
        loge("writeFile:" + e)
        return false
    }
}

/**
 * @description 写入bytes字节集到文本
 * @param {String} fileName 文件名
 * @param {bytes[]} bytes bytes字节流
 * @param {Boolean?} append 是否追加模式,默认不追加
 * @return {boolean}
 */
laoleng.files.writeFileBytes = function (fileName, bytes, append) {

    let out = null
    append = append || false//append必须给参数,不然报错
    try {
        out = new BufferedOutputStream(new FileOutputStream(fileName, append))
        out.write(bytes)
        out.close()
        return true
    } catch (e) {
        loge("writeFileBytes" + e)
    } finally {
        if (out != null) {
            out.close()
        }
    }
    return false
}
/**
 * @description 读取文本bytes数据
 * @param {String} filePath 文件路径
 * @return {bytes[]} 文本bytes数据
 */
// 老写法,nio必须安卓8+
// laoleng.files.readFileBytes = function (fileName) {
//
//     try {
//         let f = new File(fileName)
//         let channel, fs
//         fs = new FileInputStream(f)
//         channel = fs.getChannel()
//         let byteBuffer = ByteBuffer.allocate(channel.size())
//         while ((channel.read(byteBuffer)) > 0) {
//         }
//         fs.close()
//         channel.close()
//         return byteBuffer.array()
//     } catch (e) {
//         return null
//     }
// }
// 新写法,兼容安卓5
laoleng.files.readFileBytes = function (filePath) {
    let fis = null
    try {
        fis = new FileInputStream(filePath)
        // 创建一个足够大的缓冲区
        let buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, fis.available())
        // 读取文件内容到缓冲区
        let bytesRead = fis.read(buffer, 0, buffer.length)
        // 如果文件大小小于缓冲区大小，则需要调整数组大小
        if (bytesRead !== -1) {
            let result = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, bytesRead)
            java.lang.System.arraycopy(buffer, 0, result, 0, bytesRead)
            return result
        }
        // 如果文件为空，返回null
        return null
    } finally {
        // 关闭FileInputStream
        if (fis != null) {
            fis.close()
        }
    }
}


/**
 * @description 读取文件到Base64数据
 * @param {String} fileName 文件名
 * @return {String} 文件的Base64数据
 */
laoleng.files.readFileBase64 = function (fileName) {
    return Base64.encodeToString(this.readFileBytes(fileName), Base64.DEFAULT) + ""
}
/**
 * @description 写入Base64数据到文件
 * @param {String} fileName 文件名
 * @param {String} base64 Base64数据
 * @return {boolean} true/false
 */
laoleng.files.writeFileBase64 = function (fileName, base64) {
    return this.writeFileBytes(fileName, Base64.decode(base64, Base64.DEFAULT), false)
}
/**
 * @description 移动或重命名文件
 * @param {String} srcPath 初始文件名
 * @param {String} desPath 目标文件名
 * @return {boolean}true/false
 */
laoleng.files.moveOrRenameFile = function (srcPath, desPath) {
    try {
        new File(srcPath).renameTo(new File(desPath))
        return true
    } catch (e) {
        logd(e)
    }
    return false
}
/**
 * @description 获取文件行数
 * @param {String} filePath 文件名
 * @return {number} 文件行数
 */
laoleng.files.getLineNumber = function (filePath) {
    let content = file.readAllLines(filePath)
    return content ? content.length : 0
}
/**
 * @description root模式下读取文件
 * @param path{string} 文件路径
 * @return {string} 字符串
 */
laoleng.files.readFileByRoot = function (path) {
    return shell.sudo("cat " + path)
}
/**
 * @description root模式下覆盖写入文件
 * @param path{string} 文件路径
 * @param data{string} 写入数据
 */
laoleng.files.writeFileByRoot = function (path, data) {
    shell.sudo("echo '" + data + "' >" + path)
}
/**
 * @description root模式下覆盖写入文件2
 * @param path{string} 文件路径
 * @param data{string} 写入数据
 */
laoleng.files.writeFileByRoot2 = function (path, data) {
    shell.sudo("print '" + data + "' >" + path)
}
/**
 * @description root模式下覆盖写入文件3,写入末尾不带换行
 * @param path{string} 文件路径
 * @param data{string} 写入数据
 */
laoleng.files.writeFileByRoot3 = function (path, data) {
    shell.sudo("echo -e '" + data + "\\c'  >" + path)
}
/**
 * @description root模式下追加写入文件
 * @param path{string} 文件路径
 * @param data{string} 写入数据
 */
laoleng.files.appendFileByRoot = function (path, data) {
    shell.sudo("echo '" + data + "' >>" + path)
}
/**
 * @description 复制目录或文件,root模式
 * @param src {string} 起始路径
 * @param dst {string} 目标路径
 */
laoleng.files.copyByRoot = function (src, dst) {
    shell.sudo("cp -rf " + src + " " + dst)
}

/**
 * @description 移动目录或文件,root模式
 * @param src {string} 起始路径
 * @param dst {string} 目标路径
 */
laoleng.files.moveByRoot = function (src, dst) {
    shell.sudo("mv -f " + src + " " + dst)
}

/**
 * @description 删除目录或文件,root模式
 * @param path {string} 路径
 */
laoleng.files.delByRoot = function (path) {
    shell.sudo("rm -rf " + path)
}

/**
 * @description 创建目录,支持多级创建,root模式
 * @param path {string} 目录路径
 */
laoleng.files.creatDirByRoot = function (path) {
    shell.sudo("mkdir -p " + path)
}

/**
 * @description 获取文件/文件夹最后修改时间,root模式
 * @param path {string} 路径
 * @return {number} 时间戳
 */
laoleng.files.lastModifyByRoot = function (path) {
    return ~~(shell.sudo("stat -c %Y " + path))
}
/**
 * @description 遍历文件夹,root模式
 * @param path{String} 目录路径, 在该目录路径下进行遍历文件或目录
 * @param name {String?} 文件名或目录名, 可选, 要遍历的文件名或目录名, 支持通配符?*, 省略默认为"*"
 * @param types {number?} 遍历类型, 可选, 1代表只遍历文件, 2代表只遍历目录, 3代表文件与目录都要遍历, 省略默认为3
 * @param depths {number?} 遍历深度, 可选, 遍历目录深度, -1表示无限制, 省略默认为-1
 * @param cases {boolean?} 是否区分大小写, 可选, 省略默认为false, 表示不区分大小写
 * @return {null|string[]}
 */
laoleng.files.dirScanByRoot = function (path, name, types, depths, cases) {
    name = name || "*"
    let params = []
    if (cases) {
        params.push("-name '" + name + "'")
    } else {
        params.push("-iname '" + name + "'")
    }
    types = types || 3
    if (types === 1) {
        params.push("-type f")
    } else if (types === 2) {
        params.push("-type d")
    }
    depths = depths || -1
    if (depths > 0) {
        params.push("-maxdepth " + depths)
    }
    let result = shell.sudo("find " + path + " -mindepth 1 " + params.join(" "))
    if (result) {
        return result.split("\n")
    }
    return null
}

/**
 * @description 判断是否为文件或者文件夹,root模式
 * @param path {string} 路径
 * @return {number} 1为文件夹,2为文件,0为路径错误
 */
laoleng.files.isFileOrDirByRoot = function (path) {
    let ret = shell.sudo("ls -ld " + path)
    if (ret) {
        //d
        if (ret.substr(0, 1) === "d") {
            return 1
        } else { //-
            return 2
        }
    }
    return 0
}
// laoleng.gbk = {}

/**
 * @description laoleng http类
 */
laoleng.http = {}
/**
 * @description httpGet
 * @param {String} url 请求链接
 * @param {Object?} params 请求参数{"a":1}
 * @param {String?} dataType 默认json string/json
 * @param {number?} timeout 请求超时 默认 10秒
 * @param {Object?} headers  UA {"a":1}
 * @return {JSON|null|string}
 */
laoleng.http.get = function (url, params, dataType, timeout, headers) {
    timeout = timeout * 1000 || 10 * 1000
    dataType = dataType || "json"
    let data = null
    try {
        data = http.httpGet(url, params, timeout, headers)
        //logd(data);
        if (data) {
            // if (data === "404 page not found") {
            //     return false
            // }
            switch (dataType) {
                case "string":
                    return data
                case "json":
                    return JSON.parse(data)
                default:
                    return data
            }
        }
    } catch (e) {
        loge(e + "\nlaoleng.http.get返回值为:\n" + data)
    }
    return null
}

/**
 * @description httpPost
 * @param {String} url 请求链接
 * @param {Object?} params 请求参数{"a":1}
 * @param {String?} dataType 默认json string/json
 * @param {number?} timeout 请求超时 默认 10秒
 * @param {Object?} headers 请求头信息 {"a":1}
 * @return {JSON|null|string}
 */
laoleng.http.post = function (url, params, dataType, timeout, headers) {
    timeout = timeout * 1000 || 10 * 1000
    dataType = dataType || "json"
    let data = null
    try {
        data = http.httpPost(url, params, null, timeout, headers)
        // logd(data);
        if (data) {
            // if (data === "404 page not found") {
            //     return false
            // }
            switch (dataType) {
                case "string":
                    return data
                case "json":
                    return JSON.parse(data)
                default:
                    return data
            }
        }
    } catch (e) {
        loge(e + "\nlaoleng.http.post返回值为:\n" + data)
    }
    return null
}
/**
 * @description httpPost
 * @param {String} url 请求链接
 * @param {Object?} params 请求参数json{"a":1}
 * @param {String?} dataType 默认json string/json
 * @param {number?} timeout 请求超时 默认 10秒
 * @param {Object?} header header {"a":1}
 * @return {JSON|null|string}
 */
laoleng.http.postJson = function (url, params, dataType, timeout, header) {
    timeout = timeout * 1000 || 10 * 1000
    dataType = dataType || "json"
    let data = null
    try {
        data = http.postJSON(url, params, timeout, header)
        // logd(data);
        if (data) {
            // if (data === "404 page not found") {
            //     return false
            // }
            switch (dataType) {
                case "string":
                    return data
                case "json":
                    return JSON.parse(data)
                default:
                    return data
            }
        }
    } catch (e) {
        loge(e + "\nlaoleng.http.postJson返回值为:\n" + data)
    }
    return null
}
/**
 * @description 获取当前IP的地址
 * @return {string}
 */
laoleng.http.getIpLocation = function () {
    let ipUrl = "http://www.baidu.com/s?ie=UTF-8&wd=ip%E5%BD%92%E5%B1%9E%E5%9C%B0%E6%9F%A5%E8%AF%A2"
    let r = this.get(ipUrl, "", "string")
    if (r) {
        r = r.match(/本机IP:&nbsp;\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}<\/span>([\s\S]*?)<\/td/)
        if (r) return r[1].replace(/\s{2,}/, "")
    }
    return ""
}
/**
 * @description 获取网络IP
 * @return {string}
 */
laoleng.http.getNetIp = function () {
    let ipList = [
        "http://ddns.oray.com/checkip",
        "http://pv.sohu.com/cityjson",
        "http://whois.pconline.com.cn/ipJson.jsp",
        "http://myip.com.tw/",
        "http://members.3322.org/dyndns/getip",
        "https://ifconfig.co/ip",]
    for (let i = 0; i < ipList.length; i++) {
        let r = this.get(ipList[i], "", "string")
        if (r) {
            r = r.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)
            if (r) return r[0]
        }
    }
    return "0.0.0.0"
}
/**
 * @description 获取10位网络时间戳
 * @return {number} 10位网络时间戳
 */
laoleng.http.getNetTimeStamp = function () {
    //k780接口
    let res = this.get("http://api.k780.com/?app=life.time&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json")
    if (res && res.success === "1") {
        return ~~res.result.timestamp
    } else {
        //淘宝接口
        res = this.get("http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp&qq-pf-to=pcqq.group")
        if (res && res.data.t) return ~~res.data.t.slice(0, -3)
    }
    return 0
}
/**
 * @description 随机UA
 * @return {string}随机UA
 */
laoleng.http.randomUA = function () {
    let user_agent = [
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 OPR/26.0.1656.60",
        "Opera/8.0 (Windows NT 5.1; U; en)",
        "Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 9.50",
        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 9.50",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0",
        "Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10",
        // Safari
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
        // chrome
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
        "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133 Safari/534.16",
        // 360
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
        // 淘宝浏览器
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/2.0 Safari/536.11",
        // 猎豹浏览器
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER",
        "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)",
        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E; LBBROWSER)",
        // QQ浏览器
        "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)",
        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)",
        // sogou浏览器
        "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.84 Safari/535.11 SE 2.X MetaSr 1.0",
        "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SV1; QQDownload 732; .NET4.0C; .NET4.0E; SE 2.X MetaSr 1.0)",
        // maxthon浏览器
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Maxthon/4.4.3.4000 Chrome/30.0.1599.101 Safari/537.36",
        // UC浏览器
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 UBrowser/4.0.3214.0 Safari/537.36",

        //各种移动端

        // IPhone
        "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
        // IPod
        "Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
        // IPAD
        "Mozilla/5.0 (iPad; U; CPU OS 4_2_1 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5",
        "Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5",
        // Android
        "Mozilla/5.0 (Linux; U; Android 2.2.1; zh-cn; HTC_Wildfire_A3333 Build/FRG83D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
        "Mozilla/5.0 (Linux; U; Android 2.3.7; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
        // QQ浏览器 Android版本
        "MQQBrowser/26 Mozilla/5.0 (Linux; U; Android 2.3.7; zh-cn; MB200 Build/GRJ22; CyanogenMod-7) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
        // Android Opera Mobile
        "Opera/9.80 (Android 2.3.4; Linux; Opera Mobi/build-1107180945; U; en-GB) Presto/2.8.149 Version/11.10",
        // Android Pad Moto Xoom
        "Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13",
        // BlackBerry
        "Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en) AppleWebKit/534.1+ (KHTML, like Gecko) Version/6.0.0.337 Mobile Safari/534.1+",
        // WebOS HP Touchpad
        "Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.70 Safari/534.6 TouchPad/1.0",
        // Nokia N97
        "Mozilla/5.0 (SymbianOS/9.4; Series60/5.0 NokiaN97-1/20.0.019; Profile/MIDP-2.1 Configuration/CLDC-1.1) AppleWebKit/525 (KHTML, like Gecko) BrowserNG/7.1.18124",
        // Windows Phone Mango
        "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; HTC; Titan)",
        // UC浏览器
        "UCWEB7.0.2.37/28/999",
        "NOKIA5700/ UCWEB7.0.2.37/28/999",
        // UCOpenwave
        "Openwave/ UCWEB7.0.2.37/28/999",
        // UC Opera
        "Mozilla/4.0 (compatible; MSIE 6.0; ) Opera/UCWEB7.0.2.37/28/999",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/22.0.1207.1 Safari/537.1",
        "Mozilla/5.0 (X11; CrOS i686 2268.111.0) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6",
        "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1090.0 Safari/536.6",
        "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/19.77.34.5 Safari/537.1",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5",
        "Mozilla/5.0 (Windows NT 6.0) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.36 Safari/536.5",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
        "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_0) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1062.0 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1062.0 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.0 Safari/536.3",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.24 (KHTML, like Gecko) Chrome/19.0.1055.1 Safari/535.24",
        "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/535.24 (KHTML, like Gecko) Chrome/19.0.1055.1 Safari/535.24",
        "ApiPOST Runtime +https://www.apipost.cn",
    ]
    return user_agent[random(0, user_agent.length - 1)]
}

/**
 * @description 网站是否可连通
 * @param hostAddress {string?} 网站地址,可空,空则为测试本机网络连通性
 * @return {boolean} true/false
 */
laoleng.http.isConnectAble = function (hostAddress) {
    hostAddress = hostAddress || "www.baidu.com"
    hostAddress = hostAddress.replace(/http:\/\/|https:\/\//g, "")
    return java.lang.Runtime.getRuntime().exec("ping -c 2 " + hostAddress).waitFor() === 0
}

/**
 * token及其他参数参考 https://open.dingtalk.com/document/group/custom-robot-access
 * @description 钉钉机器人
 * @param token {string} 机器人token
 * @param content {string} 发送内容
 * @example 其他参数参考 https://open.dingtalk.com/document/group/custom-robot-access
 */
laoleng.http.dingTalk = function (token, content) {
    let res = this.postJson("https://oapi.dingtalk.com/robot/send?access_token=" + token,
        {"msgtype": "text", "text": {"content": content}})
    if (res) {
        if (res.errcode === 0) {
            return true
        }
        loge(JSON.stringify(res))
        return false
    }
    return false
}

laoleng.images = {}
/**
 * @description bitmap转bytes
 * @param bitmap {ImageBitmap} bitmap数据
 * @param type {string?} 图片类型png/jpg  默认png
 * @param quality {number?} 图片质量,jpg格式下有效
 * @return {bytes[]} bytes数据
 */
laoleng.images.bitmapToBytes = function (bitmap, type, quality) {
    quality = quality || 100
    let baos = new java.io.ByteArrayOutputStream()
    let bitType
    if (type === "jpg") {
        bitType = android.graphics.Bitmap.CompressFormat.JPEG
    } else {
        bitType = android.graphics.Bitmap.CompressFormat.PNG
    }
    bitmap.compress(bitType, quality, baos)
    return baos.toByteArray()
}
/**
 * @description 是否为纯黑色图
 * @param bmp {ImageBitmap} bitmap格式图片
 * @return {null|boolean}
 */
laoleng.images.isEmptyBlack = function (bmp) {
    if (!bmp) {
        loge("未传图片或图片为空/截图失败,请检查!!!")
        return true
    }
    let pixels = new java.lang.reflect.Array.newInstance(java.lang.Integer.TYPE, bmp.getWidth() * bmp.getHeight())//;[bmp.getWidth() * bmp.getHeight()]
    bmp.getPixels(pixels, 0, bmp.getWidth(), 0, 0, bmp.getWidth(), bmp.getHeight())
    for (let i = 0; i < pixels.length; i++) {
        let tmp = pixels[i]
        //透明图
        //Color.alpha(tmp) === 0 ||
        if (!(Color.blue(tmp) === 0 && Color.red(tmp) === 0 && Color.green(tmp) === 0)) {
            return false
        }
    }
    return true
}
/**
 * @description 是否为纯白色图
 * @param bmp {ImageBitmap} bitmap格式图片
 * @return {null|boolean}
 */
laoleng.images.isEmptyWhite = function (bmp) {
    if (!bmp) {
        loge("未传图片或图片为空/截图失败,请检查!!!")
        return true
    }
    let pixels = new java.lang.reflect.Array.newInstance(java.lang.Integer.TYPE, bmp.getWidth() * bmp.getHeight())//;[bmp.getWidth() * bmp.getHeight()]
    bmp.getPixels(pixels, 0, bmp.getWidth(), 0, 0, bmp.getWidth(), bmp.getHeight())
    for (let i = 0; i < pixels.length; i++) {
        let tmp = pixels[i]
        //透明图
        //Color.alpha(tmp) === 0 ||
        if (!(Color.blue(tmp) === 255 && Color.red(tmp) === 255 && Color.green(tmp) === 255)) {
            return false
        }
    }
    return true
}
/**
 * @description 是否为纯白或纯黑色图
 * @param bmp {ImageBitmap} bitmap格式图片
 * @return {null|boolean}
 */
laoleng.images.isEmptyWhiteOrBlack = function (bmp) {
    if (!bmp) {
        loge("未传图片或图片为空/截图失败,请检查!!!")
        return true
    }
    let pixels = new java.lang.reflect.Array.newInstance(java.lang.Integer.TYPE, bmp.getWidth() * bmp.getHeight())//;[bmp.getWidth() * bmp.getHeight()]
    bmp.getPixels(pixels, 0, bmp.getWidth(), 0, 0, bmp.getWidth(), bmp.getHeight())
    let isEmpty = true
    for (let i = 0; i < pixels.length; i++) {
        let tmp = pixels[i]
        //透明图
        //Color.alpha(tmp) === 0 ||
        if (!(Color.blue(tmp) === 255 && Color.red(tmp) === 255 && Color.green(tmp) === 255)) {
            isEmpty = false
            break
        }
    }
    if (!isEmpty) {
        isEmpty = true
        for (let i = 0; i < pixels.length; i++) {
            let tmp = pixels[i]
            //透明图
            //Color.alpha(tmp) === 0 ||
            if (!(Color.blue(tmp) === 0 && Color.red(tmp) === 0 && Color.green(tmp) === 0)) {
                return false
                break
            }
        }
    }
    return true
}
/**
 * @description 回收多图
 */
laoleng.images.recycle = function () {
    for (let i = 0; i < arguments.length; i++) {
        image.recycle(arguments[i])
        arguments[i] = null
    }
}
/**
 * @description 获取颜色rgb值
 * @param color {number} image.pixel获取到的返回值
 * @return {{r: number, b: number, g: number}|null}
 */
laoleng.images.getRGB = function (color) {
    if (!color) {
        return null
    }
    return {r: color >> 16 & 0xff, g: color >> 8 & 0xff, b: color & 0xff}
}
laoleng.intent = {}
/**
 *@description 默认浏览器打开网址
 * @param {string} url 网址链接
 * @return {boolean}
 */
laoleng.intent.openUrl = function (url) {
    utils.openActivity({
        action: "android.intent.action.VIEW",
        uri: url,
    })
}

/**
 * @description 用其他浏览器打开网址,默认via
 * @param url {string}
 * @param pkg {string}
 * @param className {string}
 * @return {boolean}
 */
laoleng.intent.openUrlEx = function (url, pkg, className) {
    pkg = pkg || "mark.via"
    className = className || "mark.via.ui.activity.BrowserActivity"
    return utils.openActivity({
        action: "android.intent.action.VIEW",
        uri: url,
        pkg: pkg,
        className: className
    })
}
/**
 * @description 打开应用设置页
 * @param pkgName {string} 包名
 * @return {boolean}
 */
laoleng.intent.openAppSetting = function (pkgName) {
    return utils.openActivity({
        action: "android.settings.APPLICATION_DETAILS_SETTINGS",
        uri: pkgName,
        flag: Intent.FLAG_ACTIVITY_NEW_TASK
    })
}
/**
 * @description intent安装apk,调起安装页面
 * @param path {string} apk安装包路径
 * @return {boolean}
 */
laoleng.intent.installApp = function (path) {
    return utils.openActivity({
        "action": "android.intent.action.VIEW",
        "uri": "file://" + path,
        "type": "application/vnd.android.package-archive"
    })
}
/**
 * @description 打开qq群资料页
 * @param qqGroup {string} QQ群号
 * @return {boolean}
 */
laoleng.intent.openQQGroupCard = function (qqGroup) {
    return utils.openActivity({
        action: "android.intent.action.VIEW",
        uri: "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=" + qqGroup + "&card_type=group&source=qrcode",
        pkg: "com.tencent.mobileqq",
    })
}
/**
 * @description 打开qq聊天页
 * @param QQ {string} QQ号
 * @return {boolean}
 */
laoleng.intent.openQQChat = function (QQ) {
    return utils.openActivity({
        action: "android.intent.action.VIEW",
        uri: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + QQ,
        pkg: "com.tencent.mobileqq",
    })
}
/**
 *@description 图库打开图片
 * @param path{string} 图片路径
 * @return {boolean}
 */
laoleng.intent.openPic = function (path) {
    return utils.openActivity({
        action: "android.intent.action.VIEW",
        uri: "file://" + path,
        type: "image/png",
        pkg: "com.android.gallery3d",
        className: "com.android.gallery3d.app.GalleryActivity"
    })

}
/**
 *@description 打开APP的activety页面
 * @param pkgName{string} 包名
 * @param className{string} 类名
 * @return {boolean}
 */
laoleng.intent.openActivity = function (pkgName, className) {
    return utils.openActivity({
        pkg: pkgName,
        className: className
    })

}

laoleng.jsoup = {}
/**
 * @description jsoup.get主要用来下载bytes流
 * @param {String} url 请求链接
 * @param {number?} timeout 超时,默认30s
 * @param {String?} retType 返回值格式 string/byte/json/stream  默认string
 * @return {any}
 */
laoleng.jsoup.get = function (url, timeout, retType) {
    timeout = timeout * 1000 || 30 * 1000
    let filename = null, connect = null
    try {
        connect = Jsoup.connect(url)
            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36")
            .ignoreContentType(true)//忽略类型错误
            .ignoreHttpErrors(true)//忽略http错误
            .method(Connection.Method.GET)//访问方式
            .timeout(timeout)
            .headers({"Connection": "Close"})
            .maxBodySize(0)//防止下载数据丢失
            .execute()
        if (connect.header("Content-Disposition")) {
            filename = connect.header("Content-Disposition").split("=")[1]
        }
        //cookie = ret.header("Set-Cookie") + ""
        switch (retType) {
            case "string":
                return connect.body() + ""
            case "byte":
                if (connect.bodyAsBytes()) {
                    return {
                        bytes: connect.bodyAsBytes(),
                        filename: filename
                    }
                }
                return null
            case "json":
                try {
                    return JSON.parse(connect.body() + "")
                } catch (e) {
                    loge(e, connect.body())
                    return null
                }
            case "stream":
                return connect.bodyStream()
            case "raw":
                return connect
            default:
                return connect.body() + ""
        }
    } catch (e) {
        loge(e)
    }
    return null

}
/**
 * @description jsoup.post主要用来直接请求data数据
 * @param {String} url 请求链接
 * @param {string} data 请求数据
 * @param {number?} timeout 超时,默认30s
 * @param {String?} retType 返回值格式 string/byte/json/stream  默认string
 * @return {any}
 */
laoleng.jsoup.post = function (url, data, timeout, retType) {
    timeout = timeout * 1000 || 30 * 1000
    try {
        let connect = Jsoup.connect(url)
            .ignoreContentType(true)//忽略类型错误
            .ignoreHttpErrors(true)//忽略http错误
            .method(Connection.Method.POST)//访问方式
            .timeout(timeout)
            .requestBody(data)
            .maxBodySize(0)//防止下载数据丢失
            .execute()
        switch (retType) {
            case "string":
                return connect.body() + ""
            case "byte":
                return connect.bodyAsBytes()
            case "json":
                try {
                    return JSON.parse(connect.body() + "")
                } catch (e) {
                    loge(e, connect.body())
                    return null
                }
            case "stream":
                return connect.bodyStream()
            default:
                return connect.body() + ""
        }

    } catch (e) {
        loge(e)
    }
    return null
}
/**
 * @description jsoup.put主要用来请求put数据
 * @param {String} url 请求链接
 * @param {string|Object?} data 请求数据
 * @param {Object?} header 请求头
 * @param {number?} timeout 超时,默认30s
 * @param {String?} retType 返回值格式 string/byte/json/stream  默认json
 * @return {any}
 */
laoleng.jsoup.put = function (url, data, header, timeout, retType) {
    timeout = timeout * 1000 || 30 * 1000
    try {
        let connect = Jsoup.connect(url)
            .ignoreContentType(true)//忽略类型错误
            .ignoreHttpErrors(true)//忽略http错误
            .method(Connection.Method.PUT)//访问方式
            .headers(header)
            .timeout(timeout)
            .requestBody(data)
            .execute()
        switch (retType) {
            case "string":
                return connect.body() + ""
            case "byte":
                return connect.bodyAsBytes()
            case "json":
                try {
                    return JSON.parse(connect.body() + "")
                } catch (e) {
                    loge(e, connect.body())
                    return null
                }
            case "stream":
                return connect.bodyStream()
            default:
                try {
                    return JSON.parse(connect.body() + "")
                } catch (e) {
                    loge(e, connect.body())
                    return null
                }
        }
    } catch (e) {
        loge(e)
    }
    return null
}
laoleng.obj = {}
/**
 * @description 获取对象长度(key个数)
 * @param obj {Object} 对象
 * @return {number} 个数
 */
laoleng.obj.getLength = function (obj) {
    return Object.keys(obj).length
}

laoleng.ocr = {}
// //自用服务器ocr功能,平时不开机,
// laoleng.ocr.paddlehubOcr = function (x1, y1, x2, y2, quality) {
//     quality = quality || 10
//     let img = image.captureScreen(3, Number(x1), Number(y1), Number(x2), Number(y2));
//     // let r = image.saveTo(img, "/sdcard/a.png");
//     let r = image.toBase64Format(img, "jpg", quality);
//     image.recycle(img)
//     let res = laoleng.http.postJson("http://home.laoleng.top:8866/predict/chinese_ocr_db_crnn_mobile",
//         {images: [r]});
//     if (res && res.status === "0") {
//         return res.results[0].data
//     }
//     return false
// }
/**
 * @description 百度免费在线识别接口
 * @param x1{number} x1
 * @param y1{number} y1
 * @param x2{number} x2
 * @param y2{number} y2
 * @return {null|Object} json对象
 */
laoleng.ocr.baiduFreeOnline = function (x1, y1, x2, y2) {
    let cookies = ""
    let res = http.request({
        "url": "https://www.baidu.com/",
    })
    if (res) {
        cookies = res.cookie
    } else {
        loge("访问baidu失败")
        return null
    }
    let cap = image.captureScreenBitmap("png", x1, y1, x2, y2, 100)
    let b64 = image.bitmapBase64(image.binaryzationBitmap(cap, 1, 200), "png", 100)
    image.recycle(cap)
    let data = {
        "image": "data:image/png;base64," + b64 + "",
        "image_url": "",
        "type": "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate",
        "detect_direction": false
    }
    res = http.request({
        "url": "https://ai.baidu.com/aidemo",
        "cookie": cookies,
        "data": data,
    })
    if (res) {
        logd(res.body)
        return JSON.parse(res.body)
    }
    return null
}

laoleng.media = {}
/**
 * @description 在线翻译为语音并播放
 * @param str {string} 翻译内容
 * @param duration{number?} 时长,秒,默认10s
 */
laoleng.media.strToVoice = function (str, duration) {
    duration = duration * 1000 || 10 * 1000
    http.downloadFile("https://tts.youdao.com/fanyivoice?word=" + str + "&le=zh&keyfrom=speaker-target",
        "/sdcard/fanyivoice.mp3", 30 * 1000, null)
    utils.playMp3("/sdcard/fanyivoice.mp3", false)
    sleep(duration)//播放时长
    utils.stopMp3()
}

laoleng.Rnd = {}
/**
 * @description 计算数学几率
 * @param odds {number} 几率
 * @return {boolean} true/false
 */
laoleng.Rnd.odds = function (odds) {
    return random(1, 100) <= Number(odds)
}
/**
 * @description 延迟随机时间并提示
 * @param {number} startTime 起始时长,毫秒
 * @param {number}endTime 结束时长,毫秒
 * @param {string?}msg 提示信息
 * @param {number?}duration 提醒间隔
 */
laoleng.Rnd.sleep = function (startTime, endTime, msg, duration) {
    endTime = endTime || startTime
    msg = msg || ""
    duration = duration || 30
    releaseNode()
    removeNodeFlag(0)
    let tmp, tmp_int
    tmp = random(~~(startTime), ~~(endTime))
    tmp_int = ~~(tmp / 1000)
    if (msg) {
        logd(msg + "倒计时:" + tmp_int + "秒")
        toast(msg + "倒计时:" + tmp_int + "秒")
    }
    for (let d = tmp_int; d >= 0; d--) {
        sleep(1000)
        if (d % duration === 0) {
            toast(msg + "倒计时:" + d + "秒")
        }
    }
    sleep(tmp - tmp_int * 1000)
}
/**
 * @description 生成不重复随机数组
 * @param arr {any[]} 原始数组
 * @return {any[]} 生成后的不重复随机数组
 */
laoleng.Rnd.getNoRepeatArr = function (arr) {
    let tempArr = [],
        arrTemp = arr.concat()
    count = arrTemp.length
    for (let i = 0; i < count; i++) {
        let num = random(0, arrTemp.length - 1)
        tempArr.push(arrTemp[num])    //获取arr[num]并放入temp
        arrTemp.splice(num, 1)
    }
    return tempArr
}
/**
 * @description 获取随机数[主要用于长整数]
 * @param min {number} 起始
 * @param max {number} 结束
 * @return {number} 随机整数
 */
laoleng.Rnd.getRndNumber = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
/**
 * @description 返回一个随机内容
 * @param arr{any[]} 原始数组
 * @return {any} 随机一个内容
 */
laoleng.Rnd.getRndOne = function (arr) {
    return arr[random(0, arr.length - 1)]
}
/**
 * @description laoleng随机字符串功能类
 */
laoleng.RndStr = {}
/**
 * @description 随机_大写字母
 * @param {number?} count 随机个数,默认1个
 * @return {String} 随机结果
 */
laoleng.RndStr.upperCase = function (count) {
    count = count || 1
    let text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ret = ''
    for (let i = 0, len = text.length - 1; i < count; i++) {
        ret += text[random(0, len)]
    }
    return ret
}
/**
 * @description 随机_小写字母
 * @param {number?} count 随机个数,默认1个
 * @return {String} 随机结果
 */
laoleng.RndStr.lowerCase = function (count) {
    count = count || 1
    let text = 'abcdefghijklmnopqrstuvwxyz', ret = ''
    for (let i = 0, len = text.length - 1; i < count; i++) {
        ret += text[random(0, len)]
    }
    return ret
}
/**
 * @description 随机_字母
 * @param {number?} count 随机个数,默认1个
 * @return {String} 随机结果
 */
laoleng.RndStr.cases = function (count) {
    count = count || 1
    let text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', ret = ''
    for (let i = 0, len = text.length - 1; i < count; i++) {
        ret += text[random(0, len)]
    }
    return ret
}
/**
 * @description 随机_数字字符串
 * @param {number?} count 随机个数,默认1个
 * @return {String} 随机结果
 */
laoleng.RndStr.numStr = function (count) {
    count = count || 1
    let text = '0123456789', ret = ''
    for (let i = 0, len = text.length - 1; i < count; i++) {
        ret += text[random(0, len)]
    }
    return ret
}
/**
 * @description 随机_小写字母,数字
 * @param {number?} count 随机个数,默认1个
 * @return {String} 随机结果
 */
laoleng.RndStr.lowerCaseAndNum = function (count) {
    count = count || 1
    let text = 'abcdefghijklmnopqrstuvwxyz0123456789', ret = ''
    for (let i = 0, len = text.length - 1; i < count; i++) {
        ret += text[random(0, len)]
    }
    return ret
}
/**
 * @description 随机_大小写字母,数字,符号
 * @param {number?} count 随机个数,默认1个
 * @return {String} 随机结果
 */
laoleng.RndStr.caseAndNum = function (count) {
    count = count || 1
    let text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=-@#~,.[]()!%^*$', ret = ''
    for (let i = 0, len = text.length - 1; i < count; i++) {
        ret += text[random(0, len)]
    }
    return ret
}
/**
 * @description 随机_全部中文
 * @param {number?} count 随机个数,默认1个
 * @return {String} 随机结果
 */
laoleng.RndStr.chineseAll = function (count) {
    count = count || 1
    let ret = ""
    for (let i = 0; i < count; i++) {
        ret += String.fromCharCode(random(19968, 26032))
    }
    return ret
}
/**
 * @description 随机_手机号
 * @return {String} 随机_手机号
 */
laoleng.RndStr.getMobile = function () {
    let start = ["130", "131", "132", "133", "134", "135", "137", "138",
        "170", "187", "189", "199", "198", "156", "166", "175", "186", "184", "146", "139", "147",
        "150", "151", "152", "157", "158", "159", "178", "182", "183", "187", "188", "133", "153",
        "149", "173", "177", "180", "181", "189"]
    return start[random(0, start.length - 1)] + this.numStr(8)
}
/**
 * @description 随机_名字
 * @param {string?} gender 性别,可空 男,女,全部随机
 * @return {String} 随机_手机号
 */
laoleng.RndStr.getName = function (gender) {
    //以下字库可自行添加
    let familyNames = [
        "赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈", "楮", "卫", "蒋", "沈", "韩", "杨",
        "朱", "秦", "尤", "许", "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏", "陶", "姜",
        "戚", "谢", "邹", "喻", "柏", "水", "窦", "章", "云", "苏", "潘", "葛", "奚", "范", "彭", "郎",
        "鲁", "韦", "昌", "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳", "酆", "鲍", "史", "唐",
        "费", "廉", "岑", "薛", "雷", "贺", "倪", "汤", "滕", "殷", "罗", "毕", "郝", "邬", "安", "常",
        "乐", "于", "时", "傅", "皮", "卞", "齐", "康", "伍", "余", "元", "卜", "顾", "孟", "平", "黄",
        "和", "穆", "萧", "尹", "姚", "邵", "湛", "汪", "祁", "毛", "禹", "狄", "米", "贝", "明", "臧",
        "计", "伏", "成", "戴", "谈", "宋", "茅", "庞", "熊", "纪", "舒", "屈", "项", "祝", "董", "梁",
        "杜", "阮", "蓝", "闽", "席", "季", "麻", "强", "贾", "路", "娄", "危", "江", "童", "颜", "郭",
        "梅", "盛", "林", "刁", "锺", "徐", "丘", "骆", "高", "夏", "蔡", "田", "樊", "胡", "凌", "霍",
        "虞", "万", "支", "柯", "昝", "管", "卢", "莫", "经", "房", "裘", "缪", "干", "解", "应", "宗",
        "丁", "宣", "贲", "邓", "郁", "单", "杭", "洪", "包", "诸", "左", "石", "崔", "吉", "钮", "龚",
        "程", "嵇", "邢", "滑", "裴", "陆", "荣", "翁", "荀", "羊", "於", "惠", "甄", "麹", "家", "封",
        "芮", "羿", "储", "靳", "汲", "邴", "糜", "松", "井", "段", "富", "巫", "乌", "焦", "巴", "弓",
        "牧", "隗", "山", "谷", "车", "侯", "宓", "蓬", "全", "郗", "班", "仰", "秋", "仲", "伊", "宫",
        "宁", "仇", "栾", "暴", "甘", "斜", "厉", "戎", "祖", "武", "符", "刘", "景", "詹", "束", "龙",
        "叶", "幸", "司", "韶", "郜", "黎", "蓟", "薄", "印", "宿", "白", "怀", "蒲", "邰", "从", "鄂",
        "索", "咸", "籍", "赖", "卓", "蔺", "屠", "蒙", "池", "乔", "阴", "郁", "胥", "能", "苍", "双",
        "闻", "莘", "党", "翟", "谭", "贡", "劳", "逄", "姬", "申", "扶", "堵", "冉", "宰", "郦", "雍",
        "郤", "璩", "桑", "桂", "濮", "牛", "寿", "通", "边", "扈", "燕", "冀", "郏", "浦", "尚", "农",
        "温", "别", "庄", "晏", "柴", "瞿", "阎", "充", "慕", "连", "茹", "习", "宦", "艾", "鱼", "容",
        "向", "古", "易", "慎", "戈", "廖", "庾", "终", "暨", "居", "衡", "步", "都", "耿", "满", "弘",
        "匡", "国", "文", "寇", "广", "禄", "阙", "东", "欧", "殳", "沃", "利", "蔚", "越", "夔", "隆",
        "师", "巩", "厍", "聂", "晁", "勾", "敖", "融", "冷", "訾", "辛", "阚", "那", "简", "饶", "空",
        "曾", "毋", "沙", "乜", "养", "鞠", "须", "丰", "巢", "关", "蒯", "相", "查", "后", "荆", "红",
        "游", "竺", "权", "逑", "盖", "益", "桓", "公", "仉", "督", "晋", "楚", "阎", "法", "汝", "鄢",
        "涂", "钦", "岳", "帅", "缑", "亢", "况", "后", "有", "琴", "归", "海", "墨", "哈", "谯", "笪",
        "年", "爱", "阳", "佟", "商", "牟", "佘", "佴", "伯", "赏",
        "万俟", "司马", "上官", "欧阳", "夏侯", "诸葛", "闻人", "东方", "赫连", "皇甫", "尉迟", "公羊",
        "澹台", "公冶", "宗政", "濮阳", "淳于", "单于", "太叔", "申屠", "公孙", "仲孙", "轩辕", "令狐",
        "锺离", "宇文", "长孙", "慕容", "鲜于", "闾丘", "司徒", "司空", "丌官", "司寇", "子车", "微生",
        "颛孙", "端木", "巫马", "公西", "漆雕", "乐正", "壤驷", "公良", "拓拔", "夹谷", "宰父", "谷梁",
        "段干", "百里", "东郭", "南门", "呼延", "羊舌", "梁丘", "左丘", "东门", "西门", "南宫"
    ]
    let givenNames = [
        "子璇", "淼", "国栋", "夫子", "瑞堂", "甜", "敏", "尚", "国贤", "贺祥", "晨涛",
        "昊轩", "易轩", "益辰", "益帆", "益冉", "瑾春", "瑾昆", "春齐", "杨", "文昊",
        "东东", "雄霖", "浩晨", "熙涵", "溶溶", "冰枫", "欣欣", "宜豪", "欣慧", "建政",
        "美欣", "淑慧", "文轩", "文杰", "欣源", "忠林", "榕润", "欣汝", "慧嘉", "新建",
        "建林", "亦菲", "林", "冰洁", "佳欣", "涵涵", "禹辰", "淳美", "泽惠", "伟洋",
        "涵越", "润丽", "翔", "淑华", "晶莹", "凌晶", "苒溪", "雨涵", "嘉怡", "佳毅",
        "子辰", "佳琪", "紫轩", "瑞辰", "昕蕊", "萌", "明远", "欣宜", "泽远", "欣怡",
        "佳怡", "佳惠", "晨茜", "晨璐", "运昊", "汝鑫", "淑君", "晶滢", "润莎", "榕汕",
        "佳钰", "佳玉", "晓庆", "一鸣", "语晨", "添池", "添昊", "雨泽", "雅晗", "雅涵",
        "清妍", "诗悦", "嘉乐", "晨涵", "天赫", "玥傲", "佳昊", "天昊", "萌萌", "若萌",
        "惠宁", "雅欣", "奕雯", "佳琪", "永怡", "璐瑶", "娟秀", "天佳", "晓华", "妍丽", "璇菡",
        "嘉禾", "忆辰", "妍彤", "眉萱", "秀辰", "怡熹", "思琦", "弦娇", "青淑", "宣淑", "和静",
        "雪涵", "美嘉", "佳涵", "旭和", "丽娇", "雨晨", "文惠", "雅馥", "雨嘉", "亦婷", "秀慧",
        "俊颖", "亭清", "思涵", "珂嘉", "蒂莲", "秀娟", "晋仪", "玮菁", "慧琳", "丽帆", "思辰",
        "宇纯", "美瑞", "蕊清", "秀敏", "家维", "宁致", "婷方", "燕晨", "子琳", "雪菲", "泓锦",
        "佳妮", "初晨", "芷菡", "奕可", "莉姿", "杏菏", "韵彩", "姝慧", "雪华", "珊娜", "秀丽",
        "箫辉", "盈初", "语楚", "青秋", "梓菁", "宝萱"
    ]
    let mans = "刚伟勇毅俊峰强军平保东文辉力明永健世广志义兴良海山仁波宁贵福生龙元全国胜学祥才发武新利清" +
        "飞彬富顺信子杰涛昌成康星光天达安岩中茂进林有坚和彪博诚先敬震振壮会思群豪心邦承乐绍功松善厚庆磊民友裕" +
        "河哲江超浩亮政谦亨奇固之轮翰朗伯宏言若鸣朋斌梁栋维启克伦翔旭鹏泽晨辰士以建家致树炎德行时泰盛雄琛钧冠策腾楠榕风航弘"
    let womens = "秀娟英华慧巧美娜静淑惠珠翠雅芝玉萍红娥玲芬芳燕彩春菊兰凤洁梅琳素云莲真环雪荣爱妹霞香月莺媛艳" +
        "瑞凡佳嘉琼勤珍贞莉桂娣叶璧璐娅琦晶妍茜秋珊莎锦黛青倩婷姣婉娴瑾颖露瑶怡婵雁蓓纨仪荷丹蓉眉君琴蕊薇菁梦岚苑婕馨瑗琰韵" +
        "融园艺咏卿聪澜纯毓悦昭冰爽琬茗羽希宁欣飘育滢馥筠柔竹霭凝鱼晓欢霄枫芸菲寒伊亚宜可姬舒影荔枝思丽墨"
    switch (gender) {
        case "男":
            return familyNames[random(0, familyNames.length - 1)] + mans[random(0, mans.length - 1)]
        case "女":
            return familyNames[random(0, familyNames.length - 1)] + womens[random(0, womens.length - 1)]
        default:
            switch (random(0, 2)) {
                case 0:
                    return familyNames[random(0, familyNames.length - 1)] + mans[random(0, mans.length - 1)]
                case 1:
                    return familyNames[random(0, familyNames.length - 1)] + womens[random(0, womens.length - 1)]
                case 2:
                    return familyNames[random(0, familyNames.length - 1)] + givenNames[random(0, givenNames.length - 1)]
            }
    }
}
/**
 * @description 随机_身份证号
 * @return {String} 随机_身份证号
 */
laoleng.RndStr.getIdCard = function () {
    let cnNewID = function (idcard) {
        let arrExp = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] // 加权因子
        let arrValid = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2] // 校验码
        let sum = 0
        for (let j = 0; j < 17; j++) {
            // 对前17位数字与权值乘积求和
            sum += parseInt(idcard[j], 10) * arrExp[j]
        }
        return arrValid[sum % 11]
    }
    let idcard = ''
    for (let i = 0; i < 18; i++) {
        if (i < 6) {
            idcard += random(0, 9)
        } else if (i === 6) {
            idcard += random(1, 2) //年份第一位仅支持1和2
        } else if (i === 7) {
            idcard += idcard[6] === '1' ? 9 : 0//两位年份规则，仅支持19和20
        } else if (i === 8) {
            idcard += idcard[6] === '1' ? random(3, 7) : random(0, 1) //三位年份规则，仅支持193-199、200、201这些值
        } else if (i === 9) {
            idcard += random(0, 9) //四位年份规则,0-9
        } else if (i === 10) {
            idcard += random(0, 1)//首位月份规则
        } else if (i === 11) {
            idcard += idcard[10] === '0' ? random(1, 9) : random(0, 2)//末位月份规则
        } else if (i === 12) {
            let maxDays = new Date(~~idcard.substr(6, 4), ~~idcard.substr(10, 2), 0).getDate() // 获取当月最大天数
            let day = random(1, maxDays)
            idcard += day < 10 ? ('0' + day) : day
            i++
        } else if (i > 13 && i < 17) {
            idcard += random(0, 9)
        } else if (i === 17) {
            idcard += cnNewID(idcard)
        }
    }
    return idcard
}
/**
 * @description 随机插入字符串
 * @param srcStr {string} 源字符串
 * @param str {string} 待插入字符串
 * @return {string} 结果
 */
laoleng.RndStr.insertStr = function (srcStr, str) {
    srcStr = srcStr.split("")
    srcStr.splice(random(0, srcStr.length - 1), 0, str)
    return srcStr.join("")
}
/**
 * @description 代理模式
 */
laoleng.shell = {}

/**
 * @description 无障碍模式下使用shell(非root)
 * @param commandArr{string} adb shell命令,必要时手动把命令拆成数组确保稳定运行，如：cd到含特殊字符、空格的文件夹等。可以直接传命令字符串。
 * @return {string} 返回结果
 */
laoleng.shell.accShell = function (commandArr) {
    let tempBuffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024)
    let byteArrayOutputStream = new java.io.ByteArrayOutputStream()
    let exec, inputStream, bufferedInputStream, count
    try {
        exec = java.lang.Runtime.getRuntime().exec(commandArr)
        exec.getOutputStream().close()
        inputStream = exec.getInputStream()
        bufferedInputStream = new java.io.BufferedInputStream(inputStream)
        while ((count = bufferedInputStream.read(tempBuffer)) !== -1) {
            byteArrayOutputStream.write(tempBuffer, 0, count)
        }
        exec.waitFor()
    } catch (e) {
        logd(e)
    } finally {
        if (exec) exec.destroy()
        if (inputStream) inputStream.close()
        if (bufferedInputStream) bufferedInputStream.close()
    }
    return byteArrayOutputStream + ""
}

/**
 * @description 开启飞行模式,需要root
 */
laoleng.shell.openAirMode = function () {
    return shell.sudo("settings put global airplane_mode_on 1 && am broadcast -a android.intent.action.AIRPLANE_MODE" +
        " --ez state true")
}
/**
 * @description 关闭飞行模式,需要root
 */
laoleng.shell.closeAirMode = function () {
    return shell.sudo("settings put global airplane_mode_on 0 && am broadcast -a android.intent.action.AIRPLANE_MODE --ez state false")
}
/**
 *@description shell安装apk,代理模式
 * @param path {string} apk路径
 * @return {string}
 */
laoleng.shell.installApp = function (path) {
    return shell.execCommand("pm install -r " + path)
}
/**
 *@description shell卸载apk,代理模式
 * @param pkgName {string}包名
 * @return {string}
 */
laoleng.shell.uninstallApp = function (pkgName) {
    return shell.execCommand("pm uninstall  " + pkgName)
}
/**
 *@description 打开APP的activity页面
 * @param pkgName{string} 包名
 * @param className{string} 类名
 * @return {string}
 */
laoleng.shell.openActivity = function (pkgName, className) {
    return shell.execCommand("am start -n " + pkgName + "/" + className)
}
/**
 * @description 跳转scheme,需要root
 * @param scheme {string} scheme
 * @return {string}
 */
laoleng.shell.openScheme = function (scheme) {
    return shell.sudo("am start -a android.intent.action.VIEW -d '" + scheme + "'")
}
/**
 * @description 获取顶层应用包名与组件名
 * @param mode{number?} 默认不填,如果默认获取不到可切换0/1
 * @return {string}  bin.mt.plus/.Main
 */
laoleng.shell.getRunningActivity = function (mode) {
    let ret = shell.execCommand("dumpsys activity top")
    if (ret) {
        if (mode) {
            if (mode === 0) {
                ret = ret.match(/ACTIVITY ([^/]+)/)
            } else {
                ret = ret.match(/ACTIVITY .-\/([^ ]+)/)
            }
        } else {
            ret = ret.match(/ACTIVITY ([^ ]+)/)
        }
        if (ret) return ret[1]
    }
    return ""
}
/**
 *@description shell获取cpu核心温度
 * @return {number} cpu核心温度
 */
laoleng.shell.getCpuTemp = function () {
    let list = ["/sys/devices/system/cpu/cpu0/cpufreq/cpu_temp",
        "/sys/devices/system/cpu/cpu0/cpufreq/FakeShmoo_cpu_temp",
        "/sys/class/thermal/thermal_zone0/temp",
        "/sys/class/i2c-adapter/i2c-4/4-004c/temperature",
        "/sys/devices/platform/tegra-i2c.3/i2c-4/4-004c/temperature",
        "/sys/devices/platform/omap/omap_temp_sensor.0/temperature",
        "/sys/devices/platform/tegra_tmon/temp1_input",
        "/sys/kernel/debug/tegra_thermal/temp_tj",
        "/sys/devices/platform/s5p-tmu/temperature",
        "/sys/class/thermal/thermal_zone1/temp",
        "/sys/class/hwmon/hwmon0/device/temp1_input",
        "/sys/devices/virtual/thermal/thermal_zone1/temp",
        "/sys/devices/virtual/thermal/thermal_zone0/temp",
        "/sys/class/thermal/thermal_zone3/temp",
        "/sys/class/thermal/thermal_zone4/temp",
        "/sys/class/hwmon/hwmonX/temp1_input",
        "/sys/devices/platform/s5p-tmu/curr_temp"]
    for (let i = 0; i < list.length; i++) {
        let tmp = ~~shell.execCommand("cat " + list[i]) / 1000
        if (tmp) {
            // logd(list[i]);
            return ~~tmp
        }
    }
    return 0
}
/**
 * @description shell获取电池温度
 * @return {number}电池温度
 */
laoleng.shell.getBatteryTemp = function () {
    let tmp = shell.execCommand("dumpsys battery")
    if (tmp) return ~~laoleng.String.getMiddleText(tmp, "temperature: ", "technology") / 10
    return 0
}
/**
 * @description shell方式点击坐标
 * @param x{number} x坐标
 * @param y{number} y坐标
 */
laoleng.shell.tap = function (x, y) {
    shell.execAgentCommand("input tap " + x + " " + y)
}

laoleng.String = {}
/**
 * @description String拓展替换所有
 * @param searchValue {string} 待替换数据
 * @param replaceValue {string?} 替换数据,默认""
 * @return {string} 替换后的数据
 */
String.prototype.replaceAll = function (searchValue, replaceValue) {
    return this.replace(new RegExp(searchValue, "gm"), replaceValue ? replaceValue : "")
}
/**
 * @description 截取字符串真实位置内容,适合带表情和生僻字
 * @param pStart{number?} 起始位置,可空,默认0
 * @param pEnd{number?} 结束位置,可空,默认起始位置+1
 * @return {string}
 */
String.prototype.sliceByReal = function (pStart, pEnd) {
    let pIndex = 0,//码点指针
        cIndex = 0, //码元指针
        result = ""//结果
    pStart = pStart || 0
    pEnd = pEnd || pStart + 1
    while (true) {
        if (pIndex >= pEnd || cIndex >= this.length) break
        let point = this.codePointAt(cIndex)
        if (pIndex >= pStart) result += String.fromCodePoint(point)
        pIndex++
        cIndex += point > 0xffff ? 2 : 1
    }
    return result
}
/**
 * @description 获取取字符串真实位置内容,适合带表情和生僻字
 * @param position{number?} 字符位置,默认0
 * @return {string}
 */
String.prototype.getWordsByReal = function (position) {
    position = position || 0
    return this.sliceByReal(position, position + 1)
}
/**
 * @description 获取字符串真实长度,适合带表情和生僻字
 * @return {number}
 */
String.prototype.getRealLength = function () {
    let cIndex = 0,
        count = 0
    while (true) {
        let point = this.codePointAt(cIndex)
        count++
        cIndex += point > 0xffff ? 2 : 1
        if (cIndex >= this.length) {
            break
        }
    }
    return count
}

/**
 * @description 格式化字符串（文本替换）
 * @param {String} str 源字符串。如：'确定要{0}单据【{1}】吗？'
 * @param {*} args 要替换的参数,支持多参。如：'删除', 'QZYDYJZB201901300002'
 * @return {String} 如：'确定要删除单据【QZYDYJZB201901300002】吗？'
 */
laoleng.String.format = function (str, args) {
    for (let i = 1, len = arguments.length; i < len; i++) {
        let reg = new RegExp('\\{' + (i - 1) + '\\}', 'gm')
        arguments[0] = arguments[0].replace(reg, arguments[i])
    }
    return arguments[0]
}
/**
 * @description 取中间文本
 * @param str {string}源字符串
 * @param start {string}起始字符串
 * @param end {string} 末尾字符串
 * @param retain {boolean?} 是否保留截取字符,默认false
 * @return {string} 取出的中间文本
 */
laoleng.String.getMiddleText = function (str, start, end, retain) {
    if (!str || !start || !end) return ""
    let a = str.indexOf(start)
    if (a !== -1) {
        a += start.length
        let e = str.indexOf(end, a)
        if (e > a) {
            return retain ? str.substring(a - start.length, e + end.length) : str.substring(a, e)
        }
    }
    return ""
}
/**
 * @description 取中间文本,返回数组
 * @param str {string}源字符串
 * @param startStr {string}起始字符串
 * @param endStr {string} 末尾字符串
 * @return {[string]} 取出的中间文本,返回数组
 */
laoleng.String.getMiddleTextArr = function (str, startStr, endStr) {
    let reg = new RegExp(startStr + "(.*?)" + endStr, "gm")
    let matches = [], match
    while (match = reg.exec(str)) {
        matches.push(match[1])
    }
    if (matches.length === 0) return null
    return matches
}

/**
 * @description 取中间文本,最大匹配
 * @param str {string}源字符串
 * @param start {string}起始字符串
 * @param end {string} 末尾字符串
 * @param retain {boolean?} 是否保留截取字符,默认false
 * @return {string} 取出的中间文本
 */
laoleng.String.getMiddleTextBig = function (str, start, end, retain) {
    if (!str || !start || !end) return ""
    let a = str.indexOf(start)
    if (a !== -1) {
        a += start.length
        let e = str.lastIndexOf(end)
        if (e > a) {
            return retain ? str.substring(a - start.length, e + end.length) : str.substring(a, e)
        }
    }
    return ""
}

/**
 * @description 取前面文本
 * @param srcStr {string} 源字符串
 * @param str{string} 定位字符串
 * @return {string} 取前面文本
 */
laoleng.String.getBeforeText = function (srcStr, str) {
    if (!srcStr || !str) return ""
    return srcStr.substring(0, srcStr.indexOf(str))
}
/**
 * @description 取后面文本
 * @param srcStr {string}源字符串
 * @param str {string}定位字符串
 * @return {string} 取后面文本
 */
laoleng.String.getAfterText = function (srcStr, str) {
    if (!srcStr || !str) return ""
    return srcStr.substring(srcStr.indexOf(str) + str.length)
}
/**
 * @description 取后面文本,从末尾反向搜索
 * @param srcStr {string}源字符串
 * @param str {string}定位字符串
 * @return {string} 取后面文本
 */
laoleng.String.getAfterTextFromEnd = function (srcStr, str) {
    if (!srcStr || !str) return ""
    return srcStr.substring(srcStr.lastIndexOf(str) + str.length)
}
/**
 * @description 判断字符串是否以指定字符串开头
 * @param {String} str 源字符串
 * @param {String} searchString 要查询的字符串
 * @param {Boolean?} ignoreCase 是否忽略大小写，默认false
 * @return {Boolean}
 */
laoleng.String.isStartWith = function (str, searchString, ignoreCase) {
    if (str === null || str === undefined) return false
    let preSubStr = str.substring(0, searchString.length) + ''
    if (ignoreCase) {
        preSubStr = preSubStr.toLowerCase()
        searchString = (searchString + '').toLowerCase()
    }
    return preSubStr === searchString
}

/**
 * @description 判断字符串是否以指定字符串结束
 * @param {String} str 源字符串
 * @param {String} searchString 要查询的字符串
 * @param {Boolean?} ignoreCase 是否忽略大小写，默认false
 * @return {Boolean}
 */
laoleng.String.isEndWith = function (str, searchString, ignoreCase) {
    if (str === null || str === undefined) return false
    let lastSubStr = str.substring(str.length - searchString.length, str.length) + ''
    if (ignoreCase) {
        lastSubStr = lastSubStr.toLowerCase()
        searchString = (searchString + '').toLowerCase()
    }
    return lastSubStr === searchString
}
/**
 * @description 首字母大写
 * @param {String} str 源字符串
 * @return {String}
 */
laoleng.String.firstUpperCase = function (str) {
    if (typeOf(str) !== "String") return ''
    return str.replace(/^\S/, function (s) {
        return s.toUpperCase()
    })
}
/**
 * @description 首字母小写
 * @param {String} str 源字符串
 * @return {String}
 */
laoleng.String.firstLowerCase = function (str) {
    if (typeOf(str) !== "String") return ''
    return str.replace(/^\S/, function (s) {
        return s.toLowerCase()
    })
}

/**
 * @description 反转字符串的元素顺序
 * @param {String} str 源字符串
 * @return {String}
 */
laoleng.String.reverse = function (str) {
    if (typeOf(str) !== "String") return ''
    let newStr = ''
    for (let i = str.length - 1; i >= 0; i--) {
        newStr += str[i]
    }
    return newStr
}

/**
 * @description 字母和数字混合的编号自加1（以数字结尾）
 * @param {String} code 编号。例：'XM0001'
 * @return {String} 编号+1。例：'XM0002'
 */
laoleng.String.getNext = function (code) {
    let part1, part2
    if (/[a-z]/i.test(code)) {
        let x = code.match(/[a-z]/ig)
        part1 = x.join('')
        part2 = code.substring(x.length)
    } else {
        part1 = ''
        part2 = code
    }
    let int = parseInt(part2)
    let zero = (part2 + '.').split(int + '.')[0]
    let newPart2 = zero + (int + 1).toString()
    return part1 + newPart2
}
/**
 * @description 数字颜色转hex
 * @param {String} color 数字颜色。例：'-156654'
 * @return {String} hex 0xffffff
 */
laoleng.String.getHexString = function (color) {
    let s = "0x"
    let colorStr = (color & 0xff000000) | (color & 0x00ff0000) | (color & 0x0000ff00) | (color & 0x000000ff)
    s += java.lang.Integer.toHexString(colorStr)
    return s
}


/**
 * 编码 base64 -> URL Safe base64
 * @description: base64
 * '+' -> '-'
 * '/' -> '_'
 * '=' -> ''
 * @param {string} base64Str
 * @return: URL Safe base64 string;
 */
laoleng.String.urlSateBase64Encode = function (base64Str) {
    if (!base64Str) return
    return base64Str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    // const UriSafe = (src: string) => src.replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_').replace(/=+$/m, ‘');

}
/**
 * @description 提取字符串中的数字
 * @param str {string} 字符串
 * @param startCount {number} 位数起始
 * @param endCount {number?} 位数结束,不填默认为起始
 * @return {null|string} 字符串类型的数字
 */
laoleng.String.getNumbers = function (str, startCount, endCount) {
    endCount = endCount || startCount
    let ret = str.match(new RegExp("\\D?(\\d{" + startCount + "," + endCount + "})\\D?"))
    if (ret) {
        return ret[1]
    }
    return null
}

/**
 * @description KeyStr 代理模拟键盘输入,主要数字英文
 * @param {String} str 字符串
 * @param {number?} delay 延迟,默认50ms
 */
laoleng.Key.KeyStr = function (str, delay) {
    delay = delay || 50
    for (let i = 0; i < str.length; i++) {
        if (/\d/.test(str[i])) {
            agentEvent.pressKeyCode(~~str[i] + 7)
        } else if (/[a-zA-Z]/.test(str[i])) {
            agentEvent.pressKeyCode(str[i].toLowerCase().charCodeAt() - 68)
        }
        sleep(delay)
    }
}
/**
 * @description 小米6lineageOS键盘查找节点点击输入
 * @param str {string}字符串
 * @param delay {number?}延迟,默认100ms
 */
laoleng.Key.KeyStrNode = function (str, delay) {
    delay = delay || 100
    for (let i = 0; i < str.length; i++) {
        while (true) {
            if (findNode(desc(str[i]).clz("com.android.inputmethod.keyboard.Key").pkg("com.android.inputmethod.latin"))) {
                g_ret.click()
                break
            } else {
                keepNode()
            }
        }
        sleep(delay)
    }
    releaseNode()
}


//不记得谁写的了,自己测试
laoleng.Slider = {}
laoleng.Slider.rgx灰色 = function (bitmap, x, y) {
    bitmap = bitmap || image.captureScreenBitmap("png", 0, 0, -1, -1, 100)
    let number = image.getPixelBitmap(bitmap, x, y)
    image.recycle(bitmap)
    let R = number >> 16 & 0xff
    let G = number >> 8 & 0xff
    let B = number & 0xff
    let rgb = ~~((R + G + B) / 3)
    let r = Math.abs(R - rgb)
    let g = Math.abs(G - rgb)
    let b = Math.abs(B - rgb)
    rgb = r + g + b
    let rg = Math.abs(R - G)
    // var rb = Math.abs(R - B);
    let bg = Math.abs(G - B)
    if (rg < 20 || bg < 20) {
        if (R < 135 && rgb < 150) {
            return 1
        }
    } else if ((R + G + B) < 300 && rgb < 180) {
        return 1
    } else {
        return 0
    }
}

laoleng.Slider.滑块坐标 = function (left, top, right, bottom, Gapwidth) {
    let left0 = left
    let bitmap = image.captureScreenBitmap("jpg", 0, 0, -1, -1, 100)
    let Xlast = 0, Xlastend = 0, 次数 = 0, 最大次数 = 0, 差值 = 0, Xend = left
    for (let y = top + 10; y < bottom - 10; y = 次数 === 0 ? y + 8 : y + 3) {
        for (let x = left0; x < right - 30; x = 最大次数 === 0 ? x + 5 : x + 3) {
            if (this.rgx灰色(bitmap, x, y) === 1) {
                差值 = x - Xlast
                if (差值 > Gapwidth - 15 && 差值 < Gapwidth + 15 && this.rgx灰色(bitmap, x - 50, y + 30) === 1 && this.rgx灰色(bitmap, x + 10, y + 15) === 1) {
                    Xend = Xlast
                    次数 = 次数 + 1
                    if (Math.abs(Xlastend - Xend) < 10) {
                        最大次数 = 次数
                        if (最大次数 > 4) {
                            // logd(x + '--' + y + '--' + 差值);
                            return Xend
                        }
                    } else if (次数 > 1) {
                        次数 = 0
                    }
                    // logd(x + '--' + y + '--' + 差值);
                    Xlastend = Xend
                    left0 = x - 50
                    break
                } else (left0 = left)
            } else (Xlast = x)
        }
    }
    image.recycle(bitmap)
    return 0
}


/**
 * @description zm紫猫数据库封装
 * @type {{post: (function(String, Object, String, (number|null), Object): (JSON|Boolean)), isdel: boolean, url: string, tbl: string}}
 */
laoleng.zm = {
    url: "http://192.168.1.100/sql.php",
    tbl: "脚本1",
    isdel: false,
    post: laoleng.http.post
}
/**
 * @description 初始化网络数据
 * @param url {string} 网址,网站程序sql.php的网址
 * @param tbl{string?} 数据表名,可选, 用于存放变量数据的表
 * @param isdel{boolean?} 是否清空, 可选, 清空指定数据表下所有变量数据, 不会删除数据表, 省略默认为false, 表示不清空
 * @return {boolean}
 */
laoleng.zm.NetDataInit = function (url, tbl, isdel) {
    url && (this.url = url)
    tbl && (this.tbl = tbl)
    isdel && (this.isdel = isdel)

    return !this.post(this.url, {
        action: "init",
        isdel: this.isdel,
        table: this.tbl
    }, "string")
}
/**
 * @description 设置网络数据
 * @param key {string} 键名, , 类似于变量名, 区分大小写
 * @param value {any} 键值, 任意类型, 存放的数据, 类似于变量值
 * @param tbl {string?} 数据表名, 可选, 往指定数据表中设置共享数据, 数据表必须存在, 省略默认为初始化时的数据表名
 * @return {null}
 */
laoleng.zm.NetDataSet = function (key, value, tbl) {
    let type = typeof value
    if (typeof value === "object") {
        value = JSON.stringify(value)
        type = "table"
    }
    tbl && (this.tbl = tbl)
    return this.post(this.url, {
        action: "set",
        key: key,
        value: value,
        type: type,
        table: this.tbl
    }, "string")
}
/**
 * @description 获取网络数据
 * @param key {string} 键名, 类似于变量名, 区分大小写
 * @param tbl {string?} 数据表名, 可选, 从指定数据表中获取共享数据, 数据表必须存在, 省略默认为初始化时的数据表名
 * @param isdel {boolean?} 是否删除, 可选, 表示获取后是否直接删除该键名, 省略默认为false
 * @return {*} 键值, 任意类型, 返回存入的数据, 该数据类型与写入时相同
 */
laoleng.zm.NetDataGet = function (key, tbl, isdel) {
    tbl = tbl || this.tbl
    isdel = isdel || false
    let ret = this.post(this.url, {
        action: "get",
        key: key,
        isdel: isdel,
        table: tbl
    }, "string")
    if (ret && ret.indexOf("medoo.php") > -1) {
        return false
    }
    return ret
}
/**
 * @description 获取多行网络数据
 * @param rows {number} 行数, 从指定数据表中获取多少行数据
 * @param startrow {number?} 起始行, 可选, 表示从第几行开始获取, 省略默认为1
 * @param tbl  {string?} 数据表名, 可选, 从指定数据表中获取共享数据, 数据表必须存在, 省略默认为初始化时的数据表名
 * @param isdel {boolean?} 是否删除, 可选, 表示获取后是否直接删除这些数据, 省略默认为false
 * @return {JSON} 二维表, 返回二维表, 格式{{"id":id,"key":key,"value":value}, ...}, 失败返回null
 */
laoleng.zm.NetDataGetRows = function (rows, startrow, tbl, isdel) {
    tbl = tbl || this.tbl
    isdel = isdel || false
    startrow = startrow - 1 || 0
    return this.post(this.url, {
        action: "getrows",
        startrow: startrow,
        rows: rows,
        isdel: isdel,
        table: tbl
    })
}
/**
 * @description 获取指定表的所有网络数据
 * @param tbl {string?}指定表名,可选
 * @return {JSON}
 * @constructor
 */
laoleng.zm.NetDataGetAllRows = function (tbl) {
    tbl = tbl || this.tbl
    logd(tbl)
    return this.post(this.url, {
        action: "getallrows",
        table: tbl
    })
}
/**
 * @description 删除网络数据
 * @param key {string} 键名,类似于变量名, 区分大小写
 * @param tbl {string?} 数据表名,可选, 从指定数据表中获取共享数据, 数据表必须存在, 省略默认为初始化时的数据表名
 * @return {null}
 */
laoleng.zm.NetDataDel = function (key, tbl) {
    tbl = tbl || this.tbl
    return this.post(this.url, {
        action: "del",
        key: key,
        table: tbl
    }, "string")
}
/**
 * @description 网络数据行数
 * @param tbl {string?} 数据表名,可选, 从指定数据表中获取总数量, 数据表必须存在, 省略默认为初始化时的数据表名
 * @return {number} 数据总数, 返回数据总行数, 失败返回null
 */
laoleng.zm.NetDataCount = function (tbl) {
    tbl = tbl || this.tbl
    return ~~this.post(this.url, {
        action: "count",
        table: tbl
    }, "string")
}
/**
 * @description 执行SQL语句
 * @param query {string} SQL语句,要执行的SQL语句
 * @return {string} 执行结果,返回执行SQL后的返回结果, 失败返回null
 */
laoleng.zm.NetDataQuery = function (query) {
    return this.post(this.url, {
        action: "query",
        query: query,
    }, "string")
}


