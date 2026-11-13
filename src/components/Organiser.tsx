import { useState } from 'react'
import { EVENT } from '../data/event'
import { POOL } from '../data/pool'
import { SKILLS, type SkillGroup } from '../data/skills'
import { reached, summarize } from '../engine/match'
import type { ChallengeCard } from '../engine/types'
import type { Decision, Interest } from '../engine/interests'

export interface PublishedCard {
  card: ChallengeCard
  publishedAt: string
  /** The card as first drafted, before the requirement check. */
  original?: ChallengeCard
}

function Change({ before, after, label }: { before: number; after: number; label: string }) {
  return (
    <div className="change">
      <p className="change-num">
        {before} <span aria-hidden>→</span>
        <span className="sr-only">to</span> <strong>{after}</strong>
      </p>
      <p className="change-label">{label}</p>
    </div>
  )
}

const GROUP_OF = Object.fromEntries(SKILLS.map((s) => [s.id, s.group])) as Record<string, SkillGroup>

function poolByGroup() {
  const counts = new Map<SkillGroup, number>()
  for (const p of POOL) {
    const groups = new Set(p.skills.map((s) => GROUP_OF[s]))
    for (const g of groups) counts.set(g, (counts.get(g) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

const INVITED = ['Kuljetus Oy (fictional)', 'Arvo Research (fictional)', 'Hoivakoti Kaislikko (fictional)', 'Pixel Fjord Games (fictional)', 'Otaniemi Robotics (fictional)', 'Leppävaara Logistics (fictional)', 'Nordic Fintech Labs (fictional)']

export function Organiser({ cards, interestsFor, decisions }: { cards: PublishedCard[]; interestsFor: (c: ChallengeCard) => Interest[]; decisions: Record<string, Decision> }) {
  const [reminded, setReminded] = useState<string[]>([])
  const rows = cards.map((c) => ({
    ...c,
    s: summarize(POOL, c.card),
    interested: interestsFor(c.card).length,
    meetings: interestsFor(c.card).filter((i) => decisions[i.id] === 'meet').length,
  }))
  const groups = poolByGroup()
  const max = groups[0]?.[1] ?? 1
  const fiWorking = POOL.filter((p) => p.finnish >= 2).length
  const enWorking = POOL.filter((p) => p.english >= 2).length
  const published = new Set(cards.map((c) => c.card.company))
  const before = cards.flatMap((c) => reached(POOL, c.original ?? c.card))
  const after = cards.flatMap((c) => reached(POOL, c.card))
  const english = (ps: typeof POOL) => ps.filter((p) => p.finnish < 2).length
  const permit = (ps: typeof POOL) => ps.filter((p) => p.needsPermit).length
  const changed = cards.filter((c) => c.original && reached(POOL, c.original).length !== reached(POOL, c.card).length).length
  const waiting = INVITED.filter((c) => !published.has(c))

  return (
    <div className="organiser">
      <header>
        <p className="event-line">
          {EVENT.name}, {EVENT.date}. {EVENT.daysLeft} days to go.
        </p>
        <h1>Organiser view</h1>
        <p className="lede">
          Which companies have said what they need, who fits, and who is still missing. Everything here is counts; no
          one's profile is shown.
        </p>
      </header>

      <section>
        <h2>Challenge cards</h2>
        <table className="cards-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th className="num">Fit</th>
              <th className="num">Kept out by requirements</th>
              <th className="num">Interested</th>
              <th className="num">Meetings</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.card.company}</td>
                <td>{r.card.title}</td>
                <td className="num">{r.s.strong + r.s.close}</td>
                <td className="num">{r.s.blocked > 0 ? r.s.blocked : '–'}</td>
                <td className="num">{r.interested || '–'}</td>
                <td className="num">{r.meetings || '–'}</td>
                <td>{r.publishedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>What the requirement check changed</h2>
        <p className="hint">
          Across all cards, people each card reaches as first drafted and as published. {changed === 1 ? 'One company' : `${changed} companies`} changed
          requirements after the check; every change was the company's own decision.
        </p>
        <div className="changes">
          <Change before={before.length} after={after.length} label="Reached in total" />
          <Change before={english(before)} after={english(after)} label="Of them work in English, Finnish below working level" />
          <Change before={permit(before)} after={permit(after)} label="Of them need a residence permit" />
        </div>
      </section>

      <div className="org-grid">
        <section>
          <h2>Still waiting for a card</h2>
          <p className="hint">
            Companies that registered but have not described their need. A card takes five minutes, so a reminder
            three weeks out is usually enough.
          </p>
          <ul className="waiting">
            {waiting.map((c) => (
              <li key={c}>
                <span>{c}</span>
                {reminded.includes(c) ? (
                  <span className="muted">Reminder sent</span>
                ) : (
                  <button type="button" className="link" onClick={() => setReminded([...reminded, c])}>
                    Send reminder
                  </button>
                )}
              </li>
            ))}
            {waiting.length === 0 && <li className="muted">Every invited company has a card.</li>}
          </ul>
        </section>

        <section>
          <h2>Who is coming</h2>
          <p className="hint">
            Send this to companies you invite. It answers the question of whether the city's pool has people for them.
          </p>
          <ul className="bars">
            {groups.map(([g, n]) => (
              <li key={g}>
                <span className="bar-label">{g}</span>
                <span className="bar" style={{ width: `${(n / max) * 100}%` }} />
                <span className="bar-num">{n}</span>
              </li>
            ))}
          </ul>
          <p className="hint">
            {POOL.length} registered professionals. {enWorking} work in English, {fiWorking} in Finnish.
          </p>
        </section>
      </div>
    </div>
  )
}
