import { useMemo, useState } from 'react'
import { POOL } from '../data/pool'
import { SKILLS, skillLabel, type SkillGroup } from '../data/skills'
import type { FlagText } from '../engine/draft'
import { findFlags, gain, relax } from '../engine/flags'
import { summarize, type Status } from '../engine/match'
import { DEGREES, LANG_LEVELS, type ChallengeCard, type LangLevel, type RequirementKey } from '../engine/types'
import { Room } from './Room'

interface Props {
  card: ChallengeCard
  onCard: (c: ChallengeCard) => void
  justified: RequirementKey[]
  onJustified: (j: RequirementKey[]) => void
  flagText: Partial<Record<RequirementKey, FlagText>>
  source: 'ai' | 'offline'
  onBack: () => void
  onPublish: () => void
}

const GROUPS = [...new Set(SKILLS.map((s) => s.group))] as SkillGroup[]

function Levels({ value, onChange, label }: { value: LangLevel; onChange: (v: LangLevel) => void; label: string }) {
  return (
    <div className="req">
      <span className="req-label">{label}</span>
      <div className="seg" role="radiogroup" aria-label={label}>
        {LANG_LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={value === l.value}
            className={value === l.value ? 'on' : ''}
            onClick={() => onChange(l.value)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Skills({ card, onCard }: { card: ChallengeCard; onCard: (c: ChallengeCard) => void }) {
  const toggle = (id: string) =>
    card.must.includes(id)
      ? onCard({ ...card, must: card.must.filter((s) => s !== id), nice: [...card.nice, id] })
      : onCard({ ...card, nice: card.nice.filter((s) => s !== id), must: [...card.must, id] })
  const remove = (id: string) =>
    onCard({ ...card, must: card.must.filter((s) => s !== id), nice: card.nice.filter((s) => s !== id) })
  const used = new Set([...card.must, ...card.nice])

  const list = (ids: string[], kind: 'must' | 'nice') => (
    <ul className={`skills skills-${kind}`}>
      {ids.map((id) => (
        <li key={id} className="skill">
          <button type="button" className="skill-move" onClick={() => toggle(id)} title={kind === 'must' ? 'Move to nice-to-have' : 'Move to must-have'}>
            {skillLabel(id)}
          </button>
          <button type="button" className="skill-x" onClick={() => remove(id)} aria-label={`Remove ${skillLabel(id)}`}>
            ×
          </button>
        </li>
      ))}
      {ids.length === 0 && <li className="empty">None yet</li>}
    </ul>
  )

  return (
    <div className="skill-cols">
      <div>
        <h3>Must have from day one</h3>
        {list(card.must, 'must')}
      </div>
      <div>
        <h3>Nice to have, can be learned</h3>
        {list(card.nice, 'nice')}
      </div>
      <label className="add-skill">
        <span className="sr-only">Add a skill</span>
        <select
          value=""
          onChange={(e) => e.target.value && onCard({ ...card, nice: [...card.nice, e.target.value] })}
        >
          <option value="">Add a skill…</option>
          {GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {SKILLS.filter((s) => s.group === g && !used.has(s.id)).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <p className="hint">Click a skill to move it between the lists. Skill names follow the EU ESCO classification.</p>
    </div>
  )
}

export function Review({ card, onCard, justified, onJustified, flagText, source, onBack, onPublish }: Props) {
  const [hover, setHover] = useState<RequirementKey | null>(null)
  const summary = useMemo(() => summarize(POOL, card), [card])
  const preview: Status[] | null = useMemo(() => (hover ? summarize(POOL, relax(card, hover)).statuses : null), [card, hover])
  const flags = useMemo(() => findFlags(card, new Set(justified)), [card, justified])
  const allRelaxed = useMemo(() => flags.reduce((c, f) => relax(c, f.key), card), [flags, card])
  const allSummary = useMemo(() => summarize(POOL, allRelaxed), [allRelaxed])
  const r = card.requirements
  const setReq = (patch: Partial<typeof r>) => onCard({ ...card, requirements: { ...r, ...patch } })
  const reachNow = summary.strong + summary.close
  const reachAll = allSummary.strong + allSummary.close

  return (
    <div className="review">
      <div className="card-col">
        <div className="card-sheet">
          <p className="card-company">
            {card.company}
            <span className="source">{source === 'ai' ? 'Drafted by Claude from your answers' : 'Drafted offline from your answers'}</span>
          </p>
          <input className="card-title" value={card.title} onChange={(e) => onCard({ ...card, title: e.target.value })} aria-label="Role title" />

          <label className="block">
            <h3>The problem you are hiring for</h3>
            <textarea rows={3} value={card.problem} onChange={(e) => onCard({ ...card, problem: e.target.value })} />
          </label>

          <div className="block">
            <h3>After three months, they have</h3>
            <ol className="outcomes">
              {card.outcomes.map((o, i) => (
                <li key={i}>
                  <textarea
                    rows={1}
                    value={o}
                    onChange={(e) => onCard({ ...card, outcomes: card.outcomes.map((x, j) => (j === i ? e.target.value : x)) })}
                    aria-label={`Outcome ${i + 1}`}
                  />
                  <button type="button" className="skill-x" onClick={() => onCard({ ...card, outcomes: card.outcomes.filter((_, j) => j !== i) })} aria-label={`Remove outcome ${i + 1}`}>
                    ×
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="link" onClick={() => onCard({ ...card, outcomes: [...card.outcomes, ''] })}>
              Add an outcome
            </button>
          </div>

          <div className="block">
            <Skills card={card} onCard={onCard} />
          </div>

          <div className="block">
            <h3>Requirements</h3>
            <Levels label="Finnish" value={r.finnish} onChange={(v) => setReq({ finnish: v })} />
            <Levels label="English" value={r.english} onChange={(v) => setReq({ english: v })} />
            <Levels label="Swedish" value={r.swedish} onChange={(v) => setReq({ swedish: v })} />
            <div className="req">
              <span className="req-label">Education</span>
              <select value={r.degree} onChange={(e) => setReq({ degree: e.target.value as typeof r.degree })}>
                {DEGREES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="req">
              <span className="req-label">Experience</span>
              <label className="years">
                at least
                <input type="number" min={0} max={20} value={r.minYears} onChange={(e) => setReq({ minYears: Math.max(0, Number(e.target.value)) })} />
                years
              </label>
            </div>
            <label className="req check">
              <input type="checkbox" checked={r.livesInFinland} onChange={(e) => setReq({ livesInFinland: e.target.checked })} />
              Must already live in Finland
            </label>
            <label className="req check">
              <input type="checkbox" checked={r.noPermitNeeded} onChange={(e) => setReq({ noPermitNeeded: e.target.checked })} />
              Must not need a residence permit
            </label>
            <div className="req">
              <span className="req-label">Work</span>
              <div className="seg" role="radiogroup" aria-label="Work mode">
                {(['on-site', 'hybrid', 'remote'] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={card.workMode === m} className={card.workMode === m ? 'on' : ''} onClick={() => onCard({ ...card, workMode: m })}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={onBack}>
            Back to your answers
          </button>
          <button type="button" className="primary" onClick={onPublish} disabled={card.must.length === 0}>
            Publish to the event
          </button>
        </div>
      </div>

      <aside className="side-col">
        <Room statuses={summary.statuses} preview={preview} blockers={summary.soleBlockers} />

        <section className="check" aria-label="Requirement check">
          <h2>Requirement check</h2>
          {flags.length === 0 ? (
            <p className="check-empty">
              Nothing to look at again. Every requirement on your card is either light or has a reason you gave.
            </p>
          ) : (
            <>
              <p className="check-intro">
                {flags.length === 1 ? 'One requirement' : `${flags.length} requirements`} may keep capable people out.
                {reachAll > reachNow && (
                  <>
                    {' '}
                    With all suggestions, your card would reach <strong>{reachAll}</strong> people instead of{' '}
                    <strong>{reachNow}</strong>.
                  </>
                )}{' '}
                You decide.
              </p>
              <ul className="flags">
                {flags.map((f) => {
                  const g = gain(card, f.key)
                  const text = flagText[f.key] ?? f
                  return (
                    <li key={f.key} className="flag">
                      <div className="flag-top">
                        <h3>{f.title}</h3>
                        <span className={`gain${g > 0 ? '' : ' gain-zero'}`}>{g > 0 ? `+${g} people` : 'no change alone'}</span>
                      </div>
                      <p>{text.reason}</p>
                      <p className="flag-q">{text.question}</p>
                      <div className="flag-actions">
                        <button
                          type="button"
                          className="relax"
                          onMouseEnter={() => setHover(f.key)}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => setHover(f.key)}
                          onBlur={() => setHover(null)}
                          onClick={() => {
                            setHover(null)
                            onCard(relax(card, f.key))
                          }}
                        >
                          Change to: {f.relaxTo}
                        </button>
                        <button type="button" className="link" onClick={() => onJustified([...justified, f.key])}>
                          Keep it, it is needed
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </aside>
    </div>
  )
}
