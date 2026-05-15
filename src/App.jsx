import { useState } from 'react'
import { getAllNotes, getCategoryTree } from './utils/loadContent'
import { useProgress } from './hooks/useProgress'
import { useSearch } from './hooks/useSearch'
import Layout from './components/Layout'

const notes = getAllNotes()
const categoryTree = getCategoryTree(notes)

export default function App() {
  const [mode, setMode] = useState('handbook') // 'handbook' | 'flashcard' | 'ai'
  const [selectedNote, setSelectedNote] = useState(notes[0] ?? null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const progress = useProgress()
  const search = useSearch(notes)

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
    />
  )
}
