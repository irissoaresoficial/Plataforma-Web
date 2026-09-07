"use client";

/**
 * LA FICHA DE UNA PERSONA
 *
 * Es lo que se abre al pulsar una tarjeta del tablero, y contesta las mismas
 * tres preguntas en el mismo orden que antes, porque ése era el acierto de la
 * pantalla anterior y no se toca:
 *
 *     QUIÉN ES   · el nombre, y cómo se le llega: su teléfono y su correo como
 *                  algo que se pulsa, no como casillas que rellenar.
 *     CÓMO VA    · cuándo vuelve, cuántas veces ha venido, cuándo fue la última
 *                  y qué queda colgando. En frases, no en fechas.
 *     QUÉ HAGO   · apuntarle una sesión, hacerle el estudio, hacerle una
 *                  factura. Y la nota, que es a lo que más se entra.
 *
 * Los datos de facturar siguen plegados detrás de «Corregir sus datos», que es
 * lo que son —una corrección, no lo que se viene a mirar—, y borrar la ficha
 * sigue viviendo ahí dentro y no arriba en rojo al lado del nombre.
 *
 * QUÉ HA CAMBIADO: vive dentro de una hoja que se abre por el lado, no en media
 * pantalla. Por eso ya no hay tres tarjetas —la hoja ES la tarjeta— y lo que
 * separa los bloques es una línea, que es lo que separa dentro de una tarjeta.
 *
 * LOS ESTUDIOS SE CRUZAN POR EL NOMBRE, y sigue siendo una atadura con cuerda:
 * el historial de estudios se guarda con un identificador hecho del nombre y la
 * fecha, y no sabe nada de esta ficha. Con base de datos, la ficha guardará el
 * identificador del estudio. Mientras tanto, cruzar por nombre acierta en el
 * caso que importa —Iris estudia a quien atiende— y cuando falla, falla por
 * defecto: no enseña un estudio que no es.
 *
 * No toca `localStorage`: escribe por los repositorios de `lib/despacho`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, BOTON_NORMAL, BOTON_PLANO, LECTURA, NOTA, RAYA, botonPrincipal, rotulo } from "@/lib/ui";
import { titulo as enTitulo } from "@/lib/format";
import Confirmar from "../Confirmar";
import { Estado, Vacio } from "./Piezas";
import {
  citas as repoCitas,
  clientes as repoClientes,
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
  sinTildes,
  totales,
  DIAS_FRIO,
  type Cita,
  type Cliente,
  type Factura,
  type Relacion,
} from "@/lib/despacho";

/** «ninguna nota», «la nota que le escribiste», «las 3 notas que le has
 *  escrito». Contar bien importa aquí: es exactamente lo que se pierde. */
function cuantas(n: number, cero: string, una: string, varias: string): string {
  if (n === 0) return cero;
  if (n === 1) return una;
  return `las ${n} ${varias}`;
}

/** Cuántas sesiones pasadas se enseñan antes de plegar el resto. Con seis ya se
 *  ve el ritmo de la relación; con veinte, la ficha deja de leerse. */
const SESIONES_A_LA_VISTA = 6;

