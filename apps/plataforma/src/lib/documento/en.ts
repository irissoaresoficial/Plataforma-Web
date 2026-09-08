/**
 * ENGLISH — the sheet that gets handed over, in English.
 *
 * British spelling and punctuation: Iris works out of Spain and her
 * English-speaking clients are on this side of the Atlantic. Dates are
 * formatted `en-GB` (19 July 1951), which is the other half of the same
 * decision — see `locale` below.
 *
 * HOW TO READ THIS FILE
 *
 *   · `hoja` holds the sheet's own voice: the headings and the lines that
 *     explain each section. They are written for someone who has never studied
 *     Kabbalah — plain, concrete, no mysticism. If a line comes out solemn it
 *     is badly translated even when it is literally correct.
 *   · everything else is the SCHOOL'S MATERIAL. There the translation says
 *     exactly what the original says: not one shade more, not one less.
 *
 * THE ARCANA KEEP THEIR ENGLISH NAMES. «El Carro» is «The Chariot», not «The
 * Cart», and «El Ermitaño» is «The Hermit». Where the school's Spanish name
 * points at one of two English traditions, the matching one was used and the
 * choice is noted next to it.
 *
 * To fix a line: find it, change the text between the quotes, done. The braces
 * —`{edad}`, `{n}`, `{lista}`— are holes the program fills with data and have
 * to stay exactly as they are.
 */
import type { Diccionario } from "./tipos";

