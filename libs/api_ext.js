let ____image__ = new ImageWrapper();

/**
 * 对象是否为空
 * @param obj
 * @return {boolean}
 */
function _isNull(obj) {
    return obj == null || obj == undefined;
}

function _isArray(obj) {
    return obj instanceof Array
}

function _isString(obj) {
    return typeof obj === 'string'
}

function _isObject(obj) {
    return typeof obj === 'object'
}

/**
 * 字符串或者集合是否为空
 * @param obj
 * @return {boolean}
 */
function _isEmpty(obj) {
    if (obj == null || obj == undefined) return true;
    if (_isArray(obj) || _isString(obj)) {
        return obj.length === 0;
    }
    return false;
}

/**
 * 检测一个值是否为非数字的函数
 * @param obj
 * @return {boolean} true 代表是数字，false 代表不是数字
 */
function _isNumber(input) {
    // 先判断输入是否为数字
    if (typeof input !== 'number' && typeof input !== 'string') {
        return false;
    }
    // 使用正则表达式进行匹配
    return /^-?\d+(\.\d+)?$/.test(input);
}

/**
 * 点击坐标
 * @return {boolean} true 代表成功 false代表失败
 */
Point.prototype.click = function () {
    if (_isNumber(this.x) && _isNumber(this.y)) {
        return clickPoint(this.x, this.y);
    }
    return false;
}
Point.prototype.longClick = function () {
    if (_isNumber(this.x) && _isNumber(this.y)) {
        return longClickPoint(this.x, this.y);
    }
    return false;
}

Point.prototype.doubleClick = function () {
    if (_isNumber(this.x) && _isNumber(this.y)) {
        return doubleClickPoint(this.x, this.y);
    }
    return false;
}
/**
 * 点击坐标
 * @return {boolean} true 代表成功 false代表失败
 */
PointIndex.prototype.click = function () {
    if (_isNumber(this.x) && _isNumber(this.y)) {
        return clickPoint(this.x, this.y);
    }
    return false;
}
PointIndex.prototype.longClick = function () {
    if (_isNumber(this.x) && _isNumber(this.y)) {
        return longClickPoint(this.x, this.y);
    }
    return false;
}
PointIndex.prototype.doubleClick = function () {
    if (_isNumber(this.x) && _isNumber(this.y)) {
        return doubleClickPoint(this.x, this.y);
    }
    return false;
}
/**
 * 点击坐标
 * @return {boolean} true 代表成功 false代表失败
 */
Rect.prototype.click = function () {
    return clickCenter(this);
}
Rect.prototype.clickRandom = function () {
    return clickRandomRect(this);
}
Rect.prototype.longClickRandom = function () {
    return longClickRandomRect(this);
}


/**
 * 点击坐标
 * @return {boolean} true 代表成功 false代表失败
 */
Match.prototype.click = function () {
    if (_isNull(this.point)) {
        return false
    }
    let p = this.point;
    return p.click();
}
Match.prototype.doubleClick = function () {
    if (_isNull(this.point)) {
        return false
    }
    let p = this.point;
    return p.doubleClick();
}

Match.prototype.longClick = function () {
    if (_isNull(this.point)) {
        return false
    }
    let p = this.point;
    return p.longClick();
}
/**
 * 是否是mat格式
 * @return {boolean} true 代表是，false代表否
 */
AutoImage.prototype.isMat = function () {
    return this.mat;
}

/**
 * 是否被回收了
 * @return {boolean} true代表已经被回收了
 */
AutoImage.prototype.isRecycle = function () {
    return ____image__.isRecycled(this);
}
/**
 * 回收图片
 * @return {boolean}
 */
AutoImage.prototype.recycle = function () {
    return ____image__.recycle(this)
}
/**
 * 取得宽度
 * @return {number}
 */
AutoImage.prototype.getWidth = function () {
    return ____image__.getWidth(this);
}
/**
 * 取得高度
 * @return {number}
 */
AutoImage.prototype.getHeight = function () {
    return ____image__.getHeight(this);
}
/**
 * 转换Mat存储格式
 * @return {null|AutoImage} MAT存储格式的AutoImage 对象或者null
 */
