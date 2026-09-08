"use client";
import { css } from "@/lib/css";
import type { Resultado } from "@/lib/engine";
import { diccionario, lecturaDe, rellena, textoDeNumero, type Idioma } from "@/lib/documento";
import { fechaLarga, frase, primerasFrases, sinPunto, titulo } from "@/lib/format";
import { COL } from "@/lib/tree";
import styles from "./Estudio.module.css";

const ROTULO = "font-size:9px;font-weight:700;color:#9A7F32;letter-spacing:.09em;text-transform:uppercase;";
const RAYA = "border-top:1px solid rgba(154,127,50,.28);";

/**
 * La hoja que se lleva quien recibe la lectura: su estudio entero en una cara.
 *
 * La primera versión nombraba las cosas —«camino de destino: El Carro»— y ahí
 * se quedaba: quien no ha estudiado Kábala lee el nombre de una carta y no se
 * lleva nada. Ahora cada apartado dice **qué significa** antes que cómo se
 * llama, y debajo va lo que ese número o esa carta dicen de la persona, en las
 * palabras de los propios apuntes.
 *
 * Los textos se cortan por frases enteras (`primerasFrases`), nunca a mitad:
 * en una hoja que se entrega, un párrafo acabado en «…» parece un error.
 *
 * SALE EN TRES IDIOMAS. Ni una frase está escrita aquí: todas vienen de
 * `lib/documento`, que es donde Iris puede corregirlas sin tocar código. La
 * maqueta es la misma en los tres —los mismos apartados en el mismo sitio— y
 * lo único que cambia es el texto. Si al portugués o al inglés le faltara algo,
 * esa línea sale en español; la hoja nunca sale con un hueco.
 */
