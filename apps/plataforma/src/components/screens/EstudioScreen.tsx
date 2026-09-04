"use client";
import { useMemo, useState } from "react";
import { css } from "@/lib/css";
import { BOTON_NORMAL, botonPrincipal } from "@/lib/ui";
import { useApp } from "@/lib/app-context";
import { construyeCapitulos, construyeCapitulosEmpresa } from "@/lib/estudio";
import { imprimir, AYUDA_IMPRIMIR, AYUDA_SIN_CABECERAS } from "@/lib/imprimir";
import { fechaLarga, titulo } from "@/lib/format";
import BloqueView from "../estudio/BloqueView";
import HojaCliente from "../estudio/HojaCliente";
import HojaClienteEmpresa from "../estudio/HojaClienteEmpresa";
import styles from "../estudio/Estudio.module.css";

export default function EstudioScreen() {
  const { r, re, marca, txt, guardaEdit, restablecer } = useApp();
  const capitulos = useMemo(() => (r ? construyeCapitulos(r) : re ? construyeCapitulosEmpresa(re) : []), [r, re]);
  // Dos documentos distintos con el mismo botón de imprimir: el estudio
  // entero, que es la herramienta de Iris, y la hoja que se lleva el cliente.
  const [modo, setModo] = useState<"estudio" | "hoja">("estudio");
  if (!r && !re) return null;

  const hoja = modo === "hoja";
  const empresa = !!re;
  const nombreTexto = (r ?? re!).nombre.texto;

  return (
    <div className={styles.wrap}>
      <div data-chrome="1" className={styles.toolbar}>
        {/* Los dos documentos, uno al lado del otro y los dos legibles.
         * Estaban en un control segmentado gris sobre gris: el que no estaba
         * elegido apenas se veía, y la hoja del cliente —que es la mitad de
         * lo que se imprime aquí— pasaba desapercibida. Ahora el que no está
         * activo es un botón con borde, no un texto apagado. */}
        <div style={css("display:flex;gap:var(--s2);flex:none;flex-wrap:wrap;")}>
          {([
            ["estudio", "Estudio completo", `${capitulos.length} capítulos`],
            ["hoja", "Hoja para el cliente", "1 página"],
          ] as const).map(([k, label, pie]) => {
            const on = modo === k;
            return (
              <button
                key={k}
                onClick={() => setModo(k)}
                aria-pressed={on}
                style={css(
                  "display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:8px 16px;border-radius:var(--r-sm);cursor:pointer;text-align:left;white-space:nowrap;transition:all .2s;" +
                    (on
                      ? "border:1px solid var(--gold-deep);background:var(--gold-deep);color:var(--sobre-oro);"
                      : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);")
                )}
              >
                <span style={css("font-size:var(--t-body);font-weight:600;letter-spacing:-.01em;")}>{label}</span>
                <span style={css("font-size:var(--t-mini);color:" + (on ? "color-mix(in srgb, var(--sobre-oro) 72%, transparent)" : "var(--text-4)") + ";")}>{pie}</span>
              </button>
            );
          })}
        </div>
        <span className={styles.hint} style={css("font-size:var(--t-body);color:var(--text-4);")}>
          {hoja ? "Una página, sin fórmulas ni claves: lo que se lleva la persona." : "Haz clic en cualquier párrafo para reescribirlo con tus palabras."}
        </span>
        <div style={css("margin-left:auto;display:flex;gap:9px;")}>
          {!hoja && (
            <button
              onClick={restablecer}
              style={css(BOTON_NORMAL)}
            >
              Restablecer textos
            </button>
          )}
          <button
            onClick={() => imprimir()}
            style={css(botonPrincipal())}
          >
            {hoja ? "Exportar la hoja" : "Exportar PDF"}
          </button>
        </div>
        {/* En el iPad el diálogo no siempre se abre solo; la ruta manual
         * funciona siempre y conviene tenerla a la vista. */}
        {/* Lo primero que pregunta cualquiera al exportar, así que va en la
         * barra y no escondido en una ayuda. */}
        <span
          style={css(
            "flex-basis:100%;display:inline-flex;align-items:flex-start;gap:7px;font-size:var(--t-mini);line-height:1.45;color:var(--gold);background:var(--gold-soft);border-radius:var(--r-sm);padding:7px 10px;"
          )}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none", marginTop: 1 }} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v4h1" />
          </svg>
          {AYUDA_SIN_CABECERAS}
        </span>
        <span style={css("flex-basis:100%;font-size:var(--t-mini);color:var(--text-4);")}>{AYUDA_IMPRIMIR}</span>
      </div>

      <div className={styles.desk}>
        {hoja && (r ? <HojaCliente r={r} marca={marca} /> : <HojaClienteEmpresa re={re!} marca={marca} />)}
        {!hoja && <section className={`${styles.page} ${styles.portada}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="" style={css("width:210px;height:210px;border-radius:50%;object-fit:cover;margin-bottom:34px;")} />
          <div style={css("font-weight:590;font-size:var(--t-mini);color:#9A7F32;")}>{marca}</div>
          <div style={css("width:78px;height:1px;background:var(--gold);margin:26px 0;")} />
          <div style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:#6B6478;")}>
            {empresa ? "Estudio de Kábala empresarial" : "Estudio de Kábala personal"}
          </div>
          <h1 style={css("font-family:var(--font-ui);font-weight:700;font-size:var(--t-hero);line-height:1.22;letter-spacing:-.022em;color:#241F2E;margin:30px 0 0;max-width:560px;")}>{titulo(nombreTexto)}</h1>
          <div style={css("font-family:var(--font-ui);font-size:var(--t-title);font-style:italic;color:#7A7288;margin-top:var(--s4);")}>
            {r ? fechaLarga(r.fecha.dia, r.fecha.mes, r.fecha.anio) : "Leído del nombre"}
          </div>
        </section>}

        {!hoja && capitulos.map((cap, i) => {
          // En papel solo estrena hoja el capítulo que abre una sesión nueva.
          // Antes bastaba con cambiar de sección — y como dentro de una misma
          // sesión hay varias, salían hojas con tres líneas arriba y el resto
          // en blanco. Lo que va detrás de «·» son capítulos de la misma
          // sesión: fluyen uno tras otro.
          const sesion = (c: (typeof capitulos)[number]) => c.seccion.split("·")[0].trim();
          const abreSeccion = i === 0 || sesion(cap) !== sesion(capitulos[i - 1]);
          return (
          <section key={cap.id} className={`${styles.page} ${styles.interior} ${abreSeccion ? styles.abreSeccion : styles.continua}`}>
            <header className={styles.header}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpeg" alt="" style={css("width:26px;height:26px;border-radius:50%;object-fit:cover;")} />
              <span style={css("font-weight:590;font-size:var(--t-mini);color:#9A7F32;")}>{marca}</span>
              <span style={css("margin-left:auto;font-family:var(--font-ui);font-size:var(--t-mini);font-weight:590;color:#9B93A8;")}>{cap.seccion}</span>
            </header>
            <div className={styles.cuerpo}>
              {cap.kicker && (
                <div>
                  <div style={css("font-family:var(--font-ui);font-size:9.5px;color:#B08A2E;margin-bottom:5px;")}>{cap.kicker}</div>
                  <h2 style={css("font-family:var(--font-ui);font-weight:700;font-size:var(--t-head);line-height:1.2;letter-spacing:-.022em;color:#241F2E;margin:0;")}>{cap.titulo}</h2>
                </div>
              )}
              {cap.bloques.map((b, bi) => (
                <BloqueView key={bi} b={b} r={r} txt={txt} guardaEdit={guardaEdit} />
              ))}
            </div>
            <footer className={styles.footer}>
              <span>{nombreTexto}</span>
              <span style={css("margin-left:auto;")}>{marca}</span>
            </footer>
          </section>
          );
        })}
      </div>
    </div>
  );
}
