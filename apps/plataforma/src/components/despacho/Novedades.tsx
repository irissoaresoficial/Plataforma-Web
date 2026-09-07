"use client";

/**
 * EL AVISO QUE APARECE SOLO CUANDO ENTRA ALGUIEN.
 *
 * ===========================================================================
 * POR QUÉ EXISTE
 * ===========================================================================
 * La campana de arriba enseña lo que hay pendiente cuando la pulsas. Eso está
 * bien para «qué me queda por hacer», y es inútil para «acaba de pasar algo»:
 * nadie pulsa una campana por si acaso. Lo dijo quien lo usa: «el nombre sí se
 * me puso allí, pero no fue instantáneo y no hubo notificación ni sonido».
 *
 * Esto es la otra mitad. Aparece por su cuenta, dura unos segundos y se va.
 *
 * ===========================================================================
 * LAS DECISIONES, Y POR QUÉ CADA UNA
 * ===========================================================================
 *
 * ABAJO A LA DERECHA, no arriba. Arriba está la campana, el tema y la cuenta:
 * un aviso que aparece ahí tapa justo los botones que quien lo ve va a querer
 * pulsar a continuación. Abajo a la derecha no hay nada que tapar.
 *
 * SE VA SOLO A LOS 8 SEGUNDOS, pero NO mientras el ratón está encima. Ocho
 * segundos es tiempo de leer dos líneas sin prisa; si alguien está apuntando el
 * nombre en un papel, no se le puede quitar de delante a mitad.
 *
 * SE PULSA Y LLEVA AL SITIO. Un aviso que sólo informa obliga a hacer el
 * camino a mano: leer «Ana ha pedido una sesión», ir al menú, abrir Agenda,
 * buscar. Pulsándolo se abre la pantalla donde está.
 *
 * TRES COMO MUCHO A LA VEZ. Si entran ocho seguidos —y pasa: una campaña
 * publicada— ocho tarjetas apiladas tapan media pantalla. Se enseñan las tres
 * últimas; las demás no se pierden, están en Leads, que es donde se miran las
 * listas.
 *
 * NO SUENA SI LA PESTAÑA ESTÁ OCULTA. El navegador tampoco dejaría, pero
 * además no debe: un pitido desde una pestaña que no se ve, en mitad de otra
 * cosa, sobresalta en vez de avisar. Al volver, el aviso sigue ahí.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { escuchaNovedades, suena, type Novedad } from "@/lib/despacho/enVivo";
import { Avatar } from "./Piezas";

const SEGUNDOS = 8000;

export default function Novedades() {
  const { setView } = useApp();
  const [cola, setCola] = useState<Novedad[]>([]);
  const [parado, setParado] = useState(false);
  const quieto = useReducedMotion();
  /* Los relojes de cada tarjeta, para poder pararlos al pasar el ratón por
     encima y volver a ponerlos al salir. */
  const relojes = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const soltar = escuchaNovedades((n) => {
      setCola((c) => {
        /* Por identificador: Firestore puede reentregar el mismo documento al
           reconectar, y dos tarjetas idénticas se leen como un fallo. */
        if (c.some((x) => x.id === n.id)) return c;
        return [...c, n].slice(-3);
      });
      if (typeof document !== "undefined" && !document.hidden) suena();
    });
    return () => {
      soltar();
      relojes.current.forEach((t) => window.clearTimeout(t));
      relojes.current.clear();
    };
  }, []);

  /* El reloj de irse. Se rehace entero cada vez que cambia la cola o se para:
     así «parado» detiene TODAS las tarjetas, no sólo la que está debajo del
     ratón — apilar cuatro y que se vayan las de al lado mientras se lee una es
     lo mismo que perderlas. */
  useEffect(() => {
    relojes.current.forEach((t) => window.clearTimeout(t));
    relojes.current.clear();
    if (parado) return;
    cola.forEach((n) => {
      const t = window.setTimeout(() => quita(n.id), SEGUNDOS);
      relojes.current.set(n.id, t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cola, parado]);

  const quita = (id: string) => setCola((c) => c.filter((x) => x.id !== id));

  const abrir = (n: Novedad) => {
    setView(n.pantalla);
    quita(n.id);
  };

  if (!cola.length) return null;

  return (
    <div
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      style={css(
        /* Fijo a la ventana y por encima de todo menos de las hojas laterales.
           `pointer-events:none` en el contenedor para no tragarse los clics del
           trozo de pantalla vacío que hay a su alrededor. */
        "position:fixed;right:var(--gutter);bottom:var(--gutter);z-index:70;" +
          "display:flex;flex-direction:column-reverse;gap:10px;pointer-events:none;" +
          "max-width:min(360px,calc(100vw - 2 * var(--gutter)));",
      )}
    >
      <AnimatePresence initial={false}>
        {cola.map((n) => (
          <motion.button
            key={n.id}
            layout={!quieto}
            onClick={() => abrir(n)}
            /* Entra desde la derecha, que es de donde vendría algo que llega.
               Con muelle y no con curva: lo que se posa tiene peso. */
            initial={quieto ? { opacity: 0 } : { opacity: 0, x: 28, scale: 0.96 }}
            animate={quieto ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={quieto ? { opacity: 0 } : { opacity: 0, x: 20, scale: 0.97 }}
            transition={quieto ? { duration: 0.15 } : { type: "spring", stiffness: 320, damping: 30 }}
            style={css(
              "pointer-events:auto;display:flex;align-items:center;gap:11px;text-align:left;cursor:pointer;" +
                "padding:12px 14px;border-radius:var(--r-tarjeta);border:1px solid var(--vidrio-borde);" +
                /* Cristal, no superficie sólida: esto flota por encima del
                   trabajo y tiene que leerse como algo que está encima y se va,
                   no como un bloque más de la pantalla. */
                "background:var(--vidrio-denso);backdrop-filter:blur(18px) saturate(1.4);" +
                "-webkit-backdrop-filter:blur(18px) saturate(1.4);box-shadow:var(--shadow-lg);",
            )}
          >
            <Avatar nombre={n.titulo} tamano={32} />
            <span style={css("min-width:0;flex:1;")}>
              <span
                style={css(
                  "display:block;font-size:var(--t-body);font-weight:600;color:var(--text);" +
                    "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
                )}
              >
                {n.titulo}
              </span>
              <span style={css("display:block;font-size:var(--t-mini);color:var(--text-3);margin-top:2px;")}>
                {n.detalle}
              </span>
            </span>
            {/* Un punto, no una equis. La equis dice «ciérrame» y esto se cierra
                solo; el punto dice «esto es nuevo», que es la información que
                falta cuando hay tres apiladas y una lleva ahí seis segundos. */}
            <span
              aria-hidden
              style={css("flex:none;width:7px;height:7px;border-radius:50%;background:var(--accion);")}
            />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
