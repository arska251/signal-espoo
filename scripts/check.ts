import { SCENARIOS } from '../src/data/scenarios'
import { POOL } from '../src/data/pool'
import { extractLocal } from '../src/engine/extractLocal'
import { summarize } from '../src/engine/match'
import { findFlags, gain } from '../src/engine/flags'
for (const s of SCENARIOS) {
  const { card, justified } = extractLocal(s.answers)
  const sum = summarize(POOL, card)
  console.log('\n==', s.id, JSON.stringify({ must: card.must, nice: card.nice, req: card.requirements, mode: card.workMode, justified }))
  console.log('strong', sum.strong, 'close', sum.close, 'blocked', sum.blocked, 'sole', JSON.stringify(sum.soleBlockers))
  for (const f of findFlags(card, new Set(justified))) console.log('  flag', f.key, '+', gain(card, f.key))
}
import { relax } from '../src/engine/flags'
import { reach } from '../src/engine/match'
for (const s of SCENARIOS) {
  const { card, justified } = extractLocal(s.answers)
  let c = card
  const steps: string[] = [`${reach(POOL, c)}`]
  for (const f of findFlags(card, new Set(justified))) { c = relax(c, f.key); steps.push(`${f.key}:${reach(POOL, c)}`) }
  console.log(s.id, 'cumulative', steps.join(' -> '))
}
