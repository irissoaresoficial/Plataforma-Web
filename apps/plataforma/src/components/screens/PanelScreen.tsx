"use client";
import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { titulo } from "@/lib/format";
import { useApp, type Seccion } from "@/lib/app-context";
import SeccionResumen from "../panel/SeccionResumen";
import SeccionArbol from "../panel/SeccionArbol";
import SeccionNumeros from "../panel/SeccionNumeros";
import SeccionEstructura from "../panel/SeccionEstructura";
import SeccionAlma from "../panel/SeccionAlma";
import SeccionCuentas from "../panel/SeccionCuentas";
import SeccionCiclos from "../panel/SeccionCiclos";
import SeccionNumerologia from "../panel/SeccionNumerologia";
import SeccionBase9 from "../panel/SeccionBase9";
import SeccionEmpresa from "../panel/SeccionEmpresa";
import Pendiente from "../panel/Pendiente";
import { DISCIPLINAS } from "../Sidebar";

/* El nombre largo y, debajo, qué se está mirando. En la lateral los nombres
 * van cortos para que la columna quede a plomo, así que el encabezado de la
 * sección es lo que dice dónde estás. */
const SECCIONES: Array<{ k: Seccion; label: string; pie: string }> = [
  { k: "resumen", label: "Resumen", pie: "Todo el estudio de un vistazo" },
  { k: "arbol", label: "Árbol y caminos", pie: "Los tres arcanos que recorres y los que te acompañan" },
  { k: "numeros", label: "Números", pie: "Corazón, esencia y ego, y de dónde sale cada uno" },
  { k: "estructura", label: "Estructura y aprendizajes", pie: "La figura, los diez portales y lo que traes por trabajar" },
  { k: "alma", label: "Imagen del alma", pie: "Los diez planos de consciencia y dónde están los bloqueos" },
  { k: "cuentas", label: "Cuentas abiertas", pie: "El kármico, el lema de vida y lo que viene de atrás" },
  { k: "ciclos", label: "Ciclos vitales", pie: "En qué momento de la rueda está ahora" },
];

