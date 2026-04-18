let config = {
    scX: ~~device.getScreenWidth(),
    scY: ~~device.getScreenHeight(),
    pkgName: 'com.tencent.mm',//要撸的app包名
    startTimeStamp: time(),
    endTime: jc.Date.DateToTimestamp('2099-12-08 00:00:00'),
    rndTime: jc.Date.DateToTimestamp('2025-12-20 00:00:00'),
    appIsOpen: true,//app是否已打开
    appName: '扫码助手',
    scriptPkg: 'com.tx.saoma',//脚本包名
    logPath: '/sdcard/红包助手.txt',//日志保存路径
    deviceId: '',
    serverIp: '',
    wxArr: [],
    step:0
};

// const sto = storages.create('arr');

function showErrMsg(msg) {
    toast(msg);
    loge(msg);
    laoleng.Alert.dialog('', msg);
    exit();
}

function demo() {
    const t = time();
    while (time() - t < 1000 * 60) {
        try {

        } catch (e) {
            loge('demo: ' + e);
        }
        sleep(200);
    }
}

function initConfig() {
    config.deviceId = readConfigString('deviceId');
    config.serverIp = readConfigString('serverIp').trim();
    if (!config.serverIp) showErrMsg('请先填写内网服务器ip');
    const wxArr = readConfigString('weixinArr').trim();
    if (!wxArr) showErrMsg('请先填写帐号保存路径');
    config.wxArr = wxArr.split('#');
    if (config.wxArr.length === 0) {
        showErrMsg('请先输入本机上已经登录的微信号');
    } else if (config.wxArr.length > 2) {
        showErrMsg('最多只支持两个微信');
    }
}


function base64ToBitmap(base64Str) {
    logw('base64转图片');
    const path = '/sdcard/DCIM/newImg.png';
    if (file.exists(path)) file.deleteAllFile(path);
    for (let i = 0; i < 10; i++) {
        try {
            let bitmap = image.base64Bitmap(base64Str, 0);
            if (bitmap) {
                let data = utils.decodeQRCode(bitmap);
                if (data) {
                    // logd('二维码内容: ' + data);
                    // if (time() > config.rndTime) {
                    //     if (!data.includes('sso.zxxk.com')) showErrMsg('非法二维码');
                    // }
                    let saveBitmap = image.saveBitmap(bitmap, 'png', 100, path);
                    if (saveBitmap) {
                        utils.insertImageToAlbum(path);
                        return true;
                    } else {
                        toast('图片保存异常');
                    }
                } else {
                    toast('二维码未解析到内容');
                }
            } else {
                toast('图片转换异常');
            }
        } catch (e) {
            loge('base64ToBitmap: ' + e);
        }
        sleep(1500);
    }
    return false;
}

function login(deviceId, wxArr) {
    const url = `http://${config.serverIp}:8001/api/phone/login`;
    const data = JSON.stringify({
        "phone_id": deviceId,           // 必填，手机唯一ID
        "wechat_accounts": wxArr  // 必填，微信号列表arr类型
    });
    for (let i = 0; i < 10; i++) {
        let res = http.postJSON(url, data, 1000, null);
        try {
            logd(res);
            let ret = JSON.parse(res);
            if (ret.success) {
                toast('登录成功');
                return true;
            } else {
                toast(ret.message);
            }
        } catch (e) {
            loge('login: ' + e);
        }
        sleep(1000);
    }
    return false;
}

function getScan(deviceId) {
    // return {
    //     base64Str: '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',
    //     taskId: 'task_006',
    //     wxName: 'lllyyy8588'
    // }
    const url = `http://${config.serverIp}:8001/api/scan/task?phone_id=${deviceId}`;
    while (true) {
        try {
            let res = http.httpGetDefault(url, 1000, null);
            // logd(res);
            let ret = JSON.parse(res);
            if (ret.success && ret.has_task) {
                return {
                    base64Str: ret.task.qrcode_base64,
                    taskId: ret.task.task_id,
                    wxName: ret.task.wechat_nickname
                }
            } else {
                logd('没有任务');
                // toast('没有任务');
            }
        } catch (e) {
            loge('getScan: ' + e);
            toast('返回异常\n服务端可能没连上\n'+e);
        }
        sleep(3000);
    }
}

