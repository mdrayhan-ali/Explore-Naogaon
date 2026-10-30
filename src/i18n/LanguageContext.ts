import { createContext, useContext } from 'react'
import type { Attraction } from '../types/geography'
import type { Lang, StringKey } from './translations'

export type LanguageApi = {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Looks up a string; `{name}` style placeholders are filled from `vars`. */
  t: (key: StringKey, vars?: Record<string, string | number>) => string
  /** Writes a number in Bengali or English digits. */
  num: (value: number) => string
  /** A place's name in the chosen language. */
  placeName: (attraction: Pick<Attraction, 'nameBn' | 'nameEn'>) => string
  /** An upazila's name from its English name ("Naogaon Sadar") or lower-case id ("naogaon sadar"). */
  upazilaName: (nameOrId: string) => string
}

export const LanguageContext = createContext<LanguageApi | null>(null)

export function useLang(): LanguageApi {
  const api = useContext(LanguageContext)
  if (!api) throw new Error('useLang must be used inside <LanguageProvider>')
  return api
}
