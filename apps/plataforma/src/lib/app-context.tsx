"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { analizaNombre, calcula, calculaEmpresa, comparaPareja, ficha as fichaDe, type Resultado, type ResultadoEmpresa, type Comparativa, type Ficha, type Genero } from "./engine";
import { cargaHistorial, guardaHistorial, cargaEdits, guardaEdits, cargaActual, guardaActual, type HistItem, type Edits } from "./storage";
import { borraUno as borraDeLaNube, funde, guardaUno, guardaVarios, hayNube, leeTodo } from "./estudios";
import { descargaRespaldo, importaRespaldo, type ResultadoImportar } from "./respaldo";
import type { Capacidad } from "./roles";

/**
 * LOS DOS MUNDOS DE LA PLATAFORMA
 *
 * Hasta hoy esto era una herramienta de una sola persona y todas las pantallas
 * eran suyas. Ahora conviven dos cosas distintas bajo el mismo techo, y lo que
 * las separa no es un menú más ordenado: es quién puede abrir cada una.
 *
 * LA ESCUELA — `escuela`, `cursos`, `comunidad`, `perfil`.
 * Lo que ve quien compra un curso o paga la membresía. Cada una pide su llave:
 * los cursos los ve quien ha comprado alguno, la comunidad quien es miembro,
 * los recursos cualquiera que haya entrado.
 *
 * SÓLO IRIS — todo lo demás. Y dentro, dos oficios distintos:
 *
 *   EL ESTUDIO: `inicio`, `panel`, `estudio` y `pareja`, los cuatro pasos de
 *   leerle la carta a alguien. Los cuatro necesitan un estudio abierto.
 *
 *   EL DESPACHO: `leads`, `agenda`, `clientes`, `facturas`, `metricas` y
 *   `gestion`. Lo que Iris hace cuando no está leyendo una carta. No cuelgan
 *   de un estudio ni de una disciplina —una factura no es una parte de
 *   Kábala— así que van al mismo nivel y se entra sin haber calculado nada.
 *
 * LA REGLA QUE NO SE NEGOCIA: la lectura de Kábala es la herramienta con la
 * que Iris prepara los estudios de sus clientas. Un alumno que paga un curso
 * no compra acceso al método. Por eso el estudio entero vive de este lado.
 */
export type View =
  /* ---- LA ESCUELA: lo que ve quien compra un curso o paga la membresía ---- */
  | "escuela"
  | "cursos"
  | "comunidad"
  | "perfil"
  /* ---- SÓLO IRIS: el estudio de Kábala y el despacho ---- */
  | "inicio"
  | "panel"
  | "estudio"
  | "pareja"
  | "agenda"
  | "personas"
  | "facturas"
  | "metricas"
  | "gestion";

/** Las que sólo tienen sentido con un estudio abierto. Las demás se abren
 *  siempre: entrar a mirar la agenda no puede exigir calcular una carta. */
export const VISTAS_DE_ESTUDIO: View[] = ["panel", "estudio", "pareja"];

/**
 * Cada pantalla tiene su dirección. La consulta es la raíz; las demás cuelgan
 * de ella. Así se puede guardar el enlace del panel, volver con la flecha del
 * navegador y compartir una pantalla concreta, que antes era imposible: todo
 * el sitio vivía en la misma dirección.
 */
const RUTA: Record<View, string> = {
  escuela: "/escuela",
  cursos: "/cursos",
  comunidad: "/comunidad",
  perfil: "/perfil",
  metricas: "/metricas",
  gestion: "/gestion",
  inicio: "/",
  panel: "/panel",
  estudio: "/estudio",
  pareja: "/pareja",
  agenda: "/agenda",
  personas: "/personas",
  facturas: "/facturas",
};
const VISTA: Record<string, View> = {
  "/escuela": "escuela",
  "/cursos": "cursos",
  "/comunidad": "comunidad",
  "/perfil": "perfil",
  "/metricas": "metricas",
  "/gestion": "gestion",
  "/": "inicio",
  "/panel": "panel",
  "/estudio": "estudio",
  "/pareja": "pareja",
  "/agenda": "agenda",
  "/personas": "personas",
  "/facturas": "facturas",
};
/**
 * QUÉ LLAVE ABRE CADA PANTALLA.
 *
 * Una sola tabla, y por eso se puede confiar en ella: si una pantalla no está
 * aquí no se abre, y añadir una pantalla nueva obliga a decir de quién es —no
 * hay forma de colar una sin permiso, porque TypeScript exige la fila.
 *
 * Se pregunta por capacidad y no por rol a propósito. El día que el rol de
 * `admin` se parta en dos —pongamos Iris y una ayudante que lleva la agenda
 * pero no toca las cartas— se cambia `roles.ts` y esta tabla no se entera.
 */
