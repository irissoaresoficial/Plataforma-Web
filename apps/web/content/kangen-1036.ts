/**
 * ============================================================================
 * CAPÍTULO 03 · KANGEN Y EL MEDIO AMBIENTE (PDF 1036)
 * ============================================================================
 *
 * El PDF de 96 páginas, en el mismo orden y con el mismo contenido. Lo que
 * en el original era una animación (el gráfico circular que se completa, la
 * pregunta de las toneladas, las fotos seguidas de un mismo bloque) aquí es
 * una sola diapositiva. Las cifras van tal cual vienen en el PDF.
 *
 * El gráfico circular de las cuatro consecuencias vuelve en los mismos puntos
 * que en el original (págs. 20, 49-50, 60-61, 66-67 y 76), cada vez con el
 * cuarto que le toca.
 */

import type { Diapo } from './kangen';

export const DIAPOS_1036: Diapo[] = [
  /* Pág. 1 */
  { tipo: 'capitulo', numero: '03', titulo: 'Kangen y el / *medio ambiente*' },

  /* Pág. 2 */
  {
    tipo: 'foto',
    src: '/kangen/oceano.jpg',
    alt: 'Una mancha de basura de plástico flotando en el mar, vista desde arriba',
    titulo: 'Plásticos / en el *océano*',
  },

  /* Pág. 3 */
  {
    tipo: 'imagen',
    tono: 'claro',
    src: '/kangen/1036/p03.jpg',
    alt: 'Un vaso de plástico blanco y una botella de agua de plástico',
  },

  /* Pág. 4 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p04.jpg',
    alt: 'Una playa cubierta de plástico bajo un cielo nublado',
    rotulo: 'Cómo llegan los plásticos al mar',
    titulo: 'Pueden ser arrastrados / al mar o a los *ríos*',
    texto: 'Debido al viento y la lluvia.',
  },

  /* Pág. 5 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'Tipos de plásticos en el mar',
    valor: 80,
    sufijo: ' %',
    titulo: 'de la basura marina / son *plásticos*',
  },

  /* Pág. 6 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p06.jpg',
    alt: 'Una montaña de basura con gaviotas volando encima',
    titulo: 'Mares de plásticos / en *2050*',
  },

  /* Pág. 7 */
  {
    tipo: 'quiz',
    tono: 'claro',
    titulo: 'De aquí en 50 años / va a *existir*:',
    opciones: ['¿Coche que vuela?', '¿Teletransporte?', '¿El vaso de plástico que tiraste hoy?'],
    correcta: 2,
  },

  /* Págs. 8-9 */
  {
    tipo: 'quiz',
    titulo: '¿Cuánto plástico tenemos ya acumulado / en nuestros *mares y océanos*?',
    opciones: ['50 millones de toneladas', '100 millones de toneladas', '150 millones de toneladas'],
    correcta: 2,
  },

  /* Págs. 10-11 */
  {
    tipo: 'cifra',
    tono: 'claro',
    valor: 150,
    titulo: 'millones de *coches*',
    texto: 'Cada coche, 1 tonelada.',
  },

  /* Pág. 12 */
  {
    tipo: 'cifras',
    titulo: 'Problemas causados por / los residuos del *plástico*',
    cifras: [
      { valor: 150, sufijo: ' M', texto: 'Más de 150 millones de toneladas de plástico existen actualmente en nuestros océanos.' },
      { valor: 12, prefijo: '4,8 a ', sufijo: ' M', texto: 'Una estimación de 4,8 a 12 millones de toneladas entra por año en nuestros océanos.' },
    ],
  },

  /* Pág. 13 */
  {
    tipo: 'cifra',
    tono: 'claro',
    valor: 12,
    prefijo: '5 a ',
    titulo: 'millones de *coches*',
  },

  /* Pág. 14 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p14.jpg',
    alt: 'Una isla de basura de plástico de colores en medio del mar',
    titulo: 'Islas de *plásticos*',
  },

  /* Págs. 15-16 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'Giro oceánico',
    valor: 5,
    titulo: 'islas de *plásticos*',
    texto: 'Existen 5 islas de plásticos. Una, en el océano Pacífico, entre Hawái y California.',
  },

  /* Pág. 17 */
  {
    tipo: 'cifras',
    rotulo: 'Océano Pacífico',
    titulo: 'El tamaño / de la *isla*',
    cifras: [
      { valor: 6, sufijo: ' M km²', texto: 'Más de 6 millones de kilómetros cuadrados.' },
      { valor: 80000, sufijo: ' t', texto: 'Pesando cerca de 80 mil toneladas.' },
      { valor: 1.5, decimales: 1, sufijo: ' M km²', texto: 'Más de 1,5 millones de kilómetros cuadrados.' },
    ],
  },

  /* Pág. 18 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'El área de esta isla',
    valor: 3,
    prefijo: 'x',
    titulo: 'el área total de Alemania, / España y *Francia*',
  },

  /* Pág. 19 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p19.jpg',
    alt: 'Una alfombra de basura flotando en el mar hasta el horizonte',
    titulo: 'Séptimo *continente*',
  },

  /* Pág. 20 · el gráfico circular, primer cuarto */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'El vaso y la botella',
    titulo: 'Consecuencias del / plástico en el *mar*',
    pasos: true,
    puntos: [{ titulo: 'Vida *marina*' }],
  },

  /* Págs. 21-23 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p23.jpg',
    alt: 'Una gaviota con una lata en el pico',
    rotulo: 'Aves marinas',
    titulo: 'Muerte de aves *marinas*',
  },

  /* Págs. 24-30 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p26.jpg',
    alt: 'Una tortuga con el caparazón deformado por una anilla de plástico',
    titulo: 'Tortuga *deformada*',
  },

  /* Págs. 31-33 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p33.jpg',
    alt: 'Una botella de plástico en el fondo del mar',
    titulo: 'Plástico encontrado en las / profundidades *marinas*',
  },

  /* Pág. 34 */
  {
    tipo: 'cifra',
    tono: 'claro',
    valor: 10898,
    sufijo: ' m',
    titulo: 'de profundidad, en la / Fosa de las *Marianas*',
  },

  /* Págs. 35-37 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p37.jpg',
    alt: 'Un tiburón ballena con la boca abierta',
    titulo: 'Tiburón ballena comiendo / trozos de *plásticos*',
    texto: '12 metros de longitud.',
  },

  /* Págs. 38-39 */
  {
    tipo: 'cifra',
    tono: 'claro',
    valor: 130,
    titulo: 'plásticos por *hora*',
    texto: 'Su existencia está en riesgo por culpa de la caza, pero principalmente por causa de los plásticos en el océano.',
  },

  /* Págs. 40-42 */
  {
    tipo: 'cifra',
    rotulo: 'Filipinas',
    valor: 40,
    sufijo: ' kg',
    titulo: 'de plástico dentro de la ballena, / en su *estómago*',
  },

  /* Pág. 43 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p43.jpg',
    alt: 'Una ballena muerta en la orilla',
    titulo: 'Muerte por deshidratación / y *hambre*',
  },

  /* Págs. 44-46 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p45.jpg',
    alt: 'Un cangrejo ermitaño metido en un envase de plástico',
    rotulo: 'Cangrejo ermitaño',
    titulo: 'Muerte masiva del / cangrejo *ermitaño*',
    texto: 'Reacciones en cadena.',
  },

  /* Págs. 47-48 */
  {
    tipo: 'cifras',
    tono: 'claro',
    titulo: 'Cangrejos ermitaños / *muertos*',
    cifras: [
      { valor: 508, sufijo: ' mil', texto: 'cangrejos ermitaños muertos.' },
      { valor: 500, prefijo: '+', texto: 'Solamente en un recipiente: más de 500 cangrejos muertos.' },
    ],
  },

  /* Págs. 49-50 · el gráfico circular, segundo cuarto */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'El vaso y la botella',
    titulo: 'Consecuencias del / plástico en el *mar*',
    pasos: true,
    puntos: [{ titulo: 'Vida *marina*' }, { titulo: 'Salud *humana*' }],
  },

  /* Pág. 51 */
  {
    tipo: 'frase',
    rotulo: 'Microplásticos y nanoplásticos',
    titulo: 'Liberan productos químicos / perjudiciales para la *vida marina*',
  },

  /* Págs. 52-53 */
  {
    tipo: 'frase',
    tono: 'claro',
    rotulo: 'Consecuencias de los plásticos en el mar',
    titulo: 'Los humanos también / ingerimos *plásticos*',
    texto: 'Como consecuencia de la cadena alimenticia.',
  },

  /* Pág. 54 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p54.jpg',
    alt: 'Una mano sujetando un salero',
    titulo: 'Fueron encontrados microplásticos / en diversos tipos de *sal de cocina*',
  },

  /* Pág. 55 */
  {
    tipo: 'frase',
    tono: 'claro',
    titulo: 'En el cerebro, los microplásticos / causan *oxidación* en las neuronas',
    texto: 'Las neuronas responsables de diversos tipos de dolores cerebrales.',
  },

  /* Pág. 56 */
  {
    tipo: 'frase',
    rotulo: 'Bisfenol (BPA)',
    titulo: 'Responsable de trastornos hormonales, / *cáncer de mama*, esterilidad / y disfunción eréctil',
  },

  /* Pág. 57 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: '*Nanoplásticos*',
    src: '/kangen/1036/p57.jpg',
    alt: 'Nanoplásticos vistos al microscopio, con una escala de 500 nanómetros',
  },

  /* Págs. 58-59 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p58.jpg',
    alt: 'Una doble hélice de ADN',
    titulo: 'Pueden causar daños / a nuestro *ADN*',
  },

  /* Págs. 60-61 · el gráfico circular, tercer cuarto */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'El vaso y la botella',
    titulo: 'Consecuencias del / plástico en el *mar*',
    pasos: true,
    puntos: [{ titulo: 'Vida *marina*' }, { titulo: 'Salud *humana*' }, { titulo: 'Economía y problemas *sociales*' }],
  },

  /* Pág. 62 */
  {
    tipo: 'frase',
    rotulo: 'Consecuencias del plástico en el mar',
    titulo: 'Afecta al turismo y a los / sectores de la *pesca*, entre otros',
  },

  /* Pág. 63 */
  {
    tipo: 'foto',
    src: '/kangen/pesca.jpg',
    alt: 'Pescadores recogiendo una red desde una barca',
    titulo: '1 millón de familias depende / de la pesca para *sobrevivir*',
  },

  /* Pág. 64 */
  {
    tipo: 'cifra',
    tono: 'claro',
    valor: 295,
    titulo: 'millones de personas / dependen del *turismo*',
    texto: 'En innumerables comunidades locales, que están siendo afectadas por la polución.',
  },

  /* Pág. 65 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p65.jpg',
    alt: 'Un pueblo de pescadores con barcas en la orilla',
    titulo: 'Las comunidades más necesitadas / están *afectadas*',
  },

  /* Págs. 66-67 · el gráfico circular, completo */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'El vaso y la botella',
    titulo: 'Consecuencias del / plástico en el *mar*',
    pasos: true,
    puntos: [
      { titulo: 'Vida *marina*' },
      { titulo: 'Salud *humana*' },
      { titulo: 'Economía y problemas *sociales*' },
      { titulo: 'Inseguridad alimentaria y *hambre*' },
    ],
  },

  /* Pág. 68 */
  {
    tipo: 'cifra',
    rotulo: '2050',
    valor: 70,
    prefijo: '+',
    sufijo: ' %',
    titulo: 'tendrá que aumentar / la producción de *alimentos*',
    texto: 'Se espera que la población mundial alcance casi 10.000 millones de personas en 2050. La gran pregunta es: ¿seremos capaces de alcanzar esta marca?',
    fuente: 'Según la Organización de las Naciones Unidas para la Agricultura y la Alimentación (FAO)',
  },

  /* Pág. 69 */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'Agricultura',
    titulo: 'Podemos llegar al límite / de producción de *alimentos*',
    puntos: [
      { titulo: 'Recursos *naturales*', texto: 'Las prácticas agrícolas consumen la mayor parte de los recursos naturales disponibles en el planeta.' },
      { titulo: 'Espacio *físico*' },
    ],
  },

  /* Pág. 70 */
  {
    tipo: 'pregunta',
    rotulo: 'Hambre',
    titulo: '¿Cómo puede ser resuelto / ese gran *problema*?',
  },

  /* Pág. 71 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'Racionamiento / de *alimentos*',
    src: '/kangen/1036/p71.jpg',
    alt: 'Raciones de comida con etiquetas de peso: 50 g, 100 g, 85 g, 450 g y 225 g',
  },

  /* Pág. 72 */
  {
    tipo: 'foto',
    src: '/kangen/oceano.jpg',
    alt: 'Una mancha de basura de plástico flotando en el mar, vista desde arriba',
    titulo: '¿Plásticos en los *océanos*?',
  },

  /* Pág. 73 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'Una pesca sana',
    valor: 10000,
    titulo: 'millones de *personas*',
    texto: 'Una pesca sana y el uso sostenible de los recursos de nuestros océanos pueden alimentar a 10.000 millones de personas.',
  },

  /* Pág. 74 */
  {
    tipo: 'foto',
    src: '/kangen/1036/p74.jpg',
    alt: 'Una isla rodeada de arrecifes y mar turquesa, vista desde el aire',
    titulo: 'Fuente de alimento: / *océano*',
  },

  /* Pág. 76 · el gráfico circular, otra vez completo */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'El vaso y la botella',
    titulo: 'Consecuencias del / plástico en el *mar*',
    pasos: true,
    puntos: [
      { titulo: 'Vida *marina*' },
      { titulo: 'Salud *humana*' },
      { titulo: 'Economía y problemas *sociales*' },
      { titulo: 'Inseguridad alimentaria y *hambre*' },
    ],
  },

  /* Pág. 77 */
  {
    tipo: 'pregunta',
    titulo: '¿Y tú? ¿Qué has hecho para reducir / el *plástico* en el mar?',
  },

  /* Págs. 78-79 */
  {
    tipo: 'imagen',
    tono: 'claro',
    rotulo: 'Soluciones para el plástico en el mar',
    titulo: 'Reducir el consumo de plásticos / y evitar los *desechables*',
    src: '/kangen/k8-botellas.jpg',
    alt: 'Un ionizador Kangen K8 y dos botellas reutilizables',
  },

  /* Pág. 80 */
  {
    tipo: 'cifra',
    rotulo: 'Se estima',
    valor: 50,
    sufijo: ' kg',
    titulo: 'de vasos y garrafas de plástico / desecha una persona al *año*',
    texto: 'En nuestro planeta.',
  },

  /* Págs. 82-83 */
  {
    tipo: 'cifra',
    tono: 'claro',
    valor: 200,
    sufijo: ' kg/año',
    titulo: 'una familia de *4 personas*',
  },

  /* Pág. 85 · el mapa */
  {
    tipo: 'cifra',
    rotulo: 'Mercado',
    valor: 743,
    titulo: 'millones de población / en *Europa*',
  },

  /* Pág. 85 · la presentación del negocio */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: 'Mercado',
    titulo: 'Presentación del negocio / Enagic *Kangen*',
    texto: 'Máximo 1 hora y 30 minutos.',
    puntos: [
      { titulo: 'Candidato al *negocio*', texto: 'Crear vínculos.' },
      { titulo: 'Presentación de la *máquina*' },
      { titulo: 'Resultados *agua Kangen*', texto: '¡Quien lo ve, lo ve!' },
      { titulo: 'Presentación del *negocio*' },
      { titulo: '«Jubilación»: de 3 a 6 años', texto: '6A2-3 y 6A2-4.' },
    ],
  },

  /* Págs. 86-91 */
  {
    tipo: 'frase',
    centrada: true,
    titulo: '¡El secreto es *aumentar* / los puntos de distribución!',
  },

  /* Págs. 92-93 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'Una persona',
    valor: 5,
    sufijo: ' mil',
    titulo: 'toneladas de plástico / por *año*',
  },

  /* Págs. 94-95 */
  {
    tipo: 'cifras',
    rotulo: 'Impacto del trabajo de una persona',
    titulo: '*5 mil* toneladas / de plástico al año',
    cifras: [
      { valor: 25000, texto: 'familias.' },
      { valor: 100000, texto: 'personas.' },
      { valor: 50, sufijo: ' kg', texto: 'por persona y año.' },
    ],
  },

  /* Pág. 96 */
  {
    tipo: 'frase',
    tono: 'claro',
    rotulo: 'Verdadera salud',
    titulo: 'La salud / *verdadera*',
    texto: '«La salud verdadera consiste en tener un cuerpo saludable, una mente saludable y una economía saludable…»',
    fuente: 'Hironari Oshiro',
  },
];
