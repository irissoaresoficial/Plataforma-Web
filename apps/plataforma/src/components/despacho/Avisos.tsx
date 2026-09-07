"use client";

/**
 * LOS AVISOS, Y DÓNDE VIVEN
 *
 * POR QUÉ EN LA CABECERA Y NO EN LA COLUMNA.
 *
 * La columna de la izquierda es una lista de SITIOS: la consulta, las partes de
 * la carta, la agenda, los clientes, las facturas. Un aviso no es un sitio — es
 * algo que le pasa a Iris y que se arregla en otro lado. Colgarlo de la columna
 * obligaría a elegirle un sitio a cada uno, y el más útil de todos («la factura
 * de Ana lleva once días en borrador») pertenece a dos a la vez: a Facturas y a
 * la ficha de Ana. Un contador junto a «Facturas» diría un número sin decir de
 * qué, que es exactamente el ruido que se quería evitar.
 *
 * Y hay una razón más terca: por debajo de 980 px la columna desaparece dentro
 * del cajón del botón de tres rayas. Los avisos se irían con ella justo en el
 * ancho —el móvil— donde Iris entra a mirar entre sesión y sesión.
 *
 * La cabecera es la única pieza que está en las seis pantallas y en todos los
 * anchos. Ahí caben, y desde ahí llevan a los tres sitios donde se resuelven.
 *
 * NO ES UNA CAMPANITA CON UN CONTADOR.
 *
 *  · Cuando no hay nada, no hay nada: ni número, ni globo, ni punto gris. La
 *    ausencia de marca ES el mensaje, y es el estado normal.
 *  · Cuando hay algo, sale UN punto, no una cifra. Desde la cabecera lo único
 *    que Iris tiene que decidir es si abrirlo o no, y para eso «hay algo» y
 *    «hay cuatro cosas» valen igual. La cuenta está dentro, con las frases.
 *  · El punto es rojo y no hay dos colores de punto: dos colores serían dos
 *    cosas que aprender, y no se aprende nada que salga una vez al día.
 *
 * Lo que se ve dentro sale de `lib/despacho/avisos.ts`, que es quien decide qué
 * merece ser un aviso. Aquí sólo se pinta y se recuerda cuáles se han callado.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, BOTON_PLANO, NOTA, RAYA, punto, rotulo } from "@/lib/ui";
import {
  avisos as repoAvisos,
  calculaAvisos,
  citas as repoCitas,
  clientes as repoClientes,
  facturas as repoFacturas,
  type Aviso,
} from "@/lib/despacho";
import { IcoAviso } from "../Iconos";

/** El color del punto de cada fila. El color marca, no rellena: un aviso no es
 *  una tarjeta roja, es una fila normal con un punto al canto. */
const COLOR: Record<Aviso["tono"], string> = {
  hoy: "var(--gold)",
  pierde: "var(--red)",
  frio: "var(--text-4)",
};

