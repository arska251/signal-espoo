import { extractLocal } from './extractLocal'
import type { ChallengeCard, CompanyAnswers, RequirementKey } from './types'

export interface FlagText {
  reason: string
  question: string
}

export interface Draft {
  card: ChallengeCard
  /** Requirements the company gave a reason for. Never flagged. */
  justified: RequirementKey[]
  /** Reasons and questions written by Claude from the company's own words. */
  flagText: Partial<Record<RequirementKey, FlagText>>
  source: 'ai' | 'offline'
  note?: string
}

export async function aiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('./api/card')
    if (!res.ok) return false
    return Boolean((await res.json()).ai)
  } catch {
    return false
  }
}

export async function draftCard(a: CompanyAnswers, ai: boolean): Promise<Draft> {
  try {
    if (!ai) throw new Error('AI is not configured on this server.')
    const res = await fetch('./api/card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
    const { justified, flags, ...card } = data
    return {
      card: { ...card, company: a.company.trim() || 'Your company' },
      justified,
      flagText: Object.fromEntries(flags.map((f: { key: RequirementKey } & FlagText) => [f.key, { reason: f.reason, question: f.question }])),
      source: 'ai',
    }
  } catch (e) {
    const { card, justified } = extractLocal(a)
    const reason = e instanceof Error ? e.message : String(e)
    return { card, justified, flagText: {}, source: 'offline', note: reason }
  }
}
