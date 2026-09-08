"use client";

/**
 * ============================================================================
 * CÓMO SE GUARDA EL PDF EN EL IPAD
 * ============================================================================
 *
 * POR QUÉ EXISTE ESTA PANTALLA, Y POR QUÉ NO ES UN ARREGLO DE CÓDIGO.
 *
 * Iris grabó un vídeo pulsando «Exportar» en su iPad, en Safari, cuatro veces.
 * No pasó nada. Ni diálogo, ni error, ni nada. Y el código estaba bien: la
 * llamada a `window.print()` salía dentro del propio toque, sin aplazarse, que
 * era el fallo anterior. Safari la aceptó y no hizo nada.
 *
 * Eso es Safari del iPad. No abre diálogo de impresión: el único camino para
 * sacar un PDF de una página es el botón de Compartir del sistema. No hay
 * código que lo cambie — se puede pedir mil veces y va a seguir sin pasar nada.
 *
 * Así que lo que había que arreglar no era la impresión, era el botón. Antes,
 * en el iPad, «Exportar» era un botón que no hacía nada y debajo había tres
 * renglones de letra gris de once píxeles, uno de ellos explicando la ruta
 * buena. En el vídeo se ven esos tres renglones y no se lee ninguno. Un camino
 * que existe pero no se lee es un camino que no existe.
 *
 * Ahora, en un aparato de Apple, pulsar «Exportar» abre esto: tres pasos, en
 * grande, con el icono de Compartir dibujado igual que el de la barra de
 * Safari. El PDF que sale por ahí es exactamente el mismo — lo maqueta la
 * misma hoja de impresión.
 */

import { css } from "@/lib/css";
import { PAD, TITULO, APOYO, BOTON_NORMAL } from "@/lib/ui";

/**
 * La tarjeta, escrita entera y no como `TARJETA` con un `border-color` detrás.
 *
 * Es la advertencia que está escrita en `ui.ts` junto a `TARJETA_ELEGIDA`:
 * React se queja cuando una propiedad abreviada (`border`) y una de sus partes
 * (`border-color`) cambian a la vez entre dos pintadas, y en algún repintado se
 * queda la que no toca. El canto dorado es lo que distingue esta tarjeta de las
 * demás de la pantalla, así que no puede quedarse a medias.
 */
const TARJETA_GUIA =
  "background:var(--surface);border:1px solid var(--gold);border-radius:var(--r-tarjeta);box-shadow:var(--nm-alto);";

/** El icono de Compartir de iOS: el cuadro con la flecha saliendo por arriba. */
function IconoCompartir({ tam = 20 }: { tam?: number }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5" />
    </svg>
  );
}

/** El icono de imprimir, para que el paso 2 se reconozca de un vistazo. */
function IconoImprimir({ tam = 20 }: { tam?: number }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
    </svg>
  );
}

/** La carpeta de Archivos, del paso 3. */
function IconoArchivos({ tam = 20 }: { tam?: number }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

const PASOS: { icono: React.ReactNode; texto: React.ReactNode }[] = [
  {
    icono: <IconoCompartir />,
    texto: (
      <>
        Toca <b>Compartir</b> en la barra de Safari, arriba a la derecha. Es este mismo icono.
      </>
    ),
  },
  {
    icono: <IconoImprimir />,
    texto: (
      <>
        Baja por la lista y elige <b>Imprimir</b>. Sale la vista previa del documento entero.
      </>
    ),
  },
  {
    icono: <IconoArchivos />,
    texto: (
      <>
        En esa vista previa, toca otra vez <b>Compartir</b> y elige <b>Guardar en Archivos</b>. Ahí tienes el PDF, listo
        para mandárselo a la persona.
      </>
    ),
  },
];

export default function GuiaApple({ alCerrar }: { alCerrar: () => void }) {
  return (
    <section
      /* `role="dialog"` no: no atrapa el foco ni tapa la pantalla, y decir que
         es un diálogo cuando no lo es confunde a quien navega a ciegas. Es una
         explicación que aparece, y `status` es exactamente eso. */
      role="status"
      style={css(
        TARJETA_GUIA + PAD + "flex-basis:100%;display:flex;flex-direction:column;gap:var(--s3);margin-top:var(--s3);"
      )}
    >
      <h3 style={css(TITULO + "margin:0;")}>Cómo guardar el PDF en el iPad</h3>
      <p style={css(APOYO + "margin:0;")}>
        Safari en el iPad no abre el diálogo de impresión: no es cosa de la plataforma y no se puede hacer desde aquí.
        Éste es el camino, y el PDF sale exactamente igual de maquetado.
      </p>

      <ol style={css("margin:var(--s2) 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--s3);")}>
        {PASOS.map((p, i) => (
          <li key={i} style={css("display:flex;align-items:flex-start;gap:var(--s3);")}>
            {/* El número y el icono juntos: el número dice el orden, el icono
                dice qué buscar con el ojo en la pantalla del iPad. */}
            <span
              style={css(
                "flex:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:56px;height:34px;border-radius:999px;background:var(--gold-soft);color:var(--gold);font-size:var(--t-body);font-weight:640;"
              )}
            >
              {i + 1}
              {p.icono}
            </span>
            <span style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-2);padding-top:6px;")}>
              {p.texto}
            </span>
          </li>
        ))}
      </ol>

      <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;margin-top:var(--s2);")}>
        <button onClick={alCerrar} style={css(BOTON_NORMAL)}>
          Entendido
        </button>
      </div>
    </section>
  );
}