AutoImage.prototype.toMat = function () {
    return ____image__.imageToMatFormat(this);
}

/**
 * 转换普通image存储格式
 * @return {null|AutoImage} 普通存储格式的AutoImage 对象或者null
 */
AutoImage.prototype.toAutoImage = function () {
    return ____image__.matToImageFormat(this);
}

/**
 * 取得图片的某个点的颜色值
 * @param x x坐标点
 * @param y y坐标点
 * @return {number} 颜色值
 */
AutoImage.prototype.pixel = function (x, y) {
    return ____image__.pixel(this, x, y);
}

/**
 * 自适应二值化，使用了opencv的adaptiveThreshold函数实现
 * 适合版本 EC 8.3.0+
 * @param map MAP 参数
 *  diameter : 去噪直径 参考opencv的bilateralFilter函数
 *  adaptiveMethod：自适应二值化方式分别是0和1 ，ADAPTIVE_THRESH_MEAN_C=0，ADAPTIVE_THRESH_GAUSSIAN_C = 1
 *  blockSize：计算单位是像素的邻域块，邻域块取多大，就由这个值作决定，3，5，7这样的奇数
 *  c: 偏移值调整量，
 *  {
 *   "diameter":20,
 *   "adaptiveMethod":1,
 *   "c":9,"blockSize":51}
 * @return {null|AutoImage}
 */
AutoImage.prototype.binaryzationEx = function (map) {
    return ____image__.binaryzationEx(this, map);
}

/**
 * 旋转图片
 * @param degree 度数，-90代表逆时针旋转90度，home键在右，90度代表顺时针旋转90度，home键在左
 * @return {null|AutoImage} 对象或者null
 */
AutoImage.prototype.rotate = function (degree) {
    return ____image__.rotate(this, degree);
}

/**
 * 转成base64的字符串
 * @return {string}
 */
AutoImage.prototype.toBase64 = function () {
    return ____image__.toBase64(this);
}
AutoImage.prototype.clip = function (x, y, ex, ey) {
    return ____image__.clip(this, x, y, ex, ey);
}
/**
 * 保存到文件中
 * @param path 路径
 * @return {boolean} true代表成功，false 代表失败
 */
AutoImage.prototype.saveTo = function (path) {
    return ____image__.saveTo(this, path);
}
/**
 * 缩放图片
 * @param w 目标宽度
 * @param h 目标高度
 * @return {null|AutoImage} 对象或者null
 */
AutoImage.prototype.scale = function (w, h) {
    return ____image__.scale(this, w, h);
}

//~~~~ 以下是找图找色操作

/**
 * 在图片中找到颜色和color完全相等的点，；如果没有找到，则返回null。
 * @param color     要寻找的颜色
 * @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
 * @param x 区域的X起始坐标
 * @param y 区域的Y起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param limit 限制个数
 * @param orz 方向，分别从1-8
 * @return {null|PointIndex[]} 坐标点数组或者null
 */
AutoImage.prototype.findColor = function (color, threshold, x, y, ex, ey, limit, orz) {
    return ____image__.findColor(this, color, threshold, x, y, ex, ey, limit, orz);
}

/**
 * 在图片中找到颜色和color完全相等的点，；如果没有找到，则返回null。
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|PointIndex[]} 坐标点数组或者null
 */
AutoImage.prototype.findColorJ = function (jsonFileName) {
    return ____image__.findColorJ(this, jsonFileName);
}


/**
 * 找非色
 * 在图片中找到颜色和color完全不相等的点，如果没有找到，则返回null。
 * @param color 要寻找的颜色，用ec工具可以生成
 * @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
 * @param x 区域的X起始坐标
 * @param y 区域的Y起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param limit 限制个数
 * @param orz 方向，分别从1-8
 * @return {null|PointIndex[]}多个 PointIndex 坐标点数组或者null
 */
AutoImage.prototype.findNotColor = function (color, threshold, x, y, ex, ey, limit, orz) {
    return ____image__.findNotColor(this, color, threshold, x, y, ex, ey, limit, orz);
}
/**
 * 找非色
 * 在图片中找到颜色和color完全不相等的点，如果没有找到，则返回null。
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|PointIndex[]} 坐标点数组或者null
 */
