// The requirement check: find requirements that keep capable people out without a stated reason,
// and say how many more people the card reaches if the company relaxes each one.
// The company decides. Nothing is relaxed automatically.
import { POOL } from '../data/pool'
import { skillLabel } from '../data/skills'
import { getLang, t } from '../i18n'
import { reach } from './match'
import type { ChallengeCard, Flag, RequirementKey } from './types'

export function relax(card: ChallengeCard, key: RequirementKey): ChallengeCard {
  const r = { ...card.requirements }
  if (key.startsWith('must:')) {
    const skill = key.slice(5)
    return { ...card, must: card.must.filter((s) => s !== skill), nice: [...card.nice, skill] }
  }
  switch (key) {
    case 'finnish': r.finnish = 0; break
    case 'swedish': r.swedish = 0; break
    case 'english': r.english = 1; break
    case 'degree': r.degree = 'none'; break
    case 'minYears': r.minYears = Math.min(r.minYears, 2); break
    case 'livesInFinland': r.livesInFinland = false; break
    case 'noPermitNeeded': r.noPermitNeeded = false; break
  }
  return { ...card, requirements: r }
}

export function gain(card: ChallengeCard, key: RequirementKey): number {
  return reach(POOL, relax(card, key)) - reach(POOL, card)
}

const TEMPLATES_EN: Record<string, Omit<Flag, 'key'>> = {
  finnish: {
    title: 'Fluent Finnish from day one',
    reason: 'None of the outcomes you described depend on Finnish. Many international professionals reach working Finnish within a year in the job.',
    question: 'Which tasks in the first three months need Finnish? Could English work at the start, with a Finnish course alongside?',
    relaxTo: 'Not required to start',
  },
  swedish: {
    title: 'Swedish required',
    reason: 'Nothing you described mentions Swedish-speaking customers or colleagues.',
    question: 'Who would this person speak Swedish with?',
    relaxTo: 'Not required',
  },
  english: {
    title: 'High English level',
    reason: 'A strict language level filters out people who could do the work well.',
    question: 'Is written English enough for the daily work?',
    relaxTo: 'Basic',
  },
  degree: {
    title: 'Degree required',
    reason: 'A degree says little about the outcomes you listed. Skills-based hiring widens the pool and reduces bias against career changers and people whose degree is not recognised in Finland.',
    question: 'Would someone who has done this work without the degree be a good fit?',
    relaxTo: 'No degree required',
  },
  minYears: {
    title: 'Minimum years of experience',
    reason: 'Years in a role measure time, not ability. People who changed careers or countries often have fewer formal years.',
    question: 'What should the person have done before, rather than for how long?',
    relaxTo: 'At least 2 years',
  },
  livesInFinland: {
    title: 'Must already live in Finland',
    reason: 'Business Espoo and Work in Finland help with relocation. International talent is part of the event pool.',
    question: 'Could the person start remotely or relocate within a few months?',
    relaxTo: 'Open to relocation',
  },
  noPermitNeeded: {
    title: 'No residence permit needed',
    reason: 'Specialists can get a permit through the fast track in about two weeks, and the city can guide you through it.',
    question: 'Is the permit process the real blocker, or the unknown? Would guidance from the city change your answer?',
    relaxTo: 'Permit through fast track is fine',
  },
}

