# 项目说明 — 复旦431金融专硕备考知识库

## 这是什么

个人备考网站，帮助用户整理和复习复旦大学431金融专硕专业课知识点。
考试科目：货币银行学、公司理财、国际金融、投资学。

## 技术栈

- **前端**：React + Vite + Tailwind CSS
- **内容**：Markdown 文件（存放在 `/content/` 目录）
- **AI**：DeepSeek API（通过 Netlify Functions 代理），优先检索本地知识库
- **部署**：GitHub + Netlify 自动构建

## 核心功能

1. **手册模式**：左侧按科目/章节导航，右侧渲染 Markdown 内容
2. **闪卡模式**：3D 翻转卡片，已掌握/待复习标记，进度存 localStorage
3. **AI 助手**：先搜知识库，有结果标注「📚 基于知识库」，无结果标注「🤖 AI补充」
4. **全局搜索**：关键词实时过滤，高亮匹配词

## 如何添加知识点

在 `/content/科目名/章节名/` 下新建 `.md` 文件，格式：

```markdown
---
title: 知识点标题
subject: 货币银行学        # 货币银行学 / 公司理财 / 国际金融 / 投资学
chapter: 第X章-章节名
tags: [标签1, 标签2]
difficulty: medium         # easy / medium / hard
flashcard: true
---

## 问题
闪卡正面显示的问题

## 答案
详细答案，支持 Markdown 格式（加粗、列表、表格等）

## 考点提示
高频考点或易错点
```

然后 `git add . && git commit -m "add: xxx" && git push`，Netlify 自动重新部署。

## 开发命令

```bash
npm run dev        # 本地预览（只有前端，AI功能不可用）
netlify dev        # 本地完整预览（含 Netlify Functions，AI可用）
npm run build      # 构建生产版本
```

## 重要文件位置

| 文件/目录 | 作用 |
|-----------|------|
| `content/` | 所有知识点 Markdown 文件 |
| `src/components/` | React 组件 |
| `src/utils/loadContent.js` | 加载解析所有 MD 文件 |
| `src/utils/knowledgeSearch.js` | 知识库关键词检索 |
| `netlify/functions/ai-chat.js` | DeepSeek API 代理 + System Prompt |
| `netlify.toml` | Netlify 构建配置 |
| `.env` | 本地开发用的 API Key（不入 git） |

## 部署配置

- Netlify 环境变量：`DEEPSEEK_API_KEY`
- 构建命令：`npm run build`
- 发布目录：`dist`
- Functions 目录：`netlify/functions`

## AI 模型选择逻辑

- 普通问题 → `deepseek-chat`（快）
- 含「推导、计算、证明、论述」等关键词 → `deepseek-reasoner`（慢但准）

## 用户偏好

- 内容通过 Markdown 文件管理，用户提供内容后由 Claude 格式化为标准 MD
- 响应式设计：iPhone / iPad / MacBook 三端兼容
- 风格：简洁不花哨，以引导学习为主
