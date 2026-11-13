// Two languages, English and Finnish. Every visible string is written as t(english, finnish) next to where it is
// used, so a translation never drifts away from its original. The app re-renders when the language changes.
export type Lang = 'en' | 'fi'

const KEY = 'signal.lang'
let lang: Lang = (() => {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'fi') return saved
  } catch {
    /* no storage: default */
  }
  return 'en'
})()

export const getLang = (): Lang => lang

export function setLang(next: Lang) {
  lang = next
  const doc = (globalThis as { document?: { documentElement: { lang: string } } }).document
  if (doc) doc.documentElement.lang = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* ignore */
  }
}

export const t = (en: string, fi: string): string => (lang === 'fi' ? fi : en)

/** "3 days before" / "3 päivää ennen"; 0 is "just now". */
export const daysBefore = (n: number): string =>
  n === 0 ? t('just now', 'juuri nyt') : t(`${n} days before`, `${n} päivää ennen`)
