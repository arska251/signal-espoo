import { t } from '../i18n'

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
    { label: t('A concrete detail', 'Konkreettinen yksityiskohta'), ok: NUMBER.test(text), tip: t('Add a number: how many, how big, how long, how much faster.', 'Lisää luku: kuinka monta, kuinka iso, kuinka kauan, kuinka paljon nopeammin.') },
    { label: t('Your own part', 'Oma osuutesi'), ok: OWN_PART.test(text), tip: t('Say what you did yourself, not only what the team did.', 'Kerro, mitä teit itse, ei vain mitä tiimi teki.') },
    { label: t('What changed', 'Mikä muuttui'), ok: CHANGE.test(text), tip: t('Say what was different afterwards because of it.', 'Kerro, mikä oli sen ansiosta toisin jälkeenpäin.') },
    { label: t('No filler', 'Ei täytesanoja'), ok: !f, tip: f ? t(`“${f}” could describe anyone. Replace it with something you did.`, `“${f}” sopii kehen tahansa. Korvaa se jollain, mitä teit.`) : '' },
  ]
}

const DUTY = /\b(responsible for|responsibilities|duties|tasks include|working with|work with|participate in|assist|support the)\b|vastaa[a-zäö]* |tehtäviin kuuluu|osallistu|avustaa/i
const RESULT = /siirr|rakenn|julkais|automatisoi|vähenn|kouluttan|\d|\b(move|moved|build|built|cut|launch|launched|ship|shipped|migrate|migrated|automate|automated|reduce|reduced|set up|take ownership|taken ownership|train|lead|scale|documented|document|siirtää|siirretty|rakentaa|rakentanut|vähentää|julkaista|automatisoi|kouluttaa|johtaa)\b/i

/** For a company's answer to "What should the new person have done after three months?". */
export function outcomeChecks(text: string): Check[] {
  const f = filler(text)
  return [
    { label: t('Results, not duties', 'Tuloksia, ei tehtäviä'), ok: text.trim().length > 0 && !DUTY.test(text), tip: t('“Responsible for X” is a duty. Say what is done or different after three months.', '“Vastaa X:stä” on tehtävä. Kerro, mikä on valmista tai toisin kolmen kuukauden päästä.') },
    { label: t('Something you can check', 'Jotain tarkistettavaa'), ok: RESULT.test(text), tip: t('Name something you could point at in three months: moved, built, cut, launched.', 'Nimeä jotain, mihin voit osoittaa kolmen kuukauden päästä: siirretty, rakennettu, vähennetty, julkaistu.') },
    { label: t('No filler', 'Ei täytesanoja'), ok: !f, tip: f ? t(`“${f}” says little about the work. Describe the work instead.`, `“${f}” kertoo työstä vähän. Kuvaa työ sen sijaan.`) : '' },
  ]
}
