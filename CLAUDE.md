# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个基于 EasyClick (EC) 自动化框架构建的微信二维码扫描自动化应用。该应用通过从远程服务器接收二维码、在多个微信账号之间切换并将扫描结果报告回服务器，实现微信登录验证的自动化。

## 技术栈

- **平台**: EasyClick (EC) Android 自动化框架
- **语言**: JavaScript (Rhino 引擎，支持 Java 互操作)
- **UI**: 基于 XML 的布局，使用自定义 UI 库 (jcUI)
- **构建输出**: 编译为 .jar 和 .iec 文件

## 项目结构

```
扫码助手/
├── src/
│   ├── js/
│   │   ├── main.js          # 主要自动化逻辑和工作流
│   │   ├── jc.js            # 节点查找工具和辅助函数
│   │   └── laoleng.js       # 第三方工具库
│   ├── layout/
│   │   ├── ui.js            # UI 初始化和样式设置
│   │   ├── main.xml         # 主 UI 布局定义
│   │   └── subjs/jcUI.js    # UI 组件库
│   ├── res/                 # UI 和图像识别的图片资源
│   └── update.json          # 版本信息 (当前: 1.25)
├── libs/                    # EC 框架核心库
├── build/                   # 编译输出 (.jar, .iec 文件)
├── obfuscator.json          # 代码混淆设置
└── pkgsetting.json          # 包配置
```

## 核心架构

### 主工作流 (main.js)

应用遵循状态机模式，包含 5 个步骤：

1. **步骤 0 - 登录**: 使用设备 ID 和微信账号列表向服务器进行设备认证
2. **步骤 1 - 获取任务**: 轮询服务器获取二维码扫描任务
3. **步骤 2 - 转换图片**: 将 base64 二维码转换为位图并保存到相册
4. **步骤 3 - 检查账号**: 验证当前微信账号是否符合任务要求
5. **步骤 4 - 扫码**: 在微信中自动化二维码扫描流程

### 关键组件

- **配置对象** (main.js 中的 `config`): 中央配置，包括屏幕尺寸、包名、服务器 IP、微信账号和当前步骤
- **节点查找** (jc.js): EC 节点查找 API 的封装，使用全局变量 (`j_node`, `j_nodeAll`, `j_pNode`, `j_cNode`)
- **UI 系统** (ui.js, jcUI): 用于设置页面的自定义 UI 框架，支持颜色主题、事件监听器和配置持久化
- **图像识别**: 当节点查找失败时使用 `findImage()` 作为后备方案

### API 通信

应用与本地服务器通信，地址为 `http://{serverIp}:8001/api/`：

- `POST /phone/login` - 使用微信账号注册设备
- `GET /scan/task?phone_id={id}` - 轮询扫描任务
- `POST /scan/result` - 报告扫描结果 (成功/失败/超时)

## 开发命令

### 构建

项目编译为 EC 特定格式。构建输出位于 `build/` 目录：
- `build/jar/main.jar` - 主逻辑编译文件
- `build/uijar/ui.jar` - UI 编译文件
- `build/release.iec` - 最终打包应用

### 代码混淆

混淆设置位于 `obfuscator.json`，使用 javascript-obfuscator 的高混淆预设。

## 重要模式

### 节点查找模式

始终使用 jc 封装函数，它们会设置全局变量：

```javascript
if (jc.FindNode(text('按钮文字'))) {
    // j_node 现在已全局设置
    j_node.click();
}

if (jc.FindNodeEx(text('列表项'))) {
    // j_nodeAll 现在已全局设置
    for (let i = 0; i < j_nodeAll.length; i++) {
        // 处理 j_nodeAll[i]
    }
}
```

### 图像识别后备方案

当节点不可靠时，使用图像识别：

```javascript
if (findImage('授权手机号', x1, y1, x2, y2)) {
    clickPoint(gPoint.x, gPoint.y);
}
```

图像操作后始终调用 `image.recycleAllImage()` 以防止内存泄漏。

### 错误处理

对于致命错误使用 `showErrMsg(msg)` - 它会显示 toast、记录错误、显示对话框并退出。

### 线程

后台任务使用 `thread.execAsync()`。主工作流运行一个后台线程来监控成功/失败节点，而主线程处理自动化流程。

## 配置

### 必需设置 (通过 UI)

- `deviceId`: 设备标识符 (自动填充 Android ID)
- `serverIp`: 内网服务器 IP 地址 (必填)
- `weixinArr`: 微信账号昵称，用 `#` 分隔 (最多 2 个账号)

### 包名

- 目标应用: `com.tencent.mm` (微信)
- 脚本包: `com.tx.saoma`

## 关键约束

- 最多支持 2 个微信账号
- 通过 `config.endTime` 时间戳检查强制试用期
- 需要无障碍服务和悬浮窗权限
- 运行期间屏幕必须保持唤醒 (`device.keepScreenOn()`)
- 通过 shell 命令为悬浮窗启用点击穿透

## 常见问题

- **节点查找失败**: 使用图像识别作为后备方案
- **应用不在前台**: 计数器跟踪连续失败次数，8-10 次失败后重新打开应用
- **内存泄漏**: 始终使用 `image.recycleAllImage()` 回收图像
- **验证超时**: 每次扫描操作 100 秒超时
- **账号切换**: 如果账号错误，杀死并重启微信

## 测试

无自动化测试套件。手动测试流程：
1. 在 UI 中配置服务器 IP 和微信账号
2. 启用日志窗口和控制窗口开关
3. 监控自动化过程中的日志输出
4. 验证扫描结果是否报告到服务器

## 注意事项

- 代码使用中文注释和 UI 文本
- 大量使用 `importClass()` 进行 Java 互操作
- 全局变量是此框架的有意设计模式
- Sleep 延迟对于 UI 转换和网络操作是必需的
