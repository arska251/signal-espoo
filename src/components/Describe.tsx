import { useRef, useState } from 'react'
import { EVENT } from '../data/event'
import { POOL } from '../data/pool'
import { SCENARIOS } from '../data/scenarios'
import type { CompanyAnswers } from '../engine/types'
import { Room } from './Room'
import { SignalCheck } from './SignalCheck'
import { outcomeChecks } from '../engine/signalCheck'
import { getLang, t } from '../i18n'

interface Props {
  answers: CompanyAnswers
  onChange: (a: CompanyAnswers) => void
  onSubmit: () => void
  busy: boolean
  ai: boolean
}

const questions = (): { key: keyof CompanyAnswers; label: string; hint: string; rows: number }[] => [
  {
    key: 'outcomes',
    label: t('What should the new person have done after three months?', 'Mitä uuden ihmisen pitäisi olla saanut aikaan kolmessa kuukaudessa?'),
    hint: t(
      'Results, not duties. "Moved our warehouse system to the cloud" says more than "responsible for backend".',
      'Tuloksia, ei tehtäviä. "Siirsi varastojärjestelmän pilveen" kertoo enemmän kuin "vastaa backendistä".',
    ),
    rows: 4,
  },
  {
    key: 'hard',
    label: t('What makes this hard, and what do they need for it?', 'Mikä tässä on vaikeaa, ja mitä siihen tarvitaan?'),
    hint: t(
      'Mention every requirement you have in mind: languages, degree, experience, location. You can change them later.',
      'Mainitse kaikki vaatimukset, joita mietit: kielet, tutkinto, kokemus, sijainti. Voit muuttaa niitä myöhemmin.',
    ),
    rows: 4,
  },
  {
    key: 'setup',
    label: t('Who will they work with, and how?', 'Kenen kanssa ja miten hän työskentelee?'),
    hint: t('Team, tools, on-site or remote.', 'Tiimi, työkalut, paikan päällä vai etänä.'),
    rows: 2,
  },
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
    r.lang = getLang() === 'fi' ? 'fi-FI' : 'en-GB'
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
      {on ? t('Stop dictating', 'Lopeta sanelu') : t('Dictate', 'Sanele')}
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
          {EVENT.name}, {EVENT.date}. {t(`${EVENT.daysLeft} days to go.`, `${EVENT.daysLeft} päivää jäljellä.`)}
        </p>
        <h1>{t('Describe the work, not the job ad.', 'Kuvaa työ, älä työpaikkailmoitusta.')}</h1>
        <p className="lede">
          {t(
            'Three questions, about five minutes. You get a challenge card that participants see three weeks before the event, and you see right away how many of them fit it.',
            'Kolme kysymystä, noin viisi minuuttia. Saat haastekortin, jonka osallistujat näkevät kolme viikkoa ennen tapahtumaa, ja näet heti, moniko heistä sopii siihen.',
          )}
        </p>
        <div className="examples">
          <span>{t('Try an example:', 'Kokeile esimerkkiä:')}</span>
          {SCENARIOS.map((s) => (
            <button key={s.id} type="button" className="chip" onClick={() => onChange(s.answers)}>
              {t(s.label, s.labelFi)}
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
            <span className="field-label">{t('Company', 'Yritys')}</span>
            <input value={answers.company} onChange={(e) => set('company', e.target.value)} placeholder={t('Company name', 'Yrityksen nimi')} />
          </label>
          <label className="field">
            <span className="field-label">{t('What do you call the role today?', 'Mikä roolin nimi on nyt?')}</span>
            <input value={answers.role} onChange={(e) => set('role', e.target.value)} placeholder={t('For example: Senior developer', 'Esimerkiksi: Senior-kehittäjä')} />
          </label>
        </div>
        {questions().map((q) => (
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
            {busy
              ? ai
                ? t('Claude is drafting your card, about 10 seconds…', 'Claude laatii korttiasi, noin 10 sekuntia…')
                : t('Drafting your card…', 'Laaditaan korttia…')
              : t('Draft my challenge card', 'Laadi haastekortti')}
          </button>
          <p className="hint">
            {ai
              ? t(
                  'Claude drafts the card from your words only. You review every line before anything is shared.',
                  'Claude laatii kortin vain sinun sanoistasi. Tarkistat jokaisen rivin ennen kuin mitään jaetaan.',
                )
              : t(
                  'Offline mode: the card is drafted with keyword rules. You review every line before anything is shared.',
                  'Offline-tila: kortti laaditaan avainsanasäännöillä. Tarkistat jokaisen rivin ennen kuin mitään jaetaan.',
                )}
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
