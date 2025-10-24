# UI Components Library

This directory contains reusable UI components built with Vue 3, TypeScript, and Tailwind CSS.

## Components

### Button

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger'` - Visual style (default: 'primary')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `disabled?: boolean` - Disabled state (default: false)
- `loading?: boolean` - Loading state with spinner (default: false)

**Events:**
- `@click` - Emitted when button is clicked (if not disabled or loading)

**Usage:**
```vue
<Button variant="primary" size="md" @click="handleClick">
  Click Me
</Button>

<Button variant="danger" :loading="isLoading">
  Submit
</Button>
```

---

### Card

A container component with header, body, and footer slots.

**Props:**
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Internal padding (default: 'md')
- `shadow?: boolean` - Show shadow (default: true)
- `hoverable?: boolean` - Add hover effect (default: false)

**Slots:**
- `header` - Card header section
- `default` - Card body content
- `footer` - Card footer section

**Usage:**
```vue
<Card padding="lg" :hoverable="true">
  <template #header>
    <h2>Card Title</h2>
  </template>
  <p>Card content goes here</p>
  <template #footer>
    <Button>Action</Button>
  </template>
</Card>
```

---

### Modal

A modal dialog component with overlay and transitions.

**Props:**
- `modelValue: boolean` - Controls visibility (v-model)
- `closable?: boolean` - Show close button (default: true)

**Slots:**
- `title` - Modal title
- `default` - Modal body content
- `footer` - Modal footer actions

**Events:**
- `@update:modelValue` - Emitted when modal state changes

**Usage:**
```vue
<Modal v-model="isOpen">
  <template #title>Confirm Action</template>
  <p>Are you sure you want to proceed?</p>
  <template #footer>
    <Button @click="isOpen = false">Cancel</Button>
    <Button variant="primary" @click="confirm">Confirm</Button>
  </template>
</Modal>
```

---

### ProgressBar

A progress indicator component.

**Props:**
- `progress: number` - Progress percentage (0-100)
- `label?: string` - Progress label text
- `color?: 'blue' | 'green' | 'red' | 'yellow'` - Bar color (default: 'blue')
- `showPercentage?: boolean` - Show percentage text (default: true)

**Usage:**
```vue
<ProgressBar :progress="75" label="Generating Model" color="green" />
<ProgressBar :progress="uploadProgress" :show-percentage="false" />
```

---

### Toast

A toast notification component.

**Props:**
- `message: string` - Notification message
- `type?: 'success' | 'error' | 'info' | 'warning'` - Toast type (default: 'info')
- `visible: boolean` - Controls visibility

**Usage:**
```vue
<Toast 
  :visible="showToast" 
  message="Operation successful!" 
  type="success" 
/>
```

**Better approach: Use ToastContainer + useToast composable**

---

### ToastContainer

A container component that manages multiple toast notifications.

**Usage:**
Add to your App.vue:
```vue
<template>
  <div id="app">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import { ToastContainer } from '@/components/ui'
</script>
```

Then use the `useToast` composable anywhere:
```vue
<script setup>
import { useToast } from '@/composables/useToast'

const toast = useToast()

const handleSuccess = () => {
  toast.success('Model generated successfully!')
}

const handleError = () => {
  toast.error('Failed to generate model', 5000)
}
</script>
```

---

## Import All Components

```typescript
import { Button, Card, Modal, ProgressBar, Toast, ToastContainer } from '@/components/ui'
```

## Type Definitions

Component prop types are defined in `@/types/components.ts`:
- `ButtonProps`
- `CardProps`
- `ModalProps`
- `ProgressBarProps`
- `ToastProps`
