# 3D生成打印平台 UI界面设计文档

## 1. 设计概述

本文档详细描述了3D生成打印平台的用户界面设计，包括主界面、全屏3D查看器等核心功能模块的界面设计规范。设计风格以现代化、简洁、专业为主，参考嘉立创3D等优秀3D设计软件的界面布局。

## 2. 设计系统

### 2.1 色彩系统
- **主色调**: #2563eb (蓝色)
- **辅助色**: #64748b (灰蓝色)
- **背景色**: #f8fafc (浅灰白)
- **深色背景**: #1e293b (深灰蓝)
- **成功色**: #10b981 (绿色)
- **警告色**: #f59e0b (橙色)
- **错误色**: #ef4444 (红色)
- **文字色**: #0f172a (深色), #64748b (次要文字)

### 2.2 字体系统
- **主字体**: Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **代码字体**: 'JetBrains Mono', 'Fira Code', monospace
- **字体大小**: 12px (小), 14px (正文), 16px (标题), 18px (大标题), 24px (主标题)

### 2.3 间距系统
- **基础间距**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px
- **组件内边距**: 8px-16px
- **组件间距**: 16px-24px
- **页面边距**: 24px-32px

## 3. 主界面设计

### 3.1 整体布局
```
┌─────────────────────────────────────────────────────────────┐
│                        顶部导航栏                            │
├─────────────────────────────────────────────────────────────┤
│ 侧边栏 │                  主内容区域                        │
│       │                                                   │
│       │                                                   │
│       │                                                   │
│       │                                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 顶部导航栏
- **高度**: 64px
- **背景**: 白色 (#ffffff)
- **边框**: 底部 1px 边框 (#e2e8f0)
- **内容**: Logo、主导航菜单、用户头像、设置按钮

### 3.3 侧边栏
- **宽度**: 280px (可折叠至 64px)
- **背景**: #f8fafc
- **功能**: 文件管理、模型库、历史记录、设置

## 4. 全屏3D查看器界面设计

### 4.1 整体布局设计

基于嘉立创3D的界面设计，全屏3D查看器采用沉浸式布局：

```
┌─────────────────────────────────────────────────────────────┐
│                      顶部工具栏                              │
├─────┬───────────────────────────────────────────────┬─────┤
│文件 │                                               │属性 │
│树   │              3D渲染区域                        │面板 │
│     │                                               │     │
│     │                                               │     │
│     │                                               │     │
├─────┴───────────────────────────────────────────────┴─────┤
│                      底部工具栏                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 顶部工具栏设计

**尺寸**: 高度 48px，全宽
**背景**: rgba(255, 255, 255, 0.95) 半透明白色
**位置**: 固定在顶部，支持自动隐藏

**工具栏内容**:
```html
<div class="top-toolbar">
  <div class="toolbar-left">
    <button class="tool-btn" title="返回主界面">
      <i class="icon-arrow-left"></i>
    </button>
    <button class="tool-btn" title="打开文件">
      <i class="icon-folder-open"></i>
    </button>
    <button class="tool-btn" title="保存">
      <i class="icon-save"></i>
    </button>
  </div>
  
  <div class="toolbar-center">
    <span class="file-name">cube.3mf</span>
  </div>
  
  <div class="toolbar-right">
    <button class="tool-btn" title="全屏">
      <i class="icon-fullscreen"></i>
    </button>
    <button class="tool-btn" title="设置">
      <i class="icon-settings"></i>
    </button>
  </div>
</div>
```

### 4.3 底部工具栏设计

**尺寸**: 高度 64px，全宽
**背景**: rgba(255, 255, 255, 0.95) 半透明白色
**位置**: 固定在底部

