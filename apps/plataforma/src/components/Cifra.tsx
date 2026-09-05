"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";

/**
 * Un número del estudio, editable en el sitio.
 *
 * El motor calcula, pero manda Iris: si en una carta concreta el número tiene
 * que ser otro —una fecha dudosa, un nombre de registro que no coincide, una
 * lectura que ella hace distinto— lo corrige aquí y queda guardado con el
 * estudio. El valor calculado no se pierde: se puede volver a él de un clic.
 *
 * Se apoya en el mismo almacén que los textos editables del documento, así que
 * la corrección viaja al PDF sin hacer nada más.
 */
export default function Cifra({
  id,
  valor,
  tam = 30,
  color = "var(--text)",
}: {
  /** Identificador estable del número dentro del estudio, p. ej. "n.corazon". */
  id: string;
  valor: number | string;
  tam?: number;
  color?: string;
}) {
  const { txt, guardaEdit } = useApp();
  const guardado = txt("cifra." + id, String(valor));
  const tocado = guardado !== String(valor);

  // El borrador sólo existe mientras se edita: se siembra al abrir y se tira
  // al cerrar, así no hay que sincronizarlo con el valor guardado.
  const [borrador, setBorrador] = useState<string | null>(null);
  const editando = borrador !== null;
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editando) campo.current?.select();
  }, [editando]);

  const confirma = () => {
    if (borrador === null) return;
    const limpio = borrador.trim();
    setBorrador(null);
    guardaEdit("cifra." + id, limpio === "" ? String(valor) : limpio);
  };

  if (borrador !== null) {
    return (
      <input
        ref={campo}
        value={borrador}
        onChange={(e) => setBorrador(e.target.value)}
        onBlur={confirma}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirma();
          if (e.key === "Escape") setBorrador(null);
        }}
        style={css(
          `width:${Math.max(3, borrador.length + 1)}ch;font-family:var(--font-ui);font-weight:600;font-size:${tam}px;line-height:1.05;color:${color};background:var(--gold-soft);border:1px solid var(--gold);border-radius:var(--r-xs);padding:0 6px;text-align:center;font-variant-numeric:tabular-nums;`
        )}
      />
    );
  }

  return (
    <span style={css("display:inline-flex;align-items:center;gap:6px;")}>
      <motion.button
        onClick={() => setBorrador(guardado)}
        title="Pulsa para corregir este número"
        whileTap={{ scale: 0.96 }}
        style={css(
          `font-family:var(--font-ui);font-weight:600;font-size:${tam}px;line-height:1.05;color:${tocado ? "var(--gold-deep)" : color};background:none;border:none;border-bottom:1.5px dashed ${tocado ? "var(--gold)" : "transparent"};padding:0 1px;cursor:text;font-variant-numeric:tabular-nums;letter-spacing:-.028em;`
        )}
      >
        {guardado}
      </motion.button>
      {tocado && (
        <button
          onClick={() => guardaEdit("cifra." + id, String(valor))}
          title={`Volver al número calculado (${valor})`}
          style={css("background:none;border:none;padding:2px;cursor:pointer;color:var(--text-4);display:inline-flex;line-height:0;")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      )}
    </span>
  );
}
