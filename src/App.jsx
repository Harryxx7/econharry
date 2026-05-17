import { useState } from 'react'
import { getAllNotes, getCategoryTree } from './utils/loadContent'
import { useProgress } from './hooks/useProgress'
import { useSearch } from './hooks/useSearch'
import { useDark } from './hooks/useDark'
import Layout from './components/Layout'

const notes = getAllNotes()
const categoryTree = getCategoryTree(notes)

export default function App() {
  const [mode, setMode] = useState('handbook') // 'handbook' | 'flashcard' | 'ai' | 'review'
  const [selectedNote, setSelectedNote] = useState(notes[0] ?? null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [fromReview, setFromReview] = useState(false)

  function goToHandbook(note) {
    setSelectedNote(note)
    setMode('handbook')
    setFromReview(true)
  }

  function backToReview() {
    setMode('review')
    setFromReview(false)
  }

  const progress = useProgress()
  const search = useSearch(notes)
  const { isDark, toggle: toggleDark } = useDark()

  return (
    <Layout
      notes={notes}
      categoryTree={categoryTree}
      mode={mode}
      setMode={setMode}
      selectedNote={selectedNote}
      setSelectedNote={setSelectedNote}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      aiOpen={aiOpen}
      setAiOpen={setAiOpen}
      progress={progress}
      search={search}
      isDark={isDark}
      toggleDark={toggleDark}
      fromReview={fromReview}
      backToReview={backToReview}
      goToHandbook={goToHandbook}
    />
  )
}
