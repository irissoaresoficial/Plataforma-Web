// Construye el contenido del Estudio (documento largo, 14–28 páginas según el
// contenido de cada persona). A diferencia del prototipo de Claude Design —que
// recortaba los textos para encajarlos en 14 páginas fijas—, aquí no se trunca
// nada: el motor de paginación de impresión del navegador reparte el
// contenido íntegro en tantas páginas como haga falta.
//
// NI UNA FRASE ESTÁ ESCRITA AQUÍ. Los rótulos, las entradillas de cada
// capítulo y las frases que enlazan un dato con el siguiente viven en
// `lib/documento`, junto a las de la hoja de una cara: es donde Iris las puede
// corregir sin tocar el programa, y es lo que permite que el documento salga
// en portugués o en inglés entero y no a medias. Lo que queda en este archivo
// es el orden en que van las cosas y de dónde sale cada dato.
import type { Resultado, ResultadoEmpresa } from "./engine";
import { calcula, calculaEmpresa, conApuntes, ficha } from "./engine";
import { refItems, type RefItem } from "./chips";
import { CAMINO_EVOLUTIVO, KDATA, apuntesYaCargados, type Apuntes } from "./kdata";
import { diccionario, enumera, rellena, segunGenero } from "./documento";
import type { CopiaEstudio, Diccionario, Idioma } from "./documento/tipos";
import { COL } from "./tree";
import { cierraFrase, frase, punto, sinClavesEscuela, sinPunto, titulo } from "./format";

export type Bloque =
  | { tipo: "h"; texto: string }
  | { tipo: "lead"; editId: string; textoDef: string }
  | { tipo: "p"; editId: string; textoDef: string }
  | { tipo: "dato"; editId: string; label: string; valor: string | number; textoDef: string }
  | { tipo: "polos"; editIdNeg: string; editIdPos: string; negDef: string; posDef: string }
  | { tipo: "refs"; items: RefItem[] }
  | { tipo: "arbol" }
  | { tipo: "estructura" }
  | { tipo: "alma" }
  | { tipo: "cuentas" }
  | { tipo: "ciclos" }
  | { tipo: "cita"; texto: string }
  /** La tabla de cifras del cierre: el estudio entero en una mirada. */
  | { tipo: "cifras"; filas: Array<{ label: string; valor: string | number; pie: string }> };

export type Capitulo = { id: string; kicker: string; titulo: string; seccion: string; bloques: Bloque[] };

/** Quita las claves de escuela. La regla vive en `format` porque también la
 *  necesita `chips`, que es de donde salían las que se colaban. */
export const sinClaves = sinClavesEscuela;

export function paraCliente(t: string): string {
  return cierraFrase(sinClaves(t));
}

function bH(texto: string): Bloque {
  // Un rótulo no es una frase: se le quitan las claves de escuela, pero no se
  // le cierra con puntos suspensivos como a los párrafos.
  return { tipo: "h", texto: sinClaves(texto) };
}
function bP(editId: string, textoDef: string): Bloque {
  return { tipo: "p", editId, textoDef: paraCliente(textoDef) };
}
function bLead(editId: string, textoDef: string): Bloque {
  return { tipo: "lead", editId, textoDef: paraCliente(textoDef) };
}
function bDato(editId: string, label: string, valor: string | number, textoDef: string): Bloque {
  return { tipo: "dato", editId, label, valor, textoDef: paraCliente(textoDef) };
}
function bPolos(editId: string, negDef: string, posDef: string): Bloque {
  return { tipo: "polos", editIdNeg: editId + ".neg", editIdPos: editId + ".pos", negDef: paraCliente(negDef), posDef: paraCliente(posDef) };
}
function bRefsFicha(F: ReturnType<typeof ficha>, T: CopiaEstudio): Bloque | null {
  const items = refItems(F, T);
  return items.length ? { tipo: "refs", items } : null;
}
function bCita(texto: string): Bloque {
  return { tipo: "cita", texto: sinClaves(texto) };
}

/**
 * La lectura de un número, para el documento. Si el número está en los
 * apuntes se pone tal cual; si no está —pasa con casi todos los de tres y
 * cuatro cifras— el manual lo lee por sus partes, y eso es lo que se escribe,
 * diciendo de dónde sale cada una. Sin esto, el kármico y los de afinidad
 * salían como una cifra suelta y una frase de qué es, sin decir qué dicen.
 */
