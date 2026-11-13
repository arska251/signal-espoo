export function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="about-backdrop" onClick={onClose}>
      <div className="about" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="about-title">How Signal handles data and decisions</h2>
        <dl>
          <dt>AI reads only the company's words</dt>
          <dd>
            Claude turns a hiring manager's answers into a draft card. It never sees participant data. Matching is plain,
            explainable rules: skills, related skills and the requirements the company sets.
          </dd>
          <dt>Companies see counts, not people</dt>
          <dd>
            Before the event a company sees how many participants fit, never who. When someone says they are interested,
            the company sees their answer, the card's skills they have and only the facts the card asks about: no name,
            photo, age, gender or nationality. Names are shared only for a booked meeting.
          </dd>
          <dt>People decide</dt>
          <dd>
            The system ranks no one and rejects no one. The company approves its card, the requirement check only
            suggests, participants choose which cards they answer, and companies read answers in the order they
            arrived and choose who to meet.
          </dd>
          <dt>EU AI Act</dt>
          <dd>
            AI used to select or evaluate candidates is high-risk under Annex III. Signal keeps AI on the company side
            and away from decisions about individuals; a real deployment would still document human oversight, logging
            and transparency notices as the Act requires.
          </dd>
          <dt>Minimal data</dt>
          <dd>
            Participant records hold skills, language levels, education level, years of experience, whether the person
            lives in Finland and whether they need a permit. Nothing else. All data in this prototype is synthetic.
          </dd>
        </dl>
        <button type="button" className="primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
