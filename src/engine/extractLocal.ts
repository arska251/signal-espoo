// Offline extractor: keyword rules that turn the company's answers into a draft challenge card.
// Used when no AI is configured, and as the fallback if the AI call fails.
import { SKILLS } from '../data/skills'
import type { ChallengeCard, CompanyAnswers, LangLevel, RequirementKey, Requirements } from './types'

// A keyword must start a word, so "pipeline" does not match "peli" and "capital" does not match "api".
// A keyword written with a trailing space must also end the word.
const escape = (w: string) => w.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const SKILL_PATTERNS = SKILLS.map((s) => ({
  id: s.id,
  re: new RegExp(s.words.map((w) => `(?<![\\p{L}\\d])${escape(w)}${w.endsWith(' ') ? '(?![\\p{L}\\d])' : ''}`).join('|'), 'u'),
}))

function findSkills(text: string): string[] {
  const t = text.toLowerCase()
  return SKILL_PATTERNS.filter((p) => p.re.test(t)).map((p) => p.id)
}

function langLevel(text: string, names: string[]): LangLevel {
  const t = text.toLowerCase()
  // "Finnish not needed", "no Finnish required", "suomea ei tarvita": an explicit no wins.
  const no = /not (needed|required|necessary)|no need|isn'?t (needed|required)|ei (tarvita|vaadita|tarvitse)|ei ole välttämät/
  if (names.some((n) => new RegExp(`${n}[^.,;]{0,20}(${no.source})|(${no.source})[^.,;]{0,20}${n}|\\bno ${n}`).test(t))) return 0
  const near = (re: RegExp) =>
    names.some((n) => new RegExp(`(${re.source})[^.,;]{0,25}${n}|${n}[^.,;]{0,25}(${re.source})`).test(t))
  if (near(/fluent|native|sujuva|äidinkiel|excellent|erinomai|c1|c2/)) return 3
  if (near(/working|good|hyvä|b1|b2|professional/)) return 2
  if (near(/basic|some|perus|a1|a2|alkeet/)) return 1
  return names.some((n) => t.includes(n)) ? 2 : 0
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim().replace(/^[-•*]\s*/, ''))
    .filter((s) => s.length > 3)
}

export function extractLocal(a: CompanyAnswers): { card: ChallengeCard; justified: RequirementKey[] } {
  const all = [a.role, a.outcomes, a.hard, a.setup].join('\n')
  const t = all.toLowerCase()

  // Skills the company calls essential are must-haves. Without such a sentence, the outcomes decide.
  const essential = sentences(`${a.outcomes}\n${a.hard}`).filter((s) =>
    /\b(must|need|needs|needed|essential|required|require)\b|tarvi|pitää|välttämät|vaadi/i.test(s),
  )
  const mentioned = [...new Set([...findSkills(a.outcomes), ...findSkills(a.hard)])]
  const fromEssential = [...new Set(essential.flatMap(findSkills))]
  // A requirement sentence without skills ("Fluent Finnish required.") must not hide the skills named elsewhere.
  const must = fromEssential.length ? fromEssential : mentioned
  const nice = [...new Set([...mentioned, ...findSkills(a.setup)])].filter((s) => !must.includes(s))

  let degree: Requirements['degree'] = 'none'
  if (/master|maisteri|diplomi-insinööri|\bdi\b|msc/.test(t)) degree = 'master'
  else if (/bachelor|kandidaat|\bamk\b|degree|tutkinto|bsc/.test(t)) degree = 'bachelor'
  else if (/vocational|ammattitutkinto|lähihoitajan tutkinto/.test(t)) degree = 'vocational'

  const yearsMatch = t.match(/(\d+)\s*\+?\s*(years|yrs|vuoden|vuotta)[^.,]{0,15}(experience|kokemus)/)
  const requirements: Requirements = {
    finnish: langLevel(all, ['finnish', 'suomi', 'suomen']),
    english: langLevel(all, ['english', 'englanti', 'englannin']),
    swedish: langLevel(all, ['swedish', 'ruotsi', 'ruotsin']),
    degree,
    minYears: yearsMatch ? Number(yearsMatch[1]) : 0,
    livesInFinland: /(live|living|based|located|reside)[^.]{0,20}finland|asu[a-z]* suomessa|already in finland/.test(t),
    noPermitNeeded: /no (visa|permit|sponsor)|without (a )?(visa|permit|sponsor)|can'?t sponsor|cannot sponsor|eu citizen|työlupa|oleskelulupa/.test(t),
  }

  // A requirement the company gave a concrete reason for is not flagged.
  // Either the sentence that states it gives a reason ("because", "koska"), or the work itself needs it.
  const justified: RequirementKey[] = []
  const reasoned = (re: RegExp) =>
    sentences(all).some((s) => re.test(s.toLowerCase()) && /\b(because|since|as our|so that)\b|koska|jotta|sillä/.test(s.toLowerCase()))
  if (reasoned(/finnish|suomi|suomen/) || /patient|potila|resident|asukka|customer calls|asiakaspuhel|finnish customers|suomenkielis/.test(t)) justified.push('finnish')
  if (reasoned(/swedish|ruotsi/)) justified.push('swedish')
  if (reasoned(/degree|master|bachelor|tutkinto/)) justified.push('degree')
  if (reasoned(/years|vuoden|vuotta/)) justified.push('minYears')

  const workMode: ChallengeCard['workMode'] = /remote|etä/.test(t) ? (/hybrid|hybridi/.test(t) ? 'hybrid' : 'remote') : /hybrid|hybridi/.test(t) ? 'hybrid' : 'on-site'

  const hardSentences = sentences(a.hard)
  return {
    card: {
      company: a.company.trim() || 'Your company',
      title: (a.role).trim() || 'New role',
      problem: hardSentences.slice(0, 2).join(' ') || sentences(a.outcomes)[0] || '',
      outcomes: sentences(a.outcomes).slice(0, 4),
      must,
      nice,
      requirements,
      workMode,
    },
    justified,
  }
}
