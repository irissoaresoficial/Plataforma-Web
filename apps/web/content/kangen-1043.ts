/**
 * ============================================================================
 * PUNTOS PRINCIPALES (PDF 1043 de Mentoría), DIAPOSITIVA A DIAPOSITIVA
 * ============================================================================
 *
 * Gerson: «quiero la misma información, la misma cosa, deja lo mismo; no
 * quiero que cambies nada; lo pones bonito con el branding». Así que aquí va
 * TODO lo del PDF, en su mismo orden, con su texto. Sólo se han corregido
 * ortografía, tildes, erratas y gramática.
 *
 * Cómo se ha pasado:
 *   · Las secuencias que en el PDF son la misma diapositiva desvelando partes
 *     (p. 10–12, 31–33, 39–40 y 41–42) van en UNA.
 *   · Lo que no cabe en una diapositiva sin apretarlo se reparte en varias, sin
 *     recortar: Facebook (p. 7) en tres, el artículo de la p. 23 en cuatro, los
 *     tres bloques de la p. 46 en tres y el calendario de la p. 47 en cuatro.
 *   · De la p. 44 va su estructura; el contenido de sus miniaturas, no.
 *   · Las imágenes son recortes del propio PDF, sin el texto horneado: el
 *     texto va encima, en la letra de la presentación. Viven en
 *     `public/kangen/1043/pNN.jpg`, con NN la página de la que salen.
 */

import type { Diapo } from './kangen';

