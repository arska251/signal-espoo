import { useState } from 'react'
import { EVENT } from '../data/event'
import { POOL } from '../data/pool'
import { SKILLS, groupLabel, type SkillGroup } from '../data/skills'
import { reached, summarize } from '../engine/match'
import type { ChallengeCard } from '../engine/types'
import type { Decision, Interest } from '../engine/interests'
import { daysBefore, t } from '../i18n'

export interface PublishedCard {
  card: ChallengeCard
  /** Days before the event the card was published. */
  publishedAt: number
  /** The card as first drafted, before the requirement check. */
  original?: ChallengeCard
}

function Change({ before, after, label }: { before: number; after: number; label: string }) {
  return (
    <div className="change">
      <p className="change-num">
        {before} <span aria-hidden>→</span>
        <span className="sr-only">{t('to', '→')}</span> <strong>{after}</strong>
      </p>
      <p className="change-label">{label}</p>
    </div>
  )
}

const GROUP_OF = Object.fromEntries(SKILLS.map((s) => [s.id, s.group])) as Record<string, SkillGroup>

function poolByGroup() {
  const counts = new Map<SkillGroup, number>()
  for (const p of POOL) {
    const groups = new Set(p.skills.map((s) => GROUP_OF[s]))
    for (const g of groups) counts.set(g, (counts.get(g) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

const INVITED = ['Kuljetus Oy (fictional)', 'Arvo Research (fictional)', 'Hoivakoti Kaislikko (fictional)', 'Pixel Fjord Games (fictional)', 'Otaniemi Robotics (fictional)', 'Leppävaara Logistics (fictional)', 'Nordic Fintech Labs (fictional)']

export function Organiser({ cards, interestsFor, decisions }: { cards: PublishedCard[]; interestsFor: (c: ChallengeCard) => Interest[]; decisions: Record<string, Decision> }) {
  const [reminded, setReminded] = useState<string[]>([])
  const rows = cards.map((c) => ({
    ...c,
    s: summarize(POOL, c.card),
    interested: interestsFor(c.card).length,
    meetings: interestsFor(c.card).filter((i) => decisions[i.id] === 'meet').length,
  }))
  const groups = poolByGroup()
  const max = groups[0]?.[1] ?? 1
  const fiWorking = POOL.filter((p) => p.finnish >= 2).length
  const enWorking = POOL.filter((p) => p.english >= 2).length
  const published = new Set(cards.map((c) => c.card.company))
  const before = cards.flatMap((c) => reached(POOL, c.original ?? c.card))
  const after = cards.flatMap((c) => reached(POOL, c.card))
  const english = (ps: typeof POOL) => ps.filter((p) => p.finnish < 2).length
  const permit = (ps: typeof POOL) => ps.filter((p) => p.needsPermit).length
  const changed = cards.filter((c) => c.original && reached(POOL, c.original).length !== reached(POOL, c.card).length).length
  const waiting = INVITED.filter((c) => !published.has(c))

  return (
    <div className="organiser">
      <header>
        <p className="event-line">
          {EVENT.name}, {EVENT.date}. {t(`${EVENT.daysLeft} days to go.`, `${EVENT.daysLeft} päivää jäljellä.`)}
        </p>
        <h1>{t('Organiser view', 'Järjestäjän näkymä')}</h1>
        <p className="lede">
          {t(
            "Which companies have said what they need, who fits, and who is still missing. Everything here is counts; no one's profile is shown.",
            'Mitkä yritykset ovat kertoneet tarpeensa, ketkä sopivat ja keitä vielä puuttuu. Kaikki on lukumääriä; kenenkään profiilia ei näytetä.',
          )}
        </p>
      </header>

      <section>
        <h2>{t('Challenge cards', 'Haastekortit')}</h2>
        <table className="cards-table">
          <thead>
            <tr>
              <th>{t('Company', 'Yritys')}</th>
              <th>{t('Role', 'Rooli')}</th>
              <th className="num">{t('Fit', 'Sopii')}</th>
              <th className="num">{t('Kept out by requirements', 'Vaatimukset sulkevat ulos')}</th>
              <th className="num">{t('Interested', 'Kiinnostuneita')}</th>
              <th className="num">{t('Meetings', 'Tapaamisia')}</th>
              <th>{t('Published', 'Julkaistu')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.card.company}</td>
                <td>{r.card.title}</td>
                <td className="num">{r.s.strong + r.s.close}</td>
                <td className="num">{r.s.blocked > 0 ? r.s.blocked : '–'}</td>
                <td className="num">{r.interested || '–'}</td>
                <td className="num">{r.meetings || '–'}</td>
                <td>{daysBefore(r.publishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('What the requirement check changed', 'Mitä vaatimustarkistus muutti')}</h2>
        <p className="hint">
          {t(
            `Across all cards, people each card reaches as first drafted and as published. ${changed === 1 ? 'One company' : `${changed} companies`} changed requirements after the check; every change was the company's own decision.`,
            `Kaikki kortit yhteensä: ketkä kortti tavoitti ensimmäisenä luonnoksena ja julkaistuna. ${changed === 1 ? 'Yksi yritys' : `${changed} yritystä`} muutti vaatimuksia tarkistuksen jälkeen; jokainen muutos oli yrityksen oma päätös.`,
          )}
        </p>
        <div className="changes">
          <Change before={before.length} after={after.length} label={t('Reached in total', 'Tavoitettu yhteensä')} />
          <Change before={english(before)} after={english(after)} label={t('Of them work in English, Finnish below working level', 'Heistä työskentelee englanniksi, suomi alle hyvän tason')} />
          <Change before={permit(before)} after={permit(after)} label={t('Of them need a residence permit', 'Heistä tarvitsee oleskeluluvan')} />
        </div>
      </section>

      <div className="org-grid">
        <section>
          <h2>{t('Still waiting for a card', 'Kortti vielä puuttuu')}</h2>
          <p className="hint">
            {t(
              'Companies that registered but have not described their need. A card takes five minutes, so a reminder three weeks out is usually enough.',
              'Yritykset, jotka ilmoittautuivat mutta eivät ole kuvanneet tarvettaan. Kortti vie viisi minuuttia, joten muistutus kolme viikkoa ennen yleensä riittää.',
            )}
          </p>
          <ul className="waiting">
            {waiting.map((c) => (
              <li key={c}>
                <span>{c}</span>
                {reminded.includes(c) ? (
                  <span className="muted">{t('Reminder sent', 'Muistutus lähetetty')}</span>
                ) : (
                  <button type="button" className="link" onClick={() => setReminded([...reminded, c])}>
                    {t('Send reminder', 'Lähetä muistutus')}
                  </button>
                )}
              </li>
            ))}
            {waiting.length === 0 && <li className="muted">{t('Every invited company has a card.', 'Jokaisella kutsutulla yrityksellä on kortti.')}</li>}
          </ul>
        </section>

        <section>
          <h2>{t('Who is coming', 'Ketä on tulossa')}</h2>
          <p className="hint">
            {t(
              "Send this to companies you invite. It answers the question of whether the city's pool has people for them.",
              'Lähetä tämä kutsumillesi yrityksille. Se vastaa kysymykseen, löytyykö kaupungin kautta heille sopivia ihmisiä.',
            )}
          </p>
          <ul className="bars">
            {groups.map(([g, n]) => (
              <li key={g}>
                <span className="bar-label">{groupLabel(g)}</span>
                <span className="bar" style={{ width: `${(n / max) * 100}%` }} />
                <span className="bar-num">{n}</span>
              </li>
            ))}
          </ul>
          <p className="hint">
            {t(
              `${POOL.length} registered professionals. ${enWorking} work in English, ${fiWorking} in Finnish.`,
              `${POOL.length} ilmoittautunutta ammattilaista. ${enWorking} työskentelee englanniksi, ${fiWorking} suomeksi.`,
            )}
          </p>
        </section>
      </div>
    </div>
  )
}
