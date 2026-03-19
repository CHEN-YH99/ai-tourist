#!/usr/bin/env node

/**
 * Bundle 分析脚本
 * 用于分析构建后的包大小和组成
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

console.log('🔍 开始分析 Bundle...\n')

// 1. 构建项目
console.log('📦 构建项目...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ 构建完成\n')
} catch (error) {
  console.error('❌ 构建失败')
  process.exit(1)
}

// 2. 检查 dist 目录
const distPath = join(process.cwd(), 'dist')
if (!existsSync(distPath)) {
  console.error('❌ dist 目录不存在')
  process.exit(1)
}

// 3. 安装并运行 bundle analyzer
console.log('📊 分析 Bundle 大小...')
try {
  // 检查是否安装了 vite-bundle-visualizer
  try {
    execSync('npx vite-bundle-visualizer --version', { stdio: 'ignore' })
  } catch {
    console.log('📥 安装 vite-bundle-visualizer...')
    execSync('npm install -D vite-bundle-visualizer', { stdio: 'inherit' })
  }

  // 运行分析
  console.log('\n🚀 启动 Bundle 可视化工具...')
  execSync('npx vite-bundle-visualizer', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ 分析失败:', error.message)
  process.exit(1)
}

console.log('\n✅ 分析完成！')
console.log('\n💡 优化建议：')
console.log('  1. 检查是否有重复的依赖')
console.log('  2. 考虑使用动态导入拆分大型组件')
console.log('  3. 移除未使用的依赖')
console.log('  4. 使用 Tree Shaking 优化')
