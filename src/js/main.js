const SCAN_SERVER_BASE_URL = 'https://scan.mgxnet.com';
// wechat_actions.js 位于 src/js，会被 EasyClick 编译为同一 IEC 中的 Java 字节码。
// 官方明确规定 src/js 内文件直接互相引用，不能使用 CommonJS require/export。
function humanizedPointClick(x, y, radius) {
    const spread = Math.max(1, Math.min(10, ~~radius || 4));
    const px = Math.max(1, Math.min(device.getScreenWidth() - 2,
        ~~x + random(-spread, spread + 1)));
    const py = Math.max(1, Math.min(device.getScreenHeight() - 2,
        ~~y + random(-spread, spread + 1)));
    sleep(random(120, 480));
    const clicked = clickPoint(px, py);
    sleep(random(90, 350));
    return clicked;
}

function humanizedNodeClick(node) {
    if (!node || !node.visible) return false;
    let current = node;
    for (let depth = 0; current && depth < 7; depth++) {
        if (current.clickable) {
            const bounds = current.bounds || {};
            const left = bounds.left !== undefined ? bounds.left : bounds.l;
            const top = bounds.top !== undefined ? bounds.top : bounds.t;
            const right = bounds.right !== undefined ? bounds.right : bounds.r;
            const bottom = bounds.bottom !== undefined ? bounds.bottom : bounds.b;
            if ([left, top, right, bottom].every(function (v) { return v !== undefined; }) &&
                right - left >= 4 && bottom - top >= 4) {
                const insetX = Math.max(2, ~~((right - left) * 0.24));
                const insetY = Math.max(2, ~~((bottom - top) * 0.24));
                return humanizedPointClick(random(left + insetX, right - insetX),
                    random(top + insetY, bottom - insetY), 2);
            }
        }
        current = current.parent();
    }
    return false;
}

function clickNativePhoneAuthorizationCard() {
    // 部分微信版本会暴露手机号或“上次提供”节点；手机号卡片本身就是
    // 最终授权动作，不存在后续“允许/确认”按钮。
    if (jc.FindNode(textMatch(
            '^(\\d{3}\\*+\\d{4}|微信绑定号码|上次提供|使用微信绑定手机号)$'))) {
        if (humanizedNodeClick(j_node) === true) return true;
    }

    // 当前真机的微信原生底部面板不提供任何无障碍节点。调用方已经通过
    // 唯一标题确认授权面板，这里再验证手机号卡片的白色区域，坐标回退
    // 只能落在卡片中央安全区，绝不能碰到下方“不允许”。
    const width = device.getScreenWidth();
    const height = device.getScreenHeight();
    const left = ~~(width * 0.10);
    const top = ~~(height * 0.605);
    const right = ~~(width * 0.90);
    const bottom = ~~(height * 0.685);
    let whitePoints = null;
    try {
        whitePoints = image.findColor(
            gScreen, '#ffffff', 0.96, left, top, right, bottom, 4, 1
        );
    } catch (visualError) {
        logw('手机号卡片视觉验证异常: ' + visualError);
    }
    if (!whitePoints || whitePoints.length < 4) return false;
    return humanizedPointClick(
        random(~~(width * 0.38), ~~(width * 0.62)),
        random(~~(height * 0.635), ~~(height * 0.655)),
        3
    ) === true;
}

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
    baseUrl: SCAN_SERVER_BASE_URL, // 固定公网主地址，不再读取手机端遗留配置
    wxArr: [],
    step:0,
    scriptSessionId: 'ec-' + time() + '-' + random(100000, 1000000),
    stepZeroReason: 'script_start',
    pauseResultWatcher: false, // 主线程操作系统设置时暂停后台节点查询，避免节点缓存竞态
    updateInProgress: false,  // 热更新检查/下载期间暂停领取新任务
    pollingTask: false,       // 正在请求扫码任务，防止更新与任务分配竞态
    actionInProgress: false,  // 正在执行低优先级微信动作，禁止热更新并发重启
    actionHeartbeatStop: true,
    actionHeartbeatGeneration: 0,
    actionPreemptRequested: false,
    lastClaimAuditTaskId: null,
    verifiedActionAccount: null,
    verifiedActionAccountAt: 0,
    lastObservedWechatName: null,
    runtimeMode: 'idle',
    wechatRecoveryRequired: false,
    wechatRecoveryAttempts: 0,
    version: JSON.parse(readIECFileAsString('update.json')).version_name || JSON.parse(readIECFileAsString('update.json')).version // 用户可见版本号
};

const wechatActionStorage = storages.create('wechat_action_runtime_v1');

function taskTraceId(task) {
    return task && (task.conversation_id || task.event_id || task.task_id) || null;
}

function queuePhoneAudit(task, eventType, phase, severity, detail) {
    try {
        let queue = JSON.parse(wechatActionStorage.getString('audit_queue', '[]'));
        if (!(queue instanceof Array)) queue = [];
        queue.push({trace_id: taskTraceId(task), task_id: task && task.task_id || null,
            event_id: task && task.event_id || null,
            conversation_id: task && task.conversation_id || null,
            account_id: task && task.account_id || null, event_type: eventType,
            phase: phase || null, severity: severity || 'info', detail: detail || {},
            phone_timestamp: time()});
        if (queue.length > 200) queue = queue.slice(queue.length - 200);
        wechatActionStorage.putString('audit_queue', JSON.stringify(queue));
    } catch (e) { logw('缓存手机审计日志失败: ' + e); }
}

function flushPhoneAuditLogs() {
    try {
        let queue = JSON.parse(wechatActionStorage.getString('audit_queue', '[]'));
        if (!(queue instanceof Array) || !queue.length) return true;
        const batch = queue.slice(0, 50);
        const response = JSON.parse(http.postJSON(
            `${config.baseUrl}/api/wechat/v1/devices/logs`,
            JSON.stringify({device_id: config.deviceId, events: batch}), 8000, null));
        if (!response.success || response.accepted !== batch.length) return false;
        queue = queue.slice(batch.length);
        if (queue.length) wechatActionStorage.putString('audit_queue', JSON.stringify(queue));
        else wechatActionStorage.remove('audit_queue');
        return true;
    } catch (e) {
        logw('上报手机审计日志失败，保留等待补报: ' + e);
        return false;
    }
}
try {
    config.verifiedActionAccount = wechatActionStorage.getString('active_account_id', '') || null;
    config.wechatRecoveryRequired = wechatActionStorage.getString('recovery_required', '') === 'true';
} catch (activeAccountLoadError) {
    config.verifiedActionAccount = null;
}

// const sto = storages.create('arr');

function showErrMsg(msg) {
    toast(msg);
    loge(msg);
    laoleng.Alert.dialog('', msg);
    exit();
}

function initConfig() {
    config.deviceId = readConfigString('deviceId');
    const wxArr = readConfigString('weixinArr').trim();
    // 固定12台手机的账号归属由服务器配置；旧字段仅保留协议兼容。
    config.wxArr = wxArr ? wxArr.split('#') : [];
    if (config.wxArr.length > 2) {
        showErrMsg('最多只支持两个微信');
    }
}

function base64ToBitmap(base64Str, taskId) {
    logw('base64转图片');
    upStepLog(taskId, 'base64', '开始图片转换'); // 步骤日志L02
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
                        upStepLog(taskId, 'base64', '图片保存到相册成功'); // 步骤日志L03
                        return true;
                    } else {
                        upStepLog(taskId, 'base64', '图片保存失败', 'warn'); // 步骤日志L04
                        toast('图片保存异常');
                    }
                } else {
                    upStepLog(taskId, 'base64', '二维码未解析到内容，第'+(i+1)+'次', 'warn');
                    toast('二维码未解析到内容');
                }
            } else {
                upStepLog(taskId, 'base64', '图片转换异常，第'+(i+1)+'次', 'warn');
                toast('图片转换异常');
            }
        } catch (e) {
            loge('base64ToBitmap: ' + e);
        }
        sleep(1500);
    }
    upStepLog(taskId, 'base64', '图片转换失败，已重试10次', 'error'); // 步骤日志L04
    return false;
}

function login(deviceId, wxArr) {
    const url = `${config.baseUrl}/api/phone/login`;
    const data = JSON.stringify({
        "phone_id": deviceId,           // 必填，手机唯一ID
        "wechat_accounts": wxArr,  // 必填，微信号列表arr类型
        "app_version": config.version,
        "script_session_id": config.scriptSessionId,
        "step_zero_reason": config.stepZeroReason
    });
    for (let i = 0; i < 10; i++) {
        // 内网穿透延迟/抖动大，超时给到15秒
        let res = http.postJSON(url, data, 15000, null);
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
        // 递增退避：2s,4s,6s... 最多10s，避免隧道抖动时连环失败
        sleep(Math.min((i + 1) * 2000, 10000));
    }
    return false;
}

