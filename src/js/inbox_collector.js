/** 微信通知采集器：只读取通知并批量上报，不操作任何微信节点。 */

const WECHAT_PACKAGE = 'com.tencent.mm';

function textValue(value) {
    return value === null || value === undefined ? '' : ('' + value).trim();
}

function notificationKey(item) {
    return [textValue(item.key), textValue(item.seqId), textValue(item.time),
        textValue(item.title), textValue(item.text), textValue(item.bigText)].join('|');
}

function classify(item) {
    const content = textValue(item.bigText) || textValue(item.text) || textValue(item.subText);
    if (/^\[图片\]|图片消息/.test(content)) return 'image';
    if (/^\[语音\]|语音消息/.test(content)) return 'voice';
    if (/^\[链接\]|网页链接/.test(content)) return 'link';
    if (/^\[文件\]|文件消息/.test(content)) return 'file';
    if (!content || /收到一条消息|有新消息/.test(content)) return 'unknown';
    return 'text';
}

function toEvent(item, options) {
    const content = textValue(item.bigText) || textValue(item.text) || textValue(item.subText);
    const sender = textValue(item.titleBig) || textValue(item.title);
    return {
        device_id: options.deviceId,
        account_id: options.activeAccount ? options.activeAccount() : null,
        source: 'notification',
        source_key: notificationKey(item),
        sender: sender,
        conversation_hint: sender,
        text_preview: content,
        message_type: classify(item),
        observed_at: Number(item.time) > 0 ? Number(item.time) : time(),
        confidence: sender && content ? 0.9 : 0.45,
        payload: {
            notification_key: textValue(item.key),
            notification_seq_id: textValue(item.seqId),
            sub_text: textValue(item.subText),
            summary: textValue(item.summaryBig)
        }
    };
}

function start(options) {
    const state = storages.create('wechat_inbox_collector_v1');
    thread.execAsync(function () {
        let permissionLogged = false;
        while (!options.shouldStop || !options.shouldStop()) {
            try {
                if (!acEvent.hasNotificationPermission()) {
                    if (!permissionLogged) logw('微信通知监听权限未开启，入站消息采集暂停');
                    permissionLogged = true;
                    sleep(15000);
                    continue;
                }
                permissionLogged = false;
                const notifications = acEvent.getLastNotification(WECHAT_PACKAGE, 20) || [];
                const events = [];
                for (let i = notifications.length - 1; i >= 0; i--) {
                    const item = notifications[i];
                    const key = notificationKey(item);
                    if (!key || state.getBoolean('seen:' + key, false)) continue;
                    events.push(toEvent(item, options));
                }
                if (events.length) {
                    const response = http.postJSON(options.baseUrl + '/api/wechat/v1/events/batch',
                        JSON.stringify({events: events}), 10000, null);
                    const parsed = JSON.parse(response);
                    if (parsed.success) {
                        for (let i = 0; i < events.length; i++) {
                            state.putBoolean('seen:' + events[i].source_key, true);
                        }
                        logi('微信通知上报完成: ' + events.length + '条');
                    }
                }
            } catch (e) {
                logw('微信通知采集失败: ' + e);
            }
            sleep(3000);
        }
    });
}

module.exports = {start: start, classify: classify, toEvent: toEvent};
