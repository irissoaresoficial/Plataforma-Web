"use client";

/**
 * LA AGENDA
 *
 * Lo que Iris necesita de esta pantalla son dos cosas y en este orden: ver de
 * un vistazo lo que tiene HOY, y poder apuntar una sesión sin pensar mientras
 * habla por teléfono. Todo lo demás sobra, y por eso no está.
 *
 * No toca `localStorage`: pide las citas y los clientes a los repositorios de
 * `lib/despacho`. El día que eso sea Firebase, este archivo no cambia.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, BOTON_PLANO, NOTA, PAD, RAYA, TARJETA, TITULO, botonPrincipal, rotulo } from "@/lib/ui";
import {
  citas as repoCitas,
  clientes as repoClientes,
  abreDia,
  cierraDia,
  cierraSemana,
  claveDia,
  deClave,
  diaRelativo,
  duracion,
  etiquetaTipo,
  hora,
  instante,
  masDias,
  nuevoId,
  proximaMediaHora,
  sinTildes,
  TIPOS_CITA,
  type Cita,
  type Cliente,
} from "@/lib/despacho";
import { AvisoNavegador, Cabecera, Estado, Vacio } from "../despacho/Piezas";

/** Lo que dura una sesión por defecto. Es lo mismo que reserva la web en el
 *  Apps Script (`DURATION_MIN`), para que las dos mitades no discrepen. */
const DURACION_NORMAL = 90;

const DURACIONES = [30, 45, 60, 90, 120];

/** El color de cada estado. Marca, no rellena: sólo tiñe la letra. */
const COLOR_ESTADO: Record<Cita["estado"], string> = {
  pedida: "var(--gold)",
  confirmada: "var(--text-3)",
  hecha: "var(--green)",
  anulada: "var(--red)",
};

