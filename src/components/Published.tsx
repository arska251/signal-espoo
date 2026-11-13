import type { ReactNode } from 'react'
import { POOL } from '../data/pool'
import { skillLabel } from '../data/skills'
import { summarize } from '../engine/match'
import { degreeLabel, levelLabel, workModeLabel, type ChallengeCard } from '../engine/types'
import { t } from '../i18n'

export function CardPreview({ card }: { card: ChallengeCard }) {
  const r = card.requirements
  const langs = (
    [
      [t('Finnish', 'suomi'), r.finnish],
      [t('English', 'englanti'), r.english],
      [t('Swedish', 'ruotsi'), r.swedish],
    ] as const
  ).filter(([, l]) => l > 0)
  const reqs = [
    ...langs.map(([n, l]) => `${levelLabel(l)} ${n}`),
    r.degree !== 'none' ? degreeLabel(r.degree) : null,
    r.minYears > 0 ? t(`${r.minYears}+ years of experience`, `${r.minYears}+ vuoden kokemus`) : null,
    r.livesInFinland ? t('Lives in Finland', 'Asuu Suomessa') : null,
    r.noPermitNeeded ? t('No residence permit needed', 'Ei oleskelulupatarvetta') : null,
    `${t('Work', 'Työ')}: ${workModeLabel(card.workMode)}`,
  ].filter(Boolean)

  return (
    <article className="preview-card">
      <p className="card-company">{card.company}</p>
      <h2>{card.title}</h2>
      <p className="preview-problem">{card.problem}</p>
      <h3>{t('After three months, you have', 'Kolmen kuukauden päästä olet')}</h3>
      <ul>
        {card.outcomes.filter(Boolean).map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
      <h3>{t('You bring', 'Tuot mukanasi')}</h3>
      <p className="preview-skills">
        {card.must.map(skillLabel).join(', ')}
        {card.nice.length > 0 && <span className="muted"> · {t('learn in the job', 'opit työssä')}: {card.nice.map(skillLabel).join(', ')}</span>}
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
        <h1>{t('Your card is published.', 'Korttisi on julkaistu.')}</h1>
        <p className="lede">
          {t(
            `${s.strong + s.close} registered participants fit it today. They see your card three weeks before the event, and nobody sees who they are until both of you say yes.`,
            `${s.strong + s.close} ilmoittautunutta sopii siihen tänään. He näkevät korttisi kolme viikkoa ennen tapahtumaa, eikä kukaan näe, keitä he ovat, ennen kuin molemmat sanovat kyllä.`,
          )}
        </p>
        <ol className="next">
          <li>
            <strong>{t('Now.', 'Nyt.')}</strong>{' '}
            {t('Organisers at the City of Espoo check the card before participants see it.', 'Espoon kaupungin järjestäjät tarkistavat kortin ennen kuin osallistujat näkevät sen.')}
          </li>
          <li>
            <strong>{t('Three weeks before.', 'Kolme viikkoa ennen.')}</strong>{' '}
            {t(
              'Participants who fit say they are interested and tell, in a few sentences, when they did something like one of your outcomes.',
              'Sopivat osallistujat kertovat kiinnostuksestaan ja muutamalla lauseella, milloin ovat tehneet jotain tavoitteesi kaltaista.',
            )}
          </li>
          <li>
            <strong>{t('One week before.', 'Viikkoa ennen.')}</strong>{' '}
            {t(
              'You read those answers with skills, without names or photos, and pick who to meet.',
              'Luet vastaukset taitojen kanssa ilman nimiä tai kuvia ja valitset, keitä tapaat.',
            )}
          </li>
          <li>
            <strong>{t('Event day.', 'Tapahtumapäivä.')}</strong>{' '}
            {t('Your 15-minute meetings are in both calendars.', '15 minuutin tapaamisenne ovat molempien kalentereissa.')}
          </li>
        </ol>
        <div className="actions">
          <button type="button" className="secondary" onClick={onNew}>
            {t('Write another card', 'Kirjoita uusi kortti')}
          </button>
          <button type="button" className="primary" onClick={onParticipant}>
            {t('See it as a participant', 'Katso osallistujana')}
          </button>
          <button type="button" className="secondary" onClick={onOrganiser}>
            {t('Organiser view', 'Järjestäjän näkymä')}
          </button>
        </div>
      </div>
      <CardPreview card={card} />
      {children && <div className="published-inbox">{children}</div>}
    </div>
  )
}