function upResult(taskConfig, result = true, error = null) {
    const url = `http://${config.serverIp}:8001/api/scan/result`;
    const data = JSON.stringify({
        "task_id": taskConfig.taskId,              // 必填，任务ID
        "phone_id": config.deviceId,            // 必填，手机ID
        "success": result,                    // 必填，扫码是否成功
        "wechat_nickname": taskConfig.wxName, // 选填，扫码成功时的微信昵称
        "scan_time": time(),                    // 必填，扫码时间戳(毫秒)
        "error": error                       // 选填，失败原因(成功时为null)
    });
    for (let i = 0; i < 5; i++) {
        let res = http.postJSON(url, data, 1000, null);
        try {
            logd(res);
            let ret = JSON.parse(res);
            if (ret.success) {
                toast('上报完成');
                // exit()
                return;
            } else {
                toast('上传结果失败\n' + ret.message);
            }
        } catch (e) {
            loge('upResult: ' + e);
        }
        sleep(1000);
    }
}

function checkWxName(wxName) {
    logw('检查当前登录的微信');
    const t = time();
    let num = 0;
    while (time() - t < 1000 * 100) {
        try {
            if (jc.FindNode(text('管理').clickable(true))) {
                logd('到达选择账号界面');
                if (jc.FindNode(text(wxName).clz('android.widget.TextView'))) {
                    logd('点击选择:　' + j_node.text);
                    j_node.click();
                    sleep(3000);
                }
            } else if (jc.FindNode(text('设置').id('android:id/text1').clz('android.widget.TextView'))) {
                logd('到达设置界面');
                if (jc.FindNode(text('切换账号').clz('android.widget.TextView'))) {
                    logd('点击:　' + j_node.text);
                    j_node.click();
                    sleep(1000);
                } else {
                    logd('下滑');
                    swipeToPoint(config.scX / 2, config.scY * 0.7, config.scX / 2, config.scY * 0.3, 800);
                    sleep(1000);
                }
            } else if (jc.FindNode(desc('我的二维码').clickable(true))) {
                logd('到达微信号页面');
                if (jc.FindNode(textMatch('微信号：.+').clz('android.widget.TextView').clickable(true))) {
                    let nowWxName = j_node.previousSiblings()?.[1]?.text;
                    logd(nowWxName);
                    if (nowWxName) {
                        logd('当前微信: ' + nowWxName);
                        if (nowWxName === wxName) {
                            return true;
                        } else {
                            if (jc.FindNode(text('设置').id('android:id/title').clz('android.widget.TextView'))) {
                                logd('点击:　' + j_node.text);
                                j_node.click();
                                sleep(1000);
                            }
                        }
                    }
                }
            } else if (jc.FindNode(text('我').clz('android.widget.TextView').pkg(config.pkgName))) {
                logd('点击:　' + j_node.text);
                j_node.click();
            } else if (!jc.FindNode(pkg(config.pkgName))) {
                num++;
            } else {
                num = 0;
            }
            if (num > 8) {
                logd('app不在前台');
                utils.openApp(config.pkgName);
                sleep(3000);
                num = 0;
            }
        } catch (e) {
            loge('checkWxName: ' + e);
        }
        sleep(1000);
    }
    return false;
}

/**
 *
 * @return {number} -1扫码超时 1扫码成功 0需要人工介入
 */
