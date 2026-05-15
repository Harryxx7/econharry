import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tag, Flame } from 'lucide-react'

const DIFFICULTY_LABEL = { easy: '基础', medium: '重点', hard: '难点' }
const DIFFICULTY_COLOR = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

export default function HandbookView({ note, getSubjectColor }) {
  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        从左侧选择一个知识点开始学习
      </div>
    )
  }

  const color = getSubjectColor(note.subject)
  const diff = note.difficulty || 'medium'

  return (
    <article className="flex-1 overflow-y-auto">
      {/* Hero header */}
      <div className={`${color.bg} px-6 py-5 border-b border-slate-200`}>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className={`font-semibold ${color.text}`}>{note.subject}</span>
          <span>/</span>
          <span>{note.chapter}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-3">{note.title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[diff]}`}>
            <Flame size={11} className="inline mr-1" />
            {DIFFICULTY_LABEL[diff]}
          </span>
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  )
}
