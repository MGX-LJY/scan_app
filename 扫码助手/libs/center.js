function CenterApiWrapper() {
}

let centerApi = new CenterApiWrapper();

/**
 * 取得中控发过来的任务参数信息
 * 中控启动脚本，可以配置参数，在这里使用本函数获取参数，给脚本使用
 * 适合版本 EC 安卓 9.29.0+
 * 注意：这个需要使用参数配置,读取顺序是 优先读取单个设备配置 ，如果单个设备配置无任何数据，就读取 全局配置，
 * 返回参数中 含有 __from_global__ 这样的key，代表是来源于全局参数
 * @return {null|JSON} JSON对象
 **/
CenterApiWrapper.prototype.getCenterTaskInfo = function () {
    let x = centerApiWrapper.getCenterTaskInfo();
    if (x != null && x != undefined && x != "") {
        try {
            return JSON.parse(x)
        } catch (e) {
        }
    }
    return null;
}

/**
 * 读取数据文件的内容
 * 适配EC 9.29.0+
 * @param name 文件名称，中控数据功能的数据文件名称
 * @return {null|JSON} JSON对象
 */
CenterApiWrapper.prototype.getFileData = function (name) {
    let x = centerApiWrapper.getFileData(name);
    if (x != null && x != undefined && x != "") {
        try {
            return JSON.parse(x)
        } catch (e) {
        }
    }
    return null;
}


/**
 * 新增数据文件
 * 适配EC 9.29.0+
 *
 * @param name    文件名称，中控数据功能的数据文件名称
 * @param content 文件内容
 * @param rewrite 是否允许覆盖原有文件， 1 是 2 否，如果参数是2，数据文件存在，将返回错误信息
 * @param append  追加模式， 1 代表是追加内容，2 代表不追加
 * @return {null|JSON} JSON对象
 */
CenterApiWrapper.prototype.addFileData = function (name, content, rewrite, append) {
    let x = centerApiWrapper.addFileData(name, content, rewrite, append);
    if (x != null && x != undefined && x != "") {
        try {
            return JSON.parse(x)
        } catch (e) {
        }
    }
    return null;
}

/**
 * 删除数据文件
 * 适配EC 9.29.0+
 * @param name 文件名称，中控数据功能的数据文件名称
 * @return {null|JSON} JSON对象
 */
CenterApiWrapper.prototype.deleteFile = function (name) {
    let x = centerApiWrapper.deleteFile(name);
    if (x != null && x != undefined && x != "") {
        try {
            return JSON.parse(x)
        } catch (e) {
        }
    }
    return null;
}


/**
 * 插入数据
 * 适配EC 9.29.0+
 * @param name    文件名称，中控数据功能的数据文件名称
 * @param content 要插入的内容
 * @param create  是否创建文件 1 是 2 否，如果参数是2，文件不存在的情况下，将返回错误信息
 * @param append  追加模式， 1 代表是追加内容，2 代表不追加
 * @return {null|JSON} JSON对象
 */
CenterApiWrapper.prototype.insertFileData = function (name, content, create, append) {
    let x = centerApiWrapper.insertFileData(name, content, create, append);
    if (x != null && x != undefined && x != "") {
        try {
            return JSON.parse(x)
        } catch (e) {
        }
    }
    return null;
}

/**
 * 弹出数据
 * 适配EC 9.29.0+
 * @param name    文件名称，中控数据功能的数据文件名称
 * @param popType 获取数据方式，1 头部获取，2 尾部获取，3 随机获取
 * @return {null|JSON} JSON对象
 */
CenterApiWrapper.prototype.popFileData = function (name, popType) {
    let x = centerApiWrapper.popFileData(name, popType);
    if (x != null && x != undefined && x != "") {
        try {
            return JSON.parse(x)
        } catch (e) {
        }
    }
    return null;
}


/**
 * 删除一行数据
 * 适配EC 9.29.0+
 * @param name    文件名称，中控数据功能的数据文件名称
 * @param content 要删除的内容
 * @return {null|JSON} JSON对象
 */
CenterApiWrapper.prototype.removeOneLineData = function (name, content) {
    let x = centerApiWrapper.removeOneLineData(name, content);
    if (x != null && x != undefined && x != "") {
        try {
            return JSON.parse(x)
        } catch (e) {
        }
    }
    return null;
}


/**
 * 追加一行数据
 * 适配EC 9.29.0+
 *
 * @param name       文件名称，中控数据功能的数据文件名称
 * @param content    要追加的内容
 * @param appendType 追加位置 1 首部  2 尾部
 * @return {null|JSON} JSON对象
 */
CenterApiWrapper.prototype.appendOneLineData = function (name, content, appendType) {
    let x = centerApiWrapper.appendOneLineData(name, content, appendType);
    if (x != null && x != undefined && x != "") {
        try {
            return JSON.parse(x)
        } catch (e) {
        }
    }
    return null;
}


