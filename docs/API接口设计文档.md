# API 接口设计文档

## 1. 概述

本文档详细描述了 3D 生成打印平台的 API 接口设计，包括 Meshy.ai 3D 生成服务和 Bambu Connect 3D 打印集成的完整方案。

### 1.1 更新说明

**2024年版本更新：**
- 采用 Bambu Connect 作为打印机连接方案，替代直接 API 调用<mcreference link="https://wiki.bambulab.com/zh/software/bambu-connect" index="1">1</mcreference>
- 支持 URL Scheme 集成方式，简化用户操作流程
- 提供多种连接模式：LAN 模式、Cloud 模式、Developer 模式
- 增强安全性：通过用户手动确认和 PIN 码验证保证打印安全

## 2. 认证与安全

### 2.1 Meshy.ai 认证
所有 Meshy.ai API 请求都需要在 Header 中包含 Bearer Token：
```http
Authorization: Bearer YOUR_MESHY_API_KEY
```

### 2.2 Bambu Connect 集成
Bambu Connect 使用 URL Scheme 进行集成，无需 API 认证。安全性通过以下方式保证：
- 用户在 Bambu Connect 应用中手动确认打印操作
- 支持 PIN 码绑定验证打印机身份
- 文件传输通过本地文件系统进行，确保数据安全

## 3. Meshy.ai API 接口

### 3.1 Text-to-3D API

#### 3.1.1 创建预览任务
**端点：** `POST https://api.meshy.ai/openapi/v2/text-to-3d`

**请求参数：**
```json
{
  "mode": "preview",
  "prompt": "描述3D模型的文本提示词",
  "negative_prompt": "不希望出现的特征描述",
  "art_style": "realistic",
  "ai_model": "latest",
  "topology": "triangle",
  "target_polycount": 30000,
  "should_remesh": true,
  "symmetry_mode": "auto",
  "is_a_t_pose": false,
  "seed": 12345,
  "moderation": false
}
```

**参数说明：**
- `mode`: 固定为 "preview"
- `prompt`: 3D模型描述，最大600字符
- `negative_prompt`: 负面提示词（可选）
- `art_style`: "realistic" 或 "sculpture"
- `ai_model`: "meshy-4", "meshy-5", "latest"
- `topology`: "triangle" 或 "quad"
- `target_polycount`: 目标多边形数量（100-300,000）
- `should_remesh`: 是否启用重网格化
- `symmetry_mode`: "off", "auto", "on"
- `is_a_t_pose`: 是否生成 A/T 姿势
- `seed`: 随机种子（可选）
- `moderation`: 是否启用内容审核

**响应：**
```json
{
  "result": "019a1558-97e9-706d-a24f-a1a0dfe1d955"
}
```

#### 3.1.2 创建精细化任务
**端点：** `POST https://api.meshy.ai/openapi/v2/text-to-3d`

**请求参数：**
```json
{
  "mode": "refine",
  "preview_task_id": "019a1558-97e9-706d-a24f-a1a0dfe1d955",
  "enable_pbr": false,
  "texture_prompt": "纹理描述",
  "texture_image_url": "data:image/jpeg;base64,..."
}
```

**参数说明：**
- `mode`: 固定为 "refine"
- `preview_task_id`: 预览任务ID
- `enable_pbr`: 是否生成PBR贴图
- `texture_prompt`: 纹理描述（可选）
- `texture_image_url`: 纹理图片URL或Data URI（可选）

#### 3.1.3 查询任务状态
**端点：** `GET https://api.meshy.ai/openapi/v2/text-to-3d/{task_id}`

**响应：**
```json
{
  "id": "019a1558-97e9-706d-a24f-a1a0dfe1d955",
  "status": "SUCCEEDED",
  "progress": 100,
  "model_urls": {
    "glb": "https://assets.meshy.ai/...",
    "fbx": "https://assets.meshy.ai/...",
    "obj": "https://assets.meshy.ai/...",
    "usdz": "https://assets.meshy.ai/..."
  },
  "thumbnail_url": "https://assets.meshy.ai/...",
  "created_at": "2024-01-01T00:00:00Z",
  "finished_at": "2024-01-01T00:05:00Z"
}
```

### 3.2 Image-to-3D API

#### 3.2.1 创建任务
**端点：** `POST https://api.meshy.ai/openapi/v1/image-to-3d`

**请求参数：**
```json
{
  "image_url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "ai_model": "latest",
  "topology": "triangle",
  "target_polycount": 30000,
  "symmetry_mode": "auto",
  "should_remesh": true,
  "should_texture": true,
  "enable_pbr": false,
  "is_a_t_pose": false,
  "texture_prompt": "高质量纹理",
  "moderation": false
}
```

