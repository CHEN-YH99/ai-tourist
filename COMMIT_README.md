# 性能优化 Git 提交指南

## 🎯 目标

为本次性能优化提供标准化的 Git 提交流程和工具。

---

## 🚀 快速开始

### 方式 1：使用自动化脚本（推荐）

#### Windows (PowerShell)
```powershell
.\scripts\commit-optimization.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x scripts/commit-optimization.sh
./scripts/commit-optimization.sh
```

脚本会引导你完成整个提交流程：
1. 显示当前更改
2. 选择提交方式（分批/单次/自定义）
3. 自动生成标准化的提交信息
4. 可选推送到远程仓库

### 方式 2：手动提交

参考 [GIT_COMMIT_QUICK_REFERENCE.md](./GIT_COMMIT_QUICK_REFERENCE.md) 中的模板。

---

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `.gitmessage` | Git 提交模板 |
| `GIT_COMMIT_GUIDE.md` | 详细的提交规范指南 |
| `GIT_COMMIT_QUICK_REFERENCE.md` | 快速参考卡片 |
| `scripts/commit-optimization.sh` | Bash 提交脚本 |
| `scripts/commit-optimization.ps1` | PowerShell 提交脚本 |
| `COMMIT_README.md` | 本文件 |

---

## 🎨 提交方式对比

### 方案 A：分批提交（推荐）

**优点**：
- ✅ 提交历史清晰
- ✅ 易于回滚单个优化
- ✅ 便于代码审查
- ✅ 符合最佳实践

**提交数量**：7 个提交
1. 虚拟滚动
2. 图片懒加载
3. 前端缓存
4. Bundle 优化
5. 性能监控工具
6. 后端优化
7. 文档

### 方案 B：单次提交

**优点**：
- ✅ 快速简单
- ✅ 适合个人项目

**缺点**：
- ❌ 提交历史不够细致
- ❌ 难以回滚单个优化

**提交数量**：1 个提交

### 方案 C：自定义

完全手动控制，适合有特殊需求的情况。

---

## 📝 提交信息规范

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 示例

```
perf(cache): implement LRU cache system

- Create FrontendCache class with TTL and LRU eviction
- Integrate cache into search API
- Integrate cache into destination API
- Add automatic cleanup for expired entries

Cache Configuration:
- Search: 5min TTL, 50 entries
- Destination: 10min TTL, 100 entries
- Expected hit rate: 60-70%

Performance:
- Repeated queries: 500ms → 5ms (99% improvement)
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `perf` | 性能优化 | `perf(cache): implement LRU cache` |
| `feat` | 新功能 | `feat(ui): add lazy loading` |
| `fix` | 修复 | `fix(api): handle timeout` |
| `docs` | 文档 | `docs: update README` |
| `build` | 构建 | `build(vite): optimize bundle` |
| `refactor` | 重构 | `refactor(api): simplify logic` |

### Scope 范围

- `ui` - UI 组件
- `cache` - 缓存系统
- `backend` - 后端
- `utils` - 工具函数
- `api` - API 层
- `config` - 配置

---

## 🔧 配置 Git 提交模板

### 设置本地模板

```bash
git config --local commit.template .gitmessage
```

之后每次 `git commit` 会自动加载模板。

### 设置全局模板（可选）

```bash
git config --global commit.template ~/.gitmessage
cp .gitmessage ~/.gitmessage
```

---

## 📊 查看提交历史

### 简洁日志
```bash
git log --oneline
```

### 图形化日志
```bash
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'
```

### 查看特定文件历史
```bash
git log --follow -- src/utils/cache.ts
```

### 查看统计信息
```bash
git log --stat
```

---

## 🎯 提交前检查清单

- [ ] 代码已测试
- [ ] 无 TypeScript 错误（运行 `npm run build`）
- [ ] 无 ESLint 警告（运行 `npm run lint`）
- [ ] 提交信息清晰准确
- [ ] 相关文件已添加
- [ ] 敏感信息已移除（API 密钥等）
- [ ] 文档已更新

---

## 🐛 常见问题

### Q: 如何修改最后一次提交？

```bash
# 修改提交信息
git commit --amend

# 添加遗漏的文件
git add forgotten-file.ts
git commit --amend --no-edit
```

### Q: 如何撤销提交？

```bash
# 撤销最后一次提交，保留更改
git reset --soft HEAD~1

# 撤销最后一次提交，丢弃更改
git reset --hard HEAD~1
```

### Q: 如何查看某次提交的详细信息？

```bash
git show <commit-hash>
```

### Q: 如何合并多个提交？

```bash
# 交互式 rebase
git rebase -i HEAD~3

# 然后选择 squash 或 fixup
```

---

## 📚 参考资源

### 官方规范
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

### 工具
- [Commitizen](https://github.com/commitizen/cz-cli) - 交互式提交工具
- [Commitlint](https://commitlint.js.org/) - 提交信息校验
- [Husky](https://typicode.github.io/husky/) - Git hooks

---

## 💡 最佳实践

### 1. 提交频率
- ✅ 每完成一个功能就提交
- ✅ 提交应该是原子性的（一个提交只做一件事）
- ❌ 不要积累太多更改后一次性提交

### 2. 提交信息
- ✅ 使用祈使句（"add" 而不是 "added"）
- ✅ 首字母小写
- ✅ 不要以句号结尾
- ✅ 说明"做了什么"和"为什么"

### 3. 提交内容
- ✅ 只提交相关的更改
- ✅ 使用 `.gitignore` 排除不必要的文件
- ❌ 不要提交生成的文件（`dist/`, `node_modules/`）
- ❌ 不要提交敏感信息

---

## 🎓 学习资源

### 视频教程
- [Git 提交规范](https://www.youtube.com/watch?v=example)
- [Conventional Commits 详解](https://www.youtube.com/watch?v=example)

### 文章
- [如何写好 Git 提交信息](https://chris.beams.io/posts/git-commit/)
- [Conventional Commits 实践指南](https://www.conventionalcommits.org/)

---

## 🤝 贡献

如果你有改进建议，欢迎：
1. 提交 Issue
2. 创建 Pull Request
3. 更新文档

---

## 📞 支持

遇到问题？查看：
- [GIT_COMMIT_GUIDE.md](./GIT_COMMIT_GUIDE.md) - 详细指南
- [GIT_COMMIT_QUICK_REFERENCE.md](./GIT_COMMIT_QUICK_REFERENCE.md) - 快速参考

---

**最后更新**：2026-03-19  
**版本**：1.0.0
