// Vite glob import: loads all markdown files at build time
const rawFiles = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true })

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const yamlBlock = match[1]
  const content = match[2]
  const data = {}

  for (const line of yamlBlock.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()

    // Parse arrays like [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^['"]|['"]$/g, ''))
    }

    data[key] = value
  }

  return { data, content }
}

export function getAllNotes() {
  const notes = []

  for (const [path, raw] of Object.entries(rawFiles)) {
    const { data, content } = parseFrontmatter(raw)

    // path: /content/货币银行学/第一章-货币与货币制度/货币职能.md
    const segments = path.replace('/content/', '').split('/')
    const subject = segments[0] || ''
    const chapter = segments[1] || ''
    const filename = segments[2]?.replace('.md', '') || ''

    notes.push({
      id: path,
      path,
      subject,
      chapter,
      filename,
      title: data.title || filename,
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      difficulty: data.difficulty || 'medium',
      flashcard: data.flashcard !== 'false',
      content,
      raw,
    })
  }

  return notes.sort((a, b) => a.subject.localeCompare(b.subject, 'zh'))
}

export function getSubjectTree(notes) {
  const tree = {}
  for (const note of notes) {
    if (!tree[note.subject]) tree[note.subject] = {}
    if (!tree[note.subject][note.chapter]) tree[note.subject][note.chapter] = []
    tree[note.subject][note.chapter].push(note)
  }
  return tree
}
