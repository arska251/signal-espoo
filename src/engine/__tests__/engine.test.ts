// Run with: npm test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { POOL } from '../../data/pool'
import { SCENARIOS } from '../../data/scenarios'
import { extractLocal } from '../extractLocal'
import { findFlags, gain, relax } from '../flags'
import { conversationBrief, seededInterests } from '../interests'
import { evaluate, reach, summarize } from '../match'
import type { ChallengeCard, Participant } from '../types'

const scenario = (id: string) => extractLocal(SCENARIOS.find((s) => s.id === id)!.answers)

const card: ChallengeCard = {
  company: 'Test', title: 'Dev', problem: '', outcomes: ['Ship it.'], must: ['backend', 'sql'], nice: [], workMode: 'hybrid',
  requirements: { finnish: 0, english: 0, swedish: 0, degree: 'none', minYears: 0, livesInFinland: false, noPermitNeeded: false },
}
const person = (over: Partial<Participant>): Participant => ({
  id: 1, skills: ['backend', 'sql'], finnish: 0, english: 3, swedish: 0, degree: 'none', years: 1, livesInFinland: true, needsPermit: false, ...over,
})

test('every must-have skill makes a strong match', () => {
  assert.equal(evaluate(person({}), card).status, 'strong')
})

test('a related skill makes a close match, not a strong one', () => {
  assert.equal(evaluate(person({ skills: ['backend', 'data-analysis'] }), card).status, 'close')
})

test('a requirement keeps out someone who has the skills', () => {
  const strict = { ...card, requirements: { ...card.requirements, finnish: 3 as const } }
  const e = evaluate(person({ finnish: 1 }), strict)
  assert.equal(e.status, 'blocked')
  assert.deepEqual(e.fails, ['finnish'])
})

test('relaxing a requirement never reduces reach', () => {
  for (const s of SCENARIOS) {
    const { card: c, justified } = extractLocal(s.answers)
    for (const f of findFlags(c, new Set(justified))) assert.ok(gain(c, f.key) >= 0, `${s.id}: ${f.key}`)
  }
})

test('pool counts add up', () => {
  const s = summarize(POOL, scenario('logistics').card)
  assert.equal(s.statuses.length, POOL.length)
  assert.ok(s.strong + s.close + s.blocked <= POOL.length)
})

test('logistics example: inflated requirements are flagged and relaxing them widens reach', () => {
  const { card: c, justified } = scenario('logistics')
  const flags = findFlags(c, new Set(justified))
  for (const k of ['finnish', 'degree', 'minYears', 'livesInFinland', 'noPermitNeeded']) assert.ok(flags.some((f) => f.key === k), k)
  const relaxed = flags.reduce((x, f) => relax(x, f.key), c)
  assert.ok(reach(POOL, relaxed) > reach(POOL, c) * 10)
})

test('a requirement with a stated reason is not flagged', () => {
  const care = scenario('care')
  assert.ok(care.justified.includes('finnish'))
  assert.ok(!findFlags(care.card, new Set(care.justified)).some((f) => f.key === 'finnish'))
  const equity = scenario('equity')
  assert.ok(equity.justified.includes('finnish'))
})

test('skill keywords match whole words only', () => {
  const { card: c } = extractLocal({ company: 'X', role: 'Y', outcomes: 'Improve the reporting pipeline with capital data.', hard: 'Excellent attention to detail.', setup: '' })
  assert.ok(!c.must.includes('games') && !c.nice.includes('games'), 'pipeline is not peli')
  assert.ok(!c.must.includes('api') && !c.nice.includes('api'), 'capital is not api')
  assert.ok(!c.must.includes('excel') && !c.nice.includes('excel'), 'excellent is not Excel')
})

test('seeded interests come only from people who fit the card', () => {
  const { card: c } = scenario('game')
  const seeded = seededInterests(c)
  assert.ok(seeded.length > 0)
  for (const i of seeded) assert.ok(['strong', 'close'].includes(evaluate(i.participant, c).status))
})

test('conversation brief gives three questions to each side', () => {
  const { card: c } = scenario('game')
  const b = conversationBrief(c, seededInterests(c)[0])
  assert.equal(b.company.length, 3)
  assert.equal(b.participant.length, 3)
})

import { answerChecks, outcomeChecks } from '../signalCheck'

test('signal check: a specific answer passes, generic filler does not', () => {
  const good = answerChecks('I moved our 12-year-old order system to AWS one module at a time, so customers never noticed the switch.')
  assert.ok(good.every((c) => c.ok), JSON.stringify(good))
  const vague = answerChecks('I am a passionate, results-driven team player with a proven track record in delivering value.')
  assert.ok(vague.filter((c) => !c.ok).length >= 3, JSON.stringify(vague))
})

test('signal check works in Finnish', () => {
  const fi = answerChecks('Siirsin vanhan laskutusjärjestelmän pilveen, jotta julkaisu nopeutui päivästä kymmeneen minuuttiin.')
  assert.ok(fi.every((c) => c.ok), JSON.stringify(fi))
})

test('outcome check: duties are flagged, results are not', () => {
  assert.ok(!outcomeChecks('Responsible for backend development and working with the team.')[0].ok)
  assert.ok(outcomeChecks('Moved the warehouse system to the cloud without stopping deliveries.').every((c) => c.ok))
})
