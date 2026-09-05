// Construye el contenido del Estudio (documento largo, 14–28 páginas según el
// contenido de cada persona). A diferencia del prototipo de Claude Design —que
// recortaba los textos para encajarlos en 14 páginas fijas—, aquí no se trunca
// nada: el motor de paginación de impresión del navegador reparte el
// contenido íntegro en tantas páginas como haga falta.
import type { Resultado, ResultadoEmpresa } from "./engine";
import { ficha } from "./engine";
import { refItems, type RefItem } from "./chips";
import { CAMINO_EVOLUTIVO, KDATA } from "./kdata";
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
function bRefsFicha(F: ReturnType<typeof ficha>): Bloque | null {
  const items = refItems(F);
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
function bLectura(idBase: string, n: number, aclara?: string): Bloque[] {
  const F = ficha(n);
  if (!F) return [];
  if (F.texto) {
    return [bH(`${n} · ${titulo(F.titulo)}${aclara ? " — " + aclara : ""}`), bP(`${idBase}.${n}`, F.texto)];
  }
  if (F.partes.length) {
    const dice = F.partes.map((x) => x.n).join(" y ");
    return [
      bH(`${n}${aclara ? " · " + aclara : ""} — no figura en los apuntes: se lee por sus partes, ${dice}`),
      ...F.partes.flatMap((x): Bloque[] => [bH(`${x.n} · ${titulo(x.titulo)}`), bP(`${idBase}.${x.n}`, x.texto)]),
    ];
  }
  return [];
}

export function construyeCapitulos(r: Resultado): Capitulo[] {
  const cap: Capitulo[] = [];
  /**
   * El estudio habla de tú a la persona, y en castellano eso tiene género:
   * «bienvenida», «fuiste nombrada». Se elige en la consulta y aquí sólo se
   * decide la terminación. En neutro se busca una vuelta que no la necesite.
   */
  const g = r.entrada.genero || "f";
  const ao = (fem: string, masc: string, neutro?: string) => (g === "m" ? masc : g === "n" ? (neutro ?? fem) : fem);
  const push = (o: Partial<Capitulo> & Pick<Capitulo, "seccion" | "titulo" | "bloques">) =>
    cap.push({ id: "c" + cap.length, kicker: "", ...o });

  push({
    seccion: "Bienvenida",
    kicker: "Tu mapa de luz",
    titulo: ao("Bienvenida a tu estudio", "Bienvenido a tu estudio", "Te damos la bienvenida a tu estudio"),
    bloques: [
      bLead(
        "p2.lead",
        "Acepta este estudio no como un diagnóstico rígido, sino como una guía viva. La Kábala nos enseña que el día y la hora en que naciste, junto con el nombre con el que " +
          ao("fuiste nombrada", "fuiste nombrado", "te nombraron") +
          ", constituyen una contraseña única de acceso a tu potencial supremo."

      ),
      bP(
        "p2.a",
        "Todo lo que leerás en las siguientes páginas habla de ti: de lo que ya has conquistado, de lo que aún está por despertar y de los aprendizajes que han venido a impulsarte. Léelo con apertura, amor y la certeza de que posees la fuerza para transformar cada aspecto de tu vida."

      ),
      bH("Un viaje de retorno a tu esencia"),
      bP(
        "p2.b",
        "Este estudio es una hoja de ruta para comprender la arquitectura de tu ser. A través de la Kábala desciframos los códigos de tu nacimiento para ofrecerte claridad, sentido y dirección: tus dones, las virtudes y herramientas con las que viniste a habitar el mundo; tus desafíos de evolución, esos bloqueos o patrones repetitivos transformados en tu mayor fuente de sabiduría; y tu propósito, la dirección hacia donde orientar tu energía para vivir en plenitud."

      ),
      bP(
        "p2.c",
        "El árbol de la vida, con sus diez sefirot y sus veintidós senderos, es también el mapa evolutivo que recorren los veintidós arcanos mayores del Tarot: cada camino que tu alma ha elegido tiene, además de su lectura kabalística, una historia arquetípica —la del Loco que empieza a andar y, al final del recorrido, vuelve a cruzar el mismo abismo, pero ya transformado—. En este estudio encontrarás ambas lecturas entretejidas.",
      ),
      bCita("El estudio de Kábala no adivina tu destino; desvela la luz que ya habita en ti para que aprendas a guiar tu propio camino con conciencia, amor y libertad."),
    ],
  });

  push({
    seccion: "Árbol de la Vida",
    kicker: "Tus tres energías",
    titulo: "Tu Árbol de la Vida",
    bloques: [
      bP(
        "p3.intro",
        "Tu alma elige tres caminos en el árbol de la vida: tres energías que has venido a aprender, a manejar y a comprender. El camino de origen te acompaña desde que naces hasta tu edad de cambio y es lo que sabes de otras vidas. El camino de transformación nace y muere contigo: es tu manera de vivir. El camino de destino es hacia dónde quiere llevarte tu alma."
      ),
      { tipo: "arbol" },
      bDato(
        "p3.edad",
        "Edad de cambio",
        r.caminos.edadCambio,
        r.turbulencias
          ? `A los ${r.caminos.edadCambio} años comienzan diez años de turbulencias en ${r.turbulencias.lista.map((t) => t.tipo.toLowerCase()).join(" y ")}. No tomarás el camino de destino hasta los ${r.caminos.edadCambio + 10} años.`
          : `A los ${r.caminos.edadCambio} años se produce el cambio que te lleva a tomar tu camino de destino.`
      ),
    ],
  });

  const camDef = [
    {
      k: "origen" as const,
      c: r.caminos.origen,
      kicker: "Sesión 1 · Tus caminos",
      titulo: "Tu camino de origen",
      intro: `Te habla de esa cualidad que traes de serie: el camino de origen es lo que vienes a recordar y a compartir con otros en esta existencia. En tu caso, desde tu nacimiento hasta los ${r.caminos.edadCambio} años, que es tu edad de cambio.`,
    },
    {
      k: "transformacion" as const,
      c: r.caminos.transformacion,
      kicker: "Sesión 1 · Tus caminos",
      titulo: "Tu camino de transformación",
      intro: "Nace y muere contigo: es tu manera de vivir. Debes vivir con esta predisposición y actuar como te indique este camino ante cualquier situación o conflicto que se presente en tu vida. Será muy bueno para lograr el éxito.",
    },
    {
      k: "destino" as const,
      c: r.caminos.destino,
      kicker: "Sesión 1 · Tus caminos",
      titulo: "Tu camino de destino",
      intro:
        r.caminos.destino.arcano === r.caminos.transformacion.arcano
          ? "Una energía nueva que tu alma quiere aprender. En tu caso la continúas desde tu camino de transformación."
          : "Una energía nueva que tu alma quiere aprender. Se alcanza cuando llega el momento del cambio.",
    },
  ];
  camDef.forEach((d) => {
    const carta = d.c.carta;
    const cuerpo = (carta?.texto || "").replace(/^[“"][^”"]*[”"]\.?\s*/, "");
    const evolutivo = CAMINO_EVOLUTIVO[String(d.c.arcano)];
    const bloques: Bloque[] = [
      bLead("p." + d.k + ".intro", d.intro),
      bH(d.c.arcano + " · " + (carta?.nombre || "") + (carta?.lema ? " — “" + carta.lema + "”" : "")),
      bP("p." + d.k + ".cuerpo", cuerpo),
    ];
    if (carta?.pareja) bloques.push({ tipo: "refs", items: [{ label: "Este camino en pareja", color: "#B08A2E", texto: carta.pareja, style: "border-left:2px solid #C9A84C;padding-left:12px;" }] });
    if (evolutivo) {
      bloques.push(bH("El camino evolutivo de " + evolutivo.nombre + " · " + evolutivo.sendero));
      bloques.push(bP("p." + d.k + ".evolutivo", evolutivo.texto));
    }
    push({ seccion: "Sesión 1 · Caminos", kicker: d.kicker, titulo: d.titulo, bloques });
  });

  const cor = r.corazon;
  push({
    seccion: "Sesión 1 · Números",
    kicker: "El pin de tu alma",
    titulo: "Tu número de corazón: " + cor.valor,
    bloques: [
      bLead("p7.lead", "Es el número pin de tu alma, cómo vibras. Sabiendo que los números son vibración, entendemos que nos dan la información de la energía que generamos y el tipo de aprendizaje con los demás."),
      // De dónde sale la cifra, para que se pueda seguir la cuenta a mano.
      bP("p7.cuenta", `Sale del valor de tu nombre (${r.valorNombre}) más tu edad de cambio (${r.caminos.edadCambio}): ${r.valorNombre} + ${r.caminos.edadCambio} = ${cor.valor}.`),
      bPolos("p7.polos", cor.lectura.negativo, cor.lectura.positivo),
      bH(cor.ficha?.enDiccionario ? "Número " + cor.valor + " · " + cor.ficha.titulo : "En Kábala los números de tres cifras se dividen de dos en dos: " + (cor.ficha ? cor.ficha.partes.map((p) => p.n).join(" y ") : "")),
      bP("p7.cuerpo", cor.ficha?.enDiccionario ? cor.ficha.texto : cor.ficha ? cor.ficha.partes.map((p) => p.n + ". " + p.titulo + " " + p.texto).join("\n\n") : ""),
      bRefsFicha(cor.ficha),
    ].filter(Boolean) as Bloque[],
  });

  push({
    seccion: "Sesión 1 · Números",
    kicker: "Tus valores y tu expresión",
    titulo: "Esencia, ego y días de fuerza",
    bloques: [
      bDato("p8.esencia", "Esencia", r.esencia.valor, r.esencia.ficha?.enDiccionario ? r.esencia.ficha.titulo + " " + r.esencia.ficha.texto : "Este número habla de tus valores internos, de los más profundos."),
      bRefsFicha(r.esencia.ficha),
      bDato(
        "p8.ego",
        "Ego",
        r.ego.valor,
        r.ego.ficha?.enDiccionario
          ? r.ego.ficha.titulo + " " + r.ego.ficha.texto
          : "Habla de la conexión que tienes con las personas. Se lee de dos en dos: " + (r.ego.ficha ? r.ego.ficha.partes.map((p) => p.n + ". " + p.titulo).join(" · ") : "")
      ),
      bRefsFicha(r.ego.ficha),
      bDato(
        "p8.dias",
        "Fuerza",
        r.diasFuerza.dias.join(" · "),
        "Salen del valor de tu nombre, que es la esencia más el ego: " +
          r.esencia.valor + " + " + r.ego.valor + " = " + r.valorNombre + ", y sumando sus cifras, " + r.diasFuerza.base +
          ". Van del más fuerte al menos fuerte: aprovecha el día " + r.diasFuerza.dias[0] +
          " del mes para firmas y temas relevantes en tu vida, y después el resto."
      ),
    ].filter(Boolean) as Bloque[],
  });

  push({
    seccion: "Sesión 2 · Aprendizajes",
    kicker: "Sesión 2 · Tus aprendizajes",
    titulo: "Tu estructura energética: número " + r.estructura.tipo,
    bloques: [bP("p9.tipo", r.tipoEstructura?.texto || ""), bPolos("p9.polos", r.tipoEstructura?.negativo || "", r.tipoEstructura?.positivo || ""), { tipo: "estructura" }],
  });

  const aps = r.aprendizajes;
  if (!aps.length) {
    push({ seccion: "Sesión 2 · Aprendizajes", kicker: "Sesión 2 · Tus aprendizajes", titulo: "Tus aprendizajes", bloques: [bP("p10.vacio", "Tu alma no ha marcado más aprendizajes en esta encarnación.")] });
  } else {
    aps.forEach((ap, ai) => {
      const bloques: Bloque[] = [
        bH("Aprendizaje " + ap.portal + (ap.veces > 1 ? " (×" + ap.veces + ")" : "") + " · " + (ap.tarea?.nombre || "") + " — viene del número " + ap.numero),
        bP("p.ap." + ap.portal, ap.tarea?.texto || ""),
        {
          tipo: "refs",
          items: [
            { label: "Hilo rojo", color: "#8E3A83", texto: ap.tarea?.hiloRojo || "", style: "border-left:2px solid #A8449B;padding-left:12px;" },
            { label: "Neurosis asociada", color: "#8E3A2F", texto: ap.tarea?.neurosis || "", style: "border-left:2px solid #C0574C;padding-left:12px;" },
            { label: "Principio sanador", color: "#40794F", texto: ap.tarea?.sanador || "", style: "border-left:2px solid #4C8A5A;padding-left:12px;" },
          ]
            .filter((it) => it.texto)
            .concat(refItems(ap.ficha)),
        },
      ];
      push({ seccion: "Sesión 2 · Aprendizajes", kicker: "Sesión 2 · Tus aprendizajes", titulo: "Tus aprendizajes · " + (ai + 1) + " de " + aps.length, bloques });
    });
  }

  const enf = aps.filter((a) => a.enfermedades && (a.enfermedades.psico || a.enfermedades.nota));
  if (enf.length) {
    push({
      seccion: "Sesión 2 · Somatizaciones",
      kicker: "Cuerpo y emoción",
      titulo: "Enfermedades y debilidades",
      bloques: [
        bLead("p12.lead", "Si no llevas a cabo estos aprendizajes, la energía no trabajada se somatiza. Conocer dónde se manifiesta te permite anticiparte y trabajarlo desde la conciencia."),
        {
          tipo: "refs",
          items: enf.map((a) => ({
            label: "Punto " + a.portal + " · " + (a.tarea?.nombre || ""),
            color: "#B0564C",
            texto: a.enfermedades?.nota ? a.enfermedades.nota : `Disfunciones psicológicas: ${a.enfermedades?.psico} Órganos: ${a.enfermedades?.organos} Disfunciones físicas: ${a.enfermedades?.fisicas}`,
            style: "border-left:2px solid #C0574C;padding-left:12px;",
          })),
        },
      ],
    });
  }

  push({
    seccion: "Sesión 3 · Imagen del alma",
    kicker: "Sesión 3 · La imagen del alma",
    titulo: "Tus bloqueos y tus ayudas",
    bloques: [
      bLead(
        "p13.lead",
        "Te da información de todos los procesos kármicos que te impiden crecer y avanzar. Es una mochila cargada de rutinas heredadas, patrones familiares y maneras de actuar de otras vidas que estás repitiendo en esta. Al conocerla vas a quitarle peso."
      ),
      bDato(
        "p13.numero",
        "Imagen del alma",
        r.imagenAlma.numero,
        "Es la cifra que abre la tabla: de ella salen los números móviles de cada casilla, y con ellos los planos que traes bloqueados y las ayudas con las que cuentas."
      ),
      { tipo: "alma" },
    ],
  });

  const bls = r.bloqueos;
  bls.forEach((b, bi) => {
    push({
      seccion: "Sesión 3 · Imagen del alma",
      kicker: "Sesión 3 · La imagen del alma",
      titulo: "Bloqueo " + b.casilla + " · " + (bi + 1) + " de " + bls.length,
      bloques: [
        bH((b.plano?.nombre || "") + (b.veces > 1 ? " · ×" + b.veces : "") + " — se forma con el número " + b.numero),
        bP("p.bl." + b.casilla, b.plano?.texto || ""),
        { tipo: "refs", items: refItems(b.ficha) },
      ].filter((bloque) => !(bloque.tipo === "refs" && bloque.items.length === 0)) as Bloque[],
    });
  });

  push({
    seccion: "Cierre",
    kicker: "Cuentas abiertas y karma",
    titulo: "Tu karma",
    bloques: [
      bLead(
        "p14.lead",
        "Las cuentas abiertas son la base del sentimiento de culpa, donde tu alma siente que más ha fallado: situaciones no resueltas que continúas cargando. Cada potencial arcaico te ayuda a cerrar la cuenta abierta de su fila."
      ),
      { tipo: "cuentas" },
      bDato(
        "p14.karmico",
        "Kármico",
        r.cuentas.karmico,
        "Dónde falló tu alma en sus relaciones en vidas pasadas y qué se repite en esta."
      ),
      ...bLectura("p14.k", r.cuentas.karmico),
      bRefsFicha(r.cuentasFichas.karmico),
      bDato(
        "p14.lema",
        "Lema de vida",
        r.cuentas.lemaDeVida,
        "El propósito de tu alma: la vibración que te permite llevar a cabo tu plan."
      ),
      ...bLectura("p14.l", r.cuentas.lemaDeVida),
      bRefsFicha(r.cuentasFichas.lema),
    ].filter(Boolean) as Bloque[],
  });

  // Los números de afinidad no aparecían en el documento por ninguna parte.
  push({
    seccion: "Cierre",
    kicker: "Cuentas abiertas y karma",
    titulo: `Tus números de afinidad: ${r.afinidad.diaMes} y ${r.afinidad.mesAnio}`,
    bloques: [
      bLead(
        "p14b.lead",
        "Son la visión más amplia de la carta: qué has venido a hacer en esta encarnación. Van en pareja, y cada uno mira una mitad — el primero sale del día y el mes de nacimiento; el segundo, del mes y el año."
      ),
      ...bLectura("p14b.a", r.afinidad.diaMes, `día ${r.fecha.dia} + mes ${r.fecha.mes}`),
      ...bLectura("p14b.b", r.afinidad.mesAnio, `mes ${r.fecha.mes} + año ${String(r.fecha.anio).slice(2)}`),
    ].filter(Boolean) as Bloque[],
  });

  push({
    seccion: "Cierre",
    kicker: "Ciclos vitales",
    titulo: "Tus ciclos de vida",
    bloques: [
      bP(
        "p15.intro",
        `Tu propósito de vida vibra en el ${r.ciclos.proposito}. Los tres grandes ciclos —formación, evolución y cosecha— y las cuatro realizaciones marcan el ritmo de tu existencia; los desafíos son las fricciones que te afinan en cada etapa. Tu año personal actual (${r.ciclos.anioUniversal}) es el ${r.ciclos.anioPersonal}.`
      ),
      { tipo: "ciclos" },
    ],
  });

  // Las nueve etapas de nueve años y el año personal: contenido de los
  // manuales de ciclos que hasta ahora no aparecía en el estudio.
  const CI = KDATA.ciclos;
  const etapas = r.ciclos.etapas;
  push({
    seccion: "Cierre",
    kicker: "Ciclos vitales",
    titulo: "Tus etapas de nueve años",
    bloques: [
      bLead(
        "p16.lead",
        `La vida se recorre además en etapas de nueve años, cada una con su propia lección. Ahora mismo, con ${r.ciclos.edad} años, estás en la etapa ${r.ciclos.etapaActual}.`
      ),
      ...etapas.flatMap((e): Bloque[] => {
        const texto = (CI.etapas9 || {})[e.n] || "";
        if (!texto) return [];
        return [
          bH(`Etapa ${e.n} · de los ${e.desde} a los ${e.hasta} años${e.n === r.ciclos.etapaActual ? " — tu etapa actual" : ""}`),
          bP(`p16.etapa.${e.n}`, texto),
        ];
      }),
    ],
  });

  const textoAnio = (CI.anioPersonal || {})[r.ciclos.anioPersonal] || "";
  push({
    seccion: "Cierre",
    kicker: "Ciclos vitales",
    titulo: `Tu año personal: ${r.ciclos.anioPersonal}`,
    bloques: [
      bDato("p17.anio", `Año ${r.ciclos.anioUniversal}`, r.ciclos.anioPersonal, textoAnio || "Se calcula sumando tu día y tu mes de nacimiento al año en curso."),
    ],
  });

  // El documento acababa de golpe con el año personal. Cierra recogiendo las
  // cifras que se han ido explicando — la imagen del alma entre ellas, que era
  // la única que salía en el panel y no llegaba nunca al papel.
  push({
    seccion: "Cierre",
    kicker: "Tu estudio en una mirada",
    titulo: "Tus números, todos juntos",
    bloques: [
      bLead(
        "p18.lead",
        "Estas son las cifras sobre las que se ha construido todo lo que acabas de leer. Guárdalas: cada una abre una puerta distinta y ninguna se lee sola."
      ),
      {
        tipo: "cifras",
        filas: [
          { label: "Corazón", valor: r.corazon.valor, pie: "El número pin del alma, cómo vibra" },
          { label: "Esencia", valor: r.esencia.valor, pie: "Lo que has venido a ser" },
          { label: "Ego", valor: r.ego.valor, pie: "Cómo te ven los demás" },
          { label: "Edad de cambio", valor: r.caminos.edadCambio, pie: "Cuándo entras en tu camino de destino" },
          { label: "Estructura", valor: r.estructura.tipo, pie: "La figura de tus diez portales" },
          { label: "Imagen del alma", valor: r.imagenAlma.numero, pie: "Los diez planos de consciencia" },
          { label: "Kármico", valor: r.cuentas.karmico, pie: "Lo que traes por cerrar" },
          { label: "Lema de vida", valor: r.cuentas.lemaDeVida, pie: "La vibración que te permite llevarlo a cabo" },
          { label: "Propósito", valor: r.ciclos.proposito, pie: "El hilo que recorre toda la vida" },
          { label: "Año personal", valor: r.ciclos.anioPersonal, pie: `Dónde estás en ${r.ciclos.anioUniversal}` },
        ],
      },
      bCita("Que este mapa te acompañe. La luz que buscas ya habita en ti."),
    ],
  });

  // Y un último capítulo con lo que hay que retener. El estudio son treinta
  // páginas: quien lo recibe se queda con la sensación general y pierde lo
  // concreto. Aquí van, en seis puntos, las cosas que de verdad ha de tener
  // presentes — todas salen de lo que ya se ha explicado, no hay nada nuevo.
  push({
    seccion: "Cierre",
    kicker: "Antes de cerrar",
    titulo: "Lo importante que has de tener en cuenta",
    bloques: [
      bLead(
        "p19.lead",
        "Si de todo el estudio sólo te quedas con una página, que sea esta. Son los seis puntos que conviene tener presentes en el día a día."
      ),
      bDato(
        "p19.destino",
        "Hacia dónde",
        r.caminos.destino.arcano,
        `Tu camino de destino es ${sinPunto(titulo(r.caminos.destino.carta?.nombre || ""))}. ${punto(frase(r.caminos.destino.carta?.lema))} Es la dirección de fondo: cuando una decisión te aleje de ahí, lo notarás como desgaste.`
      ),
      bDato(
        "p19.aprendizajes",
        "Qué trabajar",
        r.aprendizajes.length,
        r.aprendizajes.length === 0
          ? "No traes portales con aprendizaje: tu estructura viene resuelta y el trabajo es sostenerla."
          : `Tienes ${r.aprendizajes.length} ${r.aprendizajes.length === 1 ? "aprendizaje abierto" : "aprendizajes abiertos"}: ${r.aprendizajes
              .map((a) => sinPunto(titulo(a.tarea?.nombre || `portal ${a.portal}`)))
              .join(", ")}. No son defectos: son las tareas que has venido a hacer, y se trabajan de una en una.`
      ),
      bDato(
        "p19.bloqueos",
        "Qué desatascar",
        r.bloqueos.length,
        r.bloqueos.length === 0
          ? "No hay planos de consciencia bloqueados: la imagen del alma viene limpia."
          : `Los planos bloqueados son ${r.bloqueos.map((b) => sinPunto(titulo(b.plano?.nombre || `casilla ${b.casilla}`))).join(", ")}. Son los sitios donde la energía se te queda parada; reconocerlos ya es media parte.`
      ),
      bDato(
        "p19.karmico",
        "Qué cerrar",
        r.cuentas.karmico,
        `El número kármico ${r.cuentas.karmico} es la cuenta que traes de atrás. Tu lema de vida, el ${r.cuentas.lemaDeVida}, es la vibración con la que se salda.`
      ),
      bDato(
        "p19.anio",
        "Dónde estás",
        r.ciclos.anioPersonal,
        `En ${r.ciclos.anioUniversal} estás en el año personal ${r.ciclos.anioPersonal} de una rueda de nueve, dentro del ciclo de ${r.ciclos.proposito} que marca tu propósito. Lo que toca este año no es lo que tocará el que viene.`
      ),
      bDato(
        "p19.dias",
        "Cuándo mover",
        r.diasFuerza.dias[0] ?? "—",
        `Tus días de fuerza son el ${r.diasFuerza.dias.join(", el ")}, de más a menos. Guárdalos para firmar, empezar y decidir; lo que arranques esos días viene con el viento a favor.`
      ),
      bCita("Nada de esto es un destino cerrado. Es el mapa; el camino lo andas tú."),
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
 */
export function construyeCapitulosEmpresa(re: ResultadoEmpresa): Capitulo[] {
  const cap: Capitulo[] = [];
  const push = (o: Partial<Capitulo> & Pick<Capitulo, "seccion" | "titulo" | "bloques">) =>
    cap.push({ id: "e" + cap.length, kicker: "", ...o });
  const nombre = titulo(re.nombre.texto);

  push({
    seccion: "Bienvenida",
    kicker: "El nombre de la empresa",
    titulo: "Qué dice este nombre",
    bloques: [
      bLead(
        "e1.lead",
        `La Kábala lee el nombre como una contraseña: cada letra tiene un valor y la suma de todas dice cómo vibra lo que ese nombre designa. ${nombre} suma ${re.valorNombre}.`
      ),
      bP(
        "e1.a",
        "Este estudio se hace sólo con el nombre. De una persona se leen además la estructura energética, los planos de consciencia, las cuentas abiertas y los ciclos vitales, pero todo eso sale de la fecha de nacimiento; una empresa no la tiene, y lo que no se puede calcular no se inventa. Lo que sigue es, íntegro, lo que el nombre dice por sí solo.",
      ),
      {
        tipo: "cifras",
        filas: [
          { label: "Valor del nombre", valor: re.valorNombre, pie: "Cómo vibra la empresa entera" },
          { label: "Esencia", valor: re.esencia.valor, pie: "Lo que ha venido a ser, en las vocales" },
          { label: "Ego", valor: re.ego.valor, pie: "Cómo la ven, en las consonantes" },
          ...(re.nombre.cifras ? [{ label: "Cifras", valor: re.nombre.cifras, pie: "Los números que lleva el nombre" }] : []),
          { label: "Camino de origen", valor: re.origen.arcano, pie: titulo(re.origen.carta?.nombre || "") },
        ],
      },
      bH("Cómo se cuenta"),
      bP(
        "e1.b",
        `Se suma el valor de cada letra: ${re.nombre.palabras.map((w) => `${w.palabra} vale ${w.total}`).join("; ")}${
          re.nombre.palabras.length > 1 ? `, y en total ${re.valorNombre}` : ""
        }. Las vocales aparte dan la esencia, ${re.esencia.valor}; las consonantes, el ego, ${re.ego.valor}.${
          re.nombre.cifras
            ? ` Y si el nombre lleva números, cuentan por lo que valen: aquí suman ${re.nombre.cifras}. Un número no es vocal ni consonante, así que va aparte, y el valor del nombre es la suma de los tres: ${re.esencia.valor} + ${re.ego.valor} + ${re.nombre.cifras} = ${re.valorNombre}.`
            : ""
        }`
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
    const refs = bRefsFicha(o.ficha);
    push({
      seccion,
      kicker,
      titulo: tit,
      bloques: [
        bDato(id + ".dato", kicker, o.valor, entrada),
        ...bLectura(id, o.valor),
        bPolos(id + ".polos", o.lectura.negativo, o.lectura.positivo),
        ...(refs ? [refs] : []),
      ],
    });
  };

  numero(
    "e2",
    "Los números del nombre",
    "Valor del nombre",
    `El ${re.valorNombre}: cómo vibra`,
    re.valor,
    "Es el número de la empresa entera, la suma de todas sus letras. Marca el tono de fondo de lo que hace y de cómo se la percibe."
  );
  numero(
    "e3",
    "Los números del nombre · Esencia",
    "Esencia",
    `El ${re.esencia.valor}: lo que ha venido a ser`,
    re.esencia,
    "Sale sólo de las vocales. Es el impulso interno del proyecto: aquello a lo que tiende cuando nadie la mira."
  );
  numero(
    "e4",
    "Los números del nombre · Ego",
    "Ego",
    `El ${re.ego.valor}: cómo la ven`,
    re.ego,
    "Sale sólo de las consonantes. Es la cara que la empresa pone hacia fuera: lo que perciben clientes y proveedores antes de tratarla."
  );

  const carta = re.origen.carta;
  push({
    seccion: "El camino de origen",
    kicker: `Arcano ${re.origen.arcano}`,
    titulo: titulo(carta?.nombre || `Arcano ${re.origen.arcano}`),
    bloques: [
      bDato(
        "e5.dato",
        "Origen",
        re.origen.arcano,
        `Se saca del valor del nombre: ${re.valorNombre} menos la suma de sus cifras (${re.origen.calculo.sumaCifras}) da ${re.origen.calculo.resta}, que entre nueve son ${re.origen.calculo.division}, más uno, ${re.origen.calculo.mas1}. Reducido a los veintiún arcanos, el ${re.origen.arcano}.`
      ),
      ...(carta?.lema ? [bLead("e5.lema", carta.lema)] : []),
      ...(carta?.texto ? [bP("e5.texto", carta.texto)] : []),
      bP(
        "e5.nota",
        "En una persona este es el primero de tres caminos —origen, transformación y destino—, pero los otros dos se apoyan en la edad de cambio, que sale de la fecha de nacimiento. En una empresa sólo hay este, y por eso pesa: es todo el arco de la carta.",
      ),
    ],
  });

  push({
    seccion: "Cierre",
    kicker: "Antes de cerrar",
    titulo: "Lo importante que hay que tener en cuenta",
    bloques: [
      bLead(
        "e6.lead",
        "Si de todo el estudio sólo se retiene una página, que sea esta. Son los cuatro puntos que conviene tener presentes."
      ),
      bDato("e6.valor", "Cómo vibra", re.valorNombre, `El nombre suma ${re.valorNombre}. Es el tono de fondo: lo que la empresa transmite antes de decir nada.`),
      bDato(
        "e6.dentrofuera",
        "Dentro y fuera",
        `${re.esencia.valor} / ${re.ego.valor}`,
        `La esencia es ${re.esencia.valor} y el ego ${re.ego.valor}. Cuando los dos se parecen, la empresa se muestra como es; cuando se separan mucho, hay distancia entre lo que quiere ser y lo que aparenta, y esa distancia se paga en confianza.`
      ),
      bDato(
        "e6.origen",
        "Hacia dónde",
        re.origen.arcano,
        `El camino de origen es ${sinPunto(titulo(carta?.nombre || ""))}. ${punto(frase(carta?.lema))} Es la dirección de fondo del proyecto.`
      ),
      bDato(
        "e6.dias",
        "Cuándo mover",
        re.diasFuerza.dias[0] ?? "—",
        `Los días de fuerza son el ${re.diasFuerza.dias.join(", el ")}, de más a menos. Guárdalos para firmar contratos, abrir y presentar.`
      ),
      bCita("El nombre es la contraseña: lo que se nombra bien, se sostiene."),
    ],
  });

  return cap;
}

export { COL as ESTUDIO_COL };
