import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { getNumberLocale } from './config/regions'
import { translate } from './i18n/messages'
import type { UiLanguage } from './i18n/types'

interface I18nContextValue {
  language: UiLanguage
  locale: string
  setLanguage: (language: UiLanguage) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  locale: 'en-US',
  setLanguage: () => {},
  t: (key) => key,
})

const STORAGE_KEY = 'ui-language'

function getStoredLanguage(): UiLanguage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'en' || raw === 'ja' || raw === 'zh-Hant') return raw
    if (raw === 'zh') return 'zh-Hant'
  } catch {
    // noop
  }

  if (typeof navigator !== 'undefined') {
    const language = navigator.language.toLowerCase()
    if (
      language.startsWith('zh-hant')
      || language.startsWith('zh-tw')
      || language.startsWith('zh-hk')
      || language.startsWith('zh-mo')
    ) {
      return 'zh-Hant'
    }
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
    t: (key, params) => translate(language, key, params),
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