**工具栏功能** (参考嘉立创3D):
```html
<div class="bottom-toolbar">
  <div class="tool-group">
    <button class="tool-btn active" title="回到原点">
      <i class="icon-home"></i>
      <span>回到原点</span>
    </button>
    
    <button class="tool-btn" title="旋转">
      <i class="icon-rotate"></i>
      <span>旋转</span>
    </button>
    
    <button class="tool-btn" title="测量 (M)">
      <i class="icon-ruler"></i>
      <span>测量 (M)</span>
    </button>
    
    <button class="tool-btn" title="模型属性">
      <i class="icon-cube"></i>
      <span>模型属性</span>
    </button>
    
    <button class="tool-btn" title="平移">
      <i class="icon-move"></i>
      <span>平移</span>
    </button>
    
    <button class="tool-btn" title="创建">
      <i class="icon-plus"></i>
      <span>创建</span>
    </button>
    
    <button class="tool-btn" title="结构树">
      <i class="icon-tree"></i>
      <span>结构树</span>
    </button>
    
    <button class="tool-btn" title="包装盒">
      <i class="icon-box"></i>
      <span>包装盒</span>
    </button>
    
    <button class="tool-btn" title="拖动">
      <i class="icon-hand"></i>
      <span>拖动</span>
    </button>
    
    <button class="tool-btn" title="自由上色">
      <i class="icon-palette"></i>
      <span>自由上色</span>
    </button>
    
    <button class="tool-btn" title="全屏">
      <i class="icon-fullscreen"></i>
      <span>全屏</span>
    </button>
    
    <button class="tool-btn" title="设置">
      <i class="icon-settings"></i>
      <span>设置</span>
    </button>
  </div>
</div>
```

### 4.4 3D渲染区域设计

**尺寸**: 占据除工具栏外的全部空间
**背景**: 渐变背景 (从 #f0f4f8 到 #e2e8f0)
**渲染引擎**: Babylon.js

**交互控制**:
- 鼠标左键拖拽: 旋转视角
- 鼠标右键拖拽: 平移视角
- 鼠标滚轮: 缩放
- 双击: 聚焦到模型

**视角控制器**:
```html
<div class="view-controls">
  <button class="view-btn" data-view="front">前</button>
  <button class="view-btn" data-view="back">后</button>
  <button class="view-btn" data-view="left">左</button>
  <button class="view-btn" data-view="right">右</button>
  <button class="view-btn" data-view="top">顶</button>
  <button class="view-btn" data-view="bottom">底</button>
  <button class="view-btn" data-view="iso">等轴</button>
</div>
```

### 4.5 左侧文件树面板

**尺寸**: 宽度 280px，可折叠至 48px
**背景**: rgba(248, 250, 252, 0.95)
**位置**: 固定在左侧

```html
<div class="file-panel">
  <div class="panel-header">
    <h3>模型文件</h3>
    <button class="collapse-btn">
      <i class="icon-chevron-left"></i>
    </button>
  </div>
  
  <div class="file-tree">
    <div class="file-item active">
      <i class="icon-cube"></i>
      <span>cube.3mf</span>
      <div class="file-actions">
        <button class="action-btn" title="隐藏">
          <i class="icon-eye-off"></i>
        </button>
        <button class="action-btn" title="删除">
          <i class="icon-trash"></i>
        </button>
      </div>
    </div>
  </div>
</div>
```

### 4.6 右侧属性面板

**尺寸**: 宽度 320px，可折叠至 48px
**背景**: rgba(248, 250, 252, 0.95)
**位置**: 固定在右侧

```html
<div class="properties-panel">
  <div class="panel-header">
    <h3>属性设置</h3>
    <button class="collapse-btn">
      <i class="icon-chevron-right"></i>
    </button>
  </div>
  
  <div class="panel-content">
    <!-- 变换控制 -->
    <div class="property-group">
      <h4>变换</h4>
      <div class="transform-controls">
        <div class="control-row">
          <label>位置 X</label>
          <input type="number" value="0" step="0.1">
        </div>
        <div class="control-row">
          <label>位置 Y</label>
          <input type="number" value="0" step="0.1">
        </div>
        <div class="control-row">
          <label>位置 Z</label>
          <input type="number" value="0" step="0.1">
        </div>
      </div>
    </div>
    
    <!-- 材质设置 -->
    <div class="property-group">
      <h4>材质</h4>
      <div class="material-controls">
        <div class="control-row">
          <label>颜色</label>
          <input type="color" value="#ff6b6b">
        </div>
        <div class="control-row">
          <label>透明度</label>
          <input type="range" min="0" max="1" step="0.1" value="1">
        </div>
      </div>
    </div>
    
    <!-- 打印设置 -->
    <div class="property-group">
      <h4>打印设置</h4>
      <div class="print-controls">
        <div class="control-row">
          <label>层高</label>
          <select>
            <option value="0.1">0.1mm</option>
            <option value="0.2" selected>0.2mm</option>
            <option value="0.3">0.3mm</option>
          </select>
        </div>
        <div class="control-row">
          <label>填充密度</label>
          <input type="range" min="0" max="100" value="20">
          <span>20%</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 5. CSS样式定义

### 5.1 全屏3D查看器样式

```css
/* 全屏3D查看器容器 */
.fullscreen-3d-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  z-index: 1000;
  overflow: hidden;
}

