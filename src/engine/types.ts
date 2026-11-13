import { t } from '../i18n'

// Language levels follow a simplified CEFR scale.
// 0 = none, 1 = basic (A1-A2), 2 = working (B1-B2), 3 = fluent (C1-C2 or native)
export type LangLevel = 0 | 1 | 2 | 3
export const LANG_LEVELS: { value: LangLevel; label: string; fi: string }[] = [
  { value: 0, label: 'Not needed', fi: 'Ei tarvita' },
  { value: 1, label: 'Basic', fi: 'Perustaso' },
  { value: 2, label: 'Working', fi: 'Hyvä' },
  { value: 3, label: 'Fluent', fi: 'Sujuva' },
]
export const levelLabel = (l: LangLevel): string => t(LANG_LEVELS[l].label, LANG_LEVELS[l].fi)

export type Degree = 'none' | 'vocational' | 'bachelor' | 'master'
export const DEGREE_RANK: Record<Degree, number> = { none: 0, vocational: 1, bachelor: 2, master: 3 }
export const DEGREES: { value: Degree; label: string; fi: string }[] = [
  { value: 'none', label: 'No degree required', fi: 'Ei tutkintovaatimusta' },
  { value: 'vocational', label: 'Vocational qualification', fi: 'Ammatillinen tutkinto' },
  { value: 'bachelor', label: "Bachelor's degree", fi: 'Kandidaatin tai AMK-tutkinto' },
  { value: 'master', label: "Master's degree", fi: 'Maisterin tai DI-tutkinto' },
]
export const degreeLabel = (d: Degree): string => {
  const x = DEGREES.find((y) => y.value === d)!
  return t(x.label, x.fi)
}
export const workModeLabel = (m: 'on-site' | 'hybrid' | 'remote'): string =>
  ({ 'on-site': t('on-site', 'paikan päällä'), hybrid: t('hybrid', 'hybridi'), remote: t('remote', 'etä') })[m]

export interface Requirements {
  finnish: LangLevel
  english: LangLevel
  swedish: LangLevel
  degree: Degree
  minYears: number
  /** Only people already living in Finland. */
  livesInFinland: boolean
  /** Only people who do not need an employer-backed residence permit. */
  noPermitNeeded: boolean
}

/** What a company says it needs. Written by the company, structured with AI help, approved by the company. */
export interface ChallengeCard {
  company: string
  title: string
  problem: string
  outcomes: string[]
  must: string[]
  nice: string[]
  requirements: Requirements
  workMode: 'on-site' | 'hybrid' | 'remote'
}

/** A synthetic event participant. Holds only what matching needs: no name, age, gender, nationality or photo. */
export interface Participant {
  id: number
  skills: string[]
  finnish: LangLevel
  english: LangLevel
  swedish: LangLevel
  degree: Degree
  years: number
  livesInFinland: boolean
  needsPermit: boolean
}

export type RequirementKey = keyof Requirements | `must:${string}`

/** A requirement the check suggests the company looks at again. */
export interface Flag {
  key: RequirementKey
  title: string
  reason: string
  question: string
  /** What the requirement becomes if the company relaxes it. */
  relaxTo: string
}

export interface CompanyAnswers {
  company: string
  role: string
  outcomes: string
  hard: string
  setup: string
}
