"use client";
import { css } from "@/lib/css";
import { lectura, type Resultado } from "@/lib/engine";
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
 */
export default function HojaCliente({ r, marca }: { r: Resultado; marca: string }) {
  const c = r.ciclos;
  const cicloActual = c.ciclos.find((x) => c.edad >= x.desde && (x.hasta === null || c.edad <= x.hasta)) || c.ciclos[c.ciclos.length - 1];
  const entraDestino = r.turbulencias ? r.caminos.edadCambio + 10 : r.caminos.edadCambio;

  // Los tres caminos, dichos como se los explicarías a alguien en una mesa, y
  // con el lema de cada carta debajo para que el nombre signifique algo.
  const caminos = [
    {
      k: "origen" as const,
      titulo: "De dónde vienes",
      cuando: `hasta los ${r.caminos.edadCambio}`,
      carta: r.caminos.origen.carta,
      que: "Lo que ya sabías hacer al llegar",
    },
    {
      k: "transformacion" as const,
      titulo: "Cómo atraviesas la vida",
      cuando: "siempre",
      carta: r.caminos.transformacion.carta,
      que: "Tu manera de estar en el mundo",
    },
    {
      k: "destino" as const,
      titulo: "Hacia dónde vas",
      cuando: `desde los ${entraDestino}`,
      carta: r.caminos.destino.carta,
      que: "El sitio al que te lleva la vida",
    },
  ];

  // Los apuntes escriben el remedio de cada tarea empezando por repetir su
  // nombre —«Amar en lugar de querer tener la razón – Desarrollar los
  // atributos…»—. Lo que sirve es lo que va detrás del guion.
  const trasElGuion = (t: string | undefined) => {
    const partes = String(t || "").split(/\s[–—-]\s/);
    return partes.length > 1 && partes[0].length < 80 ? partes.slice(1).join(" — ") : String(t || "");
  };

  /**
   * El hueco de la hoja es fijo y lo que trae cada carta no: hay quien tiene
   * dos tareas con una frase corta y quien tiene cinco con párrafos de cuatro
   * líneas. Contar los items no basta —dos cartas con las mismas cuatro tareas
   * ocupaban una página y media de diferencia—, así que lo que se mide es el
   * texto que va a salir: se arma con presupuesto generoso, se calcula lo que
   * costaría en líneas y, si se pasa, se rehace más corto. Dos o tres vueltas
   * bastan para que quepa sin dejar la hoja medio vacía.
   */
  const TOPE = 830;
  const arma = (mult: number) => {
    const presAprend = Math.max(45, Math.round((580 / Math.max(1, r.aprendizajes.length)) * mult));
    const presBloq = Math.max(45, Math.round((500 / Math.max(1, r.bloqueos.length)) * mult));
    const aprend = r.aprendizajes.map((a) => ({
      portal: a.portal === 10 ? "0" : String(a.portal),
      nombre: sinPunto(frase(a.tarea?.nombre)) || `Portal ${a.portal}`,
      comoSeTrabaja: primerasFrases(trasElGuion(a.tarea?.sanador || a.tarea?.texto), Math.min(presAprend, 250)),
    }));
    const bloq = r.bloqueos.map((b) => ({
      nombre: sinPunto(frase(b.plano?.nombre)).replace(/^Consciencia (?:de la|del|de) /i, ""),
      que: primerasFrases(b.plano?.texto, Math.min(presBloq, 240)),
    }));
    const karmico = primerasFrases(r.cuentasFichas.karmico?.texto || r.cuentasFichas.karmico?.partes?.[0]?.texto, Math.round(140 * mult));
    const lema = primerasFrases(r.cuentasFichas.lema?.texto || r.cuentasFichas.lema?.partes?.[0]?.texto, Math.round(120 * mult));
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
  const lista = (xs: Array<string | number>) => (xs.length < 2 ? String(xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`);

  // La cuenta que se trae de atrás y con qué se salda. Estaba sólo como dos
  // cifras al pie, y es de lo que más se pregunta en una lectura.
  const diceKarmico = armado.karmico;
  const diceLema = armado.lema;

  // El propósito es una cifra sola y no tiene ficha propia en los apuntes,
  // pero sí lectura: es lo único que acompaña a la persona de principio a fin,
  // así que cierra la hoja mejor que ningún otro número.
  const proposito = lectura(c.proposito);

  return (
    <section className={`${styles.page} ${styles.interior} ${styles.abreSeccion} ${styles.hoja}`} style={css(`display:flex;flex-direction:column;gap:${(13 * esc).toFixed(1)}px;`)}>
      <header style={css("display:flex;align-items:flex-end;gap:13px;border-bottom:1px solid rgba(154,127,50,.28);padding-bottom:9px;")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpeg" alt="" style={css("width:34px;height:34px;border-radius:50%;object-fit:cover;flex:none;")} />
        <div style={css("min-width:0;")}>
          <div style={css(ROTULO)}>{marca}</div>
          <h1 style={css("font-family:var(--font-display);font-size:24px;font-weight:500;letter-spacing:-.014em;color:#241F2E;margin:2px 0 0;line-height:1.12;overflow-wrap:anywhere;")}>
            {titulo(r.nombre.texto)}
          </h1>
        </div>
        <div style={css("margin-left:auto;text-align:right;flex:none;")}>
          <div style={css("font-size:9.5px;color:#7A7288;white-space:nowrap;")}>{fechaLarga(r.fecha.dia, r.fecha.mes, r.fecha.anio)}</div>
          <div style={css(ROTULO + "margin-top:2px;")}>Tu estudio en una hoja</div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────── quién eres */}
      <div>
        <div style={css(ROTULO + "margin-bottom:4px;")}>Cómo eres</div>
        <p style={css(CUERPO)}>{primerasFrases(r.tipoEstructura?.texto, 190)}</p>
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:7px;")}>
          <div style={css("border-left:2px solid #C9A84C;padding-left:9px;")}>
            <div style={css(`font-size:${fs(10.5)};font-weight:700;color:#241F2E;`)}>Por dentro</div>
            <p style={css(APUNTE)}>Lo que has venido a ser, lo veas o no. {primerasFrases(r.esencia.lectura.positivo, 95)}</p>
          </div>
          <div style={css("border-left:2px solid #9B93A8;padding-left:9px;")}>
            <div style={css(`font-size:${fs(10.5)};font-weight:700;color:#241F2E;`)}>Por fuera</div>
            <p style={css(APUNTE)}>Lo que la gente ve de ti. {primerasFrases(r.ego.lectura.positivo, 95)}</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── los tres caminos */}
      <div style={css(RAYA + "padding-top:9px;")}>
        <div style={css("display:flex;align-items:baseline;gap:8px;margin-bottom:5px;")}>
          <span style={css(ROTULO)}>Tu camino</span>
          <span style={css(APUNTE)}>Tres tramos que van a la vez; lo que cambia es cuánto pesa cada uno.</span>
        </div>
        <div style={css("display:flex;flex-direction:column;gap:6px;")}>
          {caminos.map((x) => (
            <div key={x.k} style={css("border-left:2.5px solid " + COL[x.k] + ";padding:0 0 0 10px;")}>
              <div style={css("display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;")}>
                <span style={css(`font-size:${fs(11)};font-weight:700;color:#241F2E;`)}>{x.titulo}</span>
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
          <span style={css(ROTULO)}>Lo que has venido a trabajar</span>
          <span style={css(APUNTE)}>No son defectos: son las tareas de esta vida, y se hacen de una en una.</span>
        </div>
        {aprendizajes.length === 0 ? (
          <p style={css(CUERPO)}>Ninguna pendiente: tu trabajo es sostener lo que ya traes hecho.</p>
        ) : (
          <div style={css("display:flex;flex-direction:column;gap:5px;")}>
            {aprendizajes.map((a, i) => (
              <div key={i} style={css("display:flex;gap:8px;align-items:baseline;")}>
                <span style={css("flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:#E5B63C;color:#241F2E;font-size:9px;font-weight:700;")}>{a.portal}</span>
                <span style={css("min-width:0;")}>
                  <span style={css(`font-size:${fs(11)};font-weight:700;color:#241F2E;`)}>{a.nombre}</span>
                  {a.comoSeTrabaja ? <span style={css(`font-size:${fs(10)};color:#6B6478;`)}> — {a.comoSeTrabaja}</span> : null}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={css("display:grid;grid-template-columns:1.1fr 1fr;gap:15px;" + RAYA + "padding-top:9px;")}>
        <div>
          <div style={css(ROTULO + "margin-bottom:2px;")}>Lo que te frena</div>
          <p style={css(APUNTE + "margin-bottom:4px;")}>Los sitios donde se te queda la energía parada. Verlos ya es media parte.</p>
          {bloqueos.length === 0 ? (
            <p style={css(APUNTE)}>Nada se te queda parado: la energía te circula limpia.</p>
          ) : (
            <div style={css("display:flex;flex-direction:column;gap:4px;")}>
              {bloqueos.map((b, i) => (
                <p key={i} style={css(APUNTE)}>
                  <span style={css("font-weight:700;color:#241F2E;")}>{b.nombre}.</span> {b.que}
                </p>
              ))}
            </div>
          )}
        </div>

        <div style={css("display:flex;flex-direction:column;gap:8px;")}>
          <div>
            <div style={css(ROTULO + "margin-bottom:2px;")}>Lo que ya traes hecho</div>
            <p style={css(APUNTE)}>
              {maestrias.length === 0
                ? "Todo está por trabajar en esta vida."
                : `${maestrias.length} de los diez puntos de tu carta vienen resueltos de antes: el ${lista(maestrias)}. Es tu suelo firme, en lo que te puedes apoyar cuando lo demás cuesta.`}
            </p>
          </div>
          <div>
            <div style={css(ROTULO + "margin-bottom:2px;")}>Lo que traes por cerrar</div>
            <p style={css(APUNTE)}>
              La cuenta que vienes a saldar es el {r.cuentas.karmico}
              {diceKarmico ? `: ${diceKarmico}` : "."} Se salda con el {r.cuentas.lemaDeVida}
              {diceLema ? `: ${diceLema}` : ", que es la vibración que te lo permite."}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── ahora mismo */}
      <div style={css("display:grid;grid-template-columns:1.05fr 1fr;gap:15px;" + RAYA + "padding-top:9px;")}>
        <div>
          <div style={css(ROTULO + "margin-bottom:2px;")}>Dónde estás ahora</div>
          <p style={css(CUERPO)}>
            {c.edad} años: etapa de {frase(cicloActual.nombre).toLocaleLowerCase("es")}, de los {cicloActual.desde} a los{" "}
            {cicloActual.hasta === null ? "el final" : cicloActual.hasta}.
          </p>
          <p style={css(APUNTE + "margin-top:2px;")}>
            Dentro de ella vas por el año {c.anioPersonal} de una rueda que se repite cada nueve. Lo que toca este año no es lo que
            tocará el siguiente: por eso la carta se mira de vez en cuando, no una sola vez.
          </p>
          {r.turbulencias && (
            <p style={css(APUNTE + "margin-top:2px;")}>
              A los {r.caminos.edadCambio} empiezan diez años movidos en {r.turbulencias.lista.map((t) => t.tipo.toLocaleLowerCase("es")).join(" y ")}: el
              cambio de camino no es de golpe, se cuece durante esa década.
            </p>
          )}
        </div>
        <div>
          <div style={css(ROTULO + "margin-bottom:4px;")}>Tus días de fuerza</div>
          <div style={css("display:flex;gap:5px;flex-wrap:wrap;")}>
            {r.diasFuerza.dias.map((d, i) => (
              <span
                key={d}
                style={css(
                  "display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;border-radius:50%;font-size:12px;font-weight:600;border:1px solid rgba(154,127,50,.35);color:#241F2E;background:" +
                    (i === 0 ? "rgba(201,168,76,.24)" : "transparent") +
                    ";"
                )}
              >
                {d}
              </span>
            ))}
          </div>
          <p style={css(APUNTE + "margin-top:4px;")}>
            Los días del mes que te acompañan, empezando por el más fuerte. Son los buenos para firmar, empezar algo o decidir.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── el hilo de fondo */}
      <div style={css(RAYA + "padding-top:9px;")}>
        <div style={css("display:flex;align-items:baseline;gap:8px;margin-bottom:4px;")}>
          <span style={css(ROTULO)}>El hilo de toda tu vida</span>
          <span style={css(APUNTE)}>Tu propósito es el {c.proposito}, y no cambia de etapa: es el fondo sobre el que pasa todo lo demás.</span>
        </div>
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px;")}>
          <div style={css("border-left:2px solid #4C8A5A;padding-left:9px;")}>
            <div style={css("font-size:10.5px;font-weight:700;color:#3D7A48;")}>Cuando lo vives bien</div>
            <p style={css(APUNTE)}>{primerasFrases(proposito.positivo, 130)}</p>
          </div>
          <div style={css("border-left:2px solid #C0574C;padding-left:9px;")}>
            <div style={css("font-size:10.5px;font-weight:700;color:#B0564C;")}>Cuando se tuerce</div>
            <p style={css(APUNTE)}>{primerasFrases(proposito.negativo, 130)}</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── el cierre */}
      <div style={css(RAYA + "padding-top:9px;")}>
        <div style={css(ROTULO + "margin-bottom:3px;")}>Si sólo te quedas con una cosa</div>
        <p style={css(CUERPO)}>
          Que vas hacia {sinPunto(titulo(r.caminos.destino.carta?.nombre))}
          {aprendizajes.length > 0
            ? `, y que el camino pasa por ${aprendizajes.length === 1 ? "la tarea" : "las " + aprendizajes.length + " tareas"} de aquí arriba, de una en una y sin prisa`
            : ", y que tu trabajo es sostener lo que ya traes hecho"}
          . Nada de esto está cerrado ni decidido de antemano: es el mapa, y el camino lo andas tú.
        </p>
      </div>

      {/* Los números, al pie y en pequeño: son la ficha de la lectura, no lo
       * que hay que entender para llevarse algo de la hoja. */}
      <div style={css("padding-top:9px;" + RAYA)}>
        <div style={css(ROTULO + "margin-bottom:4px;")}>Tus números, para el archivo</div>
        <div style={css("display:flex;flex-wrap:wrap;gap:4px 16px;")}>
          {[
            { l: "Tu número", v: r.corazon.valor },
            { l: "Por dentro", v: r.esencia.valor },
            { l: "Por fuera", v: r.ego.valor },
            { l: "Tu consciencia", v: r.imagenAlma.numero },
            { l: "Lo que traes por cerrar", v: r.cuentas.karmico },
            { l: "Con qué se salda", v: r.cuentas.lemaDeVida },
            { l: "El hilo de toda tu vida", v: c.proposito },
          ].map((x) => (
            <span key={x.l} style={css("font-size:9.5px;color:#7A7288;white-space:nowrap;")}>
              {x.l} <span style={css("font-family:var(--font-display);font-size:12px;color:#241F2E;")}>{x.v}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={css("margin-top:auto;padding-top:8px;border-top:1px solid rgba(0,0,0,.08);display:flex;align-items:baseline;gap:10px;")}>
        <span style={css(`font-size:${fs(9.5)};color:#8A8296;`)}>{marca}</span>
        <span style={css("margin-left:auto;font-size:9.5px;color:#8A8296;font-style:italic;")}>El nombre es la contraseña del alma</span>
      </div>
    </section>
  );
}
