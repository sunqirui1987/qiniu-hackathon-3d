export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export function createRequestQueue(concurrency: number = 3) {
  const queue: Array<() => Promise<unknown>> = []
  let activeCount = 0

  const processQueue = async () => {
    if (activeCount >= concurrency || queue.length === 0) {
      return
    }

    activeCount++
    const task = queue.shift()

    if (task) {
      try {
        await task()
      } finally {
        activeCount--
        processQueue()
      }
    }
  }

  return {
    add<T>(fn: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        queue.push(() =>
          fn()
            .then(resolve)
            .catch(reject)
        )
        processQueue()
      })
    },
    get size() {
      return queue.length
    },
    get active() {
      return activeCount
    },
  }
}
