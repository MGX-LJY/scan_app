function PointIndex(javaPoint) {
    this.x = 0;
    this.y = 0;
    this.index = -1;
    if (javaPoint != null) {
        this.x = javaPoint["x"];
        this.y = javaPoint["y"];
        this.index = javaPoint["index"];
    }
}

PointIndex.get = function () {
    return new PointIndex(null);
};
PointIndex.jsonToObject = function (res) {
    if (res == null || res == "") {
        return null;
    }
    try {
        res = JSON.parse(res);
        if (res == null) {
            return null;
        }
        return new Point(res);
    } catch (e) {
    }
    return null;

};
PointIndex.prototype.setX = function (x) {
    this.x = x;
    return this;
};
PointIndex.prototype.setY = function (y) {
    this.y = y;
    return this;
};
PointIndex.prototype.setIndex = function (index) {
    this.index = index;
    return this;
};
PointIndex.prototype.toJSONString = function () {
    return JSON.stringify(this);
};


function ImageWrapper() {

}

var image = new ImageWrapper();
/**
 * 设置图色模块初始化参数，可用于多分辨率兼容
 * @param param
 * auto_click_request_dialog: true 自动点击截图权限对话框
 * auto_detect_orientation: true 自动检测方向 false 不检测方向
 */
ImageWrapper.prototype.setInitParam = function (param) {
    if (imageWrapper == null) {
        return;
    }
    imageWrapper.setInitParam(JSON.stringify(param));
};
/**
 * 切换图片存储模式为opencv的mat格式
 * 这个函数调用会初始化OPENCV，所以打包的时候组件要包含opencv组件(找图组件)
 * 适合 EC  10.18.0+
 * 切换后抓图、读取图片、找图、找色等都会切换到mat格式，速度更快内存更少
 * 如果让图片格式切换请参考 imageToMatFormat和matToImageFormat两个函数
 * @param use 1 是 0 否
 * @return {boolean}  true 成功 false 失败
 */
ImageWrapper.prototype.useOpencvMat = function (use) {
    if (imageWrapper == null) {
        return false;
    }
    return imageWrapper.useOpencvMat(use);
};

/**
 * 截屏时候如果转换mat失败，可以是这个函数试试，一般用不上
 * 这个函数调用会初始化OPENCV，所以打包的时候组件要包含opencv组件
 * 先转为bitmap再转为mat
 * 适合 EC  10.18.0+
 * @param use 1 是 0 否
 * @return {boolean}  true 成功 false 失败
 */
ImageWrapper.prototype.setConvertMatWithBitmap = function (use) {
    if (imageWrapper == null) {
        return false;
    }
    return imageWrapper.setConvertMatWithBitmap(use);
};


/**
 * 设置找色找图的算法模式
 * 适合EC 9.10.0+
 * @param type 1 代表老的查找算法，2代表新的查找算法
 * @return {boolean}
 */
ImageWrapper.prototype.setFindColorImageMode = function (type) {
    if (imageWrapper == null) {
        return false;
    }
    return imageWrapper.setFindColorImageMode(type);
};


/**
 * 转换Mat存储格式
 * 适合 EC  10.18.0+
 * @param img {AutoImage} 图片对象
 * @return {null|AutoImage} MAT存储格式的AutoImage 对象或者null
 */
ImageWrapper.prototype.imageToMatFormat = function (img) {
    if (img == null) {
        return null;
    }
    let xd = imageWrapper.imageToMatFormat(img.uuid);
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};

/**
 * 转换普通image存储格式
 * 适合 EC  10.18.0+
 * @param img {AutoImage} 图片对象
 * @return {null|AutoImage} 普通存储格式的AutoImage 对象或者null
 */
ImageWrapper.prototype.matToImageFormat = function (img) {
    if (img == null) {
        return null;
    }
    let xd = imageWrapper.matToImageFormat(img.uuid);
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};
/**
 * 初始化OPENCV 类库
 * 如果使用找图请先调用这个函数，第一次初始化需要复制类库，时间可能较长，以后再次执行就很快
 * @return {boolean} true 代表成功 false代表失败
 */
ImageWrapper.prototype.initOpenCV = function () {
    if (imageWrapper == null) {
        return false;
    }
    return imageWrapper.initOpenCV();
};


/**
 * 向系统申请屏幕截图权限，返回是否请求成功。
 * <p>
 * 第一次使用该函数会弹出截图权限请求，建议选择“总是允许”。
 * </p>
 * <p>
 * 这个函数只是申请截图权限，并不会真正执行截图，真正的截图函数是captureScreen()。
 * </p>
 * 该函数在截图脚本中只需执行一次，而无需每次调用captureScreen()都调用一次。
 * <p>
 * 建议在本软件界面运行该函数，在其他软件界面运行时容易出现一闪而过的黑屏现象。
 * </P>
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 * @param timeout 超时时间，单位是毫秒
 * @param type 截屏的类型，0 自动选择，1 代表授权模式，2 代表无需权限模式（该模式前提条件：运行模式为代理模式）
 *
 * @return {boolean} true 代表成功 false代表失败
 */
ImageWrapper.prototype.requestScreenCapture = function (timeout, type) {
    if (imageWrapper == null) {
        return false;
    }
    return imageWrapper.requestScreenCapture(timeout, type);
};


/**
 * 释放截屏请求
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 */
ImageWrapper.prototype.releaseScreenCapture = function () {
    if (imageWrapper == null) {
        return;
    }
    imageWrapper.releaseScreenCapture();
};


/**
 * 截取当前屏幕并返回一个Image对象。
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 * <Br/>
 * 如果区域空或则有负数的，就会是全屏
 * @param retryNumber 重试次数，直到能截到图为止，默认是3
 * @param x 截图的起始X坐标
 * @param y 截图的起始Y坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @return {null|AutoImage} AutoImage对象或者null
 */
ImageWrapper.prototype.captureScreen = function (retryNumber, x, y, ex, ey) {
    if (imageWrapper == null) {
        return null;
    }
    var uuid = imageWrapper.captureScreen(retryNumber, x, y, ex - x, ey - y);
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};

/**
 * 将屏幕抓取为Bitmap对象，如果中间有-1或者宽度、宽度为-1，将会是全屏
 * @param format jpg或者png，代理模式下有用
 * @param x 开始X坐标
 * @param y 开始Y坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param q 图片质量，1 - 100，代理模式下有用
 * @return {null|Bitmap} null或者bitmap对象
 */
ImageWrapper.prototype.captureScreenBitmap = function (format, x, y, ex, ey, q) {
    if (imageWrapper == null) {
        return null;
    }
    return imageWrapper.captureScreenBitmap(format, x, y, ex - x, ey - y, q);
};
/**
 * 将屏幕抓取为Bitmap对象，在代理模式下和captureScreenBitmap实现不一样，速度比captureScreenBitmap快
 * 适合版本 EC 8.3.+
 * @return {null|Bitmap} null或者bitmap对象
 */
ImageWrapper.prototype.captureScreenBitmapEx = function () {
    if (imageWrapper == null) {
        return null;
    }
    return imageWrapper.captureScreenBitmapEx("png");
};


/**
 * 抓取全屏
 * @return {null|AutoImage}
 */
ImageWrapper.prototype.captureFullScreen = function () {
    if (imageWrapper == null) {
        return null;
    }
    var uuid = imageWrapper.captureFullScreen();
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};


/**
 * 抓取全屏函数，代理模式下并且requestScreenCapture函数的type为0的时候，会使用截屏函数，尽力消除色差问题。
 * 其他的和captureFullScreen一致
 * @return {null|AutoImage}
 */
ImageWrapper.prototype.captureFullScreenEx = function () {
    if (imageWrapper == null) {
        return null;
    }
    var uuid = imageWrapper.captureFullScreenEx();
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};

/**
 * 截取当前屏幕并以PNG格式保存到path中。如果文件不存在会被创建；文件存在会被覆盖。
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *<Br/>
 * 如果区域空或则有负数的，就会是全屏
 * @param retryNumber 重试次数，直到能截到图为止，默认是3
 * @param x 截图的起始X坐标
 * @param y 截图的起始Y坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param path 截图保存路径
 * @return {boolean} true 截图成功 false 代表不成功
 */
ImageWrapper.prototype.captureToFile = function (retryNumber, x, y, ex, ey, path) {
    if (imageWrapper == null) {
        return false;
    }
    return imageWrapper.captureScreenToFile(retryNumber, x, y, ex - x, ey - y, path);
};

/**
 * 读取在路径path的图片文件并返回一个{@link AutoImage}对象。
 * 如果文件不存在或者文件无法解码则返回null。
 * [注意]: 如果使用代理模式，但是代理服务未启动，将返回null，可以使用readImageNotAgent读取image对象
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *
 * @param path 图片路径
 * @return {null|AutoImage} AutoImage对象或者null
 */
ImageWrapper.prototype.readImage = function (path) {
    if (imageWrapper == null) {
        return null;
    }
    var uuid = imageWrapper.readImage(path);
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};


/**
 * 读取在路径path的图片文件并返回一个{@link AutoImage}对象。
 * 如果文件不存在或者文件无法解码则返回null。
 * [注意]: 这个函数是将图片读取到app进程中，如果你使用的是代理模式并且已经打开了代理服务，请使用readImage函数
 * 适合版本: EC 9.41.0+
 * @param path 图片路径
 * @return {null|AutoImage} AutoImage对象或者null
 */
ImageWrapper.prototype.readImageNotAgent = function (path) {
    if (imageWrapper == null) {
        return null;
    }
    var uuid = imageWrapper.readImageNotAgent(path);
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};

