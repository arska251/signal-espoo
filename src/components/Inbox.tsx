import { conversationBrief, matchedSkills, slot, type Decision, type Interest } from '../engine/interests'
import { degreeLabel, levelLabel, type ChallengeCard, type Participant } from '../engine/types'
import { daysBefore, t } from '../i18n'

/** Only what the card asks about. Nothing about age, gender, nationality or where someone studied. */
function facts(p: Participant, card: ChallengeCard): string[] {
  const r = card.requirements
  const out: string[] = []
  const langs: [string, number, number][] = [
    [t('Finnish', 'suomi'), p.finnish, r.finnish],
    [t('English', 'englanti'), p.english, r.english],
    [t('Swedish', 'ruotsi'), p.swedish, r.swedish],
  ]
  for (const [name, has, needs] of langs) if (needs > 0) out.push(`${levelLabel(has as 0 | 1 | 2 | 3)} ${name}`)
  if (r.minYears > 0) out.push(t(`${p.years} years of experience`, `${p.years} vuoden kokemus`))
  if (r.degree !== 'none') out.push(degreeLabel(p.degree))
  return out
}

interface Props {
  card: ChallengeCard
  interests: Interest[]
  decisions: Record<string, Decision>
  onDecide: (id: string, d: Decision | null) => void
}

export function Inbox({ card, interests, decisions, onDecide }: Props) {
  const meetings = interests.filter((i) => decisions[i.id] === 'meet')
  const open = interests.filter((i) => !decisions[i.id])

  return (
    <div className="inbox">
      <section>
        <p className="time-jump">{t('Fast forward: one week before the event.', 'Hyppy eteenpäin: viikko ennen tapahtumaa.')}</p>
        <h2>{t('Interested in your card', 'Kiinnostuneet kortistasi')}</h2>
        <p className="hint">
          {t(
            `${interests.length} people so far, in the order they arrived. Signal does not rank anyone. You see the outcome they picked, their own words, and only the facts your card asks about.`,
            `${interests.length} ihmistä tähän mennessä, saapumisjärjestyksessä. Signal ei pisteytä ketään. Näet valitun tavoitteen, heidän omat sanansa ja vain ne tiedot, joita korttisi kysyy.`,
          )}
        </p>
        <ul className="answers">
          {interests.map((i, n) => {
            const d = decisions[i.id]
            return (
              <li key={i.id} className={`answer${d ? ` answer-${d}` : ''}`}>
                <p className="answer-meta">
                  {t('Person', 'Henkilö')} {n + 1} · {daysBefore(i.arrived)}
                  {i.personaId && <span className="you"> · {t('sent from the participant view', 'lähetetty osallistujanäkymästä')}</span>}
                </p>
                <p className="answer-outcome">{t('On', 'Tavoite:')} “{i.outcome}”</p>
                <blockquote>{i.text}</blockquote>
                <ul className="mini-skills">
                  {matchedSkills(i.participant, card).map((s) => (
                    <li key={s.id} className={s.exact ? 'exact' : 'near'}>
                      {s.label}
                    </li>
                  ))}
                </ul>
                {facts(i.participant, card).length > 0 && <p className="answer-facts">{facts(i.participant, card).join(' · ')}</p>}
                <div className="answer-actions">
                  {d ? (
                    <>
                      <span className="decided">{d === 'meet' ? t('Meeting booked', 'Tapaaminen varattu') : t('Not this time', 'Ei tällä kertaa')}</span>
                      <button type="button" className="link" onClick={() => onDecide(i.id, null)}>
                        {t('Undo', 'Peru')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="primary small" onClick={() => onDecide(i.id, 'meet')}>
                        {t('Meet at the event', 'Tapaa tapahtumassa')}
                      </button>
                      <button type="button" className="link" onClick={() => onDecide(i.id, 'pass')}>
                        {t('Not this time', 'Ei tällä kertaa')}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        {open.length === 0 && interests.length > 0 && <p className="hint">{t('You have answered everyone. People you passed on get a kind note and other cards that fit them.', 'Olet vastannut kaikille. Ne, jotka ohitit, saavat ystävällisen viestin ja muita heille sopivia kortteja.')}</p>}
      </section>

      {meetings.length > 0 && (
        <section className="meetings">
          <h2>{t('Your meetings on the day', 'Tapaamisesi tapahtumapäivänä')}</h2>
          <p className="hint">{t('15 minutes each. Both sides get three questions, so the time goes to the work, not small talk.', '15 minuuttia kukin. Molemmat saavat kolme kysymystä, jotta aika menee työhön eikä small talkiin.')}</p>
          <ol className="schedule">
            {meetings.map((i, n) => {
              const brief = conversationBrief(card, i)
              return (
                <li key={i.id}>
                  <p className="slot">{slot(n)}</p>
                  <div>
                    <p className="slot-who">{t('Person', 'Henkilö')} {interests.indexOf(i) + 1}, {t('on', 'tavoite')} “{i.outcome}”</p>
                    <ul className="brief">
                      {brief.company.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                    {(i.participant.needsPermit || !i.participant.livesInFinland) && (
                      <p className="intl-note">
                        {i.participant.needsPermit ? t('This person would need a residence permit for work. ', 'Henkilö tarvitsisi oleskeluluvan työntekoa varten. ') : ''}
                        {!i.participant.livesInFinland ? t('They live outside Finland today. ', 'Hän asuu nyt Suomen ulkopuolella. ') : ''}
                        {t(
                          'Specialists can get a permit through the fast track in about two weeks, and the City of Espoo’s International Working Life Services can guide you through hiring and relocation. Ask the organisers at the event.',
                          'Erityisasiantuntija saa luvan nopeutetusti noin kahdessa viikossa, ja Espoon kaupungin International Working Life Services opastaa rekrytoinnissa ja muutossa. Kysy järjestäjiltä tapahtumassa.',
                        )}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </div>
  )
}
