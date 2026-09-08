"use client";

/**
 * LA FACTURA, EN PAPEL
 *
 * Esto es el documento: lo que se ve en pantalla y lo que sale por la
 * impresora o al PDF. Es la misma hoja en los dos sitios a propósito — no hay
 * una versión «de pantalla» y otra «de imprimir» que puedan discrepar.
 *
 * VA EN COLOR DE PAPEL, no en los colores del tema. Igual que las hojas del
 * estudio (`components/estudio`): un documento no cambia de color porque quien
 * lo mira tenga el modo oscuro puesto — se imprimiría en granate, y una factura
 * no tiene modo noche. Por eso los colores están escritos aquí y no salen de
 * los tokens, que cambian con el tema.
 *
 * QUÉ SE HA REHECHO Y POR QUÉ
 * ---------------------------------------------------------------------------
 * Estaba plana: todo el mismo peso, todo del mismo tamaño, y la palabra
 * «Factura» en once píxeles debajo del nombre de la escuela. Puesta encima de
 * la mesa junto a otros papeles no se distinguía de un presupuesto ni de un
 * recibo, y el TOTAL —que es el único número que busca quien la recibe— pesaba
 * lo mismo que la base imponible.
 *
 * Lo que se ha traído de una plantilla comercial es la JERARQUÍA, no el adorno:
 *
 *   · una banda de granate arriba con el logo blanco a la izquierda y la
 *     palabra FACTURA con su número a la derecha, legible desde el otro lado de
 *     la mesa;
 *   · el emisor y el cliente en dos columnas paralelas, no en un párrafo;
 *   · la fila de cabecera de la tabla con fondo sólido y letra clara;
 *   · el TOTAL en su propio bloque, y claramente lo más grande de la mitad de
 *     abajo;
 *   · un pie con cómo localizar a quien la emite.
 *
 * Lo que NO se ha traído son los bloques de formas geométricas de colores de las
 * esquinas. Son ruido de plantilla de descarga: no dicen nada, se comen tinta y
 * en una hoja que se manda a Hacienda o a una gestoría restan seriedad. El peso
 * visual que daban lo da la banda, y ahí el que manda es el logo de la escuela,
 * que es real.
 *
 * LO QUE FALTA SALE MARCADO, y sigue siendo así. Los datos fiscales del emisor
 * se escriben desde la pantalla (`emisor.ts`); mientras alguno falte, en su
 * sitio va la etiqueta roja, igual que hace la web con lo que aún no tiene
 * contenido. Se ve de un vistazo qué hay que rellenar, y una factura a medias
 * no se puede confundir con una buena. Lo que no es obligatorio y falta —el NIF
 * de un particular— sencillamente no se imprime, y la hoja no se descuadra por
 * ello: cada bloque ocupa lo que ocupa su contenido.
 *
 * CABE EN UN A4. El ancho es 8,5 pulgadas para verla en pantalla, pero al
 * imprimir manda `@page` con el A4 y sus márgenes, la hoja se estira a todo lo
 * ancho del folio y el fondo pasa a blanco puro: el crema es bonito en pantalla
 * y en papel se convierte en una mancha de tinta de fondo en toda la página.
 */

import { css } from "@/lib/css";
import { fechaDeFactura, euros, numeroDe, totales, type DatosFiscales, type Factura } from "@/lib/despacho";
import { EMISOR, falta, PENDIENTE } from "@/lib/despacho/emisor";

/*
 * Los colores del papel. Fijos, y por eso escritos aquí y no como tokens.
 *
 * El granate y el oro son los mismos de la casa —el vino de la web, de la
 * puerta y del botón principal— copiados a mano porque `--accion` cambia de
 * color con el tema y una factura no puede.
 */
const VINO = "#4a1a26";
const VINO_HONDO = "#35111a";
const TINTA = "#282430";
const TINTA_SUAVE = "#6B6478";
const ORO = "rgba(201,168,76,.5)";
const ORO_LINEA = "rgba(201,168,76,.28)";
const ROJO = "#A33B3B";
const PAPEL = "#fbf8f1";
const SOBRE_VINO = "#fbf6ee";

