import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Tag, Flame } from 'lucide-react'

const DIFFICULTY_LABEL = { easy: '基础', medium: '重点', hard: '难点' }
const DIFFICULTY_COLOR = {
  easy:   'bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300',
  medium: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
  hard:   'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300',
}

// 应试模式：只保留"核心考点"和"答案要点"两个 section
function filterExamMode(content) {
  const sections = content.split(/(?=^## )/m)
  return sections
    .filter(s => s.startsWith('## 核心考点') || s.startsWith('## 答案要点'))
    .join('\n\n')
}

// blockquote → 学术卡片（使用 CSS 变量，支持暗色模式）
const mdComponents = {
  blockquote({ children }) {
    return (
      <div
        style={{ borderLeft: '4px solid var(--kc-blockquote-border)', background: 'var(--kc-blockquote-bg)' }}
        className="px-4 py-2.5 my-3 rounded-r text-sm leading-relaxed"
      >
        {children}
      </div>
    )
  },
  // 表格外层加横向滚动容器
  table({ children }) {
    return (
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} className="my-3 rounded border border-slate-200 dark:border-[#262626]">
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>{children}</table>
      </div>
    )
  },
}

export default function HandbookView({ note, getSubjectColor }) {
  const [examMode, setExamMode] = useState(false)

  // 切换笔记时重置为学习模式
  useEffect(() => { setExamMode(false) }, [note?.id])

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
        从左侧选择一个知识点开始学习
      </div>
    )
  }

  const color = getSubjectColor(note.subject)
  const diff = note.difficulty || 'medium'
  const isKnowledgeBase = note.category === '知识库'
  const displayContent = isKnowledgeBase && examMode ? filterExamMode(note.content) : note.content

  return (
    <article className="flex-1 overflow-y-auto">
      {/* Hero header */}
      <div className={`${color.bg} px-6 py-5 border-b border-slate-200 dark:border-[#262626]`}>
        {/* 面包屑 + 应试/学习切换 */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span className={`font-semibold ${color.text}`}>{note.subject}</span>
          <span>/</span>
          <span>{note.chapter}</span>
          {isKnowledgeBase && (
            <div className="ml-auto flex rounded-lg bg-white/60 dark:bg-[#0f0f0f]/80 p-0.5 gap-0.5">
              {['学习', '应试'].map(label => (
                <button
                  key={label}
                  onClick={() => setExamMode(label === '应试')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    (label === '应试') === examMode
                      ? 'bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-200 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{note.title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[diff]}`}>
            <Flame size={11} className="inline mr-1" />
            {DIFFICULTY_LABEL[diff]}
          </span>
          {note.frequency === 'high' && (
            <span
              style={{ background: '#c0392b' }}
              className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
            >
              ★ 高频
            </span>
          )}
          {note.tags?.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-white/70 dark:bg-slate-900/50 rounded-full text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#262626]">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Markdown body */}
      <div className="px-6 py-5 max-w-3xl">
        <div className="prose-custom">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={mdComponents}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  )
}
