import { useState, useEffect } from 'react'

const STORAGE_KEY = 'kc431_dark_mode'

export function useDark() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) return saved === 'true'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(isDark))
    } catch {}
  }, [isDark])

  return { isDark, toggle: () => setIsDark(v => !v) }
}
