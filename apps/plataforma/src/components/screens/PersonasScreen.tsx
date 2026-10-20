"use client";

/**
 * ============================================================================
 * PERSONAS — UNA SOLA LISTA
 * ============================================================================
 *
 * Aquí había DOS pantallas, «Leads» y «Clientes», y Gerson las juntó:
 * «los clientes, los leads, es irrelevante, no sé cuál es la diferencia,
 * entonces que sea solamente una sola persona».
 *
 * La diferencia era de la base de datos, no de la vida: los leads los escribe
 * el servidor de la web cuando alguien rellena un formulario, y las fichas las
 * escribe Iris. Dos colecciones porque las llena gente distinta. Pero Marta
 * que pidió la prueba gratis en marzo y Marta que vino a tres sesiones en
 * junio es la misma Marta, y tenerla en dos pantallas obliga a buscarla dos
 * veces y a acordarse de en cuál estaba lo que se buscaba.
 *
 * Cómo se juntan —por el correo, en minúsculas— está en `lib/despacho/personas.ts`.
 * Aquí sólo se pinta.
 *
 * LO QUE SE PIERDE DEL TABLERO DE LEADS, dicho sin disimulo: las cuatro
 * columnas de arrastrar. Contestaban «¿qué forma tiene el embudo?» de un
 * vistazo, y eso era bueno. Pero costaban una pantalla entera y una segunda
 * forma de buscar a alguien, y la pregunta que se hace cien veces al día no es
 * ésa — es «¿quién es esta persona que me está llamando?». El estado sigue
 * estando: se lee en la pastilla de cada fila y se cambia en la ficha, con
 * botones, que además es lo único que funcionaba con el teclado y en el móvil.
 *
 * Y LA FORMA DEL EMBUDO TAMPOCO SE PIERDE: el renglón de arriba la cuenta.
 * Cuántas nuevas, cuántas habladas, cuántas clientas. Tres números en una
 * línea dicen lo mismo que cuatro columnas y caben en la pantalla donde se
 * trabaja.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { NOTA, PAD, RAYA, TARJETA, botonPrincipal, rotulo } from "@/lib/ui";
import { titulo as enTitulo } from "@/lib/format";
import {
  citas as repoCitas,
  clientes as repoClientes,
  facturas as repoFacturas,
  comoVaCorto,
  diaLargo,
  diaMinimo,
  diasEntre,
  loQueCuelga,
  nuevoId,
  relacionDe,
  type Cita,
  type Cliente,
  type Factura,
  type Relacion,
} from "@/lib/despacho";
import { borraLead, ultimosLeads, type Lead } from "@/lib/despacho/leads";
import { fuenteDe } from "@/lib/despacho/fuentes";
import Banda from "../Banda";
import Confirmar from "../Confirmar";
import { FORMULARIOS, juntaPersonas, puntoDe, NOMBRE_PUNTO, TONO_PUNTO, type Persona, type Punto } from "@/lib/despacho/personas";
import { AvisoNavegador, Avatar, Vacio, useEstrecho } from "../despacho/Piezas";
import HojaLateral from "../despacho/HojaLateral";
import FichaCliente from "../despacho/FichaCliente";
import FichaLead from "../despacho/FichaLead";

/** Cómo se llama en pantalla de dónde salió cada persona. */
const ORIGENES: Record<string, string> = {
  "web-sinergia": "Llegó por el estudio Sinergia",
  "web-membresia": "Llegó por la lista de espera",
  "web-curso": "Llegó por un curso",
  "web-cita": "Pidió cita por la web",
  "web-chat": "Llegó por el chat de la web",
  plataforma: "Añadida desde la plataforma",
  "a-mano": "Apuntada a mano",
};

/** Cuántas caras caben arriba antes de que la tira deje de leerse de un
 *  vistazo. Las que no caben se dicen con un número, no se esconden. */
const CARAS_A_LA_VISTA = 12;

/** Las columnas del embudo, en el orden en que se avanza. */
const COLUMNAS: Punto[] = ["nueva", "escrita", "clienta", "fuera"];
const NOMBRE_COLUMNA: Record<Punto, string> = {
  nueva: "Sin contestar",
  escrita: "Habladas",
  clienta: "Clientas",
  fuera: "Descartadas",
};
/** Cuántas tarjetas caben en una columna antes de mandar a la lista. */
const POR_COLUMNA = 8;