**参数说明：**
- `image_url`: 图片URL或Data URI（支持.jpg, .jpeg, .png）
- 其他参数与 Text-to-3D 类似

#### 3.2.2 查询任务状态
**端点：** `GET https://api.meshy.ai/openapi/v1/image-to-3d/{task_id}`

响应格式与 Text-to-3D 相同。

### 3.3 文件上传 API

#### 3.3.1 上传图片
**端点：** `POST https://api.meshy.ai/web/v1/files/images?skipNameGeneration`

**请求头：**
```http
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
Authorization: Bearer YOUR_API_KEY
```

**请求体：**
```
------WebKitFormBoundary...
Content-Disposition: form-data; name="file"; filename="image.jpg"
Content-Type: image/jpeg

[二进制图片数据]
------WebKitFormBoundary...--
```

**响应：**
```json
{
  "url": "https://assets.meshy.ai/uploaded/...",
  "filename": "image.jpg"
}
```

### 3.4 用户信息 API

#### 3.4.1 获取用户信息
**端点：** `GET https://api.meshy.ai/web/v1/me/info`

**响应：**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "用户名",
  "avatar_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 3.4.2 获取积分信息
**端点：** `GET https://api.meshy.ai/web/v1/me/credits`

**响应：**
```json
{
  "credits": 1000,
  "used_credits": 50,
  "remaining_credits": 950
}
```

#### 3.4.3 获取用户等级
**端点：** `GET https://api.meshy.ai/web/v1/me/tier`

**响应：**
```json
{
  "tier": "pro",
  "features": ["text_to_3d", "image_to_3d", "api_access"],
  "limits": {
    "concurrent_tasks": 10,
    "monthly_credits": 10000
  }
}
```

## 4. Bambu Connect 集成方案

### 4.1 Vue3 + LocalBambuConnector 集成架构

基于Vue3技术栈，我们采用本地化URL Scheme方案，这是最简单且无需复杂SDK的方案。

#### 4.1.1 Vue3 Composable 设计