AutoImage.prototype.findNotColorJ = function (jsonFileName) {
    return ____image__.findNotColorJ(this, jsonFileName);
}
/**
 * 多点找色，找到所有符合标准的点，类似于按键精灵的多点找色
 * 整张图片都找不到时返回null
 * @param firstColor 第一个点的颜色
 * @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
 * @param points     字符串类似这样 6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696
 * @param x 区域的X起始坐标
 * @param y 区域的Y起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param limit 限制个数
 * @param orz 方向，分别从1-8
 * @return {null|Point[]} 坐标点数组或者null
 */
AutoImage.prototype.findMultiColor = function (firstColor, points, threshold, x, y, ex, ey, limit, orz) {
    return ____image__.findMultiColor(this, firstColor, points, threshold, x, y, ex, ey, limit, orz);
}


/**
 * 多点找色，找到所有符合标准的点，类似于按键精灵的多点找色
 * 整张图片都找不到时返回null
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|Point[]} 坐标点数组或者null
 */
AutoImage.prototype.findMultiColorJ = function (jsonFileName) {
    return ____image__.findMultiColorJ(this, jsonFileName);
}


/**
 * 单点或者多点比色，找到所有符合标准的点，如果都符合返回true，否则是false
 * @param points     字符串类似这样 6|1|0x969696-0x000010,2|3|0x969696-0x000010
 * @param threshold  找色时颜色相似度取值为 0.0 ~ 1.0
 * @param x 区域的X起始坐标，默认填写0全屏查找
 * @param y 区域的Y起始坐标，默认填写0全屏查找
 * @param ex 终点X坐标，默认填写0全屏查找
 * @param ey 终点Y坐标，默认填写0全屏查找
 * @return {boolean} true代表找到了 false代表未找到
 */
AutoImage.prototype.cmpColor = function (points, threshold, x, y, ex, ey) {
    return ____image__.cmpColor(this, points, threshold, x, y, ex, ey);
}

/**
 * 单点或者多点比色，找到所有符合标准的点，如果都符合返回true，否则是false
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {boolean} true代表找到了 false代表未找到
 */
AutoImage.prototype.cmpColorJ = function (jsonFileName) {
    return ____image__.cmpColorJ(this, jsonFileName);
}


/**
 * 多点或者多点数组比色，找到所有符合标准的点，依次查找，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 * @param points     数组类似这样 ["6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696","6|1|0x969696"]
 * @param threshold  找色时颜色相似度取值为 0.0 ~ 1.0
 * @param x 区域的X起始坐标，默认填写0全屏查找
 * @param y 区域的Y起始坐标，默认填写0全屏查找
 * @param ex 终点X坐标，默认填写0全屏查找
 * @param ey 终点Y坐标，默认填写0全屏查找
 * @return {number} 如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 */
AutoImage.prototype.cmpMultiColor = function (points, threshold, x, y, ex, ey) {
    return ____image__.cmpMultiColor(this, points, threshold, x, y, ex, ey);
}
/**
 * 多点或者多点数组比色，找到所有符合标准的点，依次查找，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {number} 如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 */
AutoImage.prototype.cmpMultiColorJ = function (jsonFileName) {
    return ____image__.cmpMultiColorJ(this, jsonFileName);
}


/**
 * 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * @param template  小图片（模板）
 * @param x         找图区域 x 起始坐标
 * @param y         找图区域 y 起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param weakThreshold  图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param threshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
 * @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
 * @return {null|Rect[]} 区域坐标对象数组或者null
 */
AutoImage.prototype.findImage = function (template, x, y, ex, ey, weakThreshold, threshold, limit, method) {
    return ____image__.findImage(this, template, x, y, ex, ey, weakThreshold, threshold, limit, method);
}


/**
 * 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|Rect[]} 区域坐标对象数组或者null
 */
AutoImage.prototype.findImageJ = function (jsonFileName) {
    return ____image__.findImageJ(this, jsonFileName);
}
/**
 * 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|Rect[]} 区域坐标对象数组或者null
 */
