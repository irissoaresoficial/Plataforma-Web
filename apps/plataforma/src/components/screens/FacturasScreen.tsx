"use client";

/**
 * LAS FACTURAS
 *
 * Emitir una por una sesión o por un curso, verla y descargarla. Y tres reglas
 * que no son de diseño sino de la cosa en sí:
 *
 *  1. LOS DATOS FISCALES DEL EMISOR SE ESCRIBEN AQUÍ. Estaban en el código y la
 *     pantalla enseñaba la ruta del archivo, que es tanto como pedirle a una
 *     numeróloga que edite TypeScript para poder cobrar. Ahora hay un
 *     formulario. Lo que no cambia: mientras falte cualquiera de los tres —
 *     nombre, NIF y domicilio— se pueden guardar borradores pero NO emitir. No
 *     es una limitación nuestra, es la ley, y lo que falta sale marcado aquí y
 *     en la propia hoja en vez de inventarse.
 *
 *  2. LA NUMERACIÓN ES CORRELATIVA Y SIN HUECOS. El número no se reserva al
 *     empezar a escribir: se asigna al emitir. Por eso un borrador se puede
 *     tirar a la basura sin dejar hueco — no llegó a tener número.
 *
 *  3. UNA FACTURA EMITIDA NO SE BORRA. Se anula, y su número se queda ocupado.
 *     Borrarla dejaría un agujero en la serie, y una serie con agujeros no
 *     vale: no hay forma de demostrar qué había en el número que falta. Por eso
 *     esta pantalla no ofrece «borrar» sobre nada que esté emitido; ofrece
 *     «anular», y la regla la vuelve a comprobar el repositorio.
 *
 * Como las otras dos, no toca `localStorage`: habla con `lib/despacho`.
 */

import { subeArriba } from "@/lib/arriba";
import Rescate from "../despacho/Rescate";
import { useCallback, useEffect, useRef, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, BOTON_NORMAL, BOTON_PLANO, CABECERA, NOTA, PAD, RAYA, TARJETA, TITULO, botonPrincipal, rotulo } from "@/lib/ui";
import { useExportar, AVISO_SIN_DIALOGO } from "@/lib/imprimir";
import GuiaApple from "../GuiaApple";
import {
  clientes as repoClientes,
  facturas as repoFacturas,
  cargaEmisor,
  claveDia,
  emisorCargado,
  emisorCompleto,
  euros,
  falta,
  faltaDelEmisor,
  fechaDeFactura,
  guardaEmisor,
  nuevoId,
  numeroDe,
  sinTildes,
  totales,
  EMISOR,
  type Cliente,
  type DatosFiscales,
  type Factura,
} from "@/lib/despacho";
import { AvisoNavegador, useEstrecho, useLlevaAlDetalle } from "../despacho/Piezas";
import HojaFactura from "../despacho/HojaFactura";
import Mesa, { VerGrande } from "../despacho/Mesa";
import Control from "../despacho/Control";
import Resumen from "../despacho/Resumen";
import Plantillas, { GuardarPlantilla, usePlantillas } from "../despacho/Plantillas";
import { PLANTILLAS_CASA, baseDesdeFinal, type Plantilla } from "@/lib/despacho/plantillas";

/** El IVA de Iris: el 21 %, confirmado por Ger el 15 de noviembre de 2026.
 *  Sólo factura a particulares, así que no lleva retención de IRPF. Se puede
 *  cambiar en el formulario por si un día factura algo distinto. */
const IVA_GENERAL = 21;

function facturaVacia(fecha: string): Factura {
  return {
    id: nuevoId(),
    serie: fecha.slice(0, 4),
    numero: 0,
    fecha,
    estado: "borrador",
    cliente: { nombre: "", nif: "", direccion: "" },
    clienteId: null,
    // Nulo hasta que se emita: entonces se congela el emisor de ese momento.
    emisor: null,
    lineas: [{ concepto: "Sesión individual", cantidad: 1, precio: 0 }],
    iva: IVA_GENERAL,
    notas: "",
    creada: new Date().toISOString(),
  };
}

/**
 * Los datos fiscales, preparados para escribirse encima.
 *
 * Lo que falta vale `PENDIENTE` por dentro —es la palabra que usa toda la casa
 * para «esto no tiene valor todavía»— y esa palabra no puede aparecer dentro de
 * un campo de texto: quien la vea escrita creerá que ya hay algo puesto y
 * borrará una letra de más. En el formulario, lo que falta es un hueco vacío.
 */
const paraEditar = (d: DatosFiscales): DatosFiscales => ({
  nombre: falta(d.nombre) ? "" : d.nombre,
  nif: falta(d.nif) ? "" : d.nif,
  direccion: falta(d.direccion) ? "" : d.direccion,
});

const COLOR_ESTADO: Record<Factura["estado"], string> = {
  borrador: "var(--gold)",
  emitida: "var(--green)",
  anulada: "var(--red)",
};