/* 顶部工具栏 */
.top-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1001;
  transition: transform 0.3s ease;
}

.top-toolbar.hidden {
  transform: translateY(-100%);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
}

.toolbar-center {
  flex: 1;
  text-align: center;
}

.file-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
}

/* 底部工具栏 */
.bottom-toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  z-index: 1001;
  transition: transform 0.3s ease;
}

.bottom-toolbar.hidden {
  transform: translateY(100%);
}

.tool-group {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 工具按钮 */
.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 11px;
  min-width: 60px;
}

.tool-btn:hover {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  transform: translateY(-1px);
}

.tool-btn.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.tool-btn i {
  font-size: 18px;
}

.tool-btn span {
  font-weight: 500;
  white-space: nowrap;
}

/* 3D渲染区域 */
.render-area {
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  bottom: 64px;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
}

#babylon-canvas {
  width: 100%;
  height: 100%;
  outline: none;
  cursor: grab;
}

#babylon-canvas:active {
  cursor: grabbing;
}

/* 视角控制器 */
.view-controls {
  position: absolute;
  top: 60px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1002;
}

.view-btn {
  width: 40px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: #2563eb;
  color: white;
}

/* 侧边面板 */
.side-panel {
  position: absolute;
  top: 48px;
  bottom: 64px;
  width: 280px;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  transition: transform 0.3s ease;
  z-index: 1001;
}

.file-panel {
  left: 0;
  border-right: 1px solid rgba(226, 232, 240, 0.5);
}

.properties-panel {
  right: 0;
  border-left: 1px solid rgba(226, 232, 240, 0.5);
}

.side-panel.collapsed {
  width: 48px;
}

.side-panel.collapsed .panel-content {
  display: none;
}

.panel-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  background: rgba(255, 255, 255, 0.5);
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(100, 116, 139, 0.1);
  color: #2563eb;
}

.panel-content {
  padding: 16px;
  height: calc(100% - 48px);
  overflow-y: auto;
}

/* 属性组 */
.property-group {
  margin-bottom: 24px;
}

