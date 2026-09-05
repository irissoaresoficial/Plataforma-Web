/**
 * NUMEROLOGÍA PITAGÓRICA APLICADA A LECTURA TRANSGENERACIONAL
 * ------------------------------------------------------------------
 * Todo el cálculo del estudio vive aquí. Si Iris trabaja con alguna variante
 * distinta, se cambia en este archivo y el resto de la web no se entera.
 *
 * Convenciones que sigue (las estándar de la escuela pitagórica):
 *
 *  · Tabla de letras: A-I = 1-9, J-R = 1-9, S-Z = 1-8.
 *  · Camino de vida: se reduce por separado el día, el mes y el año, y luego
 *    se suman los tres. No se suma todo de golpe: el resultado puede cambiar.
 *  · Números maestros: 11, 22 y 33 no se reducen cuando aparecen.
 *  · Deudas kármicas: si un total, antes de reducirse, pasa por 13, 14, 16
 *    o 19, esa deuda queda señalada.
 *  · Lecciones kármicas: los dígitos del 1 al 9 que no aparecen en el nombre.
 *
 * La lectura transgeneracional no es un número más: es la comparación entre
 * dos perfiles para ver qué se repite de una generación a otra.
 */

const TABLA: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const VOCALES = 'aeiou';
const MAESTROS = [11, 22, 33];
const DEUDAS = [13, 14, 16, 19];
const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Quita tildes y todo lo que no sea una letra. La ñ se queda en n. */
export function limpiar(texto: string) {
  return (texto || '').normalize('NFD').replace(DIACRITICOS, '').toLowerCase().replace(/[^a-z]/g, '');
}

const sumaDigitos = (n: number) =>
  String(n)
    .split('')
    .reduce((a, d) => a + Number(d), 0);

/** Reduce a una cifra. Con `maestros`, se detiene en 11, 22 o 33. */
export function reducir(n: number, maestros = true): number {
  while (n > 9) {
    if (maestros && MAESTROS.includes(n)) return n;
    n = sumaDigitos(n);
  }
  return n;
}

/** Valor de un texto según la tabla. `solo` filtra vocales o consonantes. */
export function valorTexto(texto: string, solo?: 'vocales' | 'consonantes') {
  return limpiar(texto)
    .split('')
    .filter((c) => {
      if (solo === 'vocales') return VOCALES.includes(c);
      if (solo === 'consonantes') return !VOCALES.includes(c);
      return true;
    })
    .reduce((a, c) => a + (TABLA[c] || 0), 0);
}

/** Un número del estudio: el resultado y el total del que salió. */
export type Numero = { valor: number; bruto: number; deuda: number | null };

const construir = (bruto: number): Numero => ({
  valor: reducir(bruto),
  bruto,
  deuda: DEUDAS.includes(bruto) ? bruto : null,
});

/**
 * Camino de vida: lo que la persona viene a recorrer.
 * Se reduce día, mes y año por separado y después se suman.
 */
export function caminoDeVida(fechaISO: string): Numero & { dia: number; mes: number; anio: number } {
  const [y, m, d] = (fechaISO || '').split('-').map(Number);
  if (!y || !m || !d) return { valor: 0, bruto: 0, deuda: null, dia: 0, mes: 0, anio: 0 };

  const dia = reducir(d);
  const mes = reducir(m);
  const anio = reducir(sumaDigitos(y));
  const bruto = dia + mes + anio;

  // La deuda kármica se mira sobre el día de nacimiento sin reducir, que es
  // donde la señalan las escuelas pitagóricas, y sobre el total.
  const deuda = DEUDAS.includes(d) ? d : DEUDAS.includes(bruto) ? bruto : null;

  return { valor: reducir(bruto), bruto, deuda, dia, mes, anio };
}

/**
 * Los pasos del camino de vida, escritos para enseñarlos.
 *
 * Devuelve exactamente lo mismo que `caminoDeVida`, pero contando el camino:
 * qué se reduce primero, qué se suma después y dónde se para.
 *
 * POR QUÉ ESTÁ AQUÍ Y NO EN EL COMPONENTE QUE LO PINTA. Estuvo en el
 * componente, con su propia cuenta, y sumaba todos los dígitos de golpe. Eso
 * NO es el camino de vida —el aviso está diez líneas más arriba, en la
 * cabecera de este archivo— y daba otro resultado en el 13,8 % de las fechas.
 * Alguien nacido el 19 de enero de 1975 veía un 33 en la portada y un 6 en la
 * sinergia, dos pantallas después, y encima el 33 es el número que da nombre a
 * la escuela.
 *
 * Una web que echa la misma cuenta dos veces y le sale distinto no tiene un
 * fallo de programación: tiene un fallo de credibilidad, que es lo único que
 * vende aquí. Así que la cuenta vive una sola vez, y es ésta.
 */
