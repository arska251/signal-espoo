# Signal: challenge cards for Espoo matchmaking events

Junction 2026 submission for the City of Espoo challenge "Rethinking Recruitment".

- **Live demo:** https://arska251.github.io/signal-espoo/ (opens with a guided tour, about four minutes)
- **Code:** https://github.com/arska251/signal-espoo

## One-liner

A hiring manager answers three questions in their own words. Signal turns the answers into a challenge card, shows right away how many registered event participants fit it, and points out the requirements that keep capable people out.

## Our answer to AI-generated noise

We do not try to detect AI text: detectors are unreliable and penalise people writing in their second language. Instead Signal changes what is asked and helps everyone answer it well:

- Companies describe **outcomes after three months**, not duties. Participants answer **one of those outcomes** in two or three sentences instead of sending a CV. A generic text has nothing to attach to.
- The **Signal check** coaches every writer, company and participant alike, toward signal: a concrete detail, their own part, what changed, no filler. It works in English and Finnish, never blocks sending, never scores anyone, and the reader never sees it. Whoever or whatever wrote "passionate, results-driven team player", the check shows it as noise.
- The answer is discussed face to face at the event, which is where a polished text meets the real person.

## The problem we picked

Espoo listed the company side first, and so do we:

- Companies do not see the city as a source of talent, so they are hard to engage.
- Companies describe their needs vaguely and too late, just before the event.
- Job ads and CVs are written and read by AI, so both sides meet synthetic descriptions instead of real needs and real skills.
- Inflated requirements (fluent Finnish, a degree, five years, already living in Finland) quietly exclude international and career-changing professionals who could do the job.

Most solutions start from the jobseeker's CV. Signal starts from the company, because a clear and fair need is what makes everything after it work.

## What Signal does

1. **Describe the work, not the job ad.** Three questions: what the new person has done after three months, what makes it hard and what they need, who they work with. Typing or dictation (in browsers that support it), in English or Finnish. About five minutes.
2. **Challenge card.** A card is drafted from the answers (by Claude when an API key is configured; the public demo uses offline keyword rules): the real problem, the three-month outcomes, must-have and learnable skills mapped to the EU ESCO classification, and the requirements exactly as the company stated them. The company edits and approves every line.
3. **The room.** 240 dots, one for each registered participant (synthetic data). They light up live as the card changes: mint for a fit, periwinkle for a fit through related skills, amber for people who have the skills but are kept out by a requirement. The company sees counts, never profiles.
4. **Requirement check.** Signal flags requirements that keep capable people out without a stated reason, with a question back to the company and the number of people each change would add. Hovering a suggestion previews exactly which dots would change. The company decides; nothing changes automatically. When the company gave a real reason, for example Finnish for a nurse who talks with elderly residents every day, Signal respects it and does not flag it.
5. **Participant view.** Participants see only the cards that fit them, with a plain reason ("You have SQL; Java is close to backend"). No CV to polish: to show interest they pick one of the company's outcomes and say, in two or three sentences and in any language, when they did something like it. The company reads that with the skills, without a name. Cards a person is kept out of by a requirement stay hidden, and the organisers see how many.
6. **Organiser view.** Every card with fit, people kept out by requirements, interest and meetings; **what the requirement check changed** across all cards (in the demo: 31 → 68 people reached, of them working in English 6 → 15); the companies still without a card, with a reminder; and a "who is coming" summary to send to companies they are inviting.
7. **Company inbox and meetings.** A week before the event the company reads the answers: the outcome each person picked, their own words, the card's skills they have, and only the facts the card asks about. Shown in the order they arrived; Signal ranks no one. "Meet at the event" books a 15-minute slot, and both sides get three conversation questions built from the card and the answer, so the meeting goes to the work, not small talk. The participant sees the time and their questions in their own view. When the person would need a residence permit, the meeting card tells the company about the specialist fast track and the city's International Working Life Services.

