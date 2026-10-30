"use client";
/**
 * ============================================================================
 * EL INFORME QUE SE ENTREGA
 * ============================================================================
 *
 * Lo que se lleva la clienta: el estudio de su vivienda en folios, con la
 * misma maqueta y las mismas letras que el estudio de Kábala. Se guarda como
 * PDF desde el diálogo de impresión, igual que aquél (`lib/imprimir.ts`).
 *
 * EL ORDEN ES EL DE UNA VISITA:
 *   1. Portada.
 *   2. La vivienda: hacia dónde mira, cuándo se hizo y qué carta tiene.
 *   3. El plano con sus nueve zonas y la carta de estrellas.
 *   4. Zona por zona: qué estrellas tiene, qué favorece y qué hacer.
 *   5. Las personas: su número Kua y sus direcciones.
 *   6. El año en curso y el siguiente: lo que no se toca.
 *   7. Para terminar: la nota de quien hace el estudio y el método.
 *
 * NADA SE INVENTA. Si falta la medida o el año de obra, el informe lo dice en
 * su sitio en vez de rellenarlo; las propuestas de cada zona salen de reglas
 * (`propuestaZona`) y lo que es interpretación lo escribe quien firma.
 */
import { css } from "@/lib/css";
import {
  BA_ZHAI,
  MANSIONES,
  MANSION_BUENA,
  NOMBRE_DIR,
  TRIGRAMA,
  anioFengShui,
  dirDe,
  dispersion,
  encerrada,
  grupoDe,
  kuaDeCasa,
  mansionesPorDir,
  raya,
  type Casilla,
  type CartaNatal,
} from "@/lib/fengshui/calculo";
import { kuaDe, mediaLecturas, periodoDeEstudio, type EstudioFs } from "@/lib/fengshui/estudio";
import { ESPECIAL, ESTRELLA, FORMACION, MANSION, propuestaEstancia, propuestaZona } from "@/lib/fengshui/textos";
import Cuadricula from "./Cuadricula";
import Plano from "./Plano";
import s from "./FengShui.module.css";

const ORDEN_ZONAS: Casilla[] = ["N", "NE", "E", "SE", "S", "SO", "O", "NO", "C"];
const fecha = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
const grados = (g: number) => `${g.toFixed(1).replace(".", ",")}°`;

function Cabecera({ e, parte }: { e: EstudioFs; parte: string }) {
  return (
    <div className={s.cabecera}>
      <span>Estudio de Feng Shui · {e.cliente || "Vivienda"}</span>
      <span>{parte}</span>
    </div>
  );
}

function Pie({ n }: { n: number }) {
  return (
    <div className={s.pie}>
      <span>Escuela de Sabiduría 33</span>
      <span>{n}</span>
    </div>
  );
}

