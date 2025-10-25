global.FormData = class FormData {
  private data: Map<string, unknown> = new Map()
  
  append(key: string, value: unknown) {
    this.data.set(key, value)
  }
  
  get(key: string) {
    return this.data.get(key)
  }
} as typeof FormData

global.File = class File {
  constructor(
    public parts: BlobPart[],
    public filename: string,
    public options?: FilePropertyBag
  ) {}
} as typeof File
