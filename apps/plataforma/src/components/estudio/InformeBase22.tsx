"use client";

/**
 * ============================================================================
 * EL INFORME DE NUMEROLOGÍA — LA MÁSCARA Y EL ESPEJO, PARA ENTREGAR
 * ============================================================================
 *
 * Gerson, el 15 de noviembre de 2026: «este apartado debe también sacar un
 * resultado tipo informe para entregar a la persona que se le haga esto».
 *
 * Dos partes, como se lee la lámina en una consulta:
 *   1. La lámina con sus números, entera y quieta, en la primera hoja.
 *   2. Lo que dice cada número, en tres bloques: la familia, lo que se enseña
 *      fuera y el espejo (la defensa). Cada casilla con su sigla del color de
 *      la lámina, para que se encuentre en el dibujo sin buscarla.
 *
 * QUÉ NO VA, A PROPÓSITO. Ni las fórmulas ni el punto de «casilla deducida»:
 * son notas de escuela y a quien recibe el informe no le dicen nada. Tampoco
 * los avisos internos (`aviso`). Los textos son los de lib/base22.ts, sin
 * reescribir: si Iris corrige uno allí, cambia aquí también.
 *
 * SALE EN ESPAÑOL. Los significados de la base 22 sólo existen en español;
 * la barra de «El documento» lo dice cuando se elige otro idioma.
 *
 * Los colores: el papel de «El documento» es siempre claro, aunque la
 * plataforma esté en oscuro. Por eso la clase `informe22` (Estudio.module.css)
 * devuelve a sus valores claros los tokens que usa la lámina.
 */

import { css } from "@/lib/css";
import type { Resultado } from "@/lib/engine";
import { calculaBase22, type Mitad } from "@/lib/base22";
import { fechaLarga, titulo } from "@/lib/format";
import { LAMINA, LaminaImpresa, RELLENO, SIGLA } from "../panel/RejillaBase22";
import styles from "./Estudio.module.css";

const BLOQUES: { mitad: Mitad; titulo: string; pie: string }[] = [
  {
    mitad: "familia",
    titulo: "La familia",
    pie: "El día, el mes y el año en que naciste. De estos tres números sale todo lo demás.",
  },
  {
    mitad: "social",
    titulo: "Lo que enseñas fuera",
    pie: "La mitad de arriba de la lámina: cómo te mueves en casa, con los demás y en el trabajo.",
  },
  {
    mitad: "espejo",
    titulo: "El espejo",
    pie: "La mitad de abajo: lo que montas para defenderte cuando estás mal.",
  },
];

