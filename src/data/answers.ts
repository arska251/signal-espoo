// Synthetic interest answers: what a participant writes when asked "When did you do something like it?".
// Deliberately plain and uneven, the way real people write, in English and Finnish.
export const ANSWERS: Record<string, string[]> = {
  legacy: [
    'At my previous employer we moved a 15-year-old order system off our own servers. We did it one module at a time and ran old and new side by side for two months, so customers never noticed.',
    'Siirsin edellisessä työssä vanhan laskutusjärjestelmän uuteen alustaan. Tärkeintä oli kirjoittaa ensin testit vanhalle järjestelmälle, jotta tiesimme, ettei mikään muutu.',
  ],
  backend: [
    'I built the backend for a booking service used by about 200 clinics, in Java and PostgreSQL. I was also on call, so I know what it means to fix production at night and how to stop needing to.',
    'Wrote and maintained REST services for a delivery tracking app, around 3 million requests a day. Most of my time went to making slow queries fast.',
  ],
  cloud: [
    'I moved our test and production environments to AWS and set up the deployment pipeline. Costs went down about 30 % after we right-sized the machines.',
    'Rakensin Azure-ympäristön pienelle ohjelmistotalolle ja automatisoin julkaisut. Ennen julkaisu vei päivän, lopuksi kymmenen minuuttia.',
  ],
  sql: [
    'Most of my last job was SQL: reports, data fixes and finding why numbers did not match between two systems. I like the detective part.',
  ],
  python: [
    'I wrote Python scripts that checked monthly financial reports against the source data before they went out. It caught a few embarrassing errors in the first month.',
    'Tein Pythonilla automaattisen tarkistuksen, joka vertasi raportin lukuja tietokantaan. Käsityö väheni noin puoleen.',
  ],
  testing: [
    'I set up automated tests for a reporting tool that had none. I started from the reports customers complained about most, and those complaints stopped.',
  ],
  accounting: [
    'Six years in accounting: closing the books, reconciling, explaining differences to auditors. I know what a wrong figure in a report costs.',
  ],
  'supply-chain': [
    'I worked four years in a distribution centre, first on the floor and then planning routes. I know what happens in a warehouse when the system is down.',
  ],
  wms: [
    'I was the key user of our warehouse system and trained 40 people to use it. When we changed vendors, I tested every flow before go-live.',
  ],
  'data-analysis': [
    'I analysed delivery data to find why some routes were always late. The fix was a change in loading order, not more trucks.',
  ],
  nursing: [
    'Ten years as a nurse, the last four in elderly care. I was responsible for one unit\'s medication and trained new practical nurses on the evening shift.',
    'Olen työskennellyt sairaanhoitajana kotihoidossa ja palvelutalossa. Vastasin lääkehoidosta ja perehdytin uusia työntekijöitä.',
  ],
  medication: [
    'I handled medication for 30 residents and introduced a double-check routine after one near miss. We had no medication errors after that.',
  ],
  games: [
    'I scaled the servers of a mobile game from 2 000 to 40 000 players at launch. We load-tested with bots for a month before.',
  ],
  devops: [
    'I set up Kubernetes and monitoring for a team of 15 developers. The first thing I did was make alerts quiet enough that people trusted them.',
  ],
  api: [
    'I designed the public API for a logistics platform, including documentation and versioning, so customers could integrate without calling us.',
  ],
}

export const GENERIC = [
  'I have done similar work in my previous job and I would be glad to tell more at the event.',
]