export default function Informe({ e, carta, plano, hoy, anioActual }: { e: EstudioFs; carta: CartaNatal | null; plano: string | null; hoy: Date; anioActual: number }) {
  const periodo = periodoDeEstudio(e);
  const media = mediaLecturas(e);
  const disp = dispersion(e.lecturas.map((l) => l.grados));
  const enRaya = e.fachada !== null ? raya(e.fachada) : null;
  const anios = [anioFengShui(anioActual), anioFengShui(anioActual + 1)];
  const casaKua = e.fachada !== null ? kuaDeCasa(e.fachada) : null;
  const casaGrupo = casaKua ? grupoDe(casaKua) : null;
  const casaMansiones = casaKua ? mansionesPorDir(casaKua) : null;
  const preso = carta ? encerrada(carta, 9) : null;
  let pagina = 1;

  return (
    <div className={s.mesa}>
      {/* ---------------------------------------------------------- PORTADA */}
      <section className={`${s.hoja} ${s.portada}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.logo} src="/logo-33.png" alt="Escuela de Sabiduría 33" />
        <span className={s.sobretitulo}>Escuela de la brújula</span>
        <h1 className={s.titulo}>Estudio de Feng Shui</h1>
        <div className={s.filete} />
        <p className={s.cliente}>{e.cliente || "Sin nombre"}</p>
        {e.direccion && <p className={s.p}>{e.direccion}</p>}
        <p className={s.p} style={css("color:#7d5f1e;")}>{fecha(hoy)}</p>
        <span className={s.sobretitulo} style={css("margin-top:30px;")}>Iris Soares · Escuela de Sabiduría 33</span>
      </section>

      {/* ------------------------------------------------------ LA VIVIENDA */}
      <section className={s.hoja}>
        <Cabecera e={e} parte="La vivienda" />
        <h2 className={s.h2}>La vivienda</h2>
        <table className={s.tabla}>
          <tbody>
            {e.direccion && (
              <tr>
                <td className={s.dato}>Dirección</td>
                <td>{e.direccion}</td>
              </tr>
            )}
            <tr>
              <td className={s.dato}>Tipo</td>
              <td>
                {{ casa: "Casa", piso: "Piso", local: "Local" }[e.tipo]}
                {e.tipo === "piso" && e.planta ? ` · planta ${e.planta}` : ""}
              </td>
            </tr>
            <tr>
              <td className={s.dato}>La fachada mira a</td>
              <td>
                {carta && e.fachada !== null ? (
                  <>
                    <span className={s.cifra}>{grados(e.fachada)}</span> · {carta.fachada.codigo} {carta.fachada.pinyin} {carta.fachada.hanzi} · {NOMBRE_DIR[dirDe(e.fachada)]}
                  </>
                ) : e.fachada !== null ? (
                  grados(e.fachada)
                ) : (
                  "Sin medir todavía."
                )}
              </td>
            </tr>
            {e.fachada !== null && (
              <tr>
                <td className={s.dato}>Cómo se ha sacado</td>
                <td>
                  {e.lecturas.length > 0
                    ? `Medida con el luopan en la vivienda (${e.lecturas.length} lectura${e.lecturas.length > 1 ? "s" : ""})`
                    : e.nortePlano !== null
                      ? "Con la flecha del norte del plano"
                      : "Escrita a mano"}
                </td>
              </tr>
            )}
            {carta && (
              <tr>
                <td className={s.dato}>Se sienta en</td>
                <td>
                  {carta.asiento.codigo} {carta.asiento.pinyin} {carta.asiento.hanzi} · {NOMBRE_DIR[carta.asiento.dir]}
                </td>
              </tr>
            )}
            <tr>
              <td className={s.dato}>Obra o última gran reforma</td>
              <td>{e.anioObra || "Sin dato."}{periodo ? ` · periodo ${periodo}` : ""}{e.periodoManual ? " (fijado a mano)" : ""}</td>
            </tr>
            {e.anioEntrada && (
              <tr>
                <td className={s.dato}>Entraron a vivir</td>
                <td>{e.anioEntrada}</td>
              </tr>
            )}
            {casaKua && casaGrupo && (
              <tr>
                <td className={s.dato}>La casa, en las ocho mansiones</td>
                <td>
                  Casa {TRIGRAMA[dirDe(e.fachada! + 180)].nombre} ({TRIGRAMA[dirDe(e.fachada! + 180)].hanzi}), del grupo {casaGrupo === "este" ? "Este" : "Oeste"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {e.lecturas.length > 0 && (
          <>
            <h3 className={s.h3}>La medida con el luopan</h3>
            <p className={s.p}>
              {e.lecturas.map((l) => `${grados(l.grados)} (${l.donde})`).join(" · ")}.{" "}
              {media !== null && (
                <>
                  Media: <span className={s.cifra}>{grados(media)}</span>
                  {disp > 0 ? `, con ${grados(disp)} de diferencia como mucho entre lecturas` : ""}.
                </>
              )}
            </p>
          </>
        )}
        {enRaya && enRaya.tipo !== "ninguna" && (
          <p className={`${s.p} ${s.recuadro}`}>
            {enRaya.tipo === "vacia"
              ? `La fachada cae a ${grados(enRaya.distancia)} de la raya entre dos montañas (línea vacía). Conviene repetir la medida antes de dar la carta por buena.`
              : `La fachada cae a ${grados(enRaya.distancia)} de la raya entre dos montañas. Algunas escuelas usan aquí otra carta, la de reemplazo; esta es la carta normal.`}
          </p>
        )}

        {carta ? (
          <>
            <h3 className={s.h3}>La carta de la vivienda</h3>
            <p className={s.p}>
              <strong>{FORMACION[carta.formacion].nombre}</strong> ({FORMACION[carta.formacion].chino}). {FORMACION[carta.formacion].dice}
            </p>
            {carta.especiales.map((k) => (
              <p key={k} className={s.p}>
                {ESPECIAL[k]}
              </p>
            ))}
            {preso && (
              <p className={s.p}>
                {preso === "agua"
                  ? "La estrella 9 del agua ha quedado en el centro de la vivienda: es una «estrella encerrada». Conviene abrir el centro, con luz y movimiento, y activar la zona de la fachada."
                  : "La estrella 9 de la montaña ha quedado en el centro de la vivienda: es una «estrella encerrada». Conviene mantener el centro despejado y con vida."}
              </p>
            )}
            {periodo !== null && periodo !== 9 && (
              <p className={s.p}>
                La vivienda es del periodo {periodo}, y desde febrero de 2024 estamos en el periodo 9. La estrella que más pesa ahora es el 9, y le siguen el 1 y el 2.
              </p>
            )}
            <h3 className={s.h3}>Cómo se lee</h3>
            <p className={s.p}>
              En cada zona, el número de arriba a la izquierda es la estrella de la <strong>montaña</strong> (las personas: salud y relaciones), el de arriba a la derecha es la del <strong>agua</strong> (el dinero y las oportunidades) y el pequeño de abajo es la del periodo. El círculo es la estrella del año {anioActual}.
            </p>
          </>
        ) : (
          <p className={`${s.p} ${s.recuadro}`}>Para calcular la carta faltan la orientación de la fachada o el año de obra.</p>
        )}
        <Pie n={++pagina} />
      </section>

      {/* ------------------------------------------------- EL PLANO Y LA CARTA */}
      {carta && e.fachada !== null && (
        <section className={s.hoja}>
          <Cabecera e={e} parte="El plano y la carta" />
          <h2 className={s.h2}>{plano ? "El plano, en nueve zonas" : "La carta de estrellas"}</h2>
          {plano ? (
            <Plano imagen={plano} rejilla={e.rejilla} fachada={e.fachada} lado={e.lado} carta={carta} anual={anios[0].carta} estancias={e.estancias} norte={e.nortePlano} conLuopan papel />
          ) : (
            <div className={s.carta}>
              <Cuadricula carta={carta} fachada={e.fachada} lado={e.lado} anual={anios[0].carta} estancias={e.estancias} modo="papel" />
            </div>
          )}
          {plano && (
            <div className={s.carta} style={css("width:90mm;")}>
              <Cuadricula carta={carta} fachada={e.fachada} lado={e.lado} anual={anios[0].carta} modo="papel" />
            </div>
          )}
          <Pie n={++pagina} />
        </section>
      )}

      {/* --------------------------------------------------- ZONA POR ZONA */}
      {carta && e.fachada !== null && (
        <section className={s.hoja}>
          <Cabecera e={e} parte="Zona por zona" />
          <h2 className={s.h2}>Zona por zona</h2>
          <div className={s.zonas}>
            {ORDEN_ZONAS.map((k) => {
              const m = carta.montana[k];
              const w = carta.agua[k];
              const a = anios[0].carta[k];
              const propuestas = propuestaZona({
                casilla: k,
                montana: m,
                agua: w,
                anual: a,
                taiSui: k !== "C" && anios[0].taiSui.dir === k,
                suiPo: k !== "C" && anios[0].suiPo.dir === k,
                sanSha: k !== "C" && anios[0].sanSha === k,
              });
              const nota = e.notas[k];
              const aqui = e.estancias[k] ?? [];
              const porEstancia = aqui.map((t) => propuestaEstancia(t, { montana: m, agua: w, anual: a })).filter((x): x is string => Boolean(x));
              return (
                <div key={k} className={s.zona}>
                  <div className={s.zonaTitulo}>
                    <span>{NOMBRE_DIR[k]}</span>
                    <span className={s.estrellas}>
                      {m} · {w} · {carta.base[k]}
                    </span>
                  </div>
                  <p className={s.p}>
                    <strong>Montaña {m}.</strong> {ESTRELLA[m].dice}
                  </p>
                  <p className={s.p}>
                    <strong>Agua {w}.</strong> {ESTRELLA[w].dice}
                  </p>
                  <p className={s.p}>
                    <strong>En {anioActual}, el {a}.</strong> {ESTRELLA[a].estado}.
                  </p>
                  {casaMansiones && k !== "C" && (
                    <p className={s.p}>
                      <strong>Para la casa:</strong> {MANSION[casaMansiones[k]].nombre} ({MANSION[casaMansiones[k]].chino}).
                    </p>
                  )}
                  {aqui.length > 0 && (
                    <p className={s.p}>
                      <strong>En el plano:</strong> {aqui.join(", ").toLowerCase()}.
                    </p>
                  )}
                  {propuestas.length + porEstancia.length > 0 && (
                    <ul className={s.lista}>
                      {[...porEstancia, ...propuestas].map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                  {nota && <p className={`${s.p} ${s.nota}`}>{nota}</p>}
                </div>
              );
            })}
          </div>
          <Pie n={++pagina} />
        </section>
      )}

      {/* --------------------------------------------------- LAS PERSONAS */}
      {e.ocupantes.length > 0 && (
        <section className={s.hoja}>
          <Cabecera e={e} parte="Las personas" />
          <h2 className={s.h2}>Quién vive en la casa</h2>
          {e.ocupantes.map((o) => {
            const k = kuaDe(o);
            if (!k) return null;
            const t = BA_ZHAI[k.kua];
            const encaja = casaGrupo ? casaGrupo === k.grupo : null;
            return (
              <div key={o.id} className={s.recuadro} style={css("display:flex;flex-direction:column;gap:6px;break-inside:avoid;")}>
                <div className={s.zonaTitulo}>
                  <span>{o.nombre || "Sin nombre"}</span>
                  <span className={s.estrellas}>Kua {k.kua} · grupo {k.grupo === "este" ? "Este" : "Oeste"}</span>
                </div>
                {k.dudoso && (
                  <p className={s.p}>
                    Nació el día en que cambia el año solar: el número depende de la hora de nacimiento. Aquí se ha tomado el año {k.anioSolar}.
                  </p>
                )}
                {encaja !== null && (
                  <p className={s.p}>
                    {encaja
                      ? "Su grupo coincide con el de la casa: la vivienda le acompaña."
                      : "Su grupo no coincide con el de la casa. No es grave: se compensa orientando la cama y la mesa hacia sus direcciones buenas."}
                  </p>
                )}
                <table className={s.tabla}>
                  <thead>
                    <tr>
                      <th>Dirección</th>
                      <th>Estrella</th>
                      <th>Qué favorece</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MANSIONES.map((m) => (
                      <tr key={m}>
                        <td>{NOMBRE_DIR[t[m]]}</td>
                        <td style={css(`color:${MANSION_BUENA[m] ? "#2e7d4f" : "#b23a31"};`)}>
                          {MANSION[m].nombre} ({MANSION[m].chino})
                        </td>
                        <td>{MANSION[m].dice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={s.p}>
                  <strong>Cabecero de la cama</strong> hacia el {NOMBRE_DIR[t.tianyi]} o el {NOMBRE_DIR[t.fuwei]}. <strong>Mesa de trabajo</strong> mirando al {NOMBRE_DIR[t.shengqi]}.
                </p>
              </div>
            );
          })}
          <Pie n={++pagina} />
        </section>
      )}

      {/* --------------------------------------------------------- EL AÑO */}
      <section className={s.hoja}>
        <Cabecera e={e} parte="El año" />
        <h2 className={s.h2}>Este año y el siguiente</h2>
        <p className={s.p}>
          Cada año las estrellas cambian de sitio. El año del Feng Shui no empieza el 1 de enero, sino en torno al 4 de febrero.
        </p>
        <div className={s.anuales}>
          {anios.map((a) => (
            <div key={a.anio} className={s.recuadro} style={css("display:flex;flex-direction:column;gap:8px;break-inside:avoid;")}>
              <div className={s.zonaTitulo}>
                <span>
                  {a.anio} · {a.nombre}
                </span>
              </div>
              <div className={s.mini} aria-label={`Estrellas del año ${a.anio}`}>
                {(["SE", "S", "SO", "E", "C", "O", "NE", "N", "NO"] as Casilla[]).map((k) => (
                  <span key={k}>
                    <small>{k}</small>
                    {a.carta[k]}
                  </span>
                ))}
              </div>
              <ul className={s.lista}>
                <li>
                  El <strong>5</strong> está en el {NOMBRE_DIR[a.cincoAmarillo]}: sin obras ni ruido en esa zona; metal quieto.
                </li>
                <li>
                  El <strong>2</strong> está en el {NOMBRE_DIR[a.dosNegro]}: metal y nada de rojo.
                </li>
                <li>
                  <strong>Tai Sui</strong> en {a.taiSui.codigo} ({a.taiSui.pinyin}): no hacer obras ahí ni sentarse mirándolo.
                </li>
                <li>
                  <strong>Sui Po</strong> en {a.suiPo.codigo} ({a.suiPo.pinyin}): tampoco se remueve.
                </li>
                <li>
                  <strong>Tres Asesinos</strong> en el {NOMBRE_DIR[a.sanSha]}: se le puede dar la espalda, no la cara.
                </li>
              </ul>
            </div>
          ))}
        </div>
        <p className={s.p} style={css("font-size:11px;color:#6f6560;")}>
          La tabla pequeña va con el Sur arriba, como en los libros chinos; la carta de la vivienda va orientada como el plano.
        </p>
        <Pie n={++pagina} />
      </section>

      {/* -------------------------------------------------- PARA TERMINAR */}
      <section className={s.hoja}>
        <Cabecera e={e} parte="Para terminar" />
        <h2 className={s.h2}>Para terminar</h2>
        {e.notaGeneral ? <p className={`${s.p} ${s.nota}`} style={css("white-space:pre-wrap;")}>{e.notaGeneral}</p> : null}
        <h3 className={s.h3}>Cómo se ha hecho este estudio</h3>
        <p className={s.p}>
          Este estudio sigue la escuela de la brújula: las ocho mansiones (Ba Zhai), con el número Kua de cada persona, y las estrellas voladoras (Xuan Kong Fei Xing), con la orientación de la fachada medida con el luopan sobre el norte magnético y el periodo en que se construyó o se reformó la vivienda.
        </p>
        <p className={s.p}>
          Es una lectura de la tradición del Feng Shui. No sustituye a un informe técnico de la vivienda ni al consejo de un profesional de la salud.
        </p>
        <span className={s.sobretitulo} style={css("margin-top:24px;")}>Iris Soares · Escuela de Sabiduría 33</span>
        <Pie n={++pagina} />
      </section>
    </div>
  );
}

