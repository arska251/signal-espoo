import type { Check } from '../engine/signalCheck'

/** Shows the writer what their text carries. Never blocks sending, never shown to the reader. */
export function SignalCheck({ checks, empty }: { checks: Check[]; empty: boolean }) {
  if (empty) return null
  const firstMissing = checks.find((c) => !c.ok)
  return (
    <div className="signal-check" aria-live="polite">
      <p className="sc-title">Signal check, only you see this</p>
      <ul>
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? 'sc-ok' : 'sc-miss'}>
            <span aria-hidden>{c.ok ? '●' : '○'}</span> {c.label}
            <span className="sr-only">{c.ok ? ': yes' : ': not yet'}</span>
          </li>
        ))}
      </ul>
      {firstMissing && <p className="sc-tip">{firstMissing.tip}</p>}
    </div>
  )
}