export function pasosCaminoDeVida(dia: number, mes: number, anio: number): string[] {
  if (!dia || !mes || !anio) return [];

  const rd = reducir(dia);
  const rm = reducir(mes);
  const ra = reducir(sumaDigitos(anio));
  const pasos = [`${dia} · ${mes} · ${anio}`];

  // Sólo se enseña el paso de reducir si algo cambia de verdad. Con el 5 de
  // mayo, «5 · 5 · ...» dos veces seguidas parece que la animación se ha
  // colgado.
  if (rd !== dia || rm !== mes || ra !== anio) pasos.push(`${rd} · ${rm} · ${ra}`);

  const bruto = rd + rm + ra;
  pasos.push(`${rd}+${rm}+${ra}`);
  pasos.push(String(bruto));

  // Y ahora se pliega el total, enseñando cada vuelta, hasta la cifra o hasta
  // un maestro. `reducir` es quien manda: aquí sólo se narra lo que hace.
  let n = bruto;
  while (reducir(n) !== n) {
    const partes = String(n).split('');
    pasos.push(partes.join('+'));
    n = partes.reduce((s, c) => s + Number(c), 0);
    pasos.push(String(n));
  }

  // Si el total ya era la respuesta, el «bruto» y el resultado son el mismo
  // número dos veces seguidas: sobra uno.
  return pasos.filter((p, i) => i === 0 || p !== pasos[i - 1]);
}

/** Expresión: cómo se mueve por el mundo. Sale del nombre completo. */
export const expresion = (nombre: string) => construir(valorTexto(nombre));

/** Alma: lo que de verdad le mueve por dentro. Solo las vocales. */
export const alma = (nombre: string) => construir(valorTexto(nombre, 'vocales'));

/** Personalidad: lo que los demás ven. Solo las consonantes. */
export const personalidad = (nombre: string) => construir(valorTexto(nombre, 'consonantes'));

/** Herencia: lo que llega por el apellido. Es el número del clan. */
export const herencia = (apellidos: string) => construir(valorTexto(apellidos));

/** Los dígitos del 1 al 9 que no aparecen en el nombre: lo que está por aprender. */
export function leccionesKarmicas(nombre: string): number[] {
  const presentes = new Set(limpiar(nombre).split('').map((c) => TABLA[c]).filter(Boolean));
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !presentes.has(n));
}

/** Año personal: el momento del ciclo en el que está ahora. */
export function anioPersonal(fechaISO: string, anio = new Date().getFullYear()) {
  const [, m, d] = (fechaISO || '').split('-').map(Number);
  if (!m || !d) return 0;
  return reducir(reducir(d) + reducir(m) + reducir(sumaDigitos(anio)));
}

/**
 * Separa nombre de apellidos. En español, lo habitual es un nombre (a veces
 * compuesto) y dos apellidos: se toma la última mitad como apellidos.
 */
