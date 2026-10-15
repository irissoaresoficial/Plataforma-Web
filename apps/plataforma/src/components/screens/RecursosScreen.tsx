"use client";

/**
 * ============================================================================
 * RECURSOS — LA BIBLIOTECA
 * ============================================================================
 *
 * Lo que no es una clase pero hace falta tener a mano: plantillas, guías,
 * audios. Lo sube Iris y se lo baja cualquiera que tenga cuenta.
 *
 * LA REGLA QUE DECIDE ESTA PANTALLA: una biblioteca se abandona por desorden,
 * no por falta de cosas. A las treinta fichas, si no se encuentra nada, se deja
 * de abrir y lo que hay dentro vale cero. De ahí lo que tiene y lo que no:
 *
 *   · BUSCADOR DESDE EL PRIMER DÍA, aunque con cuatro archivos no haga falta.
 *     Ponerlo luego significa ponerlo cuando ya se ha abandonado.
 *   · FILTRO POR TIPO. «Quiero la plantilla» y «quiero el audio» son dos
 *     búsquedas distintas y las dos son frecuentes.
 *   · NADA DE CARPETAS ANIDADAS. Una carpeta dentro de otra es un sitio donde
 *     perder cosas. Etiquetas planas y buscador: se encuentra escribiendo, no
 *     navegando.
 *   · EL PESO VA ESCRITO. Quien está en el metro con datos decide distinto si
 *     el audio pesa 4 MB o 120.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, CAMPO, NOTA, TITULO, botonPrincipal } from "@/lib/ui";
import { useSesion } from "@/lib/sesion";
import Muestra from "../escuela/Muestra";

type Tipo = "pdf" | "audio" | "plantilla" | "video";

type Recurso = {
  id: string;
  nombre: string;
  que: string;
  tipo: Tipo;
  peso: string;
  cuando: string;
};

const NOMBRE_TIPO: Record<Tipo, string> = {
  pdf: "PDF",
  audio: "Audio",
  plantilla: "Plantilla",
  video: "Vídeo",
};

/* El tono de cada tipo. En una biblioteca de cien fichas, el color es lo que
   deja barrer la rejilla con la vista buscando «los audios» sin leer una sola
   etiqueta. Con todas del mismo color habría que leerlas todas. */
const TONO_TIPO: Record<Tipo, string> = {
  pdf: "lavanda",
  audio: "rosa",
  plantilla: "lima",
  video: "melocoton",
};

const EJEMPLO: Recurso[] = [
  { id: "1", nombre: "El Espejo y la Máscara", que: "La plantilla en blanco para hacer la cuenta a mano.", tipo: "plantilla", peso: "180 KB", cuando: "3 oct" },
  { id: "2", nombre: "Tabla de valores de las letras", que: "Las 37 letras con su valor, para tener al lado.", tipo: "pdf", peso: "420 KB", cuando: "3 oct" },
  { id: "3", nombre: "Meditación para antes de leer una carta", que: "Doce minutos, con la voz de Iris.", tipo: "audio", peso: "11 MB", cuando: "28 sep" },
  { id: "4", nombre: "El Árbol de la Vida en limpio", que: "Las diez sefirot y los caminos, para imprimir en A3.", tipo: "pdf", peso: "1,2 MB", cuando: "19 sep" },
  { id: "5", nombre: "Cómo se ordenan los ciclos vitales", que: "La guía corta que se dio en el taller.", tipo: "pdf", peso: "640 KB", cuando: "12 sep" },
];

