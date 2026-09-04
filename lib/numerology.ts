const LMAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 1, k: 2, l: 3, m: 4,
  n: 5, o: 6, p: 7, q: 8, r: 9, s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');

export function clean(s: string) {
  return (s || '')
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

export function reduce(n: number, master: boolean): number {
  while (n > 9) {
    if (master && (n === 11 || n === 22 || n === 33)) return n;
    n = String(n)
      .split('')
      .reduce((a, d) => a + Number(d), 0);
  }
  return n;
}

export function lifePath(date: string) {
  return reduce(
    (date || '')
      .replace(/\D/g, '')
      .split('')
      .reduce((a, d) => a + Number(d), 0),
    true
  );
}

export function expression(name: string) {
  return reduce(
    clean(name)
      .split('')
      .reduce((a, c) => a + (LMAP[c] || 0), 0),
    true
  );
}

export const KEYS: Record<string, string> = {
  '1': 'Empezar, liderar',
  '2': 'Unir, sostener',
  '3': 'Expresar, contar',
  '4': 'Construir, ordenar',
  '5': 'Moverse, cambiar',
  '6': 'Cuidar, responsabilizarse',
  '7': 'Mirar dentro, analizar',
  '8': 'Gestionar, poder',
  '9': 'Cerrar, entregar',
  '11': 'Intuir, inspirar',
  '22': 'Materializar en grande',
};

export const ARCH: Record<string, { n: string; l: string[] }> = {
  espejo: {
    n: 'Espejo',
    l: [
      'Compartís el mismo camino: lo que te molesta de esa persona es tuyo también.',
      'La fuerza está duplicada; también el punto ciego.',
      '¿Quién de los dos repite el patrón primero?',
    ],
  },
  complemento: {
    n: 'Complemento',
    l: [
      'Vuestros caminos se sostienen: donde uno se cansa, el otro empuja.',
      'El riesgo es la comodidad: repartir papeles y no crecer.',
      '¿Qué dejas de hacer porque lo hace la otra persona?',
    ],
  },
  tension: {
    n: 'Roce que enseña',
    l: [
      'Vuestros números empujan en direcciones distintas: el roce es información.',
      'Lo que te saca de quicio señala justo lo que te toca aprender.',
      '¿Qué se repetía ya en tu familia antes de esta relación?',
    ],
  },
  maestra: {
    n: 'Relación que enseña',
    l: [
      'La vibración común coincide con el camino de uno de los dos: hay una enseñanza clara.',
      'Uno enseña sin querer, el otro aprende sin saberlo.',
      '¿Qué te pide esta persona que ya te pedía otra antes?',
    ],
  },
};

export function computeSynergy(aName: string, aDate: string, bName: string, bDate: string) {
  const aLp = lifePath(aDate);
  const bLp = lifePath(bDate);
  const vib = reduce(aLp + bLp, false);
  let key = 'tension';
  if (aLp === bLp) key = 'espejo';
  else if (vib === aLp || vib === bLp) key = 'maestra';
  else if ((aLp + bLp) % 2 === 0) key = 'complemento';
  return {
    aName: aName.trim().split(/\s+/)[0],
    bName: bName.trim().split(/\s+/)[0],
    aLp,
    bLp,
    vib,
    aKey: KEYS[String(aLp)],
    bKey: KEYS[String(bLp)],
    arch: ARCH[key].n,
    lines: ARCH[key].l,
  };
}

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim());
