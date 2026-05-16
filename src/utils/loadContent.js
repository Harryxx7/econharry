// Vite glob import: loads all markdown files at build time
const rawFiles = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true })

// 分类顺序
export const CATEGORY_ORDER = ['公式速查', '知识库']

// 科目顺序（固定）
export const SUBJECT_ORDER = ['货币银行学', '国际金融', '公司理财', '投资学']

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

    // 支持四层路径: /content/分类/科目/章节/文件.md
    // 也兼容三层旧路径: /content/科目/章节/文件.md
    const segments = path.replace('/content/', '').split('/')
    let category, subject, chapter, filename

    if (segments.length >= 4) {
      category = segments[0]
      subject  = segments[1]
      chapter  = segments[2]
      filename = segments[3]?.replace('.md', '') || ''
    } else {
      category = '未分类'
      subject  = segments[0] || ''
      chapter  = segments[1] || ''
      filename = segments[2]?.replace('.md', '') || ''
    }

    notes.push({
      id: path,
      path,
      category,
      subject,
      chapter,
      filename,
      title: data.title || filename,
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      terms: Array.isArray(data.terms) ? data.terms : data.terms ? [data.terms] : [],
      type: data.type || null,
      frequency: data.frequency || null,
      difficulty: data.difficulty || 'medium',
      flashcard: data.flashcard !== 'false',
      content,
      raw,
    })
  }

  return notes
}

// 返回 { 分类: { 科目: { 章节: [notes] } } }
export function getCategoryTree(notes) {
  const tree = {}
  for (const note of notes) {
    if (!tree[note.category]) tree[note.category] = {}
    if (!tree[note.category][note.subject]) tree[note.category][note.subject] = {}
    if (!tree[note.category][note.subject][note.chapter]) tree[note.category][note.subject][note.chapter] = []
    tree[note.category][note.subject][note.chapter].push(note)
  }
  return tree
}