/** Cada tipo dibuja lo que es, no un clip genérico igual para todos. */
function Marca({ tipo }: { tipo: Tipo }) {
  const trazo = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...trazo}>
      {tipo === "audio" && (
        <>
          <path d="M4 10v4M8 7.5v9M12 5v14M16 8.5v7M20 11v2" />
        </>
      )}
      {tipo === "plantilla" && (
        <>
          <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2" />
          <path d="M3.6 9.3h16.8M9.3 9.3v11.1" opacity=".55" />
        </>
      )}
      {tipo === "video" && (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="m10.3 9.8 4.4 2.2-4.4 2.2z" fill="currentColor" stroke="none" />
        </>
      )}
      {tipo === "pdf" && (
        <>
          <path d="M13.4 3.2H7a2 2 0 0 0-2 2v13.6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.8z" />
          <path d="M13.3 3.3v4.3a1.2 1.2 0 0 0 1.2 1.2h4.3" opacity=".6" />
        </>
      )}
    </svg>
  );
}

export default function RecursosScreen() {
  const { esAdmin } = useSesion();
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<Tipo | "todo">("todo");
  const quieto = useReducedMotion();

  const lista = EJEMPLO.filter(
    (r) =>
      (tipo === "todo" || r.tipo === tipo) &&
      (r.nombre + " " + r.que).toLowerCase().includes(busca.trim().toLowerCase())
  );

  const pastilla = (activo: boolean) =>
    "font-size:var(--t-mini);font-weight:590;padding:6px 13px;border-radius:var(--r-pill);cursor:pointer;" +
    "border:1px solid " +
    (activo ? "transparent" : "var(--border)") +
    ";" +
    (activo
      ? "background:var(--gold-soft);color:var(--gold-deep);"
      : "background:transparent;color:var(--text-3);");

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);max-width:1000px;")}>
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h1 style={css(TITULO + "margin:0;")}>Recursos</h1>
        {esAdmin && <button style={css(botonPrincipal() + "margin-left:auto;")}>+ Subir un recurso</button>}
      </div>

      <Muestra falta="Al conectarla, los archivos se guardarán en Firebase y el botón de descargar bajará el de verdad." />

      <div style={css("display:flex;gap:var(--s3);flex-wrap:wrap;align-items:center;")}>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar en la biblioteca"
          aria-label="Buscar en la biblioteca"
          style={css(CAMPO + "flex:1 1 260px;max-width:360px;")}
        />
        <div style={css("display:flex;gap:7px;flex-wrap:wrap;")}>
          <button onClick={() => setTipo("todo")} style={css(pastilla(tipo === "todo"))}>
            Todo
          </button>
          {(Object.keys(NOMBRE_TIPO) as Tipo[]).map((t) => (
            <button key={t} onClick={() => setTipo(t)} style={css(pastilla(tipo === t))}>
              {NOMBRE_TIPO[t]}
            </button>
          ))}
        </div>
      </div>

      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(290px,1fr));")}>
        {lista.map((r, i) => (
          <motion.article
            key={r.id}
            initial={quieto ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(0.04 * i, 0.22), duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                "box-shadow:var(--nm);padding:var(--s4);display:flex;flex-direction:column;gap:9px;"
            )}
          >
            <div style={css("display:flex;align-items:center;gap:10px;")}>
              <span
                aria-hidden
                style={css(
                  "flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:var(--r-sm);" +
                    `background:var(--${TONO_TIPO[r.tipo]});color:var(--${TONO_TIPO[r.tipo]}-tx);`
                )}
              >
                <Marca tipo={r.tipo} />
              </span>
              <span style={css(NOTA)}>
                {NOMBRE_TIPO[r.tipo]} · {r.peso}
              </span>
            </div>

            <h2 style={css("font-size:var(--t-body);font-weight:600;margin:0;line-height:1.3;")}>{r.nombre}</h2>
            <p style={css(NOTA + "margin:0;line-height:1.5;flex:1;")}>{r.que}</p>

            <div style={css("display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px;")}>
              <span style={css(NOTA)}>{r.cuando}</span>
              <button style={css(BOTON_NORMAL)}>Descargar</button>
            </div>
          </motion.article>
        ))}
      </div>

      {lista.length === 0 && (
        <p style={css(NOTA + "margin:0;")}>
          Nada con eso. Prueba con otra palabra, o quita el filtro de tipo.
        </p>
      )}
    </div>
  );
}