export default function FacturasScreen() {
  const { marca, setView, setClienteAbierto, facturaAbierta, setFacturaAbierta, recado, setRecado } = useApp();

  /* Descargar la factura es imprimir, igual que el estudio: misma pieza, mismo
     aviso si el navegador no abre el diálogo. */
  const { exporta, sinDialogo, trasPulsar, ayuda, guiaApple, cierraGuia, enApp, aSafari } = useExportar();
  const [lista, setLista] = useState<Factura[]>([]);
  const [gente, setGente] = useState<Cliente[]>([]);
  const [abierta, setAbierta] = useState<Factura | null>(null);
  const [borrador, setBorrador] = useState<Factura | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [anulando, setAnulando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(true);
  /** Tres pestañas: el resumen —lo primero que se ve—, las facturas y los gastos. */
  const [apartado, setApartado] = useState<"resumen" | "facturas" | "gastos">("resumen");
  /** Las plantillas de factura: las de la casa y las que ha guardado Iris. */
  const { propias, setPropias } = usePlantillas();
  const [elegida, setElegida] = useState<string | null>(null);

  /*
   * LA VENTANA PARTIDA. Por debajo de 900 px no cabe: va el formulario y el
   * folio se abre en grande. Por encima, cada mitad tiene su propio
   * desplazamiento, así que el editor mide justo lo que queda de ventana —si
   * midiera más, se desplazaría la ventana entera y el folio se iría con ella.
   */
  const estrecho = useEstrecho(900);
  const [grande, setGrande] = useState(false);
  const editor = useRef<HTMLDivElement>(null);
  const [altoEditor, setAltoEditor] = useState(640);
  useEffect(() => {
    if (apartado !== "facturas" || estrecho) return;
    const mide = () => {
      const el = editor.current;
      if (!el) return;
      const arriba = el.getBoundingClientRect().top;
      const v = el.closest<HTMLElement>("[data-ventana]");
      if (v) {
        /* Lo que queda de ventana: su alto, menos lo que hay encima del
           editor, menos el relleno de abajo de la ventana y el de la pantalla. */
        const dentro = arriba - v.getBoundingClientRect().top + v.scrollTop;
        const relleno = (x: Element | null) => (x ? parseFloat(getComputedStyle(x).paddingBottom) || 0 : 0);
        setAltoEditor(Math.max(460, Math.floor(v.clientHeight - dentro - relleno(v) - relleno(el.closest("main")) - 2)));
      } else {
        setAltoEditor(Math.max(460, Math.floor(window.innerHeight - arriba - 24)));
      }
    };
    mide();
    window.addEventListener("resize", mide);
    return () => window.removeEventListener("resize", mide);
  }, [apartado, estrecho, cargando]);

  /** Una factura nueva recién abierta, sin guardar y sin nada escrito. */
  const borradorIntacto =
    !abierta &&
    !!borrador &&
    !lista.some((f) => f.id === borrador.id) &&
    !borrador.cliente.nombre.trim() &&
    borrador.lineas.every((l) => !l.precio);

  /** Pulsar un texto del folio lleva a su campo del formulario. */
  const vaAlCampo = (campo: string) => {
    const el = document.querySelector<HTMLElement>(`[data-campo-input="${campo}"]`);
    if (!el) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: quieto ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  };


  /*
   * LOS DATOS FISCALES, QUE AHORA SE ESCRIBEN AQUÍ.
   *
   * `mios` es el borrador de los tres campos mientras se están escribiendo, y
   * `sello` sube cada vez que se guardan de verdad: es lo que obliga a esta
   * pantalla a releer `EMISOR` —que es un objeto que se muta, no un estado de
   * React— y a que el botón de emitir se encienda en el acto en vez de al
   * siguiente clic en cualquier otra cosa.
   */
  const [mios, setMios] = useState<DatosFiscales | null>(null);
  const [abriendoDatos, setAbriendoDatos] = useState(false);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [falloDatos, setFalloDatos] = useState("");
  const [sello, setSello] = useState(0);

  /* `sello` se lee aquí para que quede escrito de qué depende este cálculo:
     `EMISOR` es un objeto que se muta —ver la cabecera de `emisor.ts`—, así que
     nada de lo que React vigila cambia al guardarlo. Sin un estado que suba, el
     botón de emitir se quedaría apagado con los datos ya escritos. */
  const completo = sello >= 0 && emisorCompleto();
  const huecos = faltaDelEmisor();
  /* Hasta que termina la primera carga no se sabe si faltan o no. Acusar a
     alguien de no haber rellenado algo que sí rellenó es la peor forma de
     saludar, así que mientras tanto no se dice nada. */
  const sabemosDelEmisor = emisorCargado();

  const recargar = useCallback(async () => {
    const [f, g] = await Promise.all([repoFacturas.listar(), repoClientes.listar()]);
    setLista(f);
    setGente(g);
    setCargando(false);
  }, []);

  /* Como en las otras pantallas: el disco de este equipo no se puede leer en el
     primer render porque el servidor no lo ve. Y la fecha de hoy tampoco puede
     sembrarse en el estado inicial — el servidor puede estar en otro día. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void recargar();
    setBorrador(facturaVacia(claveDia(new Date())));
    /* Y los datos fiscales, que viven en la nube o en el navegador igual que
       todo lo demás. Al volver se sube el sello: es lo único que hace que la
       pantalla se entere de que `EMISOR` ya no está vacío. */
    void cargaEmisor().then((d) => {
      setMios(paraEditar(d));
      setSello((n) => n + 1);
    });
  }, [recargar]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Lo que se está viendo: una factura ya emitida, o el borrador en curso. */
  const enPantalla = abierta ?? borrador;
  // En móvil la factura elegida sale debajo de la lista, fuera de pantalla.
  const alDetalle = useLlevaAlDetalle(abierta?.id);

  const nueva = () => {
    setAbierta(null);
    setAnulando(false);
    setMensaje("");
    setElegida(null);
    setBorrador(facturaVacia(claveDia(new Date())));
  };

  /*
   * ELEGIR UNA PLANTILLA. Las de la casa traen lo que paga la clienta y aquí se
   * saca la base con el IVA que tenga la factura —también las que Iris crea
   * con nombre y precio—; las guardadas desde una factura traen sus líneas.
   */
  const aplicaPlantilla = (p: Plantilla) => {
    if (!borrador) return;
    setElegida(p.id);
    if (p.precioFinal == null && p.lineas) {
      cambia({ lineas: p.lineas.map((l) => ({ ...l })), iva: p.iva ?? borrador.iva });
      setMensaje("");
      return;
    }
    const precio = p.precioFinal == null ? 0 : baseDesdeFinal(p.precioFinal, borrador.iva);
    cambia({ lineas: [{ concepto: p.concepto, cantidad: 1, precio }] });
    setMensaje("");
  };

  /** Si cambia el IVA con una plantilla de la casa puesta, la base se recalcula
   *  para que la clienta siga pagando lo anunciado. Si ya se ha tocado la línea,
   *  no: entonces manda lo que Iris haya escrito. */
  const cambiaIva = (iva: number) => {
    if (!borrador) return;
    const p = [...PLANTILLAS_CASA, ...propias].find((x) => x.id === elegida);
    const intacta = p && p.precioFinal != null && borrador.lineas.length === 1 && borrador.lineas[0].concepto === p.concepto && borrador.lineas[0].cantidad === 1;
    if (p && p.precioFinal != null && intacta) cambia({ iva, lineas: [{ ...borrador.lineas[0], precio: baseDesdeFinal(p.precioFinal, iva) }] });
    else cambia({ iva });
  };

  const abrir = (f: Factura) => {
    setAnulando(false);
    setMensaje("");
    if (f.estado === "borrador") {
      // Un borrador se sigue escribiendo; una emitida sólo se mira.
      setAbierta(null);
      setBorrador(f);
    } else {
      setAbierta(f);
    }
  };

  const cambia = (parte: Partial<Factura>) => setBorrador((b) => (b ? { ...b, ...parte } : b));

  /** Al escribir el nombre se busca en los clientes: si está fichado, su NIF y
   *  su domicilio entran solos y no hay que teclearlos cada vez. */
  const cambiaCliente = (nombre: string) => {
    const encontrado = gente.find((g) => sinTildes(g.nombre) === sinTildes(nombre));
    setBorrador((b) =>
      b
        ? {
            ...b,
            clienteId: encontrado?.id ?? null,
            cliente: encontrado
              ? { nombre: encontrado.nombre, nif: encontrado.nif ?? "", direccion: encontrado.direccion ?? "" }
              : { ...b.cliente, nombre },
          }
        : b
    );
  };

  /*
   * LOS RECADOS QUE LLEGAN DE OTRA PANTALLA.
   *
   * Dos, y los dos vienen de fuera: «abre ESTA factura» —lo manda el aviso de
   * la cabecera cuando un borrador lleva días parado, y el botón «Abrirla» de
   * la ficha de un cliente— y «hazle una factura a ESTA persona», que lo manda
   * la ficha. Sin esto, los dos botones sólo cambiarían de pantalla y dejarían
   * a Iris buscando en la lista lo que ella acaba de señalar.
   *
   * Se consumen y se apagan en el acto: son un recado, no un estado. Si se
   * quedaran puestos, cada vuelta a Facturas reabriría lo mismo.
   *
   * Se espera a que esté leído el disco: sin la lista no se sabe qué factura es
   * la del identificador, y sin los clientes no se pueden traer solos el NIF y
   * el domicilio de quien se va a facturar.
   */
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (cargando) return;
    if (facturaAbierta) {
      const f = lista.find((x) => x.id === facturaAbierta);
      /* Un recado de otra pantalla va a una factura concreta: se salta a la
         pestaña de Facturas, o se abriría detrás del Resumen sin verse. */
      if (f) {
        setApartado("facturas");
        abrir(f);
      }
      setFacturaAbierta(null);
      return;
    }
    if (recado) {
      setApartado("facturas");
      nueva();
      cambiaCliente(recado);
      setRecado(null);
    }
  }, [cargando, facturaAbierta, recado, lista]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  /*
   * GUARDAR LOS DATOS FISCALES.
   *
   * Se enseña el fallo y no se cierra el formulario si algo va mal: si Iris
   * escribe su NIF, ve que se guarda y no se guardó, la siguiente factura sale
   * sin él — con número puesto y sin poder borrarla.
   */
  const guardarMisDatos = async () => {
    if (!mios) return;
    setGuardandoDatos(true);
    setFalloDatos("");
    try {
      await guardaEmisor(mios);
      setSello((n) => n + 1);
      setAbriendoDatos(false);
    } catch (e) {
      setFalloDatos(e instanceof Error ? e.message : "No se han podido guardar.");
    } finally {
      setGuardandoDatos(false);
    }
  };

  const guardarBorrador = async () => {
    if (!borrador) return;
    try {
      await repoFacturas.guardar(borrador);
      setMensaje("Borrador guardado. No es una factura todavía: no tiene número.");
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido guardar.");
    }
  };

  const emitir = async () => {
    if (!borrador) return;
    try {
      // Se guarda antes de emitir para que lo que se numere sea exactamente lo
      // que hay en pantalla, y no una versión anterior.
      await repoFacturas.guardar(borrador);
      const emitida = await repoFacturas.emitir(borrador.id);
      setAbierta(emitida);
      setMensaje(`Emitida la factura ${numeroDe(emitida)}. Ya no se puede cambiar: si está mal, anúlala y haz otra.`);
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido emitir.");
    }
  };

  const tirarBorrador = async () => {
    if (!borrador) return;
    try {
      await repoFacturas.borrar(borrador.id);
      setMensaje("Borrador tirado. Como no tenía número, la numeración sigue seguida.");
      nueva();
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido tirar.");
    }
  };

  const confirmarAnular = async () => {
    if (!abierta) return;
    try {
      const anulada = await repoFacturas.anular(abierta.id, motivo);
      setAbierta(anulada);
      setAnulando(false);
      setMotivo("");
      setMensaje(`La ${numeroDe(anulada)} queda anulada. Su número sigue ocupado: la serie no se rompe.`);
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido anular.");
    }
  };

  const entrada = "width:100%;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

  const campo = (etiqueta: string, hijo: React.ReactNode) => (
    <label style={css("display:flex;flex-direction:column;gap:5px;min-width:0;")}>
      <span style={css(rotulo())}>{etiqueta}</span>
      {hijo}
    </label>
  );

  return (
    <main
      style={css(
        /* En el editor partido el relleno de abajo es corto: cada mitad ya se
           desplaza por su cuenta, y un margen grande debajo sería un hueco. */
        "max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) " + (apartado === "facturas" && !estrecho ? "var(--s4)" : "var(--s8)") + ";"
      )}
    >
      <div data-chrome="1">
        {/* EL TÍTULO Y LAS PESTAÑAS EN UNA SOLA LÍNEA. Apilados se comían
            casi 300 px de alto, y en el editor ese alto es el del folio. */}
        <div style={css("display:flex;align-items:center;gap:var(--s3) var(--gap);flex-wrap:wrap;margin-bottom:var(--gap);")}>
          <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;min-width:0;")}>
            <h1 style={css(CABECERA + "margin:0;")}>Facturas</h1>
            <p style={css(NOTA + "margin:0;")}>
              {apartado === "resumen"
                ? "Cómo va el trimestre, de un vistazo."
                : apartado === "facturas"
                  ? "Numeradas seguidas, sin saltarse ninguna."
                  : "Lo que pagas por tu trabajo, con su tique."}
            </p>
          </div>
        {/* Tres pestañas. La elegida va en vino suave y no sólido: el vino
            lleno es del botón principal, y sólo hay uno por pantalla. */}
        <div
          role="tablist"
          aria-label="Resumen, facturas o gastos"
          style={css(
            "display:flex;gap:6px;margin-left:" + (estrecho ? "0" : "auto") + ";padding:5px;border-radius:var(--r-pill);background:var(--surface);border:1px solid var(--border);width:max-content;max-width:100%;box-shadow:var(--shadow-sm);"
          )}
        >
          {(
            [
              ["resumen", "Resumen"],
              ["facturas", "Facturas"],
              ["gastos", "Gastos"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={apartado === k}
              onClick={() => setApartado(k)}
              style={css(
                "padding:8px 18px;border:none;border-radius:var(--r-pill);cursor:pointer;font:inherit;font-size:var(--t-mini);font-weight:500;white-space:nowrap;" +
                  (apartado === k ? "background:var(--accion-suave);color:var(--accion);" : "background:transparent;color:var(--text-2);")
              )}
            >
              {label}
            </button>
          ))}
        </div>
        </div>
        {apartado === "resumen" && (
          <Resumen
            facturas={lista}
            onNuevaFactura={() => {
              nueva();
              setApartado("facturas");
            }}
            onApuntarGasto={() => setApartado("gastos")}
            onVerFacturas={() => setApartado("facturas")}
            onVerGastos={() => setApartado("gastos")}
          />
        )}
        {apartado === "gastos" && <Control facturas={lista} />}
        {apartado === "facturas" && <Rescate facturas />}

        {/* ------------------------------------------------ quién factura */}
        {/*
            ANTES: UN AVISO ROJO CON LA RUTA DE UN ARCHIVO .TS DENTRO.

            Decía «se escriben en un solo sitio: src/lib/despacho/emisor.ts».
            Es decir: la plataforma le estaba pidiendo a una numeróloga que
            abriera un archivo de TypeScript y volviera a desplegar antes de
            poder cobrar su primera factura. Un aviso que no se puede atender
            desde la propia pantalla no es un aviso: es un muro con un cartel.

            Ahora es un formulario. Y sigue siendo lo primero de la pantalla
            SÓLO mientras falte algo — en cuanto los tres estén, se pliega a un
            renglón que se puede volver a abrir para corregirlos, porque un NIF
            se cambia una vez cada muchos años y no puede ocupar el sitio del
            trabajo de todos los días.

            La regla no se ha tocado: sin los tres se guardan borradores pero no
            se emite. Eso no es una limitación nuestra, es la ley española, y
            está dicho junto al botón apagado, que es donde hace falta leerlo.
        */}
        {/* Y CON LOS DATOS COMPLETOS, NADA (15 de noviembre de 2026). Ger: «quita
            eso y déjalo ya por defecto». Los datos de Iris vienen puestos en
            `emisor.ts` y salen en la propia factura, que es donde se leen.
            Esto sólo vuelve a pintarse si faltara alguno —para no dejar el
            botón de emitir apagado sin explicación— o si se abre desde el
            aviso de junto a ese botón. */}
        {apartado === "facturas" && sabemosDelEmisor && mios && (!completo || abriendoDatos) && (
          /* UNA LÍNEA, NO UN BLOQUE (15 de noviembre de 2026). Era una tarjeta
             entera con un rótulo rojo y el botón principal de la pantalla, y
             Ger la tenía delante cada vez que entraba: los datos se escriben
             una vez en la vida y no pueden mandar más que el trabajo de todos
             los días. Ahora es un renglón de nota; la tarjeta sólo aparece
             mientras se están escribiendo. La regla no cambia: sin los tres no
             se emite, y eso lo vuelve a decir el botón apagado. */
          <section style={css((abriendoDatos ? TARJETA + PAD : "") + "margin-bottom:var(--gap-lg);")}>
            <div style={css("display:flex;align-items:baseline;gap:var(--s2) var(--s3);flex-wrap:wrap;")}>
              <span style={css(NOTA + "min-width:0;overflow-wrap:anywhere;")}>
                {completo
                  ? `Facturas como ${EMISOR.nombre} · NIF ${EMISOR.nif}`
                  : `Para emitir te falta: ${huecos.join(", ").replace(/, ([^,]*)$/, " y $1").replace(/^N/, "n").replace("Domicilio", "domicilio")}.`}
              </span>
              {!abriendoDatos && (
                <button onClick={() => setAbriendoDatos(true)} style={css(BOTON_PLANO)}>
                  {completo ? "Cambiarlos" : "Ponerlos"}
                </button>
              )}
            </div>

            {abriendoDatos && (
              <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);display:flex;flex-direction:column;gap:var(--s3);")}>
                {campo(
                  "Tu nombre o razón social",
                  <input
                    value={mios.nombre}
                    onChange={(e) => setMios({ ...mios, nombre: e.target.value })}
                    placeholder="Iris Soares"
                    style={css(entrada)}
                  />
                )}
                <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:var(--s3);")}>
                  {campo(
                    "Tu NIF",
                    <input
                      value={mios.nif}
                      onChange={(e) => setMios({ ...mios, nif: e.target.value })}
                      placeholder="12345678Z"
                      style={css(entrada)}
                    />
                  )}
                  {campo(
                    "Tu domicilio fiscal",
                    <input
                      value={mios.direccion}
                      onChange={(e) => setMios({ ...mios, direccion: e.target.value })}
                      placeholder="Calle, número, código postal y ciudad"
                      style={css(entrada)}
                    />
                  )}
                </div>
                <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
                  <button onClick={() => void guardarMisDatos()} disabled={guardandoDatos} style={css(botonPrincipal(!guardandoDatos))}>
                    {guardandoDatos ? "Guardando…" : "Guardar mis datos"}
                  </button>
                  <button
                    onClick={() => {
                      /* Al dejarlo se recupera lo guardado: si no, lo escrito a
                         medias se quedaría en pantalla como si fuera lo bueno. */
                      setMios(paraEditar(EMISOR));
                      setFalloDatos("");
                      setAbriendoDatos(false);
                    }}
                    style={css(BOTON_PLANO)}
                  >
                    Dejarlo
                  </button>
                </div>
                {falloDatos && (
                  <p role="alert" style={css(APOYO + "margin:0;color:var(--red);")}>
                    {falloDatos} Tus datos no se han guardado: vuelve a intentarlo antes de emitir nada.
                  </p>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/*
          LA PESTAÑA FACTURAS, COMO UN EDITOR (15 de noviembre de 2026).

          Ger: «para que se vea la factura tiene que verse arriba, o haz que
          se subdivida la ventana y que se pueda ver, editar y ampliar, tipo
          Word». Antes: una tarjeta con la lista que, vacía, dejaba media
          ventana en blanco, y la factura debajo del formulario, cortada.

          Ahora: las facturas en una tira arriba, y debajo la ventana partida
          —el formulario estrecho a la izquierda, el folio entero a la
          derecha—, cada mitad con su propio desplazamiento. En el móvil no
          cabe partida: va el formulario y «Ver la factura» abre el folio a
          pantalla completa.

          `data-folio` lo lee la hoja de impresión: al imprimir, la rejilla se
          deshace y sólo queda el papel, a escala 1.
      */}
      {apartado === "facturas" && (
        <>
          {/* ------------------------------------------------ la tira */}
          <div data-chrome="1" style={css(TARJETA + "padding:5px 5px 5px var(--s4);display:flex;align-items:center;gap:var(--s3);margin-bottom:var(--s3);min-width:0;min-height:46px;")}>
            <span style={css(rotulo() + "flex:none;")}>
              {cargando ? "Un momento…" : lista.length === 1 ? "1 factura" : `${lista.length} facturas`}
            </span>
            <div style={css("flex:1;min-width:0;display:flex;gap:6px;overflow-x:auto;scrollbar-width:thin;padding:2px;")}>
              {!cargando && lista.length === 0 && !estrecho && <span style={css(NOTA + "align-self:center;")}>Todavía ninguna. La primera ya está empezada aquí abajo.</span>}
              {lista.map((f) => {
                const on = enPantalla?.id === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => abrir(f)}
                    aria-pressed={on}
                    style={css(
                      "flex:none;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:var(--r-pill);cursor:pointer;font:inherit;font-size:var(--t-mini);white-space:nowrap;" +
                        (on ? "background:var(--accion-suave);border:1px solid var(--accion-borde);color:var(--accion);" : "background:transparent;border:1px solid var(--border);color:var(--text-2);")
                    )}
                  >
                    <span style={css("width:7px;height:7px;border-radius:50%;background:" + COLOR_ESTADO[f.estado] + ";")} />
                    <span data-cifras="" style={css("font-weight:500;")}>{f.estado === "borrador" ? "Borrador" : numeroDe(f)}</span>
                    <span style={css("max-width:14ch;overflow:hidden;text-overflow:ellipsis;")}>{f.cliente.nombre || "Sin nombre"}</span>
                    <span data-cifras="">{euros(totales(f).total)}</span>
                  </button>
                );
              })}
            </div>
            {/* En el móvil el folio no cabe al lado: se abre desde aquí arriba,
                que es donde se mira antes de bajar por el formulario. */}
            {estrecho && enPantalla && (
              <button onClick={() => setGrande(true)} style={css(BOTON_PLANO + "flex:none;")}>
                Ver
              </button>
            )}
            {/* Con una factura nueva sin tocar ya abierta, «Nueva factura» no
                hace nada: ya estás en ella. Sale en cuanto hay otra cosa. */}
            {!borradorIntacto && (
              <button onClick={nueva} style={css(BOTON_NORMAL + "flex:none;padding:7px 16px;")}>
                {estrecho ? "Nueva" : "Nueva factura"}
              </button>
            )}
          </div>

          {/* ------------------------------------------------ la ventana partida */}
          <div
            data-folio=""
            data-editor=""
            ref={editor}
            style={css(
              estrecho
                ? "display:flex;flex-direction:column;gap:var(--gap);min-width:0;"
                : `display:grid;grid-template-columns:minmax(330px,400px) minmax(0,1fr);gap:var(--gap);min-width:0;height:${altoEditor}px;`
            )}
          >
            <div
              ref={alDetalle}
              data-chrome="1"
              style={css(
                "display:flex;flex-direction:column;gap:var(--gap);min-width:0;" +
                  (estrecho ? "" : "min-height:0;overflow-y:auto;padding:2px 6px 2px 2px;scrollbar-width:thin;")
              )}
            >
          {abierta ? (
              /* --------------------------------------------- una ya emitida */
              <section data-chrome="1" style={css(TARJETA + PAD)}>
                <h2 style={css(TITULO + "margin:0 0 var(--s2);")}>Factura {numeroDe(abierta)}</h2>
                <p style={css(APOYO + "margin:0 0 var(--s4);")}>
                  {abierta.estado === "anulada"
                    ? `Anulada${abierta.motivoAnulacion ? ": " + abierta.motivoAnulacion : "."} Su número sigue ocupado, que es lo que mantiene la serie seguida.`
                    : `Emitida el ${fechaDeFactura(abierta.fecha)}. Una factura emitida no se cambia: si está mal, anúlala y haz otra.`}
                </p>
  
                <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
                  {/* La única mancha de granate: descargarla es a lo que se
                      viene aquí una vez emitida. */}
                  <button onClick={exporta} style={css(botonPrincipal())}>
                    Descargar la factura
                  </button>
                  {abierta.estado === "emitida" && !anulando && (
                    <button onClick={() => setAnulando(true)} style={css(BOTON_PLANO + "color:var(--red);")}>
                      Anular
                    </button>
                  )}
                  {abierta.clienteId && (
                    <button
                      onClick={() => {
                        setClienteAbierto(abierta.clienteId);
                        setView("personas");
                      }}
                      style={css(BOTON_PLANO + "margin-left:auto;")}
                    >
                      Ver su ficha
                    </button>
                  )}
                </div>
  
                {anulando && (
                  <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);display:flex;flex-direction:column;gap:var(--s2);")}>
                    <span style={css(rotulo("var(--red)"))}>¿Por qué se anula?</span>
                    <p style={css(NOTA + "margin:0 0 var(--s2);line-height:1.5;")}>
                      Se queda escrito en la propia factura. No se borra: su número no puede quedar vacío.
                    </p>
                    <input
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Error en el importe · la sesión no llegó a darse"
                      style={css(entrada)}
                    />
                    <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;")}>
                      <button onClick={() => void confirmarAnular()} style={css(BOTON_NORMAL)}>
                        Anular la factura
                      </button>
                      <button onClick={() => setAnulando(false)} style={css(BOTON_PLANO)}>
                        Dejarlo
                      </button>
                    </div>
                  </div>
                )}
  
                <p style={css(NOTA + "margin:var(--s4) 0 0;line-height:1.5;")}>{ayuda}</p>
                {sinDialogo && (
                  <p role="alert" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--red);")}>
                    {AVISO_SIN_DIALOGO}
                  </p>
                )}
                {trasPulsar && (
                  <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-3);")}>
                    {trasPulsar}
                  </p>
                )}
                {guiaApple && <GuiaApple alCerrar={cierraGuia} enApp={enApp} aSafari={aSafari} />}
                {mensaje && (
                  <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-2);")}>
                    {mensaje}
                  </p>
                )}
              </section>
            ) : (
              /* ------------------------------------------------ el borrador */
              borrador && (
                <section data-chrome="1" style={css(TARJETA + PAD)}>
                  {/* Sobraba debajo: «Mientras sea un borrador puedes cambiar lo
                      que quieras y tirarlo si no vale. El número se le pone al
                      emitirla». Los tres botones del pie —emitir, guardar el
                      borrador, tirarlo— ya dicen las tres cosas, y la hoja de
                      abajo lleva su propia banda de BORRADOR. Contarlo además en
                      un párrafo es explicar lo que ya se está viendo. */}
                  <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s4);")}>Nueva factura</div>
  
                  <div style={css("display:flex;flex-direction:column;gap:var(--s4);")}>
                    {/* -------------------------------------------- qué: plantillas */}
                    <Plantillas propias={propias} setPropias={setPropias} elegida={elegida} onElige={aplicaPlantilla} />
  
                    {/* -------------------------------------------- a quién */}
                    <div style={css(RAYA + "padding-top:var(--s4);")} />
                    <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
                      {campo(
                        "¿A quién le facturas?",
                        <>
                          <input
                            value={borrador.cliente.nombre}
                            onChange={(e) => cambiaCliente(e.target.value)}
                            list="es33-clientes-factura"
                            data-campo-input="cliente"
                            placeholder="Nombre o razón social"
                            style={css(entrada)}
                          />
                          <datalist id="es33-clientes-factura">
                            {gente.map((g) => (
                              <option key={g.id} value={g.nombre} />
                            ))}
                          </datalist>
                        </>
                      )}
                      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:var(--s3);")}>
                        {campo(
                          "Su NIF",
                          <input
                            value={borrador.cliente.nif}
                            onChange={(e) => cambia({ cliente: { ...borrador.cliente, nif: e.target.value } })}
                            placeholder="Si hace falta"
                            style={css(entrada)}
                          />
                        )}
                        {campo(
                          "Su domicilio",
                          <input
                            value={borrador.cliente.direccion}
                            onChange={(e) => cambia({ cliente: { ...borrador.cliente, direccion: e.target.value } })}
                            placeholder="Si hace falta"
                            style={css(entrada)}
                          />
                        )}
                      </div>
                      {/* Sobraba: «Si no pones NIF ni domicilio, la factura sale
                          sin ellos…». Los dos campos ya llevan «Si hace falta»
                          escrito dentro, que dice lo mismo en tres palabras y en
                          el sitio donde se está mirando. */}
                    </div>
  
                    {/* --------------------------------------------- qué se factura */}
                    <div style={css(RAYA + "padding-top:var(--s4);display:flex;flex-direction:column;gap:var(--s3);")}>
                      <span style={css(rotulo())}>Lo que sale en la factura</span>
  
                      {/* Las tres casillas de cada línea no llevan rótulo encima
                       * —serían tres rótulos por línea y la tarjeta se llenaría
                       * de letra pequeña—. Se decía en un renglón aparte: «En
                       * cada línea: qué es, cuántas veces y a cuánto sale la
                       * unidad sin IVA». Ahora lo dice cada casilla desde dentro,
                       * que es donde se mira al escribir, y el renglón se ha ido.
                       * Los `aria-label` ya estaban y siguen: quien no ve el
                       * hueco escrito oye el nombre entero del campo. */}
                      {borrador.lineas.map((l, i) => (
                        <div key={i} data-linea-factura="" style={css("display:grid;grid-template-columns:minmax(0,1fr) 74px 96px auto;gap:var(--s2);align-items:center;")}>
                          <input
                            value={l.concepto}
                            onChange={(e) =>
                              cambia({ lineas: borrador.lineas.map((x, j) => (j === i ? { ...x, concepto: e.target.value } : x)) })
                            }
                            placeholder="Concepto"
                            data-campo-input={`concepto-${i}`}
                            aria-label="Concepto"
                            style={css(entrada)}
                          />
                          <input
                            value={l.cantidad}
                            inputMode="numeric"
                            onChange={(e) =>
                              cambia({ lineas: borrador.lineas.map((x, j) => (j === i ? { ...x, cantidad: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)) })
                            }
                            placeholder="Cant."
                            aria-label="Cantidad"
                            style={css(entrada + "text-align:right;")}
                          />
                          <input
                            value={l.precio}
                            inputMode="decimal"
                            onChange={(e) =>
                              cambia({ lineas: borrador.lineas.map((x, j) => (j === i ? { ...x, precio: Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")) || 0 } : x)) })
                            }
                            placeholder="€ sin IVA"
                            aria-label="Precio sin IVA"
                            style={css(entrada + "text-align:right;")}
                          />
                          <button
                            onClick={() => cambia({ lineas: borrador.lineas.filter((_, j) => j !== i) })}
                            disabled={borrador.lineas.length === 1}
                            title="Quitar esta línea"
                            aria-label="Quitar esta línea"
                            style={css(
                              "flex:none;width:30px;height:30px;border-radius:50%;border:1px solid var(--border-strong);background:none;cursor:pointer;font-size:var(--t-body);line-height:1;color:" +
                                (borrador.lineas.length === 1 ? "var(--text-4)" : "var(--text-3)") +
                                ";"
                            )}
                          >
                            ×
                          </button>
                        </div>
                      ))}
  
                      <button
                        onClick={() => cambia({ lineas: [...borrador.lineas, { concepto: "", cantidad: 1, precio: 0 }] })}
                        style={css(BOTON_PLANO + "align-self:flex-start;")}
                      >
                        Añadir otra línea
                      </button>
                    </div>
  
                    {/* ------------------------------------------ fecha, IVA y pie */}
                    <div style={css(RAYA + "padding-top:var(--s4);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:var(--s3);")}>
                      {campo("Fecha", <input type="date" data-campo-input="fecha" value={borrador.fecha} onChange={(e) => cambia({ fecha: e.target.value })} style={css(entrada)} />)}
                      {campo(
                        "IVA (%)",
                        <input
                          value={borrador.iva}
                          inputMode="numeric"
                          onChange={(e) => cambiaIva(Number(e.target.value.replace(/\D/g, "")) || 0)}
                          style={css(entrada + "text-align:right;")}
                        />
                      )}
                    </div>
                    {/* Sobraba: «El 21 % es el tipo general. Cámbialo si a lo que
                        facturas le corresponde otro». El campo se llama «IVA (%)»
                        y viene con 21 puesto: la frase repetía las dos cosas que
                        ya se ven. */}
  
                    {campo(
                      "Al pie de la factura (si quieres)",
                      <textarea
                        value={borrador.notas}
                        onChange={(e) => cambia({ notas: e.target.value })}
                        data-campo-input="notas"
                        rows={2}
                        placeholder="Forma de pago, número de cuenta…"
                        style={css(entrada + "resize:vertical;line-height:1.5;")}
                      />
                    )}
                  </div>
  
                  <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
                    {/* La única mancha de granate de la pantalla. Apagada
                        mientras falten los datos fiscales: se ve que existe y que
                        hoy no se puede pulsar, que es más honesto que esconderla. */}
                    <button
                      onClick={() => void emitir()}
                      disabled={!completo}
                      title={completo ? undefined : "Faltan tus datos fiscales: " + huecos.join(", ")}
                      style={css(botonPrincipal(completo))}
                    >
                      Emitir la factura
                    </button>
                    <button onClick={() => void guardarBorrador()} style={css(BOTON_NORMAL)}>
                      Guardar el borrador
                    </button>
                    <GuardarPlantilla
                      lineas={borrador.lineas}
                      iva={borrador.iva}
                      onGuardada={(l, nombre) => {
                        setPropias(l);
                        setMensaje(`Plantilla «${nombre}» guardada. La tienes arriba, con las demás.`);
                      }}
                    />
                    <button onClick={() => void tirarBorrador()} style={css(BOTON_PLANO + "margin-left:auto;color:var(--red);")}>
                      Tirar el borrador
                    </button>
                  </div>
  
                  {/* UN BOTÓN APAGADO TIENE QUE DECIR POR QUÉ, Y AQUÍ SE PUEDE
                      ARREGLAR SIN MOVERSE. Antes esta línea sólo explicaba; el
                      remedio estaba en un archivo del código. Ahora lleva al
                      formulario de arriba y lo abre. */}
                  {sabemosDelEmisor && !completo && (
                    <p style={css(NOTA + "margin:var(--s3) 0 0;line-height:1.5;")}>
                      {/* Los huecos van con su nombre tal cual —«NIF», no «nif»—:
                          pasarlos a minúscula para que encajaran en la frase
                          dejaba las siglas escritas mal en un texto sobre la ley. */}
                      <span style={css("color:var(--red);")}>
                        En España no hay factura sin {huecos.length === 3 ? "tus datos fiscales" : huecos.join(" ni ")}.
                      </span>{" "}
                      El borrador sí se guarda.{" "}
                      <button
                        onClick={() => {
                          setAbriendoDatos(true);
                          /* El desplazamiento suave se apaga con el resto del
                             movimiento: quien pide menos animación no quiere que
                             la página se le mueva sola durante medio segundo. */
                          const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                          subeArriba(quieto);
                        }}
                        style={css(
                          "background:none;border:none;padding:0;cursor:pointer;font:inherit;color:var(--accion);font-weight:590;text-decoration:underline;"
                        )}
                      >
                        Ponlos ahora
                      </button>
                      .
                    </p>
                  )}
  
                  {mensaje && (
                    <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-2);")}>
                      {mensaje}
                    </p>
                  )}
                </section>
              )
            )}
              {estrecho && enPantalla && (
                <button onClick={() => setGrande(true)} style={css(BOTON_NORMAL + "align-self:stretch;")}>
                  Ver la factura
                </button>
              )}
              <AvisoNavegador que="Las facturas" />
            </div>

            {/* El folio. En ancho, a la derecha y siempre a la vista. En
                estrecho no se pinta en la pantalla —se abre en grande— pero
                sigue en la página para que imprimir y el PDF lo encuentren. */}
            {enPantalla &&
              (estrecho ? (
                <div data-solo-papel="">
                  <HojaFactura f={enPantalla} marca={marca} />
                </div>
              ) : (
                <Mesa f={enPantalla} marca={marca} editable={!abierta} onCampo={vaAlCampo} />
              ))}
          </div>
          {grande && enPantalla && <VerGrande f={enPantalla} marca={marca} alCerrar={() => setGrande(false)} />}
        </>
      )}
    </main>
  );
}