export default function InformeBase22({ r, marca }: { r: Resultado; marca: string }) {
  const base = { dia: r.fecha.dia, mes: r.fecha.mes, anio: r.fecha.anio };
  const tabla = calculaBase22(base);
  const nombre = titulo(r.nombre.texto);

  const cabecera = (
    <header className={styles.header}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.jpeg" alt="" style={css("width:26px;height:26px;border-radius:50%;object-fit:cover;")} />
      <span style={css("font-weight:590;font-size:var(--t-mini);color:#9A7F32;")}>{marca}</span>
      <span style={css("margin-left:auto;font-family:var(--font-ui);font-size:var(--t-mini);font-weight:590;color:#9B93A8;")}>
        Numerología · Base 22
      </span>
    </header>
  );
  const pie = (
    <footer className={styles.footer}>
      <span>{r.nombre.texto}</span>
      <span style={css("margin-left:auto;")}>{marca}</span>
    </footer>
  );

  return (
    <>
      {/* ------------------------------------------------ 1. LA LÁMINA */}
      <section className={`${styles.page} ${styles.interior} ${styles.abreSeccion} ${styles.informe22}`}>
        {cabecera}
        <div className={styles.cuerpo}>
          <div>
            <div style={css("font-family:var(--font-ui);font-size:9.5px;color:#B08A2E;margin-bottom:5px;")}>
              La máscara y el espejo
            </div>
            <h2 style={css("font-family:var(--font-ui);font-weight:700;font-size:var(--t-head);line-height:1.2;letter-spacing:-.022em;color:#2B1119;margin:0;")}>
              {nombre}
            </h2>
            <div style={css("font-family:var(--font-ui);font-size:var(--t-body);color:#7A7288;margin-top:4px;")}>
              {fechaLarga(r.fecha.dia, r.fecha.mes, r.fecha.anio, "es")}
            </div>
          </div>
          <p style={css("font-size:12px;line-height:1.55;color:#3A3546;margin:0;max-width:62ch;")}>
            Tu fecha de nacimiento, leída en diecinueve números. Cada uno tiene su sitio en la lámina. Arriba está lo que
            enseñas fuera. Abajo, el espejo: lo que montas para defenderte cuando estás mal. En el centro, tu madre, tú y
            tu padre, que es de donde sale todo.
          </p>
          <div style={css("width:100%;max-width:520px;margin:6px auto 0;")}>
            <LaminaImpresa base={base} />
          </div>
          <p style={css("font-size:9.5px;line-height:1.45;color:#9B93A8;margin:auto 0 0;text-align:center;")}>
            Lámina «La máscara y el espejo», de K. Hadar, M. Dessors, S. Sellam y M. Pradal. Los números de encima de cada
            casilla son 22 menos el número y 21 menos el número.
          </p>
        </div>
        {pie}
      </section>

      {/* ------------------------------------- 2. LO QUE DICE CADA NÚMERO */}
      <section className={`${styles.page} ${styles.interior} ${styles.abreSeccion} ${styles.informe22}`}>
        {cabecera}
        <div className={styles.cuerpo} style={css("gap:20px;")}>
          <h2 style={css("font-family:var(--font-ui);font-weight:700;font-size:var(--t-head);line-height:1.2;letter-spacing:-.022em;color:#2B1119;margin:0;")}>
            Lo que dice cada número
          </h2>
          {BLOQUES.map((b) => (
            <div key={b.mitad} style={css("display:flex;flex-direction:column;gap:10px;")}>
              <div style={css("border-top:1px solid rgba(154,127,50,.28);padding-top:10px;")}>
                <h3 style={css("font-family:var(--font-ui);font-weight:600;font-size:15px;color:#2B1119;margin:0 0 2px;")}>{b.titulo}</h3>
                <p style={css("font-size:10.5px;line-height:1.45;color:#6B6478;margin:0;")}>{b.pie}</p>
              </div>
              {tabla
                .filter((p) => p.mitad === b.mitad)
                .map((p) => {
                  const color = LAMINA[p.k]?.color ?? "var(--text)";
                  const relleno = RELLENO[p.k];
                  return (
                    <div
                      key={p.k}
                      className={styles.casilla22}
                      style={css("display:grid;grid-template-columns:58px 1fr 44px;gap:12px;align-items:start;")}
                    >
                      <span
                        style={css(
                          `text-align:center;font-size:10px;font-weight:500;border-radius:5px;padding:3px 4px;margin-top:2px;border:1.5px solid ${relleno ? relleno.fondo : color};background:${relleno ? relleno.fondo : "transparent"};color:${relleno ? relleno.tinta : color};`
                        )}
                      >
                        {SIGLA[p.k] ?? p.sigla}
                      </span>
                      <div style={css("min-width:0;")}>
                        <div style={css("font-family:var(--font-ui);font-weight:600;font-size:12.5px;color:#2B1119;margin-bottom:2px;")}>
                          {p.nombre}
                        </div>
                        <p style={css("font-size:11px;line-height:1.5;color:#3A3546;margin:0;")}>{p.significado}</p>
                      </div>
                      <span
                        data-cifras=""
                        style={css("font-family:var(--font-ui);font-size:24px;font-weight:500;line-height:1;color:#2B1119;text-align:right;")}
                      >
                        {p.valor ?? "—"}
                      </span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
        {pie}
      </section>
    </>
  );
}