export const DIAPOS_1043: Diapo[] = [
  { tipo: 'capitulo', numero: '02', titulo: 'Puntos / *principales*' },

  /* ------------------------------------------------------------ p. 1 */
  {
    tipo: 'frase',
    tono: 'claro',
    centrada: true,
    titulo: 'Si yo estuviera en este evento / por *1.ª vez*…',
    texto: '…lo que me gustaría escuchar.',
  },

  /* ------------------------------------------------------------ p. 2 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Yo soy de la / era *industrial*',
    texto: 'Médico, ingeniero, abogado… Nuestros padres decían que teníamos que estudiar.',
    src: '/kangen/1043/p02.jpg',
    alt: 'Seis oficios ilustrados: albañil, pintor, arquitecto, profesor, médico y cirujano',
  },

  /* ------------------------------------------------------------ p. 3 */
  {
    tipo: 'imagen',
    titulo: '*Mecanografía* / y *fax*',
    src: '/kangen/1043/p03.jpg',
    alt: 'Una máquina de escribir Olivetti y un fax',
  },

  /* ------------------------------------------------------------ p. 4 */
  {
    tipo: 'foto',
    titulo: '*Videoclub*',
    texto: 'He dicho que iban a desaparecer.',
    src: '/kangen/1043/p04.jpg',
    alt: 'Una mujer escoge una película en las estanterías de un videoclub',
  },

  /* ------------------------------------------------------------ p. 5 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: '*Evolución* en el tamaño / de los móviles',
    src: '/kangen/1043/p05.jpg',
    alt: 'Once móviles en fila, del teléfono ladrillo con antena al smartphone y la tableta',
  },

  /* ------------------------------------------------------------ p. 6 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Internet / de los *años 90*',
    src: '/kangen/1043/p06.jpg',
    alt: 'Un aula de ordenadores con monitores de tubo y estudiantes navegando',
  },

  /* ------------------------------------------------------------ p. 7 */
  {
    tipo: 'linea',
    rotulo: 'La evolución de Facebook',
    titulo: 'Facebook completa / *21 años*',
    hitos: [
      { cuando: '2003', que: 'Facemash', texto: 'El universitario Mark Zuckerberg decidió crear Facemash para estar en contacto con sus compañeros.' },
      { cuando: '2004', que: 'The Facebook', texto: 'Nace oficialmente The Facebook: así se llamaba en ese entonces.' },
      { cuando: '2004', que: 'Todo un éxito', texto: 'En muy pocos días el sitio ya era todo un éxito, reuniendo hasta el 50 % de todos los estudiantes de la universidad.' },
      { cuando: '2005', que: 'Silicon Valley', texto: 'La empresa se muda oficialmente a Silicon Valley y recibe su primera inversión: 50.000 euros de parte de Peter Thiel.' },
    ],
  },
  {
    tipo: 'linea',
    rotulo: '2005 – 2008',
    titulo: 'La evolución / de *Facebook*',
    hitos: [
      { cuando: '2005', que: '15 países', texto: 'A mediados del año cambian su nombre definitivo a Facebook y se expande a más de 15 países.' },
      { cuando: '2006', que: 'Casi todo el mundo', texto: 'Modificaron el aspecto visual de la marca y se expandieron a casi todos los países del mundo.' },
      { cuando: '2007', que: 'Un movimiento global', texto: 'Facebook se convirtió en un movimiento global y supuso un antes y un después en las redes sociales.' },
      { cuando: '2008', que: 'Marketplace', texto: 'Se agregaron funcionalidades como Facebook Marketplace y Application Developer.' },
    ],
  },
  {
    tipo: 'linea',
    tono: 'claro',
    rotulo: '2009 – presente',
    titulo: 'La evolución / de *Facebook*',
    hitos: [
      { cuando: '2009', que: '350 millones', texto: 'Se convirtieron en la plataforma con más usuarios de todo el planeta, con más de 350 millones de usuarios registrados.' },
      { cuando: '2012', que: 'Instagram', texto: 'Facebook compra Instagram por más de 1.000 millones de euros.' },
      { cuando: '2014', que: 'WhatsApp', texto: 'Facebook compra WhatsApp por más de 13.800 millones de euros.' },
      { cuando: 'Presente', que: '*5.000 millones*', texto: 'Entre todas las plataformas agrupa hasta 5.000 millones de usuarios activos, lo que supone casi el 80 % de la población mundial.' },
    ],
  },

  /* ------------------------------------------------------------ p. 8 */
  {
    tipo: 'foto',
    titulo: 'Sociedad / de *cambios*',
    src: '/kangen/1043/p08.jpg',
    alt: 'Una persona con un visor de realidad virtual',
  },

  /* ------------------------------------------------------- p. 9 a 15 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: '*Ingenuidad*',
    src: '/kangen/1043/p09.jpg',
    alt: 'El logotipo de WhatsApp con el doble check azul',
  },
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: '*Ingenuidad*',
    src: '/kangen/1043/p10.jpg',
    alt: 'Lámina en inglés: «Enagic ionizer being installed in Japanese hospitals». Un médico junto a un ionizador, la lista Kyowa Hospital, Kitari Institute Medical Center, Showa University Hospital, Kanto Teishin Hospital, Nara College of Medicine Hospital, Iida Hospital, Tokyo Women’s College of Medicine y Hanabtake Hospital, y «Over 250 hospitals and clinics in Japan»',
  },
  {
    tipo: 'imagen',
    rotulo: 'Ingenuidad',
    src: '/kangen/1043/p11.jpg',
    alt: 'Carteles de Pain Hustlers, The Pharmacist, Dopesick, Painkiller y El farmacéutico, y un fotograma de Painkiller',
  },
  {
    tipo: 'imagen',
    tono: 'claro',
    rotulo: 'Ingenuidad',
    titulo: '*Enron*',
    texto: 'Los tipos que estafaron a América. La empresa que estafó a todo Estados Unidos y al mundo. Investigación del fraude: caso Enron.',
    src: '/kangen/1043/p13.jpg',
    alt: 'El cartel del documental sobre Enron, una portada de COEM y una presentación sobre la investigación del fraude',
  },
  {
    tipo: 'cifras',
    rotulo: 'Sintel',
    titulo: 'Entre el 29 de enero / y el 4 de agosto de *2001*',
    cifras: [
      { valor: 1800, texto: 'trabajadores de Sintel se echaron a la calle y decidieron acampar en pleno Paseo de la Castellana, en Madrid.' },
      { valor: 81, sufijo: ' días', texto: 'estuvieron encerradas en la Catedral de la Almudena sus esposas y las trabajadoras de Sintel.' },
    ],
  },
  {
    tipo: 'foto',
    rotulo: 'Sintel',
    titulo: 'Un *emblema* de la lucha / de los trabajadores',
    texto: 'Tras cinco años denunciando unas prácticas empresariales que estaban llevando a su empresa a la quiebra, decidieron dejar de ser números en los expedientes de extinción de empleo y mostrar sus rostros, sus uniformes, su rabia y su dignidad desde un campamento.',
    src: '/kangen/1043/p14.jpg',
    alt: 'El campamento de los trabajadores de Sintel en el Paseo de la Castellana, visto desde arriba',
  },
  {
    tipo: 'imagen',
    rotulo: 'Ingenuidad',
    titulo: '¿Crisis de las pensiones / en *España*?',
    texto: 'Sistema de pensiones en quiebra. Evolución del gasto total en pensiones, 2000-2021.',
    src: '/kangen/1043/p15.jpg',
    alt: 'Miniaturas de vídeos sobre la crisis de las pensiones en España y un gráfico de barras del gasto total en pensiones de 2000 a 2021',
  },

  /* ----------------------------------------------------------- p. 16 */
  {
    tipo: 'frase',
    tono: 'claro',
    centrada: true,
    rotulo: 'Fake',
    titulo: 'La vida no es como / nos han *enseñado*',
  },

  /* ----------------------------------------------------------- p. 17 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Decisiones implican / *consecuencias*',
    src: '/kangen/1043/p17.jpg',
    alt: 'Un hombre de espaldas ante cinco puertas de colores con un signo de interrogación',
  },

  /* ----------------------------------------------------------- p. 18 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Abrir un / *negocio*',
    texto: 'Franquicias: ¿un negocio rentable? Mi restaurante no funciona. 9 problemas al montar tu cafetería.',
    src: '/kangen/1043/p18.jpg',
    alt: 'Recortes sobre franquicias, un restaurante que no funciona, los problemas de montar una cafetería y dos tiendas de ropa',
  },

  /* ----------------------------------------------------------- p. 19 */
  { tipo: 'pregunta', titulo: 'En los días actuales, / ¿qué *hacer*?' },

  /* ----------------------------------------------------------- p. 20 */
  {
    tipo: 'imagen',
    tono: 'claro',
    rotulo: 'Proyecto Mentor',
    titulo: 'Quién lo ha / *logrado*',
    src: '/kangen/1043/p20.jpg',
    alt: 'El sello del Proyecto Mentor 6A2-3 · 6A2-4, con una corona de laurel dorada',
  },

  /* ----------------------------------------------------------- p. 21 */
  {
    tipo: 'frase',
    titulo: 'Abrir la mente / para el tamaño / de nuestro *mercado*',
  },

  /* ----------------------------------------------------------- p. 22 */
  {
    tipo: 'imagen',
    tono: 'claro',
    rotulo: 'Mercado',
    titulo: 'Todas las personas / necesitan beber agua / de *calidad* a diario',
    texto: 'Mejorar la salud. Rejuvenecer. Sistema inmunitario. Vivir más y mejor.',
    src: '/kangen/1043/p22.jpg',
    alt: 'Dos ionizadores de agua de Enagic, cada uno en un círculo amarillo',
  },
  {
    tipo: 'cifra',
    rotulo: 'Mercado',
    valor: 743,
    titulo: 'millones de población / en *Europa*',
  },

  /* ----------------------------------------------------------- p. 23 */
  {
    tipo: 'cifra',
    tono: 'claro',
    valor: 496,
    titulo: 'millones hablan *español*',
    texto: 'En todo el mundo, más de 496 millones de ciudadanos tienen el español como lengua materna (el 6,3 % de la población mundial), lo que lo convierte en uno de los idiomas más hablados en el mundo.',
    fuente: 'Mónica Mena Roa, «¿En qué países hay más hispanohablantes?», 17 de febrero de 2023',
  },
  {
    tipo: 'imagen',
    rotulo: '¿En qué países hay más hispanohablantes?',
    titulo: 'La lengua / de *Cervantes*',
    texto: 'Además, otros 75 millones cuentan con una competencia limitada del idioma, y casi 24 millones lo estudian como lengua extranjera, según los datos de 2022 del Instituto Cervantes.',
    src: '/kangen/1043/p23.jpg',
    alt: 'Mapa del mundo con los territorios hispanohablantes en rojo, cada uno con su nombre',
  },
  {
    tipo: 'cifras',
    tono: 'claro',
    rotulo: 'Hispanohablantes nativos',
    titulo: 'El *90 %* reside en América; / el 82 %, en Latinoamérica y el Caribe',
    cifras: [
      { valor: 126, sufijo: ' M', texto: 'México: más de un cuarto del total.' },
      { valor: 51.2, decimales: 1, sufijo: ' M', texto: 'Colombia.' },
      { valor: 45.4, decimales: 1, sufijo: ' M', texto: 'Argentina.' },
      { valor: 43.3, decimales: 1, sufijo: ' M', texto: 'España, cuna de la lengua: casi el 9 % del total mundial.' },
    ],
    fuente: 'Datos de 2022 del Instituto Cervantes',
  },
  {
    tipo: 'cifra',
    rotulo: 'Hispanohablantes nativos',
    valor: 41.8,
    decimales: 1,
    sufijo: ' M',
    titulo: 'residen hoy / en *Estados Unidos*',
    texto: 'El Instituto Cervantes vaticina que será el segundo mayor país hispanohablante del mundo en 2060, después de México. Las estimaciones indican que, para ese entonces, casi un 28 % de la población estadounidense será de origen hispano.',
  },

  /* ----------------------------------------------------------- p. 24 */
  {
    tipo: 'imagen',
    titulo: 'Crecimiento / *empresarial*',
    src: '/kangen/1043/p24.jpg',
    alt: 'Ilustración de flechas que suben, con el sello Mentor 6A23, dos personas que vuelan hacia arriba y símbolos de dinero',
  },

  /* ----------------------------------------------------------- p. 25 */
  {
    tipo: 'linea',
    tono: 'claro',
    rotulo: 'Curso de Excelencia: tú y tu organización',
    titulo: 'Plan de carrera / *Enagic*',
    hitos: [
      { cuando: '1 año', que: '6A' },
      { cuando: '2 años', que: '6A2' },
      { cuando: '3 años', que: '6A2-2' },
      { cuando: '4 años', que: '*6A23*' },
      { cuando: '6 años', que: '*6A24*' },
    ],
    pie: '7, 8, 9 años: es posible llegar.',
  },

  /* ----------------------------------------------------------- p. 26 */
  {
    tipo: 'cifras',
    rotulo: 'Puntos y comisiones · Objetivo',
    titulo: 'Poner bien el *foco*: / llegar a 6A23',
    cifras: [
      { valor: 2, texto: '6A22' },
      { valor: 4, texto: '6A2' },
      { valor: 8, texto: '6A' },
    ],
  },

  /* ----------------------------------------------------------- p. 27 */
  {
    tipo: 'lista',
    tono: 'claro',
    titulo: '¿Cuál es el camino más corto / hacia *6A2-3* y *6A2-4*?',
    pasos: true,
    puntos: [
      { titulo: 'Tú 1 · *6A2-3*', texto: '5 mil U$' },
      { titulo: 'Tú 2 · 6A2-2' },
      { titulo: 'Tú 3 · 6A2-2' },
      { titulo: '4 distribuidores *6A2*' },
    ],
  },

  /* ----------------------------------------------------------- p. 28 */
  {
    tipo: 'barras',
    titulo: 'De 6A23 / a *6A28*',
    unidad: 'U$',
    barras: [
      { etiqueta: '6A23', valor: 5000 },
      { etiqueta: '6A24', valor: 10000 },
      { etiqueta: '6A25', valor: 15000 },
      { etiqueta: '6A26', valor: 20000 },
      { etiqueta: '6A27', valor: 40000 },
      { etiqueta: '6A28', valor: 80000, destaca: true },
    ],
  },

  /* ----------------------------------------------------------- p. 29 */
  {
    tipo: 'foto',
    titulo: 'Una gran / *oportunidad*',
    texto: 'No existe negocio que con tan bajo riesgo nos dé tan altos beneficios.',
    src: '/kangen/1043/p29.jpg',
    alt: 'Una mano dibuja en una pizarra una flecha que sube sobre monedas, billetes y sacos de dinero',
  },

  /* ----------------------------------------------------------- p. 30 */
  {
    tipo: 'barras',
    tono: 'claro',
    rotulo: 'Puntos y comisiones',
    titulo: 'Puntos y / *comisiones*',
    unidad: 'En euros',
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
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'Puntos y comisiones',
    titulo: 'Para avanzar / de *nivel*',
    texto: 'Cada nivel, en dos columnas iguales, de arriba abajo.',
    puntos: [
      { titulo: '1A · 285 €', texto: '285 · 285 · 285 · 285 · 285 · 285 · 285 · 285' },
      { titulo: '2A · 570 €', texto: '570 · 570 · 570 · 570 · 570 · 570 · 570 · 285' },
      { titulo: '3A · 855 €', texto: '855 · 855 · 855 · 855 · 855 · 855 · 570 · 285' },
      { titulo: '4A · 1.140 €', texto: '1.140 · 1.140 · 1.140 · 1.140 · 1.140 · 855 · 570 · 285' },
      { titulo: '5A · 1.425 €', texto: '1.425 · 1.425 · 1.425 · 1.425 · 1.140 · 855 · 570 · 285' },
      { titulo: '*6A · 1.710 €*', texto: '101' },
    ],
  },

  /* ------------------------------------------------------- p. 31 a 33 */
  {
    tipo: 'cifras',
    rotulo: '1.ª meta: 6A · 100 máquinas',
    titulo: '¿Cuánto puedo ganar / en *Enagic*?',
    cifras: [
      { valor: 70, sufijo: ' mil €', texto: 'o 100 mil €.' },
      { valor: 7, sufijo: ' mil €', texto: 'a 10.000 €: media mensual, en 10 meses.' },
      { valor: 3500, sufijo: ' €', texto: 'a 5.000 €: media mensual, en 20 meses.' },
    ],
    fuente: '6 meses · 8 meses · 10 meses · 12 meses · 20 meses',
  },

  /* ----------------------------------------------------------- p. 34 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Formar nuevos / *6A2*',
    src: '/kangen/1043/p34.jpg',
    alt: 'Dos formadores explican unos paneles a un grupo sentado',
  },

  /* ----------------------------------------------------------- p. 35 */
  {
    tipo: 'pregunta',
    rotulo: 'Distribuidores 4A, 5A y 6A',
    titulo: '¿Cuánto puede ganar / un *6A2* en Enagic?',
    texto: 'Un 6A2 y sus dos 6A.',
  },

  /* ----------------------------------------------------------- p. 36 */
  {
    tipo: 'barras',
    tono: 'claro',
    titulo: '100 mil €, 200 mil €… / *700 mil €*, … mil €',
    unidad: 'En miles de euros',
    barras: [
      { valor: 100 },
      { valor: 200 },
      { valor: 300 },
      { valor: 400 },
      { valor: 500 },
      { valor: 600 },
      { valor: 700, destaca: true },
    ],
  },

  /* ----------------------------------------------------------- p. 37 */
  {
    tipo: 'cifras',
    titulo: '*700 mil €* / con un sueldo',
    cifras: [
      { valor: 58, sufijo: ' años', texto: 'Sueldo: 1.000 euros. 700 mil € = 700 meses.' },
      { valor: 38, sufijo: ' años', texto: 'Sueldo: 1.500 euros. 700 mil € = 466 meses.' },
      { valor: 30, sufijo: ' años', texto: 'Sueldo: 1.900 euros. 700 mil € = 368 meses.' },
    ],
  },

  /* ----------------------------------------------------------- p. 38 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'En España tenemos',
    valor: 34,
    titulo: '*6A2* activos',
  },

  /* ------------------------------------------------------- p. 39 y 40 */
  {
    tipo: 'barras',
    rotulo: 'En España, hasta enero de 2024',
    titulo: '34 distribuidores / *6A2* y *6A2-2*',
    texto: 'En estos valores no están los 6A2-3.',
    unidad: 'En miles de euros',
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

  /* ------------------------------------------------------- p. 41 y 42 */
  {
    tipo: 'barras',
    tono: 'claro',
    rotulo: 'Distribuidores 4A, 5A y 6A',
    titulo: '¿Cuánto puede ganar / un *6A2* en Enagic?',
    texto: '180 mil € a 685 mil €.',
    unidad: 'En miles de euros',
    barras: [
      { valor: 180 },
      { valor: 275 },
      { valor: 360 },
      { valor: 480 },
      { valor: 685, destaca: true },
    ],
  },

  /* ----------------------------------------------------------- p. 43 */
  {
    tipo: 'imagen',
    titulo: 'Formar nuevos / *6A2*',
    src: '/kangen/1043/p34.jpg',
    alt: 'Dos formadores explican unos paneles a un grupo sentado',
  },

  /* ----------------------------------------------------------- p. 44 */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'Máx. 1 h y 30 min',
    titulo: 'Presentación del negocio / Enagic *Kangen*',
    pasos: true,
    puntos: [
      { titulo: 'Candidato al negocio', texto: 'Crear vínculos.' },
      { titulo: 'Presentación de la máquina' },
      { titulo: 'Resultados: agua *Kangen*', texto: '¡Quien lo ve, lo ve!' },
      { titulo: 'Presentación del negocio' },
      { titulo: '«Jubilación»: 3 a 6 años', texto: '6A2-3 · 6A2-4' },
    ],
  },

  /* ----------------------------------------------------------- p. 45 */
  {
    tipo: 'lista',
    titulo: 'Es un / *proceso*…',
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

  /* ----------------------------------------------------------- p. 46 */
  {
    tipo: 'lista',
    tono: 'claro',
    titulo: '*Reclutamiento*',
    puntos: [
      { titulo: 'Presentación tú a tú' },
      { titulo: 'Acción masiva' },
      { titulo: 'Mentoría' },
      { titulo: 'Taller de Producto' },
      { titulo: 'Taller de Negocio' },
      { titulo: '*Curso Avanzado*' },
    ],
  },
  {
    tipo: 'lista',
    titulo: '*Formación*',
    puntos: [
      { titulo: 'Cómo formar un distribuidor' },
      { titulo: '*Curso de Excelencia*' },
      { titulo: 'Curso 360' },
      { titulo: 'Taller de Producto' },
      { titulo: 'Taller de Negocio' },
      { titulo: 'Zoom grabado' },
      { titulo: 'Encuentro de Instructores' },
      { titulo: 'Desayuno 6A2' },
      { titulo: 'Curso ProAtivo' },
      { titulo: '*Curso Avanzado*' },
    ],
  },
  {
    tipo: 'lista',
    tono: 'claro',
    titulo: 'Generar / *energía*',
    puntos: [
      { titulo: 'Llamadas telefónicas' },
      { titulo: 'Elogios sinceros' },
      { titulo: 'Curso 360' },
      { titulo: 'Celebración' },
      { titulo: 'Cena' },
      { titulo: 'Encuentro de Instructores' },
      { titulo: 'Fiesta' },
      { titulo: 'Curso Avanzado' },
      { titulo: 'Reconocimientos', texto: 'Trofeos, cheques, certificados.' },
      { titulo: 'Viajes al Curso Avanzado' },
      { titulo: '*Viajes internacionales a convenciones*' },
    ],
  },

  /* ----------------------------------------------------------- p. 47 */
  {
    tipo: 'linea',
    rotulo: 'Marzo de 2024',
    titulo: 'Programación / de *eventos*',
    hitos: [
      { cuando: '1 y 2 de marzo de 2024', que: 'Curso Avanzado', texto: 'Madrid' },
      { cuando: '7 de marzo', que: 'Mentoría' },
      { cuando: '16 y 17 de marzo', que: 'Curso de Excelencia y 360' },
      { cuando: '23 de marzo', que: 'Curso ProAtivo' },
    ],
  },
  {
    tipo: 'linea',
    tono: 'claro',
    rotulo: 'Abril y mayo de 2024',
    titulo: 'Programación / de *eventos*',
    hitos: [
      { cuando: '6 y 7 de abril', que: 'Curso de Excelencia y 360' },
      { cuando: '13 de abril', que: 'Taller de Productos' },
      { cuando: '24 de abril', que: 'Mentoría' },
      { cuando: '4 y 5 de mayo', que: 'Curso de Excelencia y 360' },
      { cuando: '16 de mayo', que: 'Mentoría' },
      { cuando: '25 de mayo', que: 'Curso ProAtivo' },
    ],
  },
  {
    tipo: 'linea',
    rotulo: 'Junio, julio y agosto de 2024',
    titulo: 'Programación / de *eventos*',
    hitos: [
      { cuando: '8 y 9 de junio', que: 'Curso de Excelencia y 360' },
      { cuando: '12 al 24 de junio', que: '*Japón*' },
      { cuando: '29 de junio', que: 'Mentoría' },
      { cuando: '13 y 14 de julio', que: 'Curso de Excelencia y 360' },
      { cuando: '27 de julio', que: 'Taller de Negocios' },
      { cuando: '10 de agosto', que: 'Mentoría' },
    ],
  },
  {
    tipo: 'linea',
    tono: 'claro',
    rotulo: 'De agosto a octubre de 2024',
    titulo: 'Programación / de *eventos*',
    hitos: [
      { cuando: '24 de agosto', que: 'Curso ProAtivo' },
      { cuando: '7 y 8 de septiembre', que: 'Curso de Excelencia y 360' },
      { cuando: '29 de septiembre', que: 'Mentoría', texto: 'Invitación C. Avanzado' },
      { cuando: '17 al 20 de octubre', que: 'Turismo', texto: 'San Sebastián, Bilbao. Pinchos.' },
      { cuando: '18 y 19 de octubre de 2024', que: '*Curso Avanzado*', texto: 'San Sebastián' },
    ],
    pie: 'Objetivo: 6A, 6A2, 6A2-2, 6A2-3.',
  },
];
