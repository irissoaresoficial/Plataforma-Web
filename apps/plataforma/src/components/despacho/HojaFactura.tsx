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
 * lo mira tenga el modo oscuro puesto — se imprimiría en granate.
 *
 * LO QUE FALTA SALE MARCADO. Los datos fiscales del emisor no los ha dado
 * nadie todavía, así que en su sitio va la etiqueta roja de PENDIENTE, igual
 * que hace la web con lo que aún no tiene contenido. Se ve de un vistazo qué
 * hay que rellenar, y una factura a medias no se puede confundir con una buena.
 */

import { css } from "@/lib/css";
import { fechaDeFactura, euros, numeroDe, totales, type DatosFiscales, type Factura } from "@/lib/despacho";
import { EMISOR, falta, PENDIENTE } from "@/lib/despacho/emisor";

/* Los colores del papel. Fijos, y por eso escritos aquí y no como tokens. */
const TINTA = "#282430";
const TINTA_SUAVE = "#6B6478";
const ORO = "rgba(201,168,76,.5)";
const ROJO = "#A33B3B";

/** La etiqueta roja de lo que todavía no tiene valor. La misma de la web. */
function Falta({ children = PENDIENTE }: { children?: React.ReactNode }) {
  return (
    <span
      style={css(
        "display:inline-block;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:" +
          ROJO +
          ";border:1px solid " +
          ROJO +
          ";border-radius:100px;padding:2px 8px;white-space:nowrap;"
      )}
    >
      {children}
    </span>
  );
}

