"use client";

/**
 * LOS CLIENTES: UNA LISTA DE PERSONAS.
 *
 * AQUÍ HABÍA UN TABLERO DE CINCO COLUMNAS Y SE HA QUITADO.
 *
 * Lo defendía un argumento que sigue siendo cierto: un tablero enseña los cinco
 * montones a la vez y una lista con filtros enseña uno cada vez. El fallo no
 * estaba en el razonamiento, estaba en la pregunta. El tablero contestaba «¿cómo
 * va el despacho?», y ésa no es la pregunta con la que se abre esta pantalla:
 * quien entra aquí viene a buscar a una persona, ver quién es y abrir su ficha.
 * Para eso, cinco columnas obligan a adivinar en cuál de las cinco cayó alguien
 * antes de poder mirarla — es decir, ponen un acertijo entre el nombre y la
 * ficha.
 *
 * Y el propio tablero se contradecía: sus columnas se calculaban, así que
 * arrastrar no guardaba nada; el sitio donde SÍ se cambian las cosas era la
 * ficha, la misma que abre cualquier fila de una lista. Un tablero que sólo
 * sirve para leer es una lista repartida en cinco trozos.
 *
 * «¿Cómo va el despacho?» no se ha perdido: la contestan los avisos de la
 * cabecera —que además llevan a donde se arregla cada cosa— y el bloque de
 * arriba, que dice a quién ves esta semana.
 *
 * QUÉ CONSERVA CADA FILA DE LO QUE REPARTÍAN LAS COLUMNAS.
 *
 * Todo, y sin gastar sitio. Cuatro de las cinco columnas eran maneras de decir
 * lo que la fila ya dice EN PALABRAS con `comoVaCorto`: «Jueves 11 a las 18:00»
 * es «lo ves pronto», «Sin ninguna sesión todavía» es «todavía no ha venido», y
 * «Hace 4 meses» —que sólo se escribe cuando no hay nada por delante— es «toca
 * llamar» o «se está enfriando» según cuánto sea. La quinta, «te falta cerrar
 * algo», es la única que no se deduce leyendo, y por eso es la única que lleva
 * marca: la pastilla roja. Cinco columnas caben en dos renglones.
 *
 * NO HAY PESTAÑAS DE FILTRO, y no es un olvido: eran exactamente lo que se ha
 * venido a quitar. Se busca escribiendo, que es como se busca a una persona
 * cuyo nombre ya se sabe.
 *
 * No toca `localStorage`: pide las citas, las fichas y las facturas a los
 * repositorios de `lib/despacho`. El día que eso sea Firebase, este archivo no
 * cambia.
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
import { AvisoNavegador, Avatar, Cabecera, Vacio, useEstrecho } from "../despacho/Piezas";
import HojaLateral from "../despacho/HojaLateral";
import FichaCliente from "../despacho/FichaCliente";

/** Cómo se llama en pantalla de dónde salió cada persona. */
const ORIGENES: Record<string, string> = {
  "web-sinergia": "Llegó por la prueba gratis",
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

type ConRelacion = { c: Cliente; r: Relacion };

export default function ClientesScreen() {
  const { clienteAbierto, setClienteAbierto } = useApp();

  const [lista, setLista] = useState<Cliente[]>([]);
  const [todasCitas, setTodasCitas] = useState<Cita[]>([]);
  const [todasFacturas, setTodasFacturas] = useState<Factura[]>([]);
  const [busca, setBusca] = useState("");
  const [cargando, setCargando] = useState(true);
  // Sube de número después de cada escritura y obliga a releer. Es la forma
  // barata de que la lista y la ficha no se queden con lo de antes.
  const [refresco, setRefresco] = useState(0);

  const estrecho = useEstrecho(900);
  const quieto = useReducedMotion();

  /* Leer el disco de este equipo es leer un sistema externo, que es para lo que
     está el efecto: no se puede pedir en el primer render porque el servidor no
     ve el almacenamiento de este equipo. */
  useEffect(() => {
    let vivo = true;
    // Las tres a la vez: sin las citas y las facturas, una fila no puede decir
    // cuándo fue la última vez ni si queda algo colgando, que es justo lo que
    // separa esta lista de una agenda de teléfonos.
    Promise.all([repoClientes.buscar(busca), repoCitas.listar(), repoFacturas.listar()]).then(([c, ci, fa]) => {
      if (!vivo) return;
      setLista(c);
      setTodasCitas(ci);
      setTodasFacturas(fa);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [busca, refresco]);

  const recargar = useCallback(() => setRefresco((n) => n + 1), []);

  /** Cómo va cada persona, calculado una vez para todas. El orden es el
   *  alfabético que ya entrega el repositorio y no se toca: una lista que se
   *  reordena sola —los pendientes arriba, los recientes primero— obliga a
   *  volver a buscar con los ojos cada vez que se guarda algo, y esta pantalla
   *  existe para encontrar a alguien por su nombre. */
  const gente = useMemo<ConRelacion[]>(() => {
    const ahora = new Date();
    return lista.map((c) => ({ c, r: relacionDe(c, todasCitas, todasFacturas, ahora) }));
  }, [lista, todasCitas, todasFacturas]);

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
    return gente
      .filter((g) => g.r.proxima && diasEntre(ahora, new Date(g.r.proxima.inicioISO)) <= 7)
      .sort((a, b) => (a.r.proxima?.inicioISO ?? "").localeCompare(b.r.proxima?.inicioISO ?? ""));
  }, [gente]);

  /* -------------------------------------------------------- la ficha abierta */

  const abierta = useMemo(() => gente.find((g) => g.c.id === clienteAbierto) ?? null, [gente, clienteAbierto]);

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

  const entrada = "width:100%;min-width:0;padding:11px 14px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

  /* ---------------------------------------------------------------- la fila */

  /**
   * Una persona, como se lee en la lista: la cara, el nombre, cómo va la
   * relación y —sólo si lo hay— lo que queda colgando.
   *
   * FILAS SEPARADAS POR UNA LÍNEA, NO PASTILLAS SUELTAS. Es la otra mitad de la
   * regla de la casa («lo que separa es una línea, o una pastilla»), y aquí toca
   * la línea: doscientas pastillas con su hueco entre ellas vuelven a leerse
   * como un tablero de una sola columna, que es lo que se acaba de quitar. Una
   * línea de un pelo se lee como lo que es, una lista.
   *
   * El fondo de la fila es lo único que cambia al elegir a alguien —granate, el
   * color de lo que está seleccionado— y sale a los bordes de la tarjeta con el
   * margen negativo: una banda que empieza y acaba dentro del relleno parecería
   * una tarjeta metida en otra tarjeta.
   */
  const fila = (g: ConRelacion, i: number) => {
    const cuelga = loQueCuelga(g.r);
    const elegida = g.c.id === clienteAbierto;
    return (
      <motion.button
        key={g.c.id}
        initial={quieto ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        /* Escalonada, pero con tope: en una lista de doscientas, esperar
           metro y medio de retraso a la última haría que la pantalla tardara
           dos segundos en estar entera. Y corta —la casa no pasa de un tercio
           de segundo—, que es lo que la separa de una animación bonita de
           enseñar y molesta de usar. */
        transition={{ duration: 0.26, delay: Math.min(i, 7) * 0.03, ease: [0.16, 1, 0.3, 1] }}
        whileTap={quieto ? undefined : { scale: 0.995 }}
        onClick={() => setClienteAbierto(g.c.id)}
        /* `aria-current` y no `aria-pressed`: esto no es un interruptor —volver a
           pulsarlo no cierra nada—, es cuál de la lista se está mirando. Es la
           misma diferencia que el granate cuenta con el color. */
        aria-current={elegida ? "true" : undefined}
        style={css(
          "display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;border:none;" +
            /* La línea la lleva cada fila menos la primera: pegada al borde de
               dentro de la tarjeta se leería como un segundo borde. */
            (i === 0 ? "" : "border-top:1px solid var(--border);") +
            /* La fila sale hasta los cantos de la tarjeta. Una banda de color
               que empieza y acaba dentro del relleno parecería una tarjeta
               metida en otra tarjeta, que es lo que la casa no hace. */
            "margin-inline:calc(var(--pad-card) * -1);padding:12px var(--pad-card);" +
            /* El aro de foco, por dentro. La tarjeta recorta lo que se sale
               —hace falta para que el fondo de la fila elegida no desborde por
               las esquinas redondeadas— y con el aro por fuera se habría
               comido justo la señal de dónde está el teclado. */
            "outline-offset:-2px;" +
            (elegida ? "background:var(--accion-suave);" : "background:transparent;") +
            "transition:background .18s cubic-bezier(.16,1,.3,1);"
        )}
      >
        <Avatar nombre={g.c.nombre} tamano={34} />
        <span style={css("min-width:0;flex:1;")}>
          <span style={css("display:block;font-size:var(--t-body);font-weight:590;line-height:1.3;color:var(--text);overflow-wrap:anywhere;")}>
            {enTitulo(g.c.nombre)}
          </span>
          {/* Cómo va y, pegada, la marca de lo que cuelga. Pegada y no alineada
              al canto derecho de la fila: en una pantalla ancha la fila mide mil
              quinientos píxeles y una pastilla al fondo se queda a un palmo del
              nombre al que se refiere. Aquí las dos cosas se leen del tirón. */}
          <span style={css("display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;margin-top:3px;")}>
            {/* Aquí hubo un tinte para los que llevan más de tres meses sin
                venir, imitando la columna de los que se enfrían. Se ha quitado:
                el renglón ya DICE «Hace 4 meses», y esa frase sólo aparece
                cuando no hay ninguna sesión por delante. Un color que repite lo
                que pone al lado no marca nada, decora — y en esta casa el color
                marca. */}
            <span style={css(NOTA + "line-height:1.4;")}>{comoVaCorto(g.r)}</span>
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
      </motion.button>
    );
  };

  /* ---------------------------------------------------------------- pintado */

  const cuantos = lista.length;

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);min-width:0;")}>
      {/* La cuenta va donde `Cabecera` pone el pie, como en Leads: es lo que se
          quiere saber al llegar y no hace falta una frase para decirlo. Al
          buscar dice cuántas ha encontrado, que es la respuesta a lo que se
          acaba de escribir. */}
      <Cabecera
        titulo="Clientes"
        pie={cargando ? "" : cuantos === 1 ? "1 persona" : `${cuantos} personas`}
      />

      {/* ================================================== buscar y las caras */}
      <section style={css(TARJETA + PAD + "margin-bottom:var(--gap-lg);min-width:0;")}>
        <div style={css("display:flex;flex-wrap:wrap;gap:var(--s3);align-items:center;")}>
          {/* El buscador va lo primero: buscar a alguien mientras se habla por
              teléfono es lo más urgente que pasa en esta pantalla. */}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nombre"
            aria-label="Buscar por nombre"
            style={css(entrada + "flex:1 1 240px;")}
          />
          {/* La única mancha de granate de la pantalla. En estrecho se estira
              hasta el borde de la tarjeta: debajo del buscador, un botón que
              acaba a dos tercios del ancho deja el canto derecho partido — y es
              la misma regla que en la agenda, donde el botón principal también
              ocupa su renglón entero cuando no cabe al lado de nada. */}
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
                  key={g.c.id}
                  initial={quieto ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={quieto ? undefined : { y: -3 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.035, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setClienteAbierto(g.c.id)}
                  title={`${g.c.nombre} · ${comoVaCorto(g.r)}`}
                  style={css(
                    "flex:none;width:74px;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;padding:0;cursor:pointer;font-family:inherit;"
                  )}
                >
                  <Avatar nombre={g.c.nombre} tamano={42} />
                  <span
                    style={css(
                      "font-size:var(--t-micro);line-height:1.25;color:var(--text-2);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;"
                    )}
                  >
                    {g.c.nombre.split(/\s+/)[0]}
                  </span>
                  <span style={css("font-size:var(--t-micro);line-height:1.2;color:var(--text-4);text-align:center;")}>
                    {g.r.proxima ? diaMinimo(new Date(g.r.proxima.inicioISO)) : ""}
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

      {/* =============================================================== la lista */}
      <section style={css(TARJETA + PAD + "min-width:0;overflow:hidden;")}>
        {cargando ? (
          <Vacio>Un momento…</Vacio>
        ) : gente.length === 0 ? (
          <Vacio>
            {busca
              ? "Aquí no hay nadie con ese nombre. Pruébalo con menos letras."
              : "Todavía no hay nadie. Se llena solo al apuntar sesiones."}
          </Vacio>
        ) : (
          /* El relleno vertical lo pone cada fila, así que la tarjeta se queda
             sin el suyo por arriba y por abajo: si no, la primera fila
             empezaría a treinta píxeles del borde y la lista se leería
             despegada de su propia tarjeta. */
          <div style={css("display:flex;flex-direction:column;margin-block:calc(var(--pad-card) * -1 + 4px);")}>
            {gente.map(fila)}
          </div>
        )}
      </section>

      <AvisoNavegador que="Las fichas y las notas" />

      {/* =============================================================== la ficha */}
      <HojaLateral
        abierta={Boolean(abierta)}
        cerrar={() => setClienteAbierto(null)}
        titulo={abierta ? enTitulo(abierta.c.nombre) : ""}
        pie={
          abierta
            ? `${ORIGENES[abierta.c.origen] || "Apuntada a mano"} · desde el ${diaLargo(new Date(abierta.c.creada))}`
            : undefined
        }
      >
        {abierta && (
          <FichaCliente
            /* La clave es la persona: al cambiar de ficha se monta otra, y con
               ella se van el borrador de la nota y el formulario desplegado de
               la anterior. Sin esto, la nota a medias de Ana aparecería escrita
               en la ficha de Carmen. */
            key={abierta.c.id}
            ficha={abierta.c}
            relacion={abierta.r}
            todasCitas={todasCitas}
            todasFacturas={todasFacturas}
            alCambiar={recargar}
            alBorrar={() => {
              setClienteAbierto(null);
              recargar();
            }}
          />
        )}
      </HojaLateral>
    </main>
  );
}
