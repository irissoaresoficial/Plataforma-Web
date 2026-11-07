/**
 * ============================================================================
 * LA PRESENTACIÓN DEL EVENTO, DIAPOSITIVA A DIAPOSITIVA
 * ============================================================================
 *
 * ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA CAMBIAR EL CONTENIDO.
 * El diseño vive en `components/kangen`.
 *
 * DOS MARCAS EN EL TEXTO:
 *   · *palabra*   sale en el color del agua: lo que hay que recordar.
 *   · [texto]     sale en ROJO: algo que falta y no se inventa.
 *   · « / »       parte un titular en dos líneas.
 *
 * DE DÓNDE SALE CADA COSA. El orden es el de la nota de Iris y sus audios
 * del 6 de noviembre de 2026. El contenido, de los PDF de Mentoría que
 * descargó Gerson (1149, 1043, 1036, 1271 y 1073): las cifras van tal cual
 * vienen allí, y cada una dice de dónde sale. Los vídeos son los enlaces de
 * Vimeo de la plataforma Mentor6A23.
 *
 * LO QUE SE HA DEJADO FUERA A PROPÓSITO, y por qué:
 *   · Toda afirmación de salud sobre el agua (pH y enfermedades, «agua que
 *     cura», hospitales…). En España la publicidad que atribuye a un producto
 *     efectos sobre la salud sin autorización está prohibida (Real Decreto
 *     1907/1996), y una presentación pública es publicidad.
 *   · El 1220 en PDF: es el testimonio de otra persona, con su teléfono y una
 *     curación atribuida al agua. Del 1220 va sólo el vídeo «Decide».
 *   · La pensión media de 1.000 €/mes del 1149: no trae fuente y se rebate
 *     con un dato oficial. La cuenta de lo que se aporta, en cambio, cuadra.
 *   · Cifras que en el original no cuadran entre sí (la isla de plástico con
 *     dos superficies, «10 billones» por 10.000 millones…).
 *   · Logos y fotos de marcas y personas que no son del evento.
 */

type Tono = { tono?: 'oscuro' | 'claro' };

export type Diapo =
  | { tipo: 'portada'; rotulo: string; titulo: string; texto?: string }
  | { tipo: 'capitulo'; numero: string; titulo: string; texto?: string }
  | ({ tipo: 'frase'; rotulo?: string; titulo: string; texto?: string; fuente?: string; centrada?: boolean } & Tono)
  | ({ tipo: 'cifra'; rotulo?: string; valor: number; decimales?: number; prefijo?: string; sufijo?: string; titulo: string; texto?: string; fuente?: string } & Tono)
  | ({ tipo: 'cifras'; rotulo?: string; titulo: string; cifras: Array<{ valor: number; decimales?: number; prefijo?: string; sufijo?: string; texto: string }>; fuente?: string } & Tono)
  | ({ tipo: 'lista'; rotulo?: string; titulo: string; texto?: string; puntos: Array<{ titulo: string; texto?: string }>; pasos?: boolean } & Tono)
  | ({ tipo: 'imagen'; rotulo?: string; titulo?: string; texto?: string; src: string; alt: string } & Tono)
  | ({ tipo: 'linea'; rotulo?: string; titulo: string; hitos: Array<{ cuando: string; que: string; texto?: string }>; pie?: string } & Tono)
  | ({ tipo: 'barras'; rotulo?: string; titulo: string; texto?: string; barras: Array<{ etiqueta?: string; valor: number; destaca?: boolean }>; unidad?: string; fuente?: string } & Tono)
  | { tipo: 'foto'; src: string; alt: string; rotulo?: string; titulo: string; texto?: string; foco?: string }
  | ({ tipo: 'quiz'; rotulo?: string; titulo: string; opciones: string[]; correcta: number; texto?: string } & Tono)
  | { tipo: 'acertijo'; rotulo?: string; titulo: string; respuesta: string; texto?: string; src?: string; alt?: string }
  | { tipo: 'video'; rotulo: string; titulo: string; vimeo: string; clase: string }
  | { tipo: 'pregunta'; rotulo?: string; titulo: string; texto?: string };