.property-group h4 {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.control-row label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.control-row input,
.control-row select {
  width: 80px;
  height: 28px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
  background: white;
}

.control-row input[type="range"] {
  width: 60px;
}

.control-row input[type="color"] {
  width: 32px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 文件树 */
.file-tree {
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.file-item:hover {
  background: rgba(37, 99, 235, 0.1);
}

.file-item.active {
  background: #2563eb;
  color: white;
}

.file-item i {
  font-size: 16px;
  color: #64748b;
}

.file-item.active i {
  color: white;
}

.file-item span {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}

.file-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  border-radius: 3px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .side-panel {
    width: 240px;
  }
  
  .tool-btn {
    min-width: 50px;
    padding: 6px 8px;
  }
  
  .tool-btn span {
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .side-panel {
    transform: translateX(-100%);
  }
  
  .side-panel.show {
    transform: translateX(0);
  }
  
  .properties-panel {
    transform: translateX(100%);
  }
  
  .properties-panel.show {
    transform: translateX(0);
  }
  
  .tool-group {
    flex-wrap: wrap;
    max-width: calc(100vw - 32px);
  }
  
  .tool-btn {
    min-width: 45px;
    padding: 4px 6px;
  }
  
  .tool-btn i {
    font-size: 16px;
  }
  
  .tool-btn span {
    font-size: 9px;
  }
}

/* 加载动画 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 工具提示 */
.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 3000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tooltip.show {
  opacity: 1;
}
```

## 6. Vue3 组件实现

### 6.1 全屏3D查看器主组件

```vue
<!-- FullScreen3DViewer.vue -->
<template>
  <div class="fullscreen-3d-viewer" v-if="isVisible">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar" :class="{ hidden: isToolbarHidden }">
      <div class="toolbar-left">
        <button class="tool-btn" @click="exitFullscreen" title="返回主界面">
          <i class="icon-arrow-left"></i>
        </button>
        <button class="tool-btn" @click="openFile" title="打开文件">
          <i class="icon-folder-open"></i>
        </button>
        <button class="tool-btn" @click="saveFile" title="保存">
          <i class="icon-save"></i>
        </button>
      </div>
      
      <div class="toolbar-center">
        <span class="file-name">{{ fileName }}</span>
      </div>
      
      <div class="toolbar-right">
        <button class="tool-btn" @click="toggleFullscreen" title="全屏">
          <i class="icon-fullscreen"></i>
        </button>
        <button class="tool-btn" @click="openSettings" title="设置">
          <i class="icon-settings"></i>
        </button>
      </div>
    </div>
    
    <!-- 3D渲染区域 -->
    <div class="render-area">
      <canvas ref="babylonCanvas" id="babylon-canvas"></canvas>
      
      <!-- 视角控制器 -->
      <ViewControls @view-change="setView" />
    </div>
    
    <!-- 左侧文件面板 -->
    <FilePanel 
      v-model:collapsed="filePanelCollapsed"
      :files="modelFiles"
      @file-select="selectFile"
      @file-delete="deleteFile"
    />
    
    <!-- 右侧属性面板 -->
    <PropertiesPanel 
      v-model:collapsed="propsPanelCollapsed"
      :model="currentModel"
      @transform-change="updateModelTransform"
      @material-change="updateModelMaterial"
      @print-settings-change="updatePrintSettings"
    />
    
    <!-- 底部工具栏 -->
    <BottomToolbar 
      :active-tool="activeTool"
      @tool-select="selectTool"
    />
    
    <!-- 加载遮罩 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as BABYLON from 'babylonjs'
import ViewControls from './components/ViewControls.vue'
import FilePanel from './components/FilePanel.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import BottomToolbar from './components/BottomToolbar.vue'
import { use3DViewer } from '@/composables/use3DViewer'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

// Props
interface Props {
  modelVisible?: boolean
  initialFile?: File
}

const props = withDefaults(defineProps<Props>(), {
  modelVisible: false,
  initialFile: undefined
})

// Emits
const emit = defineEmits<{
  close: []
  fileLoaded: [file: File]
  error: [error: string]
}>()

// 响应式状态
const isVisible = ref(props.modelVisible)
const isLoading = ref(false)
const isToolbarHidden = ref(false)
const fileName = ref('未命名模型')
const activeTool = ref('home-tool')

// 面板状态
const filePanelCollapsed = ref(false)
const propsPanelCollapsed = ref(false)

// 模型数据
const modelFiles = ref<Array<{ id: string; name: string; active: boolean }>>([])
const currentModel = ref<BABYLON.AbstractMesh | null>(null)

// 3D查看器相关
const babylonCanvas = ref<HTMLCanvasElement>()
const { 
  engine, 
  scene, 
  camera, 
  initBabylon, 
  loadModel, 
  setupModel,
  createGrid,
  dispose 
} = use3DViewer()

// 键盘快捷键
useKeyboardShortcuts({
  'Escape': exitFullscreen,
  'ctrl+f': toggleFullscreen,
  'm': () => selectTool('measure-tool')
})

// 生命周期
onMounted(async () => {
  await nextTick()
  if (babylonCanvas.value) {
    await initBabylon(babylonCanvas.value)
    createGrid()
    
    if (props.initialFile) {
      await loadModelFile(props.initialFile)
    }
  }
})

onUnmounted(() => {
  dispose()
})

// 方法
const exitFullscreen = () => {
  isVisible.value = false
  emit('close')
}

const openFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.3mf,.stl,.obj,.glb'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      await loadModelFile(file)
    }
  }
  input.click()
}

