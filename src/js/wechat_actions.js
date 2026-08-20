/** 微信动作执行器：只在已验证的微信节点范围内点击，并支持扫码抢占。 */
const WX_PACKAGE = 'com.tencent.mm';
const WX_PAGE = {
    MAIN: 'main', SEARCH: 'search', CHAT_TEXT: 'chat_text', CHAT_VOICE: 'chat_voice',
    CHAT_EMOJI: 'chat_emoji', MOMENTS: 'moments', MOMENT_EDITOR: 'moment_editor',
    CHANNELS: 'channels', BLOCKED: 'blocked', OTHER: 'other', UNKNOWN: 'unknown'
};
const runtime = {
    currentChatContact: null,
    chatVerifiedAt: 0
};

function boundsValue(bounds, primary, fallback) {
    return bounds && bounds[primary] !== undefined ? bounds[primary] : bounds ? bounds[fallback] : undefined;
}

function intOrDefault(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
}

function humanPause(minMs, maxMs) {
    sleep(random(Math.max(20, ~~minMs), Math.max(~~minMs + 1, ~~maxMs)));
}

// EasyClick 的 inputText 本质上是一次性设置文本。这里逐步设置不断增长的
// 前缀，让微信输入框表现为逐字输入；不使用剪贴板，也不一次灌入整段文字。
function typeTextCharacterByCharacter(editor, value, deadline, shouldPreempt) {
    const content = String(value || '');
    if (!editor || !content) return false;
    editor.clearText();
    let offset = 0;
    while (offset < content.length) {
        if ((deadline && time() + 1500 >= deadline) ||
            (shouldPreempt && shouldPreempt())) return false;
        let next = offset + 1;
        const code = content.charCodeAt(offset);
        // 不把 emoji 等 UTF-16 代理对拆成两个无效字符。
        if (code >= 0xD800 && code <= 0xDBFF && next < content.length) next++;
        const prefix = content.substring(0, next);
        if (!editor.inputText(prefix)) return false;
        const typed = content.substring(offset, next);
        if (/[,，。！？!?；;…\n]/.test(typed)) humanPause(260, 720);
        else humanPause(75, 260);
        if (random(0, 14) === 0) humanPause(280, 850);
        offset = next;
    }
    return true;
}

function humanizedPointClick(x, y, radius) {
    const width = device.getScreenWidth(), height = device.getScreenHeight();
    const spread = Math.max(1, Math.min(12, ~~radius || 4));
    const px = Math.max(1, Math.min(width - 2, ~~x + random(-spread, spread + 1)));
    const py = Math.max(1, Math.min(height - 2, ~~y + random(-spread, spread + 1)));
    humanPause(120, 480);
    const clicked = clickPoint(px, py);
    humanPause(90, 350);
    return clicked;
}

function clickNodeSafeArea(node) {
    if (!node || !node.visible) return false;
    const bounds = node.bounds || {};
    const left = boundsValue(bounds, 'left', 'l'), top = boundsValue(bounds, 'top', 't');
    const right = boundsValue(bounds, 'right', 'r'), bottom = boundsValue(bounds, 'bottom', 'b');
    if ([left, top, right, bottom].some(function (value) { return value === undefined; }) ||
        right - left < 4 || bottom - top < 4) return false;
    const insetX = Math.max(2, ~~((right - left) * 0.24));
    const insetY = Math.max(2, ~~((bottom - top) * 0.24));
    humanPause(120, 480);
    const clicked = clickPoint(random(left + insetX, right - insetX),
        random(top + insetY, bottom - insetY));
    humanPause(90, 350);
    return clicked;
}

function clickVerifiedNode(node) {
    if (!node || !node.visible) return false;
    let current = node;
    for (let depth = 0; current && depth < 7; depth++) {
        if (current.clickable && clickNodeSafeArea(current)) return true;
        current = current.parent();
    }
    const bounds = node.bounds;
    const left = boundsValue(bounds, 'left', 'l');
    const top = boundsValue(bounds, 'top', 't');
    const right = boundsValue(bounds, 'right', 'r');
    const bottom = boundsValue(bounds, 'bottom', 'b');
    if ([left, top, right, bottom].some(function (value) { return value === undefined; }) ||
        right - left < 4 || bottom - top < 4) return false;
    // 仅在控件中央安全区域取变化点，防止边缘误触到相邻控件。
    const insetX = Math.max(2, ~~((right - left) * 0.28));
    const insetY = Math.max(2, ~~((bottom - top) * 0.28));
    return humanizedPointClick(random(left + insetX, right - insetX),
        random(top + insetY, bottom - insetY), 2);
}

function withNode(factory, operation) {
    let node = null;
    try {
        node = factory();
        return !!(node && operation(node));
    } catch (e) {
        loge('微信动作节点操作失败: ' + e);
        return false;
    } finally {
        releaseNode();
    }
}

function retryFreshNode(label, factory, operation, attempts, intervalMs, deadline) {
    const maxAttempts = Math.max(1, Math.min(5, ~~attempts || 3));
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if ((deadline && time() >= deadline) || getRunningPkg() !== WX_PACKAGE || hasSafetyBlocker()) {
            logw('微信动作中止 label=' + label + ' reason=unsafe_or_timeout');
            return false;
        }
        let node = null;
        try {
            node = factory();
            if (node && operation(node)) return true;
        } catch (e) {
            logw('微信动作重试 label=' + label + ' attempt=' + attempt + ' error=' + e);
        } finally {
            releaseNode();
        }
        if (attempt < maxAttempts) {
            const base = Math.max(200, ~~intervalMs || 500);
            sleep(random(~~(base * 0.75), ~~(base * 1.35) + 1));
        }
    }
    return false;
}

function isChatPage() {
    const page = detectWechatPage();
    return page === WX_PAGE.CHAT_TEXT || page === WX_PAGE.CHAT_VOICE || page === WX_PAGE.CHAT_EMOJI;
}

function waitFor(check, timeoutMs, intervalMs) {
    const deadline = time() + Math.max(200, timeoutMs || 3000);
    while (time() < deadline) {
        if (check()) return true;
        sleep(Math.max(100, intervalMs || 250));
    }
    return false;
}

function switchToKeyboardMode(deadline) {
    const page = detectWechatPage();
    if (page === WX_PAGE.CHAT_TEXT) return true;
    if (page !== WX_PAGE.CHAT_VOICE && page !== WX_PAGE.CHAT_EMOJI) return false;
    const switched = retryFreshNode('switch_keyboard', function () {
        return desc('切换到键盘').pkg(WX_PACKAGE).getOneNodeInfo(500) ||
            desc('键盘').pkg(WX_PACKAGE).getOneNodeInfo(300);
    }, clickVerifiedNode, 3, 450, deadline);
    return switched && waitFor(function () { return detectWechatPage() === WX_PAGE.CHAT_TEXT; }, 3000, 250);
}

function visibleText(value, timeout) {
    const nodes = text(value).pkg(WX_PACKAGE).getNodeInfo(timeout || 500);
    if (!nodes) return null;
    for (let i = 0; i < nodes.length; i++) if (nodes[i].visible) return nodes[i];
    return null;
}

