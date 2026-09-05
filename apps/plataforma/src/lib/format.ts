/** Trunca un texto en el último espacio antes de `n` caracteres y añade "…". */
export function recorta(t: string | undefined | null, n: number): string {
  if (!t) return "";
  if (t.length <= n) return t;
  const corte = t.slice(0, n);
  const i = corte.lastIndexOf(" ");
  return corte.slice(0, i > 0 ? i : n) + "…";
}

/**
 * Chip tipo iOS. Van cuatro o cinco al pie de cada bloque, así que son la
 * pieza que más se repite en toda la plataforma: si cada uno lleva su color de
 * fondo, su borde teñido y su sombra, el pie de la tarjeta pesa más que el
 * texto que hay encima.
 *
 * Ahora la pastilla es siempre la misma — gris muy suave, sin borde ni sombra —
 * y del color sólo queda la letra. Se sigue distinguiendo qué chip es cuál y el
 * conjunto deja de competir con la lectura.
 */
export function chipStyle(color: string): string {
  return (
    "display:inline-flex;align-items:center;background:color-mix(in srgb, var(--text) 5%, transparent);" +
    "border:none;color:" +
    color +
    ";border-radius:999px;padding:7px 13px;font-family:var(--font-ui);font-size:var(--t-mini);font-weight:590;" +
    "letter-spacing:-.005em;text-transform:none;cursor:pointer;"
  );
}

/* Los apuntes vienen escritos en mayúsculas de máquina de escribir. En pantalla
 * pedían caja normal, así que se convierten al vuelo; el dato original no se
 * toca, sólo cómo se muestra. */
const MINUSCULAS = new Set(["de", "del", "la", "las", "el", "los", "y", "en", "a", "con", "sin", "por", "para", "un", "una", "al", "o", "u"]);

/** "EL ERMITAÑO" → "El Ermitaño". Respeta un texto que ya venga en caja mixta. */
export function titulo(t: string | undefined | null): string {
  if (!t) return "";
  if (t !== t.toLocaleUpperCase("es")) return t;
  return t
    .toLocaleLowerCase("es")
    .split(/(\s+)/)
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.replace(/^[a-záéíóúüñ]/, (c) => c.toLocaleUpperCase("es"))))
    .join("");
}

/** "CAMINO CONSCIENTE DE META" → "Camino consciente de meta". */
export function frase(t: string | undefined | null): string {
  if (!t) return "";
  if (t !== t.toLocaleUpperCase("es")) return t;
  const b = t.toLocaleLowerCase("es");
  return b.replace(/^[a-záéíóúüñ]/, (c) => c.toLocaleUpperCase("es"));
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export function fechaLarga(dia: number, mes: number, anio: number): string {
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}

/**
 * Cierra un texto que viene cortado a media frase.
 *
 * Treinta y tres de los textos del diccionario se quedaron a medias al
 * extraerlos de los manuales — «…se puede comparar con un» y ahí acaba. En el
 * panel se nota poco, pero en el documento que se entrega al cliente una frase
 * que muere a media palabra queda fatal. Aquí se retrocede hasta el último
 * punto, y sólo si lo que queda sigue siendo el grueso del texto; si el corte
 * viene de tan atrás que apenas quedaría nada, se deja como está con puntos
 * suspensivos, que al menos se lee como algo pendiente y no como un error.
 *
 * Esto tapa el síntoma: los textos hay que completarlos en el diccionario.
 */
/**
 * Los apuntes traen intercaladas las claves de trabajo de la escuela —
 * «2/33-3/22-6/11-M15-M51-C11-T11-L77-P313» y parecidas: divisores, maestría,
 * corazón, tensión, liberación y potencial. A Iris le sirven; al cliente que
 * recibe su lectura no le dicen nada y le ensucian la página. Se quitan de
 * todo lo que entra en el documento — en el panel siguen, que es su mesa de
 * trabajo.
 */
const CLAVES_ENCADENADAS = /(?:\d+\/\d+|[A-ZÁÉÍÓÚ]\d+)(?:\s*[-–]\s*(?:\d+\/\d+|[A-ZÁÉÍÓÚ]\d+))+\.?/g;
/**
 * Un divisor suelto que abre frase —«3/29 laberinto espiritual», «8/11 la
 * fuerza en los 3 planos»— también es clave. Sólo se quita cuando encabeza,
 * no cuando va dentro de la oración: en «Es 2/43 el número del pionero» el
 * divisor hace de sujeto y quitarlo dejaría la frase coja.
 *
 * Y NO se tocan las letras con número sueltas —«L1», «C4», «D7»—: no son
 * claves, son vértebras. Los apuntes dan los órganos y las disfunciones de
 * cada portal, y una regla que barriera «[MCTLP] + número» convertía
 * «Lumbares L1 y L2» en «Lumbares y». Las claves de verdad van encadenadas
 * con guiones, y de eso ya se encarga la expresión de arriba.
 */
const DIVISOR_QUE_ENCABEZA = /(^|[.:;¡¿]\s+)\d+\/\d+\s+(\p{Ll})?/gu;

/** Quita las claves de escuela y recoge la puntuación que dejan colgando. */
export function sinClavesEscuela(t: string): string {
  return (t || "")
    .replace(CLAVES_ENCADENADAS, "")
    // Al quitar el divisor, lo que venía detrás pasa a abrir frase: se le
    // devuelve la mayúscula, o quedaría «Es un número sanador. laberinto».
    .replace(DIVISOR_QUE_ENCABEZA, (_m, antes: string, letra?: string) =>
      antes + (letra ? letra.toLocaleUpperCase("es") : "")
    )
    // Un «·» o un guion que se quedan sin nada detrás.
    .replace(/[·–-]\s*(?=[,.;:)]|$)/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/^[\s·–-]+/, "")
    .trim();
}

