import { useState, useMemo } from 'react'
import { searchNotes } from '../utils/knowledgeSearch'

export function useSearch(notes) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return null
    return searchNotes(notes, query)
  }, [notes, query])

  return { query, setQuery, results }
}