```typescript
// composables/useBambuConnect.ts
import { ref, reactive } from 'vue'

export interface BambuConnectState {
  isConnectInstalled: boolean
  connectVersion: string | null
  isConnecting: boolean
  lastError: string | null
}

export function useBambuConnect() {
  const state = reactive<BambuConnectState>({
    isConnectInstalled: false,
    connectVersion: null,
    isConnecting: false,
    lastError: null
  })

  const tempDir = ref('/tmp/bambu-files')

  /**
   * 检测 Bambu Connect 是否安装
   */
  const checkBambuConnect = async (): Promise<boolean> => {
    try {
      state.isConnecting = true
      state.lastError = null

      // 方法1: 尝试检测应用程序
      if (window.electron) {
        // Electron 环境下的检测
        state.isConnectInstalled = await window.electron.checkApp('bambu-connect')
      } else {
        // Web 环境下的检测（有限）
        state.isConnectInstalled = await detectByUrlScheme()
      }
      
      if (state.isConnectInstalled) {
        console.log('Bambu Connect 已安装')
      } else {
        console.warn('Bambu Connect 未检测到')
      }

      return state.isConnectInstalled
    } catch (error) {
      console.error('检测 Bambu Connect 时出错:', error)
      state.lastError = error instanceof Error ? error.message : '检测失败'
      state.isConnectInstalled = false
      return false
    } finally {
      state.isConnecting = false
    }
  }

  /**
   * 通过 URL Scheme 检测（Web 环境）
   */
  const detectByUrlScheme = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false)
      }, 2000)

      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = 'bambu-connect://ping'
      
      iframe.onload = () => {
        clearTimeout(timeout)
        document.body.removeChild(iframe)
        resolve(true)
      }

      iframe.onerror = () => {
        clearTimeout(timeout)
        document.body.removeChild(iframe)
        resolve(false)
      }

      document.body.appendChild(iframe)
    })
  }

  /**
   * 发送文件到 Bambu Connect 进行打印
   */
  const sendToPrint = async (filePath: string, fileName: string) => {
    if (!state.isConnectInstalled) {
      throw new Error('Bambu Connect 未安装，请先下载并安装 Bambu Connect')
    }

    try {
      state.isConnecting = true
      state.lastError = null

      // 验证文件路径
      if (!filePath || !fileName) {
        throw new Error('文件路径和文件名不能为空')
      }

      // 验证文件格式
      const supportedFormats = ['.gcode', '.3mf', '.gcode.3mf']
      const fileExtension = getFileExtension(filePath)
      if (!supportedFormats.includes(fileExtension)) {
        throw new Error(`不支持的文件格式: ${fileExtension}`)
      }

      // 编码参数
      const encodedPath = encodeURIComponent(filePath)
      const encodedName = encodeURIComponent(fileName)
      
      // 构建 URL Scheme
      const urlScheme = `bambu-connect://import-file?path=${encodedPath}&name=${encodedName}&version=1.0.0`
      
      console.log('调用 Bambu Connect:', urlScheme)
      
      // 调用 URL Scheme
      if (window.electron) {
        // Electron 环境
        await window.electron.openExternal(urlScheme)
      } else {
        // Web 环境
        window.location.href = urlScheme
      }

      return {
        success: true,
        message: '已发送到 Bambu Connect',
        urlScheme: urlScheme
      }

    } catch (error) {
      console.error('发送到 Bambu Connect 失败:', error)
      state.lastError = error instanceof Error ? error.message : '发送失败'
      throw error
    } finally {
      state.isConnecting = false
    }
  }

  /**
   * 模拟发现打印机功能
   */
  const discoverPrinters = async () => {
    if (!state.isConnectInstalled) {
      return []
    }
    
    // 在本地化方案中，打印机发现由 Bambu Connect 处理
    return [
      {
        id: 'bambu-connect-managed',
        name: '通过 Bambu Connect 管理的打印机',
        status: 'available',
        type: 'bambu-connect',
        description: '打印机管理由 Bambu Connect 应用程序处理'
      }
    ]
  }

  /**
   * 获取文件扩展名
   */
  const getFileExtension = (filePath: string): string => {
    if (filePath.endsWith('.gcode.3mf')) {
      return '.gcode.3mf'
    }
    return filePath.substring(filePath.lastIndexOf('.'))
  }

  /**
   * 获取 Bambu Connect 下载链接
   */
  const getBambuConnectDownloadUrl = (): string => {
    const platform = detectPlatform()
    const downloadUrls = {
      'windows': 'https://github.com/bambulab/BambuStudio/releases/latest/download/bambu-connect-win32-x64.exe',
      'macos-arm64': 'https://github.com/bambulab/BambuStudio/releases/latest/download/bambu-connect-darwin-arm64.dmg',
      'macos-x64': 'https://github.com/bambulab/BambuStudio/releases/latest/download/bambu-connect-darwin-x64.dmg',
      'linux': 'https://github.com/bambulab/BambuStudio/releases/latest'
    }
    
    return downloadUrls[platform] || downloadUrls['linux']
  }

  /**
   * 检测操作系统平台
   */
  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('win')) return 'windows'
    if (userAgent.includes('mac')) {
      return navigator.platform.includes('arm') ? 'macos-arm64' : 'macos-x64'
    }
    return 'linux'
  }

  return {
    state: readonly(state),
    tempDir,
    checkBambuConnect,
    sendToPrint,
    discoverPrinters,
    getBambuConnectDownloadUrl,
    detectPlatform
  }
}
```

#### 4.1.2 Vue3 组件使用示例

```vue
<!-- components/BambuConnectPanel.vue -->
<template>
  <div class="bambu-connect-panel">
    <div class="status-section">
      <h3>Bambu Connect 状态</h3>
      <div class="status-indicator" :class="statusClass">
        <Icon :name="statusIcon" />
        <span>{{ statusText }}</span>
      </div>
      
      <button 
        v-if="!bambuState.isConnectInstalled"
        @click="downloadBambuConnect"
        class="download-btn"
      >
        下载 Bambu Connect
      </button>
    </div>

    <div v-if="bambuState.isConnectInstalled" class="print-section">
      <h3>发送到打印机</h3>
      <button 
        @click="handleSendToPrint"
        :disabled="bambuState.isConnecting || !modelUrl"
        class="print-btn"
      >
        <Icon v-if="bambuState.isConnecting" name="loader" class="animate-spin" />
        {{ bambuState.isConnecting ? '发送中...' : '发送到 Bambu Connect' }}
      </button>
      
      <div v-if="bambuState.lastError" class="error-message">
        {{ bambuState.lastError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useBambuConnect } from '@/composables/useBambuConnect'
import Icon from '@/components/ui/Icon.vue'

interface Props {
  modelUrl?: string
  modelName?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelName: '3D模型'
})

const { 
  state: bambuState, 
  checkBambuConnect, 
  sendToPrint, 
  getBambuConnectDownloadUrl 
} = useBambuConnect()

const statusClass = computed(() => ({
  'status-connected': bambuState.isConnectInstalled,
  'status-disconnected': !bambuState.isConnectInstalled,
  'status-connecting': bambuState.isConnecting
}))

const statusIcon = computed(() => {
  if (bambuState.isConnecting) return 'loader'
  return bambuState.isConnectInstalled ? 'check-circle' : 'x-circle'
})

