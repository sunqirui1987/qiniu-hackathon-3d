import type { ModelFile } from '@/types/model'

const DB_NAME = 'qiniu-3d-models'
const DB_VERSION = 1
const STORE_NAME = 'models'

class IndexedDBStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          objectStore.createIndex('name', 'name', { unique: false })
          objectStore.createIndex('category', 'category', { unique: false })
          objectStore.createIndex('createdAt', 'createdAt', { unique: false })
          objectStore.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        }
      }
    })
  }

  async saveModel(model: ModelFile): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(model)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to save model'))
    })
  }

  async saveModels(models: ModelFile[]): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      let successCount = 0
      models.forEach((model) => {
        const request = store.put(model)
        request.onsuccess = () => {
          successCount++
          if (successCount === models.length) {
            resolve()
          }
        }
        request.onerror = () => reject(new Error('Failed to save models'))
      })
    })
  }

  async getModel(id: string): Promise<ModelFile | undefined> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get model'))
    })
  }

  async getAllModels(): Promise<ModelFile[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get all models'))
    })
  }

  async deleteModel(id: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to delete model'))
    })
  }

  async deleteModels(ids: string[]): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      let successCount = 0
      ids.forEach((id) => {
        const request = store.delete(id)
        request.onsuccess = () => {
          successCount++
          if (successCount === ids.length) {
            resolve()
          }
        }
        request.onerror = () => reject(new Error('Failed to delete models'))
      })
    })
  }

  async clearAll(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to clear database'))
    })
  }

  async searchByName(query: string): Promise<ModelFile[]> {
    const allModels = await this.getAllModels()
    const lowerQuery = query.toLowerCase()
    return allModels.filter((model) =>
      model.name.toLowerCase().includes(lowerQuery)
    )
  }

  async searchByCategory(category: string): Promise<ModelFile[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('category')
      const request = index.getAll(category)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to search by category'))
    })
  }

  async searchByTag(tag: string): Promise<ModelFile[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('tags')
      const request = index.getAll(tag)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to search by tag'))
    })
  }

  async exportDatabase(): Promise<string> {
    const models = await this.getAllModels()
    return JSON.stringify({
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      models
    }, null, 2)
  }

  async importDatabase(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data)
      
      if (!parsed.models || !Array.isArray(parsed.models)) {
        throw new Error('Invalid database format')
      }

      await this.clearAll()
      await this.saveModels(parsed.models)
    } catch (error) {
      throw new Error('Failed to import database: ' + (error as Error).message)
    }
  }
}

export const indexedDB = new IndexedDBStorage()
