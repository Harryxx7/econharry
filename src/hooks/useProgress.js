import { useState, useCallback } from 'react'

const STORAGE_KEY = 'kc431_progress'

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

// progress: { [noteId]: 'mastered' | 'review' | undefined }
export function useProgress() {
  const [progress, setProgress] = useState(loadProgress)

  const setStatus = useCallback((noteId, status) => {
    setProgress(prev => {
      const next = { ...prev }
      if (status == null) {
        delete next[noteId]
      } else {
        next[noteId] = status
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const getStatus = useCallback(
    (noteId) => progress[noteId] ?? null,
    [progress]
  )

  const getMasteredCount = useCallback(
    (noteIds) => noteIds.filter(id => progress[id] === 'mastered').length,
    [progress]
  )

  return { progress, setStatus, getStatus, getMasteredCount }
}