const statusText = computed(() => {
  if (bambuState.isConnecting) return '检测中...'
  return bambuState.isConnectInstalled ? '已安装' : '未安装'
})

const downloadBambuConnect = () => {
  const downloadUrl = getBambuConnectDownloadUrl()
  window.open(downloadUrl, '_blank')
}

const handleSendToPrint = async () => {
  if (!props.modelUrl) return
  
  try {
    await sendToPrint(props.modelUrl, props.modelName)
  } catch (error) {
    console.error('发送失败:', error)
  }
}

onMounted(() => {
  checkBambuConnect()
})
</script>
```
```

### 4.2 URL Scheme 集成方案

#### 4.2.1 基本语法
**URL Scheme：** `bambu-connect://import-file`

**必需参数：**
- `path`: 3MF文件的绝对路径（需要 encodeURIComponent 编码）<mcreference link="https://wiki.bambulab.com/zh/software/bambu-connect" index="1">1</mcreference>
- `name`: 文件名称（需要 encodeURIComponent 编码）
- `version`: 固定值 "1.0.0"，用于版本兼容性检查

#### 4.2.2 Vue3 Composable 使用示例
```typescript
// 在 Vue3 组件中使用
<script setup lang="ts">
import { useBambuConnect } from '@/composables/useBambuConnect'

const { sendToPrint, checkBambuConnect } = useBambuConnect()

// 发送模型到 Bambu Connect
const handlePrint = async () => {
  try {
    await sendToPrint('/tmp/generated_model.gcode.3mf', '可爱机器人')
  } catch (error) {
    console.error('打印失败:', error)
  }
}

// 检查 Bambu Connect 状态
onMounted(async () => {
  await checkBambuConnect()
})
</script>
```

#### 4.2.3 支持的文件格式
- **G-code 文件**：`.gcode`
- **3MF 文件**：`.3mf`（推荐）
- **组合格式**：`.gcode.3mf`（包含切片信息的3MF文件）

### 4.3 Vue3 集成架构设计

#### 4.3.1 Pinia Store 集成
```typescript
// stores/bambuConnect.ts
import { defineStore } from 'pinia'
import { useBambuConnect } from '@/composables/useBambuConnect'

export const useBambuConnectStore = defineStore('bambuConnect', () => {
  const bambuConnect = useBambuConnect()
  
  const printers = ref([])
  const currentPrintJob = ref(null)
  const printHistory = ref([])

  const initializeBambuConnect = async () => {
    await bambuConnect.checkBambuConnect()
    if (bambuConnect.state.isConnectInstalled) {
      printers.value = await bambuConnect.discoverPrinters()
    }
  }

  const sendModelToPrint = async (modelUrl: string, modelName: string) => {
    try {
      const result = await bambuConnect.sendToPrint(modelUrl, modelName)
      
      // 记录打印历史
      printHistory.value.unshift({
        id: Date.now().toString(),
        modelName,
        modelUrl,
        timestamp: new Date(),
        status: 'sent_to_bambu'
      })
      
      return result
    } catch (error) {
      console.error('发送到 Bambu Connect 失败:', error)
      throw error
    }
  }

  return {
    // State
    ...bambuConnect.state,
    printers,
    currentPrintJob,
    printHistory,
    
    // Actions
    initializeBambuConnect,
    sendModelToPrint,
    checkBambuConnect: bambuConnect.checkBambuConnect,
    getBambuConnectDownloadUrl: bambuConnect.getBambuConnectDownloadUrl
  }
})
```

#### 4.3.2 Vue3 页面集成示例
```vue
<!-- pages/PrintPage.vue -->
<template>
  <div class="print-page">
    <div class="model-preview">
      <Babylon3DViewer :model-url="modelUrl" />
    </div>
    
    <div class="print-controls">
      <BambuConnectPanel 
        :model-url="modelUrl"
        :model-name="modelName"
        @print-sent="handlePrintSent"
      />
      
      <div class="print-settings">
        <h3>打印设置</h3>
        <PrintSettingsForm v-model="printSettings" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBambuConnectStore } from '@/stores/bambuConnect'
import Babylon3DViewer from '@/components/3d/Babylon3DViewer.vue'
import BambuConnectPanel from '@/components/BambuConnectPanel.vue'
import PrintSettingsForm from '@/components/PrintSettingsForm.vue'

interface Props {
  modelUrl: string
  modelName: string
}

const props = defineProps<Props>()

const bambuStore = useBambuConnectStore()
const printSettings = ref({
  layerHeight: 0.2,
  infillDensity: 20,
  supportMaterial: true
})

const handlePrintSent = (result: any) => {
  console.log('模型已发送到 Bambu Connect:', result)
  // 可以显示成功消息或跳转到打印历史页面
}

onMounted(async () => {
  await bambuStore.initializeBambuConnect()
})
</script>
```