export function partirNombre(completo: string) {
  const partes = (completo || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return { nombre: partes.join(' '), apellidos: '' };
  if (partes.length === 2) return { nombre: partes[0], apellidos: partes[1] };
  const corte = partes.length >= 4 ? partes.length - 2 : partes.length - 1;
  return { nombre: partes.slice(0, corte).join(' '), apellidos: partes.slice(corte).join(' ') };
}

export type Perfil = {
  completo: string;
  nombrePila: string;
  fecha: string;
  camino: ReturnType<typeof caminoDeVida>;
  expresion: Numero;
  alma: Numero;
  personalidad: Numero;
  herencia: Numero;
  lecciones: number[];
  anioPersonal: number;
  diaNacimiento: number;
  mesNacimiento: number;
};

export function perfil(completo: string, fechaISO: string): Perfil {
  const { apellidos } = partirNombre(completo);
  const [, mes, dia] = (fechaISO || '').split('-').map(Number);
  return {
    completo: completo.trim(),
    nombrePila: completo.trim().split(/\s+/)[0] || '',
    fecha: fechaISO,
    camino: caminoDeVida(fechaISO),
    expresion: expresion(completo),
    alma: alma(completo),
    personalidad: personalidad(completo),
    herencia: herencia(apellidos || completo),
    lecciones: leccionesKarmicas(completo),
    anioPersonal: anioPersonal(fechaISO),
    diaNacimiento: dia || 0,
    mesNacimiento: mes || 0,
  };
}

/* ------------------------------------------------------------------ */
/*  SIGNIFICADOS                                                       */
/* ------------------------------------------------------------------ */

export const SENTIDO: Record<number, { clave: string; frase: string }> = {
  1: { clave: 'Empezar', frase: 'abrir camino, decidir solo, no depender de nadie' },
  2: { clave: 'Unir', frase: 'sostener, mediar, estar pendiente del otro' },
  3: { clave: 'Expresar', frase: 'contar, crear, hacerse ver' },
  4: { clave: 'Construir', frase: 'ordenar, sostener la estructura, cumplir' },
  5: { clave: 'Moverse', frase: 'cambiar, salir, no quedarse quieto' },
  6: { clave: 'Cuidar', frase: 'hacerse cargo, la casa, la familia' },
  7: { clave: 'Mirar dentro', frase: 'analizar, dudar, necesitar silencio' },
  8: { clave: 'Gestionar', frase: 'poder, dinero, hacerse respetar' },
  9: { clave: 'Cerrar', frase: 'entregar, soltar, terminar lo que otros dejaron' },
  11: { clave: 'Intuir', frase: 'ver antes que los demás y no saber explicarlo' },
  22: { clave: 'Materializar', frase: 'construir algo grande que dure' },
  33: { clave: 'Acompañar', frase: 'sostener a otros sin perderse en ello' },
};

export const SENTIDO_DEUDA: Record<number, string> = {
  13: 'Cuesta más que a los demás. Lo que se pide aquí es método y no buscar el atajo.',
  14: 'La libertad se va de las manos. Lo que se pide aquí es medida.',
  16: 'Algo se cae para que se caiga también el personaje. Lo que se pide aquí es verdad.',
  19: 'Se hace todo en solitario. Lo que se pide aquí es dejarse ayudar.',
};

/* ------------------------------------------------------------------ */
/*  LECTURA ENTRE DOS PERSONAS                                         */
/* ------------------------------------------------------------------ */

/** Familias de números que se entienden entre sí en la tradición pitagórica. */
const FAMILIA = (n: number) => ([1, 5, 7].includes(n) ? 'mental' : [2, 4, 8].includes(n) ? 'práctica' : 'emocional');

export type Vinculo = 'espejo' | 'maestra' | 'complemento' | 'tension';

export const VINCULOS: Record<Vinculo, { nombre: string; lineas: string[] }> = {
  espejo: {
    nombre: 'Espejo',
    lineas: [
      'Tenéis el mismo número: lo que te molesta de esa persona también es tuyo.',
      'La fuerza está duplicada, y el punto ciego también.',
      '¿Quién de los dos repite el patrón primero?',
    ],
  },
  maestra: {
    nombre: 'Relación que enseña',
    lineas: [
      'Lo que se activa entre los dos es justo el número de uno de vosotros: ahí hay algo que aprender.',
      'Uno enseña sin querer y el otro aprende sin darse cuenta.',
      '¿Qué te pide esta persona que ya te pedía otra antes?',
    ],
  },
  complemento: {
    nombre: 'Complemento',
    lineas: [
      'Vuestros números van en la misma dirección: donde uno se cansa, el otro empuja.',
      'El riesgo es la comodidad: repartirse los papeles y dejar de crecer.',
      '¿Qué dejas de hacer tú porque ya lo hace la otra persona?',
    ],
  },
  tension: {
    nombre: 'Roce que enseña',
    lineas: [
      'Vuestros números empujan en direcciones distintas: el roce es información, no un fallo.',
      'Lo que te saca de quicio señala justo lo que te toca aprender.',
      '¿Qué se repetía ya en tu familia antes de esta relación?',
    ],
  },
};

export type Repeticion = { titulo: string; detalle: string };

/**
 * Lo que de verdad importa: qué se repite de una persona a la otra.
 *
 * Cada bloque se escribe para alguien que no sabe nada de numerología y que ha
 * llegado aquí desde un vídeo. Por eso cada uno dice tres cosas en este orden:
 * de dónde sale el número, qué ha salido, y qué significa en la vida real. Sin
 * la primera parte, "misma expresión 7" no le dice nada a nadie.
 */
export function repeticiones(a: Perfil, b: Perfil, etiqueta: string): Repeticion[] {
  const quien = etiqueta || 'esa persona';
  const out: Repeticion[] = [];

  if (a.camino.valor && a.camino.valor === b.camino.valor) {
    out.push({
      titulo: 'Los dos venís a lo mismo',
      detalle: `Sumando tu fecha de nacimiento sale un ${a.camino.valor}, y sumando la de ${quien} sale el mismo número. Ese número es la asignatura que la vida os pone delante: ${SENTIDO[a.camino.valor]?.frase} Lo que ${quien} no llegó a resolver de eso, te llega a ti para que lo termines.`,
    });
  }
  if (a.expresion.valor && a.expresion.valor === b.expresion.valor) {
    out.push({
      titulo: 'Os movéis por el mundo igual',
      detalle: `Cada letra de un nombre vale un número, y las de vuestros nombres completos suman lo mismo: ${a.expresion.valor}. Por eso, ante un problema, tiráis por el mismo camino y os enfadáis por lo mismo, aunque juréis que no os parecéis en nada.`,
    });
  }
  if (a.herencia.valor && a.herencia.valor === b.herencia.valor) {
    out.push({
      titulo: 'Cargáis lo mismo del apellido',
      detalle: `El apellido también suma, y en los dos da ${a.herencia.valor}. Esa es la parte que no elegisteis: viene de generaciones de atrás y llega puesta, como el color de los ojos.`,
    });
  }
  if (a.diaNacimiento && a.diaNacimiento === b.diaNacimiento) {
    out.push({
      titulo: `Nacisteis los dos un día ${a.diaNacimiento}`,
      detalle: 'Que en una misma familia se repita el día del mes casi nunca es casualidad. Suele marcar una lealtad: alguien nace en la fecha de otro y, sin saberlo, hereda parte de su historia.',
    });
  } else if (a.mesNacimiento && a.mesNacimiento === b.mesNacimiento) {
    out.push({
      titulo: 'Nacisteis el mismo mes',
      detalle: 'Cuando dos generaciones nacen en el mismo mes, ese mes suele estar cargado en la familia: es la época del año en que pasó algo que no se habló. Fíjate en qué te pasa a ti por esas fechas.',
    });
  }
  if (a.camino.deuda && a.camino.deuda === b.camino.deuda) {
    out.push({
      titulo: 'Arrastráis la misma cuenta pendiente',
      detalle: `A los dos os sale el ${a.camino.deuda} al sumar la fecha. Es lo que en numerología se llama una deuda: algo que quedó a medias antes y que se hereda hasta que alguien lo mira de frente. ${SENTIDO_DEUDA[a.camino.deuda] || ''}`,
    });
  }
  const comunes = a.lecciones.filter((n) => b.lecciones.includes(n));
  if (comunes.length) {
    const lista = comunes.map((n) => `${SENTIDO[n]?.clave.toLowerCase()} (${n})`).join(', ');
    out.push({
      titulo: 'A los dos os falta lo mismo',
      detalle: `Hay números que no aparecen en ninguno de vuestros dos nombres: ${lista}. Eso señala lo que no traéis aprendido de casa, lo que a ninguno de los dos le sale solo. Es justo lo que la vida os va a poner delante una y otra vez, hasta que uno de los dos lo aprenda.`,
    });
  }

  return out;
}

export type Estudio = {
  a: Perfil;
  b: Perfil;
  etiqueta: string;
  comun: number;
  vinculo: Vinculo;
  nombreVinculo: string;
  lineas: string[];
  repeticiones: Repeticion[];
  fecha: string;
};

/** El estudio completo entre dos personas. */
export function estudio(
  nombreA: string,
  fechaA: string,
  nombreB: string,
  fechaB: string,
  etiqueta = ''
): Estudio {
  const a = perfil(nombreA, fechaA);
  const b = perfil(nombreB, fechaB);
  const comun = reducir(a.camino.valor + b.camino.valor, false);

  let vinculo: Vinculo = 'tension';
  if (a.camino.valor === b.camino.valor) vinculo = 'espejo';
  else if (comun === a.camino.valor || comun === b.camino.valor) vinculo = 'maestra';
  else if (FAMILIA(a.camino.valor) === FAMILIA(b.camino.valor)) vinculo = 'complemento';

  return {
    a,
    b,
    etiqueta,
    comun,
    vinculo,
    nombreVinculo: VINCULOS[vinculo].nombre,
    lineas: VINCULOS[vinculo].lineas,
    repeticiones: repeticiones(a, b, etiqueta),
    fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim());
