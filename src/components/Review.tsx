import { useMemo, useState } from 'react'
import { POOL } from '../data/pool'
import { SKILLS, groupLabel, skillLabel, type SkillGroup } from '../data/skills'
import type { FlagText } from '../engine/draft'
import { findFlags, gain, relax } from '../engine/flags'
import { summarize, type Status } from '../engine/match'
import { DEGREES, LANG_LEVELS, degreeLabel, levelLabel, workModeLabel, type ChallengeCard, type LangLevel, type RequirementKey } from '../engine/types'
import { Room } from './Room'
import { t } from '../i18n'

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
            {levelLabel(l.value)}
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
          <button type="button" className="skill-move" onClick={() => toggle(id)} title={kind === 'must' ? t('Move to nice-to-have', 'Siirrä opittaviin') : t('Move to must-have', 'Siirrä pakollisiin')}>
            {skillLabel(id)}
          </button>
          <button type="button" className="skill-x" onClick={() => remove(id)} aria-label={t(`Remove ${skillLabel(id)}`, `Poista ${skillLabel(id)}`)}>
            ×
          </button>
        </li>
      ))}
      {ids.length === 0 && <li className="empty">{t('None yet', 'Ei vielä yhtään')}</li>}
    </ul>
  )

  return (
    <div className="skill-cols">
      <div>
        <h3>{t('Must have from day one', 'Pakollinen ensimmäisestä päivästä')}</h3>
        {list(card.must, 'must')}
      </div>
      <div>
        <h3>{t('Nice to have, can be learned', 'Plussaa, voi oppia työssä')}</h3>
        {list(card.nice, 'nice')}
      </div>
      <label className="add-skill">
        <span className="sr-only">{t('Add a skill', 'Lisää taito')}</span>
        <select
          value=""
          onChange={(e) => e.target.value && onCard({ ...card, nice: [...card.nice, e.target.value] })}
        >
          <option value="">{t('Add a skill…', 'Lisää taito…')}</option>
          {GROUPS.map((g) => (
            <optgroup key={g} label={groupLabel(g)}>
              {SKILLS.filter((s) => s.group === g && !used.has(s.id)).map((s) => (
                <option key={s.id} value={s.id}>
                  {skillLabel(s.id)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <p className="hint">{t('Click a skill to move it between the lists. Skill names follow the EU ESCO classification.', 'Napsauta taitoa siirtääksesi sen listalta toiselle. Taitojen nimet noudattavat EU:n ESCO-luokitusta.')}</p>
    </div>
  )
}

export function Review({ card, onCard, justified, onJustified, flagText, source, onBack, onPublish }: Props) {
  const [hover, setHover] = useState<RequirementKey | null>(null)
  const summary = useMemo(() => summarize(POOL, card), [card])
  const preview: Status[] | null = useMemo(() => (hover ? summarize(POOL, relax(card, hover)).statuses : null), [card, hover])
  const suggested = useMemo(() => Object.keys(flagText) as RequirementKey[], [flagText])
  const flags = useMemo(() => findFlags(card, new Set(justified), suggested), [card, justified, suggested])
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
            <span className="source">{source === 'ai' ? t('Drafted by Claude from your answers', 'Clauden laatima vastaustesi pohjalta') : t('Drafted offline from your answers', 'Laadittu offline vastaustesi pohjalta')}</span>
          </p>
          <input className="card-title" value={card.title} onChange={(e) => onCard({ ...card, title: e.target.value })} aria-label={t('Role title', 'Roolin nimi')} />

          <label className="block">
            <h3>{t('The problem you are hiring for', 'Ongelma, johon rekrytoit')}</h3>
            <textarea rows={3} value={card.problem} onChange={(e) => onCard({ ...card, problem: e.target.value })} />
          </label>

          <div className="block">
            <h3>{t('After three months, they have', 'Kolmen kuukauden päästä hän on')}</h3>
            <ol className="outcomes">
              {card.outcomes.map((o, i) => (
                <li key={i}>
                  <textarea
                    rows={1}
                    value={o}
                    onChange={(e) => onCard({ ...card, outcomes: card.outcomes.map((x, j) => (j === i ? e.target.value : x)) })}
                    aria-label={t(`Outcome ${i + 1}`, `Tavoite ${i + 1}`)}
                  />
                  <button type="button" className="skill-x" onClick={() => onCard({ ...card, outcomes: card.outcomes.filter((_, j) => j !== i) })} aria-label={t(`Remove outcome ${i + 1}`, `Poista tavoite ${i + 1}`)}>
                    ×
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="link" onClick={() => onCard({ ...card, outcomes: [...card.outcomes, ''] })}>
              {t('Add an outcome', 'Lisää tavoite')}
            </button>
          </div>

          <div className="block">
            <Skills card={card} onCard={onCard} />
          </div>

          <div className="block">
            <h3>{t('Requirements', 'Vaatimukset')}</h3>
            <Levels label={t('Finnish', 'Suomi')} value={r.finnish} onChange={(v) => setReq({ finnish: v })} />
            <Levels label={t('English', 'Englanti')} value={r.english} onChange={(v) => setReq({ english: v })} />
            <Levels label={t('Swedish', 'Ruotsi')} value={r.swedish} onChange={(v) => setReq({ swedish: v })} />
            <div className="req">
              <span className="req-label">{t('Education', 'Koulutus')}</span>
              <select value={r.degree} onChange={(e) => setReq({ degree: e.target.value as typeof r.degree })}>
                {DEGREES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {degreeLabel(d.value)}
                  </option>
                ))}
              </select>
            </div>
            <div className="req">
              <span className="req-label">{t('Experience', 'Kokemus')}</span>
              <label className="years">
                {t('at least', 'vähintään')}
                <input type="number" min={0} max={20} value={r.minYears} onChange={(e) => setReq({ minYears: Math.max(0, Number(e.target.value)) })} />
                {t('years', 'vuotta')}
              </label>
            </div>
            <label className="req check">
              <input type="checkbox" checked={r.livesInFinland} onChange={(e) => setReq({ livesInFinland: e.target.checked })} />
              {t('Must already live in Finland', 'Asuttava jo Suomessa')}
            </label>
            <label className="req check">
              <input type="checkbox" checked={r.noPermitNeeded} onChange={(e) => setReq({ noPermitNeeded: e.target.checked })} />
              {t('Must not need a residence permit', 'Ei saa tarvita oleskelulupaa')}
            </label>
            <div className="req">
              <span className="req-label">{t('Work', 'Työ')}</span>
              <div className="seg" role="radiogroup" aria-label={t('Work mode', 'Työtapa')}>
                {(['on-site', 'hybrid', 'remote'] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={card.workMode === m} className={card.workMode === m ? 'on' : ''} onClick={() => onCard({ ...card, workMode: m })}>
                    {workModeLabel(m)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={onBack}>
            {t('Back to your answers', 'Takaisin vastauksiin')}
          </button>
          <button type="button" className="primary" onClick={onPublish} disabled={card.must.length === 0}>
            {t('Publish to the event', 'Julkaise tapahtumaan')}
          </button>
        </div>
        {card.must.length === 0 && (
          <p className="hint">
            {t(
              'Add at least one must-have skill under “Add a skill”, so the card can be matched. If the draft found none, your answers may describe duties rather than the work: try naming what the person gets done.',
              'Lisää vähintään yksi pakollinen taito kohdasta “Lisää taito”, jotta korttia voidaan verrata osallistujiin. Jos luonnoksesta ei löytynyt taitoja, vastauksesi saattavat kuvata tehtäviä eivätkä työtä: kerro, mitä henkilö saa aikaan.',
            )}
          </p>
        )}
      </div>

      <aside className="side-col">
        <Room statuses={summary.statuses} preview={preview} blockers={summary.soleBlockers} />

        <section className="check" aria-label={t('Requirement check', 'Vaatimustarkistus')}>
          <h2>{t('Requirement check', 'Vaatimustarkistus')}</h2>
          {flags.length === 0 ? (
            <p className="check-empty">
              {t(
                'Nothing to look at again. Every requirement on your card is either light or has a reason you gave.',
                'Ei katsottavaa. Jokainen korttisi vaatimus on joko kevyt tai perusteltu.',
              )}
            </p>
          ) : (
            <>
              <p className="check-intro">
                {flags.length === 1
                  ? t('One requirement may keep capable people out.', 'Yksi vaatimus voi sulkea osaavia ihmisiä ulos.')
                  : t(`${flags.length} requirements may keep capable people out.`, `${flags.length} vaatimusta voi sulkea osaavia ihmisiä ulos.`)}
                {reachAll > reachNow && (
                  <>
                    {' '}
                    {t('With all suggestions, your card would reach', 'Kaikilla ehdotuksilla korttisi tavoittaisi')} <strong>{reachAll}</strong>{' '}
                    {t('people instead of', 'ihmistä, nyt')} <strong>{reachNow}</strong>.
                  </>
                )}{' '}
                {t('You decide.', 'Sinä päätät.')}
              </p>
              <ul className="flags">
                {flags.map((f) => {
                  const g = gain(card, f.key)
                  const text = flagText[f.key] ?? f
                  return (
                    <li key={f.key} className="flag">
                      <div className="flag-top">
                        <h3>{f.title}</h3>
                        <span className={`gain${g > 0 ? '' : ' gain-zero'}`}>{g > 0 ? t(`+${g} people`, `+${g} ihmistä`) : t('no change alone', 'ei muutosta yksin')}</span>
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
                          {t('Change to:', 'Muuta:')} {f.relaxTo}
                        </button>
                        <button type="button" className="link" onClick={() => onJustified([...justified, f.key])}>
                          {t('Keep it, it is needed', 'Pidä, se on tarpeen')}
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
