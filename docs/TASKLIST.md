# 3D生成打印平台 - 任务清单

## 📋 项目概述
基于Vue3的AI驱动3D生成打印平台，集成Meshy.ai生成服务和Bambu Connect打印服务。本文档按模块划分任务，支持团队并行开发。

---

## 🎯 模块划分与任务分解

### 模块1: 核心UI框架层 🔴 最高优先级
**负责团队**: Team A (2人) | **工作量**: 5-7天

#### 1.1 项目初始化
- [ ] 使用Vite创建Vue3 + TypeScript项目
- [ ] 配置Vite构建工具 (vite.config.ts)
- [ ] 配置TypeScript编译选项 (tsconfig.json)
- [ ] 配置Tailwind CSS框架
- [ ] 配置ESLint + Prettier代码规范
- [ ] 设置项目目录结构 (src/components, views, composables等)

#### 1.2 路由系统
- [ ] 安装配置Vue Router 4.x
- [ ] 创建路由配置文件 (src/router/index.ts)
- [ ] 实现5个主要路由:
  - [ ] `/` - 主页面 (Home.vue)
  - [ ] `/generate` - 3D生成页面 (Generate.vue)
  - [ ] `/viewer` - 3D查看器 (Viewer.vue)
  - [ ] `/print` - 打印管理 (Print.vue)
  - [ ] `/library` - 模型库 (Library.vue)
- [ ] 实现路由守卫和导航逻辑

#### 1.3 通用组件库
- [ ] 创建基础UI组件 (src/components/ui/)
  - [ ] Button.vue - 通用按钮组件
  - [ ] Modal.vue - 模态框组件
  - [ ] ProgressBar.vue - 进度条组件
  - [ ] Toast.vue - 通知提示组件
  - [ ] Card.vue - 卡片容器组件
- [ ] 实现组件样式系统 (Tailwind CSS)
- [ ] 编写组件TypeScript类型定义

#### 1.4 状态管理基础
- [ ] 安装配置Pinia
- [ ] 创建基础Store结构
  - [ ] src/stores/ui.ts - UI状态管理
  - [ ] src/stores/model.ts - 模型数据管理
  - [ ] src/stores/print.ts - 打印任务管理

#### 1.5 主布局实现
- [ ] 创建App.vue根组件
- [ ] 实现主导航布局
- [ ] 实现响应式侧边栏
- [ ] 实现页面过渡动画

---

### 模块2: 3D生成服务 🔴 高优先级
**负责团队**: Team B (2人) | **工作量**: 7-10天

#### 2.1 Meshy.ai API集成
- [ ] 创建API客户端封装 (src/utils/meshyClient.ts)
- [ ] 实现API认证机制
- [ ] 实现Text-to-3D接口
- [ ] 实现Image-to-3D接口
- [ ] 实现任务轮询机制
- [ ] 处理API错误和重试逻辑

#### 2.2 生成Composable函数
- [ ] 实现useTextTo3D.ts
  - [ ] generateModel方法
  - [ ] 进度追踪 (progress ref)
  - [ ] 状态管理 (idle/generating/completed/error)
- [ ] 实现useImageTo3D.ts
  - [ ] generateFromImage方法
  - [ ] 图片预处理和上传
  - [ ] 生成参数配置
- [ ] 实现useMeshyTask.ts
  - [ ] 任务创建
  - [ ] 任务状态查询
  - [ ] 任务结果获取

#### 2.3 生成页面组件
- [ ] 创建Generate.vue页面
- [ ] 实现TextInput组件 (src/components/forms/TextInput.vue)
  - [ ] 文本提示词输入框
  - [ ] 高级参数设置
  - [ ] 预设提示词模板
- [ ] 实现ImageUpload组件 (src/components/forms/ImageUpload.vue)
  - [ ] 图片上传拖拽区域
  - [ ] 图片预览
  - [ ] 格式验证
