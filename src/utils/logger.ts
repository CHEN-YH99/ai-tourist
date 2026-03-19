/**
 * 前端日志工具
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = import.meta.env.DEV

  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  }

  info(message: string, ...args: any[]) {
    console.log(`[INFO] ${message}`, ...args)
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args)
  }

  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args)
    
    // 在生产环境发送到错误追踪服务
    if (!this.isDevelopment) {
      this.sendToErrorTracking(message, args)
    }
  }

  private sendToErrorTracking(message: string, args: any[]) {
    // 集成Sentry或其他错误追踪服务
    // if (window.Sentry) {
    //   window.Sentry.captureMessage(message, {
    //     level: 'error',
    //     extra: args
    //   })
    // }
  }
}

export const logger = new Logger()
