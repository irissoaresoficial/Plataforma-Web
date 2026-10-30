"use client";
/**
 * ============================================================================
 * EL ESTUDIO DE FENG SHUI
 * ============================================================================
 *
 * Gerson, el 30 de octubre de 2026: «necesito agregar un nuevo módulo llamado
 * Feng Shui (…) la idea es crear la lectura (…) el luopan debe aparecer
 * interactivamente ahí mismo (…) al final se debe redactar el PDF para
 * entregar al cliente».
 *
 * Cinco partes, en el orden de una visita de verdad, y las mismas cinco en la
 * columna de la izquierda:
 *
 *   VIVIENDA   — de quién es, dónde está, cuándo se hizo y quién vive dentro.
 *   PLANO      — de donde sale casi todo. Gerson: «se debe subir la imagen del
 *                plano y de ahí sacas todo eso». Al subirlo se buscan solas
 *                las paredes de fuera y se colocan las nueve zonas; con la
 *                flecha del norte del plano sale la orientación; y se marca
 *                qué estancia hay en cada zona.
 *   LUOPAN     — la comprobación en la visita: la medida de verdad, con la
 *                brújula del móvil, girando con el dedo o escribiendo grados.
 *   ESTRELLAS  — la carta de la vivienda, la del año y lo que no se toca.
 *   INFORME    — lo que se entrega, listo para guardar en PDF.
 *
 * El diseño sigue la referencia que mandó Gerson: el plano en grande en el
 * centro, y la información en piezas de cristal alrededor, sin tapar nunca la
 * vivienda.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp, type ParteFengShui } from "@/lib/app-context";
import { imprimir } from "@/lib/imprimir";
import {
  APOYO,
  BOTON_NORMAL,
  BOTON_PLANO,
  CABECERA,
  CAMPO,
  NOTA,
  PANTALLA,
  PASTILLA,
  PASTILLA_ELEGIDA,
  TARJETA,
  TITULO,
  botonPrincipal,
  rotulo,
} from "@/lib/ui";
import {
  BA_ZHAI,
  MANSIONES,
  MANSION_BUENA,
  NOMBRE_DIR,
  anioFengShui,
  anioSolar,
  dirDe,
  dispersion,
  encerrada,
  grupoDe,
  kuaDeCasa,
  mansionesPorDir,
  montanaDe,
  norm,
  raya,
  type Casilla,
  type Lado,
} from "@/lib/fengshui/calculo";
import {
  achicaImagen,
  detectaParedes,
  fachadaDelPlano,
  cargaEstudios,
  cargaPlano,
  cartaDeEstudio,
  estudioNuevo,
  guardaEstudios,
  guardaPlano,
  idActual,
  kuaDe,
  lecturaNueva,
  mediaLecturas,
  ocupanteNuevo,
  periodoDeEstudio,
  type EstudioFs,
  type Ocupante,
} from "@/lib/fengshui/estudio";
import { useBrujulaMovil } from "@/lib/fengshui/brujula";
import { ESPECIAL, ESTANCIAS, ESTRELLA, FORMACION, MANSION, propuestaEstancia, propuestaZona } from "@/lib/fengshui/textos";
import Luopan from "../fengshui/Luopan";
import Cuadricula from "../fengshui/Cuadricula";
import Plano from "../fengshui/Plano";
import Informe from "../fengshui/Informe";

const PARTES: Array<{ k: ParteFengShui; label: string }> = [
  { k: "datos", label: "Vivienda" },
  { k: "plano", label: "Plano" },
  { k: "brujula", label: "Luopan" },
  { k: "estrellas", label: "Estrellas" },
  { k: "informe", label: "Informe" },
];

const CRISTAL =
  "background:var(--vidrio);backdrop-filter:var(--vidrio-difuminado);-webkit-backdrop-filter:var(--vidrio-difuminado);border:1px solid var(--vidrio-borde);border-radius:var(--r-tarjeta);box-shadow:var(--nm-alto);";
const BLOQUE = "background:var(--bloque);color:var(--sobre-bloque);border-radius:var(--r-tarjeta);box-shadow:var(--shadow-lg);";
const coma = (n: number, d = 1) => n.toFixed(d).replace(".", ",");
const DONDE = ["Puerta principal", "Centro de la fachada", "Lado izquierdo", "Lado derecho", "A 2 m de la puerta"];

/** Un campo con su rótulo encima. */
function Campo({ label, children, ancho }: { label: string; children: React.ReactNode; ancho?: string }) {
  return (
    <label style={css("display:flex;flex-direction:column;gap:6px;min-width:0;" + (ancho ? `flex:${ancho};` : ""))}>
      <span style={css(rotulo())}>{label}</span>
      {children}
    </label>
  );
}

