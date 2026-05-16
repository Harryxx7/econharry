import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Tag, Flame } from 'lucide-react'

const DIFFICULTY_LABEL = { easy: '基础', medium: '重点', hard: '难点' }
const DIFFICULTY_COLOR = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

// 应试模式：只保留"核心考点"和"答案要点"两个 section
function filterExamMode(content) {
  const sections = content.split(/(?=^## )/m)
  return sections
    .filter(s => s.startsWith('## 核心考点') || s.startsWith('## 答案要点'))
    .join('\n\n')
}

// blockquote → 学术卡片（与 cheatsheet.html 配色一致：米色底 + 海军蓝左边框）
const mdComponents = {
  blockquote({ children }) {
    return (
      <div
        style={{ borderLeft: '4px solid #1e3a5f', background: '#f3efe6' }}
        className="px-4 py-2.5 my-3 rounded-r text-sm leading-relaxed"
      >
        {children}
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
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
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
      <div className={`${color.bg} px-6 py-5 border-b border-slate-200`}>
        {/* 面包屑 + 应试/学习切换 */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className={`font-semibold ${color.text}`}>{note.subject}</span>
          <span>/</span>
          <span>{note.chapter}</span>
          {isKnowledgeBase && (
            <div className="ml-auto flex rounded-lg bg-white/60 p-0.5 gap-0.5">
              {['学习', '应试'].map(label => (
                <button
                  key={label}
                  onClick={() => setExamMode(label === '应试')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    (label === '应试') === examMode
                      ? 'bg-white text-slate-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold text-slate-800 mb-3">{note.title}</h1>

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
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-white/70 rounded-full text-slate-600 border border-slate-200">
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
