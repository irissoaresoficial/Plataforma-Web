"use client";
import { useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { BOTON_NORMAL, botonPrincipal } from "@/lib/ui";
import { useApp } from "@/lib/app-context";
import { construyeCapitulos, construyeCapitulosEmpresa, resultadoEnIdioma } from "@/lib/estudio";
import { useExportar, AVISO_SIN_DIALOGO } from "@/lib/imprimir";
import { cargaApuntes } from "@/lib/kdata";
import { EN_ESPANOL, IDIOMAS, diccionario, type Idioma } from "@/lib/documento";
import { useIdiomaDocumento } from "@/lib/documento/idioma";
import { fechaLarga, titulo } from "@/lib/format";
import BloqueView from "../estudio/BloqueView";
import HojaCliente from "../estudio/HojaCliente";
import HojaClienteEmpresa from "../estudio/HojaClienteEmpresa";
import styles from "../estudio/Estudio.module.css";
import Confirmar from "../Confirmar";
import GuiaApple from "../GuiaApple";

export default function EstudioScreen() {
  const { r, re, marca, txt, guardaEdit, restablecer, edits, id } = useApp();
  // Dos documentos distintos con el mismo botón de imprimir: el estudio
  // entero, que es la herramienta de Iris, y la hoja que se lleva el cliente.
  const [modo, setModo] = useState<"estudio" | "hoja">("estudio");
  /* En qué idioma sale la hoja que se le manda a la persona. La plataforma
     sigue en español —Iris trabaja en español— y lo único que cambia de idioma
     es el documento que se entrega. Se recuerda de una sesión a otra: quien
     atiende sobre todo a clientela portuguesa lo pone una vez. */
  const [idioma, setIdioma] = useIdiomaDocumento();
  /* Exportar: el botón, el aviso de que el diálogo no ha salido y el consejo
     que toca según el aparato. Los tres botones de exportar de la plataforma
     —estudio, pareja y factura— usan esta misma pieza, para que en la tablet
     los tres digan lo mismo en vez de quedarse callados dos de ellos. */
  const { exporta, sinDialogo, trasPulsar, ayuda, ayudaCabeceras, guiaApple, cierraGuia } = useExportar();

  /*
   * LOS APUNTES DEL IDIOMA SE PIDEN ANTES DE ARMAR EL ESTUDIO.
   *
   * Pesan 292 KB por idioma, así que no viajan en el paquete que descarga todo
   * el mundo al abrir la plataforma: se traen la primera vez que alguien pide
   * un documento en ese idioma (ver `cargaApuntes` en `lib/kdata.ts`). Mientras
   * llegan, `listo` se queda atrás y el estudio se arma en español — que es
   * exactamente lo que se quiere: el documento nunca está vacío, sólo tarda un
   * momento en cambiar de idioma.
   */
  const [listo, setListo] = useState<Idioma>("es");
  const cargando = listo !== idioma;
  /* La misma excepción que en `documento/idioma`: volver al español no espera a
     nadie —los apuntes de casa vienen en el paquete— así que aquí sí se pone el
     estado dentro del efecto, y es una sola vez por cambio de idioma. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let vivo = true;
    if (idioma === "es") {
      setListo("es");
      return;
    }
    cargaApuntes(idioma).then(() => {
      /* `vivo` porque alguien puede cambiar de idioma dos veces seguidas: sin
         esto, la respuesta lenta del primero pisaría al segundo. */
      if (vivo) setListo(idioma);
    });
    return () => {
      vivo = false;
    };
  }, [idioma]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const capitulos = useMemo(
    () => (r ? construyeCapitulos(r, listo) : re ? construyeCapitulosEmpresa(re, listo) : []),
    [r, re, listo],
  );
  /* Los dibujos no reciben capítulos: pintan el resultado tal cual, con el
     nombre de cada carta y de cada eje dentro. Así que necesitan el resultado
     leído de los apuntes del idioma, no el del panel, que es el español. */
  const rDoc = useMemo(() => (r ? resultadoEnIdioma(r, listo) : null), [r, listo]);
  if (!r && !re) return null;

  /* La portada y los diagramas también hablan. Salen del mismo diccionario que
     los capítulos, y con el idioma YA DESCARGADO (`listo`) y no con el pedido:
     si la portada cambiara antes que el cuerpo, el documento se vería un
     instante con la cubierta en inglés y las páginas en español. */
  const D = diccionario(listo);

  const hoja = modo === "hoja";
  const empresa = !!re;
  const nombreTexto = (r ?? re!).nombre.texto;
  /* Cuántos párrafos ha reescrito Iris en ESTE estudio. Se cuenta para poder
     decírselo antes de borrarlos: la diferencia entre «¿estás seguro?» y «vas a
     perder veinte párrafos» es la diferencia entre una pregunta que se contesta
     que sí sin leerla y una que se piensa. Y si no ha tocado nada, el botón de
     descartar ni siquiera aparece: no hay nada que descartar. */
  const misCambios = id && edits[id] ? Object.keys(edits[id]).length : 0;

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
                      /* La elegida en granate; las otras, papel. Lo que está
                         elegido y lo que se pulsa comparten color a propósito:
                         es la misma idea —«esto es lo activo»— y tenerla en dos
                         colores distintos es lo que obliga a aprenderse la
                         pantalla en vez de mirarla. */
                      ? "border:1px solid var(--accion);background:var(--accion);color:var(--sobre-accion);"
                      : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);")
                )}
              >
                <span style={css("font-size:var(--t-body);font-weight:600;letter-spacing:-.01em;")}>{label}</span>
                <span style={css("font-size:var(--t-mini);color:" + (on ? "color-mix(in srgb, var(--sobre-accion) 74%, transparent)" : "var(--text-4)") + ";")}>{pie}</span>
              </button>
            );
          })}
        </div>
        <span className={styles.hint} style={css("font-size:var(--t-body);color:var(--text-4);")}>
          {hoja
            ? `Una página, sin fórmulas ni claves: lo que se lleva la persona. Sale en ${EN_ESPANOL[idioma]}.`
            : `Haz clic en cualquier párrafo para reescribirlo con tus palabras. Sale en ${EN_ESPANOL[idioma]}.`}
        </span>
        {/* Las acciones envuelven de verdad en el móvil.
            Con `margin-left:auto` los dos botones se pegaban al borde derecho y
            en una pantalla de 390 px el documento se podía desplazar de lado:
            «Exportar PDF» quedaba medio fuera. La barra sigue empujando a la
            derecha cuando hay sitio, pero por debajo de 700 px los dos botones
            pasan a ocupar el renglón entero, uno al lado del otro. */}
        <div className={styles.acciones}>
          {/* EN QUÉ IDIOMA SALE EL DOCUMENTO.
           *
           * Tres pastillas y no un desplegable: el idioma en el que va a salir
           * la hoja tiene que verse sin abrir nada y sin pulsar nada. Un
           * desplegable enseña el elegido pero esconde que hay otros dos, y
           * este es justo el ajuste que se olvida —se manda un estudio en
           * portugués a una clienta de Madrid y no se ve hasta que ella lo
           * abre—. Puestas al lado del botón de exportar, se leen a la vez que
           * él: aquí se pulsa, y esto es lo que sale.
           *
           * Valen para los dos documentos. El estudio completo también sale en
           * los tres idiomas —los apuntes de la escuela, y desde ahora también
           * la portada, los rótulos y las frases de la casa—, así que el
           * selector no promete nada que no exista. La PLATAFORMA sigue en
           * español: lo que cambia de idioma es lo que se entrega.
           */}
          {(
            <div role="group" aria-label="Idioma del documento" style={css("display:flex;gap:4px;flex:none;")}>
              {IDIOMAS.map(({ codigo, etiqueta }) => {
                const on = idioma === codigo;
                return (
                  <button
                    key={codigo}
                    onClick={() => setIdioma(codigo)}
                    aria-pressed={on}
                    style={css(
                      "padding:9px 14px;border-radius:980px;cursor:pointer;white-space:nowrap;font-family:var(--font-ui);font-size:var(--t-body);font-weight:590;letter-spacing:-.01em;transition:background .18s,border-color .18s,color .18s;" +
                        /* El granate de la casa es el color de lo que se pulsa y
                           de lo que está elegido; las otras dos, papel con
                           borde, que se siguen leyendo bien. */
                        (on
                          ? "border:1px solid var(--accion);background:var(--accion);color:var(--sobre-accion);"
                          : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);")
                    )}
                  >
                    {etiqueta}
                  </button>
                );
              })}
            </div>
          )}
          {/* El botón sólo existe si hay algo que descartar, y dice de quién es
              lo que se pierde. Decía «Restablecer textos», que suena a devolver
              algo a su sitio; lo que hace es tirar el trabajo de Iris. */}
          {!hoja && misCambios > 0 && (
            <Confirmar
              estilo={BOTON_NORMAL}
              pregunta={`Vas a descartar ${misCambios === 1 ? "el párrafo que has reescrito" : `los ${misCambios} párrafos que has reescrito`} de ${titulo(nombreTexto)} y volver al texto de fábrica. Esto no se puede deshacer.`}
              confirmar="Sí, descartar"
              alConfirmar={restablecer}
            >
              Descartar mis cambios
            </Confirmar>
          )}
          <button
            /* Si el navegador no ha podido abrir el diálogo, hay que DECIRLO.
               Antes se ignoraba lo que devuelve `imprimir()` y el botón se
               quedaba mudo — que es exactamente lo que pasaba en la tablet: se
               pulsaba, no ocurría nada, y no había forma de saber si el fallo
               era del botón, del documento o del aparato. */
            onClick={exporta}
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
          {ayudaCabeceras}
        </span>
        {/* En un aparato de Apple la ruta de Compartir no es el plan B: muchas
            veces es el único. Por eso la ayuda que se enseña depende de dónde
            se está, en vez de ser la misma frase para todos. */}
        <span style={css("flex-basis:100%;font-size:var(--t-mini);color:var(--text-4);")}>{ayuda}</span>
        {sinDialogo && (
          <span role="alert" style={css("flex-basis:100%;font-size:var(--t-mini);color:var(--red);")}>
            {AVISO_SIN_DIALOGO}
          </span>
        )}
        {trasPulsar && (
          <span role="status" style={css("flex-basis:100%;font-size:var(--t-mini);color:var(--text-3);")}>
            {trasPulsar}
          </span>
        )}
        {guiaApple && <GuiaApple alCerrar={cierraGuia} />}
        {/* Mientras se descargan los apuntes del idioma. Son 292 KB y en una
            conexión lenta se nota; sin decir nada, el documento se quedaría un
            momento en español y parecería que el selector no funciona. */}
        {cargando && (
          <span style={css("flex-basis:100%;font-size:var(--t-mini);color:var(--text-4);")}>
            Trayendo los apuntes en {EN_ESPANOL[idioma]}…
          </span>
        )}
      </div>

      <div className={styles.desk}>
        {hoja && (r ? <HojaCliente r={r} marca={marca} idioma={idioma} /> : <HojaClienteEmpresa re={re!} marca={marca} idioma={idioma} />)}
        {!hoja && <section className={`${styles.page} ${styles.portada}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="" style={css("width:210px;height:210px;border-radius:50%;object-fit:cover;margin-bottom:34px;")} />
          <div style={css("font-weight:590;font-size:var(--t-mini);color:#9A7F32;")}>{marca}</div>
          <div style={css("width:78px;height:1px;background:var(--gold);margin:26px 0;")} />
          <div style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:#6B6478;")}>
            {empresa ? D.estudio.portadaEmpresa : D.estudio.portadaPersonal}
          </div>
          <h1 style={css("font-family:var(--font-ui);font-weight:700;font-size:var(--t-hero);line-height:1.22;letter-spacing:-.022em;color:#2B1119;margin:30px 0 0;max-width:560px;")}>{titulo(nombreTexto)}</h1>
          <div style={css("font-family:var(--font-ui);font-size:var(--t-title);font-style:italic;color:#7A7288;margin-top:var(--s4);")}>
            {r ? fechaLarga(r.fecha.dia, r.fecha.mes, r.fecha.anio, D.locale) : D.estudio.portadaSinFecha}
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
                  <h2 style={css("font-family:var(--font-ui);font-weight:700;font-size:var(--t-head);line-height:1.2;letter-spacing:-.022em;color:#2B1119;margin:0;")}>{cap.titulo}</h2>
                </div>
              )}
              {cap.bloques.map((b, bi) => (
                <BloqueView key={bi} b={b} r={rDoc} txt={txt} guardaEdit={guardaEdit} idioma={listo} />
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
