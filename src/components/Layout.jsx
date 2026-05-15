import { BookOpen, Layers, Bot, Menu, X, Search } from 'lucide-react'
import Sidebar from './Sidebar'
import HandbookView from './HandbookView'
import FlashcardView from './FlashcardView'
import AIChat from './AIChat'
import SearchResults from './SearchResults'

const SUBJECT_COLORS = {
  '货币银行学': { bg: 'bg-blue-50', accent: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
  '公司理财':   { bg: 'bg-emerald-50', accent: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-100' },
  '国际金融':   { bg: 'bg-violet-50', accent: 'bg-violet-500', text: 'text-violet-700', light: 'bg-violet-100' },
  '投资学':     { bg: 'bg-amber-50', accent: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100' },
}
export const getSubjectColor = (subject) =>
  SUBJECT_COLORS[subject] ?? { bg: 'bg-slate-50', accent: 'bg-slate-400', text: 'text-slate-700', light: 'bg-slate-100' }

const TABS = [
  { key: 'handbook', label: '手册', icon: BookOpen },
  { key: 'flashcard', label: '闪卡', icon: Layers },
  { key: 'ai', label: 'AI 助手', icon: Bot },
]

export default function Layout({
  notes, categoryTree, mode, setMode,
  selectedNote, setSelectedNote,
  sidebarOpen, setSidebarOpen,
  aiOpen, setAiOpen,
  progress, search,
}) {
  const { query, setQuery, results } = search

  function handleSelectNote(note) {
    setSelectedNote(note)
    setQuery('')
    setSidebarOpen(false)
    if (mode === 'ai') setMode('handbook')
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f7f4] overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-30">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setSidebarOpen(v => !v)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg font-bold text-slate-800 whitespace-nowrap">431</span>
          <span className="text-slate-400 text-sm hidden sm:inline">金融专硕备考</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-auto relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索知识点..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 rounded-full border border-transparent focus:outline-none focus:border-indigo-300 focus:bg-white transition-all"
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Desktop mode tabs */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setQuery('') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* AI button desktop */}
        <button
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors ml-1"
          onClick={() => setAiOpen(v => !v)}
        >
          <Bot size={15} />
          {aiOpen ? '收起' : 'AI'}
        </button>
      </header>

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static top-0 left-0 h-full z-20
          w-64 bg-white border-r border-slate-200 flex-shrink-0
          transform transition-transform duration-300
          lg:translate-x-0 lg:flex lg:flex-col
          ${sidebarOpen ? 'translate-x-0 flex flex-col pt-[57px]' : '-translate-x-full'}
        `}>
          <Sidebar
            categoryTree={categoryTree}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            progress={progress}
            getSubjectColor={getSubjectColor}
          />
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {results ? (
            <SearchResults
              results={results}
              query={query}
              onSelect={handleSelectNote}
              getSubjectColor={getSubjectColor}
            />
          ) : mode === 'handbook' ? (
            <HandbookView note={selectedNote} getSubjectColor={getSubjectColor} />
          ) : mode === 'flashcard' ? (
            <FlashcardView
              notes={notes}
              progress={progress}
              getSubjectColor={getSubjectColor}
            />
          ) : (
            // AI mode on mobile — render inline
            <AIChat notes={notes} inline />
          )}
        </main>

        {/* AI panel — desktop right drawer */}
        {aiOpen && (
          <aside className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-slate-200 bg-white flex-shrink-0">
            <AIChat notes={notes} />
          </aside>
        )}

        {/* AI drawer — tablet */}
        {aiOpen && (
          <div className="lg:hidden fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-30 flex flex-col border-l border-slate-200 pt-[57px]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-slate-700">AI 助手</span>
              <button onClick={() => setAiOpen(false)} className="p-1 rounded hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <AIChat notes={notes} />
          </div>
        )}
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden flex border-t border-slate-200 bg-white z-10">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setQuery('') }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              mode === key ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Icon size={20} strokeWidth={mode === key ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