/**
 * 将安卓原生的Bitmap对象转换为AutoImage
 * 适合版本: EC 9.41.0+
 * [注意]: 这个函数是将图片读取到app进程中，如果你使用的是代理模式并且已经打开了代理服务，请使用 bitmapToImage 函数
 * @param bitmap {Bitmap}对象
 * @return {null|AutoImage} 对象
 */
ImageWrapper.prototype.bitmapToImageNotAgent = function (bitmap) {
    if (imageWrapper == null) {
        return null;
    }
    var uuid = imageWrapper.bitmapToImageNotAgent(bitmap);
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};

/**
 * 将res文件夹的文件转换为AutoImage
 * 适合版本: EC 9.41.0+
 * [注意]: 这个函数是将图片读取到app进程中，如果你使用的是代理模式并且已经打开了代理服务，请使用 readResAutoImage 函数
 * @param res {string} res文件夹下的文件路径
 * @return {null|AutoImage} 对象
 */
ImageWrapper.prototype.readResAutoImageNotAgent = function (res) {
    if (res == null) {
        return false;
    }
    let uuid = imageWrapper.readResAutoImageNotAgent(res);
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};

/**
 * 读取在路径path的图片文件并返回一个{@link Bitmap}对象。如果文件不存在或者文件无法解码则返回null。
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *
 * @param path 图片路径
 * @return {null|Bitmap} android的bitmap对象或者null
 */
ImageWrapper.prototype.readBitmap = function (path) {
    if (imageWrapper == null) {
        return null;
    }
    return imageWrapper.readBitmap(path);
};

/**
 * 返回图片image在点(x, y)处的像素的ARGB值。
 * <p>
 * 该值的格式为0xAARRGGBB，是一个"32位整数"
 * <p>
 * 坐标系以图片左上角为原点。以图片左侧边为y轴，上侧边为x轴。
 *
 * @param image1 图片
 * @param x     要获取的像素的横坐标。
 * @param y     要获取的像素的纵坐标。
 * @return {number}
 */
ImageWrapper.prototype.pixelInImage = function (image1, x, y) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    return imageWrapper.pixelInImage(image1.uuid, x, y);
};


/**
 * 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *
 * @param image1     大图片
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
ImageWrapper.prototype.findImage = function (image1, template, x, y, ex, ey, weakThreshold, threshold, limit, method) {
    if (imageWrapper == null || image1 == null || template == null) {
        return null;
    }
    var res = imageWrapper.findImage(image1.uuid, template.uuid, x, y, ex - x, ey - y, weakThreshold, threshold, limit, method);
    return this.toRectList(res);
};
/**
 * 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * @param image1     大图片
 * @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json,小图路径请到json文件配置
 * @return {null|Rect[]} 区域坐标对象数组或者null
 */
ImageWrapper.prototype.findImageJ = function (image1, jsonFileName) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    let templateImg = null;
    try {
        var template = data['template'];
        templateImg = image.readResAutoImage(template);
        if (_isNull(templateImg)) {
            return null;
        }
        var threshold = data['threshold'];
        var weakThreshold = data['weakThreshold'];
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        var method = data['method']
        return this.findImage(image1, templateImg, x, y, ex, ey, weakThreshold, threshold, limit, method);
    } catch (e) {
    } finally {
        if (!_isNull(templateImg)) {
            templateImg.recycle();
        }
    }
    return null;
};


/**
 * 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * 找图函数缩放找图，比findImage更精准
 * 适合版本 EC 9.41.0+
 * @param image1     大图片
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
ImageWrapper.prototype.findImage2 = function (image1, template, x, y, ex, ey, weakThreshold, threshold, limit, method) {
    if (imageWrapper == null || image1 == null || template == null) {
        return null;
    }
    var res = imageWrapper.findImage2(image1.uuid, template.uuid, x, y, ex - x, ey - y, weakThreshold, threshold, limit, method);
    return this.toRectList(res);
};


/**
 * 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * @param image1     大图片
 * @param jsonFileName  使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json,小图路径请到json文件配置
 * @return {null|Rect[]} 区域坐标对象数组或者null
 */
ImageWrapper.prototype.findImage2J = function (image1, jsonFileName) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    let templateImg = null;
    try {
        var template = data['template'];
        templateImg = image.readResAutoImage(template);
        if (_isNull(templateImg)) {
            return null;
        }
        var threshold = data['threshold'];
        var weakThreshold = data['weakThreshold'];
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        var method = data['method']
        return this.findImage2(image1, templateImg, x, y, ex, ey, weakThreshold, threshold, limit, method);
    } catch (e) {
    } finally {
        if (!_isNull(templateImg)) {
            templateImg.recycle();
        }
    }
    return null;

};


/**
 * 找图。在当前屏幕中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
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
ImageWrapper.prototype.findImageEx = function (template, x, y, ex, ey, weakThreshold, threshold, limit, method) {
    if (imageWrapper == null || template == null) {
        return null;
    }
    var res = imageWrapper.findImageCurrentScreen(template.uuid, x, y, ex - x, ey - y, weakThreshold, threshold, limit, method);
    return this.toRectList(res);
};


/**
 * OpenCV模板匹配封装
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *
 * @param image1         大图片
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
ImageWrapper.prototype.matchTemplate = function (image1, template, weakThreshold, threshold, rect, maxLevel, limit, method) {
    if (imageWrapper == null || image1 == null || template == null) {
        return null;
    }
    var drect = rect == null ? null : rect.toJSONString();
    var res = imageWrapper.matchTemplate(image1.uuid, template.uuid, weakThreshold, threshold, drect, maxLevel, limit, method);
    if (res == null || res == "") {
        return null;
    }
    try {
        var d = JSON.parse(res);
        var x = [];
        for (var i = 0; i < d.length; i++) {
            x.push(new Match(d[i]));
        }
        return x;
    } catch (e) {

    }
    return null;
};

/**
 * OpenCV模板匹配封装
 * @param image1         大图片
 * @param jsonFileName  使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json,小图路径请到json文件配置
 * @return {null|Match[]} 匹配到的集合
 */
ImageWrapper.prototype.matchTemplateJ = function (image1, jsonFileName) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    let templateImg = null;
    try {
        var template = data['template'];
        templateImg = image.readResAutoImage(template);
        if (_isNull(templateImg)) {
            return null;
        }
        var threshold = data['threshold'];
        var weakThreshold = data['weakThreshold'];
        let rect = new Rect();
        rect.left = data['x'];
        rect.top = data['y'];
        rect.right = data['ex'];
        rect.bottom = data['ey'];
        var maxLevel = data["maxLevel"]
        var limit = data['limit'];
        var method = data['method']
        return this.matchTemplate(image1, templateImg, weakThreshold, threshold, rect, maxLevel, limit, method);
    } catch (e) {
    } finally {
        if (!_isNull(templateImg)) {
            templateImg.recycle();
        }
    }
    return null;

};


/**
 * OpenCV模板匹配封装
 * 包含缩放找图功能
 * 适配版本 EC 9.41.0+
 * @param image1         大图片
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
ImageWrapper.prototype.matchTemplate2 = function (image1, template, weakThreshold, threshold, rect, maxLevel, limit, method) {
    if (imageWrapper == null || image1 == null || template == null) {
        return null;
    }
    var drect = rect == null ? null : rect.toJSONString();
    var res = imageWrapper.matchTemplate2(image1.uuid, template.uuid, weakThreshold, threshold, drect, maxLevel, limit, method);
    if (res == null || res == "") {
        return null;
    }
    try {
        var d = JSON.parse(res);
        var x = [];
        for (var i = 0; i < d.length; i++) {
            x.push(new Match(d[i]));
        }
        return x;
    } catch (e) {

    }
    return null;

};


/**
 * OpenCV模板匹配封装
 * @param image1         大图片
 * @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json,小图路径请到json文件配置
 * @return {null|Match[]} 匹配到的集合
 */
ImageWrapper.prototype.matchTemplate2J = function (image1, jsonFileName) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    let templateImg = null;
    try {
        var template = data['template'];
        templateImg = image.readResAutoImage(template);
        if (_isNull(templateImg)) {
            return null;
        }
        var threshold = data['threshold'];
        var weakThreshold = data['weakThreshold'];
        let rect = new Rect();
        rect.left = data['x'];
        rect.top = data['y'];
        rect.right = data['ex'];
        rect.bottom = data['ey'];
        var maxLevel = data["maxLevel"]
        var maxLevel = data["maxLevel"]
        var limit = data['limit'];
        var method = data['method']
        return this.matchTemplate2(image1, templateImg, weakThreshold, threshold, rect, maxLevel, limit, method);
    } catch (e) {
    } finally {
        if (!_isNull(templateImg)) {
            templateImg.recycle();
        }
    }
    return null;

};


/**
 * OpenCV模板匹配封装，在当前屏幕截图中进行匹配
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *
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
ImageWrapper.prototype.matchTemplateEx = function (template, weakThreshold, threshold, rect, maxLevel, limit, method) {
    if (imageWrapper == null || template == null) {
        return null;
    }
    var drect = rect == null ? null : rect.toJSONString();
    var res = imageWrapper.matchTemplateCurrentScreen(template.uuid, weakThreshold, threshold, drect, maxLevel, limit, method);
    if (res == null || res == "") {
        return null;
    }
    try {
        var d = JSON.parse(res);
        var x = [];
        for (var i = 0; i < d.length; i++) {
            x.push(new Match(d[i]));
        }
        return x;
    } catch (e) {

    }
    return null;
};


/**
 * 找非色
 * 在图片中找到颜色和color完全不相等的点，如果没有找到，则返回null。
 * 适配EC 9.22.0+
 * 兼容版本: Android 5.0 以上
 * @param image1 图片
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
ImageWrapper.prototype.findNotColor = function (image1, color, threshold, x, y, ex, ey, limit, orz) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }

    color = this.convertFirstColorArrayToString2(color);
    // allNotEquals 这个是用于处理全部判断相等 展示保留，全部设置为true
    let res = imageWrapper.findNotColor(image1.uuid, color, threshold, x, y, ex - x, ey - y, limit, orz, true);
    if (res == null || res == "") {
        return null;
    }
    try {
        let d = JSON.parse(res);
        let x1 = [];
        for (let i = 0; i < d.length; i++) {
            x1.push(new PointIndex(d[i]));
        }
        return x1;
    } catch (e) {

    }
    return null;

};

/**
 * 找非色
 * 在图片中找到颜色和color完全不相等的点，如果没有找到，则返回null。
 * @param image1 图片
 * @param jsonFileName    使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
 * @return {null|PointIndex[]} 多个 PointIndex 坐标点数组或者null
 */