const LLAVE: Record<View, Capacidad> = {
  /* La escuela */
  escuela: "escuela", // el recibidor: lo ve cualquiera que haya entrado
  cursos: "cursos",
  comunidad: "comunidad",
  perfil: "escuela", // el perfil es de cada uno: lo abre cualquiera que haya entrado
  /* El estudio de Kábala, que es sólo de Iris */
  inicio: "estudio",
  panel: "estudio",
  estudio: "estudio",
  pareja: "estudio",
  /* El despacho */
  agenda: "despacho",
  personas: "despacho",
  facturas: "despacho",
  metricas: "metricas",
  gestion: "gestion",
};

/** La llave que hace falta para abrir una pantalla. */
export function llaveDe(v: View): Capacidad {
  return LLAVE[v];
}

/**
 * Dónde se manda a alguien que no puede estar donde está.
 *
 * No es una pantalla de «no tienes permiso», que no sirve de nada: es el sitio
 * más cercano que SÍ puede abrir. Iris cae en su consulta, un alumno en su
 * escuela, y quien no tenga ninguna llave cae en la escuela también y verá
 * allí que no hay nada suyo todavía.
 */
export function dondeEmpieza(puedeHacer: (c: Capacidad) => boolean): View {
  if (puedeHacer("estudio")) return "inicio";
  return "escuela";
}

/**
 * Los nombres de las pantallas, escritos una sola vez.
 *
 * Los usan la tira de pestañas de la cabecera y el cajón del móvil, que son la
 * misma navegación en dos anchos. Si cada uno tuviera su lista acabarían
 * discrepando, que es justo lo que ya pasó con la lateral y el cajón.
 */
export type Pestana = { k: View; label: string; grupo: "estudio" | "despacho" };
export const PESTANAS: Pestana[] = [
  { k: "inicio", label: "Consulta", grupo: "estudio" },
  { k: "panel", label: "Panel", grupo: "estudio" },
  { k: "estudio", label: "Estudio", grupo: "estudio" },
  { k: "agenda", label: "Agenda", grupo: "despacho" },
  { k: "personas", label: "Personas", grupo: "despacho" },
  { k: "facturas", label: "Facturas", grupo: "despacho" },
];

export type Seccion = "resumen" | "arbol" | "numeros" | "estructura" | "alma" | "cuentas" | "ciclos";

/** Las disciplinas de la escuela. Kábala es la que está construida; Numerología
 *  existe ya en la navegación y avisa de que está por hacer.
 *
 *  Feng Shui estaba aquí y se ha quitado: era un hueco vacío en la navegación y
 *  el dueño ha pedido retirarlo hasta que haya algo que enseñar. */
export type Disciplina = "kabala" | "numerologia";

/**
 * Las dos bases de la numerología, que son dos sistemas distintos y no dos
 * vistas del mismo.
 *
 *   b22 — Kris Hadar. Sale sólo de la FECHA y describe cómo se COMPORTA una
 *         persona: la rejilla de diecinueve casillas.
 *   b9  — Martine Coquatrix. Sale del NOMBRE COMPLETO (y de la fecha) y describe
 *         de qué está HECHA: las nueve casas, sus habitantes y sus puentes.
 *
 * Van en el contexto y no dentro de la pantalla porque la columna de la
 * izquierda tiene que poder saltar de una a otra: es lo que las hace
 * encontrables. Quien entra en «Numerología» y sólo ve la rejilla de 22 no sabe
 * que la otra existe.
 */
export type Base = "b22" | "b9";
/** Un estudio se hace de una persona o de una empresa. La empresa no tiene
 *  apellidos, ni género, ni fecha: se lee entera de su nombre. */
