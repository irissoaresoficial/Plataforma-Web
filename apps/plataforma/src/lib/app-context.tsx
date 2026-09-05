"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { analizaNombre, calcula, calculaEmpresa, comparaPareja, ficha as fichaDe, type Resultado, type ResultadoEmpresa, type Comparativa, type Ficha, type Genero } from "./engine";
import { cargaHistorial, guardaHistorial, cargaEdits, guardaEdits, cargaActual, guardaActual, type HistItem, type Edits } from "./storage";
import { descargaRespaldo, importaRespaldo, type ResultadoImportar } from "./respaldo";

export type View = "inicio" | "panel" | "estudio" | "pareja";

/**
 * Cada pantalla tiene su dirección. La consulta es la raíz; las demás cuelgan
 * de ella. Así se puede guardar el enlace del panel, volver con la flecha del
 * navegador y compartir una pantalla concreta, que antes era imposible: todo
 * el sitio vivía en la misma dirección.
 */
const RUTA: Record<View, string> = {
  inicio: "/",
  panel: "/panel",
  estudio: "/estudio",
  pareja: "/pareja",
};
const VISTA: Record<string, View> = { "/": "inicio", "/panel": "panel", "/estudio": "estudio", "/pareja": "pareja" };
export type Seccion = "resumen" | "arbol" | "numeros" | "estructura" | "alma" | "cuentas" | "ciclos";

/** Las tres disciplinas de la escuela. Kábala es la que está construida; las
 *  otras dos existen ya en la navegación y avisan de que están por hacer. */
export type Disciplina = "kabala" | "fengshui" | "numerologia";
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
    };
    setHist((s) => {
      const next = [item].concat(s.filter((h) => h.id !== hid)).slice(0, 40);
      guardaHistorial(next);
      return next;
    });
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

  useEffect(() => {
    if (rehidratado) guardaActual(id);
  }, [id, rehidratado]);

  const borrar = useCallback((h: HistItem) => {
    setHist((s) => {
      const next = s.filter((x) => x.id !== h.id);
      guardaHistorial(next);
      return next;
    });
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
    }
    return res;
  }, []);

  const guardaEdit = useCallback(
    (bloqueId: string, texto: string) => {
      if (!id) return;
      setEdits((s) => {
        const next: Edits = { ...s, [id]: { ...(s[id] || {}), [bloqueId]: texto } };
        guardaEdits(next);
        return next;
      });
    },
    [id]
  );
  const txt = useCallback((bloqueId: string, def: string) => (id && edits[id] && edits[id][bloqueId] !== undefined ? edits[id][bloqueId] : def), [id, edits]);
  const restablecer = useCallback(() => {
    if (!id) return;
    setEdits((s) => {
      const next = { ...s };
      delete next[id];
      guardaEdits(next);
      return next;
    });
  }, [id]);

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
      lateral,
      setLateral,
      setSeccion,
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
    [view, setView, seccion, disciplina, lateral, f, set, r, re, id, rehidratado, hist, calcular, abrir, borrar, edits, guardaCopia, traeCopia, txt, guardaEdit, restablecer, detalle, verNumero, verArcano, verTexto, cerrarDetalle, p, setP, pr, comp, comparar, anioUniversal]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
