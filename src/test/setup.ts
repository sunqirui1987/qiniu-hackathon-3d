import { vi } from 'vitest'

global.FormData = class FormData {
  private data: Map<string, any> = new Map()
  
  append(key: string, value: any) {
    this.data.set(key, value)
  }
  
  get(key: string) {
    return this.data.get(key)
  }
} as any

global.File = class File {
  constructor(
    public parts: any[],
    public filename: string,
    public options?: any
  ) {}
} as any