- [ ] 实现GenerateProgress组件
  - [ ] 实时进度显示
  - [ ] 预览生成中间结果
  - [ ] 取消生成功能

#### 2.4 生成状态管理
- [ ] 扩展ModelStore (src/stores/model.ts)
  - [ ] generateTasks数组
  - [ ] currentModel状态
  - [ ] modelHistory历史记录
- [ ] 实现任务队列管理
- [ ] 实现生成结果缓存

#### 2.5 错误处理与优化
- [ ] 实现API错误提示
- [ ] 实现生成失败重试机制
- [ ] 实现生成任务取消功能
- [ ] 优化网络请求性能

---

### 模块3: 3D查看器 🟡 中高优先级
**负责团队**: Team C (2人) | **工作量**: 8-12天

#### 3.1 Babylon.js引擎集成
- [ ] 安装@babylonjs/core和@babylonjs/loaders
- [ ] 创建use3D.ts Composable
  - [ ] initViewer方法 - 初始化引擎
  - [ ] loadModel方法 - 加载3D模型
  - [ ] exportSTL方法 - 导出STL格式
  - [ ] Scene/Camera/Light管理
- [ ] 实现引擎生命周期管理 (onMounted/onUnmounted)

#### 3.2 3D查看器组件
- [ ] 创建Babylon3DViewer.vue (src/components/3d/)
  - [ ] Canvas画布渲染
  - [ ] 场景初始化
  - [ ] 相机控制 (ArcRotateCamera)
  - [ ] 灯光设置
- [ ] 实现模型加载逻辑
  - [ ] 支持GLB/GLTF格式
  - [ ] 支持STL格式
  - [ ] 支持OBJ格式
- [ ] 实现模型显示优化
  - [ ] 自动缩放和居中
  - [ ] LOD (Level of Detail)
  - [ ] 纹理压缩

#### 3.3 交互控制组件
- [ ] 创建ModelControls.vue
  - [ ] 缩放控制 (Zoom In/Out)
  - [ ] 旋转控制 (Rotate X/Y/Z)
  - [ ] 平移控制 (Pan)
  - [ ] 重置视图
- [ ] 创建PropertyPanel.vue
  - [ ] 模型信息显示 (尺寸、三角面数等)
  - [ ] 材质属性编辑
  - [ ] 变换参数调整

#### 3.4 Viewer页面实现
- [ ] 创建Viewer.vue页面
- [ ] 集成Babylon3DViewer组件
- [ ] 集成ModelControls组件
- [ ] 集成PropertyPanel组件
- [ ] 实现全屏查看模式

#### 3.5 模型导入导出
- [ ] 实现模型文件导入
  - [ ] 本地文件选择
  - [ ] 拖拽上传
  - [ ] 格式验证
- [ ] 实现模型导出功能
  - [ ] 导出STL格式 (用于打印)
  - [ ] 导出GLB格式
  - [ ] 导出OBJ格式

---

### 模块4: 打印管理 🟡 中优先级
**负责团队**: Team D (1-2人) | **工作量**: 6-8天

