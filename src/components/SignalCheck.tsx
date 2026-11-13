import type { Check } from '../engine/signalCheck'
import { t } from '../i18n'

/** Shows the writer what their text carries. Never blocks sending, never shown to the reader. */
export function SignalCheck({ checks, empty }: { checks: Check[]; empty: boolean }) {
  if (empty) return null
  const firstMissing = checks.find((c) => !c.ok)
  return (
    <div className="signal-check" aria-live="polite">
      <p className="sc-title">{t('Signal check, only you see this', 'Signal check, vain sinä näet tämän')}</p>
      <ul>
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? 'sc-ok' : 'sc-miss'}>
            <span aria-hidden>{c.ok ? '●' : '○'}</span> {c.label}
            <span className="sr-only">{c.ok ? t(': yes', ': kyllä') : t(': not yet', ': ei vielä')}</span>
          </li>
        ))}
      </ul>
      {firstMissing && <p className="sc-tip">{firstMissing.tip}</p>}
    </div>
  )
}
