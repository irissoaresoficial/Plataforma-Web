"use client";

/**
 * ============================================================================
 * LO QUE ENTRÓ POR LA WEB
 * ============================================================================
 *
 * Lo que una persona dejó escrito en un formulario de irissoares.com, y lo que
 * Iris apunta encima: en qué punto está, de dónde salió y qué se dijo.
 *
 * Esto vivía en la pantalla de Leads, que ya no existe: Gerson juntó leads y
 * clientes en una sola lista de personas. Lo que había que conservar no era la
 * pantalla, era esto — porque es lo único que contesta «¿qué pidió exactamente
 * y cuándo?», y eso no está en ninguna otra parte.
 *
 * UNA PERSONA PUEDE TRAER VARIOS. Pidió la prueba gratis en marzo y un curso
 * en junio: son dos formularios, dos documentos y dos cosas verdad. Se enseñan
 * todos, el más reciente arriba, y cada uno con lo suyo. Quedarse sólo con el
 * último escondería justo la historia que hace falta para saber quién es.
 *
 * EL ESTADO Y EL CANAL SE PONEN EN EL ÚLTIMO, no en todos a la vez. El estado
 * es «dónde está esta conversación», y la conversación va por lo último que
 * pidió. Escribir los cuatro documentos de golpe reescribiría el registro de lo
 * que pasó en marzo con lo que se sabe en junio.
 */

import { useState } from "react";
import { css } from "@/lib/css";
import { BOTON_PLANO, NOTA, PAD, RAYA, TARJETA, rotulo } from "@/lib/ui";
import {
  CANALES_LEAD,
  ESTADOS_LEAD,
  anotaLead,
  canalDe,
  mueveLead,
  ponCanal,
  type CanalLead,
  type EstadoLead,
} from "@/lib/despacho/leads";
import { FORMULARIOS, type Persona } from "@/lib/despacho/personas";

const pastilla = (puesta: boolean) =>
  "padding:7px 13px;border-radius:var(--r-pill);font-size:var(--t-mini);font-weight:590;cursor:pointer;" +
  (puesta
    ? "border:1px solid var(--accion);background:var(--accion);color:var(--sobre-accion);"
    : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);");

export default function FichaLead({
  persona,
  alCambiar,
}: {
  persona: Persona;
  alCambiar: () => void;
}) {
  /** El más reciente. Es sobre el que se trabaja. */
  const ultimo = persona.leads[0];
  const [nota, setNota] = useState(ultimo?.nota ?? "");
  const [guardando, setGuardando] = useState(false);
  const [fallo, setFallo] = useState("");

  if (!ultimo) return null;

  async function haz(que: () => Promise<void>) {
    setFallo("");
    try {
      await que();
      alCambiar();
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se ha podido guardar.");
    }
  }

  async function guardaNota() {
    setGuardando(true);
    await haz(() => anotaLead(ultimo.id, nota));
    setGuardando(false);
  }

  const canal = canalDe(ultimo.canal);

  return (
    <div style={css(TARJETA + PAD + "display:flex;flex-direction:column;gap:var(--s4);")}>
      <div style={css(rotulo("var(--gold)"))}>Lo que dejó escrito en la web</div>

      {/* Todo lo que ha pedido, de lo más reciente a lo más antiguo. */}
      <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
        {persona.leads.map((l) => (
          <div key={l.id} style={css("display:flex;flex-direction:column;gap:4px;")}>
            <div style={css("font-size:var(--t-body);font-weight:590;color:var(--text);")}>
              {FORMULARIOS[l.origen] ?? "Dejó su correo"}
              {l.veces > 1 && <span style={css(NOTA + "font-weight:400;")}> · {l.veces} veces</span>}
            </div>
            {l.detalle && <div style={css(NOTA + "line-height:1.5;overflow-wrap:anywhere;")}>{l.detalle}</div>}
            <div style={css(NOTA)}>
              {l.visto ? l.visto.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : ""}
            </div>
          </div>
        ))}
      </div>

      <div style={css("display:flex;flex-direction:column;gap:8px;font-size:var(--t-body);")}>
        <a href={`mailto:${persona.email}`} style={css("color:var(--accion);text-decoration:none;overflow-wrap:anywhere;")}>
          {persona.email}
        </a>
        {ultimo.whatsapp && (
          <a
            href={`https://wa.me/${ultimo.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={css("color:var(--accion);text-decoration:none;")}
          >
            {ultimo.whatsapp} · WhatsApp
          </a>
        )}
      </div>

      <div style={css(RAYA)} />

      <div>
        <div style={css(rotulo() + "margin-bottom:8px;")}>En qué punto está</div>
        <div style={css("display:flex;flex-wrap:wrap;gap:8px;")}>
          {ESTADOS_LEAD.map((e) => (
            <button
              key={e.k}
              onClick={() => void haz(() => mueveLead(ultimo.id, e.k as EstadoLead))}
              title={e.que}
              aria-pressed={ultimo.estado === e.k}
              style={css(pastilla(ultimo.estado === e.k))}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={css(RAYA)} />

      {/*
          DE DÓNDE SALIÓ: LO MISMO QUE ARRIBA, POR DEBAJO.

          Mismas pastillas, mismo granate para la puesta. No es un desplegable:
          se pregunta al teléfono —«¿y tú de qué me conoces?»— y se pulsa
          mientras se habla. Cualquier cosa que pida más de un clic se queda sin
          rellenar.

          Y es distinto del formulario por el que entró: «pidió la prueba
          gratis» no dice si la mandó una clienta o la vio en un anuncio, que es
          lo que decide dónde merece la pena poner el tiempo. Lo primero lo sabe
          la web; lo segundo sólo lo sabe Iris, hablando.
      */}
      <div>
        <div style={css(rotulo() + "margin-bottom:8px;")}>De dónde salió</div>
        <div style={css("display:flex;flex-wrap:wrap;gap:8px;")}>
          {CANALES_LEAD.map((c) => (
            <button
              key={c.k}
              onClick={() => void haz(() => ponCanal(ultimo.id, c.k as CanalLead))}
              aria-pressed={canal === c.k}
              style={css(pastilla(canal === c.k))}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={css(RAYA)} />

      <div>
        <div style={css(rotulo() + "margin-bottom:8px;")}>Lo que apuntas de la conversación</div>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Qué se dijo, qué quedó pendiente…"
          rows={4}
          aria-label="Nota de la conversación"
          style={css("width:100%;padding:11px 13px;font-family:var(--font-ui);font-size:var(--t-body);color:var(--text);resize:vertical;")}
        />
        <button onClick={() => void guardaNota()} disabled={guardando} style={css(BOTON_PLANO + "margin-top:10px;")}>
          {guardando ? "Guardando…" : "Guardar la nota"}
        </button>
        {/* Esta nota es de la conversación de antes de ser clienta. Lo que pasa
            EN las sesiones se apunta en la ficha, con su fecha, y las dos cosas
            no se mezclan a propósito: «quedamos en que me escribía» y «en la
            sesión del 4 salió lo del padre» no se leen igual ni se buscan
            igual.

            Y la frase SÓLO SALE SI HAY FICHA, porque si no manda a mirar más
            abajo donde no hay nada — y entonces lo único que consigue es que
            la persona baje a buscar lo que no existe. */}
        {persona.cliente && (
          <p style={css(NOTA + "margin:8px 0 0;line-height:1.5;max-width:56ch;")}>
            Esto es lo de antes de que fuera clienta. Lo que pasa en las sesiones se apunta más abajo, con su fecha.
          </p>
        )}
      </div>

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);")}>
          {fallo}
        </p>
      )}
    </div>
  );
}