/**
 * Las primeras frases de un texto, enteras, hasta llenar el hueco que se le
 * da. Nunca corta a mitad de frase ni deja puntos suspensivos: para la hoja
 * del cliente hacía falta poder decir qué significa cada cosa en una o dos
 * líneas, y recortar por número de caracteres dejaba frases cojas.
 *
 * Si la primera frase ya se pasa mucho del hueco —los apuntes tienen frases de
 * cuatro líneas—, se corta por la última coma que quepa y se cierra con punto.
 * Queda una oración entera y legible, y nunca unos puntos suspensivos: en algo
 * que se entrega, un texto acabado en «…» parece un error.
 */
export function primerasFrases(t: string | undefined | null, hueco: number): string {
  const limpio = sinClavesEscuela(t || "").replace(/\s+/g, " ").trim();
  if (!limpio) return "";
  // Se parte por punto, cierre de interrogación o de exclamación seguidos de
  // espacio y mayúscula: así no se rompe en «S.L.» ni en «7 leyes, 7 días».
  const frases = limpio.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [limpio];
  let out = "";
  for (const f of frases) {
    const cand = (out + " " + f.trim()).trim();
    if (out && cand.length > hueco) break;
    out = cand;
    if (out.length >= hueco) break;
  }
  if (out.length > hueco * 1.3) {
    const corte = out.slice(0, hueco);
    const coma = Math.max(corte.lastIndexOf(", "), corte.lastIndexOf("; "), corte.lastIndexOf(" — "));
    if (coma > hueco * 0.45) out = out.slice(0, coma);
  }
  return cierraFrase(out);
}

/** Cierra con punto lo que no lo trae. Los nombres y lemas de los apuntes
 *  vienen unos con punto final y otros sin él; sin normalizarlo, al pegarlos a
 *  otra frase salen «El Carro. la dirección» o «La profesión.. No son». */
/**
 * La cuenta de los días de fuerza, escrita como se dice en voz alta. Se
 * enseña la suma cifra a cifra y, sólo si hizo falta bajar otra vez porque
 * pasaba de 11, ese segundo paso.
 */
export function cuentaDiasFuerza(valorNombre: number, primeraSuma: number, base: number): string {
  const suma = String(valorNombre).split("").join(" + ") + " = " + primeraSuma;
  return primeraSuma === base ? suma : `${suma}, y como pasa de 11, ${primeraSuma} → ${base}`;
}

export function punto(t: string | undefined | null): string {
  const s = (t || "").trim();
  return !s || /[.!?…]$/.test(s) ? s : s + ".";
}
/** Y al revés, para lo que va dentro de una enumeración. */
export function sinPunto(t: string | undefined | null): string {
  return (t || "").trim().replace(/\.+$/, "");
}

export function cierraFrase(t: string | undefined | null): string {
  const s = (t || "").trim();
  if (!s || /[.!?»"')\]]$/.test(s)) return s;
  // Nunca se cierra con puntos suspensivos: en un documento que se entrega,
  // un texto acabado en «…» parece un fallo. Si la frase quedó a medias se
  // retrocede hasta el último punto; y si no hay ninguno, se deja tal cual y
  // se le pone el punto final que le falta.
  const i = Math.max(s.lastIndexOf("."), s.lastIndexOf("!"), s.lastIndexOf("?"));
  if (i > 0 && i > s.length * 0.5) return s.slice(0, i + 1);
  return s.replace(/[…\s,;:—–-]+$/, "") + ".";
}
