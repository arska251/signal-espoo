// Interests: a participant's answer to one of the company's outcomes. Seeded ones simulate the
// three weeks between publishing a card and the event.
import { ANSWERS, GENERIC } from '../data/answers'
import { POOL } from '../data/pool'
import { SKILL_BY_ID, skillLabel } from '../data/skills'
import { evaluate } from './match'
import { levelLabel, type ChallengeCard, type Participant } from './types'
import { t } from '../i18n'

export interface Interest {
  id: string
  company: string
  cardTitle: string
  outcome: string
  text: string
  participant: Participant
  /** Set when the interest came from one of the example personas. */
  personaId?: string
  /** Days before the event when the interest arrived; 0 is just now. */
  arrived: number
}

export type Decision = 'meet' | 'pass'

export const cardKey = (c: { company: string; title?: string; cardTitle?: string }) => `${c.company}/${c.title ?? c.cardTitle}`

/** A handful of fitting participants who said they are interested, in a stable order. */
export function seededInterests(card: ChallengeCard, count = 4): Interest[] {
  const fits = POOL.filter((p) => {
    const s = evaluate(p, card).status
    return s === 'strong' || s === 'close'
  })
  // Spread the picks over the pool instead of taking the first ones.
  const picked = fits.filter((_, i) => i % Math.max(1, Math.floor(fits.length / count)) === 0).slice(0, count)
  const outcomes = card.outcomes.filter(Boolean)
  return picked.map((p, i) => {
    const skill = card.must.find((s) => p.skills.includes(s) && ANSWERS[s]) ?? p.skills.find((s) => ANSWERS[s])
    const bank = (skill && ANSWERS[skill]) || GENERIC
    return {
      id: `seed-${p.id}-${cardKey(card)}`,
      company: card.company,
      cardTitle: card.title,
      outcome: outcomes[i % Math.max(1, outcomes.length)] ?? '',
      text: bank[(p.id + i) % bank.length],
      participant: p,
      arrived: 18 - i * 3,
    }
  })
}

/** Skills on the card this person has, or has something close to. */
export function matchedSkills(p: Participant, card: ChallengeCard) {
  return [...card.must, ...card.nice]
    .map((s) => {
      if (p.skills.includes(s)) return { id: s, label: skillLabel(s), exact: true }
      // Near matches only count for must-haves; for nice-to-haves they are noise.
      const r = card.must.includes(s) ? SKILL_BY_ID[s]?.related.find((x) => p.skills.includes(x)) : undefined
      return r ? { id: s, label: t(`${skillLabel(r)} (close to ${skillLabel(s)})`, `${skillLabel(r)} (lähellä: ${skillLabel(s)})`), exact: false } : null
    })
    .filter((x): x is { id: string; label: string; exact: boolean } => x !== null)
}

/** Three questions for each side, so the 15 minutes go to substance. Built from the card and the answer. */
export function conversationBrief(card: ChallengeCard, i: Interest) {
  const p = i.participant
  const missing = [...card.must, ...card.nice].find((s) => !p.skills.includes(s))
  const outcome = i.outcome.replace(/[.!]+$/, '')
  const company = [
    t(
      'Ask them to walk you through what they wrote: what went wrong along the way, and what they would do differently.',
      'Pyydä kertomaan, mitä hän kirjoitti: mikä meni matkalla pieleen ja mitä hän tekisi toisin.',
    ),
    t(`Describe how you would start on “${outcome}” and ask where they would begin.`, `Kerro, miten itse aloittaisit tavoitteen “${outcome}”, ja kysy, mistä hän aloittaisi.`),
    missing
      ? t(
          `“${skillLabel(missing)}” is new for them. Ask how they would get up to speed, and how they learned the last new thing they picked up.`,
          `“${skillLabel(missing)}” on hänelle uusi. Kysy, miten hän pääsisi vauhtiin ja miten hän oppi viimeksi jotain uutta.`,
        )
      : t('Ask what they need from your team in the first week to be useful.', 'Kysy, mitä hän tarvitsee tiimiltä ensimmäisellä viikolla.'),
  ]
  const participant = [
    t(`Ask what “done” looks like for “${outcome}” and who decides.`, `Kysy, miltä valmis näyttää tavoitteessa “${outcome}” ja kuka sen päättää.`),
    t('Ask who you would work with every day and how the team shares knowledge.', 'Kysy, kenen kanssa työskentelisit päivittäin ja miten tiimi jakaa tietoa.'),
    p.finnish < 2 && card.requirements.finnish < 2
      ? t(
          `Agree on the working language and what support for learning Finnish looks like (your Finnish: ${levelLabel(p.finnish).toLowerCase()}).`,
          `Sopikaa työkielestä ja siitä, miten suomen oppimista tuetaan (suomesi: ${levelLabel(p.finnish).toLowerCase()}).`,
        )
      : t('Ask what the first month looks like, week by week.', 'Kysy, miltä ensimmäinen kuukausi näyttää viikko viikolta.'),
  ]
  return { company, participant }
}

export function slot(index: number): string {
  const start = 10 * 60 + index * 20
  return `${Math.floor(start / 60)}:${String(start % 60).padStart(2, '0')}`
}
