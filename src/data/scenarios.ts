// Example answers from fictional companies, written the way a busy hiring manager would.
import type { CompanyAnswers } from '../engine/types'

export interface Scenario {
  id: string
  label: string
  answers: CompanyAnswers
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'logistics',
    label: 'Logistics software company',
    answers: {
      company: 'Kuljetus Oy (fictional)',
      role: 'Senior Full-Stack Developer',
      outcomes:
        'Move our warehouse management system from our own servers to the cloud without stopping deliveries. Build an API so our customers can see their shipments in real time. Take ownership of the backend so our CTO can stop fixing production at night.',
      hard:
        'The warehouse system is 12 years old and nobody who built it still works here. We need someone who has migrated legacy systems before and who understands logistics. Must have SQL, backend and cloud experience. Fluent Finnish, a master\'s degree and 5+ years of experience required. Candidates must already live in Finland, we cannot sponsor a work permit.',
      setup:
        'Team of six developers in Espoo, hybrid. We use React on the frontend and run agile two-week sprints. Customers are Finnish and international.',
    },
  },
  {
    id: 'equity',
    label: 'Equity research company',
    answers: {
      company: 'Arvo Research (fictional)',
      role: 'Developer, automated equity research',
      outcomes:
        'Taken ownership of one step in our automated equity research pipeline, from report generation to fact-checking. Built automated checks in Python that catch wrong figures before an analyst sees the report, so a review round needs fewer manual fixes. Documented the generate, review, fix and test cycle so a new analyst can run it alone.',
      hard:
        'Our reports combine company financials, valuation models and AI-written text, and one wrong figure costs our credibility with investors. The person has to see how numbers flow from source data into the report and notice when the text contradicts the figures. Must have Python, SQL and testing experience, and understand accounting and financial statements. Fluent Finnish is required because the reports are written in Finnish for Finnish investors. A master\'s degree in finance and 5+ years of experience required.',
      setup: 'Small team of equity analysts and developers, hybrid. We use Python, PostgreSQL and our own valuation platform. Machine learning experience is a plus.',
    },
  },
  {
    id: 'care',
    label: 'Care home group',
    answers: {
      company: 'Hoivakoti Kaislikko (fictional)',
      role: 'Registered nurse',
      outcomes:
        'Take responsibility for medication for one of our units. Lead the evening shift. Help us train new practical nurses.',
      hard:
        'Our residents are elderly and many have memory disorders, so the nurse talks with residents and their families in Finnish every day. Nursing and medication skills are essential for patient safety. Working Finnish needed.',
      setup: 'On-site in Espoo Leppävaara. Three-shift work. We offer a Finnish course for nurses who are still improving.',
    },
  },
  {
    id: 'game',
    label: 'Game studio',
    answers: {
      company: 'Pixel Fjord Games (fictional)',
      role: 'Backend developer for online games',
      outcomes:
        'Scale our multiplayer servers before the global launch in March. Cut server costs. Set up monitoring so the team sleeps through launch week.',
      hard:
        'Our backend runs on Kubernetes and we have never had more than 5000 players online at once. We need backend and cloud experience. Bachelor\'s degree in computer science required.',
      setup: 'English-speaking team of 25, hybrid in Otaniemi. Experience from games is a plus. Python or C# is nice to have.',
    },
  },
]
