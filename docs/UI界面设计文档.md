# 3D生成打印平台 UI界面设计文档

## 1. 设计概述

本文档详细描述了3D生成打印平台的用户界面设计，包括主界面、全屏3D查看器等核心功能模块的界面设计规范。设计风格以现代化、简洁、专业为主，参考嘉立创3D等优秀3D设计软件的界面布局。

## 2. 设计系统

### 2.1 色彩系统
- **主色调**: #2563eb (蓝色) - 用于主要按钮、链接、选中状态
- **辅助色**: #64748b (灰蓝色) - 用于次要信息、图标
- **背景色**: #f8fafc (浅灰白) - 页面主背景
- **深色背景**: #1e293b (深灰蓝) - 3D查看器背景、卡片悬浮
- **成功色**: #10b981 (绿色) - 成功提示、完成状态
- **警告色**: #f59e0b (橙色) - 警告提示、处理中状态
- **错误色**: #ef4444 (红色) - 错误提示、失败状态
- **信息色**: #3b82f6 (天蓝色) - 信息提示
- **文字色**: 
  - 主要文字: #0f172a (深色)
  - 次要文字: #64748b (灰色)
  - 禁用文字: #94a3b8 (浅灰)
  - 反色文字: #ffffff (白色)

### 2.2 字体系统
- **主字体**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif
- **代码字体**: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace
- **字体大小规范**:
  - 12px (小号) - 次要信息、辅助说明
  - 14px (正文) - 正文内容、表单标签
  - 16px (中标题) - 卡片标题、按钮文字
  - 18px (大标题) - 页面子标题
  - 24px (主标题) - 页面主标题
  - 32px (特大标题) - Hero区域标题
- **字重规范**:
  - 400 (Regular) - 正文
  - 500 (Medium) - 强调文字
  - 600 (Semibold) - 标题
  - 700 (Bold) - 重要标题

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
  
### 6.2 视角控制组件

```vue
<!-- ViewControls.vue -->
<template>
  <div class="view-controls">
    <button 
      v-for="view in viewTypes" 
      :key="view.type"
      class="view-btn" 
      @click="$emit('view-change', view.type)"
      :title="view.label"
    >
      {{ view.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'view-change': [viewType: string]
}>()

const viewTypes = [
  { type: 'front', label: '前' },
  { type: 'back', label: '后' },
  { type: 'left', label: '左' },
  { type: 'right', label: '右' },
  { type: 'top', label: '顶' },
  { type: 'bottom', label: '底' },
  { type: 'iso', label: '等轴' }
]
</script>
```

### 6.3 文件面板组件

```vue
<!-- FilePanel.vue -->
<template>
  <div class="side-panel file-panel" :class="{ collapsed }">
    <div class="panel-header">
      <h3>模型文件</h3>
      <button class="collapse-btn" @click="toggleCollapse">
        <i class="icon-chevron-left"></i>
      </button>
    </div>
    <div class="panel-content" v-if="!collapsed">
      <div class="file-tree">
        <div 
          v-for="file in files" 
          :key="file.id"
          class="file-item"
          :class="{ active: file.active }"
          @click="$emit('file-select', file.id)"
        >
          <i class="icon-cube"></i>
          <span>{{ file.name }}</span>
          <div class="file-actions">
            <button class="action-btn" title="隐藏">
              <i class="icon-eye-off"></i>
            </button>
            <button 
              class="action-btn" 
              title="删除"
              @click.stop="$emit('file-delete', file.id)"
            >
              <i class="icon-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FileItem {
  id: string
  name: string
  active: boolean
}

interface Props {
  collapsed: boolean
  files: FileItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'file-select': [fileId: string]
  'file-delete': [fileId: string]
}>()

const toggleCollapse = () => {
  emit('update:collapsed', !props.collapsed)
}
</script>
```

### 6.4 属性面板组件

