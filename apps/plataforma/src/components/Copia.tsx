"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";

/**
 * Guardar los estudios en un fichero y volver a traerlos.
 *
 * Va aquí, debajo de la lista de estudios guardados, porque es donde Iris ya
 * está mirando su trabajo y donde ya pone que se queda «en este equipo». Esa
 * frase avisaba de un problema sin darle salida; esto es la salida.
 *
 * Guardar copia baja un fichero. Traer copia funde lo del fichero con lo que
 * haya aquí, sin borrar nada: una copia es por definición más vieja que lo que
 * está vivo, así que no puede mandar sobre ello.
 */
export default function Copia() {
  const { hist, guardaCopia, traeCopia } = useApp();
  const quieto = useReducedMotion();
  const entrada = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState<{ bien: boolean; texto: string } | null>(null);

  const alGuardar = () => {
    if (!hist.length) {
      setAviso({ bien: false, texto: "Todavía no hay ningún estudio que guardar." });
      return;
    }
    const { estudios, nombre } = guardaCopia();
    setAviso({
      bien: true,
      texto: `${estudios === 1 ? "1 estudio guardado" : `${estudios} estudios guardados`} en «${nombre}». Déjalo en un sitio que no sea este ordenador.`,
    });
  };

  const alElegirFichero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichero = e.target.files?.[0];
    // Se vacía siempre: si no, elegir dos veces el mismo fichero no dispara
    // nada la segunda vez y parece que la plataforma no responde.
    e.target.value = "";
    if (!fichero) return;
    const res = traeCopia(await fichero.text());
    setAviso({ bien: res.ok, texto: res.mensaje });
  };

  const boton =
    "flex:1;min-width:132px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border-radius:var(--r-sm);border:1px solid var(--border-strong);background:var(--surface);color:var(--text);font-size:var(--t-body);font-weight:590;cursor:pointer;font-family:inherit;transition:border-color .18s,background .18s;";

  return (
    <div style={css("margin-top:var(--s4);padding-top:var(--s4);border-top:1px solid var(--border);")}>
      <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;")}>
        <button onClick={alGuardar} style={css(boton)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
          Guardar copia
        </button>
        <button onClick={() => entrada.current?.click()} style={css(boton)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          Traer copia
        </button>
        <input ref={entrada} type="file" accept="application/json,.json" onChange={alElegirFichero} style={css("display:none;")} />
      </div>

      <p style={css("font-size:var(--t-mini);line-height:1.5;color:var(--text-4);margin:var(--s3) 0 0;")}>
        Los estudios viven sólo en este navegador. Guarda una copia de vez en cuando y llévatela a otro sitio: si se borran los
        datos del navegador, esa copia es lo único que queda.
      </p>

      <AnimatePresence initial={false}>
        {aviso && (
          <motion.div
            key={aviso.texto}
            initial={quieto ? false : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            style={css(
              "margin-top:var(--s3);padding:10px 13px;border-radius:var(--r-sm);font-size:var(--t-body);line-height:1.5;" +
                (aviso.bien
                  ? "background:var(--gold-soft);color:var(--gold-deep);"
                  : "background:var(--red-soft);color:var(--red);border:1px solid var(--red-border);")
            )}
          >
            {aviso.texto}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
