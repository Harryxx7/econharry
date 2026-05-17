/**
 * 知识库搜索工具
 *
 * 核心问题：中文没有空格分词，直接 split(/\s+/) 会把整句话当一个词，
 * 导致 "到期收益率的公式" 无法匹配内容里的 "到期收益率"。
 *
 * 解决方案：在空格分词基础上，加入 3-5 字符滑动窗口 n-gram，
 * 让中文查询句子的关键词片段能命中标题/标签/内容。
 */

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 从查询语句提取搜索词列表：
 * 1. 按空格切分（处理英文词和手动分词）
 * 2. 中文字符 n-gram（3-5 字），覆盖未分词的中文句子
 */
function buildTerms(query) {
  const terms = new Set()
  const q = query.trim().toLowerCase()

  // 空格分词（兼容英文如 CAPM、IRR）
  q.split(/\s+/).filter(Boolean).forEach(t => terms.add(t))

  // 中文滑动窗口 n-gram（只对中文字符做 2-5 字窗口，覆盖"久期""套利"等2字词）
  const clean = q.replace(/\s+/g, '')
  const chineseOnly = clean.replace(/[a-z0-9]/g, '')
  for (let len = 2; len <= 5; len++) {
    for (let i = 0; i <= chineseOnly.length - len; i++) {
      terms.add(chineseOnly.slice(i, i + len))
    }
  }

  return [...terms]
}

/** 对单条笔记按词列表打分 */
function scoreNote(note, terms) {
  const titleL   = note.title.toLowerCase()
  const subjectL = note.subject.toLowerCase()
  const chapterL = note.chapter.toLowerCase()
  const contentL = note.content.toLowerCase()
  const tagsL    = (note.tags  || []).map(t => t.toLowerCase())
  const termsL   = (note.terms || []).map(t => t.toLowerCase())

  let score = 0
  for (const term of terms) {
    // terms 字段精确加权（定义该词的文件优先浮出）
    if (termsL.some(t => t === term))           score += 15  // 精确命中 terms
    else if (termsL.some(t => t.includes(term))) score += 8  // 包含命中 terms

    if (titleL.includes(term))             score += 10  // 标题命中
    if (tagsL.some(t => t.includes(term))) score += 6   // 标签命中
    if (chapterL.includes(term))           score += 4   // 章节命中
    if (subjectL.includes(term))           score += 3   // 科目命中
    // 内容命中：按出现次数累加，单词上限 10 分（内容丰富的文件应得到更高权重）
    const hits = Math.min(
      (contentL.match(new RegExp(escapeRegex(term), 'g')) || []).length,
      10
    )
    score += hits
  }

  // 高频考点加权
  if (note.frequency === 'high') score += 3

  return score
}

/**
 * 全局搜索（搜索栏使用）：阈值为 0，返回任何有得分的笔记，用户自己判断相关性
 */
export function searchNotes(notes, query) {
  if (!query?.trim()) return []
  const terms = buildTerms(query)

  return notes
    .map(note => ({ note, score: scoreNote(note, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ note }) => note)
}

/**
 * AI 上下文检索：返回最相关的笔记列表
 * 每篇内容截断至 1500 字，防止撑爆 context window
 */
export function findRelevantContext(notes, query, maxNotes = 5) {
  if (!query?.trim()) return []
  const terms = buildTerms(query)

  return notes
    .map(note => ({ note, score: scoreNote(note, terms) }))
    .filter(({ score }) => score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxNotes)
    .map(({ note }) => ({
      ...note,
      content: note.content.slice(0, 1500),
    }))
}
