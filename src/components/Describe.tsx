import { useRef, useState } from 'react'
import { EVENT } from '../data/event'
import { POOL } from '../data/pool'
import { SCENARIOS } from '../data/scenarios'
import type { CompanyAnswers } from '../engine/types'
import { Room } from './Room'
import { SignalCheck } from './SignalCheck'
import { outcomeChecks } from '../engine/signalCheck'

interface Props {
  answers: CompanyAnswers
  onChange: (a: CompanyAnswers) => void
  onSubmit: () => void
  busy: boolean
  ai: boolean
}

const QUESTIONS: { key: keyof CompanyAnswers; label: string; hint: string; rows: number }[] = [
  { key: 'outcomes', label: 'What should the new person have done after three months?', hint: 'Results, not duties. "Moved our warehouse system to the cloud" says more than "responsible for backend".', rows: 4 },
  { key: 'hard', label: 'What makes this hard, and what do they need for it?', hint: 'Mention every requirement you have in mind: languages, degree, experience, location. You can change them later.', rows: 4 },
  { key: 'setup', label: 'Who will they work with, and how?', hint: 'Team, tools, on-site or remote.', rows: 2 },
]

// Minimal typing for the Web Speech API, which TypeScript's DOM lib does not include.
interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
const SpeechRecognition: (new () => Recognition) | undefined =
  (window as unknown as { SpeechRecognition?: new () => Recognition }).SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition

function Dictate({ onText }: { onText: (t: string) => void }) {
  const [on, setOn] = useState(false)
  const rec = useRef<Recognition | null>(null)
  if (!SpeechRecognition) return null
  const toggle = () => {
    if (on) {
      rec.current?.stop()
      return
    }
    const r = new SpeechRecognition()
    r.lang = navigator.language.startsWith('fi') ? 'fi-FI' : 'en-GB'
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      const last = e.results[e.results.length - 1]
      onText(last[0].transcript)
    }
    r.onend = () => setOn(false)
    rec.current = r
    r.start()
    setOn(true)
  }
  return (
    <button type="button" className={`dictate${on ? ' dictate-on' : ''}`} onClick={toggle} aria-pressed={on}>
      {on ? 'Stop dictating' : 'Dictate'}
    </button>
  )
}

export function Describe({ answers, onChange, onSubmit, busy, ai }: Props) {
  const set = (key: keyof CompanyAnswers, value: string) => onChange({ ...answers, [key]: value })
  const ready = answers.outcomes.trim().length > 10 && answers.hard.trim().length > 10

  return (
    <div className="describe">
      <div className="describe-main">
      <header className="describe-head">
        <p className="event-line">
          {EVENT.name}, {EVENT.date}. {EVENT.daysLeft} days to go.
        </p>
        <h1>Describe the work, not the job ad.</h1>
        <p className="lede">
          Three questions, about five minutes. You get a challenge card that participants see three weeks before the
          event, and you see right away how many of them fit it.
        </p>
        <div className="examples">
          <span>Try an example:</span>
          {SCENARIOS.map((s) => (
            <button key={s.id} type="button" className="chip" onClick={() => onChange(s.answers)}>
              {s.label}
            </button>
          ))}
        </div>
      </header>

      <form
        className="questions"
        onSubmit={(e) => {
          e.preventDefault()
          if (ready && !busy) onSubmit()
        }}
      >
        <div className="row-2">
          <label className="field">
            <span className="field-label">Company</span>
            <input value={answers.company} onChange={(e) => set('company', e.target.value)} placeholder="Company name" />
          </label>
          <label className="field">
            <span className="field-label">What do you call the role today?</span>
            <input value={answers.role} onChange={(e) => set('role', e.target.value)} placeholder="For example: Senior developer" />
          </label>
        </div>
        {QUESTIONS.map((q) => (
          <div className="field" key={q.key}>
            <div className="field-top">
              <label className="field-label" htmlFor={q.key}>
                {q.label}
              </label>
              <Dictate onText={(t) => set(q.key, `${answers[q.key]} ${t}`.trim())} />
            </div>
            <textarea id={q.key} rows={q.rows} value={answers[q.key]} onChange={(e) => set(q.key, e.target.value)} />
            <p className="hint">{q.hint}</p>
            {q.key === 'outcomes' && <SignalCheck checks={outcomeChecks(answers.outcomes)} empty={answers.outcomes.trim().length < 15} />}
          </div>
        ))}
        <div className="submit-row">
          <button className="primary" type="submit" disabled={!ready || busy}>
            {busy ? 'Drafting your card…' : 'Draft my challenge card'}
          </button>
          <p className="hint">
            {ai
              ? 'Claude drafts the card from your words only. You review every line before anything is shared.'
              : 'Offline mode: the card is drafted with keyword rules. You review every line before anything is shared.'}
          </p>
        </div>
      </form>
      </div>
      <aside className="describe-side">
        <Room statuses={POOL.map(() => 'none')} idle />
      </aside>
    </div>
  )
}
