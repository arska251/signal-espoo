// Signal check: a writing coach, not a judge. It tells the writer whether a text carries signal (a concrete
// detail, their own part, what changed) or noise (filler that any generator produces). Everyone gets the same
// help, nothing is scored, nothing is detected as AI, and the reader never sees the result.

export interface Check {
  label: string
  ok: boolean
  tip: string
}

const FILLER = [
  'passionate', 'team player', 'results-driven', 'results driven', 'synergy', 'leverage', 'proven track record',
  'fast-paced', 'go-getter', 'self-starter', 'hard-working', 'hardworking', 'detail-oriented', 'dynamic',
  'motivated', 'think outside the box', 'rockstar', 'ninja', 'world-class', 'cutting-edge', 'best-in-class',
  'intohimo', 'dynaami', 'tiimipelaaja', 'innokas', 'motivoitunut', 'tuloshakuinen', 'paineensietokyk',
]

function filler(text: string): string | null {
  const t = text.toLowerCase()
  return FILLER.find((w) => t.includes(w)) ?? null
}

// Numbers, number words and units of time or size. Finnish stems carry no end boundary, since they inflect
// ("kymmeneen", "tuhansia").
const NUMBER =
  /\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|hundred|thousand|million|half|twice|dozen|minutes?|hours?|days?|weeks?|months?|years?)\b|\b(yk[sd]|kak[sd]|kolm|nelj|viid|viis|kuu[dst]|seitsem|kahdeks|yhdeks|kymmen|sa[dt]a|tuha[nt]|miljoon|puol|kerta|minuut|tunni|tunti|päiv|viiko|kuukau|vuo[dst])/i
const OWN_PART = /\b(i|i'm|i've|i'd|my|me)\b|\b(tein|rakensin|siirsin|vastasin|johdin|korjasin|kehitin|suunnittelin|automatisoin|opetin|perehdytin|hoidin|kirjoitin|aloitin|vein|analysoin|toteutin)\b/i
const CHANGE = /\b(so that|which (cut|saved|made|meant)|result|cut|reduced|increased|faster|slower|saved|stopped|went from|dropped|grew|halved|doubled|never|no longer|instead)\b|jotta|ansiosta|väheni|vähensi|nousi|lyheni|nopeutui|säästi|loppui|puolittui|kasvoi|tuplaantui/i

/** For a participant's answer to "When did you do something like it?". */
export function answerChecks(text: string): Check[] {
  const f = filler(text)
  return [
    { label: 'A concrete detail', ok: NUMBER.test(text), tip: 'Add a number: how many, how big, how long, how much faster.' },
    { label: 'Your own part', ok: OWN_PART.test(text), tip: 'Say what you did yourself, not only what the team did.' },
    { label: 'What changed', ok: CHANGE.test(text), tip: 'Say what was different afterwards because of it.' },
    { label: 'No filler', ok: !f, tip: f ? `“${f}” could describe anyone. Replace it with something you did.` : '' },
  ]
}

const DUTY = /\b(responsible for|responsibilities|duties|tasks include|working with|work with|participate in|assist|support the)\b|vastaa[a-zäö]* |tehtäviin kuuluu|osallistu|avustaa/i
const RESULT = /\d|\b(move|moved|build|built|cut|launch|launched|ship|shipped|migrate|migrated|automate|automated|reduce|reduced|set up|take ownership|taken ownership|train|lead|scale|documented|document|siirtää|siirretty|rakentaa|rakentanut|vähentää|julkaista|automatisoi|kouluttaa|johtaa)\b/i

/** For a company's answer to "What should the new person have done after three months?". */
export function outcomeChecks(text: string): Check[] {
  const f = filler(text)
  return [
    { label: 'Results, not duties', ok: text.trim().length > 0 && !DUTY.test(text), tip: '“Responsible for X” is a duty. Say what is done or different after three months.' },
    { label: 'Something you can check', ok: RESULT.test(text), tip: 'Name something you could point at in three months: moved, built, cut, launched.' },
    { label: 'No filler', ok: !f, tip: f ? `“${f}” says little about the work. Describe the work instead.` : '' },
  ]
}
