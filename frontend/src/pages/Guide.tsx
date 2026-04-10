import { useNavigate } from 'react-router-dom';

export default function GuidePage() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4 text-gray-800 text-sm leading-relaxed pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-golf-green font-semibold"
        >
          &larr; Indietro
        </button>
        <h1 className="text-lg font-bold">Guida Golf Training</h1>
      </div>

      <section className="mb-6">
        <h2 className="text-base font-bold text-golf-green mb-2">⛳ Lo spirito dell'app</h2>
        <p>
          <strong>Golf Training</strong> nasce per trasformare l'allenamento quotidiano
          in una piccola gara condivisa tra i golfisti del circolo. Non devi
          aspettare il torneo del weekend per sfidarti: ogni giro che fai
          durante la settimana può diventare un match con classifica, punti
          Stableford e statistiche della tua evoluzione.
        </p>
        <p className="mt-2">
          L'obiettivo è <em>stimolare a giocare con continuita'</em>, rendendo
          divertente l'allenamento e fornendo dati oggettivi sui tuoi progressi
          per capire dove migliorare.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold text-golf-green mb-2">🎯 Come funzionano i giri della giornata</h2>
        <p>
          Quando ti registri al match la app crea (o ti unisce) al giro giusto
          per te nel club selezionato:
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            Se non hai ancora giocato oggi, parti dal <strong>Giro 1</strong>{' '}
            insieme a tutti gli altri golfisti che stanno giocando il loro
            primo giro del giorno.
          </li>
          <li>
            Dopo aver chiuso il Giro 1, al nuovo avvio parti
            automaticamente dal <strong>Giro 2</strong>, e cosi' via per i
            successivi.
          </li>
          <li>
            La <strong>classifica</strong> e' separata per giro: competi con
            chi sta giocando il tuo stesso numero di giro.
          </li>
          <li>
            Se un compagno chiude il suo giro prima di te, non preoccuparti:
            il tuo giro resta aperto e puoi continuare.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold text-golf-green mb-2">🏌️ Registrare un match</h2>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Dal tab <strong>Match</strong> premi "Inizia match".</li>
          <li>
            L'app calcola automaticamente i <strong>colpi di handicap</strong>{' '}
            distribuiti sulle buche in base allo stroke index del percorso.
          </li>
          <li>
            Per ogni buca usa i pulsanti + / − per registrare i colpi giocati.
            La app calcola i <strong>punti Stableford</strong> in tempo reale.
          </li>
          <li>
            Quando hai finito il giro premi <strong>"Termina match"</strong>.
            Il tuo giro viene chiuso e salvato nello storico.
          </li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold text-golf-green mb-2">📊 Il sistema Stableford</h2>
        <p>
          I punti per buca si calcolano cosi' (rispetto al tuo{' '}
          <em>par personalizzato</em>, ovvero par della buca + colpi HCP):
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><strong>4 punti</strong> — eagle (2 colpi sotto il par)</li>
          <li><strong>3 punti</strong> — birdie (1 colpo sotto)</li>
          <li><strong>2 punti</strong> — par</li>
          <li><strong>1 punto</strong> — bogey (1 colpo sopra)</li>
          <li><strong>0 punti</strong> — doppio bogey o peggio</li>
        </ul>
        <p className="mt-2">
          Piu' punti totalizzi, migliore e' il tuo giro. Una buca giocata male
          non ti penalizza oltre lo zero: puoi sempre recuperare sulle
          successive.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold text-golf-green mb-2">📋 Storico</h2>
        <p>
          Il tab <strong>Storico</strong> mostra tutti i match che hai giocato
          <em> nel club selezionato al login</em>. Tocca un match per vedere
          il dettaglio buca per buca, oppure usa il cestino per rimuovere un
          match.
        </p>
        <p className="mt-2">
          Se giochi in piu' club, cambiando il club al login vedrai lo storico
          corrispondente.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold text-golf-green mb-2">📈 Statistiche</h2>
        <p>Nel tab <strong>Stats</strong> trovi quattro viste:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            <strong>Dashboard</strong> — card riassuntive: match giocati,
            media punti, massimo, media ultimi 5.
          </li>
          <li>
            <strong>Trend</strong> — grafico dei tuoi punti negli ultimi 15
            match per vedere come stai progredendo.
          </li>
          <li>
            <strong>Distribuzione</strong> — quante volte hai fatto 0, 1, 2,
            3, 4 punti per buca.
          </li>
          <li>
            <strong>Par</strong> — media punti per tipo di buca (Par 3/4/5),
            utile per capire dove devi allenarti.
          </li>
        </ul>
        <p className="mt-2">
          Tocca il <strong>?</strong> in alto a destra di ogni vista per una
          spiegazione contestuale di cosa mostra e come interpretarla.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold text-golf-green mb-2">🏆 HCP</h2>
        <p>
          Il tab <strong>HCP</strong> mostra i tuoi risultati ufficiali con
          la variazione dell'handicap. Puoi vedere i risultati migliori, i
          peggiori e il calcolo del "best 8".
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold text-golf-green mb-2">👤 Profilo</h2>
        <p>
          Dal <strong>Profilo</strong> puoi aggiornare i tuoi dati, modificare
          handicap e tessera, cambiare password, e resettare le tue statistiche
          (utile se vuoi ricominciare da zero).
        </p>
      </section>

      <section className="mb-6 border-t pt-4">
        <h2 className="text-base font-bold text-golf-green mb-2">📱 Installare come app sullo smartphone</h2>
        <p>
          Golf Training puo' essere installato direttamente sul tuo telefono
          e funzionare come una vera app, con icona nella schermata home.
        </p>

        <h3 className="font-semibold mt-3 mb-1">Su iPhone (Safari)</h3>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Apri l'app nel browser <strong>Safari</strong>.</li>
          <li>
            Tocca il pulsante <strong>Condividi</strong> in basso (quadrato con
            freccia verso l'alto).
          </li>
          <li>
            Scorri e tocca <strong>"Aggiungi a Home"</strong>.
          </li>
          <li>
            Conferma il nome e tocca <strong>Aggiungi</strong>. L'icona
            comparira' sulla schermata home come una normale app.
          </li>
        </ol>

        <h3 className="font-semibold mt-3 mb-1">Su Android (Chrome)</h3>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Apri l'app in <strong>Chrome</strong>.</li>
          <li>
            Tocca il menu <strong>⋮</strong> in alto a destra.
          </li>
          <li>
            Scegli <strong>"Aggiungi a schermata Home"</strong> o
            <strong> "Installa app"</strong>.
          </li>
          <li>
            Conferma. L'icona verra' creata e l'app si aprira' a schermo
            intero, senza la barra del browser.
          </li>
        </ol>

        <p className="mt-3 text-gray-600 italic">
          Una volta installata, aprendola dall'icona si comporta come
          un'applicazione nativa: si avvia piu' velocemente e resta sempre a
          portata di mano quando arrivi al circolo.
        </p>
      </section>

      <section className="mt-6 text-center text-gray-500 text-xs">
        <p>Buon golf e... buoni punti! ⛳</p>
      </section>
    </div>
  );
}