```vue
<!-- PropertiesPanel.vue -->
<template>
  <div class="side-panel properties-panel" :class="{ collapsed }">
    <div class="panel-header">
      <h3>属性设置</h3>
      <button class="collapse-btn" @click="toggleCollapse">
        <i class="icon-chevron-right"></i>
      </button>
    </div>
    <div class="panel-content" v-if="!collapsed">
      <!-- 变换控制 -->
      <div class="property-group">
        <h4>变换</h4>
        <div class="transform-controls">
          <div class="control-row">
            <label>位置 X</label>
            <input 
              type="number" 
              :value="transform.x" 
              @input="updateTransform('x', $event)"
              step="0.1"
            >
          </div>
          <div class="control-row">
            <label>位置 Y</label>
            <input 
              type="number" 
              :value="transform.y" 
              @input="updateTransform('y', $event)"
              step="0.1"
            >
          </div>
          <div class="control-row">
            <label>位置 Z</label>
            <input 
              type="number" 
              :value="transform.z" 
              @input="updateTransform('z', $event)"
              step="0.1"
            >
          </div>
        </div>
      </div>
      
      <!-- 材质设置 -->
      <div class="property-group">
        <h4>材质</h4>
        <div class="material-controls">
          <div class="control-row">
             <label>颜色</label>
             <input 
               type="color" 
               :value="material.color" 
               @input="updateMaterial('color', $event)"
             >
           </div>
           <div class="control-row">
             <label>透明度</label>
             <input 
               type="range" 
               :value="material.opacity" 
               @input="updateMaterial('opacity', $event)"
               min="0" 
               max="1" 
               step="0.1"
             >
           </div>
         </div>
       </div>
       
       <!-- 打印设置 -->
       <div class="property-group">
         <h4>打印设置</h4>
         <div class="print-controls">
           <div class="control-row">
             <label>层高</label>
             <select 
               :value="printSettings.layerHeight" 
               @change="updatePrintSettings('layerHeight', $event)"
             >
               <option value="0.1">0.1mm</option>
               <option value="0.2">0.2mm</option>
               <option value="0.3">0.3mm</option>
             </select>
           </div>
           <div class="control-row">
             <label>填充密度</label>
             <input 
               type="range" 
               :value="printSettings.infillDensity" 
               @input="updatePrintSettings('infillDensity', $event)"
               min="0" 
               max="100"
             >
             <span>{{ printSettings.infillDensity }}%</span>
           </div>
         </div>
       </div>
     </div>
   </div>
 </template>
 
 <script setup lang="ts">
 import { ref, computed } from 'vue'
 import * as BABYLON from 'babylonjs'
 
 interface Props {
   collapsed: boolean
   model: BABYLON.AbstractMesh | null
 }
 
 const props = defineProps<Props>()
 
 const emit = defineEmits<{
   'update:collapsed': [value: boolean]
   'transform-change': [transform: { x: number; y: number; z: number }]
   'material-change': [material: { color: string; opacity: number }]
   'print-settings-change': [settings: { layerHeight: number; infillDensity: number }]
 }>()
 
 // 响应式数据
 const transform = ref({ x: 0, y: 0, z: 0 })
 const material = ref({ color: '#ff6b6b', opacity: 1 })
 const printSettings = ref({ layerHeight: 0.2, infillDensity: 20 })
 
 // 方法
 const toggleCollapse = () => {
   emit('update:collapsed', !props.collapsed)
 }
 
 const updateTransform = (axis: 'x' | 'y' | 'z', event: Event) => {
   const value = parseFloat((event.target as HTMLInputElement).value)
   transform.value[axis] = value
   emit('transform-change', { ...transform.value })
 }
 
 const updateMaterial = (property: 'color' | 'opacity', event: Event) => {
   const value = (event.target as HTMLInputElement).value
   if (property === 'color') {
     material.value.color = value
   } else {
     material.value.opacity = parseFloat(value)
   }
   emit('material-change', { ...material.value })
 }
 
 const updatePrintSettings = (property: 'layerHeight' | 'infillDensity', event: Event) => {
   const value = parseFloat((event.target as HTMLInputElement | HTMLSelectElement).value)
   printSettings.value[property] = value
   emit('print-settings-change', { ...printSettings.value })
 }
 </script>
 ```
 
 ### 6.5 底部工具栏组件
 
 ```vue
 <!-- BottomToolbar.vue -->
 <template>
   <div class="bottom-toolbar" :class="{ hidden: isHidden }">
     <div class="tool-group">
       <button 
         v-for="tool in tools" 
         :key="tool.id"
         class="tool-btn"
         :class="{ active: activeTool === tool.id }"
         @click="$emit('tool-select', tool.id)"
         :title="tool.tooltip"
       >
         <i :class="tool.icon"></i>
         <span>{{ tool.label }}</span>
       </button>
     </div>
   </div>
 </template>
 
 <script setup lang="ts">
 interface Props {
   activeTool: string
   isHidden?: boolean
 }
 
 defineProps<Props>()
 
 const emit = defineEmits<{
   'tool-select': [toolId: string]
 }>()
 
 const tools = [
   { id: 'home-tool', icon: 'icon-home', label: '回到原点', tooltip: '回到原点' },
   { id: 'rotate-tool', icon: 'icon-rotate', label: '旋转', tooltip: '旋转' },
   { id: 'measure-tool', icon: 'icon-ruler', label: '测量 (M)', tooltip: '测量 (M)' },
   { id: 'properties-tool', icon: 'icon-cube', label: '模型属性', tooltip: '模型属性' },
   { id: 'move-tool', icon: 'icon-move', label: '平移', tooltip: '平移' },
   { id: 'create-tool', icon: 'icon-plus', label: '创建', tooltip: '创建' },
   { id: 'tree-tool', icon: 'icon-tree', label: '结构树', tooltip: '结构树' },
   { id: 'box-tool', icon: 'icon-box', label: '包装盒', tooltip: '包装盒' },
   { id: 'drag-tool', icon: 'icon-hand', label: '拖动', tooltip: '拖动' },
   { id: 'color-tool', icon: 'icon-palette', label: '自由上色', tooltip: '自由上色' },
   { id: 'fullscreen-tool', icon: 'icon-fullscreen', label: '全屏', tooltip: '全屏' },
   { id: 'settings-tool', icon: 'icon-settings', label: '设置', tooltip: '设置' }
 ]
 </script>
 ```
 
 ### 6.6 Vue3 Composables
 
 #### use3DViewer Composable
 
 ```typescript
 // composables/use3DViewer.ts
 import { ref, onUnmounted } from 'vue'
 import * as BABYLON from 'babylonjs'
 import 'babylonjs-loaders'
 
 export function use3DViewer() {
   const engine = ref<BABYLON.Engine | null>(null)
   const scene = ref<BABYLON.Scene | null>(null)
   const camera = ref<BABYLON.ArcRotateCamera | null>(null)
   const canvas = ref<HTMLCanvasElement | null>(null)
 
   const initBabylon = async (canvasElement: HTMLCanvasElement) => {
     canvas.value = canvasElement
     engine.value = new BABYLON.Engine(canvasElement, true)
     
     // 创建场景
     scene.value = new BABYLON.Scene(engine.value)
     scene.value.clearColor = new BABYLON.Color3(0.94, 0.96, 0.97)
     
     // 创建相机
     camera.value = new BABYLON.ArcRotateCamera(
       "camera",
       -Math.PI / 2,
       Math.PI / 2.5,
       10,
       BABYLON.Vector3.Zero(),
       scene.value
     )
     camera.value.attachControls(canvasElement, true)
     
     // 创建光源
     const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene.value)
     light.intensity = 0.7
     
     const directionalLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -1, -1), scene.value)
     directionalLight.intensity = 0.5
     
     // 渲染循环
     engine.value.runRenderLoop(() => {
       scene.value?.render()
     })
     
     // 窗口大小调整
     window.addEventListener('resize', () => {
       engine.value?.resize()
     })
   }
 
   const loadModel = async (file: File): Promise<BABYLON.AbstractMesh | null> => {
     if (!scene.value) return null
     
     return new Promise((resolve, reject) => {
       const extension = file.name.split('.').pop()?.toLowerCase()
       
       if (['3mf', 'stl', 'obj', 'glb'].includes(extension || '')) {
         BABYLON.SceneLoader.ImportMesh("", "", file, scene.value!, (meshes) => {
           resolve(meshes[0] || null)
         }, undefined, (error) => {
           reject(error)
         })
       } else {
         reject(new Error('不支持的文件格式'))
       }
     })
   }
 
   const setupModel = (mesh: BABYLON.AbstractMesh) => {
     // 居中模型
     const boundingInfo = mesh.getBoundingInfo()
     const center = boundingInfo.boundingBox.centerWorld
     mesh.position = mesh.position.subtract(center)
     
     // 调整相机位置
     const size = boundingInfo.boundingBox.extendSizeWorld
     const maxSize = Math.max(size.x, size.y, size.z)
     if (camera.value) {
       camera.value.radius = maxSize * 3
     }
     
     // 设置默认材质
     if (!mesh.material && scene.value) {
       const material = new BABYLON.StandardMaterial("modelMaterial", scene.value)
       material.diffuseColor = new BABYLON.Color3(1, 0.42, 0.42)
       mesh.material = material
     }
   }
 
   const createGrid = () => {
     if (!scene.value) return
     
     const gridSize = 20
     const gridSpacing = 1
     
     // 创建网格线
     for (let i = -gridSize; i <= gridSize; i++) {
       // X方向线
       const lineX = BABYLON.MeshBuilder.CreateLines("lineX" + i, {
         points: [
           new BABYLON.Vector3(-gridSize, 0, i * gridSpacing),
           new BABYLON.Vector3(gridSize, 0, i * gridSpacing)
         ]
       }, scene.value)
       lineX.color = new BABYLON.Color3(0.7, 0.7, 0.7)
       
       // Z方向线
       const lineZ = BABYLON.MeshBuilder.CreateLines("lineZ" + i, {
         points: [
           new BABYLON.Vector3(i * gridSpacing, 0, -gridSize),
           new BABYLON.Vector3(i * gridSpacing, 0, gridSize)
         ]
       }, scene.value)
       lineZ.color = new BABYLON.Color3(0.7, 0.7, 0.7)
     }
   }
 
   const dispose = () => {
     engine.value?.dispose()
   }
 
   onUnmounted(() => {
     dispose()
   })
 
   return {
     engine,
     scene,
     camera,
     initBabylon,
     loadModel,
     setupModel,
     createGrid,
     dispose
   }
 }
 ```
 
 #### useKeyboardShortcuts Composable
 
 ```typescript
 // composables/useKeyboardShortcuts.ts
 import { onMounted, onUnmounted } from 'vue'
 
 type ShortcutHandler = () => void
 type ShortcutMap = Record<string, ShortcutHandler>
 
 export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
   const handleKeydown = (event: KeyboardEvent) => {
     const key = event.key.toLowerCase()
     const ctrl = event.ctrlKey || event.metaKey
     const shift = event.shiftKey
     const alt = event.altKey
     
     // 构建快捷键字符串
     let shortcut = ''
     if (ctrl) shortcut += 'ctrl+'
     if (shift) shortcut += 'shift+'
     if (alt) shortcut += 'alt+'
     shortcut += key
     
     // 检查是否有匹配的快捷键
     const handler = shortcuts[shortcut] || shortcuts[key]
     if (handler) {
       event.preventDefault()
       handler()
     }
   }
 
   onMounted(() => {
     document.addEventListener('keydown', handleKeydown)
   })
 
   onUnmounted(() => {
     document.removeEventListener('keydown', handleKeydown)
   })
 }
 ```
        
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

