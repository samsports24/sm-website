import { createContext, useContext, useState, useCallback } from 'react'
import translations from './translations'

const LanguageContext = createContext()

const STORAGE_KEY = 'samsports_lang'

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en'
    } catch {
      return 'en'
    }
  })

  const changeLang = useCallback((code) => {
    setLang(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {}
  }, [])

  const t = useCallback(
    (key) => {
      const val = translations[lang]?.[key]
      if (val) return val
      return translations['en']?.[key] || key
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // Fallback if used outside provider
    return {
      lang: 'en',
      changeLang: () => {},
      t: (key) => translations['en']?.[key] || key,
    }
  }
  return ctx
}

export default LanguageContext
