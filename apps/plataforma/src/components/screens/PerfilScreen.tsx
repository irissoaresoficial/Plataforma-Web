"use client";

/**
 * ============================================================================
 * TU PERFIL — Y AQUÍ DENTRO, LOS TROFEOS
 * ============================================================================
 *
 * Los trofeos estaban en el menú, como una pestaña propia, y Gerson los mandó
 * aquí: «eso tiene que ser como en el apartado de perfil».
 *
 * POR QUÉ ESO ESTÁ BIEN, Y NO ES SÓLO DÓNDE CAE UN ENLACE. Una pestaña llamada
 * «Trofeos» convierte el juego en una tarea: aparece al mismo nivel que los
 * cursos, como si hubiera que ir a hacerla. Y la primera vez que alguien la
 * abre está vacía — el peor arranque posible para lo único que tenía que dar
 * alegría. Pegado a tu nombre no es un sitio que visitar: es algo que TIENES.
 *
 * CÓMO SE HACE UNA PANTALLA DOPAMÍNICA SIN QUE DÉ VERGÜENZA AJENA
 * ---------------------------------------------------------------------------
 * La diferencia entre que esto enganche o que parezca un videojuego de 2011 no
 * está en cuántas medallas haya. Está en tres cosas:
 *
 *   1. CELEBRAR LO QUE CUESTA, no lo que se hace solo. «Has entrado» no es un
 *      logro. «Terminaste el módulo entero» sí. Si se celebra todo, no se
 *      celebra nada y además se nota el truco.
 *
 *   2. ENSEÑAR LO QUE FALTA, no sólo lo conseguido. Una medalla apagada con su
 *      nombre y lo que hay que hacer para abrirla tira más que diez
 *      encendidas. Lo conseguido es pasado; lo que falta es lo que mueve.
 *
 *   3. LA RACHA SE CUIDA, NO SE CASTIGA. El número de días seguidos es lo que
 *      más engancha y también lo que más daño hace: perder una racha de 40 días
 *      por un día malo hace que mucha gente no vuelva. Por eso aquí la racha se
 *      enseña sin cuenta atrás ni amenazas.
 *
 * Y LO QUE LA LEY OBLIGA A TENER A MANO vive también aquí: cambiar los datos y
 * pedir que se borre la cuenta. No en un rincón de los ajustes — el derecho de
 * supresión del reglamento europeo tiene que ser fácil de ejercer, y eso
 * significa que se vea.
 */

import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useSesion } from "@/lib/sesion";
import { BOTON_NORMAL, CABECERA, LECTURA, NOTA, TITULO } from "@/lib/ui";
import { NOMBRE_ROL } from "@/lib/roles";
import Muestra from "../escuela/Muestra";

type Medalla = { id: string; nombre: string; como: string; abierta: boolean };

const MEDALLAS: Medalla[] = [
  { id: "1", nombre: "Primera clase", como: "Termina tu primera lección.", abierta: true },
  { id: "2", nombre: "Módulo entero", como: "Termina todas las lecciones de un módulo.", abierta: true },
  { id: "3", nombre: "Siete días", como: "Entra siete días seguidos.", abierta: true },
  { id: "4", nombre: "La primera vez que hablas", como: "Escribe tu primer tema en la comunidad.", abierta: false },
  { id: "5", nombre: "Curso terminado", como: "Acaba un curso de principio a fin.", abierta: false },
  { id: "6", nombre: "Alguien te lo agradece", como: "Responde a alguien y que te lo agradezca.", abierta: false },
];

