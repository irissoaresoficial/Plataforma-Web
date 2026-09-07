"use client";

/**
 * LOS CLIENTES
 *
 * La ficha de cada persona: sus datos, los estudios que ya le has hecho, las
 * sesiones que ha tenido y las notas que escribes después de verla.
 *
 * A la izquierda la lista con su buscador; a la derecha la ficha de quien esté
 * elegido. En pantalla estrecha se apilan —la lista primero— porque ahí lo
 * primero es encontrar a la persona.
 *
 * LOS ESTUDIOS SE CRUZAN POR EL NOMBRE, y eso es una atadura con cuerda: el
 * historial de estudios se guarda con un identificador hecho del nombre y la
 * fecha, y no sabe nada de esta ficha. Con base de datos, la ficha guardará el
 * identificador del estudio y esto dejará de adivinar. Mientras tanto, cruzar
 * por nombre acierta en el caso que importa —Iris estudia a quien atiende— y
 * cuando falla, falla por defecto: no enseña un estudio que no es.
 */

import { useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, BOTON_NORMAL, BOTON_PLANO, LECTURA, NOTA, PAD, RAYA, TARJETA, TITULO, botonPrincipal, rotulo } from "@/lib/ui";
import { titulo as enTitulo } from "@/lib/format";
import {
  citas as repoCitas,
  clientes as repoClientes,
  diaLargo,
  duracion,
  etiquetaEstado,
  etiquetaTipo,
  hora,
  nuevoId,
  sinTildes,
  type Cita,
  type Cliente,
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

export default function ClientesScreen() {
  const { hist, abrir, clienteAbierto, setClienteAbierto } = useApp();

  const [lista, setLista] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [ficha, setFicha] = useState<Cliente | null>(null);
  const [sesiones, setSesiones] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  // Sube de número después de cada escritura y obliga a releer. Es la forma
  // barata de que la lista y la ficha no se queden con lo de antes.
  const [refresco, setRefresco] = useState(0);

  // Los datos de la ficha se editan sobre una copia y se guardan al pulsar: si
  // se escribieran directamente, cada tecla sería una escritura en disco y un
  // borrado accidental del nombre se guardaría solo.
  const [datos, setDatos] = useState({ nombre: "", email: "", telefono: "", nif: "", direccion: "" });
  const [nota, setNota] = useState("");
  const [aviso, setAviso] = useState("");
  // Borrar una ficha se pregunta antes, y la pregunta sale dentro de la propia
  // tarjeta: dice qué se pierde y el botón de confirmar no cae donde estaba el
  // que se acaba de pulsar, que es lo único que protege del doble clic.
  const [borrando, setBorrando] = useState(false);
  // En móvil la ficha sale debajo de la lista: al elegir a alguien hay que
  // llevar la vista hasta ella o parece que no ha pasado nada.
  const alDetalle = useLlevaAlDetalle(clienteAbierto);

  useEffect(() => {
    let vivo = true;
    repoClientes.buscar(busca).then((r) => {
      if (!vivo) return;
      setLista(r);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [busca, refresco]);

  /* Leer el disco de este equipo es leer un sistema externo, que es para lo que
     está el efecto; la regla que se apaga es la misma que en `app-context`. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let vivo = true;
    if (!clienteAbierto) {
      setFicha(null);
      setSesiones([]);
      return;
    }
    Promise.all([repoClientes.obtener(clienteAbierto), repoCitas.listar()]).then(([c, todas]) => {
      if (!vivo) return;
      setFicha(c);
      setSesiones(todas.filter((x) => x.personaId === clienteAbierto).reverse());
      setDatos({
        nombre: c?.nombre ?? "",
        email: c?.email ?? "",
        telefono: c?.telefono ?? "",
        nif: c?.nif ?? "",
        direccion: c?.direccion ?? "",
      });
      setNota("");
      setAviso("");
      // Si se estaba preguntando si borrar y se cambia de persona, la pregunta
      // se cae: si no, quedaría abierta sobre una ficha que no es la de antes.
      setBorrando(false);
    });
    return () => {
      vivo = false;
    };
  }, [clienteAbierto, refresco]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Los estudios que ya se le han hecho a esta persona. Ver la nota de arriba
   *  sobre por qué se cruzan por el nombre. */
  const estudios = useMemo(() => {
    if (!ficha) return [];
    const buscado = sinTildes(ficha.nombre);
    if (buscado.length < 3) return [];
    return hist.filter((h) => sinTildes(h.nombre).includes(buscado) || buscado.includes(sinTildes(h.nombre)));
  }, [ficha, hist]);

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
    await Promise.all(sesiones.map((c) => repoCitas.borrar(c.id)));
    await repoClientes.borrar(ficha.id);
    setBorrando(false);
    setClienteAbierto(null);
    setRefresco((n) => n + 1);
  };

  const entrada = "width:100%;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);")}>
      <Cabecera
        titulo="Clientes"
        pie="Quién es cada persona, qué le has hecho ya y lo que apuntaste la última vez que la viste."
      />

      <div data-dos="">
        {/* ------------------------------------------------------- la lista */}
        <section data-anclado="" style={css(TARJETA + PAD + "position:sticky;top:79px;max-height:calc(100vh - 100px);overflow-y:auto;min-width:0;")}>
          <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>
            {cargando ? "Buscando…" : lista.length === 1 ? "1 persona" : `${lista.length} personas`}
          </div>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nombre"
            aria-label="Buscar por nombre"
            style={css(entrada + "margin-bottom:var(--s3);")}
          />

          {!cargando && lista.length === 0 && (
            <Vacio>
              {busca
                ? "Aquí no hay nadie con ese nombre. Pruébalo con menos letras."
                : "Todavía no tienes a nadie fichado. En cuanto apuntes una sesión en la agenda, la persona aparece aquí sola."}
            </Vacio>
          )}

          <div style={css("display:flex;flex-direction:column;")}>
            {lista.map((c, i) => {
              const on = c.id === clienteAbierto;
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
                  <span style={css(NOTA + "display:block;margin-top:2px;")}>{c.email || ORIGENES[c.origen] || "Apuntada a mano"}</span>
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
        {!ficha ? (
          <section style={css(TARJETA + PAD)}>
            <h2 style={css(TITULO + "margin:0 0 var(--s3);")}>Elige a alguien de la lista</h2>
            <Vacio>
              Se abre su ficha aquí: sus datos, los estudios que le has hecho, sus sesiones y las notas que hayas escrito.
            </Vacio>
            <AvisoNavegador que="Las fichas de tus clientes" />
          </section>
        ) : (
          <div ref={alDetalle} data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;scroll-margin-top:79px;")}>
            {/* --------------------------------------------------- sus datos */}
            <section style={css(TARJETA + PAD)}>
              <h2 style={css(TITULO + "margin:0;overflow-wrap:anywhere;")}>{enTitulo(ficha.nombre)}</h2>
              <p style={css(NOTA + "margin:5px 0 var(--s5);")}>
                {ORIGENES[ficha.origen] || "Apuntada a mano"} · desde el {diaLargo(new Date(ficha.creada))}
              </p>

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

              <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;margin-top:var(--s4);")}>
                <button onClick={() => void guardarDatos()} style={css(BOTON_NORMAL)}>
                  Guardar los datos
                </button>
                {!borrando && (
                  <button onClick={() => setBorrando(true)} style={css(BOTON_PLANO + "margin-left:auto;color:var(--red);")}>
                    Borrar la ficha
                  </button>
                )}
              </div>

              {borrando && (
                <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>
                  <div style={css(rotulo("var(--red)") + "margin-bottom:var(--s2);")}>Vas a borrar esta ficha</div>
                  {/* La pregunta dice qué se pierde y cuánto. «¿Estás seguro?»
                      no aporta ningún dato nuevo para decidir. */}
                  <p style={css(APOYO + "margin:0 0 var(--s3);max-width:56ch;")}>
                    Se va {ficha.nombre}, {cuantas(ficha.notas.length, "ninguna nota", "la nota que le escribiste", "notas que le has escrito")} y{" "}
                    {cuantas(sesiones.length, "ninguna sesión de la agenda", "la sesión que tiene en la agenda", "sesiones que tiene en la agenda")}. Las
                    facturas que le hayas hecho se quedan: una factura emitida no se borra nunca. Esto no se puede deshacer.
                  </p>
                  {/* El «Sí» no cae donde estaba el botón que se acaba de
                      pulsar: si apareciera bajo el dedo, preguntar no serviría
                      de nada contra el doble clic. */}
                  <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;")}>
                    <button onClick={() => setBorrando(false)} autoFocus style={css(BOTON_NORMAL)}>
                      Dejarlo como está
                    </button>
                    <button onClick={() => void borrarFicha()} style={css(BOTON_PLANO + "color:var(--red);")}>
                      Sí, borrar la ficha
                    </button>
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

            {/* ------------------------------------------------ sus estudios */}
            <section style={css(TARJETA + PAD)}>
              <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>Sus estudios</div>
              {estudios.length === 0 ? (
                <Vacio>Todavía no le has hecho ninguno. Se hace desde «Consulta», con su nombre y su fecha de nacimiento.</Vacio>
              ) : (
                estudios.map((h, i) => (
                  <div key={h.id} style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s3) 0;" + (i ? RAYA : ""))}>
                    <span style={css("flex:1 1 auto;min-width:0;font-size:var(--t-read);color:var(--text);overflow-wrap:anywhere;")}>
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
            </section>

            {/* ------------------------------------------------ sus sesiones */}
            <section style={css(TARJETA + PAD)}>
              <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>Sus sesiones</div>
              {sesiones.length === 0 ? (
                <Vacio>No tiene ninguna apuntada. Se apuntan desde «Agenda».</Vacio>
              ) : (
                sesiones.map((c, i) => (
                  <div key={c.id} style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s3) 0;" + (i ? RAYA : ""))}>
                    <span style={css("flex:1 1 auto;min-width:0;font-size:var(--t-body);color:var(--text-2);")}>
                      {diaLargo(new Date(c.inicioISO))} a las {hora(c.inicioISO)}
                      <span style={css(NOTA + "display:block;margin-top:2px;")}>
                        {etiquetaTipo(c.tipo)} · {duracion(c.minutos)}
                        {c.notas ? ` · ${c.notas}` : ""}
                      </span>
                    </span>
                    <Estado texto={etiquetaEstado(c.estado)} color={c.estado === "hecha" ? "var(--green)" : c.estado === "anulada" ? "var(--red)" : "var(--text-3)"} />
                  </div>
                ))
              )}
            </section>

            {/* --------------------------------------------------- sus notas */}
            <section style={css(TARJETA + PAD)}>
              <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>Tus notas sobre ella</div>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={3}
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
                        <button
                          onClick={() => void borrarNota(n.id)}
                          title="Borrar esta nota"
                          style={css("margin-left:auto;background:none;border:none;padding:0;cursor:pointer;font-size:var(--t-mini);color:var(--text-4);")}
                        >
                          Borrar
                        </button>
                      </div>
                      <p style={css(LECTURA + "margin:6px 0 0;white-space:pre-wrap;")}>{n.texto}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <AvisoNavegador que="Las fichas y las notas" />
          </div>
        )}
      </div>
    </main>
  );
}