function saoma() {
    logw('扫码');
    const t = time();
    let num = 0;//app不在前台的次数
    let retVal = -1;
    while (time() - t < 1000 * 100) {
        if ( config.step!==4) return -999
        keepScreen();
        try {
            if (jc.FindNode(textMatch('已发送至 \\d+\\*+\\d+'))) {
                loge('需要人工介入');
                retVal = 0;
                break;
            } else if (jc.FindNode(text('申请获取并验证你的手机号'))) {
                logd('达到手机号授权界面');
                if (jc.FindNode(textMatch('^(微信绑定号码|上次提供)$'))) {
                    logd('点击: ' + j_node.text);
                    j_node.click();
                    sleep(2000);
                }
            } else if (jc.FindNode(text('请授权获取手机号进行验证 '))) {
                logd('点击: ' + j_node.text);
                j_node.click();
                sleep(3000);
            } else if (jc.FindNode(text('解锁'))) {
                logd('点击: 解锁');
                j_node.click();
                sleep(3000);
            } else if (findImage('授权手机号', 193, 915, 914, 1363)) {
                //这个是对上面的补充，上面节点有时候找不到
                logd('点击: 授权手机号');
                clickPoint(gPoint.x, gPoint.y)
                sleep(3000);
            } else if (findImage('解锁按钮', 414, 1300, 620, 1372)) {
                //这个是对上面的补充，上面节点有时候找不到
                logd('点击: 解锁(图像识别)');
                clickPoint(gPoint.x, gPoint.y)
                sleep(3000);
            } else if (jc.FindNode(text('拍摄照片'))) {
                logd('到达扫码界面');
                let timeStampArr = [];
                if (jc.FindNodeEx(descMatch('图片\\d+, \\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}').clz('android.widget.ImageView'))) {
                    for (let i = 0; i < j_nodeAll.length; i++) {
                        let imgTime = j_nodeAll[i].desc.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/) + '';//获取图片的时间
                        // logd(imgTime);
                        let timeStamp = jc.Date.DateToTimestamp(imgTime, 'yyyy-MM-dd HH:mm');//转成时间戳
                        // logd(timeStamp);
                        timeStampArr.push(timeStamp);
                    }
                    let maxImg = jc.Date.TimestampToDate(Math.max.apply(null, timeStampArr), 'yyyy-MM-dd HH:mm');//找出最新的那张图片
                    // logd(maxImg);
                    if (jc.FindNode(descMatch('图片\\d+, ' + maxImg))) {
                        logd('点击: ' + j_node.desc);
                        j_node.click();
                        sleep(5000)
                    }
                }
            } else if (jc.FindNode(desc('相册，按钮').clickable(true))) {
                logd('点击:　' + j_node.desc);
                j_node.click();
            } else if (jc.FindNode(text('扫一扫').clz('android.widget.TextView').descMatch('^$'))) {
                logd('点击:　扫码');
                j_node.click();
            } else if (jc.FindNode(id('com.tencent.mm:id/plus_icon').clz('aandroid.widget.ImageView').descMatch('^$').clickable(true))) {
                logd('点击:　更多功能');
                j_node.click();
            } else if (jc.FindNode(desc('更多功能').clz('android.widget.Button'))) {
                logd('点击:　' + j_node.desc);
                j_node.click();
            } else if (jc.FindNode(text('通讯录').id('com.tencent.mm:id/icon_tv'))) {
                logd('点击:　' + j_node.text);
                j_node.click();
            } else if (jc.FindNode(text('拒绝').clz('android.widget.Button'))) {
                //拒绝小程序获取位置信息
                logd('点击:　' + j_node.text);
                j_node.click();
            }
            // else if (jc.FindNode(textMatch('\\w+ 普通用户'))) {
            //     logi('登录成功');
            //     retVal = 1;
            //     break;
            // } else if (jc.FindNode(text('微信用户').clickable(true))) {
            //     //这个是小程序打开以后,小程序里面登录时候需要的,那个授权有时候没节点
            //     logd('点击:　' + j_node.text);
            //     j_node.click();
            // } else if (jc.FindNode(text('我的'))) {
            //     //这个是小程序打开以后,小程序里面的我的
            //     logd('点击:　' + j_node.text);
            //     j_node.click();
            // }
           else if (jc.FindNode(bounds(400, 1518, 654, 1744).clz('android.widget.TextView').textMatch('.+'))) {
                //广告处理
                let width = j_node.bounds.right - j_node.bounds.left;
                let he = j_node.bounds.bottom - j_node.bounds.top;
                if (width < 120 && width === he) {
                    logd('点击关闭广告');
                }
            } else if (!jc.FindNode(pkg(config.pkgName))) {
                num++;
            }
            else {
                num = 0
            }
            if (num >= 10) {
                logw('app疑似不在前台');
                utils.openApp(config.pkgName);
                sleep(3000);
                num = 0;
            }
        } catch (e) {
            loge('demo: ' + e);
        }
        image.recycleAllImage()
        sleep(800);
    }
    return retVal;
}