## 9. Vue3 集成说明

### 9.1 在主应用中使用全屏3D查看器

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <!-- 主界面内容 -->
    <div class="main-content">
      <button @click="openViewer" class="open-viewer-btn">
        打开3D查看器
      </button>
    </div>
    
    <!-- 全屏3D查看器 -->
    <FullScreen3DViewer
      v-model:visible="viewerVisible"
      :initial-file="selectedFile"
      @close="handleViewerClose"
      @file-loaded="handleFileLoaded"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FullScreen3DViewer from '@/components/FullScreen3DViewer.vue'

const viewerVisible = ref(false)
const selectedFile = ref<File | undefined>()

const openViewer = (file?: File) => {
  selectedFile.value = file
  viewerVisible.value = true
}

const handleViewerClose = () => {
  viewerVisible.value = false
  selectedFile.value = undefined
}

const handleFileLoaded = (file: File) => {
  console.log('文件已加载:', file.name)
}

const handleError = (error: string) => {
  console.error('3D查看器错误:', error)
}
</script>
```

### 9.2 路由集成 (Vue Router)

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Viewer3D from '@/views/Viewer3D.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/viewer/:fileId?',
    name: 'Viewer3D',
    component: Viewer3D,
    props: true
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

```vue
<!-- views/Viewer3D.vue -->
<template>
  <FullScreen3DViewer
    :model-visible="true"
    :initial-file="initialFile"
    @close="$router.push('/')"
    @file-loaded="handleFileLoaded"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FullScreen3DViewer from '@/components/FullScreen3DViewer.vue'

