/**
 * EL PDF 1073 «DISCIPLINA VALE MÁS QUE TALENTO», DIAPOSITIVA A DIAPOSITIVA
 *
 * Mismo orden y misma información que el PDF de Mentoría. Sólo se han
 * corregido tildes, erratas y gramática («REACIÓN» → «reacción», «tu nunca
 * empezará» → «tú nunca empezarás», y los pasos de la p. 9 pasan todos a tú).
 *
 * Las imágenes están en `public/kangen/1073/pNN.jpg`, con el número de la
 * página del PDF.
 */
import type { Diapo } from './kangen';

export const DIAPOS_1073: Diapo[] = [
  { tipo: 'capitulo', numero: '05', titulo: 'La disciplina / vale más que el *talento*' },

  /* p. 1 */
  {
    tipo: 'imagen',
    tono: 'claro',
    rotulo: 'Disciplina',
    titulo: 'Dejar de recibir un placer *inmediato* / para recibir un beneficio *futuro*',
    texto: 'Este comportamiento genera éxito en cualquier área de tu vida.',
    src: '/kangen/1073/p01.jpg',
    alt: 'Ilustración: una mujer junto a un móvil con un reloj, un calendario, un reloj de arena, una diana y un trofeo',
  },

  /* p. 2 */
  {
    tipo: 'imagen',
    titulo: 'Estar comprometido / con tu *objetivo*',
    texto: 'Tener claro dónde quieres llegar y poner todo tu foco en lograrlo.',
    src: '/kangen/1073/p02.jpg',
    alt: 'Ilustración: una persona con un reloj, una diana y un calendario; una flecha de puntos lleva hasta una estrella dorada con «6A2-3»',
  },

  /* p. 3 */
  {
    tipo: 'cifras',
    tono: 'claro',
    rotulo: 'Motivación × disciplina',
    titulo: 'Una cerilla / *vs.* una vela',
    cifras: [
      { valor: 1, sufijo: ' %', texto: 'Motivación.' },
      { valor: 99, sufijo: ' %', texto: 'Disciplina.' },
    ],
  },

  /* p. 4 */
  {
    tipo: 'lista',
    titulo: 'Disciplina / no es / *motivación*',
    pasos: true,
    puntos: [
      { titulo: 'Tengo que estar motivado para hacer las llamadas' },
      { titulo: 'Tengo que estar motivado para hacer presentaciones' },
      { titulo: 'Tengo que estar motivado para ir a las reuniones' },
      { titulo: 'Tengo que estar motivado para estudiar la plataforma' },
    ],
  },

  /* p. 5 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: 'A cada *acción* / provocamos / una *reacción*',
    src: '/kangen/1073/p05.jpg',
    alt: 'Un péndulo de Newton: una bola se separa de las otras cuatro',
  },

  /* p. 6 */
  {
    tipo: 'cifra',
    rotulo: 'Just do it.',
    valor: 100,
    sufijo: ' %',
    titulo: 'de *disciplina*',
    texto: 'Una persona sin talento, pero con 100 % de disciplina, puede llegar donde quiera.',
  },

  /* p. 7 */
  {
    tipo: 'foto',
    src: '/kangen/1073/p07.jpg',
    alt: 'Un hombre con los brazos abiertos en la cima de una montaña, al amanecer',
    titulo: 'Sin compromiso, tú nunca empezarás, / pero sin disciplina, / tú nunca *terminarás*',
    foco: '40% 50%',
  },

  /* p. 8 */
  {
    tipo: 'imagen',
    tono: 'claro',
    titulo: '¿Aquí hay *disciplina*? / ¿O es solamente / un talento natural?',
    src: '/kangen/1073/p08.jpg',
    alt: 'Dos deportistas celebrando con los puños en alto: un tenista y un futbolista con la camiseta de Portugal',
  },

  /* p. 9 */
  {
    tipo: 'lista',
    titulo: '¿Qué buscas / para tu *futuro*?',
    pasos: true,
    puntos: [
      { titulo: 'Haz lo que debe ser hecho', texto: 'Repite la acción.' },
      { titulo: 'Entrena tu mente' },
      { titulo: 'Vuelve a repetir la acción' },
      { titulo: 'Analiza' },
      { titulo: 'Reconoce tu victoria' },
      { titulo: 'Transforma esa acción en una actitud' },
      { titulo: 'La actitud se transforma en hábito' },
      { titulo: 'El hábito se transforma en *éxito*' },
    ],
  },

  /* p. 10 */
  {
    tipo: 'foto',
    src: '/kangen/1073/p10.jpg',
    alt: 'Unas manos sostienen una bombilla encendida rodeada de puntos de luz',
    titulo: 'El éxito está / en tus actos *diarios*',
  },
];
