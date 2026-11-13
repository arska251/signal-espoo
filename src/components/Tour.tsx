// A guided tour for judges who open the link on their own. Each step says what to do next and why it
// matters, and moves on when the app reaches the right state, so it never points at a specific element.
import { useEffect } from 'react'

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

const STEPS: Step[] = [
  {
    text: 'Signal in four minutes: from a company’s need to a booked meeting at a City of Espoo matchmaking event.',
    why: 'You play the company, then a participant, then the organiser.',
  },
  {
    text: 'Pick the example “Logistics software company”.',
    why: 'It fills in a hiring manager’s answers to three questions: what the person achieves, what is hard, who they work with.',
    done: (s) => s.hasAnswers || s.view !== 'describe',
  },
  {
    text: 'Click “Draft my challenge card”.',
    why: 'This public version drafts with keyword rules. With an API key, Claude drafts it from the same words.',
    done: (s) => s.view === 'review',
  },
  {
    text: 'Look at the dots: the card as written fits almost nobody of the 240 registered participants.',
    why: 'Amber dots have the skills but a requirement keeps them out. The company sees counts, never profiles.',
  },
  {
    text: 'Hover “Change to: …” in the requirement check to preview who would join, then accept the ones you agree with.',
    why: 'Nothing changes on its own. The company decides, and can keep a requirement it has a reason for.',
    done: (s) => s.reach !== null && s.initialReach !== null && s.reach >= s.initialReach + 10,
  },
  {
    text: 'Scroll down and click “Publish to the event”.',
    done: (s) => s.published,
  },
  {
    text: 'Click “See it as a participant”.',
    why: 'You are now a backend developer who moved to Espoo last year and speaks basic Finnish. The card as first written would never have reached you.',
    done: (s) => s.view === 'participant',
  },
  {
    text: 'On the logistics card, click “I am interested” and write two sentences about something similar you have done.',
    why: 'No CV to polish with AI: a short, specific answer to the company’s own outcome, read without your name.',
    done: (s) => s.interests > 0,
  },
  {
    text: 'Open “Company” in the top bar. A week has passed: read the answers and click “Meet at the event” on one.',
    why: 'Answers arrive in order, unranked, and show only what the card asks about.',
    done: (s) => s.meetings > 0,
  },
  {
    text: 'See the meeting from the participant’s side under “Participant”, then open “Organiser”.',
    why: 'Organisers see cards, interest, meetings and which companies still have no card.',
    done: (s) => s.view === 'organiser',
  },
  {
    text: 'That is the whole loop. “Data and AI” in the top bar explains what AI does here, and what it never does.',
  },
]

interface Props {
  step: number
  onStep: (n: number) => void
  onClose: () => void
  state: TourState
}

export function Tour({ step, onStep, onClose, state }: Props) {
  const current = STEPS[step]

  // Move past the furthest of the next few steps that is already done, so skipping ahead keeps the tour in sync.
  useEffect(() => {
    if (step === 0) return
    for (let k = Math.min(step + 3, STEPS.length - 1); k >= step; k--) {
      if (STEPS[k].done?.(state)) {
        onStep(k + 1)
        return
      }
    }
  }, [state, step, onStep])

  if (!current) return null
  const last = step === STEPS.length - 1

  return (
    <aside className="tour" aria-label="Guided tour" aria-live="polite">
      <p className="tour-count">
        {step === 0 ? 'Guided tour' : `${step} of ${STEPS.length - 1}`}
      </p>
      <div className="tour-text">
        <p>{current.text}</p>
        {current.why && <p className="tour-why">{current.why}</p>}
      </div>
      <div className="tour-actions">
        {step === 0 ? (
          <>
            <button type="button" className="tour-next" onClick={() => onStep(1)}>
              Start the tour
            </button>
            <button type="button" className="tour-skip" onClick={onClose}>
              Explore on my own
            </button>
          </>
        ) : (
          <>
            {!current.done && (
              <button type="button" className="tour-next" onClick={() => (last ? onClose() : onStep(step + 1))}>
                {last ? 'Finish' : 'Next'}
              </button>
            )}
            {!last && (
              <button type="button" className="tour-skip" onClick={onClose}>
                Hide tour
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