interface Props {
  fileId?: string
}

const props = defineProps<Props>()
const route = useRoute()
const initialFile = ref<File>()

onMounted(async () => {
  if (props.fileId) {
    // 根据fileId加载文件
    initialFile.value = await loadFileById(props.fileId)
  }
})

const loadFileById = async (id: string): Promise<File> => {
  // 实现文件加载逻辑
  // 这里可以从API或本地存储加载文件
  throw new Error('文件加载功能待实现')
}

const handleFileLoaded = (file: File) => {
  console.log('文件已加载:', file.name)
}
</script>
```

### 9.3 状态管理集成 (Pinia)

```typescript
// stores/viewer3d.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useViewer3DStore = defineStore('viewer3d', () => {
  const isVisible = ref(false)
  const currentFile = ref<File | null>(null)
  const viewerSettings = ref({
    showGrid: true,
    backgroundColor: '#f0f4f8',
    cameraSpeed: 1.0
  })

  const openViewer = (file?: File) => {
    currentFile.value = file || null
    isVisible.value = true
  }

  const closeViewer = () => {
    isVisible.value = false
    currentFile.value = null
  }

  const updateSettings = (settings: Partial<typeof viewerSettings.value>) => {
    viewerSettings.value = { ...viewerSettings.value, ...settings }
  }

  return {
    isVisible,
    currentFile,
    viewerSettings,
    openViewer,
    closeViewer,
    updateSettings
  }
})
```

### 9.4 TypeScript 类型定义

```typescript
// types/viewer3d.ts
import * as BABYLON from 'babylonjs'

