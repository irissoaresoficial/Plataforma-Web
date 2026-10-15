"use client";

/**
 * ============================================================================
 * GESTIÓN — EL LLAVERO DE LA ESCUELA
 * ============================================================================
 *
 * Quién ha entrado, qué lleva y qué puede abrir. Es la pantalla con la que Iris
 * cobra mientras no haya Stripe: alguien le paga por donde sea, ella entra aquí
 * y le da el curso.
 *
 * POR QUÉ ES UNA LISTA Y NO UN TABLERO. La tentación con las personas es
 * siempre el tablero de columnas —«interesado», «alumno», «antiguo»— y aquí
 * sería un error: un tablero obliga a que cada persona esté en UNA columna, y
 * aquí lo normal es llevar varias llaves a la vez. Quien compra un curso y paga
 * membresía no está en dos sitios: es una persona con dos llaves.
 *
 * LO QUE SE VE DE UN VISTAZO, y es lo que decide si esta pantalla sirve: el
 * nombre, las llaves y a qué cursos tiene acceso. Nada más en la fila. Todo lo
 * demás —cuándo entró, desde dónde, qué lleva visto— es de la ficha de dentro,
 * y meterlo en la fila haría que no se pudiera leer ninguna.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, CAMPO, NOTA, TITULO, botonPrincipal } from "@/lib/ui";
import { NOMBRE_ROL, type Rol } from "@/lib/roles";
import Muestra from "../escuela/Muestra";

type Persona = {
  uid: string;
  nombre: string;
  email: string;
  roles: Rol[];
  cursos: string[];
  desde: string;
};

/* Gente de ejemplo. Nombres corrientes y situaciones que van a pasar de
   verdad: quien tiene las dos llaves, quien sólo compró un curso, quien se dio
   de alta y todavía no tiene nada. Esa última fila es la que importa que esté:
   es el caso en el que Iris tiene que hacer algo. */
const EJEMPLO: Persona[] = [
  { uid: "1", nombre: "Carmen Aledo", email: "carmen.aledo@gmail.com", roles: ["alumno", "miembro"], cursos: ["Desórdenes Amorosos"], desde: "3 oct" },
  { uid: "2", nombre: "Lucía Ferrer", email: "luciaferrer@hotmail.com", roles: ["alumno"], cursos: ["Desórdenes Amorosos"], desde: "28 sep" },
  { uid: "3", nombre: "Marta Ortiz", email: "m.ortiz@gmail.com", roles: ["miembro"], cursos: [], desde: "19 sep" },
  { uid: "4", nombre: "Ana Belén Ruiz", email: "anabelen.ruiz@gmail.com", roles: [], cursos: [], desde: "hoy" },
];

export default function GestionScreen() {
  const [busca, setBusca] = useState("");
  const quieto = useReducedMotion();

  const lista = EJEMPLO.filter((p) =>
    (p.nombre + " " + p.email).toLowerCase().includes(busca.trim().toLowerCase())
  );

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);max-width:1000px;")}>
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h1 style={css(TITULO + "margin:0;")}>Gestión</h1>
        <span style={css(NOTA)}>{EJEMPLO.length} personas</span>
        <button style={css(botonPrincipal() + "margin-left:auto;")}>Invitar por correo</button>
      </div>

      <Muestra falta="Al conectarla saldrá aquí quien se haya dado de alta de verdad, y los botones darán y quitarán acceso." />

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nombre o correo"
        aria-label="Buscar una persona"
        style={css(CAMPO + "max-width:360px;")}
      />

      <div style={css("display:flex;flex-direction:column;gap:var(--s2);")}>
        {lista.map((p, i) => (
          <motion.article
            key={p.uid}
            initial={quieto ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(0.04 * i, 0.2), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                "box-shadow:var(--nm);padding:var(--s3) var(--s4);" +
                "display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;"
            )}
          >
            {/* La inicial en vez de una foto: nadie sube foto, y un hueco gris
                repetido cuatro veces es peor que cuatro letras. */}
            <span
              aria-hidden
              style={css(
                "flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;" +
                  "background:var(--gold-soft);color:var(--gold-deep);font-weight:600;font-size:var(--t-body);"
              )}
            >
              {p.nombre.trim()[0]}
            </span>

            <div style={css("flex:1 1 180px;min-width:0;")}>
              <div style={css("font-size:var(--t-body);font-weight:600;color:var(--text);")}>{p.nombre}</div>
              <div style={css(NOTA + "overflow-wrap:anywhere;")}>{p.email}</div>
            </div>

            {/* Las llaves. Quien no tiene ninguna lo dice con palabras, no con
                un hueco: un hueco se lee como «todavía no ha cargado». */}
            <div style={css("display:flex;gap:6px;flex-wrap:wrap;flex:1 1 150px;")}>
              {p.roles.length === 0 ? (
                <span style={css(NOTA + "font-style:italic;")}>sin acceso a nada</span>
              ) : (
                p.roles.map((r) => (
                  <span
                    key={r}
                    style={css(
                      "font-size:var(--t-micro);font-weight:600;padding:3px 9px;border-radius:var(--r-pill);" +
                        (r === "admin"
                          ? "background:var(--gold-soft);color:var(--gold-deep);"
                          : "background:color-mix(in srgb, var(--text) 8%, transparent);color:var(--text-3);")
                    )}
                  >
                    {NOMBRE_ROL[r]}
                  </span>
                ))
              )}
            </div>

            <span style={css(NOTA + "flex:0 0 auto;")}>
              {p.cursos.length === 0 ? "—" : p.cursos.join(", ")}
            </span>

            <button style={css(BOTON_NORMAL + "flex:none;")}>Dar acceso</button>
          </motion.article>
        ))}

        {lista.length === 0 && (
          <p style={css(NOTA + "margin:var(--s3) 0;")}>Nadie con ese nombre ni ese correo.</p>
        )}
      </div>
    </div>
  );
}