export default function Avisos() {
  const { view, setView, setClienteAbierto, setFocoFicha, setFacturaAbierta } = useApp();
  const [lista, setLista] = useState<Aviso[]>([]);
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();

  const recargar = useCallback(async () => {
    const [citas, clientes, facturas, vistos] = await Promise.all([
      repoCitas.listar(),
      repoClientes.listar(),
      repoFacturas.listar(),
      repoAvisos.vistos(),
    ]);
    setLista(calculaAvisos({ citas, clientes, facturas, vistos }));
  }, []);

  /*
   * CUÁNDO SE VUELVE A CONTAR.
   *
   * Al montar, cada vez que se cambia de pantalla y cada vez que se abre el
   * panel. No hay ningún temporizador dando vueltas: los avisos salen de lo que
   * Iris misma acaba de escribir, así que el momento en que pueden haber
   * cambiado es justo después de que ella haga algo — y después de hacer algo
   * o cambia de pantalla o abre esto. Un reloj de fondo gastaría batería para
   * llegar al mismo sitio.
   *
   * Leer el disco de este equipo es leer un sistema externo, que es para lo que
   * está el efecto; la regla que se apaga es la misma que en `app-context`.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void recargar();
  }, [recargar, view]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* Escape cierra y el clic fuera cierra: las dos salidas que cualquiera prueba
     sin pensar. Es el mismo comportamiento que la pregunta de `Confirmar`, para
     que las dos cosas que se abren flotando se cierren igual. */
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const alternar = () => {
    // Se recuenta justo al abrir: es el único instante en que Iris está mirando
    // esto, y lo que enseñe tiene que ser de ahora y no de la última pantalla.
    if (!abierto) void recargar();
    setAbierto((a) => !a);
  };

  const callar = async (a: Aviso) => {
    await repoAvisos.marcar([{ id: a.id, sello: a.sello }]);
    await recargar();
  };

  const callarTodos = async () => {
    await repoAvisos.marcar(lista.map(({ id, sello }) => ({ id, sello })));
    await recargar();
    setAbierto(false);
  };

  /** Pulsar un aviso lleva al sitio donde se arregla, con lo suyo ya abierto.
   *  No se marca como visto al pulsarlo: si el problema sigue ahí, el aviso
   *  también tiene que seguir. Se calla cuando se arregla —solo— o cuando Iris
   *  dice que lo ha visto. */
  const ir = (a: Aviso) => {
    setAbierto(false);
    const d = a.destino;
    if (d.pantalla === "agenda") return setView("agenda");
    if (d.pantalla === "clientes") {
      setClienteAbierto(d.clienteId);
      setFocoFicha(d.foco ?? null);
      return setView("clientes");
    }
    setFacturaAbierta(d.facturaId);
    setView("facturas");
  };

  const hay = lista.length;

  return (
    <div ref={caja} style={css("position:relative;flex:none;")}>
      <button
        onClick={alternar}
        title="Avisos"
        aria-label={hay === 0 ? "Avisos: no hay ninguno" : hay === 1 ? "1 aviso" : `${hay} avisos`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        style={css(
          /* El mismo botón redondo de 36 que el tema y la cuenta: en la cabecera
             sólo hay una clase de botón, y así éste se lee como uno más y no
             como un añadido. */
          "position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;cursor:pointer;border:1px solid var(--border-strong);color:var(--text-2);background:" +
            (abierto ? "var(--accion-suave)" : "var(--surface)") +
            ";"
        )}
      >
        <IcoAviso size={17} />
        {hay > 0 && (
          <span
            aria-hidden="true"
            style={css(
              /* El anillo del color del cristal de la cabecera separa el punto
                 del borde del botón: sin él, sobre el borde gris, se lee como
                 una mancha del propio dibujo. */
              "position:absolute;top:-1px;right:-1px;width:9px;height:9px;border-radius:50%;background:var(--red);box-shadow:0 0 0 2px var(--vidrio);"
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            role="dialog"
            aria-label="Avisos"
            initial={quieto ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={quieto ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              /* Fijo a la ventana y no colgado del botón: anclado al botón, en
                 una pantalla de 390 px el panel se salía por la izquierda —el
                 botón está a 40 px del borde derecho y el panel mide 360—. Fijo,
                 se coloca contra la ventana y cabe en cualquier ancho. La
                 cabecera es pegajosa, así que se quedan a la misma altura. */
              "position:fixed;top:60px;right:clamp(12px,3vw,28px);z-index:90;width:min(370px,calc(100vw - 24px));" +
                "max-height:min(72vh,560px);overflow-y:auto;overscroll-behavior:contain;" +
                "background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--r);" +
                "box-shadow:var(--shadow-lg);padding:var(--pad-card-sm);text-align:left;"
            )}
          >
            <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>
              {hay === 0 ? "Avisos" : hay === 1 ? "Una cosa" : `${hay} cosas`}
            </div>

            {hay === 0 ? (
              /* Nunca «sin datos»: qué se va a encontrar aquí cuando lo haya.
                 Es lo único que convierte un hueco en una promesa. */
              <p style={css(APOYO + "margin:0;")}>
                No hay nada esperándote. Cuando tengas algo que no puedas olvidar —una sesión hoy, una nota sin escribir, una
                factura sin emitir— te lo digo aquí.
              </p>
            ) : (
              lista.map((a, i) => (
                <div
                  key={a.id}
                  style={css("display:flex;align-items:flex-start;gap:var(--s2);padding:var(--s3) 0;" + (i ? RAYA : ""))}
                >
                  <span aria-hidden="true" style={css(punto(COLOR[a.tono]) + "margin-top:8px;")} />
                  <button
                    onClick={() => ir(a)}
                    style={css(
                      "flex:1;min-width:0;text-align:left;background:none;border:none;padding:0;cursor:pointer;font-family:inherit;"
                    )}
                  >
                    <span style={css("display:block;font-size:var(--t-body);line-height:1.4;color:var(--text);text-wrap:pretty;")}>
                      {a.titulo}
                    </span>
                    {a.detalle && (
                      <span style={css(NOTA + "display:block;margin-top:3px;line-height:1.45;overflow-wrap:anywhere;")}>
                        {a.detalle}
                      </span>
                    )}
                  </button>
                  {/* Callar uno no borra nada, así que no hace falta preguntar:
                      lo que se pierde es el recordatorio, y vuelve solo si la
                      situación cambia. */}
                  <button
                    onClick={() => void callar(a)}
                    title="Ya lo he visto"
                    aria-label={`Ya he visto: ${a.titulo}`}
                    style={css(
                      "flex:none;width:24px;height:24px;border-radius:50%;border:1px solid var(--border);background:none;color:var(--text-4);cursor:pointer;font-size:var(--t-body);line-height:1;"
                    )}
                  >
                    ×
                  </button>
                </div>
              ))
            )}

            {hay > 1 && (
              <div style={css(RAYA + "margin-top:var(--s3);padding-top:var(--s3);")}>
                <button onClick={() => void callarTodos()} style={css(BOTON_PLANO + "width:100%;")}>
                  Ya lo he visto todo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
