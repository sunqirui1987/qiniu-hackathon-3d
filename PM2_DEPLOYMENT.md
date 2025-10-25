# PM2 生产环境部署指南

本文档介绍如何使用 PM2 部署和管理认证后端服务。

## 前置条件

1. 安装 PM2（如果尚未全局安装）：
```bash
npm install -g pm2
```

2. 安装项目依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp .env.auth.example .env.auth
# 编辑 .env.auth 文件，设置生产环境配置
```

## PM2 配置文件

项目包含 `ecosystem.config.cjs` 配置文件，定义了以下设置：

- **应用名称**: `auth-server`
- **脚本**: `./auth-server.js`
- **运行时**: 支持 Node.js 和 Bun（通过 `PM2_INTERPRETER` 环境变量）
- **实例数**: 2（集群模式，负载均衡）
- **内存限制**: 500MB 自动重启
- **日志**: 存储在 `./logs/` 目录

## 部署命令

### 使用 Node.js 启动（默认）
```bash
npm run pm2:start
```

### 使用 Bun 启动
```bash
PM2_INTERPRETER=bun npm run pm2:start
```

### 停止服务并删除PM2实例
```bash
npm run pm2:stop
```

### 热更新服务（零停机时间）
```bash
npm run pm2:reload
```

### 查看状态
```bash
npm run pm2:status
```

### 查看日志
```bash
npm run pm2:logs
```

## 测试环境

测试环境建议直接使用 Node.js 或 Bun 运行，无需 PM2：

```bash
# 使用 Node.js
npm run auth-server

# 使用 Bun
npm run auth-server:bun
```

## 集群模式

当前配置使用 2 个实例运行在集群模式下，提供：
- 提高性能和吞吐量
- 利用多核 CPU
- 自动负载均衡
- 零停机时间热更新（通过 `pm2:reload`）

如需调整实例数，编辑 `ecosystem.config.cjs` 中的 `instances` 字段。

## 热更新 vs 重启

### 热更新 (Reload)
```bash
npm run pm2:reload
```
- 零停机时间更新
- 逐个重启实例，确保始终有实例在运行
- 适合生产环境代码更新

### 重启 (Restart)
```bash
pm2 restart auth-server
```
- 所有实例同时重启
- 可能造成短暂服务中断
- 适合配置更改或故障恢复

## 监控和日志

### 日志管理
- 错误日志: `./logs/auth-server-error.log`
- 输出日志: `./logs/auth-server-out.log`
- 所有日志自动合并并包含时间戳

### 自动重启策略
- 内存超过 500MB 时自动重启
- 最多连续重启 10 次
- 最小运行时间 10 秒

## 故障排查

### 检查服务状态
```bash
pm2 list
pm2 show auth-server
```

### 查看实时日志
```bash
pm2 logs auth-server --lines 100
```

### 重启服务
```bash
pm2 restart auth-server
```

### 完全删除并重新启动
```bash
pm2 delete auth-server
npm run pm2:start
```

## 开机自启动

```bash
pm2 startup
pm2 save
```

## 相关文档

- [AUTH_README.md](./AUTH_README.md) - 认证服务器设置指南
- [AUTH_API.md](./AUTH_API.md) - API 文档
- [PM2 官方文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