In the logistics example, the card as first written reaches **1** of 240 participants. After the requirement check it reaches **33**, and the company decided each change. One of the people it now reaches is a backend developer who moved to Espoo last year and speaks basic Finnish: the card as first written would never have shown up for them.

## Why this matters for Espoo

- **Engagement:** "14 people at the event fit your need" is a stronger invitation than "come to our free event". It answers the doubt that the city's pool has nobody for them.
- **Earlier, clearer needs:** the card takes five minutes and is useful to the company right away, so it gets done weeks before the event, not the day before.
- **Signal, not noise:** participants see concrete outcomes instead of buzzword ads, and companies get approaches from people who fit.
- **Fairness built in:** the requirement check widens the pool before any person is judged, which is where bias against international talent starts.

## Responsible AI

- **AI reads only the company's words.** It never sees participant data. Matching is explainable rules: skills, related skills and the company's own requirements.
- **No automated decisions about people.** Nobody is ranked or rejected by the system. Before anyone shows interest, companies see aggregate counts only. When a participant says they are interested, the company sees their answer, the card's skills they have and only the facts the card asks about: no name, photo, age, gender or nationality. Names are shared only for a booked meeting.
- **EU AI Act.** AI used to select or evaluate candidates is high-risk under Annex III. Signal keeps AI on the company side and away from decisions about individuals; a production version would still document human oversight, logging and transparency notices.
- **Minimal data.** A participant record holds only skills, language levels, education level, years of experience, whether they live in Finland and whether they need a permit. All data in the prototype is synthetic.
- **Works without AI.** An offline extractor drafts the card with keyword rules, so the event never depends on an API being up.

## How it is built

- React and TypeScript (Vite), one page, no backend database.
- Claude Opus 5.5 through the Anthropic TypeScript SDK with structured outputs; the server-side call lives in `server/claude.ts`. The API key stays on the server. The public demo has no key and drafts with the offline extractor.
- Skills taxonomy of 49 skills modelled on ESCO, with related skills for transferable matches.
- 240 synthetic participants generated from a fixed seed, so every demo shows the same room.
- A guided tour for anyone who opens the link alone: a bar at the bottom says what to do next and why it matters, and follows the visitor's own clicks.
- Unit tests for matching, the requirement check, extraction and the conversation brief (`npm test`).

## What comes next

Built end to end: company card, requirement check, participant view, company inbox, meetings with conversation questions, organiser view. Next:

1. Test and tune the Claude drafting against real hiring managers' answers; today the public demo runs on the offline extractor.
2. A Finnish-language interface, and ESCO URIs from the ESCO API instead of our 49-skill subset.
3. Claude writing the conversation questions from the actual answer, as it already does for the card.
4. Feedback after each meeting from both sides, so organisers can show companies what the event led to.

## Demo script (4 minutes)

1. **The problem (20 s).** Companies come to Espoo's events late, with vague needs, and with requirements that quietly exclude the international talent in the room.
2. **Describe (30 s).** Pick "Logistics software company". Read the three answers aloud: they sound normal. Click "Draft my challenge card".
3. **The room (40 s).** The card reaches 1 of 240. Fourteen amber dots have the skills but are kept out by requirements.
4. **Requirement check (50 s).** Hover "Change to: Not required to start" on fluent Finnish: three dots light up. Point at "With all suggestions, your card would reach 32". Accept the changes one by one; the room lights up. Then show the care home example: Finnish is kept, because the company gave a reason.
5. **Participant (30 s).** Publish, then "See it as a participant". The backend developer with basic Finnish now sees the card, with the reason it fits. They answer one outcome in two sentences instead of sending a polished CV.
6. **Inbox (30 s).** Back to Company: fast forward a week. Five answers, unranked, no names. Click "Meet at the event" on the backend developer: 10:20, with three questions for each side. Switch to Participant: they see the time and their own questions.
7. **Organiser (15 s).** Cards, interest, meetings, companies still without a card and a one-click reminder.
8. **Close (15 s).** AI only reads the company's words, nobody is ranked, people decide. Five minutes for a company; a fairer, fuller room for Espoo.
