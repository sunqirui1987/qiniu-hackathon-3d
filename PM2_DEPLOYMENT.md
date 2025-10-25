# PM2 后端部署指南

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
- **实例数**: 2（集群模式）
- **执行模式**: `cluster`（负载均衡）
- **内存限制**: 500MB 自动重启
- **日志**: 存储在 `./logs/` 目录

## 部署命令

### 开发环境

启动服务（开发模式）：
```bash
npm run pm2:start
```

### 生产环境

启动服务（生产模式）：
```bash
npm run pm2:start:prod
```

## 管理命令

### 查看状态
```bash
npm run pm2:status
```

### 停止服务
```bash
npm run pm2:stop
```

### 重启服务
```bash
npm run pm2:restart
```

### 重载服务（零宕机）
```bash
npm run pm2:reload
```

### 删除服务
```bash
npm run pm2:delete
```

### 查看日志
```bash
npm run pm2:logs
```

### 实时监控
```bash
npm run pm2:monit
```

## 高级功能

### 查看详细信息
```bash
pm2 show auth-server
```

### 查看特定日志文件
- 错误日志: `./logs/auth-server-error.log`
- 输出日志: `./logs/auth-server-out.log`

### 保存 PM2 进程列表
```bash
pm2 save
```

### 设置开机自启动
```bash
pm2 startup
pm2 save
```

### 更新 PM2
```bash
pm2 update
```

## 环境配置

### 开发环境 (env)
- `NODE_ENV`: development
- `AUTH_PORT`: 3001

### 生产环境 (env_production)
- `NODE_ENV`: production
- `AUTH_PORT`: 3001

可以通过修改 `ecosystem.config.cjs` 文件来调整配置。

## 集群模式

当前配置使用 2 个实例运行在集群模式下，这样可以：
- 提高性能和吞吐量
- 利用多核 CPU
- 提供零宕机重载
- 自动负载均衡

如需调整实例数，编辑 `ecosystem.config.cjs` 中的 `instances` 字段。

## 监控和日志

### 日志管理
- 所有日志自动合并（`merge_logs: true`）
- 日志格式包含时间戳
- 错误和输出分别记录

### 自动重启策略
- 内存超过 500MB 时自动重启
- 最多连续重启 10 次
- 最小运行时间 10 秒（避免快速崩溃循环）

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

### 重启失败的实例
```bash
pm2 restart auth-server
```

### 完全删除并重新启动
```bash
pm2 delete auth-server
npm run pm2:start:prod
```

## 性能优化

### 调整实例数
根据 CPU 核心数调整：
```javascript
instances: 'max', // 使用所有可用 CPU 核心
// 或
instances: 4, // 固定 4 个实例
```

### 调整内存限制
```javascript
max_memory_restart: '1G', // 增加到 1GB
```

## 部署最佳实践

1. **环境隔离**: 使用不同的环境配置（开发/生产）
2. **日志监控**: 定期检查日志文件
3. **资源监控**: 使用 `pm2 monit` 监控 CPU 和内存
4. **备份配置**: 保存 PM2 配置 (`pm2 save`)
5. **开机启动**: 配置系统启动时自动启动服务
6. **滚动更新**: 使用 `pm2 reload` 实现零宕机部署

## 相关文档

- [AUTH_README.md](./AUTH_README.md) - 认证服务器设置指南
- [AUTH_API.md](./AUTH_API.md) - API 文档
- [PM2 官方文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
