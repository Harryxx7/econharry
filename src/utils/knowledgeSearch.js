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

  // 中文滑动窗口 n-gram（去掉空格后整体处理）
  const clean = q.replace(/\s+/g, '')
  for (let len = 3; len <= 5; len++) {
    for (let i = 0; i <= clean.length - len; i++) {
      terms.add(clean.slice(i, i + len))
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
  const tagsL    = (note.tags || []).map(t => t.toLowerCase())

  let score = 0
  for (const term of terms) {
    if (titleL.includes(term))             score += 10  // 标题命中，权重最高
    if (tagsL.some(t => t.includes(term))) score += 6   // 标签命中
    if (chapterL.includes(term))           score += 4   // 章节命中
    if (subjectL.includes(term))           score += 3   // 科目命中
    // 内容命中：按出现次数累加，但单词上限 5 分（避免高频词刷分）
    const hits = Math.min(
      (contentL.match(new RegExp(escapeRegex(term), 'g')) || []).length,
      5
    )
    score += hits
  }

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
 * AI 上下文检索：阈值为 5，只返回强相关笔记
 * 阈值设高一些，防止把弱相关内容塞给 AI——那比没有上下文更糟糕
 * （AI 会被要求基于该内容回答，内容不对等于错误引导）
 */
export function findRelevantContext(notes, query, maxNotes = 3) {
  if (!query?.trim()) return []
  const terms = buildTerms(query)

  return notes
    .map(note => ({ note, score: scoreNote(note, terms) }))
    .filter(({ score }) => score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxNotes)
    .map(({ note }) => note)
}
