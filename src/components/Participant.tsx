import { useState } from 'react'
import { EVENT } from '../data/event'
import { PERSONAS } from '../data/personas'
import { SKILL_BY_ID, skillLabel } from '../data/skills'
import { conversationBrief, slot, type Decision, type Interest } from '../engine/interests'
import { evaluate } from '../engine/match'
import type { ChallengeCard, Participant as P } from '../engine/types'
import type { PublishedCard } from './Organiser'
import { SignalCheck } from './SignalCheck'
import { answerChecks } from '../engine/signalCheck'

/** Plain-language reasons a card fits this person. */
function why(p: P, card: ChallengeCard): string {
  const have = card.must.filter((s) => p.skills.includes(s)).map(skillLabel)
  const near = card.must
    .filter((s) => !p.skills.includes(s))
    .map((s) => {
      const r = SKILL_BY_ID[s]?.related.find((x) => p.skills.includes(x))
      return r ? `${skillLabel(r)} is close to ${skillLabel(s)}` : null
    })
    .filter(Boolean)
  return [have.length ? `You have ${have.join(', ')}.` : '', near.length ? `${near.join('; ')}.` : ''].join(' ').trim()
}

function InterestForm({ card, onSend }: { card: ChallengeCard; onSend: (outcome: string, text: string) => void }) {
  const outcomes = card.outcomes.filter(Boolean)
  const [outcome, setOutcome] = useState(outcomes[0] ?? '')
  const [text, setText] = useState('')
  const max = 400
  return (
    <form
      className="interest"
      onSubmit={(e) => {
        e.preventDefault()
        if (text.trim().length >= 40) onSend(outcome, text.trim())
      }}
    >
      <p className="interest-q">Which of their outcomes could you deliver?</p>
      {outcomes.map((o) => (
        <label key={o} className="radio">
          <input type="radio" name={`o-${card.title}`} checked={outcome === o} onChange={() => setOutcome(o)} />
          {o}
        </label>
      ))}
      <label className="interest-q" htmlFor={`t-${card.title}`}>
        When did you do something like it? Two or three sentences, in your own words and any language.
      </label>
      <textarea id={`t-${card.title}`} rows={3} maxLength={max} value={text} onChange={(e) => setText(e.target.value)} />
      <p className="hint">
        {text.length}/{max}. Short and specific beats polished: the company reads this with your skills, without your
        name, and you talk about it face to face at the event.
      </p>
      <SignalCheck checks={answerChecks(text)} empty={text.trim().length < 20} />
      <button className="primary" type="submit" disabled={text.trim().length < 40}>
        Send interest
      </button>
    </form>
  )
}

interface Props {
  cards: PublishedCard[]
  interests: Interest[]
  decisions: Record<string, Decision>
  /** Position of an interest among the meetings of its card, for the time slot. */
  meetingIndex: (i: Interest) => number
  onInterest: (i: Interest) => void
}

export function Participant({ cards, interests, decisions, meetingIndex, onInterest }: Props) {
  const [personaId, setPersonaId] = useState(PERSONAS[0].id)
  const [open, setOpen] = useState<string | null>(null)
  const persona = PERSONAS.find((p) => p.id === personaId)!
  const p = persona.participant

  const evaluated = cards.map((c) => ({ ...c, e: evaluate(p, c.card) }))
  const fits = evaluated.filter((c) => c.e.status === 'strong' || c.e.status === 'close').sort((a) => (a.e.status === 'strong' ? -1 : 1))
  const hidden = evaluated.filter((c) => c.e.status === 'blocked').length

  return (
    <div className="participant">
      <header>
        <p className="event-line">
          {EVENT.name}, {EVENT.date}. Participant view.
        </p>
        <h1>Companies that need what you can do.</h1>
        <p className="lede">
          No CV to polish. You see the work each company needs done and tell them, in a few sentences, when you have
          done something like it. They never see your name before you both say yes.
        </p>
        <div className="persona-pick" role="radiogroup" aria-label="Example participant">
          {PERSONAS.map((x) => (
            <button key={x.id} type="button" role="radio" aria-checked={x.id === personaId} className={`chip${x.id === personaId ? ' chip-on' : ''}`} onClick={() => setPersonaId(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <p className="persona-about">{persona.about}</p>
      </header>

      <ul className="fit-list">
        {fits.map(({ card }) => {
          const key = `${card.company}/${card.title}`
          const sent = interests.find((i) => i.personaId === personaId && i.cardTitle === card.title && i.company === card.company)
          const decision = sent ? decisions[sent.id] : undefined
          return (
            <li key={key} className="fit">
              <p className="card-company">{card.company}</p>
              <h2>{card.title}</h2>
              <p className="fit-problem">{card.problem}</p>
              <p className="fit-why">{why(p, card)}</p>
              {sent && decision === 'meet' ? (
                <div className="met">
                  <p className="sent">
                    {card.company} wants to meet you: {EVENT.date}, {slot(meetingIndex(sent))}, 15 minutes.
                  </p>
                  <p className="hint">Three questions you could ask them:</p>
                  <ul className="brief">
                    {conversationBrief(card, sent).participant.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              ) : sent ? (
                <p className="sent">
                  {decision === 'pass'
                    ? 'The company chose other people this time. Your answer stays with you, and new cards arrive until a week before the event.'
                    : 'Interest sent. The company sees your skills and your answer, without your name.'}
                </p>
              ) : open === key ? (
                <InterestForm
                  card={card}
                  onSend={(outcome, text) => {
                    onInterest({
                      id: `${personaId}-${key}`,
                      personaId,
                      participant: p,
                      cardTitle: card.title,
                      company: card.company,
                      outcome,
                      text,
                      arrived: 'just now',
                    })
                    setOpen(null)
                  }}
                />
              ) : (
                <button type="button" className="secondary" onClick={() => setOpen(key)}>
                  I am interested
                </button>
              )}
            </li>
          )
        })}
        {fits.length === 0 && <li className="empty">No cards fit yet. New cards arrive until a week before the event.</li>}
      </ul>
      {hidden > 0 && (
        <p className="hint">
          {hidden === 1 ? 'One more card needs' : `${hidden} more cards need`} skills you have, but asks for a requirement
          you do not meet yet. The organisers see this and talk with those companies.
        </p>
      )}
    </div>
  )
}
