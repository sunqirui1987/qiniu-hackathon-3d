export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface ModalProps {
  modelValue: boolean
  title?: string
  closable?: boolean
}

export interface ProgressBarProps {
  progress: number
  label?: string
  color?: 'blue' | 'green' | 'red' | 'yellow'
  showPercentage?: boolean
}

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  visible: boolean
  duration?: number
}

export interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: boolean
  hoverable?: boolean
}
