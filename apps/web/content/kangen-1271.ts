/**
 * ============================================================================
 * CAPÍTULO 04 · MODELO DE COMPENSACIÓN: RENTA SOSTENIBLE (PDF 1271)
 * ============================================================================
 *
 * El PDF de 75 páginas, en el mismo orden y con el mismo contenido. Las tablas
 * de puntos que se iban llenando salen una diapositiva por cada paso con un
 * dato nuevo; los pasos que sólo cambiaban un resaltado van juntos. Las
 * cifras, tal cual vienen: las comisiones en euros y la retirada mensual del
 * asociado en dólares, como en el original.
 *
 * El original escribe «6A23» en los esquemas y «6A2-3» en el texto: aquí va
 * siempre «6A2-3». Y «U$» va como «US$».
 */

import type { Diapo } from './kangen';

export const DIAPOS_1271: Diapo[] = [
  { tipo: 'capitulo', numero: '04', titulo: 'Modelo de compensación: / renta *sostenible*' },

  /* ------------------------------------------------- PUNTOS Y COMISIONES */

  /* Pág. 1 */
  {
    tipo: 'barras',
    tono: 'claro',
    rotulo: 'Puntos y comisiones',
    titulo: '285 € · *8 puntos*',
    texto: 'En 2A: 570 €.',
    unidad: 'En euros',
    barras: [
      { etiqueta: '1A', valor: 285 },
      { etiqueta: '2A', valor: 570, destaca: true },
    ],
  },

  /* Pág. 2 */
  {
    tipo: 'cifra',
    rotulo: '2A · 2P',
    valor: 10,
    titulo: '*máquinas*',
  },

  /* Pág. 3 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: '10 máquinas',
    valor: 5700,
    sufijo: ' €',
    titulo: 'en *2A*',
  },

  /* Pág. 4 */
  {
    tipo: 'barras',
    rotulo: 'Puntos y comisiones',
    titulo: '10 ventas / *combinadas*',
    texto: 'Ventas 1 a 6, en 1A. Ventas 7 a 10, en 2A.',
    unidad: 'En euros',
    barras: [
      { etiqueta: '1A', valor: 285 },
      { etiqueta: '2A', valor: 570 },
      { etiqueta: '3A', valor: 855, destaca: true },
    ],
  },

  /* Pág. 5 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'Puntos y comisiones',
    valor: 11,
    prefijo: 'Venta ',
    titulo: 'ya en *3A*: 855 €',
  },

  /* Pág. 6 */
  {
    tipo: 'cifra',
    valor: 8,
    sufijo: ' puntos',
    titulo: 'para avanzar / de *nivel*',
    texto: '1A: 285 €. 2A: 570 €. 3A: 855 €.',
  },

  /* Pág. 7 */
  {
    tipo: 'barras',
    tono: 'claro',
    rotulo: 'Puntos y comisiones',
    titulo: '20 ventas / *combinadas*',
    texto: '1A: ventas 1 a 6 y 11 a 14. 2A: 7 a 10 y 15 a 17. 3A: 18 a 20.',
    unidad: 'En euros',
    barras: [
      { etiqueta: '1A', valor: 285 },
      { etiqueta: '2A', valor: 570 },
      { etiqueta: '3A', valor: 855 },
      { etiqueta: '4A', valor: 1140, destaca: true },
    ],
  },

  /* Pág. 8 */
  {
    tipo: 'cifra',
    rotulo: 'Puntos y comisiones',
    valor: 21,
    prefijo: 'Venta ',
    titulo: 'ya en *4A*: 1.140 €',
  },

  /* Pág. 9 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: '4A · 4P',
    valor: 1140,
    sufijo: ' €',
    titulo: 'una venta en *4A*',
  },

  /* Págs. 10-11 */
  {
    tipo: 'cifra',
    rotulo: '4A · 4P',
    valor: 10,
    titulo: '*máquinas*',
  },

  /* Pág. 12 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: '10 máquinas',
    valor: 11400,
    sufijo: ' €',
    titulo: 'en *4A*',
  },

  /* Págs. 13-14 */
  {
    tipo: 'barras',
    rotulo: 'Puntos y comisiones',
    titulo: '50 ventas / *combinadas*',
    texto: 'Para avanzar de nivel: 8 puntos.',
    unidad: 'En euros',
    barras: [
      { etiqueta: '1A', valor: 285 },
      { etiqueta: '2A', valor: 570 },
      { etiqueta: '3A', valor: 855 },
      { etiqueta: '4A', valor: 1140 },
      { etiqueta: '5A', valor: 1425, destaca: true },
    ],
  },

  /* Pág. 15 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'Puntos y comisiones',
    valor: 51,
    prefijo: 'Venta ',
    titulo: 'ya en *5A*: 1.425 €',
  },

  /* Págs. 16-17 */
  {
    tipo: 'barras',
    rotulo: 'Puntos y comisiones',
    titulo: '100 ventas / *combinadas*',
    texto: 'Para avanzar de nivel: 8 puntos.',
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

  /* Pág. 18 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'Puntos y comisiones',
    valor: 101,
    prefijo: 'Venta ',
    titulo: 'ya en *6A*: 1.710 €',
  },

  /* Pág. 19 */
  {
    tipo: 'cifra',
    rotulo: '6A · 1.710 €',
    valor: 5,
    titulo: 'nuevos *distribuidores*',
  },

  /* Pág. 20 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: '5 nuevos distribuidores',
    valor: 2,
    titulo: 'ventas al *mes*',
  },

  /* Pág. 21 */
  {
    tipo: 'cifra',
    rotulo: '5 nuevos distribuidores · 2 ventas al mes',
    valor: 10,
    titulo: 'máquinas al *mes*',
  },

  /* Pág. 22 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: '10 máquinas al mes',
    valor: 17100,
    sufijo: ' €',
    titulo: 'en *6A*',
  },

  /* ------------------------------------------------------- PARA EMPEZAR */

  /* Pág. 23 */
  {
    tipo: 'lista',
    rotulo: 'Para empezar',
    titulo: 'Cambia tu agua, / ¡cambia tu *vida*!',
    texto: 'Con Mentor 6A2-3, rompe tus límites.',
    pasos: true,
    puntos: [
      { titulo: 'Rellena tu formulario de *pedido*', texto: 'Con el modelo K8 o Platinum, y ¡disfruta de los beneficios del agua Kangen!' },
      { titulo: 'Inscríbete en la plataforma de *formación*', texto: 'www.mentor6a23.com' },
    ],
  },

  /* Pág. 24 */
  {
    tipo: 'lista',
    tono: 'claro',
    rotulo: '02. Formación',
    titulo: 'Curso de formación / *básica*',
    texto: 'Formación online básica (preparación, formación y formar un nuevo distribuidor), con test. Tiempo de finalización: 6 días, 9 horas y 50 minutos. 183 miembros. Última actualización: 19/12/2024.',
    puntos: [
      { titulo: '1009 · Presentación e introducción', texto: 'Láminas presentación de producto. Resultados agua Kangen 2018. Presentación de negocios Platinum 2023.' },
      { titulo: '1010 · Antioxidante' },
      { titulo: '1011 · Alcalinidad' },
      { titulo: '1012 · Microestructurada' },
      { titulo: '1013 · Tipos de agua Kangen' },
      { titulo: '1014 · Superalcalina' },
      { titulo: '1015 · Resultados Kangen' },
      { titulo: '1016 · Presentación de negocios: introducción' },
      { titulo: '1017 · Presentación de negocio, parte 1' },
      { titulo: '1018 · Presentación de negocios, parte 2' },
      { titulo: '1019 · Claves de *cierre*' },
    ],
  },

  /* ------------------------------------------------------- EL OBJETIVO */

  /* Pág. 25 */
  {
    tipo: 'foto',
    src: '/kangen/1271/p25.jpg',
    alt: 'Una pareja de jubilados de madera junto a pilas de monedas bajo un paraguas',
    rotulo: 'Objetivo',
    titulo: 'Llegar a *6A2-3*',
  },

  /* Págs. 26-36 */
  {
    tipo: 'cifras',
    tono: 'claro',
    rotulo: 'Objetivo: llegar a 6A2-3',
    titulo: '2 + 4 + 8: / *14* personas',
    cifras: [
      { valor: 2, texto: '6A2-2. Primer nivel.' },
      { valor: 4, texto: '6A2. Segundo nivel.' },
      { valor: 8, texto: '6A. Tercer nivel.' },
    ],
    fuente: 'Un 6A: 100 ventas combinadas.',
  },

  /* ------------------------------------------------- EL NIVEL ASOCIADO */

  /* Pág. 37 */
  {
    tipo: 'frase',
    rotulo: '4.ª forma: nivel «asociado»',
    titulo: 'A partir de 6A2-3 / pasas al nivel de *asociado*',
    texto: 'Ya no solo eres considerado distribuidor. Has demostrado ser una persona especialmente comprometida con Enagic.',
  },

  /* Págs. 38-39 */
  {
    tipo: 'barras',
    tono: 'claro',
    rotulo: 'Asociado',
    titulo: 'Retirada / *mensual*',
    unidad: 'En dólares (US$)',
    barras: [
      { etiqueta: '6A2-3', valor: 5000, destaca: true },
      { etiqueta: '6A2-4', valor: 10000 },
      { etiqueta: '6A2-5', valor: 15000 },
      { etiqueta: '6A2-6', valor: 20000 },
      { etiqueta: '6A2-7', valor: 40000 },
      { etiqueta: '6A2-8', valor: 80000 },
    ],
  },

  /* Págs. 40-48 */
  {
    tipo: 'lista',
    rotulo: '4.ª forma: nivel «asociado»',
    titulo: 'De 6A2-3 / a *6A2-4*',
    pasos: true,
    puntos: [
      { titulo: '6A2-3: *5 mil US$*', texto: 'Por debajo, dos 6A2-2, cuatro 6A2 y ocho 6A.' },
      { titulo: 'Un 6A2-2 llega a 6A2-3', texto: '5 mil US$.' },
      { titulo: 'El otro 6A2-2 llega a 6A2-3', texto: '5 mil US$.' },
      { titulo: 'Arriba, *6A2-4*: 10 mil US$', texto: 'Por debajo: 2, 4, 8 y 16.' },
    ],
  },

  /* Pág. 49 */
  {
    tipo: 'lista',
    tono: 'claro',
    titulo: '¿Cuál es el camino más corto / para el 6A2-3 y el *6A2-4*?',
    texto: '4 personas 6A2, u 8 personas 6A.',
    puntos: [
      { titulo: 'Tú 1: *6A2-3*' },
      { titulo: 'Tú 2: 6A2-2' },
      { titulo: 'Tú 3: 6A2-2' },
      { titulo: 'Por debajo: 4 × 6A2' },
    ],
  },

  /* Págs. 50-51 */
  {
    tipo: 'cifras',
    rotulo: 'Tú 1, tú 2 y tú 3',
    titulo: 'El camino más corto / al *6A2-4*',
    cifras: [
      { valor: 10, sufijo: ' mil US$', texto: 'Tú 1: 6A2-4.' },
      { valor: 5, sufijo: ' mil US$', texto: 'Tú 2: 6A2-3.' },
      { valor: 5, sufijo: ' mil US$', texto: 'Tú 3: 6A2-3.' },
    ],
    fuente: 'Por debajo: 2, 4, 8 y 16.',
  },

  /* Pág. 52 */
  {
    tipo: 'cifra',
    tono: 'claro',
    rotulo: 'Mantra 5 personas',
    valor: 20,
    sufijo: ' mil US$',
    titulo: 'de retirada *mensual*',
  },

  /* ------------------------------------------------------- LAS FRASES */

  /* Pág. 53 */
  { tipo: 'frase', centrada: true, titulo: 'El éxito llega para todos aquellos / que están ocupados *buscándolo*.' },
  /* Pág. 54 */
  { tipo: 'frase', tono: 'claro', centrada: true, titulo: 'Todo lo que quieres está / al otro lado del *miedo*.' },
  /* Pág. 55 */
  { tipo: 'frase', centrada: true, titulo: 'La primera regla del éxito / es una buena *preparación*.' },
  /* Pág. 56 */
  { tipo: 'frase', tono: 'claro', centrada: true, titulo: 'La confianza en ti mismo / es el primer secreto del *éxito*.' },
  /* Pág. 57 */
  { tipo: 'frase', centrada: true, titulo: 'No tengas miedo de renunciar / a lo bueno para ir / a por lo *grandioso*.' },
  /* Pág. 58 */
  { tipo: 'frase', tono: 'claro', centrada: true, titulo: 'Tu único límite / es tu *mente*.' },
  { tipo: 'frase', centrada: true, titulo: 'Elimina de tu mente el «no puedo» / y todo *cambiará*.' },
  /* Pág. 59 */
  { tipo: 'frase', tono: 'claro', centrada: true, titulo: 'El 50 % del éxito es ser positivo, / el resto es *dedicación*.' },
  /* Pág. 60 */
  { tipo: 'frase', centrada: true, titulo: 'No tienes que ser grande para empezar, / pero tienes que empezar / para ser *grande*.' },
  /* Pág. 61 */
  { tipo: 'frase', tono: 'claro', centrada: true, titulo: 'Todo es posible en la medida / en que tú creas / que es *posible*.' },
  /* Pág. 62 */
  { tipo: 'frase', centrada: true, titulo: 'El camino para el éxito / es la *actitud*.' },

  /* ------------------------------------------------------- EL CIERRE */

  /* Págs. 63-72 */
  {
    tipo: 'acertijo',
    rotulo: 'Crecimiento exponencial · Se duplican cada día',
    titulo: 'Los nenúfares llenan el estanque / el día 30. ¿Qué día / estaba *a la mitad*?',
    respuesta: 'El día 29',
    src: '/kangen/nenufares.jpg',
    alt: 'Nenúfares gigantes en un estanque',
  },

  /* Pág. 73 */
  {
    tipo: 'frase',
    tono: 'claro',
    centrada: true,
    titulo: '¿Quieres solo vender, o quieres / construir un *ingreso sostenible*?',
  },

  /* Pág. 74 */
  { tipo: 'pregunta', titulo: '¿Qué quieres hacer *ahora*?' },

  /* Pág. 75 */
  {
    tipo: 'frase',
    tono: 'claro',
    centrada: true,
    titulo: 'Un líder crea más *líderes*, / no seguidores.',
  },
];
