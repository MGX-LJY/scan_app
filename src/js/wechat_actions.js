/** 微信动作执行器：只在已验证的微信节点范围内点击，并支持扫码抢占。 */
const WX_PACKAGE = 'com.tencent.mm';
const WX_PAGE = {
    MAIN: 'main', SEARCH: 'search', CHAT_TEXT: 'chat_text', CHAT_VOICE: 'chat_voice',
    CHAT_EMOJI: 'chat_emoji', MOMENTS: 'moments', MOMENT_EDITOR: 'moment_editor',
    CHANNELS: 'channels', BLOCKED: 'blocked', OTHER: 'other', UNKNOWN: 'unknown'
};
const runtime = {
    currentChatContact: null,
    currentConversationId: null,
    chatVerifiedAt: 0,
    lastTextInputFailure: null,
    lastContactFailure: null,
    lastCallHangupMethod: null
};

function wechatXmlSnapshot() {
    try {
        return dumpXml() || '';
    } catch (snapshotError) {
        logw('微信页面快照失败: ' + snapshotError);
        return '';
    }
}

function runningWechatActivity() {
    try {
        return String(getRunningActivity() || '');
    } catch (activityError) {
        return '';
    }
}

/**
 * MIUI 的无障碍环境偶尔会让 getRunningPkg() 返回 null，即使微信的
 * FinderHomeAffinityUI/LauncherUI 正在前台。非空的其他包名仍然立即拒绝；
 * 只有包名不可用时，才用当前 Activity 和同一时刻的节点快照交叉确认。
 */
function isWechatForeground(xmlSnapshot) {
    let pkg = null;
    try { pkg = getRunningPkg(); } catch (pkgError) {}
    if (pkg === WX_PACKAGE) return true;
    if (pkg !== null && pkg !== undefined && String(pkg).length > 0) return false;
    const activity = runningWechatActivity();
    if (activity.indexOf(WX_PACKAGE) >= 0) return true;
    // 某些 ROM 只返回相对类名（如 .plugin.finder...）或短类名，
    // 这种结果不足以否定微信，继续以当前 XML 包名确认。
    if (activity && activity.charAt(0) !== '.' && activity.indexOf('.') >= 0) return false;
    const xml = xmlSnapshot === undefined ? wechatXmlSnapshot() : (xmlSnapshot || '');
    return xml.indexOf('pkg="' + WX_PACKAGE + '"') >= 0;
}

function countXmlOccurrences(xml, token) {
    if (!xml || !token) return 0;
    let count = 0, offset = 0;
    while ((offset = xml.indexOf(token, offset)) >= 0) {
        count++;
        offset += token.length;
    }
    return count;
}

function voiceMessageEvidence(beforeXml, afterXml, durationSeconds) {
    const duration = String(durationSeconds || '');
    const voiceBubble = 'id="com.tencent.mm:id/brp"';
    const encodedDuration = 'text="' + duration + '&quot;"';
    return countXmlOccurrences(afterXml, voiceBubble) > countXmlOccurrences(beforeXml, voiceBubble) ||
        countXmlOccurrences(afterXml, encodedDuration) > countXmlOccurrences(beforeXml, encodedDuration);
}

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
// 搜索框输入首字符后会重建结果页和 EditText，因此每个字符都重新获取节点，
// 并从新节点核验完整前缀，禁止继续使用首轮已经失效的 NodeInfo。
function typeTextCharacterByCharacter(editorFactory, value, deadline, shouldPreempt) {
    const content = String(value || '');
    if (typeof editorFactory !== 'function' || !content) return false;
    runtime.lastTextInputFailure = null;
    let editor = null;
    let cleared = false;
    try {
        editor = editorFactory();
        if (editor && editor.visible) {
            clickNodeSafeArea(editor);
            editor.clearText();
            cleared = true;
        }
    } catch (clearError) {
        runtime.lastTextInputFailure = {stage: 'clear', error: String(clearError)};
    } finally {
        releaseNode();
    }
    if (!cleared) {
        if (!runtime.lastTextInputFailure) runtime.lastTextInputFailure = {stage: 'clear'};
        return false;
    }
    let offset = 0;
    // DEX/Rhino 在部分真机会复用 while 块内声明的首轮词法变量；统一在循环外声明。
    let next = 0;
    let code = 0;
    let prefix = '';
    let typed = '';
    let applied = false;
    let verified = false;
    let inputAttempt = 0;
    let attemptsUsed = 0;
    let appliedAny = false;
    let observedText = '';
    let lastInputError = '';
    while (offset < content.length) {
        if ((deadline && time() + 1500 >= deadline) ||
            (shouldPreempt && shouldPreempt())) {
            runtime.lastTextInputFailure = {stage: 'interrupted', prefix_length: offset,
                expected_length: content.length};
            return false;
        }
        next = offset + 1;
        code = content.charCodeAt(offset);
        // 不把 emoji 等 UTF-16 代理对拆成两个无效字符。
        if (code >= 0xD800 && code <= 0xDBFF && next < content.length) next++;
        prefix = content.substring(0, next);
        verified = false;
        attemptsUsed = 0;
        appliedAny = false;
        observedText = '';
        lastInputError = '';
        // 微信输入框偶尔在键盘/候选栏刷新时短暂丢失节点或延迟回显。
        // 同一个前缀最多重试3次；每次都重新抓节点，绝不持有旧 NodeInfo。
        for (inputAttempt = 1; inputAttempt <= 3 && !verified; inputAttempt++) {
            attemptsUsed = inputAttempt;
            if ((deadline && time() + 900 >= deadline) ||
                (shouldPreempt && shouldPreempt())) {
                runtime.lastTextInputFailure = {stage: 'interrupted', prefix_length: offset,
                    expected_length: content.length, expected_prefix: prefix,
                    attempts: attemptsUsed};
                return false;
            }
            applied = false;
            try {
                editor = editorFactory();
                if (editor && editor.visible) {
                    observedText = String(editor.text || '');
                    if (observedText === prefix) verified = true;
                    else applied = !!editor.inputText(prefix);
                }
            } catch (inputError) {
                lastInputError = String(inputError);
            } finally {
                releaseNode();
            }
            if (verified) break;
            if (applied) appliedAny = true;
            // inputText 的布尔值在节点刷新边界并不总可靠，以重新获取节点后的文本为准。
            verified = waitFor(function () {
                return withNode(editorFactory, function (freshEditor) {
                    observedText = freshEditor && freshEditor.visible ?
                        String(freshEditor.text || '') : '';
                    return freshEditor.visible && observedText === prefix;
                });
            }, applied ? 1050 + inputAttempt * 180 : 1450 + inputAttempt * 220, 120);
            if (!verified && inputAttempt < 3) humanPause(140, 420);
        }
        if (!verified) {
            runtime.lastTextInputFailure = {stage: 'verify_prefix', prefix_length: next,
                expected_length: content.length, attempts: attemptsUsed,
                input_returned: appliedAny, expected_prefix: prefix,
                observed_text: observedText, observed_length: observedText.length,
                last_input_error: lastInputError || null};
            return false;
        }
        typed = content.substring(offset, next);
        if (/[,，。！？!?；;…\n]/.test(typed)) humanPause(260, 720);
        else humanPause(75, 260);
        if (random(0, 14) === 0) humanPause(280, 850);
        offset = next;
    }
    return true;
}