export default function FichaCliente({
  ficha,
  relacion,
  todasCitas,
  todasFacturas,
  alCambiar,
  alBorrar,
}: {
  ficha: Cliente;
  relacion: Relacion;
  todasCitas: Cita[];
  todasFacturas: Factura[];
  /** Algo se ha escrito: la pantalla de detrás tiene que releer. */
  alCambiar: () => void;
  /** La ficha ya no existe: hay que cerrar la hoja. */
  alBorrar: () => void;
}) {
  const { hist, abrir, set, setView, focoFicha, setFocoFicha, setFacturaAbierta, setRecado, setClienteAbierto } = useApp();

  // Los datos de facturar se editan sobre una copia y se guardan al pulsar: si
  // se escribieran directamente, cada tecla sería una escritura en disco y un
  // borrado accidental del nombre se guardaría solo.
  const [datos, setDatos] = useState({
    nombre: ficha.nombre,
    email: ficha.email ?? "",
    telefono: ficha.telefono ?? "",
    nif: ficha.nif ?? "",
    direccion: ficha.direccion ?? "",
  });
  // El formulario empieza plegado a propósito: es lo que menos se toca y lo que
  // más sitio ocupaba. Se despliega solo cuando la persona no tiene nombre de
  // verdad todavía —la acaban de crear— porque entonces sí hay algo que escribir.
  const [corrigiendo, setCorrigiendo] = useState(ficha.nombre === "Sin nombre");
  const [nota, setNota] = useState("");
  const [aviso, setAviso] = useState("");
  const [verTodas, setVerTodas] = useState(false);
  const cajaNota = useRef<HTMLTextAreaElement>(null);

  /*
   * EL AVISO QUE PIDE ESCRIBIR LA NOTA DEJA EL CURSOR DENTRO.
   *
   * Si sólo abriera la ficha, el aviso habría hecho la mitad del trabajo:
   * llevarla hasta aquí y dejarle a ella buscar dónde se escribe. El foco se
   * consume una vez y se apaga; si se quedara puesto, cada vez que volviera a
   * esta pantalla la hoja saltaría sola hasta el hueco de la nota.
   */
  useEffect(() => {
    if (focoFicha !== "nota") return;
    cajaNota.current?.focus();
    setFocoFicha(null);
  }, [focoFicha, setFocoFicha]);

  const suyas = useMemo(() => {
    const ahora = new Date().toISOString();
    const todas = todasCitas.filter((c) => c.personaId === ficha.id).sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));
    return {
      futuras: todas.filter((c) => c.inicioISO > ahora && c.estado !== "anulada"),
      // Las pasadas, la más reciente arriba: lo último que pasó es lo primero
      // que se quiere leer.
      pasadas: todas.filter((c) => c.inicioISO <= ahora || c.estado === "anulada").reverse(),
    };
  }, [ficha.id, todasCitas]);

  const susFacturas = useMemo(() => todasFacturas.filter((f) => f.clienteId === ficha.id), [ficha.id, todasFacturas]);

  /** Los estudios que ya se le han hecho. Ver la nota de arriba sobre por qué
   *  se cruzan por el nombre. */
  const estudios = useMemo(() => {
    const buscado = sinTildes(ficha.nombre);
    if (buscado.length < 3) return [];
    return hist.filter((h) => sinTildes(h.nombre).includes(buscado) || buscado.includes(sinTildes(h.nombre)));
  }, [ficha.nombre, hist]);

  /* ------------------------------------------------------------- escrituras */

  const guardarDatos = async () => {
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
    alCambiar();
  };

  const guardarNota = async () => {
    if (!nota.trim()) return setAviso("Escribe la nota antes de guardarla.");
    await repoClientes.guardar({
      ...ficha,
      // La nueva va delante: lo último que escribió es lo primero que quiere
      // leer cuando vuelve a abrir la ficha.
      notas: [{ id: nuevoId(), fecha: new Date().toISOString(), texto: nota.trim() }, ...ficha.notas],
    });
    setNota("");
    setAviso("Nota guardada.");
    alCambiar();
  };

  const borrarNota = async (id: string) => {
    await repoClientes.guardar({ ...ficha, notas: ficha.notas.filter((n) => n.id !== id) });
    alCambiar();
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
    const sesiones = todasCitas.filter((c) => c.personaId === ficha.id);
    await Promise.all(sesiones.map((c) => repoCitas.borrar(c.id)));
    await repoClientes.borrar(ficha.id);
    setClienteAbierto(null);
    alBorrar();
  };

  /* --------------------------------------------- las salidas hacia lo suyo */

  const apuntarleSesion = () => {
    setRecado(ficha.nombre);
    setView("agenda");
  };

  const hacerleFactura = () => {
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
   * persona. Va entero en el primer campo y que ella lo coloque.
   */
  const hacerleElEstudio = () => {
    set("tipo", "persona");
    set("nombre", ficha.nombre);
    set("ap1", "");
    set("ap2", "");
    setView("inicio");
  };

  const entrada = "width:100%;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

  /** Una línea de aviso: raya de color al canto, sin fondo. El color marca, no
   *  rellena — es la misma regla del consentimiento. */
  const linea = (color: string, texto: string) => (
    <p style={css(APOYO + `margin:var(--s2) 0 0;padding-left:var(--s3);border-left:2px solid ${color};line-height:1.5;`)}>
      {texto}
    </p>
  );

  /** Un bloque de la ficha. Lo que separa dentro de una tarjeta es una línea. */
  const bloque = (titulo: string, hijos: React.ReactNode, primero = false) => (
    <div style={css(primero ? "" : RAYA + "margin-top:var(--s5);padding-top:var(--s5);")}>
      <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>{titulo}</div>
      {hijos}
    </div>
  );

  return (
    <div style={css("min-width:0;")}>
      {/* ======================================================== CÓMO SE LE LLEGA */}
      {/* El teléfono y el correo salen como algo que se pulsa —en el móvil marca,
          en el ordenador abre el correo— y no como dos casillas de un formulario.
          Es la diferencia entre un dato guardado y un dato que sirve. */}
      {(ficha.telefono || ficha.email) && (
        <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2) var(--s5);margin-bottom:var(--s5);")}>
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

      {/* ================================================================ CÓMO VA */}
      {bloque(
        "Cómo va",
        <>
          {(() => {
            const { viene, hubo } = frasesDeRelacion(relacion);
            return (
              <>
                <p style={css(LECTURA + "margin:0;")}>{viene}</p>
                <p style={css(LECTURA + "margin:2px 0 0;")}>{hubo}</p>
              </>
            );
          })()}

          {/* Lo que cuelga, dicho aquí y no sólo en los avisos: quien abre la
              ficha antes de una sesión tiene que verlo sin abrir la campana. */}
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
          {relacion.diasSinVerse !== null &&
            relacion.diasSinVerse >= DIAS_FRIO &&
            !relacion.proxima &&
            linea("var(--border-strong)", "Hace mucho que no la ves y no hay nada apuntado. Una llamada corta suele bastar.")}
        </>,
        true
      )}

      {/* ========================================================= QUÉ HAGO AHORA */}
      <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);display:flex;gap:var(--s2);flex-wrap:wrap;")}>
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

      {/* ------------------------------------------- sus datos, cuando se piden */}
      {corrigiendo && (
        <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:var(--s3);")}>
            {/* El NIF y el domicilio están aquí y no en la factura porque son de
                la persona: se escriben una vez y cada factura se queda su copia.
                Pueden estar vacíos. */}
            {([
              ["Nombre", "nombre", "Nombre y apellidos", false],
              ["Correo", "email", "Sin correo", false],
              ["Teléfono", "telefono", "Sin teléfono", false],
              ["NIF (para facturarle)", "nif", "Sin NIF", false],
              /* El domicilio ocupa la fila entera: es el dato más largo de los
                 cinco y en una casilla de la rejilla se leía a trozos. */
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
            {/* Borrar la ficha vive aquí abajo, dentro de lo que se despliega, y
                no arriba en rojo al lado del nombre: se hace una vez en la vida y
                estaba compitiendo con lo que se hace todos los días. */}
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
              confirmar="Sí, borrarla"
              alConfirmar={() => void borrarFicha()}
            >
              Borrar la ficha
            </Confirmar>
          </div>
        </div>
      )}

      {/* El consentimiento no se supone. Si esta persona la apuntó Iris a mano,
          nadie ha aceptado ningún texto y hay que decirlo: es lo que separa una
          ficha de un fichero de datos sin base legal. */}
      {!ficha.consentimiento && (
        <p style={css(NOTA + "margin:var(--s4) 0 0;padding-left:var(--s3);border-left:2px solid var(--red-border);line-height:1.5;")}>
          No consta que haya aceptado nada. La apuntaste tú, así que no hay ningún texto de privacidad firmado por ella. Pídeselo
          antes de meterla en un envío.
        </p>
      )}

      {/* ================================================ LO QUE APUNTAS DE ELLA */}
      {bloque(
        "Lo que apuntas de ella",
        <>
          <textarea
            ref={cajaNota}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={3}
            aria-label="Escribe una nota sobre esta persona"
            placeholder="Lo que quieras recordar de la última sesión."
            style={css(entrada + "resize:vertical;line-height:1.55;font-size:var(--t-read);")}
          />
          {/* La única mancha de granate de la hoja: guardar la nota es lo que
              Iris viene a hacer aquí después de una sesión. */}
          <button onClick={() => void guardarNota()} style={css(botonPrincipal() + "margin-top:var(--s3);")}>
            Guardar la nota
          </button>

          {aviso && (
            <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-2);")}>
              {aviso}
            </p>
          )}

          {ficha.notas.length === 0 ? (
            <p style={css(NOTA + "margin:var(--s4) 0 0;")}>
              Todavía no hay ninguna. La primera que escribas se queda aquí con su fecha.
            </p>
          ) : (
            <div style={css("margin-top:var(--s5);")}>
              {ficha.notas.map((n) => (
                <div key={n.id} style={css("padding:var(--s4) 0;" + RAYA)}>
                  <div style={css("display:flex;align-items:baseline;gap:var(--s3);")}>
                    <span style={css(rotulo())}>{diaLargo(new Date(n.fecha))}</span>
                    {/* Una nota es lo único que no se puede reconstruir: no hay
                        copia en ningún sitio y el recuerdo ya no está. */}
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
        </>
      )}

      {/* ============================================================ SU HISTORIA */}
      {bloque(
        "Su historia",
        <>
          {suyas.futuras.length === 0 && suyas.pasadas.length === 0 ? (
            <Vacio>No tiene ninguna sesión apuntada. Se apuntan desde «Agenda», o con el botón de aquí arriba.</Vacio>
          ) : (
            <>
              {suyas.futuras.length > 0 && (
                <>
                  <div style={css(rotulo() + "margin-bottom:var(--s1);")}>Lo que viene</div>
                  {suyas.futuras.map((c, i) => (
                    <FilaSesion key={c.id} c={c} i={i} />
                  ))}
                </>
              )}
              {suyas.pasadas.length > 0 && (
                <div style={css(suyas.futuras.length ? RAYA + "margin-top:var(--s4);padding-top:var(--s4);" : "")}>
                  <div style={css(rotulo() + "margin-bottom:var(--s1);")}>Lo que ya fue</div>
                  {(verTodas ? suyas.pasadas : suyas.pasadas.slice(0, SESIONES_A_LA_VISTA)).map((c, i) => (
                    <FilaSesion key={c.id} c={c} i={i} />
                  ))}
                  {!verTodas && suyas.pasadas.length > SESIONES_A_LA_VISTA && (
                    <button onClick={() => setVerTodas(true)} style={css(BOTON_PLANO + "margin-top:var(--s3);")}>
                      Ver las {suyas.pasadas.length - SESIONES_A_LA_VISTA} anteriores
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ---------------------------------------------------------- sus estudios */}
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

      {/* ---------------------------------------------------------- sus facturas */}
      <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);")}>
        <div style={css(rotulo() + "margin-bottom:var(--s2);")}>Sus facturas</div>
        {susFacturas.length === 0 ? (
          <Vacio>No le has hecho ninguna. Se hace con el botón «Hacerle una factura» de aquí arriba.</Vacio>
        ) : (
          susFacturas.map((f, i) => (
            <div key={f.id} style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s3) 0;" + (i ? RAYA : ""))}>
              {/* El número o «Sin número», que es lo que `numeroDe` devuelve
                  mientras es un borrador. Repetir aquí la palabra «Borrador»
                  sería decir dos veces lo mismo: para eso ya está la pastilla. */}
              <span style={css("flex:1 1 auto;min-width:0;font-size:var(--t-body);color:var(--text-2);")}>
                {numeroDe(f)}
                <span data-cifras="" style={css(NOTA + "display:block;margin-top:2px;")}>
                  {euros(totales(f).total)}
                </span>
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
    </div>
  );
}

/** Una sesión, como se lee: el día y la hora delante, y a la derecha en qué
 *  estado quedó. Sale en los dos bloques —lo que viene y lo que ya fue— y
 *  tienen que verse iguales. */
function FilaSesion({ c, i }: { c: Cita; i: number }) {
  return (
    <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s3) 0;" + (i ? RAYA : ""))}>
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