export default function PerfilScreen() {
  const { usuario, esAdmin } = useSesion();
  const quieto = useReducedMotion();

  const nombre = usuario ? usuario.nombre : "";
  const email = usuario ? usuario.email : "";
  const roles = usuario ? usuario.roles : [];
  const abiertas = MEDALLAS.filter((m) => m.abierta).length;

  const tarjeta =
    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
    "box-shadow:var(--nm);padding:var(--s4);";

  /** Un número grande con su palabra debajo. Lo que se mira de reojo. */
  const cifra = (n: string, que: string, i: number) => (
    <motion.div
      key={que}
      initial={quieto ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={css(tarjeta + "text-align:center;")}
    >
      <div
        style={css(
          "font-family:var(--font-display);font-size:clamp(28px,4vw,38px);font-weight:500;" +
            "line-height:1;color:var(--text);font-variant-numeric:tabular-nums;"
        )}
      >
        {n}
      </div>
      <div style={css(NOTA + "margin-top:7px;")}>{que}</div>
    </motion.div>
  );

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s5);max-width:900px;")}>
      <h1 style={css(TITULO + "margin:0;")}>Tu perfil</h1>

      <Muestra falta="Al conectarla, los números y las medallas saldrán de lo que hayas hecho de verdad." />

      {/* ------------------------------------------------------ quién eres */}
      <section style={css(tarjeta + "display:flex;gap:var(--s4);align-items:center;flex-wrap:wrap;")}>
        <span
          aria-hidden
          style={css(
            "flex:none;display:grid;place-items:center;width:66px;height:66px;border-radius:50%;" +
              "background:var(--rosa);color:var(--rosa-tx);font-weight:600;font-size:27px;" +
              "font-family:var(--font-display);"
          )}
        >
          {(nombre.trim()[0] || "·").toUpperCase()}
        </span>

        <div style={css("flex:1 1 200px;min-width:0;")}>
          <div style={css("font-size:var(--t-read);font-weight:600;color:var(--text);")}>{nombre || "Sin nombre"}</div>
          <div style={css(NOTA + "overflow-wrap:anywhere;margin-top:3px;")}>{email}</div>
          <div style={css("display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;")}>
            {roles.length === 0 ? (
              <span style={css(NOTA + "font-style:italic;")}>sin acceso todavía</span>
            ) : (
              roles.map((r) => (
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
        </div>

        <button style={css(BOTON_NORMAL + "flex:none;")}>Cambiar mis datos</button>
      </section>

      {/* --------------------------------------------------- lo que llevas */}
      {/* Iris no es alumna: enseñarle una racha y unos puntos sería inventarle
          un juego que no juega. Ve su escuela, no su expediente. */}
      {!esAdmin && (
        <section>
          <h2 style={css(CABECERA + "margin:0 0 var(--s3);font-size:var(--t-head);")}>Lo que llevas</h2>
          <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(150px,1fr));")}>
            {cifra("7", "días seguidos", 0)}
            {cifra("12", "lecciones hechas", 1)}
            {cifra("1", "curso empezado", 2)}
            {cifra(`${abiertas}`, "medallas", 3)}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------- medallas */}
      <section>
        <div style={css("display:flex;align-items:baseline;gap:var(--s3);margin-bottom:var(--s3);flex-wrap:wrap;")}>
          <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>Medallas</h2>
          <span style={css(NOTA)}>
            {abiertas} de {MEDALLAS.length}
          </span>
        </div>

        <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(230px,1fr));")}>
          {MEDALLAS.map((m, i) => (
            <motion.div
              key={m.id}
              initial={quieto ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={css(
                tarjeta +
                  "display:flex;gap:12px;align-items:flex-start;" +
                  /* La cerrada no se esconde ni se difumina entera: se apaga.
                     Hay que poder leer qué es y cómo se abre — eso es lo que
                     tira, y una medalla borrosa no tira de nadie. */
                  (m.abierta ? "" : "opacity:.72;")
              )}
            >
              <span
                aria-hidden
                style={css(
                  "flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;" +
                    /* La ganada en lima: es el color de lo conseguido en toda
                       la plataforma. La que falta, con el canto punteado y sin
                       color — se ve que es un hueco, no un logro apagado. */
                    (m.abierta
                      ? "background:var(--lima);color:var(--lima-tx);"
                      : "border:1.5px dashed var(--border-strong);color:var(--text-4);")
                )}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3.6h8v4.6a4 4 0 0 1-8 0z" />
                  <path d="M8 4.8H5.4v1.6a2.8 2.8 0 0 0 2.6 2.8" opacity=".6" />
                  <path d="M16 4.8h2.6v1.6a2.8 2.8 0 0 1-2.6 2.8" opacity=".6" />
                  <path d="M12 12.2v3.3M9 20.4h6l-.7-2.6a1.4 1.4 0 0 0-1.35-1.05h-1.9A1.4 1.4 0 0 0 9.7 17.8z" />
                </svg>
              </span>
              <div style={css("min-width:0;")}>
                <div style={css("font-size:var(--t-body);font-weight:600;color:var(--text);")}>{m.nombre}</div>
                <div style={css(NOTA + "margin-top:4px;line-height:1.45;")}>{m.como}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- tu cuenta */}
      {/*
        BORRAR LA CUENTA VA AQUÍ, A LA VISTA.
        
        El derecho de supresión del reglamento europeo no se cumple teniéndolo
        escondido en un submenú: tiene que ser fácil de ejercer. Que incomode
        verlo es exactamente la razón por la que casi nadie lo pone, y la razón
        por la que está puesto.
      */}
      <section style={css(tarjeta)}>
        <h2 style={css(CABECERA + "margin:0 0 var(--s2);font-size:var(--t-head);")}>Tu cuenta</h2>
        <p style={css(LECTURA + "margin:0 0 var(--s3);max-width:62ch;")}>
          Puedes descargarte todo lo que la escuela guarda de ti, o pedir que se borre. Si lo borras se va todo: tu
          avance, tus mensajes de la comunidad y el acceso a los cursos que hayas comprado. No hay vuelta atrás.
        </p>
        <div style={css("display:flex;gap:var(--s3);flex-wrap:wrap;")}>
          <button style={css(BOTON_NORMAL)}>Descargar mis datos</button>
          <button style={css(BOTON_NORMAL + "color:var(--alarma, #C0392B);")}>Borrar mi cuenta</button>
        </div>
      </section>
    </div>
  );
}