export type Tipo = "persona" | "empresa";

export type FormState = { tipo: Tipo; nombre: string; ap1: string; ap2: string; dia: string; mes: string; anio: string; genero: Genero };
const FORM_VACIO: FormState = { tipo: "persona", nombre: "", ap1: "", ap2: "", dia: "", mes: "", anio: "", genero: "f" };

export type Detalle =
  | { tipo: "numero"; f: Ficha }
  | { tipo: "arcano"; a: number }
  | { tipo: "texto"; titulo: string; sub: string; texto: string; etiqueta: string }
  | null;

export const MARCA = "Escuela de Sabiduría 33";

function entradaDe(f: FormState, anioUniversal: number) {
  return {
    nombre: f.nombre,
    apellido1: f.ap1,
    apellido2: f.ap2,
    dia: +f.dia,
    mes: +f.mes,
    anio: +f.anio,
    anioUniversal,
    genero: f.genero,
    tipo: f.tipo,
  };
}

/** Un estudio guardado vuelve a ser un formulario. Lo que no se guardó en su
 *  día —tipo y género— se rellena con lo que entonces era el único caso. */
function formDe(h: HistItem): FormState {
  return {
    tipo: h.f.tipo === "empresa" ? "empresa" : "persona",
    nombre: h.f.nombre || "",
    ap1: h.f.ap1 || "",
    ap2: h.f.ap2 || "",
    dia: h.f.dia || "",
    mes: h.f.mes || "",
    anio: h.f.anio || "",
    genero: (h.f.genero === "m" || h.f.genero === "n" ? h.f.genero : "f") as Genero,
  };
}

export function valida(f: FormState): string | null {
  const d = +f.dia,
    m = +f.mes,
    a = +f.anio;
  // El estudio de empresa se hace sólo con el nombre: no hay fecha que pedir
  // ni, por tanto, que comprobar.
  if (f.tipo === "empresa") return f.nombre.trim() ? null : "Falta el nombre de la empresa.";
  if (!f.nombre.trim()) return "Falta el nombre.";
  if (!(d >= 1 && d <= 31)) return "El día debe estar entre 1 y 31.";
  if (!(m >= 1 && m <= 12)) return "El mes debe estar entre 1 y 12.";
  if (!(a >= 1900 && a <= 2100)) return "El año debe tener cuatro cifras.";

  /*
   * QUE LA FECHA EXISTA DE VERDAD.
   *
   * Las tres comprobaciones de arriba dejaban pasar el 31 de febrero, el 31 de
   * abril y el 29 de febrero de un año que no es bisiesto. Cada una por
   * separado es cierta —el día está entre 1 y 31, el mes entre 1 y 12— y
   * juntas no dicen nada sobre si ese día existió.
   *
   * No es un caso raro de laboratorio: es un dedo que resbala al teclear la
   * fecha de nacimiento de una clienta. Y el estudio que sale de una fecha
   * imposible no parece roto: parece un estudio normal con los números de otra
   * persona.
   *
   * Se construye la fecha y se le pregunta qué día cree que es. Si contesta
   * otro, esa fecha no existe y el navegador la ha corregido por su cuenta: el
   * 31 de febrero de 1980 se convierte en 2 de marzo.
   */
  const prueba = new Date(a, m - 1, d);
  if (prueba.getFullYear() !== a || prueba.getMonth() !== m - 1 || prueba.getDate() !== d) {
    const MESES = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    return `El ${d} de ${MESES[m - 1]} de ${a} no existe. Revisa la fecha.`;
  }

  return null;
}

