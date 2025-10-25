<template>
  <div class="space-y-4">
    <div>
      <label
        for="prompt-input"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        描述你想生成的3D模型
      </label>
      <textarea
        id="prompt-input"
        v-model="promptValue"
        rows="4"
        class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleInput"
      />
      <p class="mt-1 text-sm text-gray-500">
        {{ promptValue.length }} / 500 字符
      </p>
    </div>

    <div
      v-if="showAdvanced"
      class="space-y-4 p-4 bg-gray-50 rounded-md"
    >
      <h3 class="text-sm font-semibold text-gray-700 mb-3">
        高级参数
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            艺术风格
          </label>
          <select
            v-model="options.artStyle"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            :disabled="disabled"
          >
            <option value="realistic">
              写实风格
            </option>
            <option value="sculpture">
              雕塑风格
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            AI模型
          </label>
          <select
            v-model="options.aiModel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            :disabled="disabled"
          >
            <option value="meshy-4">
              Meshy-4
            </option>
            <option value="meshy-5">
              Meshy-5
            </option>
            <option value="latest">
              最新版本
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            拓扑类型
          </label>
          <select
            v-model="options.topology"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            :disabled="disabled"
          >
            <option value="triangle">
              三角形
            </option>
            <option value="quad">
              四边形
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            目标面数: {{ options.targetPolycount }}
          </label>
          <input
            v-model.number="options.targetPolycount"
            type="range"
            min="10000"
            max="100000"
            step="5000"
            class="w-full"
            :disabled="disabled"
          >
        </div>

        <div class="flex items-center">
          <input
            id="enable-pbr"
            v-model="options.enablePBR"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            :disabled="disabled"
          >
          <label
            for="enable-pbr"
            class="ml-2 text-sm text-gray-700"
          >
            启用PBR材质
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            随机种子 (可选)
          </label>
          <input
            v-model.number="options.seed"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="留空使用随机种子"
            :disabled="disabled"
          >
        </div>
      </div>

      <div v-if="options.enablePBR">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          纹理描述 (可选)
        </label>
        <input
          v-model="options.texturePrompt"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="描述纹理细节..."
          :disabled="disabled"
        >
      </div>
    </div>

    <div
      v-if="showTemplates"
      class="space-y-2"
    >
      <h3 class="text-sm font-semibold text-gray-700">
        预设模板
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          v-for="template in templates"
          :key="template.name"
          class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          :disabled="disabled"
          @click="applyTemplate(template.prompt)"
        >
          {{ template.name }}
        </button>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        class="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="showAdvanced = !showAdvanced"
      >
        {{ showAdvanced ? '隐藏' : '显示' }}高级参数
      </button>
      <button
        class="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="showTemplates = !showTemplates"
      >
        {{ showTemplates ? '隐藏' : '显示' }}预设模板
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface GenerateOptions {
  artStyle: 'realistic' | 'sculpture'
  aiModel: 'meshy-4' | 'meshy-5' | 'latest'
  topology: 'triangle' | 'quad'
  targetPolycount: number
  enablePBR: boolean
  seed?: number
  texturePrompt?: string
}

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

interface Template {
  name: string
  prompt: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '例如: 一只可爱的小猫，卡通风格，坐姿...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:options': [options: GenerateOptions]
}>()

const promptValue = ref(props.modelValue)
const showAdvanced = ref(false)
const showTemplates = ref(false)

const options = ref<GenerateOptions>({
  artStyle: 'realistic',
  aiModel: 'latest',
  topology: 'triangle',
  targetPolycount: 30000,
  enablePBR: true,
  seed: undefined,
  texturePrompt: '',
})

const templates: Template[] = [
  { name: '可爱小猫', prompt: '一只可爱的小猫，卡通风格，坐姿，大眼睛' },
  { name: '科幻机器人', prompt: '未来科幻机器人，金属质感，人形，科技感十足' },
  { name: '植物盆栽', prompt: '室内装饰盆栽，绿色植物，陶瓷花盆，简约风格' },
  { name: '玩具汽车', prompt: '儿童玩具汽车，鲜艳颜色，卡通造型，可爱风格' },
  { name: '抽象雕塑', prompt: '现代抽象艺术雕塑，几何形状，简约设计' },
  { name: '游戏道具', prompt: 'RPG游戏宝箱，木质纹理，金属装饰，魔法光效' },
  { name: '家具模型', prompt: '现代简约椅子，木质材料，北欧风格，舒适设计' },
  { name: '动物角色', prompt: '卡通风格小狗，可爱表情，站立姿势，友好形象' },
]

const handleInput = () => {
  if (promptValue.value.length > 500) {
    promptValue.value = promptValue.value.substring(0, 500)
  }
  emit('update:modelValue', promptValue.value)
}

const applyTemplate = (prompt: string) => {
  promptValue.value = prompt
  emit('update:modelValue', prompt)
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== promptValue.value) {
      promptValue.value = newValue || ''
    }
  }
)

watch(
  options,
  (newOptions) => {
    emit('update:options', { ...newOptions })
  },
  { deep: true }
)
</script>