/**
 * Uno de los dos bloques de cabecera.
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
      <div style={css("font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:" + TINTA_SUAVE + ";margin-bottom:8px;")}>{rotulo}</div>
      <div style={css("display:flex;flex-direction:column;gap:5px;font-size:13px;line-height:1.5;color:" + TINTA + ";")}>
        <div style={css("font-weight:600;")}>{linea("nombre", "Nombre pendiente")}</div>
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

  const celda = "padding:9px 10px;font-size:12.5px;line-height:1.45;";
  const cabeceraTabla = "padding:7px 10px;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:" + TINTA_SUAVE + ";border-bottom:1px solid " + ORO + ";";

  return (
    <article
      style={css(
        "width:8.5in;max-width:100%;margin:0 auto;box-sizing:border-box;background:#fbf8f1;color:" +
          TINTA +
          ";border-radius:7px;box-shadow:0 2px 10px rgba(20,20,19,.12);padding:clamp(24px,4vw,52px);break-inside:avoid;"
      )}
    >
      {/* La banda que dice que esto todavía no es una factura, o que ya no lo
       * es. Va arriba del todo y no en una esquina: es lo primero que tiene que
       * leer quien la reciba por error. */}
      {(borrador || anulada) && (
        <div
          style={css(
            "margin-bottom:26px;padding:10px 14px;border:1px solid " +
              ROJO +
              ";border-radius:4px;font-size:12px;font-weight:600;letter-spacing:.04em;color:" +
              ROJO +
              ";"
          )}
        >
          {borrador
            ? "BORRADOR · Todavía no es una factura: no tiene número y no tiene validez."
            : `ANULADA · Esta factura quedó sin efecto${f.motivoAnulacion ? ": " + f.motivoAnulacion : "."}`}
        </div>
      )}

      <div style={css("display:flex;align-items:flex-start;gap:22px;flex-wrap:wrap;border-bottom:1px solid " + ORO + ";padding-bottom:18px;margin-bottom:22px;")}>
        <div style={css("display:flex;align-items:center;gap:11px;flex:1 1 240px;min-width:0;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="" style={css("width:44px;height:44px;flex:none;border-radius:50%;object-fit:cover;")} />
          <div style={css("min-width:0;")}>
            <div style={css("font-family:var(--font-display);font-size:16px;font-weight:500;line-height:1.2;")}>{marca}</div>
            <div style={css("font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:" + TINTA_SUAVE + ";margin-top:3px;")}>Factura</div>
          </div>
        </div>
        <div style={css("text-align:right;margin-left:auto;")}>
          <div style={css("font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:" + TINTA_SUAVE + ";")}>Número</div>
          <div data-cifras="" style={css("font-size:21px;font-weight:600;letter-spacing:-.01em;margin-top:3px;")}>
            {borrador ? <Falta>Sin número</Falta> : numeroDe(f)}
          </div>
          <div style={css("font-size:12px;color:" + TINTA_SUAVE + ";margin-top:6px;")}>{f.fecha ? fechaDeFactura(f.fecha) : ""}</div>
        </div>
      </div>

      <div style={css("display:flex;gap:26px;flex-wrap:wrap;margin-bottom:26px;")}>
        <Bloque
          rotulo="Quien factura"
          /* En un borrador todavía no se ha congelado nada, así que se enseña
             lo que hay hoy en `EMISOR` — que es lo que se copiará al emitir. */
          datos={f.emisor ?? EMISOR}
          exigidos={["nombre", "nif", "direccion"]}
        />
        {/* Del cliente sólo se exige el nombre: a un particular se le factura
            sin NIF ni domicilio, y ahí un hueco no es un fallo. */}
        <Bloque rotulo="A quien se factura" datos={f.cliente} exigidos={["nombre"]} />
      </div>

      <div style={css("border:1px solid " + ORO + ";border-radius:4px;overflow:hidden;margin-bottom:20px;")}>
        <table style={css("width:100%;border-collapse:collapse;")}>
          <thead>
            <tr>
              <th style={css(cabeceraTabla + "text-align:left;")}>Concepto</th>
              <th style={css(cabeceraTabla + "text-align:right;width:66px;")}>Cant.</th>
              <th style={css(cabeceraTabla + "text-align:right;width:104px;")}>Precio</th>
              <th style={css(cabeceraTabla + "text-align:right;width:110px;")}>Importe</th>
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
                <tr key={i} style={css(i ? "border-top:1px solid rgba(201,168,76,.24);" : "")}>
                  <td style={css(celda)}>{l.concepto || <Falta>Sin concepto</Falta>}</td>
                  <td data-cifras="" style={css(celda + "text-align:right;")}>
                    {l.cantidad}
                  </td>
                  <td data-cifras="" style={css(celda + "text-align:right;")}>
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
      </div>

      <div style={css("display:flex;justify-content:flex-end;")}>
        <div style={css("min-width:min(100%,260px);display:flex;flex-direction:column;gap:7px;font-size:13px;")}>
          <div style={css("display:flex;justify-content:space-between;gap:16px;color:" + TINTA_SUAVE + ";")}>
            <span>Base imponible</span>
            <span data-cifras="">{euros(t.base)}</span>
          </div>
          <div style={css("display:flex;justify-content:space-between;gap:16px;color:" + TINTA_SUAVE + ";")}>
            <span>IVA ({f.iva} %)</span>
            <span data-cifras="">{euros(t.cuota)}</span>
          </div>
          <div style={css("display:flex;justify-content:space-between;gap:16px;border-top:1px solid " + ORO + ";padding-top:9px;font-size:17px;font-weight:600;")}>
            <span>Total</span>
            <span data-cifras="">{euros(t.total)}</span>
          </div>
        </div>
      </div>

      {f.notas && (
        <p style={css("margin:26px 0 0;font-size:12px;line-height:1.6;color:" + TINTA_SUAVE + ";white-space:pre-wrap;")}>{f.notas}</p>
      )}

      {/* Mientras falten los datos de arriba, la propia hoja lo dice. Una
       * factura con huecos que no se anuncian es peor que no tenerla. */}
      {(() => {
        const e = f.emisor ?? EMISOR;
        return falta(e.nombre) || falta(e.nif) || falta(e.direccion);
      })() && (
        <p style={css("margin:22px 0 0;padding-top:12px;border-top:1px solid " + ORO + ";font-size:11px;line-height:1.6;color:" + ROJO + ";")}>
          Faltan los datos fiscales de quien emite la factura. En España son obligatorios: hasta que estén, esto no vale como
          factura.
        </p>
      )}
    </article>
  );
}
