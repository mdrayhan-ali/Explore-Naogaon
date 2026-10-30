import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { UPAZILA_NAME_BN } from '../data/naogaon/model'
import { LanguageContext } from './LanguageContext'
import type { LanguageApi } from './LanguageContext'
import { STRINGS } from './translations'
import type { Lang } from './translations'

const STORAGE_KEY = 'explore-naogaon-lang-v1'
const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'bn' || stored === 'en') return stored
  } catch {
    /* storage can be blocked; Bengali is the default */
  }
  return 'bn'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = STRINGS['meta.title'][lang]
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* the choice just will not be remembered */
    }
  }, [])

  const api = useMemo<LanguageApi>(() => ({
    lang,
    setLang,
    t: (key, vars) => {
      let text: string = STRINGS[key][lang]
      if (vars) for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value))
      return text
    },
    num: (value) => (lang === 'bn' ? String(value).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]) : String(value)),
    placeName: (attraction) => (lang === 'bn' ? attraction.nameBn || attraction.nameEn : attraction.nameEn || attraction.nameBn),
    upazilaName: (nameOrId) => {
      const key = Object.keys(UPAZILA_NAME_BN).find((name) => name.toLocaleLowerCase() === nameOrId.toLocaleLowerCase())
      return key ? (lang === 'bn' ? UPAZILA_NAME_BN[key] : key) : nameOrId
    },
  }), [lang, setLang])

  return <LanguageContext.Provider value={api}>{children}</LanguageContext.Provider>
}
