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
 *
 * Y UNA COSA MÁS, QUE ES POR LA QUE ESTO SE TUVO QUE ARREGLAR.
 *
 * Antes, leer era `void recargar()` y `recargar` no tenía red debajo. Si la
 * lectura fallaba —y la manera normal de que falle no es que se caiga internet,
 * es que Firestore conteste «permission-denied» porque las reglas no están
 * publicadas o la ficha de usuario no está activa— la promesa se rompía sola,
 * la lista se quedaba vacía, y la campana enseñaba EXACTAMENTE lo mismo que
 * cuando de verdad no hay nada que decir: nada. Ni punto, ni frase, ni error en
 * la consola. Medido: con la lectura rota, `{hayPunto:false, texto:""}` y cero
 * errores en consola.
 *
 * Eso es el peor fallo que puede tener un avisador, porque su estado bueno y su
 * estado roto se ven igual. Ahora una lectura que falla:
 *  · no borra lo último que se leyó bien —lo de hace un minuto sigue sirviendo—,
 *  · enciende el punto, porque «no sé lo que tienes» es algo que hay que mirar,
 *  · y dentro lo dice con palabras, y dice qué hay que tocar para arreglarlo.
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
  guardadoEnLaNube,
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

/**
 * Por qué no se ha podido leer, dicho como se lo diría a Iris.
 *
 * Firestore contesta con códigos («permission-denied»), y un código en pantalla
 * no le sirve a nadie que no sea yo. Cada uno se traduce a la frase que dice qué
 * pasa Y qué hay que tocar, porque estos tres fallos no los arregla mirar: los
 * arregla alguien entrando en la consola de Firebase.
 */
function porQueNoSePudo(e: unknown): string {
  const codigo = String((e as { code?: string })?.code || "");
  const texto = String((e as { message?: string })?.message || e || "");
  if (codigo.includes("permission-denied") || /permission/i.test(texto)) {
    return "La base de datos no me deja leer tus datos. Falta publicar los permisos de Firestore, o tu usuario todavía no está dado de alta como activo.";
  }
  if (codigo.includes("unauthenticated")) {
    return "La sesión ha caducado. Sal y vuelve a entrar.";
  }
  if (codigo.includes("unavailable") || /network|offline|failed to fetch/i.test(texto)) {
    return "No llego a la base de datos. Puede ser tu conexión: vuelve a entrar en un momento.";
  }
  return texto ? `No he podido leerlo: ${texto}` : "No he podido leer tus datos.";
}

