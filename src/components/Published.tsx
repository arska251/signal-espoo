import type { ReactNode } from 'react'
import { POOL } from '../data/pool'
import { skillLabel } from '../data/skills'
import { summarize } from '../engine/match'
import { DEGREES, LANG_LEVELS, type ChallengeCard } from '../engine/types'

export function CardPreview({ card }: { card: ChallengeCard }) {
  const r = card.requirements
  const langs = (
    [
      ['Finnish', r.finnish],
      ['English', r.english],
      ['Swedish', r.swedish],
    ] as const
  ).filter(([, l]) => l > 0)
  const reqs = [
    ...langs.map(([n, l]) => `${LANG_LEVELS[l].label} ${n}`),
    r.degree !== 'none' ? DEGREES.find((d) => d.value === r.degree)!.label : null,
    r.minYears > 0 ? `${r.minYears}+ years of experience` : null,
    r.livesInFinland ? 'Lives in Finland' : null,
    r.noPermitNeeded ? 'No residence permit needed' : null,
    `Work: ${card.workMode}`,
  ].filter(Boolean)

  return (
    <article className="preview-card">
      <p className="card-company">{card.company}</p>
      <h2>{card.title}</h2>
      <p className="preview-problem">{card.problem}</p>
      <h3>After three months, you have</h3>
      <ul>
        {card.outcomes.filter(Boolean).map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
      <h3>You bring</h3>
      <p className="preview-skills">
        {card.must.map(skillLabel).join(', ')}
        {card.nice.length > 0 && <span className="muted"> · learn in the job: {card.nice.map(skillLabel).join(', ')}</span>}
      </p>
      <p className="preview-reqs">{reqs.join(' · ')}</p>
    </article>
  )
}

interface Props {
  card: ChallengeCard
  onNew: () => void
  onOrganiser: () => void
  onParticipant: () => void
  /** The inbox of interested participants. */
  children?: ReactNode
}

export function Published({ card, onNew, onOrganiser, onParticipant, children }: Props) {
  const s = summarize(POOL, card)
  return (
    <div className="published">
      <div className="published-text">
        <h1>Your card is published.</h1>
        <p className="lede">
          {s.strong + s.close} registered participants fit it today. They see your card three weeks before the event,
          and nobody sees who they are until both of you say yes.
        </p>
        <ol className="next">
          <li>
            <strong>Now.</strong> Organisers at the City of Espoo check the card before participants see it.
          </li>
          <li>
            <strong>Three weeks before.</strong> Participants who fit say they are interested and tell, in a few sentences, when they did something like one of your outcomes.
          </li>
          <li>
            <strong>One week before.</strong> You read those answers with skills, without names or photos, and pick who to meet.
          </li>
          <li>
            <strong>Event day.</strong> Your 15-minute meetings are in both calendars.
          </li>
        </ol>
        <div className="actions">
          <button type="button" className="secondary" onClick={onNew}>
            Write another card
          </button>
          <button type="button" className="primary" onClick={onParticipant}>
            See it as a participant
          </button>
          <button type="button" className="secondary" onClick={onOrganiser}>
            Organiser view
          </button>
        </div>
      </div>
      <CardPreview card={card} />
      {children && <div className="published-inbox">{children}</div>}
    </div>
  )
}