function getScan(deviceId) {
    // return {
    //     base64Str: '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',
    //     taskId: 'task_006',
    //     wxName: 'lllyyy8588'
    // }
    const url = `${config.baseUrl}/api/scan/task?phone_id=${deviceId}`;
    if (config.updateInProgress) {
        logi('热更新检查中，暂停领取扫码任务');
        return null;
    }
    try {
        config.pollingTask = true;
        let res = http.httpGetDefault(url, 15000, null);
            // logd(res);
            let ret = JSON.parse(res);
            if (ret.success && ret.has_task) {
                // 收到任务后立即进入处理中状态，关闭热更新窗口。
                config.step = 2;
                return {
                    base64Str: ret.task.qrcode_base64,
                    taskId: ret.task.task_id,
                    wxName: ret.task.wechat_nickname,
                    accountId: ret.task.account_id || ret.task.wechat_nickname,
                    dispatchToken: ret.task.dispatch_token,
                    ackRequired: ret.task.ack_required === true,
                    accountPrepared: ret.task.account_prepared === true,
                    // 服务端活跃任务窗口为5分钟，手机端预留约30秒给最终结果上报。
                    taskDeadline: time() + 270000
                }
            } else if (ret.success && ret.registration_required === true) {
                config.stepZeroReason = 'server_requested_reregistration';
                config.step = 0;
                logw('服务器要求重新注册，自动返回注册步骤');
            } else {
                logd('没有任务');
                // toast('没有任务');
            }
    } catch (e) {
        loge('getScan: ' + e);
        toast('返回异常\n服务端可能没连上\n'+e);
    } finally {
        config.pollingTask = false;
    }
    return null;
}

function getWechatActionTask() {
    try {
        let unifiedRes = http.httpGetDefault(
            `${config.baseUrl}/api/wechat/v1/tasks/claim?device_id=${config.deviceId}`,
            10000, null);
        let unifiedRet = JSON.parse(unifiedRes);
        if (unifiedRet.success && unifiedRet.has_task && unifiedRet.task) {
            let unifiedTask = unifiedRet.task;
            unifiedTask.protocol = 'unified_v1';
            unifiedTask.action_type = unifiedTask.task_type;
            // account_id 是服务器稳定编号；wechat_name 是手机微信界面真实昵称。
            unifiedTask.account = unifiedTask.wechat_name || unifiedTask.account_id;
            unifiedTask.deadline = unifiedTask.soft_deadline;
            // ACK 必须和领取处于同一条同步调用链。1.58 在 main 循环把任务对象
            // 交给 processWechatAction 后才 ACK；真机上交接处发生运行时中断时，
            // 服务器会不断重发 dispatching 租约，最终整批计划硬超时。
            if (!ackWechatActionTask(unifiedTask)) {
                queuePhoneAudit(unifiedTask, 'task_ack_failed_on_phone', 'ack_failed', 'error',
                    {action_type: unifiedTask.action_type});
                return null;
            }
            unifiedTask.acknowledged_on_claim = true;
            if (config.lastClaimAuditTaskId !== unifiedTask.task_id) {
                queuePhoneAudit(unifiedTask, 'task_claimed_on_phone', 'assigned', 'info',
                    {action_type: unifiedTask.action_type, acknowledged: true});
                config.lastClaimAuditTaskId = unifiedTask.task_id;
            }
            return unifiedTask;
        }
    } catch (e) {
        loge('getWechatActionTask: ' + e);
    }
    return null;
}

function ackWechatActionTask(task) {
    try {
        const url = `${config.baseUrl}/api/wechat/v1/tasks/${task.task_id}/ack`;
        let res = http.postJSON(url, JSON.stringify({
            task_id: task.task_id,
            phone_id: config.deviceId,
            device_id: config.deviceId,
            dispatch_token: task.dispatch_token
        }), 10000, null);
        let ret = JSON.parse(res);
        if (ret.success) {
            task.deadline = ret.task ? ret.task.soft_deadline : task.deadline;
            if (ret.task && ret.task.hard_deadline) task.hard_deadline = ret.task.hard_deadline;
            queuePhoneAudit(task, 'task_acknowledged_on_phone', 'assigned', 'info', {});
        }
        return ret.success === true;
    } catch (e) {
        loge('ackWechatActionTask: ' + e);
        return false;
    }
}

function shouldPreemptWechatAction(taskId) {
    // 抢占请求由纯 HTTP 后台线程获取，UI 执行线程只读本地标志，避免公网
    // 3秒超时让视频号停顿或让通话状态检测卡顿。
    return config.actionPreemptRequested === true;
}

function savePendingActionResult(task, outcome, phase) {
    try {
        const persistedTask = JSON.parse(JSON.stringify(task || {}));
        if (persistedTask.payload && persistedTask.payload.password) {
            delete persistedTask.payload.password;
        }
        const record = {
            task: persistedTask,
            outcome: outcome || null,
            phase: phase,
            saved_at: time()
        };
        const encoded = JSON.stringify(record);
        wechatActionStorage.putString('pending_result', encoded);
        // EasyClick 的部分版本 putString 没有可靠返回值，必须回读确认后
        // 才允许执行消息发送、朋友圈、拨号等不可逆动作。
        const verified = JSON.parse(wechatActionStorage.getString('pending_result', ''));
        return !!(verified && verified.task && task &&
            verified.task.task_id === task.task_id && verified.phase === phase);
    } catch (e) {
        loge('保存微信动作恢复记录失败: ' + e);
        return false;
    }
}

function loadPendingActionResult() {
    try {
        const stored = wechatActionStorage.getString('pending_result', '');
        // EasyClick Storage 可能返回 Java String；空 Java String 在 Rhino 条件判断中
        // 仍可能为真，直接 JSON.parse 会抛出 "Empty JSON string" 并永久阻塞轮询。
        if (stored === null || stored === undefined) return null;
        const raw = String(stored).trim();
        if (!raw || raw === 'null' || raw === 'undefined') {
            wechatActionStorage.remove('pending_result');
            return null;
        }
        return JSON.parse(raw);
    } catch (e) {
        loge('读取微信动作恢复记录失败: ' + e);
        // 损坏记录不能自动删除，否则脚本可能重复执行一次已经对外发生的动作。
        return {corrupt: true, error: '' + e};
    }
}

function reportWechatAction(task, outcome) {
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const resultPayload = outcome.result || {};
            if (outcome.error && !resultPayload.error) resultPayload.error = outcome.error;
            if (outcome.preempted === true) resultPayload.preempted = true;
            let status = outcome.success === true ? 'completed' :
                outcome.preempted === true ? 'preempted' :
                resultPayload.uncertain === true ? 'uncertain' : 'failed';
            const url = `${config.baseUrl}/api/wechat/v1/tasks/${task.task_id}/result`;
            let res = http.postJSON(url, JSON.stringify({
                task_id: task.task_id,
                phone_id: config.deviceId,
                device_id: config.deviceId,
                dispatch_token: task.dispatch_token,
                status: status,
                success: outcome.success === true,
                error: outcome.error || null,
                result: resultPayload
            }), 10000, null);
            if (JSON.parse(res).success) return true;
        } catch (e) {
            loge('reportWechatAction: ' + e);
        }
        sleep((attempt + 1) * 1000);
    }
    return false;
}

function flushPendingActionResult() {
    const pending = loadPendingActionResult();
    if (!pending) return true;
    if (pending.corrupt) {
        loge('微信动作恢复记录损坏，为防止重复发送已暂停领取新任务');
        return false;
    }
    if (pending.phase === 'executing') {
        // 脚本在不可逆动作期间退出后，无法安全判断动作是否已经对外发生。
        // 宁可标记为不确定失败，也绝不自动重做造成重复消息/朋友圈/拨号。
        pending.outcome = {success: false, error: 'action_interrupted_outcome_uncertain',
            result: {uncertain: true, interrupted_at: pending.saved_at}};
        pending.phase = 'result_pending';
        if (!savePendingActionResult(pending.task, pending.outcome, pending.phase)) return false;
    }
    if (!pending.task || !pending.outcome) return false;
    if (!reportWechatAction(pending.task, pending.outcome)) return false;
    wechatActionStorage.remove('pending_result');
    return true;
}

function startWechatActionHeartbeat(task) {
    config.actionHeartbeatStop = false;
    config.actionPreemptRequested = false;
    const heartbeatGeneration = ++config.actionHeartbeatGeneration;
    thread.execAsync(function () {
        let nextHeartbeatAt = time() + 15000;
        while (!config.actionHeartbeatStop && config.actionHeartbeatGeneration === heartbeatGeneration) {
            sleep(2500);
            if (config.actionHeartbeatStop || config.actionHeartbeatGeneration !== heartbeatGeneration) break;
            try {
                if (time() >= nextHeartbeatAt && !config.actionHeartbeatStop) {
                    const heartbeatUrl = `${config.baseUrl}/api/wechat/v1/tasks/${task.task_id}/heartbeat`;
                    let res = http.postJSON(heartbeatUrl, JSON.stringify({
                        task_id: task.task_id,
                        phone_id: config.deviceId,
                        device_id: config.deviceId,
                        dispatch_token: task.dispatch_token
                    }), 6000, null);
                    let ret = JSON.parse(res);
                    if (ret.success) {
                        if (ret.task) {
                            task.deadline = ret.task.soft_deadline;
                            task.hard_deadline = ret.task.hard_deadline;
                            if (ret.preempt === true) config.actionPreemptRequested = true;
                        }
                    }
                    nextHeartbeatAt = time() + 15000;
                }
            } catch (e) {
                logw('微信动作心跳失败: ' + e);
                if (time() >= nextHeartbeatAt) nextHeartbeatAt = time() + 15000;
            }
        }
    });
}