const TEMPLATES_FI: Record<string, Omit<Flag, 'key'>> = {
  finnish: {
    title: 'Sujuva suomi ensimmäisestä päivästä',
    reason: 'Mikään kuvaamistasi tavoitteista ei vaadi suomea. Moni kansainvälinen osaaja oppii työssä hyvän suomen vuodessa.',
    question: 'Mitkä ensimmäisten kolmen kuukauden tehtävät vaativat suomea? Voisiko alussa toimia englanniksi ja suomen kurssi rinnalla?',
    relaxTo: 'Ei vaadita aloittaessa',
  },
  swedish: {
    title: 'Ruotsin kieli vaaditaan',
    reason: 'Kuvauksessasi ei mainita ruotsinkielisiä asiakkaita tai kollegoita.',
    question: 'Kenen kanssa tämä henkilö puhuisi ruotsia?',
    relaxTo: 'Ei vaadita',
  },
  english: {
    title: 'Korkea englannin taso',
    reason: 'Tiukka kielitaso rajaa pois ihmisiä, jotka osaisivat tehdä työn hyvin.',
    question: 'Riittääkö päivittäiseen työhön kirjallinen englanti?',
    relaxTo: 'Perustaso',
  },
  degree: {
    title: 'Tutkinto vaaditaan',
    reason: 'Tutkinto kertoo vähän listaamistasi tavoitteista. Osaamiseen perustuva rekrytointi laajentaa joukkoa ja vähentää vinoumaa alanvaihtajia ja niitä kohtaan, joiden tutkintoa ei tunnisteta Suomessa.',
    question: 'Sopisiko joku, joka on tehnyt tätä työtä ilman tutkintoa?',
    relaxTo: 'Ei tutkintovaatimusta',
  },
  minYears: {
    title: 'Vähimmäiskokemus vuosina',
    reason: 'Vuodet mittaavat aikaa, eivät osaamista. Alaa tai maata vaihtaneilla on usein vähemmän virallisia vuosia.',
    question: 'Mitä henkilön pitäisi olla tehnyt aiemmin, sen sijaan että kuinka kauan?',
    relaxTo: 'Vähintään 2 vuotta',
  },
  livesInFinland: {
    title: 'Asuttava jo Suomessa',
    reason: 'Business Espoo ja Work in Finland auttavat muutossa. Kansainväliset osaajat ovat osa tapahtuman osallistujia.',
    question: 'Voisiko henkilö aloittaa etänä tai muuttaa muutamassa kuukaudessa?',
    relaxTo: 'Muutto käy',
  },
  noPermitNeeded: {
    title: 'Ei oleskelulupatarvetta',
    reason: 'Erityisasiantuntija saa luvan nopeutetusti noin kahdessa viikossa, ja kaupunki voi opastaa prosessissa.',
    question: 'Onko lupaprosessi oikea este vai tuntematon asia? Muuttaisiko kaupungin opastus vastaustasi?',
    relaxTo: 'Lupa nopeutetusti käy',
  },
}

const templates = () => (getLang() === 'fi' ? TEMPLATES_FI : TEMPLATES_EN)

/** Rule-based check. Claude, when available, rewrites reasons and questions from the company's own words. */
/** Whether a requirement is set at all, so relaxing it could change something. */
function isSet(card: ChallengeCard, key: RequirementKey): boolean {
  const r = card.requirements
  switch (key) {
    case 'finnish': return r.finnish >= 1
    case 'swedish': return r.swedish >= 1
    case 'english': return r.english >= 3 // working English is a fair ask; only fluent is questioned
    case 'degree': return r.degree !== 'none'
    case 'minYears': return r.minYears > 2
    case 'livesInFinland': return r.livesInFinland
    case 'noPermitNeeded': return r.noPermitNeeded
    default: return false
  }
}

/**
 * The rules find the usual suspects; `suggested` adds requirements Claude questioned from the company's own words
 * (for example three years of experience for work that needs none). Justified requirements are never flagged.
 */
export function findFlags(card: ChallengeCard, justified: Set<RequirementKey> = new Set(), suggested: RequirementKey[] = []): Flag[] {
  const r = card.requirements
  const candidates: RequirementKey[] = []
  if (r.finnish >= 2) candidates.push('finnish')
  if (r.swedish >= 2) candidates.push('swedish')
  if (r.english >= 3) candidates.push('english')
  if (r.degree === 'bachelor' || r.degree === 'master') candidates.push('degree')
  if (r.minYears >= 4) candidates.push('minYears')
  if (r.livesInFinland) candidates.push('livesInFinland')
  if (r.noPermitNeeded) candidates.push('noPermitNeeded')
  for (const k of suggested) if (!candidates.includes(k) && k in templates() && isSet(card, k)) candidates.push(k)

  const flags: Flag[] = candidates
    .filter((k) => !justified.has(k))
    .map((k) => ({ key: k, ...templates()[k] }))

  // Too many must-have skills: suggest moving the most limiting one to nice-to-have.
  if (card.must.length >= 4) {
    let best: { skill: string; g: number } | null = null
    for (const s of card.must) {
      const g = gain(card, `must:${s}`)
      if (!best || g > best.g) best = { skill: s, g }
    }
    if (best && best.g > 0) {
      flags.push({
        key: `must:${best.skill}`,
        title: t(`${card.must.length} must-have skills`, `${card.must.length} pakollista taitoa`),
        reason: t(
          `Few people have all ${card.must.length}. "${skillLabel(best.skill)}" narrows the pool the most.`,
          `Harvalla on kaikki ${card.must.length}. "${skillLabel(best.skill)}" rajaa joukkoa eniten.`,
        ),
        question: t(`Could the new person learn "${skillLabel(best.skill)}" in the job?`, `Voisiko uusi henkilö oppia "${skillLabel(best.skill)}" työssä?`),
        relaxTo: t('Move to nice-to-have', 'Siirrä opittaviin'),
      })
    }
  }
  return flags
}