AutoImage.prototype.findImage2J = function (jsonFileName) {
    return ____image__.findImage2J(this, jsonFileName);
}
/**
 * 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * @param template  小图片（模板）
 * @param x         找图区域 x 起始坐标
 * @param y         找图区域 y 起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param weakThreshold  图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param threshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
 * @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
 * @return {null|Rect[]} 区域坐标对象数组或者null
 */
AutoImage.prototype.findImage2 = function (template, x, y, ex, ey, weakThreshold, threshold, limit, method) {
    return ____image__.findImage2(this, template, x, y, ex, ey, weakThreshold, threshold, limit, method);
}
/**
 * OpenCV模板匹配封装
 * @param template      小图片（模板）
 * @param weakThreshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param threshold     图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param rect          找图区域。参见findColor函数关于 rect 的说明
 * @param maxLevel      默认为-1，一般而言不必修改此参数。不加此参数时该参数会根据图片大小自动调整。找图算法是采用图像金字塔进行的, level参数表示金字塔的层次,
 *                      level越大可能带来越高的找图效率，但也可能造成找图失败（图片因过度缩小而无法分辨）或返回错误位置。因此，除非您清楚该参数的意义并需要进行性能调优，否则不需要用到该参数。
 * @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
 * @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
 * @return {null|Match[]} 匹配到的集合
 */
AutoImage.prototype.matchTemplate = function (template, weakThreshold, threshold, rect, maxLevel, limit, method) {
    return ____image__.matchTemplate(this, template, weakThreshold, threshold, rect, maxLevel, limit, method);
}


/**
 * OpenCV模板匹配封装
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|Match[]} 匹配到的集合
 */
AutoImage.prototype.matchTemplateJ = function (jsonFileName) {
    return ____image__.matchTemplateJ(this, jsonFileName);
}

/**
 * OpenCV模板匹配封装
 * 包含缩放找图功能
 * @param template      小图片（模板）
 * @param weakThreshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param threshold     图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param rect          找图区域。参见findColor函数关于 rect 的说明
 * @param maxLevel      默认为-1，一般而言不必修改此参数。不加此参数时该参数会根据图片大小自动调整。找图算法是采用图像金字塔进行的, level参数表示金字塔的层次,
 *                      level越大可能带来越高的找图效率，但也可能造成找图失败（图片因过度缩小而无法分辨）或返回错误位置。因此，除非您清楚该参数的意义并需要进行性能调优，否则不需要用到该参数。
 * @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
 * @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
 * @return {null|Match[]} 匹配到的集合
 */
AutoImage.prototype.matchTemplate2 = function (template, weakThreshold, threshold, rect, maxLevel, limit, method) {
    return ____image__.matchTemplate2(this, template, weakThreshold, threshold, rect, maxLevel, limit, method);
}

/**
 * OpenCV模板匹配封装
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|Match[]} 匹配到的集合
 */
AutoImage.prototype.matchTemplate2J = function (jsonFileName) {
    return ____image__.matchTemplate2J(this, jsonFileName);
}
/**
 * 通过颜色找图，支持透明图，这个不需要处理话opencv
 * 整张图片都找不到时返回null
 * @param template  小图片（模板）
 * @param x         找图区域 x 起始坐标
 * @param y         找图区域 y 起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param threshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
 * @return {null|Point[]} 坐标点数组或者null
 */
AutoImage.prototype.findImageByColor = function (template, x, y, ex, ey, threshold, limit) {
    return ____image__.findImageByColor(this, template, x, y, ex, ey, threshold, limit);
}
/**
 * 通过颜色找图，支持透明图，这个不需要处理话opencv
 * 整张图片都找不到时返回null
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|Point[]} 坐标点数组或者null
 */
