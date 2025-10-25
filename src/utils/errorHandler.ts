export class GenerationError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'GenerationError'
  }
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof GenerationError) {
    return error.message
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('econnaborted')) {
      return '网络连接失败，请检查您的网络设置后重试'
    }

    if (message.includes('timeout')) {
      return '请求超时，请稍后重试'
    }

    if (message.includes('401') || message.includes('unauthorized')) {
      return 'API密钥无效，请检查您的认证信息'
    }

    if (message.includes('402') || message.includes('credits')) {
      return '账户余额不足，请充值后继续使用'
    }

    if (message.includes('429') || message.includes('rate limit')) {
      return '请求过于频繁，请稍后再试'
    }

    if (message.includes('cancelled')) {
      return '任务已被取消'
    }

    if (message.includes('expired')) {
      return '任务已过期，请重新生成'
    }

    return error.message
  }

  return '发生未知错误，请稍后重试'
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof GenerationError) {
    return error.retryable
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    const retryablePatterns = [
      'network',
      'timeout',
      'econnaborted',
      '429',
      'rate limit',
      '5',
    ]

    return retryablePatterns.some((pattern) => message.includes(pattern))
  }

  return false
}

export function shouldShowRetryButton(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    const noRetryPatterns = ['401', 'unauthorized', '402', 'credits', 'cancelled']

    return !noRetryPatterns.some((pattern) => message.includes(pattern))
  }

  return true
}