ImageWrapper.prototype.findNotColorJ = function (image1, jsonFileName) {
    // color, threshold, x, y, ex, ey, limit, orz
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    try {
        var color = data['color'];
        var threshold = data['threshold'];
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        var orz = data['orz']
        return this.findNotColor(image1, color, threshold, x, y, ex, ey, limit, orz);
    } catch (e) {
    }
    return null;
}

/**
 * 在图片中找到颜色和color完全相等的点，；如果没有找到，则返回null。
 * 运行环境: 无限制
 * 兼容版本: Android 5.0 以上
 * @param image1 图片
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
ImageWrapper.prototype.findColor = function (image1, color, threshold, x, y, ex, ey, limit, orz) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    color = this.convertFirstColorArrayToString2(color);
    let res = imageWrapper.findColor(image1.uuid, color, threshold, x, y, ex - x, ey - y, limit, orz);
    if (res == null || res == "") {
        return null;
    }
    try {
        let d = JSON.parse(res);
        let x1 = [];
        for (let i = 0; i < d.length; i++) {
            x1.push(new PointIndex(d[i]));
        }
        return x1;
    } catch (e) {

    }
    return null;
};


ImageWrapper.prototype.readResJSONFile = function (jsonFileName) {
    if (_isNull(jsonFileName)) {
        return null;
    }
    if (!jsonFileName.endsWith(".json")) {
        jsonFileName = jsonFileName + ".json";
    }
    let data = readResString(jsonFileName);
    if (data == null || data == "") {
        return null;
    }
    try {
        return JSON.parse(data + "")
    } catch (e) {

    }
    return null;
}

/**
 * 在图片中找到颜色和color完全相等的点，参数从JSON中获取如果没有找到，则返回null。
 * 运行环境: 无限制
 * 兼容版本: Android 5.0 以上
 * @param image 图片
 * @param jsonFileName  使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
 * @return {null|PointIndex[]} 坐标点数组或者null
 */
ImageWrapper.prototype.findColorJ = function (image1, jsonFileName) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    try {
        var firstColor = data['firstColor'];
        var threshold = data['threshold'];
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        var orz = data['orz']
        return this.findColor(image1, firstColor, threshold, x, y, ex, ey, limit, orz);
    } catch (e) {
    }
    return null;

};

/**
 * 在当前屏幕中找到颜色和color完全相等的点，如果没有找到，则返回null。
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *
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
ImageWrapper.prototype.findColorEx = function (color, threshold, x, y, ex, ey, limit, orz) {
    if (imageWrapper == null) {
        return null;
    }
    color = this.convertFirstColorArrayToString2(color);
    let res = imageWrapper.findColorCurrentScreen(color, threshold, x, y, ex - x, ey - y, limit, orz);
    if (res == null || res == "") {
        return null;
    }
    try {
        let d = JSON.parse(res);
        let x1 = [];
        for (var i = 0; i < d.length; i++) {
            x1.push(new PointIndex(d[i]));
        }
        return x1;
    } catch (e) {
        return null;
    }

};

/**
 * 在当前屏幕中找到颜色和color完全相等的点，参数从JSON中获取如果没有找到，则返回null。
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 * @param jsonFileName  使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
 * @return {null|PointIndex[]} 坐标点数组或者null
 */
ImageWrapper.prototype.findColorExJ = function (jsonFileName) {
    if (imageWrapper == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    try {
        var firstColor = data['firstColor'];
        var threshold = data['threshold'];
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        var orz = data['orz']
        return this.findColorEx(firstColor, threshold, x, y, ex, ey, limit, orz);
    } catch (e) {

    }
    return null;
};


/**
 * 多点找色，找到所有符合标准的点，类似于按键精灵的多点找色
 * <p>
 * 整张图片都找不到时返回null
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *
 * @param image1      要找色的图片
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
ImageWrapper.prototype.findMultiColor = function (image1, firstColor, points, threshold, x, y, ex, ey, limit, orz) {
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    firstColor = this.convertFirstColorArrayToString(firstColor);
    points = this.convertMultiColorArrayToString(points);
    let res = imageWrapper.findMultiColor(image1.uuid, firstColor, points, threshold, x, y, ex - x, ey - y, limit, orz);
    if (res == null || res == "") {
        return null;
    }
    try {
        let d = JSON.parse(res);
        let x1 = [];
        for (let i = 0; i < d.length; i++) {
            x1.push(new Point(d[i]));
        }
        return x1;
    } catch (e) {
    }
    return null;

};


/**
 * 多点找色，找到所有符合标准的点，参数从JSON文件中读取，类似于按键精灵的多点找色
 * 整张图片都找不到时返回null
 * 运行环境: 无限制
 * 兼容版本: Android 5.0 以上
 * @param image1      要找色的图片
 * @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
 * @return {null|Point[]} 坐标点数组或者null
 */
ImageWrapper.prototype.findMultiColorJ = function (image1, jsonFileName) {
    //String image, String firstColor, String points, float threshold, int x, int y, int w, int h,int limit
    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    try {
        var firstColor = data['firstColor'];
        var threshold = data['threshold'];
        var points = data['points'];
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        var orz = data['orz'];
        return this.findMultiColor(image1, firstColor, points, threshold, x, y, ex, ey, limit, orz);

    } catch (e) {
    }
    return null;

};


/**
 * 多点找色，找到所有符合标准的点，自动抓取当前屏幕的图片，类似于按键精灵的多点找色
 * 整张图片都找不到时返回null
 * 运行环境: 无限制
 * 兼容版本: Android 5.0 以上
 *
 * @param firstColor 第一个点的颜色
 * @param threshold  找色时颜色相似度取值为 0.0 ~ 1.0
 * @param points     字符串类似这样 6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696
 * @param x 区域的X起始坐标
 * @param y 区域的Y起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param limit 限制个数
 * @param orz 方向，分别从1-8
 * @return {null|Point[]} 坐标点数组或者null
 */
ImageWrapper.prototype.findMultiColorEx = function (firstColor, points, threshold, x, y, ex, ey, limit, orz) {
    //String firstColor, String points, float threshold, int x, int y, int w, int h
    if (imageWrapper == null) {
        return null;
    }
    firstColor = this.convertFirstColorArrayToString(firstColor);
    points = this.convertMultiColorArrayToString(points);
    let res = imageWrapper.findMultiColorCurrentScreen(firstColor, points, threshold, x, y, ex - x, ey - y, limit, orz);
    if (res == null || res == "") {
        return null;
    }
    try {
        let d = JSON.parse(res);
        let x1 = [];
        for (let i = 0; i < d.length; i++) {
            x1.push(new Point(d[i]));
        }
        return x1;
    } catch (e) {
    }
    return null;

};

/**
 * 多点找色，找到所有符合标准的点，自动抓取当前屏幕的图片,参数从JSON文件中读取，类似于按键精灵的多点找色
 * 整张图片都找不到时返回null
 * @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
 * @return {null|Point[]} 坐标点数组或者null
 */
ImageWrapper.prototype.findMultiColorExJ = function (jsonFileName) {
    if (imageWrapper == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    try {
        var firstColor = data['firstColor'];
        var threshold = data['threshold'];
        var points = data['points'];
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        var orz = data['orz'];
        return this.findMultiColorEx(firstColor, points, threshold, x, y, ex, ey, limit, orz);

    } catch (e) {
    }

    return null;
};


/**
 * 单点或者多点比色，找到所有符合标准的点，如果都符合返回true，否则是false
 * 运行环境: 无限制
 * 兼容版本: Android 5.0 以上
 * @param image1 图片
 * @param points     字符串类似这样 6|1|0x969696-0x000010,2|3|0x969696-0x000010
 * @param threshold  找色时颜色相似度取值为 0.0 ~ 1.0
 * @param x 区域的X起始坐标，默认填写0全屏查找
 * @param y 区域的Y起始坐标，默认填写0全屏查找
 * @param ex 终点X坐标，默认填写0全屏查找
 * @param ey 终点Y坐标，默认填写0全屏查找
 * @return {boolean} true代表找到了 false代表未找到
 */
ImageWrapper.prototype.cmpColor = function (image1, points, threshold, x, y, ex, ey) {
    if (imageWrapper == null || image1 == null) {
        return false;
    }
    points = this.convertMultiColorArrayToString(points);
    let index = imageWrapper.cmpColor(image1.uuid, points, threshold, x, y, ex - x, ey - y);
    if (index === -1) {
        return false;
    }
    return true;
};


/**
 * 单点或者多点比色，找到所有符合标准的点，如果都符合返回true，否则是false
 * 运行环境: 无限制
 * 兼容版本: Android 5.0 以上
 * @param image1 图片
 * @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
 * @return {boolean} true代表找到了 false代表未找到
 */
ImageWrapper.prototype.cmpColorJ = function (image1, jsonFileName) {
    if (imageWrapper == null || image1 == null) {
        return false;
    }

    // points, threshold, x, y, ex, ey
    let data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return false;
    }
    try {
        let points = data["points"];
        let threshold = data["threshold"];
        let x = data["x"];
        let y = data["y"];
        let ex = data["ex"];
        let ey = data["ey"];
        return this.cmpColor(image1, points, threshold, x, y, ex, ey);
    } catch (e) {

    }
    return false;
};

/**
 * 单点或者多点比色，找到所有符合标准的点，默认自己截图，如果都符合返回true，否则是false
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 *
 * @param points     字符串类似这样 6|1|0x969696-0x000010,2|3|0x969696-0x000010
 * @param threshold  找色时颜色相似度取值为 0.0 ~ 1.0
 * @param x 区域的X起始坐标，默认填写0全屏查找
 * @param y 区域的Y起始坐标，默认填写0全屏查找
 * @param ex 终点X坐标，默认填写0全屏查找
 * @param ey 终点Y坐标，默认填写0全屏查找
 * @return {boolean} true代表找到了 false代表未找到
 */
ImageWrapper.prototype.cmpColorEx = function (points, threshold, x, y, ex, ey) {
    if (imageWrapper == null) {
        return false;
    }
    points = this.convertMultiColorArrayToString(points);
    let index = imageWrapper.cmpColorCurrentScreen(points, threshold, x, y, ex - x, ey - y);
    if (index === -1) {
        return false;
    }
    return true;
};

/**
 * 多点或者多点数组比色，找到所有符合标准的点，依次查找，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 * @param image1 图片
 * @param points     数组类似这样 ["6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696","6|1|0x969696"]
 * @param threshold  找色时颜色相似度取值为 0.0 ~ 1.0
 * @param x 区域的X起始坐标，默认填写0全屏查找
 * @param y 区域的Y起始坐标，默认填写0全屏查找
 * @param ex 终点X坐标，默认填写0全屏查找
 * @param ey 终点Y坐标，默认填写0全屏查找
 * @return {number} 如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 */
ImageWrapper.prototype.cmpMultiColor = function (image1, points, threshold, x, y, ex, ey) {
    if (imageWrapper == null || image1 == null) {
        return -1;
    }
    if (points != null) {
        // "6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696","6|1|0x969696"
        // 类似这样的字符串 直接 转成数组的 JSON
        if ((typeof points) == "string") {
            return imageWrapper.cmpMultiColor(image1.uuid, JSON.stringify([points]), threshold, x, y, ex - x, ey - y);
        }
        //走老的逻辑
        if ((typeof points[0]) == "string") {
            if (/#|0x/.test(points[0])) {
                return imageWrapper.cmpMultiColor(image1.uuid, JSON.stringify(points), threshold, x, y, ex - x, ey - y);
            }
        }
        let newPoint = [];
        for (let i = 0; i < points.length; i++) {
            newPoint[i] = this.convertMultiCmpColorArrayToString(points[i]);
        }
        return imageWrapper.cmpMultiColor(image1.uuid, JSON.stringify(newPoint), threshold, x, y, ex - x, ey - y);
    }
    return -1;
};

/**
 * 多点或者多点数组比色，找到所有符合标准的点，依次查找，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 * 运行环境: 无限制
 * 兼容版本: Android 5.0 以上
 * @param image1 图片
 * @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
 * @return {number} 如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 */
ImageWrapper.prototype.cmpMultiColorJ = function (image1, jsonFileName) {
    if (imageWrapper == null || image1 == null) {
        return false;
    }

    // points, threshold, x, y, ex, ey
    let data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return -1;
    }
    try {
        let points = data["points"];
        let threshold = data["threshold"];
        let x = data["x"];
        let y = data["y"];
        let ex = data["ex"];
        let ey = data["ey"];
        return this.cmpMultiColor(image1, points, threshold, x, y, ex, ey);
    } catch (e) {

    }
    return -1;
};
/**
 * 多点或者多点数组比色，找到所有符合标准的点，自动截屏，依次查找，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 * @param points     数组类似这样 ["6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696","6|1|0x969696"]
 * @param threshold  找色时颜色相似度取值为 0.0 ~ 1.0
 * @param x 区域的X起始坐标，默认填写0全屏查找
 * @param y 区域的Y起始坐标，默认填写0全屏查找
 * @param ex 终点X坐标，默认填写0全屏查找
 * @param ey 终点Y坐标，默认填写0全屏查找
 * @return {number} 如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
 */
