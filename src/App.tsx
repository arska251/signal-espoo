import { useCallback, useEffect, useMemo, useState } from 'react'
import { About } from './components/About'
import { Describe } from './components/Describe'
import { Inbox } from './components/Inbox'
import { Organiser, type PublishedCard } from './components/Organiser'
import { Participant } from './components/Participant'
import { Published } from './components/Published'
import { Review } from './components/Review'
import { Tour } from './components/Tour'
import { POOL } from './data/pool'
import { SCENARIOS } from './data/scenarios'
import { aiAvailable, draftCard, type Draft } from './engine/draft'
import { extractLocal } from './engine/extractLocal'
import { cardKey, seededInterests, type Decision, type Interest } from './engine/interests'
import { reach } from './engine/match'
import type { ChallengeCard, CompanyAnswers, RequirementKey } from './engine/types'

type View = 'describe' | 'review' | 'published' | 'participant' | 'organiser'

const EMPTY: CompanyAnswers = { company: '', role: '', outcomes: '', hard: '', setup: '' }
const STORE = 'signal.cards.v1'

// Two cards already published by other companies, so the organiser view is not empty.
const SEED: PublishedCard[] = SCENARIOS.filter((s) => s.id === 'care' || s.id === 'game').map((s, i) => ({
  card: extractLocal(s.answers).card,
  publishedAt: i === 0 ? '24 days before' : '19 days before',
}))
// The game studio accepted the check's degree suggestion before publishing.
SEED[1] = { ...SEED[1], original: SEED[1].card, card: { ...SEED[1].card, requirements: { ...SEED[1].card.requirements, degree: 'none' } } }

function loadCards(): PublishedCard[] {
  try {
    return [...SEED, ...JSON.parse(localStorage.getItem(STORE) ?? '[]')]
  } catch {
    return SEED
  }
}

export default function App() {
  const [view, setView] = useState<View>('describe')
  const [answers, setAnswers] = useState<CompanyAnswers>(EMPTY)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [justified, setJustified] = useState<RequirementKey[]>([])
  const [busy, setBusy] = useState(false)
  const [ai, setAi] = useState(false)
  const [about, setAbout] = useState(false)
  const [cards, setCards] = useState<PublishedCard[]>(loadCards)
  const [interests, setInterests] = useState<Interest[]>([])
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [published, setPublished] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [tourOpen, setTourOpen] = useState(true)
  const [initialReach, setInitialReach] = useState<number | null>(null)
  const [original, setOriginal] = useState<ChallengeCard | null>(null)
  const currentReach = useMemo(() => (draft ? reach(POOL, draft.card) : null), [draft])
  const onTourStep = useCallback((n: number) => setTourStep(n), [])
  const tourState = useMemo(
    () => ({
      view,
      hasAnswers: answers.company.trim() !== '',
      reach: currentReach,
      initialReach,
      published,
      interests: interests.length,
      meetings: Object.values(decisions).filter((d) => d === 'meet').length,
    }),
    [view, answers.company, currentReach, initialReach, published, interests.length, decisions],
  )

  // Seeded interests simulate the weeks after publishing; interests sent from the participant view come last.
  const interestsFor = (card: ChallengeCard) => [
    ...seededInterests(card),
    ...interests.filter((i) => cardKey(i) === cardKey(card)),
  ]
  const meetingIndex = (i: Interest) => {
    const c = cards.find((x) => cardKey(x.card) === cardKey(i))
    return c ? interestsFor(c.card).filter((x) => decisions[x.id] === 'meet').findIndex((x) => x.id === i.id) : 0
  }
  const decide = (id: string, d: Decision | null) => {
    const next = { ...decisions }
    if (d) next[id] = d
    else delete next[id]
    setDecisions(next)
  }

  useEffect(() => {
    aiAvailable().then(setAi)
  }, [])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const submit = async () => {
    setBusy(true)
    const d = await draftCard(answers, ai)
    setDraft(d)
    setInitialReach(reach(POOL, d.card))
    setOriginal(d.card)
    setPublished(false)
    setJustified(d.justified)
    setBusy(false)
    setView('review')
  }

  const publish = () => {
    if (!draft) return
    const entry: PublishedCard = { card: draft.card, publishedAt: '21 days before', original: original ?? draft.card }
    // Publishing the same company and role again replaces the earlier card.
    const own = [...cards.filter((c) => !SEED.includes(c) && cardKey(c.card) !== cardKey(draft.card)), entry]
    localStorage.setItem(STORE, JSON.stringify(own))
    setCards([...SEED, ...own])
    setPublished(true)
    setView('published')
  }

  return (
    <div className={`app${tourOpen ? ' with-tour' : ''}`}>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setView('describe')}>
          <span className="brand-mark" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          Signal
        </button>
        <span className="brand-sub">Challenge cards for City of Espoo matchmaking events</span>
        <nav>
          <button type="button" className={['describe', 'review', 'published'].includes(view) ? 'on' : ''} onClick={() => setView(published ? 'published' : draft ? 'review' : 'describe')}>
            Company
          </button>
          <button type="button" className={view === 'participant' ? 'on' : ''} onClick={() => setView('participant')}>
            Participant
          </button>
          <button type="button" className={view === 'organiser' ? 'on' : ''} onClick={() => setView('organiser')}>
            Organiser
          </button>
          <button type="button" onClick={() => setAbout(true)}>
            Data and AI
          </button>
          {!tourOpen && (
            <button type="button" onClick={() => setTourOpen(true)}>
              Tour
            </button>
          )}
        </nav>
      </header>

      <main>
        {view === 'describe' && <Describe answers={answers} onChange={setAnswers} onSubmit={submit} busy={busy} ai={ai} />}
        {view === 'review' && draft && (
          <Review
            card={draft.card}
            onCard={(card) => setDraft({ ...draft, card })}
            justified={justified}
            onJustified={setJustified}
            flagText={draft.flagText}
            source={draft.source}
            onBack={() => setView('describe')}
            onPublish={publish}
          />
        )}
        {view === 'published' && draft && (
          <Published
            card={draft.card}
            onNew={() => {
              setAnswers(EMPTY)
              setDraft(null)
              setPublished(false)
              setView('describe')
            }}
            onOrganiser={() => setView('organiser')}
            onParticipant={() => setView('participant')}
          >
            <Inbox card={draft.card} interests={interestsFor(draft.card)} decisions={decisions} onDecide={decide} />
          </Published>
        )}
        {view === 'participant' && (
          <Participant
            cards={cards}
            interests={interests}
            decisions={decisions}
            meetingIndex={meetingIndex}
            onInterest={(i) => setInterests([...interests, i])}
          />
        )}
        {view === 'organiser' && <Organiser cards={cards} interestsFor={interestsFor} decisions={decisions} />}
      </main>

      <footer className="foot">Prototype for Junction 2026. All participant data is synthetic.</footer>
      {tourOpen && <Tour step={tourStep} onStep={onTourStep} onClose={() => setTourOpen(false)} state={tourState} />}
      {about && <About onClose={() => setAbout(false)} />}
    </div>
  )
}