function beginWechatActionExecution(task) {
    try {
        const beginUrl = `${config.baseUrl}/api/wechat/v1/tasks/${task.task_id}/begin`;
        let res = http.postJSON(beginUrl, JSON.stringify({
            task_id: task.task_id,
            phone_id: config.deviceId,
            device_id: config.deviceId,
            dispatch_token: task.dispatch_token
        }), 10000, null);
        return JSON.parse(res).success === true;
    } catch (e) {
        // 请求超时可能发生在服务器已经落盘之后，不能重试并冒险重复动作。
        loge('微信动作开始栅栏失败，禁止继续执行: ' + e);
        return false;
    }
}

function saveUnifiedActionCheckpoint(task, outcome) {
    if (task.resume_policy === 'never') return true;
    try {
        let checkpoint = outcome && outcome.result ? outcome.result : {};
        let res = http.postJSON(
            `${config.baseUrl}/api/wechat/v1/tasks/${task.task_id}/checkpoint`,
            JSON.stringify({
                device_id: config.deviceId,
                dispatch_token: task.dispatch_token,
                checkpoint: checkpoint
            }), 8000, null);
        return JSON.parse(res).success === true;
    } catch (e) {
        logw('统一微信任务检查点保存失败: ' + e);
        return false;
    }
}

function processWechatAction(task) {
    config.actionInProgress = true;
    config.pauseResultWatcher = true;
    try {
        const actionStartedAt = time();
        queuePhoneAudit(task, 'action_processing_started', 'processing', 'info',
            {action_type: task.action_type});
        const existing = loadPendingActionResult();
        if (existing) {
            if (!flushPendingActionResult()) return false;
            if (existing.task && existing.task.task_id === task.task_id) return true;
        }
        // 兼容手工构造/旧动作入口；正常统一任务已在领取函数内完成 ACK。
        if (task.acknowledged_on_claim !== true && !ackWechatActionTask(task)) return false;
        const deviceOnlyTask = task.action_type === 'device_sleep' || task.action_type === 'device_wake';
        const accountLoginTask = task.action_type === 'account_login';
        const switchAccountTask = task.action_type === 'switch_account';
        // 覆盖聊天、朋友圈、视频号、通话、切号等所有依赖微信登录态的任务。
        // begin 前发现退出时，原任务没有产生外部副作用，可以安全退回队列。
        if (!deviceOnlyTask && !accountLoginTask && detectWechatLoggedOut()) {
            if (deferWechatTaskForLogin(task)) return true;
            loge('检测到微信退出，但原任务未能安全暂停，禁止继续执行');
            return false;
        }
        if (!savePendingActionResult(task, null, 'executing')) {
            // 此时尚未执行任何外部动作，可以安全上报失败。
            reportWechatAction(task, {success: false, error: 'action_checkpoint_write_failed'});
            return false;
        }
        startWechatActionHeartbeat(task);
        // 设备睡眠/唤醒不依赖微信账号，避免在设备级任务前误触账号切换。
        let accountResult = 'success';
        if (!deviceOnlyTask && !switchAccountTask && !accountLoginTask) {
            const targetAccountKey = task.account_id || task.account;
            if (detectWechatLoggedOut()) {
                accountResult = 'logged_out';
            } else if (config.verifiedActionAccount !== targetAccountKey) {
                // 普通动作不得隐式切换账号；日程必须先下发 switch_account。
                accountResult = 'switch_required';
            }
        }
        if (accountResult === 'preempted') {
            const preemptOutcome = {success: false, preempted: true, error: '扫码任务抢占'};
            if (!savePendingActionResult(task, preemptOutcome, 'result_pending')) return false;
            flushPendingActionResult();
            return false;
        }
        if (accountResult !== 'success') {
            const accountErrorCode = accountResult === 'logged_out' ?
                'account_logged_out' : accountResult === 'switch_required' ?
                    'account_switch_required' : 'account_verification_required';
            const accountOutcome = {success: false, error: '账号检查失败: ' + accountResult,
                result: {error_code: accountErrorCode, account: task.account_id || task.account}};
            if (!savePendingActionResult(task, accountOutcome, 'result_pending')) return false;
            flushPendingActionResult();
            return false;
        }
        if (config.actionPreemptRequested) {
            const latePreemptOutcome = {success: false, preempted: true, error: '扫码任务抢占'};
            if (!savePendingActionResult(task, latePreemptOutcome, 'result_pending')) return false;
            flushPendingActionResult();
            return false;
        }
        if (!beginWechatActionExecution(task)) {
            const beginOutcome = {success: false, error: 'action_begin_uncertain',
                result: {uncertain: true, external_action_not_retried: true}};
            if (!savePendingActionResult(task, beginOutcome, 'result_pending')) return false;
            flushPendingActionResult();
            return false;
        }
        queuePhoneAudit(task, 'action_begin_fence_passed', 'running', 'info', {});
        let outcome;
        try {
            if (accountLoginTask) {
                outcome = executeAccountLogin(task);
            } else if (switchAccountTask) {
                const switchResult = checkWxName(
                    task.wechat_name || (task.payload && task.payload.target_wechat_name) || task.account,
                    null, task.hard_deadline || task.deadline
                );
                const switchRecorded = switchResult === 'success' && reportObservedWechatAccount(
                    config.lastObservedWechatName,
                    'switch_account_completed', task.account_id || null
                );
                outcome = switchRecorded ?
                    {success: true, result: {account_id: task.account_id, login_state: 'logged_in',
                        observed_wechat_name: config.lastObservedWechatName}} :
                    {success: false, error: switchResult === 'logged_out' ?
                        '目标微信已退出，需要人工登录' : switchResult === 'success' ?
                            '切换后昵称未能与服务器账号匹配' : '微信切换失败: ' + switchResult,
                     result: {account_id: task.account_id,
                         login_state: switchResult === 'logged_out' ? 'logged_out' : 'unknown',
                         error_code: switchResult === 'logged_out' ?
                             'account_logged_out' : 'account_verification_required'}};
            } else {
                outcome = wechatActionExecutor.execute(task, function () {
                    return shouldPreemptWechatAction(task.task_id);
                });
            }
        } catch (e) {
            outcome = {success: false, error: '动作执行异常: ' + e};
        }
        const needsWechatHome = task.action_type !== 'device_sleep' &&
            task.action_type !== 'device_wake' && task.action_type !== 'account_login';
        if (needsWechatHome) {
            const cleanup = wechatActionExecutor.restoreToWechatHome({
                reason: outcome.preempted === true ? 'preempted' : outcome.success ? 'completed' : 'failed'
            });
            outcome.result = outcome.result || {};
            outcome.result.cleanup = cleanup;
            queuePhoneAudit(task, 'action_cleanup_finished', 'cleanup',
                cleanup.success === true ? 'info' : 'error', cleanup);
            config.wechatRecoveryRequired = cleanup.success !== true;
            config.wechatRecoveryAttempts = cleanup.success ? 0 : config.wechatRecoveryAttempts + 1;
            if (config.wechatRecoveryRequired) {
                wechatActionStorage.putString('recovery_required', 'true');
            } else {
                wechatActionStorage.remove('recovery_required');
            }
            if (!cleanup.success) {
                outcome.result.cleanup_failed = true;
                loge('微信动作收尾失败，暂停后续动作直到恢复首页: ' + JSON.stringify(cleanup));
            }
        }
        // switch_account 成功时，reportObservedWechatAccount 已按真实昵称原子更新服务器记录。
        if (outcome.success && (task.action_type === 'device_sleep' || task.action_type === 'device_wake')) {
            config.runtimeMode = task.action_type === 'device_sleep' ? 'sleep' : 'idle';
            try {
                http.postJSON(config.baseUrl + '/api/wechat/v1/devices/heartbeat',
                    JSON.stringify({device_id: config.deviceId, runtime_mode: config.runtimeMode,
                        active_account_id: config.verifiedActionAccount,
                        current_task_id: task.task_id, app_version: config.version}), 8000, null);
            } catch (modeError) {
                logw('设备作息状态上报失败: ' + modeError);
            }
        }
        if (outcome.success) {
            if (accountLoginTask) {
                config.verifiedActionAccount = task.account_id;
                config.verifiedActionAccountAt = time();
                wechatActionStorage.putString('active_account_id', task.account_id);
            }
            logi('微信动作完成: ' + task.task_id + ' / ' + task.action_type);
        } else {
            loge('微信动作失败: ' + task.task_id + ' / ' + task.action_type + ' / ' +
                (outcome.error || '未知原因'));
        }
        if (outcome.preempted === true && !saveUnifiedActionCheckpoint(task, outcome)) {
            outcome.result = outcome.result || {};
            outcome.result.checkpoint_save_failed = true;
        }
        queuePhoneAudit(task, 'action_execution_finished', 'result_pending',
            outcome.success === true ? 'info' : outcome.preempted === true ? 'warning' : 'error',
            {success: outcome.success === true, preempted: outcome.preempted === true,
                error: outcome.error || null, elapsed_ms: time() - actionStartedAt,
                result: outcome.result || {}});
        if (!savePendingActionResult(task, outcome, 'result_pending')) {
            loge('动作已经结束但结果检查点写入失败，停止继续领取任务以防重复执行');
            return false;
        }
        if (!flushPendingActionResult()) return false;
        return outcome.success === true;
    } catch (e) {
        loge('processWechatAction: ' + e);
        return false;
    } finally {
        config.actionHeartbeatStop = true;
        config.actionPreemptRequested = false;
        try { releaseNode(); } catch (ignoreRelease) {}
        config.pauseResultWatcher = false;
        config.actionInProgress = false;
    }
}

