/**
 * EL PDF 1149 «MAYOR PIRÁMIDE EN EUROPA», DIAPOSITIVA A DIAPOSITIVA
 *
 * Mismo orden y misma información que el PDF de Mentoría. Sólo se han
 * corregido tildes, erratas y gramática («1,200» → «1.200», «drasticamente»,
 * «Nos has hecho» → «No has hecho», «evoluciones» → «evolucione»…).
 * Las cifras van tal cual.
 *
 * Las imágenes están en `public/kangen/1149/pNN.jpg`, con el número de la
 * página del PDF. Las fotos salen limpias, sin las cajas de texto del
 * original: el texto lo pone la diapositiva.
 */
import type { Diapo } from './kangen';

export const DIAPOS_1149: Diapo[] = [
  { tipo: 'capitulo', numero: '01', titulo: 'La mayor pirámide / de *Europa*' },

  /* p. 1 */
  {
    tipo: 'foto',
    src: '/kangen/1149/p01.jpg',
    alt: 'Banderas de la Unión Europea ondeando delante de un edificio',
    titulo: '¿Qué está pasando / en *Europa*?',
  },

  /* p. 2 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'La tasa de natalidad',
    valor: 9,
    titulo: 'nacimientos por cada / *1.000 habitantes*',
    texto: 'La tasa de natalidad en Europa ha disminuido en las últimas décadas. Se sitúa en unos 9 nacimientos por cada 1.000 habitantes…',
  },

  /* p. 3 */
  {
    tipo: 'foto',
    src: '/kangen/1149/p03.jpg',
    alt: 'Un hombre mayor de barba blanca esquiando en un bosque nevado',
    titulo: 'Una esperanza de vida / más *alta*…',
    texto: 'La población europea tiende a tener una esperanza de vida más alta en comparación con otras regiones del mundo…',
    foco: '50% 30%',
  },

  /* p. 4 */
  {
    tipo: 'foto',
    src: '/kangen/1149/p04.jpg',
    alt: 'Una mujer mayor trabajando delante de un ordenador',
    titulo: 'La edad de jubilación / se *alarga*…',
    foco: '50% 40%',
  },

  /* p. 5 y 6: la balanza */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Natalidad *vs.* / esperanza de vida',
    texto: 'Baja la natalidad: bajan los ingresos. Sube la esperanza de vida: suben los gastos.',
    src: '/kangen/1149/p05.jpg',
    alt: 'Barras rojas que bajan, una balanza con el símbolo del dólar ($) y barras verdes que suben',
  },

  /* p. 7 y 8: la prensa */
  {
    tipo: 'foto',
    src: '/kangen/1149/p07.jpg',
    alt: 'Gráficos de bolsa en las páginas de un periódico económico, con un bolígrafo',
    rotulo: 'Economía',
    titulo: 'España e Italia tienen los sistemas / de pensiones más «*insostenibles*» / de Europa',
  },
  {
    tipo: 'frase',
    tono: 'claro',
    rotulo: 'Noticias Trabajo · HuffPost',
    titulo: 'Las pensiones de los jubilados / en España se *tambalean*…',
    texto: '…ante la próxima subida de las pensiones en 2025. España continúa en el puesto 26 de los 48 sistemas de pensiones que analiza el Institute Global Pension de Mercer. ¿Es realmente estable?',
  },
  {
    tipo: 'frase',
    rotulo: 'Noticias Trabajo · HuffPost',
    titulo: 'Llega la tercera reforma / de las pensiones / y así te *afecta*',
    texto: 'El Gobierno alcanzó un acuerdo a través de la Mesa de Diálogo Social para la reforma de la jubilación parcial, la jubilación activa y la jubilación demorada, que con esta será la tercera reforma de las pensiones.',
  },

  /* p. 9 */
  {
    tipo: 'frase',
    tono: 'claro',
    rotulo: 'Intereconomía · Finanzas',
    titulo: 'El sistema piramidal / de la Seguridad Social / se *invierte*',
    texto: 'Solo dos trabajadores por pensionista.',
  },
  {
    tipo: 'frase',
    titulo: 'Las pensiones públicas / se basan en un sistema / *piramidal*',
    texto: 'Nacido del famoso esquema de Ponzi (1919) o estafa piramidal, por el que los que van llegando pagan a los que ya están, que poco a poco van subiendo hasta la cúspide.',
  },
  {
    tipo: 'frase',
    tono: 'claro',
    titulo: 'El sistema funciona / si la base es *amplia*',
    texto: 'Es decir, si son más los que pagan que los que reciben. Y quiebra cuando sucede lo contrario, cuando se invierte. Eso es lo que está pasando con las pensiones públicas.',
  },
  {
    tipo: 'cifra',
    rotulo: 'En la actualidad',
    valor: 2,
    titulo: 'trabajadores mantienen ya / a un *pensionista*',
    texto: 'Y la ratio va a empeorar en los próximos años. España cuenta con dos trabajadores por cada pensionista, una tasa de dependencia que tenderá a reducirse en las próximas décadas.',
  },

  /* p. 10 a 13: las cuentas */
  {
    tipo: 'foto',
    src: '/kangen/1149/p10.jpg',
    alt: 'Unas manos con una calculadora y un bolígrafo sobre papeles con gráficos',
    titulo: 'Salario mensual: / *1.200 euros* netos',
  },
  {
    tipo: 'cifras',
    tono: 'claro',
    rotulo: 'Salario mensual: 1.200 € netos',
    titulo: 'Lo que se aporta / cada *mes*',
    cifras: [
      { valor: 105, sufijo: ' €/mes', texto: 'El 7 % del salario bruto.' },
      { valor: 450, sufijo: ' €/mes', texto: 'El 30 % del salario bruto.' },
      { valor: 555, sufijo: ' €/mes', texto: '105 € + 450 €.' },
    ],
  },
  {
    tipo: 'cifras',
    titulo: 'Aportación a la / Seguridad *Social*',
    cifras: [
      { valor: 6660, sufijo: ' €', texto: 'Al año.' },
      { valor: 239760, sufijo: ' €', texto: 'En 36 años.' },
    ],
  },
  {
    tipo: 'cifra',
    tono: 'claro',
    valor: 1000,
    sufijo: ' €/mes',
    titulo: 'Pensión media / en *España*',
  },

  /* p. 14 */
  {
    tipo: 'lista',
    titulo: 'Las pensiones / *públicas*',
    pasos: true,
    puntos: [
      { titulo: 'El poder adquisitivo baja drásticamente' },
      { titulo: 'Desequilibrio entre lo que aportas y lo que recibes' },
      { titulo: 'Tus aportaciones no las heredan tus familiares' },
      { titulo: 'La incertidumbre del sistema' },
    ],
  },

  /* p. 15 a 17 */
  {
    tipo: 'foto',
    src: '/kangen/1149/p15.jpg',
    alt: 'Un túnel de luces de neón azules',
    titulo: '*2030*',
  },
  {
    tipo: 'imagen',
    tono: 'claro',
    src: '/kangen/1149/p16.jpg',
    alt: 'Sello de Enagic European Union: «Congratulations! 6A2-3. Change Your Water, Change Your Life!»',
  },
  {
    tipo: 'foto',
    src: '/kangen/1149/p17.jpg',
    alt: 'Una niña disfrazada de superheroína, con antifaz y capa roja, con el puño en alto',
    titulo: 'Congratulations! / *6A2-3*',
    foco: '40% 50%',
  },

  /* p. 18 y 19: el plástico */
  {
    tipo: 'foto',
    src: '/kangen/1149/p18.jpg',
    alt: 'Cientos de botellas de plástico vacías amontonadas al aire libre',
    titulo: 'Prohibida la venta / de agua embotellada / en *plástico*…',
  },
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Prohibición de los plásticos / de un solo uso en *España*',
    src: '/kangen/1149/p19.jpg',
    alt: 'Recorte de prensa: «Prohibición de los plásticos de un solo uso en España», con una foto de jarras de agua',
  },
  {
    tipo: 'frase',
    titulo: 'Aún no ha sido *traspuesta* / a la legislación nacional',
    texto: 'A pesar de que la directiva entró en vigor a nivel europeo el pasado 3 de julio, en varios países (España entre ellos) aún no ha sido traspuesta a la legislación nacional.',
  },
  {
    tipo: 'frase',
    tono: 'claro',
    titulo: 'Esto genera / *incertidumbre*',
    texto: 'Entre fabricantes, distribuidores, minoristas, hosteleros y consumidores, que dudan acerca de si es obligatorio o no adherirse desde ya a esta normativa para la prohibición de los plásticos de un solo uso.',
  },
  {
    tipo: 'frase',
    titulo: 'Para solventar / las *dudas*',
    texto: 'El Ministerio para la Transición Ecológica (Miteco) ha emitido una nota informativa en la que explica que la trasposición de la directiva «se ha incluido en el Proyecto de Ley de Residuos y Suelos Contaminados, actualmente en tramitación parlamentaria».',
  },
  {
    tipo: 'frase',
    tono: 'claro',
    titulo: 'Hasta el *1 de enero* / de 2023',
    texto: 'Probablemente, la aprobación de este proyecto de ley exigirá varios meses de trabajos, con lo que su implementación se retrasará hasta bien entrado 2022, y sus disposiciones no se convertirán en mandato hasta el 1 de enero de 2023.',
  },
  {
    tipo: 'lista',
    titulo: 'Para esa fecha, / se *prevé*',
    pasos: true,
    puntos: [
      { titulo: 'La eliminación total de los plásticos de un solo uso' },
      { titulo: 'El cobro diferenciado de cada envase no reutilizable que se entregue al consumidor' },
      { titulo: 'Además, bares y restaurantes deberán ofrecer agua del grifo gratis a sus clientes' },
    ],
  },
  {
    tipo: 'imagen',
    tono: 'claro',
    rotulo: 'La Vanguardia',
    titulo: 'El impuesto especial / sobre *plásticos*',
    texto: 'Será de naturaleza indirecta a todos los envases que sirvan para contener, proteger, manipular, distribuir y presentar mercancías. La norma pretende reducir el uso en restaurantes de aguas embotelladas.',
    src: '/kangen/1149/p19b.jpg',
    alt: 'Recorte de La Vanguardia sobre el impuesto especial a los envases de plástico, con la foto de una botella de agua sirviéndose en un vaso',
  },
  {
    tipo: 'frase',
    rotulo: 'La Vanguardia',
    titulo: 'Sin embargo, quedan / *excluidos* de dicho impuesto',
    texto: 'Las pinturas, tintas, lacas y los adhesivos concebidos para ser incorporados a los productos destinados a tener la función de contener, proteger, manipular o entregar bienes o productos.',
  },
  {
    tipo: 'frase',
    tono: 'claro',
    rotulo: 'La Vanguardia',
    titulo: 'Así como aquellos / *envases*…',
    texto: '…para contener, proteger, manipular, distribuir o presentar medicamentos, productos sanitarios, alimentos para usos médicos especiales, preparados para lactantes de uso hospitalario o residuos peligrosos de origen sanitario, así como los rollos de plástico para ensilados de uso agrícola y ganadero.',
  },
  {
    tipo: 'frase',
    rotulo: 'La Vanguardia',
    titulo: '«Un instrumento / económico *clave*»',
    texto: 'El segundo de los impuestos, al depósito de residuos en vertederos, la incineración y la coincineración: la Ley califica esta carga fiscal como un «instrumento económico clave para avanzar en la economía circular y en la consecución de los objetivos para la reutilización y reciclado en materia de residuos».',
  },

  /* p. 20 a 22: el agua */
  {
    tipo: 'foto',
    src: '/kangen/1149/p20.jpg',
    alt: 'Siluetas de dos escaladores al atardecer: uno ayuda al otro a subir',
    titulo: 'Con Enagic podemos servir / de ejemplo con una *misión*…',
    texto: 'Cambiar la salud de la sociedad y el planeta, mejorando la calidad de vida de las personas…',
  },
  {
    tipo: 'foto',
    src: '/kangen/1149/p21.jpg',
    alt: 'Una mano llena un vaso con agua del grifo',
    titulo: 'Las personas no beberán / agua del *grifo*…',
  },
  {
    tipo: 'lista',
    tono: 'claro',
    titulo: 'Agua en botellas / de *cristal*',
    pasos: true,
    puntos: [
      { titulo: 'El agua embotellada en botellas de cristal será más cara', texto: 'Por la demanda y por el transporte.' },
      { titulo: 'Resultado: litros de agua a mayor precio' },
      { titulo: 'Mayor coste medioambiental' },
    ],
  },

  /* p. 23 a 26: Enagic */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Nuestros / *equipos*',
    src: '/kangen/1149/p23.jpg',
    alt: 'Los equipos de Enagic en fila, entre ellos el LeveLuk K8, y cinco sellos: The Gold Standard, ISO 9001, ISO 14001, ISO 13485 y Water Quality',
  },
  {
    tipo: 'foto',
    src: '/kangen/1149/p24.jpg',
    alt: 'Un grupo de personas mayores sonrientes haciendo estiramientos en una clase',
    titulo: 'Vivir *+* mejor',
  },
  {
    tipo: 'imagen',
    tono: 'claro',
    rotulo: 'Hironari Oshiro',
    titulo: '«La salud *verdadera* / consiste en tener…»',
    texto: '«…un cuerpo saludable, una mente saludable y una economía saludable…»',
    src: '/kangen/1149/p25.jpg',
    alt: 'Un hombre y una mujer en kimono: la foto que acompaña la cita en la presentación original',
  },
  {
    tipo: 'imagen',
    titulo: 'Somos generadores / de la *verdadera salud* / en todo el mundo',
    src: '/kangen/1149/p26.jpg',
    alt: 'Una familia sonriente con vasos de agua en la mano',
  },

  /* p. 27 a 28 */
  {
    tipo: 'barras',
    tono: 'claro',
    rotulo: 'Pago Enagic',
    titulo: 'Financiación / para *todos*',
    texto: 'Financiando tu máquina y tu proyecto.',
    unidad: 'Cargo según el número de cuotas, en euros',
    fuente: 'Formulario para el pago automático de la máquina, vigente a partir del 05.09.2016. Consulta el Sistema de Pago Enagic para más detalles.',
    barras: [
      { etiqueta: '3 cuotas', valor: 30 },
      { etiqueta: '6 cuotas', valor: 60 },
      { etiqueta: '10 cuotas', valor: 100 },
      { etiqueta: '16 cuotas', valor: 160 },
      { etiqueta: '24 cuotas', valor: 240 },
    ],
  },
  {
    tipo: 'foto',
    src: '/kangen/1149/p28.jpg',
    alt: 'Un niño pequeño de pelo rizado, pensativo, con la barbilla apoyada en las manos',
    titulo: 'Ejemplo de emprendimiento / para las nuevas *generaciones*…',
    foco: '70% 50%',
  },

  /* p. 29 a 32: accionista */
  {
    tipo: 'imagen',
    tono: 'claro',
    src: '/kangen/1149/p29.jpg',
    alt: 'Sello 6A2-3 de Enagic European Union sobre un panel de bolsa luminoso',
  },
  {
    tipo: 'foto',
    src: '/kangen/1149/p30.jpg',
    alt: 'Un grupo de personas saltando en la playa al atardecer, a contraluz',
    titulo: '«Accionista / de *Enagic*»',
  },
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: '6A2-3',
    titulo: '*Accionista*',
    pasos: true,
    puntos: [
      { titulo: 'Dejas de ser un distribuidor', texto: 'Y pasas a ser *socio* de la compañía.' },
      { titulo: 'Cobrando una *retirada mensual*', texto: 'Para toda la vida y heredable.' },
      { titulo: 'Hasta aquí ha sido la compañía', texto: 'Quien te ha reservado ese *derecho*.' },
      { titulo: 'No has hecho ninguna aportación económica', texto: 'Solo tu tiempo, determinación y compromiso.' },
    ],
  },
  {
    tipo: 'lista',
    rotulo: '6A2-3',
    titulo: '*Accionista*',
    pasos: true,
    puntos: [
      { titulo: 'Has tenido unos *ingresos importantes*', texto: 'Hasta llegar aquí, no habiéndote retenido nada.' },
      { titulo: 'Disfrutarás de unos *ingresos pasivos*', texto: 'Independientemente de tu edad.' },
      { titulo: 'Depende de ti en cuánto tiempo lo consigues', texto: '*3 a 7 años* es posible.' },
      { titulo: 'Esta retirada mensual para toda la vida y heredable', texto: '*Seguirá aumentando*.' },
    ],
  },

  /* p. 33 a 39: el cierre */
  {
    tipo: 'foto',
    src: '/kangen/1149/p33.jpg',
    alt: 'Una familia de tres generaciones mira asombrada a una niña con gafas de realidad virtual',
    titulo: 'Por más que evolucione / la *humanidad*…',
  },
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Las personas necesitamos / beber agua de *calidad*',
    src: '/kangen/1149/p34.jpg',
    alt: 'Mosaico de siete fotos de personas de todas las edades bebiendo vasos de agua',
  },
  {
    tipo: 'foto',
    src: '/kangen/1149/p35.jpg',
    alt: 'Muchas manos levantadas en un auditorio',
    titulo: 'Cada vez serán más las personas / que quieran sumarse / a nuestro *proyecto*…',
  },
  {
    tipo: 'imagen',
    tono: 'claro',
    rotulo: 'Juan Antonio Jorge',
    titulo: '«Un proyecto / con *alma* y *corazón*»',
    texto: '«La razón de ser de Enagic, la tecnología que poseemos y el plan de negocio nos dan la certeza de un proyecto con alma y corazón… con presente y futuro, adaptable a cualquier cambio que se produzca en el mundo.»',
    src: '/kangen/1149/p36.jpg',
    alt: 'Kangen Water around the world: mapa del mundo hecho de agua con las sedes de Enagic. 23 países, 38 sedes',
  },
  {
    tipo: 'imagen',
    titulo: '¡Gracias infinitas, / *Antonio*!',
    texto: 'Aplauso al cielo.',
    src: '/kangen/1149/p37.jpg',
    alt: 'Dos hombres abrazados y sonrientes en un evento, delante de un cartel de Enagic',
  },
  {
    tipo: 'foto',
    src: '/kangen/1149/p38.jpg',
    alt: 'Un corazón hecho de agua salpicada',
    titulo: 'Gracias, gracias, / *gracias*',
  },
  {
    tipo: 'foto',
    src: '/kangen/1149/p39.jpg',
    alt: 'Un hombre de traje sube una escalera larga hacia una ciudad de noche',
    rotulo: 'Proyecto Mentor 6A2-3 · 6A2-4',
    titulo: 'Deja de mirar al suelo / si lo que quieres es / tocar el *cielo*',
  },
];