#### 4.1 Bambu Connect集成
- [ ] 创建LocalBambuConnector类 (src/utils/bambuConnector.ts)
  - [ ] URL Scheme实现 (bambustudio://)
  - [ ] 检查Bambu Connect安装状态
  - [ ] sendToPrint方法实现
- [ ] 创建useBambu.ts Composable
  - [ ] sendToPrint函数封装
  - [ ] checkBambuConnect状态检查
  - [ ] 打印参数配置

#### 4.2 打印组件开发
- [ ] 创建BambuConnector.vue (src/components/print/)
  - [ ] Bambu Connect连接状态显示
  - [ ] 打印机选择
  - [ ] 打印参数设置 (材料、层高、填充率等)
- [ ] 创建PrintQueue.vue
  - [ ] 打印队列列表
  - [ ] 任务优先级管理
  - [ ] 批量打印功能
- [ ] 创建PrintStatus.vue
  - [ ] 当前打印任务状态
  - [ ] 打印进度显示
  - [ ] 打印完成通知

#### 4.3 Print页面实现
- [ ] 创建Print.vue页面
- [ ] 集成BambuConnector组件
- [ ] 集成PrintQueue组件
- [ ] 集成PrintStatus组件
- [ ] 实现发送打印功能

#### 4.4 格式转换
- [ ] 实现GLB/GLTF转STL (使用Babylon.js导出)
- [ ] 实现OBJ转STL
- [ ] 实现3MF格式支持 (Bambu Studio原生格式)

#### 4.5 打印状态管理
- [ ] 扩展PrintStore (src/stores/print.ts)
  - [ ] printQueue队列管理
  - [ ] currentPrintJob当前任务
  - [ ] bambuConnected连接状态
- [ ] 实现打印任务持久化 (localStorage)

---

### 模块5: 模型库管理 🟢 中低优先级
**负责团队**: Team E (1人) | **工作量**: 5-7天

#### 5.1 文件管理系统
- [ ] 创建useFileManager.ts Composable
  - [ ] 本地文件系统访问
  - [ ] 文件读取/写入
  - [ ] 文件删除/重命名
- [ ] 实现模型文件索引
  - [ ] 文件元数据管理 (名称、大小、创建时间)
  - [ ] 缩略图生成和缓存
  - [ ] 文件分类和标签

#### 5.2 模型库组件
- [ ] 创建ModelLibrary.vue (src/components/library/)
  - [ ] 模型卡片网格布局
  - [ ] 缩略图显示
  - [ ] 模型基本信息显示
- [ ] 创建ModelCard.vue
  - [ ] 缩略图预览
  - [ ] 快速操作按钮 (查看、打印、删除)
  - [ ] 模型详情弹窗

#### 5.3 Library页面实现
- [ ] 创建Library.vue页面
- [ ] 集成ModelLibrary组件
- [ ] 实现搜索功能
  - [ ] 按名称搜索
  - [ ] 按日期过滤
  - [ ] 按标签过滤
- [ ] 实现排序功能 (时间、名称、大小)

#### 5.4 批量操作
- [ ] 实现多选功能
- [ ] 实现批量删除
- [ ] 实现批量导出
- [ ] 实现批量打印

#### 5.5 数据持久化
- [ ] 实现IndexedDB存储
- [ ] 实现云端同步 (可选)
- [ ] 实现导入/导出库功能

---

### 模块6: 页面组装与集成 🟢 低优先级
**负责团队**: 各模块团队协作 | **工作量**: 4-6天

#### 6.1 Home页面开发
- [ ] 创建Home.vue页面
- [ ] 实现快速导航卡片
- [ ] 实现最近生成模型展示
- [ ] 实现快速开始功能

#### 6.2 页面间路由整合
- [ ] 实现Generate → Viewer流程
- [ ] 实现Viewer → Print流程
- [ ] 实现Library → Viewer/Print流程
- [ ] 实现页面间数据传递

#### 6.3 全局功能集成
- [ ] 实现全局搜索功能
- [ ] 实现用户设置页面
- [ ] 实现主题切换 (亮/暗模式)
- [ ] 实现快捷键支持

#### 6.4 响应式适配
- [ ] 桌面端布局优化 (1920x1080+)
- [ ] 平板端布局适配 (768-1024px)
- [ ] 移动端基本支持 (可选)

---

## 🔄 开发时间线

### 阶段1: 基础框架 (Week 1-2)
- 模块1完成 → **里程碑M1**: 基础框架可运行

### 阶段2: 核心功能并行开发 (Week 2-4)
- 模块2、模块3、模块5并行开发
- **里程碑M2**: 可生成3D模型
- **里程碑M3**: 可查看3D模型
- **里程碑M5**: 可管理模型库

### 阶段3: 打印集成 (Week 4-5)
- 模块4开发
- **里程碑M4**: 可打印模型

### 阶段4: 页面组装 (Week 5-6)
- 模块6开发
- **里程碑M6**: 完整应用可用

### 阶段5: 测试优化 (Week 6-8)
- 集成测试
- 性能优化
- Bug修复
- 用户体验优化

---

## 📋 技术接口规范

### TypeScript类型定义

#### Model3D类型
```typescript
// types/model.ts
export interface Model3D {
  id: string
  name: string
  url: string
  format: '3mf' | 'stl' | 'obj' | 'glb' | 'gltf'
  createdAt: Date
  updatedAt: Date
  thumbnail?: string
  size?: number // 文件大小 (bytes)
  metadata?: {
    vertices: number
    faces: number
    materials: number
  }
}
```

#### GenerateTask类型
```typescript
// types/generate.ts
export interface GenerateTask {
  id: string
  type: 'text-to-3d' | 'image-to-3d'
  status: 'pending' | 'preview' | 'refine' | 'completed' | 'failed'
  progress: number
  prompt?: string
  imageUrl?: string
  result?: Model3D
  error?: string
  createdAt: Date
}

export interface GenerateOptions {
  artStyle?: string
  targetPolycount?: number
  enablePBR?: boolean
  seed?: number
}
```

#### PrintJob类型
```typescript
// types/print.ts
export interface PrintJob {
  id: string
  modelId: string
  modelName: string
  status: 'pending' | 'printing' | 'completed' | 'failed'
  progress: number
  settings: PrintSettings
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

export interface PrintSettings {
  printer: string
  material: string
  layerHeight: number
  infillDensity: number
  supports: boolean
  temperature?: number
}
```

### Composable函数接口

#### useGenerate
```typescript
export function useTextTo3D() {
  const generateModel: (prompt: string, options?: GenerateOptions) => Promise<Model3D>
  const progress: Ref<number>
  const status: Ref<'idle' | 'generating' | 'completed' | 'error'>
  const error: Ref<string | null>
  
  return { generateModel, progress, status, error }
}
```

#### use3D
```typescript
export function use3DViewer(canvasRef: Ref<HTMLCanvasElement>) {
  const scene: Ref<Scene | null>
  const camera: Ref<Camera | null>
  
  const initViewer: () => void
  const loadModel: (url: string) => Promise<void>
  const exportSTL: () => Blob
  const exportGLB: () => Blob
  
  return { scene, camera, initViewer, loadModel, exportSTL, exportGLB }
}
```

#### useBambu
```typescript
export function useBambuConnect() {
  const connected: Ref<boolean>
  const printers: Ref<string[]>
  
  const checkBambuConnect: () => Promise<boolean>
  const sendToPrint: (modelPath: string, settings: PrintSettings) => Promise<Result>
  const getPrinters: () => Promise<string[]>
  
  return { connected, printers, checkBambuConnect, sendToPrint, getPrinters }
}
```

### Pinia Store接口

#### ModelStore
```typescript
export const useModelStore = defineStore('model', () => {
  const currentModel: Ref<Model3D | null>
  const modelHistory: Ref<Model3D[]>
  const generateTasks: Ref<GenerateTask[]>
  
  const addModel: (model: Model3D) => void
  const removeModel: (id: string) => void
  const getModelById: (id: string) => Model3D | undefined
  
  return { currentModel, modelHistory, generateTasks, addModel, removeModel, getModelById }
})
```

#### PrintStore
```typescript
export const usePrintStore = defineStore('print', () => {
  const printQueue: Ref<PrintJob[]>
  const currentPrintJob: Ref<PrintJob | null>
  const bambuConnected: Ref<boolean>
  
  const addPrintJob: (job: PrintJob) => void
  const removePrintJob: (id: string) => void
  const updateJobStatus: (id: string, status: PrintJob['status']) => void
  
  return { printQueue, currentPrintJob, bambuConnected, addPrintJob, removePrintJob, updateJobStatus }
})
```

---

## 📝 Git分支策略

### 分支命名规范
```
main (保护分支)
├── feature/module-1-ui-framework
│   ├── feat/setup-vite-config
│   ├── feat/router-system
│   ├── feat/ui-components
│   └── feat/main-layout
├── feature/module-2-ai-generation
│   ├── feat/meshy-api-integration
│   ├── feat/generate-components
│   ├── feat/text-to-3d
│   └── feat/image-to-3d
├── feature/module-3-3d-viewer
│   ├── feat/babylon-setup
│   ├── feat/viewer-component
│   ├── feat/viewer-controls
│   └── feat/model-export
├── feature/module-4-print-management
│   ├── feat/bambu-integration
│   ├── feat/print-components
│   └── feat/format-conversion
├── feature/module-5-library
│   ├── feat/file-manager
│   ├── feat/library-components
│   └── feat/search-filter
└── feature/module-6-pages
    ├── feat/home-page
    └── feat/page-integration
```

### 提交信息规范
```
feat: 新功能
fix: Bug修复
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具变动

示例:
feat(module-2): implement text-to-3d generation
fix(module-3): resolve babylon.js memory leak
docs(module-1): add component usage examples
```

---

## ✅ 验收标准

### 模块1验收
- [ ] 项目可成功启动 (npm run dev)
- [ ] 5个路由正常访问
- [ ] 通用组件可复用
- [ ] 无TypeScript错误

### 模块2验收
- [ ] 文本生成3D模型成功
- [ ] 图片生成3D模型成功
- [ ] 进度实时更新
- [ ] 错误处理完善

### 模块3验收
- [ ] 可正常加载和显示3D模型
- [ ] 交互控制流畅 (旋转、缩放、平移)
- [ ] 可导出STL/GLB格式
- [ ] 无明显性能问题

### 模块4验收
- [ ] Bambu Connect连接正常
- [ ] 可发送模型到打印机
- [ ] 打印队列管理正常
- [ ] 格式转换正确

### 模块5验收
- [ ] 可查看模型库列表
- [ ] 搜索和过滤功能正常
- [ ] 批量操作无误
- [ ] 数据持久化可靠

### 模块6验收
- [ ] 所有页面集成完整
- [ ] 页面间导航流畅
- [ ] 响应式布局正常
- [ ] 整体用户体验良好

---

## 🎯 团队协作建议

### 团队分工
- **Team A (2人)**: 模块1 - UI框架
- **Team B (2人)**: 模块2 - AI生成
- **Team C (2人)**: 模块3 - 3D查看器
- **Team D (1-2人)**: 模块4 - 打印管理
- **Team E (1人)**: 模块5 - 模型库

### 每日站会
- 每日同步进度
- 讨论技术难点
- 解决跨模块依赖问题

### 代码评审
- 每个PR至少1人评审
- 关注代码规范和类型安全
- 测试覆盖率检查

### 文档维护
- API接口变更及时更新文档
- 组件使用示例完善
- 问题和解决方案记录

---

## 📚 参考文档

### 项目文档
- [产品需求文档](./3D生成打印平台产品需求文档.md)
- [技术架构文档](./3D生成打印平台技术架构文档.md)
- [API接口设计文档](./API接口设计文档.md)
- [UI界面设计文档](./UI界面设计文档.md)
- [Vue3技术栈说明](../claude.md)
- [架构文档优化总结](./架构文档优化总结.md)

### 外部资源
- [Vue3官方文档](https://vuejs.org/)
- [Babylon.js文档](https://doc.babylonjs.com/)
- [Meshy.ai API文档](https://docs.meshy.ai/)
- [Bambu Connect文档](https://wiki.bambulab.com/en/software/bambu-studio/virtual-machine)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [Pinia文档](https://pinia.vuejs.org/)

---

**最后更新**: 2025-10-24
**版本**: v1.0
**维护者**: xgopilot