#### 4.3.3 Docker 部署方案
```dockerfile
# Dockerfile 示例
FROM bambulab/local-server:latest

COPY config.json /app/config.json
EXPOSE 8080

CMD ["./bambu-local-server"]
```

### 4.4 打印机连接模式

#### 4.4.1 LAN 模式连接
**特点：**
- 局域网内直接连接<mcreference link="https://wiki.bambulab.com/zh/software/bambu-connect" index="1">1</mcreference>
- 无需云账户
- 支持打印机自动发现

**连接流程：**
```javascript
// 1. 发现局域网打印机
const lanPrinters = await bambuConnect.discoverLANPrinters();

// 2. 连接到指定打印机
await bambuConnect.connectToLAN(printerIP);

// 3. 发送打印任务
await bambuConnect.sendFile(filePath);
```

#### 4.4.2 Cloud 模式连接
**特点：**
- 通过拓竹云服务连接
- 需要用户账户登录
- 支持远程访问

**连接流程：**
```javascript
// 1. 登录云账户
await bambuConnect.loginCloud(username, password);

// 2. 获取绑定的打印机
const cloudPrinters = await bambuConnect.getCloudPrinters();

// 3. 选择打印机并发送任务
await bambuConnect.sendToCloud(printerId, filePath);
```

#### 4.4.3 Developer 模式
**特点：**
- 完全的打印机控制权限<mcreference link="https://wiki.bambulab.com/en/software/third-party-integration" index="1">1</mcreference>
- 无需授权验证
- 仅支持 LAN 模式
- 适合高级用户和开发者

### 4.5 安全认证机制

#### 4.5.1 PIN 码绑定流程
```javascript
// 1. 获取打印机 PIN 码（在打印机屏幕上显示）
const pinCode = '123456'; // 用户从打印机屏幕获取

// 2. 使用 PIN 码绑定打印机
await bambuConnect.bindWithPIN(pinCode);

// 3. 绑定成功后可以进行打印操作
```

#### 4.5.2 网络端口配置
**必需端口：**<mcreference link="https://wiki.bambulab.com/en/general/printer-network-ports" index="4">4</mcreference>
```javascript
const requiredPorts = {
  // Cloud 模式
  http: [80, 443, 8080],
  mqtt: 8883,
  video: [8000, 21047, 1000, 443, 8443],
  binding: 3000,
  
  // LAN 模式
  lanMqtt: 8883,
  lanFtp: [990, '50000-50100'],
  lanVideo: [322, 6000],
  discovery: [1990, 2021],
  
  // 通用
  ntp: 123
};
```

### 4.6 完整集成示例

#### 4.6.1 文件转换和发送
```javascript
class BambuConnectIntegration {
  constructor() {
    this.tempDir = '/tmp/bambu-files';
  }
  
  // 将 GLB 模型转换为 3MF 格式
  async convertGLBto3MF(glbUrl, fileName) {
    // 1. 下载 GLB 文件
    const glbData = await fetch(glbUrl).then(r => r.arrayBuffer());
    
    // 2. 使用切片引擎转换为 3MF
    const slicedFile = await this.sliceModel(glbData, {
      layerHeight: 0.2,
      infillDensity: 20,
      supportMaterial: true
    });
    
    // 3. 保存到临时目录
    const filePath = `${this.tempDir}/${fileName}.gcode.3mf`;
    await fs.writeFile(filePath, slicedFile);
    
    return filePath;
  }
  
  // 发送到 Bambu Connect
  async sendToBambuConnect(glbUrl, modelName) {
    try {
      // 1. 转换文件格式
      const filePath = await this.convertGLBto3MF(glbUrl, modelName);
      
      // 2. 构建 URL Scheme
      const encodedPath = encodeURIComponent(filePath);
      const encodedName = encodeURIComponent(modelName);
      const url = `bambu-connect://import-file?path=${encodedPath}&name=${encodedName}&version=1.0.0`;
      
      // 3. 打开 Bambu Connect
      window.location.href = url;
      
      return {
        success: true,
        message: 'Bambu Connect 已打开，请在应用中完成打印设置'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 检查 Bambu Connect 是否已安装
  async checkBambuConnectAvailability() {
    return new Promise((resolve) => {
      const testUrl = 'bambu-connect://ping';
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = testUrl;
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(false); // 如果没有响应，认为未安装
      }, 1000);
      
      iframe.onload = () => {
        document.body.removeChild(iframe);
        resolve(true); // 成功加载，认为已安装
      };
      
      document.body.appendChild(iframe);
    });
  }
}
```

#### 4.6.2 错误处理和用户引导
```javascript
async function handleBambuConnectIntegration(modelUrl, modelName) {
  const integration = new BambuConnectIntegration();
  
  // 1. 检查 Bambu Connect 是否可用
  const isAvailable = await integration.checkBambuConnectAvailability();
  
  if (!isAvailable) {
    // 引导用户下载 Bambu Connect
    showDownloadDialog({
      title: '需要安装 Bambu Connect',
      message: '请先下载并安装 Bambu Connect 应用以连接打印机',
      downloadUrl: 'https://wiki.bambulab.com/zh/software/bambu-connect'
    });
    return;
  }
  
  // 2. 发送模型到 Bambu Connect
  const result = await integration.sendToBambuConnect(modelUrl, modelName);
  
  if (result.success) {
    showSuccessMessage('模型已发送到 Bambu Connect，请在应用中完成打印设置');
  } else {
    showErrorMessage(`发送失败: ${result.error}`);
  }
}
```

### 4.7 最佳实践

#### 4.7.1 文件管理
```javascript
// 清理临时文件
async function cleanupTempFiles() {
  const tempFiles = await fs.readdir('/tmp/bambu-files');
  const now = Date.now();
  
  for (const file of tempFiles) {
    const stats = await fs.stat(`/tmp/bambu-files/${file}`);
    const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
    
    if (ageHours > 24) { // 删除24小时前的文件
      await fs.unlink(`/tmp/bambu-files/${file}`);
    }
  }
}
```

#### 4.7.2 用户体验优化
```javascript
// 显示打印预估信息
function showPrintEstimation(modelData) {
  const estimation = calculatePrintTime(modelData);
  
  return {
    estimatedTime: estimation.time,
    materialUsage: estimation.material,
    estimatedCost: estimation.cost,
    layerCount: estimation.layers
  };
}

