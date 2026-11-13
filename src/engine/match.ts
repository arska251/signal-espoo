// Transparent, rule-based matching. No AI touches participant data: the model only ever reads the
// company's own words. Every count here can be explained in one sentence.
import { SKILL_BY_ID } from '../data/skills'
import { DEGREE_RANK, type ChallengeCard, type Participant, type RequirementKey, type Requirements } from './types'

export type Status = 'strong' | 'close' | 'blocked' | 'none'

export interface Evaluation {
  status: Status
  /** Requirements this person does not meet. */
  fails: RequirementKey[]
}

/** 1 for the skill itself, 0.5 for a closely related skill, else 0. */
function skillScore(p: Participant, skill: string): number {
  if (p.skills.includes(skill)) return 1
  const related = SKILL_BY_ID[skill]?.related ?? []
  return related.some((r) => p.skills.includes(r)) ? 0.5 : 0
}

export function failedRequirements(p: Participant, r: Requirements): RequirementKey[] {
  const fails: RequirementKey[] = []
  if (p.finnish < r.finnish) fails.push('finnish')
  if (p.english < r.english) fails.push('english')
  if (p.swedish < r.swedish) fails.push('swedish')
  if (DEGREE_RANK[p.degree] < DEGREE_RANK[r.degree]) fails.push('degree')
  if (p.years < r.minYears) fails.push('minYears')
  if (r.livesInFinland && !p.livesInFinland) fails.push('livesInFinland')
  if (r.noPermitNeeded && p.needsPermit) fails.push('noPermitNeeded')
  return fails
}

export function evaluate(p: Participant, card: ChallengeCard): Evaluation {
  const must = card.must
  const scores = must.map((s) => skillScore(p, s))
  const coverage = must.length ? scores.reduce((a, b) => a + b, 0) / must.length : 0
  const exact = must.length > 0 && scores.every((s) => s === 1)
  const skillFails: RequirementKey[] = must.filter((_, i) => scores[i] === 0).map((s) => `must:${s}` as const)
  const fails = [...failedRequirements(p, card.requirements), ...skillFails]
  const reqFails = fails.filter((f) => !f.startsWith('must:'))

  if (coverage >= 0.6 && skillFails.length <= 1) {
    if (reqFails.length) return { status: 'blocked', fails }
    return { status: exact ? 'strong' : 'close', fails }
  }
  return { status: 'none', fails }
}

export interface PoolSummary {
  strong: number
  close: number
  blocked: number
  total: number
  statuses: Status[]
  /** For each requirement: how many people it alone keeps out. */
  soleBlockers: Partial<Record<RequirementKey, number>>
}

export function summarize(pool: Participant[], card: ChallengeCard): PoolSummary {
  const statuses: Status[] = []
  const soleBlockers: Partial<Record<RequirementKey, number>> = {}
  let strong = 0
  let close = 0
  let blocked = 0
  for (const p of pool) {
    const e = evaluate(p, card)
    statuses.push(e.status)
    if (e.status === 'strong') strong++
    else if (e.status === 'close') close++
    else if (e.status === 'blocked') {
      blocked++
      const reqFails = e.fails.filter((f) => !f.startsWith('must:'))
      if (reqFails.length === 1) soleBlockers[reqFails[0]] = (soleBlockers[reqFails[0]] ?? 0) + 1
    }
  }
  return { strong, close, blocked, total: pool.length, statuses, soleBlockers }
}

/** How many people the card reaches (strong + close). */
export function reach(pool: Participant[], card: ChallengeCard): number {
  const s = summarize(pool, card)
  return s.strong + s.close
}

/** The people a card reaches (strong or close). */
export function reached(pool: Participant[], card: ChallengeCard): Participant[] {
  return pool.filter((p) => {
    const s = evaluate(p, card).status
    return s === 'strong' || s === 'close'
  })
}