const loadModelFile = async (file: File) => {
  try {
    isLoading.value = true
    const mesh = await loadModel(file)
    
    if (mesh) {
      currentModel.value = mesh
      setupModel(mesh)
      fileName.value = file.name
      
      // 添加到文件列表
      modelFiles.value.forEach(f => f.active = false)
      modelFiles.value.push({
        id: Date.now().toString(),
        name: file.name,
        active: true
      })
      
      emit('fileLoaded', file)
    }
  } catch (error) {
    emit('error', `加载模型失败: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const saveFile = () => {
  // 实现保存功能
  console.log('保存文件')
}

const setView = (viewType: string) => {
  if (!camera.value) return
  
  const positions = {
    front: { alpha: 0, beta: Math.PI / 2 },
    back: { alpha: Math.PI, beta: Math.PI / 2 },
    left: { alpha: -Math.PI / 2, beta: Math.PI / 2 },
    right: { alpha: Math.PI / 2, beta: Math.PI / 2 },
    top: { alpha: 0, beta: 0.1 },
    bottom: { alpha: 0, beta: Math.PI - 0.1 },
    iso: { alpha: -Math.PI / 4, beta: Math.PI / 3 }
  }
  
  const position = positions[viewType as keyof typeof positions]
  if (position) {
    camera.value.setTarget(BABYLON.Vector3.Zero())
    camera.value.alpha = position.alpha
    camera.value.beta = position.beta
  }
}

const selectTool = (toolId: string) => {
  activeTool.value = toolId
  
  switch (toolId) {
    case 'home-tool':
      resetView()
      break
    case 'measure-tool':
      enableMeasureTool()
      break
    case 'fullscreen-tool':
      toggleFullscreen()
      break
  }
}

const selectFile = (fileId: string) => {
  modelFiles.value.forEach(f => {
    f.active = f.id === fileId
  })
}

const deleteFile = (fileId: string) => {
  const index = modelFiles.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    modelFiles.value.splice(index, 1)
  }
}

const updateModelTransform = (transform: { x: number; y: number; z: number }) => {
  if (currentModel.value) {
    currentModel.value.position = new BABYLON.Vector3(transform.x, transform.y, transform.z)
  }
}

const updateModelMaterial = (material: { color: string; opacity: number }) => {
  if (currentModel.value?.material) {
    const r = parseInt(material.color.substr(1, 2), 16) / 255
    const g = parseInt(material.color.substr(3, 2), 16) / 255
    const b = parseInt(material.color.substr(5, 2), 16) / 255
    
    const babylonMaterial = currentModel.value.material as BABYLON.StandardMaterial
    babylonMaterial.diffuseColor = new BABYLON.Color3(r, g, b)
    babylonMaterial.alpha = material.opacity
  }
}

const updatePrintSettings = (settings: { layerHeight: number; infillDensity: number }) => {
  // 更新打印设置
  console.log('更新打印设置:', settings)
}

const resetView = () => {
  if (camera.value) {
    camera.value.setTarget(BABYLON.Vector3.Zero())
    camera.value.alpha = -Math.PI / 2
    camera.value.beta = Math.PI / 2.5
    camera.value.radius = 10
  }
}

const enableMeasureTool = () => {
  console.log('启用测量工具')
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const openSettings = () => {
  console.log('打开设置')
}

// 暴露给父组件的方法
defineExpose({
  loadModelFile,
  resetView,
  setView
})
</script>
  
  createUI() {
    this.container.innerHTML = `
      <div class="fullscreen-3d-viewer">
        <!-- 顶部工具栏 -->
        <div class="top-toolbar">
          <div class="toolbar-left">
            <button class="tool-btn" id="back-btn" title="返回主界面">
              <i class="icon-arrow-left"></i>
            </button>
            <button class="tool-btn" id="open-btn" title="打开文件">
              <i class="icon-folder-open"></i>
            </button>
            <button class="tool-btn" id="save-btn" title="保存">
              <i class="icon-save"></i>
            </button>
          </div>
          
          <div class="toolbar-center">
            <span class="file-name" id="file-name">未命名模型</span>
          </div>
          
          <div class="toolbar-right">
            <button class="tool-btn" id="fullscreen-btn" title="全屏">
              <i class="icon-fullscreen"></i>
            </button>
            <button class="tool-btn" id="settings-btn" title="设置">
              <i class="icon-settings"></i>
            </button>
          </div>
        </div>
        
        <!-- 3D渲染区域 -->
        <div class="render-area">
          <canvas id="babylon-canvas"></canvas>
          
          <!-- 视角控制器 -->
          <div class="view-controls">
            <button class="view-btn" data-view="front">前</button>
            <button class="view-btn" data-view="back">后</button>
            <button class="view-btn" data-view="left">左</button>
            <button class="view-btn" data-view="right">右</button>
            <button class="view-btn" data-view="top">顶</button>
            <button class="view-btn" data-view="bottom">底</button>
            <button class="view-btn" data-view="iso">等轴</button>
          </div>
        </div>
        
        <!-- 左侧文件面板 -->
        <div class="side-panel file-panel">
          <div class="panel-header">
            <h3>模型文件</h3>
            <button class="collapse-btn" id="file-panel-collapse">
              <i class="icon-chevron-left"></i>
            </button>
          </div>
          <div class="panel-content">
            <div class="file-tree" id="file-tree">
              <!-- 文件列表将动态生成 -->
            </div>
          </div>
        </div>
        
        <!-- 右侧属性面板 -->
        <div class="side-panel properties-panel">
          <div class="panel-header">
            <h3>属性设置</h3>
            <button class="collapse-btn" id="props-panel-collapse">
              <i class="icon-chevron-right"></i>
            </button>
          </div>
          <div class="panel-content">
            <!-- 变换控制 -->
            <div class="property-group">
              <h4>变换</h4>
              <div class="transform-controls">
                <div class="control-row">
                  <label>位置 X</label>
                  <input type="number" id="pos-x" value="0" step="0.1">
                </div>
                <div class="control-row">
                  <label>位置 Y</label>
                  <input type="number" id="pos-y" value="0" step="0.1">
                </div>
                <div class="control-row">
                  <label>位置 Z</label>
                  <input type="number" id="pos-z" value="0" step="0.1">
                </div>
              </div>
            </div>
            
            <!-- 材质设置 -->
            <div class="property-group">
              <h4>材质</h4>
              <div class="material-controls">
                <div class="control-row">
                  <label>颜色</label>
                  <input type="color" id="model-color" value="#ff6b6b">
                </div>
                <div class="control-row">
                  <label>透明度</label>
                  <input type="range" id="model-opacity" min="0" max="1" step="0.1" value="1">
                </div>
              </div>
            </div>
            
            <!-- 打印设置 -->
            <div class="property-group">
              <h4>打印设置</h4>
              <div class="print-controls">
                <div class="control-row">
                  <label>层高</label>
                  <select id="layer-height">
                    <option value="0.1">0.1mm</option>
                    <option value="0.2" selected>0.2mm</option>
                    <option value="0.3">0.3mm</option>
                  </select>
                </div>
                <div class="control-row">
                  <label>填充密度</label>
                  <input type="range" id="infill-density" min="0" max="100" value="20">
                  <span id="infill-value">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 底部工具栏 -->
        <div class="bottom-toolbar">
          <div class="tool-group">
            <button class="tool-btn active" id="home-tool" title="回到原点">
              <i class="icon-home"></i>
              <span>回到原点</span>
            </button>
            
            <button class="tool-btn" id="rotate-tool" title="旋转">
              <i class="icon-rotate"></i>
              <span>旋转</span>
            </button>
            
            <button class="tool-btn" id="measure-tool" title="测量 (M)">
              <i class="icon-ruler"></i>
              <span>测量 (M)</span>
            </button>
            
            <button class="tool-btn" id="properties-tool" title="模型属性">
              <i class="icon-cube"></i>
              <span>模型属性</span>
            </button>
            
            <button class="tool-btn" id="move-tool" title="平移">
              <i class="icon-move"></i>
              <span>平移</span>
            </button>
            
            <button class="tool-btn" id="create-tool" title="创建">
              <i class="icon-plus"></i>
              <span>创建</span>
            </button>
            
            <button class="tool-btn" id="tree-tool" title="结构树">
              <i class="icon-tree"></i>
              <span>结构树</span>
            </button>
            
            <button class="tool-btn" id="box-tool" title="包装盒">
              <i class="icon-box"></i>
              <span>包装盒</span>
            </button>
            
            <button class="tool-btn" id="drag-tool" title="拖动">
              <i class="icon-hand"></i>
              <span>拖动</span>
            </button>
            
            <button class="tool-btn" id="color-tool" title="自由上色">
              <i class="icon-palette"></i>
              <span>自由上色</span>
            </button>
            
            <button class="tool-btn" id="fullscreen-tool" title="全屏">
              <i class="icon-fullscreen"></i>
              <span>全屏</span>
            </button>
            
            <button class="tool-btn" id="settings-tool" title="设置">
              <i class="icon-settings"></i>
              <span>设置</span>
            </button>
          </div>
        </div>
        
        <!-- 加载遮罩 -->
        <div class="loading-overlay" id="loading-overlay" style="display: none;">
          <div class="loading-spinner"></div>
        </div>
      </div>
    `;
  }
  
  initBabylon() {
    this.canvas = document.getElementById('babylon-canvas');
    this.engine = new BABYLON.Engine(this.canvas, true);
    
    // 创建场景
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color3(0.94, 0.96, 0.97);
    
    // 创建相机
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.attachControls(this.canvas, true);
    
    // 创建光源
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;
    
    const directionalLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -1, -1), this.scene);
    directionalLight.intensity = 0.5;
    
    // 创建地面网格
    this.createGrid();
    
    // 渲染循环
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }
  
  createGrid() {
    const gridSize = 20;
    const gridSpacing = 1;
    
    const gridMaterial = new BABYLON.StandardMaterial("gridMaterial", this.scene);
    gridMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    gridMaterial.alpha = 0.3;
    
    // 创建网格线
    for (let i = -gridSize; i <= gridSize; i++) {
      // X方向线
      const lineX = BABYLON.MeshBuilder.CreateLines("lineX" + i, {
        points: [
          new BABYLON.Vector3(-gridSize, 0, i * gridSpacing),
          new BABYLON.Vector3(gridSize, 0, i * gridSpacing)
        ]
      }, this.scene);
      lineX.color = new BABYLON.Color3(0.7, 0.7, 0.7);
      
      // Z方向线
      const lineZ = BABYLON.MeshBuilder.CreateLines("lineZ" + i, {
        points: [
          new BABYLON.Vector3(i * gridSpacing, 0, -gridSize),
          new BABYLON.Vector3(i * gridSpacing, 0, gridSize)
        ]
      }, this.scene);
      lineZ.color = new BABYLON.Color3(0.7, 0.7, 0.7);
    }
  }
  
  bindEvents() {
    // 工具栏事件
    document.getElementById('back-btn').addEventListener('click', () => {
      this.exitFullscreen();
    });
    
    document.getElementById('open-btn').addEventListener('click', () => {
      this.openFile();
    });
    
    document.getElementById('save-btn').addEventListener('click', () => {
      this.saveFile();
    });
    
    // 视角控制
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setView(e.target.dataset.view);
      });
    });
    
    // 底部工具栏
    document.querySelectorAll('.bottom-toolbar .tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectTool(e.currentTarget);
      });
    });
    
    // 面板折叠
    document.getElementById('file-panel-collapse').addEventListener('click', () => {
      this.togglePanel('file-panel');
    });
    
    document.getElementById('props-panel-collapse').addEventListener('click', () => {
      this.togglePanel('properties-panel');
    });
    
    // 属性控制
    this.bindPropertyControls();
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
  }
  
  bindPropertyControls() {
    // 位置控制
    ['pos-x', 'pos-y', 'pos-z'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
        this.updateModelTransform();
      });
    });
    
    // 颜色控制
    document.getElementById('model-color').addEventListener('input', (e) => {
      this.updateModelColor(e.target.value);
    });
    
    // 透明度控制
    document.getElementById('model-opacity').addEventListener('input', (e) => {
      this.updateModelOpacity(e.target.value);
    });
    
    // 填充密度显示
    document.getElementById('infill-density').addEventListener('input', (e) => {
      document.getElementById('infill-value').textContent = e.target.value + '%';
    });
  }
  
  loadModel(file) {
    this.showLoading(true);
    
    // 根据文件类型加载模型
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === '3mf' || extension === 'stl') {
      BABYLON.SceneLoader.ImportMesh("", "", file, this.scene, (meshes) => {
        this.currentModel = meshes[0];
        this.setupModel();
        this.updateFileName(file.name);
        this.showLoading(false);
      });
    }
  }
  
  setupModel() {
    if (!this.currentModel) return;
    
    // 居中模型
    const boundingInfo = this.currentModel.getBoundingInfo();
    const center = boundingInfo.boundingBox.centerWorld;
    this.currentModel.position = this.currentModel.position.subtract(center);
    
    // 调整相机位置
    const size = boundingInfo.boundingBox.extendSizeWorld;
    const maxSize = Math.max(size.x, size.y, size.z);
    this.camera.radius = maxSize * 3;
    
    // 设置默认材质
    if (!this.currentModel.material) {
      const material = new BABYLON.StandardMaterial("modelMaterial", this.scene);
      material.diffuseColor = new BABYLON.Color3(1, 0.42, 0.42);
      this.currentModel.material = material;
    }
  }
  
  setView(viewType) {
    if (!this.camera) return;
    
    const animations = [];
    
    switch (viewType) {
      case 'front':
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.alpha = 0;
        this.camera.beta = Math.PI / 2;
        break;
      case 'back':
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.alpha = Math.PI;
        this.camera.beta = Math.PI / 2;
        break;
      case 'left':
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.alpha = -Math.PI / 2;
        this.camera.beta = Math.PI / 2;
        break;
      case 'right':
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.alpha = Math.PI / 2;
        this.camera.beta = Math.PI / 2;
        break;
      case 'top':
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.alpha = 0;
        this.camera.beta = 0.1;
        break;
      case 'bottom':
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.alpha = 0;
        this.camera.beta = Math.PI - 0.1;
        break;
      case 'iso':
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.alpha = -Math.PI / 4;
        this.camera.beta = Math.PI / 3;
        break;
    }
  }
  
  selectTool(toolBtn) {
    // 移除所有活动状态
    document.querySelectorAll('.bottom-toolbar .tool-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // 设置当前工具为活动状态
    toolBtn.classList.add('active');
    
    const toolId = toolBtn.id;
    
    // 根据工具类型执行相应操作
    switch (toolId) {
      case 'home-tool':
        this.resetView();
        break;
      case 'measure-tool':
        this.enableMeasureTool();
        break;
      case 'fullscreen-tool':
        this.toggleFullscreen();
        break;
      // 其他工具...
    }
  }
  
  togglePanel(panelClass) {
    const panel = document.querySelector('.' + panelClass);
    panel.classList.toggle('collapsed');
  }
  
  updateModelTransform() {
    if (!this.currentModel) return;
    
    const x = parseFloat(document.getElementById('pos-x').value);
    const y = parseFloat(document.getElementById('pos-y').value);
    const z = parseFloat(document.getElementById('pos-z').value);
    
    this.currentModel.position = new BABYLON.Vector3(x, y, z);
  }
  
  updateModelColor(color) {
    if (!this.currentModel || !this.currentModel.material) return;
    
    const r = parseInt(color.substr(1, 2), 16) / 255;
    const g = parseInt(color.substr(3, 2), 16) / 255;
    const b = parseInt(color.substr(5, 2), 16) / 255;
    
    this.currentModel.material.diffuseColor = new BABYLON.Color3(r, g, b);
  }
  
  updateModelOpacity(opacity) {
    if (!this.currentModel || !this.currentModel.material) return;
    
    this.currentModel.material.alpha = parseFloat(opacity);
  }
  
  handleKeyboard(e) {
    switch (e.key) {
      case 'Escape':
        this.exitFullscreen();
        break;
      case 'f':
      case 'F':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.toggleFullscreen();
        }
        break;
      case 'm':
      case 'M':
        this.selectTool(document.getElementById('measure-tool'));
        break;
    }
  }
  
  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
  }
  
  updateFileName(name) {
    document.getElementById('file-name').textContent = name;
  }
  
  openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.3mf,.stl,.obj';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.loadModel(file);
      }
    };
    input.click();
  }
  
  saveFile() {
    // 实现保存功能
    console.log('保存文件');
  }
  
  resetView() {
    if (this.camera) {
      this.camera.setTarget(BABYLON.Vector3.Zero());
      this.camera.alpha = -Math.PI / 2;
      this.camera.beta = Math.PI / 2.5;
      this.camera.radius = 10;
    }
  }
  
  enableMeasureTool() {
    // 实现测量工具
    console.log('启用测量工具');
  }
  
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  exitFullscreen() {
    // 退出全屏查看器
    this.container.style.display = 'none';
    // 返回主界面逻辑
  }
  
  destroy() {
    if (this.engine) {
      this.engine.dispose();
    }
  }
}

// 使用示例
const viewer = new FullScreen3DViewer('viewer-container');
```

## 7. 响应式设计

### 7.1 桌面端 (≥1024px)
- 完整的工具栏和侧边面板
- 所有功能按钮都显示文字标签
- 侧边面板默认展开

### 7.2 平板端 (768px-1023px)
- 压缩工具栏按钮尺寸
- 侧边面板宽度减小
- 保持主要功能可用

### 7.3 移动端 (<768px)
- 侧边面板默认隐藏，通过手势或按钮显示
- 工具栏按钮进一步压缩
- 支持触控操作
- 简化部分高级功能

## 8. 用户体验优化

### 8.1 性能优化
- 3D模型LOD (Level of Detail) 系统
- 视锥体剔除优化
- 材质和纹理压缩
- 渲染批处理

### 8.2 交互优化
- 流畅的动画过渡 (0.2s-0.3s)
- 直观的视觉反馈
- 工具提示和帮助信息
- 撤销/重做功能

### 8.3 可访问性
- 键盘导航支持
- 高对比度模式
- 屏幕阅读器支持
- 多语言支持

## 9. 集成说明

全屏3D查看器作为独立模块，可以通过以下方式集成到主应用中：

```javascript
// 在主应用中调用
function openFullscreen3DViewer(modelFile) {
  const viewerContainer = document.getElementById('fullscreen-viewer');
  viewerContainer.style.display = 'block';
  
  const viewer = new FullScreen3DViewer('fullscreen-viewer');
  if (modelFile) {
    viewer.loadModel(modelFile);
  }
}
```

这个全屏3D查看器设计提供了完整的3D模型查看、编辑和打印准备功能，参考了嘉立创3D的优秀界面设计，同时针对我们的3D生成打印平台进行了优化和定制。