export default function AgendaScreen() {
  const { setView, setClienteAbierto, recado, setRecado } = useApp();

  const [citas, setCitas] = useState<Cita[]>([]);
  const [gente, setGente] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState("");

  // El formulario. La fecha arranca en hoy y la hora en la media hora
  // siguiente: es lo que casi siempre se quiere y ahorra teclear.
  const [nombre, setNombre] = useState("");
  const [dia, setDia] = useState("");
  const [horaTexto, setHoraTexto] = useState("");
  const [minutos, setMinutos] = useState(DURACION_NORMAL);
  const [tipo, setTipo] = useState<Cita["tipo"]>("sesion");
  const [notas, setNotas] = useState("");

  const recargar = useCallback(async () => {
    // Se piden las dos a la vez: la lista de nombres hace falta para poder
    // escribir a quién es cada cita.
    const [c, g] = await Promise.all([repoCitas.listar(), repoClientes.listar()]);
    setCitas(c);
    setGente(g);
    setCargando(false);
  }, []);

  /* El almacenamiento vive en el equipo y el servidor no puede verlo: si se
     leyera en el primer render, el HTML de servidor y el del navegador no
     coincidirían. Se pide al montar, como hace `app-context` con el historial.
     La regla que se apaga es la misma que allí, y por lo mismo: aquí el efecto
     es justamente la forma de leer un sistema externo. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void recargar();
    // La fecha de hoy tampoco puede sembrarse en el estado inicial: el
    // servidor y este equipo pueden estar en días distintos.
    setDia(claveDia(new Date()));
    setHoraTexto(proximaMediaHora());
  }, [recargar]);

  /*
   * SI SE VIENE DE UNA FICHA, EL NOMBRE YA ESTÁ PUESTO.
   *
   * «Apuntarle una sesión» desde la ficha de alguien tiene que llegar aquí con
   * su nombre escrito: si hubiera que volver a teclearlo, el botón sólo habría
   * cambiado de pantalla. Se recoge el recado y se apaga en el acto — dejarlo
   * puesto haría que la siguiente visita a la agenda apareciera con un nombre
   * que nadie ha pedido.
   */
  useEffect(() => {
    if (!recado) return;
    setNombre(recado);
    setRecado(null);
  }, [recado, setRecado]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const nombreDe = useCallback(
    (personaId: string) => gente.find((g) => g.id === personaId)?.nombre ?? "Sin nombre",
    [gente]
  );

  /* Hoy, y lo que queda de semana a partir de mañana. Lo de hoy no se repite
     abajo: si saliera en las dos listas, contarlas daría dos números que no
     cuadran. */
  const { hoy, semana } = useMemo(() => {
    const ahora = new Date();
    const finHoy = cierraDia(ahora).toISOString();
    const desdeManana = abreDia(masDias(ahora, 1)).toISOString();
    const finSemana = cierraSemana(ahora).toISOString();
    const vivas = citas.filter((c) => c.estado !== "anulada");
    return {
      hoy: vivas.filter((c) => c.inicioISO >= abreDia(ahora).toISOString() && c.inicioISO <= finHoy),
      semana: vivas.filter((c) => c.inicioISO >= desdeManana && c.inicioISO <= finSemana),
    };
  }, [citas]);

  /** «Hoy tienes 3 sesiones», que es como se lo diría alguien. */
  const cuenta = (n: number, cero: string) =>
    n === 0 ? cero : n === 1 ? "Hoy tienes 1 sesión" : `Hoy tienes ${n} sesiones`;

  const apuntar = async () => {
    if (!nombre.trim()) return setAviso("Falta con quién es la sesión.");
    if (!dia) return setAviso("Falta el día.");

    // Si el nombre no es de nadie conocido, se le abre ficha en el momento.
    // Es lo que hace que la lista de clientes se llene sola: nadie se sienta a
    // dar de alta a la gente, la da de alta apuntando su sesión.
    const buscado = sinTildes(nombre);
    let persona = gente.find((g) => sinTildes(g.nombre) === buscado);
    const esNueva = !persona;
    if (!persona) {
      persona = await repoClientes.guardar({
        id: nuevoId(),
        nombre: nombre.trim(),
        email: "",
        origen: "a-mano",
        etiquetas: [],
        // Nadie ha firmado nada: se apunta como está, sin inventar un
        // consentimiento que no existe. Ver `lib/despacho/tipos.ts`.
        consentimiento: null,
        notas: [],
        creada: new Date().toISOString(),
        actualizada: new Date().toISOString(),
      });
    }

    const inicioISO = instante(dia, horaTexto);
    await repoCitas.guardar({
      id: nuevoId(),
      personaId: persona.id,
      inicioISO,
      minutos,
      tipo,
      // La apunta Iris a mano, así que ya está confirmada. «Pedida» se reserva
      // para lo que entre por la web sin que ella la haya mirado.
      estado: "confirmada",
      notas: notas.trim() || undefined,
      creada: new Date().toISOString(),
    });

    setAviso(
      `Apuntada: ${persona.nombre}, ${diaRelativo(deClave(dia)).toLocaleLowerCase("es")} a las ${hora(inicioISO)}.` +
        (esNueva ? ` ${persona.nombre} se ha añadido también a tus clientes.` : "")
    );
    setNombre("");
    setNotas("");
    await recargar();
  };

  const marcarHecha = async (c: Cita) => {
    await repoCitas.guardar({ ...c, estado: "hecha" });
    await recargar();
  };

  const quitar = async (c: Cita) => {
    await repoCitas.borrar(c.id);
    setAviso("Sesión quitada de la agenda.");
    await recargar();
  };

  /* Una fila de la agenda: la hora manda, el nombre lleva a su ficha. */
  const fila = (c: Cita, i: number) => (
    <div
      key={c.id}
      style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s3) 0;" + (i ? RAYA : ""))}
    >
      <span data-cifras="" style={css("flex:none;min-width:52px;font-size:var(--t-read);font-weight:600;color:var(--text);letter-spacing:-.01em;")}>
        {hora(c.inicioISO)}
      </span>
      <span style={css("flex:1 1 140px;min-width:0;")}>
        <button
          onClick={() => {
            setClienteAbierto(c.personaId);
            setView("clientes");
          }}
          title="Abrir su ficha"
          style={css("display:block;max-width:100%;text-align:left;background:none;border:none;padding:0;cursor:pointer;font-family:inherit;font-size:var(--t-read);color:var(--text);overflow-wrap:anywhere;")}
        >
          {nombreDe(c.personaId)}
        </button>
        <span style={css(NOTA + "display:block;margin-top:2px;")}>
          {etiquetaTipo(c.tipo)} · {duracion(c.minutos)}
          {c.notas ? ` · ${c.notas}` : ""}
        </span>
      </span>
      <Estado texto={c.estado === "hecha" ? "Hecha" : c.estado === "pedida" ? "Por confirmar" : "Confirmada"} color={COLOR_ESTADO[c.estado]} />
      {c.estado !== "hecha" && (
        <button onClick={() => void marcarHecha(c)} style={css(BOTON_PLANO)}>
          Ya está hecha
        </button>
      )}
      <button
        onClick={() => void quitar(c)}
        title="Quitar de la agenda"
        aria-label={`Quitar la sesión de ${nombreDe(c.personaId)}`}
        style={css("flex:none;width:26px;height:26px;border-radius:50%;border:1px solid var(--border-strong);background:none;color:var(--text-4);cursor:pointer;font-size:var(--t-body);line-height:1;")}
      >
        ×
      </button>
    </div>
  );

  /* Lo que queda de semana, agrupado por día. Una lista corrida de siete días
     no se lee: hay que ver dónde acaba el jueves y empieza el viernes. */
  const porDia = useMemo(() => {
    const grupos = new Map<string, Cita[]>();
    semana.forEach((c) => {
      const k = claveDia(new Date(c.inicioISO));
      grupos.set(k, [...(grupos.get(k) ?? []), c]);
    });
    return [...grupos.entries()];
  }, [semana]);

  const campo = (etiqueta: string, hijo: React.ReactNode) => (
    <label style={css("display:flex;flex-direction:column;gap:5px;min-width:0;")}>
      <span style={css(rotulo() )}>{etiqueta}</span>
      {hijo}
    </label>
  );

  const entrada = "width:100%;min-width:0;padding:11px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-read);";

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);")}>
      <Cabecera
        titulo="Agenda"
        pie="Lo que tienes hoy, lo que queda de semana y un hueco para apuntar una sesión mientras hablas con la persona."
      />

      <div data-cascada="" style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:var(--gap-lg);align-items:start;")}>
        <div style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
          {/* ---------------------------------------------------------- hoy */}
          <section style={css(TARJETA + PAD)}>
            <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s2);")}>{diaRelativo(new Date())}</div>
            <h2 style={css(TITULO + "margin:0 0 var(--s4);")}>
              {cargando ? "Un momento…" : cuenta(hoy.length, "Hoy no tienes ninguna sesión")}
            </h2>
            {!cargando && hoy.length === 0 && (
              <Vacio>Si te llaman para una, apúntala en «Apuntar una sesión» y aparecerá aquí.</Vacio>
            )}
            {hoy.map(fila)}
          </section>

          {/* -------------------------------------------------- esta semana */}
          <section style={css(TARJETA + PAD)}>
            <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s2);")}>Esta semana</div>
            <h2 style={css(TITULO + "margin:0 0 var(--s4);")}>
              {cargando
                ? "Un momento…"
                : semana.length === 0
                  ? "No queda nada más apuntado"
                  : semana.length === 1
                    ? "Te queda 1 sesión más"
                    : `Te quedan ${semana.length} sesiones más`}
            </h2>
            {!cargando && semana.length === 0 && <Vacio>Hasta el domingo tienes la semana libre.</Vacio>}
            {porDia.map(([clave, delDia], gi) => (
              <div key={clave} style={css(gi ? RAYA + "margin-top:var(--s4);padding-top:var(--s4);" : "")}>
                <div style={css(rotulo() + "margin-bottom:var(--s1);")}>{diaRelativo(deClave(clave))}</div>
                {delDia.map(fila)}
              </div>
            ))}
          </section>

          <AvisoNavegador que="Las sesiones apuntadas" />
        </div>

        {/* -------------------------------------------------------- apuntar */}
        <section style={css(TARJETA + PAD + "min-width:0;")}>
          <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s2);")}>Apuntar una sesión</div>
          <p style={css(APOYO + "margin:0 0 var(--s4);")}>
            Con el nombre basta. Si esa persona todavía no está en tus clientes, se le abre ficha sola.
          </p>

          <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
            {campo(
              "¿Con quién?",
              <>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  list="es33-clientes"
                  placeholder="Nombre y apellidos"
                  style={css(entrada)}
                />
                {/* La lista de quien ya está fichado, para no volver a
                 * teclearlo y, sobre todo, para no crear «Maria» al lado de
                 * «María». */}
                <datalist id="es33-clientes">
                  {gente.map((g) => (
                    <option key={g.id} value={g.nombre} />
                  ))}
                </datalist>
              </>
            )}

            <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,130px),1fr));gap:var(--s3);")}>
              {campo("¿Qué día?", <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} style={css(entrada)} />)}
              {campo("¿A qué hora?", <input type="time" value={horaTexto} onChange={(e) => setHoraTexto(e.target.value)} style={css(entrada)} />)}
            </div>

            {campo(
              "¿Cuánto dura?",
              <select value={minutos} onChange={(e) => setMinutos(Number(e.target.value))} style={css(entrada)}>
                {DURACIONES.map((m) => (
                  <option key={m} value={m}>
                    {duracion(m)}
                  </option>
                ))}
              </select>
            )}

            <div style={css("display:flex;flex-direction:column;gap:6px;")}>
              <span style={css(rotulo())}>¿Qué es?</span>
              <div style={css("display:flex;gap:2px;background:color-mix(in srgb, var(--text) 6%, transparent);border-radius:980px;padding:3px;")}>
                {TIPOS_CITA.map((t) => (
                  <button
                    key={t.k}
                    type="button"
                    onClick={() => setTipo(t.k)}
                    style={css(
                      "flex:1;padding:8px 10px;border-radius:980px;border:none;cursor:pointer;font-size:var(--t-body);font-weight:590;white-space:nowrap;transition:all .2s;background:" +
                        (tipo === t.k ? "var(--surface-solid)" : "transparent") +
                        ";box-shadow:" +
                        (tipo === t.k ? "0 2px 6px rgba(0,0,0,.09)" : "none") +
                        ";color:" +
                        (tipo === t.k ? "var(--text)" : "var(--text-3)") +
                        ";"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {campo(
              "Algo que recordar (si hace falta)",
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                placeholder="Viene por su hija · primera vez · por videollamada"
                style={css(entrada + "resize:vertical;line-height:1.5;")}
              />
            )}
          </div>

          {/* La única mancha de granate de la pantalla: lo que se pulsa aquí. */}
          <button onClick={() => void apuntar()} style={css(botonPrincipal() + "width:100%;margin-top:var(--s5);")}>
            Apuntar la sesión
          </button>

          {aviso && (
            <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-2);")}>
              {aviso}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