function pollAndProcessWechatAction() {
    const task = getWechatActionTask();
    if (!task) return false;
    try {
        logi('开始微信动作: ' + task.task_id + ' / ' + task.action_type);
        return processWechatAction(task);
    } catch (handoffError) {
        // processWechatAction 自身有保护；这里仍保留最外层交接审计，确保以后
        // 再出现“领取了但没有进入处理”的问题时服务器能看到准确阶段。
        loge('统一任务领取后交接失败: ' + handoffError);
        queuePhoneAudit(task, 'action_handoff_failed', 'handoff', 'error',
            {action_type: task.action_type, error: '' + handoffError});
        return false;
    }
}

function ackScanTask(taskConfig) {
    if (!taskConfig.ackRequired) return true;
    const url = `${config.baseUrl}/api/scan/task/ack`;
    const data = JSON.stringify({
        task_id: taskConfig.taskId,
        phone_id: config.deviceId,
        dispatch_token: taskConfig.dispatchToken
    });
    for (let i = 0; i < 4; i++) {
        try {
            let res = http.postJSON(url, data, 8000, null);
            let ret = JSON.parse(res);
            if (ret.success) {
                // 服务器从ACK时刻开始计时；本地再预留10秒，saoma内部另预留20秒上报时间。
                if (ret.task_deadline) taskConfig.taskDeadline = ret.task_deadline - 10000;
                return true;
            }
            logw('任务确认被拒绝: ' + ret.message);
        } catch (e) {
            loge('ackScanTask: ' + e);
        }
        sleep(Math.min((i + 1) * 1500, 5000));
    }
    return false;
}

function upResult(taskConfig, result = true, error = null, errorCode = null) {
    const url = `${config.baseUrl}/api/scan/result`;
    const data = JSON.stringify({
        "task_id": taskConfig.taskId,              // 必填，任务ID
        "phone_id": config.deviceId,            // 必填，手机ID
        "success": result,                    // 必填，扫码是否成功
        "wechat_nickname": taskConfig.wxName, // 选填，扫码成功时的微信昵称
        "scan_time": time(),                    // 必填，扫码时间戳(毫秒)
        "error": error,                      // 选填，失败原因(成功时为null)
        "error_code": errorCode              // 机器可读状态，供服务端阻止重复扫码
    });
    for (let i = 0; i < 5; i++) {
        try {
            // 网络请求本身也可能抛异常。必须在 try 内捕获，否则主状态机会
            // 留在旧步骤并反复处理已经超时的任务。
            let res = http.postJSON(url, data, 15000, null);
            logd(res);
            let ret = JSON.parse(res);
            if (ret.success) {
                toast('上报完成');
                // exit()
                return true;
            } else {
                toast('上传结果失败\n' + ret.message);
            }
        } catch (e) {
            loge('upResult: ' + e);
        }
        // 递增退避：2s,4s,6s... 最多8s
        sleep(Math.min((i + 1) * 2000, 8000));
    }
    return false;
}

function upStepLog(taskId, step, msg, level = 'info') {
    if (!taskId) return true;
    const url = `${config.baseUrl}/api/scan/step_log`;
    const data = JSON.stringify({
        task_id: taskId,
        phone_id: config.deviceId,
        step: step,
        message: msg,
        level: level,
        timestamp: time()
    });
    try {
        http.postJSON(url, data, 8000, null); // 8秒超时，不重试（步骤日志非关键）
    } catch (e) {
        loge('upStepLog: ' + e);
    }
}

/**
 * 安全重启微信。
 * accKillApp 会进入系统设置并操作无障碍节点，执行期间必须暂停后台结果检测线程，
 * 否则后台线程的 releaseNode/findNode 会使主线程持有的节点失效。
 */
function restartWechatSafely(reason, taskId) {
    logw('准备重启微信: ' + reason);
    if (taskId) {
        upStepLog(taskId, 'restartWx', '准备重启微信: ' + reason, 'warn');
    }

    const previousWatcherPause = config.pauseResultWatcher;
    config.pauseResultWatcher = true;
    // 强停/重启微信不会自动切换账号，保留服务器账号主键；若微信显示登录页，
    // 后续动作会直接上报 logged_out。
    // 后台结果线程每200ms轮询一次，等待它完成当前轮节点操作。
    sleep(350);

    let killed = false;
    try {
        killed = laoleng.app.accKillApp(config.pkgName);
        if (!killed) {
            logw('无障碍强停微信未确认成功，继续尝试回到桌面并重新打开');
            if (taskId) {
                upStepLog(taskId, 'restartWx', '强停微信未确认成功，尝试直接重新打开', 'warn');
            }
        }

        home();
        sleep(1500);
        utils.openApp(config.pkgName);
        sleep(3000);

        if (taskId) {
            upStepLog(taskId, 'restartWx', '微信已重新打开');
        }
        return true;
    } catch (e) {
        loge('安全重启微信异常: ' + e);
        if (taskId) {
            upStepLog(taskId, 'restartWx', '重启微信异常: ' + e, 'error');
        }

        // 最后再做一次不依赖节点的桌面恢复，避免停留在系统设置页。
        try {
            home();
            sleep(1000);
            utils.openApp(config.pkgName);
            sleep(3000);
        } catch (recoveryError) {
            loge('微信恢复失败: ' + recoveryError);
            return false;
        }
        return false;
    } finally {
        try {
            releaseNode();
        } catch (ignore) {
        }
        config.pauseResultWatcher = previousWatcherPause;
    }
}

function detectWechatLoggedOut() {
    // 只识别微信真正的登录页。首页风控/安全提醒通常可由人工提前处理，
    // 不能仅凭风险文案把仍处于登录状态的账号误判为退出。
    let activityName = '';
    try {
        activityName = laoleng.shell.getRunningActivity() || '';
    } catch (activityError) {
        logw('读取微信顶层Activity失败: ' + activityError);
    }
    const accountActivity = /plugin\.account\.ui\.(Welcome|Login|MobileInput|LoginPassword|LoginVoice)/i.test(activityName);
    if (accountActivity) {
        logw('通过Activity确认微信登录页: ' + activityName);
        return true;
    }

    const directLoginSelectors = [
        textMatch('^(手机号登录|微信号/QQ号/邮箱登录|用微信号/QQ号/邮箱登录|使用手机号登录)$').pkg(config.pkgName),
        descMatch('^(手机号登录|微信号/QQ号/邮箱登录|用微信号/QQ号/邮箱登录|使用手机号登录)$').pkg(config.pkgName)
    ];
    for (let i = 0; i < directLoginSelectors.length; i++) {
        if (jc.FindNode(directLoginSelectors[i])) {
            logw('通过登录入口节点确认微信登录页');
            return true;
        }
    }

    const hasLoginButton = jc.FindNode(text('登录').pkg(config.pkgName)) ||
        jc.FindNode(desc('登录').pkg(config.pkgName));
    const hasRegisterButton = jc.FindNode(text('注册').pkg(config.pkgName)) ||
        jc.FindNode(desc('注册').pkg(config.pkgName));
    const hasAccountPageCompanion = jc.FindNode(textMatch('^(更多选项|找回密码|紧急冻结|微信安全中心)$').pkg(config.pkgName)) ||
        jc.FindNode(descMatch('^(更多选项|找回密码|紧急冻结|微信安全中心)$').pkg(config.pkgName));
    const confirmed = hasLoginButton && (hasRegisterButton || hasAccountPageCompanion);
    if (confirmed) logw('通过登录按钮组合确认微信登录页');
    return confirmed;
}

