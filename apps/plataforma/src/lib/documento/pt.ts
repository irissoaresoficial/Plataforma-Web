/**
 * PORTUGUÊS — o documento que se entrega, em português.
 *
 * PORTUGAL, NÃO BRASIL. A clientela portuguesa de Iris está em Portugal, e as
 * duas normas separam-se justo onde este documento vive: o tratamento («tu» e
 * não «você»), a colocação do pronome («fazem-se», e não «se fazem»), o
 * gerúndio, e palavras de todos os dias — «ecrã», «casa de banho», «apelido».
 * Se algum dia pesar mais o Brasil, muda-se este ficheiro e o `locale` de
 * baixo; o resto da plataforma não se toca.
 *
 * COMO SE LÊ ISTO
 *
 *   · `hoja` são as frases da própria folha: os rótulos e as explicações. Estão
 *     escritas para quem não estudou Kabbalah — diretas, concretas, sem
 *     misticismo. Se uma frase soar solene, está mal traduzida ainda que esteja
 *     correta.
 *   · o resto são OS APONTAMENTOS da escola. Aqui a tradução diz exatamente o
 *     mesmo que o original, nem um matiz a mais nem a menos.
 *
 * OS NOMES DOS ARCANOS NÃO SE TRADUZEM: usam-se os que essa carta já tem em
 * português. «El Carro» é «O Carro», e «El Ermitaño» é «O Eremita», não «O
 * Ermitão». Onde a tradição portuguesa tem dois nomes correntes para a mesma
 * carta, ficou o da linha a que pertence o nome espanhol da escola, e está
 * anotado ao lado para a Iris decidir.
 *
 * Para corrigir uma frase: procura-se a linha, muda-se o texto entre aspas e
 * já está. As chaves —`{edad}`, `{n}`, `{lista}`— são buracos que o programa
 * enche com os dados; têm de ficar tal como estão.
 */
import type { Diccionario } from "./tipos";