/** Una persona con lo que se ha podido calcular de ella. */
type Fila = { p: Persona; r: Relacion | null; punto: Punto };

export default function PersonasScreen() {
  const { clienteAbierto, setClienteAbierto } = useApp();

  const [fichas, setFichas] = useState<Cliente[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [todasCitas, setTodasCitas] = useState<Cita[]>([]);
  const [todasFacturas, setTodasFacturas] = useState<Factura[]>([]);
  const [busca, setBusca] = useState("");
  /* EMBUDO O LISTA. El embudo es lo que pidió Gerson mirando su referencia
     de CRM: ver de un golpe quién está en qué punto. La lista se queda, para
     buscar a alguien por su nombre mientras se habla por teléfono. */
  const [modo, setModo] = useState<"embudo" | "lista">("embudo");
  const [cargando, setCargando] = useState(true);
  // Sube de número después de cada escritura y obliga a releer. Es la forma
  // barata de que la lista y la ficha no se queden con lo de antes.
  const [refresco, setRefresco] = useState(0);

  const estrecho = useEstrecho(900);
  const quieto = useReducedMotion();

  /*
   * SE LEE TODO Y SE BUSCA EN MEMORIA, y es un cambio respecto a antes.
   *
   * La lista de clientes pedía a Firestore sólo los que casaban con lo escrito,
   * que es lo correcto para una colección que puede crecer. Pero ahora la lista
   * junta DOS colecciones por el correo, y eso no se puede pedir a la base de
   * datos: Firestore no sabe cruzar dos colecciones, así que buscar «Marta» en
   * cada una por separado dejaría fuera a la Marta cuya ficha se llama «Marta
   * Ruiz» y cuyo lead sólo trae el correo.
   *
   * Con los volúmenes de una consulta de una persona —cientos, no cientos de
   * miles— traerlo entero y filtrar aquí es instantáneo. El día que esto sea
   * grande, lo que hace falta es un índice de búsqueda de verdad, no volver a
   * partir la pantalla en dos.
   */
  useEffect(() => {
    let vivo = true;
    Promise.all([
      repoClientes.buscar(""),
      /* Sin nube no hay leads, y eso no es un error: un lead sólo puede nacer
         de un formulario real de la web. La lista se queda con las fichas. */
      ultimosLeads().catch(() => [] as Lead[]),
      repoCitas.listar(),
      repoFacturas.listar(),
    ]).then(([c, l, ci, fa]) => {
      if (!vivo) return;
      setFichas(c);
      setLeads(l);
      setTodasCitas(ci);
      setTodasFacturas(fa);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [refresco]);

  const recargar = useCallback(() => setRefresco((n) => n + 1), []);

  /** Todas, juntas y con su cuenta hecha. El orden es alfabético y no se toca:
   *  una lista que se reordena sola obliga a volver a buscar con los ojos cada
   *  vez que se guarda algo, y esta pantalla existe para encontrar a alguien
   *  cuyo nombre ya se sabe. */
  const todas = useMemo<Fila[]>(() => {
    const ahora = new Date();
    return juntaPersonas(fichas, leads).map((p) => {
      const r = p.cliente ? relacionDe(p.cliente, todasCitas, todasFacturas, ahora) : null;
      return { p, r, punto: puntoDe(p, r?.sesiones ?? 0) };
    });
  }, [fichas, leads, todasCitas, todasFacturas]);

  /** Lo escrito busca en el nombre Y en el correo: media lista son personas de
   *  las que sólo se sabe el correo, y buscarlas por un nombre que no tienen
   *  no las encontraría nunca. */
  const gente = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return todas;
    return todas.filter((g) => `${g.p.nombre} ${g.p.email}`.toLowerCase().includes(q));
  }, [todas, busca]);

  /** La forma del embudo, que es lo que contestaban las cuatro columnas. */
  const cuenta = useMemo(() => {
    const c: Record<Punto, number> = { nueva: 0, escrita: 0, clienta: 0, fuera: 0 };
    for (const g of todas) c[g.punto]++;
    return c;
  }, [todas]);

  /**
   * LA TIRA DE CARAS DE ARRIBA: a quién ves esta semana.
   *
   * Es la única fila de la pantalla ordenada por hora y no por nombre, a
   * propósito: contesta «¿quién viene y en qué orden?», que es la pregunta con
   * la que se abre el lunes por la mañana. Los siete días se cuentan desde hoy,
   * no de lunes a domingo: el jueves lo que importa no es lo que queda de esta
   * semana, es lo que viene por delante.
   */
  const estaSemana = useMemo(() => {
    const ahora = new Date();
    return todas
      .filter((g) => g.r?.proxima && diasEntre(ahora, new Date(g.r.proxima.inicioISO)) <= 7)
      .sort((a, b) => (a.r?.proxima?.inicioISO ?? "").localeCompare(b.r?.proxima?.inicioISO ?? ""));
  }, [todas]);

  /* -------------------------------------------------------- la ficha abierta */

  const abierta = useMemo(() => gente.find((g) => g.p.llave === clienteAbierto) ?? null, [gente, clienteAbierto]);

  /** Borra a una persona entera: su ficha, si la tiene, y lo que dejó en la web. */
  const borraPersona = async (p: Persona) => {
    try {
      await Promise.all(p.leads.map((l) => borraLead(l.id)));
      if (p.cliente) await repoClientes.borrar(p.cliente.id);
    } finally {
      if (clienteAbierto === p.llave) setClienteAbierto(null);
      recargar();
    }
  };

  /* Qué la llevó a la web —un anuncio, Instagram, Google—, de más a menos.
     Quien no trae ningún lead la apuntó Iris a mano: también cuenta. */
  const llegadas = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of todas) {
      const l = g.p.leads[0];
      const que = l ? fuenteDe(l) : "Apuntada a mano";
      m.set(que, (m.get(que) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [todas]);

  const nueva = async () => {
    const c = await repoClientes.guardar({
      id: nuevoId(),
      nombre: "Sin nombre",
      email: "",
      origen: "plataforma",
      etiquetas: [],
      // Nadie ha aceptado nada todavía: no se inventa un consentimiento para
      // que el tipo cuadre. Ver `lib/despacho/tipos.ts`.
      consentimiento: null,
      notas: [],
      creada: new Date().toISOString(),
      actualizada: new Date().toISOString(),
    });
    setClienteAbierto(c.id);
    recargar();
  };

  /**
   * HACERLE FICHA A QUIEN SÓLO ERA UN CORREO.
   *
   * Es el único momento en que las dos colecciones se tocan, y se tocan en una
   * dirección sola: el lead se queda como está —es el registro de que alguien
   * rellenó un formulario y eso no se reescribe— y nace una ficha con lo que
   * se sabe de él.
   *
   * NO SE HACE SOLO al entrar un lead, y es a propósito: la mayoría de los
   * correos que entran por un formulario no llegan a ser nadie, y crear una
   * ficha por cada uno convierte la lista de clientas en una lista de correos.
   * Que lo decida Iris con un clic el día que esa persona sea alguien.
   */
  const haceFicha = async (p: Persona) => {
    const l = p.leads[0];
    const c = await repoClientes.guardar({
      id: nuevoId(),
      nombre: p.nombre === p.email ? "" : p.nombre,
      email: p.email,
      /* De dónde salió, dicho con el nombre que usa la ficha. El lead guarda
         `sinergia`; aquí se escribe `web-sinergia`, que es lo que entiende la
         tabla de orígenes de arriba y lo que ya escribía la web. */
      origen: l ? `web-${l.origen}` : "plataforma",
      etiquetas: [],
      consentimiento: null,
      notas: [],
      creada: new Date().toISOString(),
      actualizada: new Date().toISOString(),
      ...(l?.whatsapp ? { telefono: l.whatsapp } : {}),
    } as Cliente);
    /*
     * SE DEJA ABIERTA LA PERSONA, NO LA FICHA.
     *
     * Aquí ponía `setClienteAbierto(c.id)`, que es lo que hacía la pantalla de
     * clientes, y aquí está mal: las filas de esta lista se llaman por el
     * CORREO —es lo que junta el lead con la ficha— y el identificador de la
     * ficha recién creada no es ninguno de ellos. El resultado era que al
     * pulsar «Hacerle ficha» la hoja se quedaba en blanco: la ficha se había
     * creado bien, pero la pantalla buscaba a alguien con ese nombre y no lo
     * encontraba.
     *
     * Con la llave de la persona, al recargar sale la misma hoja con la ficha
     * nueva dentro, que es lo que se acaba de pedir.
     */
    setClienteAbierto(p.llave || c.id);
    recargar();
  };

  const entrada = "width:100%;min-width:0;padding:11px 14px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

  /* ---------------------------------------------------------------- la fila */

  const fila = (g: Fila, i: number) => {
    const cuelga = g.r ? loQueCuelga(g.r) : "";
    const elegida = g.p.llave === clienteAbierto;
    const tono = TONO_PUNTO[g.punto];
    /* Qué se dice debajo del nombre. Con ficha, cómo va la relación —que es lo
       que importa de alguien que ya viene—. Sin ella, QUÉ PIDIÓ y cuándo.
       
       Aquí ponía el correo, y en media lista el correo es también el nombre de
       arriba: la fila decía dos veces lo mismo y no decía lo único que se sabe
       de esa persona, que es qué vino a buscar. */
    const l = g.p.leads[0];
    const debajo = g.r
      ? comoVaCorto(g.r)
      : l
        ? `${FORMULARIOS[l.origen] ?? "Dejó su correo"}${l.visto ? ` · ${diaMinimo(l.visto)}` : ""}`
        : g.p.email;
    return (
      <motion.button
        key={g.p.llave}
        initial={quieto ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, delay: Math.min(i, 7) * 0.03, ease: [0.16, 1, 0.3, 1] }}
        whileTap={quieto ? undefined : { scale: 0.995 }}
        onClick={() => setClienteAbierto(g.p.llave)}
        aria-current={elegida ? "true" : undefined}
        style={css(
          "display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;border:none;" +
            (i === 0 ? "" : "border-top:1px solid var(--border);") +
            "margin-inline:calc(var(--pad-card) * -1);padding:12px var(--pad-card);" +
            "outline-offset:-2px;" +
            (elegida ? "background:var(--accion-suave);" : "background:transparent;") +
            "transition:background var(--t-normal) var(--curva);"
        )}
      >
        <Avatar nombre={g.p.nombre} tamano={34} />
        <span style={css("min-width:0;flex:1;")}>
          <span style={css("display:block;font-size:var(--t-body);font-weight:590;line-height:1.3;color:var(--text);overflow-wrap:anywhere;")}>
            {enTitulo(g.p.nombre)}
          </span>
          <span style={css("display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;margin-top:3px;")}>
            <span style={css(NOTA + "line-height:1.4;overflow-wrap:anywhere;")}>{debajo}</span>
            {/* Lo único rojo de la lista, y por eso se ve entre doscientas filas
                sin necesitar una columna para ella sola. */}
            {cuelga && (
              <span
                style={css(
                  "font-size:var(--t-micro);font-weight:590;line-height:1.4;color:var(--red);" +
                    "border:1px solid var(--red-border);background:var(--red-soft);border-radius:var(--r-pill);padding:2px 9px;white-space:nowrap;"
                )}
              >
                {cuelga}
              </span>
            )}
          </span>
        </span>
        {/* En qué punto está. A la derecha y pequeña: es lo que se barre con la
            vista cuando se quiere ver el embudo, y lo que se ignora cuando se
            está buscando a una persona por su nombre. «Descartada» va sin
            color: marcar en color a quien ya no está es gastar la única
            herramienta que tiene la lista para señalar. */}
        <span
          style={css(
            "flex:none;font-size:var(--t-micro);font-weight:590;line-height:1.4;padding:2px 9px;border-radius:var(--r-pill);white-space:nowrap;" +
              (tono
                ? `background:var(--${tono});color:var(--${tono}-tx);`
                : "color:var(--text-4);border:1px solid var(--border);")
          )}
        >
          {NOMBRE_PUNTO[g.punto]}
        </span>
      </motion.button>
    );
  };

  /* ---------------------------------------------------------------- pintado */

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);min-width:0;")}>
      <Banda
        foto="/escuela/banda-personas.jpg"
        titulo="Personas"
        sub="Quién te ha escrito, con quién has hablado y quién ya es clienta."
        cifras={
          cargando
            ? []
            : [
                { n: todas.length, que: "Personas" },
                { n: cuenta.nueva, que: "Sin contestar" },
                { n: cuenta.clienta, que: "Clientas" },
              ]
        }
      />

      {/* ================================================== buscar y las caras */}
      <section style={css(TARJETA + PAD + "margin-bottom:var(--gap-lg);min-width:0;")}>
        <div style={css("display:flex;flex-wrap:wrap;gap:var(--s3);align-items:center;")}>
          {/* El buscador va lo primero: buscar a alguien mientras se habla por
              teléfono es lo más urgente que pasa en esta pantalla. */}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar por nombre o correo"
            style={css(entrada + "flex:1 1 240px;")}
          />
          <button onClick={() => void nueva()} style={css(botonPrincipal() + (estrecho ? "flex:1 1 100%;" : ""))}>
            Añadir una persona
          </button>
        </div>

        <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>
          <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>A quién ves esta semana</div>
          {cargando ? (
            <Vacio>Un momento…</Vacio>
          ) : estaSemana.length === 0 ? (
            <Vacio>Nada apuntado esta semana.</Vacio>
          ) : (
            <div
              data-tira=""
              style={css("display:flex;gap:var(--s4);overflow-x:auto;padding-bottom:4px;scrollbar-width:none;overscroll-behavior-x:contain;")}
            >
              {estaSemana.slice(0, CARAS_A_LA_VISTA).map((g, i) => (
                <motion.button
                  key={g.p.llave}
                  initial={quieto ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={quieto ? undefined : { y: -3 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.035, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setClienteAbierto(g.p.llave)}
                  title={`${g.p.nombre}${g.r ? ` · ${comoVaCorto(g.r)}` : ""}`}
                  style={css(
                    "flex:none;width:74px;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;padding:0;cursor:pointer;font-family:inherit;"
                  )}
                >
                  <Avatar nombre={g.p.nombre} tamano={42} />
                  <span
                    style={css(
                      "font-size:var(--t-micro);line-height:1.25;color:var(--text-2);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;"
                    )}
                  >
                    {g.p.nombre.split(/\s+/)[0]}
                  </span>
                  <span style={css("font-size:var(--t-micro);line-height:1.2;color:var(--text-4);text-align:center;")}>
                    {g.r?.proxima ? diaMinimo(new Date(g.r.proxima.inicioISO)) : ""}
                  </span>
                </motion.button>
              ))}
              {estaSemana.length > CARAS_A_LA_VISTA && (
                <span style={css(NOTA + "flex:none;align-self:center;")}>y {estaSemana.length - CARAS_A_LA_VISTA} más</span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ el embudo */}
      <div role="tablist" aria-label="Cómo ver a las personas" style={css("display:flex;gap:6px;margin-bottom:var(--s4);padding:5px;border-radius:var(--r-pill);background:var(--surface);border:1px solid var(--border);width:max-content;box-shadow:var(--shadow-sm);")}>
        {(["embudo", "lista"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={modo === m}
            onClick={() => setModo(m)}
            style={css(
              "padding:8px 18px;border:none;border-radius:var(--r-pill);cursor:pointer;font:inherit;font-size:var(--t-mini);font-weight:500;" +
                (modo === m ? "background:var(--accion);color:var(--sobre-accion);" : "background:transparent;color:var(--text-2);")
            )}
          >
            {m === "embudo" ? "Embudo" : "Lista"}
          </button>
        ))}
      </div>

      {modo === "embudo" && !cargando && (
        <>
          <div data-embudo="" style={css("margin-bottom:var(--gap-lg);")}>
            {COLUMNAS.map((k) => {
              const aqui = gente.filter((g) => g.punto === k);
              const tono = TONO_PUNTO[k];
              return (
                <section
                  key={k}
                  aria-label={NOMBRE_COLUMNA[k]}
                  style={css(
                    "min-width:0;display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:var(--r-tarjeta);" +
                      "background:color-mix(in srgb, var(--surface) 55%, transparent);border:1px solid var(--border);"
                  )}
                >
                  <div
                    style={css(
                      "display:flex;align-items:center;justify-content:center;gap:8px;padding:9px 12px;border-radius:var(--r-pill);" +
                        "background:var(--surface);border:1px solid var(--border);font-size:var(--t-mini);font-weight:500;color:var(--text);"
                    )}
                  >
                    <span aria-hidden="true" style={css("width:8px;height:8px;border-radius:50%;background:" + (tono ? `var(--${tono}-tx)` : "var(--text-4)") + ";")} />
                    {NOMBRE_COLUMNA[k]}
                    <span style={css("color:var(--text-3);font-weight:400;")}>{aqui.length}</span>
                  </div>
                  {aqui.length === 0 && <p style={css(NOTA + "margin:6px 0;text-align:center;")}>Nadie</p>}
                  {aqui.slice(0, POR_COLUMNA).map((g, i) => {
                    const cuelga = g.r ? loQueCuelga(g.r) : "";
                    const l = g.p.leads[0];
                    const debajo = g.r
                      ? comoVaCorto(g.r)
                      : l
                        ? `${FORMULARIOS[l.origen] ?? "Dejó su correo"}${l.visto ? ` · ${diaMinimo(l.visto)}` : ""}`
                        : g.p.email;
                    return (
                      <motion.div
                        key={g.p.llave}
                        initial={quieto ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.26, delay: Math.min(i, 7) * 0.03, ease: [0.16, 1, 0.3, 1] }}
                        style={css("position:relative;")}
                      >
                      <button
                        onClick={() => setClienteAbierto(g.p.llave)}
                        style={css(
                          "display:flex;align-items:center;gap:10px;width:100%;text-align:left;cursor:pointer;font:inherit;" +
                            "padding:10px 40px 10px 12px;border-radius:var(--r-lg);background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-sm);" +
                            (g.p.llave === clienteAbierto ? "outline:2px solid var(--accion-borde);" : "")
                        )}
                      >
                        <Avatar nombre={g.p.nombre} tamano={34} />
                        <span style={css("min-width:0;flex:1;")}>
                          <span style={css("display:block;font-size:var(--t-body);font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                            {enTitulo(g.p.nombre)}
                          </span>
                          <span style={css("display:block;font-size:var(--t-mini);color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{debajo}</span>
                          {cuelga && <span style={css("display:block;font-size:var(--t-micro);font-weight:500;color:var(--red);margin-top:2px;")}>{cuelga}</span>}
                        </span>
                      </button>
                      {/* BORRAR DESDE LA TARJETA. Gerson: «esos datos quiero la
                          opción de borrarlos». Con pregunta antes, porque no
                          tiene vuelta atrás. */}
                      <span style={css("position:absolute;top:8px;right:8px;")}>
                        <Confirmar
                          estilo={"width:26px;height:26px;border-radius:50%;border:none;background:transparent;color:var(--text-4);cursor:pointer;font-size:14px;line-height:1;"}
                          titulo={`Borrar a ${enTitulo(g.p.nombre)}`}
                          pregunta={
                            g.p.cliente
                              ? "Se borra su ficha, con sus notas, y lo que dejó en la web. Sus facturas se quedan: una factura emitida no se borra nunca."
                              : "Se borra lo que dejó en la web. No tiene vuelta atrás."
                          }
                          confirmar="Borrar"
                          alConfirmar={() => void borraPersona(g.p)}
                        >
                          ✕
                        </Confirmar>
                      </span>
                      </motion.div>
                    );
                  })}
                  {aqui.length > POR_COLUMNA && (
                    <button onClick={() => setModo("lista")} style={css("border:none;background:none;cursor:pointer;font:inherit;" + NOTA)}>
                      y {aqui.length - POR_COLUMNA} más · ver en la lista
                    </button>
                  )}
                </section>
              );
            })}
          </div>

          {/* DE DÓNDE LLEGAN. Lo que dice si la web trabaja: cuántas personas
              entraron por cada formulario. Contado de lo que hay, nada más. */}
          {llegadas.length > 0 && (
            <section style={css(TARJETA + PAD + "margin-bottom:var(--gap-lg);display:flex;flex-direction:column;gap:var(--s3);")}>
              <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>De dónde llegan</h2>
              {llegadas.map(([que, n]) => (
                <div key={que} style={css("display:grid;grid-template-columns:minmax(0,220px) 1fr auto;gap:var(--s3);align-items:center;font-size:var(--t-body);")}>
                  <span style={css("color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{que}</span>
                  <span style={css("height:10px;border-radius:var(--r-pill);background:var(--surface-2);overflow:hidden;")}>
                    <span style={css(`display:block;height:100%;width:${(n / llegadas[0][1]) * 100}%;border-radius:var(--r-pill);background:var(--accion);`)} />
                  </span>
                  <span style={css("font-variant-numeric:tabular-nums;color:var(--text);font-weight:500;")}>{n}</span>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {/* =============================================================== la lista */}
      {modo === "lista" && (
      <section style={css(TARJETA + PAD + "min-width:0;overflow:hidden;")}>
        {cargando ? (
          <Vacio>Un momento…</Vacio>
        ) : gente.length === 0 ? (
          <Vacio>
            {busca
              ? "Aquí no hay nadie con eso. Pruébalo con menos letras, o con el correo."
              : "Todavía no hay nadie. Se llena solo cuando alguien rellena un formulario en la web."}
          </Vacio>
        ) : (
          <div style={css("display:flex;flex-direction:column;margin-block:calc(var(--pad-card) * -1 + 4px);")}>
            {gente.map(fila)}
          </div>
        )}
      </section>
      )}

      <AvisoNavegador que="Las fichas y las notas" />

      {/* =============================================================== la ficha */}
      <HojaLateral
        abierta={Boolean(abierta)}
        cerrar={() => setClienteAbierto(null)}
        titulo={abierta ? enTitulo(abierta.p.nombre) : ""}
        pie={
          abierta?.p.cliente
            ? `${ORIGENES[abierta.p.cliente.origen] || "Apuntada a mano"} · desde el ${diaLargo(new Date(abierta.p.cliente.creada))}`
            : abierta
              ? "Dejó su correo en la web"
              : undefined
        }
      >
        {abierta && (
          <div style={css("display:flex;flex-direction:column;gap:var(--s5);")}>
            {/* LO QUE ENTRÓ POR LA WEB, arriba del todo cuando no hay ficha
                —porque entonces es todo lo que hay— y también cuando la hay,
                porque es el único sitio donde se lee qué pidió exactamente y
                desde dónde llegó. */}
            {abierta.p.leads.length > 0 && (
              <FichaLead persona={abierta.p} alCambiar={recargar} />
            )}

            {abierta.p.cliente ? (
              <FichaCliente
                /* La clave es la persona: al cambiar de ficha se monta otra, y
                   con ella se van el borrador de la nota y el formulario
                   desplegado de la anterior. Sin esto, la nota a medias de Ana
                   aparecería escrita en la ficha de Carmen. */
                key={abierta.p.cliente.id}
                ficha={abierta.p.cliente}
                relacion={abierta.r!}
                todasCitas={todasCitas}
                todasFacturas={todasFacturas}
                alCambiar={recargar}
                alBorrar={() => {
                  setClienteAbierto(null);
                  recargar();
                }}
              />
            ) : (
              <div style={css(TARJETA + PAD)}>
                <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s2);")}>Todavía no tiene ficha</div>
                <p style={css(NOTA + "margin:0 0 var(--s3);line-height:1.55;max-width:56ch;")}>
                  Dejó su correo en la web y nada más. En cuanto le hagas ficha podrás apuntarle sesiones, escribir
                  notas de lo que pasó y hacerle facturas. Lo que dejó escrito arriba no se toca: se queda como estaba.
                </p>
                <button onClick={() => void haceFicha(abierta.p)} style={css(botonPrincipal())}>
                  Hacerle ficha
                </button>
              </div>
            )}
          </div>
        )}
      </HojaLateral>
    </main>
  );
}
