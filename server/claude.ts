// Server-side Claude call: turns a hiring manager's answers into a draft challenge card.
// Claude reads only what the company wrote. Participant data never leaves the matching engine.
import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import { SKILLS } from '../src/data/skills.ts'
import type { CompanyAnswers } from '../src/engine/types.ts'

const skillIds = SKILLS.map((s) => s.id) as [string, ...string[]]
const level = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
const reqKey = z.enum(['finnish', 'english', 'swedish', 'degree', 'minYears', 'livesInFinland', 'noPermitNeeded'])

const CardSchema = z.object({
  title: z.string().describe('What the role is called, as the company called it'),
  problem: z.string().describe('The real problem this hire solves, in one or two plain sentences'),
  outcomes: z.array(z.string()).describe('Two to four concrete things the person gets done in the first three months'),
  must: z.array(z.enum(skillIds)).describe('Skills needed to reach the outcomes from day one'),
  nice: z.array(z.enum(skillIds)).describe('Skills that help but can be learned in the job'),
  requirements: z.object({
    finnish: level,
    english: level,
    swedish: level,
    degree: z.enum(['none', 'vocational', 'bachelor', 'master']),
    minYears: z.number().int(),
    livesInFinland: z.boolean(),
    noPermitNeeded: z.boolean(),
  }),
  workMode: z.enum(['on-site', 'hybrid', 'remote']),
  justified: z.array(reqKey).describe('Requirements the company gave a concrete, job-related reason for'),
  flags: z.array(
    z.object({
      key: reqKey,
      reason: z.string().describe('Why this requirement may keep capable people out, tied to what the company wrote'),
      question: z.string().describe('One question back to the hiring manager'),
    }),
  ),
})

export type ClaudeCard = z.infer<typeof CardSchema>

const SYSTEM = `You help hiring managers prepare for recruitment and matchmaking events run by the City of Espoo, Finland.
A hiring manager has answered a few questions about a role. Turn the answers into a challenge card.

Rules:
- Stay faithful to what they wrote. Record the requirements they stated exactly as stated; do not add requirements they did not state and do not soften them. The company decides what to change.
- Language levels: 0 not needed, 1 basic, 2 working, 3 fluent or native. If a language is not mentioned, use 0.
- minYears is 0 unless they state a number of years of experience.
- livesInFinland is true only if they say candidates must already live in Finland. noPermitNeeded is true only if they say they cannot sponsor or want no residence or work permit.
- must: only skills needed to reach the stated outcomes from day one. Everything else they mention goes to nice. Use only skill ids from the list.
- justified: a requirement belongs here only if they gave a concrete reason tied to the work, for example Finnish because the nurse speaks with Finnish-speaking residents every day.
- flags: for each stated requirement that is not justified and may keep capable people out (language levels of working or above, degrees, minimum years, living in Finland, no permit), explain why in one or two sentences tied to their own outcomes, and ask one short question back. Be respectful and specific, never preachy. Relevant facts: specialists can get a Finnish residence permit through the fast track in about two weeks; Business Espoo and Work in Finland help companies with international recruitment and relocation.
- Write problem, outcomes, reasons and questions in the language the hiring manager used.

Skill ids:
${SKILLS.map((s) => `${s.id}: ${s.label}`).join('\n')}`

let client: Anthropic | null = null

export function claudeAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
}

export async function extractWithClaude(a: CompanyAnswers): Promise<ClaudeCard> {
  client ??= new Anthropic()
  const response = await client.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: betaZodOutputFormat(CardSchema) },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Company: ${a.company}\nWhat they call the role: ${a.role}\n\nWhat should the new person have done after three months?\n${a.outcomes}\n\nWhat makes this hard, and what do they need?\n${a.hard}\n\nTeam and setup:\n${a.setup}`,
      },
    ],
  })
  if (response.stop_reason === 'refusal') throw new Error('The model declined this request.')
  if (!response.parsed_output) throw new Error(`No card in the response (stop reason: ${response.stop_reason}).`)
  return response.parsed_output
}
