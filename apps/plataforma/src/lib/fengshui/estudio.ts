/**
 * ============================================================================
 * UN ESTUDIO DE FENG SHUI: QUÉ SE GUARDA Y DÓNDE
 * ============================================================================
 *
 * Un estudio de Feng Shui es de una VIVIENDA, no de una persona: la dirección,
 * hacia dónde mira la fachada, cuándo se construyó, el plano y quién vive
 * dentro. Por eso no se guarda junto a los estudios de Kábala.
 *
 * DÓNDE: EN ESTE NAVEGADOR, Y SE DICE. Igual que hacían los estudios de Kábala
 * antes de tener la nube. El plano va aparte, en su propia llave, porque una
 * foto pesa cien veces más que todo lo demás junto y el navegador tiene un
 * tope: si no cabe, se avisa con palabras en vez de perder el estudio entero.
 *
 * El día que Feng Shui suba a la nube, ésta es la única puerta que cambia.
 */
import { anioSolar, cartaNatal, grupoDe, kua, mediaCircular, periodoDe, type Formula, type Lado } from "./calculo";

export type Ocupante = {
  id: string;
  nombre: string;
  dia: string;
  mes: string;
  anio: string;
  /** Qué fórmula de Kua se aplica. La elige quien hace el estudio. */
  formula: Formula;
};

export type Lectura = { id: string; grados: number; donde: string };

