# UDP/TCP 协议测试工具

一款面向网络工程师、开发者和运维人员的桌面应用程序，用于测试和调试 UDP 和 TCP 协议通信。

## 功能特性

### 🔌 UDP 协议测试
- **连接配置**：设置目标 IP 地址、端口号、本地端口
- **数据发送**：支持文本和十六进制数据输入
- **实时通信**：显示发送和接收的数据包
- **响应分析**：解析并展示服务器响应内容

### 🔗 TCP 协议测试
- **连接管理**：支持建立连接、断开连接
- **数据发送**：支持文本和十六进制数据输入
- **实时通信**：显示发送和接收的数据流
- **连接状态**：实时显示 TCP 连接状态

### ⚙️ 其他功能
- **消息历史**：自动保存通信会话
- **会话清空**：一键清空当前会话数据
- **显示模式**：文本或十六进制显示切换
- **深色主题**：专业的科技风格界面

## 技术栈

- **Electron**: 28.0.0
- **Vue**: 3.4+
- **TypeScript**: 5.x
- **Vite**: 5.x
- **Pinia**: 状态管理
- **Vue Router**: 路由管理

## 安装和运行

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 或 npm >= 9.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd udp-tcp-tester
   ```

2. **安装依赖**
   ```bash
   pnpm install
   # 或
   npm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm run dev
   # 或
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 http://localhost:5173

### 构建桌面应用

```bash
pnpm run electron:build
# 或
npm run electron:build
```

构建完成后的应用将位于 `release` 目录中。

## 项目结构

```
udp-tcp-tester/
├── electron/              # Electron 主进程代码
│   ├── main.ts          # 主进程入口
│   └── preload.ts       # 预加载脚本
├── src/                  # Vue 渲染进程代码
│   ├── main.ts         # Vue 应用入口
│   ├── App.vue         # 根组件
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia 状态管理
│   ├── views/          # 页面视图
│   ├── components/     # Vue 组件
│   │   ├── layout/     # 布局组件
│   │   ├── udp/        # UDP 相关组件
│   │   └── tcp/        # TCP 相关组件
│   ├── types/          # TypeScript 类型定义
│   └── assets/         # 静态资源
├── index.html          # HTML 入口
├── package.json        # 项目配置
├── vite.config.ts     # Vite 配置
└── tsconfig.json      # TypeScript 配置
```

## 使用说明

### UDP 测试

1. 在左侧导航栏选择 "UDP 测试"
2. 配置目标 IP 地址和端口
3. 在数据输入区输入要发送的文本或十六进制数据
4. 点击"发送"按钮或使用 `Ctrl + Enter` 快捷发送
5. 消息记录区会显示发送和接收的数据包

### TCP 测试

1. 在左侧导航栏选择 "TCP 测试"
2. 配置目标 IP 地址和端口
3. 点击"连接"按钮建立 TCP 连接
4. 连接成功后，在数据输入区输入要发送的数据
5. 点击"发送"按钮或使用 `Ctrl + Enter` 快捷发送
6. 会话记录区会显示完整的通信过程
7. 测试完成后点击"断开"按钮关闭连接

### 设置

在"设置"页面可以配置：
- 字符编码（UTF-8、GBK、ASCII）
- 默认显示模式（文本/Hex）
- 连接超时时间

## 开发指南

### 添加新功能

1. 在 `src/components/` 中创建新的 Vue 组件
2. 在 `src/stores/` 中添加 Pinia 状态管理
3. 在 `src/types/` 中定义 TypeScript 类型
4. 更新路由配置和导航

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 Vue 3 Composition API 规范
- 组件采用单文件组件（.vue）格式
- 样式使用 CSS Variables 进行主题管理

## 许可证

ISC