function failContactNavigation(stage, contact) {
    runtime.lastContactFailure = {stage: stage, contact: String(contact || ''),
        page: detectWechatPage(), text_input: runtime.lastTextInputFailure};
    logw('联系人导航失败 stage=' + stage + ' contact=' + contact +
        ' detail=' + JSON.stringify(runtime.lastContactFailure));
    return false;
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
        if ((deadline && time() >= deadline) || !isWechatForeground() || hasSafetyBlocker()) {
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
    const xml = wechatXmlSnapshot();
    if (!isWechatForeground(xml)) return WX_PAGE.OTHER;
    function attr(name, value) { return xml.indexOf(name + '="' + value + '"') >= 0; }
    const blockers = ['登录', '手机号登录', '微信安全中心', '安全验证', '请输入验证码'];
    for (let blockerIndex = 0; blockerIndex < blockers.length; blockerIndex++) {
        if (attr('text', blockers[blockerIndex])) return WX_PAGE.BLOCKED;
    }
    if (attr('id', 'com.tencent.mm:id/d98')) return WX_PAGE.SEARCH;
    if (attr('text', '退出此次编辑？') || attr('text', '退出此次编辑?')) return WX_PAGE.MOMENT_EDITOR;
    if (attr('text', '保留此次编辑？') || attr('text', '保留此次编辑?')) return WX_PAGE.MOMENT_EDITOR;
    if (attr('id', 'com.tencent.mm:id/n7y')) return WX_PAGE.MOMENT_EDITOR;
    if (attr('desc', '拍照分享') && attr('id', 'com.tencent.mm:id/actionbar_up_indicator')) return WX_PAGE.MOMENTS;
    if (channelsPageEvidence(xml).matched) return WX_PAGE.CHANNELS;
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

function openContact(contact, deadline, conversationId) {
    if (!contact) return false;
    const sameConversation = !!conversationId &&
        runtime.currentConversationId === String(conversationId);
    const validForMs = sameConversation ? 2 * 60 * 60 * 1000 : 120000;
    if (runtime.currentChatContact === contact &&
            time() - runtime.chatVerifiedAt < validForMs && isChatPage()) {
        runtime.chatVerifiedAt = time();
        return true;
    }
    runtime.currentChatContact = null;
    runtime.currentConversationId = null;
    runtime.lastContactFailure = null;
    runtime.lastTextInputFailure = null;
    if (!mainTab('微信', deadline)) return failContactNavigation('main_tab', contact);
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
    if (!searchReady) return failContactNavigation('search_open', contact);
    const searchEditorFactory = function () {
        return id('com.tencent.mm:id/d98').pkg(WX_PACKAGE).getOneNodeInfo(700);
    };
    if (!typeTextCharacterByCharacter(searchEditorFactory, contact, deadline, null)) {
        return failContactNavigation('search_input', contact);
    }
    const queryVerified = waitFor(function () {
        return withNode(function () {
            return id('com.tencent.mm:id/d98').pkg(WX_PACKAGE).getOneNodeInfo(300);
        }, function (input) { return (input.text || '').indexOf(contact) >= 0; });
    }, 1800, 250);
    if (!queryVerified) return failContactNavigation('search_query_verify', contact);
    sleep(random(900, 1900));
    if (!retryFreshNode('open_contact_result', function () {
        const nodes = id('com.tencent.mm:id/odf').pkg(WX_PACKAGE).getNodeInfo(700);
        if (!nodes) return null;
        for (let i = 0; i < nodes.length; i++) if (nodes[i].visible && nodes[i].text === contact) return nodes[i];
        return null;
    }, clickVerifiedNode, 3, 650, deadline)) return failContactNavigation('search_result', contact);
    const opened = waitFor(function () {
        if (isChatPage()) return true;
        // 搜索结果偶尔先进入资料页，明确点击“发消息”后再校验聊天输入框。
        retryFreshNode('profile_send_message', function () { return visibleText('发消息', 150); },
            clickVerifiedNode, 1, 200, deadline);
        return false;
    }, 5000, 300);
    if (opened) {
        runtime.currentChatContact = contact;
        runtime.currentConversationId = conversationId ? String(conversationId) : null;
        runtime.chatVerifiedAt = time();
        runtime.lastContactFailure = null;
    }
    return opened || failContactNavigation('chat_open_verify', contact);
}

function inspectChat(payload, deadline) {
    if (!openContact(payload.contact, deadline, payload.conversation_id) || !isChatPage()) {
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

function waitForChatInputDraft(timeoutMs) {
    let value = '';
    waitFor(function () {
        value = withNode(function () {
            return id('com.tencent.mm:id/bkk').clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(300);
        }, function (input) { return String(input.text || ''); }) || '';
        return !!value;
    }, timeoutMs || 2500, 250);
    return value;
}

function maxChatMessageRow(xml) {
    const source = xml || '';
    const pattern = /id="com\.tencent\.mm:id\/bn1"[^>]*\brow="(\d+)"/g;
    let match = null;
    let maximum = -1;
    while ((match = pattern.exec(source)) !== null) {
        const value = parseInt(match[1], 10);
        if (!isNaN(value) && value > maximum) maximum = value;
    }
    return maximum;
}

function verifySentEmoji(beforeXml, normalizedDescription, timeoutMs) {
    const expectedDesc = 'desc="[' + normalizedDescription + ']"';
    const beforeRows = maxChatMessageRow(beforeXml);
    const beforeEmojiNodes = countXmlOccurrences(beforeXml, expectedDesc);
    return waitFor(function () {
        const afterXml = wechatXmlSnapshot();
        return maxChatMessageRow(afterXml) > beforeRows ||
            countXmlOccurrences(afterXml, expectedDesc) > beforeEmojiNodes;
    }, timeoutMs || 3500, 300);
}

function clearChatDraft() {
    return retryFreshNode('clear_chat_draft', function () {
        return id('com.tencent.mm:id/bkk').clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(400);
    }, function (input) { clickNodeSafeArea(input); input.clearText(); return true; }, 2, 300);
}

function sendText(payload, deadline, shouldPreempt) {
    if (!payload.confirm_external) return {success: false, error: '未授权发送'};
    if (!openContact(payload.contact, deadline, payload.conversation_id)) return {success: false,
        result: {contact_failure: runtime.lastContactFailure}, error: '无法打开联系人'};
    if (!switchToKeyboardMode(deadline)) return {success: false,
        result: {input_failure: {stage: 'keyboard_mode'}}, error: '无法切换到文字输入'};
    const chatEditorFactory = function () {
        return id('com.tencent.mm:id/bkk').clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(800);
    };
    const prepared = typeTextCharacterByCharacter(chatEditorFactory, payload.content,
        deadline, shouldPreempt);
    if (!prepared) {
        const inputFailure = runtime.lastTextInputFailure;
        clearChatDraft();
        if (shouldPreempt && shouldPreempt()) {
            return {success: false, preempted: true, error: '扫码任务抢占'};
        }
        return {success: false, result: {input_failure: inputFailure},
            error: '消息逐字输入失败'};
    }
    let finalObservedText = '';
    const contentReady = waitFor(function () {
        return withNode(function () {
            return id('com.tencent.mm:id/bkk').clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(300);
        }, function (input) {
            finalObservedText = String(input.text || '');
            return finalObservedText === payload.content;
        });
    }, 1800, 250);
    if (!contentReady) {
        clearChatDraft();
        return {success: false, result: {input_failure: {stage: 'final_verify',
            expected_length: String(payload.content || '').length,
            observed_length: finalObservedText.length,
            expected_text: String(payload.content || ''), observed_text: finalObservedText}},
            error: '消息输入内容校验失败'};
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
    return payload.confirm_external === true &&
        openContact(payload.contact, deadline, payload.conversation_id);
}

function sendEmoji(payload, deadline, shouldPreempt) {
    if (!openChatForMedia(payload, deadline) || !switchToKeyboardMode(deadline)) {
        return {success: false, error: '未授权发送或无法打开联系人'};
    }
    // 必须在打开表情面板前记录聊天消息基线。面板本身也包含 desc="[微笑]"
    // 一类节点；若在面板打开后取基线，发送后面板节点消失、消息气泡出现，
    // 数量可能不变，进而把已经发送成功的表情误判为失败。
    const beforeXml = wechatXmlSnapshot();
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
    const normalizedDescription = String(payload.description || '').replace(/^\[|\]$/g, '');
    if (!normalizedDescription) return {success: false, error: '表情描述不能为空'};
    const selected = retryFreshNode('select_emoji', function () {
        return desc('[' + normalizedDescription + ']').pkg(WX_PACKAGE).getOneNodeInfo(500) ||
            desc(normalizedDescription).pkg(WX_PACKAGE).getOneNodeInfo(300);
    }, clickVerifiedNode, 1, 500, deadline);
    const draftValue = selected ? waitForChatInputDraft(2500) : '';
    const draftReady = !!draftValue;
    if (!draftReady) {
        clearChatDraft();
        return {success: false, result: {description: normalizedDescription, selected: selected,
            draft_ready: draftReady, draft_value: draftValue}, error: '表情选择后草稿校验失败'};
    }
    if (shouldPreempt && shouldPreempt()) {
        clearChatDraft();
        return {success: false, preempted: true, error: '扫码任务抢占'};
    }
    sleep(random(550, 1500));
    const sent = retryFreshNode('send_emoji', function () { return visibleText('发送', 650); },
        clickVerifiedNode, 2, 400, deadline);
    const inputEmpty = sent && verifyChatInputEmpty(2500);
    const messageVerified = inputEmpty && verifySentEmoji(beforeXml, normalizedDescription, 3500);
    if (!inputEmpty) clearChatDraft();
    return {success: selected && draftReady && sent && inputEmpty && messageVerified,
        result: {description: normalizedDescription, selected: selected, draft_ready: draftReady,
            draft_value: draftValue,
            sent: sent, input_empty: inputEmpty, message_verified: messageVerified},
        error: selected && draftReady && sent && inputEmpty && messageVerified ? null : '表情发送后聊天记录校验失败'};
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
    const beforeXml = wechatXmlSnapshot();
    const beforeMessages = countXmlOccurrences(beforeXml, 'id="com.tencent.mm:id/bk1"');
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
            const recordingDeadline = time() + duration * 1000;
            while (time() < recordingDeadline) {
                sleep(Math.min(300, recordingDeadline - time()));
                if (shouldPreempt && shouldPreempt()) {
                    recordingPreempted = true;
                    releaseY = Math.max(80, top - Math.max(120, ~~(device.getScreenHeight() * 0.18)));
                    touchMove(x, releaseY);
                    sleep(200);
                    break;
                }
            }
            return !recordingPreempted;
        } finally {
            try { touchUp(x, releaseY); } catch (ignoreTouchUp) {}
        }
    }, 1, 500, deadline);
    sleep(1000);
    const afterXml = wechatXmlSnapshot();
    const afterMessages = countXmlOccurrences(afterXml, 'id="com.tencent.mm:id/bk1"');
    const verified = sent && (afterMessages > beforeMessages ||
        voiceMessageEvidence(beforeXml, afterXml, duration));
    const remainedInChat = isWechatForeground() && (isChatPage() || withNode(function () {
        return desc('切换到键盘').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (node) { return node.visible; }));
    return {success: sent && verified && remainedInChat, preempted: recordingPreempted,
        result: {duration_seconds: duration, chat_verified: remainedInChat, cancelled: recordingPreempted,
            message_verified: verified},
        error: recordingPreempted ? '扫码任务抢占，已取消录音' :
            sent && verified && remainedInChat ? null : '语音消息未在聊天记录中验证成功'};
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
    runtime.lastCallHangupMethod = null;
    const nodeClicked = clickCallControl('挂断') || clickCallControl('取消');
    if (nodeClicked) {
        runtime.lastCallHangupMethod = 'accessibility_control';
        return true;
    }
    // 部分微信版本 VoIP 控件不进入节点树；仅在已验证 VoIP Activity 后，
    // 在底部中央限定区域寻找红色挂断圆，禁止在普通页面使用坐标回退。
    let state = voiceCallPageState();
    if (!state.live_call) {
        // 微信在挂断后的短时间内仍可能返回 VideoActivity。仅有残留 Activity
        // 不能证明通话仍存在，否则屏幕中心的“唤醒控件”点击会落到聊天列表。
        if (!state.voip_activity || knownCallActive !== true) return false;
        waitFor(function () {
            state = voiceCallPageState();
            return state.live_call || !state.voip_activity;
        }, 1400, 200);
        if (!state.live_call) {
            runtime.lastCallHangupMethod = 'already_ended_activity_stale';
            return false;
        }
    }
    humanizedPointClick(~~(device.getScreenWidth() * 0.5), ~~(device.getScreenHeight() * 0.48), 8);
    sleep(500);
    if (clickCallControl('挂断') || clickCallControl('取消')) {
        runtime.lastCallHangupMethod = 'revealed_accessibility_control';
        return true;
    }
    const width = device.getScreenWidth(), height = device.getScreenHeight();
    const red = findCallColor('#e84b4f', ~~(width * 0.34), ~~(height * 0.74),
        ~~(width * 0.66), ~~(height * 0.96), 0.70);
    const visualClicked = !!(red && humanizedPointClick(red.x, red.y, 5));
    if (visualClicked) runtime.lastCallHangupMethod = 'verified_red_control';
    return visualClicked;
}

function callDurationEvidence(xml) {
    const snapshot = xml || '';
    const descMarker = 'desc="通话时长';
    const descIndex = snapshot.indexOf(descMarker);
    if (descIndex >= 0) {
        const descEnd = snapshot.indexOf('"', descIndex + descMarker.length);
        return {source: 'duration_desc', value: descEnd > descIndex ?
            snapshot.substring(descIndex + 6, descEnd) : '通话时长'};
    }
    // 当前 Redmi K20 Pro 的通话界面视觉计时为 00:03；部分微信版本
    // 只把它暴露为 text 而不是“通话时长”desc。XML来自微信根节点，
    // 再与 VideoActivity 交叉验证，避免把系统状态栏时间当作通话计时。
    const timerMatch = snapshot.match(/(?:text|desc)="((?:[0-9]{1,2}:)?[0-5][0-9]:[0-5][0-9])"/);
    return timerMatch ? {source: 'duration_text', value: timerMatch[1]} : null;
}

let callSystemEvidenceCacheAt = 0;
let callSystemEvidenceCache = null;

function callSystemConnectedEvidence() {
    const now = time();
    if (now - callSystemEvidenceCacheAt < 750) return callSystemEvidenceCache;
    callSystemEvidenceCacheAt = now;
    callSystemEvidenceCache = null;
    try {
        const notifications = shell.execCommand('dumpsys notification --noredact') || '';
        if (notifications.indexOf('tickerText=语音通话中') >= 0 ||
            notifications.indexOf('android.text=String (语音通话中)') >= 0) {
            callSystemEvidenceCache = 'wechat_call_notification';
            return callSystemEvidenceCache;
        }
    } catch (ignoreNotificationEvidence) {}
    try {
        const audio = shell.execCommand('dumpsys audio') || '';
        const activePlayback = audio.indexOf(
            'state:started attr:AudioAttributes: usage=USAGE_VOICE_COMMUNICATION') >= 0;
        const activeRecording = /active\? true[\s\S]{0,500}source client=VOICE_COMMUNICATION[\s\S]{0,350}pack:com\.tencent\.mm/.test(audio);
        if (activePlayback && activeRecording) {
            callSystemEvidenceCache = 'wechat_voice_audio_session';
            return callSystemEvidenceCache;
        }
    } catch (ignoreAudioEvidence) {}
    return null;
}

function currentWechatVoipActivity() {
    let activity = '';
    try { activity = runningWechatActivity() || ''; } catch (ignoreActivity) {}
    if (activity) return activity.indexOf('plugin.voip.ui.VideoActivity') >= 0;
    try {
        const activities = shell.execCommand('dumpsys activity activities') || '';
        return /mResumedActivity:[^\r\n]*com\.tencent\.mm\/(?:\.plugin)?\.voip\.ui\.VideoActivity/.test(activities) ||
            /ResumedActivity:[^\r\n]*com\.tencent\.mm\/(?:\.plugin)?\.voip\.ui\.VideoActivity/.test(activities);
    } catch (ignoreShellActivity) {
        return false;
    }
}

function voiceCallPageState() {
    const xml = wechatXmlSnapshot();
    const voipActivity = currentWechatVoipActivity();
    function attr(name, value) { return xml.indexOf(name + '="' + value + '"') >= 0; }
    function attrPrefix(name, value) { return xml.indexOf(name + '="' + value) >= 0; }
    const states = [
        '正在等待对方接受邀请', '等待对方接受邀请', '通话中',
        '对方无应答', '对方已拒绝', '对方忙线', '通话结束'
    ];
    let stateText = null;
    for (let stateIndex = 0; stateIndex < states.length; stateIndex++) {
        if (attr('text', states[stateIndex]) || attr('desc', states[stateIndex])) {
            stateText = states[stateIndex];
            break;
        }
    }
    const waitingVisible = attrPrefix('desc', '等待对方接受邀请') ||
        attrPrefix('text', '等待对方接受邀请') || stateText === '正在等待对方接受邀请';
    const duration = callDurationEvidence(xml);
    const hangupVisible = attr('desc', '挂断') || attr('text', '挂断');
    const cancelVisible = attr('desc', '取消') || attr('text', '取消');
    const systemEvidence = stateText === '通话中' || duration ? null :
        callSystemConnectedEvidence();
    const connectedEvidence = stateText === '通话中' ? 'connected_text' :
        (duration ? duration.source : systemEvidence);
    const connected = connectedEvidence !== null;
    const terminal = stateText === '通话结束' || stateText === '对方无应答' ||
        stateText === '对方已拒绝' || stateText === '对方忙线';
    const liveCall = !terminal && (connected || waitingVisible || hangupVisible ||
        (voipActivity && (cancelVisible || stateText !== null)));
    return {text: stateText || (waitingVisible ? '等待对方接受邀请' : null),
        hangup: hangupVisible || cancelVisible, voip_activity: voipActivity,
        live_call: liveCall, waiting: waitingVisible, duration: duration,
        system_evidence: systemEvidence,
        connected_evidence: connectedEvidence, connected: connected};
}

function waitForCallExit(timeoutMs) {
    const deadline = time() + Math.max(1000, timeoutMs || 6000);
    let clearPolls = 0;
    let lastState = null;
    while (time() < deadline) {
        lastState = voiceCallPageState();
        if (!lastState.live_call) clearPolls++; else clearPolls = 0;
        if (clearPolls >= 3) {
            return {ended: true, evidence: lastState.voip_activity ?
                'activity_stale_without_call_evidence' : 'voip_activity_gone'};
        }
        sleep(250);
    }
    return {ended: false, evidence: lastState && lastState.connected_evidence ||
        lastState && lastState.text || 'call_exit_timeout'};
}

function syncCallTaskHeartbeat(task, callState) {
    if (!task || !task.task_id || !task.dispatch_token) {
        return {success: false, peer: null, error: 'call_task_identity_missing'};
    }
    try {
        const heartbeatUrl = config.baseUrl + '/api/wechat/v1/tasks/' +
            task.task_id + '/heartbeat';
        const response = http.postJSON(heartbeatUrl, JSON.stringify({
            task_id: task.task_id,
            phone_id: config.deviceId,
            device_id: config.deviceId,
            dispatch_token: task.dispatch_token,
            call_state: callState || null
        }), 5000, null);
        const body = JSON.parse(response);
        if (!body.success) {
            return {success: false, peer: null,
                error: body.message || 'call_heartbeat_rejected'};
        }
        config.actionCallPeer = body.call_peer || null;
        if (body.task) {
            task.deadline = body.task.soft_deadline;
            task.hard_deadline = body.task.hard_deadline;
        }
        if (body.preempt === true) {
            config.actionPreemptRequested = true;
            config.actionPreemptReason = body.preempt_reason ||
                body.task && body.task.preempt_reason || 'task_preempted';
        }
        return {success: true, peer: body.call_peer || null, error: null};
    } catch (error) {
        logw('通话状态同步失败: ' + error);
        return {success: false, peer: null, error: '' + error};
    }
}

function pairedCallConnectedEvidence(payload, directPeer) {
    const peer = directPeer || config.actionCallPeer;
    const expectedSession = String(payload.call_session_id || '');
    if (!peer || peer.connected !== true || !expectedSession ||
            String(peer.call_session_id || '') !== expectedSession) return null;
    return {source: 'paired_receiver_heartbeat:' +
        String(peer.evidence || 'connected'), peer_task_id: peer.task_id || null};
}

function pairedCallTerminalEvidence(payload, directPeer) {
    const peer = directPeer || config.actionCallPeer;
    const expectedSession = String(payload.call_session_id || '');
    if (!peer || !expectedSession ||
            String(peer.call_session_id || '') !== expectedSession) return null;
    const status = String(peer.status || '');
    if (['preempted', 'cancelled', 'failed', 'expired'].indexOf(status) < 0) return null;
    return {status: status, peer_task_id: peer.task_id || null};
}

function makeOutgoingCall(payload, shouldPreempt, taskDeadline, callType, task) {
    const isVideo = callType === 'video';
    const callLabel = isVideo ? '视频通话' : '语音通话';
    if (payload.confirm_external !== true) return {success: false, error: callLabel + '未明确授权'};
    if (!openContact(payload.contact, taskDeadline)) return {success: false,
        result: {contact_navigation: runtime.lastContactFailure}, error: '无法打开联系人'};
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
    const ringDeadline = startedAt + Math.max(10, Math.min(120,
        intOrDefault(payload.ring_timeout_seconds, 45))) * 1000;
    // 网络短暂抖动时不能在45秒边界直接把已经接通的通话判成未接听。
    // 仅在最后一次同步查询也失败时，最多追加8秒证据确认窗口。
    const ringEvidenceDeadline = Math.min(ringDeadline + 8000,
        (taskDeadline || ringDeadline + 8000) - 2500);
    const durationSeconds = Math.max(5, Math.min(3600,
        intOrDefault(payload.duration_seconds !== undefined ?
            payload.duration_seconds : payload.max_duration_seconds, 60)));
    const hardStopDeadline = (taskDeadline ||
        startedAt + (durationSeconds + 180) * 1000) - 2500;
    let answered = false;
    let endReason = 'remote_ended';
    let verified = false;
    let connectedAt = 0;
    let connectedDeadline = 0;
    let connectedEvidence = null;
    let disconnectedPolls = 0;
    let audioState = {microphone_off: false, speaker_off: false};
    let audioConfigured = false;
    let nextPeerProbeAt = startedAt;
    let peerProbe = null;
    let lastPeerProbeAt = 0;
    let peerConnected = null;
    let ringBoundaryChecked = false;
    while (time() < hardStopDeadline) {
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
        if (!answered && time() >= nextPeerProbeAt) {
            peerProbe = syncCallTaskHeartbeat(task, null);
            lastPeerProbeAt = time();
            nextPeerProbeAt = time() + 2500;
        }
        peerConnected = pairedCallConnectedEvidence(payload,
            peerProbe && peerProbe.success ? peerProbe.peer : null);
        const peerTerminal = pairedCallTerminalEvidence(payload,
            peerProbe && peerProbe.success ? peerProbe.peer : null);
        if (!answered && peerTerminal) {
            endReason = (peerTerminal.status === 'preempted' ||
                peerTerminal.status === 'cancelled') ?
                'peer_task_preempted' : 'peer_task_failed';
            break;
        }
        if (!answered && (callState.connected || peerConnected)) {
            answered = true;
            // 同一call_session_id下被叫端的接通证明也证明拨号动作真实发生。
            verified = true;
            connectedAt = time();
            connectedEvidence = callState.connected_evidence || peerConnected.source;
            connectedDeadline = Math.min(connectedAt + durationSeconds * 1000, hardStopDeadline);
        }
        if (answered && !callState.voip_activity && !hangupVisible && !state) {
            disconnectedPolls++;
            if (disconnectedPolls >= 4) { endReason = 'remote_ended'; break; }
        } else {
            disconnectedPolls = 0;
        }
        if (!answered && time() >= ringDeadline) {
            // 边界处强制在动作主线程再查一次，不能依赖后台线程写入的共享变量。
            if (lastPeerProbeAt < ringDeadline) {
                peerProbe = syncCallTaskHeartbeat(task, null);
                lastPeerProbeAt = time();
            }
            ringBoundaryChecked = peerProbe && peerProbe.success === true;
            peerConnected = pairedCallConnectedEvidence(payload,
                ringBoundaryChecked ? peerProbe.peer : null);
            if (peerConnected) {
                answered = true;
                verified = true;
                connectedAt = time();
                connectedEvidence = peerConnected.source;
                connectedDeadline = Math.min(connectedAt + durationSeconds * 1000,
                    hardStopDeadline);
            } else if (ringBoundaryChecked) {
                endReason = 'ring_timeout';
                break;
            } else if (time() >= ringEvidenceDeadline) {
                endReason = 'peer_state_unavailable';
                break;
            } else {
                nextPeerProbeAt = time() + 800;
            }
        }
        if (answered && time() >= connectedDeadline) { endReason = 'duration_complete'; break; }
        if (!isWechatForeground()) { endReason = 'wechat_not_foreground'; break; }
        // 控制栏会自动隐藏；节点暂时消失不代表通话已经结束。
        sleep(800);
    }
    if (time() >= hardStopDeadline && answered) endReason = 'duration_complete';
    let hungUp = answered && endReason === 'remote_ended';
    let hangupExit = hungUp ? {ended: true, evidence: 'remote_end_detected'} : null;
    if (!hungUp && verified) {
        const beforeHangup = voiceCallPageState();
        if (answered && !beforeHangup.live_call) {
            endReason = 'remote_ended';
            hungUp = true;
            hangupExit = {ended: true, evidence: 'call_evidence_disappeared_before_hangup'};
        } else {
            const hangupClicked = hangUpVoiceCall(true);
            hangupExit = waitForCallExit(7000);
            hungUp = hangupClicked && hangupExit.ended;
        }
    }
    sleep(600);
    runtime.currentChatContact = null;
    runtime.currentConversationId = null;
    runtime.chatVerifiedAt = 0;
    const success = verified && answered && hungUp;
    return {
        success: success,
        preempted: endReason === 'scan_preempted' || endReason === 'peer_task_preempted',
        result: {call_type: callType, dial_started: verified, answered: answered, end_reason: endReason,
                 elapsed_seconds: ~~((time() - startedAt) / 1000),
                 connected_seconds: connectedAt ? ~~((time() - connectedAt) / 1000) : 0,
                 requested_duration_seconds: durationSeconds, hung_up: hungUp,
                 connected_evidence: connectedEvidence,
                 hangup_method: runtime.lastCallHangupMethod,
                 hangup_exit_evidence: hangupExit ? hangupExit.evidence : null,
                 microphone_off: audioState.microphone_off, speaker_off: audioState.speaker_off},
        error: endReason === 'peer_state_unavailable' ? '无法确认对端接通状态' :
            !verified ? '拨号页面未验证成功' : !answered ? '对方未接听' :
            !hungUp ? '通话结束后挂断失败' : null
    };
}

function makeVoiceCall(payload, shouldPreempt, taskDeadline, task) {
    return makeOutgoingCall(payload, shouldPreempt, taskDeadline, 'voice', task);
}

function makeVideoCall(payload, shouldPreempt, taskDeadline, task) {
    return makeOutgoingCall(payload, shouldPreempt, taskDeadline, 'video', task);
}

function findCallColor(color, left, top, right, bottom, threshold) {
    let screen = null;
    try {
        image.recycleAllImage();
        screen = image.captureFullScreenEx();
        if (!screen) return null;
        const normalizedColor = String(color || '').replace(/^#/, '0x');
        const points = image.findColor(screen, normalizedColor, threshold || 0.82,
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
        // 同时兼容 Redmi K20 Pro / MIUI 当前主题和微信标准主题；必须在同一
        // 张截图中同时确认右侧绿色接听与左侧红色拒接按钮，避免颜色误命中。
        const greenColors = ['0x0db209', '0x07c160', '0x00c800'];
        const redColors = ['0xda4a4a', '0xe84b4f', '0xfa5151'];
        // EasyClick 的 findColor 结果可能复用底层缓冲区；下一次找色会让上一次
        // points 失效。每次命中后必须立刻复制为普通坐标对象，不能跨调用保留数组。
        let greenPoint = null, redPoint = null, foundPoints = null;
        for (let greenIndex = 0; greenIndex < greenColors.length && !greenPoint; greenIndex++) {
            foundPoints = image.findColor(screen, greenColors[greenIndex], 0.86,
                ~~(width * 0.78), ~~(height * 0.06), ~~(width * 0.98), ~~(height * 0.20), 1, 1);
            if (foundPoints && foundPoints.length) {
                greenPoint = {x: foundPoints[0].x, y: foundPoints[0].y};
            }
        }
        for (let redIndex = 0; redIndex < redColors.length && !redPoint; redIndex++) {
            foundPoints = image.findColor(screen, redColors[redIndex], 0.84,
                ~~(width * 0.58), ~~(height * 0.06), ~~(width * 0.78), ~~(height * 0.20), 1, 1);
            if (foundPoints && foundPoints.length) {
                redPoint = {x: foundPoints[0].x, y: foundPoints[0].y};
            }
        }
        if (!greenPoint || !redPoint) return null;
        return {
            green: {x: ~~(width * 0.868), y: ~~(height * 0.108)},
            red: {x: ~~(width * 0.685), y: ~~(height * 0.108)},
            evidence: {
                green: greenPoint,
                red: redPoint
            }
        };
    } catch (e) {
        logw('来电卡片视觉检测失败: ' + e);
        return null;
    } finally {
        image.recycleAllImage();
    }
}

function answerIncomingCall(payload, shouldPreempt, taskDeadline, task) {
    if (payload.confirm_external !== true) return {success: false, error: '接听通话未明确授权'};
    const width = device.getScreenWidth(), height = device.getScreenHeight();
    const waitSeconds = Math.max(10, Math.min(240,
        intOrDefault(payload.incoming_wait_seconds, 150)));
    const waitDeadline = Math.min(time() + waitSeconds * 1000,
        (taskDeadline || time() + waitSeconds * 1000) - 4000);
    let card = null;
    while (time() < waitDeadline && !card) {
        if (hasSafetyBlocker()) return {success: false, error: '等待来电时账号需要人工处理'};
        if (shouldPreempt && shouldPreempt()) {
            return {success: false, preempted: true,
                result: {end_reason: 'task_preempted'}, error: '任务被抢占'};
        }
        const peerTerminal = pairedCallTerminalEvidence(payload, config.actionCallPeer);
        if (peerTerminal) {
            const peerPreempted = peerTerminal.status === 'preempted' ||
                peerTerminal.status === 'cancelled';
            return {success: false, preempted: peerPreempted,
                result: {end_reason: peerPreempted ?
                    'peer_task_preempted' : 'peer_task_failed'},
                error: peerPreempted ? '拨打端任务已让位' : '拨打端任务已结束'};
        }
        card = findIncomingCallCard(width, height);
        if (!card && time() < waitDeadline) sleep(450);
    }
    if (!card) return {success: false,
        result: {incoming_wait_seconds: waitSeconds, end_reason: 'incoming_call_timeout'},
        error: '等待期间未视觉确认到完整来电卡片'};
    humanizedPointClick(card.green.x, card.green.y, 5);
    let connectedState = null;
    const connected = waitFor(function () {
        const state = voiceCallPageState();
        if (state.connected) connectedState = state;
        return state.connected;
    }, 15000, 250);
    if (!connected) {
        const unfinished = voiceCallPageState();
        if (unfinished.live_call) {
            hangUpVoiceCall(true);
            waitForCallExit(5000);
        }
        return {success: false,
            result: {answered: false, end_reason: 'connected_evidence_missing'},
            error: '点击接听后未检测到真实通话计时'};
    }
    config.actionCallState = {
        call_session_id: payload.call_session_id || null,
        connected: true,
        connected_at: time(),
        evidence: connectedState ? connectedState.connected_evidence : 'connected'
    };
    config.actionHeartbeatUrgent = true;
    // 接通是双方通话状态机的关键栅栏。主线程立即同步，避免EasyClick后台
    // 线程对共享对象的可见性延迟让拨打端在ring_timeout处误判未接听。
    let connectionReport = null;
    let connectionReportAttempt = 0;
    while (connectionReportAttempt < 3) {
        connectionReport = syncCallTaskHeartbeat(task, config.actionCallState);
        if (connectionReport.success) break;
        connectionReportAttempt++;
        if (connectionReportAttempt < 3) sleep(500);
    }
    const startedAt = time();
    const audioState = ensureCallAudioMuted();
    const duration = Math.max(5, Math.min(3600,
        intOrDefault(payload.duration_seconds || payload.max_duration_seconds, 60)));
    const nominalDeadline = startedAt + duration * 1000;
    // 拨打方是计划通话的默认挂断方。接听方多等8秒观察远端结束，
    // 只有拨打方未能结束时才执行安全兜底挂断，避免双方同时抢点挂断键。
    const safetyDeadline = Math.min(nominalDeadline + 8000,
        (taskDeadline || nominalDeadline + 8000) - 2000);
    let reason = 'awaiting_caller_hangup';
    let disconnectedPolls = 0;
    while (time() < safetyDeadline) {
        if (shouldPreempt && shouldPreempt()) { reason = 'preempted'; break; }
        const callState = voiceCallPageState();
        if (callState.text === '通话结束' || callState.text === '对方已拒绝' ||
            callState.text === '对方忙线') { reason = 'remote_ended'; break; }
        if (!callState.live_call) {
            disconnectedPolls++;
            if (disconnectedPolls >= 4) { reason = 'remote_ended'; break; }
        } else {
            disconnectedPolls = 0;
        }
        if (!isWechatForeground() && disconnectedPolls === 0) {
            reason = 'wechat_not_foreground';
            break;
        }
        sleep(500);
    }
    let hungUp = reason === 'remote_ended';
    let hangupExit = hungUp ? {ended: true, evidence: 'remote_end_detected'} : null;
    if (!hungUp) {
        if (reason === 'awaiting_caller_hangup') reason = 'duration_safety_hangup';
        const stateBeforeHangup = voiceCallPageState();
        if (!stateBeforeHangup.live_call) {
            reason = 'remote_ended';
            hungUp = true;
            hangupExit = {ended: true, evidence: 'call_evidence_disappeared_before_hangup'};
        } else {
            const hangupClicked = hangUpVoiceCall(true);
            hangupExit = waitForCallExit(7000);
            hungUp = hangupClicked && hangupExit.ended;
        }
    }
    return {success: hungUp, preempted: reason === 'preempted',
        result: {answered: true, call_type: payload.call_type || 'any',
            elapsed_seconds: ~~((time() - startedAt) / 1000), end_reason: reason, hung_up: hungUp,
            call_session_id: payload.call_session_id || null,
            connected_evidence: connectedState ? connectedState.connected_evidence : null,
            hangup_method: runtime.lastCallHangupMethod,
            hangup_exit_evidence: hangupExit ? hangupExit.evidence : null,
            connection_state_reported: connectionReport && connectionReport.success === true,
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
    runtime.currentConversationId = null;
    runtime.chatVerifiedAt = 0;
    if (!mainTab('发现', deadline)) return false;
    return retryFreshNode('open_discover_' + item, function () { return visibleText(item, 900); },
        clickVerifiedNode, 3, 500, deadline);
}

function channelsPageEvidence(xmlSnapshot) {
    const xml = xmlSnapshot === undefined ? wechatXmlSnapshot() : (xmlSnapshot || '');
    const activity = runningWechatActivity();
    const foreground = isWechatForeground(xml);
    const hasFollowing = xml.indexOf('desc="关注"') >= 0;
    const hasRecommend = xml.indexOf('desc="推荐"') >= 0;
    const hasBack = xml.indexOf('id="com.tencent.mm:id/backBtn"') >= 0;
    const hasLike = xml.indexOf('id="com.tencent.mm:id/ng5"') >= 0;
    // 视频加载、广告或标签收起时，不一定同时暴露“关注/推荐”。
    // FinderHomeAffinityUI 是视频号首页的强证据；节点树可用时仍使用成对证据。
    const finderHomeActivity = activity.indexOf('FinderHomeAffinityUI') >= 0;
    const matched = foreground && (finderHomeActivity ||
        (hasFollowing && hasRecommend) || (hasBack && hasLike));
    return {matched: matched, foreground: foreground, activity: activity,
        finder_home_activity: finderHomeActivity, has_following: hasFollowing,
        has_recommend: hasRecommend, has_back: hasBack, has_like: hasLike};
}

function channelsValidationResult(stage) {
    const evidence = channelsPageEvidence();
    return {stage: stage, matched: evidence.matched, foreground: evidence.foreground,
        activity: evidence.activity, finder_home_activity: evidence.finder_home_activity,
        has_following: evidence.has_following, has_recommend: evidence.has_recommend,
        has_back: evidence.has_back, has_like: evidence.has_like};
}

function channelsMinorModePromptEvidence(xmlSnapshot) {
    const xml = xmlSnapshot === undefined ? wechatXmlSnapshot() : (xmlSnapshot || '');
    const hasSettingEntry = xml.indexOf('text="设置未成年人模式"') >= 0;
    const hasKnownButton = xml.indexOf('text="我知道了"') >= 0;
    const hasNeverRemindButton = xml.indexOf('text="不再提醒"') >= 0;
    const hasMinorText = xml.indexOf('未成年人健康成长') >= 0 ||
        xml.indexOf('未成年人模式') >= 0;
    return {present: isWechatForeground(xml) && hasSettingEntry && hasMinorText &&
            (hasKnownButton || hasNeverRemindButton),
        has_setting_entry: hasSettingEntry, has_known_button: hasKnownButton,
        has_never_remind_button: hasNeverRemindButton};
}

function dismissChannelsMinorModePrompt(deadline) {
    const evidence = channelsMinorModePromptEvidence();
    if (!evidence.present) return {present: false, dismissed: false, action: null};
    // “设置未成年人模式”会改变账号设置，禁止进入。优先点击“不再提醒”；
    // 仅在该按钮确实不存在时才用“我知道了”关闭本次普通提示。
    let action = evidence.has_never_remind_button ? 'never_remind' : 'known';
    const buttonText = action === 'never_remind' ? '不再提醒' : '我知道了';
    const clicked = retryFreshNode('dismiss_channels_minor_mode_' + action, function () {
        return text(buttonText).pkg(WX_PACKAGE).getOneNodeInfo(500);
    }, clickVerifiedNode, 2, 300, deadline);
    const dismissed = clicked && waitFor(function () {
        return !channelsMinorModePromptEvidence().present;
    }, 3000, 200);
    return {present: true, dismissed: dismissed, action: action,
        has_never_remind_button: evidence.has_never_remind_button};
}

function isChannelsPage() {
    return channelsPageEvidence().matched;
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

function chooseChannelDwellMs(minSeconds, maxSeconds) {
    // EasyClick 的全局 random() 在部分真机/DEX 组合上处理五位数毫秒区间时会
    // 返回非数值，Math.min() 随后得到 NaN，导致停留循环被直接跳过。只在
    // 小范围“秒”上取随机数，再显式校验并换算成毫秒，任何异常都回退到下限。
    const minimum = Math.max(1, ~~minSeconds);
    const maximum = Math.max(minimum, ~~maxSeconds);
    let picked = Number(random(minimum, maximum));
    if (!(picked >= minimum && picked <= maximum)) {
        picked = minimum + Math.floor(Math.random() * (maximum - minimum + 1));
    }
    if (!(picked >= minimum && picked <= maximum)) picked = minimum;
    return picked * 1000;
}

function browseChannels(payload, shouldPreempt, taskDeadline) {
    const startedAt = time();
    if (!openDiscoverItem('视频号', taskDeadline)) return {success: false, error: '无法进入视频号'};
    let minorPromptDismissals = 0;
    let minorPromptFallbacks = 0;
    let promptOutcome = dismissChannelsMinorModePrompt(taskDeadline);
    if (promptOutcome.present && !promptOutcome.dismissed) {
        clickKnownPageBack(detectWechatPage(), taskDeadline);
        return {success: false, result: {end_reason: 'minor_mode_prompt_dismiss_failed',
            minor_mode_prompt: promptOutcome}, error: '未成年人模式提示关闭失败'};
    }
    if (promptOutcome.dismissed) {
        minorPromptDismissals++;
        if (promptOutcome.action !== 'never_remind') minorPromptFallbacks++;
    }
    if (!waitFor(isChannelsPage, 12000, 300)) {
        const entryValidation = channelsValidationResult('entry');
        clickKnownPageBack(detectWechatPage(), taskDeadline);
        return {success: false, result: {end_reason: 'channels_entry_validation_failed',
            channels_validation: entryValidation}, error: '视频号页面校验失败'};
    }
    const duration = Math.max(5, Math.min(3600, intOrDefault(payload.duration_seconds, 60)));
    const dwellMin = Math.max(5, Math.min(120, intOrDefault(payload.dwell_min_seconds, 15)));
    const dwellMax = Math.max(dwellMin, Math.min(180, intOrDefault(payload.dwell_max_seconds, 30)));
    const explicitSwipeLimit = payload.max_swipes !== undefined && payload.max_swipes !== null &&
        payload.max_swipes !== '';
    // 日程任务通常只给浏览时长和停留区间。默认上限必须覆盖整个计划窗口，
    // 不能用固定30次把26—47分钟任务截断成约7.5—15分钟。
    const maxSwipes = explicitSwipeLimit ?
        Math.max(0, Math.min(720, intOrDefault(payload.max_swipes, 30))) :
        Math.max(1, Math.min(720, Math.ceil(duration / dwellMin) + 1));
    const likeBudget = payload.confirm_external === true ?
        Math.max(0, Math.min(10, intOrDefault(payload.interaction_budget, 0))) : 0;
    const likeProbability = Math.max(0, Math.min(100,
        intOrDefault(payload.like_probability_percent, 18)));
    const deadline = Math.min(time() + duration * 1000, (taskDeadline || time() + duration * 1000) - 2000);
    let swipes = 0;
    let likes = 0;
    let completedDwells = 0;
    let totalDwellMs = 0;
    let shortestDwellMs = null;
    let reason = 'duration_complete';
    let lastValidation = null;
    // EasyClick DEX/Rhino 在部分真机会复用 while 块内首轮的词法绑定值。
    // 逐轮计时变量必须在循环外声明，并在每一轮显式重赋值。
    let dwellStartedAt = 0;
    let plannedDwellMs = 0;
    let waitUntil = 0;
    let actualDwellMs = 0;
    let wallElapsedMs = 0;
    let screenWidth = 0;
    let screenHeight = 0;
    let nextPromptCheckAt = 0;
    while (time() < deadline && swipes < maxSwipes) {
        promptOutcome = dismissChannelsMinorModePrompt(taskDeadline);
        if (promptOutcome.present && !promptOutcome.dismissed) {
            reason = 'minor_mode_prompt_dismiss_failed';
            lastValidation = channelsValidationResult('minor_mode_prompt');
            break;
        }
        if (promptOutcome.dismissed) {
            minorPromptDismissals++;
            if (promptOutcome.action !== 'never_remind') minorPromptFallbacks++;
        }
        nextPromptCheckAt = time() + 3000;
        dwellStartedAt = Number(time());
        plannedDwellMs = Math.min(deadline - dwellStartedAt,
            chooseChannelDwellMs(dwellMin, dwellMax));
        waitUntil = dwellStartedAt + plannedDwellMs;
        while (time() < waitUntil) {
            if (hasSafetyBlocker()) { reason = 'account_attention_required'; break; }
            if (shouldPreempt && shouldPreempt()) { reason = 'scan_preempted'; break; }
            if (time() >= nextPromptCheckAt) {
                promptOutcome = dismissChannelsMinorModePrompt(taskDeadline);
                nextPromptCheckAt = time() + 3000;
                if (promptOutcome.present && !promptOutcome.dismissed) {
                    reason = 'minor_mode_prompt_dismiss_failed';
                    lastValidation = channelsValidationResult('minor_mode_prompt_during_dwell');
                    break;
                }
                if (promptOutcome.dismissed) {
                    minorPromptDismissals++;
                    if (promptOutcome.action !== 'never_remind') minorPromptFallbacks++;
                }
            }
            if (time() < waitUntil) sleep(Math.min(1000, waitUntil - time()));
        }
        if (reason !== 'duration_complete') break;
        actualDwellMs = Number(time()) - dwellStartedAt;
        // 除任务自然到时外，实际停留不允许明显短于本轮计划。这个守卫可防止
        // 以后框架计时/休眠异常再次退化成每秒连续滑动却被上报为成功。
        if (time() < deadline && actualDwellMs + 500 < plannedDwellMs) {
            reason = 'dwell_timing_invalid';
            break;
        }
        completedDwells++;
        totalDwellMs += actualDwellMs;
        shortestDwellMs = shortestDwellMs === null ? actualDwellMs :
            Math.min(shortestDwellMs, actualDwellMs);
        wallElapsedMs = Number(time()) - Number(startedAt);
        // 累计停留不可能超过整个动作的墙钟耗时；异常时立即失败，禁止快速滑完。
        if (totalDwellMs > wallElapsedMs + 1500) {
            reason = 'dwell_clock_inconsistent';
            break;
        }
        if (likes < likeBudget && random(1, 101) <= likeProbability) {
            if (shouldPreempt && shouldPreempt()) { reason = 'scan_preempted'; break; }
            if (isChannelsPage() && clickCurrentChannelLike()) {
                likes++;
                sleep(random(500, 900));
            }
        }
        if (time() >= deadline) break;
        if (!waitFor(isChannelsPage, 4000, 250)) {
            reason = 'page_changed';
            lastValidation = channelsValidationResult('before_swipe');
            break;
        }
        screenWidth = device.getScreenWidth();
        screenHeight = device.getScreenHeight();
        swipeToPoint(random(~~(screenWidth * 0.43), ~~(screenWidth * 0.57)), ~~(screenHeight * 0.78),
            random(~~(screenWidth * 0.43), ~~(screenWidth * 0.57)), ~~(screenHeight * 0.28), random(450, 800));
        swipes++;
        if (!waitFor(isChannelsPage, 5000, 250)) {
            reason = 'page_changed_after_swipe';
            lastValidation = channelsValidationResult('after_swipe');
            break;
        }
    }
    if (swipes >= maxSwipes && time() < deadline && reason === 'duration_complete') {
        // 调用方显式给出的上限属于正常的有界测试；按时长推导出的上限提前
        // 耗尽则代表停留节奏失效，必须失败，不能再伪装成“已完成”。
        reason = explicitSwipeLimit ? 'swipe_limit' : 'swipe_limit_before_duration';
    }
    if (isWechatForeground() && detectWechatPage() === WX_PAGE.CHANNELS) {
        clickKnownPageBack(WX_PAGE.CHANNELS, taskDeadline);
    }
    const success = reason === 'duration_complete' ||
        (explicitSwipeLimit && reason === 'swipe_limit');
    return {success: success, preempted: reason === 'scan_preempted',
        result: {swipes: swipes, likes: likes,
            elapsed_seconds: ~~((time() - startedAt) / 1000), end_reason: reason,
            planned_duration_seconds: duration, dwell_min_seconds: dwellMin,
            dwell_max_seconds: dwellMax, completed_dwells: completedDwells,
            total_dwell_ms: totalDwellMs, shortest_dwell_ms: shortestDwellMs,
            wall_elapsed_ms: Number(time()) - Number(startedAt),
            last_planned_dwell_ms: plannedDwellMs,
            channels_validation: lastValidation,
            minor_mode_prompt_dismissals: minorPromptDismissals,
            minor_mode_prompt_fallbacks: minorPromptFallbacks,
            max_swipes: maxSwipes, swipe_limit_source: explicitSwipeLimit ? 'payload' : 'duration'},
        error: success ? null : reason === 'scan_preempted' ? '扫码任务抢占' : '视频号浏览中断: ' + reason};
}

function momentEditorVisible() {
    return withNode(function () {
        return id('com.tencent.mm:id/n7y').pkg(WX_PACKAGE).getOneNodeInfo(300) ||
            clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(200);
    }, function (editor) { return editor.visible; });
}

function momentExitPromptVisible() {
    return withNode(function () {
        return textMatch('^退出此次编辑[？?]$').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (prompt) { return prompt.visible; });
}

function momentKeepPromptVisible() {
    return withNode(function () {
        return textMatch('^保留此次编辑[？?]$').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (prompt) { return prompt.visible; });
}

function confirmMomentExitPrompt() {
    if (!momentExitPromptVisible()) return false;
    return retryFreshNode('confirm_moment_exit', function () {
        return id('com.tencent.mm:id/mm_alert_ok_btn').text('退出').pkg(WX_PACKAGE).getOneNodeInfo(450);
    }, clickVerifiedNode, 2, 300, time() + 1800);
}

function confirmMomentDiscardPrompt() {
    if (!momentKeepPromptVisible()) return false;
    return retryFreshNode('confirm_moment_discard', function () {
        return id('com.tencent.mm:id/mm_alert_cancel_btn').text('不保留')
            .pkg(WX_PACKAGE).getOneNodeInfo(450);
    }, clickVerifiedNode, 2, 300, time() + 1800);
}

function waitMomentEditorClosed(timeoutMs) {
    return waitFor(function () {
        return !momentEditorVisible() && !momentExitPromptVisible() &&
            !momentKeepPromptVisible() && detectWechatPage() === WX_PAGE.MOMENTS;
    }, timeoutMs || 4000, 250);
}

function cancelMomentDraft() {
    if (momentKeepPromptVisible()) {
        return confirmMomentDiscardPrompt() && waitMomentEditorClosed(4000);
    }
    if (momentExitPromptVisible()) {
        return confirmMomentExitPrompt() && waitMomentEditorClosed(4000);
    }
    retryFreshNode('clear_moment_draft', function () {
        return id('com.tencent.mm:id/n7y').pkg(WX_PACKAGE).getOneNodeInfo(400) ||
            clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(250);
    }, function (editor) { clickNodeSafeArea(editor); editor.clearText(); return true; }, 2, 300);
    for (let attempt = 0; attempt < 3; attempt++) {
        if (waitMomentEditorClosed(500)) return true;
        if (momentKeepPromptVisible()) {
            if (confirmMomentDiscardPrompt() && waitMomentEditorClosed(4000)) return true;
            continue;
        }
        if (momentExitPromptVisible()) {
            if (confirmMomentExitPrompt() && waitMomentEditorClosed(4000)) return true;
            continue;
        }
        if (!momentEditorVisible()) {
            sleep(800);
            continue;
        }
        back(); sleep(350);
        // 第一次 back 可能只收起键盘；等待节点树稳定后再判断，下一轮
        // 才会再次 back，避免动画期间连续返回关闭确认对话框。
        sleep(2150);
        if (momentKeepPromptVisible()) {
            if (!confirmMomentDiscardPrompt()) continue;
        } else if (momentExitPromptVisible()) {
            if (!confirmMomentExitPrompt()) continue;
        } else if (detectWechatPage() === WX_PAGE.MOMENTS) {
            return true;
        } else {
            clickFirstVisible([text('不保留').pkg(WX_PACKAGE), text('放弃').pkg(WX_PACKAGE)], 300);
        }
        if (waitMomentEditorClosed(4000)) return true;
    }
    return waitMomentEditorClosed(1000);
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
    const momentEditorFactory = function () {
        return id('com.tencent.mm:id/n7y').pkg(WX_PACKAGE).getOneNodeInfo(700) ||
            clz('android.widget.EditText').pkg(WX_PACKAGE).getOneNodeInfo(300);
    };
    const prepared = typeTextCharacterByCharacter(momentEditorFactory, payload.content,
        deadline, shouldPreempt);
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
        let initialCallState = voiceCallPageState();
        if (!initialCallState.live_call && initialCallState.voip_activity) {
            // 动作函数刚挂断时 Activity 可能滞留一两秒。先等待转场，严禁
            // 因为这个残留 Activity 再点一次屏幕中心。
            waitFor(function () {
                initialCallState = voiceCallPageState();
                return initialCallState.live_call || !initialCallState.voip_activity;
            }, 1800, 250);
        }
        if (initialCallState.live_call) {
            callHungUp = hangUpVoiceCall(true);
            trace.push(callHungUp ? 'call_hung_up' : 'call_hangup_failed');
            const cleanupCallExit = waitForCallExit(6000);
            trace.push(cleanupCallExit.ended ? 'call_exit_verified' : 'call_exit_unverified');
            sleep(random(350, 700));
        } else if (initialCallState.voip_activity) {
            trace.push('stale_voip_activity_ignored');
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
        if (page === WX_PAGE.UNKNOWN && isWechatForeground()) {
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
        runtime.currentConversationId = null;
        runtime.chatVerifiedAt = 0;
        return {success: homeReady, call_hung_up: callHungUp,
            draft_cleaned: draftCleaned, launcher_fallback: launcherFallback,
            mini_program_detected: miniProgramDetected, mini_program_closed: miniProgramClosed,
            elapsed_ms: time() - startedAt, trace: trace};
    } catch (e) {
        runtime.currentChatContact = null;
        runtime.currentConversationId = null;
        runtime.chatVerifiedAt = 0;
        return {success: false, error: '' + e, call_hung_up: callHungUp,
            draft_cleaned: draftCleaned, launcher_fallback: launcherFallback,
            mini_program_detected: miniProgramDetected, mini_program_closed: miniProgramClosed,
            elapsed_ms: time() - startedAt, trace: trace};
    } finally {
        try { releaseNode(); } catch (ignoreRelease) {}
    }
}

function shouldKeepConversationOpen(task, outcome) {
    const payload = task && task.payload || {};
    const chatAction = task && ['chat_text', 'chat_emoji', 'chat_voice'].indexOf(
        task.action_type
    ) >= 0;
    if (!chatAction || !outcome || outcome.success !== true ||
            payload.keep_conversation_open !== true ||
            payload.participant_last_turn === true || !payload.conversation_id) {
        return false;
    }
    const page = detectWechatPage();
    const chatPage = page === WX_PAGE.CHAT_TEXT || page === WX_PAGE.CHAT_VOICE ||
        page === WX_PAGE.CHAT_EMOJI;
    return chatPage && runtime.currentChatContact === payload.contact &&
        runtime.currentConversationId === String(payload.conversation_id);
}

function closeHeldConversationForScan() {
    if (!runtime.currentConversationId || !isChatPage()) {
        return {success: true, skipped: true, reason: 'conversation_not_held'};
    }
    return restoreToWechatHome({reason: 'scan_claimed_during_conversation'});
}

function execute(task, shouldPreempt) {
    if (!task || hasSafetyBlocker()) return {success: false, error: '账号需要人工处理'};
    const serverDeadline = task.hard_deadline || task.deadline;
    // 长浏览动作必须给退出页面、恢复微信首页和结果上报留出固定时间。
    // 服务器端为这两类任务增加10分钟硬截止缓冲，因此这里不会缩短计划浏览时长。
    const recoveryReserveMs = task.action_type === 'channels_browse' ||
        task.action_type === 'moment_browse' ? 60000 : 2000;
    const actionDeadline = serverDeadline ? serverDeadline - recoveryReserveMs : serverDeadline;
    if (actionDeadline && time() >= actionDeadline - 2000) return {success: false, error: '任务执行时间已耗尽'};
    if (shouldPreempt && shouldPreempt()) return {success: false, preempted: true, error: '扫码任务抢占'};
    if (task.action_type === 'chat_text') return sendText(task.payload || {}, actionDeadline, shouldPreempt);
    if (task.action_type === 'chat_inspect') return inspectChat(task.payload || {}, actionDeadline);
    if (task.action_type === 'chat_emoji') return sendEmoji(task.payload || {}, actionDeadline, shouldPreempt);
    if (task.action_type === 'chat_voice') return sendVoice(task.payload || {}, actionDeadline, shouldPreempt);
    if (task.action_type === 'voice_call') return makeVoiceCall(task.payload || {}, shouldPreempt, actionDeadline, task);
    if (task.action_type === 'video_call') return makeVideoCall(task.payload || {}, shouldPreempt, actionDeadline, task);
    if (task.action_type === 'call_dial') {
        return makeOutgoingCall(task.payload || {}, shouldPreempt, actionDeadline,
            (task.payload || {}).call_type === 'video' ? 'video' : 'voice', task);
    }
    if (task.action_type === 'call_answer') return answerIncomingCall(task.payload || {}, shouldPreempt, actionDeadline, task);
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
        const foreground = isWechatForeground();
        return {success: foreground,
            result: {runtime_mode: 'idle'}, error: foreground ? null : '微信唤醒失败'};
    }
    return {success: false, error: '不支持的动作类型: ' + task.action_type};
}

// src/js 下的文件由 EasyClick 一起编译，main.js 可直接访问这个全局对象。
// 不要在 src/js 内使用 require/module.exports，否则 DEX 运行时会把它当作
// CommonJS 资源查找并报 Module not found。
var wechatActionExecutor = {
    execute: execute,
    clickVerifiedNode: clickVerifiedNode,
    restoreToWechatHome: restoreToWechatHome,
    shouldKeepConversationOpen: shouldKeepConversationOpen,
    closeHeldConversationForScan: closeHeldConversationForScan
};