function hasSafetyBlocker() {
    return withNode(function () {
        return textMatch('^(登录|手机号登录|微信安全中心|安全验证|请输入验证码)$')
            .pkg(WX_PACKAGE).getOneNodeInfo(150);
    }, function (node) { return node.visible; });
}

function hasVisibleId(value, timeout) {
    return withNode(function () { return id(value).pkg(WX_PACKAGE).getOneNodeInfo(timeout || 250); },
        function (node) { return node.visible; });
}

function hasVisibleDesc(value, timeout) {
    return withNode(function () { return desc(value).pkg(WX_PACKAGE).getOneNodeInfo(timeout || 250); },
        function (node) { return node.visible; });
}

function bottomTabNode(tabName) {
    const nodes = id('com.tencent.mm:id/icon_tv').pkg(WX_PACKAGE).getNodeInfo(500);
    if (!nodes) return null;
    const height = device.getScreenHeight();
    for (let i = 0; i < nodes.length; i++) {
        const top = boundsValue(nodes[i].bounds, 'top', 't');
        if (nodes[i].visible && nodes[i].text === tabName && top > height * 0.8) return nodes[i];
    }
    return null;
}

function isMainTabActive(tabName) {
    return withNode(function () { return bottomTabNode(tabName); }, function (node) {
        if (node.selected === true) return true;
        const parent = node.parent();
        return !!(parent && parent.selected === true);
    });
}

function detectWechatPage() {
    if (getRunningPkg() !== WX_PACKAGE) return WX_PAGE.OTHER;
    let xml = '';
    try { xml = dumpXml() || ''; } catch (snapshotError) {
        logw('微信页面快照失败: ' + snapshotError);
    }
    function attr(name, value) { return xml.indexOf(name + '="' + value + '"') >= 0; }
    const blockers = ['登录', '手机号登录', '微信安全中心', '安全验证', '请输入验证码'];
    for (let blockerIndex = 0; blockerIndex < blockers.length; blockerIndex++) {
        if (attr('text', blockers[blockerIndex])) return WX_PAGE.BLOCKED;
    }
    if (attr('id', 'com.tencent.mm:id/d98')) return WX_PAGE.SEARCH;
    if (attr('id', 'com.tencent.mm:id/n7y')) return WX_PAGE.MOMENT_EDITOR;
    if (attr('desc', '拍照分享') && attr('id', 'com.tencent.mm:id/actionbar_up_indicator')) return WX_PAGE.MOMENTS;
    if (attr('desc', '关注') && attr('desc', '推荐')) return WX_PAGE.CHANNELS;
    if (attr('desc', '键盘') && (attr('desc', '表情') || attr('text', '所有表情'))) return WX_PAGE.CHAT_EMOJI;
    if (attr('desc', '切换到键盘') && (attr('text', '按住 说话') || attr('text', '按住说话'))) return WX_PAGE.CHAT_VOICE;
    if ((attr('desc', '切换到按住说话') || attr('id', 'com.tencent.mm:id/bkk')) &&
        attr('desc', '表情')) return WX_PAGE.CHAT_TEXT;
    let tabCount = 0;
    const tabs = ['微信', '通讯录', '发现', '我'];
    for (let i = 0; i < tabs.length; i++) {
        if (attr('id', 'com.tencent.mm:id/icon_tv') && attr('text', tabs[i])) tabCount++;
    }
    return tabCount >= 3 ? WX_PAGE.MAIN : WX_PAGE.UNKNOWN;
}

function clickKnownPageBack(page, deadline) {
    if (page === WX_PAGE.CHAT_EMOJI) {
        if (switchToKeyboardMode(deadline)) return true;
        back();
        return waitFor(function () { return detectWechatPage() === WX_PAGE.CHAT_TEXT; }, 3000, 250);
    }
    if (page === WX_PAGE.CHAT_VOICE && !switchToKeyboardMode(deadline)) return false;
    const normalized = page === WX_PAGE.CHAT_VOICE ? WX_PAGE.CHAT_TEXT : page;
    const clicked = retryFreshNode('known_page_back_' + normalized, function () {
        if (normalized === WX_PAGE.SEARCH) return id('com.tencent.mm:id/b5i').pkg(WX_PACKAGE).getOneNodeInfo(500);
        if (normalized === WX_PAGE.CHANNELS) return id('com.tencent.mm:id/backBtn').pkg(WX_PACKAGE).getOneNodeInfo(500);
        return id('com.tencent.mm:id/actionbar_up_indicator').pkg(WX_PACKAGE).getOneNodeInfo(500);
    }, clickVerifiedNode, 2, 350, deadline);
    return clicked && waitFor(function () {
        const next = detectWechatPage();
        return next !== normalized && next !== WX_PAGE.UNKNOWN;
    }, 5000, 250);
}

function mainTab(tabName, deadline) {
    for (let depth = 0; depth < 6; depth++) {
        if (deadline && time() >= deadline) return false;
        const page = detectWechatPage();
        if (page === WX_PAGE.BLOCKED || page === WX_PAGE.OTHER) return false;
        if (page === WX_PAGE.MAIN && isMainTabActive(tabName)) return true;
        const clicked = retryFreshNode('main_tab_' + tabName, function () {
            return bottomTabNode(tabName);
        }, clickVerifiedNode, 3, 450, deadline);
        if (clicked) {
            const active = waitFor(function () {
                return detectWechatPage() === WX_PAGE.MAIN && isMainTabActive(tabName);
            }, 5000, 250);
            if (active) return true;
            // 点击已发出但节点的 selected 状态刷新慢，重抓节点再试，不立即判失败。
            humanPause(350, 800);
            continue;
        }
        // UNKNOWN 页面也先尝试底部主标签；微信页面切换期间节点树可能短暂不完整。
        if (page === WX_PAGE.UNKNOWN || !clickKnownPageBack(page, deadline)) return false;
    }
    return false;
}

