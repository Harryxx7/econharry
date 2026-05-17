import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react'
import { SUBJECT_ORDER, parseOutline } from '../../utils/loadContent'
import { getSubjectColor } from '../Layout'
import SummaryModal from './SummaryModal'

const MASTERY_KEY = 'review_mastery'

function getMastery() {
  try { return JSON.parse(localStorage.getItem(MASTERY_KEY) || '{}') } catch { return {} }
}
function saveMastery(m) {
  localStorage.setItem(MASTERY_KEY, JSON.stringify(m))
}

function MasteryDot({ value }) {
  const cls = value === 'known' ? 'bg-green-500' :
               value === 'shaky' ? 'bg-yellow-400' :
               value === 'blank' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${cls}`} />
}

function StatsLine({ notes, mastery }) {
  const known = notes.filter(n => mastery[n.path] === 'known').length
  const shaky = notes.filter(n => mastery[n.path] === 'shaky').length
  const blank = notes.filter(n => mastery[n.path] === 'blank').length
  if (known + shaky + blank === 0) return <span className="text-xs text-slate-400">未开始</span>
  return (
    <span className="text-xs flex gap-1.5">
      {known > 0 && <span className="text-green-600 dark:text-green-400">{known}✓</span>}
      {shaky > 0 && <span className="text-yellow-600 dark:text-yellow-400">{shaky}?</span>}
      {blank > 0 && <span className="text-red-500 dark:text-red-400">{blank}✗</span>}
    </span>
  )
}

function OutlineTree({ nodes, depth = 0 }) {
  if (!nodes?.length) return null
  return (
    <ul className={`space-y-1.5 ${depth > 0 ? 'ml-5 mt-1' : ''}`}>
      {nodes.map((node, i) => (
        <li key={i}>
          <div className={`flex items-start gap-2 ${
            depth === 0 ? 'text-base font-semibold text-slate-800 dark:text-slate-100' :
            depth === 1 ? 'text-sm font-medium text-slate-700 dark:text-slate-200' :
                          'text-sm text-slate-500 dark:text-slate-400'
          }`}>
            <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>{node.text}</span>
          </div>
          {node.children?.length > 0 && <OutlineTree nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  )
}

export default function ReviewMode({ notes, setMode, setSelectedNote }) {
  const [phase, setPhase] = useState('home') // 'home' | 'outline' | 'flow'
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [flowNotes, setFlowNotes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mastery, setMastery] = useState(getMastery)
  const [summaryNote, setSummaryNote] = useState(null)
  const [expandedSubjects, setExpandedSubjects] = useState({})

  function refreshMastery() { setMastery(getMastery()) }

  function markMastery(note, value) {
    const m = getMastery()
    m[note.path] = value
    saveMastery(m)
    refreshMastery()
  }

  function resetChapter(chapterNotes) {
    const m = getMastery()
    chapterNotes.forEach(n => delete m[n.path])
    saveMastery(m)
    refreshMastery()
  }

  // Build subject → chapter → notes map (知识库 only)
  const subjectMap = {}
  for (const note of notes.filter(n => n.category === '知识库')) {
    if (!subjectMap[note.subject]) subjectMap[note.subject] = {}
    if (!subjectMap[note.subject][note.chapter]) subjectMap[note.subject][note.chapter] = []
    subjectMap[note.subject][note.chapter].push(note)
  }

  function startFlow(chapterNotes, onlyWeak = false) {
    let toReview = chapterNotes
    if (onlyWeak) {
      const weak = chapterNotes.filter(n => mastery[n.path] === 'shaky' || mastery[n.path] === 'blank')
      toReview = weak.length > 0 ? weak : chapterNotes
    }
    setFlowNotes(toReview)
    setCurrentIndex(0)
    setPhase('flow')
  }

  // Keyboard shortcuts in flow mode
  useEffect(() => {
    if (phase !== 'flow' || summaryNote) return
    function onKey(e) {
      const note = flowNotes[currentIndex]
      if (!note) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        setCurrentIndex(i => Math.min(i + 1, flowNotes.length - 1))
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        setCurrentIndex(i => Math.max(i - 1, 0))
      else if (e.key === '1') markMastery(note, 'known')
      else if (e.key === '2') markMastery(note, 'shaky')
      else if (e.key === '3') markMastery(note, 'blank')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, currentIndex, flowNotes, summaryNote])

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (phase === 'home') {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">选择章节开始复习</h2>

        <div className="space-y-3">
          {SUBJECT_ORDER.map(subject => {
            const chapters = subjectMap[subject]
            if (!chapters) return null
            const color = getSubjectColor(subject)
            const isExpanded = !!expandedSubjects[subject]
            const allNotes = Object.values(chapters).flat()

            return (
              <div key={subject}>
                <button
                  onClick={() => setExpandedSubjects(p => ({ ...p, [subject]: !p[subject] }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${color.light} transition-all`}
                >
                  <span className={`font-semibold ${color.text}`}>{subject}</span>
                  <div className="flex items-center gap-3">
                    <StatsLine notes={allNotes} mastery={mastery} />
                    <ChevronRight size={16} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2 ml-3 space-y-1.5">
                    {Object.entries(chapters).map(([chapter, chNotes]) => (
                      <button
                        key={chapter}
                        onClick={() => { setSelectedSubject(subject); setSelectedChapter(chapter); setPhase('outline') }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-300">{chapter}</span>
                        <StatsLine notes={chNotes} mastery={mastery} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── OUTLINE ───────────────────────────────────────────────────────────────
  if (phase === 'outline') {
    const chapterNotes = subjectMap[selectedSubject]?.[selectedChapter] || []
    const hasWeak = chapterNotes.some(n => mastery[n.path] === 'shaky' || mastery[n.path] === 'blank')

    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setPhase('home')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <ChevronLeft size={16} /> 返回
          </button>
          <button
            onClick={() => resetChapter(chapterNotes)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={13} /> 重置本章
          </button>
        </div>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{selectedChapter}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{chapterNotes.length} 个知识点</p>

        <div className="space-y-2 mb-8">
          {chapterNotes.map(note => (
            <div key={note.path} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333]">
              <MasteryDot value={mastery[note.path]} />
              <span className="text-sm text-slate-700 dark:text-slate-300">{note.title}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => startFlow(chapterNotes, false)}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            正序复习
          </button>
          {hasWeak && (
            <button
              onClick={() => startFlow(chapterNotes, true)}
              className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
            >
              只看薄弱点
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── FLOW ──────────────────────────────────────────────────────────────────
  const currentNote = flowNotes[currentIndex]
  const outline = currentNote ? parseOutline(currentNote.content) : []
  const currentMastery = currentNote ? mastery[currentNote.path] : null

  const MASTERY_BTNS = [
    { value: 'known', label: '✓ 记住了', base: 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-300', active: 'bg-green-500 border-green-500 text-white' },
    { value: 'shaky', label: '? 模糊',   base: 'border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300', active: 'bg-yellow-400 border-yellow-400 text-white' },
    { value: 'blank', label: '✗ 不会',   base: 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400', active: 'bg-red-500 border-red-500 text-white' },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0f0f0f] border-b border-slate-200 dark:border-[#262626] flex-shrink-0">
        <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{selectedChapter}</span>
        <span className="text-sm font-mono text-slate-600 dark:text-slate-300 flex-shrink-0 ml-2">{currentIndex + 1} / {flowNotes.length}</span>
        <button onClick={() => setPhase('outline')} className="ml-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex-shrink-0">
          <X size={18} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-10 py-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">{currentNote?.title}</h2>
        {outline.length > 0
          ? <OutlineTree nodes={outline} />
          : <p className="text-sm text-slate-400">（此文件暂无标题结构）</p>
        }
      </div>

      {/* Fixed bottom */}
      <div className="flex-shrink-0 bg-white dark:bg-[#0f0f0f] border-t border-slate-200 dark:border-[#262626] px-4 py-3 space-y-2">
        {/* Mastery */}
        <div className="flex gap-2">
          {MASTERY_BTNS.map(({ value, label, base, active }) => (
            <button
              key={value}
              onClick={() => markMastery(currentNote, value)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${currentMastery === value ? active : base}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Navigation + detail */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#333] text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setSummaryNote(currentNote)}
            className="flex-1 py-2 text-sm font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
          >
            看详情
          </button>
          <button
            onClick={() => setCurrentIndex(i => Math.min(i + 1, flowNotes.length - 1))}
            disabled={currentIndex === flowNotes.length - 1}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#333] text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {summaryNote && (
        <SummaryModal
          note={summaryNote}
          onClose={() => setSummaryNote(null)}
          onViewFull={note => {
            setSummaryNote(null)
            setSelectedNote(note)
            setMode('handbook')
          }}
        />
      )}
    </div>
  )
}