ImageWrapper.prototype.cmpMultiColorEx = function (points, threshold, x, y, ex, ey) {
    if (imageWrapper == null) {
        return -1;
    }
    if (points != null) {
        // "6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696","6|1|0x969696"
        // 类似这样的字符串 直接 转成数组的 JSON
        if ((typeof points) == "string") {
            return imageWrapper.cmpMultiColorCurrentScreen(JSON.stringify([points]), threshold, x, y, ex - x, ey - y);
        }
        //走老的逻辑
        if ((typeof points[0]) == "string") {
            if (/#|0x/.test(points[0])) {
                return imageWrapper.cmpMultiColorCurrentScreen(JSON.stringify(points), threshold, x, y, ex - x, ey - y);
            }
        }
        let newPoint = [];
        for (let i = 0; i < points.length; i++) {
            newPoint[i] = this.convertMultiCmpColorArrayToString(points[i]);
        }
        return imageWrapper.cmpMultiColorCurrentScreen(JSON.stringify(newPoint), threshold, x, y, ex - x, ey - y);
    }
    return -1;
};


/**
 * 取得宽度
 * @param img 图片对象
 * @return {number}
 */
ImageWrapper.prototype.getWidth = function (img) {
    if (img == null) {
        return 0;
    }
    return imageWrapper.getWidth(img.uuid);
};

/**
 * 取得高度
 * @param img 图片对象
 * @return {number}
 */
ImageWrapper.prototype.getHeight = function (img) {
    if (img == null) {
        return 0;
    }
    return imageWrapper.getHeight(img.uuid);
};

/**
 * 保存到文件中
 * @param img 图片对象
 * @param path 路径
 * @return {boolean} true代表成功，false 代表失败
 */
ImageWrapper.prototype.saveTo = function (img, path) {
    if (img == null) {
        return false;
    }
    return imageWrapper.saveTo(img.uuid + "", path);
};
/**
 * 转成base64的字符串
 * @param img 图片对象
 * @return {string}
 */
ImageWrapper.prototype.toBase64 = function (img) {
    if (img == null) {
        return null;
    }
    return javaString2string(imageWrapper.toBase64(img.uuid, "jpg", 100));
};

/**
 *  转成base64的字符串, jpg格式较小，可以减少内存
 * @param img 图片对象
 * @param format 格式  jpg或者 png
 * @param q 质量  1-100，质量越大 越清晰
 * @return {string}
 */
ImageWrapper.prototype.toBase64Format = function (img, format, q) {
    if (img == null) {
        return null;
    }
    return javaString2string(imageWrapper.toBase64(img.uuid, format, q));
};
/**
 * 剪切图片
 * @param img 图片对象
 * @param x x起始坐标
 * @param y y起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @return {null|AutoImage} 对象或者null
 */
ImageWrapper.prototype.clip = function (img, x, y, ex, ey) {
    if (img == null) {
        return null;
    }
    var xd = imageWrapper.clip(img.uuid, x, y, ex - x, ey - y);
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};

/**
 * 缩放图片
 * 适合EC 9.42.0+
 * @param img 图片对象
 * @param w 目标宽度
 * @param h 目标高度
 * @return {null|AutoImage} 对象或者null
 */
ImageWrapper.prototype.scaleImage = function (img, w, h) {
    if (img == null) {
        return null;
    }
    var xd = imageWrapper.scaleImage(img.uuid, w, h);
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};


/**
 * 取得图片的某个点的颜色值
 * @param img 图片对象
 * @param x x坐标点
 * @param y y坐标点
 * @return {number} 颜色值
 */
ImageWrapper.prototype.pixel = function (img, x, y) {
    if (img == null) {
        return 0;
    }
    return imageWrapper.pixel(img.uuid, x, y);
};

/**
 * 将整型的颜色值转成16进制RGB字符串
 * @param color 整型值
 * @return {null|string} 颜色字符串
 */
ImageWrapper.prototype.argb = function (color) {
    if (color == null) {
        return null;
    }
    return imageWrapper.argb(color);
};


/**
 * 取得Bitmap图片的某个点的颜色值
 * @param bitmap 图片对象
 * @param x x坐标点
 * @param y y坐标点
 * @return {number} 颜色值
 */
ImageWrapper.prototype.getPixelBitmap = function (bitmap, x, y) {
    if (imageWrapper == null) {
        return 0;
    }
    return imageWrapper.getPixelBitmap(bitmap, x, y);
};


/**
 * 取得Bitmap图片的某个区域点的颜色值，等同于 Bitmap.getPixels
 * @param bitmap 图片对象
 * @param arraySize 要返回的区域数组的大小
 * @param offset      写入到pixels[]中的第一个像素索引值
 * @param stride      pixels[]中的行间距个数值(必须大于等于位图宽度)。可以为负数
 * @param x          　从位图中读取的第一个像素的x坐标值。
 * @param y           从位图中读取的第一个像素的y坐标值
 * @param width    　　从每一行中读取的像素宽度
 * @param height 　　　读取的行数
 * @return {number} 颜色值数组
 */
ImageWrapper.prototype.getPixelsBitmap = function (bitmap, arraySize, offset, stride, x, y, width, height) {
    if (imageWrapper == null) {
        return null;
    }
    return imageWrapper.getPixelsBitmap(bitmap, arraySize, offset, stride, x, y, width, height);
};

/**
 * 是否被回收了
 * @param img 图片对象
 * @return {boolean} true代表已经被回收了
 */
