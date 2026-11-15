"use client";

/**
 * DÓNDE ESTÁ EL TRABAJO, DICHO SIN MENTIR.
 *
 * Antes era una frase fija: «se guardan en este navegador». Con la nube, esa
 * frase pasa a ser falsa, y la contraria —«se guardan en tu cuenta»— sólo es
 * verdad cuando Firestore ha contestado que sí. Por eso se lee del estado de
 * `lib/fengshui/nube.ts` y cambia con él.
 */
import { useSyncExternalStore, type CSSProperties } from "react";
import { escuchaNube, estadoNube } from "@/lib/fengshui/nube";

const enServidor = () => ({ estado: "comprobando" as const, motivo: "" });
let ultimo = estadoNube();
const foto = () => {
  const ahora = estadoNube();
  if (ahora.estado !== ultimo.estado || ahora.motivo !== ultimo.motivo) ultimo = ahora;
  return ultimo;
};

export function useEstadoNubeFs() {
  return useSyncExternalStore(escuchaNube, foto, enServidor);
}

export default function DondeSeGuarda({ style }: { style?: CSSProperties }) {
  const { estado, motivo } = useEstadoNubeFs();
  const texto =
    estado === "sin-nube"
      ? "Los estudios de Feng Shui se guardan en este navegador. Si cambias de ordenador, no estarán allí."
      : estado === "al-dia"
        ? "Los estudios de Feng Shui están guardados en tu cuenta. Los ves desde cualquier ordenador."
        : estado === "subiendo"
          ? "Guardando en tu cuenta…"
          : estado === "comprobando"
            ? "Comprobando lo que hay guardado en tu cuenta…"
            : `No se ha podido guardar en tu cuenta (${motivo}). Lo tienes en este navegador y se vuelve a intentar con el próximo cambio.`;
  return (
    <p data-chrome="1" role="status" style={{ ...style, ...(estado === "fallo" ? { color: "var(--red)" } : null) }}>
      {texto}
    </p>
  );
}
