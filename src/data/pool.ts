// Synthetic event participants. Generated from a fixed seed, so every demo shows the same room.
// Distributions are rough assumptions about an Espoo matchmaking event with many international
// participants, not real statistics.
import type { Degree, LangLevel, Participant } from '../engine/types'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(2026)

function pick<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [v, w] of items) {
    r -= w
    if (r <= 0) return v
  }
  return items[items.length - 1][0]
}

function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0])
  return out
}

interface Archetype {
  weight: number
  core: string[]
  extra: string[]
  degree: [Degree, number][]
}

const ARCHETYPES: Archetype[] = [
  { weight: 40, core: ['backend', 'frontend', 'js'], extra: ['ts', 'python', 'java', 'api', 'testing', 'sql', 'agile', 'cloud', 'legacy', 'csharp'], degree: [['vocational', 1], ['bachelor', 5], ['master', 4], ['none', 1]] },
  { weight: 24, core: ['data-analysis', 'sql'], extra: ['python', 'bi', 'ml', 'excel', 'database', 'stakeholders'], degree: [['bachelor', 4], ['master', 6]] },
  { weight: 18, core: ['cloud', 'devops'], extra: ['linux', 'security', 'python', 'backend', 'legacy', 'database'], degree: [['vocational', 2], ['bachelor', 5], ['master', 3], ['none', 1]] },
  { weight: 26, core: ['supply-chain', 'wms'], extra: ['procurement', 'erp', 'lean', 'excel', 'pm', 'stakeholders', 'data-analysis', 'training'], degree: [['vocational', 3], ['bachelor', 5], ['master', 3], ['none', 1]] },
  { weight: 24, core: ['nursing'], extra: ['elderly-care', 'medication', 'patient-safety', 'training', 'customer-service'], degree: [['vocational', 5], ['bachelor', 5], ['master', 1]] },
  { weight: 30, core: ['customer-service'], extra: ['customer-success', 'sales', 'marketing', 'content', 'excel', 'training', 'erp'], degree: [['none', 2], ['vocational', 4], ['bachelor', 4], ['master', 2]] },
  { weight: 24, core: ['pm', 'stakeholders'], extra: ['agile', 'excel', 'accounting', 'training', 'lean', 'erp', 'bi'], degree: [['bachelor', 5], ['master', 5]] },
  { weight: 14, core: ['ux'], extra: ['graphic', 'frontend', 'content', 'marketing', 'agile'], degree: [['vocational', 1], ['bachelor', 5], ['master', 3]] },
  { weight: 20, core: ['mech', 'cad'], extra: ['automation', 'electrical', 'embedded', 'pm', 'lean', 'cpp'], degree: [['vocational', 3], ['bachelor', 5], ['master', 4]] },
  { weight: 12, core: ['backend', 'sql'], extra: ['wms', 'supply-chain', 'erp', 'api', 'cloud', 'legacy', 'python', 'java'], degree: [['vocational', 1], ['bachelor', 5], ['master', 4]] },
  { weight: 10, core: ['games'], extra: ['cpp', 'csharp', 'backend', 'graphic', 'testing', 'agile'], degree: [['none', 2], ['vocational', 2], ['bachelor', 5], ['master', 2]] },
]

const ALL_EXTRA = [...new Set(ARCHETYPES.flatMap((a) => [...a.core, ...a.extra]))]

function makeParticipant(id: number): Participant {
  const arch = pick(ARCHETYPES.map((a) => [a, a.weight] as [Archetype, number]))
  const skills = new Set<string>(sample(arch.core, Math.max(1, arch.core.length - (rand() < 0.3 ? 1 : 0))))
  for (const s of sample(arch.extra, 2 + Math.floor(rand() * 3))) skills.add(s)
  // Career changers bring a skill from another field.
  if (rand() < 0.2) skills.add(ALL_EXTRA[Math.floor(rand() * ALL_EXTRA.length)])

  const international = rand() < 0.5
  const finnish: LangLevel = international
    ? pick<LangLevel>([[0, 30], [1, 38], [2, 24], [3, 8]])
    : 3
  const english: LangLevel = international
    ? pick<LangLevel>([[3, 62], [2, 33], [1, 5]])
    : pick<LangLevel>([[3, 40], [2, 52], [1, 8]])
  const swedish: LangLevel = international ? pick<LangLevel>([[0, 92], [1, 6], [2, 2]]) : pick<LangLevel>([[0, 20], [1, 55], [2, 20], [3, 5]])
  const livesInFinland = international ? rand() < 0.8 : true
  const needsPermit = international ? rand() < (livesInFinland ? 0.35 : 0.7) : false
  let degree = pick(arch.degree)
  if (international && degree === 'bachelor' && rand() < 0.35) degree = 'master'
  const years = Math.floor(Math.pow(rand(), 1.3) * 16)

  return { id, skills: [...skills], finnish, english, swedish, degree, years, livesInFinland, needsPermit }
}

export const POOL_SIZE = 240
export const POOL: Participant[] = Array.from({ length: POOL_SIZE }, (_, i) => makeParticipant(i))