ImageWrapper.prototype.isRecycled = function (img) {
    if (img == null) {
        return false;
    }
    try {
        let d = img.getClass();
        if (d == "class android.graphics.Bitmap") {
            return img.isRecycled();
        }
    } catch (e) {
    }
    if (img.uuid == null) {
        return false;
    }

    return imageWrapper.isRecycled(img.uuid);
};

/**
 * 回收图片
 * @param img 图片对象
 * @return {boolean}
 */
ImageWrapper.prototype.recycle = function (img) {
    if (img == null) {
        return false;
    }

    try {
        let d = img.getClass();
        if (d == "class android.graphics.Bitmap") {
            img.recycle();
            return true;
        }
    } catch (e) {
    }

    if (img.uuid == null) {
        return false;
    }

    return imageWrapper.recycle(img.uuid);
};

/**
 * 回收所有图片
 * @return {boolean}
 */
ImageWrapper.prototype.recycleAllImage = function () {
    return imageWrapper.recycleAllImage();
}

/**
 *
 * @param res
 * @return {null|Rect[]}
 */
ImageWrapper.prototype.toRectList = function (res) {
    if (res == null || res == "") {
        return null;
    }
    var ps = JSON.parse(res);
    if (ps == null) {
        return null;
    }
    var d = [];
    for (var i = 0; i < ps.length; i++) {
        d.push(new Rect(ps[i]));
    }
    return d;
};

/**
 * 对AutoImage图片进行二值化
 * @param img AutoImage图片对象
 * @param type 二值化类型，一般写1即可
 * 0    灰度值大于阈值为最大值，其他值为<br/>
 * 1    灰度值大于阈值为0，其他值为最大值<br/>
 * 2    灰度值大于阈值的为阈值，其他值不变<br/>
 * 3    灰度值大于阈值的不变，其他值为0<br/>
 * 4    灰度值大于阈值的为零，其他值不变<br/>
 * 7    暂不支持<br/>
 * 8    大津法自动寻求全局阈值<br/>
 * 16    三角形法自动寻求全局阈值<br/>
 * @param threshold 二值化系数，0 ~ 255
 * @return {null|AutoImage} 对象或者null
 */
ImageWrapper.prototype.binaryzation = function (img, type, threshold) {
    if (img == null) {
        return null;
    }
    var xd = imageWrapper.binaryzation(img.uuid, type, threshold);
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};

/**
 * 自适应二值化，使用了opencv的adaptiveThreshold函数实现
 * 适合版本 EC 8.3.0+
 * @param img AutoImage图片对象
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
ImageWrapper.prototype.binaryzationEx = function (img, map) {
    if (img == null) {
        return null;
    }
    var xd = imageWrapper.binaryzationEx(img.uuid, JSON.stringify(map));
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};

/**
 * 灰度图像，使用了opencv的处理
 * 适合版本 EC 11.16.0+
 * @param img AutoImage图片对象
 * @return {null|AutoImage}
 */
ImageWrapper.prototype.gray = function (img) {
    if (img == null) {
        return null;
    }
    var xd = imageWrapper.gray(img.uuid);
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};


/**
 * 对安卓的 Bitmap 图片灰度
 * 适合版本 EC 11.16.0+
 * @param bitmap Bitmap 图片对象
 * @return {null|Bitmap} 对象或者null
 */
ImageWrapper.prototype.grayBitmap = function (bitmap) {
    if (bitmap == null) {
        return null;
    }
    return imageWrapper.grayBitmap(bitmap);
};

/**
 * 自适应二值化，使用了opencv的adaptiveThreshold函数实现
 * 适合版本 EC 8.3.0+
 * @param bitmap Bitmap 图片对象
 * @param map MAP 参数
 *  diameter : 去噪直径 参考opencv的bilateralFilter函数
 *  adaptiveMethod：自适应二值化方式分别是0和1 ，ADAPTIVE_THRESH_MEAN_C=0，ADAPTIVE_THRESH_GAUSSIAN_C = 1
 *  blockSize：计算单位是像素的邻域块，邻域块取多大，就由这个值作决定，3，5，7这样的奇数
 *  c: 偏移值调整量，
 *   {"diameter":20,
 *   "adaptiveMethod":1,
 *   "c":9,"blockSize":51}
 * @return {null|Bitmap} 对象或者null
 **/
ImageWrapper.prototype.binaryzationBitmapEx = function (bitmap, map) {
    if (bitmap == null) {
        return null;
    }
    return imageWrapper.binaryzationBitmapEx(bitmap, JSON.stringify(map));
};

/**
 * 对安卓的 Bitmap 图片进行二值化
 * @param bitmap Bitmap 图片对象
 * @param type 二值化类型，一般写1即可
 * 0    灰度值大于阈值为最大值，其他值为<br/>
 * 1    灰度值大于阈值为0，其他值为最大值<br/>
 * 2    灰度值大于阈值的为阈值，其他值不变<br/>
 * 3    灰度值大于阈值的不变，其他值为0<br/>
 * 4    灰度值大于阈值的为零，其他值不变<br/>
 * 7    暂不支持<br/>
 * 8    大津法自动寻求全局阈值<br/>
 * 16    三角形法自动寻求全局阈值<br/>
 * @param threshold 二值化系数，0 ~ 255
 * @return {null|Bitmap} 对象或者null
 */
ImageWrapper.prototype.binaryzationBitmap = function (bitmap, type, threshold) {
    if (bitmap == null) {
        return null;
    }
    return imageWrapper.binaryzationBitmap(bitmap, type, threshold);
};

/**
 * 剪裁图片，请自行判断参数，正确性
 * @param bitmap 图片
 * @param x 开始X坐标
 * @param y 开始Y坐标
 * @param w 剪裁宽度
 * @param h 剪裁高度
 * @return {null|Bitmap} 安卓的Bitmap对象
 */
ImageWrapper.prototype.clipBitmap = function (bitmap, x, y, w, h) {
    if (bitmap == null) {
        return null;
    }
    return imageWrapper.clipBitmap(bitmap, x, y, w, h);
};
/**
 * 缩放bitmap
 * 适合EC 9.42.0+
 * @param bitmap 图片
 * @param w 目标宽度
 * @param h 目标高度
 * @return {null|Bitmap} 安卓的Bitmap对象
 */
ImageWrapper.prototype.scaleBitmap = function (bitmap, w, h) {
    if (bitmap == null) {
        return null;
    }
    return imageWrapper.scaleBitmap(bitmap, w, h);
};
/**
 * base64字符串转为Bitmap图片
 * @param data base64 数据
 * @param flag base64格式的标示，一般为0，
 * 可选参数为 ：0 默认， 1 无填充模式，2 无换行模式，4 换行模式
 * @return {null|Bitmap} 安卓的Bitmap对象
 */
ImageWrapper.prototype.base64Bitmap = function (data, flag) {
    if (data == null) {
        return null;
    }
    return imageWrapper.base64Bitmap(data, flag);
};
/**
 * 将AutoImage转换为安卓原生的Bitmap对象
 * @param img {AutoImage}
 * @return {null|Bitmap} 对象
 */
ImageWrapper.prototype.imageToBitmap = function (img) {
    if (img == null) {
        return null;
    }
    return imageWrapper.imageToBitmap(img.uuid);
};

/**
 * 将安卓原生的Bitmap对象转换为AutoImage
 * 适合EC 6.15.0+版本
 * @param img {Bitmap}对象
 * @return {null|AutoImage} 对象
 */
ImageWrapper.prototype.bitmapToImage = function (bitmap) {
    var xd = imageWrapper.bitmapToImage(bitmap);
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};


/**
 * bitmap转为base64
 * @param bitmap 图片
 * @param format 格式，jpg或者png
 * @param q 质量  1 - 100
 * @return {string} base64字符串
 */
ImageWrapper.prototype.bitmapBase64 = function (bitmap, format, q) {
    if (bitmap == null) {
        return null;
    }
    var d = imageWrapper.bitmapBase64(bitmap, format, q);
    return javaString2string(d);
};
/**
 * 保存bitmap图像
 * @param bitmap 图片
 * @param format 要保存图像格式，有 png，jpg，webp
 * @param q 要保存图像质量，1-100
 * @param path 要保存图像路径
 * @return {boolean} true 成功 false 失败
 */
ImageWrapper.prototype.saveBitmap = function (bitmap, format, q, path) {
    if (bitmap == null) {
        return false;
    }
    return imageWrapper.saveBitmap(bitmap, format, q, path);
};
/**
 * 旋转Bitmap
 * 支持EC 10.11.0+
 * @param bitmap 安卓的bitmap对象
 * @param degree 度数，-90代表逆时针旋转90度，home键在右，90度代表顺时针旋转90度，home键在左
 * @return {null|Bitmap} 对象或者null
 */
ImageWrapper.prototype.rotateBitmap = function (bitmap, degree) {
    if (bitmap == null) {
        return false;
    }
    return imageWrapper.rotateBitmap(bitmap, degree);
};


/**
 * 旋转图片
 * 支持EC 10.11.0+
 * @param img 图片对象
 * @param degree 度数，-90代表逆时针旋转90度，home键在右，90度代表顺时针旋转90度，home键在左
 * @return {null|AutoImage} 对象或者null
 */
ImageWrapper.prototype.rotateImage = function (img, degree) {
    if (img == null) {
        return null;
    }
    let uuid = imageWrapper.rotateImage(img.uuid, degree);
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};

/**
 *
 * @param res
 * @return {null|AutoImage}
 */
ImageWrapper.prototype.readResAutoImage = function (res) {
    if (res == null) {
        return null;
    }
    let uuid = imageWrapper.readResAutoImage(res);
    if (uuid != null && uuid != undefined && uuid != "") {
        return new AutoImage(uuid);
    }
    return null;
};


