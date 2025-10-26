/**
 * Bambu Studio 客户端工具
 * 提供通过 bambustudioopen:// 协议打开 Bambu Studio 的功能
 */

export interface BambuStudioUploadResult {
  success: boolean
  message: string
  url?: string
}

export class BambuStudioClient {
  
  /**
   * 使用 bambustudioopen:// 协议打开文件
   * @param fileUrl 文件的公共URL
   * @returns 是否成功打开
   */
  static async openInBambuStudio(fileUrl: string): Promise<BambuStudioUploadResult> {
    try {
      const bambuUrl = `bambustudioopen://open?file=${encodeURIComponent(fileUrl)}`
      console.log('打开 Bambu Studio:', bambuUrl)
      
      // 尝试打开 Bambu Studio
      window.location.href = bambuUrl
      
      return {
        success: true,
        message: '已发送到 Bambu Studio'
      }
    } catch (error) {
      console.error('打开 Bambu Studio 失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '打开失败'
      }
    }
  }
  
  /**
   * 完整的打印流程：直接使用公网地址打开 Bambu Studio
   * @param modelUrl 模型文件的公网URL
   * @param fileName 文件名（用于日志记录）
   * @returns 操作结果
   */
  static async sendToBambuStudio(modelUrl: string, fileName: string): Promise<BambuStudioUploadResult> {
    try {
      console.log('发送模型到 Bambu Studio:', { modelUrl, fileName })
      
      // 直接使用公网地址打开 Bambu Studio
      const openResult = await this.openInBambuStudio(modelUrl)
      if (!openResult.success) {
        return {
          success: false,
          message: `打开 Bambu Studio 失败: ${openResult.message}`
        }
      }
      
      return {
        success: true,
        message: '文件已成功发送到 Bambu Studio'
      }
      
    } catch (error) {
      console.error('发送到 Bambu Studio 失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '发送失败'
      }
    }
  }
  
  /**
   * 检查是否支持 Bambu Studio 协议
   * @returns 是否支持
   */
  static isBambuStudioSupported(): boolean {
    // 检查是否在支持自定义协议的环境中
    return typeof window !== 'undefined' && 'location' in window
  }
}

export const bambuStudioClient = new BambuStudioClient()