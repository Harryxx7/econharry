import { useState } from 'react'
import { ChevronRight, ChevronDown, CheckCircle2, RefreshCw } from 'lucide-react'
import { CATEGORY_ORDER, SUBJECT_ORDER } from '../utils/loadContent'

const CN_NUM = { 一:1, 二:2, 三:3, 四:4, 五:5, 六:6, 七:7, 八:8, 九:9, 十:10 }

function chapterOrder(name) {
  const m = name.match(/第([一二三四五六七八九十]+)章/)
  if (!m) return 999
  return CN_NUM[m[1]] ?? 999
}

function sortSubjects(subjects) {
  return [...subjects].sort((a, b) => {
    const ia = SUBJECT_ORDER.indexOf(a)
    const ib = SUBJECT_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'zh')
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a)
    const ib = CATEGORY_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'zh')
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

export default function Sidebar({ categoryTree, selectedNote, onSelectNote, progress, getSubjectColor }) {
  const categories = sortCategories(Object.keys(categoryTree))

  const [openCategories, setOpenCategories] = useState(() => {
    const init = {}
    categories.forEach(c => { init[c] = true })
    return init
  })
  const [openSubjects, setOpenSubjects] = useState(() => {
    const init = {}
    categories.forEach(c => {
      Object.keys(categoryTree[c] || {}).forEach(s => { init[`${c}::${s}`] = true })
    })
    return init
  })
  const [openChapters, setOpenChapters] = useState({})

  function toggleCategory(c) {
    setOpenCategories(prev => ({ ...prev, [c]: !prev[c] }))
  }
  function toggleSubject(key) {
    setOpenSubjects(prev => ({ ...prev, [key]: !prev[key] }))
  }
  function toggleChapter(key) {
    setOpenChapters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2">
      {categories.map(category => {
        const subjectMap = categoryTree[category] || {}
        const subjects = sortSubjects(Object.keys(subjectMap))
        const isCatOpen = openCategories[category]

        // 该分类下所有笔记数量
        const allCatNotes = subjects.flatMap(s => Object.values(subjectMap[s]).flat())
        const catMastered = progress.getMasteredCount(allCatNotes.map(n => n.id))

        return (
          <div key={category} className="mb-3">
            {/* 分类 header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-wide"
            >
              {isCatOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span className="flex-1 text-left">{category}</span>
              <span className="font-normal opacity-60">{catMastered}/{allCatNotes.length}</span>
            </button>

            {isCatOpen && subjects.map(subject => {
              const color = getSubjectColor(subject)
              const chapters = subjectMap[subject]
              const subKey = `${category}::${subject}`
              const isSubOpen = openSubjects[subKey]
              const allSubNotes = Object.values(chapters).flat()
              const subMastered = progress.getMasteredCount(allSubNotes.map(n => n.id))

              return (
                <div key={subject} className="mb-1 ml-1">
                  {/* 科目 header */}
                  <button
                    onClick={() => toggleSubject(subKey)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${color.text} ${color.light} hover:opacity-90 transition-opacity`}
                  >
                    <span className={`w-2 h-2 rounded-full ${color.accent} flex-shrink-0`} />
                    <span className="flex-1 text-left">{subject}</span>
                    <span className="text-xs font-normal opacity-60">{subMastered}/{allSubNotes.length}</span>
                    {isSubOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {isSubOpen && Object.entries(chapters)
                    .sort((a, b) => chapterOrder(a[0]) - chapterOrder(b[0]))
                    .map(([chapter, chNotes]) => {
                      const chKey = `${subKey}::${chapter}`
                      const isChOpen = openChapters[chKey] !== false // 默认展开
                      const chMastered = progress.getMasteredCount(chNotes.map(n => n.id))

                      return (
                        <div key={chapter} className="ml-2 mt-0.5">
                          {/* 章节 header */}
                          <button
                            onClick={() => toggleChapter(chKey)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                          >
                            {isChOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span className="flex-1 text-left font-medium">{chapter}</span>
                            <span className="opacity-50">{chMastered}/{chNotes.length}</span>
                          </button>

                          {/* 知识点列表 */}
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
          </div>
        )
      })}
    </nav>
  )
}