/**
 * 使用系统的screencap命令截图AutoImage，适合root或者代理模式, 有root权限或者开启了代理服务
 * 适合版本 EC 6.8.0+
 * @param root 是否优先使用root方式截图
 * @return {null|AutoImage} 对象或者null
 */
ImageWrapper.prototype.screencapImage = function (root) {
    let xd = imageWrapper.screencapImage(root);
    if (xd != null && xd != undefined && xd != "") {
        return new AutoImage(javaString2string(xd));
    }
    return null;
};


/**
 * 使用系统的screencap命令截图为bitmap，适合root或者代理模式, 有root权限或者开启了代理服务
 * 适合版本 EC 6.8.0+
 * @param root 是否优先使用root方式截图
 * @return {Bitmap} 对象
 */
ImageWrapper.prototype.screencapBitmap = function (root) {
    return imageWrapper.screencapBitmap(root);
};


function OCRWrapper() {

}

function OcrInst(s) {
    this.ocrUtil = s;
}

var ocr = new OCRWrapper();


OCRWrapper.prototype.newOcr = function () {
    let u = ocrWrapper.newOcr();
    if (u == null) {
        return null;
    }
    let ins = new OcrInst(u);
    return ins;
}
/**
 * 初始化OCR模块
 * @param map map参数表
 * key分别为：<br/>
 * type : OCR类型，值分别为 paddleOcrNcnnV5 = ncnn版本的PPOCR-V5模型，paddleLiteOcr=paddleLite， paddleOcrOnnxV4=onnx实现的PPOCR-V4模型，paddleOcrOnnxV5=onnx实现的PPOCR-V5模型，  tess = Tesseract模块，baiduOnline=百度在在线识别模块，paddleocr=百度离线的paddleocr，easyedge=百度AI OCR<br/>
 * ocrLite = ocrLite, paddleOcrOnline = EC自带的PC端的paddleOcr服务程序<br/>
 * 如果类型是 tess,请将训练的模型放到 /sdcard/tessdata/ 文件夹下 <br/>
 *  - 参数设置为 : {"type":"tess","language":"chi_sim","debug":false,"ocrEngineMode":3}<br/>
 *  - language: 语言数据集文件， 例如 chi_sim.traineddata 代表是中文简体语言，参数就填写 chi_sim,多个可以用+链接，例如:chi_sim+eng+num<br/>
 *  - ocrEngineMode: 识别引擎类型，0 OEM_TESSERACT_ONLY ， 1 OEM_LSTM_ONLY,2 OEM_TESSERACT_LSTM_COMBINED,3 OEM_DEFAULT<br/>
 *  - rilLevel: PageIteratorLevel 参数，-1 自适应， 0: RIL_BLOCK, 1: RIL_PARA, 2: RIL_TEXTLINE, 3: RIL_WORD, 4:RIL_SYMBOL<br/>
 *  - debug: 代码是否设置调试模式，一般设置false即可<br/>
 *  - path： 放tessdata的文件夹路径，不要加上tessdata，是tessdata文件夹的父级<br/>
 * 如果类型是 baiduOnline, 参数设置为 : {"type":"baiduOnline","ak":"xxx","sk":"xx"}<br/>
 *  - ak = api key,sk = secret key, 百度OCR文档地址 : https://ai.baidu.com/ai-doc/OCR/Ck3h7y2ia<br/>
  * 如果参数是paddleOcrNcnnV5
  * 参数设置为 {"type":"paddleOcrNcnnV5","numThread":2,"padding":32,"maxSideLen":640}
  *  - 参数解释：
  *  - numThread 使用的CPU线程数，默认0，-1代表最大CPU
  *  - padding: 图像外接白框，用于提升识别率，有48，32等，默认 32，影响识别速度和准确率
  *  - modelsDir： 模型路径，如果是外部路径例如 /sdcard/models/代表是sdcard下面的，默认自带有模型 不写这一项即可
  *  - keysName: 训练的文字标签文件路径，可以是外部的 例如 ppocr_keys_v1.txt，默认自带有模型 不写这一项即可
  *  - detName: 检测模型文件名，检测模型的文件名称，不要带.param和.bin，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可
  *  - recName: 识别模型文件名，识别模型的文件名称，不要带.param和.bin，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可
  *  - maxSideLen: 按图像长边进行总体缩放，放大增加识别耗时但精度更高，缩小减小耗时但精度降低，分别有960,640，480，320等，影响识别速度和准确率，默认是640
 * 如果参数是paddleOcrOnnxV4或者paddleOcrOnnxV4
 * 参数设置为 {"type":"paddleOcrOnnxV4","numThread":2,"padding":50}
 *  - 参数解释：
 *  - numThread 使用的CPU线程数，
 *  - modelsDir： 模型路径，如果是外部路径例如 /sdcard/models/代表是sdcard下面的，默认自带有模型 不写这一项即可
 *  - keysName: 训练的文字标签文件路径，可以是外部的 例如 /sdcard/labels/ppocr_keys_v1.txt，默认自带有模型 不写这一项即可
 *  - detName: 检测模型文件名，onnx结尾的文件名称，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可
 *  - recName: 识别模型文件名，onnx结尾的文件名称，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可
 *  - clsName: 分类模型文件名，onnx结尾的文件名称，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可
 *  - padding 图像外接白框，用于提升识别率，文字框没有正确框住所有文字时，增加此值。默认50。<br/>
 *  - maxSideLen 按图像长边进行总体缩放，放大增加识别耗时但精度更高，缩小减小耗时但精度降低，maxSideLen为0表示不缩放。<br/>
 *  - boxScoreThresh 文字框置信度门限，文字框没有正确框住所有文字时，减小此值 <br/>
 *  - boxThresh 同上，自行试验。<br/>
 *  - unClipRatio 单个文字框大小倍率，越大时单个文字框越大。<br/>
 *  - doAngleFlag 启用(1)/禁用(0) 文字方向检测，只有图片倒置的情况下(旋转90~270度的图片)，才需要启用文字方向检测，默认关闭。<br/>
 *  - mostAngleFlag 启用(1)/禁用(0) 角度投票(整张图片以最大可能文字方向来识别)，当禁用文字方向检测时，此项也不起作用，默认关闭。<br/>
 * 如果类型是 paddleLiteOcr,paddlelite版本是v2.14-rc 当前自带的是ppocrv4 优化后的nb模型，有兴趣去github自己搜paddlelite即可，
  * 参数设置为 {"type":"paddleLiteOcr","cpuThreadNum":2,"cpuPowerMode":"LITE_POWER_FULL"}
  *  - 参数解释：
  *  - cpuThreadNum 使用的CPU线程数，
  *  - cpuPowerMode：CPU模式，值有 LITE_POWER_FULL,LITE_POWER_HIGH,LITE_POWER_LOW,LITE_POWER_NO_BIND,LITE_POWER_RAND_HIGH,LITE_POWER_RAND_LOW
  *  - modelPath： 模型路径，如果是外部路径例如 /sdcard/models/代表是sdcard下面的，默认自带有模型 不写这一项即可
  *  - labelPath: 训练的文字标签文件路径，可以是外部的 例如 /sdcard/labels/ppocr_keys_v1.txt，默认自带有模型 不写这一项即可
  *  - detModelFilename: 检测模型文件名，nb结尾的文件名称，放到 modelPath 参数的路径下，默认自带有模型 不写这一项即可
  *  - recModelFilename: 识别模型文件名，nb结尾的文件名称，放到 modelPath 参数的路径下，默认自带有模型 不写这一项即可
  *  - clsModelFilename: 分类模型文件名，nb结尾的文件名称，放到 modelPath 参数的路径下，默认自带有模型 不写这一项即可
 * 如果类型是 ocrLite,
 *  - 参数设置为 : {"type":"ocrLite","numThread":4,"padding":10,"maxSideLen":0}<br/>
 *  - numThread: 线程数量。 <br/>
 *  - padding: 图像预处理，在图片外周添加白边，用于提升识别率，文字框没有正确框住所有文字时，增加此值。<br/>
 *  - maxSideLen: 按图片最长边的长度，此值为0代表不缩放，例：1024，如果图片长边大于1024则把图像整体缩小到1024再进行图像分割计算，如果图片长边小于1024则不缩放，如果图片长边小于32，则缩放到32。<br/>
 * 如果类型设置为: paddleOcrOnline 请到网盘中下载**EasyClick-PaddleOcr.zip文件解压运行**<br/>
 *  - 例子{
 *  	"type": "paddleOcrOnline",
 *      "ocrType":"ONNX_PPOCR_V3",
 *  	"padding": 50,
 *  	"maxSideLen": 0,
 *  	"boxScoreThresh": 0.5,
 *  	"boxThresh": 0.3,
 *  	"unClipRatio": 1.6,
 *  	"doAngleFlag": 0,
 *  	"mostAngleFlag": 0
 *  }<br/>
 *  - ocrType : 模型 ONNX_PPOCR_V3,ONNX_PPOCR_V4,NCNN_PPOCR_V3
 *  - serverUrl：paddle ocr服务器地址，可以在其他电脑部署，然后中控链接，例如 192.168.2.8，部署在电脑就改ip地址即可，端口是 9022 可以不写
 *  - padding 图像外接白框，用于提升识别率，文字框没有正确框住所有文字时，增加此值。默认50。<br/>
 *  - maxSideLen 按图像长边进行总体缩放，放大增加识别耗时但精度更高，缩小减小耗时但精度降低，maxSideLen为0表示不缩放。<br/>
 *  - boxScoreThresh 文字框置信度门限，文字框没有正确框住所有文字时，减小此值 <br/>
 *  - boxThresh 同上，自行试验。<br/>
 *  - unClipRatio 单个文字框大小倍率，越大时单个文字框越大。<br/>
 *  - doAngleFlag 启用(1)/禁用(0) 文字方向检测，只有图片倒置的情况下(旋转90~270度的图片)，才需要启用文字方向检测，默认关闭。<br/>
 *  - mostAngleFlag 启用(1)/禁用(0) 角度投票(整张图片以最大可能文字方向来识别)，当禁用文字方向检测时，此项也不起作用，默认关闭。<br/>
 *  - limit 代表每1秒执行ocr请求个数 默认1000。可以适当降低减少cpu占用<br/>
 *  - checkImage 检查数据是否是图像(1是 0否)默认关闭。<br/>
 * @return {boolean} 布尔型 成功或者失败
 */
