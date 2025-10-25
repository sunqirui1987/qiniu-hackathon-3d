import { ref } from 'vue'
import type { ModelFile } from '@/types/model'
import { indexedDB } from '@/utils/indexedDB'

export function useBatchOperations() {
  const isExporting = ref(false)
  const isPrinting = ref(false)

  const exportModels = async (models: ModelFile[]): Promise<void> => {
    isExporting.value = true
    
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        count: models.length,
        models: models.map(model => ({
          id: model.id,
          name: model.name,
          path: model.path,
          format: model.format,
          size: model.size,
          createdAt: model.createdAt,
          updatedAt: model.updatedAt,
          thumbnail: model.thumbnail,
          tags: model.tags,
          category: model.category,
          metadata: model.metadata
        }))
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `models-export-${new Date().getTime()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      throw new Error('Failed to export models')
    } finally {
      isExporting.value = false
    }
  }

  const exportSingleModel = async (model: ModelFile): Promise<void> => {
    await exportModels([model])
  }

  const printModels = async (models: ModelFile[]): Promise<void> => {
    isPrinting.value = true
    
    try {
      const printWindow = window.open('', '_blank')
      
      if (!printWindow) {
        throw new Error('Failed to open print window')
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Models - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 1200px;
              margin: 0 auto;
            }
            h1 {
              color: #333;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .model-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .model-card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              page-break-inside: avoid;
            }
            .model-card h3 {
              margin: 0 0 10px 0;
              color: #2563eb;
            }
            .model-info {
              font-size: 14px;
              line-height: 1.6;
            }
            .model-info div {
              margin: 5px 0;
            }
            .model-info strong {
              display: inline-block;
              width: 100px;
            }
            .tags {
              margin-top: 10px;
            }
            .tag {
              display: inline-block;
              background: #f3f4f6;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 12px;
              margin-right: 5px;
              margin-bottom: 5px;
            }
            @media print {
              body {
                padding: 0;
              }
              .model-card {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <h1>3D Models List - ${models.length} Model(s)</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          
          <div class="model-grid">
            ${models.map(model => `
              <div class="model-card">
                <h3>${model.name}</h3>
                <div class="model-info">
                  <div><strong>Format:</strong> ${model.format.toUpperCase()}</div>
                  <div><strong>Size:</strong> ${formatFileSize(model.size)}</div>
                  ${model.category ? `<div><strong>Category:</strong> ${model.category}</div>` : ''}
                  <div><strong>Created:</strong> ${new Date(model.createdAt).toLocaleDateString()}</div>
                  ${model.metadata?.faces ? `<div><strong>Faces:</strong> ${model.metadata.faces.toLocaleString()}</div>` : ''}
                  ${model.metadata?.vertices ? `<div><strong>Vertices:</strong> ${model.metadata.vertices.toLocaleString()}</div>` : ''}
                  ${model.tags.length > 0 ? `
                    <div class="tags">
                      <strong>Tags:</strong>
                      ${model.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `

      printWindow.document.write(printContent)
      printWindow.document.close()
    } catch (error) {
      console.error('Print failed:', error)
      throw new Error('Failed to print models')
    } finally {
      isPrinting.value = false
    }
  }

  const printSingleModel = async (model: ModelFile): Promise<void> => {
    await printModels([model])
  }

  const deleteModels = async (modelIds: string[]): Promise<void> => {
    try {
      await indexedDB.deleteModels(modelIds)
    } catch (error) {
      console.error('Delete failed:', error)
      throw new Error('Failed to delete models')
    }
  }

  const importModels = async (file: File): Promise<ModelFile[]> => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (!data.models || !Array.isArray(data.models)) {
        throw new Error('Invalid import file format')
      }

      const models: ModelFile[] = data.models.map((model: ModelFile) => ({
        ...model,
        createdAt: new Date(model.createdAt),
        updatedAt: new Date(model.updatedAt)
      }))

      await indexedDB.saveModels(models)
      
      return models
    } catch (error) {
      console.error('Import failed:', error)
      throw new Error('Failed to import models: ' + (error as Error).message)
    }
  }

  return {
    isExporting,
    isPrinting,
    exportModels,
    exportSingleModel,
    printModels,
    printSingleModel,
    deleteModels,
    importModels
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes) return 'N/A'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
