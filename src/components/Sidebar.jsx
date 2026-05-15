import { useState } from 'react'
import { ChevronRight, ChevronDown, CheckCircle2, RefreshCw } from 'lucide-react'

export default function Sidebar({ subjectTree, selectedNote, onSelectNote, progress, getSubjectColor }) {
  const subjects = Object.keys(subjectTree)
  const [openSubjects, setOpenSubjects] = useState(() => {
    const init = {}
    subjects.forEach(s => { init[s] = true })
    return init
  })
  const [openChapters, setOpenChapters] = useState({})

  function toggleSubject(s) {
    setOpenSubjects(prev => ({ ...prev, [s]: !prev[s] }))
  }

  function toggleChapter(key) {
    setOpenChapters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2">
      {subjects.map(subject => {
        const color = getSubjectColor(subject)
        const chapters = subjectTree[subject]
        const isSubOpen = openSubjects[subject]
        const allNotes = Object.values(chapters).flat()
        const masteredCount = progress.getMasteredCount(allNotes.map(n => n.id))

        return (
          <div key={subject} className="mb-2">
            {/* Subject header */}
            <button
              onClick={() => toggleSubject(subject)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${color.text} ${color.light} hover:opacity-90 transition-opacity`}
            >
              <span className={`w-2 h-2 rounded-full ${color.accent} flex-shrink-0`} />
              <span className="flex-1 text-left">{subject}</span>
              <span className="text-xs font-normal opacity-60">{masteredCount}/{allNotes.length}</span>
              {isSubOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {isSubOpen && Object.entries(chapters).map(([chapter, chNotes]) => {
              const chKey = `${subject}::${chapter}`
              const isChOpen = openChapters[chKey] !== false // default open
              const chMastered = progress.getMasteredCount(chNotes.map(n => n.id))

              return (
                <div key={chapter} className="ml-2 mt-0.5">
                  {/* Chapter header */}
                  <button
                    onClick={() => toggleChapter(chKey)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    {isChOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span className="flex-1 text-left font-medium">{chapter}</span>
                    <span className="opacity-50">{chMastered}/{chNotes.length}</span>
                  </button>

                  {/* Notes */}
                  {isChOpen && chNotes.map(note => {
                    const status = progress.getStatus(note.id)
                    const isSelected = selectedNote?.id === note.id

                    return (
                      <button
                        key={note.id}
                        onClick={() => onSelectNote(note)}
                        className={`w-full flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-xs transition-colors text-left ${
                          isSelected
                            ? `${color.bg} ${color.text} font-semibold`
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {status === 'mastered' ? (
                          <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                        ) : status === 'review' ? (
                          <RefreshCw size={12} className="text-amber-500 flex-shrink-0" />
                        ) : (
                          <span className="w-3 flex-shrink-0" />
                        )}
                        <span className="truncate">{note.title}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}