export type EstudioFs = {
  id: string;
  cliente: string;
  direccion: string;
  tipo: "casa" | "piso" | "local";
  planta: string;
  /** Año en que se terminó la obra o se hizo la última gran reforma. */
  anioObra: string;
  /** Año en que entraron a vivir. Algunas escuelas cuentan desde aquí. */
  anioEntrada: string;
  /** null = el periodo sale solo del año de obra. */
  periodoManual: number | null;
  /** Hacia dónde mira la fachada, en grados. null = sin medir. */
  fachada: number | null;
  lecturas: Lectura[];
  /** Por qué lado del plano está la fachada. */
  lado: Lado;
  /** La cuadrícula sobre el plano, en tantos por ciento de la imagen. */
  rejilla: { x: number; y: number; w: number; h: number };
  /**
   * HACIA DÓNDE APUNTA LA FLECHA DEL NORTE DEL PLANO, en grados de pantalla
   * (0 arriba, 90 derecha). null = el plano no la tiene o no se ha marcado.
   *
   * Gerson: «se debe subir la imagen del plano y de ahí sacas todo eso». Casi
   * todos los planos de arquitecto traen su flecha del norte, y con ella y el
   * lado de la fachada sale la orientación sin salir de casa. El luopan queda
   * para comprobarla en la visita.
   */
  nortePlano: number | null;
  /** Qué estancias caen en cada zona del plano. */
  estancias: Partial<Record<string, string[]>>;
  ocupantes: Ocupante[];
  /** Lo que escribe quien hace el estudio en cada zona. Va al informe. */
  notas: Partial<Record<string, string>>;
  notaGeneral: string;
  creado: string;
  actualizado: string;
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function estudioNuevo(): EstudioFs {
  const ahora = new Date().toISOString();
  return {
    id: uid(),
    cliente: "",
    direccion: "",
    tipo: "piso",
    planta: "",
    anioObra: "",
    anioEntrada: "",
    periodoManual: null,
    fachada: null,
    lecturas: [],
    lado: "abajo",
    rejilla: { x: 6, y: 6, w: 88, h: 88 },
    nortePlano: null,
    estancias: {},
    ocupantes: [],
    notas: {},
    notaGeneral: "",
    creado: ahora,
    actualizado: ahora,
  };
}

export const ocupanteNuevo = (o?: Partial<Ocupante>): Ocupante => ({
  id: uid(),
  nombre: "",
  dia: "",
  mes: "",
  anio: "",
  formula: "f",
  ...o,
});

export const lecturaNueva = (grados: number, donde: string): Lectura => ({ id: uid(), grados, donde });

/* ------------------------------------------------------------------------- */
/*  LO QUE SE DEDUCE DE LOS DATOS                                             */
/* ------------------------------------------------------------------------- */

/** El periodo de la vivienda: el que se haya puesto a mano, o el del año de
 *  obra. Sin año de obra, null: no se inventa. */
export function periodoDeEstudio(e: EstudioFs): number | null {
  if (e.periodoManual) return e.periodoManual;
  const a = Number(e.anioObra);
  if (!Number.isInteger(a) || a < 1864 || a > 2100) return null;
  return periodoDe(a);
}

export function cartaDeEstudio(e: EstudioFs) {
  const p = periodoDeEstudio(e);
  if (p === null || e.fachada === null) return null;
  return cartaNatal(p, e.fachada);
}

/**
 * LA ORIENTACIÓN QUE SALE DEL PLANO.
 *
 * Si la flecha del norte apunta en pantalla a `n` grados y la fachada está en
 * el lado que mira a `l` grados de pantalla, la fachada mira a l − n grados de
 * brújula. Un plano con el norte arriba y la fachada abajo da 180°: Sur.
 */
export function fachadaDelPlano(e: EstudioFs): number | null {
  if (e.nortePlano === null) return null;
  const lado = { arriba: 0, derecha: 90, abajo: 180, izquierda: 270 }[e.lado];
  return Math.round((((lado - e.nortePlano) % 360) + 360) % 360 * 10) / 10;
}

/**
 * LAS PAREDES DEL PLANO, SIN TOCAR NADA.
 *
 * Un muro exterior es una raya oscura muy larga: en su fila (o su columna)
 * hay muchísimos más píxeles oscuros que en cualquier fila de texto o de
 * mueble. Se cuentan los oscuros de cada fila y de cada columna, y las
 * paredes de fuera son la primera y la última que pasan de un tercio del
 * máximo. Los rótulos que hay fuera del dibujo —«Entrada», la escala— no
 * llegan nunca a ese umbral y se quedan fuera.
 *
 * Es una ayuda, no un dictamen: la cuadrícula se puede seguir moviendo a mano.
 * Si el plano es una foto torcida o con sombras, puede no acertar, y entonces
 * devuelve null en vez de un recuadro disparatado.
 */
export function detectaParedes(datos: string): Promise<{ x: number; y: number; w: number; h: number } | null> {
  return new Promise((resolver) => {
    const img = new Image();
    img.onerror = () => resolver(null);
    img.onload = () => {
      const escala = Math.min(1, 700 / Math.max(img.width, img.height));
      const W = Math.max(1, Math.round(img.width * escala));
      const H = Math.max(1, Math.round(img.height * escala));
      const lienzo = document.createElement("canvas");
      lienzo.width = W;
      lienzo.height = H;
      const ctx = lienzo.getContext("2d");
      if (!ctx) return resolver(null);
      ctx.drawImage(img, 0, 0, W, H);
      const px = ctx.getImageData(0, 0, W, H).data;
      const filas = new Array<number>(H).fill(0);
      const cols = new Array<number>(W).fill(0);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const luz = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
          if (luz < 110) {
            filas[y]++;
            cols[x]++;
          }
        }
      }
      const bordes = (v: number[]) => {
        const max = Math.max(...v);
        if (max < 8) return null;
        const umbral = max / 3;
        const a = v.findIndex((n) => n >= umbral);
        let b = v.length - 1;
        while (b > 0 && v[b] < umbral) b--;
        return b - a > v.length * 0.2 ? [a, b] : null;
      };
      const f = bordes(filas);
      const c = bordes(cols);
      if (!f || !c) return resolver(null);
      const r = (n: number) => Math.round(n * 10) / 10;
      resolver({ x: r((c[0] / W) * 100), y: r((f[0] / H) * 100), w: r(((c[1] - c[0]) / W) * 100), h: r(((f[1] - f[0]) / H) * 100) });
    };
    img.src = datos;
  });
}