// 提供打印设置建议
function suggestPrintSettings(modelComplexity) {
  if (modelComplexity === 'high') {
    return {
      layerHeight: 0.1,
      infillDensity: 15,
      printSpeed: 80,
      supportMaterial: true,
      message: '检测到复杂模型，建议使用精细设置'
    };
  } else {
    return {
      layerHeight: 0.2,
      infillDensity: 20,
      printSpeed: 100,
      supportMaterial: false,
      message: '标准设置适合此模型'
    };
  }
}
```

## 5. Vue3 集成工作流程

### 5.1 Text-to-3D Vue3 Composable 实现

```typescript
// composables/useMeshyAPI.ts
import { ref, reactive } from 'vue'

export interface MeshyTaskState {
  isGenerating: boolean
  currentTask: string | null
  progress: number
  error: string | null
}

export function useMeshyAPI() {
  const state = reactive<MeshyTaskState>({
    isGenerating: false,
    currentTask: null,
    progress: 0,
    error: null
  })

  const apiKey = ref(import.meta.env.VITE_MESHY_API_KEY)

  /**
   * Text-to-3D 完整流程
   */
  const generateTextTo3D = async (prompt: string, options = {}) => {
    try {
      state.isGenerating = true
      state.error = null
      state.progress = 0

      // 1. 创建预览任务
      state.currentTask = 'preview'
      state.progress = 10
      
      const previewResponse = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'preview',
          prompt,
          art_style: 'realistic',
          ai_model: 'latest',
          ...options
        })
      })

      const previewTask = await previewResponse.json()
      const previewTaskId = previewTask.result

      // 2. 轮询预览任务状态
      state.progress = 30
      const previewResult = await pollTaskStatus(previewTaskId, 'preview')
      
      if (!previewResult) {
        throw new Error('预览任务失败')
      }

      // 3. 创建精细化任务
      state.currentTask = 'refine'
      state.progress = 60
      
      const refineResponse = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'refine',
          preview_task_id: previewTaskId,
          enable_pbr: true
        })
      })

      const refineTask = await refineResponse.json()
      const refineTaskId = refineTask.result

      // 4. 轮询精细化任务状态
      state.progress = 80
      const finalModel = await pollTaskStatus(refineTaskId, 'refine')
      
      if (!finalModel) {
        throw new Error('精细化任务失败')
      }

      state.progress = 100
      state.currentTask = 'completed'
      
      return finalModel

    } catch (error) {
      console.error('Text-to-3D 生成失败:', error)
      state.error = error instanceof Error ? error.message : '生成失败'
      throw error
    } finally {
      state.isGenerating = false
    }
  }

  /**
   * 轮询任务状态
   */
  const pollTaskStatus = async (taskId: string, taskType: string) => {
    let completed = false
    let result = null
    
    while (!completed) {
      const statusResponse = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey.value}` }
      })
      
      const status = await statusResponse.json()
      
      if (status.status === 'SUCCEEDED') {
        completed = true
        result = status
      } else if (status.status === 'FAILED') {
        throw new Error(`${taskType}任务失败`)
      }
      
      // 更新进度
      if (taskType === 'preview') {
        state.progress = 30 + (status.progress || 0) * 0.3
      } else if (taskType === 'refine') {
        state.progress = 60 + (status.progress || 0) * 0.4
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)) // 等待5秒
    }
    
    return result
  }

  return {
    state: readonly(state),
    generateTextTo3D,
    pollTaskStatus
  }
}
```

### 5.2 Vue3 组件集成示例

```vue
<!-- components/TextTo3DGenerator.vue -->
<template>
  <div class="text-to-3d-generator">
    <div class="input-section">
      <textarea 
        v-model="prompt"
        placeholder="描述您想要生成的3D模型..."
        class="prompt-input"
        :disabled="meshyState.isGenerating"
      />
      
      <button 
        @click="handleGenerate"
        :disabled="meshyState.isGenerating || !prompt.trim()"
        class="generate-btn"
      >
        <Icon v-if="meshyState.isGenerating" name="loader" class="animate-spin" />
        {{ meshyState.isGenerating ? '生成中...' : '生成3D模型' }}
      </button>
    </div>

    <div v-if="meshyState.isGenerating" class="progress-section">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${meshyState.progress}%` }"
        />
      </div>
      <p class="progress-text">
        {{ getProgressText() }} ({{ meshyState.progress }}%)
      </p>
    </div>

    <div v-if="meshyState.error" class="error-section">
      <p class="error-message">{{ meshyState.error }}</p>
    </div>

    <div v-if="generatedModel" class="result-section">
      <Babylon3DViewer :model-url="generatedModel.model_urls.glb" />
      
      <div class="action-buttons">
        <button @click="downloadModel" class="download-btn">
          下载模型
        </button>
        
        <BambuConnectPanel 
          :model-url="generatedModel.model_urls.glb"
          :model-name="modelName"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMeshyAPI } from '@/composables/useMeshyAPI'