AutoImage.prototype.findImageByColorJ = function (jsonFileName) {
    return ____image__.findImageByColorJ(this, jsonFileName);
}
/**
 * 通过颜色找图，支持透明图，这个不需要处理话opencv
 * 整张图片都找不到时返回null
 * @param template  小图片（模板）
 * @param x         找图区域 x 起始坐标
 * @param y         找图区域 y 起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
 * @param extra 扩展函数，map结构例如<br/>
 * {"firstColorOffset":"#101010","firstColorThreshold":1.0,"firstColorOffset":"#101010","otherColorThreshold":0.9,"cmpColorSucThreshold":1.0}
 * <br/>firstColorOffset: 第一个匹配到的颜色偏色,例如 #101010 <br/>
 * firstColorThreshold: 第一个匹配到的颜色偏色系数，例如 0.9<br/>
 * firstColorOffset: 剩下需要找的颜色 偏色,例如 #101010<br/>
 * otherColorThreshold: 剩下需要找的颜色 偏色系数，例如 0.9<br/>
 * cmpColorSucThreshold: 成功匹配多少个颜色系数 就认为是成功的，例如 0.9 = 90%个点<br/>
 * startX: 第一个点从哪里开始找的X坐标<br/>
 * startY: 第一个点从哪里开始找的Y坐标<br/>
 * @return {null|Point[]}  坐标点数组或者null
 */
AutoImage.prototype.findImageByColorEx = function (template, x, y, ex, ey, limit, extra) {
    return ____image__.findImageByColorEx(this, template, x, y, ex, ey, limit, extra);
}


/**
 * 通过颜色找图，支持透明图，这个不需要处理话opencv
 * 整张图片都找不到时返回null
 * @param jsonFileName     res文件中取色工具生成的JSON文件
 * @return {null|Point[]} 坐标点数组或者null
 */
AutoImage.prototype.findImageByColorExJ = function (jsonFileName) {
    return ____image__.findImageByColorExJ(this, jsonFileName);
}

//~~~~ 找图找色操作结束

/**
 * 是否包含某个字符串
 * @param search 子字符串
 * @param start 可选项目
 * @return {boolean} true代表包含 false代表不包含
 */
String.prototype.contains = function (search, start) {
    if (start === undefined) {
        start = 0;
    }
    return this.indexOf(search, start) !== -1;
};

/**
 * 查找元素位置
 * @param item 元素
 * @return {number} 位置，-1代表没有
 */
Array.prototype.indexOf = function (item) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === item)
            return i;
    }
    return -1;
}

/**
 * 移出某个元素
 * @param value 元素
 * @return {boolean} true成功
 */
Array.prototype.remove = function (value) {
    let index = this.indexOf(value);
    if (index > -1) {
        this.splice(index, 1);
    }
    return index > -1;
}


/**
 * 按照索引删除
 * @param index
 * @return {Array|*[]}
 */
Array.prototype.deleteAt = function (index) {
    if (index==null || index == undefined || index < 0) {
        return this;
    }
    return this.slice(0, index).concat(this.slice(index + 1, this.length));
}

/**
 * 数组重新打乱，返回新数组
 * @return {*[]}
 */
Array.prototype.random = function () {
    var tempArr = [], me = this, t;
    while (me.length > 0) {
        t = Math.floor(Math.random() * me.length);
        tempArr[tempArr.length] = me[t];
        me = me.deleteAt(t);
    }
    return tempArr;
}


/**
 * 数组去重
 * @return {*[]}
 */
Array.prototype.arrUnique = function () {
    var reset = [], done = {};
    for (var i = 0; i < this.length; i++) {
        var temp = this[i];
        if (!done[temp]) {
            done[temp] = true;
            reset.push(temp);
        }
    }
    return reset;
}
Array.prototype.contains = function (obj) {
    if (obj == null || obj == undefined) {
        return false;
    }
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2)
}

String.prototype.trim = function () {
    var reExtraSpace = /^\s*(.*?)\s+$/;
    return this.replace(reExtraSpace, "$1")
}

String.prototype.md5 = function () {
    return utils.dataMd5(this)
}
String.prototype.toInt = function () {
    return parseInt(this)
}

String.prototype.toFloat = function () {
    return parseFloat(this)
}

String.prototype.toBoolean = function () {
    return this.trim().toLowerCase() === "true";
}
String.prototype.toQRCode = function (w, h) {
    return utils.createQRCode(this, w, h, null);
}


/**
 * 格式化日期
 * new Date().format("yyyy-MM-dd hh:mm:ss");
 * @param format 格式，例如  yyyy-MM-dd hh:mm:ss
 * @return {string}
 */
Date.prototype.format = function (format) {
    let o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
    return format;
}

