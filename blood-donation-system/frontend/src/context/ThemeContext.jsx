/**
 * ThemeContext.jsx
 * ----------------
 * Provides a global dark/light theme toggle.
 * - Reads the user's OS preference on first load
 * - Persists the choice to localStorage
 * - Writes `data-theme="light"|"dark"` on <html> so CSS vars switch
 */
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Respect saved preference
    const saved = localStorage.getItem('bloodlink-theme')
    if (saved) return saved
    // 2. Fall back to OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Apply to <html> so every CSS var responds instantly
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bloodlink-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
