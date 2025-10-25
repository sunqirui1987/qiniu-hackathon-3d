<template>
  <Card>
    <template #header>
      <h2 class="text-xl font-semibold">
        Bambu Connect
      </h2>
    </template>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div
            :class="[
              'w-3 h-3 rounded-full',
              connected ? 'bg-green-500' : 'bg-red-500',
            ]"
          />
          <span class="text-sm font-medium">
            {{ connected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>

        <Button
          :disabled="isChecking"
          @click="handleCheckConnection"
        >
          {{ isChecking ? 'Checking...' : 'Check Connection' }}
        </Button>
      </div>

      <div
        v-if="hasError"
        class="p-3 bg-red-50 border border-red-200 rounded-md"
      >
        <p class="text-sm text-red-600">
          {{ error }}
        </p>
      </div>

      <div
        v-if="connected && hasPrinters"
        class="space-y-3"
      >
        <div>
          <label
            for="printer"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Printer
          </label>
          <select
            id="printer"
            v-model="selectedPrinter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Choose a printer
            </option>
            <option
              v-for="printer in printers"
              :key="printer"
              :value="printer"
            >
              {{ printer }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="material"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Material
          </label>
          <select
            id="material"
            v-model="settings.material"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PLA">
              PLA
            </option>
            <option value="ABS">
              ABS
            </option>
            <option value="PETG">
              PETG
            </option>
            <option value="TPU">
              TPU
            </option>
          </select>
        </div>

        <div>
          <label
            for="layerHeight"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Layer Height (mm)
          </label>
          <input
            id="layerHeight"
            v-model.number="settings.layerHeight"
            type="number"
            step="0.01"
            min="0.1"
            max="0.4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <div>
          <label
            for="infillDensity"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Infill Density (%)
          </label>
          <input
            id="infillDensity"
            v-model.number="settings.infillDensity"
            type="number"
            step="5"
            min="0"
            max="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <div class="flex items-center">
          <input
            id="supports"
            v-model="settings.supports"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <label
            for="supports"
            class="ml-2 text-sm font-medium text-gray-700"
          >
            Enable Supports
          </label>
        </div>

        <div>
          <label
            for="temperature"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Temperature (°C) <span class="text-gray-500">(Optional)</span>
          </label>
          <input
            id="temperature"
            v-model.number="settings.temperature"
            type="number"
            step="5"
            min="180"
            max="280"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBambuConnect } from '@/composables/useBambuConnect'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { PrintSettings } from '@/types/print'

const emit = defineEmits<{
  settingsChange: [settings: PrintSettings]
  printerSelect: [printer: string]
}>()

const {
  connected,
  printers,
  error,
  isChecking,
  hasPrinters,
  hasError,
  checkBambuConnect,
} = useBambuConnect()

const selectedPrinter = ref<string>('')
const settings = ref<Omit<PrintSettings, 'printer'>>({
  material: 'PLA',
  layerHeight: 0.2,
  infillDensity: 20,
  supports: false,
  temperature: undefined,
})

const handleCheckConnection = async () => {
  await checkBambuConnect()
}

watch(selectedPrinter, (newPrinter) => {
  if (newPrinter) {
    emit('printerSelect', newPrinter)
    emit('settingsChange', {
      printer: newPrinter,
      ...settings.value,
    })
  }
})

watch(
  settings,
  (newSettings) => {
    if (selectedPrinter.value) {
      emit('settingsChange', {
        printer: selectedPrinter.value,
        ...newSettings,
      })
    }
  },
  { deep: true }
)
</script>