OcrInst.prototype.initOcr = function (map) {
    if (map == null) {
        return ocrWrapper.initOcr(this.ocrUtil, null);
    }
    return ocrWrapper.initOcr(this.ocrUtil, JSON.stringify(map));
};

/**
 * 初始化OCR远程服务，只有使用easyedge和paddleocr的时候需要调用
 * @param timeout 超时时间，毫秒
 * @return {boolean} 成功或者失败
 */
OcrInst.prototype.initOcrServer = function (timeout) {
    return ocrWrapper.initOcrServer(this.ocrUtil, timeout);
};

/**
 * OCR远程服务连接上，只有使用easyedge和paddleocr的时候可用
 * @return {bool} 成功或者失败
 */
OCRWrapper.prototype.isOcrServerOk = function () {
    return ocrWrapper.isOcrServerOk(this.ocrUtil);
};


/**
 * 设置OCR实现方式
 * @param type 值分别为 tess = Tesseract模块，baiduOnline=百度在在线识别模块
 * @return {boolean} 成功或者失败
 */
OcrInst.prototype.setOcrType = function (type) {
    return ocrWrapper.setOcrType(this.ocrUtil, type);
};


/**
 * 设置是否守护OCR服务
 * 适合版本 EC 6.9.0+
 * @param daemon true 代表守护，false代表不守护
 * @param delay 每次守护间隔，单位是毫秒
 * @return {boolean} 成功或者失败
 */
OcrInst.prototype.setDaemonServer = function (daemon, delay) {
    return ocrWrapper.setDaemonServer(this.ocrUtil, daemon, delay);
};


/**
 * 释放OCR占用的资源
 * @return {boolean} 成功或者失败
 */
OcrInst.prototype.releaseAll = function () {
    return ocrWrapper.releaseAll(this.ocrUtil);
};


/**
 * 获取错误消息
 * @return {string} null代表没有错误
 */
OcrInst.prototype.getErrorMsg = function () {
    return ocrWrapper.getErrorMsg(this.ocrUtil);
};


/**
 * 对Bitmap进行OCR，返回的是JSON数据，其中数据类似于与：
 *
 * [{
 *    "label": "奇趣装扮三阶盘化",
 *    "confidence": 0.48334712,
 *    "x": 11,
 *    "y": 25,
 *    "width": 100,
 *    "height": 100
 * }]
 *  <br/>
 *  label: 代表是识别的文字
 *  confidence：代表识别的准确度
 *  x: 代表X开始坐标
 *  Y: 代表Y开始坐标
 *  width: 代表宽度
 *  height: 代表高度
 * @param bitmap 图片
 * @param timeout 超时时间 单位毫秒
 * @param extra 扩展参数，map形式，例如 {"token":"xxx"}
 * @return {null|JSON} JSON对象
 */
OcrInst.prototype.ocrBitmap = function (bitmap, timeout, extra) {
    if (bitmap == null) {
        return null;
    }
    var d = ocrWrapper.ocrBitmap(this.ocrUtil, bitmap, timeout, JSON.stringify(extra));

    try {
        if (d != null && d != "") {
            return JSON.parse(d);
        }
        return d;
    } catch (e) {

    }
    return null;
};
/**
 *
 * @param img
 * @param timeout
 * @param extra
 * @return {null|JSON} JSON对象
 */
OcrInst.prototype.ocrImage = function (img, timeout, extra) {
    if (img == null) {
        return null;
    }
    let bitmap = image.imageToBitmap(img)
    if (bitmap == null) {
        return null
    }
    let d = ocrWrapper.ocrBitmap(this.ocrUtil, bitmap, timeout, JSON.stringify(extra));
    if (bitmap != null) {
        bitmap.recycle();
        bitmap = null;
    }
    try {
        if (d != null && d != "") {
            return JSON.parse(d);
        }
        return d;
    } catch (e) {

    }
    return null;

};

/**
 *
 * @param arr
 * @return {string|null}
 */
ImageWrapper.prototype.convertFirstColorArrayToString = function (arr) {
    if (arr) {
        if (typeof arr == "string") {
            return arr;
        }
        if (arr[1] == null || arr[1].length <= 0 || "" == arr[1]) {
            return arr[0];
        }
        return arr[0] + "-" + arr[1];
    }
    return null;
}

/**
 *
 * @param arr
 * @return {string|null|*}
 */
ImageWrapper.prototype.convertMultiColorArrayToString = function (arr) {
    if (arr) {
        if (typeof arr == "string") {
            return arr;
        }
        //转换成类似的字符串 6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696
        let length = arr.length;
        let result = "";
        for (let i = 0; i < length; i = i + 4) {
            if (result.length > 0) {
                result = result + ","
            }
            let p = arr[i + 3];
            if (p == null || p.length <= 0 || "" == p) {
                result = result + arr[i] + "|" + arr[i + 1] + "|" + arr[i + 2];
            } else {
                result = result + arr[i] + "|" + arr[i + 1] + "|" + arr[i + 2] + "-" + arr[i + 3];
            }
        }
        return result;
    }
    return null;
}

/**
 *
 * @param arr
 * @return {string|null}
 */
ImageWrapper.prototype.convertFirstColorArrayToString2 = function (arr) {
    if (arr) {
        if (typeof arr == "string") {
            return arr;
        }
        //转换成类似的字符串 0x969696-0x000010,0x969696,0x969696
        let length = arr.length;
        let result = "";
        for (let i = 0; i < length; i = i + 2) {
            if (result.length > 0) {
                result = result + ","
            }
            let p = arr[i + 1];
            if (p == null || p.length <= 0 || "" == p) {
                result = result + arr[i];
            } else {
                result = result + arr[i] + "-" + arr[i + 1];
            }

        }
        return result;
    }
    return null;
}

/**
 *
 * @param arr
 * @return {string|null|string[]}
 */
ImageWrapper.prototype.convertMultiCmpColorArrayToString = function (arr) {
    if (arr) {
        if (typeof arr == "string") {
            return arr;
        }
        //转换成类似的字符串 6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696
        let length = arr.length;
        let result = [];
        for (let i = 0; i < length; i = i + 4) {
            let p = arr[i + 3];
            if (p == null || p.length <= 0 || "" == p) {
                let tmp = arr[i] + "|" + arr[i + 1] + "|" + arr[i + 2];
                result.push(tmp)
            } else {
                let tmp = arr[i] + "|" + arr[i + 1] + "|" + arr[i + 2] + "-" + arr[i + 3];
                result.push(tmp)
            }
        }
        return result;
    }
    return null;
}

/**
 * 通过颜色找图，支持透明图，这个不需要处理话opencv
 * <p>
 * 整张图片都找不到时返回null
 * <Br/>
 * 运行环境: 无限制
 * <Br/>
 * 兼容版本: Android 5.0 以上
 * @param image1     大图片
 * @param template  小图片（模板）
 * @param x         找图区域 x 起始坐标
 * @param y         找图区域 y 起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param threshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
 * @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
 * @return {null|Point[]} 坐标点数组或者null
 */
ImageWrapper.prototype.findImageByColor = function (image1, template, x, y, ex, ey, threshold, limit) {
    if (imageWrapper == null || image1 == null || template == null) {
        return null;
    }
    let res = imageWrapper.findImageByColor(image1.uuid, template.uuid, x, y, ex - x, ey - y, threshold, limit);
    if (res == null || res == "") {
        return null;
    }
    try {
        let d = JSON.parse(res);
        let x1 = [];
        for (let i = 0; i < d.length; i++) {
            x1.push(new Point(d[i]));
        }
        return x1;
    } catch (e) {

    }
    return null;

};


/**
 * 通过颜色找图，支持透明图，这个不需要处理话opencv
 * 整张图片都找不到时返回null
 * @param image1     大图片
 * @param jsonFileName  使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json,小图路径请到json文件配置
 * @return {null|Point[]} 坐标点数组或者null
 */
ImageWrapper.prototype.findImageByColorJ = function (image1, jsonFileName) {

    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    let templateImg = null;
    try {
        var template = data['template'];
        templateImg = image.readResAutoImage(template);
        if (_isNull(templateImg)) {
            return null;
        }
        var threshold = data['threshold'];
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        return this.findImageByColor(image1, templateImg, x, y, ex, ey, threshold, limit);
    } catch (e) {
    } finally {
        if (!_isNull(templateImg)) {
            templateImg.recycle();
        }
    }
    return null;
};


