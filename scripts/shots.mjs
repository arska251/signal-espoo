// Walks through the demo flow in headless Chrome and saves screenshots to shots/.
// Usage: start the app (npm run dev), then: node scripts/shots.mjs [url]
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:5317/'
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync('shots', { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

const width = Number(process.env.WIDTH ?? 1440)
const lang = process.env.LANG_UI === 'fi' ? 'fi' : 'en'
const L = (en, fi) => (lang === 'fi' ? fi : en)
await page.evaluateOnNewDocument((l) => localStorage.setItem('signal.lang', l), lang)
await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
const tag = (width < 800 ? '-mobile' : '') + (lang === 'fi' ? '-fi' : '')
const shot = async (name, full = false) => {
  await new Promise((r) => setTimeout(r, 400)) // let transitions settle
  return page.screenshot({ path: `shots/${name}${tag}.png`, fullPage: full })
}
const clickText = async (text) => {
  const [el] = await page.$$(`xpath/.//button[contains(., ${JSON.stringify(text)})]`)
  if (!el) throw new Error(`No button with text: ${text}`)
  // Click through the DOM: on phones the fixed tour bar can sit over a button that was just scrolled into view.
  await el.evaluate((b) => b.click())
}

const tourLog = []
const tour = async (label) => tourLog.push(`${label}: ${await page.$eval('.tour', (el) => el.innerText.split('\n').slice(0, 2).join(' | ')).catch(() => '(no tour)')}`)

await page.goto(url, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1800)) // let the room light up
await tour('load')
await shot('0-tour-intro')
await clickText(L('Start the tour', 'Aloita kierros'))
await tour('started')
await shot('1-describe')
await clickText(L('Logistics software company', 'Logistiikkaohjelmistoyritys'))
await clickText(L('Draft my challenge card', 'Laadi haastekortti'))
await page.waitForSelector('.review', { timeout: 60000 })
await new Promise((r) => setTimeout(r, 600))
await shot('2-review')
await tour('review')
await shot('2-review-full', true)
const relax = await page.$('.relax')
if (relax) {
  await relax.hover()
  await new Promise((r) => setTimeout(r, 500))
  await shot('3-preview-hover')
}
// Accept every suggestion, one by one.
while (await page.$('.relax')) {
  await page.$eval('.relax', (el) => el.click())
  await new Promise((r) => setTimeout(r, 150))
}
await page.mouse.move(5, 5)
await new Promise((r) => setTimeout(r, 600))
await shot('4-all-relaxed')
await tour('relaxed')
await clickText(L('Publish to the event', 'Julkaise tapahtumaan'))
await page.waitForSelector('.published')
await shot('5-published')
await tour('published')
await clickText(L('See it as a participant', 'Katso osallistujana'))
await page.waitForSelector('.participant')
await shot('6-participant')
await tour('participant')
await clickText(L('I am interested', 'Olen kiinnostunut'))
await page.waitForSelector('.interest textarea')
await page.type('.interest textarea', 'At my last job I moved a ten-year-old warehouse system to AWS in stages, one warehouse at a time, so deliveries never stopped.')
await shot('7-interest')
await clickText(L('Send interest', 'Lähetä kiinnostus'))
// Back to the company: the inbox now has the seeded answers and the one just sent.
await clickText(L('Company', 'Yritys'))
await page.waitForSelector('.inbox')
await page.$$eval('.answer', (els) => els[els.length - 1].scrollIntoView())
await new Promise((r) => setTimeout(r, 200))
await shot('8-inbox')
await tour('inbox')
// Meet the first seeded person and the person from the participant view.
await page.$$eval('.answer .primary', (els) => els[0].click())
await page.$$eval('.answer', (els) => els[els.length - 1].querySelector('.primary').click())
await page.waitForSelector('.meetings')
await page.$eval('.meetings', (el) => el.scrollIntoView())
await new Promise((r) => setTimeout(r, 200))
await shot('9-meetings')
await tour('meetings')
await clickText(L('Participant', 'Osallistuja'))
await page.waitForSelector('.met')
await page.$eval('.met', (el) => el.scrollIntoView({ block: 'center' }))
await shot('10-participant-meeting')
await clickText(L('Organiser', 'Järjestäjä'))
await page.waitForSelector('.organiser')
await shot('11-organiser', true)
await tour('organiser')

await browser.close()
console.log(tourLog.join('\n'))
console.log(errors.length ? `Page errors:\n${errors.join('\n')}` : 'No page errors.')