export default function PanelScreen() {
  const { r, re, seccion, disciplina, base } = useApp();
  const quieto = useReducedMotion();

  /*
   * AL CAMBIAR DE SECCIÓN, LA VISTA VUELVE ARRIBA.
   *
   * Cambiar de sección era sólo cambiar un estado: la página se quedaba a la
   * altura que estuviera. Estando a 3.000 píxeles dentro de «Estructura» —que
   * mide casi 4.900, cinco pantallas y media— y pulsando «Ciclos vitales», se
   * aparecía a 2.100 dentro de Ciclos: en mitad de un párrafo, con el nombre de
   * la persona, el título de la sección y su explicación fuera de pantalla por
   * arriba.
   *
   * Es la maniobra que más se repite en una consulta, y el lateral decía
   * «Ciclos vitales» mientras la pantalla no lo confirmaba: había que subir a
   * ciegas para comprobar que se había llegado donde se quería.
   *
   * Va suave porque encadena con la animación de entrada del contenido, y de
   * golpe si el sistema pide menos movimiento.
   *
   * El efecto va antes del `return null` de abajo a propósito: un hook no puede
   * saltarse en unos renders y en otros no.
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
  }, [seccion, disciplina, quieto]);

  // Un estudio de empresa se lee sólo del nombre: no tiene fecha, ni
  // estructura, ni ciclos, así que tampoco tiene las siete secciones.
  const empresa = !!re;
  if (!r && !re) return null;

  const resumen = r ? [
    { label: "Corazón", valor: r.corazon.valor },
    { label: "Esencia", valor: r.esencia.valor },
    { label: "Ego", valor: r.ego.valor },
    { label: "Edad de cambio", valor: r.caminos.edadCambio },
    { label: "Estructura", valor: r.estructura.tipo },
    { label: "Imagen del alma", valor: r.imagenAlma.numero },
  ] : [];

  /* La tira de cifras del banner sale en todas las secciones de Kábala menos en
     el Resumen, donde las mismas seis ya están en las tarjetas de debajo. */
  const mostrarTira = disciplina === "kabala" && seccion !== "resumen" && !empresa;

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);")}>
      {/* La cabecera de la persona, en su propio banner.
       * Era texto suelto sobre el fondo con una raya debajo: el nombre, la
       * fecha y las seis cifras flotaban sin nada que los reuniera. Ahora van
       * dentro de una pieza — nombre a la izquierda, cifras a la derecha
       * separadas por una línea de un pelo, como una fila de datos de iOS. */}
      <div
        data-banner=""
        style={css(
          "position:relative;overflow:hidden;isolation:isolate;display:flex;align-items:center;gap:var(--gap-lg);flex-wrap:wrap;" +
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);" +
            "padding:var(--pad-card);margin-bottom:var(--gap-lg);"
        )}
      >
        {/* Un velo dorado muy flojo en la esquina, para que el banner no sea
         * un rectángulo plano. No lleva partículas: detrás del nombre se leen
         * como suciedad. */}
        <div
          aria-hidden="true"
          style={css(
            "position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(520px 220px at 0% 0%, var(--gold-soft), transparent 70%);"
          )}
        />

        <div style={css("position:relative;z-index:1;min-width:0;flex:1 1 260px;")}>
          <div style={css("display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:980px;background:var(--gold-soft);color:var(--gold-deep);font-size:var(--t-mini);font-weight:590;")}>
            {DISCIPLINAS.find((d) => d.k === disciplina)?.label}
            {/* Con dos bases dentro de Numerología, «Numerología» a secas ya no
                dice en cuál estás. La chapa es lo único de la cabecera que lo
                puede decir sin robarle sitio al nombre de la persona. */}
            {disciplina === "numerologia" && (base === "b9" ? " · Base 9" : " · Base 22")}
          </div>
          <h1
            style={css(
              "font-family:var(--font-ui);font-weight:700;font-size:clamp(24px,3.4vw,34px);letter-spacing:-.026em;color:var(--text);margin:var(--s3) 0 0;line-height:1.1;overflow-wrap:anywhere;text-wrap:balance;"
            )}
          >
            {titulo((r ?? re!).nombre.texto)}
          </h1>
          <div style={css("font-size:var(--t-body);color:var(--text-3);margin-top:6px;")} data-cifras="">
            {r ? `${r.fecha.dia} / ${r.fecha.mes} / ${r.fecha.anio}` : "Estudio de empresa · sólo el nombre"}
          </div>
        </div>

        {/*
            En el resumen estas mismas cifras ya salen en las tarjetas, así que
            la tira sólo aparece en las demás secciones.

            Y NO SE APAGA CON UN `display:none` EN LÍNEA: se deja de dibujar.

            Con el estilo en línea, la regla de móvil —que necesita un
            `display:grid !important` para colocar las cifras en tres columnas—
            se lo pisaba, y en el Resumen salían las seis cifras DOS VECES: en
            la tira y en las tarjetas de justo debajo. 138 píxeles repetidos en
            una pantalla de 844, y ninguna forma de arreglarlo desde la hoja de
            estilos sin quitarle el `!important` a la única regla que lo
            necesita.

            Quien decide si esto existe es React; quien decide cómo se coloca es
            el CSS. Cuando los dos discuten por la misma propiedad, gana el que
            grita más fuerte, y eso nunca es un buen sistema.
        */}
        {mostrarTira && (
        <div
          data-tira-cifras=""
          style={css("position:relative;z-index:1;display:flex;flex-wrap:wrap;margin-left:auto;")}
        >
          {resumen.map((k, i) => (
            <div
              key={i}
              style={css(
                "display:flex;flex-direction:column;gap:5px;align-items:flex-start;padding:0 clamp(12px,1.6vw,20px);" +
                  (i ? "border-left:1px solid var(--border);" : "")
              )}
            >
              <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-4);white-space:nowrap;")}>{k.label}</span>
              <span data-cifras="" style={css("font-weight:600;font-size:var(--t-head);color:var(--text);line-height:1;letter-spacing:-.02em;")}>{k.valor}</span>
            </div>
          ))}
        </div>
        )}
      </div>


      {(() => {
        // El resumen ya se abre saludando a Iris por su nombre; no hace falta
        // ponerle encima un segundo título que diga lo mismo.
        const s = disciplina !== "kabala" || seccion === "resumen" || empresa ? null : SECCIONES.find((x) => x.k === seccion);
        return s ? (
          <div key={"h" + seccion} style={css("margin-bottom:var(--s5);animation:es33-alza .45s cubic-bezier(.22,1,.36,1) both;")}>
            <h2 style={css("font-size:var(--t-head);margin:0;")}>{s.label}</h2>
            <p style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-3);margin:5px 0 0;max-width:64ch;")}>{s.pie}</p>
          </div>
        ) : null;
      })()}

      {/* La key hace que React tire el árbol anterior al cambiar de sección,
       * así la animación de entrada se reproduce en cada salto y no sólo la
       * primera vez. */}
      <div key={disciplina + seccion + base} style={css("animation:es33-alza .5s cubic-bezier(.22,1,.36,1) both;")}>
        {/* Numerología son DOS sistemas, no dos vistas del mismo. La base 22
            sale de la fecha y dice cómo se comporta alguien; la base 9 sale del
            nombre completo y dice de qué está hecho. Cuál se mira lo lleva el
            contexto, porque quien lo cambia es la columna de la izquierda. */}
        {disciplina === "numerologia" && (base === "b9" ? <SeccionBase9 /> : <SeccionNumerologia />)}
        {disciplina === "kabala" && empresa && <SeccionEmpresa />}
        {disciplina === "kabala" && !empresa && (
          <>
            {seccion === "resumen" && <SeccionResumen />}
            {seccion === "arbol" && <SeccionArbol />}
            {seccion === "numeros" && <SeccionNumeros />}
            {seccion === "estructura" && <SeccionEstructura />}
            {seccion === "alma" && <SeccionAlma />}
            {seccion === "cuentas" && <SeccionCuentas />}
            {seccion === "ciclos" && <SeccionCiclos />}
          </>
        )}
      </div>
    </main>
  );
}
