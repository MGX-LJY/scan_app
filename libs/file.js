/**
 * 文件api封装
 * @constructor
 */
function FileWrapper() {

}

var file = new FileWrapper();
/**
 *
 * 读取文件中的所有内容
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 * @param path 文件路径
 * @return {null|string} 文件内容字符串
 */
FileWrapper.prototype.readFile = function (path) {
    if (fileWrapper == null) {
        return null;
    }
    return javaString2string(fileWrapper.readFile(path));
};


/**
 *
 * 删除文件某一行或者根据包含条件删除
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 *
 * @param path 文件路径
 * @param line 行数，如果是-1 代表这个条件不生效
 * @param contains 包含某个字符串就删除，如果为null代表这个条件不生效
 *
 * @return {boolean} true 成功 false 失败
 */
FileWrapper.prototype.deleteLine = function (path, line, contains) {
    if (fileWrapper == null) {
        return null;
    }
    return fileWrapper.deleteLine(path, line, contains);
};

/**
 * 列出文件下的所有文件
 * @param path 路径
 * @return {null|JSON} 路径字符串数组
 */
FileWrapper.prototype.listDir = function (path) {
    if (fileWrapper == null) {
        return null;
    }
    var s = fileWrapper.listDir(path);
    if (s == null || s == "") {
        return null;
    }
    try {
        s = JSON.parse(s);
        var r = [];
        for (var i = 0; i < s.length; i++) {
            r.push(javaString2string(s[i]));
        }
        return r;
    } catch (e) {

    }
    return null;
};


/**
 * 将字符串存储到文件中
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 * @param data 字符串 数据
 * @param path 文件
 * @return {boolean} true 成功
 */
FileWrapper.prototype.writeFile = function (data, path) {
    if (fileWrapper == null) {
        return false;
    }
    return fileWrapper.writeFile(data, path);
};
/**
 * 创建一个文件或者文件夹
 *
 * @param path 路径
 * @return {boolean} true 代表创建成功
 */
FileWrapper.prototype.create = function (path) {
    if (fileWrapper == null) {
        return null;
    }
    return fileWrapper.create(path);
};
/**
 * 从APK的assets文件夹中读取数据为字符串
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 *
 * @param path assets文件夹中的文件路径，例如 data/a.txt
 * @return {null|string} 文件的内容
 */
FileWrapper.prototype.readAssets = function (path) {
    if (fileWrapper == null) {
        return null;
    }
    return javaString2string(fileWrapper.readAssets(path));
};

/**
 * 删除所有文件或者文件夹
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 * @param path 文件或者文件路径
 * @return {boolean} true代表成功 false代表失败
 */
FileWrapper.prototype.deleteAllFile = function (path) {
    if (fileWrapper == null) {
        return false;
    }
    return fileWrapper.deleteAllFile(path);
};
/**
 * 写入一行到文件中,追加模式
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 *
 * @param data 行数据
 * @param path 文件或者文件路径
 * @return {boolean} true代表成功 false代表失败
 */
FileWrapper.prototype.appendLine = function (data, path) {
    if (fileWrapper == null) {
        return null;
    }
    return fileWrapper.appendLine(data, path);
};
/**
 * 读取一行数据，如果行号不对，返回的是空
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 *
 * @param path   路径
 * @param lineNo 行号
 * @return {null|string} 返回一行字符串
 */
FileWrapper.prototype.readLine = function (path, lineNo) {
    if (fileWrapper == null) {
        return null;
    }
    return javaString2string(fileWrapper.readLine(path, lineNo));
};

/**
 * 读取所有数据
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 *
 * @param path 路径
 * @return {null|JSON} 返回字符串
 */
FileWrapper.prototype.readAllLines = function (path) {
    if (fileWrapper == null) {
        return null;
    }
    var d = fileWrapper.readAllLines(path);
    if (d == null || d == "") {
        return null;
    }
    try {
        return JSON.parse(d);
    } catch (event) {
    }
    return null;


};
/**
 * 创建文件夹
 * 运行环境: 无限制
 * 兼容版本: Android 4.4 以上
 * @param path 文件夹路径
 * @return {boolean} true 代表成功，false代表失败
 */
FileWrapper.prototype.mkdirs = function (path) {
    if (fileWrapper == null) {
        return null;
    }
    return fileWrapper.mkdirs(path);
};
/**
 * 文件或者文件夹是否存在
 *
 * @param path 路径
 * @return {boolean} true 代表存在，false代表不存在
 */
FileWrapper.prototype.exists = function (path) {
    if (fileWrapper == null) {
        return null;
    }
    return fileWrapper.exists(path);
};

/**
 * 复制文件
 *
 * @param src 源文件路径
 * @param dest 目标文件路径
 * @return {boolean} true 代表成功
 */
FileWrapper.prototype.copy = function (src, dest) {
    if (fileWrapper == null) {
        return null;
    }
    return fileWrapper.copy(src, dest);
};