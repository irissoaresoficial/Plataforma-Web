"use client";

/**
 * LOS CLIENTES
 *
 * QUÉ ESTABA MAL Y POR QUÉ SE HA REPARTIDO DE OTRA MANERA.
 *
 * Esta pantalla era un archivador, no un CRM, y se notaba en tres sitios:
 *
 *  1. LA LISTA NO DECÍA NADA. Ocho nombres con su correo debajo. El correo es
 *     el dato menos útil de los que hay —Iris llama por teléfono y ve a la
 *     gente— y sobre todo no contesta ninguna de las preguntas con las que se
 *     entra aquí: a quién veo hoy, a quién hace meses que no veo, de quién me
 *     falta algo. Para saberlo había que abrir las ocho fichas de una en una.
 *
 *  2. LA FICHA EMPEZABA POR UN FORMULARIO. Lo primero bajo el nombre eran cinco
 *     casillas —correo, teléfono, NIF, domicilio— que se rellenan una vez en la
 *     vida, ocupando el sitio de arriba. El NIF de alguien estaba por encima de
 *     cuándo fue su última sesión. Y el botón rojo de borrar la ficha era la
 *     segunda cosa más visible de la pantalla, por encima de lo que se hace
 *     todos los días.
 *
 *  3. LO QUE SE VIENE A HACER ESTABA AL FINAL. Apuntar la nota después de una
 *     sesión —el motivo real de abrir a alguien— quedaba a mil setecientos
 *     píxeles de scroll, debajo del formulario fiscal y de una tarjeta de
 *     estudios que casi siempre está vacía y ocupa lo mismo llena que vacía.
 *     Y no había forma de saber, sin sumar fechas a mano, cuándo fue la última
 *     vez ni si quedaba algo pendiente.
 *
 * AHORA LA PANTALLA CONTESTA TRES PREGUNTAS EN ESTE ORDEN, que son las tres que
 * tiene una persona que vive de sesiones de una en una:
 *
 *     QUIÉN ES      · el nombre, y cómo se le llega: su teléfono y su correo
 *                     como algo que se pulsa, no como casillas que rellenar.
 *     CÓMO VA       · cuándo vuelve, cuántas veces ha venido, cuándo fue la
 *                     última, y qué queda colgando. En frases, no en fechas.
 *     QUÉ HAGO      · apuntarle una sesión, hacerle el estudio, hacerle una
 *                     factura. Y, arriba del todo, escribir la nota.
 *
 * Los datos de facturar no se han quitado: se han plegado detrás de «Corregir
 * sus datos», que es lo que son — una corrección, no lo que se viene a mirar.
 *
 * LOS ESTUDIOS SE CRUZAN POR EL NOMBRE, y eso es una atadura con cuerda: el
 * historial de estudios se guarda con un identificador hecho del nombre y la
 * fecha, y no sabe nada de esta ficha. Con base de datos, la ficha guardará el
 * identificador del estudio y esto dejará de adivinar. Mientras tanto, cruzar
 * por nombre acierta en el caso que importa —Iris estudia a quien atiende— y
 * cuando falla, falla por defecto: no enseña un estudio que no es.
 *
 * No toca `localStorage`: pide las citas, las fichas y las facturas a los
 * repositorios de `lib/despacho`. El día que eso sea Firebase, este archivo no
 * cambia.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, BOTON_NORMAL, BOTON_PLANO, LECTURA, NOTA, PAD, RAYA, TARJETA, TITULO, botonPrincipal, rotulo } from "@/lib/ui";
import { titulo as enTitulo } from "@/lib/format";
import Confirmar from "../Confirmar";
import {
  citas as repoCitas,
  clientes as repoClientes,
  facturas as repoFacturas,
  comoVaCorto,
  diaLargo,
  diasEntre,
  duracion,
  etiquetaEstado,
  etiquetaTipo,
  euros,
  frasesDeRelacion,
  hace,
  hora,
  numeroDe,
  nuevoId,
  relacionDe,
  sinTildes,
  totales,
  DIAS_FRIO,
  type Cita,
  type Cliente,
  type Factura,
  type Relacion,
} from "@/lib/despacho";
import { AvisoNavegador, Cabecera, Estado, Vacio, useLlevaAlDetalle } from "../despacho/Piezas";

/** «ninguna nota», «la nota que le escribiste», «las 3 notas que le has
 *  escrito». Contar bien importa aquí: es exactamente lo que se pierde. */
function cuantas(n: number, cero: string, una: string, varias: string): string {
  if (n === 0) return cero;
  if (n === 1) return una;
  return `las ${n} ${varias}`;
}

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

/**
 * LOS CUATRO MONTONES.
 *
 * No son filtros de base de datos: son las cuatro preguntas con las que Iris
 * abre esta pantalla. Por eso se llaman como se las diría ella y no «estado» o
 * «segmento». El de «Todos» va primero porque es donde se vuelve siempre.
 *
 * Que cada uno lleve su cuenta al lado es la mitad del trabajo: con verlos, ya
 * sabe que hay tres personas frías sin tener que pulsar nada.
 */
