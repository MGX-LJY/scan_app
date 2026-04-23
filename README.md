# 微信扫码助手 (WeChat Scan Assistant)

Android 端微信二维码自动扫描和验证系统，基于 EasyClick 框架开发。

## 📱 核心功能

- 🔄 自动从服务器获取扫码任务
- 🖼️ Base64 图片转换和相册保存
- 👤 多微信账号自动切换（最多2个）
- 📸 自动化扫码流程
- 📊 扫码结果实时上报
- 📝 完整的日志记录

## 🛠️ 技术栈

- **平台**: EasyClick (EC) Android 自动化框架
- **语言**: JavaScript (Rhino 引擎)
- **UI**: XML 布局 + jcUI 组件库
- **构建**: 编译为 .jar 和 .iec 文件

## 🔄 工作流程

应用采用 5 步状态机设计：

```
步骤0: 登录注册
  ↓
步骤1: 获取任务 (轮询服务器)
  ↓
步骤2: 转换图片 (Base64 → 位图 → 相册)
  ↓
步骤3: 检查账号 (验证当前微信账号)
  ↓
步骤4: 执行扫码 (自动化扫码流程)
  ↓
返回步骤1
```

## 📋 环境要求

- Android 7.0+ (API 24+)
- 微信 App (最新版本推荐)
- 无障碍服务权限
- 悬浮窗权限
- 存储权限（读写相册）
- 屏幕保持唤醒

## 🚀 构建和安装

### 开发环境

1. 安装 EasyClick IDE
2. 克隆项目到本地
3. 使用 EasyClick 打开项目

### 构建步骤

```bash
# 在 EasyClick IDE 中
1. 打开项目
2. 点击"构建" → "构建发布版"
3. 生成的文件位于 build/ 目录
```

### 安装到设备

```bash
# 方式1: 直接安装 .iec 文件
adb install build/release.iec

# 方式2: 通过 EasyClick IDE 推送
使用 IDE 的"运行"功能直接推送到设备
```

## ⚙️ 配置说明

### 服务器配置

在应用首次启动时配置：

- **服务器地址**: 扫码服务器的 IP 地址
- **端口**: 默认 8001
- **设备ID**: 自动生成或手动输入
- **微信账号**: 配置1-2个微信账号名称

### 配置文件

配置保存在应用内部存储：
```
/data/data/com.ec.scan_app/shared_prefs/config.xml
```

## 🌐 API 通信

### 服务器端点

**基础URL**: `http://{serverIp}:8001/api/`

#### 1. 设备注册
```http
POST /phone/login
Content-Type: application/json

{
  "phone_id": "设备ID",
  "wechat_accounts": ["账号1", "账号2"]
}
```

#### 2. 获取任务
```http
GET /scan/task?phone_id={设备ID}

Response:
{
  "task_id": "任务ID",
  "qr_code": "base64编码的二维码图片",
  "account": "指定使用的微信账号"
}
```

#### 3. 上报结果
```http
POST /scan/result
Content-Type: application/json

{
  "task_id": "任务ID",
  "phone_id": "设备ID",
  "status": "success/failed",
  "message": "结果描述",
  "timestamp": 1234567890
}
```

## 📁 项目结构

```
scan_app/
├── src/
│   ├── js/
│   │   ├── main.js          # 主逻辑和状态机
│   │   ├── jc.js            # 节点查找工具
│   │   └── laoleng.js       # 工具库
│   ├── layout/              # UI 布局文件
│   └── res/                 # 图片资源
├── libs/                    # EC 框架核心库
├── build/                   # 编译输出
│   └── release.iec          # 最终打包文件
├── pkgsetting.json          # 包配置
└── README.md
```

## 🔑 核心文件说明

- **main.js**: 应用主入口，包含5步状态机逻辑
- **jc.js**: 封装的节点查找工具，简化 UI 自动化操作
- **laoleng.js**: 通用工具函数库
- **pkgsetting.json**: 应用包配置，包含权限、版本等信息

## ⚠️ 重要注意事项

### 性能优化

- 图像操作后必须调用 `image.recycleAllImage()` 防止内存泄漏
- 避免频繁的 UI 查找操作
- 合理设置轮询间隔

### 稳定性

- Sleep 延迟是必需的，不要随意删除
- 扫码操作有 100 秒超时保护
- 网络请求需要错误处理

### 权限管理

- 首次运行需要手动授予无障碍服务权限
- 悬浮窗权限用于显示状态提示
- 存储权限用于保存二维码图片

### 账号限制

- 最多支持 2 个微信账号
- 账号切换需要时间，避免频繁切换
- 确保微信账号已登录且可用

## 🐛 常见问题

### 1. 扫码失败
- 检查微信是否已登录
- 确认二维码图片已保存到相册
- 验证无障碍服务是否正常

### 2. 任务获取失败
- 检查服务器地址和端口
- 确认网络连接正常
- 查看服务器日志

### 3. 应用崩溃
- 检查内存使用情况
- 确认是否调用了 `image.recycleAllImage()`
- 查看应用日志

## 📊 日志查看

应用日志保存位置：
```
/sdcard/Android/data/com.ec.scan_app/files/logs/
```

查看实时日志：
```bash
adb logcat | grep "ScanApp"
```

## 🔗 相关项目

- [扫码服务器](../scan_server/) - 任务分发和结果收集
- [Windows 微信自动化系统](../) - 主系统

## 📄 许可证

本项目仅供学习和研究使用。

## 👥 贡献

欢迎提交 Issue 和 Pull Request。

---

**注意**: 本应用需要配合扫码服务器使用，请确保服务器已正确部署和配置。
