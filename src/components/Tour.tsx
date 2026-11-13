// A guided tour for judges who open the link on their own. Each step says what to do next and why it
// matters, and moves on when the app reaches the right state, so it never points at a specific element.
import { useEffect } from 'react'
import { t } from '../i18n'

export interface TourState {
  view: string
  hasAnswers: boolean
  reach: number | null
  initialReach: number | null
  published: boolean
  interests: number
  meetings: number
}

interface Step {
  text: string
  why?: string
  /** Moves on by itself when this is true. Without it, the step has a Next button. */
  done?: (s: TourState) => boolean
}

const steps = (): Step[] => [
  {
    text: t(
      'Signal in four minutes: from a company’s need to a booked meeting at a City of Espoo matchmaking event.',
      'Signal neljässä minuutissa: yrityksen tarpeesta varattuun tapaamiseen Espoon kaupungin matchmaking-tapahtumassa.',
    ),
    why: t('You play the company, then a participant, then the organiser.', 'Olet ensin yritys, sitten osallistuja ja lopuksi järjestäjä.'),
  },
  {
    text: t('Pick the example “Logistics software company”.', 'Valitse esimerkki “Logistiikkaohjelmistoyritys”.'),
    why: t(
      'It fills in a hiring manager’s answers to three questions: what the person achieves, what is hard, who they work with.',
      'Se täyttää rekrytoivan esihenkilön vastaukset kolmeen kysymykseen: mitä henkilö saa aikaan, mikä on vaikeaa ja kenen kanssa hän työskentelee.',
    ),
    done: (s) => s.hasAnswers || s.view !== 'describe',
  },
  {
    text: t('Click “Draft my challenge card”.', 'Valitse “Laadi haastekortti”.'),
    why: t(
      'This public version drafts with keyword rules. With an API key, Claude drafts it from the same words.',
      'Tämä julkinen versio laatii kortin avainsanasäännöillä. API-avaimen kanssa Claude laatii sen samoista sanoista.',
    ),
    done: (s) => s.view === 'review',
  },
  {
    text: t(
      'Look at the dots: the card as written fits almost nobody of the 240 registered participants.',
      'Katso pisteitä: kortti sellaisenaan sopii tuskin kenellekään 240 ilmoittautuneesta.',
    ),
    why: t(
      'Amber dots have the skills but a requirement keeps them out. The company sees counts, never profiles.',
      'Oransseilla pisteillä on taidot, mutta jokin vaatimus sulkee heidät ulos. Yritys näkee lukumäärät, ei koskaan profiileja.',
    ),
  },
  {
    text: t(
      'Hover “Change to: …” in the requirement check to preview who would join, then accept the ones you agree with.',
      'Vie hiiri vaatimustarkistuksen “Muuta: …” -napin päälle nähdäksesi, ketkä pääsisivät mukaan, ja hyväksy ne, joista olet samaa mieltä.',
    ),
    why: t(
      'Nothing changes on its own. The company decides, and can keep a requirement it has a reason for.',
      'Mikään ei muutu itsestään. Yritys päättää ja voi pitää vaatimuksen, jolle sillä on syy.',
    ),
    done: (s) => s.reach !== null && s.initialReach !== null && s.reach >= s.initialReach + 10,
  },
  {
    text: t('Scroll down and click “Publish to the event”.', 'Vieritä alas ja valitse “Julkaise tapahtumaan”.'),
    done: (s) => s.published,
  },
  {
    text: t('Click “See it as a participant”.', 'Valitse “Katso osallistujana”.'),
    why: t(
      'You are now a backend developer who moved to Espoo last year and speaks basic Finnish. The card as first written would never have reached you.',
      'Olet nyt backend-kehittäjä, joka muutti Espooseen viime vuonna ja puhuu perustason suomea. Kortti alkuperäisessä muodossaan ei olisi koskaan tavoittanut sinua.',
    ),
    done: (s) => s.view === 'participant',
  },
  {
    text: t(
      'On the logistics card, click “I am interested” and write two sentences about something similar you have done.',
      'Valitse logistiikkakortissa “Olen kiinnostunut” ja kirjoita kaksi lausetta jostain vastaavasta, mitä olet tehnyt.',
    ),
    why: t(
      'No CV to polish with AI. The Signal check under the text coaches anyone toward a concrete, honest answer; generic filler shows up as noise, whoever wrote it.',
      'Ei tekoälyllä hiottavaa CV:tä. Tekstin alla oleva Signal check ohjaa kohti konkreettista, rehellistä vastausta; yleinen täyte näkyy kohinana, kirjoitti sen kuka tahansa.',
    ),
    done: (s) => s.interests > 0,
  },
  {
    text: t(
      'Open “Company” in the top bar. A week has passed: read the answers and click “Meet at the event” on one.',
      'Avaa ylävalikosta “Yritys”. Viikko on kulunut: lue vastaukset ja valitse yhdessä “Tapaa tapahtumassa”.',
    ),
    why: t(
      'Answers arrive in order, unranked, and show only what the card asks about.',
      'Vastaukset tulevat saapumisjärjestyksessä, pisteyttämättä, ja näyttävät vain sen, mitä kortti kysyy.',
    ),
    done: (s) => s.meetings > 0,
  },
  {
    text: t(
      'See the meeting from the participant’s side under “Participant”, then open “Organiser”.',
      'Katso tapaaminen osallistujan puolelta kohdasta “Osallistuja” ja avaa sitten “Järjestäjä”.',
    ),
    why: t(
      'Organisers see what the requirement check changed: how many more people the cards reach, and how many of them work in English.',
      'Järjestäjä näkee, mitä vaatimustarkistus muutti: kuinka monta ihmistä enemmän kortit tavoittavat ja moniko heistä työskentelee englanniksi.',
    ),
    done: (s) => s.view === 'organiser',
  },
  {
    text: t(
      'That is the whole loop. “Data and AI” in the top bar explains what AI does here, and what it never does.',
      'Siinä koko kierros. Ylävalikon “Data ja tekoäly” kertoo, mitä tekoäly tässä tekee ja mitä se ei koskaan tee.',
    ),
  },
]