export interface ModelFile {
  id: string
  name: string
  size: number
  type: string
  lastModified: number
  active: boolean
}

export interface Transform3D {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
}

export interface Material3D {
  color: string
  opacity: number
  metallic: number
  roughness: number
}

export interface PrintSettings {
  layerHeight: number
  infillDensity: number
  printSpeed: number
  temperature: number
  bedTemperature: number
}

export interface ViewerConfig {
  showGrid: boolean
  backgroundColor: string
  cameraSpeed: number
  autoRotate: boolean
}

export interface Viewer3DEvents {
  'model-loaded': [mesh: BABYLON.AbstractMesh]
  'model-selected': [mesh: BABYLON.AbstractMesh]
  'transform-changed': [transform: Transform3D]
  'material-changed': [material: Material3D]
  'view-changed': [viewType: string]
  'tool-selected': [toolId: string]
  'error': [error: string]
}
```

### 9.5 项目结构

```
src/
├── components/
│   ├── FullScreen3DViewer.vue      # 主查看器组件
│   ├── ViewControls.vue            # 视角控制组件
│   ├── FilePanel.vue               # 文件面板组件
│   ├── PropertiesPanel.vue         # 属性面板组件
│   └── BottomToolbar.vue           # 底部工具栏组件
├── composables/
│   ├── use3DViewer.ts              # 3D查看器逻辑
│   ├── useKeyboardShortcuts.ts     # 键盘快捷键
│   └── useFileManager.ts           # 文件管理
├── stores/
│   └── viewer3d.ts                 # Pinia状态管理
├── types/
│   └── viewer3d.ts                 # TypeScript类型定义
└── views/
    └── Viewer3D.vue                # 3D查看器页面
```

这个基于Vue3的全屏3D查看器设计提供了完整的组件化架构，使用了Vue3的最新特性如Composition API、TypeScript支持、响应式系统等，同时保持了与原设计相同的功能和用户体验。通过模块化的组件设计，可以轻松地在不同的Vue3项目中复用和扩展。