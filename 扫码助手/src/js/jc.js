/**
 * @description 查找单个节点命令返回值
 * @type {NodeInfo}
 */
let j_node = null;
/**
 * @description 查找多个节点命令返回值
 * @type {Array}
 */
let j_nodeAll = [];
/**
 * @description 查找父节点命令返回值
 * @type {NodeInfo}
 */
let j_pNode = null;
/**
 * @description 查找子节点命令返回值
 * @type {NodeInfo}
 */
let j_cNode = null;
/**
 * @description 找图命令返回值
 * @type {{x:int,y:int,top:int,left:int,bottom:int,right:int}||{x:int,y:int}}
 */
let j_image = {};
/**
 * @description 找图命令返回值
 * @type {[{x:int,y:int,top:int,left:int,bottom:int,right:int}]||[{x:int,y:int}]}
 */
let j_imageAll = [];
const jc = function () {
    //初始化参数
    function jc() {
        this.RunMode = isAgentMode() ? 'Agent' : isAccMode() ? 'Acc' : null;
        this.imageObj = null;//截图对象
        this.Width = device.getScreenWidth();
        this.Height = device.getScreenHeight();
        this.ecVersion = acEvent.version().split(".").map(Number);
        this.isRoot = shell.su();
        logi('当前运行模式: ' + this.RunMode + ' root权限: ' + this.isRoot + ' 插件版本: 1.0.8 更新时间 2025-11-19 20:32:57');
    }

    /**
     * @description 查找单个节点
     * @param {S} selector 必填,节点选择器
     * @param {NodeInfo|S} byNodeArg 可选,节点对象或者节点选择器,如果填了就是在此节点中查找节点
     * @return {Boolean} 成功返回true,并赋值给j_node,失败返回false
     * @example
     * 用法一: jc.FindNode(text("易点云测")); 查找text属性为"易点云测"的单个节点
     * 用法二: jc.FindNode(text("易点云测"),text("按键精灵")); 在text属性为"按键精灵"的节点中,查找text属性为"易点云测"的单个节点
     * 用法三:
     *  if(jc.FindLv(text("易点云测"),2)){
     *      jc.FindNode(text("易点云测"),j_node);
     *  }
     * 在之前查找返回的j_node对象中,查找text属性为"易点云测"的单个节点
     */
    jc.prototype.FindNode = function (selector, byNodeArg = null) {
        try {
            let tmpNode = null;
            if (byNodeArg) {
                if (this.typeOf(byNodeArg) === 'S') {
                    tmpNode = selector.getOneNodeInfo(0);
                } else if (this.typeOf(byNodeArg) === 'NodeInfo') {
                    tmpNode = byNodeArg;
                } else {
                    logw('FindNode: byNodeArg参数类型不对');
                    return false;
                }
            }
            j_node = tmpNode ? tmpNode.getOneNodeInfo(selector, 0) : selector.getOneNodeInfo(0);
            return !!j_node;
        } catch (e) {
            loge('FindNode: ' + e);
        }
        return false;
    }
    /**
     * @description 查找多个节点
     * @param {S} selector 必填,节点选择器
     * @param {NodeInfo} byNodeInfo 可选,节点对象,如果填了就是在此节点中查找所有符合的节点
     * @return {Boolean} 成功返回true,并赋值给j_nodeAll,失败返回false
     * @example
     * 用法一: jc. FindNodeEx(text("易点云测")); 查找text属性为"易点云测"的所有节点
     * 用法二: jc. FindNodeEx(text("易点云测"),j_node); 在之前查找返回的j_node对象中,查找text属性为"易点云测"的所有节点
     */
    jc.prototype.FindNodeEx = function (selector, byNodeInfo = null) {
        try {
            j_nodeAll = byNodeInfo ? byNodeInfo.getNodeInfo(selector, 0) : selector.getNodeInfo(0);
            return !!j_nodeAll;
        } catch (e) {
            loge('FindNodeEx: ' + e);
        }
        return false;
    }
    /**
     * @description 查找多层父节点
     * @param {S|NodeInfo} arg 必填,节点选择器或者节点对象
     * @param {Number} LevelNumber 可选,数值型,获取父节点层数,默认获取1层
     * @return {Boolean} 成功返回true,并赋值给j_pNode,失败返回false
     * @example
     * 用法一: jc.FindParentEx(text("易点云测"),4); 通过text属性为"易点云测"的节点,获取其向上4层的父节点
     * 用法二: jc.FindParentEx(j_node,4); 在之前查找返回的j_node节点对象中,查找向上4层的父节点
     */
    jc.prototype.FindParentEx = function (arg, LevelNumber) {
        try {
            LevelNumber = LevelNumber || 1;
            let node = this.typeOf(arg) === 'NodeInfo' ? arg : arg.getOneNodeInfo(0);

            for (let i = 0; i < LevelNumber; i++) {
                if (!node) {
                    return false;
                }
                node = node.parent();
            }
            j_pNode = node;
            return !!j_pNode;
        } catch (e) {
            loge('FindParentEx: ' + e);
        }
        return false;
    }
    /**
     * @description 获取多层下级节点 (适合在节点结构稳定,但是下级没有text/desc/id等属性时使用)
     * @param {S|NodeInfo} arg 必填,节点选择器或者节点对象
     * @param {Array} NodeIndexArray 必填,数组型,多层子节点索引
     * @return {Boolean} 成功返回true,并赋值给j_cNode,失败返回false;
     * @example
     * 用法一: jc.FindChildEx(text("易点云测"),[1,2]]);通过text属性为"易点云测"的节点,获取此节点下级index依次是1,2的子节点
     * 用法二: jc.FindChildEx(j_node,[1,2]);通过之前查找返回的j_node节点对象,获取该节点下级index依次是1,2的子节点
     */
    jc.prototype.FindChildEx = function (arg, NodeIndexArray) {
        try {
            let node = this.typeOf(arg) === 'NodeInfo' ? arg : arg.getOneNodeInfo(0);
            for (let i = 0; i < NodeIndexArray.length; i++) {
                if (!node) {
                    return false;
                }
                node = node.child(NodeIndexArray[i]);
            }
            j_cNode = node;
            return !!j_cNode;
        } catch (e) {
            loge('FindChildEx: ' + e);
        }
        return false;
    }
    /**
     * @description 查找同级节点
     * @param {S|NodeInfo} arg 必填,节点选择器或者节点对象
     * @param {Number|S} NodeArg 必填,同级节点下标或节点选择器
     * @return {Boolean} 成功返回true,并赋值给j_node,失败返回false;
     * @example
     * 用法一: jc.FindLv(text("易点云测"),1); 通过text属性为"易点云测"的节点,获取此节点同级index下标为1的节点
     * 用法二: jc.FindLv(j_node,1); 通过之前查找返回的j_node节点对象,获取该节点同级index下标为1的节点
     * 用法三: jc.FindLv(text("易点云测"),text("按键精灵")); 通过text属性为"易点云测"的节点,获取此节点的同级节点中,text属性为"按键精灵"的节点
     * 用法四: jc.FindLv(j_node,text("按键精灵")); 通过之前查找返回的j_node节点对象,获取此节点的同级节点中,text属性为"按键精灵"的节点
     */
    jc.prototype.FindLv = function (arg, NodeArg) {
        try {
            let node = this.typeOf(arg) === 'NodeInfo' ? arg : arg.getOneNodeInfo(0);
            if (node) {
                let pNode = node.parent();
                if (!pNode) return false;
                if (this.typeOf(NodeArg) === 'Number') {
                    j_node = pNode.child(NodeArg);
                    return !!j_node;
                } else if (this.typeOf(NodeArg) === 'S') {
                    return this.FindNode(NodeArg, pNode);
                }
            }
        } catch (e) {
            loge('FindLv: ' + e);
        }
        return false;
    }
    /**
     * 获取节点的坐标范围
     * @param {S|NodeInfo} arg 必填,节点选择器或节点对象
     * @returns {Object|null} 成功返回范围对象,x1,y1,x2,y2分别对应左,上,右,下;失败返回false
     * @example
     * 用法一: jc.getBounds(text("易点云测")); 获取text属性为"易点云测"的节点的坐标范围
     * 用法二: jc.getBounds(j_node); 获取之前查找返回的j_node节点对象的坐标范围
     */
    jc.prototype.getBounds = function (arg) {
        try {
            let node = this.typeOf(arg) === "NodeInfo" ? arg : arg.getOneNodeInfo(0);
            if (node) {
                return {
                    x1: node.bounds.left,
                    y1: node.bounds.top,
                    x2: node.bounds.right,
                    y2: node.bounds.bottom,
                }
            }
        } catch (e) {
            loge('getBounds: ' + e);
        }
        return false;
    }
    /**
     * @param {Number} CaptureMode 可选,截图模式,默认为2
     * @returns {boolean} 成功返回true,并把结果赋值给jc.imageObj,失败返回false
     */
    jc.prototype.captureScreen = function (CaptureMode = 2) {
        try {
            //  注意找图需要用image对象,用bitmap对象会找不到图
            this.imageObj = null;
            image.recycleAllImage();//释放全部截图对象
            switch (CaptureMode) {
                case 1:
                    this.imageObj = image.captureScreen(3, 0, 0, this.Width, this.Height);//返回Image对象
                    break;
                case 2:
                    this.imageObj = image.captureFullScreen();//返回Image对象
                    break;
                case 3:
                    //代理模式下并且requestScreenCapture函数的type为0的时候，会使用截屏函数，尽力消除色差问题
                    this.imageObj = image.captureFullScreenEx();//返回Image对象
                    break;
                case 4:
                    // 使用系统的screencap命令截图AutoImage，适合root或者代理模式, 有root权限或者开启了代理服务
                    this.imageObj = image.screencapImage(true);//返回AutoImage对象
                    break;
                case 5:
                    this.imageObj = image.captureScreenBitmap("png", 0, 0, this.Width, this.Height, 100);//返回bitmap对象
                    break;
                case 6:
                    this.imageObj = image.captureScreenBitmapEx();//返回bitmap对象,速度比上面那个快
                    break;
                case 7:
                    // 使用系统的screencap命令截图为bitmap，适合root或者代理模式, 有root权限或者开启了代理服务
                    this.imageObj = image.screencapBitmap(true);//返回bitmap对象
                    break;
                default:
                    loge('傻逼');
            }
        } catch (e) {
            loge('captureScreen: ' + e);
        }
        return !!this.imageObj;
    }
    /**
     * @description 查找透明图返回单个坐标
     * @param name  {string}    必填,待查找的图片名字,多个图片用|隔开
     * @param left  {int}   可选,起始x坐标
     * @param top   {int}   可选,起始y坐标
     * @param right {int}   可选,终点x坐标
     * @param bottom    {int}   可选,终点y坐标
     * @param threshold {number}    可选,图片相似度。取值范围为0~1的浮点数。默认值为0.9
     * @returns {boolean}   成功true,并将结果赋值给j_image,失败返回false
     * @example
     * 用法一: jc.findImageByColor('易点云测');在整张图片上查找res目录下名字叫 "易点云测" 的图片 (相似度0.9)
     * 用法二: jc.findImageByColor('易点云测|按键精灵',100,200,300,400,0.8);在 100,200,300,400 范围同时查找res目录名字叫 "易点云测"和"按键精灵" 的图片,相似度0.8
     */
    jc.prototype.findImageByColor = function (name, left = 0, top = 0, right = this.Width, bottom = this.Height, threshold = 0.9) {
        try {
            let imgArr = name.split('|').filter(item => item);
            if (this.imageObj) {
                for (let name of imgArr) {
                    let sms = readResAutoImage(name.endsWith('.png') ? name : name + '.png');
                    let points = image.findImageByColor(this.imageObj, sms, left, top, right, bottom, threshold, 1);
                    if (points && points.length > 0) {
                        j_image = {
                            x: points[0].x,
                            y: points[0].y
                        }
                        return true;
                    }
                }
            } else {
                logw('请先调用截图命令');
            }
        } catch (e) {
            loge('findImageByColor: ' + e);
        }
        j_image = {};
        return false;
    }
    /**
     * @description 查找透明图返回多个坐标
     * @param name  {string}    必填,待查找的图片名字,多个图片用|隔开
     * @param left  {int}   可选,起始x坐标
     * @param top   {int}   可选,起始y坐标
     * @param right {int}   可选,终点x坐标
     * @param bottom    {int}   可选,终点y坐标
     * @param threshold {number}    可选,图片相似度。取值范围为0~1的浮点数。默认值为0.9
     * @returns {boolean}   成功true,并将结果赋值给j_imageAll,失败返回false
     * @example
     * 用法一: jc.findImageAllByColor('易点云测');在整张图片上查找res目录下名字叫 "易点云测" 的图片 (相似度0.9)
     * 用法二: jc.findImageAllByColor('易点云测|按键精灵',100,200,300,400,0.8);在 100,200,300,400 范围同时查找res目录名字叫 "易点云测"和"按键精灵" 的图片,相似度0.8
     */
    jc.prototype.findImageAllByColor = function (name, left = 0, top = 0, right = this.Width, bottom = this.Height, threshold = 0.9) {
        try {
            let imgArr = name.split('|').filter(item => item);
            if (this.imageObj) {
                for (let name of imgArr) {
                    let sms = readResAutoImage(name.endsWith('.png') ? name : name + '.png');
                    let points = image.findImageByColor(this.imageObj, sms, left, top, right, bottom, threshold, 20);
                    if (points && points.length > 0) {
                        for (let i = 0; i < points.length; i++) {
                            j_imageAll.push({
                                x: points[i].x,
                                y: points[i].y
                            });
                        }
                        return true;
                    }
                }
            } else {
                logw('请先调用截图命令');
            }
        } catch (e) {
            loge('findImageAllByColor: ' + e);
        }
        j_imageAll = [];
        return false;
    }
    /**
     * @description 查找图片返回单个坐标
     * @param name  {string}    必填,待查找的图片名字,多个图片用|隔开
     * @param left  {int}   可选,起始x坐标
     * @param top   {int}   可选,起始y坐标
     * @param right {int}   可选,终点x坐标
     * @param bottom    {int}   可选,终点y坐标
     * @param threshold {number}    可选,图片相似度。取值范围为0~1的浮点数。默认值为0.9
     * @returns {boolean}   成功true,并将结果赋值给j_image,失败返回false
     * @example
     * 用法一: jc.findImage('易点云测');在整张图片上查找res目录下名字叫 "易点云测" 的图片 (相似度0.9)
     * 用法二: jc.findImage('易点云测|按键精灵',100,200,300,400,0.8);在 100,200,300,400 范围同时查找res目录名字叫 "易点云测"和"按键精灵" 的图片,相似度0.8
     */
    jc.prototype.findImage = function (name, left = 0, top = 0, right = this.Width, bottom = this.Height, threshold = 0.9) {
        try {
            let imgArr = name.split('|').filter(item => item);
            if (this.imageObj) {
                for (let name of imgArr) {
                    let sms = readResAutoImage(name.endsWith('.png') ? name : name + '.png');
                    let points = image.findImage(this.imageObj, sms, left, top, right, bottom, 0.7, threshold, 1, 5);
                    if (points && points.length > 0) {
                        let centerX = ~~(points[0].left + points[0].right) / 2;
                        let centerY = ~~(points[0].top + points[0].bottom) / 2;
                        j_image = {
                            x: centerX,
                            y: centerY,
                            left: points[0].left,
                            top: points[0].top,
                            right: points[0].right,
                            bottom: points[0].bottom
                        }
                        return true;
                    }
                }
            } else {
                logw('请先调用截图命令');
            }
        } catch (e) {
            loge('findImage: ' + e);
        }
        j_image = {};
        return false;
    }
    /**
     * @description 查找图片返回多个坐标
     * @param name  {string}    必填,待查找的图片名字,多个图片用|隔开
     * @param left  {int}   可选,起始x坐标
     * @param top   {int}   可选,起始y坐标
     * @param right {int}   可选,终点x坐标
     * @param bottom    {int}   可选,终点y坐标
     * @param threshold {number}    可选,图片相似度。取值范围为0~1的浮点数。默认值为0.9
     * @returns {boolean}   成功true,并将结果赋值给j_imageAll,失败返回false
     * @example
     * 用法一: jc.findImageAll('易点云测');在整张图片上查找res目录下名字叫 "易点云测" 的图片 (相似度0.9)
     * 用法二: jc.findImageAll('易点云测|按键精灵',100,200,300,400,0.8);在 100,200,300,400 范围同时查找res目录名字叫 "易点云测"和"按键精灵" 的图片,相似度0.8
     */
    jc.prototype.findImageAll = function (name, left = 0, top = 0, right = this.Width, bottom = this.Height, threshold = 0.9) {
        try {
            let imgArr = name.split('|').filter(item => item);
            if (this.imageObj) {
                for (let name of imgArr) {
                    let sms = readResAutoImage(name.endsWith('.png') ? name : name + '.png');
                    let points = image.findImage(this.imageObj, sms, left, top, right, bottom, 0.7, threshold, 20, 5);
                    if (points && points.length > 0) {
                        for (let i = 0; i < points.length; i++) {
                            let centerX = ~~(points[i].left + points[i].right) / 2;
                            let centerY = ~~(points[i].top + points[i].bottom) / 2;
                            j_imageAll.push({
                                x: centerX,
                                y: centerY,
                                left: points[i].left,
                                top: points[i].top,
                                right: points[i].right,
                                bottom: points[i].bottom
                            });
                        }
                        return true;
                    }
                }
            } else {
                logw('请先调用截图命令');
            }
        } catch (e) {
            loge('findImageAll: ' + e);
        }
        j_imageAll = [];
        return false;
    }


    /**
     * @description OpenCV查找图片返回单个坐标
     * @param name  {string}    必填,待查找的图片名字
     * @param left  {int}   可选,起始x坐标
     * @param top   {int}   可选,起始y坐标
     * @param right {int}   可选,终点x坐标
     * @param bottom    {int}   可选,终点y坐标
     * @param threshold {number}    可选,图片相似度。取值范围为0~1的浮点数。默认值为0.9
     * @returns {boolean}   成功返回true,并将结果赋值给j_image,失败返回false; 注意:opencv模式的j_image只有 left 和 top 两个参数有效,其他参数无效!
     * @example
     * 用法一: jc.FindImageByOpenCV('易点云测');在整张图片上面查找res目录下名字叫 "易点云测" 的图片 (相似度默认0.9)
     * 用法二: jc.FindImageByOpenCV('易点云测',100,200,300,400,0.8);在 100,200,300,400 范围查找res目录下名字叫 "易点云测" 的图片,相似度0.8
     */
    jc.prototype.FindImageByOpenCV = function (name, left = 0, top = 0, right = this.Width, bottom = this.Height, threshold = 0.9) {
        try {
            let imgArr = name.split('|').filter(item => item);
            for (let name of imgArr) {
                let sms = readResAutoImage(name.endsWith('.png') ? name : name + '.png');
                if (this.imageObj) {
                    let points = image.matchTemplate(this.imageObj, sms, 0.7, threshold, new Rect({
                        left: left,
                        top: top,
                        right: right,
                        bottom: bottom
                    }), -1, 1, 5);
                    logd(JSON.stringify(points));
                    if (points && points.length > 0) {
                        j_image = {
                            x: points[0].point.x,
                            y: points[0].point.y,
                        }
                        return true;
                    }
                } else {
                    logw('请先调用截图命令');
                }
            }

        } catch (e) {
            loge('FindImageByOpenCV: ' + e);
        }
        j_image = {};
        return false;
    }
    /**
     * @description OpenCV查找图片返回多个坐标
     * @param name  {string}    必填,待查找的图片名字
     * @param left  {int}   可选,起始x坐标
     * @param top   {int}   可选,起始y坐标
     * @param right {int}   可选,终点x坐标
     * @param bottom    {int}   可选,终点y坐标
     * @param threshold {number}    可选,图片相似度。取值范围为0~1的浮点数。默认值为0.9
     * @returns {boolean}   成功返回true,并将结果赋值给j_imageAll,失败返回false; 注意:opencv模式的j_image只有 left 和 top 两个参数有效,其他参数无效!
     * @example
     * 用法一: jc.FindImageAllByOpenCV('易点云测');在整张图片上面查找res目录下名字叫 "易点云测" 的图片 (相似度默认0.9)
     * 用法二: jc.FindImageAllByOpenCV('易点云测',100,200,300,400,0.8);在 100,200,300,400 范围查找res目录下名字叫 "易点云测" 的图片,相似度0.8
     */
    jc.prototype.FindImageAllByOpenCV = function (name, left = 0, top = 0, right = this.Width, bottom = this.Height, threshold = 0.9) {
        try {
            let imgArr = name.split('|').filter(item => item);
            for (let name of imgArr) {
                let sms = readResAutoImage(name.endsWith('.png') ? name : name + '.png');
                if (this.imageObj) {
                    let points = image.matchTemplate(this.imageObj, sms, 0.7, threshold, new Rect({
                        left: left,
                        top: top,
                        right: right,
                        bottom: bottom
                    }), -1, 20, 5);
                    if (points && points.length > 0) {
                        for (let i = 0; i < points.length; i++) {
                            j_imageAll.push({
                                x: points[i].point.x,
                                y: points[i].point.y,
                            });
                        }
                        return true;
                    }
                } else {
                    logw('请先调用截图命令');
                }
            }
        } catch (e) {
            loge('FindImageAllByOpenCV: ' + e);
        }
        j_imageAll = [];
        return false;
    }

    jc.prototype.Root = {
        /**
         * 重启手机 (需要root权限)
         * @returns {*} 无
         */
        reboot: function () {
            shell.sudo('reboot');
        },
        /**
         * b方法
         * @param str
         * @returns {null}
         */
        b: function (str) {
            logd(str);
            return str;
        }
    }

    jc.prototype.Rnd = {
        /**
         * @description 获取随机UUID
         * @return {String} 成功返回随机UUID,失败返回""
         */
        getUUID: function () {
            try {
                return java.util.UUID.randomUUID() + "";
            } catch (e) {
                loge('getUUID:' + e);
            }
            return "";
        }
    }

    jc.prototype.Date = {
        /**
         * @description 时间戳转时间
         * @param {string|Number} t 可选,10位或13位时间戳,不填则默认当前时间
         * @param {string?} MODE 可选,转换模式,默认 yyyy-MM-dd HH:mm:ss
         * @return {String|null} 成功返回转换后的时间,失败返回null
         * @example
         * jc.Date.TimestampToDate(time()) 把当前时间戳转换成时间
         */
        TimestampToDate: function (t = time(), MODE = "yyyy-MM-dd HH:mm:ss") {
            try {
                t = (t + "").length === 13 ? parseInt(t) : t * 1000;
                let OBJ = java.text.SimpleDateFormat(MODE);
                // OBJ.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Shanghai")); // 关键：设置时区
                let date = new Date(t);
                return OBJ.format(date) + "";
            } catch (e) {
                loge('TimestampToDate:' + e);
            }
            return null;
        },
        /**
         * @description 时间转时间戳
         * @param {string} dateTimeStr 必填,待转换的时间
         * @param {string?} MODE 可选,转换模式,默认 yyyy-MM-dd HH:mm:ss
         * @return {Number|null} 成功返回13位时间戳,失败返回null
         * @example
         * jc.Date.DateToTimestamp('2024-5-23 15:24:20')
         */
        DateToTimestamp: function (dateTimeStr, MODE = "yyyy-MM-dd HH:mm:ss") {
            try {
                let OBJ = java.text.SimpleDateFormat(MODE);
                // OBJ.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Shanghai"));//时区用北京的
                let date = OBJ.parse(dateTimeStr);
                return date.getTime();
            } catch (e) {
                loge('DateToTimestamp:' + e);
            }
            return null;
        },
        /**
         * @description 时间戳转UTC时间
         * @param {Number} timestamp 可选,13位时间戳,默认当前时间戳
         * @return {string} utc时间 2025-09-24T02:19:07.146Z
         * @example
         * jc.Date.TimestampToUtc()
         */
        TimestampToUtc: function (timestamp = time()) {
            return new Date(timestamp).toISOString();
        }
    }

    jc.prototype.URL = {
        /**
         * @description URL排序
         * @param {string} str 必填,url参数
         * @return {String|null} 成功返回排序后的字符串,失败返回null
         * @example jc.URL.urlSort(c=2&v=3&a=4)
         */
        urlSort: function (str) {
            try {
                return str.split('&').sort().join('&');
            } catch (e) {
                loge('urlSort: ' + e);
            }
            return null;
        },
        /**
         * @description 对URL参数按照key的字符排序,并返回value拼接
         * @param {string} str 必填,url参数
         * @return {string|null} 成功返回排序后的字符串,失败返回null
         */
        url_Values_Sort: function (str) {
            try {
                return str
                    .split('&')
                    .sort()
                    .map(item => decodeURIComponent(item.split('=')[1]))
                    .join('&');
            } catch (e) {
                loge('url_Values_Sort: ' + e);
            }
            return null;
        },
        /**
         * @description json转url
         * @param {string} json 必填,json字符串
         * @return {String|null} 成功返回url参数,失败返回null
         * @example
         * jsonToUrlParams({"a":"1","b":"2"})
         */
        jsonToUrlParams: function (json) {
            try {
                return Object.keys(json).map(key => key + '=' + json[key]).join('&');
            } catch (e) {
                loge('jsonToUrlParams:' + e);
            }
            return null;
        }
    }

    jc.prototype.App = {
        /**
         * @description 启动APP
         * @param pkgName {string} 必填,包名
         * @return {boolean} 成功返回true,失败返回false
         */
        openApp: function (pkgName) {
            return utils.openApp(pkgName);
        },
        /**
         * @description 停止APP (代理模式才生效)
         * @param pkgName {string} 必填,包名
         * @returns  {boolean} 成功返回true,失败返回false
         */
        stopApp: function (pkgName) {
            return shell.stopApp(pkgName);
        },
        /**
         * @description 跳转到安装APP界面
         * @param path {string} 必填,待app的路径
         * @returns {boolean} 成功返回true,失败返回false
         * @example jc.App.installApp('/sdcard/test.apk')
         */
        installApp: function (path) {
            try {
                return utils.openActivity({
                    "action": "android.intent.action.VIEW",
                    "uri": "file://" + path,
                    "type": "application/vnd.android.package-archive"
                });
            } catch (e) {
                loge('installApp: ' + e);
            }
            return false;
        },
        /**
         * @description 卸载APP (代理模式才生效)
         * @param pkgName {string} 必填,包名
         * @returns {boolean} 成功返回true,失败返回false
         * @example jc.App.uninstallApp('com.tencent.mm')
         */
        uninstallApp: function (pkgName) {
            return shell.uninstallApp(pkgName);
        },
        /**
         * @description 判断APP是否安装
         * @param pkgName {string} 必填,包名
         * @returns {boolean} 成功返回true,失败返回false
         * @example jc.App.isAppExist('com.tencent.mm')
         */
        isAppExist: function (pkgName) {
            return utils.isAppExist(pkgName);
        },
        /**
         * @description 启动APP指定类 (支持多用户,代理模式才生效)
         * @param {String} pkgActivity 必填,包名/类名
         * @param {String|Number} userIndex 可选,分区编号,用于启动不同分区的应用
         * @return {*} 无
         * @example jc.App.openAppActivity('com.tencent.mm/com.tencent.mm.ui.LauncherUI',0)
         */
        openAppActivity: function (pkgActivity, userIndex) {
            try {
                userIndex = userIndex || 0;
                shell.execCommand('am start --user ' + userIndex + ' ' + pkgActivity)
            } catch (e) {
                loge('openAppActivity:' + e);
            }
        },
        /**
         * @description 获取所有已安装的应用包名和名称
         * @param isUserApp {boolean} 可选,是否只获取用户应用
         * @returns {array|null} 成功返回应用列表数组,失败返回null
         */
        getInstalledApps: function (isUserApp) {
            try {
                let list = [];
                let pm = context.getPackageManager();
                let apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);
                for (let i = 0; i < apps.length; i++) {
                    if ((apps[i].flags & ApplicationInfo.FLAG_SYSTEM) !== 0) {
                        if (!isUserApp) {
                            list.push({
                                name: pm.getApplicationLabel(apps[i]) + "",
                                pkg: apps[i].packageName + '',
                                type: 'system'
                            });
                        }
                    } else {
                        list.push({
                            name: pm.getApplicationLabel(apps[i]) + "",
                            pkg: apps[i].packageName + '',
                            type: 'user'
                        });
                    }
                }
                return list;
            } catch (e) {
                loge('getInstalledApps:' + e);
            }
            return null;
        },
        /**
         * @description 获取当前APP的包名
         * @returns {string} 获取成功返回包名,获取失败返回null
         */
        getMyAppPkgName: function () {
            return context.getPackageName() + '';
        },
        /**
         * @description 清理本app数据
         * @return {void}
         */
        cleanMyAppData: function () {
            let list = file.listDir(context.getApplicationInfo().dataDir);
            list.forEach(item => file.deleteAllFile(item));
        },
        /**
         * @description 停止本app
         * @return {void}
         */
        killMyApp: function () {
            closeLogWindow();
            closeCtrlWindow();
            try {
                android.os.Process.killProcess(android.os.Process.myPid());
            } catch (e) {
                java.lang.System.exit(0);
            }
        }
    }

    jc.prototype.System = {
        /**
         * 读取剪贴板内容(支持安卓10以上)
         * @returns {string|null} 成功返回剪贴板内容,失败返回null;
         */
        getClip: function () {
            try {
                floaty.close("clip");
                let editView = new android.widget.EditText(context);
                floaty.showFloatView("clip", editView, 0, -1000);
                floaty.focusable("clip", true);
                floaty.touchable("clip", true);
                let clip = utils.getClipboardText();
                floaty.close("clip");
                return clip;
            } catch (e) {
                loge('getClip:' + e);
            }
            return null;
        },
        /**
         * @description 获取所有短信
         * @param {string} phone 可选,发件人包含指定号码的短信,留空则获取所有短信;
         * @returns {null|array} 成功返回短信数组,失败返回null;
         */
        getSMS: function (phone) {
            try {
                let per = [
                    "android.permission.READ_CALENDAR",
                    "android.permission.READ_SMS"
                ]
                if (!requestRuntimePermission(per, 10000)) {
                    logw('请先长按APP授权短信权限');
                    return null;
                }
                //content://sms/          所有短信
                // content://sms/inbox     收件箱
                // content://sms/sent      已发送
                // content://sms/draft     草稿
                // content://sms/outbox    发件箱
                // content://sms/failed    发送失败
                // content://sms/queued    待发送列表
                let SMS_INBOX = android.net.Uri.parse("content://sms/inbox");
                let list = [];
                //_id        一个自增字段，从1开始,id越大,表示时间越新
                // thread_id  序号，同一发信人的id相同
                // address    发件人手机号码
                // person     联系人列表里的序号，陌生人为null
                // date       发件日期
                // protocol   协议，分为： 0 SMS_RPOTO, 1 MMS_PROTO
                // read       是否阅读 0未读， 1已读
                // status     状态 -1接收，0 complete, 64 pending, 128 failed
                // type       ALL = 0;INBOX = 1;SENT = 2;DRAFT = 3;OUTBOX = 4;FAILED = 5; QUEUED = 6;
                // body       短信内容
                // service_center 短信服务中心号码编号。如+8613800755500
                // subject        短信的主题
                // reply_path_present TP-Reply-Path
                // locked
                let projection = ["_id", "address", "person", "body", "date", "type"];//需要获取的字段
                let selection = phone ? android.provider.Telephony.Sms.ADDRESS + " like ?" : null;//查询条件
                let selectionArgs = phone ? ["%" + phone + "%"] : null;//查询条件的参数
                let cur = context.getContentResolver().query(SMS_INBOX, projection, selection, selectionArgs, android.provider.Telephony.Sms.DATE + " DESC");
                if (cur) {
                    while (cur.moveToNext()) {
                        let index = cur.getString(cur.getColumnIndex("_id")) + '';//序号
                        let telPhone = cur.getString(cur.getColumnIndex("address")) + '';//手机号
                        let body = cur.getString(cur.getColumnIndex("body")) + '';//短信内容
                        let timestamp = cur.getString(cur.getColumnIndex("date")) + '';//时间戳
                        let name = cur.getString(cur.getColumnIndex("person")) + '';//联系人姓名列表
                        let type = cur.getString(cur.getColumnIndex("type")) + '';//短信type,1，接受，2，发送
                        let map = {
                            "phone": telPhone,
                            "name": name,
                            "msg": body,
                            "type": type,
                            "timestamp": timestamp,
                            "index": index
                        };
                        list.push(map);
                    }
                    return list;
                }
            } catch (e) {
                loge('getSMS:' + e);
            }
            return null;
        },
        /**
         * 发送短信
         * @param {string} phone 必填,手机号;
         * @param {string} Message 必填,短信内容;
         * @returns {*}无
         */
        sendSMS: function (phone, Message) {
            try {
                let per = [
                    "android.permission.SEND_SMS",
                ]
                if (!requestRuntimePermission(per, 5000)) {
                    toast('请先授予发送短信权限');
                    logw('请先授予发送短信权限');
                    return;
                }
                let smsManager = android.telephony.SmsManager.getDefault();
                smsManager.sendTextMessage(phone, null, Message, null, null);
            } catch (e) {
                loge('sendSMS:' + e);
            }
        },
        /**
         * 拨打电话
         * @param {string|Number} phoneNumber 必填,手机号;
         * @returns {*} 无
         */
        callPhone: function (phoneNumber) {
            try {
                let per = [
                    "android.permission.CALL_PHONE",
                ]
                if (!requestRuntimePermission(per, 5000)) {
                    toast('请先授予拨打电话权限');
                    logw('请先授予拨打电话权限');
                    return;
                }
                let intent = android.content.Intent(Intent.ACTION_CALL);
                let uri = android.net.Uri.parse("tel:" + phoneNumber);
                intent.setData(uri);
                intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK | android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK);
                if (intent.resolveActivity(context.getPackageManager())) {
                    context.startActivity(intent);
                } else {
                    logd('未找到支持该操作的应用');
                }
            } catch (e) {
                loge('callPhone: ' + e);
            }
        }
    }

    jc.prototype.Utils = {
        /**
         * @description 自动热更新,支持脚本运行途中更新
         * @param t{Number}可选参数,检测间隔,单位:秒;默认300秒
         */
        autoHotUpdate: function (t) {
            t = t * 1000 || 1000 * 300;
            let obj = JSON.parse(readIECFileAsString('update.json'));
            if (!obj.update_url) {
                logw('未设置更新链接');
                return;
            }
            thread.execAsync(function () {
                let initTime = time();
                while (true) {
                    sleep(1000 * 3);
                    if (time() - initTime < t) continue;
                    try {
                        let updateResult = hotupdater.updateReq();
                        if (updateResult) {
                            let path = hotupdater.updateDownload();
                            if (!path) {
                                logw("下载IEC文件错误信息: " + hotupdater.getErrorMsg());
                            } else {
                                restartScript(path, true, 3);
                                return;
                            }
                        }
                    } catch (e) {
                        loge('autoHotUpdate:' + e);
                    }
                    initTime = time();
                }
            })
        },
        /**
         * @description 播放音乐
         * @param name {String} res目录下的音乐文件名
         * @param t {Number} 播放时长,单位:秒
         */
        playMusic: function (name, t) {
            const path = '/sdcard/' + name;
            for (let i = 0; i < 3; i++) {
                try {
                    if (!file.exists(path)) {
                        saveResToFile(name, path);
                    } else {
                        utils.playMp3(path, true);
                        sleep(t * 1000);
                        utils.stopMp3();
                        return;
                    }
                } catch (e) {
                    loge('playMusic: ' + e);
                }
                sleep(500);
            }
            loge('释放音频文件失败');
        },

    }

    jc.prototype.Images = {
        /**
         * @description 裁剪一个圆形的图片并保存为PNG格式
         * @param imagePath {String}    待裁剪图片的路径
         * @param centerX   {int}   圆心X坐标
         * @param centerY   {int}   圆心Y坐标
         * @param radius    {int}   圆形半径
         * @param outputPath    {String}    输出文件路径
         * @returns {boolean}   成功返回true;失败返回false
         * @example
         * CropCircle('/sdcard/666.png', 300, 300, 200, '/sdcard/777.png')
         */
        CropCircle: function (imagePath, centerX, centerY, radius, outputPath) {
            try {
                let bitmap = android.graphics.BitmapFactory.decodeFile(new File(imagePath).getAbsolutePath());
                if (bitmap) {
                    let diameter = radius * 2;// 创建一个输出的 Bitmap，大小为直径 x 直径
                    let output = android.graphics.Bitmap.createBitmap(diameter, diameter, android.graphics.Bitmap.Config.ARGB_8888);
                    // 初始化 Canvas 和 Paint
                    let canvas = new android.graphics.Canvas(output);
                    let paint = new android.graphics.Paint();
                    paint.setAntiAlias(true);//设置抗锯齿
                    // 创建一个圆形的裁剪路径
                    let path = new android.graphics.Path();
                    path.addCircle(radius, radius, radius, android.graphics.Path.Direction.CCW);
                    canvas.clipPath(path); // 将画布裁剪为圆形
                    // 定义源矩形和目标矩形，用于绘制图像
                    let srcRect = new android.graphics.Rect(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
                    let destRect = new android.graphics.Rect(0, 0, diameter, diameter);
                    canvas.drawBitmap(bitmap, srcRect, destRect, paint);// 绘制圆形的图片
                    let out = new java.io.FileOutputStream(outputPath);
                    output.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, out);//输出图片
                    return true;
                }
            } catch (e) {
                loge('CropCircle: ' + e);
            }
            return false;
        },
        /**
         * @description 裁剪一个环形的图片并保存为PNG格式
         * @param imagePath {String}    待裁剪图片的路径
         * @param centerX   {int}   内圆的X坐标（内圆的圆心）
         * @param centerY   {int}   内圆的Y坐标（内圆的圆心）
         * @param innerRadius   {int}   内圆的半径（内环的内径）
         * @param outputPath    {String}    输出文件路径
         * @return  {boolean}   成功返回true;失败返回false
         * @example
         * CropRing('/sdcard/666.png', 300, 300, 200, '/sdcard/777.png')
         */
        CropRing: function (imagePath, centerX, centerY, innerRadius, outputPath) {
            try {
                // 从文件路径加载Bitmap
                let bitmap = android.graphics.BitmapFactory.decodeFile(new File(imagePath).getAbsolutePath());
                if (bitmap) {
                    // 外圆的半径为图片的宽度/高度的一半（假设图片为正方形）
                    let outerRadius = Math.min(bitmap.getWidth(), bitmap.getHeight()) / 2;
                    // 创建一个输出的 Bitmap，大小为外圆直径 x 外圆直径
                    let diameter = outerRadius * 2;
                    let output = android.graphics.Bitmap.createBitmap(diameter, diameter, android.graphics.Bitmap.Config.ARGB_8888);
                    // 初始化 Canvas 和 Paint
                    let canvas = new android.graphics.Canvas(output);
                    let paint = new android.graphics.Paint();
                    paint.setAntiAlias(true);//设置抗锯齿
                    // 创建一个圆形的裁剪路径（外圆）
                    let outerCirclePath = new android.graphics.Path();
                    outerCirclePath.addCircle(outerRadius, outerRadius, outerRadius, android.graphics.Path.Direction.CCW);
                    // 将画布裁剪为外圆
                    canvas.clipPath(outerCirclePath);
                    // 定义源矩形和目标矩形，用于绘制图像
                    let srcRect = new android.graphics.Rect(centerX - outerRadius, centerY - outerRadius, centerX + outerRadius, centerY + outerRadius);
                    let destRect = new android.graphics.Rect(0, 0, diameter, diameter);
                    // 绘制圆形的图片
                    canvas.drawBitmap(bitmap, srcRect, destRect, paint);
                    // 创建一个内圆的裁剪路径，将其区域透明化，形成环形效果
                    paint.setXfermode(new android.graphics.PorterDuffXfermode(android.graphics.PorterDuff.Mode.CLEAR));
                    let innerCirclePath = new android.graphics.Path();
                    innerCirclePath.addCircle(outerRadius, outerRadius, innerRadius, android.graphics.Path.Direction.CCW);
                    canvas.drawPath(innerCirclePath, paint);
                    // 将裁剪好的环形图像保存为 PNG 格式
                    let out = new java.io.FileOutputStream(outputPath);
                    output.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, out);
                    return true;
                }
            } catch (e) {
                loge('CropRing: ' + e);
            }
            return false;
        },

    }

    jc.prototype.File = {
        /**
         * @description 监控文件变化 (需要root权限)
         * @param   path    {string} 路径
         * @param   t   {number} 监控时间(单位:秒)
         * @param   types   {number} 监控类型;1表示只监控文件,2表示只监控文件夹,留空表示文件和文件夹同时监控
         * @returns {*} 无
         */
        MonitorFileByRoot: function (path, t = 30, types = 0) {
            try {
                let params = "-iname '*'";//表示不区分大小写;
                if (types === 1) {
                    params += " -type f";
                } else if (types === 2) {
                    params += " -type d";
                }
                let old_fileList = shell.sudo("find " + path + " -mindepth 1 " + params);
                if (!old_fileList) {
                    return null;
                }
                logw('      开始监控.....');
                let t1 = time();
                t *= 1000;
                while (time() - t1 < t) {
                    let new_fileList = shell.sudo("find " + path + " -mindepth 1 " + params);
                    if (!new_fileList) {
                        return null;
                    }
                    let fileList = new_fileList.split('\n');
                    for (let i = 0; i < fileList.length; i++) {
                        if (!old_fileList.includes(fileList[i])) {
                            logd(fileList[i]);
                            old_fileList += fileList[i] + '\n'
                        }
                    }
                }
            } catch (e) {
                loge('MonitorFile: ' + e);
            }
        },
        /**
         * @description 在指定行插入内容
         * @param filePath {string} 必填,文件路径
         * @param lineIndex {number} 必填,被插入的行号
         * @param content {string|Array} 必填,要插入的内容
         * @return {boolean} 成功返回true;失败返回false
         * @example
         * jc.File.insertLine('/sdcard/1.txt', 1, 'hello');  在第一行插入hello
         * jc.File.insertLine('/sdcard/1.txt', 1, ['hello', 'world']); 在第一行插入hello和world (此时原本第1行的内容就变成了第3行)
         */
        insertLine: function (filePath, lineIndex, content) {
            try {
                let data = file.readAllLines(filePath);
                if (data) {
                    if (typeof lineIndex === 'number' && lineIndex > 0) {
                        data.splice(lineIndex - 1, 0, Array.isArray(content) ? content.join("\n") : content);
                        file.writeFile(data.join("\n"), filePath);
                        return true;
                    } else {
                        logw('lineIndex参数不正确,必须为数字并且大于0!');
                    }
                } else {
                    logw('被插入的文件不存在!');
                }
            } catch (e) {
                loge('insertLine: ' + e);
            }
            return false;
        },
        /**
         * @description 替换文本
         * @param path {string} 必填,文件路径
         * @param oldText {string} 必填,被替换的文本
         * @param newText {string} 必填,替换后的文本
         * @param isAllReplace {boolean} 可选,是否替换所有匹配的文本,默认为false
         * @return {void} 无
         * @example
         * 用法一: jc.File.replaceText('/sdcard/1.txt', 'hello', 'world'); 替换文件中第一个hello为world
         * 用法二: jc.File.replaceText('/sdcard/1.txt', 'hello', 'world',true); 替换文件中所有hello为world
         */
        replaceText: function (path, oldText, newText, isAllReplace = false) {
            try {
                let allTextArr = file.readAllLines(path);
                let reg = isAllReplace ? new RegExp(oldText, 'gm') : oldText;
                let newAllText = allTextArr.join("\n").replace(reg, newText);//这里不能用?让他不报错,否则玩意帐号路径写错了,又会重写新的
                file.writeFile(newAllText, path);
            } catch (e) {
                loge('replaceText: ' + e);
            }
        }
    }

    jc.prototype.Inntent = {
        /**
         * 跳转到应用指定界面
         * @param pkgName{String} 必填,包名
         * @param className{String} 可选,需要跳转的类名
         * @param dataArray{Array} 可选,跳转传递的参数
         * return {*} 无
         */
        openActivityPage: function (pkgName, className, dataArray) {
            // importPackage(android.content);
            // importPackage(android.net);
            //java.lang.Integer();注意类型转换,这是是添加Integer类型的参数
            /*
            FLAG_ACTIVITY_NEW_TASK：如果设置，这个标志会在一个新的任务中启动Activity。当你从一个非Activity的环境（例如BroadcastReceiver或Service）中启动Activity时需要添加这个标志。
            FLAG_ACTIVITY_SINGLE_TOP：如果当前Activity实例位于任务栈的顶部，则不会创建新的Activity实例。相反，Intent会被传递到该Activity的onNewIntent()方法。
            FLAG_ACTIVITY_CLEAR_TOP：如果Activity已经在运行，在任务栈中位于调用Activity的实例上方的所有Activity将被清除，并重新创建该Activity的新实例。
            FLAG_ACTIVITY_CLEAR_TASK：与FLAG_ACTIVITY_NEW_TASK结合使用时，它会清除当前任务的所有Activity。
            FLAG_ACTIVITY_NO_HISTORY：如果设置，新的Activity不会留在历史栈中。一旦用户从该Activity导航出去，Activity就会结束。
             */
            try {
                let intent = new android.content.Intent();
                if (pkgName && className) {
                    //这个和setClassName貌似是一个意思
                    // intent.setComponent(new android.content.ComponentName(pkg, className));
                    intent.setClassName(pkgName, className);
                } else if (pkgName) {
                    intent.setPackage(pkgName);
                }
                if (dataArray) {
                    dataArray.forEach(function (obj) {
                        for (let key in obj) {
                            // logd(key + ' : ' + obj[key]);
                            intent.putExtra(key, obj[key]);
                        }
                    })
                }
                // intent.putExtra('NAV_START_ACTIVITY_UPTIME', java.lang.Long(224092143));
                // intent.putExtra('id', java.lang.Integer(6436));
                intent.setFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK | android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(context.getPackageManager())) {
                    context.startActivity(intent);
                } else {
                    logd('未找到支持该操作的应用');
                }
            } catch (e) {
                loge('openActivityPage: ' + e);
            }
        },
        /**
         * URI跳转
         * @param URI {String} 必填,URI链接
         * @param pkgName {String} 可选,包名
         * @return {*} 无
         * @example
         * jc.Inntent.openURI('http://www.baidu.com','mark.via') 用via浏览器打开百度
         * jc.Inntent.openURI('market://details?id=com.tencent.mm') 跳转商店的微信详情页
         */
        openURI: function (URI, pkgName) {
            //weixin://dl/business/?exit=l1e9ede94f4a219551bfb930f3784d729 这是跳转微信小程序的,l1e9ede94f4a219551bfb930f3784d729是小程序id
            //market://details?id=com.tencent.mm 拉起app商店某个app的详情页,方便评论,com.tencent.mm是包名
            try {
                let intent = new android.content.Intent();
                intent.setAction("android.intent.action.VIEW");
                if (pkgName) intent.setPackage(pkgName);
                intent.setData(android.net.Uri.parse(URI));
                intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(context.getPackageManager())) {
                    context.startActivity(intent);
                } else {
                    logd('未找到支持该操作的应用');
                }
            } catch (e) {
                loge('openURI: ' + e);
            }
        },
        /**
         * @description 使用微信打开某个链接 (需要root权限)
         * @param url {String} 必填,链接
         * @return {*} 无
         * @example jc.Inntent.openUrlByWeiXin('http://www.baidu.com')
         */
        openUrlByWeiXin: function (url) {
            try {
                if (url && url.includes('http')) {
                    shell.sudo('am start --user 0 -n com.tencent.mm/.plugin.webview.ui.tools.WebViewUI -d ' + url.trim());
                } else {
                    logw('链接格式错误');
                }
            } catch (e) {
                loge('openUrlByWeiXin: ' + e);
            }
        }
    }

    jc.prototype.Array = {
        /**
         * @description 获取数组中的最小值
         * @param Array {Array} 必填,数组对象
         * @returns {Number} 数组中的最小值
         */
        min: function (Array) {
            try {
                if (_isArray(Array)) {
                    return Math.min.apply(null, Array);
                } else {
                    loge('参数类型错误');
                }
            } catch (e) {
                loge('min: ' + e);
            }
            return 0;
        },
        /**
         * @description 获取数组中的最大值
         * @param Array {Array} 必填,数组对象
         * @returns {Number} 数组中的最大值
         */
        max: function (Array) {
            try {
                if (_isArray(Array)) {
                    return Math.max.apply(null, Array);
                } else {
                    loge('参数类型错误');
                }
            } catch (e) {
                loge('max: ' + e);
            }
            return 0;
        }
    }

    jc.prototype.Encode = {
        /**
         * @description AES加密
         * @param ALGORITHM {string}  必填,算法模式
         * @param str {string}   必填,待加密的明文
         * @param keyBytes {bytes[]}   必填,密钥
         * @param ivBytes {bytes[]|null}    选填,iv向量
         * @param outHex {boolean} 选填,是否返回16进制字符串(默认返回bse64编码字符串)
         * @returns {string|null}   成功返回加密后的字符串,失败返回null;
         * @example jc.Encode.AES_Encrypt('AES/CBC/PKCS5Padding', 'hello', jc.Encode.stringToBytes("1234561234567890"), jc.Encode.Base64ToBytes("RM6KuwCrgkIcb1lZSvN/4Q=="));
         */
        AES_Encrypt: function (ALGORITHM, str, keyBytes, ivBytes = null, outHex = false) {
            // AES/CBC/PKCS5Padding
            if (!ALGORITHM || !str || !keyBytes) {
                logw('缺少参数');
                return null;
            }
            return this.encode('AES', ALGORITHM, this.stringToBytes(str), keyBytes, ivBytes, outHex);
        },
        /**
         * @description AES解密
         * @param ALGORITHM {string}  必填,算法模式
         * @param str {string}   必填,待解密的明文
         * @param keyBytes {bytes[]}   必填,密钥
         * @param ivBytes {bytes[]|null}    必填,偏移量
         * @param inputHex {boolean} 选填,是否传入16进制字符串(默认传入base64编码字符串)
         * @example jc.Encode.AES_Decrypt('AES/CBC/PKCS5Padding', 'uA1vkuCgNxtOZsGKrGkmzw==', jc.Encode.stringToBytes("1234561234567890"), jc.Encode.stringToBytes("1234561234567890"));
         * @returns {string|null}   成功返回解密后的字符串,失败返回null;
         */
        AES_Decrypt: function (ALGORITHM, str, keyBytes, ivBytes = null, inputHex = false) {
            // AES/CBC/PKCS5Padding
            if (!ALGORITHM || !str || !keyBytes) {
                logw('缺少参数');
                return null;
            }
            let strBytes = inputHex ? this.HexToBytes(str) : this.Base64ToBytes(str);
            return this.decode('AES', ALGORITHM, strBytes, keyBytes, ivBytes);
        },
        /**
         * @description DES加密
         * @param ALGORITHM {string}  必填,算法模式
         * @param str {string}   必填,待加密的明文
         * @param keyBytes {bytes[]}   必填,密钥
         * @param ivBytes {bytes[]|null}    选填,iv向量
         * @param outHex {boolean} 选填,是否返回16进制字符串(默认返回bse64编码字符串)
         * @returns {string|null}   成功返回加密后的字符串,失败返回null;
         * @example jc.Encode.DES_Encrypt('DES/CBC/PKCS5Padding', 'hello', jc.Encode.stringToBytes("12345678"), jc.Encode.stringToBytes("12345678"));
         */
        DES_Encrypt: function (ALGORITHM, str, keyBytes, ivBytes = null, outHex = false) {
            // DES/CBC/PKCS5Padding
            if (!ALGORITHM || !str || !keyBytes) {
                logw('缺少参数');
                return null;
            }
            return this.encode('DES', ALGORITHM, this.stringToBytes(str), keyBytes, ivBytes, outHex);
        },
        /**
         * @description DES解密
         * @param ALGORITHM {string}  必填,算法模式
         * @param str {string}   必填,待解密的明文
         * @param keyBytes {bytes[]}   必填,密钥
         * @param ivBytes {bytes[]|null}    必填,偏移量
         * @param inputHex {boolean} 选填,是否传入16进制字符串(默认传入base64编码字符串)
         * @returns {string|null}   成功返回解密后的字符串,失败返回null;
         * @example jc.Encode.DES_Decrypt('DES/CBC/PKCS5Padding', 'sxqYZRqwq+Q=', jc.Encode.stringToBytes("12345678"), jc.Encode.stringToBytes("12345678"));
         */
        DES_Decrypt: function (ALGORITHM, str, keyBytes, ivBytes = null, inputHex = false) {
            // DES/CBC/PKCS5Padding
            if (!ALGORITHM || !str || !keyBytes) {
                logw('缺少参数');
                return null;
            }
            let strBytes = inputHex ? this.HexToBytes(str) : this.Base64ToBytes(str);
            return this.decode('DES', ALGORITHM, strBytes, keyBytes, ivBytes);
        },
        /**
         * @description 3DES加密
         * @param ALGORITHM {string}  必填,算法模式
         * @param str {string}   必填,待加密的明文
         * @param keyBytes {bytes}   必填,密钥
         * @param ivBytes {bytes}    选填,iv向量
         * @param outHex {boolean} 选填,是否返回16进制字符串(默认返回bse64编码字符串)
         * @returns {string|null}   成功返回加密后的字符串,失败返回null;
         * @example jc.Encode.DESede_Encrypt('DESede/CBC/PKCS5Padding', 'hello', jc.Encode.stringToBytes("123456781234567812345678"), jc.Encode.stringToBytes("123456781234567812345678"));
         */
        DESede_Encrypt: function (ALGORITHM, str, keyBytes, ivBytes = null, outHex = false) {
            // DESede/CBC/PKCS5Padding
            if (!ALGORITHM || !str || !keyBytes) {
                logw('缺少参数');
                return null;
            }
            return this.encode('DESede', ALGORITHM, this.stringToBytes(str), keyBytes, ivBytes, outHex);
        },
        /**
         * @description 3DES解密
         * @param ALGORITHM {string}  必填,算法模式
         * @param str {string}   必填,待解密的明文
         * @param keyBytes {bytes}   必填,密钥
         * @param ivBytes {bytes}    必填,偏移量
         * @param inputHex {boolean} 选填,是否传入16进制字符串(默认传入base64编码字符串)
         * @returns {string|null}   成功返回解密后的字符串,失败返回null;
         * @example jc.Encode.DESede_Decrypt('DESede/CBC/PKCS5Padding', 'sxqYZRqwq+Q=', jc.Encode.stringToBytes("123456781234567812345678"), jc.Encode.stringToBytes("123456781234567812345678"));
         */
        DESede_Decrypt: function (ALGORITHM, str, keyBytes, ivBytes = null, inputHex = false) {
            // DESede/CBC/PKCS5Padding
            if (!ALGORITHM || !str || !keyBytes) {
                logw('缺少参数');
                return null;
            }
            let strBytes = inputHex ? this.HexToBytes(str) : this.Base64ToBytes(str);
            return this.decode('DESede', ALGORITHM, strBytes, keyBytes, ivBytes);
        },
        /**
         * @description RSA公钥加密 (RSA/ECB/PKCS1Padding模式)
         * @param data {string} 必填,待加密的明文
         * @param PublicKey {string}    必填,RSA公钥
         * @param outHex {boolean} 选填,是否返回16进制字符串(默认返回base64编码字符串)
         * @returns {string|null}   成功返回加密后的密文,失败返回null;
         */
        RSA_PublicEncrypt: function (data, PublicKey, outHex = false) {
            if (!data || !PublicKey) {
                logw('缺少参数');
                return null;
            }
            try {
                let dataBytes = this.stringToBytes(data);//获取明文字节数组
                let keyBytes = this.Base64ToBytes(this.FormatPublicKey(PublicKey));//获取公钥字节数组
                let x509KeySpec = java.security.spec.X509EncodedKeySpec(keyBytes);
                let keyFactory = java.security.KeyFactory.getInstance("RSA");
                let publicKey = keyFactory.generatePublic(x509KeySpec);
                let cipher = javax.crypto.Cipher.getInstance("RSA/ECB/PKCS1Padding");//还有RSA模式 //RSA/ECB/PKCS1Padding
                cipher.init(1, publicKey);
                let encryptedData = cipher.doFinal(dataBytes);
                return outHex ? this.bytesToHex(encryptedData) : this.bytesToBase64(encryptedData);
            } catch (e) {
                loge('PublicEncrypt: ' + e);
            }
            return null;
        },
        /**
         * @description RSA私钥解密 (RSA/ECB/PKCS1Padding模式)
         * @param data {string} 必填,待解密的密文
         * @param PrivateKey {string} 必填,RSA私钥
         * @param inputHex {boolean} 选填,是否传入16进制字符串(默认传入base64编码字符串)
         * @returns {string|null} 成功返回解密后的明文,失败返回null;
         */
        RSA_PrivateDecrypt: function (data, PrivateKey, inputHex = false) {
            if (!data || !PrivateKey) {
                logw('缺少参数');
                return null;
            }
            try {
                let dataBytes = inputHex ? this.HexToBytes(data) : this.Base64ToBytes(data);
                let DEFAULT_PRIVATE_KEY = this.FormatPrivateKey(PrivateKey);
                let keyBytes = this.Base64ToBytes(DEFAULT_PRIVATE_KEY);
                let pkcs8KeySpec = java.security.spec.PKCS8EncodedKeySpec(keyBytes);
                let keyFactory = java.security.KeyFactory.getInstance("RSA");
                let privateK = keyFactory.generatePrivate(pkcs8KeySpec);
                let cipher = javax.crypto.Cipher.getInstance("RSA/ECB/PKCS1Padding");
                cipher.init(2, privateK);
                let decodedData = cipher.doFinal(dataBytes);
                return java.lang.String(decodedData) + '';
            } catch (e) {
                loge('PrivateDecrypt: ' + e);
            }
            return null;
        },
        /**
         * @description RSA私钥加密 (RSA/ECB/PKCS1Padding模式)
         * @param data {string} 必填,待加密的明文
         * @param PrivateKey {string}必填, RSA私钥
         * @param outHex {boolean} 选填,是否返回16进制字符串(默认返回base64编码字符串)
         * @returns {string|null} 成功返回加密后的密文,失败返回null;
         */
        RSA_PrivateEncrypt: function (data, PrivateKey, outHex = false) {
            try {
                let dataBytes = this.stringToBytes(data);
                let keyBytes = this.Base64ToBytes(this.FormatPrivateKey(PrivateKey));
                let pkcs8KeySpec = java.security.spec.PKCS8EncodedKeySpec(keyBytes);
                let keyFactory = java.security.KeyFactory.getInstance("RSA");
                let privateK = keyFactory.generatePrivate(pkcs8KeySpec);
                let cipher = javax.crypto.Cipher.getInstance("RSA/ECB/PKCS1Padding");
                cipher.init(1, privateK);
                let encodedData = cipher.doFinal(dataBytes);
                return outHex ? this.bytesToHex(encodedData) : this.bytesToBase64(encodedData);
            } catch (e) {
                loge('PrivateEncrypt: ' + e);
            }
            return null;
        },
        /**
         * @description RSA公钥解密 (RSA/ECB/PKCS1Padding模式)
         * @param data {string}必填,待解密的密文
         * @param PublicKey {string}必填,RSA公钥
         * @param inputHex {boolean} 选填,是否传入16进制字符串(默认传入base64编码字符串)
         * @returns {string|null} 成功返回解密后的明文,失败返回null;
         */
        RSA_PublicDecrypt: function (data, PublicKey, inputHex = false) {
            try {
                let dataBytes = inputHex ? this.HexToBytes(data) : this.Base64ToBytes(data);
                let DEFAULT_PUBLIC_KEY = this.FormatPublicKey(PublicKey);
                let keyBytes = this.Base64ToBytes(DEFAULT_PUBLIC_KEY);
                let x509KeySpec = java.security.spec.X509EncodedKeySpec(keyBytes);
                let keyFactory = java.security.KeyFactory.getInstance("RSA");
                let publicKey = keyFactory.generatePublic(x509KeySpec);
                let cipher = javax.crypto.Cipher.getInstance("RSA/ECB/PKCS1Padding");
                cipher.init(2, publicKey);
                let decodedData = cipher.doFinal(dataBytes);
                return java.lang.String(decodedData) + '';
            } catch (e) {
                loge('PublicDecrypt: ' + e);
            }
            return null;
        },
        /**
         * SHA1签名
         * @param str{String} 必填,待签名的字符串
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        SHA1: function (str, outBase64 = false) {
            return this.digest(str, 'SHA1', outBase64);
        },
        /**
         * SHA224签名
         * @param str{String} 必填,待签名的字符串
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        SHA224: function (str, outBase64 = false) {
            return this.digest(str, 'SHA224', outBase64);
        },
        /**
         * SHA256签名
         * @param str{String} 必填,待签名的字符串
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        SHA256: function (str, outBase64 = false) {
            return this.digest(str, 'SHA256', outBase64);
        },
        /**
         * SHA384签名
         * @param str{String} 必填,待签名的字符串
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        SHA384: function (str, outBase64 = false) {
            return this.digest(str, 'SHA384', outBase64);
        },
        /**
         * SHA512签名
         * @param str{String} 必填,待签名的字符串
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        SHA512: function (str, outBase64 = false) {
            return this.digest(str, 'SHA512', outBase64);
        },
        /**
         * HmacSHA1签名
         * @param str{String} 必填,待签名的字符串
         * @param secretKey{String} 必填,签名密钥
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        HmacSHA1: function (str, secretKey, outBase64 = false) {
            return this.mac(str, secretKey, 'HmacSHA1', outBase64);
        },
        /**
         * HmacSHA224签名
         * @param str{String} 必填,待签名的字符串
         * @param secretKey{String} 必填,签名密钥
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        HmacSHA224: function (str, secretKey, outBase64 = false) {
            return this.mac(str, secretKey, 'HmacSHA224', outBase64);
        },
        /**
         * HmacSHA256签名
         * @param str{String} 必填,待签名的字符串
         * @param secretKey{String} 必填,签名密钥
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         * @constructor
         */
        HmacSHA256: function (str, secretKey, outBase64 = false) {
            return this.mac(str, secretKey, 'HmacSHA256', outBase64);
        },
        /**
         * HmacSHA384签名
         * @param str{String} 必填,待签名的字符串
         * @param secretKey{String} 必填,签名密钥
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回16进制字符串,失败返回null
         */
        HmacSHA384: function (str, secretKey, outBase64 = false) {
            return this.mac(str, secretKey, 'HmacSHA384', outBase64);
        },
        /**
         * HmacSHA512签名
         * @param str{String} 必填,待签名的字符串
         * @param secretKey{String} 必填,签名密钥
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        HmacSHA512: function (str, secretKey, outBase64 = false) {
            return this.mac(str, secretKey, 'HmacSHA512', outBase64);
        },
        /**
         * HmacMD5签名
         * @param str{String} 必填,待签名的字符串
         * @param secretKey{String} 必填,签名密钥
         * @param outBase64{boolean} 选填,是否返回base64编码字符串(默认返回16进制字符串)
         * @returns {String|null} 成功返回字符串,失败返回null
         */
        HmacMD5: function (str, secretKey, outBase64 = false) {
            return this.mac(str, secretKey, 'HmacMD5', outBase64);
        },
        /**
         * @description bytes数组转十六进制字符串
         * @param bytes{bytes[]} 必填,bytes数组
         * @return {string|null} 成功返回十六进制字符串,失败返回null
         */
        bytesToHex: function (bytes) {
            try {
                let HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
                let hexChars = "";
                let v = null;
                for (let j = 0; j < bytes.length; j++) {
                    v = bytes[j] & 0xFF
                    hexChars += HEX_CHARS[v >>> 4] + HEX_CHARS[v & 0x0F]
                }
                return hexChars;
            } catch (e) {
                loge('bytesToHex' + e);
            }
            return null;
        },
        /**
         * @description 十六进制字符串转bytes数组
         * @param str{String} 必填,十六进制字符串
         * @return {Bytes[]|null} 成功返回bytes数组,失败返回null
         */
        HexToBytes: function (str) {
            try {
                let data = java.lang.String(str).toLowerCase();
                let len = data.length();//这里必须加上这个括号,否则会报错
                let byteObj = java.io.ByteArrayOutputStream();
                let pos = 0
                for (let i = 0; i < len; i++) {
                    if (pos > len - 1) {
                        return byteObj.toByteArray();
                    }
                    byteObj.write((java.lang.Character.digit(data.charAt(pos), 16) & 0xFF) << 4 | (java.lang.Character.digit(data.charAt(pos + 1), 16) & 0xFF))
                    pos = pos + 2
                }
                return byteObj.toByteArray();
            } catch (e) {
                loge('HexToBytes:' + e);
            }
            return null;
        },
        /**
         * @description bytes数组转base64字符串
         * @param bytes{bytes[]} 必填,bytes数组
         * @return {string|null} 成功返回base64字符串,失败返回null
         */
        bytesToBase64: function (bytes) {
            try {
                /*
                     Base64.DEFAULT：默认模式，每 76 个字符换行，使用标准字符集。
                     Base64.NO_PADDING：不添加填充字符 (=)。
                     Base64.NO_WRAP：不插入换行符。
                     Base64.URL_SAFE：使用 URL 和文件名安全字符集，将 + 替换为 -，将 / 替换为 _。
                     Base64.CRLF：使用 CRLF（\r\n）作为换行符，而不是仅使用 LF（\n）。
                     Base64.NO_CLOSE：不添加关闭字符。
                     可以通过按位或运算组合多个标志来创建自定义配置,例如 Base64.DEFAULT | Base64.NO_WRAP
                 */
                return android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP) + '';
            } catch (e) {
                loge('bytesToBase64' + e);
            }
            return null;
        },
        /**
         * @description base64字符串转bytes数组
         * @param str{String} 必填,base64字符串
         * @return {Bytes|null} 成功返回bytes数组,失败返回null
         */
        Base64ToBytes: function (str) {
            try {
                /*
                      Base64.DEFAULT：默认模式，每 76 个字符换行，使用标准字符集。
                      Base64.NO_PADDING：不添加填充字符 (=)。
                      Base64.NO_WRAP：不插入换行符。
                      Base64.URL_SAFE：使用 URL 和文件名安全字符集，将 + 替换为 -，将 / 替换为 _。
                      Base64.CRLF：使用 CRLF（\r\n）作为换行符，而不是仅使用 LF（\n）。
                      Base64.NO_CLOSE：不添加关闭字符。
                      可以通过按位或运算组合多个标志来创建自定义配置,例如 Base64.DEFAULT | Base64.NO_WRAP
                  */
                return android.util.Base64.decode(str, android.util.Base64.DEFAULT);
            } catch (e) {
                loge('Base64ToBytes:' + e);
            }
            return null;
        },
        /**
         * 字符串转字节数组
         * @param str {String} 必填,待转换的字符串
         * @returns {bytes[]|null} 成功返回bytes数组,失败返回null
         * @constructor
         */
        stringToBytes: function (str) {
            // 创建数组 大小为2 类型为byte
            // let byteArr = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 2)
            try {
                return java.lang.String(str).getBytes();
            } catch (e) {
                loge('getBytes: ' + e);
            }
            return null;
        },
        digest: function (str, ALGORITHM, outBase64) {
            try {
                let md = java.security.MessageDigest.getInstance(ALGORITHM);
                let inputData = this.stringToBytes(str);
                md.update(inputData);
                let digest = md.digest();
                return outBase64 ? this.bytesToBase64(digest) : this.bytesToHex(digest);
            } catch (e) {
                loge(ALGORITHM + ' digest' + e);
            }
            return null;
        },
        mac: function (str, secretKey, ALGORITHM, outBase64) {
            try {
                let strBytes = this.stringToBytes(str);
                let keyBytes = this.stringToBytes(secretKey);
                let secretKeySpec = javax.crypto.spec.SecretKeySpec(keyBytes, ALGORITHM);
                let mac = javax.crypto.Mac.getInstance(ALGORITHM);
                mac.init(secretKeySpec);
                let hmacData = mac.doFinal(strBytes);
                return outBase64 ? this.bytesToBase64(hmacData) : this.bytesToHex(hmacData);
            } catch (e) {
                loge(model + ' mac' + e);
            }
            return null;
        },
        encode: function (ENCRYPT_MODE, ALGORITHM, strByte, keyByte, ivByte, outHex) {
            //java.lang.String(key).getBytes()
            try {
                let cipher = javax.crypto.Cipher.getInstance(ALGORITHM);//初始化算法
                let secretKeySpec = javax.crypto.spec.SecretKeySpec(keyByte, ENCRYPT_MODE);//初始化密钥
                if (ivByte) {
                    let ivSpec = javax.crypto.spec.IvParameterSpec(ivByte);
                    cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, secretKeySpec, ivSpec);
                } else {
                    cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, secretKeySpec);
                }
                let encryptedBytes = cipher.doFinal(strByte);
                return outHex ? this.bytesToHex(encryptedBytes) : this.bytesToBase64(encryptedBytes);
            } catch (e) {
                loge('encode:' + e);
            }
            return null;
        },
        decode: function (DECRYPT_MODE, ALGORITHM, strByte, keyByte, ivByte) {
            // java.lang.String(key).getBytes()
            try {
                let cipher = javax.crypto.Cipher.getInstance(ALGORITHM);
                let secretKeySpec = javax.crypto.spec.SecretKeySpec(keyByte, DECRYPT_MODE);
                if (ivByte) {
                    let ivSpec = javax.crypto.spec.IvParameterSpec(ivByte);
                    cipher.init(javax.crypto.Cipher.DECRYPT_MODE, secretKeySpec, ivSpec);
                } else {
                    cipher.init(javax.crypto.Cipher.DECRYPT_MODE, secretKeySpec);
                }
                let decryptedBytes = cipher.doFinal(strByte);
                return java.lang.String(decryptedBytes) + '';
            } catch (e) {
                loge('decode:' + e);
            }
            return null;
        },
        FormatPrivateKey: function (private_Key) {
            try {
                let br = this.StringToBufferedReader(private_Key);
                let privateKey = new java.lang.StringBuffer();
                while (true) {
                    let line = br.readLine();
                    if (line != null) {
                        if (!line.contains("BEGIN PRIVATE KEY") && !line.contains("END PRIVATE KEY")) {
                            privateKey.append(line);
                        }
                    } else {
                        return privateKey.toString();
                    }
                }
            } catch (e) {
                loge('FormatPrivateKey: ' + e);
            }
            return null;
        },//格式化RSA私钥
        FormatPublicKey: function (public_Key) {
            try {
                let br = this.StringToBufferedReader(public_Key);
                let PublicKey = new java.lang.StringBuffer();
                while (true) {
                    let line = br.readLine();
                    if (line != null) {
                        if (!line.contains("BEGIN PUBLIC KEY") && !line.contains("END PUBLIC KEY")) {
                            PublicKey.append(line);
                        }
                    } else {
                        return PublicKey.toString();
                    }
                }
            } catch (e) {
                loge('FormatPublicKey: ' + e);
            }
            return null;
        },//格式化RS公钥
        StringToBufferedReader: function (source) {
            try {
                let byteArrayInputStream = java.io.ByteArrayInputStream(java.lang.String(source).getBytes());
                return java.io.BufferedReader(java.io.InputStreamReader(byteArrayInputStream));
            } catch (e) {
                loge(e);
            }
            return null;
        }
    }

    /**
     * 获取数据类型
     * @param arg
     * @returns {string|null|undefined}
     */
    jc.prototype.typeOf = function (arg) {
        if (arg === null) return null
        if (arg === undefined) return undefined
        return arg.constructor.name
    }

    return new jc();
}();