function openContact(contact, deadline) {
    if (!contact) return false;
    if (runtime.currentChatContact === contact && time() - runtime.chatVerifiedAt < 120000 && isChatPage()) {
        runtime.chatVerifiedAt = time();
        return true;
    }
    runtime.currentChatContact = null;
    if (!mainTab('微信', deadline)) return false;
    let searchReady = false;
    for (let searchAttempt = 1; searchAttempt <= 3 && !searchReady; searchAttempt++) {
        const clickedSearch = retryFreshNode('open_search_' + searchAttempt, function () {
            return desc('搜索').pkg(WX_PACKAGE).getOneNodeInfo(700);
        }, clickVerifiedNode, 1, 500, deadline);
        if (!clickedSearch) continue;
        searchReady = waitFor(function () {
            return withNode(function () {
                return id('com.tencent.mm:id/d98').pkg(WX_PACKAGE).getOneNodeInfo(250);
            }, function (input) { return input.visible; });
        }, 1600, 200);
        if (!searchReady) sleep(random(300, 700));
    }
    if (!searchReady) return false;
    if (!retryFreshNode('search_contact_input', function () {
        return id('com.tencent.mm:id/d98').pkg(WX_PACKAGE).getOneNodeInfo(700);
    }, function (input) {
        clickNodeSafeArea(input);
        return typeTextCharacterByCharacter(input, contact, deadline, null);
    }, 3, 500, deadline)) return false;
    const queryVerified = waitFor(function () {
        return withNode(function () {
            return id('com.tencent.mm:id/d98').pkg(WX_PACKAGE).getOneNodeInfo(300);
        }, function (input) { return (input.text || '').indexOf(contact) >= 0; });
    }, 1800, 250);
    if (!queryVerified) return false;
    sleep(random(900, 1900));
    if (!retryFreshNode('open_contact_result', function () {
        const nodes = id('com.tencent.mm:id/odf').pkg(WX_PACKAGE).getNodeInfo(700);
        if (!nodes) return null;
        for (let i = 0; i < nodes.length; i++) if (nodes[i].visible && nodes[i].text === contact) return nodes[i];
        return null;
    }, clickVerifiedNode, 3, 650, deadline)) return false;
    const opened = waitFor(function () {
        if (isChatPage()) return true;
        // 搜索结果偶尔先进入资料页，明确点击“发消息”后再校验聊天输入框。
        retryFreshNode('profile_send_message', function () { return visibleText('发消息', 150); },
            clickVerifiedNode, 1, 200, deadline);
        return false;
    }, 5000, 300);
    if (opened) {
        runtime.currentChatContact = contact;
        runtime.chatVerifiedAt = time();
    }
    return opened;
}

function inspectChat(payload, deadline) {
    if (!openContact(payload.contact, deadline) || !isChatPage()) {
        return {success: false, error: '无法进入待核验聊天'};
    }
    sleep(random(500, 1200));
    let nodes = null;
    const messages = [];
    const excluded = /^(发送|表情|更多|按住说话|切换到键盘)$/;
    try {
        nodes = clz('android.widget.TextView').pkg(WX_PACKAGE).getNodeInfo(900) || [];
        const width = device.getScreenWidth(), height = device.getScreenHeight();
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i], value = (node.text || '').trim(), b = node.bounds || {};
            const left = b.left !== undefined ? b.left : b.l;
            const top = b.top !== undefined ? b.top : b.t;
            const right = b.right !== undefined ? b.right : b.r;
            const bottom = b.bottom !== undefined ? b.bottom : b.b;
            if (!node.visible || !value || excluded.test(value) || value.length > 4000) continue;
            if (left < 0 || top < height * 0.08 || right > width || bottom > height * 0.88) continue;
            messages.push({text: value, bounds: [left, top, right, bottom]});
        }
    } finally {
        releaseNode();
    }
    const preview = (payload.notification_preview || '').trim();
    if (preview) {
        const matched = messages.filter(function (item) {
            return item.text === preview || item.text.indexOf(preview) >= 0 || preview.indexOf(item.text) >= 0;
        });
        if (matched.length) return {success: true, result: {messages: matched.slice(-10), verified_by: 'notification_match'}};
    }
    return {success: false, result: {messages: messages.slice(-10)},
        error: '实际聊天页未找到与通知匹配的消息，需要人工确认'};
}

function verifyChatInputEmpty(timeoutMs) {
    return waitFor(function () {
        return withNode(function () {
            return id('com.tencent.mm:id/bkk').clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(300);
        }, function (input) { return !(input.text || ''); });
    }, timeoutMs || 2500, 250);
}

function clearChatDraft() {
    return retryFreshNode('clear_chat_draft', function () {
        return id('com.tencent.mm:id/bkk').clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(400);
    }, function (input) { clickNodeSafeArea(input); input.clearText(); return true; }, 2, 300);
}

function sendText(payload, deadline, shouldPreempt) {
    if (!payload.confirm_external || !openContact(payload.contact, deadline) || !switchToKeyboardMode(deadline)) {
        return {success: false, error: '未授权发送或无法打开联系人'};
    }
    const prepared = retryFreshNode('prepare_text', function () {
        return id('com.tencent.mm:id/bkk').clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(800);
    }, function (input) {
        clickNodeSafeArea(input);
        return typeTextCharacterByCharacter(input, payload.content, deadline, shouldPreempt);
    }, 3, 450, deadline);
    if (!prepared) {
        clearChatDraft();
        if (shouldPreempt && shouldPreempt()) {
            return {success: false, preempted: true, error: '扫码任务抢占'};
        }
        return {success: false, error: '消息逐字输入失败'};
    }
    const contentReady = waitFor(function () {
        return withNode(function () {
            return id('com.tencent.mm:id/bkk').clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(300);
        }, function (input) { return (input.text || '') === payload.content; });
    }, 1800, 250);
    if (!contentReady) {
        clearChatDraft();
        return {success: false, error: '消息输入内容校验失败'};
    }
    if (shouldPreempt && shouldPreempt()) {
        clearChatDraft();
        return {success: false, preempted: true, error: '扫码任务抢占'};
    }
    sleep(random(700, 2200));
    const sent = retryFreshNode('send_text', function () { return visibleText('发送', 650); },
        clickVerifiedNode, 1, 400, deadline);
    const empty = sent && verifyChatInputEmpty(2500);
    if (!sent) clearChatDraft();
    return {success: sent && empty, result: {sent: sent, input_empty: empty}, error: sent && empty ? null : '发送后校验失败'};
}

function openChatForMedia(payload, deadline) {
    return payload.confirm_external === true && openContact(payload.contact, deadline);
}

