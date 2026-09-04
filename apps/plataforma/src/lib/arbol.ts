import { SEF, SENDEROS, COL, IZQ, ORDEN_CAMINOS, type SefKey } from "./tree";
import type { Resultado } from "./engine";
import { KDATA } from "./kdata";
import { titulo } from "./format";

export type Rol = "origen" | "transformacion" | "destino";

export type SenderoView = { x1: number; y1: number; x2: number; y2: number; color: string; w: number; o: number; delay: number };
export type SefiraView = { x: number; y: number; fill: string; nombre: string; tx: number; ty: number; anchor: "start" | "middle" | "end"; delay: number; delayT: number };
/** El nombre del arcano escrito a lo largo de su sendero, como está anotado a
 *  mano en la ficha: «La Fuerza», «El Sumo Sacerdote», «La Templanza». */
export type RotuloView = { x: number; y: number; rot: number; nombre: string; color: string; delay: number };
export type MarcaCaminoView = { x: number; y: number; n: number; color: string; delay: number };
/** Sendero complementario de uno de los tuyos: mismo color, trazo discontinuo. */
export type ComplementarioView = { x1: number; y1: number; x2: number; y2: number; color: string; n: number; de: number; delay: number };

/** Senderos ocupados por cada camino. Un mismo sendero puede llevar más de un
 *  camino (el de origen y el de destino pueden ser el mismo arcano), por eso
 *  el valor es una lista y no un único rol: así se pueden dibujar los dos. */
export function arcosDe(r: Resultado): Record<number, Rol[]> {
  const arcos: Record<number, Rol[]> = {};
  const add = (arcano: number, rol: Rol) => {
    if (!arcos[arcano]) arcos[arcano] = [];
    arcos[arcano].push(rol);
  };
  add(r.caminos.origen.arcano, "origen");
  add(r.caminos.transformacion.arcano, "transformacion");
  add(r.caminos.destino.arcano, "destino");
  return arcos;
}

/** Separación entre dos caminos que comparten sendero, en unidades del
 *  viewBox. Un pelo mayor que el grosor del trazo (4) para que se lean como
 *  dos líneas y no como una sola más gruesa. */
const SEPARACION = 5;
const GROSOR = 4;

/**
 * Dónde y con qué inclinación se escribe el nombre del arcano a lo largo de su
 * sendero. En la ficha el nombre va montado sobre la propia línea, girado con
 * ella, y siempre por el lado de fuera del árbol — por el de dentro se juntan
 * las tres columnas y no se leería.
 */
function rotuloDe(a: { x: number; y: number }, b: { x: number; y: number }, aparta: number) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const largo = Math.hypot(dx, dy) || 1;
  let px = -dy / largo,
    py = dx / largo;
  const mx = (a.x + b.x) / 2,
    my = (a.y + b.y) / 2;
  // La columna del medio no tiene «fuera»: se rotula siempre a su derecha.
  const centro = Math.abs(mx - 190) < 1;
  if (centro ? px < 0 : px * (mx - 190) < 0) {
    px = -px;
    py = -py;
  }
  // El texto nunca se lee del revés. Los senderos verticales se rotulan de
  // abajo arriba — el tramo entre Keter y Tiphereth y el de Tiphereth a Yesod
  // son largos y están despejados, así que el nombre cabe entero a lo largo
  // de la línea sin pisar ninguna sefirá.
  let rot = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (rot >= 90) rot -= 180;
  if (rot < -90) rot += 180;
  return { x: mx + px * aparta, y: my + py * aparta, rot };
}

