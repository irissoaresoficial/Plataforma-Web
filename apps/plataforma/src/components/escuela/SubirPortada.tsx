"use client";

/**
 * LA PORTADA DEL CURSO: se elige una foto del ordenador o del móvil y se ve
 * aquí mismo antes de guardar. No sale a los alumnos hasta pulsar Guardar,
 * como todo lo del editor.
 *
 * Sin portada sale el hueco diciendo qué falta, no una imagen rota. (Fuera
 * del editor, la tarjeta del curso pone una foto de la casa mientras tanto.)
 */
import { useRef, useState } from "react";
import { css } from "@/lib/css";
import { BOTON_NORMAL, BOTON_PLANO, CAMPO, NOTA } from "@/lib/ui";
import { subePortada } from "@/lib/escuela/portadaSubir";

const esVideo = (u: string) => /\.(mp4|webm|mov)(\?|$)/i.test(u);

export default function SubirPortada({
  cursoId,
  valor,
  alCambiar,
}: {
  cursoId: string;
  valor: string;
  alCambiar: (url: string) => void;
}) {
  const campo = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [rota, setRota] = useState(false);
  const [nueva, setNueva] = useState(false);

  async function elegido(f: File | undefined) {
    if (!f) return;
    setFallo("");
    setSubiendo(true);
    try {
      const url = await subePortada(cursoId, f);
      setRota(false);
      setNueva(true);
      alCambiar(url);
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se ha podido subir la portada.");
    } finally {
      setSubiendo(false);
      if (campo.current) campo.current.value = "";
    }
  }

  const hay = Boolean(valor) && !esVideo(valor) && !rota;

  return (
    <div style={css("display:flex;flex-direction:column;gap:10px;")}>
      <input
        ref={campo}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => void elegido(e.target.files?.[0])}
        style={css("display:none;")}
        aria-hidden
        tabIndex={-1}
      />

      {/* La vista previa, con la misma forma que la tarjeta del curso. */}
      <div
        data-portada-hueco=""
        style={css(
          "position:relative;aspect-ratio:16/9;width:100%;max-width:440px;border-radius:var(--r);overflow:hidden;" +
            (hay
              ? "background:var(--bloque);"
              : "border:1.5px dashed var(--border-strong, var(--border));background:var(--surface-2);") +
            "display:grid;place-items:center;"
        )}
      >
        {hay ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={valor}
            alt="Vista previa de la portada"
            onError={() => setRota(true)}
            style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")}
          />
        ) : (
          <div style={css("text-align:center;padding:16px;display:flex;flex-direction:column;gap:4px;")}>
            <strong style={css("font-weight:500;font-size:var(--t-body);color:var(--text-2);")}>
              {rota ? "Esa imagen no se puede abrir" : "Falta la portada"}
            </strong>
            <span style={css(NOTA)}>Una foto horizontal, JPG o PNG. Mejor de 1600 × 900 o más.</span>
          </div>
        )}
        {subiendo && (
          <div
            style={css(
              "position:absolute;inset:0;display:grid;place-items:center;" +
                "background:color-mix(in srgb, var(--surface) 75%, transparent);backdrop-filter:blur(6px);"
            )}
          >
            <span style={css(NOTA + "color:var(--text-2);")}>Subiendo la portada…</span>
          </div>
        )}
      </div>

      <div style={css("display:flex;gap:9px;align-items:center;flex-wrap:wrap;")}>
        <button type="button" disabled={subiendo} onClick={() => campo.current?.click()} style={css(BOTON_NORMAL)}>
          {hay ? "Cambiar la portada" : "Subir una portada"}
        </button>
        {(hay || rota) && (
          <button
            type="button"
            disabled={subiendo}
            onClick={() => {
              setRota(false);
              setNueva(false);
              alCambiar("");
            }}
            style={css(BOTON_PLANO)}
          >
            Quitar
          </button>
        )}
      </div>

      {nueva && hay && (
        <p style={css(NOTA + "margin:0;")}>Así se verá. Pulsa Guardar para que salga en el curso.</p>
      )}

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);line-height:1.5;")}>
          {fallo}
        </p>
      )}

      <details>
        <summary style={css(NOTA + "cursor:pointer;")}>o pegar la dirección de una imagen</summary>
        <input
          value={valor}
          onChange={(e) => {
            setRota(false);
            alCambiar(e.target.value);
          }}
          disabled={subiendo}
          placeholder="https://…"
          aria-label="Dirección de la imagen de portada"
          style={css(CAMPO + "margin-top:8px;")}
        />
      </details>
    </div>
  );
}