export default function HojaCliente({ r, marca, idioma = "es" }: { r: Resultado; marca: string; idioma?: Idioma }) {
  const D = diccionario(idioma);
  const T = D.hoja;
  const c = r.ciclos;
  const cicloActual = c.ciclos.find((x) => c.edad >= x.desde && (x.hasta === null || c.edad <= x.hasta)) || c.ciclos[c.ciclos.length - 1];
  const entraDestino = r.turbulencias ? r.caminos.edadCambio + 10 : r.caminos.edadCambio;
  const carta = (n: number | undefined) => (n === undefined ? undefined : D.arcanos[n]);

  // Los tres caminos, dichos como se los explicarías a alguien en una mesa, y
  // con el lema de cada carta debajo para que el nombre signifique algo.
  const caminos = [
    {
      k: "origen" as const,
      titulo: T.origenTitulo,
      cuando: rellena(T.origenCuando, { edad: r.caminos.edadCambio }),
      carta: carta(r.caminos.origen.arcano),
      que: T.origenQue,
    },
    {
      k: "transformacion" as const,
      titulo: T.transformacionTitulo,
      cuando: T.transformacionCuando,
      carta: carta(r.caminos.transformacion.arcano),
      que: T.transformacionQue,
    },
    {
      k: "destino" as const,
      titulo: T.destinoTitulo,
      cuando: rellena(T.destinoCuando, { edad: entraDestino }),
      carta: carta(r.caminos.destino.arcano),
      que: T.destinoQue,
    },
  ];

  /**
   * El hueco de la hoja es fijo y lo que trae cada carta no: hay quien tiene
   * dos tareas con una frase corta y quien tiene cinco con párrafos de cuatro
   * líneas. Contar los items no basta —dos cartas con las mismas cuatro tareas
   * ocupaban una página y media de diferencia—, así que lo que se mide es el
   * texto que va a salir: se arma con presupuesto generoso, se calcula lo que
   * costaría en líneas y, si se pasa, se rehace más corto. Dos o tres vueltas
   * bastan para que quepa sin dejar la hoja medio vacía.
   *
   * Se mide el texto YA TRADUCIDO, así que la hoja se ajusta sola aunque el
   * inglés diga en ochenta caracteres lo que el español decía en cien.
   */
  const TOPE = 830;
  const arma = (mult: number) => {
    const presAprend = Math.max(45, Math.round((580 / Math.max(1, r.aprendizajes.length)) * mult));
    const presBloq = Math.max(45, Math.round((500 / Math.max(1, r.bloqueos.length)) * mult));
    const aprend = r.aprendizajes.map((a) => {
      const tarea = D.tareas[a.portal];
      return {
        portal: a.portal === 10 ? "0" : String(a.portal),
        nombre: sinPunto(frase(tarea?.nombre)) || `Portal ${a.portal}`,
        comoSeTrabaja: primerasFrases(tarea?.comoSeTrabaja, Math.min(presAprend, 250)),
      };
    });
    const bloq = r.bloqueos.map((b) => {
      const plano = D.planos[b.casilla];
      return {
        nombre: sinPunto(frase(plano?.nombre)),
        que: primerasFrases(plano?.texto, Math.min(presBloq, 240)),
      };
    });
    const karmico = primerasFrases(textoDeNumero(D, r.cuentasFichas.karmico), Math.round(140 * mult));
    const lema = primerasFrases(textoDeNumero(D, r.cuentasFichas.lema), Math.round(120 * mult));
    // Cada item arranca renglón aunque su texto sea corto, así que pesa por sí
    // mismo además de por lo que dice.
    const coste =
      aprend.reduce((n, a) => n + a.nombre.length + a.comoSeTrabaja.length + 46, 0) +
      bloq.reduce((n, b) => n + b.nombre.length + b.que.length + 46, 0) +
      karmico.length +
      lema.length +
      (r.turbulencias ? 130 : 0) +
      // Un nombre largo parte el titular en dos renglones.
      (r.nombre.texto.length > 32 ? 90 : 0);
    return { aprend, bloq, karmico, lema, coste };
  };

  let armado = arma(1);
  for (let vuelta = 0; vuelta < 12 && armado.coste > TOPE; vuelta++) armado = arma(1 - 0.08 * (vuelta + 1));
  /**
   * Cuando ni recortando al mínimo cabe —cinco planos bloqueados, turbulencias
   * y un nombre de cuatro palabras—, lo que se encoge es la letra, no lo que
   * se cuenta. Un 7% menos de cuerpo da el 7% de alto que falta y se sigue
   * leyendo igual de bien en papel; perder una explicación, en cambio, es
   * perder justo lo que la hoja viene a hacer.
   */
  const esc = Math.max(0.87, Math.min(1, 1 - Math.max(0, armado.coste - TOPE) / 3400));
  const fs = (n: number) => (n * esc).toFixed(1) + "px";
  const CUERPO = `font-size:${fs(11)};line-height:1.5;color:#3A3546;margin:0;`;
  const APUNTE = `font-size:${fs(10)};line-height:1.45;color:#6B6478;margin:0;`;

  const aprendizajes = armado.aprend;
  const bloqueos = armado.bloq;
  const maestrias = r.estructura.maestrias.map((m) => (m === 10 ? "0" : m));
  const lista = (xs: Array<string | number>) =>
    xs.length < 2 ? String(xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} ${T.y} ${xs[xs.length - 1]}`;

  // La cuenta que se trae de atrás y con qué se salda. Estaba sólo como dos
  // cifras al pie, y es de lo que más se pregunta en una lectura.
  const diceKarmico = armado.karmico;
  const diceLema = armado.lema;

  // El propósito es una cifra sola y no tiene ficha propia en los apuntes,
  // pero sí lectura: es lo único que acompaña a la persona de principio a fin,
  // así que cierra la hoja mejor que ningún otro número.
  const proposito = lecturaDe(D, c.proposito);
  const ciclo = D.ciclos[cicloActual.nombre] || cicloActual.nombre;

  return (
    <section className={`${styles.page} ${styles.interior} ${styles.abreSeccion} ${styles.hoja}`} style={css(`display:flex;flex-direction:column;gap:${(13 * esc).toFixed(1)}px;`)}>
      <header style={css("display:flex;align-items:flex-end;gap:13px;border-bottom:1px solid rgba(154,127,50,.28);padding-bottom:9px;")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpeg" alt="" style={css("width:34px;height:34px;border-radius:50%;object-fit:cover;flex:none;")} />
        <div style={css("min-width:0;")}>
          <div style={css(ROTULO)}>{marca}</div>
          <h1 style={css("font-family:var(--font-display);font-size:24px;font-weight:500;letter-spacing:-.014em;color:#2B1119;margin:2px 0 0;line-height:1.12;overflow-wrap:anywhere;")}>
            {titulo(r.nombre.texto)}
          </h1>
        </div>
        <div style={css("margin-left:auto;text-align:right;flex:none;")}>
          <div style={css("font-size:9.5px;color:#7A7288;white-space:nowrap;")}>{fechaLarga(r.fecha.dia, r.fecha.mes, r.fecha.anio, D.locale)}</div>
          <div style={css(ROTULO + "margin-top:2px;")}>{T.subtitulo}</div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────── quién eres */}
      <div>
        <div style={css(ROTULO + "margin-bottom:4px;")}>{T.comoEres}</div>
        <p style={css(CUERPO)}>{primerasFrases(D.estructuras[r.estructura.tipo], 190)}</p>
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:7px;")}>
          <div style={css("border-left:2px solid #C9A84C;padding-left:9px;")}>
            <div style={css(`font-size:${fs(10.5)};font-weight:700;color:#2B1119;`)}>{T.porDentro}</div>
            <p style={css(APUNTE)}>{T.porDentroPie} {primerasFrases(lecturaDe(D, r.esencia.valor).positivo, 95)}</p>
          </div>
          <div style={css("border-left:2px solid #9B93A8;padding-left:9px;")}>
            <div style={css(`font-size:${fs(10.5)};font-weight:700;color:#2B1119;`)}>{T.porFuera}</div>
            <p style={css(APUNTE)}>{T.porFueraPie} {primerasFrases(lecturaDe(D, r.ego.valor).positivo, 95)}</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── los tres caminos */}
      <div style={css(RAYA + "padding-top:9px;")}>
        <div style={css("display:flex;align-items:baseline;gap:8px;margin-bottom:5px;")}>
          <span style={css(ROTULO)}>{T.tuCamino}</span>
          <span style={css(APUNTE)}>{T.tuCaminoPie}</span>
        </div>
        <div style={css("display:flex;flex-direction:column;gap:6px;")}>
          {caminos.map((x) => (
            <div key={x.k} style={css("border-left:2.5px solid " + COL[x.k] + ";padding:0 0 0 10px;")}>
              <div style={css("display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;")}>
                <span style={css(`font-size:${fs(11)};font-weight:700;color:#2B1119;`)}>{x.titulo}</span>
                <span style={css(`font-size:${fs(9.5)};color:#8A8296;`)}>{x.que}</span>
                <span style={css("margin-left:auto;font-size:9px;color:#8A8296;white-space:nowrap;")}>{x.cuando}</span>
              </div>
              <p style={css(APUNTE + "margin-top:1px;")}>
                <span style={css("font-family:var(--font-display);font-size:12.5px;color:" + COL[x.k] + ";")}>{titulo(x.carta?.nombre)}</span>
                {x.carta?.lema ? " — " + sinPunto(frase(x.carta.lema)) + "." : ""}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────── trabajo y frenos */}
      <div style={css(RAYA + "padding-top:9px;")}>
        <div style={css("display:flex;align-items:baseline;gap:8px;margin-bottom:5px;")}>
          <span style={css(ROTULO)}>{T.loQueTrabajas}</span>
          <span style={css(APUNTE)}>{T.loQueTrabajasPie}</span>
        </div>
        {aprendizajes.length === 0 ? (
          <p style={css(CUERPO)}>{T.sinTareas}</p>
        ) : (
          <div style={css("display:flex;flex-direction:column;gap:5px;")}>
            {aprendizajes.map((a, i) => (
              <div key={i} style={css("display:flex;gap:8px;align-items:baseline;")}>
                <span style={css("flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:#E5B63C;color:#2B1119;font-size:9px;font-weight:700;")}>{a.portal}</span>
                <span style={css("min-width:0;")}>
                  <span style={css(`font-size:${fs(11)};font-weight:700;color:#2B1119;`)}>{a.nombre}</span>
                  {a.comoSeTrabaja ? <span style={css(`font-size:${fs(10)};color:#6B6478;`)}> — {a.comoSeTrabaja}</span> : null}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={css("display:grid;grid-template-columns:1.1fr 1fr;gap:15px;" + RAYA + "padding-top:9px;")}>
        <div>
          <div style={css(ROTULO + "margin-bottom:2px;")}>{T.loQueTeFrena}</div>
          <p style={css(APUNTE + "margin-bottom:4px;")}>{T.loQueTeFrenaPie}</p>
          {bloqueos.length === 0 ? (
            <p style={css(APUNTE)}>{T.sinFrenos}</p>
          ) : (
            <div style={css("display:flex;flex-direction:column;gap:4px;")}>
              {bloqueos.map((b, i) => (
                <p key={i} style={css(APUNTE)}>
                  <span style={css("font-weight:700;color:#2B1119;")}>{b.nombre}.</span> {b.que}
                </p>
              ))}
            </div>
          )}
        </div>

        <div style={css("display:flex;flex-direction:column;gap:8px;")}>
          <div>
            <div style={css(ROTULO + "margin-bottom:2px;")}>{T.yaHecho}</div>
            <p style={css(APUNTE)}>
              {maestrias.length === 0 ? T.yaHechoNada : rellena(T.yaHechoTexto, { n: maestrias.length, lista: lista(maestrias) })}
            </p>
          </div>
          <div>
            <div style={css(ROTULO + "margin-bottom:2px;")}>{T.porCerrar}</div>
            <p style={css(APUNTE)}>
              {rellena(T.porCerrarKarmico, { n: r.cuentas.karmico })}
              {diceKarmico ? `: ${diceKarmico}` : "."} {rellena(T.porCerrarLema, { n: r.cuentas.lemaDeVida })}
              {diceLema ? `: ${diceLema}` : T.porCerrarLemaSinTexto}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── ahora mismo */}
      <div style={css("display:grid;grid-template-columns:1.05fr 1fr;gap:15px;" + RAYA + "padding-top:9px;")}>
        <div>
          <div style={css(ROTULO + "margin-bottom:2px;")}>{T.dondeEstas}</div>
          {/* El último ciclo no tiene final y tiene su propia frase. Con una
              sola plantilla salía «de los 54 a los el final», que es lo que
              leía cualquiera pasados los cincuenta y tantos. */}
          <p style={css(CUERPO)}>
            {cicloActual.hasta === null
              ? rellena(T.etapaFinal, { edad: c.edad, ciclo, desde: cicloActual.desde })
              : rellena(T.etapa, { edad: c.edad, ciclo, desde: cicloActual.desde, hasta: cicloActual.hasta })}
          </p>
          <p style={css(APUNTE + "margin-top:2px;")}>{rellena(T.anioPersonal, { n: c.anioPersonal })}</p>
          {r.turbulencias && (
            <p style={css(APUNTE + "margin-top:2px;")}>
              {rellena(T.turbulencias, {
                edad: r.caminos.edadCambio,
                tipos: r.turbulencias.lista.map((t) => D.turbulencias[t.tipo] || t.tipo.toLocaleLowerCase("es")).join(` ${T.y} `),
              })}
            </p>
          )}
        </div>
        <div>
          <div style={css(ROTULO + "margin-bottom:4px;")}>{T.diasFuerza}</div>
          <div style={css("display:flex;gap:5px;flex-wrap:wrap;")}>
            {r.diasFuerza.dias.map((d, i) => (
              <span
                key={d}
                style={css(
                  "display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;border-radius:50%;font-size:12px;font-weight:600;border:1px solid rgba(154,127,50,.35);color:#2B1119;background:" +
                    (i === 0 ? "rgba(201,168,76,.24)" : "transparent") +
                    ";"
                )}
              >
                {d}
              </span>
            ))}
          </div>
          <p style={css(APUNTE + "margin-top:4px;")}>{T.diasFuerzaPie}</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── el hilo de fondo */}
      <div style={css(RAYA + "padding-top:9px;")}>
        <div style={css("display:flex;align-items:baseline;gap:8px;margin-bottom:4px;")}>
          <span style={css(ROTULO)}>{T.hilo}</span>
          <span style={css(APUNTE)}>{rellena(T.hiloPie, { n: c.proposito })}</span>
        </div>
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px;")}>
          <div style={css("border-left:2px solid #4C8A5A;padding-left:9px;")}>
            <div style={css("font-size:10.5px;font-weight:700;color:#3D7A48;")}>{T.viveBien}</div>
            <p style={css(APUNTE)}>{primerasFrases(proposito.positivo, 130)}</p>
          </div>
          <div style={css("border-left:2px solid #C0574C;padding-left:9px;")}>
            <div style={css("font-size:10.5px;font-weight:700;color:#B0564C;")}>{T.seTuerce}</div>
            <p style={css(APUNTE)}>{primerasFrases(proposito.negativo, 130)}</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── el cierre */}
      <div style={css(RAYA + "padding-top:9px;")}>
        <div style={css(ROTULO + "margin-bottom:3px;")}>{T.cierre}</div>
        <p style={css(CUERPO)}>
          {rellena(T.cierreVas, { carta: sinPunto(titulo(carta(r.caminos.destino.arcano)?.nombre)) })}
          {aprendizajes.length > 0
            ? aprendizajes.length === 1
              ? T.cierreTareaUna
              : rellena(T.cierreTareasVarias, { n: aprendizajes.length })
            : T.cierreSinTareas}
          {T.cierreFinal}
        </p>
      </div>

      {/* Los números, al pie y en pequeño: son la ficha de la lectura, no lo
       * que hay que entender para llevarse algo de la hoja. */}
      <div style={css("padding-top:9px;" + RAYA)}>
        <div style={css(ROTULO + "margin-bottom:4px;")}>{T.paraElArchivo}</div>
        <div style={css("display:flex;flex-wrap:wrap;gap:4px 16px;")}>
          {[
            { l: T.numTuNumero, v: r.corazon.valor },
            { l: T.numPorDentro, v: r.esencia.valor },
            { l: T.numPorFuera, v: r.ego.valor },
            { l: T.numConsciencia, v: r.imagenAlma.numero },
            { l: T.numPorCerrar, v: r.cuentas.karmico },
            { l: T.numConQueSalda, v: r.cuentas.lemaDeVida },
            { l: T.numHilo, v: c.proposito },
          ].map((x) => (
            <span key={x.l} style={css("font-size:9.5px;color:#7A7288;white-space:nowrap;")}>
              {x.l} <span style={css("font-family:var(--font-display);font-size:12px;color:#2B1119;")}>{x.v}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={css("margin-top:auto;padding-top:8px;border-top:1px solid rgba(0,0,0,.08);display:flex;align-items:baseline;gap:10px;")}>
        <span style={css(`font-size:${fs(9.5)};color:#8A8296;`)}>{marca}</span>
        <span style={css("margin-left:auto;font-size:9.5px;color:#8A8296;font-style:italic;")}>{T.pieLema}</span>
      </div>
    </section>
  );
}