export function arbolGeometria(r: Resultado) {
  const arcos = arcosDe(r);

  const senderos: SenderoView[] = [];
  SENDEROS.forEach((s, i) => {
    const a = SEF[s[0]],
      b = SEF[s[1]];
    const roles = arcos[i];

    if (!roles || !roles.length) {
      senderos.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: "#C7C7CC", w: 1.4, o: 0.32, delay: 0.06 + i * 0.032 });
      return;
    }

    // Vector perpendicular unitario al sendero: desplaza cada camino a un
    // lado para que los que coinciden queden en paralelo, visibles los dos.
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const largo = Math.hypot(dx, dy) || 1;
    const px = -dy / largo,
      py = dx / largo;

    roles.forEach((rol, k) => {
      const desvio = (k - (roles.length - 1) / 2) * SEPARACION;
      senderos.push({
        x1: a.x + px * desvio,
        y1: a.y + py * desvio,
        x2: b.x + px * desvio,
        y2: b.y + py * desvio,
        color: COL[rol],
        w: GROSOR,
        o: 0.95,
        delay: 1.15 + ORDEN_CAMINOS.indexOf(rol) * 0.28,
      });
    });
  });

  const sefirot: SefiraView[] = (Object.keys(SEF) as SefKey[]).map((k, i) => {
    const p = SEF[k];
    const izq = IZQ[k];
    const centro = p.x === 190;
    const delay = 0.1 + i * 0.075;
    return {
      x: p.x,
      y: p.y,
      fill: p.c,
      nombre: p.n,
      tx: centro ? p.x : izq ? p.x - 26 : p.x + 26,
      ty: centro ? p.y - 26 : p.y + 4,
      anchor: centro ? "middle" : izq ? "end" : "start",
      delay,
      delayT: delay + 0.3,
    };
  });

  // Número del arcano junto a su sendero, apartado del haz de líneas para no
  // quedar encima cuando hay más de un camino.
  const marcasCamino: MarcaCaminoView[] = [];
  Object.keys(arcos).forEach((clave, i) => {
    const idx = +clave;
    const s = SENDEROS[idx];
    if (!s) return;
    const p1 = SEF[s[0]],
      p2 = SEF[s[1]];
    const roles = arcos[idx];
    // El número va por el lado de dentro y el nombre por el de fuera, cada
    // uno en su margen: juntos en el mismo lado se pisaban.
    const aparta = -(((roles.length - 1) / 2) * SEPARACION + 11);
    const { x, y } = rotuloDe(p1, p2, aparta);
    marcasCamino.push({ x, y: y + 4, n: idx, color: COL[roles[0]], delay: 2.0 + i * 0.28 });
  });

  // Caminos complementarios: los senderos que hacen pareja con los tuyos.
  // No son tu recorrido, así que van en discontinuo y por debajo — es la
  // energía que te acompaña, no la que te toca andar.
  //
  // Un mismo complementario puede venir de dos caminos a la vez. En la ficha
  // eso se dibuja como dos discontinuas en paralelo, una de cada color —
  // igual que cuando dos caminos comparten sendero — y no como una sola
  // línea que se quede con el color del primero.
  const porSendero = new Map<number, string[]>();
  const yaTuyos = new Set(Object.keys(arcos).map(Number));
  Object.entries(arcos).forEach(([clave, roles]) => {
    (KDATA.caminosComplementarios?.[clave] || []).forEach((comp) => {
      if (yaTuyos.has(comp) || !SENDEROS[comp]) return;
      const lista = porSendero.get(comp) || [];
      // Cada camino aporta su color. Si el origen y la transformación caen en
      // el mismo arcano, sus complementarios salen dos veces — y por eso en la
      // hoja esas discontinuas van de dos en dos, una roja y una azul.
      roles.forEach((rol) => {
        if (!lista.includes(COL[rol])) lista.push(COL[rol]);
      });
      porSendero.set(comp, lista);
    });
  });

  const complementarios: ComplementarioView[] = [];
  const rotulosComp: RotuloView[] = [];
  [...porSendero.entries()].forEach(([comp, colores], i) => {
    const s = SENDEROS[comp];
    const a = SEF[s[0]],
      b = SEF[s[1]];
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const largo = Math.hypot(dx, dy) || 1;
    const px = -dy / largo,
      py = dx / largo;

    colores.forEach((color, k) => {
      const desvio = (k - (colores.length - 1) / 2) * SEPARACION;
      complementarios.push({
        x1: a.x + px * desvio,
        y1: a.y + py * desvio,
        x2: b.x + px * desvio,
        y2: b.y + py * desvio,
        color,
        n: comp,
        de: colores.length,
        delay: 2.1 + i * 0.2 + k * 0.08,
      });
    });

    const nombre = titulo(KDATA.arcanos?.[String(comp)]?.nombre);
    if (nombre) {
      rotulosComp.push({
        ...rotuloDe(a, b, ((colores.length - 1) / 2) * SEPARACION + 11),
        nombre,
        color: colores[0],
        delay: 2.5 + i * 0.2,
      });
    }
  });

  // Los nombres de tus tres caminos, escritos sobre su sendero como en la hoja.
  const rotulos: RotuloView[] = [];
  Object.keys(arcos).forEach((clave, i) => {
    const idx = +clave;
    const s = SENDEROS[idx];
    const nombre = titulo(KDATA.arcanos?.[clave]?.nombre);
    if (!s || !nombre) return;
    rotulos.push({
      ...rotuloDe(SEF[s[0]], SEF[s[1]], ((arcos[idx].length - 1) / 2) * SEPARACION + 12),
      nombre,
      color: COL[arcos[idx][0]],
      delay: 1.9 + i * 0.22,
    });
  });

  return { arcos, senderos, sefirot, marcasCamino, complementarios, rotulos, rotulosComp };
}
