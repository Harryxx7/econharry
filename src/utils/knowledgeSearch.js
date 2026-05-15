// Search notes by keyword, return matches ranked by relevance
export function searchNotes(notes, query) {
  if (!query || query.trim().length < 1) return []
  const q = query.trim().toLowerCase()
  const terms = q.split(/\s+/).filter(Boolean)

  return notes
    .map(note => {
      const haystack = [
        note.title,
        note.subject,
        note.chapter,
        ...(note.tags || []),
        note.content,
      ]
        .join(' ')
        .toLowerCase()

      let score = 0
      for (const term of terms) {
        if (note.title.toLowerCase().includes(term)) score += 10
        if (note.subject.toLowerCase().includes(term)) score += 5
        if (note.chapter.toLowerCase().includes(term)) score += 3
        const tagMatch = note.tags?.some(t => t.toLowerCase().includes(term))
        if (tagMatch) score += 4
        const contentMatches = (note.content.toLowerCase().match(new RegExp(term, 'g')) || []).length
        score += contentMatches
      }

      return { note, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ note }) => note)
}

// Find relevant notes for an AI query — returns top 3 as context
export function findRelevantContext(notes, query, maxNotes = 3) {
  const results = searchNotes(notes, query)
  return results.slice(0, maxNotes)
}
