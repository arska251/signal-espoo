import { skillLabel } from '../data/skills'
import type { Status } from '../engine/match'
import type { RequirementKey } from '../engine/types'

interface Props {
  statuses: Status[]
  /** Statuses if a suggestion were accepted; dots that would change are outlined. */
  preview?: Status[] | null
  /** People kept out by exactly one requirement, per requirement. */
  blockers?: Partial<Record<RequirementKey, number>>
  /** Before there is a card: show the room without counts. */
  idle?: boolean
}

const REQ_LABEL: Record<string, string> = {
  finnish: 'Finnish level',
  english: 'English level',
  swedish: 'Swedish level',
  degree: 'Degree',
  minYears: 'Years of experience',
  livesInFinland: 'Must live in Finland',
  noPermitNeeded: 'No permit needed',
}
const reqLabel = (k: string) => REQ_LABEL[k] ?? skillLabel(k.replace('must:', ''))

const LABEL: Record<Status, string> = {
  strong: 'Has every must-have skill',
  close: 'Close: related skills',
  blocked: 'Kept out by a requirement',
  none: 'Other participants',
}

export function Room({ statuses, preview, blockers, idle }: Props) {
  const counts = { strong: 0, close: 0, blocked: 0, none: 0 }
  for (const s of statuses) counts[s]++
  const reach = counts.strong + counts.close
  const previewReach = preview ? preview.filter((s) => s === 'strong' || s === 'close').length : null
  const blockerList = Object.entries(blockers ?? {}).sort((a, b) => b[1]! - a[1]!)

  if (idle) {
    return (
      <section className="room room-idle" aria-label="Registered participants">
        <div className="room-head">
          <p className="room-reach">
            <span className="reach-number">{statuses.length}</span>
          </p>
          <p className="room-caption">
            professionals have registered so far. When your card is ready, you see how many of them fit it: counts,
            never profiles.
          </p>
        </div>
        <div className="dots" aria-hidden>
          {statuses.map((_, i) => (
            <span key={i} className="dot" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="room" aria-label="Event participants your card reaches">
      <div className="room-head">
        <p className="room-reach">
          <span className="reach-number">{reach}</span>
          {previewReach !== null && previewReach !== reach && (
            <span className="reach-preview"> → {previewReach}</span>
          )}
        </p>
        <p className="room-caption">
          of {statuses.length} registered participants fit your card. Each dot is one anonymous person; you see
          counts, never profiles.
        </p>
      </div>
      <div className="dots" role="img" aria-label={`${counts.strong} strong, ${counts.close} close, ${counts.blocked} kept out by requirements`}>
        {statuses.map((s, i) => {
          const next = preview?.[i]
          const changing = next && next !== s
          return <span key={i} className={`dot dot-${changing ? next : s}${changing ? ' dot-changing' : ''}`} />
        })}
      </div>
      <ul className="legend">
        {(['strong', 'close', 'blocked'] as Status[]).map((s) => (
          <li key={s}>
            <span className={`dot dot-${s}`} aria-hidden />
            <span className="legend-label">{LABEL[s]}</span>
            <span className="legend-count">{counts[s]}</span>
          </li>
        ))}
      </ul>
      {blockerList.length > 0 && (
        <p className="blockers">
          Kept out by a single requirement:{' '}
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