function sendEmoji(payload, deadline, shouldPreempt) {
    if (!openChatForMedia(payload, deadline) || !switchToKeyboardMode(deadline)) {
        return {success: false, error: '未授权发送或无法打开联系人'};
    }
    // 先打开表情面板，再按无障碍描述精确选择；不会用屏幕固定坐标。
    const opened = retryFreshNode('open_emoji_panel', function () {
        return desc('表情').pkg(WX_PACKAGE).getOneNodeInfo(700);
    }, clickVerifiedNode, 3, 450, deadline);
    if (!opened) return {success: false, error: '无法打开表情面板'};
    sleep(random(450, 1200));
    if (shouldPreempt && shouldPreempt()) {
        switchToKeyboardMode(deadline);
        return {success: false, preempted: true, error: '扫码任务抢占'};
    }
    sleep(random(550, 1800));
    const sent = retryFreshNode('send_emoji', function () {
        return desc(payload.description).pkg(WX_PACKAGE).getOneNodeInfo(800);
    }, clickVerifiedNode, 1, 500, deadline);
    sleep(random(350, 900));
    const chatStillOpen = isChatPage() || withNode(function () {
        return desc('切换到键盘').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (node) { return node.visible; });
    return {success: sent && chatStillOpen, result: {description: payload.description},
        error: sent && chatStillOpen ? null : '表情发送后页面校验失败'};
}

function sendVoice(payload, deadline, shouldPreempt) {
    if (!openChatForMedia(payload, deadline)) return {success: false, error: '未授权发送或无法打开联系人'};
    let voiceReady = withNode(function () {
        return text('按住 说话').pkg(WX_PACKAGE).getOneNodeInfo(250) ||
            text('按住说话').pkg(WX_PACKAGE).getOneNodeInfo(200);
    }, function (node) { return node.visible; });
    if (!voiceReady) {
        if (!switchToKeyboardMode(deadline)) return {success: false, error: '聊天输入页面校验失败'};
        const switched = retryFreshNode('switch_voice_mode', function () {
            return desc('切换到按住说话').pkg(WX_PACKAGE).getOneNodeInfo(700);
        }, clickVerifiedNode, 3, 450, deadline);
        if (!switched) return {success: false, error: '无法切换语音模式'};
        sleep(500);
    }
    let duration = Math.max(1, Math.min(15, intOrDefault(payload.duration_seconds, 2)));
    if (deadline && time() + duration * 1000 + 2000 >= deadline) {
        return {success: false, error: '任务剩余时间不足以安全发送语音'};
    }
    let recordingPreempted = false;
    sleep(random(450, 1400));
    const sent = retryFreshNode('hold_to_talk', function () {
        return text('按住 说话').pkg(WX_PACKAGE).getOneNodeInfo(500) ||
            text('按住说话').pkg(WX_PACKAGE).getOneNodeInfo(300);
    }, function (button) {
        const bounds = button.bounds;
        const left = boundsValue(bounds, 'left', 'l'), right = boundsValue(bounds, 'right', 'r');
        const top = boundsValue(bounds, 'top', 't'), bottom = boundsValue(bounds, 'bottom', 'b');
        const x = random(~~(left + (right - left) * 0.4), ~~(left + (right - left) * 0.6));
        const y = random(~~(top + (bottom - top) * 0.4), ~~(top + (bottom - top) * 0.6));
        let releaseY = y;
        try {
            touchDown(x, y);
            // 某些 EasyClick 版本 touchDown 成功时返回 undefined，不能依赖返回值。
            const recordingDeadline = time() + duration * 1000;
            while (time() < recordingDeadline) {
                sleep(Math.min(300, recordingDeadline - time()));
                if (shouldPreempt && shouldPreempt()) {
                    // 微信“按住说话”向上滑动为取消手势；坐标从已验证按钮相对推导。
                    recordingPreempted = true;
                    releaseY = Math.max(80, top - Math.max(120, ~~(device.getScreenHeight() * 0.18)));
                    touchMove(x, releaseY);
                    sleep(200);
                    break;
                }
            }
            if (recordingPreempted) return false;
            return true;
        } finally {
            // 无论脚本异常、节点异常还是超时，都必须松开手指，避免微信持续录音。
            try { touchUp(x, releaseY); } catch (ignoreTouchUp) {}
        }
    }, 1, 500, deadline);
    sleep(600);
    const remainedInChat = getRunningPkg() === WX_PACKAGE && (isChatPage() || withNode(function () {
        return desc('切换到键盘').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (node) { return node.visible; }));
    return {success: sent && remainedInChat, preempted: recordingPreempted,
        result: {duration_seconds: duration, chat_verified: remainedInChat, cancelled: recordingPreempted},
        error: recordingPreempted ? '扫码任务抢占，已取消录音' :
            sent && remainedInChat ? null : '语音发送后页面校验失败'};
}

function clickFirstVisible(selectors, timeoutMs) {
    for (let i = 0; i < selectors.length; i++) {
        const clicked = withNode(function () {
            const nodes = selectors[i].getNodeInfo(timeoutMs || 350);
            if (!nodes) return null;
            for (let j = 0; j < nodes.length; j++) if (nodes[j].visible) return nodes[j];
            return null;
        }, clickVerifiedNode);
        if (clicked) return true;
    }
    return false;
}

function hasAnyVisibleText(values) {
    for (let i = 0; i < values.length; i++) {
        if (withNode(function () { return visibleText(values[i], 180); }, function () { return true; })) return values[i];
    }
    return null;
}

// 通话控制节点本身通常不可点击，而它的可点击父节点可能覆盖整个屏幕。
// 这里必须点击控制节点自己的中心，不能复用普通节点的“向上找可点击父节点”逻辑。
function clickCallControl(description) {
    return withNode(function () {
        return desc(description).pkg(WX_PACKAGE).getOneNodeInfo(500);
    }, function (node) {
        if (!node.visible) return false;
        const bounds = node.bounds || {};
        const left = bounds.left !== undefined ? bounds.left : bounds.l;
        const top = bounds.top !== undefined ? bounds.top : bounds.t;
        const right = bounds.right !== undefined ? bounds.right : bounds.r;
        const bottom = bounds.bottom !== undefined ? bounds.bottom : bounds.b;
        if ([left, top, right, bottom].some(function (value) { return value === undefined; })) return false;
        return humanizedPointClick((left + right) / 2, (top + bottom) / 2, 5);
    });
}

function ensureCallAudioMuted() {
    const state = {microphone_off: false, speaker_off: false};
    humanizedPointClick(~~(device.getScreenWidth() * 0.5), ~~(device.getScreenHeight() * 0.48), 8);
    sleep(500);
    if (hasVisibleDesc('麦克风已开', 250)) {
        clickCallControl('麦克风已开');
    }
    state.microphone_off = hasVisibleDesc('麦克风已关', 350);
    if (hasVisibleDesc('扬声器已开', 250)) {
        clickCallControl('扬声器已开');
    }
    state.speaker_off = hasVisibleDesc('扬声器已关', 350);
    return state;
}

function hangUpVoiceCall(knownCallActive) {
    const nodeClicked = clickCallControl('挂断') || clickCallControl('取消');
    if (nodeClicked) return true;
    // 部分微信版本 VoIP 控件不进入节点树；仅在已验证 VoIP Activity 后，
    // 在底部中央限定区域寻找红色挂断圆，禁止在普通页面使用坐标回退。
    const state = voiceCallPageState();
    if (!state.voip_activity && knownCallActive !== true) return false;
    humanizedPointClick(~~(device.getScreenWidth() * 0.5), ~~(device.getScreenHeight() * 0.48), 8);
    sleep(500);
    if (clickCallControl('挂断')) {
        return true;
    }
    const width = device.getScreenWidth(), height = device.getScreenHeight();
    const red = findCallColor('#e84b4f', ~~(width * 0.34), ~~(height * 0.74),
        ~~(width * 0.66), ~~(height * 0.96), 0.70);
    return !!(red && humanizedPointClick(red.x, red.y, 5));
}

function voiceCallPageState() {
    let voipActivity = false;
    try {
        const top = shell.execCommand('dumpsys activity top') || '';
        voipActivity = top.indexOf('com.tencent.mm.plugin.voip.ui.VideoActivity') >= 0;
    } catch (ignoreActivity) {}
    const stateText = hasAnyVisibleText([
        '正在等待对方接受邀请', '等待对方接受邀请', '通话中',
        '对方无应答', '对方已拒绝', '对方忙线', '通话结束'
    ]);
    const waitingDesc = hasVisibleDesc('等待对方接受邀请', 180) ||
        withNode(function () { return descMatch('^等待对方接受邀请.*').pkg(WX_PACKAGE).getOneNodeInfo(180); },
            function (node) { return node.visible; });
    const durationVisible = withNode(function () {
        return descMatch('^通话时长.*').pkg(WX_PACKAGE).getOneNodeInfo(180);
    }, function (node) { return node.visible; });
    const hangupVisible = withNode(function () {
        let nodes = desc('挂断').pkg(WX_PACKAGE).getNodeInfo(180);
        if (nodes) for (let i = 0; i < nodes.length; i++) if (nodes[i].visible) return nodes[i];
        nodes = text('挂断').pkg(WX_PACKAGE).getNodeInfo(180);
        if (nodes) for (let j = 0; j < nodes.length; j++) if (nodes[j].visible) return nodes[j];
        nodes = desc('取消').pkg(WX_PACKAGE).getNodeInfo(180);
        if (nodes) for (let k = 0; k < nodes.length; k++) if (nodes[k].visible) return nodes[k];
        return null;
    }, function (node) { return node.visible; });
    return {text: stateText || (waitingDesc ? '等待对方接受邀请' : null),
        hangup: hangupVisible, voip_activity: voipActivity || durationVisible};
}

function makeOutgoingCall(payload, shouldPreempt, taskDeadline, callType) {
    const isVideo = callType === 'video';
    const callLabel = isVideo ? '视频通话' : '语音通话';
    if (payload.confirm_external !== true) return {success: false, error: callLabel + '未明确授权'};
    if (!openContact(payload.contact, taskDeadline)) return {success: false, error: '无法打开联系人'};
    const keyboardRaised = withNode(function () {
        return id('com.tencent.mm:id/bkk').pkg(WX_PACKAGE).getOneNodeInfo(350);
    }, function (input) {
        const bottom = boundsValue(input.bounds, 'bottom', 'b');
        return input.visible && bottom < device.getScreenHeight() * 0.8;
    });
    if (keyboardRaised) {
        back();
        sleep(500);
        if (!isChatPage()) return {success: false, error: '关闭键盘后离开了聊天页面'};
    }
    const moreOpened = clickFirstVisible([
        desc('更多功能按钮，已折叠').pkg(WX_PACKAGE),
        desc('更多功能').pkg(WX_PACKAGE)
    ], 700);
    if (!moreOpened) return {success: false, error: '无法打开聊天更多功能'};
    sleep(600);
    if (!clickFirstVisible([text('视频通话').pkg(WX_PACKAGE)], 800)) {
        return {success: false, error: '未找到视频通话入口'};
    }
    sleep(500);
    if (shouldPreempt && shouldPreempt()) {
        back();
        return {success: false, preempted: true, error: '扫码任务抢占'};
    }
    if (!clickFirstVisible([text(callLabel).pkg(WX_PACKAGE)], 1000)) {
        return {success: false, error: '未找到' + callLabel + '选项'};
    }

    const startedAt = time();
    const ringDeadline = startedAt + Math.max(10, Math.min(120, intOrDefault(payload.ring_timeout_seconds, 45))) * 1000;
    const callDeadline = Math.min(startedAt + Math.max(10, Math.min(1800, intOrDefault(payload.max_duration_seconds, 60))) * 1000,
        (taskDeadline || startedAt + 1800000) - 2500);
    let answered = false;
    let endReason = 'remote_ended';
    let verified = false;
    let audioState = {microphone_off: false, speaker_off: false};
    let audioConfigured = false;
    while (time() < callDeadline) {
        if (hasSafetyBlocker()) { endReason = 'account_attention_required'; break; }
        if (shouldPreempt && shouldPreempt()) { endReason = 'scan_preempted'; break; }
        const callState = voiceCallPageState();
        const state = callState.text;
        const hangupVisible = callState.hangup;
        verified = verified || !!state || hangupVisible || callState.voip_activity;
        if (verified && !audioConfigured) {
            audioState = ensureCallAudioMuted();
            audioConfigured = true;
        }
        if (state === '对方无应答') { endReason = 'no_answer'; break; }
        if (state === '对方已拒绝') { endReason = 'declined'; break; }
        if (state === '对方忙线') { endReason = 'busy'; break; }
        if (state === '通话结束') { endReason = 'remote_ended'; break; }
        if (state === '通话中' || (!state && hangupVisible && time() - startedAt > 2500)) answered = true;
        if (!answered && time() >= ringDeadline) { endReason = 'ring_timeout'; break; }
        if (getRunningPkg() !== WX_PACKAGE) { endReason = 'wechat_not_foreground'; break; }
        // 控制栏会自动隐藏；节点暂时消失不代表通话已经结束。
        sleep(800);
    }
    if (time() >= callDeadline) endReason = 'duration_complete';
    const hungUp = verified ? hangUpVoiceCall(true) : false;
    sleep(600);
    runtime.currentChatContact = null;
    runtime.chatVerifiedAt = 0;
    return {
        success: verified && hungUp,
        result: {call_type: callType, dial_started: verified, answered: answered, end_reason: endReason,
                 elapsed_seconds: ~~((time() - startedAt) / 1000), hung_up: hungUp,
                 microphone_off: audioState.microphone_off, speaker_off: audioState.speaker_off},
        error: !verified ? '拨号页面未验证成功' : !hungUp ? '通话结束后挂断失败' : null
    };
}

function makeVoiceCall(payload, shouldPreempt, taskDeadline) {
    return makeOutgoingCall(payload, shouldPreempt, taskDeadline, 'voice');
}

function makeVideoCall(payload, shouldPreempt, taskDeadline) {
    return makeOutgoingCall(payload, shouldPreempt, taskDeadline, 'video');
}

function findCallColor(color, left, top, right, bottom, threshold) {
    let screen = null;
    try {
        image.recycleAllImage();
        screen = image.captureFullScreenEx();
        if (!screen) return null;
        const points = image.findColor(screen, color, threshold || 0.82,
            left, top, right, bottom, 1, 1);
        return points && points.length ? {x: points[0].x, y: points[0].y} : null;
    } catch (e) {
        logw('通话视觉找色失败: ' + e);
        return null;
    } finally {
        image.recycleAllImage();
    }
}

function findIncomingCallCard(width, height) {
    try {
        image.recycleAllImage();
        const screen = image.captureFullScreenEx();
        if (!screen) return null;
        const greenPoints = image.findColor(screen, '#07c160', 0.76,
            ~~(width * 0.78), ~~(height * 0.06), ~~(width * 0.98), ~~(height * 0.20), 1, 1);
        const redPoints = image.findColor(screen, '#e84b4f', 0.72,
            ~~(width * 0.58), ~~(height * 0.06), ~~(width * 0.78), ~~(height * 0.20), 1, 1);
        if (!greenPoints || !greenPoints.length || !redPoints || !redPoints.length) return null;
        return {green: {x: greenPoints[0].x, y: greenPoints[0].y},
            red: {x: redPoints[0].x, y: redPoints[0].y}};
    } catch (e) {
        logw('来电卡片视觉检测失败: ' + e);
        return null;
    } finally {
        image.recycleAllImage();
    }
}

function answerIncomingCall(payload, shouldPreempt, taskDeadline) {
    if (payload.confirm_external !== true) return {success: false, error: '接听通话未明确授权'};
    const width = device.getScreenWidth(), height = device.getScreenHeight();
    const card = findIncomingCallCard(width, height);
    if (!card) return {success: false, error: '未视觉确认到完整来电卡片'};
    humanizedPointClick(card.green.x, card.green.y, 5);
    const connected = waitFor(function () { return voiceCallPageState().voip_activity; }, 5000, 250);
    if (!connected) return {success: false, error: '点击接听后未进入通话页面'};
    const startedAt = time();
    const audioState = ensureCallAudioMuted();
    const duration = Math.max(5, Math.min(1800,
        intOrDefault(payload.duration_seconds || payload.max_duration_seconds, 60)));
    const deadline = Math.min(startedAt + duration * 1000,
        (taskDeadline || startedAt + duration * 1000) - 2000);
    let reason = 'duration_complete';
    while (time() < deadline) {
        if (shouldPreempt && shouldPreempt()) { reason = 'preempted'; break; }
        const callState = voiceCallPageState();
        if (callState.text === '通话结束' || callState.text === '对方已拒绝' ||
            callState.text === '对方忙线') { reason = 'remote_ended'; break; }
        if (getRunningPkg() !== WX_PACKAGE) { reason = 'wechat_not_foreground'; break; }
        sleep(500);
    }
    const hungUp = reason === 'remote_ended' ? true : hangUpVoiceCall(true);
    return {success: hungUp, preempted: reason === 'preempted',
        result: {answered: true, call_type: payload.call_type || 'any',
            elapsed_seconds: ~~((time() - startedAt) / 1000), end_reason: reason, hung_up: hungUp,
            microphone_off: audioState.microphone_off, speaker_off: audioState.speaker_off},
        error: hungUp ? null : '到时挂断失败'};
}

function hangupCurrentCall() {
    const state = voiceCallPageState();
    const knownCallActive = state.voip_activity || state.hangup || !!state.text ||
        detectWechatPage() === WX_PAGE.UNKNOWN;
    if (!knownCallActive) return {success: false, error: '当前没有可验证的微信通话'};
    const hungUp = hangUpVoiceCall(true);
    const ended = hungUp && waitFor(function () {
        const page = detectWechatPage();
        return page !== WX_PAGE.UNKNOWN && !voiceCallPageState().voip_activity;
    }, 6000, 250);
    return {success: ended,
        result: {hung_up: hungUp}, error: hungUp ? null : '挂断按钮点击失败'};
}

function openDiscoverItem(item, deadline) {
    runtime.currentChatContact = null;
    runtime.chatVerifiedAt = 0;
    if (!mainTab('发现', deadline)) return false;
    return retryFreshNode('open_discover_' + item, function () { return visibleText(item, 900); },
        clickVerifiedNode, 3, 500, deadline);
}

function isChannelsPage() {
    const following = withNode(function () {
        return desc('关注').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (node) { return node.visible; });
    const recommended = withNode(function () {
        return desc('推荐').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (node) { return node.visible; });
    return following && recommended;
}

function clickCurrentChannelLike() {
    const clicked = retryFreshNode('channel_like', function () {
        return id('com.tencent.mm:id/ng5').pkg(WX_PACKAGE).getOneNodeInfo(500);
    }, function (node) {
        if (!node.visible || !node.clickable) return false;
        if ((node.desc || '').indexOf('取消喜欢') >= 0) return false;
        const bounds = node.bounds || {};
        const left = bounds.left !== undefined ? bounds.left : bounds.l;
        const top = bounds.top !== undefined ? bounds.top : bounds.t;
        const right = bounds.right !== undefined ? bounds.right : bounds.r;
        const bottom = bounds.bottom !== undefined ? bounds.bottom : bounds.b;
        const width = device.getScreenWidth(), height = device.getScreenHeight();
        if (left < width * 0.35 || right > width * 0.75 ||
            top < height * 0.75 || bottom > height * 0.98) return false;
        return clickNodeSafeArea(node);
    }, 2, 350, time() + 1800);
    if (!clicked) return false;
    return waitFor(function () {
        return withNode(function () {
            return id('com.tencent.mm:id/ng5').pkg(WX_PACKAGE).getOneNodeInfo(250);
        }, function (node) {
            return node.visible && (node.desc || '').indexOf('取消喜欢') >= 0;
        });
    }, 1800, 200);
}

function browseChannels(payload, shouldPreempt, taskDeadline) {
    const startedAt = time();
    if (!openDiscoverItem('视频号', taskDeadline)) return {success: false, error: '无法进入视频号'};
    sleep(1300);
    if (!isChannelsPage()) {
        clickKnownPageBack(detectWechatPage(), taskDeadline);
        return {success: false, error: '视频号页面校验失败'};
    }
    const duration = Math.max(5, Math.min(1800, intOrDefault(payload.duration_seconds, 60)));
    const maxSwipes = Math.max(0, Math.min(100, intOrDefault(payload.max_swipes, 30)));
    const dwellMin = Math.max(5, Math.min(120, intOrDefault(payload.dwell_min_seconds, 15)));
    const dwellMax = Math.max(dwellMin, Math.min(180, intOrDefault(payload.dwell_max_seconds, 30)));
    const likeBudget = payload.confirm_external === true ?
        Math.max(0, Math.min(10, intOrDefault(payload.interaction_budget, 0))) : 0;
    const likeProbability = Math.max(0, Math.min(100,
        intOrDefault(payload.like_probability_percent, 18)));
    const deadline = Math.min(time() + duration * 1000, (taskDeadline || time() + duration * 1000) - 2000);
    let swipes = 0;
    let likes = 0;
    let reason = 'duration_complete';
    while (time() < deadline && swipes < maxSwipes) {
        const waitUntil = Math.min(deadline, time() + random(dwellMin * 1000, dwellMax * 1000));
        while (time() < waitUntil) {
            if (hasSafetyBlocker()) { reason = 'account_attention_required'; break; }
            if (shouldPreempt && shouldPreempt()) { reason = 'scan_preempted'; break; }
            sleep(Math.min(1000, waitUntil - time()));
        }
        if (reason !== 'duration_complete') break;
        if (likes < likeBudget && random(1, 101) <= likeProbability) {
            if (shouldPreempt && shouldPreempt()) { reason = 'scan_preempted'; break; }
            if (isChannelsPage() && clickCurrentChannelLike()) {
                likes++;
                sleep(random(500, 900));
            }
        }
        if (time() >= deadline) break;
        if (!isChannelsPage()) { reason = 'page_changed'; break; }
        const width = device.getScreenWidth(), height = device.getScreenHeight();
        swipeToPoint(random(~~(width * 0.43), ~~(width * 0.57)), ~~(height * 0.78),
            random(~~(width * 0.43), ~~(width * 0.57)), ~~(height * 0.28), random(450, 800));
        swipes++; sleep(700);
        if (!isChannelsPage()) { reason = 'page_changed_after_swipe'; break; }
    }
    if (swipes >= maxSwipes && time() < deadline && reason === 'duration_complete') reason = 'swipe_limit';
    if (getRunningPkg() === WX_PACKAGE && detectWechatPage() === WX_PAGE.CHANNELS) {
        clickKnownPageBack(WX_PAGE.CHANNELS, taskDeadline);
    }
    const success = reason === 'duration_complete' || reason === 'swipe_limit';
    return {success: success, preempted: reason === 'scan_preempted',
        result: {swipes: swipes, likes: likes,
            elapsed_seconds: ~~((time() - startedAt) / 1000), end_reason: reason},
        error: success ? null : reason === 'scan_preempted' ? '扫码任务抢占' : '视频号浏览中断: ' + reason};
}

function momentEditorVisible() {
    return withNode(function () {
        return id('com.tencent.mm:id/n7y').pkg(WX_PACKAGE).getOneNodeInfo(300) ||
            clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(200);
    }, function (editor) { return editor.visible; });
}

function cancelMomentDraft() {
    retryFreshNode('clear_moment_draft', function () {
        return id('com.tencent.mm:id/n7y').pkg(WX_PACKAGE).getOneNodeInfo(400) ||
            clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (editor) { clickNodeSafeArea(editor); editor.clearText(); return true; }, 2, 300);
    for (let attempt = 0; attempt < 2 && momentEditorVisible(); attempt++) {
        back(); sleep(600);
        clickFirstVisible([text('不保留').pkg(WX_PACKAGE), text('放弃').pkg(WX_PACKAGE)], 300);
    }
    return !momentEditorVisible();
}

function browseMoments(payload, deadline, shouldPreempt) {
    if (!openDiscoverItem('朋友圈', deadline)) return {success: false, error: '无法进入朋友圈'};
    const requested = intOrDefault(payload.duration_seconds, 180);
    const duration = Math.max(30, Math.min(requested, 900));
    const endAt = Math.min(deadline || time() + duration * 1000, time() + duration * 1000);
    let swipes = 0;
    let reason = 'duration_complete';
    while (time() < endAt) {
        if (shouldPreempt && shouldPreempt()) { reason = 'scan_preempted'; break; }
        const waitMs = Math.min(random(3500, 11000), Math.max(0, endAt - time()));
        if (waitMs > 0) sleep(waitMs);
        if (time() >= endAt) break;
        swipeToPoint(device.getScreenWidth() * random(42, 59) / 100,
            device.getScreenHeight() * random(70, 83) / 100,
            device.getScreenWidth() * random(40, 61) / 100,
            device.getScreenHeight() * random(23, 39) / 100, random(650, 1250));
        swipes++;
        // 只做浏览和滚动，不点击赞、评论、头像、链接或发布入口。
        if (random(0, 5) === 0) sleep(random(1200, 4200));
    }
    return {success: reason === 'duration_complete', preempted: reason === 'scan_preempted',
        result: {duration_seconds: Math.round((duration * 1000 - Math.max(0, endAt - time())) / 1000),
            swipes: swipes, interaction_mode: 'read_only', end_reason: reason},
        error: reason === 'scan_preempted' ? '扫码任务抢占' : null};
}

function postMoment(payload, deadline, shouldPreempt) {
    if (!openDiscoverItem('朋友圈', deadline)) return {success: false, error: '无法进入朋友圈'};
    sleep(1000);
    if (!retryFreshNode('open_moment_editor', function () {
        return desc('拍照分享').pkg(WX_PACKAGE).getOneNodeInfo(900);
    }, function (camera) { return camera.longClick(); }, 3, 550, deadline)) {
        return {success: false, error: '无法打开纯文字朋友圈编辑器'};
    }
    if (!waitFor(momentEditorVisible, 3500, 250)) return {success: false, error: '朋友圈编辑器页面校验失败'};
    const prepared = retryFreshNode('prepare_moment_text', function () {
        return id('com.tencent.mm:id/n7y').pkg(WX_PACKAGE).getOneNodeInfo(700) ||
            clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(300);
    }, function (editor) {
        clickNodeSafeArea(editor);
        return typeTextCharacterByCharacter(editor, payload.content, deadline, shouldPreempt);
    }, 3, 500, deadline);
    if (!prepared && shouldPreempt && shouldPreempt()) {
        cancelMomentDraft();
        return {success: false, preempted: true, error: '扫码任务抢占'};
    }
    const contentReady = prepared && waitFor(function () {
        return withNode(function () {
            return id('com.tencent.mm:id/n7y').pkg(WX_PACKAGE).getOneNodeInfo(300) ||
                clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(200);
        }, function (editor) { return (editor.text || '') === payload.content; });
    }, 1800, 250);
    if (!contentReady) {
        cancelMomentDraft();
        return {success: false, error: '朋友圈正文输入校验失败'};
    }
    if (payload.confirm_external !== true) {
        const cleaned = cancelMomentDraft();
        return {success: cleaned, result: {draft_only: true, cleaned: cleaned},
            error: cleaned ? null : '草稿演练完成但清理失败'};
    }
    if (shouldPreempt && shouldPreempt()) {
        cancelMomentDraft();
        return {success: false, preempted: true, error: '扫码任务抢占'};
    }
    const posted = retryFreshNode('post_moment', function () { return visibleText('发表', 800); },
        clickVerifiedNode, 1, 500, deadline);
    const editorClosed = posted && waitFor(function () { return !momentEditorVisible(); }, 4000, 300);
    if (!posted) cancelMomentDraft();
    return {success: posted && editorClosed, result: {posted: posted, editor_closed: editorClosed},
        error: posted && editorClosed ? null : posted ? '发表后页面未退出，结果不确定' : '发表按钮点击失败'};
}

function closeVisibleMiniProgram(deadline) {
    let closeNode = null;
    let present = false;
    let clicked = false;
    try {
        closeNode = id('com.tencent.mm:id/gn').desc('关闭').pkg(WX_PACKAGE)
            .getOneNodeInfo(Math.min(700, Math.max(150, (deadline || time() + 700) - time())));
        if (!closeNode || !closeNode.visible) return {present: false, clicked: false};
        const bounds = closeNode.bounds || {};
        const left = boundsValue(bounds, 'left', 'l');
        const top = boundsValue(bounds, 'top', 't');
        const right = boundsValue(bounds, 'right', 'r');
        const bottom = boundsValue(bounds, 'bottom', 'b');
        present = left >= device.getScreenWidth() * 0.80 &&
            top >= 0 && right <= device.getScreenWidth() &&
            bottom <= device.getScreenHeight() * 0.15;
        if (!present) return {present: false, clicked: false};
        clicked = clickVerifiedNode(closeNode) === true;
    } catch (e) {
        logw('退出小程序节点操作失败: ' + e);
    } finally {
        releaseNode();
    }
    if (clicked) {
        waitFor(function () {
            return detectWechatPage() !== WX_PAGE.UNKNOWN;
        }, Math.min(6000, Math.max(800, (deadline || time() + 6000) - time())), 250);
    }
    return {present: present, clicked: clicked};
}

function restoreToWechatHome(options) {
    options = options || {};
    const startedAt = time();
    const deadline = Math.min(options.deadline || startedAt + 15000, startedAt + 15000);
    const trace = [];
    let callHungUp = false;
    let draftCleaned = false;
    let launcherFallback = false;
    let miniProgramDetected = false;
    let miniProgramClosed = false;
    try {
        // 通话必须最先终止，否则 LauncherUI 可能只缩小通话悬浮层。
        if (voiceCallPageState().voip_activity) {
            callHungUp = hangUpVoiceCall(true);
            trace.push(callHungUp ? 'call_hung_up' : 'call_hangup_failed');
            sleep(random(350, 700));
        }
        // 小程序必须使用右上角胶囊中的“关闭”退出，再回微信首页；不得把
        // 小程序未知页交给 LauncherUI 覆盖，更不能为此重启或退出微信。
        const miniProgram = closeVisibleMiniProgram(deadline);
        miniProgramDetected = miniProgram.present === true;
        miniProgramClosed = miniProgram.clicked === true;
        if (miniProgramDetected) {
            trace.push(miniProgramClosed ? 'mini_program_closed' : 'mini_program_close_failed');
        }
        let page = detectWechatPage();
        if (page === WX_PAGE.UNKNOWN && getRunningPkg() === WX_PACKAGE) {
            // 通话或视频号退出动画会短暂没有稳定节点，先等待页面落定再决定是否启用Launcher兜底。
            waitFor(function () {
                page = detectWechatPage();
                return page !== WX_PAGE.UNKNOWN;
            }, Math.min(8000, Math.max(1000, deadline - time())), 250);
        }
        if (page === WX_PAGE.MOMENT_EDITOR) {
            draftCleaned = cancelMomentDraft();
            trace.push(draftCleaned ? 'moment_draft_cleaned' : 'moment_draft_cleanup_failed');
            page = detectWechatPage();
        }
        // 从已知页面逐层返回；每次都重新识别，禁止未知页面盲目 back。
        for (let depth = 0; depth < 6 && time() < deadline; depth++) {
            page = detectWechatPage();
            if (page === WX_PAGE.MAIN) break;
            if ([WX_PAGE.CHAT_TEXT, WX_PAGE.CHAT_VOICE, WX_PAGE.CHAT_EMOJI,
                 WX_PAGE.SEARCH, WX_PAGE.MOMENTS, WX_PAGE.CHANNELS].indexOf(page) < 0) break;
            const left = clickKnownPageBack(page, deadline);
            trace.push('back_' + page + '_' + left);
            if (!left) break;
            sleep(random(250, 600));
        }
        if (detectWechatPage() !== WX_PAGE.MAIN && !miniProgramDetected) {
            launcherFallback = true;
            const requested = utils.openActivity({pkg: WX_PACKAGE,
                className: 'com.tencent.mm.ui.LauncherUI'});
            trace.push('launcher_' + requested);
            waitFor(function () {
                const state = detectWechatPage();
                return state === WX_PAGE.MAIN || state === WX_PAGE.BLOCKED;
            }, Math.max(1000, deadline - time()), 300);
        }
        const homeReady = detectWechatPage() === WX_PAGE.MAIN && mainTab('微信', deadline) &&
            detectWechatPage() === WX_PAGE.MAIN && isMainTabActive('微信');
        trace.push(homeReady ? 'wechat_home_ready' : 'wechat_home_failed');
        runtime.currentChatContact = null;
        runtime.chatVerifiedAt = 0;
        return {success: homeReady, call_hung_up: callHungUp,
            draft_cleaned: draftCleaned, launcher_fallback: launcherFallback,
            mini_program_detected: miniProgramDetected, mini_program_closed: miniProgramClosed,
            elapsed_ms: time() - startedAt, trace: trace};
    } catch (e) {
        runtime.currentChatContact = null;
        runtime.chatVerifiedAt = 0;
        return {success: false, error: '' + e, call_hung_up: callHungUp,
            draft_cleaned: draftCleaned, launcher_fallback: launcherFallback,
            mini_program_detected: miniProgramDetected, mini_program_closed: miniProgramClosed,
            elapsed_ms: time() - startedAt, trace: trace};
    } finally {
        try { releaseNode(); } catch (ignoreRelease) {}
    }
}

function execute(task, shouldPreempt) {
    if (!task || hasSafetyBlocker()) return {success: false, error: '账号需要人工处理'};
    const actionDeadline = task.hard_deadline || task.deadline;
    if (actionDeadline && time() >= actionDeadline - 2000) return {success: false, error: '任务执行时间已耗尽'};
    if (shouldPreempt && shouldPreempt()) return {success: false, preempted: true, error: '扫码任务抢占'};
    if (task.action_type === 'chat_text') return sendText(task.payload || {}, actionDeadline, shouldPreempt);
    if (task.action_type === 'chat_inspect') return inspectChat(task.payload || {}, actionDeadline);
    if (task.action_type === 'chat_emoji') return sendEmoji(task.payload || {}, actionDeadline, shouldPreempt);
    if (task.action_type === 'chat_voice') return sendVoice(task.payload || {}, actionDeadline, shouldPreempt);
    if (task.action_type === 'voice_call') return makeVoiceCall(task.payload || {}, shouldPreempt, actionDeadline);
    if (task.action_type === 'video_call') return makeVideoCall(task.payload || {}, shouldPreempt, actionDeadline);
    if (task.action_type === 'call_dial') {
        return makeOutgoingCall(task.payload || {}, shouldPreempt, actionDeadline,
            (task.payload || {}).call_type === 'video' ? 'video' : 'voice');
    }
    if (task.action_type === 'call_answer') return answerIncomingCall(task.payload || {}, shouldPreempt, actionDeadline);
    if (task.action_type === 'call_hangup') return hangupCurrentCall();
    if (task.action_type === 'channels_browse') return browseChannels(task.payload || {}, shouldPreempt, actionDeadline);
    if (task.action_type === 'moment_browse') return browseMoments(task.payload || {}, actionDeadline, shouldPreempt);
    if (task.action_type === 'moment_text') return postMoment(task.payload || {}, actionDeadline, shouldPreempt);
    if (task.action_type === 'device_sleep') {
        home();
        return {success: true, result: {runtime_mode: 'sleep'}};
    }
    if (task.action_type === 'device_wake') {
        utils.openApp(WX_PACKAGE);
        sleep(1000);
        return {success: getRunningPkg() === WX_PACKAGE,
            result: {runtime_mode: 'idle'}, error: getRunningPkg() === WX_PACKAGE ? null : '微信唤醒失败'};
    }
    return {success: false, error: '不支持的动作类型: ' + task.action_type};
}

// src/js 下的文件由 EasyClick 一起编译，main.js 可直接访问这个全局对象。
// 不要在 src/js 内使用 require/module.exports，否则 DEX 运行时会把它当作
// CommonJS 资源查找并报 Module not found。
var wechatActionExecutor = {
    execute: execute,
    clickVerifiedNode: clickVerifiedNode,
    restoreToWechatHome: restoreToWechatHome
};
