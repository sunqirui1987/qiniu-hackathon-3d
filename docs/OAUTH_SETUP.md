# OAuth 登录集成设置指南

本项目已集成GitHub和Google OAuth第三方登录功能。由于这是前端项目,需要配置后端服务来处理OAuth流程。

## 前端已完成

✅ OAuth登录按钮组件 (`src/components/ui/OAuthButtons.vue`)  
✅ 登录页面 (`src/views/Login.vue`)  
✅ OAuth回调处理页面 (`src/views/AuthCallback.vue`)  
✅ 认证Store (`src/stores/auth.ts`)  
✅ 路由守卫配置 (`src/router/guards.ts`)  
✅ 用户信息显示和退出登录  

## 需要的后端服务

您需要创建一个后端服务来处理OAuth授权流程。参考技术文档 `docs/用户认证服务技术调研报告.md` 第4章节的完整实现方案。

### 方案选择

#### 选项1: Node.js + Express后端 (推荐)
完整的实现代码在技术文档的第4.1节。

**关键端点**:
- `GET /auth/:provider` - 发起OAuth授权
- `GET /auth/:provider/callback` - 处理OAuth回调
- `GET /auth/me` - 获取当前用户信息

#### 选项2: 使用Serverless函数
可以使用Vercel/Netlify Functions或AWS Lambda来实现OAuth流程。

#### 选项3: 使用Supabase
Supabase提供开箱即用的OAuth支持,无需自建后端。

## OAuth应用注册

### GitHub OAuth应用

1. 访问 https://github.com/settings/developers
2. 点击"New OAuth App"
3. 填写信息:
   - Application name: `3D生成打印平台`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. 获取Client ID和Client Secret

### Google OAuth应用

1. 访问 https://console.cloud.google.com/
2. 创建新项目
3. 启用Google+ API
4. 创建OAuth 2.0客户端ID:
   - 应用类型: Web应用
   - 授权的重定向URI: `http://localhost:3000/auth/google/callback`
5. 获取客户端ID和客户端密钥

## 环境变量配置

### 前端 (.env)
```
VITE_API_BASE_URL=http://localhost:3000
```

### 后端 (.env)
```
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_very_long_and_random_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Database (if using MongoDB)
MONGODB_URI=mongodb://localhost:27017/qiniu-3d-platform
```

## 快速开始

### 1. 使用模拟后端进行测试

可以创建一个简单的模拟服务器用于开发测试:

```javascript
// mock-server.js
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

app.get('/auth/:provider', (req, res) => {
  // 模拟OAuth授权 - 实际应用中这里应该重定向到OAuth提供商
  const mockUser = {
    id: '123456',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://avatars.githubusercontent.com/u/123456',
    provider: req.params.provider
  }
  
  const mockToken = 'mock_jwt_token_' + Date.now()
  
  // 重定向回前端
  const redirectUrl = `http://localhost:5173/auth/callback?token=${mockToken}&user=${encodeURIComponent(JSON.stringify(mockUser))}`
  res.redirect(redirectUrl)
})

app.listen(3000, () => {
  console.log('Mock OAuth server running on http://localhost:3000')
})
```

运行: `node mock-server.js`

### 2. 使用完整后端实现

参考 `docs/用户认证服务技术调研报告.md` 第4章节,实现完整的OAuth后端服务。

## 测试OAuth登录

1. 启动后端服务: `npm run dev` (或 `node mock-server.js`)
2. 启动前端服务: `npm run dev`
3. 访问 http://localhost:5173
4. 点击"使用GitHub登录"或"使用Google登录"
5. 完成授权后会自动跳转回应用

## 生产环境部署

1. 更新OAuth应用的回调URL为生产域名
2. 设置正确的环境变量
3. 启用HTTPS
4. 配置CORS策略
5. 实现Token刷新机制

## 安全注意事项

- ✅ 永远不要在前端暴露Client Secret
- ✅ 使用HTTPS传输
- ✅ 实现CSRF防护(state参数)
- ✅ 设置合理的Token过期时间
- ✅ 实现Token黑名单机制
- ✅ 验证Redirect URI

## 故障排除

### 问题: 点击登录按钮没有反应
检查:
- 后端服务是否启动
- VITE_API_BASE_URL环境变量是否正确配置
- 浏览器控制台是否有CORS错误

### 问题: 授权后无法跳转回应用
检查:
- OAuth应用的回调URL是否正确配置
- 后端重定向URL是否正确
- Token和用户信息是否正确传递

## 更多信息

详细的技术实现、安全最佳实践、性能优化等内容,请参阅:
- 📄 `docs/用户认证服务技术调研报告.md`