/** La etiqueta roja de lo que todavía no tiene valor. La misma de la web. */
function Falta({ children = PENDIENTE, claro = false }: { children?: React.ReactNode; claro?: boolean }) {
  /* Sobre la banda de granate el rojo no se lee —rojo sobre vino es la misma
     mancha—, así que ahí la etiqueta va en la tinta clara de encima. Sigue
     distinguiéndose de un dato de verdad porque va enmarcada y en versalitas. */
  const color = claro ? SOBRE_VINO : ROJO;
  return (
    <span
      style={css(
        "display:inline-block;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:" +
          color +
          ";border:1px solid " +
          color +
          ";border-radius:100px;padding:2px 8px;white-space:nowrap;"
      )}
    >
      {children}
    </span>
  );
}

/**
 * Uno de los dos bloques de datos fiscales. Van en paralelo, con el mismo
 * rótulo arriba y la misma rejilla, para que se lean como lo que son: las dos
 * partes de la misma operación.
 *
 * `exigidos` dice qué campos NO pueden faltar en ese bloque. Los que faltan y
 * son exigidos salen con la etiqueta roja; los que faltan y no lo son
 * sencillamente no se imprimen. La diferencia importa: del emisor hacen falta
 * los tres, pero a un particular se le puede facturar sin NIF ni domicilio, y
 * marcarlos ahí en rojo estaría avisando de un problema que no existe.
 */
function Bloque({
  rotulo,
  datos,
  exigidos,
}: {
  rotulo: string;
  datos: DatosFiscales;
  exigidos: Array<keyof DatosFiscales>;
}) {
  /* Cuando falta, la etiqueta roja dice QUÉ falta: tres pastillas iguales que
     ponen «PENDIENTE» no distinguen si lo que no hay es el NIF o el domicilio. */
  const linea = (campo: keyof DatosFiscales, etiqueta: string, prefijo = "") => {
    const v = datos[campo];
    if (falta(v)) return exigidos.includes(campo) ? <Falta>{etiqueta}</Falta> : null;
    return (
      <>
        {prefijo}
        {v}
      </>
    );
  };
  const nif = linea("nif", "NIF pendiente", "NIF: ");
  const direccion = linea("direccion", "Domicilio pendiente");

  return (
    <div style={css("min-width:0;flex:1 1 220px;")}>
      <div
        style={css(
          "font-size:9.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:" +
            VINO +
            ";padding-bottom:6px;margin-bottom:9px;border-bottom:1px solid " +
            ORO_LINEA +
            ";"
        )}
      >
        {rotulo}
      </div>
      <div style={css("display:flex;flex-direction:column;gap:4px;font-size:12.5px;line-height:1.55;color:" + TINTA + ";")}>
        <div style={css("font-size:14px;font-weight:700;letter-spacing:-.01em;")}>{linea("nombre", "Nombre pendiente")}</div>
        {nif && <div>{nif}</div>}
        {direccion && <div style={css("color:" + TINTA_SUAVE + ";")}>{direccion}</div>}
      </div>
    </div>
  );
}

