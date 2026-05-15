import { useState, useMemo } from 'react'
import { Shuffle, ListOrdered, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

function extractSection(content, heading) {
  const lines = content.split('\n')
  let capturing = false
  const result = []
  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('# ')) {
      if (capturing) break
      if (line.replace(/^#+\s*/, '').trim() === heading) {
        capturing = true
        continue
      }
    } else if (capturing) {
      result.push(line)
    }
  }
  return result.join('\n').trim()
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardView({ notes, progress, getSubjectColor }) {
  const flashNotes = useMemo(() => notes.filter(n => n.flashcard !== false), [notes])

  const subjects = useMemo(() => ['全部', ...new Set(flashNotes.map(n => n.subject))], [flashNotes])
  const [filterSubject, setFilterSubject] = useState('全部')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'review' | 'mastered'
  const [isRandom, setIsRandom] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [index, setIndex] = useState(0)

  const filtered = useMemo(() => {
    let pool = filterSubject === '全部' ? flashNotes : flashNotes.filter(n => n.subject === filterSubject)
    if (filterStatus === 'review') pool = pool.filter(n => progress.getStatus(n.id) !== 'mastered')
    if (filterStatus === 'mastered') pool = pool.filter(n => progress.getStatus(n.id) === 'mastered')
    return isRandom ? shuffle(pool) : pool
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashNotes, filterSubject, filterStatus, isRandom, progress.progress])

  const card = filtered[index] ?? null
  const total = filtered.length
  const mastered = progress.getMasteredCount(filtered.map(n => n.id))

  function go(dir) {
    setFlipped(false)
    setTimeout(() => setIndex(i => Math.max(0, Math.min(total - 1, i + dir))), 150)
  }

  function handleStatus(status) {
    if (!card) return
    progress.setStatus(card.id, progress.getStatus(card.id) === status ? null : status)
  }

  if (total === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        暂无匹配的闪卡
      </div>
    )
  }

  const color = card ? getSubjectColor(card.subject) : {}
  const question = card ? extractSection(card.content, '问题') || card.title : ''
  const answer = card ? extractSection(card.content, '答案') || card.content : ''
  const tip = card ? extractSection(card.content, '考点提示') : ''
  const status = card ? progress.getStatus(card.id) : null

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex gap-1 flex-wrap">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => { setFilterSubject(s); setIndex(0); setFlipped(false) }}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filterSubject === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-1 ml-auto">
          {[['all', '全部'], ['review', '待复习'], ['mastered', '已掌握']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setFilterStatus(val); setIndex(0); setFlipped(false) }}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filterStatus === val ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => { setIsRandom(v => !v); setIndex(0); setFlipped(false) }}
            className={`p-1.5 rounded-full border transition-colors ${isRandom ? 'bg-indigo-100 border-indigo-300 text-indigo-600' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
            title={isRandom ? '顺序练习' : '随机练习'}
          >
            {isRandom ? <Shuffle size={14} /> : <ListOrdered size={14} />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>{index + 1} / {total}</span>
          <span>已掌握 {mastered}/{total}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (mastered / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <div
          className="perspective w-full max-w-2xl cursor-pointer select-none"
          style={{ height: 'min(420px, 65vw)' }}
          onClick={() => setFlipped(v => !v)}
        >
          <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
            {/* Front */}
            <div className={`card-face ${color.bg} border-2 border-slate-200 flex flex-col`}>
              <div className={`px-4 py-2 ${color.light} border-b border-slate-200 flex items-center justify-between`}>
                <span className={`text-xs font-semibold ${color.text}`}>{card?.subject}</span>
                <span className="text-xs text-slate-400">点击翻转</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-center text-slate-800 font-medium text-base leading-relaxed">{question}</p>
              </div>
              <div className="h-8" />
            </div>

            {/* Back */}
            <div className="card-face card-back bg-white border-2 border-indigo-200 flex flex-col">
              <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600">答案</span>
                <button
                  onClick={e => { e.stopPropagation(); setFlipped(false) }}
                  className="text-xs text-indigo-400 hover:text-indigo-600 flex items-center gap-1"
                >
                  <RotateCcw size={11} /> 收起
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 text-sm text-slate-700 leading-relaxed prose-custom">
                <ReactMarkdownInline content={answer} />
                {tip && (
                  <div className="mt-3 p-3 bg-amber-50 border-l-3 border-amber-400 rounded-r text-xs text-amber-800">
                    <span className="font-semibold">考点提示：</span>{tip}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => go(-1)}
            disabled={index === 0}
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => handleStatus('review')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              status === 'review'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-amber-300 text-amber-600 hover:bg-amber-50'
            }`}
          >
            <RefreshCw size={14} />
            待复习
          </button>

          <button
            onClick={() => handleStatus('mastered')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              status === 'mastered'
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 size={14} />
            已掌握
          </button>

          <button
            onClick={() => go(1)}
            disabled={index === total - 1}
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Minimal inline markdown renderer for card back
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function ReactMarkdownInline({ content }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
}