/** Un interruptor de varias opciones, en pastillas. */
function Opciones<T extends string>({ valor, opciones, alCambiar, etiqueta }: { valor: T; opciones: Array<[T, string]>; alCambiar: (v: T) => void; etiqueta: string }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} style={css("display:flex;flex-wrap:wrap;gap:6px;")}>
      {opciones.map(([k, t]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={valor === k}
          onClick={() => alCambiar(k)}
          style={css(
            (valor === k ? PASTILLA_ELEGIDA : PASTILLA) +
              "padding:7px 13px;border-radius:var(--r-pill);font-size:var(--t-mini);font-weight:590;cursor:pointer;color:" +
              (valor === k ? "var(--accion)" : "var(--text-3)") +
              ";"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export default function FengShuiScreen() {
  const { parteFs, setParteFs, f: consulta } = useApp();
  const quieto = useReducedMotion();

  /* ----------------------------------------------------------- EL ESTADO */
  const [lista, setLista] = useState<EstudioFs[]>([]);
  const [e, setE] = useState<EstudioFs>(() => estudioNuevo());
  const [plano, setPlano] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [zona, setZona] = useState<Casilla | null>(null);
  const [verAnio, setVerAnio] = useState<"actual" | "siguiente" | "no">("actual");
  const [persona, setPersona] = useState<string>("");
  const [conLuopan, setConLuopan] = useState(true);
  const [vivo, setVivo] = useState(180);
  const [donde, setDonde] = useState(DONDE[0]);
  const archivo = useRef<HTMLInputElement>(null);

  /* Se carga lo guardado en este navegador al montar. Antes de eso la
     pantalla pinta un estudio en blanco, igual en el servidor y aquí. */
  useEffect(() => {
    const l = cargaEstudios();
    const id = idActual();
    const elegido = l.find((x) => x.id === id) ?? l[0];
    if (elegido) {
      setLista(l);
      setE(elegido);
      setPlano(cargaPlano(elegido.id));
      if (elegido.fachada !== null) setVivo(elegido.fachada);
    }
    setListo(true);
  }, []);

  /* Cada cambio se guarda. Si el navegador no deja, se dice. */
  const cambia = useCallback((parche: Partial<EstudioFs>) => {
    setE((prev) => {
      const nuevo = { ...prev, ...parche, actualizado: new Date().toISOString() };
      setLista((l) => {
        const sig = l.some((x) => x.id === nuevo.id) ? l.map((x) => (x.id === nuevo.id ? nuevo : x)) : [nuevo, ...l];
        if (!guardaEstudios(sig, nuevo.id)) setAviso("Este navegador no deja guardar más. Borra algún estudio antiguo o usa un plano más pequeño.");
        return sig;
      });
      return nuevo;
    });
  }, []);

  const abre = (id: string) => {
    const x = lista.find((y) => y.id === id);
    if (!x) return;
    setE(x);
    setPlano(cargaPlano(x.id));
    setVivo(x.fachada ?? 180);
    setZona(null);
    guardaEstudios(lista, x.id);
  };

  const nuevo = () => {
    const n = estudioNuevo();
    const sig = [n, ...lista];
    setLista(sig);
    setE(n);
    setPlano(null);
    setVivo(180);
    setZona(null);
    guardaEstudios(sig, n.id);
    setParteFs("datos");
  };

  const borra = () => {
    const sig = lista.filter((x) => x.id !== e.id);
    guardaPlano(e.id, null);
    const sigActual = sig[0] ?? estudioNuevo();
    setLista(sig);
    setE(sigActual);
    setPlano(cargaPlano(sigActual.id));
    guardaEstudios(sig, sig[0]?.id ?? null);
  };

  /* -------------------------------------------------- LO QUE SE DEDUCE */
  const carta = useMemo(() => cartaDeEstudio(e), [e]);
  const periodo = periodoDeEstudio(e);
  const hoy = useMemo(() => new Date(), []);
  const anioActual = useMemo(() => anioSolar(hoy.getDate(), hoy.getMonth() + 1, hoy.getFullYear()).anio, [hoy]);
  const anios = useMemo(() => [anioFengShui(anioActual), anioFengShui(anioActual + 1)], [anioActual]);
  const anioVisto = verAnio === "no" ? null : anios[verAnio === "actual" ? 0 : 1];
  const ocupante = e.ocupantes.find((o) => o.id === persona);
  const kuaPersona = ocupante ? kuaDe(ocupante) : null;
  const mansiones = kuaPersona ? mansionesPorDir(kuaPersona.kua) : null;
  const casaKua = e.fachada !== null ? kuaDeCasa(e.fachada) : null;

  const brujula = useBrujulaMovil(setVivo);

  /*
   * LA ORIENTACIÓN QUE SALE DEL PLANO.
   *
   * Mientras no haya lecturas del luopan, manda el plano: al girar la flecha
   * del norte o cambiar el lado de la fachada, la orientación se recalcula
   * sola. En cuanto hay una medida de verdad, manda la medida, y el plano se
   * queda como comparación.
   */
  const delPlano = fachadaDelPlano(e);
  const manda = e.lecturas.length === 0;
  const ponNorte = (n: number | null) => {
    const prueba = { ...e, nortePlano: n };
    const g = fachadaDelPlano(prueba);
    cambia(manda && g !== null ? { nortePlano: n, fachada: g } : { nortePlano: n });
    if (manda && g !== null) setVivo(g);
  };
  const ponLado = (l: Lado) => {
    const g = fachadaDelPlano({ ...e, lado: l });
    cambia(manda && g !== null ? { lado: l, fachada: g } : { lado: l });
    if (manda && g !== null) setVivo(g);
  };
  const ajustaParedes = async (datos: string) => {
    const r = await detectaParedes(datos);
    if (r) cambia({ rejilla: r });
    return Boolean(r);
  };

  /* ----------------------------------------------------------- PIEZAS */
  const resumen: Array<[string, string]> = [
    ["Fachada", e.fachada !== null ? `${coma(e.fachada)}° · ${montanaDe(e.fachada).codigo} ${montanaDe(e.fachada).pinyin}` : "Sin medir"],
    ["Periodo", periodo ? String(periodo) : "Falta el año"],
    ["Carta", carta ? FORMACION[carta.formacion].nombre : "Sin calcular"],
    [
      "Personas",
      e.ocupantes.length
        ? e.ocupantes
            .map((o) => kuaDe(o))
            .filter(Boolean)
            .map((k) => `Kua ${k!.kua}`)
            .join(" · ") || `${e.ocupantes.length}`
        : "Ninguna",
    ],
  ];

  const detalleZona = (k: Casilla) => {
    if (!carta) return null;
    const m = carta.montana[k];
    const w = carta.agua[k];
    const a = anios[0].carta[k];
    const props = propuestaZona({
      casilla: k,
      montana: m,
      agua: w,
      anual: a,
      taiSui: k !== "C" && anios[0].taiSui.dir === k,
      suiPo: k !== "C" && anios[0].suiPo.dir === k,
      sanSha: k !== "C" && anios[0].sanSha === k,
    });
    return (
      <motion.div
        key={k}
        initial={quieto ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={css(CRISTAL + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}
      >
        <div style={css("display:flex;align-items:baseline;justify-content:space-between;gap:var(--s3);")}>
          <span style={css(TITULO)}>{NOMBRE_DIR[k]}</span>
          <button type="button" onClick={() => setZona(null)} style={css(BOTON_PLANO + "padding:5px 11px;")} aria-label="Cerrar la zona">
            Cerrar
          </button>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:8px;")}>
          {(
            [
              ["Montaña", m, "Personas"],
              ["Agua", w, "Dinero"],
              [`Año ${anios[0].anio}`, a, ESTRELLA[a].estado],
            ] as Array<[string, number, string]>
          ).map(([t, n, sub]) => (
            <div key={t} style={css(PASTILLA + "padding:10px;display:flex;flex-direction:column;gap:2px;")}>
              <span style={css(rotulo("var(--text-4)"))}>{t}</span>
              <span style={css("font-size:var(--t-head);font-weight:650;line-height:1;color:" + (n === 5 ? "#b8860b" : ESTRELLA[n].favorable ? "var(--green)" : "var(--red)") + ";")}>{n}</span>
              <span style={css(NOTA)}>{sub}</span>
            </div>
          ))}
        </div>
        <p style={css(APOYO + "margin:0;")}>
          <strong>Montaña {m}:</strong> {ESTRELLA[m].dice}
        </p>
        <p style={css(APOYO + "margin:0;")}>
          <strong>Agua {w}:</strong> {ESTRELLA[w].dice}
        </p>
        {mansiones && k !== "C" && (
          <p style={css(APOYO + "margin:0;")}>
            <strong>Para {ocupante?.nombre || "esta persona"}:</strong> {MANSION[mansiones[k]].nombre}. {MANSION[mansiones[k]].dice}
          </p>
        )}
        <div style={css("display:flex;flex-direction:column;gap:6px;")}>
          <span style={css(rotulo())}>Qué hay en esta zona del plano</span>
          <div style={css("display:flex;flex-wrap:wrap;gap:6px;")}>
            {ESTANCIAS.map((t) => {
              const puesta = (e.estancias[k] ?? []).includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={puesta}
                  onClick={() => {
                    const ya = e.estancias[k] ?? [];
                    cambia({ estancias: { ...e.estancias, [k]: puesta ? ya.filter((x) => x !== t) : [...ya, t] } });
                  }}
                  style={css(
                    (puesta ? PASTILLA_ELEGIDA : PASTILLA) +
                      "padding:6px 11px;border-radius:var(--r-pill);font-size:var(--t-mini);font-weight:590;cursor:pointer;color:" +
                      (puesta ? "var(--accion)" : "var(--text-3)") +
                      ";"
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        {(() => {
          const porEstancia = (e.estancias[k] ?? []).map((t) => propuestaEstancia(t, { montana: m, agua: w, anual: a })).filter((x): x is string => Boolean(x));
          const todas = [...porEstancia, ...props];
          return todas.length > 0 ? (
            <ul style={css("margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;" + APOYO)}>
              {todas.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : null;
        })()}
        <Campo label="Tu nota para esta zona · va al informe">
          <textarea
            value={e.notas[k] ?? ""}
            onChange={(ev) => cambia({ notas: { ...e.notas, [k]: ev.target.value } })}
            rows={3}
            placeholder="Por ejemplo: el dormitorio principal está aquí; mover el cabecero a la pared norte."
            style={css(CAMPO + "resize:vertical;line-height:1.5;")}
          />
        </Campo>
      </motion.div>
    );
  };

  const falta = !carta && (
    <div style={css(CRISTAL + "padding:var(--pad-card-sm);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--s3);")}>
      <span style={css(APOYO)}>
        Para ver las estrellas faltan {e.fachada === null ? "la orientación: gira la flecha del norte del plano o mide con el luopan" : ""}
        {e.fachada === null && periodo === null ? ", y " : ""}
        {periodo === null ? "el año de obra de la vivienda" : ""}.
      </span>
      <button type="button" onClick={() => setParteFs(e.fachada === null ? "plano" : "datos")} style={css(botonPrincipal())}>
        {e.fachada === null ? "Ir al plano" : "Poner el año de obra"}
      </button>
    </div>
  );

  const elegirPersona = e.ocupantes.length > 0 && (
    <Campo label="Ver las direcciones de">
      <select value={persona} onChange={(ev) => setPersona(ev.target.value)} style={css(CAMPO)}>
        <option value="">Nadie</option>
        {e.ocupantes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre || "Sin nombre"}
            {kuaDe(o) ? ` · Kua ${kuaDe(o)!.kua}` : ""}
          </option>
        ))}
      </select>
    </Campo>
  );

  /* ================================================================ VISTA */
  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--gap);")}>
      {/* ----------------------------------------------------- CABECERA */}
      <div data-chrome="1" style={css("display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--s4);")}>
        <div style={css("display:flex;flex-direction:column;gap:6px;min-width:0;")}>
          <span style={css(rotulo("var(--gold)"))}>Feng Shui · escuela de la brújula</span>
          <h1 style={css(CABECERA + "margin:0;")}>{e.cliente || "Vivienda sin nombre"}</h1>
          {e.direccion && <span style={css(APOYO)}>{e.direccion}</span>}
        </div>
        <div style={css("display:flex;flex-wrap:wrap;gap:8px;align-items:center;")}>
          {lista.length > 1 && (
            <select aria-label="Abrir otro estudio" value={e.id} onChange={(ev) => abre(ev.target.value)} style={css(CAMPO + "width:auto;max-width:240px;")}>
              {lista.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.cliente || "Vivienda sin nombre"}
                </option>
              ))}
            </select>
          )}
          <button type="button" onClick={nuevo} style={css(BOTON_NORMAL)}>
            Nuevo estudio
          </button>
        </div>
      </div>

      {/* -------------------------------------------------- EL RESUMEN */}
      <div data-chrome="1" style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;")}>
        {resumen.map(([t, v]) => (
          <div key={t} style={css(CRISTAL + "padding:14px 16px;display:flex;flex-direction:column;gap:4px;border-radius:var(--r-lg);")}>
            <span style={css(rotulo("var(--text-4)"))}>{t}</span>
            <span style={css("font-size:var(--t-read);font-weight:600;color:var(--text);letter-spacing:-.01em;")}>{v}</span>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------- LAS PARTES */}
      <div data-chrome="1" role="tablist" aria-label="Partes del estudio" style={css(CRISTAL + "display:flex;gap:4px;padding:5px;border-radius:var(--r-pill);overflow-x:auto;align-self:flex-start;max-width:100%;")}>
        {PARTES.map(({ k, label }) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={parteFs === k}
            onClick={() => setParteFs(k)}
            style={css(
              "border:none;cursor:pointer;white-space:nowrap;padding:9px 18px;border-radius:var(--r-pill);font-size:var(--t-body);font-weight:590;transition:background var(--t-normal),color var(--t-normal);" +
                (parteFs === k ? "background:var(--accion);color:var(--sobre-accion);box-shadow:var(--shadow-sm);" : "background:transparent;color:var(--text-3);")
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {aviso && (
        <div data-chrome="1" role="alert" style={css("padding:12px 16px;border-radius:var(--r);background:var(--red-soft);border:1px solid var(--red-border);color:var(--red);font-size:var(--t-body);")}>
          {aviso}
        </div>
      )}

      {!listo ? null : (
        <>
          {/* ============================================= 1 · VIVIENDA */}
          {parteFs === "datos" && (
            <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:var(--gap);align-items:start;")}>
              <section style={css(TARJETA + "padding:var(--pad-card);display:flex;flex-direction:column;gap:var(--s4);")}>
                <h2 style={css(TITULO + "margin:0;")}>La vivienda</h2>
                <Campo label="Cliente">
                  <input value={e.cliente} onChange={(ev) => cambia({ cliente: ev.target.value })} placeholder="Nombre y apellidos" style={css(CAMPO)} />
                </Campo>
                <Campo label="Dirección">
                  <input value={e.direccion} onChange={(ev) => cambia({ direccion: ev.target.value })} placeholder="Calle, número, ciudad" style={css(CAMPO)} />
                </Campo>
                <Campo label="Tipo">
                  <Opciones
                    etiqueta="Tipo de vivienda"
                    valor={e.tipo}
                    opciones={[
                      ["piso", "Piso"],
                      ["casa", "Casa"],
                      ["local", "Local"],
                    ]}
                    alCambiar={(v) => cambia({ tipo: v })}
                  />
                </Campo>
                {e.tipo === "piso" && (
                  <Campo label="Planta">
                    <input value={e.planta} onChange={(ev) => cambia({ planta: ev.target.value })} placeholder="3.º B" style={css(CAMPO)} />
                  </Campo>
                )}
                <div style={css("display:flex;gap:var(--s3);flex-wrap:wrap;")}>
                  <Campo label="Año de obra o gran reforma" ancho="1 1 160px">
                    <input inputMode="numeric" value={e.anioObra} onChange={(ev) => cambia({ anioObra: ev.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="2008" style={css(CAMPO)} />
                  </Campo>
                  <Campo label="Año en que entraron" ancho="1 1 160px">
                    <input inputMode="numeric" value={e.anioEntrada} onChange={(ev) => cambia({ anioEntrada: ev.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="2019" style={css(CAMPO)} />
                  </Campo>
                </div>
                <Campo label="Periodo de la vivienda">
                  <select
                    value={e.periodoManual ?? ""}
                    onChange={(ev) => cambia({ periodoManual: ev.target.value ? Number(ev.target.value) : null })}
                    style={css(CAMPO)}
                  >
                    <option value="">{periodo && !e.periodoManual ? `Automático: periodo ${periodo}` : "Automático, según el año de obra"}</option>
                    {[6, 7, 8, 9].map((p) => (
                      <option key={p} value={p}>
                        Periodo {p} · {1864 + (p - 1) * 20}–{1864 + p * 20 - 1}
                      </option>
                    ))}
                  </select>
                </Campo>
                <p style={css(NOTA + "margin:0;line-height:1.5;")}>
                  La mayoría de escuelas cuenta desde que se terminó la obra, o desde la última reforma grande: tejado nuevo, puerta principal cambiada o suelos levantados. Si sigues otra regla, fíjalo a mano.
                </p>
              </section>

              <section style={css(TARJETA + "padding:var(--pad-card);display:flex;flex-direction:column;gap:var(--s4);")}>
                <h2 style={css(TITULO + "margin:0;")}>Quién vive en ella</h2>
                {e.ocupantes.length === 0 && <p style={css(APOYO + "margin:0;")}>Añade a cada persona que duerme en la vivienda. Con su fecha de nacimiento sale su número Kua.</p>}
                {e.ocupantes.map((o) => {
                  const k = kuaDe(o);
                  const pon = (p: Partial<Ocupante>) => cambia({ ocupantes: e.ocupantes.map((x) => (x.id === o.id ? { ...x, ...p } : x)) });
                  return (
                    <div key={o.id} style={css(PASTILLA + "padding:var(--s4);display:flex;flex-direction:column;gap:var(--s3);border-radius:var(--r-lg);")}>
                      <div style={css("display:flex;gap:var(--s3);flex-wrap:wrap;align-items:flex-end;")}>
                        <Campo label="Nombre" ancho="2 1 160px">
                          <input value={o.nombre} onChange={(ev) => pon({ nombre: ev.target.value })} style={css(CAMPO)} />
                        </Campo>
                        {(["dia", "mes", "anio"] as const).map((c) => (
                          <Campo key={c} label={{ dia: "Día", mes: "Mes", anio: "Año" }[c]} ancho={c === "anio" ? "0 0 82px" : "0 0 58px"}>
                            <input
                              inputMode="numeric"
                              value={o[c]}
                              onChange={(ev) => pon({ [c]: ev.target.value.replace(/\D/g, "").slice(0, c === "anio" ? 4 : 2) })}
                              style={css(CAMPO + "text-align:center;")}
                            />
                          </Campo>
                        ))}
                      </div>
                      <div style={css("display:flex;flex-wrap:wrap;gap:var(--s3);align-items:center;justify-content:space-between;")}>
                        <Opciones
                          etiqueta="Fórmula del número Kua"
                          valor={o.formula}
                          opciones={[
                            ["f", "Fórmula femenina"],
                            ["m", "Fórmula masculina"],
                          ]}
                          alCambiar={(v) => pon({ formula: v })}
                        />
                        <div style={css("display:flex;gap:8px;align-items:center;")}>
                          {k ? (
                            <span style={css("padding:6px 12px;border-radius:var(--r-pill);background:var(--accion);color:var(--sobre-accion);font-size:var(--t-mini);font-weight:650;")}>
                              Kua {k.kua} · {k.grupo === "este" ? "Este" : "Oeste"}
                            </span>
                          ) : (
                            <span style={css(NOTA)}>Falta la fecha</span>
                          )}
                          <button type="button" onClick={() => cambia({ ocupantes: e.ocupantes.filter((x) => x.id !== o.id) })} style={css(BOTON_PLANO + "padding:6px 11px;")}>
                            Quitar
                          </button>
                        </div>
                      </div>
                      {k?.dudoso && (
                        <p style={css(NOTA + "margin:0;color:var(--red);")}>
                          Nació el día en que cambia el año solar. El número depende de la hora: se ha tomado el año {k.anioSolar}. Pregunta la hora de nacimiento.
                        </p>
                      )}
                    </div>
                  );
                })}
                <div style={css("display:flex;flex-wrap:wrap;gap:8px;")}>
                  <button type="button" onClick={() => cambia({ ocupantes: [...e.ocupantes, ocupanteNuevo()] })} style={css(botonPrincipal())}>
                    Añadir persona
                  </button>
                  {consulta.tipo === "persona" && consulta.nombre && consulta.anio && !e.ocupantes.some((o) => o.nombre === `${consulta.nombre} ${consulta.ap1}`.trim()) && (
                    <button
                      type="button"
                      onClick={() =>
                        cambia({
                          ocupantes: [
                            ...e.ocupantes,
                            ocupanteNuevo({
                              nombre: `${consulta.nombre} ${consulta.ap1}`.trim(),
                              dia: consulta.dia,
                              mes: consulta.mes,
                              anio: consulta.anio,
                              formula: consulta.genero === "m" ? "m" : "f",
                            }),
                          ],
                          cliente: e.cliente || `${consulta.nombre} ${consulta.ap1} ${consulta.ap2}`.trim(),
                        })
                      }
                      style={css(BOTON_NORMAL)}
                    >
                      Añadir a {consulta.nombre}, de la consulta
                    </button>
                  )}
                </div>
                <p style={css(NOTA + "margin:0;line-height:1.5;")}>
                  El número Kua tiene dos fórmulas, una femenina y una masculina, y el año empieza en febrero, no en enero. Quien lee el estudio elige la fórmula de cada persona.
                </p>
              </section>

              <section style={css(CRISTAL + "padding:var(--pad-card);display:flex;flex-direction:column;gap:var(--s3);grid-column:1/-1;")}>
                <h2 style={css(TITULO + "margin:0;")}>Para la visita</h2>
                <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:var(--s3);")}>
                  {[
                    ["El plano", "A escala, con las habitaciones, la cocina, los baños, la cama principal y la mesa de trabajo marcadas."],
                    ["La fachada", "La cara principal de la vivienda: hacia la calle o hacia lo más abierto. No siempre es la puerta."],
                    ["Las fechas", "Cuándo se terminó la obra, si hubo reformas grandes y cuándo entraron a vivir."],
                    ["El entorno", "Calles, agua, edificios altos, esquinas o farolas que apunten a la casa. Fotos de todo."],
                    ["Las obras", "Si piensan reformar algo este año: hay zonas que no conviene tocar."],
                    ["Lo que buscan", "Qué les preocupa y qué quieren mejorar. El informe se centra en eso."],
                  ].map(([t, d]) => (
                    <div key={t} style={css("display:flex;flex-direction:column;gap:4px;")}>
                      <span style={css("font-weight:650;color:var(--text);font-size:var(--t-body);")}>{t}</span>
                      <span style={css(NOTA + "line-height:1.5;")}>{d}</span>
                    </div>
                  ))}
                </div>
                {lista.some((x) => x.id === e.id) && (
                  <div style={css("display:flex;justify-content:flex-end;")}>
                    <button type="button" onClick={borra} style={css(BOTON_PLANO + "color:var(--red);")}>
                      Borrar este estudio
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* =============================================== 2 · LUOPAN */}
          {parteFs === "brujula" && (
            <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:var(--gap);align-items:start;")}>
              <section style={css(CRISTAL + "padding:clamp(14px,2.4vw,28px);display:flex;flex-direction:column;align-items:center;gap:var(--s3);position:sticky;top:84px;")}>
                <div style={css("width:100%;max-width:560px;")}>
                  <Luopan grados={vivo} alGirar={brujula.estado === "encendida" ? undefined : setVivo} mansiones={mansiones} />
                </div>
                <span style={css(NOTA + "text-align:center;")}>
                  {brujula.estado === "encendida" ? "Gira contigo: mantén el móvil plano, de espaldas a la casa." : "Arrastra el plato para girarlo. El hilo rojo de arriba es la fachada."}
                </span>
              </section>

              <div style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
                {/* La lectura: la pieza oscura de esta pantalla. */}
                <section style={css(BLOQUE + "padding:var(--pad-card);display:flex;flex-direction:column;gap:var(--s3);")}>
                  <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--sobre-bloque-2);")}>Bajo el hilo rojo</span>
                  <span style={css("font-size:var(--t-hero);font-weight:600;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums;")}>{coma(vivo)}°</span>
                  <span style={css("font-size:var(--t-read);")}>
                    {montanaDe(vivo).codigo} · {montanaDe(vivo).pinyin} {montanaDe(vivo).hanzi} · {NOMBRE_DIR[dirDe(vivo)]}
                  </span>
                  <span style={css("font-size:var(--t-body);color:var(--sobre-bloque-2);")}>
                    Se sienta en {montanaDe(vivo + 180).codigo} · {montanaDe(vivo + 180).pinyin} {montanaDe(vivo + 180).hanzi} · {NOMBRE_DIR[dirDe(vivo + 180)]}
                  </span>
                  {raya(vivo).tipo !== "ninguna" && (
                    <span style={css("padding:8px 12px;border-radius:var(--r);background:var(--bloque-2);border:1px solid var(--bloque-borde);font-size:var(--t-mini);line-height:1.45;")}>
                      {raya(vivo).tipo === "vacia"
                        ? `A ${coma(raya(vivo).distancia)}° de la raya entre montañas: línea vacía. Vuelve a medir.`
                        : `A ${coma(raya(vivo).distancia)}° de la raya entre montañas: algunas escuelas usarían otra carta.`}
                    </span>
                  )}
                  <div style={css("display:flex;flex-wrap:wrap;gap:6px;align-items:center;")}>
                    {[-5, -0.5, 0.5, 5].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setVivo((v) => Math.round(norm(v + d) * 10) / 10)}
                        style={css("border:1px solid var(--bloque-borde);background:var(--bloque-2);color:var(--sobre-bloque);border-radius:var(--r-pill);padding:7px 12px;font-size:var(--t-mini);font-weight:600;cursor:pointer;")}
                      >
                        {d > 0 ? "+" : "−"}
                        {coma(Math.abs(d), d % 1 ? 1 : 0)}°
                      </button>
                    ))}
                    <input
                      aria-label="Grados exactos"
                      inputMode="decimal"
                      value={coma(vivo)}
                      onChange={(ev) => {
                        const n = Number(ev.target.value.replace(",", "."));
                        if (Number.isFinite(n)) setVivo(norm(n));
                      }}
                      style={css("width:86px;padding:7px 10px;border-radius:var(--r-pill);border:1px solid var(--bloque-borde);background:var(--bloque-2);color:var(--sobre-bloque);font-size:var(--t-mini);text-align:center;")}
                    />
                  </div>
                  <div style={css("display:flex;flex-wrap:wrap;gap:8px;")}>
                    <button
                      type="button"
                      onClick={() => {
                        cambia({ fachada: Math.round(vivo * 10) / 10 });
                        setAviso(null);
                      }}
                      style={css("border:none;border-radius:var(--r-pill);padding:11px 20px;background:var(--sobre-bloque);color:var(--bloque);font-weight:650;font-size:var(--t-body);cursor:pointer;")}
                    >
                      Usar como fachada
                    </button>
                    <button
                      type="button"
                      onClick={brujula.estado === "encendida" ? brujula.apagar : brujula.encender}
                      style={css("border:1px solid var(--bloque-borde);border-radius:var(--r-pill);padding:11px 18px;background:transparent;color:var(--sobre-bloque);font-weight:590;font-size:var(--t-body);cursor:pointer;")}
                    >
                      {brujula.estado === "encendida" ? "Parar la brújula" : "Usar la brújula del móvil"}
                    </button>
                  </div>
                  {(brujula.estado === "sin-brujula" || brujula.estado === "denegada") && (
                    <span style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);line-height:1.5;")}>
                      {brujula.estado === "denegada"
                        ? "El móvil no ha dado permiso para leer la brújula. Puedes darlo en los ajustes del navegador, o girar el plato a mano."
                        : "Este aparato no tiene brújula o el navegador no deja leerla. Gira el plato o escribe los grados de tu luopan."}
                    </span>
                  )}
                  {e.fachada !== null && <span style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>Fachada guardada: {coma(e.fachada)}°{delPlano !== null ? ` · según el plano: ${coma(delPlano)}°` : ""}</span>}
                </section>

                <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
                  <h2 style={css(TITULO + "margin:0;")}>Lecturas</h2>
                  <p style={css(NOTA + "margin:0;line-height:1.5;")}>Tres o más, en sitios distintos. Si se separan más de 5°, algo de metal cerca está desviando la aguja.</p>
                  <div style={css("display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;")}>
                    <Campo label="Dónde" ancho="1 1 180px">
                      <select value={donde} onChange={(ev) => setDonde(ev.target.value)} style={css(CAMPO)}>
                        {DONDE.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </Campo>
                    <button type="button" onClick={() => cambia({ lecturas: [...e.lecturas, lecturaNueva(Math.round(vivo * 10) / 10, donde)] })} style={css(BOTON_NORMAL)}>
                      Guardar {coma(vivo)}°
                    </button>
                  </div>
                  {e.lecturas.map((l) => (
                    <div key={l.id} style={css("display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-top:1px solid var(--border);")}>
                      <span style={css(APOYO)}>
                        <strong style={css("color:var(--text);font-variant-numeric:tabular-nums;")}>{coma(l.grados)}°</strong> · {l.donde}
                      </span>
                      <button type="button" onClick={() => cambia({ lecturas: e.lecturas.filter((x) => x.id !== l.id) })} style={css(BOTON_PLANO + "padding:5px 10px;")}>
                        Quitar
                      </button>
                    </div>
                  ))}
                  {e.lecturas.length > 1 && mediaLecturas(e) !== null && (
                    <div style={css("display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding-top:var(--s2);border-top:1px solid var(--border);")}>
                      <span style={css(APOYO)}>
                        Media <strong style={css("color:var(--text);")}>{coma(mediaLecturas(e)!)}°</strong>
                        {dispersion(e.lecturas.map((l) => l.grados)) > 5 ? <span style={css("color:var(--red);")}> · separadas más de 5°: repite</span> : " · lecturas coherentes"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const m = Math.round(mediaLecturas(e)! * 10) / 10;
                          setVivo(m);
                          cambia({ fachada: m });
                        }}
                        style={css(botonPrincipal())}
                      >
                        Usar la media
                      </button>
                    </div>
                  )}
                </section>

                {elegirPersona && <section style={css(TARJETA + "padding:var(--pad-card-sm);")}>{elegirPersona}</section>}

                <details style={css(CRISTAL + "padding:var(--pad-card-sm);")}>
                  <summary style={css("cursor:pointer;font-weight:650;color:var(--text);")}>Cómo medir bien</summary>
                  <ol style={css("margin:var(--s3) 0 0;padding-left:20px;display:flex;flex-direction:column;gap:6px;" + APOYO)}>
                    <li>Decide primero cuál es la fachada: la cara principal, hacia la calle o hacia lo más abierto. En un piso, anota si mides la fachada del piso o la del edificio.</li>
                    <li>Ponte en la puerta o en el centro de esa fachada, de espaldas a la casa, mirando hacia fuera.</li>
                    <li>Sujeta el luopan o el móvil plano, con el borde paralelo a la pared.</li>
                    <li>Apártate uno o dos metros de coches, verjas, farolas y cuadros eléctricos. Quítate llaves y reloj.</li>
                    <li>Toma tres lecturas en sitios distintos y usa la media. Si se separan más de 5°, repite.</li>
                    <li>Se mide contra el norte magnético, sin corregir. Si tienes un luopan de verdad, manda el luopan: la brújula del móvil puede desviarse unos grados.</li>
                  </ol>
                </details>
              </div>
            </div>
          )}

          {/* ================================================ 3 · PLANO */}
          {parteFs === "plano" && (
            <div style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
              {falta}
              <section style={css(CRISTAL + "padding:var(--pad-card-sm);display:flex;flex-wrap:wrap;gap:var(--s4);align-items:flex-end;")}>
                <input
                  ref={archivo}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (ev) => {
                    const a = ev.target.files?.[0];
                    ev.target.value = "";
                    if (!a) return;
                    try {
                      const datos = await achicaImagen(a);
                      if (!guardaPlano(e.id, datos)) {
                        setAviso("El plano no cabe en este navegador. Prueba con una imagen más pequeña o borra algún estudio antiguo.");
                        return;
                      }
                      setPlano(datos);
                      setAviso(null);
                      if (!(await ajustaParedes(datos))) setAviso("No he encontrado las paredes de fuera en este plano. Arrastra los dos puntos granates hasta las esquinas de la vivienda.");
                    } catch (err) {
                      setAviso(err instanceof Error ? err.message : "No se ha podido cargar el plano.");
                    }
                  }}
                />
                <button type="button" onClick={() => archivo.current?.click()} style={css(botonPrincipal())}>
                  {plano ? "Cambiar el plano" : "Subir el plano"}
                </button>
                {plano && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!(await ajustaParedes(plano))) setAviso("No he encontrado las paredes de fuera en este plano. Ajusta las esquinas a mano.");
                    }}
                    style={css(BOTON_NORMAL)}
                  >
                    Ajustar a las paredes
                  </button>
                )}
                {plano && (
                  <button
                    type="button"
                    onClick={() => {
                      guardaPlano(e.id, null);
                      setPlano(null);
                    }}
                    style={css(BOTON_PLANO)}
                  >
                    Quitar
                  </button>
                )}
                <Campo label="La fachada está en el plano">
                  <Opciones<Lado>
                    etiqueta="Lado de la fachada en el plano"
                    valor={e.lado}
                    opciones={[
                      ["abajo", "Abajo"],
                      ["arriba", "Arriba"],
                      ["izquierda", "Izquierda"],
                      ["derecha", "Derecha"],
                    ]}
                    alCambiar={ponLado}
                  />
                </Campo>
                <Campo label="El norte del plano apunta">
                  <Opciones
                    etiqueta="Hacia dónde apunta el norte en el plano"
                    valor={e.nortePlano === null ? "no" : [0, 90, 180, 270].includes(e.nortePlano) ? String(e.nortePlano) : "otro"}
                    opciones={[
                      ["0", "Arriba"],
                      ["90", "Derecha"],
                      ["180", "Abajo"],
                      ["270", "Izquierda"],
                      ...(e.nortePlano !== null && ![0, 90, 180, 270].includes(e.nortePlano) ? ([["otro", `${coma(e.nortePlano)}°`]] as Array<[string, string]>) : []),
                      ["no", "Sin flecha"],
                    ]}
                    alCambiar={(v) => {
                      if (v === "otro") return;
                      ponNorte(v === "no" ? null : Number(v));
                    }}
                  />
                </Campo>
                <Campo label="Estrellas del año">
                  <Opciones
                    etiqueta="Estrellas del año"
                    valor={verAnio}
                    opciones={[
                      ["actual", String(anios[0].anio)],
                      ["siguiente", String(anios[1].anio)],
                      ["no", "Ocultar"],
                    ]}
                    alCambiar={setVerAnio}
                  />
                </Campo>
                <Campo label="Luopan">
                  <Opciones
                    etiqueta="Luopan sobre el plano"
                    valor={conLuopan ? "si" : "no"}
                    opciones={[
                      ["si", "Encima"],
                      ["no", "Quitar"],
                    ]}
                    alCambiar={(v) => setConLuopan(v === "si")}
                  />
                </Campo>
                {elegirPersona}
              </section>

              <div style={css("display:flex;flex-wrap:wrap;gap:var(--gap);align-items:flex-start;")}>
                <div style={css("flex:2 1 520px;min-width:0;")}>
                  <Plano
                    imagen={plano}
                    rejilla={e.rejilla}
                    alCambiarRejilla={(r) => cambia({ rejilla: r })}
                    fachada={e.fachada ?? vivo}
                    lado={e.lado}
                    carta={carta}
                    anual={anioVisto?.carta ?? null}
                    marcas={anioVisto ? { taiSui: anioVisto.taiSui.dir, suiPo: anioVisto.suiPo.dir, sanSha: anioVisto.sanSha, anio: anioVisto.anio } : null}
                    mansiones={mansiones}
                    conLuopan={conLuopan}
                    seleccion={zona}
                    alElegir={carta ? setZona : undefined}
                    estancias={e.estancias}
                    norte={e.nortePlano}
                    alCambiarNorte={ponNorte}
                  />
                  <p style={css(NOTA + "margin:var(--s3) 0 0;line-height:1.5;")}>
                    Las nueve zonas se colocan solas sobre las paredes de fuera; si no encajan, arrastra los dos puntos granates. Gira la flecha del norte de arriba a la derecha hasta que apunte como la del plano. Pulsa una zona para marcar qué hay en ella.
                  </p>
                </div>
                <div style={css("flex:1 1 300px;display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
                  {zona && carta ? (
                    detalleZona(zona)
                  ) : (
                    <div style={css(CRISTAL + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
                      <div style={css(BLOQUE + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:6px;border-radius:var(--r-lg);")}>
                        <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--sobre-bloque-2);")}>
                          {delPlano !== null ? "Orientación sacada del plano" : "Orientación"}
                        </span>
                        {delPlano !== null ? (
                          <>
                            <span style={css("font-size:var(--t-hero);font-weight:600;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums;")}>{coma(delPlano)}°</span>
                            <span style={css("font-size:var(--t-body);")}>
                              {montanaDe(delPlano).codigo} · {montanaDe(delPlano).pinyin} {montanaDe(delPlano).hanzi} · la fachada mira al {NOMBRE_DIR[dirDe(delPlano)]}
                            </span>
                            {!manda && e.fachada !== null && (
                              <span style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);line-height:1.5;")}>
                                Manda la medida del luopan: {coma(e.fachada)}°.
                                {Math.min(Math.abs(norm(delPlano - e.fachada)), 360 - Math.abs(norm(delPlano - e.fachada))) > 10
                                  ? " El plano y el luopan se separan más de 10°: revisa la flecha del plano o vuelve a medir."
                                  : " Coincide con el plano."}
                              </span>
                            )}
                          </>
                        ) : (
                          <span style={css("font-size:var(--t-body);line-height:1.5;")}>Gira la flecha del norte del plano, o mide en la visita con el luopan.</span>
                        )}
                      </div>
                      <span style={css(TITULO)}>Cómo se lee</span>
                      <p style={css(APOYO + "margin:0;")}>
                        En cada zona, arriba a la izquierda la estrella de la <strong>montaña</strong> (las personas) y a la derecha la del <strong>agua</strong> (el dinero). En pequeño, la del periodo. El círculo es la estrella del año.
                      </p>
                      <p style={css(APOYO + "margin:0;")}>
                        <span style={css("color:var(--green);font-weight:650;")}>Verde</span> favorable · <span style={css("color:var(--red);font-weight:650;")}>rojo</span> pide cuidado · <span style={css("color:#b8860b;font-weight:650;")}>5</span> la más difícil.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================ 4 · ESTRELLAS */}
          {parteFs === "estrellas" && (
            <div style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
              {falta}
              {carta && e.fachada !== null && (
                <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:var(--gap);align-items:start;")}>
                  <section style={css(CRISTAL + "padding:clamp(12px,2vw,22px);display:flex;flex-direction:column;gap:var(--s3);")}>
                    <div style={css("display:flex;justify-content:space-between;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
                      <span style={css(TITULO)}>La carta de la vivienda</span>
                      <Opciones
                        etiqueta="Estrellas del año"
                        valor={verAnio}
                        opciones={[
                          ["actual", String(anios[0].anio)],
                          ["siguiente", String(anios[1].anio)],
                          ["no", "Sin año"],
                        ]}
                        alCambiar={setVerAnio}
                      />
                    </div>
                    <div style={css("aspect-ratio:1;width:100%;")}>
                      <Cuadricula
                        carta={carta}
                        fachada={e.fachada}
                        lado={e.lado}
                        anual={anioVisto?.carta ?? null}
                        marcas={anioVisto ? { taiSui: anioVisto.taiSui.dir, suiPo: anioVisto.suiPo.dir, sanSha: anioVisto.sanSha, anio: anioVisto.anio } : null}
                        mansiones={mansiones}
                        seleccion={zona}
                        alElegir={setZona}
                      />
                    </div>
                    <span style={css(NOTA)}>Orientada como el plano: la fachada, {e.lado}.</span>
                  </section>

                  <div style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
                    {zona ? (
                      detalleZona(zona)
                    ) : (
                      <section style={css(BLOQUE + "padding:var(--pad-card);display:flex;flex-direction:column;gap:var(--s3);")}>
                        <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--sobre-bloque-2);")}>
                          Periodo {carta.periodo} · fachada {carta.fachada.codigo} {carta.fachada.pinyin}
                        </span>
                        <span style={css("font-size:var(--t-head);font-weight:620;letter-spacing:-.02em;line-height:1.15;")}>{FORMACION[carta.formacion].nombre}</span>
                        <span style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>{FORMACION[carta.formacion].chino}</span>
                        <p style={css("margin:0;font-size:var(--t-read);line-height:1.55;")}>{FORMACION[carta.formacion].dice}</p>
                        {carta.especiales.map((k) => (
                          <p key={k} style={css("margin:0;font-size:var(--t-body);color:var(--sobre-bloque-2);")}>
                            {ESPECIAL[k]}
                          </p>
                        ))}
                        {encerrada(carta, 9) && (
                          <p style={css("margin:0;font-size:var(--t-body);")}>
                            Estrella 9 {encerrada(carta, 9) === "agua" ? "del agua" : "de la montaña"} encerrada en el centro: conviene abrirlo y darle vida.
                          </p>
                        )}
                        <span style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>Pulsa una zona de la carta para ver su lectura.</span>
                      </section>
                    )}

                    <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
                      <span style={css(TITULO)}>Lo que no se toca</span>
                      {anios.map((a) => (
                        <div key={a.anio} style={css("display:flex;flex-direction:column;gap:4px;padding-top:var(--s2);border-top:1px solid var(--border);")}>
                          <span style={css("font-weight:650;color:var(--text);")}>
                            {a.anio} · {a.nombre}
                          </span>
                          <span style={css(APOYO)}>
                            5 en el {NOMBRE_DIR[a.cincoAmarillo]} · 2 en el {NOMBRE_DIR[a.dosNegro]} · Tai Sui {a.taiSui.codigo} {a.taiSui.pinyin} · Sui Po {a.suiPo.codigo} · Tres Asesinos en el {NOMBRE_DIR[a.sanSha]}
                          </span>
                        </div>
                      ))}
                    </section>

                    {casaKua && (
                      <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s2);")}>
                        <span style={css(TITULO)}>La casa en las ocho mansiones</span>
                        <span style={css(APOYO)}>
                          Se sienta al {NOMBRE_DIR[dirDe(e.fachada + 180)]}: es una casa del grupo {grupoDe(casaKua) === "este" ? "Este" : "Oeste"}.
                          {e.ocupantes.length > 0 &&
                            " " +
                              e.ocupantes
                                .map((o) => ({ o, k: kuaDe(o) }))
                                .filter((x) => x.k)
                                .map((x) => `${x.o.nombre || "Sin nombre"} (Kua ${x.k!.kua}) ${x.k!.grupo === grupoDe(casaKua) ? "encaja" : "es del otro grupo"}`)
                                .join("; ") +
                              "."}
                        </span>
                      </section>
                    )}

                    {e.ocupantes.map((o) => {
                      const k = kuaDe(o);
                      if (!k) return null;
                      const t = BA_ZHAI[k.kua];
                      return (
                        <section key={o.id} style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s2);")}>
                          <span style={css(TITULO)}>
                            {o.nombre || "Sin nombre"} · Kua {k.kua}
                          </span>
                          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;")}>
                            {MANSIONES.map((m) => (
                              <span
                                key={m}
                                style={css(
                                  "padding:7px 10px;border-radius:var(--r-sm);font-size:var(--t-mini);display:flex;justify-content:space-between;gap:6px;" +
                                    (MANSION_BUENA[m] ? "background:color-mix(in srgb, var(--green) 10%, transparent);" : "background:color-mix(in srgb, var(--red) 7%, transparent);")
                                )}
                              >
                                <span style={css("color:var(--text-2);")}>{MANSION[m].nombre}</span>
                                <strong style={css(MANSION_BUENA[m] ? "color:var(--green);" : "color:var(--red);")}>{t[m]}</strong>
                              </span>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================== 5 · INFORME */}
          {parteFs === "informe" && (
            <div style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
              <section data-chrome="1" style={css(CRISTAL + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
                <div style={css("display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:var(--s3);")}>
                  <div style={css("display:flex;flex-direction:column;gap:4px;")}>
                    <span style={css(TITULO)}>El informe para {e.cliente || "la clienta"}</span>
                    <span style={css(NOTA)}>Se guarda como PDF desde la ventana de imprimir: elige «Guardar como PDF».</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!imprimir()) setAviso("El navegador no ha dejado abrir la ventana de imprimir. Prueba desde Chrome o Safari, o con Ctrl + P.");
                    }}
                    style={css(botonPrincipal())}
                  >
                    Descargar PDF
                  </button>
                </div>
                <Campo label="Nota final para la clienta · va en la última página">
                  <textarea
                    value={e.notaGeneral}
                    onChange={(ev) => cambia({ notaGeneral: ev.target.value })}
                    rows={4}
                    placeholder="Lo más importante de la visita, en tres o cuatro frases."
                    style={css(CAMPO + "resize:vertical;line-height:1.5;")}
                  />
                </Campo>
                {!carta && <span style={css(NOTA + "color:var(--red);")}>Sin la fachada y el año de obra, el informe sale sin carta ni zonas.</span>}
              </section>
              <Informe e={e} carta={carta} plano={plano} hoy={hoy} anioActual={anioActual} />
            </div>
          )}
        </>
      )}
      <p data-chrome="1" style={css(NOTA + "margin:0;")}>
        Los estudios de Feng Shui se guardan en este navegador. Si cambias de ordenador, no estarán allí.
      </p>
    </div>
  );
}