export const EN: Diccionario = {
  codigo: "en",
  locale: "en-GB",

  hoja: {
    subtitulo: "Your whole study on one page",

    comoEres: "What you are like",
    porDentro: "Inside",
    porDentroPie: "What you came here to be, whether you see it or not.",
    porFuera: "Outside",
    porFueraPie: "What people see of you.",

    tuCamino: "Your path",
    tuCaminoPie: "Three stretches running at the same time; what changes is how much each one weighs.",
    origenTitulo: "Where you come from",
    origenQue: "What you already knew how to do when you arrived",
    origenCuando: "until {edad}",
    transformacionTitulo: "How you go through life",
    transformacionQue: "Your way of being in the world",
    transformacionCuando: "always",
    destinoTitulo: "Where you are heading",
    destinoQue: "The place life is taking you",
    destinoCuando: "from {edad} on",

    loQueTrabajas: "What you came here to work on",
    loQueTrabajasPie: "They are not faults: they are this life's tasks, and they get done one at a time.",
    sinTareas: "None pending: your work is to hold on to what you already bring done.",

    loQueTeFrena: "What holds you back",
    loQueTeFrenaPie: "The places where your energy gets stuck. Seeing them is already half the job.",
    sinFrenos: "Nothing gets stuck: your energy runs clean.",

    yaHecho: "What you already bring done",
    yaHechoNada: "Everything is still to be worked on in this life.",
    yaHechoTexto:
      "{n} of the ten points on your chart come already resolved from before: the {lista}. That is your firm ground, what you can lean on when the rest is hard.",

    porCerrar: "What you have left to close",
    porCerrarKarmico: "The account you come to settle is the {n}",
    porCerrarLema: "It is settled with the {n}",
    porCerrarLemaSinTexto: ", which is the vibration that lets you do it.",

    dondeEstas: "Where you are now",
    etapa: "{edad} years old: a stage of {ciclo}, from {desde} to {hasta}.",
    etapaFinal: "{edad} years old: a stage of {ciclo}, from {desde} onwards.",
    anioPersonal:
      "Inside it you are in year {n} of a wheel that comes round every nine. What this year asks of you is not what the next one will ask: that is why the chart gets looked at every so often, not just once.",
    turbulencias:
      "At {edad} ten choppy years begin in {tipos}: the change of path is not sudden, it brews over that decade.",

    diasFuerza: "Your days of strength",
    diasFuerzaPie:
      "The days of the month that are with you, starting with the strongest. They are the good ones for signing, starting something or deciding.",

    hilo: "The thread running through your life",
    hiloPie: "Your purpose is the {n}, and it does not change from stage to stage: it is the ground everything else happens on.",
    viveBien: "When you live it well",
    seTuerce: "When it goes wrong",

    cierre: "If you only keep one thing",
    cierreVas: "That you are heading towards {carta}",
    cierreTareaUna: ", and that the path goes through the task above, one at a time and without rushing",
    cierreTareasVarias: ", and that the path goes through the {n} tasks above, one at a time and without rushing",
    cierreSinTareas: ", and that your work is to hold on to what you already bring done",
    cierreFinal: ". None of this is closed or settled in advance: it is the map, and you are the one who walks it.",

    paraElArchivo: "Your numbers, for the record",
    numTuNumero: "Your number",
    numPorDentro: "Inside",
    numPorFuera: "Outside",
    numConsciencia: "Your consciousness",
    numPorCerrar: "Left to close",
    numConQueSalda: "What settles it",
    numHilo: "The thread running through your life",
    pieLema: "The name is the password of the soul",

    y: "and",

    empresaTitulo: "Company study",
    empValorNombre: "Value of the name",
    empValorNombrePie: "How the company vibrates",
    empEsencia: "Essence",
    empEsenciaPie: "What it came here to be",
    empEgo: "Ego",
    empEgoPie: "How it is seen",
    empCifras: "Digits",
    empCifrasPie: "The numbers in the name",
    empLetraALetra: "The name, letter by letter",
    empCaminoOrigen: "The path of origin",
    empArcano: "Arcanum {n}",
    empDiasFuerza: "Days of strength",
    empDiasFuerzaPie: "From the strongest to the least strong. For signings, openings and decisions.",
    empImportante: "What matters and should be kept in mind",
    empComoVibra: "How it vibrates",
    empComoVibraTexto: "The name adds up to {n}: that is the background tone, what the company gives off before saying anything.",
    empDentroFuera: "Inside and outside",
    empDentroFueraTexto:
      "Essence {e} and ego {g}{cifras}. The closer the two are, the more the company shows itself as it is; the further apart, the more distance there is between what it wants to be and what it looks like.",
    empDentroFueraCifras: ", plus {n} from the digits",
    empHaciaDonde: "Which way",
    empHaciaDondeTexto: "The path of origin is {carta}: the underlying direction of the project.",
    empCuandoMover: "When to move",
    empCuandoMoverTexto: "The days of strength are the {dias}. For signing, opening and presenting.",
    separadorDias: ", the ",
    empPieLema: "The name is the password",
  },

  /* --------------------------------------------------------- the full study
   * The long document, twenty-odd chapters of it. What lives here are the
   * headings, the opening lines of each chapter and the sentences that tie one
   * figure to the next — everything the program writes around the school's
   * material.
   *
   * THE SECTION NAMES carry a «·» that is not decoration: what comes before it
   * is the session, and the document only starts a fresh page when the session
   * changes. So «Session 2 · Learnings» and «Session 2 · Somatisations» have to
   * share their opening exactly, and so do «The numbers in the name» and «The
   * numbers in the name · Essence».
   *
   * GENDER: Spanish and Portuguese change the ending depending on who is
   * reading. English does not, so those lines are written once here — one form
   * that fits everybody, which is what the language actually does. */
  estudio: {
    portadaPersonal: "Personal Kabbalah study",
    portadaEmpresa: "Company Kabbalah study",
    portadaSinFecha: "Read from the name",

    secBienvenida: "Welcome",
    secArbol: "Tree of Life",
    secCaminos: "Session 1 · Paths",
    secNumeros: "Session 1 · Numbers",
    secAprendizajes: "Session 2 · Learnings",
    secSomatizaciones: "Session 2 · Somatisations",
    secAlma: "Session 3 · Image of the soul",
    secCierre: "Closing",

    bienvenidaKicker: "Your map of light",
    bienvenidaTitulo: "Welcome to your study",
    bienvenidaLead:
      "Take this study not as a rigid diagnosis but as a living guide. Kabbalah teaches us that the day and the hour you were born, together with the name {nombrado}, make up a password of your own to your highest potential.",
    bienvenidaNombrado: "you were given",
    bienvenidaHabla:
      "Everything you are about to read in the following pages is about you: about what you have already won, about what is still to wake up and about the learnings that have come to move you forward. Read it with openness, with love and with the certainty that you have the strength to transform every part of your life.",
    bienvenidaViaje: "A journey back to your essence",
    bienvenidaMapa:
      "This study is a road map for understanding the architecture of your being. Through Kabbalah we decipher the codes of your birth to give you clarity, meaning and direction: your gifts, the virtues and tools you came into the world with; your challenges of evolution, those blockages or repeating patterns turned into your greatest source of wisdom; and your purpose, the direction to point your energy in so as to live fully.",
    bienvenidaArbol:
      "The tree of life, with its ten sefirot and its twenty-two paths, is also the map of evolution travelled by the twenty-two major arcana of the Tarot: every path your soul has chosen has, on top of its kabbalistic reading, an archetypal story — that of the Fool who sets off walking and, at the end of the journey, crosses the same abyss again, only transformed. In this study you will find the two readings woven together.",
    bienvenidaCita:
      "A Kabbalah study does not foretell your destiny; it uncovers the light already living in you so that you learn to guide your own path with awareness, love and freedom.",

    arbolKicker: "Your three energies",
    arbolTitulo: "Your Tree of Life",
    arbolIntro:
      "Your soul chooses three paths on the tree of life: three energies you came to learn, to handle and to understand. The path of origin is with you from birth until your age of change, and it is what you know from other lives. The path of transformation is born and dies with you: it is your way of living. The path of destiny is where your soul wants to take you.",
    arbolEdadLabel: "Age of change",
    arbolEdadTurbulencias:
      "At {edad} ten turbulent years begin in {tipos}. You will not take the path of destiny until you are {destino}.",
    arbolEdadSinTurbulencias: "At {edad} comes the change that takes you onto your path of destiny.",

    caminosKicker: "Session 1 · Your paths",
    origenTitulo: "Your path of origin",
    origenIntro:
      "It tells you about the quality you arrive with as standard: the path of origin is what you come to remember and to share with others in this life. In your case, from birth until you are {edad}, which is your age of change.",
    transformacionTitulo: "Your path of transformation",
    transformacionIntro:
      "It is born and dies with you: it is your way of living. You should live with this leaning and act as this path tells you in any situation or conflict that comes up in your life. It will serve you well in reaching success.",
    destinoTitulo: "Your path of destiny",
    destinoIntroMismaCarta:
      "A new energy your soul wants to learn. In your case you carry it on from your path of transformation.",
    destinoIntro: "A new energy your soul wants to learn. You reach it when the moment of change arrives.",
    caminoPareja: "This path in a relationship",
    caminoEvolutivo: "The evolutionary path of {nombre} · {sendero}",

    corazonKicker: "Your soul's PIN",
    corazonTitulo: "Your heart number: {n}",
    corazonLead:
      "It is your soul's PIN number, how you vibrate. Knowing that numbers are vibration, we understand that they tell us about the energy we give off and the kind of learning we have with other people.",
    corazonCuenta:
      "It comes from the value of your name ({nombre}) plus your age of change ({edad}): {nombre} + {edad} = {total}.",
    corazonNumero: "Number {n} · {titulo}",
    corazonPartes: "In Kabbalah three-digit numbers are split two by two: {partes}",

    valoresKicker: "Your values and how you show them",
    valoresTitulo: "Essence, ego and days of strength",
    esenciaLabel: "Essence",
    esenciaSinFicha: "This number speaks of your inner values, the deepest ones.",
    egoLabel: "Ego",
    egoSinFicha: "It speaks of the connection you have with people. It is read two by two: {partes}",
    fuerzaLabel: "Strength",
    fuerzaTexto:
      "They come from the value of your name, which is the essence plus the ego: {esencia} + {ego} = {valor}, and adding up its digits, {base}. They run from the strongest to the least strong: use day {primero} of the month for signings and for whatever matters in your life, and the rest after that.",

    aprendizajesKicker: "Session 2 · Your learnings",
    estructuraTitulo: "Your energy structure: number {n}",

    aprendizajesTituloVacio: "Your learnings",
    aprendizajesVacio: "Your soul has not marked any further learnings for this incarnation.",
    aprendizajeCabecera: "Learning {portal}{veces} · {nombre} — it comes from the number {numero}",
    aprendizajeVeces: " (×{n})",
    aprendizajesTitulo: "Your learnings · {i} of {n}",
    refHiloRojo: "Red thread",
    refNeurosis: "Associated neurosis",
    refSanador: "Healing principle",

    somatizacionesKicker: "Body and emotion",
    somatizacionesTitulo: "Illnesses and weak spots",
    somatizacionesLead:
      "If you do not carry these learnings out, the energy left unworked turns into symptoms. Knowing where it shows up lets you get ahead of it and work on it consciously.",
    somatizacionesPunto: "Point {n} · {nombre}",
    somatizacionesFicha: "Psychological dysfunctions: {psico} Organs: {organos} Physical dysfunctions: {fisicas}",

    almaKicker: "Session 3 · The image of the soul",
    almaTitulo: "Your blockages and your supports",
    almaLead:
      "It tells you about every karmic process that stops you growing and moving on. It is a rucksack loaded with inherited routines, family patterns and ways of acting from other lives that you are repeating in this one. Getting to know it takes weight off it.",
    almaLabel: "Image of the soul",
    almaTexto:
      "It is the figure that opens the table: from it come the moving numbers of each square, and with them the planes you carry blocked and the supports you can count on.",
    bloqueoTitulo: "Blockage {casilla} · {i} of {n}",
    bloqueoCabecera: "{nombre}{veces} — it is formed with the number {numero}",
    bloqueoVeces: " · ×{n}",

    karmaKicker: "Open accounts and karma",
    karmaTitulo: "Your karma",
    karmaLead:
      "The open accounts are the root of the sense of guilt, where your soul feels it failed most: unresolved situations you go on carrying. Each archaic potential helps you close the open account in its row.",
    karmicoLabel: "Karmic",
    karmicoTexto: "Where your soul failed in its relationships in past lives, and what repeats in this one.",
    lemaLabel: "Life motto",
    lemaTexto: "Your soul's purpose: the vibration that lets you carry out your plan.",

    numeroEnApuntes: "{n} · {titulo}",
    numeroEnApuntesAclara: "{n} · {titulo} — {aclara}",
    numeroSinApuntes: "{n} — not in the school's notes: it is read through its parts, {partes}",
    numeroSinApuntesAclara: "{n} · {aclara} — not in the school's notes: it is read through its parts, {partes}",

    afinidadTitulo: "Your affinity numbers: {a} and {b}",
    afinidadLead:
      "They are the widest view of the chart: what you came to do in this incarnation. They go in pairs, and each one looks at half of it — the first comes from the day and the month of birth; the second, from the month and the year.",
    afinidadDiaMes: "day {dia} + month {mes}",
    afinidadMesAnio: "month {mes} + year {anio}",

    ciclosKicker: "Life cycles",
    ciclosTitulo: "Your life cycles",
    ciclosIntro:
      "Your life purpose vibrates in the {proposito}. The three great cycles — formation, evolution and harvest — and the four pinnacles set the rhythm of your life; the challenges are the frictions that fine-tune you at each stage. Your current personal year ({anioUniversal}) is the {anioPersonal}.",
    etapasTitulo: "Your nine-year stages",
    etapasLead:
      "Life is also walked in stages of nine years, each with a lesson of its own. Right now, at {edad}, you are in stage {etapa}.",
    etapaCabecera: "Stage {n} · from {desde} to {hasta} years old{actual}",
    etapaActual: " — your current stage",
    anioTitulo: "Your personal year: {n}",
    anioLabel: "Year {n}",
    anioSinTexto: "It is worked out by adding your day and month of birth to the current year.",

    resumenKicker: "Your study at a glance",
    resumenTitulo: "Your numbers, all together",
    resumenLead:
      "These are the figures everything you have just read was built on. Keep them: each one opens a different door and none of them is read on its own.",
    cifCorazon: "Heart",
    cifCorazonPie: "The soul's PIN, how it vibrates",
    cifEsencia: "Essence",
    cifEsenciaPie: "What you came here to be",
    cifEgo: "Ego",
    cifEgoPie: "How other people see you",
    cifEdadCambio: "Age of change",
    cifEdadCambioPie: "When you step onto your path of destiny",
    cifEstructura: "Structure",
    cifEstructuraPie: "The shape of your ten portals",
    cifAlma: "Image of the soul",
    cifAlmaPie: "The ten planes of consciousness",
    cifKarmico: "Karmic",
    cifKarmicoPie: "What you have left to close",
    cifLema: "Life motto",
    cifLemaPie: "The vibration that lets you carry it out",
    cifProposito: "Purpose",
    cifPropositoPie: "The thread running through your whole life",
    cifAnio: "Personal year",
    cifAnioPie: "Where you are in {n}",
    resumenCita: "May this map go with you. The light you are looking for already lives in you.",

    cierreKicker: "Before we close",
    cierreTitulo: "What matters and you should keep in mind",
    cierreLead:
      "If you only keep one page out of the whole study, let it be this one. These are the six points worth keeping in mind day to day.",
    cHaciaDondeLabel: "Which way",
    cHaciaDondeTexto:
      "Your path of destiny is {carta}. {lema} That is the underlying direction: when a decision takes you away from it, you will feel it as wear and tear.",
    cQueTrabajarLabel: "What to work on",
    cQueTrabajarNada: "You bring no portals with learning in them: your structure comes resolved and the work is to hold it.",
    cQueTrabajarUno:
      "You have {n} open learning: {lista}. They are not faults: they are the tasks you came here to do, and they are worked one at a time.",
    cQueTrabajarVarios:
      "You have {n} open learnings: {lista}. They are not faults: they are the tasks you came here to do, and they are worked one at a time.",
    cPortalSinNombre: "portal {n}",
    cQueDesatascarLabel: "What to unblock",
    cQueDesatascarNada: "No planes of consciousness are blocked: the image of the soul comes clean.",
    cQueDesatascarTexto:
      "The blocked planes are {lista}. They are the places where your energy gets stuck; recognising them is already half the job.",
    cCasillaSinNombre: "square {n}",
    cQueCerrarLabel: "What to close",
    cQueCerrarTexto:
      "The karmic number {karmico} is the account you bring from before. Your life motto, the {lema}, is the vibration that settles it.",
    cDondeEstasLabel: "Where you are",
    cDondeEstasTexto:
      "In {anioUniversal} you are in personal year {anioPersonal} of a wheel of nine, inside the cycle of {proposito} that sets your purpose. What this year asks of you is not what the next one will ask.",
    cCuandoMoverLabel: "When to move",
    cCuandoMoverTexto:
      "Your days of strength are the {dias}, from strongest to least. Keep them for signing, starting and deciding; whatever you set going on those days has the wind behind it.",
    cierreCita: "None of this is a closed destiny. It is the map; you are the one who walks it.",

    digOrigen: "Origin",
    digTransformacion: "Transformation",
    digDestino: "Destiny",
    digOrigenRango: "0 – {edad} years",
    digTransformacionRango: "your whole life",
    digDestinoRango: "from {edad} on",
    digEje: "Axis",
    digPlano: "Plane",
    digEnTension: "under tension",
    digLibre: "free",
    digEspiritu: "Spirit",
    digAlma: "Soul",
    digMateria: "Matter",
    digEvolucion: "Evolution",
    digProyeccion: "The 0 falls in square {n}: that is what you project to other people.",
    digDia: "Day",
    digMes: "Month",
    digAnio: "Year",
    digCuenta: "Account",
    digKarmico: "Karmic number of relationships",
    digLema: "Life-motto number",
    digSanador: "Healing-effect number",
    digAfinidad: "Affinity number",
    digVibraciones: "Body / soul / spirit vibration",
    digRango: "{desde} – {hasta} years",
    digRangoFinal: "from {desde} years on",
    digRangoAbierto: "from {desde} on",
    digRealizacion: "Pinnacle {n}",
    digDesafios: {
      "Primer desafío menor": "First minor challenge",
      "Segundo desafío menor": "Second minor challenge",
      "Desafío mayor": "Major challenge",
    },
    digRangosDesafio: {
      "hasta los 42 años aprox.": "until about 42",
      "de los 42 años en adelante": "from 42 onwards",
      "toda la vida": "your whole life",
    },
    sefirot: {
      Keter: "Kether",
      Hokmah: "Chokmah",
      Binah: "Binah",
      Jesed: "Chesed",
      Gevurah: "Geburah",
      Tiphereth: "Tiphereth",
      Netsaj: "Netzach",
      Hod: "Hod",
      Yesod: "Yesod",
      Malkut: "Malkuth",
    },
    digEnNegativo: "In the negative",
    digEnPositivo: "In the positive",
    refTensa: "What tightens you · {n}",
    refLibera: "What frees you · {n}",
    refSinFicha: "It is read by splitting it two by two.",

    empSecNumeros: "The numbers in the name",
    empSecEsencia: "The numbers in the name · Essence",
    empSecEgo: "The numbers in the name · Ego",
    empSecOrigen: "The path of origin",
    empNombreKicker: "The company's name",
    empNombreTitulo: "What this name says",
    empLead:
      "Kabbalah reads a name as a password: each letter has a value, and the sum of them all says how whatever that name stands for vibrates. {nombre} adds up to {n}.",
    empSoloNombre:
      "This study is made from the name alone. For a person we also read the energy structure, the planes of consciousness, the open accounts and the life cycles, but all of that comes out of the date of birth; a company has none, and what cannot be worked out is not made up. What follows is, in full, what the name says on its own.",
    empCifValor: "Value of the name",
    empCifValorPie: "How the whole company vibrates",
    empCifEsencia: "Essence",
    empCifEsenciaPie: "What it came here to be, in the vowels",
    empCifEgo: "Ego",
    empCifEgoPie: "How it is seen, in the consonants",
    empCifCifras: "Digits",
    empCifCifrasPie: "The numbers the name carries",
    empCifOrigen: "Path of origin",
    empComoSeCuenta: "How it is counted",
    empCuenta:
      "The value of each letter is added up: {palabras}{total}. The vowels on their own give the essence, {esencia}; the consonants, the ego, {ego}.{cifras}",
    empCuentaPalabra: "{palabra} is worth {n}",
    empCuentaSeparador: "; ",
    empCuentaTotal: ", and {n} in total",
    empCuentaCifras:
      " And if the name carries numbers, they count for what they are worth: here they add up to {cifras}. A number is neither a vowel nor a consonant, so it goes on its own, and the value of the name is the sum of the three: {esencia} + {ego} + {cifras} = {valor}.",
    empValorKicker: "Value of the name",
    empValorTitulo: "The {n}: how it vibrates",
    empValorTexto:
      "It is the number of the whole company, the sum of all its letters. It sets the background tone of what it does and of how it is seen.",
    empEsenciaKicker: "Essence",
    empEsenciaTitulo: "The {n}: what it came here to be",
    empEsenciaTexto:
      "It comes from the vowels alone. It is the project's inner drive: what it leans towards when nobody is looking.",
    empEgoKicker: "Ego",
    empEgoTitulo: "The {n}: how it is seen",
    empEgoTexto:
      "It comes from the consonants alone. It is the face the company turns outwards: what clients and suppliers pick up before dealing with it.",
    empArcanoKicker: "Arcanum {n}",
    empOrigenLabel: "Origin",
    empOrigenCuenta:
      "It is taken from the value of the name: {valor} minus the sum of its digits ({sumaCifras}) gives {resta}, which divided by nine is {division}, plus one, {mas1}. Reduced to the twenty-one arcana, the {arcano}.",
    empOrigenNota:
      "In a person this is the first of three paths — origin, transformation and destiny — but the other two rest on the age of change, which comes out of the date of birth. A company has only this one, and that is why it weighs so much: it is the whole arc of the chart.",
    empCierreKicker: "Before we close",
    empCierreTitulo: "What matters and should be kept in mind",
    empCierreLead:
      "If only one page of the whole study is kept, let it be this one. These are the four points worth keeping in mind.",
    empCVibraLabel: "How it vibrates",
    empCVibraTexto: "The name adds up to {n}. That is the background tone: what the company gives off before saying anything.",
    empCDentroFueraLabel: "Inside and outside",
    empCDentroFueraTexto:
      "The essence is {esencia} and the ego {ego}. When the two are alike, the company shows itself as it is; when they pull far apart, there is distance between what it wants to be and what it looks like, and that distance is paid for in trust.",
    empCHaciaDondeLabel: "Which way",
    empCHaciaDondeTexto: "The path of origin is {carta}. {lema} That is the underlying direction of the project.",
    empCCuandoMoverLabel: "When to move",
    empCCuandoMoverTexto:
      "The days of strength are the {dias}, from strongest to least. Keep them for signing contracts, opening and presenting.",
    empCierreCita: "The name is the password: what is named well holds up.",
  },

  /* ------------------------------------------------------------- the arcana
   * The name is the English one for that card, not a translation of the
   * Spanish. The text is the school's lecture notes as they stand: telegraphic,
   * with the sefirot and the paths of the Tree of Life running through them.
   * Only the opening reaches the company sheet, and that is what is translated
   * here.
   *
   * Sefirot are spelled the English way — Kether, Chokmah, Binah, Chesed,
   * Geburah, Tiphereth, Netzach, Hod, Yesod, Malkuth. Spanish writes J where
   * English writes Ch (Jesed / Chesed, Jokmah / Chokmah, Netsaj / Netzach).
   */
  arcanos: {
    0: {
      nombre: "The Fool",
      lema: "Energy of fiery, spontaneous consciousness",
      texto:
        "The 0: everything is open, anything can happen. Inspiration from God, spark, spontaneity. In some decks the figure is a jester, the only one allowed to laugh at the king. Your law of mentalism is the one that decides whether I listen or not. A chance to begin something. The law of mentalism.",
    },
    1: {
      nombre: "The Magician",
      lema: "Conscious energy of good will",
      texto:
        "The four elements: Swords: mind = air. Wands: earth. Coins: money = fire. Cups: emotions = water. Kether–Binah. You can create, but not constantly. Self-realisation. All that is above is below, all that is below is above. Plain conscious energy of the will. To create.",
    },
    2: {
      // The card is «The Papess» in the Marseille line and «The High Priestess»
      // in Rider-Waite. The school's Spanish name —«La Suma Sacerdotisa»— comes
      // from the second one.
      nombre: "The High Priestess",
      lema: "Energy of consciousness of denial",
      texto:
        "Black pillar B = Binah (Neptune). White pillar J = Yesod (Moon). Wisdom. II = twice God. Mother / Father = duality. The keeper of the doors: she gives you access to other planes of consciousness, but not 24 hours a day. Astral travel. We have to be able to set priorities, to choose which matters more.",
    },
    3: {
      nombre: "The Empress",
      lema: "Energy of illuminating consciousness",
      texto:
        "Binah–Chokmah. Cosmic current, it is Yin / Yang. 3 = the Son = Life. Expresses what she knows. 12 stars in the crown = 12 months, 12 signs of the zodiac… 12 = 2+1 = 3. The mother. People of closeness, they need to be face to face with everyone else. She bears fruit talking with others and others with her.",
    },
    4: {
      nombre: "The Emperor",
      lema: "Constituting conscious energy",
      texto:
        "Masculinity, animal instinct. 4: matter, earth, the most essential. These people have to draw up their own constitution, secure their principles (their Sun). They will have people around them who make them doubt, so that they discover their principle. Path 15. Spirit – Mind connection.",
    },
    5: {
      // «The Pope» in the Marseille line, «The Hierophant» in Rider-Waite. The
      // school's Spanish name —«El Sumo Sacerdote»— is the Hierophant line.
      nombre: "The Hierophant",
      lema: "Energy of consciousness of lived religion",
      texto:
        "5: Soul. Looks for something deeper. Inner strength (great strength). Kindness. Is clear that they have to reconnect with their inside. Looks for experiences outside, but I must let things happen (yin). Wants no impositions or dogmas. Takes religion its own way. Where there are impositions, it goes badly.",
    },
    6: {
      nombre: "The Lovers",
      lema: "Energy of consciousness of magnetic attraction",
      texto:
        "Binah–Sun (ascending path). 6: a number of tension. Has great psychic strength. Law of Attraction. They have charm by nature, a lot of pulling power. When they are in a bad way, they attract what is bad. Power of attraction, people with charm. «As it is inside, so it is outside». Path 17. Yang path.",
    },
    7: {
      nombre: "The Chariot",
      lema: "Conscious energy of influence without violence",
      texto:
        "Geburah–Binah (ascending direction). Working with the 7 chakras, 7 laws, 7 days of the week. The 7 is a number of action. Active. Yang path. They must be very careful with Mars, the God of War. They want to have an influence on others, they have the strength to pull them along.",
    },
    8: {
      nombre: "Justice",
      lema: "Path of consciousness of spiritual justice",
      texto:
        "«As you sow, so shall you reap». Very much a righter of wrongs, cannot stand injustice. Geburah–Chesed. Current of cosmic force – Yin / Yang. Sowing in order to start reaping. They have plenty of strength and spiritual help. It will fall to them to defend someone weaker. They need a lot of enthusiasm.",
    },
    9: {
      nombre: "The Hermit",
      lema: "Conscious path of goal programming",
      texto:
        "Chesed–Tiphereth. A path into the inside of the Yin, inwards. 9: the highest wisdom. Wants to go to the wisest part of the inside, programmed to look for God because they know that is what lights their path. «God's trust is my staff» – Full trust. They look for solitude.",
    },
    10: {
      nombre: "The Wheel of Fortune",
      lema: "Conscious path of reward",
      texto:
        "10: God leaves everything open. The number of spiritual mobility. The principle of spiritual searching. Chesed–Netzach. Go past your limits = let go, come away. A wheel that never stops, everything comes back. Law of rhythm: we have to know the vibrational frequency of our thoughts. «Law of vibration».",
    },
    11: {
      nombre: "Strength",
      lema: "Conscious energy of inner strength",
      texto:
        "Geburah–Tiphereth. 11: 2 times God = double strength. Strength born from within, security. Full confidence in oneself, feeling alive and connected with oneself. Maturity. They have to be aware of their power in order to transmute it, to have strength enough to master situations.",
    },
    12: {
      nombre: "The Hanged Man",
      lema: "Conscious energy of perseverance",
      texto:
        "Geburah–Hod (descending). Goes against the established, is able to light up (bright head). Needs to find something, knows it has to go through a sacrifice or a struggle. 12 – 3 – Thanks to a sacrifice it is able to understand something. 3 = mother, father and son. I need to come out, to be born.",
    },
    13: {
      nombre: "Death",
      lema: "Consciousness of transformation",
      texto:
        "Tiphereth–Netzach. Yin-passive movement. They do not get attached to anything. They are changing all the time, they have to learn. Archangel Raphael. Constant death and renewal. Break – die – transcend. The soul wants to live its creative force (Sun) and a varied, exciting life; they cannot bear monotony.",
    },
    14: {
      nombre: "Temperance",
      lema: "Conscious energy of flexible government",
      texto:
        "Communication between the unconscious and the conscious. Energy of communication. Power of communication. Tiphereth–Yesod. They are leaders. High spiritual current. They can bring stability and reconciliation with those around them. We should flow; she is surrounded by water. Born to communicate.",
    },
    15: {
      nombre: "The Devil",
      lema: "Conscious energy of renewal",
      texto:
        "Tiphereth–Hod. An active path: if it looks, it will find the Sun. The darkest part of a person is part of us. A fear can enslave you, it is darkness. They need to draw the devilish out of their thoughts. They have to take out the negative; if they manage it, they react and can become great.",
    },
    16: {
      nombre: "The Tower",
      lema: "Conscious energy of enthusiasm",
      texto:
        "Hod–Netzach. A lot of energy, Yin-Yang, and you have to know how to use it. A path of enthusiasm and constant renewal. Spiritual motivation. Motivation to be of use to ourselves. They are highly motivated, they can pass it on and encourage others to grow. To help. It brings people together.",
    },
    17: {
      nombre: "The Star",
      lema: "Energy of cosmic nature",
      texto:
        "Water = emotions. Yesod–Netzach, ascending direction. To light up and understand, to see beyond worldly eyes. Looking further. Wisdom, trust, beginning, joy, the cosmos, fertility, creativity, altruism. Trust in the future, feeling fresh and young.",
    },
    18: {
      nombre: "The Moon",
      lema: "Conscious energy of purification",
      texto:
        "An old soul, not for having lived a long time but for having had many learnings. In a great hurry, the sense that there is something they have to do. They need earth learnings, with roots. It has to do with the unconscious. They have to come away from everything they have lived to be aware of their situation.",
    },
    19: {
      nombre: "The Sun",
      lema: "Conscious energy of collectivity",
      texto:
        "Yesod–Hod. Wants what is good for the family, for the community. They suffer when there is division. Light, day, childhood, success, health, energy, family… A path of much light. A path of groups; it is good for them to do things in a group. They want to rest with souls, to feel that connection. They come to unite.",
    },
    20: {
      nombre: "Judgement",
      lema: "Conscious energy of revival",
      texto:
        "Hod–Malkuth path. Helps people to rise. An old soul. They come to help close karma. They are in a great hurry, they have something very specific to learn. They go through hard situations and have to free themselves by bringing order to them. Freeing situations actively. Freeing the chaos.",
    },
    21: {
      nombre: "The World",
      lema: "Conscious energy of true success in life",
      texto:
        "Malkuth–Yesod. Feet on the ground. An old soul. The four figures = the four evangelists. Everything I want to achieve, I am going to achieve. Laurel = triumph in love, money… The number 4 = it is magic for bringing matter into my life. Example: 4 laurel leaves.",
    },
  },

  /* ------------------------------------------- what each digit says, 0 to 9
   * Any number is read from here: it is split into its digits and what each
   * one says is joined up. */
  numerologia: {
    0: { pos: "Spiritual rescue. Searching, taking a risk.", neg: "Blockage, stagnation, neglect. I do not know what to do." },
    1: { pos: "Spiritual life. Faith. God, action in matter.", neg: "Distrust, insecurity, denial of the spiritual." },
    2: { pos: "Unconditional love. Tolerance, flexibility.", neg: "Mental rigidity, dogmatism, duality, logic." },
    3: { pos: "Fertile life and deeds, abundance, I share my gifts.", neg: "Negativity, mental blockage, denial of my essence." },
    4: { pos: "Fulfilment in matter, acceptance of the world.", neg: "Fears in matter, rational limitation, material scarcity." },
    5: { pos: "Self-acceptance, self-esteem.", neg: "Identity crisis, low self-esteem, easily influenced." },
    6: { pos: "The right spiritual focus in matter, I accept my part.", neg: "Selfishness, attachment to matter, tension." },
    7: { pos: "Awareness, refinement, esotericism, healing.", neg: "Superficiality, I do not accept my darkness." },
    8: { pos: "Self-responsibility, freedom and harmony.", neg: "Fears, lacks, slavery, dependencies." },
    9: { pos: "Inner certainty, wisdom. Listening to the heart.", neg: "Self-demand, control, self-sabotage, dictatorship of the mind." },
  },

  /* ------------------------------------------- the type of structure, 2 to 10
   * Only the opening of each one reaches the sheet. */
  estructuras: {
    2: "To begin with they will distrust people. They want all or nothing, and half measures are no use to them.",
    3: "At certain moments they can feel that they do not fit on this earth, but it is they who feel that way. Great inventors, because they have a lot of creative energy and are co-creators.",
    4: "They come to clear karma, through communication; they need to free themselves from old ties, from slavery, and that is why they are free spirits. This structure carries the energy of luck.",
    5: "These structures have the number of the Messiah; they want to take Jesus as an example for their lives. They wish to live God as he did: love your neighbour as yourself.",
    6: "The divine has great force in their life. Their soul wants them to try, to experience strength and steadiness, to put themselves to the test.",
    7: "They demand a lot of themselves, trying to do everything perfectly. Matter matters to them, because what they have they give away in order to help.",
    8: "Temptation: this is the structure of temptation. They have to show which way they decide to lean in this life, to live being open to decisions.",
    9: "A great capacity to love, very open to new possibilities. Their structure carries the Essene motto. TO HELP, TO TEACH AND TO HEAL. , where am I going?",
    10: "A great capacity for telepathy and for reading thoughts. God has many forms, is everywhere, God is free.",
  },

  /* ---------------------------------------- the ten portals of learning
   * `comoSeTrabaja` is what the notes put after the dash: the remedy for the
   * task. In Spanish the line starts by repeating the name of the task and the
   * program cuts it off; here it comes already cut. */
  tareas: {
    1: {
      nombre: "Universal union",
      comoSeTrabaja:
        "Developing an existential awareness of life. What is the meaning of existence? What is the meaning of life? «I let who I am flow». I take responsibility for my actions and develop inner certainty.",
    },
    2: {
      nombre: "Loving instead of wanting to be right",
      comoSeTrabaja:
        "Developing the attributes of the giver and connecting ourselves with divinity and universal love. «I am part of the Father and his creative power is in me». Love from non-attachment.",
    },
    3: {
      nombre: "Positive decisions",
      comoSeTrabaja: "Learning to work together through my fertile deeds: «I know what to give» and I find my place in the world.",
    },
    4: {
      nombre: "Expressing your own essence, self-recognition",
      comoSeTrabaja:
        "There are no 2 souls alike. We are bound to be authentic and to leave our mark on the world. Developing emotional intelligence as the ground for working from love and compassion. «Power in the service of love».",
    },
    5: {
      nombre: "Being unique and special",
      comoSeTrabaja:
        "Learning to live by my truth, whoever it upsets. I am perfect for reaching my purpose. There is nothing wrong with me.",
    },
    6: {
      nombre: "Joy of living",
      comoSeTrabaja:
        "How do I behave in this world? Learning to have the right spiritual focus in matter through my outer ego. Getting out of the trap of material and emotional lack. Developing a fertile ego.",
    },
    7: {
      nombre: "Reconciliation with divine creation",
      comoSeTrabaja: "Accepting the fact that this is the «perfect» place to develop my purpose.",
    },
    8: {
      nombre: "Force of unification",
      comoSeTrabaja:
        "Personality and inner ego (how I rate myself). Making peace in my relationships through empathy. Developing inner peace by taking on my soul's plan. Cultivating non-attachment to the material as part of the fuel of my ego. Energetic discipline and protection from the astral.",
    },
    9: {
      nombre: "Clear perception. Empathy.",
      comoSeTrabaja:
        "I find the capacity to determine myself and I get my personal power back by opening myself to the power of love. Being honest with my essence in order to open up to intuition, love, inner truth. All the guidance you need you carry inside. Who am I?",
    },
    10: {
      nombre: "Force of completion. The profession.",
      comoSeTrabaja:
        "The force of determination to manifest my gifts and God's will through me. I live my calling as a co-creator.",
    },
  },

  /* ------------------------------------- the ten planes of consciousness
   * The name is kept short on purpose: the section heading already says these
   * are forms of consciousness. Only the opening of the text reaches the sheet. */
  planos: {
    1: {
      nombre: "Spiritual Consciousness",
      texto:
        "In this matrix the 1 is the highest point, the point above. It is spirit over spirit. Here everything relates to the 7 cosmic laws. It does not matter what happens to us, it does not matter what we achieve, it does not matter how much dedication we put in.",
    },
    2: {
      nombre: "Causal Consciousness",
      texto:
        "The first thing this plane teaches us is self-responsibility. I have to be willing to accept responsibility for my life, for myself. I have to take the reins of my life.",
    },
    3: {
      nombre: "Activation",
      texto:
        "Spiritual-mental plane: finding the path of my existence, deciding and finding motivation for myself; that is deciding for me, for my life, for my joy. An impulse for change, it is the energy of getting myself going.",
    },
    4: {
      nombre: "The Subconscious",
      texto:
        "This plane is about the unconscious things in my personality, that is, everything we have inside us without knowing it. They are the capacities I do not yet hold consciously.",
    },
    5: {
      nombre: "Self-Consciousness / Consciousness of the Soul",
      texto:
        "Awareness of our divine being, of the part of divinity there is in us. The soul is called the Higher Self and has nothing to do with your material side. Your Lower Self has a first name by which you are known.",
    },
    6: {
      nombre: "Ego",
      texto:
        "We have to take into account how much influence the ego has on us, because it is here that the soul meets matter, even though the soul cannot be seen. There are times when we show a front that does not match our inner personality.",
    },
    7: {
      nombre: "Reality",
      texto:
        "This is where thoughts of lack are generated, to do with our body, with our capacities in general, with money, clothes, the car… For example: thinking of buying a big car because the neighbour has a big car too.",
    },
    8: {
      nombre: "Emotions",
      texto:
        "We need our feelings, but we have to respond to them with coherence, control and balance, because feelings are part of our emotional body, and losing control over them creates a feeling that can contaminate our growth.",
    },
    9: {
      nombre: "Mentality",
      texto:
        "Consciousness of mentality is the same as opinion. This plane stores the sum of our opinions, opinions gathered across all my incarnations. Having opinions about life, about some of its subjects, is the most normal thing.",
    },
    10: {
      nombre: "Transformation / Field of Evolution",
      texto:
        "Developing spiritual mobility, or spiritual flexibility. Consciousness of transformation means that the first thing I need is mental and spiritual flexibility. I have to be able to move mentally and spiritually.",
    },
  },

  /* The cycles and the turbulences go inside a sentence, in lower case:
   * «a stage of harvest», «ten choppy years in spirit and soul». */
  ciclos: { "Formación": "formation", "Evolución": "evolution", "Cosecha": "harvest" },
  turbulencias: { "Espíritu": "spirit", "Alma": "soul", "Materia": "matter" },

  /* ------------------------------------------ the numbers in the school's notes
   * The account carried over (the karmic number) and what settles it (the
   * motto of life). Only the opening of each entry reaches the sheet, and that
   * is what is translated here; the rest of the note stays in Spanish inside
   * Iris's own working document, which is where it is used.
   *
   * A few entries start mid-sentence or with a stray dash: that is how the
   * original reads — it was pulled out of the manuals — and it is kept. */
  numeros: {
    10: "Our original principle affects our divine part; the zero that appears in second place is the original principle and the 1 is our divine part.",
    13: "Cosmic number of light, decision and new beginning. New opportunities, sailing towards new ports. Giving yourself over to new things and pushing myself.",
    14: "Here the 4 heads towards the 1, that is, man in matter heads towards his divine part. Number of love for one's neighbour. Thinking of others. This calls for my spiritual balance.",
    15: "Every human being is my training partner. Enrichment from every experience. Cosmic law of resonance.",
    16: "It is a number of tension; with this number I have spirit and matter set against each other: if I cannot carry out my spiritual work in matter, I am going to get tense.",
    17: "What is good, what is beautiful and what is noble. Looking at the beautiful and good side of things. Not always looking for the hair in the soup. Applying the functions of the 7 chakras in a positive way.",
    18: "Temptation. As above, so below. Cleaning the subconscious, trying to recognise my reactions in order to improve myself. Why do I repeat the same mistakes and the same patterns?",
    19: "The number of healers. Helping, teaching and healing. But first we have to bear in mind that we have to heal ourselves too. Spiritual progress, being at peace with my soul.",
    20: "Once again the zero leaves everything open so that it can have an effect on us. We doubt whether we could really have so many possibilities in front of us.",
    21: "God's presence comes towards us; being aware that God is always present. But this does not mean that he has to do the work for us.",
    22: "22 paths of initiation on the tree of life. With the wisdom of these 22 paths of initiation I can find the solution to my worldly problems.",
    24: "Bearing in mind that matter is not all there is. That when we do not do things well, as a consequence we meet results that are not pleasant for us.",
    25: "If this number is carried well, it brings us joy and happiness in personal relationships. That goes on generating good luck and satisfying results.",
    35: "Looking at our negative attitudes on certain points: money, health, love, and so on. A positive attitude towards the fear of seeing the future as uncertain, not saying: «I can't».",
    37: "Bearing in mind that life is full of possibilities, not sitting around waiting too long and accepting what life brings; why wait any longer.",
    38: "Important decisions for me, how to organise myself well so as to have time for myself.",
    39: "When there is a feeling that a decision weighs heavily — for example, leaving a job, a relationship, moving country, and so on.",
    40: "We have to react irrationally. The part that is schooling or influence is not there; we have to step out of the square and out of what is imposed.",
    41: "A lot of people do not start new things out of fear of the beginning; above all they think that every beginning is very hard. So they put off what God wants for them, because of that negative thought.",
    42: "I give love and expect nothing back. This number of unconditional love speaks of being open-handed, generous, and of not being afraid that if I give I may be left with nothing.",
    43: "New paths, not being afraid of the new and above all of being the first to try it. Getting out of monotony and being able to work my brain so it does not fall asleep.",
    44: "Not being afraid of myself and being able to let others really see you, baring the soul. Another number of great strength, since I have to express myself, that is, just as I am.",
    45: "My soul wants to express itself closer and closer and I have to make room for it from my most material side. If I listen to my soul, it will tell me where I should head and what my qualities are.",
    46: "Being delicate, gentle and loving, having empathy and not getting tense. Try to make others understand and grasp what you want to get across to them, however hard that is.",
    47: "Going through experiences until one has understood. I want to resolve my learning processes in this life.",
    48: "Putting my spiritual freedom into action. We belong to nobody and we are all free; even our children are not ours.",
    49: "Not making excuses when I know what I ought to do and do not do it, because I say «I can't do it right now».",
    50: "The soul wants to show itself, and it is the soul that wants to prevail over the body, over the confused mind.",
    51: "Balancing justice: I have to accept my dark side, because only then will I be able to clean and work my sides so that my soul can reach God.",
    52: "I have to forget the wounds, what has hurt me.",
    53: "The number of salt, the «salt of life». Teaching without pride, and being able to be willing to learn from others. Do good and do not let others praise you, and do not boast about being the best.",
    54: "The soul suffers when we act only through matter, but it has to reach its destination in spite of the obstacles.",
    55: "The answers are inside me. A number of strength and of luck. The strength does not come from God, nor from my human part: it comes from my soul.",
    56: "I need to find the balance between my Yin side and my Yang side in order to take the tensions out of my body; those tensions limit my soul's ability to act in my processes.",
    57: "Working with the 7 chakras, understanding the emotions behind them. Being well means having an influence on other people.",
    58: "How I come to feel my soul depends on me, but I have to take out the things that limit me so as to feel free. Fears limit us and stop us feeling the soul's messages.",
    59: "The prophet is inside me; careful with self-inflicted prophecies.",
    60: "Living the longing to return to God. At some point this number touches all of us; a moment comes when we have to feel that longing.",
    61: "I AM WHO I AM. The 1 goes towards the 6, God draws near. The one brings balance to the six; balance means that the divine forces are heading my way and want to have an effect.",
    63: "The 3 begins to be a son, it speaks to us of the son. Not getting tense. The best alternative decides; there are alternatives, but I must not get tense. Choose what is best for you.",
    64: "Through matter I have an effect on myself and on others. Exercising power, bringing matter to my body and not getting tense about the physical things of the body and of matter. Acting with compassion.",
    65: "Five: the soul comes closer to my matter to relax me, to enter me completely with its influence.",
    66: "they can also be emotional attachments. When I evolve spiritually, matter comes on its own. I cannot look for my joy of living only in material things.",
    67: "The number of testing, of distrust. If my distrust is big enough I stay stuck in checking, and that means I end up distrusting from the outset.",
    68: "The number of stubbornness. We find it hard to see what is real in us because we are afraid. Looking at my fears and working on them.",
    69: "I need my wisdom especially in very hard and very tense moments. Making the effort to see what is really happening in those difficult moments or situations.",
    70: "Our original principle affects our divine part; the zero that appears in second place is the original principle and the 1 is our divine part. «I have plenty of chances of reaching perfection with that learning».",
    71: "I am already perfect, let God come. They have been close to Jesus. Trusting that the psychic forces are inside me. Trust, security.",
    72: "Applying wisdom through reason, which would be the corresponding cosmic law. I have to try to apply the spiritual laws in my life. Wisdom and reason.",
    73: "The number of decisions full of wisdom. Bring the irrational side into your decisions. This number is in direct contact with the tree of life.",
    74: "Learning through the experience of life: from experience we know our limit, and what we cannot control. They have to handle money, matter.",
    75: "Happiness and luck. My soul wants to reach my being and fill it so that I can reach my perfection and my union, soul and being. Accepting myself. Sometimes they need space and solitude.",
    76: "Here we have to catch it ourselves before we can pass it on to others. If I find balance in certain situations in my life, then I reach, or come closer to, my 7, my perfection.",
    77: "of energy and of spirit. These people feel everything with more and more urgency. This number is the perfect vehicle of the spirit. A concrete state of wisdom.",
    78: "We are back with spiritual freedom. Applying your capacities consciously, so as to reach your perfection step by step. Do what you believe is important for you.",
    79: "I do not have to use violence, nor speak with violence. I do not have to fight for my rights; it is enough to know that I am right. Accepting myself with wisdom and understanding.",
    80: "The 80s have to do with spiritual freedom, or with testing one's own freedom. If it shows up, our spiritual freedom was cut off in another life (God could not be spoken of).",
    81: "The number of liberation. This is like a call to God. God helps me and frees me from my fears and from all the nonsense I think.",
    82: "Calling one's own state into question.",
    83: "The number of the Messiah, or to put it another way, the miracle of prayer.",
    84: "Actions have an effect on my spiritual freedom, material decisions. What must I do in order to be free? Not getting attached, but enjoying matter. Money does not set you free, but it calms you down.",
    85: "If I believe in the soul and I cannot reach it, it cannot guide me.",
    86: "freedom. Getting past the obstacles, daring to do new things. It is 2/43, which is the number of the pioneer, walking new paths. The 3 is decision and the 4 is matter, and the 86 is a higher energy.",
    87: "It is a healing number just like the 19: helping, teaching and healing. A spiritual labyrinth. My freedom is cut off because I cannot see the way out. They need to get themselves out of their labyrinth and to get others out.",
    88: "Other people's freedom and one's own. Do not overdo spiritual freedom or you turn into an illusionist, that is, do not become someone who lives permanently among illusions.",
    89: "If we limit ourselves just when things get hard, then the problems come; I limit myself.",
    90: "With the 90s wisdom goes first. Understanding all the definitions of all the original principles from 1 to 8 and using them properly. The demand of not wanting any compromise.",
    91: "We are not only a part of the Universe; we are also built into the Universe.",
    92: "People who have a very great potential, but have it asleep. Worse if they know they have it but deny it. Intelligent people who do not know what to do with so much intelligence.",
    93: "lead me to experience my inner wisdom. Higher wisdom if I trust in God.",
    94: "many experiences in matter in order to reach wisdom. Falling flat on your face over and over is called the turn of the fallen; it is like trying to go through a wall head first.",
    95: "The soul is at stake. The motto of the Essenes matters here. A person grows out of their wisdom, guided by their soul.",
    96: "Using Yin and Yang courageously leads me to wisdom, and Yin and Yang always in harmony. Tension teaches me that there is something in me that is not right. Taking the tension away with my wisdom.",
    97: "With your human perfection you have to reach your wisdom. That wisdom has been in you for a long time and now the question is: when is someone really a Master? The 97 is an important point.",
    98: "The Cosmos is infinite, and therefore knowledge about the Cosmos is infinitely great too, whatever my definition of a Master may be.",
    99: "It is about getting past temptation (egos-attachments). In life nothing is a temptation for me, I know exactly the situation I am in now.",
    100: "Being twice the 50, the definition of the 50 is taken.",
    101: "The number of sanctification. It is about healing the inside, becoming a Saint or being sanctified. There is something in the subconscious that needs healing.",
    102: "They are the discoverers and the co-creators. There are people who, whatever the subject, always discover something new.",
    103: "The number of the dissolution of the negative. It is not enough only to criticise, nor is it enough to stop criticising at some point: the task is achieved by doing something positive.",
    104: "the so-called cold technician or technocrat. The number of the cold technician.",
    105: "Priestess. Having a sanctifying effect (through religion). This sanctifying effect does not hold for one person only but for many.",
    106: "Motivators, encouragement, «salt of life», good at teaching.",
    107: "This person is going to find their calling in the field of therapy; what form those therapies take is something that person will have to discover for themselves, that is, this person first has to find out for themselves what healing is.",
    108: "The esoteric number. It is the number of the Holy Spirit. It is the so-called «angle of the pentagram».",
    109: "The number of telepathy. You have to be very responsible with telepathy, not influencing others without permission.",
    111: "The 111 would correspond to the root chakra. It is 3 times the 37. A lot of God's strength. Things that God wants are going to happen.",
    112: "We have said here that the 47 is the number of Karma, and I have also told you that there is a bigger number of Karma, which is the number 199; with this number you really do get into the subject.",
    123: "Wherever the 123 shows up there are karmic processes, but you only manage to resolve them if you have a Yin orientation, taking an attitude of receptiveness and acceptance instead of trying to force things or take drastic measures.",
    157: "This gives charisma; there is a corresponding path on the tree of life for it too, and we can perceive that charisma because the etheric body gives off an energy of positive success; this lies in the fact that point 1 is lived religion.",
  },
};