type Monton = "todos" | "semana" | "pendiente" | "frio";

const MONTONES: Array<{ k: Monton; label: string }> = [
  { k: "todos", label: "Todos" },
  { k: "semana", label: "Esta semana" },
  { k: "pendiente", label: "Pendiente" },
  { k: "frio", label: "Hace mucho" },
];

/** Cuántas sesiones pasadas se enseñan antes de plegar el resto. Con ocho ya se
 *  ve el ritmo de la relación; con veinte, la ficha deja de leerse. */
const SESIONES_A_LA_VISTA = 6;

export default function ClientesScreen() {
  const { hist, abrir, set, setView, clienteAbierto, setClienteAbierto, focoFicha, setFocoFicha, setFacturaAbierta, setRecado } =
    useApp();

  const [lista, setLista] = useState<Cliente[]>([]);
  const [todasCitas, setTodasCitas] = useState<Cita[]>([]);
  const [todasFacturas, setTodasFacturas] = useState<Factura[]>([]);
  const [busca, setBusca] = useState("");
  const [monton, setMonton] = useState<Monton>("todos");
  const [ficha, setFicha] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(true);
  // Sube de número después de cada escritura y obliga a releer. Es la forma
  // barata de que la lista y la ficha no se queden con lo de antes.
  const [refresco, setRefresco] = useState(0);

  // Los datos de facturar se editan sobre una copia y se guardan al pulsar: si
  // se escribieran directamente, cada tecla sería una escritura en disco y un
  // borrado accidental del nombre se guardaría solo.
  const [datos, setDatos] = useState({ nombre: "", email: "", telefono: "", nif: "", direccion: "" });
  // El formulario empieza plegado a propósito: es lo que menos se toca y lo que
  // más sitio ocupaba. Se despliega solo cuando la persona no tiene nombre de
  // verdad todavía —la acaban de crear— porque entonces sí hay algo que escribir.
  const [corrigiendo, setCorrigiendo] = useState(false);
  const [nota, setNota] = useState("");
  const [aviso, setAviso] = useState("");
  const [verTodas, setVerTodas] = useState(false);

  // En móvil la ficha sale debajo de la lista: al elegir a alguien hay que
  // llevar la vista hasta ella o parece que no ha pasado nada.
  const alDetalle = useLlevaAlDetalle(clienteAbierto);
  const cajaNota = useRef<HTMLTextAreaElement>(null);

  /* Leer el disco de este equipo es leer un sistema externo, que es para lo que
     está el efecto; la regla que se apaga es la misma que en `app-context`. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let vivo = true;
    // Las tres a la vez: sin las citas y las facturas, la lista no puede decir
    // cómo va cada relación, que es justo lo que ha venido a decir.
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

  useEffect(() => {
    let vivo = true;
    if (!clienteAbierto) {
      setFicha(null);
      return;
    }
    repoClientes.obtener(clienteAbierto).then((c) => {
      if (!vivo) return;
      setFicha(c);
      setDatos({
        nombre: c?.nombre ?? "",
        email: c?.email ?? "",
        telefono: c?.telefono ?? "",
        nif: c?.nif ?? "",
        direccion: c?.direccion ?? "",
      });
      setNota("");
      setAviso("");
      setVerTodas(false);
      // Una ficha recién creada se llama «Sin nombre»: ahí el formulario sí es
      // lo primero que hay que hacer, así que se abre solo.
      setCorrigiendo(c?.nombre === "Sin nombre");
    });
    return () => {
      vivo = false;
    };
  }, [clienteAbierto, refresco]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /*
   * EL AVISO QUE PIDE ESCRIBIR LA NOTA DEJA EL CURSOR DENTRO.
   *
   * Si sólo abriera la ficha, el aviso habría hecho la mitad del trabajo:
   * llevarla hasta aquí y dejarle a ella buscar dónde se escribe. El foco se
   * consume una vez y se apaga; si se quedara puesto, cada vez que volviera a
   * esta pantalla la página saltaría sola hasta el hueco de la nota.
   *
   * El foco se pone AQUÍ MISMO y no dentro de un temporizador. Con un
   * `setTimeout` no llegaba a ocurrir nunca: apagar `focoFicha` en la línea
   * siguiente vuelve a disparar este mismo efecto, y su limpieza cancelaba el
   * temporizador antes de que saltara. Aquí no hace falta esperar: el efecto
   * corre después de pintar, así que la caja ya existe.
   */
  useEffect(() => {
    if (focoFicha !== "nota" || !ficha) return;
    cajaNota.current?.focus();
    setFocoFicha(null);
  }, [focoFicha, ficha, setFocoFicha]);

  /** Cómo va cada persona de la lista, calculado una vez para todas. */
  const relaciones = useMemo(() => {
    const ahora = new Date();
    const m = new Map<string, Relacion>();
    lista.forEach((c) => m.set(c.id, relacionDe(c, todasCitas, todasFacturas, ahora)));
    return m;
  }, [lista, todasCitas, todasFacturas]);

  /** A qué montón pertenece cada persona. Alguien puede estar en varios: quien
   *  viene el jueves y además tiene una factura a medias sale en los dos. */
  const enMonton = useCallback(
    (c: Cliente, k: Monton) => {
      const r = relaciones.get(c.id);
      if (!r) return false;
      if (k === "todos") return true;
      if (k === "semana") return Boolean(r.proxima && diasEntre(new Date(), new Date(r.proxima.inicioISO)) <= 7);
      if (k === "pendiente") return Boolean(r.sinApuntar || r.borradores.length);
      // Frío es quien vino y dejó de venir. Quien nunca ha tenido una sesión no
      // se ha enfriado: no ha empezado, y decir que «hace mucho que no lo ves»
      // de alguien a quien no has visto nunca sería mentira.
      return r.diasSinVerse !== null && r.diasSinVerse >= DIAS_FRIO && !r.proxima;
    },
    [relaciones]
  );

  const cuentas = useMemo(() => {
    const c = {} as Record<Monton, number>;
    MONTONES.forEach(({ k }) => (c[k] = lista.filter((x) => enMonton(x, k)).length));
    return c;
  }, [lista, enMonton]);

  /* El orden es siempre alfabético, también dentro de un montón: una lista que
     se reordena según el filtro obliga a volver a buscar con los ojos cada vez.
     El repositorio ya la entrega así. */
  const visibles = useMemo(() => lista.filter((c) => enMonton(c, monton)), [lista, monton, enMonton]);

  /* ------------------------------------------------------- la persona abierta */

  const relacion = useMemo(
    () => (ficha ? relacionDe(ficha, todasCitas, todasFacturas) : null),
    [ficha, todasCitas, todasFacturas]
  );

  const suyas = useMemo(() => {
    if (!ficha) return { futuras: [] as Cita[], pasadas: [] as Cita[] };
    const ahora = new Date().toISOString();
    const todas = todasCitas.filter((c) => c.personaId === ficha.id).sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));
    return {
      futuras: todas.filter((c) => c.inicioISO > ahora && c.estado !== "anulada"),
      // Las pasadas, la más reciente arriba: lo último que pasó es lo primero
      // que se quiere leer.
      pasadas: todas.filter((c) => c.inicioISO <= ahora || c.estado === "anulada").reverse(),
    };
  }, [ficha, todasCitas]);

  const susFacturas = useMemo(
    () => (ficha ? todasFacturas.filter((f) => f.clienteId === ficha.id) : []),
    [ficha, todasFacturas]
  );

  /** Los estudios que ya se le han hecho a esta persona. Ver la nota de arriba
   *  sobre por qué se cruzan por el nombre. */
  const estudios = useMemo(() => {
    if (!ficha) return [];
    const buscado = sinTildes(ficha.nombre);
    if (buscado.length < 3) return [];
    return hist.filter((h) => sinTildes(h.nombre).includes(buscado) || buscado.includes(sinTildes(h.nombre)));
  }, [ficha, hist]);

  /* ------------------------------------------------------------- escrituras */

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
    setRefresco((n) => n + 1);
  };

  const guardarDatos = async () => {
    if (!ficha) return;
    if (!datos.nombre.trim()) return setAviso("La ficha necesita un nombre.");
    await repoClientes.guardar({
      ...ficha,
      nombre: datos.nombre.trim(),
      email: datos.email.trim(),
      telefono: datos.telefono.trim() || undefined,
      nif: datos.nif.trim() || undefined,
      direccion: datos.direccion.trim() || undefined,
    });
    setAviso("Datos guardados.");
    setCorrigiendo(false);
    setRefresco((n) => n + 1);
  };

  const guardarNota = async () => {
    if (!ficha) return;
    if (!nota.trim()) return setAviso("Escribe la nota antes de guardarla.");
    await repoClientes.guardar({
      ...ficha,
      // La nueva va delante: lo último que escribió es lo primero que quiere
      // leer cuando vuelve a abrir la ficha.
      notas: [{ id: nuevoId(), fecha: new Date().toISOString(), texto: nota.trim() }, ...ficha.notas],
    });
    setNota("");
    setAviso("Nota guardada.");
    setRefresco((n) => n + 1);
  };

  const borrarNota = async (id: string) => {
    if (!ficha) return;
    await repoClientes.guardar({ ...ficha, notas: ficha.notas.filter((n) => n.id !== id) });
    setRefresco((n) => n + 1);
  };

  /**
   * Borrar una ficha se lleva también sus sesiones.
   *
   * Dejarlas sería peor: la agenda seguiría enseñando esas horas ocupadas con
   * un «Sin nombre» que ya no lleva a ninguna parte y que Iris no podría
   * arreglar desde ningún sitio. Las facturas NO se van — una factura emitida
   * no se borra nunca, y además lleva dentro su propia copia de los datos de la
   * persona, así que se sostiene sola.
   */
  const borrarFicha = async () => {
    if (!ficha) return;
    const sesiones = todasCitas.filter((c) => c.personaId === ficha.id);
    await Promise.all(sesiones.map((c) => repoCitas.borrar(c.id)));
    await repoClientes.borrar(ficha.id);
    setClienteAbierto(null);
    setRefresco((n) => n + 1);
  };

  /* ------------------------------------------- las salidas hacia lo suyo */

  const apuntarleSesion = () => {
    if (!ficha) return;
    setRecado(ficha.nombre);
    setView("agenda");
  };

  const hacerleFactura = () => {
    if (!ficha) return;
    setFacturaAbierta(null);
    setRecado(ficha.nombre);
    setView("facturas");
  };

  /**
   * Llevar el nombre a la consulta para hacerle el estudio.
   *
   * NO se parte en nombre y apellidos. Adivinar dónde acaba «Ana Belén» y
   * empieza «Ferrer» falla la mitad de las veces, y un estudio hecho sobre una
   * partición equivocada no se nota: sale un número, parece bueno y es de otra
   * persona. Va entero en el primer campo y que ella lo coloque, que le cuesta
   * dos segundos y sabe cuál es cuál.
   */
  const hacerleElEstudio = () => {
    if (!ficha) return;
    set("tipo", "persona");
    set("nombre", ficha.nombre);
    set("ap1", "");
    set("ap2", "");
    setView("inicio");
  };

  const entrada = "width:100%;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

  /** Una línea de aviso dentro de la ficha: raya de color al canto, sin fondo.
   *  El color marca, no rellena — es la misma regla del consentimiento. */
  const linea = (color: string, texto: string) => (
    <p style={css(APOYO + `margin:var(--s2) 0 0;padding-left:var(--s3);border-left:2px solid ${color};line-height:1.5;`)}>
      {texto}
    </p>
  );

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);")}>
      <Cabecera
        titulo="Clientes"
        pie="Quién es cada persona, cómo va la relación y qué te queda por hacer con ella."
      />

      <div data-dos="">
        {/* ------------------------------------------------------- la lista */}
        <section data-anclado="" style={css(TARJETA + PAD + "position:sticky;top:79px;max-height:calc(100vh - 100px);overflow-y:auto;min-width:0;")}>
          {/* El buscador va lo primero, antes que la cuenta y que los montones:
              buscar a alguien mientras se habla por teléfono es lo más urgente
              que pasa en esta pantalla, y estaba en tercer lugar. */}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nombre"
            aria-label="Buscar por nombre"
            style={css(entrada + "margin-bottom:var(--s3);")}
          />

          <div style={css("display:flex;flex-wrap:wrap;gap:6px;margin-bottom:var(--s3);")}>
            {MONTONES.map(({ k, label }) => {
              const on = monton === k;
              const n = cuentas[k] ?? 0;
              return (
                <button
                  key={k}
                  onClick={() => setMonton(k)}
                  aria-pressed={on}
                  style={css(
                    "display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;cursor:pointer;font-size:var(--t-mini);font-weight:590;white-space:nowrap;" +
                      /* Lo elegido, en granate. La misma regla que la columna de
                         la izquierda y que la fila de la persona abierta. */
                      "border:1px solid " +
                      (on ? "var(--accion-borde)" : "var(--border-strong)") +
                      ";background:" +
                      (on ? "var(--accion-suave)" : "transparent") +
                      ";color:" +
                      (on ? "var(--accion)" : "var(--text-3)") +
                      ";"
                  )}
                >
                  {label}
                  {/* La cuenta sólo cuando hay algo. Un «0» al lado de «Hace
                      mucho» ocupa sitio para decir que no pasa nada.
                      Va a plena tinta y no rebajada: es un dato que hay que
                      leer, y al 70 % de opacidad se quedaba en 3,5:1 sobre el
                      papel, por debajo del mínimo legible de la casa. */}
                  {n > 0 && <span data-cifras="">{n}</span>}
                </button>
              );
            })}
          </div>

          <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s2);")}>
            {cargando ? "Buscando…" : visibles.length === 1 ? "1 persona" : `${visibles.length} personas`}
          </div>

          {!cargando && visibles.length === 0 && (
            <Vacio>
              {busca
                ? "Aquí no hay nadie con ese nombre. Pruébalo con menos letras."
                : monton === "semana"
                  ? "No tienes ninguna sesión apuntada para los próximos siete días."
                  : monton === "pendiente"
                    ? "No te queda nada colgando: todas las sesiones tienen su nota y no hay facturas a medias."
                    : monton === "frio"
                      ? "A todo el mundo lo has visto hace poco o lo tienes apuntado."
                      : "Todavía no tienes a nadie fichado. En cuanto apuntes una sesión en la agenda, la persona aparece aquí sola."}
            </Vacio>
          )}

          <div style={css("display:flex;flex-direction:column;")}>
            {visibles.map((c, i) => {
              const on = c.id === clienteAbierto;
              const r = relaciones.get(c.id);
              // Lo que cuelga, en una palabra. Se elige uno y no se listan los
              // dos: debajo de un nombre, en una columna estrecha, dos marcas
              // se leen peor que ninguna. La nota va primero porque el recuerdo
              // caduca y la factura no.
              const marca = r?.sinApuntar ? "sin apuntar" : r?.borradores.length ? "factura a medias" : "";
              return (
                <button
                  key={c.id}
                  onClick={() => setClienteAbierto(c.id)}
                  style={css(
                    /* La línea de separación va SIEMPRE puesta y lo que cambia
                       es su color. Quitarla y ponerla al repintar, con el
                       `border` corto también declarado, hace que React avise de
                       propiedades en conflicto — y en algún repintado la línea
                       se queda o desaparece cuando no toca. */
                    "display:block;width:100%;text-align:left;padding:var(--s3) var(--s2);border:none;cursor:pointer;border-radius:var(--r-sm);border-top:1px solid " +
                      (i ? "var(--border)" : "transparent") +
                      ";" +
                      /* Dónde estás, en granate. La misma regla que la lateral
                         del estudio y que el botón. */
                      "background:" +
                      (on ? "var(--accion-suave)" : "transparent") +
                      ";color:" +
                      (on ? "var(--accion)" : "var(--text)") +
                      ";"
                  )}
                >
                  <span style={css("display:block;font-size:var(--t-read);line-height:1.25;overflow-wrap:anywhere;")}>{c.nombre}</span>
                  {/* Y aquí está el cambio que convierte la lista en un CRM: en
                      vez del correo —que no contesta ninguna pregunta— la línea
                      de debajo dice cómo va la relación. */}
                  <span style={css(NOTA + "display:block;margin-top:3px;")}>
                    {r ? comoVaCorto(r) : ""}
                    {marca && (
                      <>
                        {" · "}
                        <span style={css("color:var(--red);")}>{marca}</span>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>
            <button onClick={() => void nueva()} style={css(BOTON_NORMAL + "width:100%;")}>
              Añadir una persona
            </button>
          </div>
        </section>

        {/* -------------------------------------------------------- la ficha */}
        {!ficha || !relacion ? (
          /*
           * SIN NADIE ELEGIDO, LA PANTALLA NO SE QUEDA EN BLANCO.
           *
           * Antes aquí había dos tercios de pantalla vacíos con un «Elige a
           * alguien de la lista», y eso obligaba a saber a quién buscar antes de
           * entrar. Iris no siempre lo sabe: muchas veces la pregunta es la
           * contraria —«¿de quién tengo que ocuparme?»— y a ésa no había nada
           * que contestara.
           *
           * Ahora el hueco dice por dónde empezar y NOMBRA a la gente, que es lo
           * único que sirve: una cuenta sin nombres obliga a un clic más para
           * saber de quién se habla. Es lo mismo que dicen los montones de la
           * izquierda, pero desplegado — allí es un filtro, aquí es la lista.
           */
          <section style={css(TARJETA + PAD)}>
            <h2 style={css(TITULO + "margin:0 0 var(--s4);")}>Por dónde empezar</h2>

            {cargando ? (
              <Vacio>Un momento…</Vacio>
            ) : cuentas.todos === 0 ? (
              <Vacio>
                Todavía no tienes a nadie fichado. En cuanto apuntes una sesión en la agenda, la persona aparece aquí sola.
              </Vacio>
            ) : cuentas.pendiente + cuentas.semana + cuentas.frio === 0 ? (
              <Vacio>
                No te queda nada colgando y no tienes a nadie olvidado. Elige a quien quieras de la lista para ver cómo va.
              </Vacio>
            ) : (
              ([
                ["pendiente", "Algo que te falta", "Sesiones sin apuntar y facturas a medias."],
                ["semana", "Viene esta semana", "Léete su última nota antes de que llegue."],
                ["frio", "Hace mucho que no los ves", "El que no vuelve en tres meses es el que se pierde."],
              ] as const).map(([k, titulo, pie], i) => {
                const gente = lista.filter((c) => enMonton(c, k));
                if (!gente.length) return null;
                return (
                  <div key={k} style={css(i ? RAYA + "margin-top:var(--s4);padding-top:var(--s4);" : "")}>
                    <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s1);")}>{titulo}</div>
                    <p style={css(NOTA + "margin:0 0 var(--s2);")}>{pie}</p>
                    <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2);")}>
                      {gente.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setClienteAbierto(c.id)}
                          style={css(BOTON_PLANO)}
                        >
                          {c.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            <AvisoNavegador que="Las fichas de tus clientes" />
          </section>
        ) : (
          <div ref={alDetalle} data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;scroll-margin-top:79px;")}>
            {/* ================================ 1. QUIÉN ES Y CÓMO VA */}
            <section style={css(TARJETA + PAD)}>
              <h2 style={css(TITULO + "margin:0;overflow-wrap:anywhere;")}>{enTitulo(ficha.nombre)}</h2>
              <p style={css(NOTA + "margin:5px 0 0;")}>
                {ORIGENES[ficha.origen] || "Apuntada a mano"} · desde el {diaLargo(new Date(ficha.creada))}
              </p>

              {/* CÓMO SE LE LLEGA. El teléfono y el correo salen como algo que
                  se pulsa —en el móvil marca, en el ordenador abre el correo— y
                  no como dos casillas de un formulario. Es la diferencia entre
                  un dato guardado y un dato que sirve. */}
              {(ficha.telefono || ficha.email) && (
                <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2) var(--s4);margin-top:var(--s3);")}>
                  {ficha.telefono && (
                    <a href={`tel:${ficha.telefono.replace(/\s/g, "")}`} style={css("font-size:var(--t-read);color:var(--gold);")}>
                      {ficha.telefono}
                    </a>
                  )}
                  {ficha.email && (
                    <a href={`mailto:${ficha.email}`} style={css("font-size:var(--t-body);color:var(--gold);overflow-wrap:anywhere;")}>
                      {ficha.email}
                    </a>
                  )}
                </div>
              )}

              {/* --------------------------------------------------- cómo va */}
              <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);")}>
                <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s2);")}>Cómo va</div>
                {(() => {
                  const { viene, hubo } = frasesDeRelacion(relacion);
                  return (
                    <>
                      <p style={css(LECTURA + "margin:0;")}>{viene}</p>
                      <p style={css(LECTURA + "margin:2px 0 0;")}>{hubo}</p>
                    </>
                  );
                })()}

                {/* Lo que cuelga, dicho aquí y no sólo en los avisos: quien abre
                    la ficha antes de una sesión tiene que verlo sin haber
                    abierto la campana. */}
                {relacion.sinApuntar &&
                  linea(
                    "var(--red-border)",
                    `No apuntaste nada de la sesión de ${hace(diasEntre(new Date(relacion.sinApuntar.inicioISO), new Date()))}. Escríbelo aquí abajo antes de que se te vaya.`
                  )}
                {relacion.borradores.length > 0 &&
                  linea(
                    "var(--red-border)",
                    relacion.borradores.length === 1
                      ? "Tiene una factura empezada que todavía está en borrador: no tiene número hasta que la emitas."
                      : `Tiene ${relacion.borradores.length} facturas empezadas que todavía están en borrador.`
                  )}
                {relacion.diasSinVerse !== null && relacion.diasSinVerse >= DIAS_FRIO && !relacion.proxima &&
                  linea("var(--border-strong)", "Hace mucho que no la ves y no hay nada apuntado. Una llamada corta suele bastar.")}
              </div>

              {/* ------------------------------------------------ qué hago ahora */}
              <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);display:flex;gap:var(--s2);flex-wrap:wrap;")}>
                <button onClick={apuntarleSesion} style={css(BOTON_NORMAL)}>
                  Apuntarle una sesión
                </button>
                <button onClick={hacerleFactura} style={css(BOTON_PLANO)}>
                  Hacerle una factura
                </button>
                {estudios.length === 0 && (
                  <button onClick={hacerleElEstudio} style={css(BOTON_PLANO)}>
                    Hacerle el estudio
                  </button>
                )}
                <button onClick={() => setCorrigiendo((c) => !c)} style={css(BOTON_PLANO + "margin-left:auto;")}>
                  {corrigiendo ? "Dejar sus datos" : "Corregir sus datos"}
                </button>
              </div>

              {/* ------------------------------------- sus datos, cuando se piden */}
              {corrigiendo && (
                <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>
                  <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:var(--s3);")}>
                    {/* El NIF y el domicilio están aquí y no en la factura porque
                     * son de la persona: se escriben una vez y cada factura se
                     * queda su copia. Pueden estar vacíos. */}
                    {([
                      ["Nombre", "nombre", "Nombre y apellidos", false],
                      ["Correo", "email", "Sin correo", false],
                      ["Teléfono", "telefono", "Sin teléfono", false],
                      ["NIF (para facturarle)", "nif", "Sin NIF", false],
                      /* El domicilio ocupa la fila entera: es el dato más largo de
                         los cinco y en una casilla de la rejilla se leía a trozos. */
                      ["Domicilio (para facturarle)", "direccion", "Sin domicilio", true],
                    ] as const).map(([et, k, hueco, ancho]) => (
                      <label key={k} style={css("display:flex;flex-direction:column;gap:5px;min-width:0;" + (ancho ? "grid-column:1/-1;" : ""))}>
                        <span style={css(rotulo())}>{et}</span>
                        <input
                          value={datos[k]}
                          onChange={(e) => setDatos((d) => ({ ...d, [k]: e.target.value }))}
                          placeholder={hueco}
                          style={css(entrada)}
                        />
                      </label>
                    ))}
                  </div>

                  <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;margin-top:var(--s4);")}>
                    <button onClick={() => void guardarDatos()} style={css(BOTON_NORMAL)}>
                      Guardar los datos
                    </button>
                    {/* Borrar la ficha vive aquí abajo, dentro de lo que se
                        despliega, y no arriba en rojo al lado del nombre: se
                        hace una vez en la vida y estaba compitiendo con lo que
                        se hace todos los días. */}
                    <Confirmar
                      estilo={BOTON_PLANO + "color:var(--red);"}
                      alineado="izquierda"
                      pregunta={
                        `Se va ${ficha.nombre}, ` +
                        cuantas(ficha.notas.length, "ninguna nota", "la nota que le escribiste", "notas que le has escrito") +
                        " y " +
                        cuantas(
                          suyas.futuras.length + suyas.pasadas.length,
                          "ninguna sesión de la agenda",
                          "la sesión que tiene en la agenda",
                          "sesiones que tiene en la agenda"
                        ) +
                        ". Las facturas que le hayas hecho se quedan: una factura emitida no se borra nunca. Esto no se puede deshacer."
                      }
                      /* Corto: la pregunta de encima ya ha dicho qué se va, y
                         un botón de tres renglones dentro del globo se lee
                         peor que uno de uno. */
                      confirmar="Sí, borrarla"
                      alConfirmar={() => void borrarFicha()}
                    >
                      Borrar la ficha
                    </Confirmar>
                  </div>
                </div>
              )}

              {/* El consentimiento no se supone. Si esta persona la apuntó Iris
               * a mano, nadie ha aceptado ningún texto y hay que decirlo: es lo
               * que separa una ficha de un fichero de datos sin base legal. */}
              {!ficha.consentimiento && (
                <p style={css(NOTA + "margin:var(--s4) 0 0;padding-left:var(--s3);border-left:2px solid var(--red-border);line-height:1.5;")}>
                  No consta que haya aceptado nada. La apuntaste tú, así que no hay ningún texto de privacidad firmado por ella. Pídeselo antes de meterla en un envío.
                </p>
              )}
            </section>

            {/* ==================================== 2. LO QUE APUNTAS DE ELLA */}
            {/* Sube desde el final de la pantalla hasta aquí: escribir la nota
                después de una sesión, y leerla antes de la siguiente, es lo que
                se viene a hacer. Estaba debajo de todo. */}
            <section style={css(TARJETA + PAD)}>
              <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>Lo que apuntas de ella</div>
              <textarea
                ref={cajaNota}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={3}
                aria-label="Escribe una nota sobre esta persona"
                placeholder="Lo que quieras recordar de la última sesión."
                style={css(entrada + "resize:vertical;line-height:1.55;font-size:var(--t-read);")}
              />
              {/* La única mancha de granate de la ficha: guardar la nota es lo
                  que Iris viene a hacer aquí después de una sesión. */}
              <button onClick={() => void guardarNota()} style={css(botonPrincipal() + "margin-top:var(--s3);")}>
                Guardar la nota
              </button>

              {aviso && (
                <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-2);")}>
                  {aviso}
                </p>
              )}

              {ficha.notas.length === 0 ? (
                <p style={css(NOTA + "margin:var(--s4) 0 0;")}>Todavía no hay ninguna. La primera que escribas se queda aquí con su fecha.</p>
              ) : (
                <div style={css("margin-top:var(--s5);")}>
                  {ficha.notas.map((n) => (
                    <div key={n.id} style={css("padding:var(--s4) 0;" + RAYA)}>
                      <div style={css("display:flex;align-items:baseline;gap:var(--s3);")}>
                        <span style={css(rotulo())}>{diaLargo(new Date(n.fecha))}</span>
                        {/* Antes se borraba de un clic y sin preguntar. Una nota
                            es lo único que no se puede reconstruir: no hay copia
                            en ningún sitio y el recuerdo ya no está. */}
                        <div style={css("margin-left:auto;")}>
                          <Confirmar
                            estilo="background:none;border:none;padding:0;cursor:pointer;font-family:inherit;font-size:var(--t-mini);color:var(--text-4);"
                            titulo="Borrar esta nota"
                            pregunta={`Se va lo que escribiste el ${diaLargo(new Date(n.fecha))}. No hay copia en ningún sitio y no se puede deshacer.`}
                            confirmar="Sí, borrarla"
                            alConfirmar={() => void borrarNota(n.id)}
                          >
                            Borrar
                          </Confirmar>
                        </div>
                      </div>
                      <p style={css(LECTURA + "margin:6px 0 0;white-space:pre-wrap;")}>{n.texto}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ============================================= 3. SU HISTORIA */}
            {/* Las sesiones, los estudios y las facturas iban en tres tarjetas
                sueltas, y dos de las tres suelen estar vacías: ocupaban lo mismo
                sin decir nada. Aquí son tres bloques de una misma tarjeta,
                separados por una línea, que es lo que separa dentro de una
                tarjeta. */}
            <section style={css(TARJETA + PAD)}>
              <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>Su historia</div>

              {suyas.futuras.length === 0 && suyas.pasadas.length === 0 ? (
                <Vacio>No tiene ninguna sesión apuntada. Se apuntan desde «Agenda», o con el botón de aquí arriba.</Vacio>
              ) : (
                <>
                  {suyas.futuras.length > 0 && (
                    <>
                      <div style={css(rotulo() + "margin-bottom:var(--s1);")}>Lo que viene</div>
                      {suyas.futuras.map((c, i) => filaSesion(c, i))}
                    </>
                  )}
                  {suyas.pasadas.length > 0 && (
                    <div style={css(suyas.futuras.length ? RAYA + "margin-top:var(--s4);padding-top:var(--s4);" : "")}>
                      <div style={css(rotulo() + "margin-bottom:var(--s1);")}>Lo que ya fue</div>
                      {(verTodas ? suyas.pasadas : suyas.pasadas.slice(0, SESIONES_A_LA_VISTA)).map((c, i) => filaSesion(c, i))}
                      {!verTodas && suyas.pasadas.length > SESIONES_A_LA_VISTA && (
                        <button onClick={() => setVerTodas(true)} style={css(BOTON_PLANO + "margin-top:var(--s3);")}>
                          Ver las {suyas.pasadas.length - SESIONES_A_LA_VISTA} anteriores
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ------------------------------------------------ sus estudios */}
              <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);")}>
                <div style={css(rotulo() + "margin-bottom:var(--s2);")}>Sus estudios</div>
                {estudios.length === 0 ? (
                  <Vacio>Todavía no le has hecho ninguno. Con el botón de arriba se abre la consulta con su nombre puesto.</Vacio>
                ) : (
                  estudios.map((h, i) => (
                    <div key={h.id} style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s3) 0;" + (i ? RAYA : ""))}>
                      <span style={css("flex:1 1 auto;min-width:0;font-size:var(--t-body);color:var(--text-2);overflow-wrap:anywhere;")}>
                        {enTitulo(h.nombre)}
                        <span style={css(NOTA + "display:block;margin-top:2px;")}>
                          {h.f.tipo === "empresa" ? `Empresa · valor del nombre ${h.corazon}` : `${h.fecha} · corazón ${h.corazon}`}
                        </span>
                      </span>
                      <button onClick={() => abrir(h)} style={css(BOTON_PLANO)}>
                        Abrir el estudio
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* ------------------------------------------------ sus facturas */}
              <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);")}>
                <div style={css(rotulo() + "margin-bottom:var(--s2);")}>Sus facturas</div>
                {susFacturas.length === 0 ? (
                  <Vacio>No le has hecho ninguna. Se hace con el botón «Hacerle una factura» de aquí arriba.</Vacio>
                ) : (
                  susFacturas.map((f, i) => (
                    <div key={f.id} style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s3) 0;" + (i ? RAYA : ""))}>
                      {/* El número o «Sin número», que es lo que `numeroDe`
                          devuelve mientras es un borrador. Repetir aquí la
                          palabra «Borrador» sería decir dos veces lo mismo en
                          la misma fila: para eso ya está la pastilla. */}
                      <span style={css("flex:1 1 auto;min-width:0;font-size:var(--t-body);color:var(--text-2);")}>
                        {numeroDe(f)}
                        <span data-cifras="" style={css(NOTA + "display:block;margin-top:2px;")}>{euros(totales(f).total)}</span>
                      </span>
                      <Estado
                        texto={f.estado === "borrador" ? "Borrador" : f.estado === "anulada" ? "Anulada" : "Emitida"}
                        color={f.estado === "borrador" ? "var(--gold)" : f.estado === "anulada" ? "var(--red)" : "var(--green)"}
                      />
                      <button
                        onClick={() => {
                          setRecado(null);
                          setFacturaAbierta(f.id);
                          setView("facturas");
                        }}
                        style={css(BOTON_PLANO)}
                      >
                        Abrirla
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <AvisoNavegador que="Las fichas y las notas" />
          </div>
        )}
      </div>
    </main>
  );
}

/** Una sesión, como se lee: el día y la hora delante, y a la derecha en qué
 *  estado quedó. Se escribe una vez porque sale en los dos bloques —lo que
 *  viene y lo que ya fue— y tienen que verse iguales. */
function filaSesion(c: Cita, i: number) {
  return (
    <div key={c.id} style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s3) 0;" + (i ? RAYA : ""))}>
      <span style={css("flex:1 1 auto;min-width:0;font-size:var(--t-body);color:var(--text-2);")}>
        {diaLargo(new Date(c.inicioISO))} a las {hora(c.inicioISO)}
        <span style={css(NOTA + "display:block;margin-top:2px;")}>
          {etiquetaTipo(c.tipo)} · {duracion(c.minutos)}
          {c.notas ? ` · ${c.notas}` : ""}
        </span>
      </span>
      <Estado
        texto={etiquetaEstado(c.estado)}
        color={c.estado === "hecha" ? "var(--green)" : c.estado === "anulada" ? "var(--red)" : "var(--text-3)"}
      />
    </div>
  );
}