export const PT: Diccionario = {
  codigo: "pt",
  locale: "pt-PT",

  hoja: {
    subtitulo: "O teu estudo numa folha",

    comoEres: "Como és",
    porDentro: "Por dentro",
    porDentroPie: "O que vieste ser, quer o vejas quer não.",
    porFuera: "Por fora",
    porFueraPie: "O que as pessoas veem de ti.",

    tuCamino: "O teu caminho",
    tuCaminoPie: "Três troços que andam ao mesmo tempo; o que muda é quanto pesa cada um.",
    origenTitulo: "De onde vens",
    origenQue: "O que já sabias fazer quando chegaste",
    origenCuando: "até aos {edad}",
    transformacionTitulo: "Como atravessas a vida",
    transformacionQue: "A tua maneira de estar no mundo",
    transformacionCuando: "sempre",
    destinoTitulo: "Para onde vais",
    destinoQue: "O sítio para onde a vida te leva",
    destinoCuando: "a partir dos {edad}",

    loQueTrabajas: "O que vieste trabalhar",
    loQueTrabajasPie: "Não são defeitos: são as tarefas desta vida, e fazem-se uma de cada vez.",
    sinTareas: "Nenhuma por fazer: o teu trabalho é sustentar o que já trazes feito.",

    loQueTeFrena: "O que te trava",
    loQueTeFrenaPie: "Os sítios onde a energia te fica parada. Vê-los já é meio caminho andado.",
    sinFrenos: "Nada te fica parado: a energia circula-te limpa.",

    yaHecho: "O que já trazes feito",
    yaHechoNada: "Está tudo por trabalhar nesta vida.",
    yaHechoTexto:
      "{n} dos dez pontos da tua carta vêm resolvidos de antes: o {lista}. É o teu chão firme, aquilo em que te podes apoiar quando o resto custa.",

    porCerrar: "O que trazes por fechar",
    porCerrarKarmico: "A conta que vens saldar é o {n}",
    porCerrarLema: "Salda-se com o {n}",
    porCerrarLemaSinTexto: ", que é a vibração que to permite.",

    dondeEstas: "Onde estás agora",
    etapa: "{edad} anos: etapa de {ciclo}, dos {desde} aos {hasta}.",
    etapaFinal: "{edad} anos: etapa de {ciclo}, dos {desde} em diante.",
    anioPersonal:
      "Dentro dela vais no ano {n} de uma roda que se repete de nove em nove. O que toca este ano não é o que tocará no seguinte: é por isso que a carta se vê de vez em quando, e não uma só vez.",
    turbulencias:
      "Aos {edad} começam {anios} anos mexidos em {tipos}: a mudança de caminho não é de repente, coze-se durante esse tempo.",

    diasFuerza: "Os teus dias de força",
    diasFuerzaPie:
      "Os dias do mês que te acompanham, a começar pelo mais forte. São os bons para assinar, começar alguma coisa ou decidir.",

    hilo: "O fio de toda a tua vida",
    hiloPie: "O teu propósito é o {n}, e não muda de etapa: é o fundo sobre o qual acontece tudo o resto.",
    viveBien: "Quando o vives bem",
    seTuerce: "Quando se torce",

    cierre: "Se só ficares com uma coisa",
    /* «Que vais em direção a O Carro» obrigava a uma contração que não existe
       («a o»). Com «para» não há contração nenhuma e a frase fica direita:
       «Que caminhas para O Carro». */
    cierreVas: "Que caminhas para {carta}",
    cierreTareaUna: ", e que o caminho passa pela tarefa aqui de cima, uma de cada vez e sem pressa",
    cierreTareasVarias: ", e que o caminho passa pelas {n} tarefas aqui de cima, uma de cada vez e sem pressa",
    cierreSinTareas: ", e que o teu trabalho é sustentar o que já trazes feito",
    cierreFinal: ". Nada disto está fechado nem decidido de antemão: é o mapa, e o caminho andas tu.",

    paraElArchivo: "Os teus números, para o arquivo",
    numTuNumero: "O teu número",
    numPorDentro: "Por dentro",
    numPorFuera: "Por fora",
    numConsciencia: "A tua consciência",
    numPorCerrar: "O que trazes por fechar",
    numConQueSalda: "Com que se salda",
    numHilo: "O fio de toda a tua vida",
    pieLema: "O nome é a senha da alma",

    y: "e",

    empresaTitulo: "Estudo de empresa",
    empValorNombre: "Valor do nome",
    empValorNombrePie: "Como vibra a empresa",
    empEsencia: "Essência",
    empEsenciaPie: "O que veio ser",
    empEgo: "Ego",
    empEgoPie: "Como a veem",
    empCifras: "Algarismos",
    empCifrasPie: "Os números do nome",
    empLetraALetra: "O nome, letra a letra",
    empCaminoOrigen: "O caminho de origem",
    empArcano: "Arcano {n}",
    empDiasFuerza: "Dias de força",
    empDiasFuerzaPie: "Do mais forte ao menos forte. Para assinaturas, aberturas e decisões.",
    empImportante: "O importante a ter em conta",
    empComoVibra: "Como vibra",
    empComoVibraTexto: "O nome soma {n}: é o tom de fundo, o que a empresa transmite antes de dizer seja o que for.",
    empDentroFuera: "Dentro e fora",
    empDentroFueraTexto:
      "Essência {e} e ego {g}{cifras}. Quanto mais se parecem, mais a empresa se mostra como é; quanto mais se afastam, mais distância há entre o que quer ser e o que aparenta.",
    empDentroFueraCifras: ", mais {n} dos algarismos",
    empHaciaDonde: "Para onde",
    empHaciaDondeTexto: "O caminho de origem é {carta}: a direção de fundo do projeto.",
    empCuandoMover: "Quando mexer",
    empCuandoMoverTexto: "Os dias de força são o {dias}. Para assinar, abrir e apresentar.",
    separadorDias: ", o ",
    empPieLema: "O nome é a senha",
  },

  /* ------------------------------------------------------- o estudo completo
   * O documento longo, de vinte e tantos capítulos. Aqui estão os rótulos, as
   * entradas de cada capítulo e as frases que ligam um dado ao seguinte — tudo
   * o que o programa escreve à volta dos apontamentos.
   *
   * AS SECÇÕES têm um «·» que não é decoração: o que vai antes dele é a sessão,
   * e o documento só começa página nova quando muda de sessão. Por isso «Sessão
   * 2 · Aprendizagens» e «Sessão 2 · Somatizações» têm de partilhar o princípio
   * exatamente, tal como «Os números do nome» e «Os números do nome · Essência».
   *
   * O GÉNERO: onde o espanhol muda a terminação, o português muda-a também, e
   * por isso essas frases trazem as duas formas — e a neutra, que é uma volta à
   * frase que não precisa de nenhuma. */
  estudio: {
    portadaPersonal: "Estudo de Kabbalah pessoal",
    portadaEmpresa: "Estudo de Kabbalah empresarial",
    portadaSinFecha: "Lido do nome",

    secBienvenida: "Boas-vindas",
    secArbol: "Árvore da Vida",
    secCaminos: "Sessão 1 · Caminhos",
    secNumeros: "Sessão 1 · Números",
    secAprendizajes: "Sessão 2 · Aprendizagens",
    secSomatizaciones: "Sessão 2 · Somatizações",
    secAlma: "Sessão 3 · Imagem da alma",
    secCierre: "Fecho",

    bienvenidaKicker: "O teu mapa de luz",
    bienvenidaTitulo: {
      f: "Bem-vinda ao teu estudo",
      m: "Bem-vindo ao teu estudo",
      n: "Damos-te as boas-vindas ao teu estudo",
    },
    bienvenidaLead:
      "Aceita este estudo não como um diagnóstico rígido, mas como um guia vivo. A Kabbalah ensina-nos que o dia e a hora em que nasceste, juntamente com o nome com que {nombrado}, constituem uma senha única de acesso ao teu potencial supremo.",
    bienvenidaNombrado: { f: "foste nomeada", m: "foste nomeado", n: "te nomearam" },
    bienvenidaHabla:
      "Tudo o que vais ler nas páginas seguintes fala de ti: do que já conquistaste, do que ainda está por despertar e das aprendizagens que vieram para te impulsionar. Lê-o com abertura, com amor e com a certeza de que tens a força para transformar cada aspeto da tua vida.",
    bienvenidaViaje: "Uma viagem de regresso à tua essência",
    bienvenidaMapa:
      "Este estudo é um roteiro para compreenderes a arquitetura do teu ser. Através da Kabbalah deciframos os códigos do teu nascimento para te dar clareza, sentido e direção: os teus dons, as virtudes e as ferramentas com que vieste habitar o mundo; os teus desafios de evolução, esses bloqueios ou padrões repetidos transformados na tua maior fonte de sabedoria; e o teu propósito, a direção para onde orientar a tua energia para viveres em plenitude.",
    bienvenidaArbol:
      "A árvore da vida, com as suas dez sefirot e os seus vinte e dois caminhos, é também o mapa evolutivo que percorrem os vinte e dois arcanos maiores do Tarot: cada caminho que a tua alma escolheu tem, além da sua leitura kabbalística, uma história arquetípica — a do Louco que começa a andar e, no fim do percurso, volta a atravessar o mesmo abismo, mas já transformado. Neste estudo vais encontrar as duas leituras entretecidas.",
    bienvenidaCita:
      "O estudo de Kabbalah não adivinha o teu destino; revela a luz que já habita em ti para que aprendas a guiar o teu próprio caminho com consciência, amor e liberdade.",

    arbolKicker: "As tuas três energias",
    arbolTitulo: "A tua Árvore da Vida",
    arbolIntro:
      "A tua alma escolhe três caminhos na árvore da vida: três energias que vieste aprender, gerir e compreender. O caminho de origem acompanha-te desde que nasces até à tua idade de mudança e é o que sabes de outras vidas. O caminho de transformação nasce e morre contigo: é a tua maneira de viver. O caminho de destino é para onde a tua alma te quer levar.",
    arbolEdadLabel: "Idade de mudança",
    arbolEdadTurbulencias:
      "Aos {edad} anos começam {anios} anos de turbulências em {tipos}. Não tomarás o caminho de destino até aos {destino} anos.",
    arbolEdadSinTurbulencias: "Aos {edad} anos dá-se a mudança que te leva a tomar o teu caminho de destino.",

    caminosKicker: "Sessão 1 · Os teus caminhos",
    origenTitulo: "O teu caminho de origem",
    origenIntro:
      "Fala-te dessa qualidade que trazes de série: o caminho de origem é o que vens recordar e partilhar com os outros nesta existência. No teu caso, desde o nascimento até aos {edad} anos, que é a tua idade de mudança.",
    transformacionTitulo: "O teu caminho de transformação",
    transformacionIntro:
      "Nasce e morre contigo: é a tua maneira de viver. Deves viver com esta predisposição e agir como este caminho te indicar perante qualquer situação ou conflito que apareça na tua vida. Vai ser muito bom para alcançares o êxito.",
    destinoTitulo: "O teu caminho de destino",
    destinoIntroMismaCarta:
      "Uma energia nova que a tua alma quer aprender. No teu caso, é a que continuas a partir do teu caminho de transformação.",
    destinoIntro: "Uma energia nova que a tua alma quer aprender. Alcança-se quando chega o momento da mudança.",
    caminoPareja: "Este caminho a dois",
    caminoEvolutivo: "O caminho evolutivo de {nombre} · {sendero}",

    corazonKicker: "O pin da tua alma",
    corazonTitulo: "O teu número de coração: {n}",
    corazonLead:
      "É o número pin da tua alma, como vibras. Sabendo que os números são vibração, percebemos que nos dão a informação da energia que geramos e do tipo de aprendizagem com os outros.",
    corazonCuenta:
      "Sai do valor do teu nome ({nombre}) mais a tua idade de mudança ({edad}): {nombre} + {edad} = {total}.",
    corazonNumero: "Número {n} · {titulo}",
    corazonPartes: "Em Kabbalah os números de três algarismos dividem-se de dois em dois: {partes}",

    valoresKicker: "Os teus valores e a tua expressão",
    valoresTitulo: "Essência, ego e dias de força",
    esenciaLabel: "Essência",
    esenciaSinFicha: "Este número fala dos teus valores internos, dos mais profundos.",
    egoLabel: "Ego",
    egoSinFicha: "Fala da ligação que tens com as pessoas. Lê-se de dois em dois: {partes}",
    fuerzaLabel: "Força",
    fuerzaTexto:
      "Saem do valor do teu nome, que é a essência mais o ego: {esencia} + {ego} = {valor}, e somando os seus algarismos, {base}. Vão do mais forte ao menos forte: aproveita o dia {primero} do mês para assinaturas e assuntos importantes da tua vida, e depois os restantes.",

    aprendizajesKicker: "Sessão 2 · As tuas aprendizagens",
    estructuraTitulo: "A tua estrutura energética: número {n}",

    aprendizajesTituloVacio: "As tuas aprendizagens",
    aprendizajesVacio: "A tua alma não marcou mais aprendizagens nesta encarnação.",
    aprendizajeCabecera: "Aprendizagem {portal}{veces} · {nombre} — vem do número {numero}",
    aprendizajeVeces: " (×{n})",
    aprendizajesTitulo: "As tuas aprendizagens · {i} de {n}",
    refHiloRojo: "Fio vermelho",
    refNeurosis: "Neurose associada",
    refSanador: "Princípio curador",

    somatizacionesKicker: "Corpo e emoção",
    somatizacionesTitulo: "Doenças e fragilidades",
    somatizacionesLead:
      "Se não levares a cabo estas aprendizagens, a energia não trabalhada somatiza-se. Saber onde se manifesta permite-te antecipar-te e trabalhá-la a partir da consciência.",
    somatizacionesPunto: "Ponto {n} · {nombre}",
    somatizacionesFicha: "Disfunções psicológicas: {psico} Órgãos: {organos} Disfunções físicas: {fisicas}",

    almaKicker: "Sessão 3 · A imagem da alma",
    almaTitulo: "Os teus bloqueios e as tuas ajudas",
    almaLead:
      "Dá-te informação de todos os processos kármicos que te impedem de crescer e de avançar. É uma mochila carregada de rotinas herdadas, padrões familiares e maneiras de agir de outras vidas que estás a repetir nesta. Ao conhecê-la, vais tirar-lhe peso.",
    almaLabel: "Imagem da alma",
    almaTexto:
      "É o algarismo que abre a tabela: dele saem os números móveis de cada casa, e com eles os planos que trazes bloqueados e as ajudas com que contas.",
    bloqueoTitulo: "Bloqueio {casilla} · {i} de {n}",
    bloqueoCabecera: "{nombre}{veces} — forma-se com o número {numero}",
    bloqueoVeces: " · ×{n}",

    karmaKicker: "Contas abertas e karma",
    karmaTitulo: "O teu karma",
    karmaLead:
      "As contas abertas são a base do sentimento de culpa, onde a tua alma sente que mais falhou: situações por resolver que continuas a carregar. Cada potencial arcaico ajuda-te a fechar a conta aberta da sua linha.",
    karmicoLabel: "Kármico",
    karmicoTexto: "Onde a tua alma falhou nas suas relações em vidas passadas e o que se repete nesta.",
    lemaLabel: "Lema de vida",
    lemaTexto: "O propósito da tua alma: a vibração que te permite levar a cabo o teu plano.",

    numeroEnApuntes: "{n} · {titulo}",
    numeroEnApuntesAclara: "{n} · {titulo} — {aclara}",
    numeroSinApuntes: "{n} — não figura nos apontamentos: lê-se pelas suas partes, {partes}",
    numeroSinApuntesAclara: "{n} · {aclara} — não figura nos apontamentos: lê-se pelas suas partes, {partes}",

    afinidadTitulo: "Os teus números de afinidade: {a} e {b}",
    afinidadLead:
      "São a visão mais ampla da carta: o que vieste fazer nesta encarnação. Andam aos pares, e cada um olha para uma metade — o primeiro sai do dia e do mês de nascimento; o segundo, do mês e do ano.",
    afinidadDiaMes: "dia {dia} + mês {mes}",
    afinidadMesAnio: "mês {mes} + ano {anio}",

    ciclosKicker: "Ciclos de vida",
    ciclosTitulo: "Os teus ciclos de vida",
    ciclosIntro:
      "O teu propósito de vida vibra no {proposito}. Os três grandes ciclos — formação, evolução e colheita — e as quatro realizações marcam o ritmo da tua existência; os desafios são os atritos que te afinam em cada etapa. O teu ano pessoal atual ({anioUniversal}) é o {anioPersonal}.",
    etapasTitulo: "As tuas etapas de nove anos",
    etapasLead:
      "A vida percorre-se também em etapas de nove anos, cada uma com a sua própria lição. Neste momento, com {edad} anos, estás na etapa {etapa}.",
    etapaCabecera: "Etapa {n} · dos {desde} aos {hasta} anos{actual}",
    etapaActual: " — a tua etapa atual",
    anioTitulo: "O teu ano pessoal: {n}",
    anioLabel: "Ano {n}",
    anioSinTexto: "Calcula-se somando o teu dia e o teu mês de nascimento ao ano em curso.",

    resumenKicker: "O teu estudo num relance",
    resumenTitulo: "Os teus números, todos juntos",
    resumenLead:
      "Estes são os algarismos sobre os quais se construiu tudo o que acabaste de ler. Guarda-os: cada um abre uma porta diferente e nenhum se lê sozinho.",
    cifCorazon: "Coração",
    cifCorazonPie: "O número pin da alma, como vibra",
    cifEsencia: "Essência",
    cifEsenciaPie: "O que vieste ser",
    cifEgo: "Ego",
    cifEgoPie: "Como os outros te veem",
    cifEdadCambio: "Idade de mudança",
    cifEdadCambioPie: "Quando entras no teu caminho de destino",
    cifEstructura: "Estrutura",
    cifEstructuraPie: "A figura dos teus dez portais",
    cifAlma: "Imagem da alma",
    cifAlmaPie: "Os dez planos de consciência",
    cifKarmico: "Kármico",
    cifKarmicoPie: "O que trazes por fechar",
    cifLema: "Lema de vida",
    cifLemaPie: "A vibração que te permite levá-lo a cabo",
    cifProposito: "Propósito",
    cifPropositoPie: "O fio que atravessa toda a vida",
    cifAnio: "Ano pessoal",
    cifAnioPie: "Onde estás em {n}",
    resumenCita: "Que este mapa te acompanhe. A luz que procuras já habita em ti.",

    cierreKicker: "Antes de fechar",
    cierreTitulo: "O importante que tens de ter em conta",
    cierreLead:
      "Se de todo o estudo só ficares com uma página, que seja esta. São os seis pontos que convém teres presentes no dia a dia.",
    cHaciaDondeLabel: "Para onde",
    cHaciaDondeTexto:
      "O teu caminho de destino é {carta}. {lema} É a direção de fundo: quando uma decisão te afastar daí, vais senti-lo como desgaste.",
    cQueTrabajarLabel: "O que trabalhar",
    cQueTrabajarNada: "Não trazes portais com aprendizagem: a tua estrutura vem resolvida e o trabalho é sustentá-la.",
    cQueTrabajarUno:
      "Tens {n} aprendizagem aberta: {lista}. Não são defeitos: são as tarefas que vieste fazer, e trabalham-se uma de cada vez.",
    cQueTrabajarVarios:
      "Tens {n} aprendizagens abertas: {lista}. Não são defeitos: são as tarefas que vieste fazer, e trabalham-se uma de cada vez.",
    cPortalSinNombre: "portal {n}",
    cQueDesatascarLabel: "O que desbloquear",
    cQueDesatascarNada: "Não há planos de consciência bloqueados: a imagem da alma vem limpa.",
    cQueDesatascarTexto:
      "Os planos bloqueados são {lista}. São os sítios onde a energia te fica parada; reconhecê-los já é meio caminho andado.",
    cCasillaSinNombre: "casa {n}",
    cQueCerrarLabel: "O que fechar",
    cQueCerrarTexto:
      "O número kármico {karmico} é a conta que trazes de trás. O teu lema de vida, o {lema}, é a vibração com que se salda.",
    cDondeEstasLabel: "Onde estás",
    cDondeEstasTexto:
      "Em {anioUniversal} estás no ano pessoal {anioPersonal} de uma roda de nove, dentro do ciclo de {proposito} que marca o teu propósito. O que toca este ano não é o que tocará no próximo.",
    cCuandoMoverLabel: "Quando mexer",
    cCuandoMoverTexto:
      "Os teus dias de força são o {dias}, do mais forte ao menos forte. Guarda-os para assinar, começar e decidir; o que arrancares nesses dias vem com o vento a favor.",
    cierreCita: "Nada disto é um destino fechado. É o mapa; o caminho andas tu.",

    digOrigen: "Origem",
    digTransformacion: "Transformação",
    digDestino: "Destino",
    digOrigenRango: "0 – {edad} anos",
    digTransformacionRango: "toda a vida",
    digDestinoRango: "a partir dos {edad}",
    digEje: "Eixo",
    digPlano: "Plano",
    digEnTension: "em tensão",
    digLibre: "livre",
    digEspiritu: "Espírito",
    digAlma: "Alma",
    digMateria: "Matéria",
    digEvolucion: "Evolução",
    digProyeccion: "O 0 cai na casa {n}: é isso o que projetas para os outros.",
    digDia: "Dia",
    digMes: "Mês",
    digAnio: "Ano",
    digCuenta: "Conta",
    digKarmico: "N.º kármico das relações",
    digLema: "N.º do lema de vida",
    digSanador: "N.º de efeito curador",
    digAfinidad: "N.º de afinidade",
    digVibraciones: "Vibração corpo / alma / espírito",
    digRango: "{desde} – {hasta} anos",
    digRangoFinal: "a partir dos {desde} anos",
    digRangoAbierto: "a partir dos {desde}",
    digRealizacion: "Realização {n}",
    digDesafios: {
      "Primer desafío menor": "Primeiro desafio menor",
      "Segundo desafío menor": "Segundo desafio menor",
      "Desafío mayor": "Desafio maior",
    },
    digRangosDesafio: {
      "hasta los 42 años aprox.": "até aos 42 anos aprox.",
      "de los 42 años en adelante": "dos 42 anos em diante",
      "toda la vida": "toda a vida",
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
    digEnNegativo: "Em negativo",
    digEnPositivo: "Em positivo",
    refTensa: "O que te tensiona · {n}",
    refLibera: "O que te liberta · {n}",
    refSinFicha: "Lê-se dividindo-o de dois em dois.",

    empSecNumeros: "Os números do nome",
    empSecEsencia: "Os números do nome · Essência",
    empSecEgo: "Os números do nome · Ego",
    empSecOrigen: "O caminho de origem",
    empNombreKicker: "O nome da empresa",
    empNombreTitulo: "O que diz este nome",
    empLead:
      "A Kabbalah lê o nome como uma senha: cada letra tem um valor e a soma de todas diz como vibra aquilo que esse nome designa. {nombre} soma {n}.",
    empSoloNombre:
      "Este estudo faz-se só com o nome. De uma pessoa leem-se ainda a estrutura energética, os planos de consciência, as contas abertas e os ciclos de vida, mas tudo isso sai da data de nascimento; uma empresa não a tem, e o que não se pode calcular não se inventa. O que se segue é, por inteiro, o que o nome diz por si só.",
    empCifValor: "Valor do nome",
    empCifValorPie: "Como vibra a empresa inteira",
    empCifEsencia: "Essência",
    empCifEsenciaPie: "O que veio ser, nas vogais",
    empCifEgo: "Ego",
    empCifEgoPie: "Como a veem, nas consoantes",
    empCifCifras: "Algarismos",
    empCifCifrasPie: "Os números que o nome leva",
    empCifOrigen: "Caminho de origem",
    empComoSeCuenta: "Como se conta",
    empCuenta:
      "Soma-se o valor de cada letra: {palabras}{total}. As vogais à parte dão a essência, {esencia}; as consoantes, o ego, {ego}.{cifras}",
    empCuentaPalabra: "{palabra} vale {n}",
    empCuentaSeparador: "; ",
    empCuentaTotal: ", e no total {n}",
    empCuentaCifras:
      " E se o nome levar números, contam pelo que valem: aqui somam {cifras}. Um número não é vogal nem consoante, por isso vai à parte, e o valor do nome é a soma dos três: {esencia} + {ego} + {cifras} = {valor}.",
    empValorKicker: "Valor do nome",
    empValorTitulo: "O {n}: como vibra",
    empValorTexto:
      "É o número da empresa inteira, a soma de todas as suas letras. Marca o tom de fundo do que faz e de como é percebida.",
    empEsenciaKicker: "Essência",
    empEsenciaTitulo: "O {n}: o que veio ser",
    empEsenciaTexto: "Sai só das vogais. É o impulso interno do projeto: aquilo para que tende quando ninguém a olha.",
    empEgoKicker: "Ego",
    empEgoTitulo: "O {n}: como a veem",
    empEgoTexto:
      "Sai só das consoantes. É a cara que a empresa mostra cá para fora: o que clientes e fornecedores percebem antes de a tratarem.",
    empArcanoKicker: "Arcano {n}",
    empOrigenLabel: "Origem",
    empOrigenCuenta:
      "Tira-se do valor do nome: {valor} menos a soma dos seus algarismos ({sumaCifras}) dá {resta}, que a dividir por nove são {division}, mais um, {mas1}. Reduzido aos vinte e um arcanos, o {arcano}.",
    empOrigenNota:
      "Numa pessoa este é o primeiro de três caminhos — origem, transformação e destino —, mas os outros dois apoiam-se na idade de mudança, que sai da data de nascimento. Numa empresa só há este, e por isso pesa: é todo o arco da carta.",
    empCierreKicker: "Antes de fechar",
    empCierreTitulo: "O importante a ter em conta",
    empCierreLead:
      "Se de todo o estudo só se retiver uma página, que seja esta. São os quatro pontos que convém ter presentes.",
    empCVibraLabel: "Como vibra",
    empCVibraTexto: "O nome soma {n}. É o tom de fundo: o que a empresa transmite antes de dizer seja o que for.",
    empCDentroFueraLabel: "Dentro e fora",
    empCDentroFueraTexto:
      "A essência é {esencia} e o ego {ego}. Quando os dois se parecem, a empresa mostra-se como é; quando se afastam muito, há distância entre o que quer ser e o que aparenta, e essa distância paga-se em confiança.",
    empCHaciaDondeLabel: "Para onde",
    empCHaciaDondeTexto: "O caminho de origem é {carta}. {lema} É a direção de fundo do projeto.",
    empCCuandoMoverLabel: "Quando mexer",
    empCCuandoMoverTexto:
      "Os dias de força são o {dias}, do mais forte ao menos forte. Guarda-os para assinar contratos, abrir e apresentar.",
    empCierreCita: "O nome é a senha: o que se nomeia bem, sustenta-se.",
  },

  /* ------------------------------------------------------------- os arcanos
   * O nome é o da tradição portuguesa, não a tradução do espanhol. O texto é
   * a folha de apontamentos da escola tal como está: telegráfica, com os
   * sefirot e os caminhos da Árvore da Vida pelo meio. Da folha de empresa só
   * sai o princípio, que é o que aqui vai traduzido.
   *
   * Sefirot: em português escrevem-se Kether, Chokmah, Binah, Chesed,
   * Geburah, Tiphereth, Netzach, Hod, Yesod e Malkuth — o espanhol usa J onde
   * o português usa Ch (Jesed / Chesed, Jokmah / Chokmah, Netsaj / Netzach).
   */
  arcanos: {
    0: {
      nombre: "O Louco",
      lema: "Energia de consciência fogosa espontânea",
      texto:
        "O 0, está tudo em aberto, tudo pode acontecer. Inspiração de Deus, faísca, espontaneidade. Nalguns baralhos o desenho é um bobo, o único que se podia rir do rei. A tua lei do mentalismo é que decide se faço caso ou não. Oportunidade para começar algo. A lei do mentalismo.",
    },
    1: {
      nombre: "O Mago",
      lema: "Energia consciente de boa vontade",
      texto:
        "Os quatro elementos: Espadas: mente = ar. Paus: terra. Ouros: dinheiro = fogo. Copas: emoções = água. Kether–Binah. Pode-se criar, mas não constantemente. Autorrealização. Tudo o que é em cima, é em baixo; tudo o que é em baixo, é em cima. Energia consciente evidente da vontade. Criar.",
    },
    2: {
      // A carta chama-se «A Papisa» no Marselha e «A Sacerdotisa» no Rider-Waite.
      // O nome espanhol da escola —«La Suma Sacerdotisa»— vem desta segunda linha.
      nombre: "A Sacerdotisa",
      lema: "Energia de consciência de negação",
      texto:
        "Coluna negra B = Binah (Neptuno). Coluna branca J = Yesod (Lua). Sabedoria. II = duas vezes Deus. Mãe / Pai = dualidade. A guardiã das portas: dá-te acesso a outros planos de consciência, mas não 24 horas por dia. Viagens astrais. Temos de ser capazes de dar prioridades, escolher qual é mais importante.",
    },
    3: {
      nombre: "A Imperatriz",
      lema: "Energia de consciência iluminadora",
      texto:
        "Binah–Chokmah. Corrente cósmica, é Yin / Yang. 3 = o Filho = Vida. Exprime o que sabe. 12 estrelas na coroa = 12 meses, 12 signos do zodíaco… 12 = 2+1 = 3. A mãe. Pessoas de proximidade, precisam do tu a tu com as outras pessoas. Frutifica a conversar com os outros e os outros com ela.",
    },
    4: {
      nombre: "O Imperador",
      lema: "Energia consciente constituinte",
      texto:
        "Masculinidade, instinto animal. 4: matéria, terra, o mais imprescindível. Estas pessoas têm de fazer a sua própria constituição, assegurar os seus princípios (o seu Sol). Terão pessoas à volta que as façam duvidar, para que descubram o seu princípio. Caminho 15. Ligação Espírito – Mente.",
    },
    5: {
      // «O Papa» no Marselha, «O Hierofante» no Rider-Waite. O espanhol da escola
      // diz «El Sumo Sacerdote», que é a linha do Hierofante.
      nombre: "O Hierofante",
      lema: "Energia de consciência de religião vivida",
      texto:
        "5: Alma. Procura algo mais profundo. Força interior (grande força). Bondade. Tem claro que se tem de voltar a ligar ao seu interior. Procura experiências cá fora, mas devo deixar acontecer (yin). Não quer imposições / dogmas. Leva a religião à sua maneira. Onde há imposições, passa-se mal.",
    },
    6: {
      nombre: "Os Amantes",
      lema: "Energia de consciência de atração magnética",
      texto:
        "Binah–Sol (caminho ascendente). 6: número de tensão. Tem muita força psíquica. Lei da Atração. Têm encanto por natureza, muito poder de atrair. Se estão mal, atraem o mau. Poder de atração, pessoas com encanto. «Como é dentro, é fora». Caminho 17. Caminho Yang.",
    },
    7: {
      nombre: "O Carro",
      lema: "Energia consciente de influência sem violência",
      texto:
        "Geburah–Binah (direção ascendente). Trabalhar com os 7 chakras, 7 leis, 7 dias da semana. O 7 é um número de ação. Ativo. Caminho Yang. Devem ter muito cuidado com Marte, é o Deus da Guerra. Querem ter influência sobre os outros, têm força para puxar por eles.",
    },
    8: {
      nombre: "A Justiça",
      lema: "Caminho de consciência de justiça espiritual",
      texto:
        "«Semeia e colhe». Muito justiceira, não suporta as injustiças. Geburah–Chesed. Corrente de força cósmica – Yin / Yang. Semear para começar a colher. Têm muitas forças e ajudas espirituais. Vai calhar-lhes defender alguém mais fraco. Precisam de muito entusiasmo. Defensores.",
    },
    9: {
      nombre: "O Eremita",
      lema: "Caminho consciente de meta programação",
      texto:
        "Chesed–Tiphereth. Caminho para o interior do Yin, para dentro. 9: a sabedoria mais alta. Quer ir ao mais sábio do seu interior, programados para procurar Deus porque sabem que assim o seu caminho está iluminado. «A confiança de Deus é o meu bordão» – Confiança plena. Procuram a solidão.",
    },
    10: {
      nombre: "A Roda da Fortuna",
      lema: "Caminho consciente da recompensa",
      texto:
        "10: Deus deixa tudo em aberto. Número da mobilidade espiritual. Princípio da procura espiritual. Chesed–Netzach. Ultrapassa os teus limites = larga, descola. Roda que nunca para, tudo volta. Lei do ritmo: temos de saber a frequência vibratória dos pensamentos. «Lei da vibração».",
    },
    11: {
      nombre: "A Força",
      lema: "Energia consciente da força interior",
      texto:
        "Geburah–Tiphereth. 11: 2 vezes Deus = dupla força. Força que nasce de dentro, segurança. Confiança plena em si mesmo, sentir-se vivo e ligado a si próprio. Maturidade. Devem ser conscientes do seu poder, para o poderem transmutar, ter força suficiente para dominar as situações.",
    },
    12: {
      nombre: "O Enforcado",
      lema: "Energia consciente de perseverança",
      texto:
        "Geburah–Hod (descendente). Vai contra o estabelecido, é capaz de se iluminar (cabeça brilhante). Precisa de encontrar algo, sabe que tem de passar por um sacrifício / luta. 12 – 3 – Graças a um sacrifício é capaz de entender algo. 3 = mãe, pai e filho. Preciso de sair, de ser parido.",
    },
    13: {
      nombre: "A Morte",
      lema: "Consciência de transformação",
      texto:
        "Tiphereth–Netzach. Movimento Yin-passivo. Não se apegam a nada. Estão continuamente a mudar, têm de aprender. Arcanjo Rafael. Morte e renovação constante. Romper – morrer – transcender. A alma quer viver a sua força criativa (Sol) e uma vida variada, excitante; não aguentam a monotonia.",
    },
    14: {
      nombre: "A Temperança",
      lema: "Energia consciente de governo flexível",
      texto:
        "Comunicação entre o inconsciente e o consciente. Energia de comunicação. Poder de comunicação. Tiphereth–Yesod. São líderes. Corrente espiritual alta. Podem trazer estabilidade e reconciliação com o meio. Devemos fluir, está rodeada de água. Nasce para comunicar, líder carismático.",
    },
    15: {
      nombre: "O Diabo",
      lema: "Energia consciente de renovação",
      texto:
        "Tiphereth–Hod. Caminho ativo: se procurar, encontrará o Sol. A parte mais escura da pessoa faz parte de nós. Um medo pode escravizar-te, é escuridão. Precisam de tirar o diabólico dos seus pensamentos. Devem tirar o negativo; se o conseguem, reagem e podem chegar a ser grandes.",
    },
    16: {
      nombre: "A Torre",
      lema: "Energia consciente de entusiasmo",
      texto:
        "Hod–Netzach. Muita energia, Yin-Yang, é preciso saber usá-la. Caminho de entusiasmo e renovação constante. Motivação espiritual. Motivação para servir para nós próprios. São muito motivados, podem transmitir-nos e animar os outros a crescer. Ajudar. Une as pessoas.",
    },
    17: {
      nombre: "A Estrela",
      lema: "Energia de natureza cósmica",
      texto:
        "Água = emoções. Yesod–Netzach, direção ascendente. Iluminar e compreender, ver para além dos olhos mundanos. Olhar mais além. Sabedoria, confiança, começo, alegria, o cosmos, fertilidade, criatividade, altruísmo. Confiança no futuro, sentindo-se fresco e novo.",
    },
    18: {
      nombre: "A Lua",
      lema: "Energia consciente de purificação",
      texto:
        "Alma velha, não por ter vivido muito, mas por ter tido muitas aprendizagens. Muita pressa, sensação de que há algo que têm de fazer. Precisam de aprendizagens de terra, com as raízes. Tem a ver com o inconsciente. Devem descolar-se de tudo o que viveram para ter consciência da sua situação.",
    },
    19: {
      nombre: "O Sol",
      lema: "Energia consciente de coletividade",
      texto:
        "Yesod–Hod. Quer o bem da família, da comunidade. Sofrem quando há desunião. Luz, dia, infância, êxito, saúde, energia, família… Caminho de muita luz. Caminho de grupos, é bom que façam coisas em grupo. Querem descansar com almas, sentir esta ligação. Vêm unir.",
    },
    20: {
      nombre: "O Julgamento",
      lema: "Energia consciente de revivificação",
      texto:
        "Caminho Hod–Malkuth. Ajuda as pessoas a elevarem-se. Alma velha. Vêm ajudar a fechar karma. Têm muita pressa, têm algo muito concreto para aprender. Passam por situações difíceis, devem libertar-se trazendo ordem às situações. Libertar situações ativamente. Libertar o caos.",
    },
    21: {
      nombre: "O Mundo",
      lema: "Energia consciente do verdadeiro êxito na vida",
      texto:
        "Malkuth–Yesod. Pés assentes na terra. Alma velha. As quatro figuras = os quatro evangelistas. Tudo o que quero conseguir, vou conseguir. Loureiro = triunfo em amor, dinheiro… O número 4 = é mágico para trazer a matéria à minha vida. Exemplo: 4 folhas de loureiro.",
    },
  },

  /* ------------------------------------------- o que diz cada algarismo, 0-9
   * De aqui sai a leitura de qualquer número: parte-se o número nos seus
   * algarismos e junta-se o que cada um diz. */
  numerologia: {
    0: { pos: "Resgate espiritual. Procurar, arriscar.", neg: "Bloqueio, estagnação, negligência. Não sei o que fazer." },
    1: { pos: "Vida espiritual. Fé. Deus, ação na matéria.", neg: "Desconfiança, insegurança, negação do espiritual." },
    2: { pos: "Amor incondicional. Tolerância, flexibilidade.", neg: "Rigidez mental, dogmatismo, dualidade, lógica." },
    3: { pos: "Vida e atos férteis, abundância, partilho os meus dons.", neg: "Negatividade, bloqueio mental, negação da minha essência." },
    4: { pos: "Realização na matéria, aceitação do mundo.", neg: "Medos na matéria, limitação racional, escassez material." },
    5: { pos: "Autoaceitação, autoestima.", neg: "Crise de identidade, baixa autoestima, influenciável." },
    6: { pos: "Correto enfoque espiritual na matéria, aceito o meu papel.", neg: "Egoísmo, apego à matéria, tensão." },
    7: { pos: "Consciência, aperfeiçoamento, esoterismo, cura.", neg: "Superficialidade, não aceito a minha escuridão." },
    8: { pos: "Autorresponsabilidade, liberdade e harmonia.", neg: "Medos, carências, escravidão, dependências." },
    9: { pos: "Certeza interior, sabedoria. Ouvir o coração.", neg: "Autoexigência, controlo, autossabotagem, ditadura da mente." },
  },

  /* --------------------------------------------- o tipo de estrutura, 2 a 10
   * Da folha só sai o princípio de cada uma. */
  estructuras: {
    2: "De início terão desconfiança nas pessoas. Querem tudo ou nada, e não lhes servem os meios-termos.",
    3: "Em certos momentos podem sentir que não encaixam nesta terra, mas são eles que se sentem assim. Grandes inventores, porque têm muita energia criativa e são cocriadores.",
    4: "Vêm limpar karma, a partir da comunicação; precisam de se libertar de velhas amarras, da escravidão, e por isso são espíritos livres. Esta estrutura tem a energia da sorte.",
    5: "Estas estruturas têm o número do Messias, querem tomar Jesus como exemplo para as suas vidas. Desejam viver Deus como ele o fez: ama o teu próximo como a ti mesmo.",
    6: "O divino tem muita força para eles na sua vida. A sua alma quer que provem, que experimentem a força e a constância, que se ponham à prova.",
    7: "Exigem muito de si próprios, a tentar chegar a fazer o perfeito em tudo. A matéria é importante para eles, porque o que têm dão-no para poderem ajudar.",
    8: "A tentação: esta é a estrutura da tentação. Devem mostrar para que lado decidem inclinar-se nesta vida, viver o estar aberto às decisões.",
    9: "Muita capacidade de amar, muito abertos a novas possibilidades. Na sua estrutura têm o lema essénio. AJUDAR, ENSINAR E CURAR. , para onde vou?",
    10: "Grande capacidade de telepatia e de ler os pensamentos. Deus tem muitas formas, está em toda a parte, Deus é livre.",
  },

  /* --------------------------------------------- os dez portais de aprendizagem
   * `comoSeTrabaja` é o que nos apontamentos vem depois do travessão: o
   * remédio da tarefa. Em espanhol a frase repete primeiro o nome da tarefa e
   * o programa corta-o; aqui já vem cortado. */
  tareas: {
    1: {
      nombre: "União Universal",
      comoSeTrabaja:
        "Desenvolvimento da consciência existencial da vida. Que sentido tem a existência? Que sentido tem a vida? «Deixo fluir quem sou». Responsabilizo-me pelos meus atos e desenvolvo a certeza interior.",
    },
    2: {
      nombre: "Amar em vez de querer ter razão",
      comoSeTrabaja:
        "Desenvolver os atributos do ser dador e ligarmo-nos à divindade e ao amor universal. «Sou parte do Pai e o seu poder criador está em mim». Amor a partir do desapego.",
    },
    3: {
      nombre: "Decisões positivas",
      comoSeTrabaja:
        "Aprender a colaborar através dos meus atos férteis: «Sei o que dar» e encontro o meu lugar no mundo.",
    },
    4: {
      nombre: "Expressão da própria essência, autorreconhecimento",
      comoSeTrabaja:
        "Não existem 2 almas iguais. Somos obrigados a ser autênticos e a deixar a nossa marca no mundo. Desenvolvimento da inteligência emocional como base para trabalhar a partir do amor e da compaixão. «O poder ao serviço do amor».",
    },
    5: {
      nombre: "Ser único e especial",
      comoSeTrabaja:
        "Aprender a viver segundo a minha verdade, caia quem cair. Sou perfeito para alcançar o meu propósito. Não há nada de errado em mim.",
    },
    6: {
      nombre: "Alegria de viver",
      comoSeTrabaja:
        "Como me comporto neste mundo? Aprender a ter um correto enfoque espiritual na matéria através do meu ego externo. Sair da armadilha da carência material e emocional. Desenvolvimento de um ego fértil.",
    },
    7: {
      nombre: "Reconciliação com a criação divina",
      comoSeTrabaja: "Aceitar a realidade de que este é o lugar «perfeito» para desenvolver o meu propósito.",
    },
    8: {
      nombre: "Força de unificação",
      comoSeTrabaja:
        "Personalidade e ego interno (a valorização que eu faço de mim). Pacificar as minhas relações através da empatia. Desenvolvimento da paz interior assumindo o meu plano de alma. Cultivar o desapego ao material como parte do combustível do meu ego. Disciplina energética e proteção do astral.",
    },
    9: {
      nombre: "Clariperceção. Empatia.",
      comoSeTrabaja:
        "Encontro a capacidade de me autodeterminar e recupero o meu poder pessoal graças a abrir-me ao poder do amor. Ser honesto com a minha essência para me abrir à intuição, ao amor, à verdade interior. Toda a orientação de que precisas trá-la dentro de ti. Quem sou eu?",
    },
    10: {
      nombre: "Força de terminação. A profissão.",
      comoSeTrabaja:
        "Força de determinação para manifestar os meus dons e a vontade de Deus através de mim. Vivo a minha vocação como cocriador.",
    },
  },

  /* --------------------------------------------- os dez planos de consciência
   * O nome vai curto de propósito: o apartado da folha já diz que são
   * consciências. Da folha só sai o princípio do texto. */
  planos: {
    1: {
      nombre: "Consciência Espiritual",
      texto:
        "Nesta matriz o 1 é o ponto mais elevado, o ponto superior. É o espírito sobre o espírito. Aqui tudo se relaciona com as 7 leis cósmicas. Não importa o que nos acontece, não importa o que conseguimos, não importa quanta dedicação lhe pomos.",
    },
    2: {
      nombre: "Consciência Causal",
      texto:
        "A primeira coisa que este plano nos ensina é a autorresponsabilidade. Tenho de estar disposto a aceitar a minha responsabilidade pela minha vida, por mim próprio. Tenho de pegar nas rédeas da minha vida.",
    },
    3: {
      nombre: "Ativação",
      texto:
        "Plano espiritual mental: encontrar o caminho da minha existência, decidir e encontrar a motivação para mim; isso é decidir por mim, pela minha vida, pela minha alegria. Impulso para a mudança, é a energia de me ativar e de me pôr a andar.",
    },
    4: {
      nombre: "Subconsciente",
      texto:
        "Neste plano trata-se das coisas inconscientes da minha personalidade, ou seja, tudo o que temos dentro de nós sem o sabermos ou conhecermos. São as capacidades que ainda não tenho conscientes.",
    },
    5: {
      nombre: "Autoconsciência / Consciência da Alma",
      texto:
        "Consciência sobre o nosso ser divino, sobre a parte de divindade que há em nós. Chama-se Eu Superior à alma, que não tem nada a ver com a tua parte material. O teu Eu Inferior tem um nome próprio pelo qual és conhecido.",
    },
    6: {
      nombre: "Ego",
      texto:
        "Devemos ter em conta quanta influência tem o ego em nós, porque aqui a alma encontra a matéria, ainda que a alma não se possa ver. Há vezes em que mostramos cá para fora uma fachada que não encaixa com a nossa personalidade interior.",
    },
    7: {
      nombre: "Realidade",
      texto:
        "Aqui geram-se pensamentos de carência que têm a ver com o nosso corpo, com as nossas capacidades em geral, com o dinheiro, a roupa, o carro… Exemplo: pensar em comprar um carro grande porque o vizinho também tem um carro grande.",
    },
    8: {
      nombre: "Emoções",
      texto:
        "Precisamos dos nossos sentimentos, mas devemos reagir a eles com coerência, controlo e equilíbrio, já que os sentimentos fazem parte do nosso corpo emocional, mas perder o controlo sobre eles gera um sentimento que pode contaminar o nosso crescimento.",
    },
    9: {
      nombre: "Mentalidade",
      texto:
        "A consciência de mentalidade é igual a opinião. Neste plano está guardada a nossa soma de opiniões, opiniões que fui ganhando durante todas as minhas encarnações. Ter opiniões sobre a vida, sobre alguns temas da vida, é o mais normal.",
    },
    10: {
      nombre: "Transformação / Campo Evolutivo",
      texto:
        "Desenvolver a mobilidade espiritual ou a flexibilidade espiritual. A consciência de transformação significa que a primeira coisa de que preciso é da flexibilidade mental e espiritual. Tenho de ser móvel mental e espiritualmente.",
    },
  },

  /* Os ciclos e as turbulências entram na frase em minúscula: «etapa de
   * colheita», «dez anos mexidos em espírito e alma». */
  ciclos: { "Formación": "formação", "Evolución": "evolução", "Cosecha": "colheita" },
  turbulencias: { "Espíritu": "espírito", "Alma": "alma", "Materia": "matéria" },

  /* ------------------------------------------------- os números dos apontamentos
   * A conta que se traz por fechar (o kármico) e aquilo com que se salda (o
   * lema de vida). Da folha só sai o princípio de cada ficha, que é o que aqui
   * vai traduzido; o resto do apontamento fica em espanhol na ferramenta da
   * Iris, que é onde se usa.
   *
   * Alguns apontamentos começam a meio de uma frase ou com um travessão: é
   * assim no original, que foi extraído dos manuais, e mantém-se. */
  numeros: {
    10: "O nosso princípio original afeta a nossa parte divina; o zero que aparece em segundo lugar é o princípio original e o 1 é a nossa parte divina.",
    13: "Número cósmico da luz, decisão e novo começo. Novas oportunidades, viajar para novos portos. Entrega a coisas novas e empurrar-me a mim próprio.",
    14: "Aqui o 4 dirige-se para o 1, ou seja, o homem na matéria dirige-se para a sua parte divina. Número de amor ao próximo. Pensar nos outros. Isto precisa do meu equilíbrio espiritual.",
    15: "Todos os seres humanos são os meus companheiros de treino. Enriquecimento de todas as experiências. Lei cósmica da ressonância.",
    16: "É um número de tensão; com este número tenho a contraposição de espírito e matéria: se não consigo levar a cabo o meu trabalho espiritual na matéria, vou tensionar-me.",
    17: "O bom, o bonito e o nobre. Olhar o bonito e o bom das coisas. Não procurar sempre o cabelo na sopa. Aplicar as funções dos 7 chakras de forma positiva.",
    18: "A tentação. Como é em cima é em baixo. Limpar o subconsciente, tentar reconhecer as minhas reações para me poder melhorar. Porque repito os mesmos erros e os mesmos padrões?",
    19: "Número dos curadores. Ajudar, ensinar e curar. Mas antes temos de pensar que também nos temos de curar a nós. Progresso espiritual, estar em paz com a minha alma.",
    20: "O zero deixa de novo tudo em aberto para que tenha efeito em nós. Duvidamos de que na verdade possamos ter a possibilidade de ter tantas possibilidades à nossa frente.",
    21: "A presença de Deus vem até nós; ser conscientes de que Deus está sempre presente. Mas isto não significa que ele tenha de fazer o trabalho por nós.",
    22: "22 caminhos de iniciação na árvore da vida. Com a sabedoria destes 22 caminhos de iniciação posso encontrar a solução para os meus problemas mundanos.",
    24: "Pensar que não existe só a matéria. Que quando não fazemos bem as coisas, como consequência encontramos resultados pouco gratos para nós.",
    25: "Se este número é bem levado, traz-nos alegria e felicidade nas relações pessoais. Isto vai gerando boa sorte e resultados satisfatórios.",
    35: "Olhar as nossas aptidões negativas nalguns pontos: dinheiro, saúde, amor, etc. Aptidão positiva perante os medos de ver o futuro incerto, não dizer: «Não consigo».",
    37: "Pensar que a vida está cheia de possibilidades, não ficar sentado demasiado tempo à espera e aceitar o que a vida traz; porquê esperar mais.",
    38: "Decisões importantes para mim, como me organizar bem para poder ter tempo para mim.",
    39: "Quando há um sentimento de que uma decisão pesa muito, por exemplo, deixar o trabalho, uma relação, mudar de país, etc.",
    40: "Devemos reagir irracionalmente. A parte educacional ou de influência não está; devemos sair do quadrado e da imposição.",
    41: "Muita gente não começa coisas novas por medo do princípio; sobretudo pensam que todo o princípio é muito difícil. Então atrasam o que Deus quer para eles, por causa deste pensamento negativo.",
    42: "Dou amor e não espero nada em troca. Este número do amor incondicional fala-nos de sermos desprendidos, generosos e de não termos medo de que, se dou, possa ficar eu sem nada.",
    43: "Novos caminhos, não ter medo do novo e sobretudo de ser o primeiro a experimentá-lo. Sair da monotonia e poder trabalhar o meu cérebro para que não adormeça.",
    44: "Não ter medo de mim próprio e sermos capazes de que os outros te vejam realmente, despir a alma. Outro número de muita força, já que me tenho de exprimir, ou seja, tal como sou.",
    45: "A minha alma quer exprimir-se cada vez mais perto e eu tenho de lhe fazer lugar a partir da minha parte mais material. Se ouço a minha alma, ela dir-me-á para onde me devo dirigir e quais são as minhas qualidades.",
    46: "Ser delicado, suave e amoroso, ter empatia e não se tensionar. Tenta que os outros entendam e compreendam o que lhes queres transmitir, por muito difícil que seja.",
    47: "Fazer experiências até que se tenha compreendido. Eu quero resolver os meus processos de aprendizagem nesta vida.",
    48: "Levar à ação a minha liberdade espiritual. Não somos de ninguém e somos todos livres; até os nossos filhos não são nossos.",
    49: "Não me desculpar quando sei o que devia fazer e não o faço, porque digo «agora não o posso fazer».",
    50: "A alma quer manifestar-se, e é ela que quer prevalecer antes do corpo, antes da mente confusa.",
    51: "Justiça equilibradora: tenho de aceitar a minha parte escura, porque só assim poderei limpar e trabalhar os meus lados para que a minha alma possa chegar a Deus.",
    52: "Tenho de esquecer as feridas, o que me fez mal.",
    53: "O número do sal, o «sal da vida». Ensinar sem orgulho, e ser capaz de estar disposto a aprender com os outros. Faz o bem e não deixes que os outros te exaltem, nem te gabes de ser o melhor.",
    54: "A alma sofre quando agimos apenas através da matéria, mas tem de chegar ao seu destino apesar dos entraves.",
    55: "As respostas estão no meu interior. Número de força e de sorte. A força não vem de Deus, nem da minha parte humana: vem da minha alma.",
    56: "Preciso de encontrar o equilíbrio entre a minha parte Yin e a minha parte Yang para tirar as tensões do meu corpo; estas limitam-me para que a minha alma possa agir nos meus processos.",
    57: "Trabalhar com os 7 chakras, entender as emoções que estão por trás deles. O estar bem faz com que se tenha uma influência nas outras pessoas.",
    58: "Depende de mim como chego a sentir a minha alma, mas tenho de tirar as coisas que me limitam para me sentir livre. Os medos limitam-nos e impedem-nos de sentir as mensagens da alma.",
    59: "O profeta está no meu interior; cuidado com as profecias autoinfligidas.",
    60: "Viver o anseio de voltar a Deus. Este número em algum momento influencia-nos a todos; chega um momento em que devemos sentir esse anseio.",
    61: "EU SOU QUEM SOU. O 1 vai para o 6, Deus aproxima-se. O um traz equilíbrio ao seis; equilíbrio significa que as forças divinas se dirigem a mim e querem ter um efeito.",
    63: "O 3 começa a ser filho, fala-nos do filho. Não se tensionar. A melhor alternativa decide; há alternativas, mas não me devo tensionar. Escolhe o melhor para ti.",
    64: "Através da matéria tenho efeito em mim e nos outros. Exercer poder, levar a matéria ao meu corpo e não me tensionar pelas coisas físicas do corpo e da matéria. Agir com compaixão.",
    65: "Cinco: a alma aproxima-se da minha matéria para me relaxar, para entrar em mim totalmente com a sua influência.",
    66: "também podem ser apegos emocionais. Quando eu evoluo espiritualmente, a matéria vem sozinha. Não posso procurar a minha alegria de viver só nas coisas materiais.",
    67: "Número da prova, desconfiança. Se a minha desconfiança é suficientemente grande, fico só no comprovar, e isto faz com que acabe a desconfiar à partida.",
    68: "Número da teimosia. Custa-nos ver o que é real em nós porque temos medo. Analisar os meus medos e trabalhar sobre eles.",
    69: "Preciso da minha sabedoria especialmente em momentos muito difíceis e muito tensos. Esforçar-me e ver o que está realmente a acontecer nesses momentos ou situações difíceis.",
    70: "O nosso princípio original afeta a nossa parte divina; o zero que aparece em segundo lugar é o princípio original e o 1 é a nossa parte divina. «Tenho muitas possibilidades de chegar à perfeição com essa aprendizagem».",
    71: "Eu já sou perfeito, deixa que Deus chegue. Estiveram perto de Jesus. Confiar em que as forças psíquicas estão dentro de mim. Confiança, segurança.",
    72: "Aplicar a sabedoria através da razão, o que seria a lei cósmica correspondente. Tenho de tentar aplicar as leis espirituais na minha vida. Sabedoria e razão.",
    73: "Número das decisões cheias de sabedoria. Aplica nas tuas decisões a parte irracional. Este número tem contacto direto com a árvore da vida.",
    74: "Aprender através da experiência da vida: por experiência sabemos o nosso limite, e o que não podemos controlar. Têm de tocar em dinheiro, em matéria.",
    75: "Felicidade e sorte. A minha alma quer chegar ao meu ser e invadi-lo para que eu possa chegar à minha perfeição e à minha união, alma e ser. Aceitação de mim próprio. Às vezes precisam de espaço e solidão.",
    76: "Aqui devemos contagiar-nos a nós próprios para podermos contagiar os outros. Se obtenho equilíbrio em certas situações da minha vida, então obtenho ou aproximo-me do meu 7, da minha perfeição.",
    77: "energia e do espírito. Estas pessoas sentem tudo cada vez com mais urgência. Este número é o móbil perfeito do espírito. Estado concreto de sabedoria.",
    78: "Estamos de novo com a liberdade espiritual. Aplicar as tuas capacidades conscientemente, para chegar passo a passo à tua perfeição. Faz o que tu achares importante para ti.",
    79: "Não tenho de usar a violência, nem de falar com violência. Não tenho de lutar pelo meu direito: basta-me saber que tenho razão. Aceitar-me com sabedoria e entendimento.",
    80: "Os 80 têm a ver com liberdade espiritual ou com comprovar a liberdade própria. Se aparece, foi-nos cortada a liberdade espiritual noutra vida (não se podia falar de Deus).",
    81: "O número da libertação. Isto é como um chamamento a Deus. Deus ajuda-me e liberta-me dos meus medos e de todas as tolices que eu penso.",
    82: "Pôr em dúvida o estado próprio.",
    83: "O número do Messias, ou dito de outro modo, o milagre da oração.",
    84: "Os atos têm efeito sobre a minha liberdade espiritual, decisões materiais. O que devo fazer para ser livre? Não se apegar, mas desfrutar a matéria. O dinheiro não te liberta, mas tranquiliza-te.",
    85: "Se eu acredito na alma e não consigo alcançá-la, ela não me pode guiar.",
    86: "liberdade. Superar os obstáculos, atrever-se a fazer coisas novas. É 2/43, que é o número do pioneiro, percorrer novos caminhos. O 3 é a decisão e o 4 a matéria, e o 86 é uma energia superior.",
    87: "É um número curador tal como o 19: ajudar, ensinar e curar. Labirinto espiritual. A minha liberdade está cortada porque não vejo a saída. Necessidade de se tirarem a si do seu labirinto e de tirar os outros.",
    88: "A liberdade dos outros e a própria. Não exagerar com a liberdade espiritual ou tornas-te um ilusionista, ou seja, não te tornes uma pessoa que vive constantemente entre ilusões.",
    89: "Se nos limitamos mesmo quando a coisa fica difícil, então vêm os problemas: limito-me a mim próprio.",
    90: "Com os 90 a sabedoria põe-se à frente. Entender todas as definições de todos os princípios originais do 1 ao 8 e utilizá-los corretamente. A exigência de não querer nenhum compromisso.",
    91: "Nós não somos unicamente uma parte do Universo, mas estamos também integrados no Universo.",
    92: "Pessoas que têm um potencial muito grande, mas têm-no adormecido. Pior se elas sabem que o têm, mas negam-no. Pessoas inteligentes, mas não sabem o que fazer com tanta inteligência.",
    93: "levam-me a experimentar a minha sabedoria interior. Sabedoria mais elevada se confio em Deus.",
    94: "muitas experiências na matéria para alcançar a sabedoria. Cair de focinho constantemente chama-se o giro dos caídos; é como querer atravessar uma parede com a cabeça.",
    95: "A alma está em jogo. O lema dos Essénios é importante. O homem cresce a partir da sua sabedoria, guiado pela sua alma.",
    96: "A utilização corajosa do Yin e do Yang leva-me à sabedoria, e o Yin e o Yang sempre em harmonia. A tensão ensina-me que há algo em mim que não está bem. Tirar a tensão com a minha sabedoria.",
    97: "Com a tua perfeição humana deves alcançar a tua sabedoria. Esta sabedoria está em ti desde há muito e agora a pergunta é: quando é que se é realmente Mestre? O 97 é um ponto importante.",
    98: "O Cosmos é infinito, portanto, com isso também os conhecimentos sobre o Cosmos são infinitamente grandes, independentemente de como é a minha definição de Mestre.",
    99: "Trata-se de superar a tentação (egos-apegos). Na vida nada é uma tentação para mim, sei perfeitamente a situação em que estou agora.",
    100: "Por ser duas vezes o 50, toma-se a definição do 50.",
    101: "Número da santificação. Trata-se de curar o interior, tornar-se Santo ou santificar-se. Há algo no subconsciente que é preciso curar.",
    102: "São os descobridores e os cocriadores. Há pessoas que, não importa de que tema se trate, descobrem sempre algo novo.",
    103: "Número da dissolução do negativo. Não basta criticar apenas, nem basta deixar de criticar a certa altura: a tarefa consegue-se ao fazer algo positivo.",
    104: "o chamado técnico frio ou tecnocrata. Número do técnico frio.",
    105: "Sacerdotisa. Ter um efeito santificador (através da religião). Este efeito santificador não vale só para uma pessoa, mas para muitas.",
    106: "Motivadores, ânimo, «sal da vida», bons a ensinar.",
    107: "Esta pessoa vai encontrar a sua vocação no âmbito da terapia; de que forma faz as terapias é algo que essa pessoa vai ter de descobrir por si, ou seja, esta pessoa primeiro tem de descobrir por si própria o que é a cura.",
    108: "O número esotérico. É o número do Espírito Santo. É o chamado «ângulo do pentagrama».",
    109: "Número da telepatia. É preciso ser muito responsável com a telepatia, não influenciar os outros sem autorização.",
    111: "O 111 corresponderia ao chakra raiz. É 3 vezes o 37. Muita força de Deus. Vão acontecer coisas que Deus quer.",
    112: "Dissemos aqui que o 47 é o número do Karma, e também vos disse que há um número do Karma maior, que é o número 199; com este número mete-se uma pessoa mesmo no tema.",
    123: "O 123, onde este aparece, tem processos kármicos, mas só consegue resolvê-los se tiveres uma orientação Yin, adotar uma atitude de recetividade e aceitação em vez de tentar forçar as coisas ou tomar medidas drásticas.",
    157: "Isto dá carisma; para isso há também um caminho correspondente na árvore da vida, e este carisma podemos percebê-lo porque o corpo etérico emana uma energia de êxito positivo; isto radica no facto de o ponto 1 ser a religião vivida.",
  },
};