interface Props {
  step: number
  onStep: (n: number) => void
  onClose: () => void
  state: TourState
}

export function Tour({ step, onStep, onClose, state }: Props) {
  const current = steps()[step]

  // Move past the furthest of the next few steps that is already done, so skipping ahead keeps the tour in sync.
  useEffect(() => {
    if (step === 0) return
    for (let k = Math.min(step + 3, steps().length - 1); k >= step; k--) {
      if (steps()[k].done?.(state)) {
        onStep(k + 1)
        return
      }
    }
  }, [state, step, onStep])

  if (!current) return null
  const last = step === steps().length - 1

  return (
    <aside className="tour" aria-label={t('Guided tour', 'Opastettu kierros')} aria-live="polite">
      <p className="tour-count">
        {step === 0 ? t('Guided tour', 'Opastettu kierros') : t(`${step} of ${steps().length - 1}`, `${step} / ${steps().length - 1}`)}
      </p>
      <div className="tour-text">
        <p>{current.text}</p>
        {current.why && <p className="tour-why">{current.why}</p>}
      </div>
      <div className="tour-actions">
        {step === 0 ? (
          <>
            <button type="button" className="tour-next" onClick={() => onStep(1)}>
              {t('Start the tour', 'Aloita kierros')}
            </button>
            <button type="button" className="tour-skip" onClick={onClose}>
              {t('Explore on my own', 'Tutustun itse')}
            </button>
          </>
        ) : (
          <>
            {!current.done && (
              <button type="button" className="tour-next" onClick={() => (last ? onClose() : onStep(step + 1))}>
                {last ? t('Finish', 'Valmis') : t('Next', 'Seuraava')}
              </button>
            )}
            {!last && (
              <button type="button" className="tour-skip" onClick={onClose}>
                {t('Hide tour', 'Piilota kierros')}
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
