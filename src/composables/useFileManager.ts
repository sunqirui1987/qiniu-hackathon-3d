import { ref, computed } from 'vue'
import type { ModelFile, ModelIndex } from '@/types/model'

const STORAGE_KEY = 'model_file_index'
const DB_NAME = 'ModelLibraryDB'
const DB_VERSION = 1
const STORE_NAME = 'models'

export function useFileManager() {
  const fileIndex = ref<ModelIndex>({
    files: [],
    categories: [],
    tags: [],
    lastUpdated: new Date()
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const db = ref<IDBDatabase | null>(null)

  const initDB = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        error.value = 'Failed to open IndexedDB'
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        db.value = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
          objectStore.createIndex('name', 'name', { unique: false })
          objectStore.createIndex('category', 'category', { unique: false })
          objectStore.createIndex('createdAt', 'createdAt', { unique: false })
          objectStore.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        }
      }
    })
  }

  const loadIndex = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      await initDB()
      const files = await getAllFiles()
      const categories = new Set<string>()
      const tags = new Set<string>()

      files.forEach(file => {
        if (file.category) categories.add(file.category)
        file.tags.forEach(tag => tags.add(tag))
      })

      fileIndex.value = {
        files,
        categories: Array.from(categories),
        tags: Array.from(tags),
        lastUpdated: new Date()
      }

      saveIndexToLocalStorage()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load file index'
    } finally {
      isLoading.value = false
    }
  }

  const getAllFiles = async (): Promise<ModelFile[]> => {
    if (!db.value) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = db.value!.transaction([STORE_NAME], 'readonly')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.getAll()

      request.onsuccess = () => {
        resolve(request.result as ModelFile[])
      }

      request.onerror = () => {
        reject(new Error('Failed to retrieve files'))
      }
    })
  }

  const addFile = async (file: ModelFile): Promise<void> => {
    if (!db.value) await initDB()

    return new Promise((resolve, reject) => {
      const transaction = db.value!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.add(file)

      request.onsuccess = () => {
        fileIndex.value.files.push(file)
        updateCategories(file.category)
        updateTags(file.tags)
        fileIndex.value.lastUpdated = new Date()
        saveIndexToLocalStorage()
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to add file'))
      }
    })
  }

  const updateFile = async (id: string, updates: Partial<ModelFile>): Promise<void> => {
    if (!db.value) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = db.value!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const getRequest = objectStore.get(id)

      getRequest.onsuccess = () => {
        const file = getRequest.result as ModelFile
        if (!file) {
          reject(new Error('File not found'))
          return
        }

        const updatedFile = { ...file, ...updates, updatedAt: new Date() }
        const updateRequest = objectStore.put(updatedFile)

        updateRequest.onsuccess = () => {
          const index = fileIndex.value.files.findIndex(f => f.id === id)
          if (index !== -1) {
            fileIndex.value.files[index] = updatedFile
            if (updates.category) updateCategories(updates.category)
            if (updates.tags) updateTags(updates.tags)
            fileIndex.value.lastUpdated = new Date()
            saveIndexToLocalStorage()
          }
          resolve()
        }

        updateRequest.onerror = () => {
          reject(new Error('Failed to update file'))
        }
      }

      getRequest.onerror = () => {
        reject(new Error('Failed to get file'))
      }
    })
  }

  const deleteFile = async (id: string): Promise<void> => {
    if (!db.value) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = db.value!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.delete(id)

      request.onsuccess = () => {
        fileIndex.value.files = fileIndex.value.files.filter(f => f.id !== id)
        rebuildCategories()
        rebuildTags()
        fileIndex.value.lastUpdated = new Date()
        saveIndexToLocalStorage()
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete file'))
      }
    })
  }

  const renameFile = async (id: string, newName: string): Promise<void> => {
    await updateFile(id, { name: newName })
  }

  const getFileById = (id: string): ModelFile | undefined => {
    return fileIndex.value.files.find(f => f.id === id)
  }

  const getFilesByCategory = (category: string): ModelFile[] => {
    return fileIndex.value.files.filter(f => f.category === category)
  }

  const getFilesByTag = (tag: string): ModelFile[] => {
    return fileIndex.value.files.filter(f => f.tags.includes(tag))
  }

  const searchFiles = (query: string): ModelFile[] => {
    const lowerQuery = query.toLowerCase()
    return fileIndex.value.files.filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      (f.category && f.category.toLowerCase().includes(lowerQuery))
    )
  }

  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result
        if (arrayBuffer instanceof ArrayBuffer) {
          const blob = new Blob([arrayBuffer])
          const url = URL.createObjectURL(blob)
          resolve(url)
        } else {
          reject(new Error('Failed to read file'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to generate thumbnail'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  const updateCategories = (category?: string) => {
    if (category && !fileIndex.value.categories.includes(category)) {
      fileIndex.value.categories.push(category)
    }
  }

  const updateTags = (tags: string[]) => {
    tags.forEach(tag => {
      if (!fileIndex.value.tags.includes(tag)) {
        fileIndex.value.tags.push(tag)
      }
    })
  }

  const rebuildCategories = () => {
    const categories = new Set<string>()
    fileIndex.value.files.forEach(file => {
      if (file.category) categories.add(file.category)
    })
    fileIndex.value.categories = Array.from(categories)
  }

  const rebuildTags = () => {
    const tags = new Set<string>()
    fileIndex.value.files.forEach(file => {
      file.tags.forEach(tag => tags.add(tag))
    })
    fileIndex.value.tags = Array.from(tags)
  }

  const saveIndexToLocalStorage = () => {
    try {
      const indexData = {
        ...fileIndex.value,
        lastUpdated: fileIndex.value.lastUpdated.toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(indexData))
    } catch (e) {
      console.error('Failed to save index to localStorage:', e)
    }
  }

  const loadIndexFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        fileIndex.value = {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        }
      }
    } catch (e) {
      console.error('Failed to load index from localStorage:', e)
    }
  }

  const sortedFiles = computed(() => {
    return [...fileIndex.value.files].sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  })

  const fileCount = computed(() => fileIndex.value.files.length)

  const totalSize = computed(() =>
    fileIndex.value.files.reduce((sum, file) => sum + file.size, 0)
  )

  loadIndexFromLocalStorage()

  return {
    fileIndex,
    isLoading,
    error,
    sortedFiles,
    fileCount,
    totalSize,
    initDB,
    loadIndex,
    addFile,
    updateFile,
    deleteFile,
    renameFile,
    getFileById,
    getFilesByCategory,
    getFilesByTag,
    searchFiles,
    generateThumbnail
  }
}