/**
 * 通过颜色找图，支持透明图，这个不需要处理话opencv
 * <p>
 * 整张图片都找不到时返回null
 * @param image1     大图片
 * @param template  小图片（模板）
 * @param x         找图区域 x 起始坐标
 * @param y         找图区域 y 起始坐标
 * @param ex 终点X坐标
 * @param ey 终点Y坐标
 * @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
 * @param extra 扩展函数，map结构例如<Br/>
 * {"firstColorOffset":"#101010","firstColorThreshold":1.0,"firstColorOffset":"#101010","otherColorThreshold":0.9,"cmpColorSucThreshold":1.0}
 * <Br/>firstColorOffset: 第一个匹配到的颜色偏色,例如 #101010 <Br/>
 * firstColorThreshold: 第一个匹配到的颜色偏色系数，例如 0.9<Br/>
 * firstColorOffset: 剩下需要找的颜色 偏色,例如 #101010<Br/>
 * otherColorThreshold: 剩下需要找的颜色 偏色系数，例如 0.9<Br/>
 * cmpColorSucThreshold: 成功匹配多少个颜色系数 就认为是成功的，例如 0.9 = 90%个点<Br/>
 * startX: 第一个点从哪里开始找的X坐标<Br/>
 * startY: 第一个点从哪里开始找的Y坐标<Br/>
 * @return {null|Point[]}  坐标点数组或者null
 */
ImageWrapper.prototype.findImageByColorEx = function (image1, template, x, y, ex, ey, limit, extra) {
    if (imageWrapper == null || image1 == null || template == null) {
        return;
    }
    if (extra) {
        extra = JSON.stringify(extra);
    }
    let res = imageWrapper.findImageByColorEx(image1.uuid, template.uuid, x, y, ex - x, ey - y, limit, extra);
    if (res == null || res == "") {
        return null;
    }
    try {
        let d = JSON.parse(res);
        let x1 = [];
        for (let i = 0; i < d.length; i++) {
            x1.push(new Point(d[i]));
        }
        return x1;
    } catch (e) {

    }
    return null;

};


/**
 * 通过颜色找图，支持透明图，这个不需要处理话opencv
 * <p>
 * 整张图片都找不到时返回null
 * @param image1     大图片
 * @param jsonFileName   使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json,小图路径请到json文件配置
 * @return {null|Point[]} 坐标点数组或者null
 */
ImageWrapper.prototype.findImageByColorExJ = function (image1, jsonFileName) {


    if (imageWrapper == null || image1 == null) {
        return null;
    }
    var data = this.readResJSONFile(jsonFileName);
    if (data == null) {
        return null;
    }
    let templateImg = null;
    try {
        var template = data['template'];
        templateImg = image.readResAutoImage(template);
        if (_isNull(templateImg)) {
            return null;
        }
        var x = data['x'];
        var y = data['y'];
        var ex = data['ex'];
        var ey = data['ey'];
        var limit = data['limit'];
        var extra = data['extra'];
        return this.findImageByColorEx(image1, templateImg, x, y, ex, ey, limit, extra);
    } catch (e) {
    } finally {
        if (!_isNull(templateImg)) {
            templateImg.recycle();
        }
    }
    return null;
};


function Yolov8Wrapper() {

}

let yolov8Api = new Yolov8Wrapper();

function Yolov8Util(instance) {
    this.yolov8Instance = instance;
}

/**
 * 获取YOLOV8错误消息
 * 适配EC 10.15.0+
 * @return {string} 字符串
 */
Yolov8Util.prototype.getErrorMsg = function () {
    return ocrWrapper.getYolov8ErrorMsg(this.yolov8Instance);
}

/**
 * 获取 yolov8 默认配置
 * 适配EC 10.15.0+
 * @param model_name 模型名称 默认写  yolov8s-640 即可
 * @param input_size yolov8训练时候的imgsz参数，默认写640即可
 * @param box_thr 检测框系数，默认写0.25即可
 * @param iou_thr 输出系数，，默认写0.35 即可
 * @param bind_cpu 是否绑定CPU，选项为ALL,BIG,LITTLE 三个,默认写ALL
 * @param use_vulkan_compute 是否启用硬件加速，1是，0否
 * @param obj_names JSON数组，训练的时候分类名称例如 ["star","common","face"]
 * @return {JSON|null|*} 数据
 */
Yolov8Util.prototype.getDefaultConfig = function (model_name, input_size, box_thr, iou_thr, bind_cpu, use_vulkan_compute, obj_names) {
    if ((typeof obj_names) == "string") {
        obj_names = obj_names.split(",");
    }
    let data = {
        "name": "yolov8s-640",
        "input_size": 640,
        "box_thr": 0.25,
        "iou_thr": 0.35,
        "ver": 8,
        "bind_cpu": "ALL",
        "use_vulkan_compute": 0,
        "input_name": "in0",
        "names": [],
        "outputs": [
            {
                "name": "out0",
                "stride": 0,
                "anchors": [
                    0,
                    0
                ]
            }
        ]
    }
    data["name"] = model_name;
    data["names"] = obj_names;
    data["input_size"] = input_size;
    data["box_thr"] = box_thr;
    data["num_thread"] = 4;
    data["iou_thr"] = iou_thr;
    data["use_vulkan_compute"] = use_vulkan_compute;
    data["bind_cpu"] = bind_cpu;
    return data;
}


/**
 * ONNX的配置选项
 * @param obj_names obj_names JSON数组，可以不写的情况下，onnx从模型中获取，训练的时候分类名称例如 ["star","common","face"]
 * @param input_width 训练的图片尺寸宽度，写0 就是onnx自己提取
 * @param input_height 训练的图片尺寸高度，写0 就是onnx自己提取
 * @param confThreshold 指在ONNX模型推理过程中用于确定检测目标的最小置信度阈值
 * @param iouThreshold 阈值在ONNX模型中用于确定检测框的重叠程度，通常用于非极大值抑制（NMS）过程中
 * @param numThread 线程数量 一般为cpu个数的一般，如果不知道 不写即可
 * @return {JSON}
 */
Yolov8Util.prototype.getOnnxConfig = function (obj_names, input_width, input_height, confThreshold, iouThreshold, numThread) {
    if ((typeof obj_names) == "string") {
        obj_names = obj_names.split(",");
    }
    let data = {
        "obj_names": [],
        "confThreshold": 0.35,
        "iouThreshold": 0.55,
        "imgWidth": 0,
        "imgHeight": 0,
        "numThread": 0
    }
    data["imgWidth"] = input_width;
    data["imgHeight"] = input_height;
    data["iouThreshold"] = iouThreshold;
    data["confThreshold"] = confThreshold;
    data["numThread"] = numThread;
    if (obj_names != null && obj_names.length > 0) {
        data["obj_names"] = obj_names;
    }
    return data;
}


/**
 * 初始化yolov8模型
 * 具体如何生成param和bin文件，请参考文件的yolo使用章节，通过yolo的pt转成ncnn的param、bin文件,
 * 对于onnx模型，binPath参数写null即可，paramPath是onnx文件路径
 * 适配EC 10.15.0+
 * @param map 参数表 ncnn参考 getDefaultConfig函数获取默认的参数，onnx参考getOnnxConfig函数
 * @param paramPath param文件路径
 * @param binPath bin文件路径
 * @return {boolean} true代表成功 false代表失败
 */
Yolov8Util.prototype.initYoloModel = function (map, paramPath, binPath) {
    if (map == null) {
        map = {}
    }
    let data = JSON.stringify(map);
    return ocrWrapper.initYoloModel(this.yolov8Instance, data, paramPath, binPath);
}

/**
 * 检测图片
 * 适配EC 10.15.0+
 * 返回数据例如
 * [{"name":"heart","confidence":0.92,"left":957,"top":986,"right":1050,"bottom":1078}]
 * name: 代表是分类，confidence:代表可信度，left,top,right,bottom代表结果坐标选框
 * @param bitmap 安卓的bitmap对象
 * @param obj_names JSON数组，不写代表不过滤，写了代表只取填写的分类
 * @return {string|null} 字符串数据
 */
Yolov8Util.prototype.detectBitmap = function (bitmap, obj_names) {
    if (bitmap == null) {
        return null;
    }
    if (obj_names == null || obj_names == undefined) {
        obj_names = "[]"
    } else {
        obj_names = JSON.stringify(obj_names)
    }
    return ocrWrapper.detectBitmap(this.yolov8Instance, bitmap, obj_names);
}


/**
 * 检测Image
 * 适配EC 10.16.0+
 * 返回数据例如
 * [{"name":"heart","confidence":0.92,"left":957,"top":986,"right":1050,"bottom":1078}]
 * name: 代表是分类，confidence:代表可信度，left,top,right,bottom代表结果坐标选框
 * @param img AutoImage对象
 * @param obj_names JSON数组，不写代表不过滤，写了代表只取填写的分类
 * @return {string|null} 字符串数据
 */
Yolov8Util.prototype.detectImage = function (img, obj_names) {
    let bitmap = image.imageToBitmap(img)
    if (bitmap == null) {
        return null
    }
    if (obj_names == null || obj_names == undefined) {
        obj_names = "[]"
    } else {
        obj_names = JSON.stringify(obj_names)
    }
    let result = ocrWrapper.detectBitmap(this.yolov8Instance, bitmap, obj_names);
    if (bitmap != null) {
        try {
            bitmap.recycle();
        } catch (e) {
        }
        bitmap = null;
    }
    return result;
}


/**
 * 释放yolov8资源
 * 适配EC 10.15.0+
 * @return {boolean}
 */
Yolov8Util.prototype.release = function () {
    return ocrWrapper.releaseYolo(this.yolov8Instance);
}

/**
 * 初始化yolov8实例(ncnn版本)
 * 适配EC 10.15.0+
 * @return  {Yolov8Util} 实例对象
 */
Yolov8Wrapper.prototype.newYolov8 = function () {
    let instance = ocrWrapper.newYolov8();
    return new Yolov8Util(instance)
}

/**
 * 初始化yolov8实例( onnx 版本)
 * 适配EC 11.6.0+
 * @return  {Yolov8Util} 实例对象
 */
Yolov8Wrapper.prototype.newYolov8Onxx = function () {
    let instance = ocrWrapper.newOnnxYolov8();
    return new Yolov8Util(instance)
}

