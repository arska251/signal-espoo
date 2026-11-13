import type React from 'react'
import { skillLabel } from '../data/skills'
import type { Status } from '../engine/match'
import type { RequirementKey } from '../engine/types'
import { t } from '../i18n'

interface Props {
  statuses: Status[]
  /** Statuses if a suggestion were accepted; dots that would change are outlined. */
  preview?: Status[] | null
  /** People kept out by exactly one requirement, per requirement. */
  blockers?: Partial<Record<RequirementKey, number>>
  /** Before there is a card: show the room without counts. */
  idle?: boolean
}

const reqLabel = (k: string): string =>
  ({
    finnish: t('Finnish level', 'Suomen taso'),
    english: t('English level', 'Englannin taso'),
    swedish: t('Swedish level', 'Ruotsin taso'),
    degree: t('Degree', 'Tutkinto'),
    minYears: t('Years of experience', 'Kokemusvuodet'),
    livesInFinland: t('Must live in Finland', 'Asuttava Suomessa'),
    noPermitNeeded: t('No permit needed', 'Ei lupatarvetta'),
  })[k] ?? skillLabel(k.replace('must:', ''))

const statusLabel = (s: Status): string =>
  ({
    strong: t('Has every must-have skill', 'Kaikki pakolliset taidot'),
    close: t('Close: related skills', 'Lähellä: lähitaidot'),
    blocked: t('Kept out by a requirement', 'Vaatimus sulkee ulos'),
    none: t('Other participants', 'Muut osallistujat'),
  })[s]

export function Room({ statuses, preview, blockers, idle }: Props) {
  const counts = { strong: 0, close: 0, blocked: 0, none: 0 }
  for (const s of statuses) counts[s]++
  const reach = counts.strong + counts.close
  const previewReach = preview ? preview.filter((s) => s === 'strong' || s === 'close').length : null
  const blockerList = Object.entries(blockers ?? {}).sort((a, b) => b[1]! - a[1]!)

  if (idle) {
    return (
      <section className="room room-idle" aria-label={t('Registered participants', 'Ilmoittautuneet osallistujat')}>
        <div className="room-head">
          <p className="room-reach">
            <span className="reach-number">{statuses.length}</span>
          </p>
          <p className="room-caption">
            {t(
              'professionals have registered so far. When your card is ready, you see how many of them fit it: counts, never profiles.',
              'ammattilaista on ilmoittautunut. Kun korttisi on valmis, näet heti, moniko heistä sopii siihen: lukumäärät, ei koskaan profiileja.',
            )}
          </p>
        </div>
        <div className="dots" aria-hidden>
          {statuses.map((_, i) => (
            <span key={i} className="dot" style={{ '--d': `${(i * 73) % 900}ms` } as React.CSSProperties} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="room" aria-label={t('Event participants your card reaches', 'Osallistujat, jotka korttisi tavoittaa')}>
      <div className="room-head">
        <p className="room-reach">
          <span className="reach-number">{reach}</span>
          {previewReach !== null && previewReach !== reach && <span className="reach-preview"> → {previewReach}</span>}
        </p>
        <p className="room-caption">
          {t(
            `of ${statuses.length} registered participants fit your card. Each dot is one anonymous person; you see counts, never profiles.`,
            `${statuses.length} ilmoittautuneesta sopii korttiisi. Jokainen piste on yksi nimetön ihminen; näet lukumäärät, et profiileja.`,
          )}
        </p>
      </div>
      <div
        className="dots"
        role="img"
        aria-label={t(
          `${counts.strong} strong, ${counts.close} close, ${counts.blocked} kept out by requirements`,
          `${counts.strong} vahvaa, ${counts.close} lähellä, ${counts.blocked} vaatimusten ulos sulkemaa`,
        )}
      >
        {statuses.map((s, i) => {
          const next = preview?.[i]
          const changing = next && next !== s
          return (
            <span
              key={i}
              className={`dot dot-${changing ? next : s}${changing ? ' dot-changing' : ''}`}
              style={{ '--d': `${(i * 73) % 900}ms` } as React.CSSProperties}
            />
          )
        })}
      </div>
      <ul className="legend">
        {(['strong', 'close', 'blocked'] as Status[]).map((s) => (
          <li key={s}>
            <span className={`dot dot-${s}`} aria-hidden />
            <span className="legend-label">{statusLabel(s)}</span>
            <span className="legend-count">{counts[s]}</span>
          </li>
        ))}
      </ul>
      {blockerList.length > 0 && (
        <p className="blockers">
          {t('Kept out by a single requirement:', 'Yksittäinen vaatimus sulkee ulos:')}{' '}
          {blockerList.map(([k, n], i) => (
            <span key={k}>
              {i > 0 && ', '}
              {reqLabel(k)} <strong>{n}</strong>
            </span>
          ))}
        </p>
      )}
    </section>
  )
}