function reportWechatLoginPage() {
    if (!detectWechatLoggedOut()) return false;
    let identifier = '';
    try {
        if (jc.FindNode(textMatch('^1[0-9]{10}$').pkg(config.pkgName))) {
            identifier = String(j_node.text || '').trim();
        }
        if (!identifier) {
            loge('检测到登录页，但未识别到11位登录手机号');
            return false;
        }
        const response = http.postJSON(
            config.baseUrl + '/api/wechat/v1/devices/login-state',
            JSON.stringify({device_id: config.deviceId, login_identifier: identifier}),
            10000, null);
        const result = JSON.parse(response);
        if (!result.success) return false;
        if (result.requires_manual === true) {
            loge('账号自动登录已停止，需要人工完成微信安全验证');
            return false;
        }
        logw('已向服务器上报微信退出状态，等待自动登录任务');
        return true;
    } catch (error) {
        loge('上报微信登录页失败: ' + error);
        return false;
    } finally {
        try { releaseNode(); } catch (ignoreLoginPageRelease) {}
    }
}

function identifyLoginPageAccount() {
    if (!detectWechatLoggedOut()) return null;
    try {
        if (jc.FindNode(textMatch('^1[0-9]{10}$').pkg(config.pkgName))) {
            return String(j_node.text || '').trim() || null;
        }
    } finally {
        try { releaseNode(); } catch (ignoreIdentifierRelease) {}
    }
    return null;
}

function deferWechatTaskForLogin(task) {
    const identifier = identifyLoginPageAccount();
    if (!identifier) return false;
    try {
        const response = http.postJSON(
            config.baseUrl + '/api/wechat/v1/tasks/' + task.task_id + '/defer-for-login',
            JSON.stringify({device_id: config.deviceId,
                dispatch_token: task.dispatch_token, login_identifier: identifier}),
            10000, null);
        const result = JSON.parse(response);
        if (!result.success) return false;
        logw('原任务已安全暂停，优先执行自动登录: ' + task.task_id);
        queuePhoneAudit(task, 'task_deferred_for_login', 'pending', 'warning', {});
        return true;
    } catch (error) {
        loge('暂停任务等待自动登录失败: ' + error);
        return false;
    }
}

function inputPasswordCharacterByCharacter(editor, password, deadline) {
    if (!editor || !password) return false;
    editor.clearText();
    for (let i = 1; i <= password.length; i++) {
        if (time() + 1500 >= deadline || config.actionPreemptRequested) return false;
        if (!editor.inputText(password.substring(0, i))) return false;
        sleep(random(90, 240));
    }
    return true;
}

function executeAccountLogin(task) {
    const payload = task.payload || {};
    const deadline = Math.min(task.hard_deadline || time() + 150000, time() + 150000);
    const identifier = String(payload.login_identifier || '');
    const password = String(payload.password || '');
    if (!detectWechatLoggedOut()) return {success: false, error: '当前不是微信登录页',
        result: {error_code: 'login_page_not_detected'}};
    if (!identifier || !jc.FindNode(text(identifier).pkg(config.pkgName))) {
        return {success: false, error: '登录页账号与任务不一致',
            result: {error_code: 'login_identifier_mismatch'}};
    }
    if (!password) return {success: false, error: '服务器未下发登录凭据',
        result: {error_code: 'login_secret_missing'}};
    let editor = null;
    try {
        if (!jc.FindNode(id('com.tencent.mm:id/d98').clz('android.widget.EditText').pkg(config.pkgName))) {
            return {success: false, error: '未找到密码输入框',
                result: {error_code: 'login_password_field_missing'}};
        }
        editor = j_node;
        humanizedNodeClick(editor);
        if (!inputPasswordCharacterByCharacter(editor, password, deadline)) {
            return {success: false, preempted: config.actionPreemptRequested,
                error: '密码逐字输入失败', result: {error_code: 'login_password_input_failed'}};
        }
        sleep(random(400, 900));
        if (!jc.FindNode(text('登录').id('com.tencent.mm:id/iol').pkg(config.pkgName))) {
            return {success: false, error: '未找到登录按钮',
                result: {error_code: 'login_button_missing'}};
        }
        humanizedNodeClick(j_node);
        let nonLoginChecks = 0;
        while (time() < deadline) {
            if (config.actionPreemptRequested) return {success: false, preempted: true,
                error: '扫码任务抢占登录'};
            if (jc.FindNode(textMatch('^(安全验证|身份验证|短信验证|请完成验证|登录环境异常).*$').pkg(config.pkgName)) ||
                jc.FindNode(descMatch('^(安全验证|身份验证|短信验证|请完成验证|登录环境异常).*$').pkg(config.pkgName))) {
                return {success: false, error: '登录需要人工安全验证',
                    result: {error_code: 'login_security_verification'}};
            }
            if (!detectWechatLoggedOut()) {
                nonLoginChecks++;
                if (nonLoginChecks >= 3) {
                    return {success: true, result: {login_state: 'logged_in',
                        account_id: task.account_id, credential_used: true}};
                }
            } else {
                nonLoginChecks = 0;
            }
            if (jc.FindNode(textMatch('^(密码错误|帐号或密码错误|登录失败).*$').pkg(config.pkgName))) {
                return {success: false, error: '微信拒绝登录凭据',
                    result: {error_code: 'login_credentials_rejected'}};
            }
            sleep(800);
        }
        return {success: false, error: '登录等待超时', result: {error_code: 'login_timeout'}};
    } finally {
        editor = null;
        try { releaseNode(); } catch (ignoreLoginRelease) {}
    }
}

/**
 * 优先通过微信小程序右上角菜单“重新进入小程序”恢复扫码页。
 * 该操作不会强停微信，也不会改变当前登录账号。节点操作期间仍需暂停结果线程，
 * 防止两个线程同时获取/释放无障碍节点。
 */
function restartMiniProgramSafely(reason, taskId) {
    logw('准备重新进入小程序: ' + reason);
    if (taskId) upStepLog(taskId, 'restartMiniProgram', '准备重新进入小程序: ' + reason, 'warn');

    const previousWatcherPause = config.pauseResultWatcher;
    config.pauseResultWatcher = true;
    sleep(350);
    try {
        if (getRunningPkg() !== config.pkgName) return false;

        let restartEntry = null;
        try {
            restartEntry = textMatch('重新进入\\s*小程序').pkg(config.pkgName).getOneNodeInfo(500);
        } finally {
            releaseNode();
        }

        if (!restartEntry) {
            let more = null;
            let menuOpened = false;
            try {
                more = desc('更多').id('com.tencent.mm:id/go').pkg(config.pkgName).getOneNodeInfo(700);
                menuOpened = !!(more && humanizedNodeClick(more));
            } finally {
                releaseNode();
            }
            if (!menuOpened) return false;
            sleep(700);
        }

        let clicked = false;
        try {
            restartEntry = textMatch('重新进入\\s*小程序').pkg(config.pkgName).getOneNodeInfo(900);
            let current = restartEntry;
            for (let depth = 0; current && depth < 5; depth++) {
                if (current.visible && current.clickable && humanizedNodeClick(current)) {
                    clicked = true;
                    break;
                }
                current = current.parent();
            }
        } finally {
            releaseNode();
        }
        if (!clicked) return false;

        sleep(2500);
        const recovered = getRunningPkg() === config.pkgName;
        if (taskId) {
            upStepLog(taskId, 'restartMiniProgram', recovered ?
                '已重新进入小程序' : '重新进入小程序后微信不在前台', recovered ? 'info' : 'warn');
        }
        return recovered;
    } catch (e) {
        loge('重新进入小程序异常: ' + e);
        if (taskId) upStepLog(taskId, 'restartMiniProgram', '重新进入小程序异常: ' + e, 'warn');
        return false;
    } finally {
        try { releaseNode(); } catch (ignore) {}
        config.pauseResultWatcher = previousWatcherPause;
    }
}

function recoverScanMiniProgram(reason, taskId) {
    if (restartMiniProgramSafely(reason, taskId)) return true;
    logw('小程序内恢复失败，回退为安全重启微信: ' + reason);
    if (taskId) upStepLog(taskId, 'restartWx', '小程序内恢复失败，回退重启微信', 'warn');
    return restartWechatSafely(reason, taskId);
}

