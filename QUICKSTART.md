# UDP/TCP 协议测试工具 - 快速开始指南

## 问题解决

你遇到的错误是因为：
1. `dist/index.html` 文件不存在
2. `dist-electron/` 目录不存在

## 解决方法

### 方法一：使用开发模式（推荐）

```bash
# 1. 安装依赖
yarn install
# 或
npm install

# 2. 启动开发服务器（Vite 会自动启动 Electron）
yarn dev
```

`vite-plugin-electron` 会自动：
- 启动 Vite 开发服务器
- 编译 Electron 主进程代码
- 自动启动 Electron 应用

### 方法二：先构建再运行

```bash
# 1. 安装依赖
yarn install

# 2. 构建前端和 Electron 代码
yarn build

# 3. 启动 Electron
yarn start:electron
```

### 方法三：使用完整开发脚本

```bash
# 1. 安装依赖
yarn install

# 2. 启动完整的开发环境
yarn dev:full
```

## 常见问题

### 1. "preload script must have absolute path" 错误

这是正常的警告，Vite 会在运行时自动处理。确保：
- `dist-electron/preload.js` 文件存在
- Vite 开发服务器正在运行

### 2. "ERR_FILE_NOT_FOUND" 错误

这意味着 `dist/index.html` 不存在。解决方法：

**选项 A**：使用 `yarn dev` 而不是 `yarn electron:dev`

**选项 B**：先运行 `yarn build`

### 3. Electron 无法连接到 Vite 服务器

确保 Vite 服务器正在运行，并且 `VITE_DEV_SERVER_URL` 环境变量已设置。

## 开发命令

```bash
# 安装依赖
yarn install

# 启动开发服务器（推荐）
yarn dev

# 仅启动 Vite（不启动 Electron）
yarn start:vite

# 单独启动 Electron
yarn start:electron

# 构建生产版本
yarn build

# 构建 Electron 应用
yarn electron:build
```

## 项目结构

```
udp-tcp-tester/
├── dist/                    # 编译后的前端代码
│   └── index.html
├── dist-electron/           # 编译后的 Electron 代码
│   ├── main.js
│   └── preload.js
├── electron/               # Electron 源代码
│   ├── main.ts
│   └── preload.ts
├── src/                    # Vue 应用源代码
├── package.json
└── vite.config.ts
```

## 技术栈

- **Electron**: 28.0.0
- **Vue**: 3.4+
- **Vite**: 5.x
- **vite-plugin-electron**: 自动处理 Electron 开发环境

## 下一步

1. 运行 `yarn install` 安装依赖
2. 运行 `yarn dev` 启动应用
3. 应用将自动打开 Electron 窗口

如果还有问题，请查看 GitHub issues 或提交新的 issue。