function bLectura(D: Diccionario, idBase: string, n: number, aclara?: string): Bloque[] {
  const T = D.estudio;
  const F = ficha(n);
  if (!F) return [];
  if (F.texto) {
    const rotulo = aclara ? T.numeroEnApuntesAclara : T.numeroEnApuntes;
    return [bH(rellena(rotulo, { n, titulo: titulo(F.titulo), aclara: aclara ?? "" })), bP(`${idBase}.${n}`, F.texto)];
  }
  if (F.partes.length) {
    const partes = F.partes.map((x) => x.n).join(` ${D.hoja.y} `);
    const rotulo = aclara ? T.numeroSinApuntesAclara : T.numeroSinApuntes;
    return [
      bH(rellena(rotulo, { n, aclara: aclara ?? "", partes })),
      ...F.partes.flatMap((x): Bloque[] => [
        bH(rellena(T.numeroEnApuntes, { n: x.n, titulo: titulo(x.titulo) })),
        bP(`${idBase}.${x.n}`, x.texto),
      ]),
    ];
  }
  return [];
}

/**
 * EL ESTUDIO, EN EL IDIOMA QUE SE PIDA.
 *
 * Se recibe el idioma en vez de leerlo de un estado global porque esta función
 * también la llaman las pruebas, y una función que depende de dónde está
 * puesto un interruptor no se puede probar.
 *
 * Si el idioma pedido no está descargado todavía, salen los apuntes en español.
 * La pantalla se encarga de pedirlos antes de llamar aquí — ver `EstudioScreen`
 * — y de volver a armar el estudio cuando llegan.
 */
export function construyeCapitulos(r: Resultado, lang = "es"): Capitulo[] {
  const AP: Apuntes = apuntesYaCargados(lang) ?? { kdata: KDATA, camino: CAMINO_EVOLUTIVO, tensiones: {} as never };
  /*
   * EL RESULTADO SE VUELVE A CALCULAR CON LOS APUNTES DEL IDIOMA.
   *
   * Y no es un capricho ni un desperdicio. El motor no sólo calcula números:
   * mete DENTRO del resultado los textos de cada carta, cada tarea y cada
   * enfermedad. El resultado que llega aquí se calculó en español —es el que
   * Iris tiene delante en su panel, y ahí tiene que seguir estando en español—
   * así que si sólo tradujéramos la plantilla, el estudio portugués saldría con
   * los 22 arcanos y las tareas en castellano.
   *
   * Recalcular es barato: son sumas sobre una fecha y un nombre, milisegundos.
   * Y los NÚMEROS salen idénticos —el idioma no cambia una suma—, así que lo
   * único que cambia son los textos. Eso es exactamente lo que se quiere.
   *
   * ARMAR LOS CAPÍTULOS TAMBIÉN VA DENTRO de `conApuntes`, y no sólo el
   * cálculo. El cuerpo pide fichas de números por su cuenta —lo que tensa y lo
   * que libera de cada cifra, las lecturas del kármico y de los de afinidad—, y
   * `ficha` lee del diccionario que esté puesto en ese momento. Recalculando
   * fuera, esos párrafos salían en español dentro de un documento portugués.
   */
  if (lang === "es") return capitulosDe(r, AP, "es");
  return conApuntes(AP.kdata, () => capitulosDe(calcula(r.entrada), AP, lang));
}

/**
 * El mismo resultado, con los textos de los apuntes en el idioma del documento.
 *
 * Los DIBUJOS del estudio —el árbol con sus tres cartas, la lista de ejes y
 * planos en tensión— no reciben capítulos: pintan directamente lo que trae el
 * resultado. El que llega a la pantalla se calculó en español, que es como
 * tiene que seguir viéndose en el panel de Iris, así que para el documento
 * hace falta esta otra copia. Si los apuntes del idioma aún no han llegado, se
 * devuelve el que hay: el dibujo sale, sólo que todavía en español.
 */
export function resultadoEnIdioma(r: Resultado, lang = "es"): Resultado {
  if (lang === "es") return r;
  const AP = apuntesYaCargados(lang);
  return AP ? conApuntes(AP.kdata, () => calcula(r.entrada)) : r;
}