function checkWxName(wxName, taskId, taskDeadline) {
    logw('检查当前登录的微信');
    upStepLog(taskId, 'checkWx', '开始验证微信账号: ' + wxName); // 步骤日志L05
    const t = time();
    // 账号检查也必须服从任务总时限，并给失败结果上报至少预留20秒。
    const checkDeadline = taskDeadline ? Math.min(t + 1000 * 100, taskDeadline - 20000) : t + 1000 * 100;
    let num = 0;
    while (time() < checkDeadline) {
        if (config.actionInProgress && config.actionPreemptRequested) {
            return 'preempted';
        }
        try {
            if (detectWechatLoggedOut()) {
                reportWechatLoginPage();
                upStepLog(taskId, 'checkWx', '检测到微信登录页面，账号已退出', 'error');
                return 'logged_out';
            } else if (jc.FindNode(text('管理').clickable(true))) {
                logd('到达选择账号界面');
                if (jc.FindNode(text(wxName).clz('android.widget.TextView'))) {
                    logd('点击选择:　' + j_node.text);
                    humanizedNodeClick(j_node);
                    sleep(3000);
                }
            } else if (jc.FindNode(text('设置').id('android:id/text1').clz('android.widget.TextView'))) {
                logd('到达设置界面');
                if (jc.FindNode(text('切换账号').clz('android.widget.TextView'))) {
                    logd('点击:　' + j_node.text);
                    humanizedNodeClick(j_node);
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
                        config.lastObservedWechatName = nowWxName;
                        logd('当前微信: ' + nowWxName);
                        upStepLog(taskId, 'checkWx', '当前账号:' + nowWxName + ' 目标:' + wxName); // 步骤日志L06
                        if (nowWxName === wxName) {
                            upStepLog(taskId, 'checkWx', '微信账号确认正确'); // 步骤日志L07
                            return 'success';
                        } else {
                            if (jc.FindNode(text('设置').id('android:id/title').clz('android.widget.TextView'))) {
                                logd('点击:　' + j_node.text);
                    humanizedNodeClick(j_node);
                                sleep(1000);
                            }
                        }
                    }
                }
            } else if (jc.FindNode(text('我').clz('android.widget.TextView').pkg(config.pkgName))) {
                logd('点击:　' + j_node.text);
                    humanizedNodeClick(j_node);
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
    if (taskDeadline && time() >= taskDeadline - 20000) {
        upStepLog(taskId, 'checkWx', '任务总时限即将到达，停止账号验证', 'error');
        return 'deadline';
    }
    upStepLog(taskId, 'checkWx', '账号验证超时100s', 'error'); // 步骤日志L08
    return 'timeout';
}

function observeCurrentWechatNickname(deadline) {
    const stopAt = Math.min(deadline || time() + 30000, time() + 30000);
    while (time() < stopAt) {
        try {
            if (detectWechatLoggedOut()) return {state: 'logged_out', nickname: null};
            if (jc.FindNode(desc('我的二维码').clickable(true))) {
                if (jc.FindNode(textMatch('微信号：.+').clz('android.widget.TextView').clickable(true))) {
                    const nickname = j_node.previousSiblings()?.[1]?.text;
                    if (nickname) {
                        config.lastObservedWechatName = String(nickname).trim();
                        return {state: 'observed', nickname: config.lastObservedWechatName};
                    }
                }
            } else if (jc.FindNode(text('我').clz('android.widget.TextView').pkg(config.pkgName))) {
                humanizedNodeClick(j_node);
                sleep(900);
            } else if (getRunningPkg() !== config.pkgName) {
                utils.openApp(config.pkgName);
                sleep(1800);
            } else {
                back();
                sleep(700);
            }
        } catch (e) {
            logw('识别当前微信昵称失败: ' + e);
        } finally {
            try { releaseNode(); } catch (ignore) {}
        }
        sleep(500);
    }
    return {state: 'unknown', nickname: null};
}

function reportObservedWechatAccount(nickname, reason, expectedAccountId) {
    try {
        const response = http.postJSON(
            config.baseUrl + '/api/wechat/v1/devices/observe-account',
            JSON.stringify({device_id: config.deviceId,
                observed_wechat_name: nickname || null, reason: reason || 'phone_observation',
                app_version: config.version}), 10000, null);
        const result = JSON.parse(response);
        if (!result.success || result.match_state !== 'matched' || !result.active_account_id) {
            config.verifiedActionAccount = null;
            wechatActionStorage.remove('active_account_id');
            loge('当前微信昵称未匹配服务器账号: ' + (nickname || '未识别'));
            return false;
        }
        if (expectedAccountId && result.active_account_id !== expectedAccountId) {
            config.verifiedActionAccount = null;
            wechatActionStorage.remove('active_account_id');
            loge('服务器账号匹配与任务目标不一致: observed=' + result.active_account_id +
                ' expected=' + expectedAccountId);
            return false;
        }
        config.verifiedActionAccount = result.active_account_id;
        config.verifiedActionAccountAt = time();
        wechatActionStorage.putString('active_account_id', result.active_account_id);
        logi('服务器已记录当前微信: ' + nickname + ' -> ' + result.active_account_id);
        return true;
    } catch (e) {
        config.verifiedActionAccount = null;
        loge('当前微信账号上报失败: ' + e);
        return false;
    }
}

function synchronizeObservedWechatAccount(reason, expectedAccountId) {
    const observed = observeCurrentWechatNickname(time() + 30000);
    if (observed.state === 'logged_out') {
        reportWechatLoginPage();
        return false;
    }
    const matched = reportObservedWechatAccount(
        observed.nickname, reason || 'startup', expectedAccountId || null
    );
    let cleanup = {success: false, error: '账号观测后首页恢复未执行'};
    try {
        cleanup = wechatActionExecutor.restoreToWechatHome({reason: 'account_observation'});
        if (!cleanup.success) {
            sleep(random(800, 1601));
            cleanup = wechatActionExecutor.restoreToWechatHome({reason: 'account_observation_retry'});
        }
    } catch (cleanupError) {
        cleanup = {success: false, error: '' + cleanupError};
    }
    config.wechatRecoveryRequired = cleanup.success !== true;
    config.wechatRecoveryAttempts = cleanup.success ? 0 : config.wechatRecoveryAttempts + 1;
    if (config.wechatRecoveryRequired) {
        wechatActionStorage.putString('recovery_required', 'true');
        loge('读取微信昵称后未恢复到首页，已进入恢复门禁: ' + JSON.stringify(cleanup));
    } else {
        wechatActionStorage.remove('recovery_required');
        logi('读取微信昵称后已恢复到微信首页');
    }
    return matched;
}

/**
 *
 * @return {number} -1扫码超时 1扫码成功 0需要人工介入
 */
function saoma(taskId, taskDeadline) {
    logw('扫码');
    upStepLog(taskId, 'saoma', '开始扫码流程'); // 步骤日志L09
    config.scanFailureReason = null;
    const t = time();
    const maxScanDuration = 1000 * 240;
    // 既限制扫码阶段本身，也限制从领取任务开始的总耗时，并给结果上报预留20秒。
    const scanDeadline = taskDeadline ? Math.min(t + maxScanDuration, taskDeadline - 20000) : t + maxScanDuration;
    const scanAttemptTimeout = 25000; // 点击相册后，无论停在哪个授权子页面都必须在25秒内得到结果
    const maxRecoveryCount = 2; // 超时和“验证失败”合计最多自动恢复2次
    let num = 0;//app不在前台的次数
    let retVal = -1;
    let scanAttemptStartTime = 0; // 本轮点击相册的起点；授权控件出现或点击后也不能清零
    let lastAuthorizationActionTime = 0; // 授权控件点击节流，防止卡页时连续点击
    let authorizationPageLogged = false;
    let phoneAuthorizationAttempts = 0; // 原生手机号卡片是最终授权，每轮最多点击2次
    let recoveryCount = 0;
    while (time() < scanDeadline) {
        if ( config.step!==4) return -999

        // “验证失败”经常是微信侧瞬时状态，同一任务立即重扫通常可以成功。
        // 后台线程只负责发现结果，重启微信和重扫必须由主线程执行，避免节点锁竞态。
        if (config.validationFailurePending) {
            config.validationFailurePending = false;
            if (recoveryCount >= maxRecoveryCount) {
                loge('验证失败，已达到自动恢复上限');
                upStepLog(taskId, 'saoma', '验证失败，自动恢复已达上限' + maxRecoveryCount + '次', 'error');
                config.scanFailureReason = '验证失败，自动恢复' + maxRecoveryCount + '次后仍失败';
                retVal = 0;
                break;
            }
            recoveryCount++;
            logw('检测到验证失败，开始第' + recoveryCount + '次自动恢复');
            upStepLog(taskId, 'saoma', '检测到验证失败，自动恢复第' + recoveryCount + '次', 'warn');
            if (!recoverScanMiniProgram('验证失败自动恢复', taskId)) {
                upStepLog(taskId, 'saoma', '验证失败后恢复小程序失败', 'error');
                config.scanFailureReason = '验证失败，自动恢复小程序失败';
                retVal = 0;
                break;
            }
            // 重启期间旧失败页可能被后台线程再识别一次，重启完成后丢弃该旧信号。
            config.validationFailurePending = false;
            scanAttemptStartTime = 0;
            lastAuthorizationActionTime = 0;
            authorizationPageLogged = false;
            phoneAuthorizationAttempts = 0;
            continue;
        }
        keepScreen();
        try {
            if (jc.FindNode(textMatch('已发送至 \\d+\\*+\\d+'))) {
                loge('需要人工介入');
                upStepLog(taskId, 'saoma', '触发人工介入条件', 'error'); // 步骤日志L14
                config.scanFailureReason = '二维码已发送至其他手机号，需要人工介入';
                retVal = 0;
                break;
            } else if (jc.FindNode(text('申请获取并验证你的手机号'))) {
                logd('达到手机号授权界面');
                if (scanAttemptStartTime === 0) scanAttemptStartTime = time();
                if (!authorizationPageLogged) {
                    upStepLog(taskId, 'saoma', '检测到手机号授权弹窗'); // 步骤日志L11
                    authorizationPageLogged = true;
                }
                if (time() - lastAuthorizationActionTime >= 2500) {
                    if (phoneAuthorizationAttempts < 2) {
                        const submitted = clickNativePhoneAuthorizationCard() === true;
                        if (submitted) {
                            phoneAuthorizationAttempts++;
                            lastAuthorizationActionTime = time();
                            upStepLog(taskId, 'saoma',
                                '已点击手机号卡片并提交最终授权，第' +
                                phoneAuthorizationAttempts + '次'); // 步骤日志L12
                            sleep(3000);
                        } else {
                            upStepLog(taskId, 'saoma',
                                '手机号卡片节点和视觉区域均未验证，等待重试', 'warn');
                        }
                    }
                }
            } else if (jc.FindNode(textMatch('请授权获取手机号进行验证'))) {
                if (scanAttemptStartTime === 0) scanAttemptStartTime = time();
                if (time() - lastAuthorizationActionTime >= 4000) {
                    const clickedPrompt = humanizedNodeClick(j_node) === true;
                    if (clickedPrompt) {
                        lastAuthorizationActionTime = time();
                        upStepLog(taskId, 'saoma', '已点击小程序手机号授权入口，等待微信授权弹窗');
                        sleep(2500);
                    } else {
                        upStepLog(taskId, 'saoma', '小程序手机号授权入口点击失败，等待重试', 'warn');
                    }
                }
            } else if (jc.FindNode(text('解锁'))) {
                if (scanAttemptStartTime === 0) scanAttemptStartTime = time();
                if (time() - lastAuthorizationActionTime >= 4000) {
                    logd('点击: 解锁');
                    humanizedNodeClick(j_node);
                    lastAuthorizationActionTime = time();
                    upStepLog(taskId, 'saoma', '已点击解锁节点，等待验证结果', 'warn');
                    sleep(3000);
                }
            } else if (findImage('授权手机号', 193, 915, 914, 1363)) {
                //这个是对上面的补充，上面节点有时候找不到
                if (scanAttemptStartTime === 0) scanAttemptStartTime = time();
                if (time() - lastAuthorizationActionTime >= 4000) {
                    logd('点击: 授权手机号');
                    if (humanizedPointClick(gPoint.x, gPoint.y, 5) === true) {
                        lastAuthorizationActionTime = time();
                        upStepLog(taskId, 'saoma', '已通过图片识别点击授权控件，等待页面变化', 'warn');
                        sleep(2500);
                    } else {
                        upStepLog(taskId, 'saoma', '图片授权控件点击失败，等待重试', 'warn');
                    }
                }
            } else if (findImage('解锁按钮', 414, 1300, 620, 1372)) {
                //这个是对上面的补充，上面节点有时候找不到
                if (scanAttemptStartTime === 0) scanAttemptStartTime = time();
                if (time() - lastAuthorizationActionTime >= 4000) {
                    logd('点击: 解锁(图像识别)');
                    if (humanizedPointClick(gPoint.x, gPoint.y, 5) === true) {
                        lastAuthorizationActionTime = time();
                        upStepLog(taskId, 'saoma', '已通过图片识别点击解锁，等待验证结果', 'warn');
                        sleep(3000);
                    } else {
                        upStepLog(taskId, 'saoma', '图片解锁按钮点击失败，等待重试', 'warn');
                    }
                }
            } else if (jc.FindNode(text('拍摄照片'))) {
                logd('到达扫码界面');
                // 同一轮扫码只能点击一次相册图片，避免微信未跳页时反复点击并重置超时起点。
                if (scanAttemptStartTime === 0) {
                    let timeStampArr = [];
                    if (jc.FindNodeEx(descMatch('图片\\d+, \\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}').clz('android.widget.ImageView'))) {
                        for (let i = 0; i < j_nodeAll.length; i++) {
                            let imgTime = j_nodeAll[i].desc.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/) + '';//获取图片的时间
                            let timeStamp = jc.Date.DateToTimestamp(imgTime, 'yyyy-MM-dd HH:mm');//转成时间戳
                            timeStampArr.push(timeStamp);
                        }
                        let maxImg = jc.Date.TimestampToDate(Math.max.apply(null, timeStampArr), 'yyyy-MM-dd HH:mm');//找出最新的那张图片
                        if (jc.FindNode(descMatch('图片\\d+, ' + maxImg))) {
                            logd('点击: ' + j_node.desc);
                    humanizedNodeClick(j_node);
                            scanAttemptStartTime = time();
                            lastAuthorizationActionTime = 0;
                            authorizationPageLogged = false;
                            phoneAuthorizationAttempts = 0;
                            upStepLog(taskId, 'saoma', '已点击相册图片，等待授权及验证结果'); // 步骤日志L10
                            sleep(5000)
                        }
                    }
                }
            } else if (jc.FindNode(desc('相册，按钮').clickable(true))) {
                logd('点击:　' + j_node.desc);
                    humanizedNodeClick(j_node);
            } else if (jc.FindNode(text('扫一扫').clz('android.widget.TextView').descMatch('^$'))) {
                logd('点击:　扫码');
                    humanizedNodeClick(j_node);
            } else if (jc.FindNode(id('com.tencent.mm:id/plus_icon').clz('aandroid.widget.ImageView').descMatch('^$').clickable(true))) {
                logd('点击:　更多功能');
                    humanizedNodeClick(j_node);
            } else if (jc.FindNode(desc('更多功能').clz('android.widget.Button'))) {
                logd('点击:　' + j_node.desc);
                    humanizedNodeClick(j_node);
            } else if (jc.FindNode(text('通讯录').id('com.tencent.mm:id/icon_tv'))) {
                logd('点击:　' + j_node.text);
                    humanizedNodeClick(j_node);
            } else if (jc.FindNode(text('拒绝').clz('android.widget.Button'))) {
                //拒绝小程序获取位置信息
                logd('点击:　' + j_node.text);
                    humanizedNodeClick(j_node);
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
        // 后台线程可能在本轮节点查询期间已经确认成功并切回步骤1，禁止再执行超时重启。
        if (config.step !== 4) return -999;
        // 失败信号优先交给下一轮顶部统一处理，不能同时触发授权超时恢复并重复计数。
        if (config.validationFailurePending) {
            image.recycleAllImage();
            continue;
        }
        // 从点击相册开始计时。识别到或点击了授权控件也不能取消保护，必须等到后台确认成功/失败。
        if (scanAttemptStartTime > 0 && time() - scanAttemptStartTime > scanAttemptTimeout) {
            if (recoveryCount >= maxRecoveryCount) {
                loge('扫码授权或验证无结果，已达到自动恢复上限');
                config.scanFailureReason = '扫码授权或验证无结果，自动恢复' + maxRecoveryCount + '次后仍失败';
                retVal = 0;
                break;
            }
            recoveryCount++;
            logw('扫码授权或验证25秒无结果，第' + recoveryCount + '次自动恢复');
            upStepLog(taskId, 'saoma', '扫码授权或验证无结果，自动恢复第' + recoveryCount + '次', 'warn'); // 步骤日志L13
            if (!recoverScanMiniProgram('扫码授权或验证无结果', taskId)) {
                loge('扫码无结果后恢复小程序失败');
                upStepLog(taskId, 'saoma', '扫码无结果且恢复小程序失败', 'error');
                config.scanFailureReason = '扫码授权或验证无结果且恢复小程序失败';
                retVal = 0;
                break;
            }
            config.validationFailurePending = false;
            scanAttemptStartTime = 0;
            lastAuthorizationActionTime = 0;
            authorizationPageLogged = false;
            phoneAuthorizationAttempts = 0;
        }
        image.recycleAllImage()
        sleep(800);
    }
    if (retVal === -1) {
        config.scanFailureReason = '任务总时限内扫码未完成';
        upStepLog(taskId, 'saoma', '任务总时限内扫码未完成，已预留结果上报时间', 'error'); // 步骤日志L15
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
    logi('当前版本号: ' + config.version); // 启动时打印版本号
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

    // 12台手机按设备ID错峰0~119秒检查，之后每5分钟检查一次。
    let updateStagger = 0;
    for (let i = 0; i < config.deviceId.length; i++) {
        updateStagger = (updateStagger + config.deviceId.charCodeAt(i)) % 120;
    }
    jc.Utils.autoHotUpdate(
        300,
        function () {
            return config.step === 1 && !config.pollingTask && !config.actionInProgress;
        },
        function (updating) {
            config.updateInProgress = updating;
            logi(updating ? '开始检查脚本更新，暂停领取任务' : '脚本更新检查结束，恢复任务轮询');
        },
        updateStagger
    );
    logi('自动更新已启用，首次检查延迟: ' + updateStagger + '秒');

    let taskConfig = {};
    let scanResult = -999;
    let resultUploaded = false; // 防止后台线程和主线程双重提交结果
    let scanTaskSnapshot = null; // 检测到结果时立即保存任务快照，防止竞态条件
    let activeTaskSnapshot = null; // 步骤4开始时保存的任务快照，确保后台线程只上报当前正在扫码的任务
    config.validationFailurePending = false; // 验证失败由主线程恢复，后台线程不得直接结束任务
    thread.execAsync(function () {
        while (true) {
            // 非扫码结果阶段绝不触碰节点。此前线程即使在账号检查/微信动作期间
            // 也会每200ms releaseNode，导致主线程节点随机失效。
            if (config.pauseResultWatcher || config.step !== 4 || !activeTaskSnapshot) {
                sleep(200);
                continue;
            }

            try {
                releaseNode();
                removeNodeFlag(0);
                lockNode();

                // 暂停标志可能在本轮节点初始化期间发生变化，操作节点前再次确认。
                if (!config.pauseResultWatcher &&
                    config.step === 4 && activeTaskSnapshot && !scanTaskSnapshot) {
                    if (findNode(text('验证成功').clz('android.widget.TextView').pkg(config.pkgName))) {
                        logd('验证成功');
                        scanResult = 1;
                        // 使用步骤4开始时保存的快照，而不是当前的taskConfig
                        scanTaskSnapshot = {taskId: activeTaskSnapshot.taskId, wxName: activeTaskSnapshot.wxName};
                    } else if (findNode(text('解锁成功').clz('android.widget.TextView').pkg(config.pkgName))) {
                        logd('解锁成功');
                        scanResult = 1;
                        scanTaskSnapshot = {taskId: activeTaskSnapshot.taskId, wxName: activeTaskSnapshot.wxName};
                    } else if (findNode(text('验证失败').clz('android.widget.TextView').pkg(config.pkgName))) {
                        logd('验证失败');
                        config.validationFailurePending = true;
                    }
                }
            } catch (watchError) {
                loge('结果检测线程异常: ' + watchError);
            } finally {
                try {
                    releaseNode();
                } catch (ignore) {
                }
            }

            // 上报结果
            if (scanResult !== -999 && !resultUploaded && scanTaskSnapshot) {
                resultUploaded = true;
                if (scanResult === 1) {
                    upResult(scanTaskSnapshot);
                } else if (scanResult === 0) {
                    upResult(scanTaskSnapshot, false, '验证失败,需要人工介入');
                } else if (scanResult === -1) {
                    upResult(scanTaskSnapshot, false, '验证超时');
                }
                scanResult = -999;
                scanTaskSnapshot = null;
                activeTaskSnapshot = null; // 清除活跃任务快照
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
                logi('开始注册，当前版本号: ' + config.version);
                logi('脚本会话: ' + config.scriptSessionId + ' 进入注册原因: ' + config.stepZeroReason);
                if (login(config.deviceId, config.wxArr)) {
                    if (!synchronizeObservedWechatAccount('script_startup', null)) {
                        logw('启动时未能匹配当前微信，扫码和社交动作将等待显式切号任务');
                    }
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
                config.validationFailurePending = false;
                config.accountCheckRecoveryCount = 0;
                if (config.updateInProgress) {
                    sleep(1000);
                    break;
                }
                const onWechatLoginPage = detectWechatLoggedOut();
                if (onWechatLoginPage) {
                    reportWechatLoginPage();
                    config.wechatRecoveryRequired = false;
                }
                if (config.wechatRecoveryRequired && !onWechatLoginPage) {
                    let recoveredHome = wechatActionExecutor.restoreToWechatHome({reason: 'recovery_gate'});
                    config.wechatRecoveryAttempts++;
                    if (!recoveredHome.success && config.wechatRecoveryAttempts >= 2) {
                        const restarted = restartWechatSafely('统一动作收尾连续失败', null);
                        recoveredHome = restarted ?
                            wechatActionExecutor.restoreToWechatHome({reason: 'recovery_after_restart'}) :
                            recoveredHome;
                    }
                    config.wechatRecoveryRequired = recoveredHome.success !== true;
                    if (!config.wechatRecoveryRequired) {
                        config.wechatRecoveryAttempts = 0;
                        wechatActionStorage.remove('recovery_required');
                    }
                    if (config.wechatRecoveryRequired) {
                        loge('微信尚未恢复到首页，扫码和动作领取暂缓: ' + JSON.stringify(recoveredHome));
                        sleep(3000);
                        break;
                    }
                }
                if (!flushPendingActionResult()) {
                    logw('存在尚未补报的微信动作结果，暂不领取新任务');
                    sleep(3000);
                    break;
                }
                flushPhoneAuditLogs();
                taskConfig = getScan(config.deviceId);
                if (!taskConfig) {
                    if (config.step === 0) {
                        // 服务端明确要求重新注册时，当前轮不能继续领取统一动作。
                        sleep(500);
                        break;
                    }
                    // 扫码永远优先；确认当前没有扫码任务后才领取低优先级微信动作。
                    pollAndProcessWechatAction();
                    sleep(3000);
                    break;
                }
                if (!ackScanTask(taskConfig)) {
                    // 未ACK时绝不开始扫码；下一轮会幂等地重新拿到同一租约。
                    logw('任务确认失败，暂不处理，等待重试: ' + taskConfig.taskId);
                    taskConfig = null;
                    config.step = 1;
                    sleep(1000);
                    break;
                }
                upStepLog(taskConfig.taskId, 'main', '任务开始处理，微信号:' + taskConfig.wxName); // 步骤日志L01
                config.step = 2;
                break;  //获取任务
            case 2:
                if (base64ToBitmap(taskConfig.base64Str, taskConfig.taskId)) {
                    config.step = 3;
                } else {
                    upResult(taskConfig, false, 'base64转二维码失败');
                    config.step = 1;
                }
                break;  //图片转换
            case 3:
                // 新服务器已把切换账号拆为独立 switch_account 任务。扫码阶段
                // 不再重复进入个人页确认昵称，只保留真实退出登录检测。
                const locallyPrepared = taskConfig.accountPrepared &&
                    config.verifiedActionAccount === taskConfig.accountId;
                const accountCheckResult = locallyPrepared ?
                    (detectWechatLoggedOut() ? 'logged_out' : 'success') :
                    checkWxName(taskConfig.wxName, taskConfig.taskId, taskConfig.taskDeadline);
                if (accountCheckResult === 'success') {
                    const recordOk = locallyPrepared || reportObservedWechatAccount(
                        config.lastObservedWechatName || taskConfig.wxName,
                        'scan_account_verified', taskConfig.accountId
                    );
                    if (recordOk) {
                        config.step = 4;
                    } else {
                        const mismatchTask = taskConfig;
                        taskConfig = null;
                        config.step = 1;
                        upResult(mismatchTask, false, '微信昵称与服务器账号记录不一致',
                            'account_verification_required');
                    }
                } else {
                    let accountError = '账号验证超时';
                    if (accountCheckResult === 'logged_out') {
                        accountError = '微信账号已退出，需要人工登录';
                    } else if (accountCheckResult === 'deadline') {
                        accountError = '账号验证超过任务总时限';
                    }

                    const canRecover = accountCheckResult === 'timeout' &&
                        config.accountCheckRecoveryCount < 1 &&
                        (!taskConfig.taskDeadline || time() + 30000 < taskConfig.taskDeadline);
                    if (canRecover) {
                        config.accountCheckRecoveryCount++;
                        if (!restartWechatSafely('账号验证超时，执行唯一一次恢复', taskConfig.taskId)) {
                            accountError = '账号验证超时且重启微信失败';
                            const restartFailedTask = taskConfig;
                            taskConfig = null;
                            config.step = 1;
                            upResult(restartFailedTask, false, accountError, 'account_verification_required');
                        }
                    } else {
                        upStepLog(taskConfig.taskId, 'checkWx', '账号检查终止: ' + accountError, 'error');
                        const accountErrorCode = accountCheckResult === 'logged_out' ?
                            'account_logged_out' : 'account_verification_required';
                        // 先终结本地任务，再尝试网络上报。即使公网完全不可用，
                        // 也不能重新进入步骤3重启微信或验证同一个过期任务。
                        const accountFailedTask = taskConfig;
                        taskConfig = null;
                        config.step = 1;
                        upResult(accountFailedTask, false, accountError, accountErrorCode);
                    }
                }
                break;  //检查当前微信号是否是任务需要的微信号
            case 4:
                // 步骤4开始时保存当前任务快照，供后台线程使用
                activeTaskSnapshot = {taskId: taskConfig.taskId, wxName: taskConfig.wxName};
                config.validationFailurePending = false;
                scanResult = saoma(taskConfig.taskId, taskConfig.taskDeadline);
                // 后台线程没有提交过才由主线程提交
                if (!resultUploaded) {
                    resultUploaded = true;
                    if (scanResult === 1) {
                        upResult(activeTaskSnapshot);
                    } else if (scanResult === 0) {
                        upResult(activeTaskSnapshot, false, config.scanFailureReason || '扫码失败，需要人工介入');
                    } else if (scanResult === -1) {
                        upResult(activeTaskSnapshot, false, config.scanFailureReason || '验证超时');
                    }
                }
                scanResult = -999; // 复位
                activeTaskSnapshot = null; // 清除活跃任务快照
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