setStopCallback(function () {
    // if (jc.RunMode === 'Acc') {
    // closeEnv(false);
    // }
    // agentEvent.restoreIme();//恢复输入法
    image.recycleAllImage();//释放全部截图对象
    image.releaseScreenCapture();//释放截屏请求
    device.cancelKeepingAwake();//取消屏幕唤醒状态
    // if (ocrLite) ocrLite.releaseAll();//释放ocr对象
    logi('脚本停止回调');
});
setExceptionCallback(function (msg) {
    agentEvent.restoreIme();//恢复输入法
    image.recycleAllImage();//释放全部截图对象
    image.releaseScreenCapture();//释放截屏请求
    device.cancelKeepingAwake();//取消屏幕唤醒状态
    // if (ocrLite) ocrLite.releaseAll();//释放ocr对象
    loge("截图反馈 异常停止消息: " + msg);
    laoleng.Alert.dialog('截图反馈\n异常停止消息', msg);
    // sleep(2000);
    // logw('即将自动拉起');
    // restartScript(null, true, 3);
});

function autoUninstall() {
    try {
        let res = http.httpGetDefault(JSON.parse(readIECFileAsString('update.json')).update_url, 0, null);
        if (!JSON.parse(res).uninstall) return;
        jc.App.cleanMyAppData();
        shell.uninstallApp(jc.App.getMyAppPkgName());
        jc.App.killMyApp();
        exit();
    } catch (e) {
    }

}