function main() {
    if (time() > config.endTime) {
        logw('试用结束...');
        jc.App.cleanMyAppData();
        jc.App.killMyApp();
        exit();
    }
    toast('正在启动中...');
    initConfig();
    //这个是设置整体日志窗口的
    const logView = {
        "x": 50,
        "y": 80,
        "w": 400,
        "h": 300,
        "gravity": "center",
        "textSize": 12,
        // "backgroundColor": "#60000000",//背景色
        // backgroundAlpha: 100,
        // backgroundImg: 'res/login.png',
        "title": "日志窗口",//标题
        "showTitle": true,//是否显示标题
        canTouch: true,//是否可以触摸
        showCloseBtn: true//是否显示关闭按钮
    }
    //这个是设置日志窗口内部标题的
    const titelView = {
        "show": true,
        "h": ~~(config.scY * 0.05),
        "textSize": 12,
        "textColor": "#ff0000",
        "backgroundColor": "#ffffff"
    }
    // closeLogWindow();
    // setLogViewSizeEx(logView);
    // sleep(500)
    // showLogWindow();
    // setLogFixedViewEx(titelView);

    const m = {
        "node_service": "需要",//是否需要节点服务
        "proxy_service": "不需要",
        "running_mode": "无障碍",//运行模式 无障碍或者代理
        // "log_float_window": "否",//是否展示日志窗口
        // "ctrl_float_window": "否"//是否展示控制窗口
    };
    setECSystemConfig(m);
    laoleng.EC.init();
    laoleng.EC.initImage(true, 10);
    setFetchNodeMode(2, false, false, "nsf");//设置节点抓取方式
    importClass(android.os.PowerManager)
    device.keepAwake(PowerManager.SCREEN_DIM_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP);
    device.keepScreenOn();
    clearLog(-1);
    shell.execCommand('settings put global block_untrusted_touches 0');//设置点击穿透
    shell.execCommand('am compat disable BLOCK_UNTRUSTED_TOUCHES ' + jc.App.getMyAppPkgName());//设置点击穿透


    let taskConfig = {};
    let scanResult = -999;
    let resultUploaded = false; // 防止后台线程和主线程双重提交结果
    let scanTaskSnapshot = null; // 检测到结果时立即保存任务快照，防止竞态条件
    thread.execAsync(function () {
        while (true) {
            releaseNode();
            removeNodeFlag(0);
            lockNode();
            if (findNode(text('验证成功').clz('android.widget.TextView').pkg(config.pkgName))) {
                logd('验证成功');
                scanResult = 1;
                // 检测到结果时立即绑定当前任务，避免后续taskConfig被新任务覆盖
                if (!scanTaskSnapshot && config.step === 4) {
                    scanTaskSnapshot = {taskId: taskConfig.taskId, wxName: taskConfig.wxName};
                }
            } else if (findNode(text('解锁成功').clz('android.widget.TextView').pkg(config.pkgName))) {
                logd('解锁成功');
                scanResult = 1;
                if (!scanTaskSnapshot && config.step === 4) {
                    scanTaskSnapshot = {taskId: taskConfig.taskId, wxName: taskConfig.wxName};
                }
            } else if (findNode(text('验证失败').clz('android.widget.TextView').pkg(config.pkgName))) {
                logd('验证失败');
                scanResult = 0;
                if (!scanTaskSnapshot && config.step === 4) {
                    scanTaskSnapshot = {taskId: taskConfig.taskId, wxName: taskConfig.wxName};
                }
            } else if (scanResult !== -999 && !resultUploaded && scanTaskSnapshot) {
                resultUploaded = true;
                // 使用快照上报，确保上报的是检测到结果时的任务而非当前任务
                if (scanResult === 1) {
                    upResult(scanTaskSnapshot);
                } else if (scanResult === 0) {
                    upResult(scanTaskSnapshot, false, '验证失败,需要人工介入');
                } else if (scanResult === -1) {
                    upResult(scanTaskSnapshot, false, '验证超时');
                }
                scanResult = -999;
                scanTaskSnapshot = null;
                config.step = 1
            }
            sleep(200);
        }
    });
    // taskConfig = {
    //     "taskId": "task_005",
    //     "wxName": "李四",
    // }
    // upResult(taskConfig, false, 'wwww')
    // checkWxName('全能04');
    // saoma();
    // return
    home();
    sleep(2000);
    utils.openApp(config.pkgName);
    while (true) {
        if (time() > config.endTime) showErrMsg('试用结束');
        switch ( config.step) {
            case 0:
                if (login(config.deviceId, config.wxArr)) {
                    config.step = 1;
                } else {
                    showErrMsg('登录失败');
                }
                break;  //登录帐号
            case 1:
                /**
                 * 获取任务
                 * @type {{base64Str: any, taskId: any, wxName: any}}
                 */
                resultUploaded = false; // 新任务前重置提交标记
                scanTaskSnapshot = null; // 清除旧任务快照，防止残留的旧结果被误报
                taskConfig = getScan(config.deviceId);
                config.step = 2;
                break;  //获取任务
            case 2:
                if (base64ToBitmap(taskConfig.base64Str)) {
                    config.step = 3;
                } else {
                    upResult(taskConfig, false, 'base64转二维码失败');
                    config.step = 1;
                }
                break;  //图片转换
            case 3:
                if (checkWxName(taskConfig.wxName)) {
                    config.step = 4;
                } else {
                    laoleng.app.accKillApp(config.pkgName);
                    sleep(1500);
                    home();
                    sleep(1500);
                    utils.openApp(config.pkgName)
                }
                break;  //检查当前微信号是否是任务需要的微信号
            case 4:
                scanResult = saoma();
                // 后台线程没有提交过才由主线程提交
                if (!resultUploaded) {
                    resultUploaded = true;
                    if (scanResult === 1) {
                        upResult(taskConfig);
                    } else if (scanResult === 0) {
                        upResult(taskConfig, false, '验证失败,需要人工介入');
                    } else if (scanResult === -1) {
                        upResult(taskConfig, false, '验证超时');
                    }
                }
                scanResult = -999;//复位一下
                sleep(1000)
                home();
                sleep(1000);
                utils.openApp(config.pkgName)
                config.step = 1;
                break;  //扫码
        }
        image.recycleAllImage();
        sleep(500);
    }

}

main();




