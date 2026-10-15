"use client";

/**
 * ============================================================================
 * EL BOTÓN DE PONER EL VÍDEO DE UNA LECCIÓN
 * ============================================================================
 *
 * DOS CAMINOS, Y EL DE ARRIBA ES EL BUENO.
 *
 *   · SUBIR EL ARCHIVO — lo normal. Iris elige el vídeo de su ordenador, se
 *     sube a Firebase y la lección queda lista. No hay que entender nada.
 *   · PEGAR UN ENLACE — el de abajo, en pequeño, para la clase que ya está
 *     subida a otro sitio. No se quita: obligar a volver a subir un vídeo que
 *     ya existe en otra parte es hacer trabajar a alguien por gusto.
 *
 * El orden importa tanto como que existan los dos. Lo primero que se ve es lo
 * que se hace, y lo segundo es la salida para el caso raro. Al revés —el campo
 * de pegar grande y el botón de subir debajo— la mitad de las clases acabarían
 * en una cuenta de YouTube que Iris no sabe quién controla.
 *
 * LO QUE PASA MIENTRAS SUBE, que es lo que decide si esto se usa dos veces:
 *
 *   · LA BARRA. Un vídeo de un giga tarda minutos. Sin barra, a los dos
 *     minutos se cierra la pestaña pensando que se ha colgado, y cerrar la
 *     pestaña cancela la subida.
 *   · NO SE PUEDE TOCAR NADA MÁS DE ESA LECCIÓN. Cambiar el enlace a mano a
 *     media subida dejaría la lección apuntando a un sitio y el archivo
 *     yéndose a otro.
 *   · SI FALLA, SE DICE POR QUÉ Y EN CRISTIANO. «storage/unauthorized» no es
 *     un mensaje: es un código. Aquí sale qué ha pasado y qué hacer.
 */

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, CAMPO, NOTA } from "@/lib/ui";
import { subeVideo } from "@/lib/escuela/subir";
import { leeVideo } from "@/lib/escuela/video";

export default function SubirVideo({
  cursoId,
  valor,
  alCambiar,
  etiqueta,
}: {
  cursoId: string;
  /** El enlace que tiene ahora la lección. Vacío si todavía no tiene. */
  valor: string;
  alCambiar: (url: string) => void;
  /** Para el lector de pantalla: de qué lección es este vídeo. */
  etiqueta: string;
}) {
  const campo = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [parte, setParte] = useState(0);
  const [fallo, setFallo] = useState("");
  const quieto = useReducedMotion();

  async function elegido(f: File | undefined) {
    if (!f) return;
    setFallo("");
    setParte(0);
    setSubiendo(true);
    try {
      const url = await subeVideo(cursoId, f, { alVer: setParte });
      alCambiar(url);
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se ha podido subir el vídeo.");
    } finally {
      setSubiendo(false);
      /* Se limpia el campo para que elegir OTRA VEZ EL MISMO archivo vuelva a
         disparar el cambio. Sin esto, quien falla una subida y reintenta con el
         mismo vídeo pulsa y no pasa nada. */
      if (campo.current) campo.current.value = "";
    }
  }

  const puesto = leeVideo(valor);
  const hay = puesto.clase !== "vacio";

  return (
    <div style={css("display:flex;flex-direction:column;gap:9px;")}>
      <input
        ref={campo}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => void elegido(e.target.files?.[0])}
        style={css("display:none;")}
        aria-hidden
        tabIndex={-1}
      />

      {subiendo ? (
        <div style={css("display:flex;flex-direction:column;gap:7px;")}>
          <div style={css("display:flex;justify-content:space-between;gap:12px;")}>
            <span style={css(NOTA)}>Subiendo el vídeo… no cierres esta pestaña.</span>
            <span style={css(NOTA + "font-variant-numeric:tabular-nums;")}>{Math.round(parte * 100)} %</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(parte * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Subiendo el vídeo de ${etiqueta}`}
            style={css("height:5px;border-radius:999px;overflow:hidden;background:color-mix(in srgb, var(--text) 10%, transparent);")}
          >
            <motion.div
              initial={false}
              animate={{ width: `${parte * 100}%` }}
              transition={quieto ? { duration: 0 } : { duration: 0.3, ease: "linear" }}
              style={css("height:100%;background:var(--gold-deep, var(--text));border-radius:999px;")}
            />
          </div>
        </div>
      ) : (
        <div style={css("display:flex;gap:9px;align-items:center;flex-wrap:wrap;")}>
          <button type="button" onClick={() => campo.current?.click()} style={css(BOTON_NORMAL)}>
            {hay ? "Cambiar el vídeo" : "Subir un vídeo"}
          </button>
          {hay && (
            <span style={css(NOTA + "display:inline-flex;align-items:center;gap:6px;")}>
              <span aria-hidden style={css("color:var(--gold-deep, var(--text-2));")}>✓</span>
              {/* Qué hay puesto, sin enseñar una dirección de trescientos
                  caracteres que no le dice nada a nadie. */}
              {puesto.clase === "archivo"
                ? "Vídeo subido"
                : puesto.clase === "marco"
                  ? "Enlace de otra plataforma"
                  : "Enlace sin reconocer"}
            </span>
          )}
        </div>
      )}

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);line-height:1.5;")}>
          {fallo}
        </p>
      )}

      {/* La salida para la clase que ya vive en otro sitio. Pequeña y debajo:
          existe, pero no es el camino. */}
      <details>
        <summary style={css(NOTA + "cursor:pointer;")}>o pegar un enlace de otro sitio</summary>
        <input
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          disabled={subiendo}
          placeholder="https://…"
          aria-label={`Enlace del vídeo de ${etiqueta}`}
          style={css(CAMPO + "margin-top:8px;")}
        />
      </details>
    </div>
  );
}