type Ctx = {
  view: View;
  setView: (v: View) => void;
  seccion: Seccion;
  disciplina: Disciplina;
  lateral: boolean;
  setLateral: (v: boolean) => void;
  setDisciplina: (d: Disciplina) => void;
  setSeccion: (s: Seccion) => void;
  base: Base;
  setBase: (b: Base) => void;
  /**
   * A quién se está mirando en Clientes.
   *
   * Vive aquí y no dentro de la pantalla porque se llega desde fuera: pulsar
   * un nombre en la agenda o en una factura abre su ficha, y para eso la
   * pantalla de destino tiene que saber a quién antes de montarse.
   */
  clienteAbierto: string | null;
  setClienteAbierto: (id: string | null) => void;
  /**
   * Con qué se abre la ficha, cuando se llega a ella desde un aviso.
   *
   * El aviso «viste a Carmen ayer y no apuntaste nada» tiene que dejar el cursor
   * dentro del hueco de la nota. Si sólo abriera la ficha, quedaría la mitad del
   * trabajo hecha —llevarla— y la otra mitad —encontrar dónde se escribe— para
   * ella. La pantalla lo consume y lo apaga: es un recado, no un modo.
   */
  focoFicha: "nota" | null;
  setFocoFicha: (f: "nota" | null) => void;
  /**
   * Qué factura hay que abrir al entrar en Facturas.
   *
   * Igual que `clienteAbierto`, y por lo mismo: el aviso de «esta factura lleva
   * once días en borrador» tiene que caer sobre ESA factura, no sobre la lista.
   */
  facturaAbierta: string | null;
  setFacturaAbierta: (id: string | null) => void;
  /**
   * EL NOMBRE QUE VIAJA CON EL CLIC.
   *
   * Desde la ficha de alguien se va a apuntarle una sesión o a hacerle una
   * factura, y en las dos pantallas lo primero que hay que escribir es su
   * nombre. Volver a teclearlo es lo que convierte un botón que promete
   * «hazle una factura» en un botón que sólo cambia de pantalla.
   *
   * Se deja aquí, lo recoge la pantalla que se abre y lo borra. Es un recado y
   * no un estado: si se quedara puesto, la siguiente visita a la agenda vendría
   * con un nombre escrito que nadie ha pedido.
   */
  recado: string | null;
  setRecado: (n: string | null) => void;
  f: FormState;
  set: (k: keyof FormState, v: string) => void;
  r: Resultado | null;
  /** El estudio de empresa, que se lee sólo del nombre. Nunca hay `r` y `re`
   *  a la vez: uno de los dos es siempre nulo. */
  re: ResultadoEmpresa | null;
  id: string | null;
  /** Ya se ha mirado si había un estudio abierto guardado. */
  rehidratado: boolean;
  hist: HistItem[];
  calcular: () => void;
  abrir: (h: HistItem) => void;
  borrar: (h: HistItem) => void;
  edits: Edits;
  /** Baja un fichero con todos los estudios de este navegador. */
  guardaCopia: () => { estudios: number; nombre: string };
  /** Mete en este navegador lo que traiga un fichero de copia. Funde, no sustituye. */
  traeCopia: (texto: string) => ResultadoImportar;
  txt: (id: string, def: string) => string;
  guardaEdit: (bloqueId: string, texto: string) => void;
  restablecer: () => void;
  detalle: Detalle;
  verNumero: (n: number) => void;
  verArcano: (a: number) => void;
  verTexto: (tipo: string, titulo: string, sub: string, texto: string) => void;
  cerrarDetalle: () => void;
  p: FormState;
  setP: (k: keyof FormState, v: string) => void;
  pr: Resultado | null;
  comp: Comparativa | null;
  comparar: () => void;
  marca: string;
  anioUniversal: number;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // La vista no es estado: es la dirección. Se lee de la URL y se cambia
  // navegando, para que la flecha de atrás del navegador funcione sola.
  const router = useRouter();
  const ruta = usePathname();
  const view: View = VISTA[ruta] ?? "inicio";
  const setView = useCallback((v: View) => router.push(RUTA[v]), [router]);
  const [seccion, setSeccion] = useState<Seccion>("resumen");
  const [disciplina, setDisciplina] = useState<Disciplina>("kabala");
  const [base, setBase] = useState<Base>("b22");
  const [clienteAbierto, setClienteAbierto] = useState<string | null>(null);
  const [focoFicha, setFocoFicha] = useState<"nota" | null>(null);
  const [facturaAbierta, setFacturaAbierta] = useState<string | null>(null);
  const [recado, setRecado] = useState<string | null>(null);
  // La columna de la izquierda se pliega para leer el estudio a todo lo ancho.
  const [lateral, setLateral] = useState(true);
  const [f, setF] = useState<FormState>(FORM_VACIO);
  const [r, setR] = useState<Resultado | null>(null);
  // El estudio de empresa es otro cálculo, no un `Resultado` a medias: se
  // guarda en su propio sitio y sólo uno de los dos está lleno a la vez.
  const [re, setRe] = useState<ResultadoEmpresa | null>(null);
  const [id, setId] = useState<string | null>(null);
  // El historial y los retoques viven en el disco de este equipo, y el
  // servidor no puede verlos: si se sembraran aquí, la primera pintada del
  // navegador no coincidiría con el HTML que llega y React tiraría el árbol
  // entero para rehacerlo. Se cargan al montar, junto con el estudio abierto.
  const [hist, setHist] = useState<HistItem[]>([]);
  const [edits, setEdits] = useState<Edits>({});
  const [detalle, setDetalle] = useState<Detalle>(null);
  const [p, setPState] = useState<FormState>(FORM_VACIO);
  const [pr, setPr] = useState<Resultado | null>(null);
  const [comp, setComp] = useState<Comparativa | null>(null);

  // Hasta que no se ha intentado recuperar el estudio abierto no se sabe si
  // hay uno; sin esta bandera el guardia de <Shell> vería `r` vacío en el
  // primer render y devolvería a la entrada antes de darle ocasión.
  const [rehidratado, setRehidratado] = useState(false);

  const anioUniversal = new Date().getFullYear();

  const set = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v })), []);
  const setP = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => setPState((s) => ({ ...s, [k]: v })), []);

  /** Persona o empresa son dos cálculos distintos; sólo uno queda cargado. */
  const aplica = useCallback(
    (form: FormState) => {
      if (form.tipo === "empresa") {
        setRe(calculaEmpresa({ nombre: form.nombre, anioUniversal }));
        setR(null);
      } else {
        setR(calcula(entradaDe(form, anioUniversal)));
        setRe(null);
      }
    },
    [anioUniversal]
  );

  const calcular = useCallback(() => {
    if (valida(f)) return;
    // Los apellidos y la fecha siguen escritos en el formulario aunque se
    // cambie a empresa, y ahí no cuentan: si entrasen, el historial guardaría
    // datos que no son los que se han estudiado.
    const empresa = f.tipo === "empresa";
    const partes = empresa ? [f.nombre] : [f.nombre, f.ap1, f.ap2];
    const hid = [f.tipo, ...partes, empresa ? "" : `${f.dia}|${f.mes}|${f.anio}`].join("|").toUpperCase();
    const item: HistItem = {
      id: hid,
      nombre: partes.filter(Boolean).join(" "),
      fecha: empresa ? "" : `${f.dia}/${f.mes}/${f.anio}`,
      corazon: empresa ? analizaNombre(f.nombre, true).total : calcula(entradaDe(f, anioUniversal)).corazon.valor,
      f: empresa ? { tipo: "empresa", nombre: f.nombre, ap1: "", ap2: "", dia: "", mes: "", anio: "", genero: "n" } : { ...f },
      tocado: new Date().toISOString(),
    };
    setHist((s) => {
      const next = [item].concat(s.filter((h) => h.id !== hid)).slice(0, 40);
      guardaHistorial(next);
      return next;
    });
    /* Y a la nube. Sin `await` y sin romper nada si falla: el estudio ya está
       guardado en el navegador y en la lista, así que un fallo de red no puede
       quitarle a Iris lo que acaba de levantar. Se vuelve a subir solo la
       próxima vez que se abra la plataforma, al fundir. */
    if (hayNube()) void guardaUno(item).catch(() => {});
    aplica(f);
    setId(hid);
    setView("panel");
    setSeccion("resumen");
  }, [f, anioUniversal, aplica, setView]);

  const abrir = useCallback(
    (h: HistItem) => {
      const form = formDe(h);
      setF(form);
      aplica(form);
      setId(h.id);
      setView("panel");
      setSeccion("resumen");
    },
    [aplica, setView]
  );

  // Al cargar la página se recupera el estudio que estaba abierto. Se
  // recalcula en vez de guardarse entero: el motor es determinista y así un
  // cambio en las tablas no deja estudios viejos congelados en el disco.
  //
  // Va en un efecto y no en el valor inicial de `useState` a propósito: las
  // páginas se generan estáticas y el servidor no puede ver el disco de este
  // equipo, así que sembrar el estudio en el primer render rompería la
  // hidratación. Corre una sola vez, al montar.
  //
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    const guardados = cargaHistorial();
    setHist(guardados);
    setEdits(cargaEdits());
    const guardado = cargaActual();
    const h = guardado ? guardados.find((x) => x.id === guardado) : undefined;
    if (h) {
      const form = formDe(h);
      setF(form);
      if (form.tipo === "empresa") setRe(calculaEmpresa({ nombre: form.nombre, anioUniversal }));
      else setR(calcula(entradaDe(form, anioUniversal)));
      setId(h.id);
    }
    setRehidratado(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  /*
   * Y DESPUÉS, LA NUBE.
   *
   * Va en un efecto aparte y no dentro del de arriba por una razón de las que
   * se notan: el de arriba es instantáneo —lee el disco— y éste tarda lo que
   * tarde la red. Juntarlos haría esperar la pantalla entera a Firebase para
   * enseñar algo que ya se tiene delante.
   *
   * Así, al abrir, los estudios aparecen de inmediato y un momento después se
   * completan con lo que hubiera en otro ordenador. Si no hay red, no pasa
   * nada: se queda lo que hay.
   *
   * Corre una sola vez, al montar, igual que el anterior. Y a diferencia del
   * anterior no necesita silenciar a eslint: los `setHist` de aquí dentro van
   * dentro de una función asíncrona, no en el cuerpo del efecto, y eso la
   * regla ya lo da por bueno.
   */
  useEffect(() => {
    if (!hayNube()) return;
    let vivo = true;
    (async () => {
      try {
        const arriba = await leeTodo();
        if (!vivo) return;
        const aqui = cargaHistorial();
        const aquiEdits = cargaEdits();
        const r = funde(aqui, aquiEdits, arriba);

        /* Si lo de la nube no añade ni cambia nada, no se toca el estado: un
           `setHist` con una lista equivalente vuelve a pintar la pantalla
           entera por nada, y en la lista de estudios eso se ve como un
           parpadeo justo al entrar. */
        const igual =
          r.estudios.length === aqui.length &&
          r.estudios.every((h, i) => aqui[i]?.id === h.id && (aqui[i]?.tocado ?? "") === (h.tocado ?? ""));
        if (!igual) {
          setHist(r.estudios);
          guardaHistorial(r.estudios);
          setEdits(r.correcciones);
          guardaEdits(r.correcciones);
        }

        /* LA MUDANZA, que ocurre sola y una sola vez. La primera vez que Iris
           abre esto sus estudios están aquí y la nube está vacía, así que
           `faltanArriba` son todos y suben. A partir de ahí casi siempre está
           vacío y esto no hace nada. */
        if (r.faltanArriba.length) await guardaVarios(r.faltanArriba, r.correcciones);
      } catch {
        /* Sin red, o con las reglas sin publicar, se sigue trabajando con lo
           del navegador. Lo que no se puede es dejar la consulta en blanco. */
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (rehidratado) guardaActual(id);
  }, [id, rehidratado]);

  const borrar = useCallback((h: HistItem) => {
    setHist((s) => {
      const next = s.filter((x) => x.id !== h.id);
      guardaHistorial(next);
      return next;
    });
    /* Borrar SÍ se propaga a la nube, al revés que la ausencia al fundir.
       Que un estudio falte en un lado no significa que se haya borrado —puede
       ser un navegador que todavía no lo ha visto— pero pulsar el botón de
       borrar sí significa exactamente eso. Si no se quitara de arriba,
       reaparecería en el siguiente fundido, que es la forma más desquiciante
       de que algo esté roto. */
    if (hayNube()) void borraDeLaNube(h.id).catch(() => {});
  }, []);

  /* --- la copia de seguridad ---
   * Mientras no haya servidor, esto es lo único que hay entre el trabajo de
   * Iris y perderlo. Al traer un fichero se actualiza también el estado de
   * React, o el historial de la pantalla seguiría enseñando lo de antes. */
  const guardaCopia = useCallback(() => descargaRespaldo(), []);

  const traeCopia = useCallback((texto: string) => {
    const res = importaRespaldo(texto);
    if (res.ok) {
      setHist(res.estudios);
      setEdits(res.correcciones);
      /* Lo que entra por un fichero sube también. Si no, traer una copia en un
         ordenador dejaría esos estudios viviendo sólo ahí — justo el problema
         que esto venía a quitar. */
      if (hayNube()) void guardaVarios(res.estudios, res.correcciones).catch(() => {});
    }
    return res;
  }, []);

  /*
   * LO QUE IRIS ESCRIBE ENCIMA DE UNA CARTA.
   *
   * Esto es, de todo lo que hay aquí, lo más caro de perder: la carta se
   * vuelve a calcular en un segundo —el motor es determinista— pero el
   * párrafo que ella escribió sobre esa persona concreta no se recupera de
   * ningún sitio. Por eso sube a la nube igual que el estudio.
   *
   * Sube el estudio ENTERO con sus correcciones, no la corrección suelta: así
   * el documento de arriba nunca queda a medias, con una corrección nueva y
   * una ficha vieja.
   */
  const guardaEdit = useCallback(
    (bloqueId: string, texto: string) => {
      if (!id) return;
      setEdits((s) => {
        const next: Edits = { ...s, [id]: { ...(s[id] || {}), [bloqueId]: texto } };
        guardaEdits(next);
        if (hayNube()) {
          const h = hist.find((x) => x.id === id);
          if (h) void guardaUno({ ...h, tocado: new Date().toISOString() }, next[id]).catch(() => {});
        }
        return next;
      });
    },
    [id, hist]
  );
  const txt = useCallback((bloqueId: string, def: string) => (id && edits[id] && edits[id][bloqueId] !== undefined ? edits[id][bloqueId] : def), [id, edits]);
  const restablecer = useCallback(() => {
    if (!id) return;
    setEdits((s) => {
      const next = { ...s };
      delete next[id];
      guardaEdits(next);
      if (hayNube()) {
        const h = hist.find((x) => x.id === id);
        /* Se sube con las correcciones vacías, no se deja de subir: si no, el
           documento de arriba se quedaría con las de antes y volverían solas
           al abrir en otro ordenador. */
        if (h) void guardaUno({ ...h, tocado: new Date().toISOString() }, {}).catch(() => {});
      }
      return next;
    });
  }, [id, hist]);

  const verNumero = useCallback((n: number) => {
    const F = fichaDe(n);
    if (!F) return;
    setDetalle({ tipo: "numero", f: F });
  }, []);
  const verArcano = useCallback((a: number) => setDetalle({ tipo: "arcano", a }), []);
  const verTexto = useCallback((tipo: string, titulo: string, sub: string, texto: string) => setDetalle({ tipo: "texto", etiqueta: tipo, titulo, sub, texto }), []);
  const cerrarDetalle = useCallback(() => setDetalle(null), []);

  const comparar = useCallback(() => {
    if (valida(p) || !r) return;
    const resultado = calcula(entradaDe(p, anioUniversal));
    setPr(resultado);
    setComp(comparaPareja(r, resultado));
  }, [p, r, anioUniversal]);

  const value = useMemo<Ctx>(
    () => ({
      view,
      setView,
      seccion,
      disciplina,
      setDisciplina,
      base,
      setBase,
      lateral,
      setLateral,
      setSeccion,
      clienteAbierto,
      setClienteAbierto,
      focoFicha,
      setFocoFicha,
      facturaAbierta,
      setFacturaAbierta,
      recado,
      setRecado,
      f,
      set,
      r,
      re,
      id,
      rehidratado,
      hist,
      calcular,
      abrir,
      borrar,
      edits,
      guardaCopia,
      traeCopia,
      txt,
      guardaEdit,
      restablecer,
      detalle,
      verNumero,
      verArcano,
      verTexto,
      cerrarDetalle,
      p,
      setP,
      pr,
      comp,
      comparar,
      marca: MARCA,
      anioUniversal,
    }),
    [view, setView, seccion, disciplina, base, lateral, clienteAbierto, focoFicha, facturaAbierta, recado, f, set, r, re, id, rehidratado, hist, calcular, abrir, borrar, edits, guardaCopia, traeCopia, txt, guardaEdit, restablecer, detalle, verNumero, verArcano, verTexto, cerrarDetalle, p, setP, pr, comp, comparar, anioUniversal]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
