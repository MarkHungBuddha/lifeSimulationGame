import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { UiLanguage } from './i18n/types'
import { getNumberLocale } from './config/regions'

interface I18nContextValue {
  language: UiLanguage
  locale: string
  setLanguage: (language: UiLanguage) => void
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  locale: 'en-US',
  setLanguage: () => {},
})

const STORAGE_KEY = 'ui-language'

function getStoredLanguage(): UiLanguage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'en' || raw === 'zh' || raw === 'ja') return raw
  } catch {
    // noop
  }

  if (typeof navigator !== 'undefined') {
    const language = navigator.language.toLowerCase()
    if (language.startsWith('zh')) return 'zh'
    if (language.startsWith('ja')) return 'ja'
  }

  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>(getStoredLanguage)

  const setLanguage = (next: UiLanguage) => {
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // noop
    }
  }

  const value = useMemo<I18nContextValue>(() => ({
    language,
    locale: getNumberLocale(language),
    setLanguage,
  }), [language])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
