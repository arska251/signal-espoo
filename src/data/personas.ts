// Three fictional participants for the participant view. Only what matching needs, plus a short
// description the person wrote about themselves.
import type { Participant } from '../engine/types'

export interface Persona {
  id: string
  label: string
  about: string
  participant: Participant
}

export const PERSONAS: Persona[] = [
  {
    id: 'backend',
    label: 'Backend developer, moved to Espoo last year',
    about: 'Eight years building logistics software in Kyiv. Learning Finnish, basic level so far.',
    participant: { id: -1, skills: ['backend', 'java', 'sql', 'api', 'legacy', 'wms', 'cloud'], finnish: 1, english: 3, swedish: 0, degree: 'master', years: 8, livesInFinland: true, needsPermit: true },
  },
  {
    id: 'analyst',
    label: 'Data analyst, career changer',
    about: 'Six years as an accountant, then a data analytics course. Finnish native speaker, no university degree.',
    participant: { id: -2, skills: ['accounting', 'excel', 'sql', 'python', 'data-analysis', 'testing'], finnish: 3, english: 2, swedish: 1, degree: 'vocational', years: 7, livesInFinland: true, needsPermit: false },
  },
  {
    id: 'nurse',
    label: 'Registered nurse, Finnish course ongoing',
    about: 'Ten years of nursing in the Philippines, now in Espoo. Working Finnish, getting better every month.',
    participant: { id: -3, skills: ['nursing', 'medication', 'patient-safety', 'elderly-care'], finnish: 2, english: 3, swedish: 0, degree: 'bachelor', years: 10, livesInFinland: true, needsPermit: false },
  },
]