/** El cuerpo de siempre, con los apuntes ya elegidos. */
function capitulosDe(r: Resultado, AP: Apuntes, lang: string): Capitulo[] {
  const D = diccionario(lang as Idioma);
  const T = D.estudio;
  const cap: Capitulo[] = [];
  /**
   * El estudio habla de tú a la persona, y en castellano —y en portugués— eso
   * tiene género: «bienvenida», «fuiste nombrada». Se elige en la consulta;
   * aquí sólo se pide al diccionario la forma que toque. El inglés escribe una
   * sola y la recibe entera, sin fingir tres iguales.
   */
  const g = r.entrada.genero || "f";
  const push = (o: Partial<Capitulo> & Pick<Capitulo, "seccion" | "titulo" | "bloques">) =>
    cap.push({ id: "c" + cap.length, kicker: "", ...o });

  push({
    seccion: T.secBienvenida,
    kicker: T.bienvenidaKicker,
    titulo: segunGenero(T.bienvenidaTitulo, g),
    bloques: [
      bLead("p2.lead", rellena(T.bienvenidaLead, { nombrado: segunGenero(T.bienvenidaNombrado, g) })),
      bP("p2.a", T.bienvenidaHabla),
      bH(T.bienvenidaViaje),
      bP("p2.b", T.bienvenidaMapa),
      bP("p2.c", T.bienvenidaArbol),
      bCita(T.bienvenidaCita),
    ],
  });

  push({
    seccion: T.secArbol,
    kicker: T.arbolKicker,
    titulo: T.arbolTitulo,
    bloques: [
      bP("p3.intro", T.arbolIntro),
      { tipo: "arbol" },
      bDato(
        "p3.edad",
        T.arbolEdadLabel,
        r.caminos.edadCambio,
        r.turbulencias
          ? rellena(T.arbolEdadTurbulencias, {
              edad: r.caminos.edadCambio,
              anios: r.turbulencias.anios,
              tipos: enumera(r.turbulencias.lista.map((t) => D.turbulencias[t.tipo] || t.tipo.toLocaleLowerCase("es")), D.hoja.y),
              destino: r.turbulencias.hasta,
            })
          : rellena(T.arbolEdadSinTurbulencias, { edad: r.caminos.edadCambio })
      ),
    ],
  });

  const camDef = [
    {
      k: "origen" as const,
      c: r.caminos.origen,
      titulo: T.origenTitulo,
      intro: rellena(T.origenIntro, { edad: r.caminos.edadCambio }),
    },
    {
      k: "transformacion" as const,
      c: r.caminos.transformacion,
      titulo: T.transformacionTitulo,
      intro: T.transformacionIntro,
    },
    {
      k: "destino" as const,
      c: r.caminos.destino,
      titulo: T.destinoTitulo,
      intro: r.caminos.destino.arcano === r.caminos.transformacion.arcano ? T.destinoIntroMismaCarta : T.destinoIntro,
    },
  ];
  camDef.forEach((d) => {
    const carta = d.c.carta;
    const cuerpo = (carta?.texto || "").replace(/^[“"][^”"]*[”"]\.?\s*/, "");
    const evolutivo = AP.camino[String(d.c.arcano)];
    const bloques: Bloque[] = [
      bLead("p." + d.k + ".intro", d.intro),
      bH(d.c.arcano + " · " + (carta?.nombre || "") + (carta?.lema ? " — “" + carta.lema + "”" : "")),
      bP("p." + d.k + ".cuerpo", cuerpo),
    ];
    if (carta?.pareja)
      bloques.push({
        tipo: "refs",
        items: [{ label: T.caminoPareja, color: "#B08A2E", texto: carta.pareja, style: "border-left:2px solid #C9A84C;padding-left:12px;" }],
      });
    if (evolutivo) {
      bloques.push(bH(rellena(T.caminoEvolutivo, { nombre: evolutivo.nombre, sendero: evolutivo.sendero })));
      bloques.push(bP("p." + d.k + ".evolutivo", evolutivo.texto));
    }
    push({ seccion: T.secCaminos, kicker: T.caminosKicker, titulo: d.titulo, bloques });
  });

  const cor = r.corazon;
  push({
    seccion: T.secNumeros,
    kicker: T.corazonKicker,
    titulo: rellena(T.corazonTitulo, { n: cor.valor }),
    bloques: [
      bLead("p7.lead", T.corazonLead),
      // De dónde sale la cifra, para que se pueda seguir la cuenta a mano.
      bP("p7.cuenta", rellena(T.corazonCuenta, { nombre: r.valorNombre, edad: r.caminos.edadCambio, total: cor.valor })),
      bPolos("p7.polos", cor.lectura.negativo, cor.lectura.positivo),
      bH(
        cor.ficha?.enDiccionario
          ? rellena(T.corazonNumero, { n: cor.valor, titulo: cor.ficha.titulo })
          : rellena(T.corazonPartes, { partes: cor.ficha ? cor.ficha.partes.map((p) => p.n).join(` ${D.hoja.y} `) : "" })
      ),
      bP("p7.cuerpo", cor.ficha?.enDiccionario ? cor.ficha.texto : cor.ficha ? cor.ficha.partes.map((p) => p.n + ". " + p.titulo + " " + p.texto).join("\n\n") : ""),
      bRefsFicha(cor.ficha, T),
    ].filter(Boolean) as Bloque[],
  });

  push({
    seccion: T.secNumeros,
    kicker: T.valoresKicker,
    titulo: T.valoresTitulo,
    bloques: [
      bDato("p8.esencia", T.esenciaLabel, r.esencia.valor, r.esencia.ficha?.enDiccionario ? r.esencia.ficha.titulo + " " + r.esencia.ficha.texto : T.esenciaSinFicha),
      bRefsFicha(r.esencia.ficha, T),
      bDato(
        "p8.ego",
        T.egoLabel,
        r.ego.valor,
        r.ego.ficha?.enDiccionario
          ? r.ego.ficha.titulo + " " + r.ego.ficha.texto
          : rellena(T.egoSinFicha, { partes: r.ego.ficha ? r.ego.ficha.partes.map((p) => p.n + ". " + p.titulo).join(" · ") : "" })
      ),
      bRefsFicha(r.ego.ficha, T),
      bDato(
        "p8.dias",
        T.fuerzaLabel,
        r.diasFuerza.dias.join(" · "),
        rellena(T.fuerzaTexto, {
          esencia: r.esencia.valor,
          ego: r.ego.valor,
          valor: r.valorNombre,
          base: r.diasFuerza.base,
          primero: r.diasFuerza.dias[0],
        })
      ),
    ].filter(Boolean) as Bloque[],
  });

  push({
    seccion: T.secAprendizajes,
    kicker: T.aprendizajesKicker,
    titulo: rellena(T.estructuraTitulo, { n: r.estructura.tipo }),
    bloques: [bP("p9.tipo", r.tipoEstructura?.texto || ""), bPolos("p9.polos", r.tipoEstructura?.negativo || "", r.tipoEstructura?.positivo || ""), { tipo: "estructura" }],
  });

  const aps = r.aprendizajes;
  if (!aps.length) {
    push({ seccion: T.secAprendizajes, kicker: T.aprendizajesKicker, titulo: T.aprendizajesTituloVacio, bloques: [bP("p10.vacio", T.aprendizajesVacio)] });
  } else {
    aps.forEach((ap, ai) => {
      const bloques: Bloque[] = [
        bH(
          rellena(T.aprendizajeCabecera, {
            portal: ap.portal,
            veces: ap.veces > 1 ? rellena(T.aprendizajeVeces, { n: ap.veces }) : "",
            nombre: ap.tarea?.nombre || "",
            numero: ap.numero,
          })
        ),
        bP("p.ap." + ap.portal, ap.tarea?.texto || ""),
        {
          tipo: "refs",
          items: [
            { label: T.refHiloRojo, color: "#8E3A83", texto: ap.tarea?.hiloRojo || "", style: "border-left:2px solid #A8449B;padding-left:12px;" },
            { label: T.refNeurosis, color: "#8E3A2F", texto: ap.tarea?.neurosis || "", style: "border-left:2px solid #C0574C;padding-left:12px;" },
            { label: T.refSanador, color: "#40794F", texto: ap.tarea?.sanador || "", style: "border-left:2px solid #4C8A5A;padding-left:12px;" },
          ]
            .filter((it) => it.texto)
            .concat(refItems(ap.ficha, T)),
        },
      ];
      push({
        seccion: T.secAprendizajes,
        kicker: T.aprendizajesKicker,
        titulo: rellena(T.aprendizajesTitulo, { i: ai + 1, n: aps.length }),
        bloques,
      });
    });
  }

  const enf = aps.filter((a) => a.enfermedades && (a.enfermedades.psico || a.enfermedades.nota));
  if (enf.length) {
    push({
      seccion: T.secSomatizaciones,
      kicker: T.somatizacionesKicker,
      titulo: T.somatizacionesTitulo,
      bloques: [
        bLead("p12.lead", T.somatizacionesLead),
        {
          tipo: "refs",
          items: enf.map((a) => ({
            label: rellena(T.somatizacionesPunto, { n: a.portal, nombre: a.tarea?.nombre || "" }),
            color: "#B0564C",
            texto: a.enfermedades?.nota
              ? a.enfermedades.nota
              : rellena(T.somatizacionesFicha, {
                  psico: a.enfermedades?.psico ?? "",
                  organos: a.enfermedades?.organos ?? "",
                  fisicas: a.enfermedades?.fisicas ?? "",
                }),
            style: "border-left:2px solid #C0574C;padding-left:12px;",
          })),
        },
      ],
    });
  }

  push({
    seccion: T.secAlma,
    kicker: T.almaKicker,
    titulo: T.almaTitulo,
    bloques: [bLead("p13.lead", T.almaLead), bDato("p13.numero", T.almaLabel, r.imagenAlma.numero, T.almaTexto), { tipo: "alma" }],
  });

  const bls = r.bloqueos;
  bls.forEach((b, bi) => {
    push({
      seccion: T.secAlma,
      kicker: T.almaKicker,
      titulo: rellena(T.bloqueoTitulo, { casilla: b.casilla, i: bi + 1, n: bls.length }),
      bloques: [
        bH(
          rellena(T.bloqueoCabecera, {
            nombre: b.plano?.nombre || "",
            veces: b.veces > 1 ? rellena(T.bloqueoVeces, { n: b.veces }) : "",
            numero: b.numero,
          })
        ),
        bP("p.bl." + b.casilla, b.plano?.texto || ""),
        { tipo: "refs", items: refItems(b.ficha, T) },
      ].filter((bloque) => !(bloque.tipo === "refs" && bloque.items.length === 0)) as Bloque[],
    });
  });

  push({
    seccion: T.secCierre,
    kicker: T.karmaKicker,
    titulo: T.karmaTitulo,
    bloques: [
      bLead("p14.lead", T.karmaLead),
      { tipo: "cuentas" },
      bDato("p14.karmico", T.karmicoLabel, r.cuentas.karmico, T.karmicoTexto),
      ...bLectura(D, "p14.k", r.cuentas.karmico),
      bRefsFicha(r.cuentasFichas.karmico, T),
      bDato("p14.lema", T.lemaLabel, r.cuentas.lemaDeVida, T.lemaTexto),
      ...bLectura(D, "p14.l", r.cuentas.lemaDeVida),
      bRefsFicha(r.cuentasFichas.lema, T),
    ].filter(Boolean) as Bloque[],
  });

  // Los números de afinidad no aparecían en el documento por ninguna parte.
  push({
    seccion: T.secCierre,
    kicker: T.karmaKicker,
    titulo: rellena(T.afinidadTitulo, { a: r.afinidad.diaMes, b: r.afinidad.mesAnio }),
    bloques: [
      bLead("p14b.lead", T.afinidadLead),
      ...bLectura(D, "p14b.a", r.afinidad.diaMes, rellena(T.afinidadDiaMes, { dia: r.fecha.dia, mes: r.fecha.mes })),
      ...bLectura(D, "p14b.b", r.afinidad.mesAnio, rellena(T.afinidadMesAnio, { mes: r.fecha.mes, anio: String(r.fecha.anio).slice(2) })),
    ].filter(Boolean) as Bloque[],
  });

  push({
    seccion: T.secCierre,
    kicker: T.ciclosKicker,
    titulo: T.ciclosTitulo,
    bloques: [
      bP(
        "p15.intro",
        rellena(T.ciclosIntro, {
          proposito: r.ciclos.proposito,
          anioUniversal: r.ciclos.anioUniversal,
          anioPersonal: r.ciclos.anioPersonal,
        })
      ),
      { tipo: "ciclos" },
    ],
  });

  // Las nueve etapas de nueve años y el año personal: contenido de los
  // manuales de ciclos que hasta ahora no aparecía en el estudio.
  const CI = AP.kdata.ciclos;
  const etapas = r.ciclos.etapas;
  push({
    seccion: T.secCierre,
    kicker: T.ciclosKicker,
    titulo: T.etapasTitulo,
    bloques: [
      bLead("p16.lead", rellena(T.etapasLead, { edad: r.ciclos.edad, etapa: r.ciclos.etapaActual })),
      ...etapas.flatMap((e): Bloque[] => {
        const texto = (CI.etapas9 || {})[e.n] || "";
        if (!texto) return [];
        return [
          bH(
            rellena(T.etapaCabecera, {
              n: e.n,
              desde: e.desde,
              hasta: e.hasta,
              actual: e.n === r.ciclos.etapaActual ? T.etapaActual : "",
            })
          ),
          bP(`p16.etapa.${e.n}`, texto),
        ];
      }),
    ],
  });

  const textoAnio = (CI.anioPersonal || {})[r.ciclos.anioPersonal] || "";
  push({
    seccion: T.secCierre,
    kicker: T.ciclosKicker,
    titulo: rellena(T.anioTitulo, { n: r.ciclos.anioPersonal }),
    bloques: [
      bDato("p17.anio", rellena(T.anioLabel, { n: r.ciclos.anioUniversal }), r.ciclos.anioPersonal, textoAnio || T.anioSinTexto),
    ],
  });

  // El documento acababa de golpe con el año personal. Cierra recogiendo las
  // cifras que se han ido explicando — la imagen del alma entre ellas, que era
  // la única que salía en el panel y no llegaba nunca al papel.
  push({
    seccion: T.secCierre,
    kicker: T.resumenKicker,
    titulo: T.resumenTitulo,
    bloques: [
      bLead("p18.lead", T.resumenLead),
      {
        tipo: "cifras",
        filas: [
          { label: T.cifCorazon, valor: r.corazon.valor, pie: T.cifCorazonPie },
          { label: T.cifEsencia, valor: r.esencia.valor, pie: T.cifEsenciaPie },
          { label: T.cifEgo, valor: r.ego.valor, pie: T.cifEgoPie },
          { label: T.cifEdadCambio, valor: r.caminos.edadCambio, pie: T.cifEdadCambioPie },
          { label: T.cifEstructura, valor: r.estructura.tipo, pie: T.cifEstructuraPie },
          { label: T.cifAlma, valor: r.imagenAlma.numero, pie: T.cifAlmaPie },
          { label: T.cifKarmico, valor: r.cuentas.karmico, pie: T.cifKarmicoPie },
          { label: T.cifLema, valor: r.cuentas.lemaDeVida, pie: T.cifLemaPie },
          { label: T.cifProposito, valor: r.ciclos.proposito, pie: T.cifPropositoPie },
          { label: T.cifAnio, valor: r.ciclos.anioPersonal, pie: rellena(T.cifAnioPie, { n: r.ciclos.anioUniversal }) },
        ],
      },
      bCita(T.resumenCita),
    ],
  });

  // Y un último capítulo con lo que hay que retener. El estudio son treinta
  // páginas: quien lo recibe se queda con la sensación general y pierde lo
  // concreto. Aquí van, en seis puntos, las cosas que de verdad ha de tener
  // presentes — todas salen de lo que ya se ha explicado, no hay nada nuevo.
  push({
    seccion: T.secCierre,
    kicker: T.cierreKicker,
    titulo: T.cierreTitulo,
    bloques: [
      bLead("p19.lead", T.cierreLead),
      bDato(
        "p19.destino",
        T.cHaciaDondeLabel,
        r.caminos.destino.arcano,
        rellena(T.cHaciaDondeTexto, {
          carta: sinPunto(titulo(r.caminos.destino.carta?.nombre || "")),
          lema: punto(frase(r.caminos.destino.carta?.lema)),
        })
      ),
      bDato(
        "p19.aprendizajes",
        T.cQueTrabajarLabel,
        r.aprendizajes.length,
        r.aprendizajes.length === 0
          ? T.cQueTrabajarNada
          : rellena(r.aprendizajes.length === 1 ? T.cQueTrabajarUno : T.cQueTrabajarVarios, {
              n: r.aprendizajes.length,
              lista: r.aprendizajes
                .map((a) => sinPunto(titulo(a.tarea?.nombre || rellena(T.cPortalSinNombre, { n: a.portal }))))
                .join(", "),
            })
      ),
      bDato(
        "p19.bloqueos",
        T.cQueDesatascarLabel,
        r.bloqueos.length,
        r.bloqueos.length === 0
          ? T.cQueDesatascarNada
          : rellena(T.cQueDesatascarTexto, {
              lista: r.bloqueos.map((b) => sinPunto(titulo(b.plano?.nombre || rellena(T.cCasillaSinNombre, { n: b.casilla })))).join(", "),
            })
      ),
      bDato(
        "p19.karmico",
        T.cQueCerrarLabel,
        r.cuentas.karmico,
        rellena(T.cQueCerrarTexto, { karmico: r.cuentas.karmico, lema: r.cuentas.lemaDeVida })
      ),
      bDato(
        "p19.anio",
        T.cDondeEstasLabel,
        r.ciclos.anioPersonal,
        rellena(T.cDondeEstasTexto, {
          anioUniversal: r.ciclos.anioUniversal,
          anioPersonal: r.ciclos.anioPersonal,
          proposito: r.ciclos.proposito,
        })
      ),
      bDato(
        "p19.dias",
        T.cCuandoMoverLabel,
        r.diasFuerza.dias[0] ?? "—",
        rellena(T.cCuandoMoverTexto, { dias: r.diasFuerza.dias.join(D.hoja.separadorDias) })
      ),
      bCita(T.cierreCita),
    ],
  });

  return cap;
}

/**
 * El estudio de una empresa: mucho más corto, porque se lee sólo del nombre.
 *
 * Reutiliza los mismos bloques que el estudio de una persona, así que se
 * imprime, se pagina y se reescribe igual. Lo que no está es lo que no se
 * puede calcular sin una fecha, que es casi todo el estudio largo.
 *
 * Sale en los mismos tres idiomas y por el mismo camino que el de una persona:
 * es el mismo documento, y dejar el de empresa en español habría sido la misma
 * hoja a medias que se vino a arreglar.
 */
export function construyeCapitulosEmpresa(re: ResultadoEmpresa, lang = "es"): Capitulo[] {
  const AP: Apuntes = apuntesYaCargados(lang) ?? { kdata: KDATA, camino: CAMINO_EVOLUTIVO, tensiones: {} as never };
  if (lang === "es") return empresaDe(re, "es");
  return conApuntes(AP.kdata, () => empresaDe(calculaEmpresa(re.entrada), lang));
}

function empresaDe(re: ResultadoEmpresa, lang: string): Capitulo[] {
  const D = diccionario(lang as Idioma);
  const T = D.estudio;
  const cap: Capitulo[] = [];
  const push = (o: Partial<Capitulo> & Pick<Capitulo, "seccion" | "titulo" | "bloques">) =>
    cap.push({ id: "e" + cap.length, kicker: "", ...o });
  const nombre = titulo(re.nombre.texto);

  push({
    seccion: T.secBienvenida,
    kicker: T.empNombreKicker,
    titulo: T.empNombreTitulo,
    bloques: [
      bLead("e1.lead", rellena(T.empLead, { nombre, n: re.valorNombre })),
      bP("e1.a", T.empSoloNombre),
      {
        tipo: "cifras",
        filas: [
          { label: T.empCifValor, valor: re.valorNombre, pie: T.empCifValorPie },
          { label: T.empCifEsencia, valor: re.esencia.valor, pie: T.empCifEsenciaPie },
          { label: T.empCifEgo, valor: re.ego.valor, pie: T.empCifEgoPie },
          ...(re.nombre.cifras ? [{ label: T.empCifCifras, valor: re.nombre.cifras, pie: T.empCifCifrasPie }] : []),
          { label: T.empCifOrigen, valor: re.origen.arcano, pie: titulo(re.origen.carta?.nombre || "") },
        ],
      },
      bH(T.empComoSeCuenta),
      bP(
        "e1.b",
        rellena(T.empCuenta, {
          palabras: re.nombre.palabras.map((w) => rellena(T.empCuentaPalabra, { palabra: w.palabra, n: w.total })).join(T.empCuentaSeparador),
          total: re.nombre.palabras.length > 1 ? rellena(T.empCuentaTotal, { n: re.valorNombre }) : "",
          esencia: re.esencia.valor,
          ego: re.ego.valor,
          cifras: re.nombre.cifras
            ? rellena(T.empCuentaCifras, {
                cifras: re.nombre.cifras,
                esencia: re.esencia.valor,
                ego: re.ego.valor,
                valor: re.valorNombre,
              })
            : "",
        })
      ),
    ],
  });

  const numero = (
    id: string,
    seccion: string,
    kicker: string,
    tit: string,
    o: { valor: number; ficha: ReturnType<typeof ficha>; lectura: { positivo: string; negativo: string } },
    entrada: string
  ) => {
    const refs = bRefsFicha(o.ficha, T);
    push({
      seccion,
      kicker,
      titulo: tit,
      bloques: [
        bDato(id + ".dato", kicker, o.valor, entrada),
        ...bLectura(D, id, o.valor),
        bPolos(id + ".polos", o.lectura.negativo, o.lectura.positivo),
        ...(refs ? [refs] : []),
      ],
    });
  };

  numero("e2", T.empSecNumeros, T.empValorKicker, rellena(T.empValorTitulo, { n: re.valorNombre }), re.valor, T.empValorTexto);
  numero("e3", T.empSecEsencia, T.empEsenciaKicker, rellena(T.empEsenciaTitulo, { n: re.esencia.valor }), re.esencia, T.empEsenciaTexto);
  numero("e4", T.empSecEgo, T.empEgoKicker, rellena(T.empEgoTitulo, { n: re.ego.valor }), re.ego, T.empEgoTexto);

  const carta = re.origen.carta;
  push({
    seccion: T.empSecOrigen,
    kicker: rellena(T.empArcanoKicker, { n: re.origen.arcano }),
    titulo: titulo(carta?.nombre || rellena(T.empArcanoKicker, { n: re.origen.arcano })),
    bloques: [
      bDato(
        "e5.dato",
        T.empOrigenLabel,
        re.origen.arcano,
        rellena(T.empOrigenCuenta, {
          valor: re.valorNombre,
          sumaCifras: re.origen.calculo.sumaCifras,
          resta: re.origen.calculo.resta,
          division: re.origen.calculo.division,
          mas1: re.origen.calculo.mas1,
          arcano: re.origen.arcano,
        })
      ),
      ...(carta?.lema ? [bLead("e5.lema", carta.lema)] : []),
      ...(carta?.texto ? [bP("e5.texto", carta.texto)] : []),
      bP("e5.nota", T.empOrigenNota),
    ],
  });

  push({
    seccion: T.secCierre,
    kicker: T.empCierreKicker,
    titulo: T.empCierreTitulo,
    bloques: [
      bLead("e6.lead", T.empCierreLead),
      bDato("e6.valor", T.empCVibraLabel, re.valorNombre, rellena(T.empCVibraTexto, { n: re.valorNombre })),
      bDato(
        "e6.dentrofuera",
        T.empCDentroFueraLabel,
        `${re.esencia.valor} / ${re.ego.valor}`,
        rellena(T.empCDentroFueraTexto, { esencia: re.esencia.valor, ego: re.ego.valor })
      ),
      bDato(
        "e6.origen",
        T.empCHaciaDondeLabel,
        re.origen.arcano,
        rellena(T.empCHaciaDondeTexto, { carta: sinPunto(titulo(carta?.nombre || "")), lema: punto(frase(carta?.lema)) })
      ),
      bDato(
        "e6.dias",
        T.empCCuandoMoverLabel,
        re.diasFuerza.dias[0] ?? "—",
        rellena(T.empCCuandoMoverTexto, { dias: re.diasFuerza.dias.join(D.hoja.separadorDias) })
      ),
      bCita(T.empCierreCita),
    ],
  });

  return cap;
}

export { COL as ESTUDIO_COL };