export default function Avisos() {
  const { view, setView, setClienteAbierto, setFocoFicha, setFacturaAbierta } = useApp();
  const [lista, setLista] = useState<Aviso[]>([]);
  /** Null = la última lectura fue bien. Una frase = no se pudo leer, y por qué. */
  const [fallo, setFallo] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();

  const recargar = useCallback(async () => {
    try {
      const [citas, clientes, facturas, vistos] = await Promise.all([
        repoCitas.listar(),
        repoClientes.listar(),
        repoFacturas.listar(),
        repoAvisos.vistos(),
      ]);
      setLista(calculaAvisos({ citas, clientes, facturas, vistos }));
      setFallo(null);
    } catch (e) {
      /* La lista NO se vacía a propósito: si hace un minuto había tres cosas,
         siguen siendo verdad. Lo que cambia es que ahora se dice, arriba del
         todo, que lo que se ve puede estar viejo. */
      setFallo(porQueNoSePudo(e));
      // Y en la consola queda el error entero, que es donde lo voy a buscar yo.
      console.error("[avisos] no se han podido leer los datos", e);
    }
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

  /* Callar también escribe, y escribir también puede que no se pueda. Si no se
     puede, se dice: sin esto, el aviso se quedaba en pantalla después de pulsar
     la × y parecía que el botón no funcionaba. */
  const callar = async (a: Aviso) => {
    try {
      await repoAvisos.marcar([{ id: a.id, sello: a.sello }]);
    } catch (e) {
      setFallo(porQueNoSePudo(e));
      console.error("[avisos] no se ha podido marcar como visto", e);
      return;
    }
    await recargar();
  };

  const callarTodos = async () => {
    try {
      await repoAvisos.marcar(lista.map(({ id, sello }) => ({ id, sello })));
    } catch (e) {
      setFallo(porQueNoSePudo(e));
      console.error("[avisos] no se han podido marcar como vistos", e);
      return;
    }
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
  /* El punto se enciende también cuando no se ha podido leer. «No sé lo que
     tienes» es una cosa que hay que mirar, igual que una sesión de hoy. */
  const marca = hay > 0 || !!fallo;

  return (
    <div ref={caja} style={css("position:relative;flex:none;")}>
      <button
        onClick={alternar}
        title={fallo ? "Avisos: no he podido leerlos" : "Avisos"}
        aria-label={
          fallo
            ? "Avisos: no he podido leerlos"
            : hay === 0
              ? "Avisos: no hay ninguno"
              : hay === 1
                ? "1 aviso"
                : `${hay} avisos`
        }
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
        {marca && (
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
            <div style={css(rotulo(fallo ? "var(--red)" : "var(--gold)") + "margin-bottom:var(--s3);")}>
              {fallo ? "No he podido mirar" : hay === 0 ? "Avisos" : hay === 1 ? "Una cosa" : `${hay} cosas`}
            </div>

            {/* El fallo va ARRIBA y por delante de todo: si lo que hay debajo
                puede estar viejo, eso se sabe antes de leerlo, no después. */}
            {fallo && (
              <div
                style={css(
                  "display:flex;gap:var(--s2);align-items:flex-start;padding:var(--s3);margin-bottom:var(--s3);" +
                    "border:1px solid var(--red-border);border-radius:var(--r-sm);background:var(--red-soft);"
                )}
              >
                <span aria-hidden="true" style={css(punto("var(--red)") + "margin-top:8px;")} />
                <div style={css("flex:1;min-width:0;")}>
                  <p style={css("margin:0;font-size:var(--t-body);line-height:1.45;color:var(--text);text-wrap:pretty;")}>
                    {fallo}
                  </p>
                  {hay > 0 && (
                    <p style={css(NOTA + "margin:6px 0 0;line-height:1.45;")}>
                      Lo de aquí abajo es lo último que sí pude leer. Puede que ya no sea de ahora.
                    </p>
                  )}
                  <button onClick={() => void recargar()} style={css(BOTON_PLANO + "margin-top:var(--s2);")}>
                    Volver a intentarlo
                  </button>
                </div>
              </div>
            )}

            {fallo && hay === 0 ? null : hay === 0 ? (
              /* Nunca «sin datos»: qué se va a encontrar aquí cuando lo haya.
                 Es lo único que convierte un hueco en una promesa. */
              <>
                <p style={css(APOYO + "margin:0;")}>
                  No hay nada esperándote. Cuando tengas algo que no puedas olvidar —una sesión hoy, una nota sin escribir, una
                  factura sin emitir— te lo digo aquí.
                </p>
                {/*
                 * Y AQUÍ SE DICE LA OTRA MANERA DE QUE ESTO SALGA VACÍO SIEMPRE.
                 *
                 * Sin Firebase, la plataforma lee el disco de ESTE navegador. Las
                 * sesiones que alguien pide por la web no se guardan ahí: se
                 * guardan en la nube. Así que el aviso más importante que tiene
                 * esto —«han pedido sesión»— no puede llegar nunca, y la campana
                 * se queda en silencio para siempre sin que nada parezca roto.
                 * Es la causa número uno de «las notificaciones no dan», y no se
                 * arregla mirando: se arregla poniendo las claves en Vercel.
                 */}
                {!guardadoEnLaNube && (
                  <p style={css(NOTA + "margin:var(--s3) 0 0;line-height:1.45;")}>
                    Ojo: esta plataforma no está conectada a la base de datos, así que sólo ve lo que hayas escrito tú en este
                    mismo navegador. Las sesiones que te pidan desde la web no van a aparecer aquí hasta que se conecte.
                  </p>
                )}
              </>
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