import { useBambuConnectStore } from '@/stores/bambuConnect'
import Babylon3DViewer from '@/components/3d/Babylon3DViewer.vue'
import BambuConnectPanel from '@/components/BambuConnectPanel.vue'
import Icon from '@/components/ui/Icon.vue'

const prompt = ref('')
const generatedModel = ref(null)

const { state: meshyState, generateTextTo3D } = useMeshyAPI()
const bambuStore = useBambuConnectStore()

const modelName = computed(() => {
  return prompt.value.slice(0, 20) + '...' || '生成的3D模型'
})

const getProgressText = () => {
  switch (meshyState.currentTask) {
    case 'preview': return '正在生成预览模型'
    case 'refine': return '正在精细化模型'
    case 'completed': return '生成完成'
    default: return '准备中'
  }
}

const handleGenerate = async () => {
  try {
    generatedModel.value = await generateTextTo3D(prompt.value)
  } catch (error) {
    console.error('生成失败:', error)
  }
}

const downloadModel = () => {
  if (generatedModel.value) {
    window.open(generatedModel.value.model_urls.glb, '_blank')
  }
}
</script>
```

### 5.2 Image-to-3D 完整流程

```javascript
// 1. 上传图片（可选，也可以直接使用URL）
const formData = new FormData();
formData.append('file', imageFile);

const uploadResponse = await fetch('https://api.meshy.ai/web/v1/files/images?skipNameGeneration', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_MESHY_API_KEY'
  },
  body: formData
});

const uploadResult = await uploadResponse.json();
const imageUrl = uploadResult.url;

// 2. 创建Image-to-3D任务
const taskResponse = await fetch('https://api.meshy.ai/openapi/v1/image-to-3d', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_MESHY_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_url: imageUrl,
    ai_model: 'latest',
    should_texture: true,
    enable_pbr: true
  })
});

const task = await taskResponse.json();
const taskId = task.result;

// 3. 轮询任务状态
let completed = false;
let finalModel = null;
while (!completed) {
  const statusResponse = await fetch(`https://api.meshy.ai/openapi/v1/image-to-3d/${taskId}`, {
    headers: { 'Authorization': 'Bearer YOUR_MESHY_API_KEY' }
  });
  
  const status = await statusResponse.json();
  if (status.status === 'SUCCEEDED') {
    completed = true;
    finalModel = status;
  } else if (status.status === 'FAILED') {
    throw new Error('任务失败');
  }
  
  await new Promise(resolve => setTimeout(resolve, 5000));
}

// 4. 发送到 Bambu Connect 进行3D打印
const bambuIntegration = new BambuConnectIntegration();
const printResult = await bambuIntegration.sendToBambuConnect(
  finalModel.model_urls.glb,
  '图片生成的3D模型'
);

