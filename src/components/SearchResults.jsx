import { Search } from 'lucide-react'

function highlight(text, query) {
  if (!query) return text
  const terms = query.trim().split(/\s+/).filter(Boolean)
  const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return text.replace(pattern, '<mark>$1</mark>')
}

export default function SearchResults({ results, query, onSelect, getSubjectColor }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
        <Search size={14} />
        <span>找到 <strong className="text-slate-800 dark:text-slate-200">{results.length}</strong> 条结果，关键词："{query}"</span>
      </div>

      {results.length === 0 && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>没有找到相关知识点</p>
          <p className="text-xs mt-1">试试其他关键词，或者让 AI 帮你解答</p>
        </div>
      )}

      <div className="space-y-2 max-w-2xl">
        {results.map(note => {
          const color = getSubjectColor(note.subject)
          const preview = note.content.slice(0, 120).replace(/#+\s*/g, '').replace(/\*\*/g, '')
          return (
            <button
              key={note.id}
              onClick={() => onSelect(note)}
              className="w-full text-left p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color.light} ${color.text}`}>
                  {note.subject}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{note.chapter}</span>
              </div>
              <p
                className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1"
                dangerouslySetInnerHTML={{ __html: highlight(note.title, query) }}
              />
              <p
                className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: highlight(preview, query) }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