export type Capitulo = { titulo: string; diapos: Diapo[] };

export const CAPITULOS: Capitulo[] = [
  /* ================================================================ INICIO */
  {
    titulo: 'Inicio',
    diapos: [
      {
        tipo: 'portada',
        rotulo: 'Mentor 6A23 · Evento',
        titulo: 'Formar parte / del *futuro*',
        texto: 'Lo que está cambiando en Europa, en el agua y en el trabajo. Y lo que puedes hacer tú.',
      },
    ],
  },

  /* ===================================================== 1 · LA PIRÁMIDE */
  {
    titulo: 'La mayor pirámide',
    diapos: [
      { tipo: 'capitulo', numero: '01', titulo: 'La mayor pirámide / de *Europa*', texto: '¿Qué está pasando en Europa?' },
      {
        tipo: 'lista',
        rotulo: 'Europa cambia',
        titulo: 'Tres cosas / a la vez',
        pasos: true,
        puntos: [
          { titulo: 'Nacen *menos*', texto: 'Unos 9 nacimientos por cada 1.000 habitantes.' },
          { titulo: 'Se vive *más*', texto: 'La esperanza de vida en Europa es más alta que en otras regiones del mundo.' },
          { titulo: 'Te jubilas *más tarde*', texto: 'La edad de jubilación se alarga.' },
        ],
      },
      {
        tipo: 'cifra',
        rotulo: 'La pirámide se da la vuelta',
        valor: 2,
        titulo: 'trabajadores mantienen hoy / a cada *pensionista*',
        texto: 'Y la proporción va a empeorar en los próximos años.',
        fuente: 'Fuente: Intereconomía',
      },
      {
        tipo: 'frase',
        tono: 'claro',
        rotulo: 'Cómo funcionan las pensiones',
        titulo: 'Una pirámide aguanta / mientras la base es *ancha*.',
        texto: 'Las pensiones de hoy se pagan con lo que aportan quienes trabajan hoy. Si nacen menos y se vive más, la base se estrecha.',
      },
      {
        tipo: 'cifras',
        tono: 'claro',
        rotulo: 'Un sueldo de 1.200 € netos',
        titulo: 'Lo que se aporta / cada *mes*',
        cifras: [
          { valor: 105, sufijo: ' €', texto: 'Pones tú: el 7 % del sueldo bruto.' },
          { valor: 450, sufijo: ' €', texto: 'Pone tu empresa: el 30 % del sueldo bruto.' },
          { valor: 555, sufijo: ' €', texto: 'Van a la Seguridad Social, cada mes.' },
        ],
        fuente: 'Cálculo de la formación Mentor 6A23 (1149)',
      },
      {
        tipo: 'cifra',
        rotulo: 'En toda una vida de trabajo',
        valor: 239760,
        sufijo: ' €',
        titulo: 'aportados en *36 años*',
        texto: '6.660 € al año, durante 36 años. Y lo que aportas no lo heredan tus familiares.',
        fuente: '555 € × 12 meses × 36 años',
      },
      {
        tipo: 'lista',
        tono: 'claro',
        rotulo: 'Lo que nadie te cuenta',
        titulo: 'El sistema, / visto de *cerca*',
        pasos: true,
        puntos: [
          { titulo: 'El poder adquisitivo baja' },
          { titulo: 'Aportas más de lo que vas a recibir' },
          { titulo: 'Tus aportaciones no las heredan tus familiares' },
          { titulo: 'Nadie sabe cómo estará el sistema' },
        ],
      },
      {
        tipo: 'foto',
        src: '/kangen/oceano.jpg',
        alt: 'Basura de plástico flotando en el mar, vista desde arriba',
        rotulo: 'Y a la vez',
        titulo: 'El plástico de un solo uso / tiene los días *contados*.',
        texto: 'La ley de residuos prevé eliminarlo y cobrar aparte cada envase que no se pueda reutilizar.',
      },
      {
        tipo: 'imagen',
        tono: 'claro',
        rotulo: 'Nuestros equipos',
        titulo: 'Agua de calidad / en casa, *sin botellas*.',
        texto: 'El agua en botella de cristal será más cara, por la demanda y por el transporte. Con un equipo en casa, sale de tu cocina.',
        src: '/kangen/equipos.jpg',
        alt: 'Los ionizadores de agua de Enagic, en fila',
      },
      {
        tipo: 'frase',
        rotulo: 'Hironari Oshiro',
        titulo: '«Un cuerpo sano, / una mente sana / y una *economía* sana.»',
        texto: 'Así define el fundador de Enagic lo que llama la salud verdadera.',
      },
      {
        tipo: 'lista',
        rotulo: 'La meta: 6A2-3',
        titulo: 'Accionista / de *Enagic*',
        pasos: true,
        puntos: [
          { titulo: 'Dejas de ser distribuidor', texto: 'Pasas a ser socio de la compañía.' },
          { titulo: 'Una retirada *mensual*', texto: 'Para toda la vida, y heredable.' },
          { titulo: 'Sin poner dinero', texto: 'Sólo tu tiempo, tu determinación y tu compromiso.' },
          { titulo: 'De *3 a 7 años*', texto: 'Depende de ti. Según la formación, es posible.' },
        ],
      },
      {
        tipo: 'frase',
        centrada: true,
        rotulo: 'Lo que no va a cambiar',
        titulo: 'Las personas siempre / necesitaremos beber / agua de *calidad*.',
      },
      {
        tipo: 'frase',
        tono: 'claro',
        rotulo: 'Juan Antonio Jorge',
        titulo: '«Un proyecto con *alma* y *corazón*, / con presente y futuro.»',
        texto: '«La razón de ser de Enagic, la tecnología que poseemos y el plan de negocio, nos dan la certeza de un proyecto adaptable a cualquier cambio que se produzca en el mundo.»',
        fuente: '¡Gracias infinitas, Antonio!',
      },
      {
        tipo: 'frase',
        centrada: true,
        titulo: 'Deja de mirar al suelo / si lo que quieres es / tocar el *cielo*.',
      },
    ],
  },

  /* ============================================= 2 · EL MUNDO CAMBIA */
  {
    titulo: 'El mundo cambia',
    diapos: [
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 16.5',
        titulo: 'El mundo está *cambiando*',
        vimeo: '1181636318',
        clase: 'Gotas 16.5 · El Mundo Está Cambiando Robots (1141)',
      },
      { tipo: 'capitulo', numero: '02', titulo: 'Puntos / *principales*', texto: 'Si estuvieras en este evento por primera vez, ¿qué te gustaría escuchar?' },
      {
        tipo: 'frase',
        tono: 'claro',
        rotulo: 'Somos de la era industrial',
        titulo: 'Nuestros padres decían: / *estudia* y tendrás trabajo.',
        texto: 'Médico, ingeniero, abogado. Un título y un empleo para toda la vida.',
      },
      {
        tipo: 'imagen',
        tono: 'claro',
        rotulo: 'Lo que parecía para siempre',
        titulo: 'Mecanografía, fax, / *videoclubs*.',
        texto: 'Y el móvil, de ladrillo a pantalla en pocos años. Lo que parecía eterno desapareció.',
        src: '/kangen/moviles.jpg',
        alt: 'La evolución del tamaño de los móviles, del ladrillo a la tableta',
      },
      {
        tipo: 'frase',
        rotulo: 'Ingenuidad',
        titulo: 'La vida no es / como nos la han *enseñado*.',
        texto: 'Empresas que parecían eternas cayeron. En 2001, 1.800 trabajadores de Sintel acamparon en la Castellana de Madrid para que no los olvidaran.',
      },
      {
        tipo: 'frase',
        tono: 'claro',
        rotulo: 'Decisiones',
        titulo: 'Abrir un negocio / tradicional es un *riesgo*.',
        texto: 'Franquicias, restaurantes, cafeterías, tiendas: mucha inversión y ninguna garantía. Entonces, en los días de hoy, ¿qué hacer?',
      },
      {
        tipo: 'cifras',
        rotulo: 'El tamaño del mercado',
        titulo: 'Todas las personas / necesitan beber agua de *calidad*',
        cifras: [
          { valor: 743, sufijo: ' M', texto: 'personas viven en Europa.' },
          { valor: 496, sufijo: ' M', texto: 'tienen el español como lengua materna.' },
        ],
        fuente: 'Lengua materna: Instituto Cervantes, 2022',
      },
      {
        tipo: 'linea',
        rotulo: 'Plan de carrera Enagic',
        titulo: 'Un camino / con *fechas*',
        hitos: [
          { cuando: '1 año', que: '6A' },
          { cuando: '2 años', que: '6A2' },
          { cuando: '3 años', que: '6A2-2' },
          { cuando: '4 años', que: '6A2-3' },
          { cuando: '6 años', que: '6A2-4' },
        ],
        pie: 'Con el Curso de Excelencia, tú y tu organización. Y en 7, 8 o 9 años también es posible llegar.',
      },
      {
        tipo: 'barras',
        rotulo: 'España, hasta enero de 2024',
        titulo: 'Lo que han ganado / los *6A2*',
        texto: 'Distribuidores 6A2 y 6A2-2 de España. Sin contar los 6A2-3.',
        unidad: 'En miles de euros',
        fuente: 'Datos de la formación Mentor 6A23 (1043)',
        barras: [
          { valor: 685, destaca: true },
          { valor: 640, destaca: true },
          { valor: 506 },
          { valor: 454 },
          { valor: 434 },
          { valor: 392 },
          { valor: 391 },
          { valor: 360 },
          { valor: 347 },
          { valor: 345 },
          { valor: 342 },
          { valor: 288 },
          { valor: 272 },
          { valor: 254 },
          { valor: 230 },
          { valor: 217 },
          { valor: 210 },
          { valor: 190 },
          { valor: 186 },
          { valor: 186 },
          { valor: 184 },
          { valor: 182 },
          { valor: 113 },
        ],
      },
      {
        tipo: 'cifras',
        tono: 'claro',
        rotulo: 'Para llegar a 700.000 € con un sueldo',
        titulo: 'Cuántos años / tendrías que *trabajar*',
        cifras: [
          { valor: 58, sufijo: ' años', texto: 'Con un sueldo de 1.000 € al mes: 700 meses.' },
          { valor: 39, sufijo: ' años', texto: 'Con 1.500 € al mes: casi 467 meses.' },
          { valor: 31, sufijo: ' años', texto: 'Con 1.900 € al mes: casi 369 meses.' },
        ],
        fuente: 'Sin gastar ni un euro. Años redondeados.',
      },
      {
        tipo: 'lista',
        rotulo: 'Formar nuevos 6A2',
        titulo: 'Es un / *proceso*',
        puntos: [
          { titulo: 'Hacer la lista' },
          { titulo: 'Concertar una cita' },
          { titulo: 'Hacer la presentación' },
          { titulo: 'Estudiar las reacciones' },
          { titulo: 'Despertar el interés' },
          { titulo: 'Crear el deseo' },
          { titulo: 'Orientar y formar' },
          { titulo: 'Duplicar el sistema' },
          { titulo: 'Supervisar las presentaciones' },
          { titulo: 'Supervisar la formación' },
          { titulo: 'Seguir los eventos' },
          { titulo: 'Preparar *nuevos líderes*' },
        ],
      },
    ],
  },

  /* ======================================== 3 · KANGEN Y EL MEDIO AMBIENTE */
  {
    titulo: 'El medio ambiente',
    diapos: [
      { tipo: 'capitulo', numero: '03', titulo: 'Kangen y el / *medio ambiente*', texto: 'Un vaso y una botella. Y lo que pasa después de tirarlos.' },
      {
        tipo: 'quiz',
        tono: 'claro',
        rotulo: 'Dentro de 50 años',
        titulo: '¿Qué va a existir?',
        opciones: ['¿Un coche que vuela?', '¿El teletransporte?', '¿El vaso de plástico que tiraste hoy?'],
        correcta: 2,
        texto: 'Lo único seguro es el vaso. El plástico es el 80 % de la basura marina.',
      },
      {
        tipo: 'quiz',
        rotulo: 'Pregunta',
        titulo: '¿Cuánto plástico hay ya / en mares y océanos?',
        opciones: ['50 millones de toneladas', '100 millones de toneladas', '150 millones de toneladas'],
        correcta: 2,
        texto: 'Más de 150 millones de toneladas. Como 150 millones de coches de una tonelada.',
      },
      {
        tipo: 'cifra',
        rotulo: 'Cada año, más',
        valor: 12,
        prefijo: 'hasta ',
        sufijo: ' M',
        titulo: 'de toneladas de plástico / entran en el mar *cada año*',
        texto: 'Entre 4,8 y 12 millones, según las estimaciones. Llegan arrastradas por el viento y la lluvia, por los ríos. Existen ya cinco islas de plástico; a la del Pacífico, entre Hawái y California, la llaman el séptimo continente.',
        fuente: 'Estimación recogida en la formación Mentor 6A23 (1036)',
      },
      {
        tipo: 'foto',
        src: '/kangen/tortuga.jpg',
        alt: 'Una tortuga marina comiéndose una bolsa de plástico',
        rotulo: 'Vida marina',
        titulo: 'En el mar, / una bolsa parece *comida*.',
      },
      {
        tipo: 'cifras',
        rotulo: 'Lo que el plástico hace en el mar',
        titulo: 'Tres cifras / que no se *olvidan*',
        cifras: [
          { valor: 40, sufijo: ' kg', texto: 'de plástico en el estómago de una ballena, en Filipinas.' },
          { valor: 130, texto: 'trozos de plástico por hora traga un tiburón ballena al comer.' },
          { valor: 508000, texto: 'cangrejos ermitaños muertos, atrapados en envases.' },
        ],
        fuente: 'Datos recogidos en la formación Mentor 6A23 (1036)',
      },
      {
        tipo: 'frase',
        tono: 'claro',
        rotulo: 'Reacciones en cadena',
        titulo: 'Y vuelve / a nuestro *plato*.',
        texto: 'Los humanos también ingerimos plástico a través de la cadena alimenticia. Se han encontrado microplásticos en distintos tipos de sal de cocina.',
      },
      {
        tipo: 'foto',
        src: '/kangen/pesca.jpg',
        alt: 'Pescadores recogiendo una red desde una barca',
        rotulo: 'Economía',
        titulo: 'Afecta a quien / *vive del mar*.',
        texto: 'Un millón de familias depende de la pesca para vivir, y 295 millones de personas dependen del turismo. Las comunidades más necesitadas son las más afectadas.',
      },
      {
        tipo: 'cifra',
        tono: 'claro',
        rotulo: 'Alimentar al mundo',
        valor: 70,
        prefijo: '+',
        sufijo: ' %',
        titulo: 'de alimentos hará falta / para 2050',
        texto: 'Seremos casi 10.000 millones de personas. Y un océano sano, con una pesca sostenible, puede ayudar a alimentarnos a todos.',
        fuente: 'FAO, Organización de las Naciones Unidas para la Agricultura y la Alimentación',
      },
      {
        tipo: 'imagen',
        tono: 'claro',
        rotulo: 'La solución empieza en casa',
        titulo: 'Menos *desechables*.',
        texto: 'Reducir el plástico y evitar los desechables: el agua sale del grifo de tu cocina y va en tu botella.',
        src: '/kangen/k8-botellas.jpg',
        alt: 'Un ionizador Kangen K8 y dos botellas reutilizables',
      },
      {
        tipo: 'cifras',
        tono: 'claro',
        rotulo: 'Cada año',
        titulo: 'Lo que tiramos / en vasos y *garrafas*',
        cifras: [
          { valor: 50, sufijo: ' kg', texto: 'de plástico tira una persona al año.' },
          { valor: 200, sufijo: ' kg', texto: 'una familia de cuatro personas.' },
        ],
        fuente: 'Estimación recogida en la formación Mentor 6A23 (1036)',
      },
      {
        tipo: 'cifras',
        rotulo: 'El impacto del trabajo de una persona',
        titulo: 'El secreto: aumentar / los *puntos de distribución*',
        cifras: [
          { valor: 25000, texto: 'familias con agua en casa.' },
          { valor: 100000, texto: 'personas que dejan los desechables.' },
          { valor: 5000, sufijo: ' t', texto: 'de plástico menos, cada año.' },
        ],
        fuente: '100.000 personas × 50 kg al año',
      },
    ],
  },

  /* =================================================== 4 · EMPRENDER */
  {
    titulo: 'Emprender',
    diapos: [
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 16.6',
        titulo: '*Emprendedores*',
        vimeo: '1181636386',
        clase: 'Gotas 16.6 · Emprendedores Antonio Banderas (1142)',
      },
      { tipo: 'capitulo', numero: '04', titulo: 'Una renta / *sostenible*', texto: 'El modelo de compensación de Enagic.' },
      {
        tipo: 'barras',
        rotulo: 'Puntos y comisiones',
        titulo: 'Lo que cobras por máquina, / según tu *rango*',
        texto: 'Subes con las ventas combinadas: 3A desde la venta 11, 4A desde la 21, 5A desde la 51 y 6A desde la 101.',
        unidad: 'En euros',
        fuente: 'Plan de compensación de Enagic (1271)',
        barras: [
          { etiqueta: '1A', valor: 285 },
          { etiqueta: '2A', valor: 570 },
          { etiqueta: '3A', valor: 855 },
          { etiqueta: '4A', valor: 1140 },
          { etiqueta: '5A', valor: 1425 },
          { etiqueta: '6A', valor: 1710, destaca: true },
        ],
      },
      {
        tipo: 'cifras',
        rotulo: 'Diez máquinas al mes',
        titulo: 'Lo mismo, / según dónde *estés*',
        cifras: [
          { valor: 5700, sufijo: ' €', texto: 'en 2A: 10 × 570 €.' },
          { valor: 11400, sufijo: ' €', texto: 'en 4A: 10 × 1.140 €.' },
          { valor: 17100, sufijo: ' €', texto: 'en 6A: 10 × 1.710 €.' },
        ],
        fuente: 'Plan de compensación de Enagic (1271)',
      },
      {
        tipo: 'cifra',
        tono: 'claro',
        rotulo: 'El objetivo: 6A2-3',
        valor: 14,
        titulo: 'personas en tu equipo',
        texto: 'Dos 6A2-2, cuatro 6A2 y ocho 6A. 2 + 4 + 8.',
        fuente: 'Plan de compensación de Enagic (1271)',
      },
      {
        tipo: 'frase',
        rotulo: '4.ª forma: nivel asociado',
        titulo: 'Desde 6A2-3 ya no eres / sólo distribuidor: / eres *asociado*.',
        texto: 'Has demostrado un compromiso especial con Enagic.',
      },
      {
        tipo: 'barras',
        rotulo: 'Asociado',
        titulo: 'La retirada / *mensual*',
        texto: 'Lo que cobra el asociado cada mes, según su nivel.',
        unidad: 'En dólares (US$) al mes',
        fuente: 'Plan de compensación de Enagic (1271)',
        barras: [
          { etiqueta: '6A2-3', valor: 5000 },
          { etiqueta: '6A2-4', valor: 10000 },
          { etiqueta: '6A2-5', valor: 15000 },
          { etiqueta: '6A2-6', valor: 20000 },
          { etiqueta: '6A2-7', valor: 40000 },
          { etiqueta: '6A2-8', valor: 80000, destaca: true },
        ],
      },
      {
        tipo: 'acertijo',
        rotulo: 'Crecimiento exponencial',
        titulo: 'Unos nenúfares se duplican cada día / y llenan el estanque el día 30. / ¿Qué día estaba *a la mitad*?',
        respuesta: 'El día 29',
        texto: 'Así crece un equipo que se duplica: despacio al principio, y de golpe al final.',
        src: '/kangen/nenufares.jpg',
        alt: 'Nenúfares gigantes en un estanque',
      },
      {
        tipo: 'frase',
        centrada: true,
        titulo: '¿Quieres sólo vender, / o construir un / *ingreso sostenible*?',
      },
      {
        tipo: 'frase',
        tono: 'claro',
        centrada: true,
        titulo: 'Un líder crea / más *líderes*, / no seguidores.',
      },
    ],
  },

  /* ================================================== 5 · DISCIPLINA */
  {
    titulo: 'Disciplina',
    diapos: [
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 7',
        titulo: '¿Y tú, estás *preparado*?',
        vimeo: '1181636489',
        clase: '¿Y Tú, Estás Preparado? (1143) · Gotas nº 7',
      },
      { tipo: 'capitulo', numero: '05', titulo: 'La disciplina / vale más que el *talento*' },
      {
        tipo: 'frase',
        tono: 'claro',
        rotulo: 'Disciplina',
        titulo: 'Dejar un placer *inmediato* / por un beneficio *futuro*.',
        texto: 'Este comportamiento genera éxito en cualquier área de tu vida.',
      },
      {
        tipo: 'frase',
        rotulo: 'Compromiso',
        titulo: 'Ten claro dónde / quieres llegar, / y pon ahí todo tu *foco*.',
      },
      {
        tipo: 'cifras',
        rotulo: 'Motivación × disciplina',
        titulo: 'Una cerilla / contra una *vela*',
        cifras: [
          { valor: 1, sufijo: ' %', texto: 'Motivación: una cerilla. Prende rápido y se apaga.' },
          { valor: 99, sufijo: ' %', texto: 'Disciplina: una vela. Alumbra hasta el final.' },
        ],
      },
      {
        tipo: 'lista',
        tono: 'claro',
        rotulo: 'Disciplina no es motivación',
        titulo: 'Lo que nos / *decimos*',
        pasos: true,
        puntos: [
          { titulo: '«Tengo que estar motivado para hacer las llamadas»' },
          { titulo: '«… para hacer presentaciones»' },
          { titulo: '«… para ir a las reuniones»' },
          { titulo: '«… para estudiar la plataforma»' },
        ],
      },
      {
        tipo: 'frase',
        centrada: true,
        titulo: 'Una persona sin talento, / pero con un *100 %* de disciplina, / puede llegar donde quiera.',
      },
      {
        tipo: 'frase',
        tono: 'claro',
        titulo: 'Sin compromiso, / nunca *empiezas*. / Sin disciplina, / nunca *terminas*.',
      },
      {
        tipo: 'lista',
        rotulo: '¿Qué buscas para tu futuro?',
        titulo: 'Del acto / al *éxito*',
        pasos: true,
        puntos: [
          { titulo: 'Haz lo que hay que hacer' },
          { titulo: 'Entrena tu mente' },
          { titulo: 'Repite la acción' },
          { titulo: 'Analiza' },
          { titulo: 'Reconoce tu victoria' },
          { titulo: 'Convierte la acción en actitud' },
          { titulo: 'La actitud se vuelve hábito' },
          { titulo: 'El hábito se vuelve *éxito*' },
        ],
      },
      {
        tipo: 'frase',
        centrada: true,
        titulo: 'El éxito está / en tus actos *diarios*.',
      },
    ],
  },

  /* ======================================================== 6 · JUAN */
  {
    titulo: 'Juan',
    diapos: [
      {
        tipo: 'frase',
        rotulo: '03 · Juan',
        titulo: '[Falta esta pieza]',
        texto: '[No aparece en Mentor6A23 con el nombre «Juan». Puede ser el homenaje a Juan Antonio Jorge. Iris tiene que decir cuál es.]',
      },
    ],
  },

  /* ====================================================== 7 · DECIDE */
  {
    titulo: 'Decide',
    diapos: [
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 9',
        titulo: '*Decide*',
        vimeo: '1181674453',
        clase: 'Gotas 9 · Decide (1220)',
      },
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 11',
        titulo: 'Inteligencia *artificial*',
        vimeo: '1181677054',
        clase: 'Gotas 11 · IA (1249)',
      },
    ],
  },

  /* ======================================================== CIERRE */
  {
    titulo: 'Cierre',
    diapos: [
      {
        tipo: 'pregunta',
        titulo: '¿Y aquí quién quiere / formar parte del *futuro*?',
      },
    ],
  },
];
