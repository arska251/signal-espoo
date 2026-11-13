import { conversationBrief, matchedSkills, slot, type Decision, type Interest } from '../engine/interests'
import { DEGREES, LANG_LEVELS, type ChallengeCard, type Participant } from '../engine/types'

/** Only what the card asks about. Nothing about age, gender, nationality or where someone studied. */
function facts(p: Participant, card: ChallengeCard): string[] {
  const r = card.requirements
  const out: string[] = []
  const langs: [string, number, number][] = [
    ['Finnish', p.finnish, r.finnish],
    ['English', p.english, r.english],
    ['Swedish', p.swedish, r.swedish],
  ]
  for (const [name, has, needs] of langs) if (needs > 0) out.push(`${LANG_LEVELS[has].label} ${name}`)
  if (r.minYears > 0) out.push(`${p.years} years of experience`)
  if (r.degree !== 'none') out.push(DEGREES.find((d) => d.value === p.degree)!.label)
  return out
}

interface Props {
  card: ChallengeCard
  interests: Interest[]
  decisions: Record<string, Decision>
  onDecide: (id: string, d: Decision | null) => void
}

export function Inbox({ card, interests, decisions, onDecide }: Props) {
  const meetings = interests.filter((i) => decisions[i.id] === 'meet')
  const open = interests.filter((i) => !decisions[i.id])

  return (
    <div className="inbox">
      <section>
        <p className="time-jump">Fast forward: one week before the event.</p>
        <h2>Interested in your card</h2>
        <p className="hint">
          {interests.length} people so far, in the order they arrived. Signal does not rank anyone. You see the outcome
          they picked, their own words, and only the facts your card asks about.
        </p>
        <ul className="answers">
          {interests.map((i, n) => {
            const d = decisions[i.id]
            return (
              <li key={i.id} className={`answer${d ? ` answer-${d}` : ''}`}>
                <p className="answer-meta">
                  Person {n + 1} · {i.arrived}
                  {i.personaId && <span className="you"> · sent from the participant view</span>}
                </p>
                <p className="answer-outcome">On “{i.outcome}”</p>
                <blockquote>{i.text}</blockquote>
                <ul className="mini-skills">
                  {matchedSkills(i.participant, card).map((s) => (
                    <li key={s.id} className={s.exact ? 'exact' : 'near'}>
                      {s.label}
                    </li>
                  ))}
                </ul>
                {facts(i.participant, card).length > 0 && <p className="answer-facts">{facts(i.participant, card).join(' · ')}</p>}
                <div className="answer-actions">
                  {d ? (
                    <>
                      <span className="decided">{d === 'meet' ? 'Meeting booked' : 'Not this time'}</span>
                      <button type="button" className="link" onClick={() => onDecide(i.id, null)}>
                        Undo
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="primary small" onClick={() => onDecide(i.id, 'meet')}>
                        Meet at the event
                      </button>
                      <button type="button" className="link" onClick={() => onDecide(i.id, 'pass')}>
                        Not this time
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        {open.length === 0 && interests.length > 0 && <p className="hint">You have answered everyone. People you passed on get a kind note and other cards that fit them.</p>}
      </section>

      {meetings.length > 0 && (
        <section className="meetings">
          <h2>Your meetings on the day</h2>
          <p className="hint">15 minutes each. Both sides get three questions, so the time goes to the work, not small talk.</p>
          <ol className="schedule">
            {meetings.map((i, n) => {
              const brief = conversationBrief(card, i)
              return (
                <li key={i.id}>
                  <p className="slot">{slot(n)}</p>
                  <div>
                    <p className="slot-who">Person {interests.indexOf(i) + 1}, on “{i.outcome}”</p>
                    <ul className="brief">
                      {brief.company.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </div>
  )
}
