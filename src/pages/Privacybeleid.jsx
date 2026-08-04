import LegalPage from '../components/LegalPage';

export default function Privacybeleid() {
  return (
    <LegalPage title="Privacybeleid" updatedAt="4 augustus 2026">
      <section>
        <h2>1. Wie zijn wij</h2>
        <p>
          MamaBuddy is een app die moeders in Nederland en België ondersteunt met Buddy, een
          persoonlijke coach-ervaring. Voor vragen over privacy kun je altijd mailen naar{' '}
          <a href="mailto:mamabuddynl@gmail.com">mamabuddynl@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2>2. Welke gegevens verzamelen we</h2>
        <ul>
          <li>Je naam en e-mailadres, voor je account en om in te loggen.</li>
          <li>De naam en geboortedatum van je kinderen, als je die invult.</li>
          <li>Je gesprekken met Buddy.</li>
          <li>Je dagelijkse check-ins (stemming en een eventuele toelichting).</li>
          <li>Items die je toevoegt aan "Mijn hoofd".</li>
          <li>Feedback, sterren-beoordelingen of bug-meldingen die je zelf instuurt.</li>
          <li>
            Basale gebruiksstatistieken (bijvoorbeeld wanneer je voor het laatst actief was),
            uitsluitend om de app te verbeteren — niet zichtbaar voor andere gebruikers.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Waarvoor gebruiken we deze gegevens</h2>
        <ul>
          <li>Om Buddy persoonlijke, relevante antwoorden te laten geven.</li>
          <li>Om je dagelijkse check-ins en voortgang bij te houden.</li>
          <li>Om te bepalen of je nog binnen de gratis limiet zit of Premium hebt.</li>
          <li>Om MamaBuddy te verbeteren op basis van feedback die je zelf geeft.</li>
        </ul>
        <p>We gebruiken je gegevens nooit om aan derden te verkopen of voor advertentiedoeleinden.</p>
      </section>

      <section>
        <h2>4. Waar wordt je data opgeslagen</h2>
        <p>
          Je gegevens worden opgeslagen bij Supabase, op servers binnen Europa. Elke gebruiker
          kan alleen bij haar eigen gegevens — dit is technisch afgedwongen (Row Level Security),
          niet alleen een belofte.
        </p>
      </section>

      <section>
        <h2>5. Delen met derden</h2>
        <ul>
          <li>
            <strong>Anthropic</strong> — voor het genereren van Buddy's antwoorden ontvangt
            Anthropic de tekst van je gesprek en relevante context. Zij gebruiken dit niet om je
            persoonlijk te identificeren of voor eigen marketingdoeleinden.
          </li>
          <li>
            <strong>Betaalprovider</strong> — als je een betaald Premium-abonnement afsluit,
            verwerkt onze betaalprovider je betaalgegevens. Wij slaan zelf nooit je kaart- of
            bankgegevens op.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Hoe lang bewaren we je gegevens</h2>
        <p>
          Zolang je account bestaat. Feiten en inzichten die Buddy over je onthoudt kun je op elk
          moment zelf bekijken, aanpassen of wissen in Profiel → "Wat Buddy over jou weet".
        </p>
      </section>

      <section>
        <h2>7. Jouw rechten</h2>
        <p>
          Onder de AVG heb je recht op inzage, correctie en verwijdering van je gegevens. Mail
          ons op <a href="mailto:mamabuddynl@gmail.com">mamabuddynl@gmail.com</a> en we helpen je
          verder.
        </p>
      </section>

      <section>
        <h2>8. Gegevens van je kinderen</h2>
        <p>
          Naam en geboortedatum van je kinderen gebruiken we uitsluitend om Buddy's gesprekken
          persoonlijker te maken (bijvoorbeeld door leeftijd mee te wegen) — nooit voor marketing
          of om aan derden te verstrekken.
        </p>
      </section>

      <section>
        <h2>9. Wijzigingen in dit beleid</h2>
        <p>
          We kunnen dit beleid van tijd tot tijd bijwerken. De datum bovenaan deze pagina laat
          zien wanneer dat voor het laatst is gebeurd.
        </p>
      </section>
    </LegalPage>
  );
}