export default function HojaFactura({ f, marca }: { f: Factura; marca: string }) {
  const t = totales(f);
  const borrador = f.estado === "borrador";
  const anulada = f.estado === "anulada";
  const emisor = f.emisor ?? EMISOR;
  const faltanDatos = falta(emisor.nombre) || falta(emisor.nif) || falta(emisor.direccion);

  const celda = "padding:10px 12px;font-size:12.5px;line-height:1.45;";
  const cabeceraTabla =
    "padding:9px 12px;font-size:9.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:" +
    SOBRE_VINO +
    ";background:" +
    VINO +
    ";";

  return (
    <article
      data-factura=""
      style={css(
        "width:8.5in;max-width:100%;margin:0 auto;box-sizing:border-box;background:" +
          PAPEL +
          ";color:" +
          TINTA +
          ";border-radius:var(--r-tarjeta);box-shadow:var(--shadow-lg);overflow:hidden;break-inside:avoid;"
      )}
    >
      {/*
          LA BANDA. Es lo que da el peso de arriba y lo que hace que se sepa qué
          papel es éste antes de leer nada.

          El icono es la flor de lis dorada, que es el oficial de Iris. Sobre el
          granate se lee sin necesitar una versión aparte en blanco: el dorado
          ES el color que la casa usa sobre vino. Antes había un sello redondo
          de color que, sobre vino oscuro, se leía como una pegatina pegada
          encima.
      */}
      <div
        style={css(
          "display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding:22px clamp(20px,4vw,44px);background:" +
            VINO +
            ";color:" +
            SOBRE_VINO +
            ";"
        )}
      >
        <div style={css("display:flex;align-items:center;gap:13px;flex:1 1 220px;min-width:0;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/flor-de-lis.png" alt="" style={css("width:44px;height:44px;flex:none;object-fit:contain;opacity:.95;")} />
          <div style={css("min-width:0;")}>
            <div style={css("font-family:var(--font-display);font-size:17px;font-weight:500;line-height:1.2;letter-spacing:-.01em;")}>
              {marca}
            </div>
            {emisor.nif && !falta(emisor.nif) && (
              <div style={css("font-size:10.5px;letter-spacing:.08em;margin-top:4px;opacity:.72;")}>NIF {emisor.nif}</div>
            )}
          </div>
        </div>

        <div style={css("text-align:right;margin-left:auto;min-width:0;")}>
          {/* La palabra y el número: lo que se lee desde el otro lado de la
              mesa. La palabra grande y espaciada, el número debajo en cifras
              tabulares para que no baile entre una factura y la siguiente. */}
          <div style={css("font-size:26px;font-weight:700;letter-spacing:.2em;line-height:1;text-transform:uppercase;")}>
            Factura
          </div>
          <div
            data-cifras=""
            style={css("font-size:16px;font-weight:600;letter-spacing:.02em;margin-top:8px;")}
          >
            {borrador ? <Falta claro>Sin número</Falta> : numeroDe(f)}
          </div>
          {f.fecha && <div style={css("font-size:11.5px;margin-top:6px;opacity:.72;")}>{fechaDeFactura(f.fecha)}</div>}
        </div>
      </div>

      <div style={css("padding:clamp(20px,4vw,44px);")}>
        {/* La banda que dice que esto todavía no es una factura, o que ya no lo
         * es. Va arriba del todo del cuerpo y no en una esquina: es lo primero
         * que tiene que leer quien la reciba por error. */}
        {(borrador || anulada) && (
          <div
            style={css(
              "margin-bottom:26px;padding:11px 14px;border:1px solid " +
                ROJO +
                ";border-radius:var(--r);font-size:12px;font-weight:600;letter-spacing:.03em;line-height:1.5;color:" +
                ROJO +
                ";"
            )}
          >
            {borrador
              ? "BORRADOR · Todavía no es una factura: no tiene número y no tiene validez."
              : `ANULADA · Esta factura quedó sin efecto${f.motivoAnulacion ? ": " + f.motivoAnulacion : "."}`}
          </div>
        )}

        <div style={css("display:flex;gap:clamp(20px,4vw,44px);flex-wrap:wrap;margin-bottom:28px;")}>
          <Bloque
            rotulo="Quien factura"
            /* En un borrador todavía no se ha congelado nada, así que se enseña
               lo que hay hoy en `EMISOR` — que es lo que se copiará al emitir. */
            datos={emisor}
            exigidos={["nombre", "nif", "direccion"]}
          />
          {/* Del cliente sólo se exige el nombre: a un particular se le factura
              sin NIF ni domicilio, y ahí un hueco no es un fallo. */}
          <Bloque rotulo="A quien se factura" datos={f.cliente} exigidos={["nombre"]} />
        </div>

        {/* La tabla ya no lleva marco: lo que la delimita arriba es la fila de
            cabecera en granate, y abajo la última línea de la tinta. Un marco
            además del fondo sólido eran dos cosas diciendo lo mismo. */}
        <table style={css("width:100%;border-collapse:collapse;margin-bottom:22px;")}>
          <thead>
            <tr>
              <th style={css(cabeceraTabla + "text-align:left;")}>Concepto</th>
              <th style={css(cabeceraTabla + "text-align:right;width:66px;")}>Cant.</th>
              <th style={css(cabeceraTabla + "text-align:right;width:104px;")}>Precio</th>
              <th style={css(cabeceraTabla + "text-align:right;width:112px;")}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {f.lineas.length === 0 ? (
              <tr>
                <td colSpan={4} style={css(celda + "color:" + TINTA_SUAVE + ";")}>
                  Todavía no hay nada que facturar.
                </td>
              </tr>
            ) : (
              f.lineas.map((l, i) => (
                <tr key={i} style={css("border-bottom:1px solid " + ORO_LINEA + ";")}>
                  <td style={css(celda)}>{l.concepto || <Falta>Sin concepto</Falta>}</td>
                  <td data-cifras="" style={css(celda + "text-align:right;color:" + TINTA_SUAVE + ";")}>
                    {l.cantidad}
                  </td>
                  <td data-cifras="" style={css(celda + "text-align:right;color:" + TINTA_SUAVE + ";")}>
                    {euros(l.precio)}
                  </td>
                  <td data-cifras="" style={css(celda + "text-align:right;font-weight:600;")}>
                    {euros(Math.round(l.cantidad * l.precio * 100) / 100)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/*
            LOS TOTALES, EN SU PROPIO BLOQUE Y A LA DERECHA.

            Iban en tres renglones del mismo tamaño con una raya encima del
            último: la base imponible, el IVA y el total pesaban prácticamente
            lo mismo. El total es el único número que busca quien recibe la
            factura, así que se separa de los otros dos —fondo de granate, letra
            clara, casi el doble de cuerpo— y los otros dos se quedan como lo
            que son, la cuenta de cómo se ha llegado hasta él.
        */}
        <div style={css("display:flex;justify-content:flex-end;")}>
          <div style={css("min-width:min(100%,300px);")}>
            <div style={css("display:flex;justify-content:space-between;gap:16px;font-size:12.5px;padding:5px 14px;color:" + TINTA_SUAVE + ";")}>
              <span>Base imponible</span>
              <span data-cifras="">{euros(t.base)}</span>
            </div>
            <div style={css("display:flex;justify-content:space-between;gap:16px;font-size:12.5px;padding:5px 14px 11px;color:" + TINTA_SUAVE + ";")}>
              <span>IVA ({f.iva} %)</span>
              <span data-cifras="">{euros(t.cuota)}</span>
            </div>
            <div
              style={css(
                "display:flex;justify-content:space-between;align-items:baseline;gap:20px;padding:12px 14px;border-radius:var(--r);background:" +
                  VINO +
                  ";color:" +
                  SOBRE_VINO +
                  ";"
              )}
            >
              <span style={css("font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;")}>Total</span>
              <span data-cifras="" style={css("font-size:22px;font-weight:700;letter-spacing:-.01em;")}>
                {euros(t.total)}
              </span>
            </div>
          </div>
        </div>

        {f.notas && (
          <p
            style={css(
              "margin:26px 0 0;padding:13px 15px;border-left:3px solid " +
                ORO +
                ";font-size:12px;line-height:1.6;color:" +
                TINTA_SUAVE +
                ";white-space:pre-wrap;"
            )}
          >
            {f.notas}
          </p>
        )}

        {/*
            EL PIE: dónde está quien emite esto.

            La referencia lleva teléfono, correo y web. Aquí sólo se imprime lo
            que existe de verdad: el domicilio fiscal, que es un dato guardado.
            Un teléfono y un correo inventados en una factura no son un adorno de
            maqueta — son datos falsos en un documento con validez legal.
        */}
        <div
          style={css(
            "margin-top:30px;padding-top:14px;border-top:1px solid " +
              ORO_LINEA +
              ";display:flex;gap:16px;flex-wrap:wrap;align-items:baseline;font-size:10.5px;line-height:1.6;color:" +
              TINTA_SUAVE +
              ";"
          )}
        >
          <span style={css("font-weight:600;color:" + VINO_HONDO + ";")}>{marca}</span>
          {!falta(emisor.direccion) && <span style={css("min-width:0;")}>{emisor.direccion}</span>}
          {!falta(emisor.nif) && <span data-cifras="">NIF {emisor.nif}</span>}
        </div>

        {/* Mientras falten los datos de arriba, la propia hoja lo dice. Una
         * factura con huecos que no se anuncian es peor que no tenerla. */}
        {faltanDatos && (
          <p style={css("margin:14px 0 0;font-size:11px;line-height:1.6;color:" + ROJO + ";")}>
            Faltan los datos fiscales de quien emite la factura. En España son obligatorios: hasta que estén, esto no vale como
            factura.
          </p>
        )}
      </div>
    </article>
  );
}
