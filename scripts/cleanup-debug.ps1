# 清理调试文件和代码脚本
# 用法: .\scripts\cleanup-debug.ps1

$ErrorActionPreference = "Stop"

Write-Host "🧹 开始清理调试文件和代码..." -ForegroundColor Green
Write-Host ""

# 定义要删除的调试文件
$debugFiles = @(
    "test-json-parse.js",
    "test-search-feature.js",
    "test-route-map.js",
    "test-all-combinations.js",
    "test-api-endpoints.js",
    "test-api-key.js",
    "test-auth-fix.html",
    "test-available-models.js",
    "test-chat-api.js",
    "test-correct-api.js",
    "test-gemini-api.js",
    "test-new-key.js",
    "test-search-api.js"
)

# 删除调试文件
Write-Host "📁 删除调试文件..." -ForegroundColor Blue
$deletedCount = 0
foreach ($file in $debugFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ 已删除: $file" -ForegroundColor Green
        $deletedCount++
    } else {
        Write-Host "  ⏭️  跳过（不存在）: $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📊 清理统计:" -ForegroundColor Cyan
Write-Host "  删除文件: $deletedCount 个" -ForegroundColor White
Write-Host ""

# 提示：console.log 会在生产构建时自动移除
Write-Host "💡 注意事项:" -ForegroundColor Yellow
Write-Host "  • console.log/info/debug 会在生产构建时自动移除（vite.config.ts 已配置）" -ForegroundColor White
Write-Host "  • console.error/warn 保留用于错误追踪" -ForegroundColor White
Write-Host "  • 开发环境的 console 语句保留用于调试" -ForegroundColor White
Write-Host ""

Write-Host "✅ 清理完成！" -ForegroundColor Green