/** La media de las lecturas guardadas, o null si no hay ninguna. */
export const mediaLecturas = (e: EstudioFs) => mediaCircular(e.lecturas.map((l) => l.grados));

export type KuaDe = { kua: number; grupo: "este" | "oeste"; anioSolar: number; dudoso: boolean } | null;

/** El Kua de una persona, si su fecha es válida. */
export function kuaDe(o: Ocupante): KuaDe {
  const d = Number(o.dia);
  const m = Number(o.mes);
  const a = Number(o.anio);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(a)) return null;
  if (a < 1900 || a > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const fecha = new Date(Date.UTC(a, m - 1, d));
  if (fecha.getUTCMonth() !== m - 1) return null;
  const s = anioSolar(d, m, a);
  const k = kua(s.anio, o.formula);
  return { kua: k, grupo: grupoDe(k), anioSolar: s.anio, dudoso: s.dudoso };
}

/* ------------------------------------------------------------------------- */
/*  GUARDAR EN EL NAVEGADOR                                                   */
/* ------------------------------------------------------------------------- */

const LLAVE_LISTA = "fengshui-estudios";
const LLAVE_ACTUAL = "fengshui-actual";
const llavePlano = (id: string) => `fengshui-plano-${id}`;

function lee<T>(llave: string, porDefecto: T): T {
  try {
    const crudo = localStorage.getItem(llave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function cargaEstudios(): EstudioFs[] {
  const lista = lee<EstudioFs[]>(LLAVE_LISTA, []);
  /* Lo que se guardó con una versión anterior se completa con lo que falte,
     en vez de romper la pantalla por un campo nuevo. */
  return Array.isArray(lista) ? lista.map((e) => ({ ...estudioNuevo(), ...e })) : [];
}

export function idActual(): string | null {
  return lee<string | null>(LLAVE_ACTUAL, null);
}

/** Guarda la lista. Devuelve false si el navegador no ha dejado. */
export function guardaEstudios(lista: EstudioFs[], actual: string | null): boolean {
  try {
    localStorage.setItem(LLAVE_LISTA, JSON.stringify(lista));
    localStorage.setItem(LLAVE_ACTUAL, JSON.stringify(actual));
    return true;
  } catch {
    return false;
  }
}

export function cargaPlano(id: string): string | null {
  try {
    return localStorage.getItem(llavePlano(id));
  } catch {
    return null;
  }
}

/** Guarda el plano. false = no cabe en el navegador. */
export function guardaPlano(id: string, datos: string | null): boolean {
  try {
    if (datos) localStorage.setItem(llavePlano(id), datos);
    else localStorage.removeItem(llavePlano(id));
    return true;
  } catch {
    return false;
  }
}

/**
 * EL PLANO SE ACHICA ANTES DE GUARDARLO.
 *
 * Una foto de móvil son 4 MB y el navegador deja unos 5 para todo. A 1600 px
 * de lado un plano se sigue leyendo entero —cotas incluidas— y pesa diez veces
 * menos. Se guarda en JPEG salvo que traiga transparencia que importe, que no
 * es el caso de un plano.
 */
export function achicaImagen(archivo: File, lado = 1600): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onerror = () => rechazar(new Error("No se ha podido leer el archivo."));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => rechazar(new Error("Ese archivo no parece una imagen. Prueba con un JPG o un PNG."));
      img.onload = () => {
        const escala = Math.min(1, lado / Math.max(img.width, img.height));
        const lienzo = document.createElement("canvas");
        lienzo.width = Math.round(img.width * escala);
        lienzo.height = Math.round(img.height * escala);
        const ctx = lienzo.getContext("2d");
        if (!ctx) return rechazar(new Error("Este navegador no deja preparar la imagen."));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, lienzo.width, lienzo.height);
        ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
        resolver(lienzo.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(lector.result);
    };
    lector.readAsDataURL(archivo);
  });
}
