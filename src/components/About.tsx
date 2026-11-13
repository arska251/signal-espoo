import { t } from '../i18n'

export function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="about-backdrop" onClick={onClose}>
      <div className="about" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="about-title">{t('How Signal handles data and decisions', 'Miten Signal käsittelee dataa ja päätöksiä')}</h2>
        <dl>
          <dt>{t("AI reads only the company's words", 'Tekoäly lukee vain yrityksen sanat')}</dt>
          <dd>
            {t(
              "Claude turns a hiring manager's answers into a draft card. It never sees participant data. Matching is plain, explainable rules: skills, related skills and the requirements the company sets.",
              'Claude muuttaa rekrytoivan esihenkilön vastaukset korttiluonnokseksi. Se ei koskaan näe osallistujien tietoja. Vertailu tehdään selkeillä, selitettävillä säännöillä: taidot, lähitaidot ja yrityksen asettamat vaatimukset.',
            )}
          </dd>
          <dt>{t('Companies see counts, not people', 'Yritykset näkevät lukumääriä, eivät ihmisiä')}</dt>
          <dd>
            {t(
              "Before the event a company sees how many participants fit, never who. When someone says they are interested, the company sees their answer, the card's skills they have and only the facts the card asks about: no name, photo, age, gender or nationality. Names are shared only for a booked meeting.",
              'Ennen tapahtumaa yritys näkee, moniko sopii, ei koskaan ketkä. Kun joku kertoo kiinnostuksestaan, yritys näkee vastauksen, kortin taidot jotka hänellä on, ja vain ne tiedot, joita kortti kysyy: ei nimeä, kuvaa, ikää, sukupuolta tai kansallisuutta. Nimet jaetaan vasta varattuun tapaamiseen.',
            )}
          </dd>
          <dt>{t('People decide', 'Ihmiset päättävät')}</dt>
          <dd>
            {t(
              'The system ranks no one and rejects no one. The company approves its card, the requirement check only suggests, participants choose which cards they answer, and companies read answers in the order they arrived and choose who to meet.',
              'Järjestelmä ei pisteytä eikä hylkää ketään. Yritys hyväksyy korttinsa, vaatimustarkistus vain ehdottaa, osallistujat valitsevat, mihin kortteihin vastaavat, ja yritykset lukevat vastaukset saapumisjärjestyksessä ja valitsevat, keitä tapaavat.',
            )}
          </dd>
          <dt>{t('EU AI Act', 'EU:n tekoälyasetus')}</dt>
          <dd>
            {t(
              'AI used to select or evaluate candidates is high-risk under Annex III. Signal keeps AI on the company side and away from decisions about individuals; a real deployment would still document human oversight, logging and transparency notices as the Act requires.',
              'Ehdokkaiden valintaan tai arviointiin käytettävä tekoäly on liitteen III mukaan suuririskistä. Signal pitää tekoälyn yrityksen puolella ja erossa yksilöitä koskevista päätöksistä; oikeassa käytössä ihmisvalvonta, lokitus ja läpinäkyvyysilmoitukset dokumentoitaisiin silti asetuksen mukaisesti.',
            )}
          </dd>
          <dt>{t('Minimal data', 'Minimaalinen data')}</dt>
          <dd>
            {t(
              'Participant records hold skills, language levels, education level, years of experience, whether the person lives in Finland and whether they need a permit. Nothing else. All data in this prototype is synthetic.',
              'Osallistujatiedoissa on vain taidot, kielitasot, koulutustaso, kokemusvuodet, asuuko henkilö Suomessa ja tarvitseeko hän luvan. Ei mitään muuta. Kaikki prototyypin data on synteettistä.',
            )}
          </dd>
        </dl>
        <button type="button" className="primary" onClick={onClose}>
          {t('Close', 'Sulje')}
        </button>
      </div>
    </div>
  )
}