if (printResult.success) {
  console.log('模型已发送到 Bambu Connect');
} else {
  console.error('发送失败:', printResult.error);
}
```

## 6. 错误处理

### 6.1 HTTP 状态码

| 状态码 | 说明 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 正常处理响应 |
| 400 | 请求参数错误 | 检查请求参数格式 |
| 401 | 认证失败 | 检查API密钥 |
| 402 | 积分不足 | 提示用户充值 |
| 429 | 请求频率限制 | 实现退避重试 |
| 500 | 服务器内部错误 | 稍后重试 |

### 6.2 错误响应格式

```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "积分不足，无法创建任务",
    "details": {
      "required_credits": 20,
      "available_credits": 5
    }
  }
}
```

### 6.3 重试策略

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // 指数退避
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## 7. 费用说明

### 7.1 Meshy.ai 费用

| 功能 | Meshy 6 模型 | 其他模型 |
|------|-------------|----------|
| Text-to-3D 预览 | 20 积分 | 10 积分 |
| Text-to-3D 精细化 | 10 积分 | 10 积分 |
| Image-to-3D（无纹理） | 20 积分 | 5 积分 |
| Image-to-3D（有纹理） | 30 积分 | 15 积分 |
| 重网格化 | 5 积分 | 5 积分 |

### 7.2 费用计算示例

```javascript
function calculateCost(taskType, model, hasTexture = true) {
  const costs = {
    'text-to-3d-preview': { 'latest': 20, 'other': 10 },
    'text-to-3d-refine': { 'latest': 10, 'other': 10 },
    'image-to-3d': { 
      'latest': hasTexture ? 30 : 20, 
      'other': hasTexture ? 15 : 5 
    }
  };
  
  const modelType = model === 'latest' ? 'latest' : 'other';
  return costs[taskType][modelType];
}
```

## 8. 最佳实践

### 8.1 性能优化

1. **并发控制**：限制同时进行的任务数量
2. **缓存策略**：缓存已生成的模型
3. **预加载**：提前加载常用资源
4. **压缩传输**：使用gzip压缩API响应

### 8.2 用户体验

1. **进度显示**：实时显示任务进度
2. **预览功能**：在精细化前显示预览
3. **错误提示**：友好的错误信息
4. **离线支持**：支持任务队列和离线处理

### 8.3 安全考虑

1. **API密钥管理**：安全存储和轮换API密钥
2. **输入验证**：验证用户输入内容
3. **内容审核**：启用Meshy.ai的内容审核功能
4. **访问控制**：实现用户权限管理

## 9. 监控和日志

### 9.1 关键指标

- API调用成功率
- 任务完成时间
- 错误率和错误类型
- 用户积分使用情况
- 3D打印成功率

### 9.2 日志格式

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "INFO",
  "service": "meshy-api",
  "action": "create_task",
  "task_id": "019a1558-97e9-706d-a24f-a1a0dfe1d955",
  "user_id": "user_123",
  "duration_ms": 1500,
  "credits_used": 20,
  "status": "success"
}
```

## 10. 测试策略

### 10.1 单元测试

```javascript
describe('Meshy API Client', () => {
  test('should create text-to-3d preview task', async () => {
    const client = new MeshyClient('test-api-key');
    const result = await client.createTextTo3DPreview({
      prompt: 'test prompt',
      art_style: 'realistic'
    });
    
    expect(result.task_id).toBeDefined();
  });
});
```

### 10.2 集成测试

```javascript
describe('3D Generation Workflow', () => {
  test('should complete full text-to-3d workflow', async () => {
    // 测试完整的文本到3D生成流程
    const previewTask = await createPreviewTask();
    const refinedTask = await createRefineTask(previewTask.id);
    const printTask = await sendToPrinter(refinedTask.model_urls.glb);
    
    expect(printTask.status).toBe('QUEUED');
  });
});
```

## 11. 部署和运维

### 11.1 环境配置

```bash
# 环境变量
MESHY_API_KEY=msy-your-api-key
API_BASE_URL=https://api.meshy.ai

# Bambu Connect 配置
BAMBU_TEMP_DIR=/tmp/bambu-files
BAMBU_CONNECT_TIMEOUT=30000
```

### 11.2 健康检查

```javascript
app.get('/health', async (req, res) => {
  try {
    // 检查Meshy.ai连接
    await fetch('https://api.meshy.ai/web/v1/me/info', {
      headers: { 'Authorization': `Bearer ${process.env.MESHY_API_KEY}` }
    });
    
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

这个API接口设计文档提供了完整的技术实现指南，包含了所有必要的端点、参数、响应格式和最佳实践，可以直接用于开发实现。