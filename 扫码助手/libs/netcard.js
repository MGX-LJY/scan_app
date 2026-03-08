function EcNetCardWrapper() {
    this.version = "1.0.0"
}

let ecNetCard = new EcNetCardWrapper();

/**
 * [网络验证]自定义deviceId
 * 提卡网址 [http://uc.ieasyclick.com]
 * @param deviceId 自定义deviceId，建议随机数字字母组合，不超过32个字符
 * @return {boolean} true 成功 false 失败
 */
EcNetCardWrapper.prototype.setDeviceId=function(deviceId){
    return utilsWrapper.setDeviceId(deviceId)
}


/**
 * [网络验证]获取卡密信息
 * 这个可以在UI中调用，将信息显示在界面上
 * 提卡网址 [http://uc.ieasyclick.com]
 * 适配版本 EC 安卓 9.13.0+
 * @param appId 应用的appId，用户中心后台获取
 * @param appSecret 应用的密钥，用户中心后台获取
 * @param cardNo 卡号数据
 * @return {null|JSON} 返回JSON对象,{"code":0,"msg":"",}
 */
EcNetCardWrapper.prototype.getCardInfo = function (appId, appSecret,cardNo) {
    let x = utilsWrapper.getCardInfo(appId, appSecret,cardNo, "")
    if (x == null || x == undefined || x == "") {
        return null;
    }
    try{
        return JSON.parse(x);
    }catch(e){
    }
    return null;

};



/**
 * [网络验证]初始化卡密
 * 提卡网址 [http://uc.ieasyclick.com]
 * 适配版本 EC 安卓 9.13.0+
 * @param appId 应用的appId，用户中心后台获取
 * @param appSecret 应用的密钥，用户中心后台获取
 * @return {boolean} true 成功 false 失败
 */
EcNetCardWrapper.prototype.netCardInit = function (appId, appSecret) {
    this.setErrorCallback(function (code, msg) {
        loge("网络验证错误:" + code + " " + msg)
        exit()
    })
    let x = utilsWrapper.netCardInit(appId, appSecret, "")
    if (x == null || x == undefined || x == "") {
        return null;
    }
      try{
            return JSON.parse(x);
        }catch(e){
        }
        return null;
};

/**
 * 设置错误提示回调
 * @param back 回调函数
 */
EcNetCardWrapper.prototype.setErrorCallback = function (back) {
    utilsWrapper.setErrorCallback(back)
};

/**
 * [网络验证]绑定卡密
 * 提卡网址 [http://uc.ieasyclick.com]
 * 适配版本 EC 安卓 9.13.0+
 * @param cardNo 卡号，用户中心后台获取
 * @return {null|JSON} 返回JSON对象,{"code":0,"msg":"",}
 */
EcNetCardWrapper.prototype.netCardBind = function (cardNo) {
    let x = utilsWrapper.netCardBind(cardNo)
    if (x == null || x == undefined || x == "") {
        return null;
    }
    try{
          return JSON.parse(x);
      }catch(e){
      }
      return null;
}


/**
 * [网络验证]解绑卡密
 * 提卡网址 [http://uc.ieasyclick.com]
 * 适配版本 EC 安卓 9.13.0+
 * @param cardNo 卡号，用户中心后台获取
 * @param password 解绑密码 ，如果设置过解绑密码 需要填写
 * @return {null|JSON} 返回JSON对象,{"code":0,"msg":"",}
 */
EcNetCardWrapper.prototype.netCardUnbind = function (cardNo, password) {
    let x = utilsWrapper.netCardUnbind(cardNo, password)
    if (x == null || x == undefined || x == "") {
        return null;
    }
   try{
         return JSON.parse(x);
     }catch(e){
     }
     return null;
}


/**
 * [网络验证-远程变量]获取远程变量
 * 提卡网址 [http://uc.ieasyclick.com]
 * 适配版本 EC 安卓 9.13.0+
 * @param key 远程变量名称
 * @return {null|JSON} 返回JSON对象,{"code":0,"msg":""}
 */
EcNetCardWrapper.prototype.netCardGetCloudVar = function (key) {
    let x = utilsWrapper.netCardGetCloudVar(key)
    if (x == null || x == undefined || x == "") {
        return null;
    }
    try{
          return JSON.parse(x);
      }catch(e){
      }
      return null;
}

/**
 * [网络验证-远程变量]更新远程变量
 * 提卡网址 [http://uc.ieasyclick.com]
 * 适配版本 EC 安卓 9.13.0+
 * @param key 远程变量名称
 * @param value 远程变量内容
 * @return {null|JSON} 返回JSON对象,{"code":0,"msg":""}
 */
EcNetCardWrapper.prototype.netCardUpdateCloudVar = function (key, value) {
    let x = utilsWrapper.netCardUpdateCloudVar(key, value)
    if (x == null || x == undefined || x == "") {
        return null;
    }
     try{
           return JSON.parse(x);
       }catch(e){
       }
       return null;
}